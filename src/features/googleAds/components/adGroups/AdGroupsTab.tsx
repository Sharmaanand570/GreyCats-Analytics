import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import {
  useAdGroups,
  useCreateAdGroup,
  useUpdateAdGroup,
  useRemoveAdGroup,
  useEnableAdGroup,
  usePauseAdGroup,
} from "../../hooks/useCampaignManagement";
import {
  StatusBadge,
  TableSkeletonRows,
  EmptyState,
  ErrorState,
  TableToolbar,
  fmtCurrency,
  fmtNumber,
  fmtPercent,
  // @ts-expect-error unused variable
  fmtRoas,
} from "../ui/GoogleAdsShared";
import { useGoogleAdsStore } from "../../store/useGoogleAdsStore";
import type { AdGroup, AdGroupStatus, MutateAdGroupPayload } from "../../types/googleAds.types";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// AD GROUP FORM (create / edit)
// ─────────────────────────────────────────────────────────────

interface AdGroupFormValues {
  name: string;
  status: AdGroupStatus;
  cpcBid: string;
  targetCpa: string;
  targetRoas: string;
}

interface AdGroupFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: MutateAdGroupPayload) => void;
  isPending: boolean;
  defaultValues?: Partial<AdGroupFormValues>;
  title: string;
}

function AdGroupFormModal({
  open,
  onClose,
  onSubmit,
  isPending,
  defaultValues,
  title,
}: AdGroupFormModalProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<AdGroupFormValues>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      status: defaultValues?.status ?? "ENABLED",
      cpcBid: defaultValues?.cpcBid ?? "",
      targetCpa: defaultValues?.targetCpa ?? "",
      targetRoas: defaultValues?.targetRoas ?? "",
    },
  });

  function submit(vals: AdGroupFormValues) {
    onSubmit({
      name: vals.name,
      status: vals.status,
      cpcBidMicros: vals.cpcBid
        ? Math.round(parseFloat(vals.cpcBid) * 1_000_000)
        : undefined,
      targetCpa: vals.targetCpa ? parseFloat(vals.targetCpa) : undefined,
      targetRoas: vals.targetRoas ? parseFloat(vals.targetRoas) : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Ad group name</Label>
            <Input
              {...register("name", { required: "Name is required" })}
              placeholder="Ad group name"
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENABLED">Enabled</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Default CPC bid (₹)</Label>
            <Input
              {...register("cpcBid")}
              placeholder="e.g. 10.00"
              type="number"
              step="0.01"
              min="0"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// AD GROUPS TABLE ROW
// ─────────────────────────────────────────────────────────────

interface AdGroupRowProps {
  adGroup: AdGroup;
  selected: boolean;
  onToggle: () => void;
  onViewAds: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onEnable: () => void;
  onPause: () => void;
}

function AdGroupRow({
  adGroup,
  selected,
  onToggle,
  onViewAds,
  onEdit,
  onRemove,
  onEnable,
  onPause,
}: AdGroupRowProps) {
  const m = adGroup.metrics;
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
      <td className="px-4 py-3" style={{ minWidth: "200px" }}>
        <button
          onClick={onViewAds}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline text-left line-clamp-1"
        >
          {adGroup.name}
        </button>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={adGroup.status} />
      </td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">
        {adGroup.cpcBid !== undefined ? fmtCurrency(adGroup.cpcBid) : "—"}
      </td>
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
            <DropdownMenuItem onClick={onViewAds}>View ads</DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {adGroup.status === "PAUSED" ? (
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
// AD GROUPS TAB
// ─────────────────────────────────────────────────────────────

interface AdGroupsTabProps {
  clientId: number;
  campaignId: string;
  campaignName?: string;
  baseRoute?: string;
}

export function AdGroupsTab({
  clientId,
  campaignId,
  // @ts-expect-error unused variable
  campaignName,
  baseRoute = "/data-sources/google-ads",
}: AdGroupsTabProps) {
  const navigate = useNavigate();
  const { dateRange } = useGoogleAdsStore();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdGroup | null>(null);

  const { data, isLoading, isError, error, refetch } = useAdGroups(
    clientId,
    campaignId,
    dateRange
  );
  const createMutation = useCreateAdGroup(clientId, campaignId);
  const updateMutation = useUpdateAdGroup(clientId, campaignId);
  const removeMutation = useRemoveAdGroup(clientId, campaignId);
  const enableMutation = useEnableAdGroup(clientId, campaignId);
  const pauseMutation = usePauseAdGroup(clientId, campaignId);

  const adGroups = useMemo(() => data?.adGroups ?? [], [data?.adGroups]);
  const visible = useMemo(
    () => adGroups.filter((ag) => ag.name.toLowerCase().includes(search.toLowerCase())),
    [adGroups, search]
  );

  const allSelected = visible.length > 0 && visible.every((ag) => selectedIds.has(ag.id));

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(visible.map((ag) => ag.id)));
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

  function bulkEnable() {
    [...selectedIds].forEach((id) => enableMutation.mutate(id));
    setSelectedIds(new Set());
  }
  function bulkPause() {
    [...selectedIds].forEach((id) => pauseMutation.mutate(id));
    setSelectedIds(new Set());
  }
  function bulkRemove() {
    if (window.confirm(`Are you sure you want to remove ${selectedIds.size} ad groups?`)) {
      [...selectedIds].forEach((id) => removeMutation.mutate(id));
      setSelectedIds(new Set());
    }
  }

  const COLS = [
    { label: "Ad group", align: "left" as const },
    { label: "Status", align: "left" as const },
    { label: "Default CPC", align: "right" as const },
    { label: "Impr.", align: "right" as const },
    { label: "Clicks", align: "right" as const },
    { label: "CTR", align: "right" as const },
    { label: "Avg. CPC", align: "right" as const },
    { label: "Cost", align: "right" as const },
    { label: "Conv.", align: "right" as const },
    { label: "Conv. rate", align: "right" as const },
    { label: "Cost/conv.", align: "right" as const },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search ad groups…"
        leftActions={
          selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium mr-2">
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
              <Button variant="outline" size="sm" onClick={bulkRemove} className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </Button>
            </div>
          )
        }
        rightActions={
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            New ad group
          </Button>
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
                    title="No ad groups"
                    description="Create your first ad group to organize ads and keywords."
                    action={
                      <Button
                        size="sm"
                        className="bg-blue-600 text-white gap-2"
                        onClick={() => setCreateOpen(true)}
                      >
                        <Plus className="w-4 h-4" />
                        New ad group
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              visible.map((ag) => (
                <AdGroupRow
                  key={ag.id}
                  adGroup={ag}
                  selected={selectedIds.has(ag.id)}
                  onToggle={() => toggleOne(ag.id)}
                  onViewAds={() =>
                    navigate(
                      `${baseRoute}/campaigns/${campaignId}/ad-groups/${ag.id}`
                    )
                  }
                  onEdit={() => setEditTarget(ag)}
                  onRemove={() => removeMutation.mutate(ag.id)}
                  onEnable={() => enableMutation.mutate(ag.id)}
                  onPause={() => pauseMutation.mutate(ag.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <AdGroupFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New ad group"
        isPending={createMutation.isPending}
        onSubmit={(payload) =>
          createMutation.mutate(payload, {
            onSuccess: () => setCreateOpen(false),
          })
        }
      />

      {/* Edit Modal */}
      <AdGroupFormModal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        title="Edit ad group"
        isPending={updateMutation.isPending}
        defaultValues={{
          name: editTarget?.name,
          status: editTarget?.status,
          cpcBid: editTarget?.cpcBid?.toString(),
        }}
        onSubmit={(payload) =>
          updateMutation.mutate(
            { adGroupId: editTarget!.id, payload },
            { onSuccess: () => setEditTarget(null) }
          )
        }
      />
    </div>
  );
}
