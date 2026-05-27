import { useEffect, useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CircleDollarSign,
  Goal,
  Info,
  Percent,
  Target,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BIDDING_FOCUS_OPTIONS, type StepProps } from "./types";
import { useGoogleAdsConversionActions } from "../../hooks/useGoogleAdsManager";
import type {
  BidStrategy,
  BiddingFocus,
  BudgetType,
} from "../../API/googleAdsManagerApi";

function FieldError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </div>
  );
}

// Map (focus + optional flag) to the on-the-wire bid strategy enum.
const resolveBidStrategy = (
  focus: BiddingFocus,
  setTargetCpa: boolean,
  setTargetRoas: boolean,
  setMaxCpc: boolean
): BidStrategy => {
  switch (focus) {
    case "CONVERSIONS":
      return setTargetCpa ? "TARGET_CPA" : "MAXIMIZE_CONVERSIONS";
    case "CONVERSION_VALUE":
      return setTargetRoas ? "TARGET_ROAS" : "MAXIMIZE_CONVERSION_VALUE";
    case "CLICKS":
      return setMaxCpc ? "MANUAL_CPC" : "MAXIMIZE_CLICKS";
    case "IMPRESSION_SHARE":
      return "TARGET_IMPRESSION_SHARE";
  }
};

export function Step3Bidding({ form, setForm, clientId, showAllErrors }: StepProps) {
  const { data: conversionActions, isLoading: loadingConversions } =
    useGoogleAdsConversionActions(form.customerId || null, clientId);

  // Re-derive bid strategy whenever the focus or sub-toggles change so the
  // outbound payload always matches the UI.
  useEffect(() => {
    const next = resolveBidStrategy(
      form.biddingFocus,
      form.setTargetCpa,
      form.setTargetRoas,
      form.setMaxCpc
    );
    if (next !== form.bidStrategy) {
      setForm((f) => ({ ...f, bidStrategy: next }));
    }
  }, [
    form.biddingFocus,
    form.setTargetCpa,
    form.setTargetRoas,
    form.setMaxCpc,
    form.bidStrategy,
    setForm,
  ]);

  const needsConversionAction =
    form.biddingFocus === "CONVERSIONS" ||
    form.biddingFocus === "CONVERSION_VALUE";

  const hasBudgetError = !!showAllErrors && form.budgetAmount <= 0;
  const hasConversionError =
    !!showAllErrors && needsConversionAction && !form.conversionActionId;

  const activeFocus = useMemo(
    () => BIDDING_FOCUS_OPTIONS.find((o) => o.value === form.biddingFocus),
    [form.biddingFocus]
  );

  return (
    <div className="space-y-6 w-full">
      {/* Bidding focus */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Goal className="w-5 h-5 text-slate-400 shrink-0" />
          What do you want to focus on?
        </div>
        <p className="text-xs text-slate-500">
          Google Ads optimizes bids automatically — pick the outcome you care
          about most.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BIDDING_FOCUS_OPTIONS.map((opt) => {
            const isSelected = form.biddingFocus === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, biddingFocus: opt.value }))
                }
                className={cn(
                  "text-left rounded-xl border p-4 transition-all",
                  isSelected
                    ? "border-2 border-[#1A73E8] bg-blue-50/30 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                )}
              >
                <div className="text-sm font-bold text-slate-900">
                  {opt.label}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {opt.hint}
                </p>
              </button>
            );
          })}
        </div>

        {/* Conditional bid sub-inputs */}
        {form.biddingFocus === "CONVERSIONS" && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={form.setTargetCpa}
                onCheckedChange={(c) =>
                  setForm((f) => ({ ...f, setTargetCpa: !!c }))
                }
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900">
                  Set a target cost per action (Target CPA)
                </div>
                <p className="text-[11px] text-slate-500">
                  Google aims for this average cost per conversion.
                </p>
              </div>
            </label>
            {form.setTargetCpa && (
              <div className="pl-7 flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500">$</span>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.targetCpa || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      targetCpa: Number(e.target.value) || 0,
                    }))
                  }
                  placeholder="10.00"
                  className="h-10 rounded-lg border-slate-200 bg-white w-32"
                />
                <span className="text-xs text-slate-500">USD</span>
              </div>
            )}
          </div>
        )}

        {form.biddingFocus === "CONVERSION_VALUE" && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={form.setTargetRoas}
                onCheckedChange={(c) =>
                  setForm((f) => ({ ...f, setTargetRoas: !!c }))
                }
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900">
                  Set a target return on ad spend (Target ROAS)
                </div>
                <p className="text-[11px] text-slate-500">
                  e.g. 400% means $4 in revenue for every $1 spent.
                </p>
              </div>
            </label>
            {form.setTargetRoas && (
              <div className="pl-7 flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  step={10}
                  value={form.targetRoasPercent || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      targetRoasPercent: Number(e.target.value) || 0,
                    }))
                  }
                  placeholder="400"
                  className="h-10 rounded-lg border-slate-200 bg-white w-32"
                />
                <span className="text-xs text-slate-500">% target ROAS</span>
              </div>
            )}
          </div>
        )}

        {form.biddingFocus === "CLICKS" && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={form.setMaxCpc}
                onCheckedChange={(c) =>
                  setForm((f) => ({ ...f, setMaxCpc: !!c }))
                }
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900">
                  Set a maximum CPC bid limit
                </div>
                <p className="text-[11px] text-slate-500">
                  Cap on how much you'll pay per click.
                </p>
              </div>
            </label>
            {form.setMaxCpc && (
              <div className="pl-7 flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500">$</span>
                <Input
                  type="number"
                  min={0}
                  step={0.05}
                  value={form.maxCpc || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxCpc: Number(e.target.value) || 0,
                    }))
                  }
                  placeholder="2.50"
                  className="h-10 rounded-lg border-slate-200 bg-white w-32"
                />
                <span className="text-xs text-slate-500">USD per click</span>
              </div>
            )}
          </div>
        )}

        {form.biddingFocus === "IMPRESSION_SHARE" && (
          <div className="pt-3 border-t border-slate-100 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Where do you want your ads to appear?
              </label>
              <Select
                value={form.targetImpressionShareLocation}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    targetImpressionShareLocation: v as any,
                  }))
                }
              >
                <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white w-full sm:w-[320px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANYWHERE">Anywhere on the results page</SelectItem>
                  <SelectItem value="TOP">Top of the results page</SelectItem>
                  <SelectItem value="ABSOLUTE_TOP">Absolute top of the results page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Target impression share (%)
                </label>
                <div className="flex items-center bg-white rounded-lg border border-slate-200 px-3 h-10 w-32 focus-within:ring-2 focus-within:ring-[#1A73E8]/40">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={form.targetImpressionSharePercent}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        targetImpressionSharePercent: Math.min(100, Math.max(1, Number(e.target.value) || 70)),
                      }))
                    }
                    className="p-0 border-0 bg-transparent focus-visible:ring-0 text-sm font-semibold w-full text-right"
                  />
                  <Percent className="w-3.5 h-3.5 text-slate-400 ml-1.5 shrink-0" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Maximum CPC bid limit
                </label>
                <div className="flex items-center bg-white rounded-lg border border-slate-200 px-3 h-10 w-36 focus-within:ring-2 focus-within:ring-[#1A73E8]/40">
                  <span className="text-sm font-semibold text-slate-400 mr-1">$</span>
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    value={form.targetImpressionShareMaxCpc || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        targetImpressionShareMaxCpc: Number(e.target.value) || 0,
                      }))
                    }
                    placeholder="5.00"
                    className="p-0 border-0 bg-transparent focus-visible:ring-0 text-sm font-semibold w-full text-right"
                  />
                  <span className="text-xs text-slate-400 ml-1">USD</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeFocus && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">Bid strategy: </span>
              {form.bidStrategy.replace(/_/g, " ").toLowerCase()}
            </p>
          </div>
        )}
      </div>

      {/* Conversion action picker */}
      {needsConversionAction && (
        <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Target className="w-5 h-5 text-slate-400 shrink-0" />
            Conversion action
          </div>
          <p className="text-xs text-slate-500">
            Which conversion should Google optimize for? Set up new conversions
            from your Google Ads account.
          </p>
          {loadingConversions ? (
            <Skeleton className="h-11 rounded-xl" />
          ) : (conversionActions?.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              No conversion actions found on this Google Ads account. Create one
              in Google Ads first, or switch the bidding focus to Clicks /
              Impression Share.
            </div>
          ) : (
            <Select
              value={form.conversionActionId}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, conversionActionId: v }))
              }
            >
              <SelectTrigger
                className={cn(
                  "h-11 rounded-xl border-slate-200 bg-white",
                  hasConversionError && "border-rose-400"
                )}
              >
                <SelectValue placeholder="Select a conversion action" />
              </SelectTrigger>
              <SelectContent>
                {conversionActions!.map((ca) => (
                  <SelectItem key={ca.id} value={ca.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">{ca.name}</span>
                      {ca.category && (
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                          {ca.category}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {hasConversionError && (
            <FieldError message="Please pick a conversion action." />
          )}
        </div>
      )}

      {/* Customer Acquisition */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <UserPlus className="w-5 h-5 text-slate-400 shrink-0" />
          Customer acquisition
        </div>
        <p className="text-xs text-slate-500">
          Optimize your bidding strategy to help acquire new customers instead of just driving conversions from existing ones.
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={form.customerAcquisition}
            onCheckedChange={(c) =>
              setForm((f) => ({ ...f, customerAcquisition: !!c }))
            }
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">
              Adjust your bidding to help acquire new customers
            </div>
            <p className="text-[11px] text-slate-500">
              Instruct Google Ads to prioritize showing ads to new customers.
            </p>
          </div>
        </label>

        {form.customerAcquisition && (
          <div className="pl-7 pt-2 space-y-2 border-t border-slate-100/50 mt-3">
            {[
              {
                v: false,
                l: "Bid higher for new customers than for existing customers (Recommended)",
                h: "Keeps driving conversions from existing clients but allocates higher bid weight to new prospects.",
              },
              {
                v: true,
                l: "Bid only for new customers",
                h: "Restricts this campaign's ads strictly to users who have not purchased from you before.",
              },
            ].map((opt) => (
              <label
                key={opt.v ? "only" : "higher"}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all",
                  form.acquisitionOptimizeNew === opt.v
                    ? "border-[#1A73E8] bg-blue-50/20"
                    : "border-slate-200 bg-white hover:bg-slate-50/50"
                )}
              >
                <input
                  type="radio"
                  name="acquisitionOptimizeNew"
                  checked={form.acquisitionOptimizeNew === opt.v}
                  onChange={() =>
                    setForm((f) => ({ ...f, acquisitionOptimizeNew: opt.v }))
                  }
                  className="w-4 h-4 mt-0.5 accent-[#1A73E8]"
                />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-800">
                    {opt.l}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {opt.h}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Budget */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <CircleDollarSign className="w-5 h-5 text-slate-400 shrink-0" />
          Budget
        </div>
        <p className="text-xs text-slate-500">
          Some days you may spend up to 2× your daily budget — Google evens it
          out across the month.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Budget type
            </label>
            <Select
              value={form.budgetType}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, budgetType: v as BudgetType }))
              }
            >
              <SelectTrigger className="h-11 w-full sm:w-[180px] rounded-xl border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily budget</SelectItem>
                <SelectItem value="TOTAL">Campaign total</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Amount
            </label>
            <div
              className={cn(
                "flex items-center bg-white rounded-xl border border-slate-200 px-3 h-11 focus-within:ring-2 focus-within:ring-[#1A73E8]/40",
                hasBudgetError && "border-rose-400"
              )}
            >
              <span className="text-sm font-semibold text-slate-500 mr-1.5">
                $
              </span>
              <Input
                type="number"
                min={0}
                step={0.5}
                value={form.budgetAmount}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    budgetAmount: Number(e.target.value) || 0,
                  }))
                }
                className="p-0 border-0 bg-transparent focus-visible:ring-0 text-sm font-bold text-slate-900 w-full"
              />
              <span className="text-xs font-semibold text-slate-400 ml-2">
                USD
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {form.budgetType === "DAILY" ? (
              <>
                You'll spend about{" "}
                <span className="font-bold text-slate-900">
                  ${form.budgetAmount.toFixed(2)}
                </span>{" "}
                per day —{" "}
                <span className="font-bold text-slate-900">
                  ${(form.budgetAmount * 30.4).toFixed(2)}
                </span>{" "}
                per month on average.
              </>
            ) : (
              <>
                Total campaign spend capped at{" "}
                <span className="font-bold text-slate-900">
                  ${form.budgetAmount.toFixed(2)}
                </span>
                .
              </>
            )}
          </div>
        </div>

        {hasBudgetError && (
          <FieldError message="Budget must be greater than 0." />
        )}
      </div>
    </div>
  );
}
