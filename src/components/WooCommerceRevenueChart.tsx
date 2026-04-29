import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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


  if (isLoading) {
    return (
      <Card className="rounded-[28px] border-zinc-100 shadow-sm transition-all duration-300">
        <CardHeader className="py-6 px-8 border-b border-zinc-50">
          <CardTitle className="text-xl font-black text-zinc-900 tracking-tight uppercase">Revenue Trajectory</CardTitle>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Daily growth patterns</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="h-64 bg-zinc-50 animate-pulse rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[28px] border-zinc-100 shadow-sm transition-all duration-500 hover:border-zinc-200 bg-white">
      <CardHeader className="py-6 px-8 border-b border-zinc-50">
        <CardTitle className="text-xl font-black text-zinc-900 tracking-tight uppercase">Revenue Trajectory</CardTitle>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Daily growth patterns</p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181b" stopOpacity={0.05} />
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: 700 }}
                tickMargin={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: 700 }}
                tickMargin={12}
                tickFormatter={(value: number) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid #f4f4f5",
                  borderRadius: "16px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                  padding: "12px",
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                labelStyle={{ color: "#18181b", fontWeight: 800, fontSize: "10px", textTransform: "uppercase", marginBottom: "4px" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#18181b"
                strokeWidth={3}
                fill="url(#colorRevenue)"
                dot={false}
                activeDot={{ r: 6, fill: "#18181b", stroke: "#fff", strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

