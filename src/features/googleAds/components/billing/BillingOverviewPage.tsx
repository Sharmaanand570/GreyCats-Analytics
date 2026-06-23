import { useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import { useBillingSummary, useCreateBudgetProposal } from "../../hooks/useCampaignManagement";
import { ErrorState, TableSkeletonRows } from "../ui/GoogleAdsShared";
import { BillingSummaryCards } from "./BillingSummaryCards";
import { BillingSetupStatusCard } from "./BillingSetupStatusCard";
import { AccountBudgetsTable } from "./AccountBudgetsTable";
import { InvoiceHistoryTable } from "./InvoiceHistoryTable";
import { BudgetProposalModal } from "./BudgetProposalModal";
import { Button } from "@/components/ui/button";

interface BillingOverviewPageProps {
  clientId: number;
}

export function BillingOverviewPage({ clientId }: BillingOverviewPageProps) {
  const { data, isLoading, isError, error } = useBillingSummary(clientId);
  const createMutation = useCreateBudgetProposal(clientId);

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isError) {
    return (
      <div className="h-full w-full bg-white flex items-center justify-center">
        <ErrorState message={error?.message ?? "Failed to load billing summary"} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const handleCreateSubmit = (budgetData: { name: string; limit: number }) => {
    const activeSetup = data?.billingSetups.find(s => s.status === "APPROVED");
    if (!activeSetup) {
      alert("No active billing setup found.");
      return;
    }
    
    // Default dates: now until 1 year from now
    const now = new Date();
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);

    createMutation.mutate({
      billingSetupId: activeSetup.id,
      name: budgetData.name,
      spendingLimitMicros: budgetData.limit,
      startDateTime: now.toISOString(),
      endDateTime: end.toISOString()
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-auto">
      <div className="px-6 py-5 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <CreditCard className="w-4 h-4" /> Tools & Settings / Billing
        </div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-semibold text-slate-800">Billing summary</h1>
        </div>
        <p className="text-slate-500 text-sm max-w-3xl">
          Manage your payment methods, account budgets, and view your invoice history.
        </p>
      </div>

      <div className="p-6 flex flex-col gap-8 max-w-6xl mx-auto w-full">
        {isLoading ? (
          <TableSkeletonRows columns={3} rows={3} />
        ) : (
          <>
            <BillingSummaryCards 
              invoices={data?.invoices ?? []} 
              budgets={data?.accountBudgets ?? []} 
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">Account Budgets</h2>
                  <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4" /> Create budget
                  </Button>
                </div>
                <AccountBudgetsTable budgets={data?.accountBudgets ?? []} />
              </div>

              <div className="md:col-span-1">
                <BillingSetupStatusCard setups={data?.billingSetups ?? []} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Documents</h2>
              </div>
              <InvoiceHistoryTable invoices={data?.invoices ?? []} />
            </div>
          </>
        )}
      </div>

      <BudgetProposalModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreateSubmit}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
