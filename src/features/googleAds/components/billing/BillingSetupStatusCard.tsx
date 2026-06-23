import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import type { BillingSetup } from "../../types/googleAds.types";

interface BillingSetupStatusCardProps {
  setups: BillingSetup[];
}

export function BillingSetupStatusCard({ setups }: BillingSetupStatusCardProps) {
  const primarySetup = setups[0];

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-sm font-semibold text-slate-800">Payment Setup</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {primarySetup ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {primarySetup.status === "APPROVED" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {primarySetup.status === "PENDING" && <Clock className="w-5 h-5 text-amber-500" />}
              {primarySetup.status === "CANCELLED" && <AlertCircle className="w-5 h-5 text-red-500" />}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800">{primarySetup.paymentsAccountName}</span>
                <span className="text-xs text-slate-500">ID: {primarySetup.paymentsAccount}</span>
              </div>
            </div>
            <div className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded w-fit">
              Status: {primarySetup.status}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded">
            <AlertCircle className="w-4 h-4" />
            No billing setup found. Ads will not serve.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
