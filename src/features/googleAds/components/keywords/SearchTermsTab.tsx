import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  useSearchTerms,
  useAddKeywords,
  useAddNegativeKeywords,
} from "../../hooks/useCampaignManagement";
import {
  TableSkeletonRows,
  EmptyState,
  ErrorState,
  TableToolbar,
  fmtCurrency,
  fmtNumber,
  fmtPercent,
} from "../ui/GoogleAdsShared";
import { useGoogleAdsStore } from "../../store/useGoogleAdsStore";
import type { SearchTerm } from "../../types/googleAds.types";

// ─────────────────────────────────────────────────────────────
// SEARCH TERMS ROW
// ─────────────────────────────────────────────────────────────

interface SearchTermRowProps {
  term: SearchTerm;
  selected: boolean;
  onToggle: () => void;
}

function SearchTermRow({ term, selected, onToggle }: SearchTermRowProps) {
  const m = term.metrics;
  
  // formatting match type for display
  const matchTypeDisplay = term.matchType.replace("_", " ").toLowerCase();

  return (
    <tr
      className={cn(
        "border-b border-slate-100 hover:bg-slate-50/60 transition-colors",
        selected && "bg-blue-50/40"
      )}
    >
      <td className="px-4 py-3 w-10">
        <Checkbox checked={selected} onCheckedChange={onToggle} className="border-slate-300" />
      </td>
      <td className="px-4 py-3 font-semibold text-slate-800" style={{ minWidth: "200px" }}>
        {term.searchTerm}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 capitalize">
        {matchTypeDisplay}
      </td>
      <td className="px-4 py-3 text-sm">
        {term.status === "ADDED" ? (
          <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded text-[11px] uppercase">Added</span>
        ) : term.status === "EXCLUDED" ? (
          <span className="text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded text-[11px] uppercase">Excluded</span>
        ) : term.status === "ADDED_EXCLUDED" ? (
          <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded text-[11px] uppercase">Added & Excluded</span>
        ) : (
          <span className="text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded text-[11px] uppercase">None</span>
        )}
      </td>
      <td className="px-4 py-3 text-[11px] text-slate-500 max-w-[150px] truncate">
        {term.campaignName}
      </td>
      <td className="px-4 py-3 text-[11px] text-slate-500 max-w-[150px] truncate">
        {term.adGroupName}
      </td>
      
      {/* Metrics */}
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{fmtNumber(m.impressions)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{fmtNumber(m.clicks)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{fmtPercent(m.ctr)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{fmtCurrency(m.averageCpc)}</td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800 tabular-nums">{fmtCurrency(m.cost)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{m.conversions.toFixed(2)}</td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// SEARCH TERMS TAB
// ─────────────────────────────────────────────────────────────

interface SearchTermsTabProps {
  clientId: number;
  campaignId?: string;
  adGroupId?: string;
}

export function SearchTermsTab({ clientId, campaignId, adGroupId }: SearchTermsTabProps) {
  const { dateRange } = useGoogleAdsStore();
  const [search, setSearch] = useState("");
  const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set());

  const queryParams = {
    ...(campaignId && { campaignId }),
    ...(adGroupId && { adGroupId }),
    ...dateRange,
  };

  const { data, isLoading, isError, error, refetch } = useSearchTerms(clientId, queryParams);
  
  // Note: we can only bulk add/exclude if we know the ad group for each term
  // We'll group them by ad group id and submit separate mutations if we implement bulk actions
  const addMutation = useAddKeywords(clientId, adGroupId ?? "", campaignId); 
  const addNegativeMutation = useAddNegativeKeywords(clientId);

  const terms = useMemo(() => data?.searchTerms ?? [], [data?.searchTerms]);
  const visible = useMemo(
    () => terms.filter((t) => t.searchTerm.toLowerCase().includes(search.toLowerCase())),
    [terms, search]
  );

  const allSelected = visible.length > 0 && visible.every((t) => selectedTerms.has(t.searchTerm));

  function toggleAll() {
    if (allSelected) setSelectedTerms(new Set());
    else setSelectedTerms(new Set(visible.map((t) => t.searchTerm)));
  }

  function toggleOne(term: string) {
    setSelectedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(term)) {
        next.delete(term);
      } else {
        next.add(term);
      }
      return next;
    });
  }

  // Simplified Add as Keyword action
  function handleAddAsKeyword() {
    // In a real implementation, you'd want to map these to their respective ad groups
    // For now, if we are in an ad group context, we can just add them.
    if (!adGroupId) {
       alert("Adding search terms from Campaign level requires selecting an Ad Group (coming soon). Please go to Ad Group level.");
       return;
    }
    
    const keywordsToAdd = [...selectedTerms].map(term => ({
        text: term,
        matchType: "EXACT" as const,
    }));
    
    addMutation.mutate({ keywords: keywordsToAdd }, {
        onSuccess: () => setSelectedTerms(new Set())
    });
  }

  // Simplified Add as Negative Keyword action
  function handleAddAsNegativeKeyword() {
    // Add as exact match negative keywords at campaign level by default for simplicity,
    // or ad group level if adGroupId is present
    const payload = {
        keywords: [...selectedTerms].map(term => ({
            text: term,
            matchType: "EXACT" as const,
            level: adGroupId ? "AD_GROUP" as const : "CAMPAIGN" as const,
            campaignId: campaignId,
            adGroupId: adGroupId,
        }))
    };
    
    addNegativeMutation.mutate(payload, {
        onSuccess: () => setSelectedTerms(new Set())
    });
  }

  const COLS = [
    { label: "Search term", align: "left" as const },
    { label: "Match type", align: "left" as const },
    { label: "Added/Excluded", align: "left" as const },
    { label: "Campaign", align: "left" as const },
    { label: "Ad group", align: "left" as const },
    { label: "Impr.", align: "right" as const },
    { label: "Clicks", align: "right" as const },
    { label: "CTR", align: "right" as const },
    { label: "Avg. CPC", align: "right" as const },
    { label: "Cost", align: "right" as const },
    { label: "Conv.", align: "right" as const },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter search terms…"
        leftActions={
          selectedTerms.size > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs text-slate-500 font-medium mr-2">
                {selectedTerms.size} selected
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddAsKeyword} 
                className="gap-1.5 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                disabled={addMutation.isPending || (!adGroupId)}
              >
                <Plus className="w-3.5 h-3.5" />
                Add as keyword
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddAsNegativeKeyword} 
                className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50"
                disabled={addNegativeMutation.isPending || (!campaignId && !adGroupId)}
              >
                <Plus className="w-3.5 h-3.5" />
                Add as negative keyword
              </Button>
            </div>
          )
        }
      />

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr className="border-b border-slate-200">
              <th className="w-10 px-4 py-3">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} className="border-slate-300" />
              </th>
              {COLS.map((col) => (
                <th
                  key={col.label}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap",
                    col.align === "right" ? "text-right" : "text-left"
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeletonRows rows={5} cols={COLS.length + 1} />
            ) : isError ? (
              <tr>
                <td colSpan={COLS.length + 1}>
                  <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={COLS.length + 1}>
                  <EmptyState
                    title="No search terms found"
                    description="Search terms will appear here once your ads receive traffic."
                  />
                </td>
              </tr>
            ) : (
              visible.map((term, index) => (
                <SearchTermRow
                  key={`${term.searchTerm}-${index}`}
                  term={term}
                  selected={selectedTerms.has(term.searchTerm)}
                  onToggle={() => toggleOne(term.searchTerm)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
