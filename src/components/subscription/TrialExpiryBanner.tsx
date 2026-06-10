import { useNavigate } from "react-router-dom";
import { useSubscriptionQuery } from "@/hooks/subscription/useSubscriptionQuery";
import { X, Zap } from "lucide-react";
import { useState } from "react";

function getDaysRemaining(expiryDate?: string): number | null {
  if (!expiryDate) return null;
  const diff = new Date(expiryDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Sticky top banner shown inside the app layout when:
 *  - User is on the "trial" plan
 *  - 7 or fewer days remain on the trial
 *
 * Urgency levels:
 *  ≤ 1 day  → red
 *  ≤ 3 days → amber
 *  ≤ 7 days → blue
 */
export function TrialExpiryBanner() {
  const { data } = useSubscriptionQuery();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const planName = data?.plan?.planName?.toLowerCase();
  if (planName !== "trial") return null;

  const days = getDaysRemaining(data?.plan?.expiryDate);
  if (days === null || days > 7) return null;

  const isExpired = days <= 0;
  const urgency =
    isExpired || days <= 1
      ? "red"
      : days <= 3
      ? "amber"
      : "blue";

  const bgClass =
    urgency === "red"
      ? "bg-[#EA4335]"
      : urgency === "amber"
      ? "bg-[#FBBC05]"
      : "bg-[#4285F4]";

  const txtClass =
    urgency === "amber" ? "text-[#111]" : "text-white";

  const message = isExpired
    ? "Your free trial has expired. Upgrade now to keep access."
    : days === 1
    ? "⚡ Your trial expires today. Upgrade now to avoid losing access."
    : `Your free trial expires in ${days} day${days > 1 ? "s" : ""}. Upgrade to keep full access.`;

  return (
    <div
      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium ${bgClass} ${txtClass}`}
    >
      <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0">
        <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
        <span className="text-xs sm:text-sm leading-snug pr-2">{message}</span>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate("/pricing")}
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            urgency === "amber"
              ? "border-[#111] text-[#111] hover:bg-[#111] hover:text-[#FBBC05]"
              : "border-white text-white hover:bg-white hover:text-[#111]"
          } transition-colors`}
        >
          Upgrade Now
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
