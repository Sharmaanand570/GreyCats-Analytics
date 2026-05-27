import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import {
  MapPin,
  Heart,
  X,
  Loader2,
  Search,
  AlertTriangle,
  Users,
  LayoutGrid,
  Ban,
  Plus,
  Sparkles,
  UserSquare,
  ExternalLink,
  Target,
  Wallet,
  ShieldAlert,
  Facebook as FacebookIcon,
} from "lucide-react";
import {
  useAudiences,
  useBrowseTargeting,
  useSearchInterests,
  useSearchLocations,
} from "@/features/meta/hooks/useMetaAdsManager";
import { useMetaAccounts } from "@/features/meta/hooks/useMetaData";
import {
  ATTRIBUTION_MODEL_OPTIONS,
  CONVERSION_LOCATIONS_BY_OBJECTIVE,
  DEFAULT_CONVERSION_LOCATION,
  DEFAULT_PERFORMANCE_GOAL,
  DETAILED_TARGETING_OPTIONS,
  MAX_DETAILED_TARGETING,
  OBJECTIVE_OPTIONS,
  PERFORMANCE_GOALS_BY_OBJECTIVE,
  PLACEMENT_OPTIONS,
  STEP2_OBJECTIVE_CARD_TITLE,
  AGE_MIN_FLOOR,
  AGE_MAX_CEILING,
  toSelectedInterest,
  toSelectedLocation,
  type AttributionModel,
  type ConversionLocation,
  type PerformanceGoal,
  type StepProps,
} from "./types";
import type {
  DetailedTargetingType,
  Gender,
  Placement,
} from "@/features/meta/API/metaAdsManagerApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FormSection } from "./FormSection";

// Meta's Marketing API caps targeting lists, and very long lists make ad sets
// unwieldy + harder for the user to scan. Soft-cap below Meta's hard limits.
const MAX_LOCATIONS = 25;
const MAX_INTERESTS = 25;

const useDebouncedValue = <T,>(value: T, delay = 300): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

type Props = StepProps & { clientId: number | null };

