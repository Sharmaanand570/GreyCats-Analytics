import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Info, Upload } from "lucide-react";

interface DemandGenAssetBuilderProps {
  clientId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId?: string;
}

export function DemandGenAssetBuilder({
  // @ts-expect-error unused variable
  clientId,
  open,
  onOpenChange,
}: DemandGenAssetBuilderProps) {
  const [name, setName] = useState("");
  const [finalUrl, setFinalUrl] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [headlines, setHeadlines] = useState<string[]>([""]);
  const [descriptions, setDescriptions] = useState<string[]>([""]);
  
  const [images, setImages] = useState<string[]>([]);
  const [logos, setLogos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  // Demand Gen validations
  const hasLogo = logos.filter(Boolean).length >= 1;
  const hasImageOrVideo = images.filter(Boolean).length >= 1 || videos.filter(Boolean).length >= 1;
  const hasHeadlines = headlines.filter(h => h.trim()).length >= 1;
  const hasDescriptions = descriptions.filter(d => d.trim()).length >= 1;
  const hasFinalUrl = finalUrl.trim() !== "";
  const hasBusinessName = businessName.trim() !== "";
  const hasName = name.trim() !== "";

  const isValid =
    hasLogo &&
    hasImageOrVideo &&
    hasHeadlines &&
    hasDescriptions &&
    hasFinalUrl &&
    hasBusinessName &&
    hasName;

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("Please meet all minimum requirements before publishing.");
      return;
    }
    toast.success("Demand Gen Asset Group created successfully.");
    onOpenChange(false);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const mockUrl = `https://assets.greycats.app/mock/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
    setList((prev) => [...prev, mockUrl]);
  };

  const updateList = (idx: number, val: string, list: string[], setList: any) => {
    const copy = [...list];
    copy[idx] = val;
    setList(copy);
  };

  const addField = (list: string[], setList: any) => {
    setList([...list, ""]);
  };

  const ReqItem = ({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-slate-300" />
      )}
      <span className={met ? "text-slate-700" : "text-slate-500"}>{label}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <div className="px-6 py-4 border-b border-slate-200">
          <DialogTitle className="text-xl font-semibold">Build Demand Gen Ads</DialogTitle>
          <p className="text-sm text-slate-500 mt-1">
            Reach users on YouTube, Discover, and Gmail with high-quality visual ads.
          </p>
        </div>

        <div className="flex-1 overflow-auto flex">
          {/* Form Side */}
          <div className="flex-1 p-6 space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 border-b pb-2">Basic Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ad Group Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Summer Collection" />
                </div>
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g., GreyCats" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Final URL</Label>
                  <Input value={finalUrl} onChange={(e) => setFinalUrl(e.target.value)} placeholder="https://example.com" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 border-b pb-2">Visual Assets</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Images ({images.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {images.map((url, i) => (
                      <img key={i} src={url} className="w-16 h-16 object-cover border rounded" alt="" />
                    ))}
                    <label className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-slate-300 rounded cursor-pointer hover:bg-slate-50 transition-colors">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setImages)} />
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Logos ({logos.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {logos.map((url, i) => (
                      <img key={i} src={url} className="w-16 h-16 object-contain border rounded" alt="" />
                    ))}
                    <label className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-slate-300 rounded cursor-pointer hover:bg-slate-50 transition-colors">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setLogos)} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label>Videos ({videos.length})</Label>
                <div className="flex gap-2">
                  {videos.map((val, i) => (
                    <Input key={i} value={val} onChange={(e) => updateList(i, e.target.value, videos, setVideos)} placeholder="YouTube URL" />
                  ))}
                  <Button variant="outline" onClick={() => addField(videos, setVideos)}>Add Video URL</Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 border-b pb-2 flex justify-between">
                Headlines (Up to 5)
                <Button variant="ghost" size="sm" onClick={() => addField(headlines, setHeadlines)} className="h-6 px-2 text-xs">Add Headline</Button>
              </h3>
              {headlines.map((val, i) => (
                <Input key={i} value={val} onChange={(e) => updateList(i, e.target.value, headlines, setHeadlines)} placeholder="Headline (max 40 chars)" maxLength={40} />
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 border-b pb-2 flex justify-between">
                Descriptions (Up to 5)
                <Button variant="ghost" size="sm" onClick={() => addField(descriptions, setDescriptions)} className="h-6 px-2 text-xs">Add Description</Button>
              </h3>
              {descriptions.map((val, i) => (
                <Input key={i} value={val} onChange={(e) => updateList(i, e.target.value, descriptions, setDescriptions)} placeholder="Description (max 90 chars)" maxLength={90} />
              ))}
            </div>

          </div>

          {/* Validation Side */}
          <div className="w-72 bg-slate-50 border-l border-slate-200 p-6 flex flex-col">
            <h3 className="font-medium text-slate-900 flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-blue-500" />
              Requirements
            </h3>
            
            <div className="space-y-3 flex-1">
              <ReqItem met={hasName} label="Ad Group Name" />
              <ReqItem met={hasBusinessName} label="Business Name" />
              <ReqItem met={hasFinalUrl} label="Final URL" />
              <ReqItem met={hasLogo} label="At least 1 Logo" />
              <ReqItem met={hasImageOrVideo} label="At least 1 Image or Video" />
              <ReqItem met={hasHeadlines} label="At least 1 Headline" />
              <ReqItem met={hasDescriptions} label="At least 1 Description" />
            </div>

            <div className="pt-4 border-t border-slate-200 mt-6">
              <div className="text-sm font-medium text-slate-900 mb-2">Ad Strength Preview</div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${isValid ? 'bg-green-500 w-full' : 'bg-orange-400 w-1/3'}`}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={handlePublish}
            disabled={!isValid}
          >
            Publish Ad
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
