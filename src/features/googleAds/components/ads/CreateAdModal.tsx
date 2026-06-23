import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateResponsiveSearchAd } from "../../hooks/useCampaignManagement";
import { Plus, Trash2 } from "lucide-react";
import { RsaPreviewCard } from "./AdsTab";
import type { Ad } from "../../types/googleAds.types";

interface CreateAdModalProps {
  clientId: number;
  adGroupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAdModal({ clientId, adGroupId, open, onOpenChange }: CreateAdModalProps) {
  const [finalUrl, setFinalUrl] = useState("https://www.example.com");
  const [path1, setPath1] = useState("");
  const [path2, setPath2] = useState("");
  const [headlines, setHeadlines] = useState([{ text: "", id: 1 }, { text: "", id: 2 }, { text: "", id: 3 }]);
  const [descriptions, setDescriptions] = useState([{ text: "", id: 1 }, { text: "", id: 2 }]);
  
  const createMutation = useCreateResponsiveSearchAd(clientId, adGroupId);

  const mockAd: Ad = {
    id: `ad-${Date.now()}`,
    adGroupId,
    campaignId: "campaign-unknown",
    type: "RESPONSIVE_SEARCH_AD",
    status: "ENABLED",
    finalUrls: [finalUrl],
    displayUrl: finalUrl.replace("https://", "").replace("http://", "").split("/")[0],
    responsiveSearchAd: {
      headlines: headlines.map(h => ({ text: h.text || "New Headline", assetPerformanceLabel: "PENDING" })),
      descriptions: descriptions.map(d => ({ text: d.text || "New Description", assetPerformanceLabel: "PENDING" })),
      path1,
      path2,
    },
    metrics: { impressions: 0, clicks: 0, cost: 0, conversions: 0, ctr: 0, averageCpc: 0, conversionRate: 0, costPerConversion: 0 }
  };

  const handleCreate = () => {
    createMutation.mutate({
      finalUrls: [finalUrl],
      responsiveSearchAd: {
        headlines: headlines.map(h => ({ text: h.text })),
        descriptions: descriptions.map(d => ({ text: d.text })),
        path1,
        path2,
      }
    }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  const updateHeadline = (id: number, text: string) => {
    setHeadlines(prev => prev.map(h => h.id === id ? { ...h, text } : h));
  };
  
  const updateDescription = (id: number, text: string) => {
    setDescriptions(prev => prev.map(d => d.id === id ? { ...d, text } : d));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 shrink-0">
          <DialogTitle>Create Responsive Search Ad</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Form */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="space-y-3">
              <Label>Final URL</Label>
              <Input value={finalUrl} onChange={e => setFinalUrl(e.target.value)} placeholder="https://www.example.com" />
            </div>

            <div className="space-y-3">
              <Label>Display path</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">www.example.com/</span>
                <Input value={path1} onChange={e => setPath1(e.target.value)} placeholder="Path 1" maxLength={15} />
                <span className="text-sm text-slate-500">/</span>
                <Input value={path2} onChange={e => setPath2(e.target.value)} placeholder="Path 2" maxLength={15} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Headlines (up to 15)</Label>
                {headlines.length < 15 && (
                  <Button variant="ghost" size="sm" onClick={() => setHeadlines([...headlines, { text: "", id: Date.now() }])} className="text-blue-600">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {headlines.map((h, i) => (
                  <div key={h.id} className="flex gap-2">
                    <Input value={h.text} onChange={e => updateHeadline(h.id, e.target.value)} placeholder={`Headline ${i + 1}`} maxLength={30} />
                    {headlines.length > 3 && (
                      <Button variant="ghost" size="icon" onClick={() => setHeadlines(prev => prev.filter(item => item.id !== h.id))} className="text-slate-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Descriptions (up to 4)</Label>
                {descriptions.length < 4 && (
                  <Button variant="ghost" size="sm" onClick={() => setDescriptions([...descriptions, { text: "", id: Date.now() }])} className="text-blue-600">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {descriptions.map((d, i) => (
                  <div key={d.id} className="flex gap-2">
                    <Input value={d.text} onChange={e => updateDescription(d.id, e.target.value)} placeholder={`Description ${i + 1}`} maxLength={90} />
                    {descriptions.length > 2 && (
                      <Button variant="ghost" size="icon" onClick={() => setDescriptions(prev => prev.filter(item => item.id !== d.id))} className="text-slate-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-[360px] bg-slate-50 border-l border-slate-200 p-6 flex flex-col gap-4 overflow-y-auto shrink-0">
            <h3 className="font-semibold text-slate-800">Ad Preview</h3>
            <div className="flex-1">
              <RsaPreviewCard ad={mockAd} device="mobile" />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-200 shrink-0 bg-slate-50">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={createMutation.isPending || headlines.some(h => !h.text) || descriptions.some(d => !d.text)} className="bg-blue-600 hover:bg-blue-700 text-white">
            {createMutation.isPending ? "Saving..." : "Save new ad"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
