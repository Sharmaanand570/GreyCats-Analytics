import { Users, TrendingUp, AlertCircle, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountHealthCard } from "./AccountHealthCard";
import type { GoogleAdsAccount } from "../../types/googleAds.types";
import { fmtCurrency, fmtNumber } from "../ui/GoogleAdsShared";

interface MCCOverviewDashboardProps {
  hierarchy: GoogleAdsAccount;
  onAccountSelect: (account: GoogleAdsAccount) => void;
}

export function MCCOverviewDashboard({ hierarchy, onAccountSelect }: MCCOverviewDashboardProps) {
  
  // Flatten hierarchy to get all sub-accounts
  const getAllAccounts = (acc: GoogleAdsAccount): GoogleAdsAccount[] => {
    let result: GoogleAdsAccount[] = [acc];
    if (acc.children) {
      acc.children.forEach((child: GoogleAdsAccount) => {
        result = result.concat(getAllAccounts(child));
      });
    }
    return result;
  };

  const allAccounts = getAllAccounts(hierarchy).filter(a => a.id !== hierarchy.id); // Exclude the root MCC itself from the counts
  const clientAccounts = allAccounts.filter(a => !a.isManager);
  
  const totalSpend = clientAccounts.reduce((acc, curr) => acc + (curr.metrics?.cost || 0), 0);
  const totalConversions = clientAccounts.reduce((acc, curr) => acc + (curr.metrics?.conversions || 0), 0);
  
  const accountsNeedingAttention = allAccounts.filter(a => a.healthScore && a.healthScore < 0.7);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-auto">
      <div>
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Manager Overview: {hierarchy.descriptiveName}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          High-level performance and health metrics across all linked accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Client Accounts</CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{clientAccounts.length}</div>
            <p className="text-xs text-slate-500 mt-1">Across entire hierarchy</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Spend (30d)</CardTitle>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{fmtCurrency(totalSpend)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Conversions (30d)</CardTitle>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{fmtNumber(totalConversions)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-200 bg-amber-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Needs Attention</CardTitle>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">{accountsNeedingAttention.length}</div>
            <p className="text-xs text-amber-700 mt-1">Accounts with low health score</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-slate-800 mb-3">Accounts Needing Attention</h3>
          {accountsNeedingAttention.length > 0 ? (
            <div className="flex flex-col gap-3">
              {accountsNeedingAttention.slice(0, 5).map(acc => (
                <div key={acc.id} onClick={() => onAccountSelect(acc)}>
                  <AccountHealthCard account={acc} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-slate-300 bg-slate-50">
              <CardContent className="p-6 text-center text-sm text-slate-500">
                All accounts are healthy!
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-slate-800 mb-3">Largest Spenders</h3>
          <div className="flex flex-col gap-3">
            {clientAccounts.sort((a, b) => (b.metrics?.cost || 0) - (a.metrics?.cost || 0)).slice(0, 5).map(acc => (
              <Card key={acc.id} className="hover:shadow-md transition-all cursor-pointer border-slate-200" onClick={() => onAccountSelect(acc)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-800">{acc.descriptiveName}</span>
                    <span className="text-xs text-slate-500">{acc.id}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    {fmtCurrency(acc.metrics?.cost || 0)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
