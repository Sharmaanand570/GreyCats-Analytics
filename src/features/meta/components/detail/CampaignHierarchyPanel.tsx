import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Boxes,
  ChevronDown,
  ChevronRight,
  Copy,
  Layers,
  Pause,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import {
  getCampaignHierarchical,
  type MetaAdNode,
  type MetaAdSetNode,
} from "@/features/meta/API/metaAdsManagerApi";
import {
  useAddAd,
  useAddAdSet,
  useDeleteAd,
  useDeleteAdSet,
  useDuplicateAd,
  useDuplicateAdSet,
  useUpdateAd,
  useUpdateAdSet,
} from "@/features/meta/hooks/useMetaAdsManager";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: number | null;
  campaignId: string | null;
  campaignName?: string;
};

const StatusPill = ({ status }: { status: string }) => (
  <Badge
    variant="outline"
    className={cn(
      "text-[10px] uppercase font-bold tracking-wider",
      status === "ACTIVE" && "bg-emerald-50 text-emerald-700 border-emerald-200",
      status === "PAUSED" && "bg-amber-50 text-amber-700 border-amber-200",
      status === "DELETED" && "bg-rose-50 text-rose-700 border-rose-200",
      !["ACTIVE", "PAUSED", "DELETED"].includes(status) &&
        "bg-slate-50 text-slate-600 border-slate-200"
    )}
  >
    {status}
  </Badge>
);

