import * as React from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  onPresetChange?: (preset: string | undefined) => void;
  className?: string;
};

export function DateRangePicker({
  value,
  onChange,
  onPresetChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [tempRange, setTempRange] = React.useState<DateRange>(
    value || { from: undefined, to: undefined }
  );
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (value) {
      setTempRange(value);
    }
  }, [value]);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleApply = () => {
    if (onChange) {
      onChange(tempRange);
    }
    if (onPresetChange) {
      onPresetChange(undefined);
    }
    setOpen(false);
  };

  const handleClear = () => {
    const clearedRange = { from: undefined, to: undefined };
    setTempRange(clearedRange);
    if (onChange) {
      onChange(clearedRange);
    }
    if (onPresetChange) {
      onPresetChange(undefined);
    }
    setOpen(false);
  };

  const presets = [
    {
      label: "Today",
      getValue: () => ({
        from: new Date(),
        to: new Date(),
      }),
    },
    {
      label: "Yesterday",
      getValue: () => ({
        from: subDays(new Date(), 1),
        to: subDays(new Date(), 1),
      }),
    },
    {
      label: "Last 7 Days",
      getValue: () => ({
        from: subDays(new Date(), 6),
        to: new Date(),
      }),
    },
    {
      label: "Last 30 Days",
      getValue: () => ({
        from: subDays(new Date(), 29),
        to: new Date(),
      }),
    },
    {
      label: "Last 90 Days",
      getValue: () => ({
        from: subDays(new Date(), 89),
        to: new Date(),
      }),
    },
    {
      label: "This Month",
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      }),
    },
    {
      label: "Last Month",
      getValue: () => ({
        from: startOfMonth(subMonths(new Date(), 1)),
        to: endOfMonth(subMonths(new Date(), 1)),
      }),
    },
    {
      label: "This Year",
      getValue: () => ({
        from: startOfYear(new Date()),
        to: new Date(),
      }),
    },
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    const range = preset.getValue();
    setTempRange(range);
    if (onChange) {
      onChange(range);
    }
    if (onPresetChange) {
      onPresetChange(preset.label);
    }
    setOpen(false);
  };

  const displayRange = value || tempRange;

  const formatDateRange = () => {
    if (!displayRange.from && !displayRange.to) {
      return "Select date range";
    }
    if (displayRange.from && displayRange.to) {
      return `${format(displayRange.from, "MMM d, yyyy")} - ${format(displayRange.to, "MMM d, yyyy")}`;
    }
    if (displayRange.from) {
      return `From ${format(displayRange.from, "MMM d, yyyy")}`;
    }
    if (displayRange.to) {
      return `Until ${format(displayRange.to, "MMM d, yyyy")}`;
    }
    return "Select date range";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full sm:w-[280px] justify-start text-left font-normal",
            !displayRange.from && !displayRange.to && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 max-w-[calc(100vw-2rem)]"
        align="start"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Presets Sidebar */}
          <div className="p-3 border-b bg-white sm:border-b-0 sm:border-r border-gray-10 sm:w-40 flex flex-col gap-1 overflow-y-auto max-h-[300px] sm:max-h-none">
            <div className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wider">
              Presets
            </div>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                onClick={() => handlePresetSelect(preset)}
                className="justify-start text-xs h-8 font-normal"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Calendar Section */}
          <div className="p-3 sm:p-4 bg-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Custom Range</div>
                {/* Mobile clear button shown here to save space at bottom if needed, or keep at bottom */}
              </div>
              <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                <Calendar
                  mode="range"
                  defaultMonth={tempRange?.from}
                  selected={tempRange}
                  onSelect={(range) => setTempRange(range || { from: undefined, to: undefined })}
                  numberOfMonths={isMobile ? 1 : 2}
                  className="rounded-lg border shadow-sm"
                />
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-xs text-gray-400 hidden sm:block">
                  {tempRange.from ? format(tempRange.from, "MMM d, yyyy") : "Start"} - {tempRange.to ? format(tempRange.to, "MMM d, yyyy") : "End"}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                  <Button size="sm" onClick={handleApply} className="text-xs">
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

