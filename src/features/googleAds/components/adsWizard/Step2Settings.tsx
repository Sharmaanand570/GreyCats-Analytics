import { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Globe,
  Languages,
  MapPin,
  Network,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  LANGUAGE_OPTIONS,
  NETWORK_OPTIONS,
  type StepProps,
} from "./types";
import { useGoogleAdsLocations } from "../../hooks/useGoogleAdsManager";
import { DaypartingGrid } from "./DaypartingGrid";
import type {
  GoogleAdsNetwork,
  LocationPreset,
  LocationTargetMode,
  SelectedLocation,
} from "../../API/googleAdsManagerApi";

function FieldError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </div>
  );
}

function LocationsPicker({
  selected,
  onChange,
}: {
  selected: SelectedLocation[];
  onChange: (next: SelectedLocation[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: results, isLoading } = useGoogleAdsLocations(query);

  const add = (loc: SelectedLocation) => {
    if (selected.some((s) => s.id === loc.id)) return;
    onChange([...selected, loc]);
    setQuery("");
  };

  const toggleExclude = (id: string) => {
    onChange(
      selected.map((s) =>
        s.id === id ? { ...s, excluded: !s.excluded } : s
      )
    );
  };

  const remove = (id: string) => {
    onChange(selected.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search cities, regions, or countries…"
              className="h-11 pl-10 rounded-xl border-slate-200 bg-white"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[--radix-popover-trigger-width] max-h-[280px] overflow-y-auto"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {query.trim().length < 2 ? (
            <div className="px-3 py-4 text-xs text-slate-500">
              Type at least 2 characters to search.
            </div>
          ) : isLoading ? (
            <div className="px-3 py-4 text-xs text-slate-500">Searching…</div>
          ) : (results?.length ?? 0) === 0 ? (
            <div className="px-3 py-4 text-xs text-slate-500">
              No matches for “{query}”.
            </div>
          ) : (
            <div className="py-1">
              {results!.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => add(loc)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">
                      {loc.name}
                    </div>
                    {loc.canonicalName && (
                      <div className="text-[10px] text-slate-400 truncate">
                        {loc.canonicalName}
                      </div>
                    )}
                  </div>
                  {loc.type && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 shrink-0">
                      {loc.type}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((s) => (
            <div
              key={s.id}
              className={cn(
                "inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-semibold",
                s.excluded
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-blue-200 bg-blue-50/60 text-[#1A73E8]"
              )}
            >
              <MapPin className="w-3 h-3" />
              <span className="max-w-[180px] truncate">{s.name}</span>
              <button
                type="button"
                onClick={() => toggleExclude(s.id)}
                className="text-[9px] uppercase tracking-wider font-bold opacity-60 hover:opacity-100"
              >
                {s.excluded ? "Include" : "Exclude"}
              </button>
              <button
                type="button"
                onClick={() => remove(s.id)}
                className="opacity-60 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LanguagePicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const remove = (id: string) => onChange(selected.filter((s) => s !== id));
  const available = LANGUAGE_OPTIONS.filter((o) => !selected.includes(o.value));

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((id) => {
            const opt = LANGUAGE_OPTIONS.find((o) => o.value === id);
            return (
              <div
                key={id}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
              >
                <Languages className="w-3 h-3 text-slate-400" />
                {opt?.label ?? id}
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="opacity-60 hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {available.length > 0 && (
        <Select
          value=""
          onValueChange={(v) => onChange([...selected, v])}
        >
          <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white text-sm">
            <SelectValue placeholder="Add a language…" />
          </SelectTrigger>
          <SelectContent>
            {available.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export function Step2Settings({ form, setForm, showAllErrors }: StepProps) {
  const hasNameError = !!showAllErrors && !form.campaignName.trim();
  const hasNetworkError = !!showAllErrors && form.networks.length === 0;
  const hasLocationError =
    !!showAllErrors &&
    form.locationMode === "CUSTOM" &&
    form.locations.filter((l) => !l.excluded).length === 0;

  const toggleNetwork = (n: GoogleAdsNetwork) => {
    setForm((f) =>
      f.networks.includes(n)
        ? { ...f, networks: f.networks.filter((x) => x !== n) }
        : { ...f, networks: [...f.networks, n] }
    );
  };

  // SEARCH_PARTNERS only available when SEARCH is on.
  const isSearchOn = form.networks.includes("SEARCH");

  const networkOptions = useMemo(() => {
    return NETWORK_OPTIONS.filter((o) => {
      if (o.value === "SEARCH_PARTNERS" && !isSearchOn) return false;
      return true;
    });
  }, [isSearchOn]);

  return (
    <div className="space-y-6 w-full">
      {/* Campaign name */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          Campaign name
        </div>
        <p className="text-xs text-slate-500">
          Internal name — won't be shown to people who see your ads.
        </p>
        <Input
          value={form.campaignName}
          onChange={(e) =>
            setForm((f) => ({ ...f, campaignName: e.target.value }))
          }
          placeholder="e.g. Summer Sale — Search — US"
          className={cn(
            "h-11 rounded-xl border-slate-200 bg-white",
            hasNameError && "border-rose-400 focus-visible:ring-rose-300"
          )}
        />
        {hasNameError && <FieldError message="Campaign name is required." />}
      </div>

      {/* Networks */}
      {form.campaignType === "SEARCH" && (
        <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Network className="w-5 h-5 text-slate-400 shrink-0" />
            Networks
          </div>
          <p className="text-xs text-slate-500">
            Where your ads can show. We recommend Google Search for most campaigns.
          </p>
          <div className="space-y-2">
            {networkOptions.map((opt) => {
              const checked = form.networks.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all",
                    checked
                      ? "border-[#1A73E8] bg-blue-50/30"
                      : "border-slate-200 bg-white hover:bg-slate-50/50"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleNetwork(opt.value)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-900">
                      {opt.label}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {opt.hint}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
          {hasNetworkError && (
            <FieldError message="Pick at least one network." />
          )}
        </div>
      )}

      {/* Location targeting */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Globe className="w-5 h-5 text-slate-400 shrink-0" />
          Locations
          <RequiredMark />
        </div>

        <div className="space-y-2">
          {(
            [
              { v: "ALL_COUNTRIES", l: "All countries and territories" },
              { v: "LOCAL_COUNTRY", l: "Your country (default)" },
              { v: "CUSTOM", l: "Enter another location" },
            ] as { v: LocationTargetMode; l: string }[]
          ).map((opt) => (
            <label
              key={opt.v}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 cursor-pointer transition-all",
                form.locationMode === opt.v
                  ? "border-[#1A73E8] bg-blue-50/30"
                  : "border-slate-200 bg-white hover:bg-slate-50/50"
              )}
            >
              <input
                type="radio"
                name="locationMode"
                checked={form.locationMode === opt.v}
                onChange={() =>
                  setForm((f) => ({ ...f, locationMode: opt.v }))
                }
                className="w-4 h-4 accent-[#1A73E8]"
              />
              <span className="text-sm font-semibold text-slate-800">
                {opt.l}
              </span>
            </label>
          ))}
        </div>

        {form.locationMode === "CUSTOM" && (
          <div className="pt-2">
            <LocationsPicker
              selected={form.locations}
              onChange={(next) => setForm((f) => ({ ...f, locations: next }))}
            />
            {hasLocationError && (
              <div className="mt-2">
                <FieldError message="Add at least one included location." />
              </div>
            )}
          </div>
        )}

        {/* Location presets */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Advanced location options
          </label>
          <Select
            value={form.locationPreset}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, locationPreset: v as LocationPreset }))
            }
          >
            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white w-full sm:w-[320px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRESENCE_OR_INTEREST">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Presence or Interest</span>
                  <span className="text-[10px] text-slate-400">
                    People in, regularly in, or who showed interest (Google default)
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="PRESENCE_ONLY">
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Presence only</span>
                  <span className="text-[10px] text-slate-400">
                    People physically in your targeted locations
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Languages */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Languages className="w-5 h-5 text-slate-400 shrink-0" />
          Languages
        </div>
        <p className="text-xs text-slate-500">
          Languages your customers speak. Choose one or many.
        </p>
        <LanguagePicker
          selected={form.languageIds}
          onChange={(next) => setForm((f) => ({ ...f, languageIds: next }))}
        />
      </div>

      {/* Ad scheduling */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
          Ad schedule
        </div>
        <p className="text-xs text-slate-500">
          When your ads can run. Leave empty to run 24/7.
        </p>
        <DaypartingGrid
          schedule={form.adSchedule}
          onChange={(next) => setForm((f) => ({ ...f, adSchedule: next }))}
        />
        {form.adSchedule.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setForm((f) => ({ ...f, adSchedule: [] }))}
            className="h-9 rounded-lg border-slate-200 text-xs font-bold text-slate-600"
          >
            Clear schedule (run 24/7)
          </Button>
        )}
      </div>

      {/* Campaign Start and End Dates */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
          Campaign start and end dates
        </div>
        <p className="text-xs text-slate-500">
          Define the active duration for this campaign.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Start date
            </label>
            <Input
              type="date"
              value={form.campaignStartDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, campaignStartDate: e.target.value }))
              }
              className="h-11 rounded-xl border-slate-200 bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              End date
              <Checkbox
                checked={form.campaignEndDate !== ""}
                onCheckedChange={(checked) =>
                  setForm((f) => ({
                    ...f,
                    campaignEndDate: checked
                      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split("T")[0]
                      : "",
                  }))
                }
                id="set-end-date"
              />
              <span className="normal-case text-[10px] text-slate-400 font-semibold cursor-pointer select-none" onClick={() => document.getElementById("set-end-date")?.click()}>
                Set an end date
              </span>
            </label>
            <Input
              type="date"
              value={form.campaignEndDate}
              disabled={form.campaignEndDate === ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, campaignEndDate: e.target.value }))
              }
              className="h-11 rounded-xl border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Ad Rotation */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <RefreshCw className="w-5 h-5 text-slate-400 shrink-0" />
          Ad rotation
        </div>
        <p className="text-xs text-slate-500">
          Choose how to rotate multiple ads in your ad groups.
        </p>
        <div className="space-y-2">
          {(
            [
              {
                v: "OPTIMIZE",
                l: "Optimize: Prefer best performing ads",
                h: "Google automatically optimizes your bids to show the ads expected to get more clicks or conversions.",
              },
              {
                v: "ROTATE_FOREVER",
                l: "Do not optimize: Rotate ads indefinitely",
                h: "Delivers your ads more evenly into the ad auction without optimization. Not recommended for most advertisers.",
              },
            ] as const
          ).map((opt) => (
            <label
              key={opt.v}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all",
                form.adRotation === opt.v
                  ? "border-[#1A73E8] bg-blue-50/30"
                  : "border-slate-200 bg-white hover:bg-slate-50/50"
              )}
            >
              <input
                type="radio"
                name="adRotation"
                checked={form.adRotation === opt.v}
                onChange={() => setForm((f) => ({ ...f, adRotation: opt.v }))}
                className="w-4 h-4 mt-0.5 accent-[#1A73E8]"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800">
                  {opt.l}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {opt.h}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
