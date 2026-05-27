import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { useSyncStatus } from "@/features/meta/hooks/useMetaAdsDetail";
import { formatDistanceToNow } from "date-fns";

type Props = {
  clientId: number | null;
};

// Strip noise: only the object types that actually appear on the detail page
// are worth surfacing. Adds focus and keeps the banner short.
const VISIBLE_TYPES = new Set(["campaign", "adset", "ad", "insight"]);

const TYPE_LABELS: Record<string, string> = {
  campaign: "Campaigns",
  adset: "Ad Sets",
  ad: "Ads",
  insight: "Insights",
};

// Lightweight strip that tells the user how fresh their data is + whether
// any sync jobs are currently in flight. Replaces the generic DataSyncBanner
// (which speaks across all integrations) with Meta-Ads-specific detail.
export function SyncStatusBanner({ clientId }: Props) {
  const { data } = useSyncStatus(clientId);
  if (!clientId || !data || data.length === 0) return null;

  const entries = data.filter((e) => VISIBLE_TYPES.has(e.objectType));
  const pending = entries.reduce((s, e) => s + (e.pendingJobs || 0), 0);
  const oldest = entries
    .map((e) => (e.lastSyncedAt ? new Date(e.lastSyncedAt).getTime() : 0))
    .filter((t) => t > 0)
    .reduce((min, t) => (t < min ? t : min), Date.now());

  const oldestRelative = oldest < Date.now()
    ? formatDistanceToNow(new Date(oldest), { addSuffix: true })
    : "just now";

  return (
    <Card className="rounded-2xl border-slate-100 bg-slate-50/50 p-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          {pending > 0 ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>
            {pending > 0 ? (
              <>
                <span className="font-bold text-blue-700">
                  {pending} sync job{pending === 1 ? "" : "s"} running.
                </span>{" "}
                Insights will update shortly.
              </>
            ) : (
              <>
                Last synced <span className="font-semibold">{oldestRelative}</span>
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
          {entries.map((e) => (
            <span key={e.objectType}>
              {TYPE_LABELS[e.objectType] ?? e.objectType}:
              {" "}
              {e.lastSyncedAt
                ? formatDistanceToNow(new Date(e.lastSyncedAt), { addSuffix: false })
                : "never"}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
