import React from "react"; // needed for JSX in this project
import type { Plan } from "@/types/subscription.types";
import {
  CheckCircle2,
  XCircle,
  Zap,
  Star,
  Building2,
  ArrowRight,
} from "lucide-react";

interface PricingCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  onSelectPlan?: (plan: Plan) => void;
  loading?: boolean;
}

const formatPrice = (price: number) => {
  if (price === 0) return "Free";
  // plan.price from API is already in RUPEES (e.g. 2499 = ₹2,499)
  return `₹${price.toLocaleString("en-IN")}`;
};

const formatLimit = (val: number) =>
  val === -1 ? "Unlimited" : val.toLocaleString();

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isCurrentPlan,
  onSelectPlan,
  loading,
}) => {
  const isMostPopular = plan.name.toLowerCase() === "pro";
  const isEnterprise = plan.name.toLowerCase() === "enterprise";
  const isTrial = plan.name.toLowerCase() === "trial";
  const isFree = plan.price === 0 && !isTrial;

  const priceFormatted = formatPrice(plan.price);
  const intervalLabel =
    plan.interval === "trial"
      ? `${plan.limits.trialDays ?? 15}-day trial`
      : plan.interval === "monthly"
      ? "/ month"
      : plan.interval;

  // Most Popular → black card (matches LandingPage's #111 CTA block)
  const cardBase =
    "relative flex flex-col rounded-3xl border transition-all duration-300";
  const cardVariant = isMostPopular
    ? "border-[#111] shadow-2xl shadow-black/10 bg-[#111] text-white scale-[1.03]"
    : "border-[#e5e5e5] bg-white hover:shadow-lg hover:border-[#bdbdbd]";

  const features = [
    { label: `${formatLimit(plan.limits.maxClients)} Clients`, enabled: true },
    {
      label: `${formatLimit(plan.limits.maxIntegrations)} Integrations`,
      enabled: true,
    },
    {
      label: `${formatLimit(plan.limits.maxReports)} Reports`,
      enabled: true,
    },
    { label: "PDF Export", enabled: plan.features.pdfExport },
    { label: "Alerts", enabled: plan.features.alerts },
    { label: "Scheduled Reports", enabled: plan.features.scheduledReports },
    { label: "API Access", enabled: plan.features.api },
  ];

  return (
    <div className={`${cardBase} ${cardVariant} p-6 gap-5`}>
      {/* Most Popular Badge */}
      {isMostPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1.5 bg-[#4285F4] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
            <Star className="w-3 h-3 fill-current" />
            Most Popular
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="space-y-1 mt-2">
        <div className="flex items-center gap-2">
          {isTrial && <Zap className="w-4 h-4 text-[#FBBC05]" />}
          {isMostPopular && <Star className="w-4 h-4 text-[#4285F4]" />}
          {isEnterprise && <Building2 className="w-4 h-4 text-[#34A853]" />}
          <h3
            className={`font-bold text-lg tracking-tight ${
              isMostPopular ? "text-white" : "text-[#111]"
            }`}
          >
            {plan.displayName}
          </h3>
        </div>
        <p
          className={`text-sm ${
            isMostPopular ? "text-white/60" : "text-[#666]"
          }`}
        >
          {plan.description}
        </p>
      </div>

      {/* Price */}
      <div className="space-y-0.5">
        {isEnterprise ? (
          <p className={`text-3xl font-extrabold ${isMostPopular ? "text-white" : "text-[#111]"}`}>
            Custom
          </p>
        ) : (
          <div className="flex items-end gap-1">
            <p
              className={`text-4xl font-extrabold ${
                isMostPopular ? "text-white" : "text-[#111]"
              }`}
            >
              {priceFormatted}
            </p>
            <span
              className={`text-sm mb-1.5 ${
                isMostPopular ? "text-white/50" : "text-[#999]"
              }`}
            >
              {intervalLabel}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className={`h-px ${isMostPopular ? "bg-white/10" : "bg-[#e5e5e5]"}`} />

      {/* Features */}
      <ul className="space-y-2.5 flex-grow">
        {features.map((f) => (
          <li key={f.label} className="flex items-center gap-2.5">
            {f.enabled ? (
              <CheckCircle2
                className={`w-4 h-4 flex-shrink-0 ${
                  isMostPopular ? "text-[#4285F4]" : "text-[#34A853]"
                }`}
              />
            ) : (
              <XCircle
                className={`w-4 h-4 flex-shrink-0 ${
                  isMostPopular ? "text-white/20" : "text-[#e5e5e5]"
                }`}
              />
            )}
            <span
              className={`text-sm ${
                f.enabled
                  ? isMostPopular
                    ? "text-white/90"
                    : "text-[#333]"
                  : isMostPopular
                  ? "text-white/30"
                  : "text-[#ccc] line-through"
              }`}
            >
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => !isEnterprise && onSelectPlan?.(plan)}
        disabled={isCurrentPlan || loading}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
          isCurrentPlan
            ? "bg-[#f0f0f0] text-[#999] cursor-not-allowed"
            : isEnterprise
            ? "bg-transparent border-2 border-[#34A853] text-[#34A853] hover:bg-[#34A853] hover:text-white"
            : isMostPopular
            ? "bg-[#4285F4] text-white hover:bg-[#3367D6] shadow-lg shadow-blue-500/20"
            : isTrial
            ? "bg-[#111] text-white hover:bg-[#333]"
            : "bg-[#111] text-white hover:bg-[#333]"
        }`}
      >
        {loading ? (
          <>
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full inline-block" />
            <span className="ml-1">Processing {plan.displayName}...</span>
          </>
        ) : isCurrentPlan ? (
          "Current Plan"
        ) : isEnterprise ? (
          <>Contact Sales</>
        ) : isFree || isTrial ? (
          <>
            Get Started <ArrowRight className="w-4 h-4" />
          </>
        ) : (
          <>
            Upgrade Now <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
