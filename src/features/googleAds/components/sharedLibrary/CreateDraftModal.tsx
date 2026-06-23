import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCampaigns } from "../../hooks/useCampaignManagement";
import { useCreateCampaignDraft } from "../../hooks/useCampaignManagement";

interface CreateDraftModalProps {
  clientId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateDraftModal({ clientId, isOpen, onClose }: CreateDraftModalProps) {
  const [name, setName] = useState("");
  const [baseCampaignId, setBaseCampaignId] = useState("");

  const { data: campaignsData, isLoading: isLoadingCampaigns } = useCampaigns(clientId);
  const campaigns = campaignsData?.campaigns || [];
  
  const createMutation = useCreateCampaignDraft(clientId);

  const isFormValid = name.trim().length > 0 && baseCampaignId.length > 0;

  const handleCreate = () => {
    if (!isFormValid) return;
    createMutation.mutate(
      { baseCampaignId, draftName: name },
      {
        onSuccess: () => {
          setName("");
          setBaseCampaignId("");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Campaign Draft</DialogTitle>
          <DialogDescription>
            A draft is a clone of a base campaign. You can make changes to the draft without affecting the original campaign.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="baseCampaign">Base Campaign</Label>
            <Select value={baseCampaignId} onValueChange={setBaseCampaignId}>
              <SelectTrigger id="baseCampaign">
                <SelectValue placeholder={isLoadingCampaigns ? "Loading campaigns..." : "Select a base campaign"} />
              </SelectTrigger>
              <SelectContent>
                {campaigns.filter(c => c.status !== "REMOVED").map((camp) => (
                  <SelectItem key={camp.id} value={camp.id}>
                    {camp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="draftName">Draft Name</Label>
            <Input
              id="draftName"
              placeholder="e.g., Summer Promo Draft"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isFormValid || createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create Draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
