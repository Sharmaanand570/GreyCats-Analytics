import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateAd } from "../../hooks/useCampaignManagement";
import { Plus, Trash2 } from "lucide-react";
import { RsaPreviewCard } from "./AdsTab";
import type { Ad } from "../../types/googleAds.types";

interface EditAdDrawerProps {
  clientId: number;
  adGroupId: string;
  ad: Ad | null;
  onClose: () => void;
}

export function EditAdDrawer({ clientId, adGroupId, ad, onClose }: EditAdDrawerProps) {
  const open = ad !== null;
  const updateMutation = useUpdateAd(clientId, adGroupId);

  const [finalUrl, setFinalUrl] = useState("");
  const [path1, setPath1] = useState("");
  const [path2, setPath2] = useState("");
  const [headlines, setHeadlines] = useState<{text: string; id: number}[]>([]);
  const [descriptions, setDescriptions] = useState<{text: string; id: number}[]>([]);

  useEffect(() => {
    if (ad) {
      setFinalUrl(ad.finalUrls?.[0] || "");
      setPath1(ad.responsiveSearchAd?.path1 || "");
      setPath2(ad.responsiveSearchAd?.path2 || "");
      setHeadlines(ad.responsiveSearchAd?.headlines?.map((h, i) => ({ text: h.text, id: i })) || []);
      setDescriptions(ad.responsiveSearchAd?.descriptions?.map((d, i) => ({ text: d.text, id: i })) || []);
    }
  }, [ad]);

  const mockAd: Ad = {
    ...ad!,
    finalUrls: [finalUrl],
    displayUrl: finalUrl.replace("https://", "").replace("http://", "").split("/")[0],
    responsiveSearchAd: {
      headlines: headlines.map(h => ({ text: h.text || "Headline", assetPerformanceLabel: "PENDING" })),
      descriptions: descriptions.map(d => ({ text: d.text || "Description", assetPerformanceLabel: "PENDING" })),
      path1,
      path2,
    }
  };

  const handleUpdate = () => {
    if (!ad) return;
    updateMutation.mutate({
      adId: ad.id,
      // @ts-expect-error backend also handles full updates based on our mock
      payload: {
        finalUrls: [finalUrl],
        responsiveSearchAd: {
          headlines: headlines.map(h => ({ text: h.text })),
          descriptions: descriptions.map(d => ({ text: d.text })),
          path1,
          path2,
        }
      }
    }, {
      onSuccess: () => onClose()
    });
  };

  const updateHeadline = (id: number, text: string) => {
    setHeadlines(prev => prev.map(h => h.id === id ? { ...h, text } : h));
  };
  
  const updateDescription = (id: number, text: string) => {
    setDescriptions(prev => prev.map(d => d.id === id ? { ...d, text } : d));
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 py-5 border-b border-slate-200">
          <SheetTitle className="text-base font-bold text-slate-900">Edit Responsive Search Ad</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-2 shrink-0 self-center">
             {ad && <RsaPreviewCard ad={mockAd} device="mobile" />}
          </div>

          <div className="space-y-3">
            <Label>Final URL</Label>
            <Input value={finalUrl} onChange={e => setFinalUrl(e.target.value)} />
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
                <Button variant="ghost" size="sm" onClick={() => setHeadlines([...headlines, { text: "", id: Date.now() }])} className="text-blue-600 h-6 px-2">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {headlines.map(h => (
                <div key={h.id} className="flex gap-2">
                  <Input value={h.text} onChange={e => updateHeadline(h.id, e.target.value)} maxLength={30} />
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
                <Button variant="ghost" size="sm" onClick={() => setDescriptions([...descriptions, { text: "", id: Date.now() }])} className="text-blue-600 h-6 px-2">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {descriptions.map(d => (
                <div key={d.id} className="flex gap-2">
                  <Input value={d.text} onChange={e => updateDescription(d.id, e.target.value)} maxLength={90} />
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

        <SheetFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50 mt-auto shrink-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleUpdate} disabled={updateMutation.isPending || headlines.some(h => !h.text) || descriptions.some(d => !d.text)} className="bg-blue-600 hover:bg-blue-700 text-white">
            {updateMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
