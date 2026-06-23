import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtCurrency } from "../ui/GoogleAdsShared";
import { format } from "date-fns";
import type { AccountBudget } from "../../types/googleAds.types";
import { Badge } from "@/components/ui/badge";

interface AccountBudgetsTableProps {
  budgets: AccountBudget[];
}

export function AccountBudgetsTable({ budgets }: AccountBudgetsTableProps) {
  if (budgets.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-500 border border-slate-200 rounded-lg bg-white">
        No account budgets found.
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Budget name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start date</TableHead>
            <TableHead>End date</TableHead>
            <TableHead className="text-right">Budget limit</TableHead>
            <TableHead className="text-right">Amount served</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.map((budget) => (
            <TableRow key={budget.id} className="hover:bg-slate-50">
              <TableCell className="font-medium text-slate-800">{budget.name}</TableCell>
              <TableCell>
                <Badge variant={budget.status === "APPROVED" ? "default" : "secondary"} className={budget.status === "APPROVED" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}>
                  {budget.status}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-600">
                {budget.approvedStartDateTime ? format(new Date(budget.approvedStartDateTime), "MMM d, yyyy") : "Pending"}
              </TableCell>
              <TableCell className="text-slate-600">
                {budget.approvedEndDateTime ? format(new Date(budget.approvedEndDateTime), "MMM d, yyyy") : "No end date"}
              </TableCell>
              <TableCell className="text-right font-medium text-slate-800">
                {budget.approvedSpendingLimitMicros ? fmtCurrency(budget.approvedSpendingLimitMicros) : "Unlimited"}
              </TableCell>
              <TableCell className="text-right text-slate-600">
                {fmtCurrency(budget.amountServedMicros)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
