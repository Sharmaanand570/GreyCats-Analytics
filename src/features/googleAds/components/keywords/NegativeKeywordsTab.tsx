import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
} from "lucide-react";
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
  useNegativeKeywords,
  useAddNegativeKeywords,
  useRemoveNegativeKeyword,
  useCampaigns,
  useAdGroups,
} from "../../hooks/useCampaignManagement";
import {
  MatchTypeChip,
  TableSkeletonRows,
  EmptyState,
  ErrorState,
  TableToolbar,
} from "../ui/GoogleAdsShared";
import type { NegativeKeyword, KeywordMatchType, AddNegativeKeywordsPayload } from "../../types/googleAds.types";

// ─────────────────────────────────────────────────────────────
// ADD NEGATIVE KEYWORDS MODAL
// ─────────────────────────────────────────────────────────────

interface AddNegativeKeywordsFormValues {
  level: "CAMPAIGN" | "AD_GROUP";
  campaignId: string;
  adGroupId: string;
  keywords: Array<{
    text: string;
    matchType: KeywordMatchType;
  }>;
}

interface AddNegativeKeywordsModalProps {
  open: boolean;
  onClose: () => void;
  clientId: number;
  defaultCampaignId?: string;
  defaultAdGroupId?: string;
  onSubmit: (payload: AddNegativeKeywordsPayload) => void;
  isPending: boolean;
}

