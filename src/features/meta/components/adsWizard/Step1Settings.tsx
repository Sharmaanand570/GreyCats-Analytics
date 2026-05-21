import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Wallet,
  Briefcase,
  Facebook as FacebookIcon,
  CheckCircle2,
  Target,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { RequiredMark } from "@/components/ui/required-mark";
import { FormSection } from "./FormSection";
import { useMetaAccounts } from "@/features/meta/hooks/useMetaData";
import { useMetaPixels } from "@/features/meta/hooks/useMetaAdsManager";
import {
  CONVERSION_EVENT_OPTIONS,
  OBJECTIVE_OPTIONS,
  SPECIAL_AD_CATEGORY_OPTIONS,
  type StepProps,
} from "./types";
import type {
  BudgetType,
  CampaignObjective,
  ConversionEvent,
} from "@/features/meta/API/metaAdsManagerApi";
import { cn } from "@/lib/utils";

type Props = StepProps & { clientId: number; showAllErrors?: boolean };

// Sanity caps — anything beyond these is almost certainly a typo (extra zero).
// The user can still publish; we just warn.
const DAILY_BUDGET_WARN = 1000;
const LIFETIME_BUDGET_WARN = 100000;

// Small shared component for inline field-level error messages
function FieldError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </div>
  );
}

