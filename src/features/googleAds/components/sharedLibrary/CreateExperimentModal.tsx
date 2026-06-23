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
// Native input range used instead of Slider
import { useCreateExperiment } from "../../hooks/useCampaignManagement";
import type { CampaignDraft } from "../../types/googleAds.types";

interface CreateExperimentModalProps {
  clientId: number;
  isOpen: boolean;
  draft: CampaignDraft | null;
  onClose: () => void;
}

export function CreateExperimentModal({ clientId, isOpen, draft, onClose }: CreateExperimentModalProps) {
  const [name, setName] = useState("");
  const [trafficSplit, setTrafficSplit] = useState([50]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const createMutation = useCreateExperiment(clientId);

  const isFormValid = name.trim().length > 0 && !!draft;

  const handleCreate = () => {
    if (!isFormValid || !draft) return;
    createMutation.mutate(
      {
        name,
        draftId: draft.draftId,
        baseCampaignId: draft.baseCampaignId,
        trafficSplit: trafficSplit[0],
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      },
      {
        onSuccess: () => {
          setName("");
          setTrafficSplit([50]);
          setStartDate("");
          setEndDate("");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create Experiment</DialogTitle>
          <DialogDescription>
            Turn your draft into an experiment to test changes against the base campaign.
          </DialogDescription>
        </DialogHeader>
        {draft && (
          <div className="grid gap-4 py-4">
            <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded border border-slate-200">
              <span className="font-medium text-slate-700">Base:</span> {draft.baseCampaignName} <br />
              <span className="font-medium text-slate-700">Draft:</span> {draft.draftName}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="experimentName">Experiment Name</Label>
              <Input
                id="experimentName"
                placeholder="e.g., Target CPA Test"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-4 py-2">
              <div className="flex justify-between items-center">
                <Label>Traffic Split</Label>
                <span className="text-sm font-medium text-blue-600">{trafficSplit[0]}%</span>
              </div>
              <input
                type="range"
                value={trafficSplit[0]}
                onChange={(e) => setTrafficSplit([parseInt(e.target.value, 10)])}
                max={99}
                min={1}
                step={1}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Base ({100 - trafficSplit[0]}%)</span>
                <span>Experiment ({trafficSplit[0]}%)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isFormValid || createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create Experiment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
