"use client"

import { CartesianGrid, Line, LineChart, Area, AreaChart, Bar, BarChart, XAxis, Tooltip, ResponsiveContainer, YAxis } from "recharts"
import type { WidgetSeriesPoint } from "@/features/reports/api/types"
import { format } from "date-fns"

export const description = "A versatile chart component"

interface ChartLineProps {
  data: WidgetSeriesPoint[];
  metricLabel?: string;
  simple?: boolean;
  chartType?: "line" | "area" | "bar";
}

export function ChartLineMultiple({
  data,
  metricLabel = "Value",
  simple = false,
  chartType = "line"
}: ChartLineProps) {

  const formattedData = data.map(point => ({
    date: point.x,
    value: point.y
  }));

  if (formattedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No data
      </div>
    );
  }

  const commonProps = {
    data: formattedData,
    margin: simple ? { top: 2, right: 0, left: 0, bottom: 2 } : { left: 12, right: 12, top: 10, bottom: 20 }
  };

  const renderCommonElements = () => (
    <>
      {!simple && <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />}
      {!simple && (
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          minTickGap={32}
          tickFormatter={(value: string | number) => {
            try {
              const date = new Date(value);
              return format(date, "MMM d");
            } catch (e) {
              return String(value);
            }
          }}
          style={{ fontSize: '12px', fill: '#6b7280' }}
        />
      )}
      {!simple && (
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          width={40}
          tickFormatter={(value: number) =>
            new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(value)
          }
          style={{ fontSize: '12px', fill: '#6b7280' }}
        />
      )}
      <Tooltip
        contentStyle={simple ? { display: 'none' } : { borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
        formatter={(value: number) => [new Intl.NumberFormat("en-US").format(value), metricLabel]}
        labelFormatter={(label: string | number) => {
          try {
            return format(new Date(label), "MMM d, yyyy");
          } catch (e) {
            return String(label);
          }
        }}
        cursor={!simple}
      />
    </>
  );

  return (
    <div className={`w-full h-full ${simple ? '' : 'min-h-[300px]'}`}>
      <div className={`w-full ${simple ? 'h-full' : 'h-[250px] sm:h-[300px]'}`}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary, #2563eb)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary, #2563eb)" stopOpacity={0} />
                </linearGradient>
              </defs>
              {renderCommonElements()}
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary, #2563eb)"
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={simple ? 2 : 3}
              />
            </AreaChart>
          ) : chartType === 'bar' ? (
            <BarChart {...commonProps}>
              {renderCommonElements()}
              <Bar
                dataKey="value"
                fill="var(--color-primary, #2563eb)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <LineChart {...commonProps}>
              {renderCommonElements()}
              <Line
                dataKey="value"
                type="monotone"
                stroke="var(--color-primary, #2563eb)"
                strokeWidth={simple ? 2 : 3}
                dot={false}
                activeDot={simple ? false : { r: 6, strokeWidth: 0, fill: "var(--color-primary, #2563eb)" }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
