import * as React from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { Calendar as CalendarIcon, CalendarDays } from "lucide-react";
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

  React.useEffect(() => {
    if (value) {
      setTempRange(value);
    }
  }, [value]);

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
      getValue: () => ({ from: new Date(), to: new Date() }),
    },
    {
      label: "Yesterday",
      getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }),
    },
    {
      label: "This Week",
      getValue: () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
        return { from: new Date(now.setDate(diff)), to: new Date() };
      },
    },
    {
      label: "Last Week",
      getValue: () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day - 6; 
        return { from: new Date(now.setDate(diff)), to: new Date(now.setDate(diff + 6)) };
      },
    },
    {
      label: "Last 7 Days",
      getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }),
    },
    {
      label: "Last 30 Days",
      getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }),
    },
    {
      label: "Last 90 Days",
      getValue: () => ({ from: subDays(new Date(), 89), to: new Date() }),
    },
    {
      label: "This Month",
      getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
    },
    {
      label: "Last Month",
      getValue: () => ({
        from: startOfMonth(subMonths(new Date(), 1)),
        to: endOfMonth(subMonths(new Date(), 1)),
      }),
    },
    {
      label: "Last 6 Months",
      getValue: () => ({ from: subMonths(new Date(), 6), to: new Date() }),
    },
    {
      label: "Last 12 Months",
      getValue: () => ({ from: subMonths(new Date(), 12), to: new Date() }),
    },
    {
      label: "This Year",
      getValue: () => ({ from: startOfYear(new Date()), to: new Date() }),
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
            "w-full sm:w-[240px] h-9 text-sm justify-start text-left font-normal",
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
        align="end"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Presets Sidebar */}
          <div className="p-3 border-b bg-zinc-50 sm:border-b-0 sm:border-r border-zinc-100 sm:w-44 flex flex-col gap-0.5 overflow-y-auto max-h-[300px] sm:max-h-none">
            <div className="text-[10px] font-bold text-zinc-400 mb-2 px-3 uppercase tracking-widest">
              Quick Selection
            </div>
            {presets.map((preset) => {
              const isActive = value?.from?.getTime() === preset.getValue().from?.getTime() && 
                               value?.to?.getTime() === preset.getValue().to?.getTime();
              
              return (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePresetSelect(preset)}
                  className={cn(
                    "justify-start text-xs h-9 px-3 font-medium rounded-lg transition-all",
                    isActive 
                      ? "bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white" 
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  )}
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>

          {/* Calendar Section */}
          <div className="p-3 sm:p-4 bg-white">
            <div className="flex flex-col h-full">
              <div className="p-3 sm:p-4 bg-white">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                  <div className="relative flex-1 group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Start Date"
                      value={tempRange.from ? format(tempRange.from, "MMM d, yyyy") : ""}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        if (!isNaN(date.getTime())) {
                          setTempRange((prev) => ({ ...prev, from: date }));
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:font-medium"
                    />
                  </div>
                  <div className="text-zinc-300 font-bold hidden sm:block">→</div>
                  <div className="relative flex-1 group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="End Date"
                      value={tempRange.to ? format(tempRange.to, "MMM d, yyyy") : ""}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        if (!isNaN(date.getTime())) {
                          setTempRange((prev) => ({ ...prev, to: date }));
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:font-medium"
                    />
                  </div>
                </div>
                
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={tempRange.from || new Date()}
                  selected={tempRange}
                  onSelect={(range) => setTempRange(range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                  className="rounded-lg border shadow-sm"
                />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                <div className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  {tempRange.from ? format(tempRange.from, "MMM d, yyyy") : "Select Start"}
                  <span className="text-zinc-300 mx-1">→</span>
                  {tempRange.to ? format(tempRange.to, "MMM d, yyyy") : "Select End"}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-xs font-bold text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    Clear
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleApply} 
                    className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white px-6 rounded-lg shadow-sm"
                  >
                    Apply Range
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

