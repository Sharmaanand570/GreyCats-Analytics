import { DollarSign, ShoppingBag, TrendingUp, Store } from "lucide-react";
import { Card, CardContent } from "./ui/card";

type KPICardProps = {
  title: string;
  value: string | number;
  growth: string;
  icon: React.ReactNode;
  subtitle?: string;
};

function KPICard({ title, value, growth, icon, subtitle }: KPICardProps) {
  return (
    <Card className=" border rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#96588A1A" }}>
                <div style={{ color: "#96588A" }}>
                  {icon}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">{title}</p>
                {subtitle && (
                  <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {typeof value === "number" && (title.includes("Revenue") || title.includes("Order Value"))
                ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : typeof value === "number"
                ? value.toLocaleString()
                : value}
            </p>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">{growth}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type WooCommerceKPICardsProps = {
  totalRevenue?: number;
  totalOrders?: number;
  avgOrderValue?: number;
  activeStores?: number;
  revenueGrowth?: string;
  ordersGrowth?: string;
  aovGrowth?: string;
  storesGrowth?: string;
};

export function WooCommerceKPICards({
  totalRevenue = 0,
  totalOrders = 0,
  avgOrderValue = 0,
  activeStores = 0,
  revenueGrowth = "+100%",
  ordersGrowth = "+100%",
  aovGrowth = "+100%",
  storesGrowth = "+100%",
}: WooCommerceKPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total Revenue"
        value={totalRevenue}
        growth={revenueGrowth}
        icon={<DollarSign className="w-5 h-5" />}
      />
      <KPICard
        title="Total Orders"
        value={totalOrders}
        growth={ordersGrowth}
        icon={<ShoppingBag className="w-5 h-5" />}
      />
      <KPICard
        title="Avg. Order Value"
        value={avgOrderValue}
        growth={aovGrowth}
        icon={<TrendingUp className="w-5 h-5" />}
      />
      <KPICard
        title="Active Stores"
        value={activeStores}
        growth={storesGrowth}
        icon={<Store className="w-5 h-5" />}
        subtitle="Connected Accounts"
      />
    </div>
  );
}

