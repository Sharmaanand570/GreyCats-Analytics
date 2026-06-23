import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Trash2,
  Edit2,
  // @ts-expect-error unused variable
  Plus,
  // @ts-expect-error unused variable
  Filter,
  RefreshCw,
  Download,
  CheckSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
  // @ts-expect-error unused variable
import { useCampaigns, useEnableCampaign, usePauseCampaign, useRemoveCampaign, useDuplicateCampaign, useUpdateCampaignBudget } from "../../hooks/useCampaignManagement";
import {
  StatusBadge,
  CampaignTypeBadge,
  TableSkeletonRows,
  EmptyState,
  ErrorState,
  TableToolbar,
  fmtCurrency,
  fmtNumber,
  fmtPercent,
  fmtRoas,
} from "../ui/GoogleAdsShared";
import { CampaignEditDrawer } from "./CampaignEditDrawer";
import { useGoogleAdsStore } from "../../store/useGoogleAdsStore";
import type { Campaign, CampaignStatus } from "../../types/googleAds.types";

// ─────────────────────────────────────────────────────────────
// COLUMN DEFINITIONS
// ─────────────────────────────────────────────────────────────

interface ColDef {
  key: string;
  label: string;
  align?: "left" | "right";
  sortable?: boolean;
  minWidth?: string;
}

const COLUMNS: ColDef[] = [
  { key: "name", label: "Campaign", align: "left", sortable: true, minWidth: "220px" },
  { key: "status", label: "Status", align: "left" },
  { key: "campaignType", label: "Type", align: "left" },
  { key: "budget", label: "Budget", align: "right", sortable: true },
  { key: "bidStrategy", label: "Bid strategy", align: "left" },
  { key: "impressions", label: "Impr.", align: "right", sortable: true },
  { key: "clicks", label: "Clicks", align: "right", sortable: true },
  { key: "ctr", label: "CTR", align: "right", sortable: true },
  { key: "avgCpc", label: "Avg. CPC", align: "right", sortable: true },
  { key: "cost", label: "Cost", align: "right", sortable: true },
  { key: "conversions", label: "Conv.", align: "right", sortable: true },
  { key: "convRate", label: "Conv. rate", align: "right", sortable: true },
  { key: "costPerConv", label: "Cost/conv.", align: "right", sortable: true },
  { key: "roas", label: "ROAS", align: "right", sortable: true },
];

// ─────────────────────────────────────────────────────────────
// FILTER CHIP
// ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS: Array<{ value: CampaignStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All statuses" },
  { value: "ENABLED", label: "Enabled" },
  { value: "PAUSED", label: "Paused" },
  { value: "REMOVED", label: "Removed" },
];

// ─────────────────────────────────────────────────────────────
// SORT STATE
// ─────────────────────────────────────────────────────────────

type SortDir = "asc" | "desc";
interface SortState { key: string; dir: SortDir }

