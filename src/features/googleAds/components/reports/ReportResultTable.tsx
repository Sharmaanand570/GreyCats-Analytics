import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeletonRows, EmptyState, ErrorState, fmtCurrency, fmtNumber } from "../ui/GoogleAdsShared";
import { BarChart3 } from "lucide-react";
  // @ts-expect-error unused variable
import type { GaqlReportResponse, GaqlReportColumn, GaqlReportRow } from "../../types/googleAds.types";

interface ReportResultTableProps {
  data: GaqlReportResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function ReportResultTable({ data, isLoading, isError, error }: ReportResultTableProps) {
  if (isError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white">
        <ErrorState message={error?.message ?? "Failed to load report"} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full bg-white h-full overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(5)].map((_, i) => (
                <TableHead key={i} />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableSkeletonRows columns={5} rows={10} />
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!data || !data.columns || data.columns.length === 0 || !data.rows || data.rows.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white border-t border-slate-200">
        <EmptyState
          icon={BarChart3}
          title="No data found"
          description="Your report query returned no results. Try adjusting your filters or date range."
        />
      </div>
    );
  }

  const { columns, rows } = data;

  const renderCell = (value: any, col: GaqlReportColumn) => {
    if (value === undefined || value === null) return "-";
    
    switch (col.type) {
      case "NUMBER":
        return fmtNumber(value);
      case "CURRENCY":
        return fmtCurrency(value);
      case "PERCENTAGE":
        return `${(value * 100).toFixed(2)}%`;
      case "DATE":
        return new Date(value).toLocaleDateString();
      case "STRING":
      default:
        return String(value);
    }
  };

  const getColAlignment = (type: string) => {
    if (["NUMBER", "CURRENCY", "PERCENTAGE"].includes(type)) return "text-right";
    return "text-left";
  };

  return (
    <div className="w-full h-full overflow-auto bg-white border-t border-slate-200">
      <Table>
        <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i} className={`font-medium text-slate-600 ${getColAlignment(col.type)}`}>
                {col.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rIndex) => (
            <TableRow key={rIndex} className="hover:bg-slate-50">
              {columns.map((col, cIndex) => (
                <TableCell key={cIndex} className={`text-sm ${getColAlignment(col.type)}`}>
                  {renderCell(row[col.name], col)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
