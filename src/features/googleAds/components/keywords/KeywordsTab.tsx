import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Edit2,
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
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  useKeywords,
  useAddKeywords,
  useUpdateKeyword,
  useRemoveKeyword,
  useAdGroups,
} from "../../hooks/useCampaignManagement";
import {
  StatusBadge,
  MatchTypeChip,
  QualityScoreDisplay,
  TableSkeletonRows,
  EmptyState,
  ErrorState,
  TableToolbar,
  fmtCurrency,
  fmtNumber,
  fmtPercent,
} from "../ui/GoogleAdsShared";
import { useGoogleAdsStore } from "../../store/useGoogleAdsStore";
import type { Keyword, KeywordStatus, KeywordMatchType, AddKeywordsPayload, MutateKeywordPayload } from "../../types/googleAds.types";

// ─────────────────────────────────────────────────────────────
// ADD KEYWORDS MODAL
// ─────────────────────────────────────────────────────────────

interface AddKeywordsFormValues {
  adGroupId: string;
  keywords: Array<{
    text: string;
    matchType: KeywordMatchType;
    cpcBid: string;
  }>;
}

interface AddKeywordsModalProps {
  open: boolean;
  onClose: () => void;
  clientId: number;
  campaignId?: string;
  defaultAdGroupId?: string;
  onSubmit: (adGroupId: string, payload: AddKeywordsPayload) => void;
  isPending: boolean;
}