function sortCampaigns(campaigns: Campaign[], sort: SortState): Campaign[] {
  return [...campaigns].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;
    switch (sort.key) {
      case "name": aVal = a.name; bVal = b.name; break;
      case "budget": aVal = a.budgetAmount; bVal = b.budgetAmount; break;
      case "impressions": aVal = a.metrics.impressions; bVal = b.metrics.impressions; break;
      case "clicks": aVal = a.metrics.clicks; bVal = b.metrics.clicks; break;
      case "ctr": aVal = a.metrics.ctr; bVal = b.metrics.ctr; break;
      case "avgCpc": aVal = a.metrics.averageCpc; bVal = b.metrics.averageCpc; break;
      case "cost": aVal = a.metrics.cost; bVal = b.metrics.cost; break;
      case "conversions": aVal = a.metrics.conversions; bVal = b.metrics.conversions; break;
      case "convRate": aVal = a.metrics.conversionRate; bVal = b.metrics.conversionRate; break;
      case "costPerConv": aVal = a.metrics.costPerConversion; bVal = b.metrics.costPerConversion; break;
      case "roas": aVal = a.metrics.roas; bVal = b.metrics.roas; break;
      default: return 0;
    }
    if (aVal < bVal) return sort.dir === "asc" ? -1 : 1;
    if (aVal > bVal) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

interface LiveCampaignsTableProps {
  clientId: number;
  /** Base route prefix e.g. /data-sources/google-ads */
  baseRoute?: string;
}

export function LiveCampaignsTable({
  clientId,
  baseRoute = "/data-sources/google-ads",
}: LiveCampaignsTableProps) {
  const navigate = useNavigate();
  const { dateRange } = useGoogleAdsStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "ALL">("ALL");
  const [sort, setSort] = useState<SortState>({ key: "cost", dir: "desc" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);

  const { data, isLoading, isError, error, refetch } = useCampaigns(clientId, {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    status: statusFilter,
    search,
  });

  const enableMutation = useEnableCampaign(clientId);
  const pauseMutation = usePauseCampaign(clientId);
  const removeMutation = useRemoveCampaign(clientId);
  const duplicateMutation = useDuplicateCampaign(clientId);

  const campaigns = useMemo(() => data?.campaigns ?? [], [data?.campaigns]);

  // Client-side sort
  const sorted = useMemo(() => sortCampaigns(campaigns, sort), [campaigns, sort]);

  // Client-side search filter (if API doesn't support it)
  const visible = useMemo(
    () =>
      sorted.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [sorted, search]
  );

  // ── Selection helpers ─────────────────────────────────────
  const allSelected = visible.length > 0 && visible.every((c) => selectedIds.has(c.id));
  // @ts-expect-error unused variable
  const someSelected = visible.some((c) => selectedIds.has(c.id));

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(visible.map((c) => c.id)));
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // ── Sort handler ─────────────────────────────────────────
  function handleSort(key: string) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );
  }

  // ── Bulk actions ──────────────────────────────────────────
  function bulkEnable() {
    [...selectedIds].forEach((id) => enableMutation.mutate(id));
    setSelectedIds(new Set());
  }
  function bulkPause() {
    [...selectedIds].forEach((id) => pauseMutation.mutate(id));
    setSelectedIds(new Set());
  }
  function bulkRemove() {
    if (window.confirm(`Are you sure you want to remove ${selectedIds.size} campaigns?`)) {
      [...selectedIds].forEach((id) => removeMutation.mutate(id));
      setSelectedIds(new Set());
    }
  }
  function bulkDuplicate() {
    [...selectedIds].forEach((id) => duplicateMutation.mutate(id));
    setSelectedIds(new Set());
  }

  // ── Sort icon ─────────────────────────────────────────────
  function SortIcon({ colKey }: { colKey: string }) {
    if (sort.key !== colKey) return <span className="opacity-20">↕</span>;
    return <span>{sort.dir === "asc" ? "↑" : "↓"}</span>;
  }

  // ── Totals row ────────────────────────────────────────────
  const totals = useMemo(() => {
    const rows = visible;
    return {
      impressions: rows.reduce((s, c) => s + c.metrics.impressions, 0),
      clicks: rows.reduce((s, c) => s + c.metrics.clicks, 0),
      cost: rows.reduce((s, c) => s + c.metrics.cost, 0),
      conversions: rows.reduce((s, c) => s + c.metrics.conversions, 0),
    };
  }, [visible]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar ─────────────────────────────────────── */}
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search campaigns…"
        leftActions={
          <>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as CampaignStatus | "ALL")
              }
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </>
        }
        rightActions={
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-xs text-slate-500 font-medium">
                  {selectedIds.size} selected
                </span>
                <Button variant="outline" size="sm" onClick={bulkEnable} className="gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                  <PlayCircle className="w-3.5 h-3.5" />
                  Enable
                </Button>
                <Button variant="outline" size="sm" onClick={bulkPause} className="gap-1.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                  <PauseCircle className="w-3.5 h-3.5" />
                  Pause
                </Button>
                <Button variant="outline" size="sm" onClick={bulkDuplicate} className="gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Duplicate
                </Button>
                <Button variant="outline" size="sm" onClick={bulkRemove} className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="gap-1.5 text-slate-500"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-slate-500"
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
          </div>
        }
      />

      {/* ── Table ───────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse min-w-[1100px]">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr className="border-b border-slate-200">
              {/* Checkbox */}
              <th className="w-10 px-4 py-3 text-left">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  className="border-slate-300"
                />
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap",
                    col.align === "right" ? "text-right" : "text-left",
                    col.sortable && "cursor-pointer select-none hover:text-slate-800 transition-colors"
                  )}
                  style={{ minWidth: col.minWidth }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon colKey={col.key} />}
                  </span>
                </th>
              ))}
              {/* Actions */}
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <TableSkeletonRows rows={8} cols={COLUMNS.length + 2} />
            ) : isError ? (
              <tr>
                <td colSpan={COLUMNS.length + 2}>
                  <ErrorState
                    message={(error as Error)?.message}
                    onRetry={() => refetch()}
                  />
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 2}>
                  <EmptyState
                    title="No campaigns found"
                    description={
                      search
                        ? `No campaigns match "${search}"`
                        : "No campaigns in this account or date range."
                    }
                  />
                </td>
              </tr>
            ) : (
              visible.map((campaign) => (
                <CampaignRow
                  key={campaign.id}
                  campaign={campaign}
                  selected={selectedIds.has(campaign.id)}
                  onToggleSelect={() => toggleOne(campaign.id)}
                  onViewDetail={() =>
                    navigate(`${baseRoute}/campaigns/${campaign.id}`)
                  }
                  onEdit={() => setEditCampaign(campaign)}
                  onEnable={() => enableMutation.mutate(campaign.id)}
                  onPause={() => pauseMutation.mutate(campaign.id)}
                  onRemove={() => {
                    if (window.confirm("Remove this campaign?")) {
                      removeMutation.mutate(campaign.id);
                    }
                  }}
                  onDuplicate={() => duplicateMutation.mutate(campaign.id)}
                />
              ))
            )}

            {/* Totals row */}
            {!isLoading && visible.length > 0 && (
              <tr className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-slate-800">
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-sm" colSpan={5}>
                  Total — {visible.length} campaigns
                </td>
                <td className="px-4 py-3 text-right text-sm">{fmtNumber(totals.impressions)}</td>
                <td className="px-4 py-3 text-right text-sm">{fmtNumber(totals.clicks)}</td>
                <td className="px-4 py-3 text-right text-sm" />
                <td className="px-4 py-3 text-right text-sm" />
                <td className="px-4 py-3 text-right text-sm">{fmtCurrency(totals.cost)}</td>
                <td className="px-4 py-3 text-right text-sm">{fmtNumber(totals.conversions)}</td>
                <td className="px-4 py-3 text-right text-sm" colSpan={3} />
                <td className="px-4 py-3" />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Campaign Edit Drawer ─────────────────────────── */}
      <CampaignEditDrawer
        clientId={clientId}
        campaign={editCampaign}
        onClose={() => setEditCampaign(null)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CAMPAIGN ROW
// ─────────────────────────────────────────────────────────────

interface CampaignRowProps {
  campaign: Campaign;
  selected: boolean;
  onToggleSelect: () => void;
  onViewDetail: () => void;
  onEdit: () => void;
  onEnable: () => void;
  onPause: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

function CampaignRow({
  campaign,
  selected,
  onToggleSelect,
  onViewDetail,
  onEdit,
  onEnable,
  onPause,
  onRemove,
  onDuplicate,
}: CampaignRowProps) {
  const m = campaign.metrics;

  return (
    <tr
      className={cn(
        "border-b border-slate-100 hover:bg-slate-50/60 transition-colors group",
        selected && "bg-blue-50/40"
      )}
    >
      {/* Checkbox */}
      <td className="px-4 py-3 w-10">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          className="border-slate-300"
        />
      </td>

      {/* Name */}
      <td className="px-4 py-3" style={{ minWidth: "220px" }}>
        <button
          onClick={onViewDetail}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline text-left line-clamp-1"
        >
          {campaign.name}
        </button>
        {campaign.optimizationScore !== undefined && (
          <div className="mt-0.5 text-[10px] text-slate-400">
            Opt. score:{" "}
            <span className="font-medium text-slate-600">
              {Math.round(campaign.optimizationScore * 100)}%
            </span>
          </div>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={campaign.status} />
      </td>

      {/* Campaign type */}
      <td className="px-4 py-3">
        <CampaignTypeBadge type={campaign.campaignType} />
      </td>

      {/* Budget */}
      <td className="px-4 py-3 text-right text-sm text-slate-700 whitespace-nowrap">
        {fmtCurrency(campaign.budgetAmount)}/day
      </td>

      {/* Bid strategy */}
      <td className="px-4 py-3">
        <span className="text-xs text-slate-500 line-clamp-1">
          {campaign.bidStrategyName ?? campaign.bidStrategyType}
        </span>
      </td>

      {/* Metrics */}
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">
        {fmtNumber(m.impressions)}
      </td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">
        {fmtNumber(m.clicks)}
      </td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">
        {fmtPercent(m.ctr)}
      </td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">
        {fmtCurrency(m.averageCpc)}
      </td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800 tabular-nums">
        {fmtCurrency(m.cost)}
      </td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">
        {m.conversions.toFixed(2)}
      </td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">
        {fmtPercent(m.conversionRate)}
      </td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">
        {fmtCurrency(m.costPerConversion)}
      </td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">
        {fmtRoas(m.roas)}
      </td>

      {/* Row actions */}
      <td className="px-4 py-3 w-12">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onViewDetail}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit campaign
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {campaign.status === "PAUSED" ? (
              <DropdownMenuItem onClick={onEnable}>
                <PlayCircle className="w-4 h-4 mr-2 text-emerald-500" />
                Enable
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={onPause}>
                <PauseCircle className="w-4 h-4 mr-2 text-amber-500" />
                Pause
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDuplicate}>
              <CheckSquare className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onRemove}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
