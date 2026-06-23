import { useState, useMemo } from "react";
import {
  Users,
  Plus,
  Trash2,
  MoreHorizontal,
  Edit2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAudiences, useRemoveAudience } from "../../hooks/useCampaignManagement";
import { useGoogleAdsStore } from "../../store/useGoogleAdsStore";
import {
  StatusBadge,
  fmtCurrency,
  fmtNumber,
  TableToolbar,
  TableSkeletonRows,
  EmptyState,
  ErrorState,
} from "../ui/GoogleAdsShared";
import type { AudienceType, CampaignAudience } from "../../types/googleAds.types";
import { EditAudienceModal } from "./EditAudienceModal";

// ─────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────

interface AudiencesTabProps {
  clientId: number;
  campaignId?: string;
  adGroupId?: string;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function formatAudienceType(type: AudienceType) {
  switch (type) {
    case "USER_LIST":
      return "Remarketing";
    case "CUSTOM_AUDIENCE":
      return "Custom";
    case "COMBINED_AUDIENCE":
      return "Combined";
    case "AFFINITY":
      return "Affinity";
    case "IN_MARKET":
      return "In-market";
    default:
      return "Unknown";
  }
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export function AudiencesTab({ clientId, campaignId, adGroupId }: AudiencesTabProps) {
  const { dateRange } = useGoogleAdsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editTarget, setEditTarget] = useState<CampaignAudience | null>(null);

  // API calls
  const { data, isLoading, isError, error } = useAudiences(clientId, {
    campaignId,
    adGroupId,
    ...dateRange,
  });

  const removeMutation = useRemoveAudience(clientId);

  // Derived data
  const audiences = useMemo(() => data?.audiences ?? [], [data?.audiences]);

  const filtered = useMemo(() => {
    let result = audiences;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (a: CampaignAudience) => a.audienceName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [audiences, searchTerm]);

  // Selection handlers
  function toggleAll() {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((a: CampaignAudience) => a.id)));
    }
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

  // Row actions
  const handleRemove = (id: string) => {
    if (window.confirm("Are you sure you want to remove this audience?")) {
      removeMutation.mutate(id);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  if (isError) {
    return (
      <ErrorState
        message={(error as Error)?.message ?? "Failed to load audiences"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* TOOLBAR */}
      <TableToolbar
        title={campaignId ? "Campaign Audiences" : "Ad Group Audiences"}
        count={audiences.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedIds.size === 0 || removeMutation.isPending}
              onClick={() => {
                if (window.confirm(`Remove ${selectedIds.size} audiences?`)) {
                  selectedIds.forEach((id) => removeMutation.mutate(id));
                  setSelectedIds(new Set());
                }
              }}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Remove Selected
            </Button>
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4" />
              Add Audience
            </Button>
          </>
        }
      />

      {/* TABLE */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={
                    filtered.length > 0 && selectedIds.size === filtered.length
                  }
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Bid adj.</TableHead>
              <TableHead className="text-right">Impr.</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
              <TableHead className="text-right">Cost/conv.</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={11} rows={5} />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-64">
                  <EmptyState
                    icon={Users}
                    title="No audiences found"
                    description="You have not added any audiences yet."
                    actionLabel="Add Audience"
                    onAction={() => {}}
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((aud) => {
                const isSelected = selectedIds.has(aud.id);
                const m = aud.metrics;

                return (
                  <TableRow
                    key={aud.id}
                    className="hover:bg-slate-50 transition-colors group"
                    data-state={isSelected ? "selected" : undefined}
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(aud.id)}
                      />
                    </TableCell>

                    <TableCell className="font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        {aud.audienceName}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="font-normal text-slate-600">
                        {formatAudienceType(aud.audienceType)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={aud.status} />
                    </TableCell>

                    <TableCell className="text-right text-slate-700">
                      {aud.bidModifier !== undefined ? (
                        <span className="font-medium">
                          {aud.bidModifier > 1 ? "+" : ""}
                          {((aud.bidModifier - 1) * 100).toFixed(0)}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell className="text-right text-slate-700">
                      {fmtNumber(m.impressions)}
                    </TableCell>

                    <TableCell className="text-right text-slate-700">
                      {fmtNumber(m.clicks)}
                    </TableCell>

                    <TableCell className="text-right text-slate-700">
                      {fmtCurrency(m.cost)}
                    </TableCell>

                    <TableCell className="text-right text-slate-700">
                      {m.conversions.toFixed(2)}
                    </TableCell>

                    <TableCell className="text-right text-slate-700">
                      {fmtCurrency(m.costPerConversion)}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setEditTarget(aud)}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Bid Adj.
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                            onClick={() => handleRemove(aud.id)}
                            disabled={removeMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <EditAudienceModal
        clientId={clientId}
        audience={editTarget}
        onClose={() => setEditTarget(null)}
      />
    </div>
  );
}
