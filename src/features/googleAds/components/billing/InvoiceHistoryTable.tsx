import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtCurrency } from "../ui/GoogleAdsShared";
import { format } from "date-fns";
import type { Invoice } from "../../types/googleAds.types";
import { Download } from "lucide-react";

interface InvoiceHistoryTableProps {
  invoices: Invoice[];
}

export function InvoiceHistoryTable({ invoices }: InvoiceHistoryTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-500 border border-slate-200 rounded-lg bg-white">
        No invoices found.
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Invoice ID</TableHead>
            <TableHead>Issue date</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead className="text-right">Amount due</TableHead>
            <TableHead className="text-right w-24">Document</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id} className="hover:bg-slate-50">
              <TableCell className="font-medium text-slate-800">{inv.id}</TableCell>
              <TableCell className="text-slate-600">{format(new Date(inv.issueDate), "MMM d, yyyy")}</TableCell>
              <TableCell className="text-slate-600">{format(new Date(inv.dueDate), "MMM d, yyyy")}</TableCell>
              <TableCell className="text-right font-medium text-slate-800">
                {fmtCurrency(inv.amountDueMicros, inv.currencyCode)}
              </TableCell>
              <TableCell className="text-right">
                {inv.pdfUrl ? (
                  <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                    <Download className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-slate-400 text-xs">N/A</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
