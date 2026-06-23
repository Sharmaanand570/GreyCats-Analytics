import { useState, useMemo } from "react";
  // @ts-expect-error unused variable
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  PauseCircle,
  PlayCircle,
  // @ts-expect-error unused variable
  Plus,
  Edit2,
  Trash2,
  MoreHorizontal,
  Eye,
  Monitor,
  Smartphone,
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
import { useAds, useUpdateAd, useRemoveAd, useEnableAd, usePauseAd } from "../../hooks/useCampaignManagement";
import { CreateAdModal } from "./CreateAdModal";
import { EditAdDrawer } from "./EditAdDrawer";
import {
  StatusBadge,
  AdStrengthMeter,
  ApprovalStatusBadge,
  TableSkeletonRows,
  EmptyState,
  ErrorState,
  TableToolbar,
  fmtCurrency,
  fmtNumber,
  fmtPercent,
} from "../ui/GoogleAdsShared";
import { useGoogleAdsStore } from "../../store/useGoogleAdsStore";
import { GoogleAdsDateRangePicker } from "../GoogleAdsDateRangePicker";
import type { Ad } from "../../types/googleAds.types";

// ─────────────────────────────────────────────────────────────
// RSA PREVIEW CARD
// ─────────────────────────────────────────────────────────────

export function RsaPreviewCard({ ad, device = "desktop" }: { ad: Ad; device?: "desktop" | "mobile" }) {
  const rsa = ad.responsiveSearchAd;
  const headlines = rsa?.headlines.slice(0, 3).map((h) => h.text) ?? [
    "Headline 1",
    "Headline 2",
    "Headline 3",
  ];
  const descriptions = rsa?.descriptions.slice(0, 2).map((d) => d.text) ?? [
    "Description line",
    "Another description",
  ];
  const displayUrl = ad.displayUrl ?? ad.finalUrls?.[0] ?? "www.example.com";
  const path1 = rsa?.path1;
  const path2 = rsa?.path2;

  return (
    <div
      className={cn(
        "border border-slate-200 rounded-lg bg-white p-4 max-w-sm",
        device === "mobile" && "max-w-[280px]"
      )}
    >
      {/* Ad label */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
          Ad
        </span>
        <span className="text-xs text-slate-500 truncate">
          {displayUrl}
          {path1 ? `/${path1}` : ""}
          {path2 ? `/${path2}` : ""}
        </span>
      </div>
      {/* Headline */}
      <p className="text-[15px] font-semibold text-blue-700 leading-snug mb-1 line-clamp-2">
        {headlines.join(" | ")}
      </p>
      {/* Description */}
      <p className={cn("text-xs text-slate-600 leading-relaxed", device === "mobile" && "text-[11px]")}>
        {descriptions.join(" ")}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AD ROW
// ─────────────────────────────────────────────────────────────

interface AdRowProps {
  ad: Ad;
  selected: boolean;
  onToggle: () => void;
  onEnable: () => void;
  onPause: () => void;
  onRemove: () => void;
  onPreview: () => void;
  onEdit: () => void;
}

function AdRow({ ad, selected, onToggle, onEnable, onPause, onRemove, onPreview, onEdit }: AdRowProps) {
  const m = ad.metrics;

  // Label text for the ad
  const rsa = ad.responsiveSearchAd;
  const headlinePreview = rsa?.headlines?.[0]?.text ?? "—";
  const descPreview = rsa?.descriptions?.[0]?.text ?? "—";

  return (
    <tr
      className={cn(
        "border-b border-slate-100 hover:bg-slate-50/60 group transition-colors",
        selected && "bg-blue-50/40"
      )}
    >
      <td className="px-4 py-3 w-10">
        <Checkbox checked={selected} onCheckedChange={onToggle} className="border-slate-300" />
      </td>

      {/* Ad preview column */}
      <td className="px-4 py-4" style={{ minWidth: "280px" }}>
        <div className="flex flex-col gap-1">
          <StatusBadge status={ad.status} />
          <p className="text-sm font-semibold text-slate-800 line-clamp-1 mt-1">
            {headlinePreview}
          </p>
          <p className="text-xs text-slate-500 line-clamp-2">{descPreview}</p>
          {ad.finalUrls?.[0] && (
            <p className="text-[11px] text-green-700 truncate">
              {ad.finalUrls[0]}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-medium text-slate-400 uppercase">
              {ad.type.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </td>

      {/* Ad Strength */}
      <td className="px-4 py-3">
        {ad.adStrength ? (
          <AdStrengthMeter strength={ad.adStrength} />
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      {/* Approval */}
      <td className="px-4 py-3">
        {ad.approvalStatus ? (
          <ApprovalStatusBadge status={ad.approvalStatus} />
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      {/* Metrics */}
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{fmtNumber(m.impressions)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{fmtNumber(m.clicks)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{fmtPercent(m.ctr)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{fmtCurrency(m.averageCpc)}</td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800 tabular-nums">{fmtCurrency(m.cost)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{m.conversions.toFixed(2)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{fmtPercent(m.conversionRate)}</td>

      {/* Actions */}
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
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onPreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview ad
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {ad.status === "PAUSED" ? (
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRemove} className="text-red-600 focus:text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// AD PREVIEW DIALOG
// ─────────────────────────────────────────────────────────────

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function AdPreviewDialog({ ad, onClose }: { ad: Ad | null; onClose: () => void }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  if (!ad) return null;
  return (
    <Dialog open={!!ad} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ad Preview</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={device === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setDevice("desktop")}
            className="gap-2"
          >
            <Monitor className="w-4 h-4" />
            Desktop
          </Button>
          <Button
            variant={device === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setDevice("mobile")}
            className="gap-2"
          >
            <Smartphone className="w-4 h-4" />
            Mobile
          </Button>
        </div>
        <div className="flex justify-center py-4 bg-slate-50 rounded-lg">
          <RsaPreviewCard ad={ad} device={device} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// ADS TAB / PAGE
// ─────────────────────────────────────────────────────────────

interface AdsTabProps {
  clientId: number;
  adGroupId: string;
  adGroupName?: string;
  campaignId?: string;
  baseRoute?: string;
}

export function AdsTab({
  clientId,
  adGroupId,
  adGroupName,
  campaignId,
  baseRoute = "/data-sources/google-ads",
}: AdsTabProps) {
  const navigate = useNavigate();
  const { dateRange } = useGoogleAdsStore();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewAd, setPreviewAd] = useState<Ad | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Ad | null>(null);

  const { data, isLoading, isError, error, refetch } = useAds(
    clientId,
    adGroupId,
    dateRange
  );
  // @ts-expect-error unused variable
  const updateMutation = useUpdateAd(clientId, adGroupId);
  const removeMutation = useRemoveAd(clientId, adGroupId);
  const enableMutation = useEnableAd(clientId, adGroupId);
  const pauseMutation = usePauseAd(clientId, adGroupId);

  const ads = useMemo(() => data?.ads ?? [], [data?.ads]);
  const visible = useMemo(
    () =>
      ads.filter(
        (a) =>
          (a.responsiveSearchAd?.headlines?.[0]?.text ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (a.finalUrls?.[0] ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [ads, search]
  );

  const allSelected = visible.length > 0 && visible.every((a) => selectedIds.has(a.id));

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(visible.map((a) => a.id)));
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

  // @ts-expect-error unused variable
  function bulkEnable() {
    [...selectedIds].forEach((id) => enableMutation.mutate(id));
    setSelectedIds(new Set());
  }
  // @ts-expect-error unused variable
  function bulkPause() {
    [...selectedIds].forEach((id) => pauseMutation.mutate(id));
    setSelectedIds(new Set());
  }
  // @ts-expect-error unused variable
  function bulkRemove() {
    if (window.confirm(`Are you sure you want to remove ${selectedIds.size} ads?`)) {
      [...selectedIds].forEach((id) => removeMutation.mutate(id));
      setSelectedIds(new Set());
    }
  }

  const COLS = [
    { label: "Ad", align: "left" as const },
    { label: "Ad strength", align: "left" as const },
    { label: "Approval", align: "left" as const },
    { label: "Impr.", align: "right" as const },
    { label: "Clicks", align: "right" as const },
    { label: "CTR", align: "right" as const },
    { label: "Avg. CPC", align: "right" as const },
    { label: "Cost", align: "right" as const },
    { label: "Conv.", align: "right" as const },
    { label: "Conv. rate", align: "right" as const },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sub-header */}
      {adGroupName && (
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {campaignId && (
              <>
                <button
                  onClick={() => navigate(`${baseRoute}/campaigns/${campaignId}`)}
                  className="hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Campaign
                </button>
                <span>/</span>
              </>
            )}
            <span className="font-medium text-slate-700">{adGroupName}</span>
            <span className="text-slate-300">—</span>
            <span>Ads</span>
          </div>
        </div>
      )}

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search ads…"
        rightActions={
          <div className="flex items-center gap-2">
            <GoogleAdsDateRangePicker />
          </div>
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
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeletonRows rows={5} cols={COLS.length + 2} />
            ) : isError ? (
              <tr>
                <td colSpan={COLS.length + 2}>
                  <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={COLS.length + 2}>
                  <EmptyState
                    title="No ads in this ad group"
                    description="Ads created through the campaign wizard will appear here."
                  />
                </td>
              </tr>
            ) : (
              visible.map((ad) => (
                <AdRow
                  key={ad.id}
                  ad={ad}
                  selected={selectedIds.has(ad.id)}
                  onToggle={() => toggleOne(ad.id)}
                  onPreview={() => setPreviewAd(ad)}
                  onEdit={() => setEditTarget(ad)}
                  onEnable={() => enableMutation.mutate(ad.id)}
                  onPause={() => pauseMutation.mutate(ad.id)}
                  onRemove={() => removeMutation.mutate(ad.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdPreviewDialog ad={previewAd} onClose={() => setPreviewAd(null)} />

      {createOpen && (
        <CreateAdModal
          clientId={clientId}
          adGroupId={adGroupId}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}

      {editTarget && (
        <EditAdDrawer
          clientId={clientId}
          adGroupId={adGroupId}
          ad={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