export function Step1Settings({ form, setForm, clientId, showAllErrors }: Props) {
  const { data, isLoading } = useMetaAccounts(clientId);
  const isSalesObjective = form.objective === "OUTCOME_SALES";
  const { data: pixelsData, isLoading: isLoadingPixels } = useMetaPixels(
    isSalesObjective ? clientId : null
  );

  const adAccounts = useMemo(() => data?.adAccounts ?? [], [data]);
  const pages = useMemo(() => data?.pages ?? [], [data]);
  const pixels = useMemo(() => pixelsData?.pixels ?? [], [pixelsData]);

  const [touchedName, setTouchedName] = useState(false);
  const [touchedAccount, setTouchedAccount] = useState(false);
  const [touchedPage, setTouchedPage] = useState(false);
  const [touchedObjective, setTouchedObjective] = useState(false);
  const [touchedBudget, setTouchedBudget] = useState(false);
  const [touchedEndTime, setTouchedEndTime] = useState(false);
  const [touchedPixel, setTouchedPixel] = useState(false);
  const [touchedConversionEvent, setTouchedConversionEvent] = useState(false);

  // Parent flips this when the user clicks "Continue" with invalid input — we
  // mark every field touched so the red borders / FieldError banners appear.
  const showName = touchedName || !!showAllErrors;
  const showAccount = touchedAccount || !!showAllErrors;
  const showPage = touchedPage || !!showAllErrors;
  const showObjective = touchedObjective || !!showAllErrors;
  const showBudget = touchedBudget || !!showAllErrors;
  const showEndTime = touchedEndTime || !!showAllErrors;
  const showPixel = touchedPixel || !!showAllErrors;
  const showConversionEvent = touchedConversionEvent || !!showAllErrors;

  useEffect(() => {
    if (!form.accountId && adAccounts.length === 1) {
      setForm((f) => ({ ...f, accountId: adAccounts[0].accountId }));
    }
  }, [adAccounts, form.accountId, setForm]);

  useEffect(() => {
    if (!form.pageId && pages.length === 1) {
      setForm((f) => ({ ...f, pageId: pages[0].pageId }));
    }
  }, [pages, form.pageId, setForm]);

  useEffect(() => {
    if (!isSalesObjective) {
      if (form.pixelId || form.conversionEvent) {
        setForm((f) => ({ ...f, pixelId: "", conversionEvent: "" }));
      }
      return;
    }
    if (!form.pixelId && pixels.length === 1) {
      setForm((f) => ({ ...f, pixelId: pixels[0].id }));
    }
  }, [isSalesObjective, pixels, form.pixelId, form.conversionEvent, setForm]);

  const isSingleAccount = adAccounts.length === 1;
  const isSinglePage = pages.length === 1;

  const hasAccountError = showAccount && !form.accountId && adAccounts.length > 1;
  const hasPageError = showPage && !form.pageId && pages.length > 1;
  const hasObjectiveError = showObjective && !form.objective;
  const hasNameError = showName && !form.campaignName.trim();
  // Mirror canAdvance in MetaAdsWizardPage — budget must be >= 1 for the
  // wizard to proceed. Anything in (0, 1) used to silently block "Continue"
  // with no visible reason.
  const hasBudgetError =
    showBudget &&
    (form.budgetType === "DAILY"
      ? form.dailyBudget < 1
      : form.lifetimeBudget < 1);
  // Sanity warnings — non-blocking, but flag values that look like typos.
  const budgetWarning =
    form.budgetType === "DAILY" && form.dailyBudget > DAILY_BUDGET_WARN
      ? `That's $${form.dailyBudget.toFixed(2)} per day — double-check this isn't a typo.`
      : form.budgetType === "LIFETIME" && form.lifetimeBudget > LIFETIME_BUDGET_WARN
        ? `That's $${form.lifetimeBudget.toFixed(2)} total — double-check this isn't a typo.`
        : null;
  const hasEndTimeError =
    (showEndTime || showBudget) &&
    form.budgetType === "LIFETIME" &&
    !form.endTime;
  const endBeforeStart =
    form.startTime && form.endTime
      ? new Date(form.endTime) <= new Date(form.startTime)
      : false;
  const hasPixelError =
    showPixel && isSalesObjective && !form.pixelId && pixels.length > 0;
  const hasConversionEventError =
    showConversionEvent && isSalesObjective && !form.conversionEvent;

  // Cross-business compatibility check. Only warn when we have a confirmed
  // mismatch — if either side's businessId is null (personal/unknown owner),
  // we don't know, so we stay quiet rather than cry wolf.
  // Normalize `act_` prefix so accountIds from /clients/:id/meta/accounts
  // (which may or may not be prefixed) match form.accountId (which may or
  // may not be prefixed, depending on source).
  const normalizeActId = (id: string) => (id.startsWith("act_") ? id.slice(4) : id);
  const selectedAccount = adAccounts.find(
    (a) => normalizeActId(a.accountId) === normalizeActId(form.accountId)
  );
  const selectedPage = pages.find((p) => p.pageId === form.pageId);
  const crossBusiness =
    !!selectedAccount?.businessId &&
    !!selectedPage?.businessId &&
    selectedAccount.businessId !== selectedPage.businessId;

  return (
    <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden bg-white">
      <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Ad Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Choose where this ad will run and what to call the campaign.
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Fields marked <span className="text-rose-500 font-bold">*</span> are required.
        </p>
      </div>

      <div className="px-8 py-2 divide-y divide-slate-100">
        
        {/* Identity */}
        <FormSection title="Identity" description="Select the ad account and page to represent your business." icon={Briefcase}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              Meta Ad Account
              {adAccounts.length > 1 && <RequiredMark />}
            </label>
            {isLoading ? (
              <Skeleton className="h-11 rounded-xl" />
            ) : adAccounts.length === 0 ? (
              <div className="flex items-center justify-between gap-3 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  No ad accounts connected. Connect Meta to continue.
                </div>
                <Link
                  to={`/clients/${clientId}?tab=data-sources`}
                  className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
                >
                  Connect Meta
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : isSingleAccount ? (
              <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 flex items-center gap-2 cursor-not-allowed">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-slate-700">
                  {adAccounts[0].name}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-auto">
                  {adAccounts[0].accountId}
                </span>
              </div>
            ) : (
              <Select
                value={form.accountId}
                onValueChange={(v) => {
                  setTouchedAccount(true);
                  setForm((f) => ({ ...f, accountId: v }));
                }}
                disabled={isLoading}
              >
                <SelectTrigger
                  className={cn(
                    "h-11 rounded-xl border-slate-200 bg-white",
                    hasAccountError && "border-rose-400 focus:ring-rose-300"
                  )}
                  onBlur={() => setTouchedAccount(true)}
                >
                  <SelectValue placeholder="Select an ad account" />
                </SelectTrigger>
                <SelectContent>
                  {adAccounts.map((acc) => (
                    <SelectItem key={acc.accountId} value={acc.accountId}>
                      <div className="flex items-center justify-between w-[240px]">
                        <span className="font-semibold text-slate-900 truncate">
                          {acc.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">
                          {acc.accountId}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {hasAccountError && <FieldError message="Please select an ad account." />}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              Facebook Page
              {pages.length > 1 && <RequiredMark />}
            </label>
            {isLoading ? (
              <Skeleton className="h-11 rounded-xl" />
            ) : pages.length === 0 ? (
              <div className="flex items-center justify-between gap-3 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  No Facebook Page connected to this account.
                </div>
                <Link
                  to={`/clients/${clientId}?tab=data-sources`}
                  className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
                >
                  Connect Page
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : isSinglePage ? (
              <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 flex items-center gap-2 cursor-not-allowed">
                <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                <span className="text-sm font-semibold text-slate-700">
                  {pages[0].name}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-auto">
                  {pages[0].pageId}
                </span>
              </div>
            ) : (
              <Select
                value={form.pageId}
                onValueChange={(v) => {
                  setTouchedPage(true);
                  setForm((f) => ({ ...f, pageId: v }));
                }}
                disabled={isLoading}
              >
                <SelectTrigger
                  className={cn(
                    "h-11 rounded-xl border-slate-200 bg-white",
                    hasPageError && "border-rose-400 focus:ring-rose-300"
                  )}
                  onBlur={() => setTouchedPage(true)}
                >
                  <SelectValue placeholder="Select a Facebook Page" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((p) => (
                    <SelectItem key={p.pageId} value={p.pageId}>
                      <div className="flex items-center justify-between w-[240px]">
                        <span className="font-semibold text-slate-900 truncate">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">
                          {p.pageId}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {hasPageError && <FieldError message="Please select a Facebook Page." />}
          </div>

          {crossBusiness && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-amber-900">
                  Different Business Managers
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  <span className="font-semibold">{selectedAccount?.businessName ?? selectedAccount?.name}</span>
                  {" "}and{" "}
                  <span className="font-semibold">{selectedPage?.businessName ?? selectedPage?.name}</span>
                  {" "}belong to different Business Managers. Publish will fail unless the ad account has been granted access to advertise for this Page in{" "}
                  <a
                    href="https://business.facebook.com/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline hover:text-amber-900"
                  >
                    Business Settings
                  </a>
                  .
                </p>
              </div>
            </div>
          )}
        </FormSection>

        {/* Campaign Details */}
        <FormSection title="Campaign Details" description="Set your objective and name your campaign." icon={Target}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              Campaign Objective <RequiredMark />
            </label>
            <Select
              value={form.objective}
              onValueChange={(v) => {
                setTouchedObjective(true);
                setForm((f) => ({ ...f, objective: v as CampaignObjective }));
              }}
            >
              <SelectTrigger
                className={cn(
                  "h-12 rounded-xl border-slate-200 bg-white shadow-sm",
                  hasObjectiveError && "border-rose-400 focus:ring-rose-300"
                )}
                onBlur={() => setTouchedObjective(true)}
              >
                <SelectValue placeholder="What is your goal?" />
              </SelectTrigger>
              <SelectContent>
                {OBJECTIVE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="py-3">
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="font-bold text-sm text-slate-900">{opt.label}</span>
                      <span className="text-[11px] text-slate-500">{opt.hint}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasObjectiveError && <FieldError message="Campaign objective is required." />}
          </div>

          {isSalesObjective && (
            <div className="pl-4 ml-2 border-l-2 border-emerald-100 space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
                  Meta Pixel <RequiredMark />
                </label>
                {isLoadingPixels ? (
                  <Skeleton className="h-11 rounded-xl" />
                ) : pixels.length === 0 ? (
                  <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                    No Pixels found for this ad account. Create one in Meta Events Manager.
                  </div>
                ) : (
                  <Select
                    value={form.pixelId}
                    onValueChange={(v) => {
                      setTouchedPixel(true);
                      setForm((f) => ({ ...f, pixelId: v }));
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-11 rounded-xl border-slate-200 bg-white",
                        hasPixelError && "border-rose-400 focus:ring-rose-300"
                      )}
                      onBlur={() => setTouchedPixel(true)}
                    >
                      <SelectValue placeholder="Select a tracking pixel" />
                    </SelectTrigger>
                    <SelectContent>
                      {pixels.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex items-center justify-between w-[240px]">
                            <span className="font-semibold text-slate-900 truncate">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">
                              {p.id}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {hasPixelError && <FieldError message="Meta Pixel is required for Sales." />}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
                  Conversion Event <RequiredMark />
                </label>
                <Select
                  value={form.conversionEvent}
                  onValueChange={(v) => {
                    setTouchedConversionEvent(true);
                    setForm((f) => ({ ...f, conversionEvent: v as ConversionEvent }));
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "h-11 rounded-xl border-slate-200 bg-white",
                      hasConversionEventError && "border-rose-400 focus:ring-rose-300"
                    )}
                    onBlur={() => setTouchedConversionEvent(true)}
                  >
                    <SelectValue placeholder="What action to optimize for?" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONVERSION_EVENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="font-semibold text-slate-900">{opt.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasConversionEventError && (
                  <FieldError message="Conversion Event is required for Sales." />
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              Special Ad Categories
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SPECIAL_AD_CATEGORY_OPTIONS.map((opt) => {
                const isActive = form.specialAdCategory === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setForm((f) => ({
                        ...f,
                        specialAdCategory: isActive ? "NONE" : opt.value,
                      }));
                    }}
                    className={cn(
                      "flex flex-col items-start text-left px-4 py-3 rounded-xl border transition-all",
                      isActive
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <ShieldAlert className={cn("w-4 h-4", isActive ? "text-amber-400" : "text-amber-500")} />
                      {opt.label}
                    </div>
                    <div className={cn("text-[10px] mt-1", isActive ? "text-slate-300" : "text-slate-400")}>
                      {opt.hint}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400">
              Required by Meta if your ad is related to credit, employment, housing, or social
              issues.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
              Campaign Name <RequiredMark />
            </label>
            <Input
              value={form.campaignName}
              onChange={(e) => {
                setTouchedName(true);
                setForm((f) => ({ ...f, campaignName: e.target.value }));
              }}
              onBlur={() => setTouchedName(true)}
              placeholder="e.g. Summer Sale 2026"
              className={cn(
                "h-11 rounded-xl border-slate-200 bg-white",
                hasNameError && "border-rose-400 focus-visible:ring-rose-300"
              )}
            />
            {hasNameError && <FieldError message="Campaign name is required." />}
          </div>
        </FormSection>

        {/* Budget & Schedule */}
        <FormSection title="Budget & Schedule" description="How much you want to spend and when the ad should run." icon={Wallet}>
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              Budget <RequiredMark />
            </label>

            {/* Budget Type toggle */}
            <div className="grid grid-cols-2 gap-2">
              {(["DAILY", "LIFETIME"] as BudgetType[]).map((t) => {
                const isActive = form.budgetType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, budgetType: t }))}
                    className={cn(
                      "px-4 py-3 rounded-xl border text-left transition-all",
                      isActive
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="text-sm font-bold">
                      {t === "DAILY" ? "Daily Budget" : "Lifetime Budget"}
                    </div>
                    <div className={cn("text-[10px] mt-0.5", isActive ? "text-slate-300" : "text-slate-400")}>
                      {t === "DAILY"
                        ? "A fixed amount spent each day"
                        : "Total spend across the campaign duration"}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Budget Amount */}
            {form.budgetType === "DAILY" ? (
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={500}
                  step={0.5}
                  value={form.dailyBudget}
                  onChange={(e) => {
                    setTouchedBudget(true);
                    setForm((f) => ({ ...f, dailyBudget: Number(e.target.value) }));
                  }}
                  className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-900"
                />
                <div className="flex items-center bg-white rounded-xl border border-slate-200 px-3 py-2 min-w-[140px]">
                  <Input
                    type="number"
                    min={1}
                    step={0.5}
                    value={form.dailyBudget}
                    onChange={(e) => {
                      setTouchedBudget(true);
                      setForm((f) => ({ ...f, dailyBudget: Number(e.target.value) || 0 }));
                    }}
                    onBlur={() => setTouchedBudget(true)}
                    className="h-7 p-0 border-0 bg-transparent focus-visible:ring-0 text-sm font-bold text-slate-900"
                  />
                  <span className="text-xs text-slate-400 ml-2">/ day</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={form.lifetimeBudget}
                  onChange={(e) => {
                    setTouchedBudget(true);
                    setForm((f) => ({ ...f, lifetimeBudget: Number(e.target.value) || 0 }));
                  }}
                  onBlur={() => setTouchedBudget(true)}
                  placeholder="Total spend over the run"
                  className={cn(
                    "h-11 rounded-xl border-slate-200 bg-white",
                    hasBudgetError && "border-rose-400 focus-visible:ring-rose-300"
                  )}
                />
                <span className="text-xs text-slate-400">total</span>
              </div>
            )}
            {hasBudgetError && (
              <FieldError message="Budget must be at least 1 (in the ad account's currency)." />
            )}
            {!hasBudgetError && budgetWarning && (
              <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {budgetWarning}
              </div>
            )}

            <p className="text-xs text-slate-400">
              Billed in the ad account's currency (set on Facebook).
              {form.budgetType === "LIFETIME"
                ? " Lifetime budget requires an end date below."
                : ""}
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              Schedule
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Start{" "}
                  <span className="text-slate-300 font-normal normal-case">(optional)</span>
                </label>
                <Input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="h-11 rounded-xl border-slate-200 mt-1 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  End{" "}
                  {form.budgetType === "LIFETIME" ? (
                    <RequiredMark />
                  ) : (
                    <span className="text-slate-300 font-normal normal-case">(optional)</span>
                  )}
                </label>
                <Input
                  type="datetime-local"
                  value={form.endTime}
                  min={form.startTime || undefined}
                  onChange={(e) => {
                    setTouchedEndTime(true);
                    setForm((f) => ({ ...f, endTime: e.target.value }));
                  }}
                  onBlur={() => setTouchedEndTime(true)}
                  className={cn(
                    "h-11 rounded-xl border-slate-200 mt-1 bg-white",
                    hasEndTimeError && "border-rose-400 focus-visible:ring-rose-300"
                  )}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Leave start empty to begin immediately. Leave end empty to run indefinitely
              {form.budgetType === "LIFETIME" ? " — but lifetime budget needs an end date." : "."}
            </p>
            {hasEndTimeError && (
              <FieldError message="End date is required when using a lifetime budget." />
            )}
            {endBeforeStart && (
              <FieldError message="End date must be after the start date." />
            )}
          </div>
        </FormSection>

      </div>
    </Card>
  );
}
