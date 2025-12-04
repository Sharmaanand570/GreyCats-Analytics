import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type RevenueDataPoint = {
  day: string;
  revenue: number;
};

type WooCommerceRevenueChartProps = {
  data?: RevenueDataPoint[];
  isLoading?: boolean;
};

// Default sample data matching the screenshot
const defaultData: RevenueDataPoint[] = [
  { day: "Mon", revenue: 0 },
  { day: "Tue", revenue: 5 },
  { day: "Wed", revenue: 2.5 },
  { day: "Thu", revenue: 7.5 },
  { day: "Fri", revenue: 12.5 },
  { day: "Sat", revenue: 15 },
  { day: "Sun", revenue: 17.5 },
];

export function WooCommerceRevenueChart({
  data = defaultData,
  isLoading = false,
}: WooCommerceRevenueChartProps) {
  const [timeRange, setTimeRange] = useState("7");

  if (isLoading) {
    return (
      <Card className=" border rounded-2xl">
        <CardHeader>
          <CardTitle>Revenue Growth Trend</CardTitle>
          <CardDescription>Financial trajectory over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className=" border rounded-2xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Revenue Growth Trend</CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1">
              Financial trajectory over time
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Last 7 Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#96588A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#96588A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickMargin={8}
                tickFormatter={(value) => `$${value}`}
                domain={[0, 20]}
                ticks={[0, 5, 10, 15, 20]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                labelStyle={{ color: "#374151", fontWeight: 600, marginBottom: "4px" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#96588A"
                strokeWidth={2}
                fill="url(#colorRevenue)"
                dot={false}
                activeDot={{ r: 4, fill: "#96588A" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

