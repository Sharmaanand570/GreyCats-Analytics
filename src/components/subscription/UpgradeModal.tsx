import React from "react";
import { useNavigate } from "react-router-dom";
import type { Plan } from "@/types/subscription.types";
import { X, Loader2, Sparkles } from "lucide-react";
import { PricingCard } from "./PricingCard";
import { usePlansQuery } from "@/hooks/subscription/usePlansQuery";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanName?: string;
  reason?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentPlanName,
  reason,
}) => {
  const navigate = useNavigate();
  const { data: plans, isLoading: plansLoading } = usePlansQuery();

  if (!isOpen) return null;

  const paidPlans = plans?.filter(
    (p) =>
      p.price > 0 &&
      p.name.toLowerCase() !== "enterprise" &&
      p.name.toLowerCase() !== currentPlanName?.toLowerCase()
  );

  const handleSelectPlan = (plan: Plan) => {
    navigate(`/checkout?planId=${plan.id}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-[#e5e5e5]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[#e5e5e5] bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#4285F4]/10">
              <Sparkles className="w-5 h-5 text-[#4285F4]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111] tracking-tight">
                Upgrade Your Plan
              </h2>
              {reason && (
                <p className="text-sm text-[#FBBC05] font-medium mt-0.5">
                  {reason}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f5f5f5] transition-colors text-[#999]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {plansLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#4285F4]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
              {paidPlans?.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  onSelectPlan={handleSelectPlan}
                  loading={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
