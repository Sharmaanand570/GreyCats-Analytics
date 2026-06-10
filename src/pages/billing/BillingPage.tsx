import { useState } from "react";
import { useSubscriptionQuery } from "@/hooks/subscription/useSubscriptionQuery";
import { useCancelSubscriptionMutation } from "@/hooks/subscription/useCancelSubscriptionMutation";
import { UsageBars } from "@/components/subscription/UsageBars";
import { PlanBadge } from "@/components/subscription/PlanBadge";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import {
  Loader2,
  Calendar,
  AlertTriangle,
  CreditCard,
  Sparkles,
  X,
  ArrowRight,
  ArrowLeft,
  Ban,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BillingPage() {
  const { data, isLoading, isError } = useSubscriptionQuery();
  const cancelMutation = useCancelSubscriptionMutation();
  const navigate = useNavigate();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#4285F4]" />
          <p className="text-sm text-[#666]">Loading billing info…</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-white px-4">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-[#EA4335] mx-auto" />
          <p className="text-[#111] font-medium">Failed to load billing information.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-[#4285F4] underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { plan, usage } = data;
  const isTrial = plan.planName.toLowerCase() === "trial";
  const isFree =
    plan.planName.toLowerCase() === "free" ||
    plan.planName.toLowerCase() === "trial";

  // Read cancellation state from the query cache (written by cancel mutation)
  const isCancelled = plan.status === "cancelled";
  const accessUntil = plan.accessUntil;

  const handleCancelConfirm = () => {
    cancelMutation.mutate(undefined, {
      onSuccess: () => setShowCancelConfirm(false),
      onError: () => setShowCancelConfirm(false), // always close so user isn't stuck
    });
  };

  return (
    <div className="min-h-[100dvh] bg-white text-[#111] font-sans">
      {/* Page Header */}
      <div className={`px-6 py-10 ${isCancelled ? "bg-[#333]" : "bg-[#111]"}`}>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
        </div>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest font-bold">
              <CreditCard className="w-4 h-4" />
              Billing &amp; Subscription
            </div>
            <h1 className="text-2xl font-medium text-white tracking-tight">
              {plan.displayName} Plan
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <PlanBadge planName={plan.planName} displayName={plan.displayName} />
              {isCancelled && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EA4335]/20 border border-[#EA4335]/40 text-[#EA4335] text-xs font-bold">
                  <Ban className="w-3 h-3" />
                  Cancellation Scheduled
                </span>
              )}
            </div>
          </div>
          {!isCancelled && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-2 self-start sm:self-center px-5 py-2.5 bg-[#4285F4] text-white font-semibold rounded-full text-sm hover:bg-[#3367D6] transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Cancellation Scheduled Banner — persisted via React Query cache */}
        {isCancelled && (
          <div className="bg-[#EA4335]/8 border border-[#EA4335]/20 rounded-3xl p-6 flex items-start gap-4">
            <div className="p-2 rounded-full bg-[#EA4335]/10 flex-shrink-0 mt-0.5">
              <Ban className="w-5 h-5 text-[#EA4335]" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-[#EA4335] text-sm uppercase tracking-wide">
                Cancellation Scheduled
              </p>
              <p className="text-sm text-[#555] leading-relaxed">
                Your <span className="font-semibold text-[#111]">{plan.displayName}</span> plan is still active
                {accessUntil ? (
                  <> until <span className="font-semibold text-[#111]">{formatDate(accessUntil)}</span></>
                ) : (
                  " until the end of your billing period"
                )}. After that, you'll be moved to the Free plan.
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#4285F4] hover:underline"
              >
                <Sparkles className="w-3 h-3" />
                Changed your mind? Upgrade to keep access
              </button>
            </div>
          </div>
        )}

        {/* Plan Status Card */}
        <div className="bg-white rounded-3xl border border-[#e5e5e5] overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#999] uppercase tracking-widest">
              <CreditCard className="w-4 h-4" />
              Plan Status
            </div>
            {isCancelled ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EA4335]/10 text-[#EA4335] text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335] inline-block" />
                Cancels {accessUntil ? formatDate(accessUntil) : "at period end"}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34A853]/10 text-[#34A853] text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34A853] inline-block" />
                Active
              </span>
            )}
          </div>

          {(plan.startDate || plan.expiryDate) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#e5e5e5]">
              {plan.startDate && (
                <div className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#999] uppercase tracking-widest mb-2">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </div>
                  <p className="text-xl font-semibold text-[#111]">{formatDate(plan.startDate)}</p>
                </div>
              )}
              {plan.expiryDate && (
                <div className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#999] uppercase tracking-widest mb-2">
                    <Calendar className="w-4 h-4" />
                    {isTrial ? "Trial Expires" : isCancelled ? "Access Until" : "Renewal Date"}
                  </div>
                  <p className="text-xl font-semibold text-[#111]">{formatDate(plan.expiryDate)}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="px-8 py-6">
              <p className="text-xs font-bold text-[#999] uppercase tracking-widest mb-4">Plan Includes</p>
              <div className="flex flex-wrap gap-2">
                {plan.features.pdfExport && <span className="px-3 py-1 rounded-full bg-[#f5f5f5] text-[#111] text-xs font-semibold">PDF Export</span>}
                {plan.features.alerts && <span className="px-3 py-1 rounded-full bg-[#f5f5f5] text-[#111] text-xs font-semibold">Alerts</span>}
                {plan.features.scheduledReports && <span className="px-3 py-1 rounded-full bg-[#f5f5f5] text-[#111] text-xs font-semibold">Scheduled Reports</span>}
                {plan.features.api && <span className="px-3 py-1 rounded-full bg-[#f5f5f5] text-[#111] text-xs font-semibold">API Access</span>}
                {plan.features.whiteLabel && <span className="px-3 py-1 rounded-full bg-[#f5f5f5] text-[#111] text-xs font-semibold">White Label</span>}
                {!plan.features.pdfExport && !plan.features.alerts && (
                  <span className="text-sm text-[#999]">Basic plan — upgrade for more features</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Usage */}
        <div className="bg-white rounded-3xl border border-[#e5e5e5] p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-[#111] uppercase tracking-widest">Usage</h3>
            <button
              onClick={() => navigate("/pricing")}
              className="flex items-center gap-1.5 text-sm text-[#4285F4] hover:underline font-semibold"
            >
              View plans <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <UsageBars usage={usage} />
        </div>

        {/* Cancel — only when paid + not already cancelled */}
        {!isFree && !isCancelled && (
          <div className="bg-white rounded-3xl border border-[#e5e5e5] p-8">
            <h3 className="text-xs font-bold text-[#EA4335] uppercase tracking-widest mb-1">
              Cancel Subscription
            </h3>
            <p className="text-sm text-[#666] mb-5">
              Your plan stays active until the end of the billing period. Your data remains intact.
            </p>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-5 py-2.5 rounded-full border border-[#e5e5e5] text-[#EA4335] text-sm font-semibold hover:border-[#EA4335] transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlanName={plan.planName}
      />

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCancelConfirm(false)}
          />
          <div className="relative z-10 bg-white rounded-3xl border border-[#e5e5e5] shadow-2xl p-8 max-w-md w-full">
            <button
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#f5f5f5] text-[#999]"
              onClick={() => setShowCancelConfirm(false)}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-red-50">
                <AlertTriangle className="w-7 h-7 text-[#EA4335]" />
              </div>
              <h3 className="text-xl font-bold text-[#111]">Cancel Subscription?</h3>
              <p className="text-sm text-[#666] leading-relaxed">
                Your plan will remain active until the end of the billing period. After that, you'll be moved to the free tier.
              </p>
              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#e5e5e5] text-sm font-semibold text-[#666] hover:border-[#111] hover:text-[#111] transition-colors"
                >
                  Keep Plan
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={cancelMutation.isPending}
                  className="flex-1 py-2.5 rounded-full bg-[#EA4335] text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {cancelMutation.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
