import { useState } from "react";
import { Plus, Edit2, Play, Trash2, ArrowUpCircle } from "lucide-react";
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
import { useCampaignDrafts, useRemoveCampaignDraft, usePromoteCampaignDraft } from "../../hooks/useCampaignManagement";
import type { CampaignDraft, Campaign } from "../../types/googleAds.types";
import { CreateDraftModal } from "./CreateDraftModal";
import { CreateExperimentModal } from "./CreateExperimentModal";
import { CampaignEditDrawer } from "../campaigns/CampaignEditDrawer";
// Removed skeleton and error state

interface DraftsPageProps {
  clientId: number;
}

export function DraftsPage({ clientId }: DraftsPageProps) {
  const { data, isLoading, isError, error } = useCampaignDrafts(clientId);
  const drafts = data?.drafts || [];

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [experimentDraft, setExperimentDraft] = useState<CampaignDraft | null>(null);
  
  // Reusing CampaignEditDrawer for drafts
  // We mock a Campaign object for the drawer using the draft's shadow campaign ID
  const [editingDraft, setEditingDraft] = useState<CampaignDraft | null>(null);

  const removeMutation = useRemoveCampaignDraft(clientId);
  const promoteMutation = usePromoteCampaignDraft(clientId);

  const handleEdit = (draft: CampaignDraft) => {
    setEditingDraft(draft);
  };

  const handleRemove = (draftId: string) => {
    if (confirm("Are you sure you want to delete this draft?")) {
      removeMutation.mutate(draftId);
    }
  };

  const handlePromote = (draftId: string) => {
    if (confirm("Promoting this draft will apply its changes to the base campaign. Continue?")) {
      promoteMutation.mutate(draftId);
    }
  };

  const getStatusBadge = (status: CampaignDraft["status"]) => {
    switch (status) {
      case "PROPOSED":
        return <Badge variant="secondary">Proposed</Badge>;
      case "PROMOTING":
        return <Badge variant="default" className="bg-amber-500">Promoting</Badge>;
      case "PROMOTED":
        return <Badge variant="default" className="bg-emerald-500">Promoted</Badge>;
      case "REMOVED":
        return <Badge variant="destructive">Removed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Convert the draft to a mock Campaign so we can reuse the CampaignEditDrawer
  const mockCampaignForEdit: Campaign | null = editingDraft ? {
    id: editingDraft.draftCampaignId || `draft-shadow-${editingDraft.id}`,
    name: editingDraft.draftName,
    status: "PAUSED",
    campaignType: "SEARCH",
    budgetAmountMicros: 0,
    budgetAmount: 0,
    startDate: "",
    endDate: "",
    biddingStrategyId: undefined,
    bidStrategyType: "MANUAL_CPC",
    trackingUrlTemplate: "",
    finalUrlSuffix: "",
    metrics: { impressions: 0, clicks: 0, costMicros: 0, conversions: 0 } as any
  } as Campaign : null;

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Campaign Drafts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Prepare changes to your campaigns without affecting their current performance.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" /> New Draft
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Draft Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Base Campaign</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  Loading drafts...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-red-500">
                  {error?.message || "Failed to load drafts"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && drafts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  No drafts found. Create one to start experimenting.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && drafts.map((draft) => (
              <TableRow key={draft.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-medium text-slate-900">
                  {draft.draftName}
                </TableCell>
                <TableCell className="text-slate-600">
                  {draft.baseCampaignName}
                </TableCell>
                <TableCell>
                  {getStatusBadge(draft.status)}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(draft)}
                    className="h-8 px-2 text-slate-600 hover:text-blue-600"
                    disabled={draft.status === "REMOVED" || draft.status === "PROMOTED"}
                    title="Edit draft settings"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePromote(draft.draftId)}
                    className="h-8 px-2 text-slate-600 hover:text-emerald-600"
                    disabled={draft.status === "REMOVED" || draft.status === "PROMOTED"}
                    title="Apply changes to original campaign"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExperimentDraft(draft)}
                    className="h-8 px-2 text-slate-600 hover:text-purple-600"
                    disabled={draft.status === "REMOVED" || draft.status === "PROMOTED"}
                    title="Run as an experiment"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(draft.draftId)}
                    className="h-8 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    disabled={draft.status === "REMOVED"}
                    title="Delete draft"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateDraftModal 
        clientId={clientId} 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
      />

      {editingDraft && (
        <CampaignEditDrawer
          clientId={clientId}
          campaign={mockCampaignForEdit}
          onClose={() => setEditingDraft(null)}
        />
      )}

      {experimentDraft && (
        <CreateExperimentModal
          clientId={clientId}
          isOpen={!!experimentDraft}
          draft={experimentDraft}
          onClose={() => setExperimentDraft(null)}
        />
      )}
    </div>
  );
}
