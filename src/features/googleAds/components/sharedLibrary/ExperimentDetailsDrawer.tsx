import { X, Activity, Scale, Info, Play, Square, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Experiment } from "../../types/googleAds.types";
import { useStartExperiment, useStopExperiment, usePromoteExperiment } from "../../hooks/useCampaignManagement";

interface ExperimentDetailsDrawerProps {
  clientId: number;
  experiment: Experiment | null;
  onClose: () => void;
}

export function ExperimentDetailsDrawer({ clientId, experiment, onClose }: ExperimentDetailsDrawerProps) {
  const startMutation = useStartExperiment(clientId);
  const stopMutation = useStopExperiment(clientId);
  const promoteMutation = usePromoteExperiment(clientId);

  if (!experiment) return null;

  const handleStart = () => startMutation.mutate(experiment.experimentId);
  const handleStop = () => stopMutation.mutate(experiment.experimentId);
  const handlePromote = () => {
    if (confirm("Promoting the winning arm will convert it into a regular campaign or apply it to the base. Proceed?")) {
      promoteMutation.mutate(experiment.experimentId);
    }
  };

  const getStatusBadge = (status: Experiment["status"]) => {
    switch (status) {
      case "CREATING":
        return <Badge variant="secondary">Creating</Badge>;
      case "ACTIVE":
        return <Badge variant="default" className="bg-emerald-500">Active</Badge>;
      case "FINISHED":
        return <Badge variant="default" className="bg-blue-500">Finished</Badge>;
      case "PROMOTING":
      case "PROMOTED":
        return <Badge variant="default" className="bg-purple-500">{status}</Badge>;
      case "SUSPENDED":
        return <Badge variant="secondary" className="bg-amber-500 text-white">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col transform transition-transform duration-300">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            Experiment Details
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{experiment.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="w-8 h-8 p-0 text-slate-500">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Status & Actions */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Status</span>
            {getStatusBadge(experiment.status)}
          </div>
          
          <div className="flex gap-2">
            {experiment.status === "CREATING" && (
              <Button onClick={handleStart} disabled={startMutation.isPending} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Play className="w-4 h-4 mr-2" /> Start Experiment
              </Button>
            )}
            {experiment.status === "ACTIVE" && (
              <Button onClick={handleStop} disabled={stopMutation.isPending} variant="secondary" className="flex-1 bg-amber-100 text-amber-800 hover:bg-amber-200">
                <Square className="w-4 h-4 mr-2" /> Stop Experiment
              </Button>
            )}
            {(experiment.status === "FINISHED" || experiment.status === "ACTIVE") && (
              <Button onClick={handlePromote} disabled={promoteMutation.isPending} className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Trophy className="w-4 h-4 mr-2" /> Promote Winner
              </Button>
            )}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Configuration */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" /> Configuration
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <div className="text-slate-500 mb-1">Base Campaign</div>
              <div className="font-medium text-slate-800 truncate" title={experiment.baseCampaignId}>
                {experiment.baseCampaignId}
              </div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">Draft Campaign</div>
              <div className="font-medium text-slate-800 truncate" title={experiment.draftCampaignId}>
                {experiment.draftCampaignId}
              </div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">Start Date</div>
              <div className="font-medium text-slate-800">{experiment.startDate || "None"}</div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">End Date</div>
              <div className="font-medium text-slate-800">{experiment.endDate || "None"}</div>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Performance Mock / Notice */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" /> Performance Comparison
          </h3>
          <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-lg text-sm">
            Reporting Not Yet Connected. Experiment performance metrics are not currently available through the internal reporting infrastructure. 
            View this experiment directly in Google Ads for complete statistical analysis.
          </div>
        </div>

      </div>
    </div>
  );
}
