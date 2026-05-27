import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";
import { useAccountDiagnostics } from "@/features/meta/hooks/useMetaAdsDetail";
import { cn } from "@/lib/utils";

type Props = {
  clientId: number | null;
  accountId: string | null;
};

const STATUS_TONE: Record<string, { dot: string; label: string; tone: string }> = {
  ACTIVE: { dot: "bg-emerald-500", label: "Active", tone: "text-emerald-700" },
  DISABLED: { dot: "bg-rose-500", label: "Disabled", tone: "text-rose-700" },
  UNSETTLED: { dot: "bg-amber-500", label: "Unsettled", tone: "text-amber-700" },
  CLOSED: { dot: "bg-slate-500", label: "Closed", tone: "text-slate-700" },
  PENDING_REVIEW: {
    dot: "bg-amber-500",
    label: "Pending Review",
    tone: "text-amber-700",
  },
};

// Card-level summary of the ad account's health. Sits at the top of the
// detail page so problems are visible before the user dives into campaigns.
export function AccountDiagnosticsCard({ clientId, accountId }: Props) {
  const { data, isLoading, isError } = useAccountDiagnostics(clientId, accountId);

  if (!clientId || !accountId) return null;

  if (isLoading) {
    return <Skeleton className="h-[120px] rounded-[28px]" />;
  }

  if (isError || !data) {
    // Failing silently here — the main page already shows a "Sync Issue"
    // error for the campaign data; doubling up is noise.
    return null;
  }

  const status = STATUS_TONE[data.account_status] ?? STATUS_TONE.ACTIVE;
  const issueCount = data.issues?.length ?? 0;
  const spendCap = data.spend_cap ? Number(data.spend_cap) : 0;
  const amountSpent = data.amount_spent ? Number(data.amount_spent) : 0;
  const spendPct = spendCap > 0 ? Math.min(100, (amountSpent / spendCap) * 100) : 0;
  const isNearCap = spendCap > 0 && spendPct >= 80;

  return (
    <Card className="rounded-[28px] border-zinc-100 p-5 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Account status */}
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Account Status
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", status.dot)} />
            <span className={cn("text-sm font-bold", status.tone)}>{status.label}</span>
          </div>
          {data.is_prepay_account !== undefined && (
            <div className="text-[10px] text-zinc-400">
              {data.is_prepay_account ? "Prepay account" : "Postpay account"}
            </div>
          )}
        </div>

        {/* Spend cap progress */}
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Spend vs Cap
          </div>
          <div className="text-sm font-bold text-zinc-900">
            {spendCap > 0
              ? `${amountSpent.toLocaleString()} / ${spendCap.toLocaleString()}`
              : "No cap"}
          </div>
          {spendCap > 0 && (
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isNearCap ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{ width: `${spendPct}%` }}
              />
            </div>
          )}
        </div>

        {/* Funding source */}
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Funding Source
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-900">
            <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
            {data.funding_source_details?.display_string ?? "—"}
          </div>
        </div>

        {/* Issues */}
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Active Issues
          </div>
          <div className="flex items-center gap-2">
            {issueCount === 0 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-700">All clear</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-amber-700">
                  {issueCount} issue{issueCount === 1 ? "" : "s"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Issue details — only show top 3 to avoid wall-of-text. */}
      {issueCount > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2">
          {(data.issues ?? []).slice(0, 3).map((issue, i) => (
            <div
              key={`${issue.level}-${issue.id}-${i}`}
              className="flex items-start gap-2 text-xs"
            >
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5",
                  issue.level === "CAMPAIGN" && "border-rose-200 text-rose-700 bg-rose-50",
                  issue.level === "ADSET" && "border-amber-200 text-amber-700 bg-amber-50",
                  issue.level === "AD" && "border-violet-200 text-violet-700 bg-violet-50"
                )}
              >
                {issue.level}
              </Badge>
              <div>
                <div className="font-bold text-zinc-900">{issue.title}</div>
                {issue.description && (
                  <div className="text-zinc-500 leading-relaxed">{issue.description}</div>
                )}
              </div>
            </div>
          ))}
          {issueCount > 3 && (
            <div className="text-[11px] text-zinc-400 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              {issueCount - 3} more — review individual campaigns below.
            </div>
          )}
        </div>
      )}

      {data.account_status === "DISABLED" && (
        <div className="mt-4 pt-4 border-t border-zinc-100 flex items-start gap-2 text-xs text-rose-700">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            This ad account is disabled. New ads can't be published until Meta restores it.
            {data.disable_reason ? ` (reason code ${data.disable_reason})` : ""}
          </span>
        </div>
      )}
    </Card>
  );
}
