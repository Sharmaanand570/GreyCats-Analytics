import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import {
  MapPin,
  Heart,
  X,
  Loader2,
  Search,
  AlertTriangle,
  AlertCircle,
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
  useBrowseTargeting,
  useSearchInterests,
  useSearchLocations,
  useMobileApps,
  useAccountSettings,
  useUpdateAccountSettings,
  useTargetingSuggestions,
  useCreateSavedAudience,
  useAudiences,
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

type Props = StepProps & { clientId: number | null; setStep?: (s: number) => void };

const buildTargetingForSavedAudience = (adSet: any) => {
  const geoIncluded = { countries: [] as string[], cities: [] as any[], regions: [] as any[], zips: [] as string[] };
  const geoExcluded = { countries: [] as string[], cities: [] as any[], regions: [] as any[], zips: [] as string[] };

  adSet.locations.forEach((l: any) => {
    const target = l.excluded ? geoExcluded : geoIncluded;
    if (l.type === "country") target.countries.push(l.key);
    else if (l.type === "city") target.cities.push({ key: l.key, radius: 10, distance_unit: "mile" });
    else if (l.type === "region") target.regions.push({ key: l.key });
    else if (l.type === "zip") target.zips.push(l.key);
  });

  const includedInterests = adSet.interests.filter((i: any) => !i.excluded).map((i: any) => ({ id: i.id, name: i.name }));
  const excludedInterests = adSet.interests.filter((i: any) => i.excluded).map((i: any) => ({ id: i.id, name: i.name }));
  const includedAudiences = adSet.customAudiences.map((c: any) => ({ id: c.id, name: c.name }));
  const excludedAudiences = adSet.excludedCustomAudiences.map((c: any) => ({ id: c.id, name: c.name }));

  const hasGeoIncluded = geoIncluded.countries.length > 0 || geoIncluded.cities.length > 0 || geoIncluded.regions.length > 0 || geoIncluded.zips.length > 0;
  const hasGeoExcluded = geoExcluded.countries.length > 0 || geoExcluded.cities.length > 0 || geoExcluded.regions.length > 0 || geoExcluded.zips.length > 0;

  return {
    ...(hasGeoIncluded ? { geo_locations: geoIncluded } : {}),
    ...(hasGeoExcluded ? { excluded_geo_locations: geoExcluded } : {}),
    ...(includedInterests.length ? { interests: includedInterests } : {}),
    ...(excludedInterests.length ? { excluded_interests: excludedInterests } : {}),
    ...(includedAudiences.length ? { custom_audiences: includedAudiences } : {}),
    ...(excludedAudiences.length ? { excluded_custom_audiences: excludedAudiences } : {})
  };
};

export function Step2Audience({ form, setForm, clientId }: Props) {
  const [locInput, setLocInput] = useState("");
  const [intInput, setIntInput] = useState("");
  const [dtType, setDtType] = useState<DetailedTargetingType>("behaviors");
  const [dtInput, setDtInput] = useState("");
  // UI-only: toggles for the "Show more options" collapse inside the objective card.
  const [showObjectiveAdvanced, setShowObjectiveAdvanced] = useState(false);
  // UI-only: Account controls collapse inside the Placements card.
  const [showAccountControls, setShowAccountControls] = useState(false);
  // UI-only: Audience controls "Show options" expand + modal state.
  const [showAudienceControlsOptions, setShowAudienceControlsOptions] = useState(false);
  const [audienceControlsModalOpen, setAudienceControlsModalOpen] = useState(false);
  const [audienceControlsModalShowOptions, setAudienceControlsModalShowOptions] =
    useState(false);
  const [excludeAudienceSearch, setExcludeAudienceSearch] = useState("");

  const [saveAudienceModalOpen, setSaveAudienceModalOpen] = useState(false);
  const [saveAudienceName, setSaveAudienceName] = useState("");
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);

  const locQuery = useDebouncedValue(locInput);
  const intQuery = useDebouncedValue(intInput);
  const dtQuery = useDebouncedValue(dtInput);

  const { data: dtResults, isFetching: isFetchingDt } = useBrowseTargeting(dtType, dtQuery);
  const { data: audiencesData, isLoading: isLoadingAudiences } = useAudiences(clientId);
  const { data: accountsData } = useMetaAccounts(clientId);
  const { data: appsList = [], isLoading: isLoadingApps } = useMobileApps(form.campaign.accountId || null, clientId);
  const { data: accountSettings } = useAccountSettings(form.campaign.accountId || null, clientId);
  const { mutate: updateAccountSettings, isPending: isUpdatingAccountSettings } = useUpdateAccountSettings();
  const { data: suggestions = [], isFetching: isFetchingSuggestions, refetch: fetchSuggestions } = useTargetingSuggestions(form.campaign.objective, form.campaign.ios14AppId, clientId);
  const { mutate: createSavedAudience, isPending: isSavingAudience } = useCreateSavedAudience();

  const [appSearch, setAppSearch] = useState("");
  const [appDropdownOpen, setAppDropdownOpen] = useState(false);
  const selectedApp = useMemo(() => {
    return appsList.find((a: any) => a.id === form.campaign.ios14AppId);
  }, [form.campaign.ios14AppId, appsList]);
  const [selectedStore, setSelectedStore] = useState<"Apple App Store" | "Google Play Store">(() => {
    const app = appsList.find((a: any) => a.id === form.campaign.ios14AppId);
    return app?.store === "Google Play Store" ? "Google Play Store" : "Apple App Store";
  });
  useEffect(() => {
    if (selectedApp) {
      setSelectedStore(selectedApp.store as "Apple App Store" | "Google Play Store");
    }
  }, [selectedApp]);

  useEffect(() => {
    if (accountSettings) {
      setForm((f) => ({
        ...f,
        adSet: {
          ...f.adSet,
          audienceControls: {
            ...f.adSet.audienceControls,
            ...accountSettings,
          },
        },
      }));
    }
  }, [accountSettings, setForm]);

  const { data: locResults, isFetching: isFetchingLoc } = useSearchLocations(locQuery);
  const { data: intResults, isFetching: isFetchingInt } = useSearchInterests(intQuery);
  const allAudiences = audiencesData?.audiences ?? [];
  const pages = useMemo(() => accountsData?.pages ?? [], [accountsData]);

  // Objective drives the Performance goal options and the card title.
  const objective = form.campaign.objective;
  const isAppPromotion = objective === "OUTCOME_APP_PROMOTION";
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
        {/* App promotion performance goal card */}
        {isAppPromotion ? (
          <FormSection
            title="App promotion"
            description="Choose the app to promote and optimization settings."
            icon={Sparkles}
          >
            <div className="space-y-4">
              {/* Mobile app store */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Mobile app store
                </label>
                <Select
                  value={selectedStore}
                  onValueChange={(v) => {
                    const store = v as "Apple App Store" | "Google Play Store";
                    setSelectedStore(store);
                    // Clear selected app if it doesn't belong to the newly selected store
                    if (selectedApp && selectedApp.store !== store) {
                      setForm((f) => ({
                        ...f,
                        campaign: { ...f.campaign, ios14AppId: undefined },
                      }));
                    }
                  }}
                >
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google Play Store">Google Play Store</SelectItem>
                    <SelectItem value="Apple App Store">Apple App Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* App name search autocomplete */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  App name
                </label>
                
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={appSearch}
                    onFocus={() => setAppDropdownOpen(true)}
                    onChange={(e) => {
                      setAppSearch(e.target.value);
                      setAppDropdownOpen(true);
                    }}
                    placeholder="Enter app name, app ID or exact app store URL"
                    className="h-11 pl-10 pr-10 rounded-xl border-slate-200 bg-white shadow-sm focus:border-slate-400 focus:ring-0 text-sm w-full"
                  />
                  {appDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50">
                      {isLoadingApps ? (
                        <div className="p-4 text-xs text-slate-400 text-center font-medium">
                          Loading apps...
                        </div>
                      ) : appsList.filter((app: any) =>
                        app.store === selectedStore &&
                        (app.name.toLowerCase().includes(appSearch.toLowerCase()) ||
                         app.id.toLowerCase().includes(appSearch.toLowerCase()))
                      ).length === 0 ? (
                        <div className="p-4 text-xs text-slate-400 text-center font-medium">
                          No apps found matching "{appSearch}"
                        </div>
                      ) : (
                        appsList.filter((app: any) =>
                          app.store === selectedStore &&
                          (app.name.toLowerCase().includes(appSearch.toLowerCase()) ||
                           app.id.toLowerCase().includes(appSearch.toLowerCase()))
                        ).map((app: any) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => {
                              setForm((f) => ({
                                ...f,
                                campaign: { ...f.campaign, ios14AppId: app.id },
                              }));
                              setAppSearch("");
                              setAppDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50/80 flex items-center gap-3 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200/50 flex items-center justify-center text-base shadow-sm group-hover:scale-95 transition-transform shrink-0 overflow-hidden">
                              {app.icon?.startsWith("http") ? (
                                <img src={app.icon} alt="" className="w-full h-full object-cover" />
                              ) : (
                                app.icon || "📱"
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-bold text-slate-900 leading-none flex items-center gap-1.5">
                                {app.name}
                                <span className="inline-flex text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                                  {app.platform}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 truncate mt-1">
                                {app.id} · {app.category}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Dropdown Overlay to close it */}
                {appDropdownOpen && (
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setAppDropdownOpen(false)}
                  />
                )}

                {/* Selected App Display Details Card */}
                {form.campaign.ios14AppId && selectedApp && (
                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/40 shadow-sm mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-[14px] bg-gradient-to-tr from-slate-100 to-white border border-slate-200/60 flex items-center justify-center text-2xl shadow-sm overflow-hidden">
                        {selectedApp.icon?.startsWith("http") ? (
                          <img src={selectedApp.icon} alt="" className="w-full h-full object-cover" />
                        ) : (
                          selectedApp.icon || "📱"
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900">{selectedApp.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedApp.id}</div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="inline-flex items-center text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                            {selectedApp.store}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">· {selectedApp.category}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((f) => ({
                          ...f,
                          campaign: { ...f.campaign, ios14AppId: undefined },
                        }));
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove app"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Country Selection Checkbox helper */}
              <div className="flex items-center gap-2.5 pl-1 py-1">
                <Checkbox id="country-specific" />
                <label htmlFor="country-specific" className="text-xs text-slate-500 font-medium cursor-pointer leading-none">
                  Find your app by selecting a country where it's available.
                </label>
              </div>

              {/* Performance goal */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Performance goal
                </label>
                <p className="text-[11px] text-slate-500">
                  How you measure success for your ads.
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
              </div>

              {/* Info Callout block */}
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-slate-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    In-app ad impression and in-app purchase now available
                  </p>
                  <p className="text-[11px] text-slate-505 leading-relaxed">
                    To reach people who may drive higher in-app ad value, choose{" "}
                    <span className="font-bold text-slate-700">Maximise value of conversions</span>.
                  </p>
                </div>
              </div>

              {/* Cost per result goal */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Cost per result goal
                </label>
                <div className="flex items-center bg-white rounded-xl border border-slate-200 px-3 py-1 shadow-sm">
                  <span className="text-slate-400 mr-1 text-sm font-bold">₹</span>
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
                    placeholder="None"
                    className="h-8 p-0 border-0 bg-transparent focus-visible:ring-0 text-sm font-semibold text-slate-800 w-full animate-none"
                  />
                </div>
              </div>

              {/* Value rules info block */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
                  Value rules
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <div className="text-xs text-slate-600 mt-1 font-semibold">
                  Enabled: <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">No</span>
                </div>
              </div>

              {/* Attribution model & Advanced Toggle */}
              <button
                type="button"
                onClick={() => setShowObjectiveAdvanced((v) => !v)}
                className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 mt-1"
              >
                {showObjectiveAdvanced ? "Hide settings" : "Show more settings"}
              </button>
              
              {showObjectiveAdvanced && (
                <div className="pl-4 ml-2 border-l-2 border-slate-100 space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
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
                              <span className="text-[11px] text-slate-505">{opt.hint}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </FormSection>
        ) : (
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
                          <div className="text-[11px] text-slate-505 mt-0.5">{opt.hint}</div>
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
                          <span className="text-[11px] text-slate-505">{"hint" in opt ? opt.hint : ""}</span>
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
                          <span className="text-[11px] text-slate-505">{opt.hint}</span>
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
                        <div className="text-[11px] text-slate-505 mt-0.5">
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
              <p className="text-[11px] text-slate-505">
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
                  <p className="text-[11px] text-slate-505 mt-1">
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
        )}

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
          {form.campaign.isCboEnabled ? (
            <div className="space-y-4 pt-1 mb-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
                  Budget strategy
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  Your campaign budget automatically distributes your daily budget of{" "}
                  <span className="font-bold text-slate-800">
                    ₹{(form.campaign.dailyBudget || form.campaign.lifetimeBudget || 8000).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>{" "}
                  across ad sets to get the best performance. You can set spending limits for each ad
                  set.{" "}
                  <a className="text-blue-600 hover:underline font-semibold" href="#" onClick={(e) => e.preventDefault()}>
                    About spending limits
                  </a>
                </p>
              </div>

              <div className="space-y-1 pt-1">
                <div className="text-xs font-bold text-slate-700">
                  Ad set spending limits
                </div>
                <div className="text-[12px] text-slate-500 font-semibold bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 w-max">
                  None added
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
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
              <p className="text-[11px] text-slate-505">
                {form.adSet.lifetimeBudget
                  ? "Total amount spent across the run of the ad set."
                  : "Average daily spend. Some days may spend up to 75% more, others less."}
                {" "}
                <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                  About budgets
                </a>
              </p>
            </div>
          )}

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

        {/* Audience controls — info callout opens account-level modal; card
            summarises criteria (saved audience, locations, age/exclusions/langs).
            Matches Meta's Step 2 "Audience controls" block. */}
        {!isAppPromotion && (
          <FormSection
            title="Audience controls"
            description="Set criteria for where ads for this campaign can be delivered."
            icon={ShieldAlert}
          >
          <p className="text-xs text-slate-500">
            <a className="text-blue-600 hover:underline font-semibold" href="#" onClick={(e) => e.preventDefault()}>
              Learn more
            </a>
          </p>

          {/* Controls Sub-block matching Screenshot 3 */}
          {isAppPromotion && (
            <div className="space-y-2 pt-1 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                Controls
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                We won't reach people beyond these settings, even with Advantage+ on.
              </p>
              <div className="inline-flex text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/50 rounded-lg px-2.5 py-1">
                No advertising settings set
              </div>
            </div>
          )}

          {/* Account-level controls callout */}
          <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <ShieldAlert className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-slate-700 leading-relaxed">
                You can set audience controls for this ad account to apply to all campaigns.
              </p>
              <button
                type="button"
                onClick={() => setAudienceControlsModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Set audience controls for all campaigns
              </button>
            </div>
          </div>

          {/* Use a saved audience */}
          <div className="space-y-2">
            <Select
              value={form.adSet.savedAudienceId ?? "__none__"}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  adSet: { ...f.adSet, savedAudienceId: v === "__none__" ? undefined : v },
                }))
              }
            >
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="Use a saved audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Use a saved audience</SelectItem>
                {allAudiences.map((a: any) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Locations summary */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1">
              <span className="text-rose-500">*</span> Locations
            </label>
            {form.adSet.locations.length === 0 ? (
              <p className="text-xs text-slate-500">
                No locations selected — add cities, regions or countries in the Geography section
                below.
              </p>
            ) : (
              <div className="text-xs text-slate-700 space-y-1">
                <div className="font-semibold">
                  Included location{form.adSet.locations.filter((l) => !l.excluded).length === 1 ? "" : "s"}:
                </div>
                <ul className="list-disc pl-5 space-y-0.5">
                  {form.adSet.locations
                    .filter((l) => !l.excluded)
                    .map((l) => (
                      <li key={l.key}>{l.name}</li>
                    ))}
                </ul>
                {form.adSet.locations.some((l) => l.excluded) && (
                  <>
                    <div className="font-semibold pt-1">Excluded:</div>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {form.adSet.locations
                        .filter((l) => l.excluded)
                        .map((l) => (
                          <li key={l.key}>{l.name}</li>
                        ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>

          {/* India policy declaration prompt */}
          {targetsIndia && (
            <div className="flex items-start gap-2.5 rounded-xl border-l-4 border-amber-400 bg-amber-50/70 px-4 py-3">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-xs text-amber-900 leading-relaxed">
                  To run ads in India, you need to declare if your ads are related to securities and
                  investments.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      adSet: {
                        ...f.adSet,
                        policyDeclarations: {
                          ...f.adSet.policyDeclarations,
                          securitiesAndInvestments:
                            !f.adSet.policyDeclarations?.securitiesAndInvestments,
                        },
                      },
                    }))
                  }
                  className="text-xs font-bold text-slate-900 border border-slate-300 bg-white rounded-lg px-3 py-1.5 hover:bg-slate-50"
                >
                  {form.adSet.policyDeclarations?.securitiesAndInvestments
                    ? "Declaration: Securities & Investments"
                    : "Review requirements"}
                </button>
              </div>
            </div>
          )}

          {/* Show / Hide options */}
          <button
            type="button"
            onClick={() => setShowAudienceControlsOptions((v) => !v)}
            className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            {showAudienceControlsOptions ? "Hide options" : "Show options"}
          </button>

          {showAudienceControlsOptions && (
            <div className="space-y-5 pt-2">
              {/* Minimum age */}
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Minimum age
                </div>
                <ul className="list-disc pl-5 text-xs text-slate-700 space-y-0.5">
                  <li>{form.adSet.ageMin}</li>
                  <li>Unknown age on WhatsApp: Excluded</li>
                </ul>
              </div>

              {/* Exclude these custom audiences */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Exclude these custom audiences
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={excludeAudienceSearch}
                    onChange={(e) => setExcludeAudienceSearch(e.target.value)}
                    placeholder="Search existing audiences"
                    className="h-11 pl-10 rounded-xl border-slate-200"
                  />
                </div>
                {excludeAudienceSearch.trim().length >= 1 && allAudiences.length > 0 && (
                  <div className="border border-slate-100 rounded-xl bg-white max-h-44 overflow-y-auto">
                    {allAudiences
                      .filter((a: any) =>
                        a.name.toLowerCase().includes(excludeAudienceSearch.toLowerCase())
                      )
                      .map((a: any) => {
                        const alreadyExcluded = form.adSet.customAudiences.find(
                          (sel) => sel.id === a.id && sel.excluded
                        );
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                              setForm((f) => {
                                const existing = f.adSet.customAudiences.find((x) => x.id === a.id);
                                if (existing) {
                                  return {
                                    ...f,
                                    adSet: {
                                      ...f.adSet,
                                      customAudiences: f.adSet.customAudiences.map((x) =>
                                        x.id === a.id ? { ...x, excluded: true } : x
                                      ),
                                    },
                                  };
                                }
                                return {
                                  ...f,
                                  adSet: {
                                    ...f.adSet,
                                    customAudiences: [
                                      ...f.adSet.customAudiences,
                                      {
                                        id: a.id,
                                        name: a.name,
                                        audienceType: a.type,
                                        excluded: true,
                                      },
                                    ],
                                  },
                                };
                              });
                              setExcludeAudienceSearch("");
                            }}
                            disabled={!!alreadyExcluded}
                            className={cn(
                              "w-full text-left px-4 py-2 hover:bg-rose-50 border-b border-slate-50 last:border-0 flex items-center justify-between text-sm",
                              alreadyExcluded && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <span className="font-semibold text-slate-900">{a.name}</span>
                            <span className="text-[10px] text-rose-600 font-bold uppercase">
                              {alreadyExcluded ? "Excluded" : "Exclude"}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Languages */}
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Languages
                </div>
                <p className="text-xs text-slate-700">
                  {(form.adSet.languages?.length ?? 0) === 0
                    ? "All languages"
                    : `${form.adSet.languages?.length} language${form.adSet.languages?.length === 1 ? "" : "s"}`}
                </p>
              </div>

              {/* Suggest an audience sub-block matching Screenshot 4 */}
              {isAppPromotion && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    Suggest an audience
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-505 leading-normal">
                    We'll reach people beyond these settings when it's likely to improve performance.
                  </p>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Button
                        variant="outline"
                        className="h-9 text-xs font-bold rounded-xl border-slate-200"
                        onClick={() => {
                          fetchSuggestions();
                          setShowSuggestionsDropdown(true);
                        }}
                      >
                        {isFetchingSuggestions ? "Loading..." : "+ Add suggestions (optional)"}
                      </Button>
                      
                      {showSuggestionsDropdown && (
                        <div 
                          className="fixed inset-0 z-40 bg-transparent" 
                          onClick={() => setShowSuggestionsDropdown(false)}
                        />
                      )}
                      
                      {showSuggestionsDropdown && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 divide-y divide-slate-50">
                          <div className="p-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Suggested Targeting</span>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {suggestions.map((s, i) => (
                              <button
                                key={i}
                                type="button"
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between group relative z-50"
                                onClick={() => {
                                  setForm(f => ({
                                    ...f,
                                    adSet: {
                                      ...f.adSet,
                                      interests: [
                                        ...f.adSet.interests,
                                        { id: s.id, name: s.name }
                                      ]
                                    }
                                  }));
                                  setShowSuggestionsDropdown(false);
                                }}
                              >
                                <div>
                                  <div className="text-sm font-bold text-slate-800">{s.name}</div>
                                  {(s.audience_size_lower_bound || s.audience_size_upper_bound) && (
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                      Size: {s.audience_size_lower_bound?.toLocaleString()} - {s.audience_size_upper_bound?.toLocaleString()}
                                    </div>
                                  )}
                                </div>
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                                  <span className="text-sm leading-none">+</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      className="h-9 text-xs font-bold rounded-xl border-slate-200 ml-auto"
                      onClick={() => setSaveAudienceModalOpen(true)}
                    >
                      Save audience
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </FormSection>
      )}

        {/* Audience controls modal — account-scoped toggles */}
        <Dialog open={audienceControlsModalOpen} onOpenChange={setAudienceControlsModalOpen}>
          <DialogContent className="max-w-xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900">
                Audience controls for this ad account
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 leading-relaxed">
                Location and age controls apply to all campaigns. Brand protection and employee
                controls do not currently apply to Advantage+ app and Advantage+ shopping
                campaigns. You can make them more specific for individual campaigns (except
                Advantage+ shopping campaigns).{" "}
                <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                  Learn more
                </a>{" "}
                about audience limitations in Special Ad Categories campaigns.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <AudienceControlRow
                label="My business can only advertise in specific locations"
                checked={!!form.adSet.audienceControls?.specificLocationsOnly}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    adSet: {
                      ...f.adSet,
                      audienceControls: {
                        ...f.adSet.audienceControls,
                        specificLocationsOnly: v,
                      },
                    },
                  }))
                }
              />
              <AudienceControlRow
                label="My business advertises age-restricted goods or services"
                checked={!!form.adSet.audienceControls?.ageRestrictedGoods}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    adSet: {
                      ...f.adSet,
                      audienceControls: {
                        ...f.adSet.audienceControls,
                        ageRestrictedGoods: v,
                      },
                    },
                  }))
                }
              />
              <AudienceControlRow
                label="My business restricts advertising to some audiences to protect its brand"
                checked={!!form.adSet.audienceControls?.brandProtection}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    adSet: {
                      ...f.adSet,
                      audienceControls: {
                        ...f.adSet.audienceControls,
                        brandProtection: v,
                      },
                    },
                  }))
                }
              />

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setAudienceControlsModalShowOptions((v) => !v)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  {audienceControlsModalShowOptions ? "Hide options" : "Show options"}
                </button>
              </div>
              {audienceControlsModalShowOptions && (
                <AudienceControlRow
                  label="My business doesn't show ads to its own employees"
                  checked={!!form.adSet.audienceControls?.excludeEmployees}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      adSet: {
                        ...f.adSet,
                        audienceControls: {
                          ...f.adSet.audienceControls,
                          excludeEmployees: v,
                        },
                      },
                    }))
                  }
                />
              )}
            </div>

            <DialogFooter className="flex sm:justify-between items-center w-full">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                See controls in advertising settings
              </a>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAudienceControlsModalOpen(false)}
                  className="h-9 rounded-lg"
                  disabled={isUpdatingAccountSettings}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isUpdatingAccountSettings}
                  onClick={() => {
                    if (form.campaign.accountId && form.adSet.audienceControls) {
                      updateAccountSettings(
                        { accountId: form.campaign.accountId, payload: form.adSet.audienceControls, clientId: clientId ?? undefined },
                        {
                          onSuccess: () => {
                            setAudienceControlsModalOpen(false);
                          }
                        }
                      );
                    } else {
                      setAudienceControlsModalOpen(false);
                    }
                  }}
                  className="h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUpdatingAccountSettings ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {!isAppPromotion && (
          <>
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
          </>
        )}

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
              {allAudiences.map((a: any) => {
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

        <FormSection
          title="Ad Placement"
          description="Where your ads will appear across Meta."
          icon={LayoutGrid}
          rightSlot={isAppPromotion && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5 shadow-sm shrink-0">
              <Sparkles className="w-2.5 h-2.5" /> Advantage+ on
            </span>
          )}
        >
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

        {/* Save Audience Modal */}
        <Dialog open={saveAudienceModalOpen} onOpenChange={setSaveAudienceModalOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900">
                Save Audience
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Give your audience a memorable name so you can reuse it later.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600 block mb-2">
                Audience Name
              </label>
              <Input
                value={saveAudienceName}
                onChange={(e) => setSaveAudienceName(e.target.value)}
                placeholder="e.g. US Tech Enthusiasts (18-35)"
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setSaveAudienceModalOpen(false)}
                className="h-9 rounded-lg"
                disabled={isSavingAudience}
              >
                Cancel
              </Button>
              <Button
                disabled={!saveAudienceName.trim() || isSavingAudience}
                onClick={() => {
                  if (form.campaign.accountId && form.adSet.locations.length > 0) {
                    createSavedAudience(
                      { 
                        accountId: form.campaign.accountId, 
                        payload: { name: saveAudienceName, targeting: buildTargetingForSavedAudience(form.adSet) as any }, 
                        clientId: clientId ?? undefined 
                      },
                      {
                        onSuccess: () => {
                          setSaveAudienceModalOpen(false);
                          setSaveAudienceName("");
                        }
                      }
                    );
                  }
                }}
                className="h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSavingAudience ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </Card>
  );
}

// Row inside the Audience controls modal — left-aligned toggle, right-aligned
// label. Native checkbox-based Switch (not Radix).
function AudienceControlRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm text-slate-800 leading-snug">{label}</span>
    </label>
  );
}
