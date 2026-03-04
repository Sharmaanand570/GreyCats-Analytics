import React from "react";

const planStyles: Record<string, { bg: string; text: string; label: string }> = {
  trial: {
    bg: "bg-[#FBBC05]/10 border border-[#FBBC05]/30",
    text: "text-[#b8651a]",
    label: "Free Trial",
  },
  free: {
    bg: "bg-[#f5f5f5] border border-[#e5e5e5]",
    text: "text-[#666]",
    label: "Free",
  },
  starter: {
    bg: "bg-[#4285F4]/10 border border-[#4285F4]/20",
    text: "text-[#1e40af]",
    label: "Starter",
  },
  pro: {
    bg: "bg-[#111] border border-[#111]",
    text: "text-white",
    label: "Pro",
  },
  agency: {
    bg: "bg-[#EA4335]/10 border border-[#EA4335]/20",
    text: "text-[#EA4335]",
    label: "Agency",
  },
  enterprise: {
    bg: "bg-[#34A853]/10 border border-[#34A853]/20",
    text: "text-[#34A853]",
    label: "Enterprise",
  },
};

interface PlanBadgeProps {
  planName: string;
  displayName?: string;
  size?: "sm" | "md";
  className?: string;
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({
  planName,
  displayName,
  size = "md",
  className = "",
}) => {
  const key = planName?.toLowerCase() ?? "free";
  const style = planStyles[key] ?? {
    bg: "bg-[#f5f5f5] border border-[#e5e5e5]",
    text: "text-[#666]",
    label: displayName ?? planName,
  };

  const sizeClass =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${sizeClass} ${style.bg} ${style.text} ${className}`}
    >
      {displayName ?? style.label}
    </span>
  );
};
