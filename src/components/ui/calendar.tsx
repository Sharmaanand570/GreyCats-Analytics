import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2 sm:p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center px-8",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 sm:w-9 font-normal text-[0.75rem] sm:text-[0.8rem] flex-1 flex items-center justify-center",
        week: "flex w-full mt-2",
        day: "h-8 w-8 sm:h-9 sm:w-9 text-center text-xs sm:text-sm p-0 relative flex items-center justify-center",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 sm:h-9 sm:w-9 p-0 font-normal text-xs sm:text-sm transition-all rounded-full aria-selected:opacity-100"
        ),
        range_start: "bg-zinc-900 text-white rounded-l-full font-bold",
        range_end: "bg-zinc-900 text-white rounded-r-full font-bold",
        range_middle: "bg-blue-50 text-blue-700 rounded-none",
        selected: "bg-zinc-900 text-white hover:bg-zinc-900 hover:text-white focus:bg-zinc-900 focus:text-white",
        today: "bg-zinc-100 text-zinc-900",
        outside: "day-outside text-zinc-300 opacity-50",
        disabled: "text-zinc-300 opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      modifiersClassNames={{
        selected: "bg-zinc-900 text-white",
        range_start: "bg-zinc-900 text-white rounded-l-full",
        range_end: "bg-zinc-900 text-white rounded-r-full",
        range_middle: "bg-blue-50 text-blue-700",
      }}
      components={{
        Chevron: ({ orientation }) => orientation === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

