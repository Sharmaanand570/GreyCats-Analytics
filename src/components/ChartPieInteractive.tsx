"use client"

import * as React from "react"
import { ResponsiveContainer, Label, Pie, PieChart, Sector, Tooltip, Cell } from "recharts"
import type { WidgetSeriesPoint } from "@/features/reports/api/types"

export const description = "A simple pie chart"

// Palette for pie slices
const COLORS = [
  "var(--chart-1, #3b82f6)",
  "var(--chart-2, #10b981)",
  "var(--chart-3, #f59e0b)",
  "var(--chart-4, #ef4444)",
  "var(--chart-5, #8b5cf6)",
];

interface ChartPieInteractiveProps {
  data: WidgetSeriesPoint[];
  metricLabel?: string;
  onReady?: () => void;
}

export function ChartPieInteractive({
  data,
  metricLabel = "Value",
  onReady
}: ChartPieInteractiveProps) {
  const hasCalledReady = React.useRef(false)

  // Map data to Pie format
  const parsedData = React.useMemo(() => {
    return data.map((point, index) => ({
      name: point.x,
      value: point.y,
      fill: COLORS[index % COLORS.length]
    })).filter(d => d.value > 0); // Hide zero values
  }, [data]);

  const [activeIndex, setActiveIndex] = React.useState(0);

  // Handle chart ready callback
  const handleAnimationEnd = React.useCallback(() => {
    if (!hasCalledReady.current && onReady) {
      hasCalledReady.current = true
      setTimeout(() => {
        onReady()
      }, 50)
    }
  }, [onReady])

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  if (parsedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No data to display
      </div>
    );
  }

  // Calculate total for center label
  const totalValue = React.useMemo(() => {
    return parsedData.reduce((acc, curr) => acc + curr.value, 0);
  }, [parsedData]);

  // Use the active item for label
  const activeItem = parsedData[activeIndex] || parsedData[0];

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col justify-center items-center">
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip formatter={(value: number) => [new Intl.NumberFormat("en-US").format(value), metricLabel]} />
            <Pie
              data={parsedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              onAnimationEnd={handleAnimationEnd}
            >
              <Label
                content={({ viewBox }: { viewBox?: { cx?: number; cy?: number } }) => {
                  if (viewBox && typeof viewBox.cx === 'number' && typeof viewBox.cy === 'number') {
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
                          className="fill-foreground text-2xl font-bold"
                        >
                          {new Intl.NumberFormat("en-US", { notation: "compact" }).format(activeItem.value)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-xs"
                        >
                          {activeItem.name}
                        </tspan>
                      </text>
                    )
                  }
                  return null
                }}
              />
              {parsedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-gray-500 mt-2 text-center">
        Total: {new Intl.NumberFormat("en-US").format(totalValue)}
      </div>
    </div>
  )
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="hidden" />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
    </g>
  );
};
