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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Info, Youtube } from "lucide-react";

interface VideoAdBuilderProps {
  clientId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId?: string;
  adGroupId?: string;
}

export function VideoAdBuilder({
  // @ts-expect-error unused variable
  clientId,
  open,
  onOpenChange,
}: VideoAdBuilderProps) {
  const [videoId, setVideoId] = useState("");
  const [format, setFormat] = useState("IN_STREAM");
  const [finalUrl, setFinalUrl] = useState("");
  const [displayUrl, setDisplayUrl] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [headline, setHeadline] = useState("");

  const hasVideoId = videoId.trim() !== "";
  const hasFinalUrl = finalUrl.trim() !== "";
  const hasDisplayUrl = displayUrl.trim() !== "";
  const hasHeadline = headline.trim() !== "";
  const hasCTA = callToAction.trim() !== "";

  const isBumper = format === "BUMPER";

  const isValid = hasVideoId && hasFinalUrl && hasDisplayUrl && (isBumper || (hasHeadline && hasCTA));

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("Please meet all minimum requirements before publishing.");
      return;
    }
    toast.success("Video Ad created successfully.");
    onOpenChange(false);
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
          <DialogTitle className="text-xl font-semibold">Video Ad</DialogTitle>
          <p className="text-sm text-slate-500 mt-1">
            Create ads that play on YouTube and across the Google video partner network.
          </p>
        </div>

        <div className="flex-1 overflow-auto flex">
          {/* Form Side */}
          <div className="flex-1 p-6 space-y-8">
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 border-b pb-2">Video Selection</h3>
              <div className="space-y-2">
                <Label>YouTube Video ID</Label>
                <div className="flex gap-2">
                  <Input 
                    value={videoId} 
                    onChange={(e) => setVideoId(e.target.value)} 
                    placeholder="e.g., dQw4w9WgXcQ" 
                  />
                  <Button variant="secondary" className="px-3">
                    <Youtube className="w-4 h-4 mr-2 text-red-500" /> Search
                  </Button>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label>Video Ad Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_STREAM">Skippable In-stream Ad</SelectItem>
                    <SelectItem value="BUMPER">Bumper Ad (6 seconds max)</SelectItem>
                    <SelectItem value="DISCOVERY">In-feed Video Ad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 border-b pb-2">Destination</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Final URL</Label>
                  <Input value={finalUrl} onChange={(e) => setFinalUrl(e.target.value)} placeholder="https://example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Display URL</Label>
                  <Input value={displayUrl} onChange={(e) => setDisplayUrl(e.target.value)} placeholder="example.com" maxLength={255} />
                </div>
              </div>
            </div>

            {!isBumper && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900 border-b pb-2">Call-to-Action</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Call-to-Action (max 10 chars)</Label>
                    <Input value={callToAction} onChange={(e) => setCallToAction(e.target.value)} placeholder="e.g. Learn More" maxLength={10} />
                  </div>
                  <div className="space-y-2">
                    <Label>Headline (max 15 chars)</Label>
                    <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Save Today" maxLength={15} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Validation Side */}
          <div className="w-72 bg-slate-50 border-l border-slate-200 p-6 flex flex-col">
            <h3 className="font-medium text-slate-900 flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-blue-500" />
              Requirements
            </h3>
            
            <div className="space-y-3 flex-1">
              <ReqItem met={hasVideoId} label="YouTube Video Selected" />
              <ReqItem met={hasFinalUrl} label="Final URL" />
              <ReqItem met={hasDisplayUrl} label="Display URL" />
              {!isBumper && (
                <>
                  <ReqItem met={hasCTA} label="Call-to-Action" />
                  <ReqItem met={hasHeadline} label="Headline" />
                </>
              )}
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
            Create Ad
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
