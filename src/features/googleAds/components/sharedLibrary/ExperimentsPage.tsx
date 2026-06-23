import { useState } from "react";
import { Play, Square, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useExperiments, useStartExperiment, useStopExperiment } from "../../hooks/useCampaignManagement";
import type { Experiment } from "../../types/googleAds.types";
import { ExperimentDetailsDrawer } from "./ExperimentDetailsDrawer";
// Removed table skeleton and error state

interface ExperimentsPageProps {
  clientId: number;
}

export function ExperimentsPage({ clientId }: ExperimentsPageProps) {
  const { data, isLoading, isError, error } = useExperiments(clientId);
  const experiments = data?.experiments || [];
  const arms = data?.arms || [];

  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);

  const startMutation = useStartExperiment(clientId);
  const stopMutation = useStopExperiment(clientId);

  const handleStart = (experimentId: string) => {
    startMutation.mutate(experimentId);
  };

  const handleStop = (experimentId: string) => {
    stopMutation.mutate(experimentId);
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
      case "REMOVED":
        return <Badge variant="destructive">Removed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getExperimentSplit = (experimentId: string) => {
    const arm = arms.find(a => a.experimentId === experimentId && !a.isBase);
    if (!arm) return "Unknown";
    return `Base ${100 - arm.trafficSplit}% / Trial ${arm.trafficSplit}%`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Experiments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Test changes against your base campaigns to measure impact before applying them.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Experiment Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Base / Draft Campaigns</TableHead>
              <TableHead className="font-semibold text-slate-700">Traffic Split</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  Loading experiments...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-red-500">
                  {error?.message || "Failed to load experiments"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && experiments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  No experiments found. Create an experiment from a draft.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && experiments.map((experiment) => (
              <TableRow key={experiment.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-medium text-slate-900">
                  {experiment.name}
                  <div className="text-xs text-slate-400 mt-0.5">{experiment.startDate || "No start date"} - {experiment.endDate || "No end date"}</div>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="text-slate-500 truncate max-w-[200px]" title={experiment.baseCampaignId}>
                    Base: {experiment.baseCampaignId}
                  </div>
                  <div className="text-slate-500 truncate max-w-[200px]" title={experiment.draftCampaignId}>
                    Trial: {experiment.draftCampaignId}
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 text-sm">
                  {getExperimentSplit(experiment.experimentId)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(experiment.status)}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedExperiment(experiment)}
                    className="h-8 px-2 text-slate-600 hover:text-blue-600"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {experiment.status === "CREATING" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStart(experiment.experimentId)}
                      className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      disabled={startMutation.isPending}
                      title="Start experiment"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {experiment.status === "ACTIVE" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStop(experiment.experimentId)}
                      className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      disabled={stopMutation.isPending}
                      title="Stop experiment"
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ExperimentDetailsDrawer
        clientId={clientId}
        experiment={selectedExperiment}
        onClose={() => setSelectedExperiment(null)}
      />
    </div>
  );
}
