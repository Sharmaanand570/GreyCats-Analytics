import { useState } from "react";
import { Search, X, Loader2, MapPin, Ban } from "lucide-react";
import { useLocationSearch } from "../hooks/useCampaignLookups";

export interface SelectedGeo {
  id: string;
  name: string;
  excluded?: boolean;
}

interface LocationSelectorProps {
  /** Currently selected geo targets (included + excluded). */
  value: SelectedGeo[];
  onChange: (next: SelectedGeo[]) => void;
}

/**
 * Real Google Ads location targeting selector.
 * Autocompletes against GET /google-ads/manage/locations (GeoTargetConstants)
 * and lets the user target or exclude specific locations by criterion ID.
 */
export default function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data: results = [], isFetching } = useLocationSearch(query);

  const selectedIds = new Set(value.map((v) => v.id));

  const add = (geo: { id: string; name: string }, excluded: boolean) => {
    if (selectedIds.has(geo.id)) return;
    onChange([...value, { id: geo.id, name: geo.name, excluded }]);
    setQuery("");
    setOpen(false);
  };

  const remove = (id: string) => onChange(value.filter((v) => v.id !== id));

  const included = value.filter((v) => !v.excluded);
  const excluded = value.filter((v) => v.excluded);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full max-w-[440px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isFetching ? (
            <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-slate-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search for a location (city, region, country)"
          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />

        {open && query.trim().length >= 2 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 shadow-lg rounded-md max-h-[280px] overflow-y-auto z-[100] py-1">
            {results.length === 0 && !isFetching && (
              <div className="px-4 py-3 text-[13px] text-slate-500 text-center">No locations found</div>
            )}
            {results.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[13px] text-slate-800 truncate">{loc.canonicalName || loc.name}</span>
                  {loc.type && <span className="text-[11px] text-slate-400 shrink-0">{loc.type}</span>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onMouseDown={(e) => { e.preventDefault(); add({ id: loc.id, name: loc.canonicalName || loc.name }, false); }}
                    className="text-[11px] font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                  >
                    Target
                  </button>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); add({ id: loc.id, name: loc.canonicalName || loc.name }, true); }}
                    className="text-[11px] font-medium text-slate-500 hover:bg-slate-100 px-2 py-1 rounded"
                  >
                    Exclude
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {included.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {included.map((g) => (
            <span key={g.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-[13px] text-blue-800">
              <MapPin className="w-3 h-3" />
              {g.name}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-blue-900" onClick={() => remove(g.id)} />
            </span>
          ))}
        </div>
      )}

      {excluded.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {excluded.map((g) => (
            <span key={g.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 bg-slate-100 text-[13px] text-slate-600">
              <Ban className="w-3 h-3" />
              {g.name}
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900" onClick={() => remove(g.id)} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
