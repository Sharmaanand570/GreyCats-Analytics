import React from "react";
import type { Plan } from "@/types/subscription.types";
import { CheckCircle2, XCircle } from "lucide-react";

interface PricingTableProps {
  plans: Plan[];
}

interface FeatureRow {
  label: string;
  getValue: (plan: Plan) => string | boolean;
}

const featureRows: FeatureRow[] = [
  {
    label: "Clients",
    getValue: (p) =>
      p.limits.maxClients === -1 ? "Unlimited" : p.limits.maxClients.toString(),
  },
  {
    label: "Integrations",
    getValue: (p) =>
      p.limits.maxIntegrations === -1 ? "Unlimited" : p.limits.maxIntegrations.toString(),
  },
  {
    label: "Reports",
    getValue: (p) =>
      p.limits.maxReports === -1 ? "Unlimited" : p.limits.maxReports.toString(),
  },
  { label: "PDF Export", getValue: (p) => p.features.pdfExport },
  { label: "Alerts", getValue: (p) => p.features.alerts },
  { label: "Scheduled Reports", getValue: (p) => p.features.scheduledReports },
  { label: "API Access", getValue: (p) => p.features.api },
];

const Cell: React.FC<{ value: string | boolean; isPopular?: boolean }> = ({
  value,
  isPopular,
}) => {
  if (typeof value === "boolean") {
    return value ? (
      <CheckCircle2 className="w-5 h-5 text-[#34A853] mx-auto" />
    ) : (
      <XCircle className="w-5 h-5 text-[#e5e5e5] mx-auto" />
    );
  }
  return (
    <span className={`text-sm font-medium ${isPopular ? "text-white" : "text-[#333]"}`}>
      {value === "Unlimited" ? (
        <span className={isPopular ? "text-[#4285F4]" : "text-[#34A853]"}>
          ∞ Unlimited
        </span>
      ) : (
        value
      )}
    </span>
  );
};

export const PricingTable: React.FC<PricingTableProps> = ({ plans }) => {
  return (
    <div className="overflow-x-auto rounded-3xl border border-[#e5e5e5] shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e5e5e5]">
            <th className="text-left py-4 px-5 font-bold text-[#999] uppercase tracking-widest text-xs bg-[#fafafa] w-44 min-w-[11rem]">
              Feature
            </th>
            {plans.map((plan) => {
              const isPopular = plan.name.toLowerCase() === "pro";
              return (
                <th
                  key={plan.id}
                  className={`py-4 px-4 text-center font-bold text-sm ${
                    isPopular
                      ? "bg-[#111] text-white"
                      : "bg-[#fafafa] text-[#111]"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div>{plan.displayName}</div>
                    <div
                      className={`text-xs font-normal ${
                        isPopular ? "text-white/50" : "text-[#999]"
                      }`}
                    >
                      {plan.price === 0
                        ? "Free"
                        : `₹${plan.price.toLocaleString("en-IN")}/mo`}
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {featureRows.map((row, idx) => (
            <tr
              key={row.label}
              className={`border-b border-[#e5e5e5] last:border-0 ${
                idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]/50"
              }`}
            >
              <td className="py-3.5 px-5 font-medium text-[#666]">
                {row.label}
              </td>
              {plans.map((plan) => {
                const isPopular = plan.name.toLowerCase() === "pro";
                return (
                  <td
                    key={plan.id}
                    className={`py-3.5 px-4 text-center ${
                      isPopular ? "bg-[#111]/5" : ""
                    }`}
                  >
                    <Cell value={row.getValue(plan)} isPopular={isPopular} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
