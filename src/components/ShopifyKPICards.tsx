import { DollarSign, ShoppingBag, BadgePercent, PieChart } from "lucide-react";
import { Card, CardContent } from "./ui/card";

type StatusBreakdown = Record<string, number>;

type ShopifyKPICardsProps = {
  totalRevenue?: number;
  totalOrders?: number;
  avgOrderValue?: number;
  statusBreakdown?: StatusBreakdown;
};

const formatCurrency = (value?: number) =>
  typeof value === "number"
    ? `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "$0.00";

const formatNumber = (value?: number) =>
  typeof value === "number" ? value.toLocaleString() : "0";

export function ShopifyKPICards({
  totalRevenue = 0,
  totalOrders = 0,
  avgOrderValue = 0,
  statusBreakdown = {},
}: ShopifyKPICardsProps) {
  const breakdownEntries = Object.entries(statusBreakdown);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card className="rounded-2xl border ">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#96BF481A]">
              <DollarSign className="w-5 h-5 text-[#96BF48]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border ">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatNumber(totalOrders)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#96BF481A]">
              <ShoppingBag className="w-5 h-5 text-[#96BF48]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border ">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Avg. Order Value
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(avgOrderValue)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#96BF481A]">
              <BadgePercent className="w-5 h-5 text-[#96BF48]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border ">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Status Breakdown
              </p>
              <div className="mt-3 space-y-2">
                {breakdownEntries.length === 0 ? (
                  <p className="text-sm text-gray-500">No data available</p>
                ) : (
                  breakdownEntries.map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600 capitalize">{status}</span>
                      <span className="font-semibold text-gray-900">
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#96BF481A]">
              <PieChart className="w-5 h-5 text-[#96BF48]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}











