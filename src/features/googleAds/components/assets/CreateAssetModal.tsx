import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
import { useCreateAsset } from "../../hooks/useCampaignManagement";
import { uploadAssetBinary } from "../../API/campaignManagementApi";
import type { AssetType } from "../../types/googleAds.types";
import { toast } from "sonner";

interface CreateAssetModalProps {
  clientId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: AssetType;
}

export function CreateAssetModal({
  clientId,
  open,
  onOpenChange,
  defaultType = "SITELINK",
}: CreateAssetModalProps) {
  const [type, setType] = useState<AssetType>(defaultType);
  const [text, setText] = useState("");
  const [finalUrl, setFinalUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = useCreateAsset(clientId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadAssetBinary(clientId, formData);
      if (res && res.success) {
        setImageUrl(res.assetUrl);
        setAssetId(res.assetId);
        toast.success("Asset uploaded to Google Ads successfully");
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        type,
        text: type === "SITELINK" || type === "STRUCTURED_SNIPPET" ? text : undefined,
        calloutText: type === "CALLOUT" ? text : undefined,
        finalUrl: type === "SITELINK" || type === "IMAGE" || type === "LOGO" ? finalUrl : undefined,
        imageUrl: type === "IMAGE" || type === "LOGO" ? imageUrl : undefined,
        assetUrl: type === "IMAGE" || type === "LOGO" || type === "YOUTUBE_VIDEO" ? (type === "YOUTUBE_VIDEO" ? `https://youtube.com/watch?v=${videoId}` : imageUrl) : undefined,
        videoId: type === "YOUTUBE_VIDEO" ? videoId : undefined,
        assetId: assetId || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setText("");
          setFinalUrl("");
          setImageUrl("");
          setVideoId("");
          setAssetId("");
        },
      }
    );
  };

  const isFormValid = () => {
    switch (type) {
      case "SITELINK":
        return text.trim() !== "" && finalUrl.trim() !== "";
      case "CALLOUT":
      case "STRUCTURED_SNIPPET":
        return text.trim() !== "";
      case "IMAGE":
      case "LOGO":
        return imageUrl.trim() !== "";
      case "YOUTUBE_VIDEO":
      case "VIDEO":
        return videoId.trim() !== "";
      default:
        return text.trim() !== "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Asset</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Asset Type</Label>
              <Select
                value={type}
                onValueChange={(val) => {
                  setType(val as AssetType);
                  setText("");
                  setFinalUrl("");
                  setImageUrl("");
                  setVideoId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SITELINK">Sitelink</SelectItem>
                  <SelectItem value="CALLOUT">Callout</SelectItem>
                  <SelectItem value="STRUCTURED_SNIPPET">Structured Snippet</SelectItem>
                  <SelectItem value="IMAGE">Image</SelectItem>
                  <SelectItem value="LOGO">Logo</SelectItem>
                  <SelectItem value="YOUTUBE_VIDEO">YouTube Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(type === "SITELINK" || type === "CALLOUT" || type === "STRUCTURED_SNIPPET") && (
              <div className="space-y-2">
                <Label>{type === "CALLOUT" ? "Callout Text" : "Text"}</Label>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    type === "SITELINK"
                      ? "e.g., Shop Sale"
                      : type === "CALLOUT"
                      ? "e.g., Free Shipping"
                      : "e.g., Value"
                  }
                  maxLength={type === "SITELINK" || type === "CALLOUT" ? 25 : undefined}
                />
              </div>
            )}

            {type === "SITELINK" && (
              <div className="space-y-2">
                <Label>Final URL</Label>
                <Input
                  value={finalUrl}
                  onChange={(e) => setFinalUrl(e.target.value)}
                  placeholder="https://www.example.com"
                  type="url"
                />
              </div>
            )}

            {(type === "IMAGE" || type === "LOGO") && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{type === "LOGO" ? "Upload Logo" : "Upload Image"}</Label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
                    {imageUrl ? (
                      <div className="relative group w-full flex justify-center">
                        <img src={imageUrl} alt="Preview" className="max-h-32 object-contain rounded" />
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="sm" 
                          className="absolute inset-0 m-auto w-max h-max opacity-0 group-hover:opacity-100"
                          onClick={() => setImageUrl("")}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                        <div className="text-sm text-slate-500">
                          {isUploading ? "Uploading..." : "Click or drag file to upload"}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          PNG, JPG, or GIF up to 5MB
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Asset URL (Read-only reference)</Label>
                  <Input
                    value={imageUrl}
                    readOnly
                    placeholder="URL will generate after upload"
                    className="bg-slate-50 text-slate-500"
                  />
                </div>
              </div>
            )}

            {(type === "YOUTUBE_VIDEO" || type === "VIDEO") && (
              <div className="space-y-2">
                <Label>YouTube Video ID</Label>
                <Input
                  value={videoId}
                  onChange={(e) => setVideoId(e.target.value)}
                  placeholder="e.g., dQw4w9WgXcQ"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter the 11-character YouTube video ID.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending || isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!isFormValid() || createMutation.isPending || isUploading}
            >
              {createMutation.isPending ? "Creating..." : "Create Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