// One adset row + nested ads list. Tracks its own expanded state so multiple
// adsets in a campaign can be open at once.
function AdSetRow({
  adSet,
  clientId,
}: {
  adSet: MetaAdSetNode;
  clientId: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [renameTarget, setRenameTarget] = useState<MetaAdNode | null>(null);
  const [newAdOpen, setNewAdOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [newAdName, setNewAdName] = useState("");

  const updateAdSet = useUpdateAdSet();
  const deleteAdSet = useDeleteAdSet();
  const duplicateAdSet = useDuplicateAdSet();
  const updateAd = useUpdateAd();
  const deleteAd = useDeleteAd();
  const duplicateAd = useDuplicateAd();
  const addAd = useAddAd();

  const toggleAdSetStatus = () => {
    updateAdSet.mutate({
      adSetId: adSet.id,
      clientId,
      payload: { status: adSet.status === "ACTIVE" ? "PAUSED" : "ACTIVE" },
    });
  };

  const toggleAdStatus = (ad: MetaAdNode) => {
    updateAd.mutate({
      adId: ad.id,
      clientId,
      payload: { status: ad.status === "ACTIVE" ? "PAUSED" : "ACTIVE" },
    });
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-white">
      <div className="flex items-center gap-2 p-3">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="p-1 hover:bg-slate-100 rounded"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <Layers className="w-4 h-4 text-slate-400" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900 truncate">{adSet.name}</div>
          <div className="text-[10px] text-slate-400 font-mono">
            {adSet.id}
            {adSet.daily_budget ? ` · ${adSet.daily_budget}/day` : ""}
            {adSet.lifetime_budget ? ` · ${adSet.lifetime_budget} lifetime` : ""}
            {adSet.optimization_goal ? ` · ${adSet.optimization_goal}` : ""}
          </div>
        </div>
        <StatusPill status={adSet.status} />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={toggleAdSetStatus}
            disabled={updateAdSet.isPending}
            title={adSet.status === "ACTIVE" ? "Pause" : "Resume"}
          >
            {adSet.status === "ACTIVE" ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => duplicateAdSet.mutate({ adSetId: adSet.id, clientId })}
            disabled={duplicateAdSet.isPending}
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5 text-violet-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => deleteAdSet.mutate({ adSetId: adSet.id, clientId })}
            disabled={deleteAdSet.isPending}
            title="Delete ad set"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/40 p-3 space-y-2">
          {adSet.ads.length === 0 ? (
            <div className="text-xs text-slate-400 italic px-2">No ads in this ad set yet.</div>
          ) : (
            adSet.ads.map((ad) => (
              <div
                key={ad.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-100"
              >
                <Boxes className="w-3.5 h-3.5 text-slate-300 ml-1" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {ad.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{ad.id}</div>
                </div>
                <StatusPill status={ad.status} />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleAdStatus(ad)}
                    disabled={updateAd.isPending}
                  >
                    {ad.status === "ACTIVE" ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setRenameTarget(ad);
                      setRenameValue(ad.name);
                    }}
                    title="Rename"
                  >
                    <span className="text-[10px] font-bold">Aa</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => duplicateAd.mutate({ adId: ad.id, clientId })}
                    disabled={duplicateAd.isPending}
                  >
                    <Copy className="w-3 h-3 text-violet-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => deleteAd.mutate({ adId: ad.id, clientId })}
                    disabled={deleteAd.isPending}
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewAdName("");
              setNewAdOpen(true);
            }}
            className="h-7 w-full justify-start text-xs gap-1.5 mt-1"
          >
            <Plus className="w-3 h-3" /> Add ad
          </Button>
        </div>
      )}

      {/* Quick rename modal (name-only edit). Full edit goes through wizard. */}
      <Dialog
        open={!!renameTarget}
        onOpenChange={(o) => !o && setRenameTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename ad</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="rounded-lg"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={!renameValue.trim() || updateAd.isPending}
              onClick={() => {
                if (!renameTarget) return;
                updateAd.mutate(
                  {
                    adId: renameTarget.id,
                    clientId,
                    payload: { name: renameValue.trim() },
                  },
                  { onSuccess: () => setRenameTarget(null) }
                );
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add-ad modal (name-only stub — full creative config goes through wizard) */}
      <Dialog open={newAdOpen} onOpenChange={setNewAdOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new ad</DialogTitle>
          </DialogHeader>
          <Input
            value={newAdName}
            onChange={(e) => setNewAdName(e.target.value)}
            placeholder="Ad name (e.g. 'Hero video v2')"
            className="rounded-lg"
          />
          <p className="text-[11px] text-slate-400">
            This creates a stub ad. Open the wizard or "Rename" to flesh out the
            creative. For full creative control, use the wizard with this ad set
            selected.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewAdOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newAdName.trim() || addAd.isPending}
              onClick={() =>
                addAd.mutate(
                  {
                    adSetId: adSet.id,
                    clientId,
                    payload: { name: newAdName.trim(), status: "PAUSED" },
                  },
                  { onSuccess: () => setNewAdOpen(false) }
                )
              }
            >
              Add ad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CampaignHierarchyPanel({
  open,
  onOpenChange,
  clientId,
  campaignId,
  campaignName,
}: Props) {
  const [newAdSetOpen, setNewAdSetOpen] = useState(false);
  const [newAdSetName, setNewAdSetName] = useState("");
  const addAdSet = useAddAdSet();

  // Hierarchical fetch — only when the drawer is open and we have an id.
  // staleTime: 30s so opening/closing the panel doesn't refetch repeatedly.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["meta-ads-detail", "hierarchy", clientId, campaignId],
    queryFn: () =>
      getCampaignHierarchical(campaignId as string, clientId as number),
    enabled: open && !!clientId && !!campaignId,
    staleTime: 30 * 1000,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span>Hierarchy — {campaignName ?? "Campaign"}</span>
            <Button
              size="sm"
              onClick={() => {
                setNewAdSetName("");
                setNewAdSetOpen(true);
              }}
              className="h-8 rounded-lg gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add ad set
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-[300px] space-y-2 pt-2">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </>
          ) : isError ? (
            <Card className="rounded-xl border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
              {error?.message || "Couldn't load hierarchy."}
            </Card>
          ) : !data || data.adSets.length === 0 ? (
            <Card className="rounded-xl border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              No ad sets in this campaign yet. Click "Add ad set" to create one.
            </Card>
          ) : (
            data.adSets.map((adSet) => (
              <AdSetRow key={adSet.id} adSet={adSet} clientId={clientId as number} />
            ))
          )}
        </div>
      </DialogContent>

      {/* Add-adset modal */}
      <Dialog open={newAdSetOpen} onOpenChange={setNewAdSetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new ad set</DialogTitle>
          </DialogHeader>
          <Input
            value={newAdSetName}
            onChange={(e) => setNewAdSetName(e.target.value)}
            placeholder="Ad set name (e.g. 'US lookalike 1%')"
            className="rounded-lg"
          />
          <p className="text-[11px] text-slate-400">
            Creates an empty ad set under this campaign. Add targeting and ads
            after via Quick Edit or the wizard.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewAdSetOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newAdSetName.trim() || !campaignId || addAdSet.isPending}
              onClick={() =>
                addAdSet.mutate(
                  {
                    campaignId: campaignId as string,
                    clientId: clientId as number,
                    payload: { name: newAdSetName.trim(), status: "PAUSED" },
                  },
                  { onSuccess: () => setNewAdSetOpen(false) }
                )
              }
            >
              Add ad set
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
