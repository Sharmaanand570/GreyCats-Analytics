import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, CreditCard, AlertCircle } from "lucide-react";
import { fmtCurrency } from "../ui/GoogleAdsShared";
import type { Invoice, AccountBudget } from "../../types/googleAds.types";

interface BillingSummaryCardsProps {
  invoices: Invoice[];
  budgets: AccountBudget[];
}

export function BillingSummaryCards({ invoices, budgets }: BillingSummaryCardsProps) {
  const amountDue = invoices.reduce((acc, inv) => acc + inv.amountDueMicros, 0);
  const activeBudget = budgets.find(b => b.status === "APPROVED");
  
  const budgetRemaining = activeBudget 
    ? activeBudget.approvedSpendingLimitMicros - activeBudget.amountServedMicros 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Amount due</CardTitle>
          <DollarSign className="w-4 h-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">{fmtCurrency(amountDue)}</div>
          {amountDue > 0 && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Payment required</p>}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Active budget remaining</CardTitle>
          <CreditCard className="w-4 h-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          {activeBudget ? (
            <>
              <div className="text-2xl font-bold text-slate-800">{fmtCurrency(budgetRemaining)}</div>
              <p className="text-xs text-slate-500 mt-1">out of {fmtCurrency(activeBudget.approvedSpendingLimitMicros)}</p>
            </>
          ) : (
            <div className="text-sm text-slate-500 py-1">No active budget</div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total unbilled (last 30d)</CardTitle>
          <FileText className="w-4 h-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">{fmtCurrency(activeBudget?.amountServedMicros ?? 0)}</div>
          <p className="text-xs text-slate-500 mt-1">Since last invoice</p>
        </CardContent>
      </Card>
    </div>
  );
}
