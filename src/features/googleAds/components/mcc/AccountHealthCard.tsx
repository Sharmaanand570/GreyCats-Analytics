import { Card, CardContent } from "@/components/ui/card";
import { Activity, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import type { GoogleAdsAccount } from "../../types/googleAds.types";

interface AccountHealthCardProps {
  account: GoogleAdsAccount;
}

export function AccountHealthCard({ account }: AccountHealthCardProps) {
  const getHealthStatus = () => {
    if (account.status !== "ENABLED") return { icon: AlertTriangle, color: "text-red-500", text: account.status };
    if (!account.healthScore) return { icon: HelpCircle, color: "text-slate-400", text: "Unknown" };
    if (account.healthScore > 0.8) return { icon: CheckCircle, color: "text-emerald-500", text: "Excellent" };
    if (account.healthScore > 0.5) return { icon: Activity, color: "text-amber-500", text: "Needs attention" };
    return { icon: AlertTriangle, color: "text-red-500", text: "Critical" };
  };

  const status = getHealthStatus();
  const Icon = status.icon;

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer border-slate-200">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-800">{account.descriptiveName}</span>
          <span className="text-xs text-slate-500">{account.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${status.color}`}>{status.text}</span>
          <Icon className={`w-4 h-4 ${status.color}`} />
        </div>
      </CardContent>
    </Card>
  );
}
