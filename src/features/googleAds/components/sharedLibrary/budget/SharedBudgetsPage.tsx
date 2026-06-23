import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharedBudgetsTable } from "./SharedBudgetsTable";
import { SharedBudgetModal } from "./SharedBudgetModal";
import { CampaignAssociationDrawer } from "../CampaignAssociationDrawer";
import { useSharedBudgets, useDeleteSharedBudget } from "../../../hooks/useCampaignManagement";
import type { SharedBudget } from "../../../types/googleAds.types";

interface SharedBudgetsPageProps {
  clientId: number;
}

export function SharedBudgetsPage({ clientId }: SharedBudgetsPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<SharedBudget | null>(null);
  const [budgetToAssign, setBudgetToAssign] = useState<SharedBudget | null>(null);

  const { data: response, isLoading } = useSharedBudgets(clientId);
  const deleteBudget = useDeleteSharedBudget(clientId);

  const handleDelete = (budget: SharedBudget) => {
    if (budget.campaignCount > 0) {
      alert("Cannot delete a shared budget that is assigned to campaigns. Remove it from all campaigns first.");
      return;
    }
    if (confirm(`Are you sure you want to delete the shared budget "${budget.name}"?`)) {
      deleteBudget.mutate(budget.id);
    }
  };

  const budgets = response?.budgets || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-normal text-slate-800">Shared budgets</h2>
          <p className="text-sm text-slate-500 mt-1">
            Apply a single average daily budget across multiple campaigns.
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 rounded-full h-10 w-10 p-0 shadow-sm"
          onClick={() => setIsCreateModalOpen(true)}
          title="Create shared budget"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <SharedBudgetsTable 
          budgets={budgets} 
          onEdit={(b) => setBudgetToEdit(b)}
          onAssign={(b) => setBudgetToAssign(b)}
          onDelete={handleDelete}
        />
      )}

      <SharedBudgetModal 
        clientId={clientId}
        isOpen={isCreateModalOpen || !!budgetToEdit}
        onClose={() => {
          setIsCreateModalOpen(false);
          setBudgetToEdit(null);
        }}
        budgetToEdit={budgetToEdit}
      />

      <CampaignAssociationDrawer 
        clientId={clientId}
        isOpen={!!budgetToAssign}
        onClose={() => setBudgetToAssign(null)}
        assignmentType="sharedBudget"
        assignmentId={budgetToAssign?.id || ""}
        assignmentName={budgetToAssign?.name || ""}
      />
    </div>
  );
}