export function Step2Audience({ form, setForm, clientId }: Props) {
  const [locInput, setLocInput] = useState("");
  const [intInput, setIntInput] = useState("");
  const [dtType, setDtType] = useState<DetailedTargetingType>("behaviors");
  const [dtInput, setDtInput] = useState("");
  // UI-only: toggles for the "Show more options" collapse inside the objective card.
  const [showObjectiveAdvanced, setShowObjectiveAdvanced] = useState(false);
  // UI-only: Account controls collapse inside the Placements card.
  const [showAccountControls, setShowAccountControls] = useState(false);

  const locQuery = useDebouncedValue(locInput);
  const intQuery = useDebouncedValue(intInput);
  const dtQuery = useDebouncedValue(dtInput);

  const { data: locResults, isFetching: isFetchingLoc } = useSearchLocations(locQuery);
  const { data: intResults, isFetching: isFetchingInt } = useSearchInterests(intQuery);
  const { data: dtResults, isFetching: isFetchingDt } = useBrowseTargeting(dtType, dtQuery);
  const { data: audiencesData, isLoading: isLoadingAudiences } = useAudiences(clientId);
  const { data: accountsData } = useMetaAccounts(clientId);
  const allAudiences = audiencesData?.audiences ?? [];
  const pages = useMemo(() => accountsData?.pages ?? [], [accountsData]);

  // Objective drives the Performance goal options and the card title.
  const objective = form.campaign.objective;
  const objectiveLabel =
    OBJECTIVE_OPTIONS.find((o) => o.value === objective)?.label ?? "Performance";
  const objectiveCardTitle = STEP2_OBJECTIVE_CARD_TITLE[objective] ?? "Performance";
  const performanceGoalOptions = PERFORMANCE_GOALS_BY_OBJECTIVE[objective] ?? [];
  const currentPerformanceGoal: PerformanceGoal =
    form.adSet.performanceGoal ?? DEFAULT_PERFORMANCE_GOAL[objective];
  const frequencyControl =
    form.adSet.frequencyControl ?? { mode: "CAP" as const, count: 2, days: 7 };

  // Conversion location picker — only non-Awareness objectives.
  const conversionLocationOptions = CONVERSION_LOCATIONS_BY_OBJECTIVE[objective] ?? [];
  const showConversionLocation = conversionLocationOptions.length > 0;
  const currentConversionLocation: ConversionLocation =
    form.adSet.conversionLocationType ??
    (DEFAULT_CONVERSION_LOCATION[objective] as ConversionLocation) ??
    "WEBSITE";
  // Attribution model: Traffic / Leads / Sales / App promotion show this picker.
  const showAttributionModel =
    objective === "OUTCOME_TRAFFIC" ||
    objective === "OUTCOME_LEADS" ||
    objective === "OUTCOME_SALES" ||
    objective === "OUTCOME_APP_PROMOTION";

  // India warning + policy declaration trigger when the audience includes India.
  const targetsIndia = form.adSet.locations.some(
    (l) => l.country_code === "IN" || l.name?.toLowerCase() === "india"
  );

  const toggleAudience = (id: string, name: string, audienceType: "CUSTOM" | "WEBSITE" | "LOOKALIKE") =>
    setForm((f) => {
      const existing = f.adSet.customAudiences.find((a) => a.id === id);
      if (existing) {
        return { ...f, adSet: { ...f.adSet, customAudiences: f.adSet.customAudiences.filter((a) => a.id !== id) } };
      }
      return { ...f, adSet: { ...f.adSet, customAudiences: [...f.adSet.customAudiences, { id, name, audienceType }] } };
    });

  const toggleAudienceExcluded = (id: string) =>
    setForm((f) => ({
      ...f,
      customAudiences: f.adSet.customAudiences.map((a) =>
        a.id === id ? { ...a, excluded: !a.excluded } : a
      ),
    }));

  const removeAudience = (id: string) =>
    setForm((f) => ({ ...f, adSet: { ...f.adSet, customAudiences: f.adSet.customAudiences.filter((a) => a.id !== id) } }));

  const dtAtCap = form.adSet.detailedTargeting.length >= MAX_DETAILED_TARGETING;

  const addDetailedTargeting = (
    item: { id: string; name: string },
    type: DetailedTargetingType
  ) => {
    setForm((f) => {
      if (f.adSet.detailedTargeting.find((x) => x.id === item.id && x.type === type)) return f;
      if (f.adSet.detailedTargeting.length >= MAX_DETAILED_TARGETING) return f;
      return {
        ...f,
        detailedTargeting: [...f.adSet.detailedTargeting, { id: item.id, name: item.name, type }],
      };
    });
    setDtInput("");
  };

  const removeDetailedTargeting = (id: string, type: DetailedTargetingType) =>
    setForm((f) => ({
      ...f,
      detailedTargeting: f.adSet.detailedTargeting.filter((x) => !(x.id === id && x.type === type)),
    }));

  const locationsAtCap = form.adSet.locations.length >= MAX_LOCATIONS;
  const interestsAtCap = form.adSet.interests.length >= MAX_INTERESTS;

  const addLocation = (loc: ReturnType<typeof toSelectedLocation>) => {
    setForm((f) => {
      if (f.adSet.locations.find((l) => l.key === loc.key)) return f;
      if (f.adSet.locations.length >= MAX_LOCATIONS) return f;
      return { ...f, adSet: { ...f.adSet, locations: [...f.adSet.locations, loc] } };
    });
    setLocInput("");
  };

  const removeLocation = (key: string) =>
    setForm((f) => ({ ...f, adSet: { ...f.adSet, locations: f.adSet.locations.filter((l) => l.key !== key) } }));

  const toggleLocationExcluded = (key: string) =>
    setForm((f) => ({
      ...f,
      locations: f.adSet.locations.map((l) =>
        l.key === key ? { ...l, excluded: !l.excluded } : l
      ),
    }));

  const addInterest = (i: { id: string; name: string }) => {
    setForm((f) => {
      if (f.adSet.interests.find((x) => x.id === i.id)) return f;
      if (f.adSet.interests.length >= MAX_INTERESTS) return f;
      return { ...f, adSet: { ...f.adSet, interests: [...f.adSet.interests, i] } };
    });
    setIntInput("");
  };

  const removeInterest = (id: string) =>
    setForm((f) => ({ ...f, adSet: { ...f.adSet, interests: f.adSet.interests.filter((x) => x.id !== id) } }));

  const toggleInterestExcluded = (id: string) =>
    setForm((f) => ({
      ...f,
      interests: f.adSet.interests.map((x) =>
        x.id === id ? { ...x, excluded: !x.excluded } : x
      ),
    }));

  return (
    <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden bg-white">
      <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Target Audience</h2>
        <p className="text-sm text-slate-500 mt-1">
          Define who should see your ads based on location, demographics, and interests.
        </p>
      </div>

      <div className="px-8 py-2 divide-y divide-slate-100">

        {/* Ad set name */}
        <FormSection title="Ad set name" description="A label for this ad set within the campaign." icon={Target}>
          <Input
            value={form.adSet.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, adSet: { ...f.adSet, name: e.target.value } }))
            }
            placeholder={`New ${objectiveLabel} ad set`}
            className="h-11 rounded-xl border-slate-200 bg-white"
          />
        </FormSection>

        {/* {Objective} performance goal card. Title is "Conversion" for most
            objectives, "Awareness" for Awareness, "App" for App promotion. */}
        <FormSection
          title={objectiveCardTitle}
          description="Choose where to send people and the goal Meta should optimize for."
          icon={Sparkles}
        >
          {/* Conversion location — hidden for Awareness (no conversion picker). */}
          {showConversionLocation && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Conversion location
              </label>
              <p className="text-[11px] text-slate-500">
                Choose where you want to drive {objective === "OUTCOME_TRAFFIC" ? "traffic" : "conversions"}.{" "}
                <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                  About conversion locations
                </a>
              </p>
              <div className="space-y-2">
                {conversionLocationOptions.map((opt) => {
                  const active = currentConversionLocation === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          adSet: { ...f.adSet, conversionLocationType: opt.value },
                        }))
                      }
                      className={cn(
                        "w-full text-left flex gap-3 rounded-xl border px-4 py-3 transition-all",
                        active
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0",
                          active
                            ? "border-slate-900 bg-slate-900 ring-2 ring-white ring-inset"
                            : "border-slate-300"
                        )}
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{opt.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{opt.hint}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Performance goal
            </label>
            <p className="text-[11px] text-slate-500">
              How you measure success for your ads.{" "}
              <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                About performance goals
              </a>
            </p>
            <Select
              value={currentPerformanceGoal}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  adSet: { ...f.adSet, performanceGoal: v as PerformanceGoal },
                }))
              }
            >
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {performanceGoalOptions.map((opt) =>
                  opt.group ? (
                    <div
                      key={opt.value}
                      className="px-2 pt-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400 cursor-default select-none"
                    >
                      {opt.group}
                    </div>
                  ) : (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-semibold text-sm text-slate-900">
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-slate-500">{"hint" in opt ? opt.hint : ""}</span>
                      </div>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-400">
              To help us improve delivery, we may survey a small section of your audience.
            </p>
          </div>

          {/* Facebook Page */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Facebook Page
            </label>
            <p className="text-[11px] text-slate-500">
              Choose the Page that you want to promote.
            </p>
            <Select
              value={form.adSet.pageId ?? form.campaign.pageId ?? ""}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, adSet: { ...f.adSet, pageId: v } }))
              }
            >
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="Select Page" />
              </SelectTrigger>
              <SelectContent>
                {pages.map((p) => (
                  <SelectItem key={p.pageId} value={p.pageId}>
                    <div className="flex items-center gap-2">
                      <FacebookIcon className="w-3.5 h-3.5 text-[#1877F2]" />
                      <span className="font-semibold">{p.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cost per result goal */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
              Cost per result goal{" "}
              <span className="text-slate-300 font-normal normal-case">· Optional</span>
            </label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={form.adSet.costPerResultGoal ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  adSet: {
                    ...f.adSet,
                    costPerResultGoal: e.target.value ? Number(e.target.value) : undefined,
                  },
                }))
              }
              placeholder="₹X.XX"
              className="h-11 rounded-xl border-slate-200 bg-white"
            />
            <p className="text-[11px] text-slate-500">
              Meta will aim to spend your entire budget and get the most results using the
              highest-volume bid strategy. If keeping the average cost per result around a certain
              amount is important, enter a cost per result goal.
            </p>
          </div>

          {/* Attribution model — Traffic / Leads / Sales / App promotion. */}
          {showAttributionModel && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
                Attribution model
              </label>
              <Select
                value={form.adSet.attributionModel ?? "STANDARD"}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    adSet: { ...f.adSet, attributionModel: v as AttributionModel },
                  }))
                }
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTRIBUTION_MODEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm text-slate-900">{opt.label}</span>
                        <span className="text-[11px] text-slate-500">{opt.hint}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Frequency control */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Frequency control
            </label>
            <div className="space-y-2">
              {(["TARGET", "CAP"] as const).map((mode) => {
                const active = frequencyControl.mode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        adSet: {
                          ...f.adSet,
                          frequencyControl: {
                            ...(f.adSet.frequencyControl ?? { count: 2, days: 7 }),
                            mode,
                          },
                        },
                      }))
                    }
                    className={cn(
                      "w-full text-left flex gap-3 rounded-xl border px-4 py-3 transition-all",
                      active
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0",
                        active
                          ? "border-slate-900 bg-slate-900 ring-2 ring-white ring-inset"
                          : "border-slate-300"
                      )}
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {mode === "TARGET" ? "Target" : "Cap"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {mode === "TARGET"
                          ? "The average number of times that you want people to see your ads"
                          : "The maximum number of times that you want people to see your ads"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Input
                type="number"
                min={1}
                value={frequencyControl.count}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    adSet: {
                      ...f.adSet,
                      frequencyControl: {
                        ...(f.adSet.frequencyControl ?? { mode: "CAP", days: 7 }),
                        count: Number(e.target.value) || 1,
                      },
                    },
                  }))
                }
                className="h-10 w-20 rounded-xl border-slate-200 bg-white"
              />
              <span className="text-slate-700 font-semibold">times every</span>
              <Input
                type="number"
                min={1}
                value={frequencyControl.days}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    adSet: {
                      ...f.adSet,
                      frequencyControl: {
                        ...(f.adSet.frequencyControl ?? { mode: "CAP", count: 2 }),
                        days: Number(e.target.value) || 1,
                      },
                    },
                  }))
                }
                className="h-10 w-20 rounded-xl border-slate-200 bg-white"
              />
              <span className="text-slate-700 font-semibold">days</span>
            </div>
            <p className="text-[11px] text-slate-500">
              As a {frequencyControl.mode === "CAP" ? "maximum" : "target"}, we'll aim to stay
              {frequencyControl.mode === "CAP" ? " under" : " around"} {frequencyControl.count}{" "}
              impressions every {frequencyControl.days} days.
            </p>
          </div>

          {/* Show more options inside Objective card */}
          <button
            type="button"
            onClick={() => setShowObjectiveAdvanced((v) => !v)}
            className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            {showObjectiveAdvanced ? "Hide settings" : "Show more options"}
          </button>
          {showObjectiveAdvanced && (
            <div className="pl-4 ml-2 border-l-2 border-slate-100 space-y-3 py-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Value rules
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tell us how much more certain audiences, conversion locations and placements are
                  worth to your business. Our system will optimise for outcomes based on these
                  rules.{" "}
                  <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                    About value rules
                  </a>
                </p>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50"
                >
                  <Plus className="w-3.5 h-3.5" /> Create a rule set
                </button>
              </div>
            </div>
          )}
        </FormSection>

        {/* Dynamic creative — top-level card */}
        <FormSection
          title="Dynamic creative"
          description="Meta automatically combines your media and text to find the best-performing combinations."
          icon={Sparkles}
          rightSlot={
            <Switch
              checked={!!form.adSet.dynamicCreative}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  adSet: { ...f.adSet, dynamicCreative: e.target.checked },
                }))
              }
            />
          }
        >
          <p className="text-xs text-slate-500">
            We'll automatically create combinations of your media and text that your audience is
            likely to respond to.{" "}
            <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
              About dynamic creative
            </a>
          </p>
        </FormSection>

        {/* Budget & schedule — addresses the ad-set budget gap left from Step 1 */}
        <FormSection
          title="Budget & schedule"
          description="Set how much to spend on this ad set and when it should run."
          icon={Wallet}
        >
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
              Budget
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={form.adSet.lifetimeBudget ? "LIFETIME" : "DAILY"}
                onValueChange={(v) =>
                  setForm((f) => {
                    if (v === "DAILY") {
                      return {
                        ...f,
                        adSet: { ...f.adSet, lifetimeBudget: undefined },
                      };
                    }
                    return {
                      ...f,
                      adSet: {
                        ...f.adSet,
                        dailyBudget: undefined,
                        lifetimeBudget: f.adSet.lifetimeBudget ?? 0,
                      },
                    };
                  })
                }
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily budget</SelectItem>
                  <SelectItem value="LIFETIME">Lifetime budget</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                value={
                  form.adSet.lifetimeBudget
                    ? (form.adSet.lifetimeBudget ?? "")
                    : (form.adSet.dailyBudget ?? "")
                }
                onChange={(e) =>
                  setForm((f) => {
                    const v = Number(e.target.value) || 0;
                    return f.adSet.lifetimeBudget
                      ? { ...f, adSet: { ...f.adSet, lifetimeBudget: v } }
                      : { ...f, adSet: { ...f.adSet, dailyBudget: v } };
                  })
                }
                placeholder="₹0.00"
                className="h-11 rounded-xl border-slate-200 bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {form.adSet.lifetimeBudget
                ? "Total amount spent across the run of the ad set."
                : "Average daily spend. Some days may spend up to 75% more, others less."}
              {" "}
              <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                About budgets
              </a>
            </p>
          </div>

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
                {form.adSet.lifetimeBudget ? (
                  <span className="text-rose-500 font-bold">*</span>
                ) : (
                  <span className="text-slate-300 font-normal normal-case">(optional)</span>
                )}
              </label>
              <Input
                type="datetime-local"
                value={form.adSet.scheduleEnd ?? ""}
                min={form.adSet.scheduleStart || undefined}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    adSet: { ...f.adSet, scheduleEnd: e.target.value },
                  }))
                }
                className="h-11 rounded-xl border-slate-200 mt-1 bg-white"
              />
            </div>
          </div>
        </FormSection>

        {/* Audience controls — pre-existing audience criteria + India warning */}
        <FormSection
          title="Audience controls"
          description="Set criteria for where ads for this campaign can be delivered."
          icon={ShieldAlert}
        >
          <p className="text-xs text-slate-500">
            <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
              Set audience controls for all campaigns
            </a>{" "}
            in Advertiser settings, or use a saved audience.
          </p>
          {targetsIndia && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-amber-900">
                  Policy and regulatory requirements (India)
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  To run ads in India, you need to declare if your ads are related to securities and
                  investments.
                </p>
              </div>
            </div>
          )}
        </FormSection>

        {/* Geography */}
        <FormSection title="Geography" description="Search for locations. Leave empty to default to entire US." icon={MapPin}>
          <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Locations
            </label>
            <span
              className={
                locationsAtCap
                  ? "text-[10px] font-bold text-amber-600 font-mono"
                  : "text-[10px] font-mono text-slate-400"
              }
            >
              {form.adSet.locations.length} / {MAX_LOCATIONS}
            </span>
          </div>

          {form.adSet.locations.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {form.adSet.locations.map((l) => (
                <Badge
                  key={l.key}
                  variant="outline"
                  className={
                    l.excluded
                      ? "rounded-full pl-3 pr-1 py-1 bg-rose-50 border-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1"
                      : "rounded-full pl-3 pr-1 py-1 bg-blue-50 border-blue-100 text-blue-700 font-semibold text-xs flex items-center gap-1"
                  }
                  title={l.excluded ? "Excluded from targeting" : "Included in targeting"}
                >
                  {l.excluded && <Ban className="w-3 h-3 mr-0.5" />}
                  {l.name}
                  <span
                    className={
                      l.excluded
                        ? "text-rose-400 text-[10px] ml-1 uppercase"
                        : "text-blue-400 text-[10px] ml-1 uppercase"
                    }
                  >
                    {l.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleLocationExcluded(l.key)}
                    className={
                      l.excluded
                        ? "ml-1 p-1 rounded-full hover:bg-rose-100"
                        : "ml-1 p-1 rounded-full hover:bg-blue-100"
                    }
                    title={l.excluded ? "Switch to include" : "Switch to exclude"}
                  >
                    {l.excluded ? <Plus className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLocation(l.key)}
                    className={
                      l.excluded
                        ? "p-1 rounded-full hover:bg-rose-100"
                        : "p-1 rounded-full hover:bg-blue-100"
                    }
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={locInput}
              onChange={(e) => setLocInput(e.target.value)}
              placeholder={
                locationsAtCap
                  ? `Remove a location to add another (max ${MAX_LOCATIONS})`
                  : "Search cities, regions, or countries…"
              }
              disabled={locationsAtCap}
              className="h-11 pl-10 rounded-xl border-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
            {isFetchingLoc && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
            )}
          </div>

          {locationsAtCap && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              You've reached the {MAX_LOCATIONS}-location cap. Remove one to add another.
            </div>
          )}

          {!locationsAtCap && locQuery.trim().length >= 2 && locResults && locResults.length > 0 && (
            <div className="border border-slate-100 rounded-xl bg-white shadow-sm max-h-56 overflow-y-auto">
              {locResults.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => addLocation(toSelectedLocation(l))}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{l.name}</div>
                    {l.region && (
                      <div className="text-xs text-slate-400">
                        {l.region}
                        {l.country_code ? ` · ${l.country_code}` : ""}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold uppercase border-slate-200 text-slate-500"
                  >
                    {l.type}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      </FormSection>

      {/* Detailed Targeting */}
      <FormSection title="Detailed Targeting" description="Define your ideal audience based on their interests, behaviors, and demographics." icon={Sparkles}>
          {/* Interests */}
          <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5" /> Interests
            </label>
            <span
              className={
                interestsAtCap
                  ? "text-[10px] font-bold text-amber-600 font-mono"
                  : "text-[10px] font-mono text-slate-400"
              }
            >
              {form.adSet.interests.length} / {MAX_INTERESTS}
            </span>
          </div>

          {form.adSet.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {form.adSet.interests.map((i) => (
                <Badge
                  key={i.id}
                  variant="outline"
                  className={
                    i.excluded
                      ? "rounded-full pl-3 pr-1 py-1 bg-rose-50 border-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1"
                      : "rounded-full pl-3 pr-1 py-1 bg-violet-50 border-violet-100 text-violet-700 font-semibold text-xs flex items-center gap-1"
                  }
                  title={i.excluded ? "Excluded from targeting" : "Included in targeting"}
                >
                  {i.excluded && <Ban className="w-3 h-3 mr-0.5" />}
                  {i.name}
                  <button
                    type="button"
                    onClick={() => toggleInterestExcluded(i.id)}
                    className={
                      i.excluded
                        ? "ml-1 p-1 rounded-full hover:bg-rose-100"
                        : "ml-1 p-1 rounded-full hover:bg-violet-100"
                    }
                    title={i.excluded ? "Switch to include" : "Switch to exclude"}
                  >
                    {i.excluded ? <Plus className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeInterest(i.id)}
                    className={
                      i.excluded
                        ? "p-1 rounded-full hover:bg-rose-100"
                        : "p-1 rounded-full hover:bg-violet-100"
                    }
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={intInput}
              onChange={(e) => setIntInput(e.target.value)}
              placeholder={
                interestsAtCap
                  ? `Remove an interest to add another (max ${MAX_INTERESTS})`
                  : "Search interests like Yoga, Fitness, Technology…"
              }
              disabled={interestsAtCap}
              className="h-11 pl-10 rounded-xl border-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
            {isFetchingInt && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
            )}
          </div>

          {interestsAtCap && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              You've reached the {MAX_INTERESTS}-interest cap. Remove one to add another.
            </div>
          )}

          {!interestsAtCap && intQuery.trim().length >= 2 && intResults && intResults.length > 0 && (
            <div className="border border-slate-100 rounded-xl bg-white shadow-sm max-h-56 overflow-y-auto">
              {intResults.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => addInterest(toSelectedInterest(i))}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                >
                  <div className="text-sm font-semibold text-slate-900">{i.name}</div>
                  {i.path && i.path.length > 0 && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      {i.path.join(" → ")}
                    </div>
                  )}
                  {i.audience_size_lower_bound && i.audience_size_upper_bound && (
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {i.audience_size_lower_bound.toLocaleString()}–
                      {i.audience_size_upper_bound.toLocaleString()} people
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Targeting (Behaviors / Demographics / Life Events / Work / Education) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Detailed Targeting
            </label>
            <span
              className={
                dtAtCap
                  ? "text-[10px] font-bold text-amber-600 font-mono"
                  : "text-[10px] font-mono text-slate-400"
              }
            >
              {form.adSet.detailedTargeting.length} / {MAX_DETAILED_TARGETING}
            </span>
          </div>

          {form.adSet.detailedTargeting.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {form.adSet.detailedTargeting.map((item) => {
                const typeLabel = DETAILED_TARGETING_OPTIONS.find((o) => o.value === item.type)?.label ?? item.type;
                return (
                  <Badge
                    key={`${item.type}:${item.id}`}
                    variant="outline"
                    className="rounded-full pl-3 pr-1 py-1 bg-amber-50 border-amber-100 text-amber-700 font-semibold text-xs flex items-center gap-1"
                  >
                    {item.name}
                    <span className="text-amber-400 text-[10px] ml-1 uppercase">
                      {typeLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDetailedTargeting(item.id, item.type)}
                      className="ml-1 p-1 rounded-full hover:bg-amber-100"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-[180px_1fr] gap-2">
            <Select value={dtType} onValueChange={(v) => setDtType(v as DetailedTargetingType)}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DETAILED_TARGETING_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex flex-col items-start py-0.5">
                      <span className="font-semibold text-sm">{opt.label}</span>
                      <span className="text-[11px] text-slate-500">{opt.hint}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={dtInput}
                onChange={(e) => setDtInput(e.target.value)}
                placeholder={
                  dtAtCap
                    ? `Remove an item to add another (max ${MAX_DETAILED_TARGETING})`
                    : `Search ${DETAILED_TARGETING_OPTIONS.find((o) => o.value === dtType)?.label.toLowerCase() ?? dtType}…`
                }
                disabled={dtAtCap}
                className="h-11 pl-10 rounded-xl border-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              {isFetchingDt && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
              )}
            </div>
          </div>

          {dtAtCap && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              You've reached the {MAX_DETAILED_TARGETING}-item cap. Remove one to add another.
            </div>
          )}

          {!dtAtCap && dtQuery.trim().length >= 2 && dtResults && dtResults.length > 0 && (
            <div className="border border-slate-100 rounded-xl bg-white shadow-sm max-h-56 overflow-y-auto">
              {dtResults.map((r) => (
                <button
                  key={`${dtType}:${r.id}`}
                  type="button"
                  onClick={() => addDetailedTargeting({ id: r.id, name: r.name }, dtType)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                >
                  <div className="text-sm font-semibold text-slate-900">{r.name}</div>
                  {r.path && r.path.length > 0 && (
                    <div className="text-xs text-slate-400 mt-0.5">{r.path.join(" → ")}</div>
                  )}
                  {r.audience_size_lower_bound && r.audience_size_upper_bound && (
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {r.audience_size_lower_bound.toLocaleString()}–
                      {r.audience_size_upper_bound.toLocaleString()} people
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
          </div>
        </FormSection>

        {/* Custom Audiences */}
        <FormSection title="Custom Audiences" description="Reach people who have already interacted with your business." icon={UserSquare}>
          <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <UserSquare className="w-3.5 h-3.5" /> Custom Audiences
            </label>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-400">
                {form.adSet.customAudiences.length} selected
              </span>
              {clientId && (
                <Link
                  to={`/data-sources/meta-ads/audiences/${clientId}`}
                  className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  Manage
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>

          {/* Chips for currently-selected audiences */}
          {form.adSet.customAudiences.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {form.adSet.customAudiences.map((a) => (
                <Badge
                  key={a.id}
                  variant="outline"
                  className={
                    a.excluded
                      ? "rounded-full pl-3 pr-1 py-1 bg-rose-50 border-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1"
                      : "rounded-full pl-3 pr-1 py-1 bg-emerald-50 border-emerald-100 text-emerald-700 font-semibold text-xs flex items-center gap-1"
                  }
                >
                  {a.excluded && <Ban className="w-3 h-3" />}
                  {a.name}
                  <span
                    className={
                      a.excluded
                        ? "text-rose-400 text-[10px] ml-1 uppercase"
                        : "text-emerald-400 text-[10px] ml-1 uppercase"
                    }
                  >
                    {a.audienceType}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleAudienceExcluded(a.id)}
                    className={
                      a.excluded
                        ? "ml-1 p-1 rounded-full hover:bg-rose-100"
                        : "ml-1 p-1 rounded-full hover:bg-emerald-100"
                    }
                    title={a.excluded ? "Switch to include" : "Switch to exclude"}
                  >
                    {a.excluded ? <Plus className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAudience(a.id)}
                    className={
                      a.excluded
                        ? "p-1 rounded-full hover:bg-rose-100"
                        : "p-1 rounded-full hover:bg-emerald-100"
                    }
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* List of available audiences */}
          {isLoadingAudiences ? (
            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading audiences…
            </div>
          ) : allAudiences.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center space-y-2">
              <p className="text-xs text-slate-500">
                No audiences yet for this client.
              </p>
              {clientId && (
                <Link
                  to={`/data-sources/meta-ads/audiences/${clientId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create one in Audiences
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          ) : (
            <div className="border border-slate-100 rounded-xl bg-white max-h-64 overflow-y-auto">
              {allAudiences.map((a) => {
                const selected = form.adSet.customAudiences.find((sel) => sel.id === a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAudience(a.id, a.name, a.type)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center justify-between",
                      selected && "bg-emerald-50/40"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{a.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {a.type}
                        {a.approxSize !== undefined && (
                          <span> · {a.approxSize.toLocaleString()} people</span>
                        )}
                        {a.retentionDays !== undefined && (
                          <span> · {a.retentionDays}d retention</span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        selected
                          ? "rounded-full bg-emerald-100 border-emerald-200 text-emerald-700 text-[10px]"
                          : "rounded-full bg-white border-slate-200 text-slate-500 text-[10px]"
                      }
                    >
                      {selected ? "Selected" : "Add"}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
            <p className="text-xs text-slate-400 mt-2">
              Custom audiences include website visitors, customer lists, and lookalikes. Use the Ban button on a chip to exclude an audience instead.
            </p>
          </div>
        </FormSection>

        <FormSection title="Demographics" description="Set the age range and gender of your ideal audience." icon={Users}>
          <div className="space-y-6">
            {/* Age range */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Age Range
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Min
                  </label>
                  <Input
                    type="number"
                    min={AGE_MIN_FLOOR}
                    max={form.adSet.ageMax}
                    value={form.adSet.ageMin}
                    onChange={(e) => {
                      const next = Math.max(
                        AGE_MIN_FLOOR,
                        Math.min(form.adSet.ageMax, Number(e.target.value) || AGE_MIN_FLOOR)
                      );
                      setForm((f) => ({ ...f, adSet: { ...f.adSet, ageMin: next } }));
                    }}
                    className="h-11 rounded-xl border-slate-200 mt-1"
                  />
                </div>
                <div className="text-slate-300 mt-5">—</div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Max
                  </label>
                  <Input
                    type="number"
                    min={form.adSet.ageMin}
                    max={AGE_MAX_CEILING}
                    value={form.adSet.ageMax}
                    onChange={(e) => {
                      const next = Math.min(
                        AGE_MAX_CEILING,
                        Math.max(form.adSet.ageMin, Number(e.target.value) || form.adSet.ageMin)
                      );
                      setForm((f) => ({ ...f, adSet: { ...f.adSet, ageMax: next } }));
                    }}
                    className="h-11 rounded-xl border-slate-200 mt-1"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Meta requires {AGE_MIN_FLOOR}+ minimum. {form.adSet.ageMax === AGE_MAX_CEILING ? `${AGE_MAX_CEILING} = 65+ (no upper bound).` : ""}
              </p>
            </div>

            {/* Gender */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["ALL", "MEN", "WOMEN"] as Gender[]).map((g) => {
                  const isActive = form.adSet.genders[0] === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, adSet: { ...f.adSet, genders: [g] } }))}
                      className={cn(
                        "h-11 rounded-xl text-sm font-bold transition-all border",
                        isActive
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {g === "ALL" ? "All Genders" : g === "MEN" ? "Men" : "Women"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </FormSection>

        {/* Placements */}
        <FormSection title="Ad Placement" description="Where your ads will appear across Meta." icon={LayoutGrid}>
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <LayoutGrid className="w-3.5 h-3.5" /> Placements
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PLACEMENT_OPTIONS.map((opt) => {
                const isActive = form.adSet.manualPlatforms.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        placements: isActive
                          ? f.adSet.manualPlatforms.filter((p) => p !== opt.value)
                          : ([...f.adSet.manualPlatforms, opt.value] as Placement[]),
                      }))
                    }
                    className={cn(
                      "flex flex-col items-start text-left px-4 py-3 rounded-xl border transition-all",
                      isActive
                        ? "bg-blue-50 border-blue-300 text-blue-900 shadow-sm"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    )}
                  >
                    <span className="text-sm font-bold">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{opt.hint}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400">
              {form.adSet.manualPlatforms.length === 0
                ? "Auto placements — Meta decides where the ad appears (recommended for new advertisers)."
                : `Restricted to ${form.adSet.manualPlatforms.length} placement${form.adSet.manualPlatforms.length === 1 ? "" : "s"}.`}
            </p>
          </div>

          {/* WhatsApp status callout (Meta surfaces this for placements that include
              WhatsApp Updates / Status). Auto-placements pick it up by default. */}
          {form.adSet.useAdvantagePlusPlacements && (
            <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <Sparkles className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-blue-900">WhatsApp status included</p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  To help you reach new audiences, we've included the WhatsApp status placement.
                  Statuses are vertical photos and videos on the WhatsApp Updates tab that disappear
                  after 24 hours.{" "}
                  <a className="font-semibold underline" href="#" onClick={(e) => e.preventDefault()}>
                    About ads in WhatsApp status
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Account controls collapse */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/40">
            <button
              type="button"
              onClick={() => setShowAccountControls((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-700"
            >
              Account controls
              <span className="text-slate-400 text-xs">
                {showAccountControls ? "Hide" : "Show"}
              </span>
            </button>
            {showAccountControls && (
              <div className="px-4 pb-4 space-y-2">
                <div className="text-xs text-slate-600">
                  <span className="font-bold">Excluded placements:</span>{" "}
                  {(form.adSet.excludedPlacements?.length ?? 0) === 0
                    ? "None"
                    : form.adSet.excludedPlacements?.join(", ")}
                </div>
                <p className="text-[11px] text-slate-500">
                  Account controls let you limit where your ads appear across all campaigns for this
                  ad account.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-bold text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50"
                >
                  Edit placement controls
                </button>
              </div>
            )}
          </div>
        </FormSection>

        {/* Policy and regulatory requirements — India only for now */}
        {targetsIndia && (
          <FormSection
            title="Policy and regulatory requirements (India)"
            description="Provide required information about your ads, yourself or your organisation."
            icon={ShieldAlert}
          >
            <label className="flex items-start gap-2.5 cursor-pointer">
              <Checkbox
                id="india-securities"
                checked={!!form.adSet.policyDeclarations?.securitiesAndInvestments}
                onCheckedChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    adSet: {
                      ...f.adSet,
                      policyDeclarations: {
                        ...f.adSet.policyDeclarations,
                        securitiesAndInvestments: !!v,
                      },
                    },
                  }))
                }
                className="mt-0.5"
              />
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  This ad set includes ads related to securities and investments
                </div>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-xs text-blue-600 hover:underline"
                >
                  About verification requirements
                </a>
              </div>
            </label>
          </FormSection>
        )}

      </div>
    </Card>
  );
}
