
import * as React from "react"
import { ResponsiveContainer } from "recharts"
import { Label, Pie, PieChart, Sector, Tooltip, Cell } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

export const description = "An interactive pie chart"

const desktopData = [
  { month: "january", desktop: 186, fill: "var(--color-january)" },
  { month: "february", desktop: 305, fill: "var(--color-february)" },
  { month: "march", desktop: 237, fill: "var(--color-march)" },
  { month: "april", desktop: 173, fill: "var(--color-april)" },
  { month: "may", desktop: 209, fill: "var(--color-may)" },
]

type ChartConfig = Record<string, { label: string; color?: string }>
const chartConfig: ChartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
  },
  mobile: {
    label: "Mobile",
  },
  january: {
    label: "January",
    color: "var(--chart-1)",
  },
  february: {
    label: "February",
    color: "var(--chart-2)",
  },
  march: {
    label: "March",
    color: "var(--chart-3)",
  },
  april: {
    label: "April",
    color: "var(--chart-4)",
  },
  may: {
    label: "May",
    color: "var(--chart-5)",
  },
}

type ChartPieInteractiveProps = {
  onReady?: () => void;
}

export function ChartPieInteractive({ onReady }: ChartPieInteractiveProps = {}) {
  const [activeMonth, setActiveMonth] = React.useState(desktopData[0].month)
  const hasCalledReady = React.useRef(false)

  const activeIndex = React.useMemo(
    () => desktopData.findIndex((item) => item.month === activeMonth),
    [activeMonth]
  )
  const months = React.useMemo(() => desktopData.map((item) => item.month), [])

  // Handle chart ready callback - called once when animation completes
  const handleAnimationEnd = React.useCallback(() => {
    if (!hasCalledReady.current && onReady) {
      hasCalledReady.current = true
      // Small delay to ensure SVG is fully rendered
      setTimeout(() => {
        onReady()
      }, 50)
    }
  }, [onReady])

  return (
    <div className="flex flex-col h-full  border  rounded-2xl ">
      <div className="flex-row items-start space-y-0 pb-0 p-4 flex justify-between">
        <div className="grid gap-1">
          <div className="text-base md:text-sm font-semibold">Pie Chart - Interactive</div>
          <div className="text-sm md:text-xs text-muted-foreground">January - June 2024</div>
        </div>
        <select
          value={activeMonth}
          onChange={(e) => setActiveMonth(e.target.value)}
          aria-label="Select month"
          className="ml-auto h-7 w-[130px] rounded-lg pl-2.5 border"
        >
          {months.map((key) => {
            const config = chartConfig[key as keyof typeof chartConfig]
            if (!config) return null
            return (
              <option key={key} value={key}>
                {config.label}
              </option>
            )
          })}
        </select>
      </div>
      <div className="flex flex-1 justify-center pb-0 p-4">
        <div className="mx-auto aspect-square w-full max-w-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart width={300} height={300}>
            <Tooltip />
            <Pie
              data={desktopData}
              dataKey="desktop"
              nameKey="month"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              onAnimationEnd={handleAnimationEnd}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              {desktopData.map((entry) => (
                <Cell key={entry.month} fill={chartConfig[entry.month]?.color || "var(--chart-1)"} />
              ))}
              <Label
                content={({ viewBox }: { viewBox?: { cx?: number; cy?: number } }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {desktopData[activeIndex].desktop.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
            </Pie>
          </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
