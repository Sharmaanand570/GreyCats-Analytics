import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import {
  useAudiences,
  useBrowseTargeting,
  useSearchInterests,
  useSearchLocations,
} from "@/features/meta/hooks/useMetaAdsManager";
import {
  DETAILED_TARGETING_OPTIONS,
  MAX_DETAILED_TARGETING,
  PLACEMENT_OPTIONS,
  AGE_MIN_FLOOR,
  AGE_MAX_CEILING,
  toSelectedInterest,
  toSelectedLocation,
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

  const locQuery = useDebouncedValue(locInput);
  const intQuery = useDebouncedValue(intInput);
  const dtQuery = useDebouncedValue(dtInput);

  const { data: locResults, isFetching: isFetchingLoc } = useSearchLocations(locQuery);
  const { data: intResults, isFetching: isFetchingInt } = useSearchInterests(intQuery);
  const { data: dtResults, isFetching: isFetchingDt } = useBrowseTargeting(dtType, dtQuery);
  const { data: audiencesData, isLoading: isLoadingAudiences } = useAudiences(clientId);
  const allAudiences = audiencesData?.audiences ?? [];

  const toggleAudience = (id: string, name: string, audienceType: "CUSTOM" | "WEBSITE" | "LOOKALIKE") =>
    setForm((f) => {
      const existing = f.customAudiences.find((a) => a.id === id);
      if (existing) {
        return { ...f, customAudiences: f.customAudiences.filter((a) => a.id !== id) };
      }
      return { ...f, customAudiences: [...f.customAudiences, { id, name, audienceType }] };
    });

  const toggleAudienceExcluded = (id: string) =>
    setForm((f) => ({
      ...f,
      customAudiences: f.customAudiences.map((a) =>
        a.id === id ? { ...a, excluded: !a.excluded } : a
      ),
    }));

  const removeAudience = (id: string) =>
    setForm((f) => ({ ...f, customAudiences: f.customAudiences.filter((a) => a.id !== id) }));

  const dtAtCap = form.detailedTargeting.length >= MAX_DETAILED_TARGETING;

  const addDetailedTargeting = (
    item: { id: string; name: string },
    type: DetailedTargetingType
  ) => {
    setForm((f) => {
      if (f.detailedTargeting.find((x) => x.id === item.id && x.type === type)) return f;
      if (f.detailedTargeting.length >= MAX_DETAILED_TARGETING) return f;
      return {
        ...f,
        detailedTargeting: [...f.detailedTargeting, { id: item.id, name: item.name, type }],
      };
    });
    setDtInput("");
  };

  const removeDetailedTargeting = (id: string, type: DetailedTargetingType) =>
    setForm((f) => ({
      ...f,
      detailedTargeting: f.detailedTargeting.filter((x) => !(x.id === id && x.type === type)),
    }));

  const locationsAtCap = form.locations.length >= MAX_LOCATIONS;
  const interestsAtCap = form.interests.length >= MAX_INTERESTS;

  const addLocation = (loc: ReturnType<typeof toSelectedLocation>) => {
    setForm((f) => {
      if (f.locations.find((l) => l.key === loc.key)) return f;
      if (f.locations.length >= MAX_LOCATIONS) return f;
      return { ...f, locations: [...f.locations, loc] };
    });
    setLocInput("");
  };

  const removeLocation = (key: string) =>
    setForm((f) => ({ ...f, locations: f.locations.filter((l) => l.key !== key) }));

  const toggleLocationExcluded = (key: string) =>
    setForm((f) => ({
      ...f,
      locations: f.locations.map((l) =>
        l.key === key ? { ...l, excluded: !l.excluded } : l
      ),
    }));

  const addInterest = (i: { id: string; name: string }) => {
    setForm((f) => {
      if (f.interests.find((x) => x.id === i.id)) return f;
      if (f.interests.length >= MAX_INTERESTS) return f;
      return { ...f, interests: [...f.interests, i] };
    });
    setIntInput("");
  };

  const removeInterest = (id: string) =>
    setForm((f) => ({ ...f, interests: f.interests.filter((x) => x.id !== id) }));

  const toggleInterestExcluded = (id: string) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.map((x) =>
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
              {form.locations.length} / {MAX_LOCATIONS}
            </span>
          </div>

          {form.locations.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {form.locations.map((l) => (
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
              {form.interests.length} / {MAX_INTERESTS}
            </span>
          </div>

          {form.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {form.interests.map((i) => (
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
              {form.detailedTargeting.length} / {MAX_DETAILED_TARGETING}
            </span>
          </div>

          {form.detailedTargeting.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {form.detailedTargeting.map((item) => {
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
                {form.customAudiences.length} selected
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
          {form.customAudiences.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {form.customAudiences.map((a) => (
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
                const selected = form.customAudiences.find((sel) => sel.id === a.id);
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
                    max={form.ageMax}
                    value={form.ageMin}
                    onChange={(e) => {
                      const next = Math.max(
                        AGE_MIN_FLOOR,
                        Math.min(form.ageMax, Number(e.target.value) || AGE_MIN_FLOOR)
                      );
                      setForm((f) => ({ ...f, ageMin: next }));
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
                    min={form.ageMin}
                    max={AGE_MAX_CEILING}
                    value={form.ageMax}
                    onChange={(e) => {
                      const next = Math.min(
                        AGE_MAX_CEILING,
                        Math.max(form.ageMin, Number(e.target.value) || form.ageMin)
                      );
                      setForm((f) => ({ ...f, ageMax: next }));
                    }}
                    className="h-11 rounded-xl border-slate-200 mt-1"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Meta requires {AGE_MIN_FLOOR}+ minimum. {form.ageMax === AGE_MAX_CEILING ? `${AGE_MAX_CEILING} = 65+ (no upper bound).` : ""}
              </p>
            </div>

            {/* Gender */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["ALL", "MEN", "WOMEN"] as Gender[]).map((g) => {
                  const isActive = form.gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, gender: g }))}
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
                const isActive = form.placements.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        placements: isActive
                          ? f.placements.filter((p) => p !== opt.value)
                          : ([...f.placements, opt.value] as Placement[]),
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
              {form.placements.length === 0
                ? "Auto placements — Meta decides where the ad appears (recommended for new advertisers)."
                : `Restricted to ${form.placements.length} placement${form.placements.length === 1 ? "" : "s"}.`}
            </p>
          </div>
        </FormSection>

      </div>
    </Card>
  );
}
