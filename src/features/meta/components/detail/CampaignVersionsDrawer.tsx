import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { History, Loader2, RotateCcw } from "lucide-react";
import {
  useCampaignVersions,
  useRollbackVersion,
} from "@/features/meta/hooks/useMetaAdmin";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: number | null;
  campaignId: string | null;
  campaignName?: string;
};

export function CampaignVersionsDrawer({
  open,
  onOpenChange,
  clientId,
  campaignId,
  campaignName,
}: Props) {
  // Confirmation flow before rollback — irreversible operation, single
  // confirm dialog is too easy to misclick.
  const [confirmingVersion, setConfirmingVersion] = useState<number | null>(null);
  const { data, isLoading } = useCampaignVersions(
    open ? clientId : null,
    open ? campaignId : null
  );
  const { mutate: rollback, isPending: isRolling } = useRollbackVersion();

  const handleRollback = (versionNumber: number) => {
    if (!clientId || !campaignId) return;
    rollback(
      { clientId, campaignId, versionNumber },
      {
        onSuccess: () => {
          setConfirmingVersion(null);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
          </DialogTitle>
          <DialogDescription>
            {campaignName ?? "Campaign"} — every edit creates a version. Roll back to
            restore an earlier configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-[200px] space-y-2 pt-2">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </>
          ) : !data || data.length === 0 ? (
            <div className="text-center text-sm text-slate-500 py-8">
              No version history yet — this campaign hasn't been edited since the
              backend started tracking versions.
            </div>
          ) : (
            data.map((version, idx) => {
              const isLatest = idx === 0;
              const isConfirming = confirmingVersion === version.versionNumber;
              return (
                <div
                  key={version.id}
                  className="rounded-xl border border-slate-100 bg-white p-3 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        v{version.versionNumber}
                      </span>
                      {isLatest && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] uppercase">
                          Current
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(version.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      by{" "}
                      <span className="font-semibold">
                        {version.actorName ?? `user ${version.actorUserId}`}
                      </span>
                      {version.changeReason ? ` — ${version.changeReason}` : ""}
                    </div>
                  </div>
                  {!isLatest && (
                    isConfirming ? (
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmingVersion(null)}
                          className="h-7 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={isRolling}
                          onClick={() => handleRollback(version.versionNumber)}
                          className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                        >
                          {isRolling ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : null}
                          Confirm
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmingVersion(version.versionNumber)}
                        className="gap-1.5 text-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Roll back
                      </Button>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
