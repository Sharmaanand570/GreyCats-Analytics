import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Loader2, RefreshCw } from "lucide-react";
import { useDeliveryEstimate } from "@/features/meta/hooks/useMetaEstimates";
import type { DeliveryEstimatePayload } from "@/features/meta/API/metaEstimatesApi";

type Props = {
  payload: DeliveryEstimatePayload | null;
};

const formatNumber = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

export function DeliveryEstimatePanel({ payload }: Props) {
  const { mutate, data, isPending, isError, error, reset } = useDeliveryEstimate();

  const handleRun = () => {
    if (!payload) return;
    reset();
    mutate(payload);
  };

  const curve = data?.daily_outcomes_curve ?? [];
  // Pick a representative range: lowest / mid / highest spend points.
  const samplePoints = (() => {
    if (curve.length === 0) return [];
    if (curve.length <= 3) return curve;
    return [curve[0], curve[Math.floor(curve.length / 2)], curve[curve.length - 1]];
  })();

  return (
    <Card className="rounded-[20px] border-slate-100 p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Delivery Estimate</h3>
            <p className="text-xs text-slate-500">
              What this ad set could deliver across a range of daily spend.
            </p>
          </div>
        </div>
        <Button
          onClick={handleRun}
          disabled={!payload || isPending}
          size="sm"
          className="h-9 rounded-lg gap-1.5 bg-slate-900 hover:bg-slate-800"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {data ? "Refresh" : "Run estimate"}
        </Button>
      </div>

      {!payload && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Pick an account + optimization goal in earlier steps to enable delivery
          estimates.
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error?.message || "Couldn't run delivery estimate."}
        </div>
      )}

      {data && !data.estimate_ready && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Meta is still computing this estimate. Try again in a few moments.
        </div>
      )}

      {data && samplePoints.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {samplePoints.map((p, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-1"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  At {formatNumber(p.spend)} daily spend
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <div>
                    <div className="text-slate-400 text-[10px]">Reach</div>
                    <div className="font-bold text-slate-900">
                      {formatNumber(p.reach)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Impr.</div>
                    <div className="font-bold text-slate-900">
                      {formatNumber(p.impressions)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Actions</div>
                    <div className="font-bold text-slate-900">
                      {formatNumber(p.actions)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {data.estimate_mau > 0 && (
            <p className="text-[11px] text-slate-400">
              Estimated monthly active audience: {formatNumber(data.estimate_mau)}.
              Backed by Meta's modeling — actual delivery varies with creative
              quality, learning phase, and auction dynamics.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
