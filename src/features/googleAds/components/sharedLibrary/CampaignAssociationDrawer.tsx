import { useState, useMemo, useEffect } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  useCampaigns, 
  useAssignCampaignBiddingStrategy, 
  useAssociateCampaignSharedSet,
  useAssignCampaignSharedBudget
} from "../../hooks/useCampaignManagement";
import { ErrorState, TableSkeletonRows } from "../ui/GoogleAdsShared";

interface CampaignAssociationDrawerProps {
  clientId: number;
  isOpen: boolean;
  onClose: () => void;
  assignmentType: "sharedSet" | "biddingStrategy" | "sharedBudget";
  assignmentId: string;
  assignmentName: string;
}

export function CampaignAssociationDrawer({ clientId, isOpen, assignmentType, assignmentId, assignmentName, onClose }: CampaignAssociationDrawerProps) {
  if (!isOpen) return null;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<Set<string>>(new Set());

  const { data: campaignsData, isLoading: isLoadingCampaigns, isError, error } = useCampaigns(clientId);
  
  const associateSharedSet = useAssociateCampaignSharedSet(clientId);
  const assignBiddingStrategy = useAssignCampaignBiddingStrategy(clientId);
  const assignSharedBudget = useAssignCampaignSharedBudget(clientId);

  const campaigns = useMemo(() => campaignsData?.campaigns ?? [], [campaignsData?.campaigns]);

  useEffect(() => {
    if (campaigns.length > 0 && isOpen) {
      let initialSelected: string[] = [];
      if (assignmentType === "biddingStrategy") {
        initialSelected = campaigns.filter(c => c.biddingStrategyId === assignmentId).map(c => c.id);
      } else if (assignmentType === "sharedBudget") {
        initialSelected = campaigns.filter(c => c.sharedBudgetId === assignmentId).map(c => c.id);
      }
      setSelectedCampaignIds(new Set(initialSelected));
    }
  }, [campaigns, assignmentType, assignmentId, isOpen]);

  const filteredCampaigns = useMemo(() => {
    if (!searchTerm) return campaigns;
    const q = searchTerm.toLowerCase();
    return campaigns.filter(c => c.name.toLowerCase().includes(q) || c.id.includes(q));
  }, [campaigns, searchTerm]);

  const handleToggle = (id: string) => {
    setSelectedCampaignIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedCampaignIds.size === filteredCampaigns.length) {
      setSelectedCampaignIds(new Set());
    } else {
      setSelectedCampaignIds(new Set(filteredCampaigns.map(c => c.id)));
    }
  };

  const isSaving = associateSharedSet.isPending || assignBiddingStrategy.isPending || assignSharedBudget.isPending;

  const handleSave = async () => {
    if (selectedCampaignIds.size === 0) return;
    
    try {
      if (assignmentType === "sharedSet") {
        await associateSharedSet.mutateAsync({ campaignIds: Array.from(selectedCampaignIds), sharedSetId: assignmentId });
      } else if (assignmentType === "biddingStrategy") {
        await Promise.all(
          Array.from(selectedCampaignIds).map(campaignId => 
            assignBiddingStrategy.mutateAsync({ campaignId, strategyId: assignmentId })
          )
        );
      } else if (assignmentType === "sharedBudget") {
        await Promise.all(
          Array.from(selectedCampaignIds).map(campaignId => 
            assignSharedBudget.mutateAsync({ campaignId, budgetId: assignmentId })
          )
        );
      }
      onClose();
    } catch (err) {
      console.error("Failed to associate campaigns", err);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col transform transition-transform duration-300">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Apply to campaigns</h2>
          <p className="text-sm text-slate-500">
            {assignmentType === "sharedSet" ? "List" : assignmentType === "sharedBudget" ? "Budget" : "Strategy"}: {assignmentName}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="w-8 h-8 p-0">
          <X className="w-4 h-4 text-slate-500" />
        </Button>
      </div>

      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search campaigns..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isError && <ErrorState message={error?.message ?? "Failed to load campaigns"} onRetry={() => window.location.reload()} />}
        {isLoadingCampaigns && <TableSkeletonRows columns={1} rows={10} />}
        
        {!isLoadingCampaigns && !isError && (
          <div className="flex flex-col gap-2">
            {filteredCampaigns.length > 0 && (
              <div className="flex items-center gap-3 px-2 pb-2 mb-2 border-b border-slate-200">
                <Checkbox 
                  id="select-all" 
                  checked={selectedCampaignIds.size === filteredCampaigns.length && filteredCampaigns.length > 0}
                  onCheckedChange={handleToggleAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Select all {filteredCampaigns.length} campaigns
                </label>
              </div>
            )}
            
            {filteredCampaigns.map(camp => (
              <div key={camp.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
                <Checkbox 
                  id={camp.id} 
                  checked={selectedCampaignIds.has(camp.id)}
                  onCheckedChange={() => handleToggle(camp.id)}
                />
                <div className="flex flex-col">
                  <label htmlFor={camp.id} className="text-sm font-medium text-slate-800 cursor-pointer">{camp.name}</label>
                  <span className="text-xs text-slate-500">{camp.status}</span>
                </div>
              </div>
            ))}

            {filteredCampaigns.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No campaigns found.
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          disabled={selectedCampaignIds.size === 0 || isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSaving ? "Applying..." : "Apply"}
        </Button>
      </div>
    </div>
  );
}
