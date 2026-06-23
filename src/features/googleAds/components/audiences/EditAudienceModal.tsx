import { useState, useEffect } from "react";
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
import { useUpdateAudience } from "../../hooks/useCampaignManagement";
import type { CampaignAudience } from "../../types/googleAds.types";

interface EditAudienceModalProps {
  clientId: number;
  audience: CampaignAudience | null;
  onClose: () => void;
}

export function EditAudienceModal({ clientId, audience, onClose }: EditAudienceModalProps) {
  const updateMutation = useUpdateAudience(clientId);
  const [bidModifier, setBidModifier] = useState("");

  useEffect(() => {
    if (audience) {
      if (audience.bidModifier !== undefined) {
        // converting 1.2 to 20, or 0.8 to -20
        setBidModifier(((audience.bidModifier - 1) * 100).toFixed(0));
      } else {
        setBidModifier("");
      }
    }
  }, [audience]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audience) return;

    let parsedBidModifier: number | undefined = undefined;
    if (bidModifier.trim() !== "") {
      parsedBidModifier = 1 + parseFloat(bidModifier) / 100;
    }

    updateMutation.mutate(
      {
        audienceId: audience.id,
        payload: { bidModifier: parsedBidModifier },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={!!audience} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Audience Targeting</DialogTitle>
            <p className="text-sm text-slate-500 mt-1 truncate">
              {audience?.audienceName}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4 mt-2">
            <div className="space-y-2">
              <Label>Bid Adjustment (%)</Label>
              <Input
                value={bidModifier}
                onChange={(e) => setBidModifier(e.target.value)}
                placeholder="e.g., 20 or -15"
                type="number"
                step="1"
              />
              <p className="text-xs text-slate-400">
                Leave blank to use the default ad group bid. Positive values increase bids (e.g., 20), negative values decrease bids (e.g., -15).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
