import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SharedNegativeKeywordTable } from "./SharedNegativeKeywordTable";
import { CampaignAssociationDrawer } from "./CampaignAssociationDrawer";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import type { SharedSet } from "../../types/googleAds.types";
import { useCampaignSharedSets, useRemoveCampaignSharedSet } from "../../hooks/useCampaignManagement";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

interface EditSharedNegativeListModalProps {
  clientId: number;
  sharedSet: SharedSet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSharedNegativeListModal({
  clientId,
  sharedSet,
  open,
  onOpenChange
}: EditSharedNegativeListModalProps) {
  const [activeTab, setActiveTab] = useState("keywords");
  const [isApplying, setIsApplying] = useState(false);

  const { data: campaignSets } = useCampaignSharedSets(clientId, open ? sharedSet.id : null);
  const removeMutation = useRemoveCampaignSharedSet(clientId, sharedSet.id);

  const appliedCampaigns = campaignSets?.campaignSharedSets ?? [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-slate-200 shrink-0">
            <DialogTitle className="text-xl">
              List: <span className="text-blue-600 font-normal">{sharedSet.name}</span>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 border-b border-slate-200 shrink-0">
              <TabsList className="bg-transparent p-0 gap-4">
                <TabsTrigger 
                  value="keywords"
                  className="rounded-none border-b-2 border-transparent px-2 py-3 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent data-[state=inactive]:text-slate-500"
                >
                  Negative keywords ({sharedSet.memberCount})
                </TabsTrigger>
                <TabsTrigger 
                  value="campaigns"
                  className="rounded-none border-b-2 border-transparent px-2 py-3 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-transparent data-[state=inactive]:text-slate-500"
                >
                  Applied campaigns ({appliedCampaigns.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden p-6 bg-slate-50/50">
              <TabsContent value="keywords" className="h-full m-0">
                <SharedNegativeKeywordTable clientId={clientId} sharedSetId={sharedSet.id} />
              </TabsContent>

              <TabsContent value="campaigns" className="h-full m-0 flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-medium text-slate-800">Campaign associations</h3>
                  <Button size="sm" onClick={() => setIsApplying(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Link2 className="w-4 h-4" />
                    Apply to campaigns
                  </Button>
                </div>
                <div className="flex-1 overflow-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 sticky top-0">
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appliedCampaigns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-48 text-center text-slate-500 text-sm">
                            This list is not applied to any campaigns yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        appliedCampaigns.map(camp => (
                          <TableRow key={camp.campaignId}>
                            <TableCell className="font-medium text-slate-800">{camp.campaignName}</TableCell>
                            <TableCell>
                              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">{camp.status}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => {
                                  if (window.confirm("Remove this list from the campaign?")) {
                                    removeMutation.mutate(camp.campaignId);
                                  }
                                }}
                                disabled={removeMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {isApplying && (
        <CampaignAssociationDrawer 
          clientId={clientId}
          isOpen={true}
          assignmentId={sharedSet.id}
          assignmentName={sharedSet.name}
          assignmentType="sharedSet"
          onClose={() => setIsApplying(false)}
        />
      )}
    </>
  );
}
