import React from "react";
import type { SubscriptionUsage } from "@/types/subscription.types";

interface UsageBarItemProps {
  label: string;
  used: number;
  limit: number;
}

const UsageBarItem: React.FC<UsageBarItemProps> = ({ label, used, limit }) => {
  // Treat as unlimited if limit is -1 OR if the API explicitly says unlimited
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);

  const barColor =
    pct >= 90
      ? "bg-[#EA4335]"
      : pct >= 70
      ? "bg-[#FBBC05]"
      : "bg-[#4285F4]";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-[#111]">{label}</span>
        {isUnlimited ? (
          <span className="text-[#34A853] font-bold text-xs">Unlimited</span>
        ) : (
          <span className="text-[#666] tabular-nums">
            {used.toLocaleString()} / {limit.toLocaleString()}
          </span>
        )}
      </div>
      <div className="h-2 rounded-full bg-[#f0f0f0] overflow-hidden">
        {isUnlimited ? (
          <div className="h-full w-full bg-[#34A853] rounded-full" />
        ) : (
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      {!isUnlimited && (
        <p className="text-xs text-[#999] text-right">
          {(limit - used).toLocaleString()} remaining
        </p>
      )}
    </div>
  );
};

interface UsageBarsProps {
  usage: SubscriptionUsage;
  className?: string;
}

export const UsageBars: React.FC<UsageBarsProps> = ({ usage, className = "" }) => {
  return (
    <div className={`space-y-5 ${className}`}>
      <UsageBarItem label="Clients" used={usage.clients.used} limit={usage.clients.limit} />
      <UsageBarItem label="Integrations" used={usage.integrations.used} limit={usage.integrations.limit} />
      <UsageBarItem label="Reports" used={usage.reports.used} limit={usage.reports.limit} />
    </div>
  );
};
