import { DollarSign, ShoppingBag, TrendingUp, Store } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

type KPICardProps = {
  title: string;
  value: string | number;
  growth: string;
  icon: React.ReactNode;
  subtitle?: string;
  color?: "blue" | "emerald" | "violet" | "amber" | "rose" | "zinc";
};

function KPICard({ title, value, growth, icon, subtitle, color = "zinc" }: KPICardProps) {
  const colorMap: any = {
    blue: { text: "text-blue-600", bg: "bg-blue-50" },
    emerald: { text: "text-emerald-600", bg: "bg-emerald-50" },
    violet: { text: "text-violet-600", bg: "bg-violet-50" },
    amber: { text: "text-amber-600", bg: "bg-amber-50" },
    rose: { text: "text-rose-600", bg: "bg-rose-50" },
    zinc: { text: "text-zinc-600", bg: "bg-zinc-50" },
  };
  const c = colorMap[color] || colorMap.zinc;

  return (
    <Card className="rounded-[28px] border-zinc-100 shadow-sm transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50/30">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-zinc-900 tracking-tight">
                {typeof value === "number" && (title.includes("Revenue") || title.includes("Order Value"))
                  ? `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                  : typeof value === "number"
                  ? value.toLocaleString("en-IN")
                  : value}
              </h3>
            </div>
            {(growth || subtitle) && (
              <div className="flex items-center gap-2 mt-1">
                {growth && (
                   <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{growth}</span>
                )}
                {subtitle && (
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest opacity-60">View Details</span>
                )}
              </div>
            )}
          </div>
          <div className={cn("p-2.5 rounded-2xl ring-1 ring-zinc-100", c.bg)}>
            <div className={cn("w-4 h-4", c.text)}>{icon}</div>
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Total Revenue"
        value={totalRevenue}
        growth={revenueGrowth}
        icon={<DollarSign />}
        color="emerald"
      />
      <KPICard
        title="Total Orders"
        value={totalOrders}
        growth={ordersGrowth}
        icon={<ShoppingBag />}
        color="blue"
      />
      <KPICard
        title="Avg. Order Value"
        value={avgOrderValue}
        growth={aovGrowth}
        icon={<TrendingUp />}
        color="violet"
      />
      <KPICard
        title="Active Stores"
        value={activeStores}
        growth={storesGrowth}
        icon={<Store />}
        color="amber"
        subtitle="Connected Accounts"
      />
    </div>
  );
}