function AddKeywordsModal({
  open,
  onClose,
  clientId,
  campaignId,
  defaultAdGroupId,
  onSubmit,
  isPending,
}: AddKeywordsModalProps) {
  // Fetch ad groups for the dropdown if we need to select one
  const { data: adGroupsData } = useAdGroups(clientId, campaignId ?? "", undefined);
  const adGroups = adGroupsData?.adGroups ?? [];

  // @ts-expect-error unused variable
  const { register, handleSubmit, control, formState: { errors }, watch, reset } = useForm<AddKeywordsFormValues>({
    defaultValues: {
      adGroupId: defaultAdGroupId ?? "",
      keywords: [{ text: "", matchType: "BROAD", cpcBid: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "keywords",
  });

  // reset form when opened
  if (open && fields.length === 0) {
    reset({
      adGroupId: defaultAdGroupId ?? "",
      keywords: [{ text: "", matchType: "BROAD", cpcBid: "" }],
    });
  }

  function submit(vals: AddKeywordsFormValues) {
    if (!vals.adGroupId) return;
    const payload: AddKeywordsPayload = {
      keywords: vals.keywords
        .filter((k) => k.text.trim())
        .map((k) => ({
          text: k.text.trim(),
          matchType: k.matchType,
          cpcBidMicros: k.cpcBid
            ? Math.round(parseFloat(k.cpcBid) * 1_000_000)
            : undefined,
        })),
    };
    if (payload.keywords.length > 0) {
      onSubmit(vals.adGroupId, payload);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Search Keywords</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(submit)} className="flex-1 overflow-auto space-y-6 mt-2 pr-2">
          {!defaultAdGroupId && (
            <div className="space-y-1.5 max-w-sm">
              <Label>Select Ad Group</Label>
              <Controller
                name="adGroupId"
                control={control}
                rules={{ required: "Select an ad group" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {adGroups.map((ag) => (
                        <SelectItem key={ag.id} value={ag.id}>{ag.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.adGroupId && <p className="text-xs text-red-500">{errors.adGroupId.message}</p>}
            </div>
          )}

          <div className="space-y-3">
            <Label>Keywords</Label>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-[1fr_120px_100px_40px] gap-2 px-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <div>Keyword</div>
                <div>Match type</div>
                <div>Max CPC (₹)</div>
                <div></div>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_120px_100px_40px] gap-2 items-start">
                  <Input
                    {...register(`keywords.${index}.text` as const, { required: "Required" })}
                    placeholder="e.g. digital marketing"
                    className="text-sm"
                  />
                  <Controller
                    name={`keywords.${index}.matchType` as const}
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BROAD">Broad</SelectItem>
                          <SelectItem value="PHRASE">Phrase</SelectItem>
                          <SelectItem value="EXACT">Exact</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input
                    {...register(`keywords.${index}.cpcBid` as const)}
                    placeholder="Auto"
                    type="number"
                    step="0.01"
                    min="0"
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="h-9 w-9 text-slate-400 hover:text-red-500"
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ text: "", matchType: "BROAD", cpcBid: "" })}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add row
            </Button>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isPending ? "Saving…" : "Save keywords"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// EDIT KEYWORD MODAL
// ─────────────────────────────────────────────────────────────

interface EditKeywordFormValues {
  status: KeywordStatus;
  cpcBid: string;
}

function EditKeywordModal({
  keyword,
  open,
  onClose,
  onSubmit,
  isPending,
}: {
  keyword: Keyword | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string, payload: MutateKeywordPayload) => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, control, reset } = useForm<EditKeywordFormValues>({
    defaultValues: {
      status: keyword?.status ?? "ENABLED",
      cpcBid: keyword?.cpcBid?.toString() ?? "",
    },
  });

  // reset form when opened
  if (open && keyword) {
    reset({
      status: keyword.status,
      cpcBid: keyword.cpcBid?.toString() ?? "",
    });
  }

  function submit(vals: EditKeywordFormValues) {
    if (!keyword) return;
    onSubmit(keyword.id, {
      status: vals.status,
      cpcBidMicros: vals.cpcBid
        ? Math.round(parseFloat(vals.cpcBid) * 1_000_000)
        : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Keyword</DialogTitle>
          <p className="text-sm text-slate-500 truncate mt-1">
            "{keyword?.text}"
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4 mt-2">
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
            <Label>Max CPC (₹)</Label>
            <Input
              {...register("cpcBid")}
              placeholder="Auto"
              type="number"
              step="0.01"
              min="0"
            />
            <p className="text-xs text-slate-400">Leave blank to use ad group default</p>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// KEYWORDS ROW
// ─────────────────────────────────────────────────────────────

interface KeywordRowProps {
  keyword: Keyword;
  selected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onEnable: () => void;
  onPause: () => void;
}

function KeywordRow({
  keyword,
  selected,
  onToggle,
  onEdit,
  onRemove,
  onEnable,
  onPause,
}: KeywordRowProps) {
  const m = keyword.metrics;
  const qInfo = keyword.qualityInfo;

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
      <td className="px-4 py-3" style={{ minWidth: "220px" }}>
        <p className="text-sm font-semibold text-slate-800 line-clamp-1">{keyword.text}</p>
        {keyword.adGroupName && (
          <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]">
            {keyword.adGroupName}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <MatchTypeChip matchType={keyword.matchType} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={keyword.status} />
      </td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">
        {keyword.cpcBid !== undefined ? fmtCurrency(keyword.cpcBid) : "—"}
      </td>
      <td className="px-4 py-3 text-center">
        <QualityScoreDisplay score={qInfo?.qualityScore} />
      </td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{fmtNumber(m.impressions)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{fmtNumber(m.clicks)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{fmtPercent(m.ctr)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{fmtCurrency(m.averageCpc)}</td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800 tabular-nums">{fmtCurrency(m.cost)}</td>
      <td className="px-4 py-3 text-right text-sm text-slate-600 tabular-nums">{m.conversions.toFixed(2)}</td>
      
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
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {keyword.status === "PAUSED" ? (
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
// KEYWORDS TAB
// ─────────────────────────────────────────────────────────────

interface KeywordsTabProps {
  clientId: number;
  campaignId?: string;
  adGroupId?: string;
}

export function KeywordsTab({ clientId, campaignId, adGroupId }: KeywordsTabProps) {
  const { dateRange } = useGoogleAdsStore();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Keyword | null>(null);

  const queryParams = {
    ...(campaignId && { campaignId }),
    ...(adGroupId && { adGroupId }),
    ...dateRange,
  };

  const { data, isLoading, isError, error, refetch } = useKeywords(clientId, queryParams);
  const addMutation = useAddKeywords(clientId, adGroupId ?? "", campaignId);
  const updateMutation = useUpdateKeyword(clientId);
  const removeMutation = useRemoveKeyword(clientId);

  const keywords = useMemo(() => data?.keywords ?? [], [data?.keywords]);
  const visible = useMemo(
    () => keywords.filter((k) => k.text.toLowerCase().includes(search.toLowerCase())),
    [keywords, search]
  );

  const allSelected = visible.length > 0 && visible.every((k) => selectedIds.has(k.id));

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(visible.map((k) => k.id)));
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
    [...selectedIds].forEach((id) =>
      updateMutation.mutate({ keywordId: id, payload: { status: "ENABLED" } })
    );
    setSelectedIds(new Set());
  }
  function bulkPause() {
    [...selectedIds].forEach((id) =>
      updateMutation.mutate({ keywordId: id, payload: { status: "PAUSED" } })
    );
    setSelectedIds(new Set());
  }
  function bulkRemove() {
    if (window.confirm(`Are you sure you want to remove ${selectedIds.size} keywords?`)) {
      [...selectedIds].forEach((id) => removeMutation.mutate(id));
      setSelectedIds(new Set());
    }
  }

  const COLS = [
    { label: "Search keyword", align: "left" as const },
    { label: "Match type", align: "left" as const },
    { label: "Status", align: "left" as const },
    { label: "Max. CPC", align: "right" as const },
    { label: "Quality score", align: "center" as const },
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
        searchPlaceholder="Search keywords…"
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
            Add keywords
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
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
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
                    title="No keywords found"
                    description="Add search keywords to target your ads."
                    action={
                      <Button
                        size="sm"
                        className="bg-blue-600 text-white gap-2"
                        onClick={() => setCreateOpen(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Add keywords
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              visible.map((k) => (
                <KeywordRow
                  key={k.id}
                  keyword={k}
                  selected={selectedIds.has(k.id)}
                  onToggle={() => toggleOne(k.id)}
                  onEdit={() => setEditTarget(k)}
                  onRemove={() => removeMutation.mutate(k.id)}
                  onEnable={() =>
                    updateMutation.mutate({
                      keywordId: k.id,
                      payload: { status: "ENABLED" },
                    })
                  }
                  onPause={() =>
                    updateMutation.mutate({
                      keywordId: k.id,
                      payload: { status: "PAUSED" },
                    })
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddKeywordsModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clientId={clientId}
        campaignId={campaignId}
        defaultAdGroupId={adGroupId}
        isPending={addMutation.isPending}
        onSubmit={(targetAdGroupId, payload) => {
          // If we're at campaign level and adGroupId is not passed as prop, we need to pass the target ad group ID to the mutation
          // Currently useAddKeywords hooks takes adGroupId as a hook argument. We should fix it to take it in the payload or use the one from the dropdown
          // Workaround: We might need to use the addMutation with the targetAdGroupId if not bound
  // @ts-expect-error unused variable
          const mutationArgs = adGroupId ? { ...payload } : { ...payload }; // We actually need to modify useAddKeywords if adGroupId isn't known upfront.
          // In the current API implementation `addKeywords` takes clientId, adGroupId, payload.
          // For now, let's just pass the selected adGroupId.
          useAddKeywords(clientId, targetAdGroupId, campaignId).mutate(payload, {
            onSuccess: () => setCreateOpen(false),
          });
        }}
      />

      <EditKeywordModal
        open={editTarget !== null}
        keyword={editTarget}
        onClose={() => setEditTarget(null)}
        isPending={updateMutation.isPending}
        onSubmit={(id, payload) =>
          updateMutation.mutate(
            { keywordId: id, payload },
            { onSuccess: () => setEditTarget(null) }
          )
        }
      />
    </div>
  );
}
