import type { ComponentType } from "react";
import {
  ShoppingBag,
  Filter,
  MousePointer,
  Megaphone,
  Store,
  Settings2,
  Search as SearchIcon,
  LayoutGrid,
  Sparkles,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CAMPAIGN_TYPE_OPTIONS,
  OBJECTIVE_OPTIONS,
  OBJECTIVE_RECOMMENDED_TYPES,
  type StepProps,
} from "./types";
import type {
  GoogleAdsCampaignType,
  GoogleAdsObjective,
} from "../../API/googleAdsManagerApi";

const OBJECTIVE_META: Record<
  GoogleAdsObjective,
  { icon: ComponentType<{ className?: string }>; tagline: string }
> = {
  SALES: { icon: ShoppingBag, tagline: "E-commerce, checkouts, ROAS" },
  LEADS: { icon: Filter, tagline: "Forms, calls, sign-ups" },
  WEBSITE_TRAFFIC: { icon: MousePointer, tagline: "Drive qualified clicks" },
  BRAND_AWARENESS: { icon: Megaphone, tagline: "Reach & frequency at scale" },
  LOCAL_STORE_VISITS: { icon: Store, tagline: "Foot traffic to locations" },
  NO_GUIDANCE: { icon: Settings2, tagline: "Skip recommendations" },
};

const TYPE_META: Record<
  GoogleAdsCampaignType,
  { icon: ComponentType<{ className?: string }>; bullets: string[] }
> = {
  SEARCH: {
    icon: SearchIcon,
    bullets: [
      "Text ads on Google Search",
      "Bid on intent-rich keywords",
      "Pay per click",
    ],
  },
  DISPLAY: {
    icon: LayoutGrid,
    bullets: [
      "Image & responsive ads",
      "3M+ sites and apps",
      "Reach prospects browsing",
    ],
  },
  PERFORMANCE_MAX: {
    icon: Sparkles,
    bullets: [
      "All Google networks at once",
      "Google AI optimizes mix",
      "Single, automated campaign",
    ],
  },
};

function FieldError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </div>
  );
}

export function Step1Objective({ form, setForm, showAllErrors }: StepProps) {
  const hasObjectiveError = !!showAllErrors && !form.objective;
  const hasTypeError = !!showAllErrors && !form.campaignType;
  const recommended = OBJECTIVE_RECOMMENDED_TYPES[form.objective] ?? [];

  return (
    <div className="space-y-6 w-full">
      {/* Objective Cards */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Choose your objective
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Google Ads will tailor recommendations based on what you select.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OBJECTIVE_OPTIONS.map((opt) => {
            const meta = OBJECTIVE_META[opt.value];
            const Icon = meta.icon;
            const isSelected = form.objective === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, objective: opt.value }))
                }
                className={cn(
                  "relative text-left rounded-xl border p-4 transition-all",
                  isSelected
                    ? "border-2 border-[#1A73E8] bg-blue-50/30 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                )}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1A73E8] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-all",
                    isSelected
                      ? "bg-[#1A73E8] text-white"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {opt.label}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {opt.hint}
                </p>
                <p className="text-[10px] text-slate-400 mt-2 font-semibold uppercase tracking-wider">
                  {meta.tagline}
                </p>
              </button>
            );
          })}
        </div>
        {hasObjectiveError && (
          <FieldError message="Please choose an objective." />
        )}
      </div>

      {/* Campaign Type Cards */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Select a campaign type
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Different types fit different goals — Search for intent, Display
              for reach, Performance Max when you want Google AI to mix
              everything.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CAMPAIGN_TYPE_OPTIONS.map((opt) => {
            const meta = TYPE_META[opt.value];
            const Icon = meta.icon;
            const isSelected = form.campaignType === opt.value;
            const isRecommended = recommended.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, campaignType: opt.value }))
                }
                className={cn(
                  "relative text-left rounded-xl border p-5 transition-all",
                  isSelected
                    ? "border-2 border-[#1A73E8] bg-blue-50/30 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                )}
              >
                {isRecommended && !isSelected && (
                  <span className="absolute -top-2 left-4 inline-flex items-center text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    Recommended
                  </span>
                )}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#1A73E8] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all",
                    isSelected
                      ? "bg-[#1A73E8] text-white"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-base font-black text-slate-900">
                  {opt.label}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {opt.hint}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {meta.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-1.5 text-[11px] text-slate-600"
                    >
                      <Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
        {hasTypeError && (
          <FieldError message="Please pick a campaign type." />
        )}
      </div>
    </div>
  );
}
