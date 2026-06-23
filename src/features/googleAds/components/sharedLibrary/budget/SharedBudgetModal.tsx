import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { SharedBudget } from "../../../types/googleAds.types";
import { useCreateSharedBudget, useUpdateSharedBudget } from "../../../hooks/useCampaignManagement";

interface SharedBudgetModalProps {
  clientId: number;
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: SharedBudget | null;
}

export function SharedBudgetModal({ clientId, isOpen, onClose, budgetToEdit }: SharedBudgetModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  
  const createBudget = useCreateSharedBudget(clientId);
  const updateBudget = useUpdateSharedBudget(clientId);

  useEffect(() => {
    if (isOpen) {
      if (budgetToEdit) {
        setName(budgetToEdit.name);
        setAmount((budgetToEdit.amountMicros / 1000000).toString());
      } else {
        setName("");
        setAmount("");
      }
    }
  }, [isOpen, budgetToEdit]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim() || !amount) return;
    
    const amountMicros = parseFloat(amount) * 1000000;

    if (budgetToEdit) {
      updateBudget.mutate(
        { budgetId: budgetToEdit.id, name, amountMicros },
        { onSuccess: onClose }
      );
    } else {
      createBudget.mutate(
        { name, amountMicros },
        { onSuccess: onClose }
      );
    }
  };

  const isPending = createBudget.isPending || updateBudget.isPending;

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-800">
            {budgetToEdit ? "Edit shared budget" : "New shared budget"}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">
              Budget name
            </label>
            <input
              type="text"
              placeholder="e.g. Q3 Brand Campaign Budget"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">
              Average daily budget (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-[13px] text-blue-800">
              <strong>Shared budgets</strong> let you apply a single average daily budget across multiple campaigns. Google Ads will automatically allocate the budget across the assigned campaigns to help improve your return on investment.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !amount || isPending}
            className="px-4 py-2 text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
