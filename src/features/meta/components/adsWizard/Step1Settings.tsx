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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AlertCircle,
  Wallet,
  Briefcase,
  Facebook as FacebookIcon,
  CheckCircle2,
  Target,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FlaskConical,
  Smartphone,
  Users,
} from "lucide-react";
import { RequiredMark } from "@/components/ui/required-mark";
import { FormSection } from "./FormSection";
import { useMetaAccounts } from "@/features/meta/hooks/useMetaData";
import { useMetaPixels } from "@/features/meta/hooks/useMetaAdsManager";
import {
  AB_TEST_METRIC_BY_OBJECTIVE,
  RECOMMENDED_METRIC_BY_OBJECTIVE,
  AB_TEST_VARIABLE_OPTIONS,
  ADVANTAGE_PLUS_OBJECTIVES,
  BUYING_TYPE_OPTIONS,
  CONVERSION_EVENT_OPTIONS,
  OBJECTIVE_OPTIONS,
  RESERVATION_OBJECTIVES,
  SPECIAL_AD_CATEGORY_OPTIONS,
  type AbTestVariable,
  type BuyingType,
  type StepProps,
} from "./types";
import type {
  BudgetType,
  CampaignObjective,
  ConversionEvent,
  SpecialAdCategory,
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
  const isSalesObjective = form.campaign.objective === "OUTCOME_SALES";
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

  // Pending objective change — held in state to drive the confirmation modal.
  // Mirrors Meta's behavior: changing objective resets dependent sections,
  // so we ask before applying.
  const [pendingObjective, setPendingObjective] = useState<CampaignObjective | null>(null);
  // Local UI toggles (not persisted to state) for showing/hiding advanced sections.
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showBudgetScheduling, setShowBudgetScheduling] = useState(false);

  // Derived flags driven by current campaign state.
  const buyingType: BuyingType = form.campaign.buyingType ?? "AUCTION";
  const objective = form.campaign.objective;
  const isAdvantagePlusObjective = ADVANTAGE_PLUS_OBJECTIVES.includes(objective);
  const isAppPromotion = objective === "OUTCOME_APP_PROMOTION";
  // For Advantage+ objectives the user picks via radio; for others CBO is a toggle.
  // "CAMPAIGN" budget strategy ⇔ CBO on. Keep both in sync.
  const budgetStrategy = form.campaign.budgetStrategy ?? "AD_SET";
  const isCboOn =
    isAdvantagePlusObjective ? budgetStrategy === "CAMPAIGN" : !!form.campaign.isCboEnabled;
  // Available objectives respect the buying type — Reservation restricts to a subset.
  const availableObjectives = useMemo(
    () =>
      buyingType === "RESERVATION"
        ? OBJECTIVE_OPTIONS.filter((o) => RESERVATION_OBJECTIVES.includes(o.value))
        : OBJECTIVE_OPTIONS,
    [buyingType]
  );
  // Reservation is a fixed-impression buy: no bidding, no budget optimization,
  // no A/B testing. Meta hides most cards on Step 1 when this is selected.
  const isAuction = buyingType === "AUCTION";

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
    if (!form.campaign.accountId && adAccounts.length === 1) {
      setForm((f) => ({ ...f, campaign: { ...f.campaign, accountId: adAccounts[0].accountId } }));
    }
  }, [adAccounts, form.campaign.accountId, setForm]);

  useEffect(() => {
    if (!form.campaign.pageId && pages.length === 1) {
      setForm((f) => ({ ...f, campaign: { ...f.campaign, pageId: pages[0].pageId } }));
    }
  }, [pages, form.campaign.pageId, setForm]);

  useEffect(() => {
    if (!isSalesObjective) {
      if (form.adSet.pixelId || form.adSet.conversionEvent) {
        setForm((f) => ({ ...f, adSet: { ...f.adSet, pixelId: "", conversionEvent: "" } }));
      }
      return;
    }
    if (!form.adSet.pixelId && pixels.length === 1) {
      setForm((f) => ({ ...f, adSet: { ...f.adSet, pixelId: pixels[0].id } }));
    }
  }, [isSalesObjective, pixels, form.adSet.pixelId, form.adSet.conversionEvent, setForm]);

  const isSingleAccount = adAccounts.length === 1;
  const isSinglePage = pages.length === 1;

  const hasAccountError = showAccount && !form.campaign.accountId && adAccounts.length > 1;
  const hasPageError = showPage && !form.campaign.pageId && pages.length > 1;
  const hasObjectiveError = showObjective && !form.campaign.objective;
  const hasNameError = showName && !form.campaign.name.trim();
  // Mirror canAdvance in MetaAdsWizardPage — budget must be >= 1 for the
  // wizard to proceed. Anything in (0, 1) used to silently block "Continue"
  // with no visible reason.
  const dailyBudgetValue =
    (form.campaign.isCboEnabled ? form.campaign.dailyBudget ?? 0 : form.adSet.dailyBudget ?? 0);
  const lifetimeBudgetValue =
    (form.campaign.isCboEnabled ? form.campaign.lifetimeBudget ?? 0 : form.adSet.lifetimeBudget ?? 0);
  const activeBudgetMode: "LIFETIME" | "DAILY" =
    (form.campaign.isCboEnabled ? form.campaign.lifetimeBudget : form.adSet.lifetimeBudget)
      ? "LIFETIME"
      : "DAILY";
  const hasBudgetError =
    showBudget &&
    (activeBudgetMode === "DAILY" ? dailyBudgetValue < 1 : lifetimeBudgetValue < 1);
  // Sanity warnings — non-blocking, but flag values that look like typos.
  const budgetWarning =
    activeBudgetMode === "DAILY" && dailyBudgetValue > DAILY_BUDGET_WARN
      ? `That's $${dailyBudgetValue.toFixed(2)} per day — double-check this isn't a typo.`
      : activeBudgetMode === "LIFETIME" && lifetimeBudgetValue > LIFETIME_BUDGET_WARN
        ? `That's $${lifetimeBudgetValue.toFixed(2)} total — double-check this isn't a typo.`
        : null;
  const hasEndTimeError =
    (showEndTime || showBudget) &&
    (form.campaign.isCboEnabled ? (form.campaign.lifetimeBudget ? "LIFETIME" : "DAILY") : (form.adSet.lifetimeBudget ? "LIFETIME" : "DAILY")) === "LIFETIME" &&
    !form.adSet.scheduleEnd;
  const endBeforeStart =
    form.adSet.scheduleStart && form.adSet.scheduleEnd
      ? new Date(form.adSet.scheduleEnd) <= new Date(form.adSet.scheduleStart)
      : false;
  const hasPixelError =
    showPixel && isSalesObjective && !form.adSet.pixelId && pixels.length > 0;
  const hasConversionEventError =
    showConversionEvent && isSalesObjective && !form.adSet.conversionEvent;

  // Cross-business compatibility check. Only warn when we have a confirmed
  // mismatch — if either side's businessId is null (personal/unknown owner),
  // we don't know, so we stay quiet rather than cry wolf.
  // Normalize `act_` prefix so accountIds from /clients/:id/meta/accounts
  // (which may or may not be prefixed) match form.campaign.accountId (which may or
  // may not be prefixed, depending on source).
  const normalizeActId = (id: string) => (id.startsWith("act_") ? id.slice(4) : id);
  const selectedAccount = adAccounts.find(
    (a) => normalizeActId(a.accountId) === normalizeActId(form.campaign.accountId)
  );
  const selectedPage = pages.find((p) => p.pageId === form.campaign.pageId);
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
                value={form.campaign.accountId}
                onValueChange={(v) => {
                  setTouchedAccount(true);
                  setForm((f) => ({ ...f, campaign: { ...f.campaign, accountId: v } }));
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
                value={form.campaign.pageId}
                onValueChange={(v) => {
                  setTouchedPage(true);
                  setForm((f) => ({ ...f, campaign: { ...f.campaign, pageId: v } }));
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

        {/* Campaign Name */}
        <FormSection title="Campaign Name" description="A clear name helps you find this campaign later." icon={Target}>
          <div className="space-y-2">
            <Input
              value={form.campaign.name}
              onChange={(e) => {
                setTouchedName(true);
                setForm((f) => ({ ...f, campaign: { ...f.campaign, name: e.target.value } }));
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

        {/* Campaign Details — buying type, objective, advanced collapse */}
        <FormSection title="Campaign Details" description="Choose how you'll pay and what you're optimizing for." icon={Target}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              Buying type
            </label>
            <Select
              value={buyingType}
              onValueChange={(v) => {
                const next = v as BuyingType;
                setForm((f) => {
                  const objectiveStillValid =
                    next === "RESERVATION"
                      ? RESERVATION_OBJECTIVES.includes(f.campaign.objective)
                      : true;
                  return {
                    ...f,
                    campaign: {
                      ...f.campaign,
                      buyingType: next,
                      // Reservation only supports a subset — snap to Awareness if invalid.
                      objective: objectiveStillValid ? f.campaign.objective : "OUTCOME_AWARENESS",
                    },
                  };
                });
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUYING_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="py-2">
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="font-bold text-sm text-slate-900">{opt.label}</span>
                      <span className="text-[11px] text-slate-500">{opt.hint}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              Campaign Objective <RequiredMark />
            </label>
            <Select
              value={form.campaign.objective}
              onValueChange={(v) => {
                const next = v as CampaignObjective;
                if (next === form.campaign.objective) return;
                setTouchedObjective(true);
                // Stash the pending choice; the modal commits it once user confirms.
                setPendingObjective(next);
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
                {availableObjectives.map((opt) => (
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
                    value={form.adSet.pixelId}
                    onValueChange={(v) => {
                      setTouchedPixel(true);
                      setForm((f) => ({ ...f, adSet: { ...f.adSet, pixelId: v } }));
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
                  value={form.adSet.conversionEvent}
                  onValueChange={(v) => {
                    setTouchedConversionEvent(true);
                    setForm((f) => ({ ...f, adSet: { ...f.adSet, conversionEvent: v as ConversionEvent } }));
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

          {/* Show more / Hide settings toggle — Auction only. Reservation has no
              campaign spending limit since impressions are pre-purchased. */}
          {isAuction && (
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  campaign: { ...f.campaign, showAdvancedSettings: !f.campaign.showAdvancedSettings },
                }))
              }
              className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 mt-2"
            >
              {form.campaign.showAdvancedSettings ? (
                <>
                  Hide settings <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show more options <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {isAuction && form.campaign.showAdvancedSettings && (
            <div className="pl-4 ml-2 border-l-2 border-slate-100 space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
                  Campaign spending limit <span className="text-slate-300 font-normal normal-case">(optional)</span>
                </label>
                <Input
                  type="number"
                  min={0}
                  value={form.campaign.campaignSpendingLimit ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      campaign: {
                        ...f.campaign,
                        campaignSpendingLimit: e.target.value ? Number(e.target.value) : undefined,
                      },
                    }))
                  }
                  placeholder="No limit"
                  className="h-11 rounded-xl border-slate-200 bg-white"
                />
                <p className="text-[11px] text-slate-400">
                  Cap the total amount Meta can spend on this campaign across its lifetime.
                </p>
              </div>
            </div>
          )}
        </FormSection>

        {/* Advantage+ catalogue — Sales objective + Auction only */}
        {isAuction && isSalesObjective && (
          <FormSection
            title="Advantage+ catalogue"
            description="Drive sales using your product information by showing relevant products to the right people."
            icon={Sparkles}
            rightSlot={
              <Switch
                checked={!!form.campaign.advantagePlusEnabled}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    campaign: { ...f.campaign, advantagePlusEnabled: e.target.checked },
                  }))
                }
              />
            }
          >
            <p className="text-xs text-slate-500">
              When turned on, Meta automatically optimizes catalog product selection per audience.{" "}
              <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                About Advantage+ catalogue ads
              </a>
            </p>
          </FormSection>
        )}

        {/* Budget — Auction only. Reservation buys a fixed number of impressions,
            so budget optimization and bid strategy don't apply. */}
        {isAuction && (
        <FormSection
          title="Budget"
          description="How much you want to spend on this campaign."
          icon={Wallet}
          // Right-rail badge: Advantage+ shows when CBO is on (or the equivalent for Leads/Sales/App).
          rightSlot={
            isCboOn ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
                <Sparkles className="w-3 h-3" /> Advantage+ on
              </span>
            ) : null
          }
        >
          {/* Budget strategy — depends on the objective family */}
          {isAdvantagePlusObjective ? (
            <>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  Budget strategy
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        campaign: { ...f.campaign, budgetStrategy: "CAMPAIGN", isCboEnabled: true },
                      }))
                    }
                    className={cn(
                      "w-full text-left flex gap-3 rounded-xl border px-4 py-3 transition-all",
                      budgetStrategy === "CAMPAIGN"
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0",
                        budgetStrategy === "CAMPAIGN"
                          ? "border-slate-900 bg-slate-900 ring-2 ring-white ring-inset"
                          : "border-slate-300"
                      )}
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">Campaign budget</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Automatically distribute your budget to the best opportunities across your
                        campaign. Also known as Advantage+ campaign budget.{" "}
                        <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                          About campaign budget
                        </a>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        campaign: { ...f.campaign, budgetStrategy: "AD_SET", isCboEnabled: false },
                      }))
                    }
                    className={cn(
                      "w-full text-left flex gap-3 rounded-xl border px-4 py-3 transition-all",
                      budgetStrategy === "AD_SET"
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0",
                        budgetStrategy === "AD_SET"
                          ? "border-slate-900 bg-slate-900 ring-2 ring-white ring-inset"
                          : "border-slate-300"
                      )}
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">Ad set budget</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Set different bid strategies or budget schedules for each ad set.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* For Advantage+ objectives on Ad-set budget: share-budget checkbox appears */}
              {budgetStrategy === "AD_SET" && (
                <div className="flex items-start gap-2.5 mt-3 pl-1">
                  <Checkbox
                    id="share-budget"
                    checked={!!form.campaign.budgetRebalanceFlag}
                    onCheckedChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        campaign: { ...f.campaign, budgetRebalanceFlag: !!v },
                      }))
                    }
                    className="mt-0.5"
                  />
                  <label htmlFor="share-budget" className="text-xs text-slate-600 cursor-pointer leading-5">
                    <span className="font-bold text-slate-800">
                      Share some of your budget with other ad sets
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      We'll share up to 20% of your ad set budget with other ad sets within this
                      campaign when it's likely to improve performance.{" "}
                      <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                        About ad set budget sharing
                      </a>
                    </span>
                  </label>
                </div>
              )}
            </>
          ) : (
            // Non-Advantage+ objectives: Advantage+ campaign budget block matching Meta's UI
            <div className={cn(
              "rounded-xl border p-4 space-y-4 transition-colors",
              form.campaign.isCboEnabled ? "border-emerald-200 bg-emerald-50/20" : "border-slate-100 bg-slate-50/40"
            )}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {form.campaign.isCboEnabled ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-slate-400" />
                    )}
                    Advantage+ campaign budget
                  </div>
                  <p className="text-[12px] text-slate-600 mt-1">
                    Distribute your budget across ad sets to get more results. You can control
                    spending for each ad set.{" "}
                    <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                      About Advantage+ campaign budget
                    </a>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">{form.campaign.isCboEnabled ? "On" : "Off"}</span>
                  <Switch
                    checked={!!form.campaign.isCboEnabled}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        campaign: { ...f.campaign, isCboEnabled: e.target.checked },
                      }))
                    }
                  />
                </div>
              </div>

              {/* When CBO is OFF: show Share budget checkbox INSIDE the same block (matches Meta) */}
              {!form.campaign.isCboEnabled && (
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="share-budget"
                    checked={!!form.campaign.budgetRebalanceFlag}
                    onCheckedChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        campaign: { ...f.campaign, budgetRebalanceFlag: !!v },
                      }))
                    }
                    className="mt-0.5"
                  />
                  <label htmlFor="share-budget" className="text-sm text-slate-700 cursor-pointer leading-5">
                    Share some of your budget with other ad sets
                    <span className="block text-[11px] text-slate-500 mt-1">
                      We'll share up to 20% of your ad set budget with other ad sets within this
                      campaign when it's likely to improve performance.{" "}
                      <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                        About ad set budget sharing
                      </a>
                    </span>
                  </label>
                </div>
              )}

              {/* Campaign bid strategy is ALWAYS shown inside the box for non-Advantage+ objectives */}
              {(!form.campaign.isCboEnabled) && (
                <div className="space-y-0.5 pt-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    Campaign bid strategy
                  </div>
                  <div className="text-[13px] text-slate-700">Highest volume</div>
                </div>
              )}
              
              {/* If CBO is ON, we also render Budget controls and Scheduling inside this box */}
              {form.campaign.isCboEnabled && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      Budget <RequiredMark />
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-[160px]">
                        <Select
                          value={form.campaign.lifetimeBudget ? "LIFETIME" : "DAILY"}
                          onValueChange={(v) => {
                            setForm((f) => ({
                              ...f,
                              campaign: {
                                ...f.campaign,
                                lifetimeBudget: v === "DAILY" ? undefined : f.campaign.lifetimeBudget || f.campaign.dailyBudget || 0,
                                dailyBudget: v === "LIFETIME" ? undefined : f.campaign.dailyBudget || f.campaign.lifetimeBudget || 0,
                              },
                            }));
                          }}
                        >
                          <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DAILY">Daily budget</SelectItem>
                            <SelectItem value="LIFETIME">Lifetime budget</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 flex items-center bg-white rounded-lg border border-slate-200 px-3 py-1 shadow-sm">
                        <span className="text-slate-500 mr-1">$</span>
                        <Input
                          type="number"
                          min={1}
                          step={0.5}
                          value={(form.campaign.lifetimeBudget ? form.campaign.lifetimeBudget : form.campaign.dailyBudget) ?? ""}
                          onChange={(e) => {
                            setTouchedBudget(true);
                            const v = Number(e.target.value) || 0;
                            setForm((f) => ({
                              ...f,
                              campaign: {
                                ...f.campaign,
                                lifetimeBudget: f.campaign.lifetimeBudget !== undefined ? v : undefined,
                                dailyBudget: f.campaign.lifetimeBudget === undefined ? v : undefined,
                              },
                            }));
                          }}
                          onBlur={() => setTouchedBudget(true)}
                          className="h-8 p-0 border-0 bg-transparent focus-visible:ring-0 text-sm font-bold text-slate-900 w-full"
                        />
                        <span className="text-xs text-slate-400 ml-2 font-medium tracking-wide">USD</span>
                      </div>
                    </div>
                    {hasBudgetError && (
                      <FieldError message="Budget must be at least 1." />
                    )}
                    {!hasBudgetError && budgetWarning && (
                      <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {budgetWarning}
                      </div>
                    )}
                    <p className="text-[12px] text-slate-500 mt-2">
                      {form.campaign.lifetimeBudget
                        ? "You'll spend this total amount over the campaign duration."
                        : `You'll spend an average of $${(form.campaign.dailyBudget || 0).toFixed(2)} per day.`}
                      {" "}
                      <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                        About {form.campaign.lifetimeBudget ? "lifetime" : "daily"} budget
                      </a>
                    </p>
                  </div>
                  
                  <div className="space-y-0.5 pt-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      Campaign bid strategy
                    </div>
                    <div className="text-[13px] text-slate-700">Highest volume</div>
                  </div>

                  <div className="pt-2 border-t border-emerald-100/60">
                    <button
                      type="button"
                      onClick={() => setShowBudgetScheduling((v) => !v)}
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:text-blue-700"
                    >
                      {showBudgetScheduling ? (
                        <>Hide options <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>Show more options <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                    {showBudgetScheduling && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          Budget scheduling
                        </div>
                        <p className="text-[12px] text-slate-600">
                          Increase your budget during specific days or times.
                        </p>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={(form.campaign.budgetScheduleIncreases?.length ?? 0) > 0}
                              onCheckedChange={() => {}}
                            />
                            <span className="text-[13px] text-slate-700">
                              Schedule budget increases
                            </span>
                          </label>
                          <Select value="view" onValueChange={() => {}}>
                            <SelectTrigger className="h-8 w-[80px] rounded border-slate-200 bg-white text-[13px] font-medium shadow-sm">
                              <SelectValue placeholder="View" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view">View</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Budget amount lives at the campaign level only when CBO is ON. When OFF
              (or "Ad set budget" radio is selected), Meta moves this input to the
              ad-set step — so we render nothing here. */}
          {isCboOn && (
            <>
              {/* Budget Type + Amount */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  Budget <RequiredMark />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["DAILY", "LIFETIME"] as BudgetType[]).map((t) => {
                    const isActive =
                      (isCboOn
                        ? form.campaign.lifetimeBudget
                          ? "LIFETIME"
                          : "DAILY"
                        : form.adSet.lifetimeBudget
                          ? "LIFETIME"
                          : "DAILY") === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setForm((f) => {
                            const cbo = isCboOn;
                            if (t === "DAILY") {
                              return cbo
                                ? { ...f, campaign: { ...f.campaign, lifetimeBudget: undefined } }
                                : { ...f, adSet: { ...f.adSet, lifetimeBudget: undefined } };
                            }
                            return cbo
                              ? {
                                  ...f,
                                  campaign: {
                                    ...f.campaign,
                                    dailyBudget: undefined,
                                    lifetimeBudget: f.campaign.lifetimeBudget ?? 0,
                                  },
                                }
                              : {
                                  ...f,
                                  adSet: {
                                    ...f.adSet,
                                    dailyBudget: undefined,
                                    lifetimeBudget: f.adSet.lifetimeBudget ?? 0,
                                  },
                                };
                          })
                        }
                        className={cn(
                          "px-4 py-3 rounded-xl border text-left transition-all",
                          isActive
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="text-sm font-bold">
                          {t === "DAILY" ? "Daily budget" : "Lifetime budget"}
                        </div>
                        <div
                          className={cn(
                            "text-[10px] mt-0.5",
                            isActive ? "text-slate-300" : "text-slate-400"
                          )}
                        >
                          {t === "DAILY"
                            ? "A fixed amount spent each day"
                            : "Total spend across the campaign duration"}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Budget Amount */}
                {(isCboOn
                  ? form.campaign.lifetimeBudget
                    ? "LIFETIME"
                    : "DAILY"
                  : form.adSet.lifetimeBudget
                    ? "LIFETIME"
                    : "DAILY") === "DAILY" ? (
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={1}
                      max={500}
                      step={0.5}
                      value={isCboOn ? (form.campaign.dailyBudget ?? 0) : (form.adSet.dailyBudget ?? 0)}
                      onChange={(e) => {
                        setTouchedBudget(true);
                        setForm((f) => {
                          const v = Number(e.target.value);
                          return isCboOn
                            ? { ...f, campaign: { ...f.campaign, dailyBudget: v } }
                            : { ...f, adSet: { ...f.adSet, dailyBudget: v } };
                        });
                      }}
                      className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-900"
                    />
                    <div className="flex items-center bg-white rounded-xl border border-slate-200 px-3 py-2 min-w-[140px]">
                      <Input
                        type="number"
                        min={1}
                        step={0.5}
                        value={isCboOn ? (form.campaign.dailyBudget ?? "") : (form.adSet.dailyBudget ?? "")}
                        onChange={(e) => {
                          setTouchedBudget(true);
                          setForm((f) => {
                            const v = Number(e.target.value) || 0;
                            return isCboOn
                              ? { ...f, campaign: { ...f.campaign, dailyBudget: v } }
                              : { ...f, adSet: { ...f.adSet, dailyBudget: v } };
                          });
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
                      value={
                        isCboOn
                          ? (form.campaign.lifetimeBudget ?? "")
                          : (form.adSet.lifetimeBudget ?? "")
                      }
                      onChange={(e) => {
                        setTouchedBudget(true);
                        setForm((f) => {
                          const v = Number(e.target.value) || 0;
                          return isCboOn
                            ? { ...f, campaign: { ...f.campaign, lifetimeBudget: v } }
                            : { ...f, adSet: { ...f.adSet, lifetimeBudget: v } };
                        });
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
                  {(isCboOn
                    ? form.campaign.lifetimeBudget
                      ? "LIFETIME"
                      : "DAILY"
                    : form.adSet.lifetimeBudget
                      ? "LIFETIME"
                      : "DAILY") === "LIFETIME"
                    ? " Lifetime budget requires an end date below."
                    : ""}
                </p>
              </div>

              {/* Campaign bid strategy — always shown (matches Meta) */}
              <div className="space-y-1 pt-2">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
                  Campaign bid strategy
                </div>
                <div className="text-sm font-semibold text-slate-800">Highest volume</div>
              </div>

              {/* Show more options / Hide settings — collapsible reveals Budget scheduling.
                  Meta shows this for CBO-on (Advantage+ campaign budget) flows. */}
              {isCboOn && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowBudgetScheduling((v) => !v)}
                    className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    {showBudgetScheduling ? (
                      <>
                        Hide settings <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show more options <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  {showBudgetScheduling && (
                    <div className="mt-3 space-y-3">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
                        Budget scheduling
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Increase your budget during specific days or times.
                      </p>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={(form.campaign.budgetScheduleIncreases?.length ?? 0) > 0}
                            onCheckedChange={() => {
                              // UI-only stub for now — backend wiring deferred.
                            }}
                          />
                          <span className="text-sm font-semibold text-slate-700">
                            Schedule budget increases
                          </span>
                        </label>
                        <Select value="view" onValueChange={() => {}}>
                          <SelectTrigger className="h-9 w-[100px] rounded-lg border-slate-200 bg-white text-sm font-semibold">
                            <SelectValue placeholder="View" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">View</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </FormSection>
        )}

        {/* Schedule — Auction only. Reservation handles scheduling separately
            (date-locked impression reservation), not on this step. */}
        {isAuction && (
        <FormSection title="Schedule" description="When the ad should start and stop running." icon={Wallet}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Start <span className="text-slate-300 font-normal normal-case">(optional)</span>
              </label>
              <Input
                type="datetime-local"
                value={form.adSet.scheduleStart}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    adSet: { ...f.adSet, scheduleStart: e.target.value },
                  }))
                }
                className="h-11 rounded-xl border-slate-200 mt-1 bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                End{" "}
                {(isCboOn
                  ? form.campaign.lifetimeBudget
                    ? "LIFETIME"
                    : "DAILY"
                  : form.adSet.lifetimeBudget
                    ? "LIFETIME"
                    : "DAILY") === "LIFETIME" ? (
                  <RequiredMark />
                ) : (
                  <span className="text-slate-300 font-normal normal-case">(optional)</span>
                )}
              </label>
              <Input
                type="datetime-local"
                value={form.adSet.scheduleEnd}
                min={form.adSet.scheduleStart || undefined}
                onChange={(e) => {
                  setTouchedEndTime(true);
                  setForm((f) => ({ ...f, adSet: { ...f.adSet, scheduleEnd: e.target.value } }));
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
            {(isCboOn
              ? form.campaign.lifetimeBudget
                ? "LIFETIME"
                : "DAILY"
              : form.adSet.lifetimeBudget
                ? "LIFETIME"
                : "DAILY") === "LIFETIME"
              ? " — but lifetime budget needs an end date."
              : "."}
          </p>
          {hasEndTimeError && (
            <FieldError message="End date is required when using a lifetime budget." />
          )}
          {endBeforeStart && (
            <FieldError message="End date must be after the start date." />
          )}
        </FormSection>
        )}

        {/* iOS 14+ campaign — App promotion only */}
        {isAppPromotion && (
          <FormSection
            title="iOS 14+ campaign"
            description="Reach people using iOS 14.5 and later. Required for app install on modern iOS."
            icon={Smartphone}
            rightSlot={
              <Switch
                checked={!!form.campaign.ios14CampaignEnabled}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    campaign: { ...f.campaign, ios14CampaignEnabled: e.target.checked },
                  }))
                }
              />
            }
          >
            {form.campaign.ios14CampaignEnabled ? (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500">
                  Create a campaign to help you reach people using iOS 14.5 and later devices. An iOS
                  14+ campaign will not deliver to devices using iOS 13.7 or earlier.{" "}
                  <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                    Learn more
                  </a>
                </p>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  App <RequiredMark />
                </label>
                {/* Dropdown trigger styled like Meta's app selector — a real picker would call an
                    /apps endpoint; for now we let the user paste an App ID inline. */}
                <Input
                  value={form.campaign.ios14AppId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      campaign: { ...f.campaign, ios14AppId: e.target.value },
                    }))
                  }
                  placeholder="Select the app that you want people to install and use"
                  className="h-11 rounded-xl border-slate-200 bg-white"
                />
                <a className="inline-block text-xs font-semibold text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                  Can't find your app?
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Create a campaign to help you reach people using iOS 14.5 and later devices.{" "}
                <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                  Learn more
                </a>
              </p>
            )}
          </FormSection>
        )}

        {/* A/B test — Auction only. Reservation has no bidding to compare against. */}
        {isAuction && (
        <FormSection
          title="A/B test"
          description="Compare versions of your ad to see which performs best."
          icon={FlaskConical}
          rightSlot={
            <Switch
              checked={!!form.campaign.abTestEnabled}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  campaign: { ...f.campaign, abTestEnabled: e.target.checked },
                }))
              }
            />
          }
        >
          {form.campaign.abTestEnabled ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  What would you like to test?
                </label>
                <Select
                  value={form.campaign.abTestVariable ?? "CREATIVE"}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      campaign: { ...f.campaign, abTestVariable: v as AbTestVariable },
                    }))
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AB_TEST_VARIABLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">{opt.label}</span>
                          <span className="text-[11px] text-slate-500">{opt.hint}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  How long should the test run?
                </label>
                <p className="text-[11px] text-slate-500">
                  Your test will run for this many days or until your ad set has ended.
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={form.campaign.abTestDurationDays ?? 7}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        campaign: {
                          ...f.campaign,
                          abTestDurationDays: Number(e.target.value) || 1,
                        },
                      }))
                    }
                    className="h-11 rounded-xl border-slate-200 bg-white w-24"
                  />
                  <span className="text-xs text-slate-500">days</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  How do you want to compare performance?
                </label>
                <Select
                  value={
                    form.campaign.abTestComparisonMetric ??
                    RECOMMENDED_METRIC_BY_OBJECTIVE[objective] ??
                    ""
                  }
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      campaign: { ...f.campaign, abTestComparisonMetric: v },
                    }))
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(AB_TEST_METRIC_BY_OBJECTIVE[objective] ?? []).map((opt) => {
                      if (opt.group) {
                        return (
                          <div
                            key={opt.value}
                            className="px-2 pt-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 cursor-default select-none"
                          >
                            {opt.group}
                          </div>
                        );
                      }
                      const isRecommended =
                        opt.value === RECOMMENDED_METRIC_BY_OBJECTIVE[objective];
                      return (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center justify-between gap-2 w-full">
                            <span>{opt.label}</span>
                            {isRecommended && (
                              <span className="inline-flex items-center text-[10px] font-semibold text-slate-700 bg-white border border-slate-300 rounded-md px-2 py-0.5">
                                Recommended
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Help improve ad performance by comparing versions to see what works best. For accuracy,
              each one will be shown to separate groups of your audience.
            </p>
          )}
        </FormSection>
        )}

        {/* Audience segment reporting — Sales + Auction only */}
        {isAuction && isSalesObjective && (
          <FormSection
            title="Audience segment reporting"
            description="Define your ad account's audience segments to receive reporting breakdowns."
            icon={Users}
          >
            <div className="space-y-3">
              <div>
                <div className="text-xs font-bold text-slate-700">Engaged audience</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {form.campaign.engagedAudienceSegment?.audienceName ?? "Not defined"}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700">Existing customers</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {form.campaign.existingCustomersSegment?.audienceName ?? "Not defined"}
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Define audience segments in Advertiser settings to populate these.
              </p>
            </div>
          </FormSection>
        )}

        {/* Special Ad Categories — multi-select dropdown */}
        <FormSection
          title="Special Ad Categories"
          description="Declare if your ads are related to financial products, employment, housing, social issues, elections or politics."
          icon={ShieldAlert}
        >
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Categories
            </label>
            <p className="text-[11px] text-slate-500">
              Select the categories that best describe what this campaign will advertise.
            </p>
            <button
              type="button"
              onClick={() => setShowCategoryPicker((v) => !v)}
              className={cn(
                "w-full h-11 rounded-xl border border-slate-200 bg-white px-3 flex items-center justify-between text-left text-sm",
                form.campaign.specialAdCategories.length === 0 && "text-slate-400"
              )}
            >
              <span>
                {form.campaign.specialAdCategories.length === 0
                  ? "Declare category if applicable"
                  : SPECIAL_AD_CATEGORY_OPTIONS.filter((o) =>
                      form.campaign.specialAdCategories.includes(o.value)
                    )
                      .map((o) => o.label)
                      .join(", ")}
              </span>
              {showCategoryPicker ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {showCategoryPicker && (
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-2 space-y-1">
                {SPECIAL_AD_CATEGORY_OPTIONS.filter((o) => o.value !== "NONE").map((opt) => {
                  const checked = form.campaign.specialAdCategories.includes(
                    opt.value as SpecialAdCategory
                  );
                  return (
                    <label
                      key={opt.value}
                      className="flex items-start gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          setForm((f) => {
                            const next = v
                              ? [...f.campaign.specialAdCategories, opt.value as SpecialAdCategory]
                              : f.campaign.specialAdCategories.filter((c) => c !== opt.value);
                            return {
                              ...f,
                              campaign: { ...f.campaign, specialAdCategories: next },
                            };
                          });
                        }}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">{opt.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{opt.hint}</div>
                      </div>
                    </label>
                  );
                })}
                <p className="text-[11px] text-slate-400 px-3 py-2 border-t border-slate-100 mt-1">
                  If none of the categories apply to your ad, you may not need to select a special ad
                  category.
                </p>
              </div>
            )}
          </div>
        </FormSection>

      </div>

      {/* Objective change confirmation — mirrors Meta's "Your settings may change" modal */}
      <AlertDialog open={!!pendingObjective} onOpenChange={(open) => !open && setPendingObjective(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Your settings may change</AlertDialogTitle>
            <AlertDialogDescription>
              You've selected a new campaign objective, so some of the current settings won't be
              saved. We'll keep the existing settings when possible and others will get a default
              value. You can edit these settings.
              <br /><br />
              Do you want to continue with the new objective?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingObjective(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingObjective) return;
                const next = pendingObjective;
                setForm((f) => ({
                  ...f,
                  campaign: {
                    ...f.campaign,
                    objective: next,
                    // Reset objective-dependent state to its defaults.
                    abTestComparisonMetric: undefined,
                    // For Advantage+ objectives the budget strategy is meaningful; default to CAMPAIGN.
                    budgetStrategy: ADVANTAGE_PLUS_OBJECTIVES.includes(next) ? "CAMPAIGN" : "AD_SET",
                    isCboEnabled: ADVANTAGE_PLUS_OBJECTIVES.includes(next),
                    // Clear iOS 14+ if leaving App promotion.
                    ios14CampaignEnabled: next === "OUTCOME_APP_PROMOTION" ? f.campaign.ios14CampaignEnabled : false,
                  },
                }));
                setPendingObjective(null);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
