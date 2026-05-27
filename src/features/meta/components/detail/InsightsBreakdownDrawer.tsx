import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useInsightsBreakdown } from "@/features/meta/hooks/useMetaAdsDetail";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: number | null;
  campaignId: string | null;
  campaignName?: string;
  startDate?: string;
  endDate?: string;
};

const BREAKDOWN_OPTIONS = [
  { value: "age", label: "Age" },
  { value: "gender", label: "Gender" },
  { value: "age,gender", label: "Age × Gender" },
  { value: "country", label: "Country" },
  { value: "region", label: "Region" },
  { value: "publisher_platform", label: "Platform" },
  { value: "platform_position", label: "Placement Position" },
  { value: "impression_device", label: "Device" },
  { value: "device_platform", label: "Device Platform" },
  {
    value: "hourly_stats_aggregated_by_advertiser_time_zone",
    label: "Hour of Day",
  },
];

const FIELDS = ["spend", "impressions", "clicks", "ctr", "cpc", "reach", "actions"];

// Compact INR number formatter — matches MetaDetailPage's currency choice.
const fmt = (s?: string) => {
  if (s === undefined) return "—";
  const n = Number(s);
  if (Number.isNaN(n)) return s;
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

// Flatten Meta's actions[] array of {action_type, value} into a numeric total
// of purchase-like events. Approximate but useful as a single-cell signal.
const totalActions = (
  actions?: Array<{ action_type: string; value: string }>
): string => {
  if (!actions?.length) return "—";
  const sum = actions
    .filter((a) =>
      ["offsite_conversion.fb_pixel_purchase", "purchase", "lead", "submit_application"].some(
        (t) => a.action_type.includes(t)
      )
    )
    .reduce((s, a) => s + Number(a.value || 0), 0);
  return sum > 0 ? sum.toLocaleString() : "—";
};

export function InsightsBreakdownDrawer({
  open,
  onOpenChange,
  clientId,
  campaignId,
  campaignName,
  startDate,
  endDate,
}: Props) {
  const [breakdown, setBreakdown] = useState("age,gender");

  // Each comma-separated value in `breakdown` is one Meta breakdown dimension.
  // The backend handles the parsing — we pass the array.
  const { data, isLoading, isError, error } = useInsightsBreakdown(
    open ? clientId : null,
    open && campaignId
      ? {
          level: "campaign",
          objectIds: [campaignId],
          startDate,
          endDate,
          fields: FIELDS,
          breakdowns: breakdown.split(","),
        }
      : null
  );

  const dimColumns = breakdown.split(",");
  const labelFor = (dim: string) =>
    BREAKDOWN_OPTIONS.find((o) => o.value === dim)?.label ?? dim;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4">
            <span>Insights Breakdown</span>
            <Select value={breakdown} onValueChange={setBreakdown}>
              <SelectTrigger className="h-9 w-[200px] rounded-lg text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BREAKDOWN_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DialogTitle>
          <DialogDescription>
            {campaignName ? <span className="font-semibold">{campaignName}</span> : "Campaign"}
            {" — performance sliced by "}
            {dimColumns.map(labelFor).join(", ").toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-[200px]">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-4 text-sm text-rose-700 bg-rose-50 rounded-lg">
              {error?.message || "Couldn't load breakdown."}
            </div>
          ) : !data || data.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No data for this breakdown in the selected date range.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {dimColumns.map((d) => (
                    <TableHead key={d} className="text-[10px] uppercase tracking-widest">
                      {labelFor(d)}
                    </TableHead>
                  ))}
                  <TableHead className="text-[10px] uppercase tracking-widest text-right">
                    Impr.
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-right">
                    Clicks
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-right">
                    Spend
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-right">
                    CTR
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx}>
                    {dimColumns.map((d) => (
                      <TableCell key={d} className="font-medium">
                        {(row as Record<string, unknown>)[d] as string ?? "—"}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-mono">
                      {fmt(row.impressions)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {fmt(row.clicks)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {fmt(row.spend)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {row.ctr ? `${Number(row.ctr).toFixed(2)}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {totalActions(row.actions)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
