import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Link2 } from "lucide-react";
import type { BiddingStrategy } from "../../../types/googleAds.types";

interface PortfolioBidStrategiesTableProps {
  strategies: BiddingStrategy[];
  onEdit: (strategy: BiddingStrategy) => void;
  onAssign: (strategy: BiddingStrategy) => void;
  onDelete: (strategy: BiddingStrategy) => void;
}

export function PortfolioBidStrategiesTable({ 
  strategies, 
  onEdit, 
  onAssign, 
  onDelete 
}: PortfolioBidStrategiesTableProps) {
  
  if (strategies.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-md">
        <h3 className="text-sm font-medium text-slate-800 mb-1">No portfolio strategies</h3>
        <p className="text-sm text-slate-500 mb-4">You haven't created any portfolio bid strategies yet.</p>
      </div>
    );
  }

  const formatType = (type: string) => {
    switch(type) {
      case "TARGET_CPA": return "Target CPA";
      case "TARGET_ROAS": return "Target ROAS";
      case "MAXIMIZE_CONVERSIONS": return "Maximize Conversions";
      case "MAXIMIZE_CONVERSION_VALUE": return "Maximize Conversion Value";
      case "TARGET_IMPRESSION_SHARE": return "Target Impression Share";
      default: return type;
    }
  };

  const formatCurrency = (micros: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(micros / 1000000);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
            <TableHead className="w-[200px]">Strategy name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Campaigns</TableHead>
            <TableHead className="text-right">Impressions</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="text-right">Conversions</TableHead>
            <TableHead className="text-center w-[180px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {strategies.filter(s => s.status !== "REMOVED").map(strategy => (
            <TableRow key={strategy.id} className="group">
              <TableCell className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => onEdit(strategy)}>
                {strategy.name}
              </TableCell>
              <TableCell className="text-slate-600">
                {formatType(strategy.type)}
                {strategy.type === "TARGET_CPA" && strategy.targetCpa && ` (${formatCurrency(strategy.targetCpa)})`}
                {strategy.type === "TARGET_ROAS" && strategy.targetRoas && ` (${(strategy.targetRoas * 100).toFixed(0)}%)`}
              </TableCell>
              <TableCell className="text-right font-medium text-slate-800">
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-medium" 
                  onClick={() => onAssign(strategy)}
                >
                  {strategy.campaignCount}
                </Button>
              </TableCell>
              <TableCell className="text-right text-slate-600">
                {strategy.metrics ? formatNumber(strategy.metrics.impressions) : "-"}
              </TableCell>
              <TableCell className="text-right text-slate-600">
                {strategy.metrics ? formatNumber(strategy.metrics.clicks) : "-"}
              </TableCell>
              <TableCell className="text-right text-slate-600">
                {strategy.metrics ? formatCurrency(strategy.metrics.costMicros) : "-"}
              </TableCell>
              <TableCell className="text-right text-slate-600">
                {strategy.metrics ? formatNumber(strategy.metrics.conversions) : "-"}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-800" onClick={() => onAssign(strategy)} title="Assign to campaigns">
                    <Link2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => onEdit(strategy)} title="Edit strategy">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => onDelete(strategy)} title="Delete strategy">
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
