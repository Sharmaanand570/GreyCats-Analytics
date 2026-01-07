import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export type ShopifyRevenuePoint = {
  label: string;
  revenue: number;
};

type ShopifyRevenueChartProps = {
  data?: ShopifyRevenuePoint[];
  isLoading?: boolean;
};

const defaultData: ShopifyRevenuePoint[] = [
  { label: "Day 1", revenue: 0 },
  { label: "Day 2", revenue: 0 },
  { label: "Day 3", revenue: 0 },
];

export function ShopifyRevenueChart({
  data = defaultData,
  isLoading = false,
}: ShopifyRevenueChartProps) {
  if (isLoading) {
    return (
      <Card className=" border rounded-2xl">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Recent revenue performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-64 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className=" border rounded-2xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              Revenue Trend
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1">
              Recent Shopify revenue performance
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-64">
          {data.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="shopifyRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#96BF48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#96BF48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickFormatter={(value: number) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#96BF48"
                  strokeWidth={2}
                  fill="url(#shopifyRevenue)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#96BF48" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
























