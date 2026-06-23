import { useState } from "react";
  // @ts-expect-error unused variable
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  useGoogleAdsStore,
  DATE_PRESET_LABELS,
  getPresetRange,
  type DatePreset,
} from "../store/useGoogleAdsStore";
import type { DateRange } from "../types/googleAds.types";

const PRESETS: DatePreset[] = [
  "TODAY",
  "YESTERDAY",
  "LAST_7_DAYS",
  "LAST_14_DAYS",
  "LAST_30_DAYS",
  "THIS_MONTH",
  "LAST_MONTH",
];

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatLabel(preset: DatePreset, range: DateRange): string {
  if (preset === "CUSTOM") {
    return `${formatDate(range.startDate)} – ${formatDate(range.endDate)}`;
  }
  return DATE_PRESET_LABELS[preset];
}

// ── Sub-component: mini calendar navigator ──────────────────

interface CalendarPanelProps {
  value?: Date;
  onChange: (d: Date) => void;
  disabled?: (d: Date) => boolean;
}

function CalendarPanel({ value, onChange, disabled }: CalendarPanelProps) {
  return (
    <Calendar
      mode="single"
      selected={value}
      onSelect={(d) => d && onChange(d)}
      disabled={disabled}
      className="rounded-lg border-0 p-0"
    />
  );
}

// ── Main component ──────────────────────────────────────────

interface GoogleAdsDateRangePickerProps {
  /** Called whenever the date range changes (for parent to refetch) */
  onChange?: (range: DateRange) => void;
  className?: string;
}

export function GoogleAdsDateRangePicker({
  onChange,
  className,
}: GoogleAdsDateRangePickerProps) {
  const { datePreset, dateRange, setDatePreset, setCustomDateRange } =
    useGoogleAdsStore();

  const [open, setOpen] = useState(false);

  // Custom range local state while picking
  const [customStart, setCustomStart] = useState<Date | undefined>(
    dateRange.startDate ? new Date(dateRange.startDate + "T00:00:00") : undefined
  );
  const [customEnd, setCustomEnd] = useState<Date | undefined>(
    dateRange.endDate ? new Date(dateRange.endDate + "T00:00:00") : undefined
  );
  const [pickingEnd, setPickingEnd] = useState(false);
  const [activePreview, setActivePreview] = useState<DatePreset | null>(null);

  function toIso(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  function handlePresetClick(preset: DatePreset) {
    const range = getPresetRange(preset);
    setDatePreset(preset);
    onChange?.(range);
    setOpen(false);
  }

  function handleCustomStartChange(d: Date) {
    setCustomStart(d);
    setCustomEnd(undefined);
    setPickingEnd(true);
  }

  function handleCustomEndChange(d: Date) {
    if (customStart && d < customStart) {
      // Swap if end < start
      setCustomStart(d);
      setCustomEnd(customStart);
    } else {
      setCustomEnd(d);
    }
    setPickingEnd(false);
  }

  function applyCustomRange() {
    if (!customStart || !customEnd) return;
    const range: DateRange = {
      startDate: toIso(customStart),
      endDate: toIso(customEnd),
    };
    setCustomDateRange(range);
    onChange?.(range);
    setOpen(false);
  }

  const displayLabel = formatLabel(datePreset, dateRange);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 px-3 text-sm font-medium border-slate-200 bg-white hover:bg-slate-50 text-slate-700 gap-2",
            className
          )}
        >
          <CalendarDays className="w-4 h-4 text-slate-400" />
          {displayLabel}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-auto p-0 border-slate-200 shadow-xl rounded-xl overflow-hidden"
      >
        <div className="flex">
          {/* Left: presets */}
          <div className="w-44 bg-slate-50 border-r border-slate-200 p-2 flex flex-col gap-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">
              Quick Select
            </p>
            {PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setActivePreview(preset);
                  handlePresetClick(preset);
                }}
                className={cn(
                  "text-left text-sm px-3 py-2 rounded-lg transition-colors font-medium",
                  (activePreview ?? datePreset) === preset
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-200"
                )}
              >
                {DATE_PRESET_LABELS[preset]}
              </button>
            ))}
            <div className="border-t border-slate-200 mt-1 pt-1">
              <button
                onClick={() => setActivePreview("CUSTOM")}
                className={cn(
                  "text-left text-sm px-3 py-2 rounded-lg transition-colors font-medium w-full",
                  activePreview === "CUSTOM" || datePreset === "CUSTOM"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-200"
                )}
              >
                Custom range
              </button>
            </div>
          </div>

          {/* Right: calendar(s) */}
          <div className="p-4">
            {activePreview === "CUSTOM" || datePreset === "CUSTOM" ? (
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                      {pickingEnd ? "Select end date" : "Select start date"}
                    </p>
                    <CalendarPanel
                      value={customStart}
                      onChange={
                        pickingEnd ? handleCustomEndChange : handleCustomStartChange
                      }
                      disabled={
                        pickingEnd && customStart
                          ? (d) => d < customStart
                          : undefined
                      }
                    />
                  </div>
                </div>

                {/* Range display */}
                {customStart && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{formatDate(toIso(customStart))}</span>
                    <span className="text-slate-400">→</span>
                    <span className={cn("font-medium", !customEnd && "text-slate-400 italic")}>
                      {customEnd ? formatDate(toIso(customEnd)) : "pick end date"}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCustomStart(undefined);
                      setCustomEnd(undefined);
                      setPickingEnd(false);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    disabled={!customStart || !customEnd}
                    onClick={applyCustomRange}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            ) : (
              // Summary of selected preset
              <div className="flex items-center justify-center w-64 h-40">
                <div className="text-center">
                  <CalendarDays className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">{DATE_PRESET_LABELS[datePreset]}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(dateRange.startDate)} – {formatDate(dateRange.endDate)}
                  </p>
                  <p className="text-xs text-slate-400 mt-3">
                    Select a preset or choose Custom range
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
