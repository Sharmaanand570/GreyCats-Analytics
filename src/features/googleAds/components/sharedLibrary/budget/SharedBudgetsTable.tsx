import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Link2 } from "lucide-react";
import type { SharedBudget } from "../../../types/googleAds.types";

interface SharedBudgetsTableProps {
  budgets: SharedBudget[];
  onEdit: (budget: SharedBudget) => void;
  onAssign: (budget: SharedBudget) => void;
  onDelete: (budget: SharedBudget) => void;
}

export function SharedBudgetsTable({ 
  budgets, 
  onEdit, 
  onAssign, 
  onDelete 
}: SharedBudgetsTableProps) {
  
  if (budgets.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-md">
        <h3 className="text-sm font-medium text-slate-800 mb-1">No shared budgets</h3>
        <p className="text-sm text-slate-500 mb-4">You haven't created any shared budgets yet.</p>
      </div>
    );
  }

  const formatCurrency = (micros: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(micros / 1000000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
            <TableHead className="w-[300px]">Budget name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-right">Campaigns</TableHead>
            <TableHead className="text-center w-[180px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.filter(b => b.status !== "REMOVED").map(budget => (
            <TableRow key={budget.id} className="group">
              <TableCell className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => onEdit(budget)}>
                {budget.name}
              </TableCell>
              <TableCell className="text-slate-600 font-medium">
                {formatCurrency(budget.amountMicros)} / day
              </TableCell>
              <TableCell className="text-right font-medium text-slate-800">
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-medium" 
                  onClick={() => onAssign(budget)}
                >
                  {budget.campaignCount}
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800" onClick={() => onAssign(budget)} title="Assign to campaigns">
                    <Link2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => onEdit(budget)} title="Edit">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => onDelete(budget)} title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