function AddNegativeKeywordsModal({
  open,
  onClose,
  clientId,
  defaultCampaignId,
  defaultAdGroupId,
  onSubmit,
  isPending,
}: AddNegativeKeywordsModalProps) {
  const { data: campaignsData } = useCampaigns(clientId);
  const campaigns = campaignsData?.campaigns ?? [];

  const { register, handleSubmit, control, watch, reset } = useForm<AddNegativeKeywordsFormValues>({
    defaultValues: {
      level: defaultAdGroupId ? "AD_GROUP" : "CAMPAIGN",
      campaignId: defaultCampaignId ?? "",
      adGroupId: defaultAdGroupId ?? "",
      keywords: [{ text: "", matchType: "EXACT" }],
    },
  });

  const level = watch("level");
  const selectedCampaignId = watch("campaignId");

  const { data: adGroupsData } = useAdGroups(clientId, selectedCampaignId, undefined);
  const adGroups = adGroupsData?.adGroups ?? [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: "keywords",
  });

  // reset form when opened
  if (open && fields.length === 0) {
    reset({
      level: defaultAdGroupId ? "AD_GROUP" : "CAMPAIGN",
      campaignId: defaultCampaignId ?? "",
      adGroupId: defaultAdGroupId ?? "",
      keywords: [{ text: "", matchType: "EXACT" }],
    });
  }

  function submit(vals: AddNegativeKeywordsFormValues) {
    const payload: AddNegativeKeywordsPayload = {
      keywords: vals.keywords
        .filter((k) => k.text.trim())
        .map((k) => ({
          text: k.text.trim(),
          matchType: k.matchType,
          level: vals.level,
          campaignId: vals.level === "CAMPAIGN" ? vals.campaignId : undefined,
          adGroupId: vals.level === "AD_GROUP" ? vals.adGroupId : undefined,
        })),
    };
    if (payload.keywords.length > 0) {
      onSubmit(payload);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Negative Keywords</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(submit)} className="flex-1 overflow-auto space-y-6 mt-2 pr-2">
          
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {!defaultCampaignId && !defaultAdGroupId && (
              <div className="space-y-1.5">
                <Label>Add to</Label>
                <Controller
                  name="level"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAMPAIGN">Campaign</SelectItem>
                        <SelectItem value="AD_GROUP">Ad Group</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {!defaultCampaignId && (
              <div className="space-y-1.5">
                <Label>Select Campaign</Label>
                <Controller
                  name="campaignId"
                  control={control}
                  rules={{ required: "Required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {level === "AD_GROUP" && !defaultAdGroupId && (
              <div className="space-y-1.5">
                <Label>Select Ad Group</Label>
                <Controller
                  name="adGroupId"
                  control={control}
                  rules={{ required: "Required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={!selectedCampaignId}>
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
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Negative Keywords</Label>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-[1fr_120px_40px] gap-2 px-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <div>Keyword text</div>
                <div>Match type</div>
                <div></div>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_120px_40px] gap-2 items-start">
                  <Input
                    {...register(`keywords.${index}.text` as const, { required: "Required" })}
                    placeholder="e.g. free"
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
              onClick={() => append({ text: "", matchType: "EXACT" })}
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
              {isPending ? "Saving…" : "Save negative keywords"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


// ─────────────────────────────────────────────────────────────
// NEGATIVE KEYWORDS ROW
// ─────────────────────────────────────────────────────────────

interface NegativeKeywordRowProps {
  keyword: NegativeKeyword;
  selected: boolean;
  onToggle: () => void;
  onRemove: () => void;
}

function NegativeKeywordRow({
  keyword,
  selected,
  onToggle,
  onRemove,
}: NegativeKeywordRowProps) {
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
      <td className="px-4 py-3 font-semibold text-slate-800" style={{ minWidth: "220px" }}>
        {keyword.text}
      </td>
      <td className="px-4 py-3">
        <MatchTypeChip matchType={keyword.matchType} />
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 capitalize">
        {keyword.level.replace("_", " ").toLowerCase()}
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">
        {keyword.campaignName ?? keyword.sharedSetName ?? "—"}
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">
        {keyword.adGroupName ?? "—"}
      </td>
      <td className="px-4 py-3 w-12 text-right">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// NEGATIVE KEYWORDS TAB
// ─────────────────────────────────────────────────────────────

interface NegativeKeywordsTabProps {
  clientId: number;
  campaignId?: string;
  adGroupId?: string;
}

export function NegativeKeywordsTab({ clientId, campaignId, adGroupId }: NegativeKeywordsTabProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);

  const queryParams = {
    ...(campaignId && { campaignId }),
    ...(adGroupId && { adGroupId }),
  };

  const { data, isLoading, isError, error, refetch } = useNegativeKeywords(clientId, queryParams);
  const addMutation = useAddNegativeKeywords(clientId);
  const removeMutation = useRemoveNegativeKeyword(clientId);

  const keywords = useMemo(() => data?.negativeKeywords ?? [], [data?.negativeKeywords]);
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

  function bulkRemove() {
    [...selectedIds].forEach((id) => removeMutation.mutate(id));
    setSelectedIds(new Set());
  }

  const COLS = [
    { label: "Negative keyword", align: "left" as const },
    { label: "Match type", align: "left" as const },
    { label: "Level", align: "left" as const },
    { label: "Campaign / List", align: "left" as const },
    { label: "Ad group", align: "left" as const },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search negative keywords…"
        leftActions={
          selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs text-slate-500 font-medium">
                {selectedIds.size} selected
              </span>
              <Button variant="outline" size="sm" onClick={bulkRemove} className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50">
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
            Add negative keywords
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
                    col.align === ("right" as string) ? "text-right" : "text-left"
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
                    title="No negative keywords found"
                    description="Prevent your ads from showing for certain search terms."
                    action={
                      <Button
                        size="sm"
                        className="bg-blue-600 text-white gap-2"
                        onClick={() => setCreateOpen(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Add negative keywords
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              visible.map((k) => (
                <NegativeKeywordRow
                  key={k.id}
                  keyword={k}
                  selected={selectedIds.has(k.id)}
                  onToggle={() => toggleOne(k.id)}
                  onRemove={() => removeMutation.mutate(k.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddNegativeKeywordsModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        clientId={clientId}
        defaultCampaignId={campaignId}
        defaultAdGroupId={adGroupId}
        isPending={addMutation.isPending}
        onSubmit={(payload) => {
          addMutation.mutate(payload, {
            onSuccess: () => setCreateOpen(false),
          });
        }}
      />
    </div>
  );
}
