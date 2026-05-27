import { Loader2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useReachEstimate } from "@/features/meta/hooks/useMetaEstimates";
import type { ReachEstimatePayload } from "@/features/meta/API/metaEstimatesApi";
import { cn } from "@/lib/utils";

type Props = {
  payload: ReachEstimatePayload | null;
};

// Format Meta's raw user count into a human-readable size band so the user
// doesn't read too much into Meta's noisy single-number estimate.
const formatReach = (n: number): { value: string; label: string } => {
  if (n < 1_000) return { value: n.toLocaleString(), label: "very narrow" };
  if (n < 10_000) return { value: `${(n / 1000).toFixed(1)}K`, label: "narrow" };
  if (n < 100_000) return { value: `${(n / 1000).toFixed(0)}K`, label: "defined" };
  if (n < 1_000_000)
    return { value: `${(n / 1000).toFixed(0)}K`, label: "broad" };
  return { value: `${(n / 1_000_000).toFixed(1)}M`, label: "very broad" };
};

const SIZE_COLORS: Record<string, string> = {
  "very narrow": "bg-rose-50 text-rose-700 border-rose-100",
  narrow: "bg-amber-50 text-amber-700 border-amber-100",
  defined: "bg-emerald-50 text-emerald-700 border-emerald-100",
  broad: "bg-blue-50 text-blue-700 border-blue-100",
  "very broad": "bg-violet-50 text-violet-700 border-violet-100",
};

export function ReachEstimateWidget({ payload }: Props) {
  const { data, isLoading, isError, isFetching } = useReachEstimate(payload);

  // Idle state: no targeting set yet, encourage the user to refine.
  if (!payload || (!isLoading && !isFetching && !data && !isError)) {
    return (
      <Card className="rounded-2xl border-slate-100 p-4 bg-slate-50/50">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Users className="w-4 h-4 shrink-0" />
          <span>
            Add a location or interest above to see your estimated audience size.
          </span>
        </div>
      </Card>
    );
  }

  if (isLoading || isFetching) {
    return (
      <Card className="rounded-2xl border-slate-100 p-4">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
          <span>Estimating audience…</span>
        </div>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="rounded-2xl border-rose-100 bg-rose-50/40 p-4">
        <div className="flex items-center gap-3 text-sm text-rose-700">
          <Users className="w-4 h-4 shrink-0" />
          <span>Couldn't load reach estimate. Try again in a moment.</span>
        </div>
      </Card>
    );
  }

  const { value, label } = formatReach(data.users);
  return (
    <Card className="rounded-2xl border-slate-100 p-4 bg-gradient-to-br from-white to-slate-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Estimated audience
            </div>
            <div className="text-2xl font-black text-slate-900">{value}</div>
          </div>
        </div>
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
            SIZE_COLORS[label]
          )}
        >
          {label}
        </span>
      </div>
      <p className="text-[11px] text-slate-400 mt-3">
        Meta's estimate updates as you adjust targeting. For best results, aim for
        "defined" or "broad" — narrow audiences can struggle to exit learning phase.
      </p>
    </Card>
  );
}
