import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
};

export function DateRangePicker({
  value,
  onChange,
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
    setOpen(false);
  };

  const handleClear = () => {
    const clearedRange = { from: undefined, to: undefined };
    setTempRange(clearedRange);
    if (onChange) {
      onChange(clearedRange);
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
    <Popover  open={open} onOpenChange={setOpen}>
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
        className="w-auto p-0  max-w-[calc(100vw-2rem)]" 
        align="start"
      >
        <div className="p-3 sm:p-4">
          <div className="space-y-3">
            <div className="text-sm font-medium">Custom Range</div>
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
            <div className="flex justify-end gap-2 pt-2 border-t">
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
      </PopoverContent>
    </Popover>
  );
}

