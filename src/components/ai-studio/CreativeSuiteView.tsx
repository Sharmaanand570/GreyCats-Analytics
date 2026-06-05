import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { creativeApi, type CaptionItem, type CreativeAsset, IMAGE_GEN_TIMEOUT_MS, IMAGE_GEN_POLL_MS } from "@/api/creativeApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Sparkles,
  Palette,
  Type,
  Image as ImageIcon,
  Copy,
  Trash2,
  Check,
  ChevronDown,
  Download,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  LayoutGrid,
  Plus,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "twitter", label: "Twitter", icon: Twitter },
];

const GOALS = [
  { value: "awareness", label: "Awareness" },
  { value: "engagement", label: "Engagement" },
  { value: "conversion", label: "Conversion" },
  { value: "product_launch", label: "Product Launch" },
];

const STYLES = [
  { value: "photorealistic", label: "Photorealistic" },
  { value: "illustration", label: "Illustration" },
  { value: "minimal", label: "Minimal" },
  { value: "gradient", label: "Gradient" },
];

const RATIOS = [
  { value: "1:1", label: "Square (1:1)", shape: "w-5 h-5" },
  { value: "4:5", label: "Portrait (4:5)", shape: "w-4 h-5" },
  { value: "16:9", label: "Landscape (16:9)", shape: "w-6 h-3.5" },
  { value: "9:16", label: "Story (9:16)", shape: "w-3.5 h-6" },
];

const PLATFORM_CHAR_LIMITS: Record<string, number> = {
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  twitter: 280,
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

interface Props {
  clientId: number;
  activeSubTab: string;
}

export function CreativeSuiteView({ clientId, activeSubTab }: Props) {
  const queryClient = useQueryClient();

  // Caption state
  const [captionPlatform, setCaptionPlatform] = useState("instagram");
  const [captionGoal, setCaptionGoal] = useState("engagement");
  const [captionTopic, setCaptionTopic] = useState("");
  const [captionCount, setCaptionCount] = useState(3);
  const [generatedCaptions, setGeneratedCaptions] = useState<CaptionItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Image state
  const [imageIntent, setImageIntent] = useState("");
  const [imagePlatform, setImagePlatform] = useState("instagram");
  const [imageRatio, setImageRatio] = useState("1:1");
  const [imageStyle, setImageStyle] = useState("photorealistic");
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [pendingImageAssetId, setPendingImageAssetId] = useState<string | null>(null);

  // Assets query
  const assetsQuery = useQuery({
    queryKey: ["creative-assets", clientId],
    queryFn: async () => {
      const res = await creativeApi.getAssets(clientId);
      return res.data.data;
    },
  });

  // Mutations
  const captionMutation = useMutation({
    mutationFn: () =>
      creativeApi.generateCaptions({
        clientId,
        platform: captionPlatform,
        goal: captionGoal,
        topic: captionTopic,
        count: captionCount,
      }),
    onSuccess: (res) => {
      setGeneratedCaptions(res.data.data.captions);
      toast.success(`${res.data.data.captions.length} captions generated`);
      queryClient.invalidateQueries({ queryKey: ["creative-assets", clientId] });
    },
    onError: () => toast.error("Failed to generate captions"),
  });

  const imageMutation = useMutation({
    mutationFn: () =>
      creativeApi.generateImage({
        clientId,
        intent: imageIntent,
        platform: imagePlatform,
        aspectRatio: imageRatio,
        style: imageStyle,
        mode: "async",
      }),
    onSuccess: (res) => {
      const data = res.data.data;
      setGeneratedPrompt(data.promptUsed);
      setGeneratedImageUrl(null);
      setPendingImageAssetId(data.assetId);
      toast.info("Generating your image... We'll notify you when it's ready.");
    },
    onError: () => toast.error("Failed to start image generation"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => creativeApi.deleteAsset(id),
    onSuccess: () => {
      toast.success("Asset deleted");
      queryClient.invalidateQueries({ queryKey: ["creative-assets", clientId] });
    },
  });

  // Poll for background image completion
  useEffect(() => {
    if (!pendingImageAssetId) return;
    const interval = setInterval(async () => {
      try {
        const res = await creativeApi.getAssets(clientId, "image");
        const asset = res.data.data.assets.find((a) => a.id === pendingImageAssetId);
        if (asset?.imageUrl) {
          clearInterval(interval);
          setPendingImageAssetId(null);
          setGeneratedImageUrl(asset.imageUrl);
          queryClient.invalidateQueries({ queryKey: ["creative-assets", clientId] });
          toast.success("Image ready! Check the gallery.", { duration: 5000 });
        }
      } catch { /* polling retry */ }
    }, IMAGE_GEN_POLL_MS);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (pendingImageAssetId) {
        setPendingImageAssetId(null);
        toast.error("Image generation timed out. Check the gallery later.");
        queryClient.invalidateQueries({ queryKey: ["creative-assets", clientId] });
      }
    }, IMAGE_GEN_TIMEOUT_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pendingImageAssetId, clientId, queryClient]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const assets = assetsQuery.data?.assets || [];
  const groupedAssets = useMemo(() => groupAssets(assets), [assets]);

  const renderHeader = (title: string, desc: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center border border-zinc-200/60 shadow-sm">
        {icon}
      </div>
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{title}</h1>
        <p className="text-sm font-medium text-zinc-500">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ────────────────── CAPTIONS ────────────────── */}
      {activeSubTab === "captions" && (
        <div className="space-y-8">
          {renderHeader("Generate Captions", "AI writes multiple caption variations perfectly tailored to your brand voice.", <Type className="h-6 w-6 text-zinc-700" />)}
          
          <div className="bg-white rounded-[32px] border border-zinc-200 p-8 shadow-sm space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-zinc-900 font-bold text-base">Select Platform</Label>
                <Select value={captionPlatform} onValueChange={setCaptionPlatform}>
                  <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-zinc-900 text-base font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                          <p.icon className="w-4 h-4 text-zinc-500" />
                          {p.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-zinc-900 font-bold text-base">Post Goal</Label>
                <Select value={captionGoal} onValueChange={setCaptionGoal}>
                  <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-zinc-900 text-base font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map((g) => (
                      <SelectItem key={g.value} value={g.value} className="font-medium cursor-pointer">
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-zinc-900 font-bold text-base">What should this post be about?</Label>
              <Textarea
                value={captionTopic}
                onChange={(e) => setCaptionTopic(e.target.value)}
                placeholder="e.g. Announcing our new summer collection, focusing on lightweight materials and bright colors..."
                rows={4}
                className="rounded-2xl bg-zinc-50/50 border-zinc-200 resize-none focus-visible:ring-zinc-900 text-base p-4 placeholder:text-zinc-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4 border-t border-zinc-100">
              <div className="space-y-3">
                <Label className="text-zinc-500 font-bold text-xs uppercase tracking-wider">Number of Variations</Label>
                <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-xl w-fit p-1">
                  <button
                    onClick={() => setCaptionCount(Math.max(1, captionCount - 1))}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-white hover:text-zinc-900 hover:shadow-sm transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="w-12 text-center font-bold text-zinc-900 text-lg">
                    {captionCount}
                  </div>
                  <button
                    onClick={() => setCaptionCount(Math.min(20, captionCount + 1))}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-white hover:text-zinc-900 hover:shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Button
                onClick={() => captionMutation.mutate()}
                disabled={captionMutation.isPending || !captionTopic.trim()}
                className="h-14 px-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold shadow-xl shadow-zinc-900/10 transition-all active:scale-[0.98] gap-2 text-base w-full sm:w-auto mt-4 sm:mt-0"
              >
                {captionMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                Generate Captions
              </Button>
            </div>
          </div>

          {generatedCaptions.length > 0 && (
            <div className="space-y-6 pt-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <h3 className="text-xl font-bold text-zinc-900 px-2 flex items-center gap-2">
                <Type className="w-5 h-5 text-zinc-400" /> 
                Generated Results
              </h3>
              <div className="grid gap-6">
                {generatedCaptions.map((cap, idx) => (
                  <div key={cap.id} className="bg-white rounded-[24px] border border-zinc-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-6 right-6">
                      <Button
                        variant="secondary"
                        className={cn(
                          "h-10 px-4 rounded-xl font-bold transition-colors",
                          copiedId === cap.id ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        )}
                        onClick={() => copyToClipboard(cap.text + (cap.hashtags.length ? "\n\n" + cap.hashtags.join(" ") : ""), cap.id)}
                      >
                        {copiedId === cap.id ? <><Check className="h-4 w-4 mr-2" /> Copied</> : <><Copy className="h-4 w-4 mr-2" /> Copy Text</>}
                      </Button>
                    </div>

                    <div className="space-y-4 max-w-[85%]">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 font-bold text-xs">
                          {idx + 1}
                        </div>
                        <Badge variant="outline" className="bg-zinc-50 border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider text-[10px] px-2 py-1">
                          {cap.tone} tone
                        </Badge>
                      </div>

                      <div className="prose prose-zinc max-w-none">
                        <p className="text-[15px] sm:text-base leading-relaxed text-zinc-800 whitespace-pre-wrap">{cap.text}</p>
                      </div>
                      
                      {cap.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {cap.hashtags.map((h) => (
                            <span key={h} className="text-sm font-bold text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors">{h}</span>
                          ))}
                        </div>
                      )}
                      
                      <div className="pt-4 flex items-center gap-4 border-t border-zinc-100">
                        <div className="flex-1 max-w-[200px]">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-2">
                            <span className="text-zinc-500">Character Limit</span>
                            <span className={cap.characterCount > (PLATFORM_CHAR_LIMITS[captionPlatform] || 2200) ? "text-red-500" : "text-zinc-900"}>
                              {cap.characterCount} / {PLATFORM_CHAR_LIMITS[captionPlatform] || 2200}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                cap.characterCount > (PLATFORM_CHAR_LIMITS[captionPlatform] || 2200)
                                  ? "bg-red-500"
                                  : cap.characterCount > (PLATFORM_CHAR_LIMITS[captionPlatform] || 2200) * 0.8
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                              )}
                              style={{ width: `${Math.min(100, (cap.characterCount / (PLATFORM_CHAR_LIMITS[captionPlatform] || 2200)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── IMAGES ────────────────── */}
      {activeSubTab === "images" && (
        <div className="space-y-8">
          {renderHeader("Generate Images", "Create stunning visual content using your brand palette.", <ImageIcon className="h-6 w-6 text-zinc-700" />)}
          
          <div className="bg-white rounded-[32px] border border-zinc-200 p-8 shadow-sm space-y-10">
            <div className="space-y-4">
              <Label className="text-zinc-900 font-bold text-base">What do you want to create?</Label>
              <Textarea
                value={imageIntent}
                onChange={(e) => setImageIntent(e.target.value)}
                placeholder="e.g. A vibrant summer sale banner, A professional product showcase on a marble table..."
                rows={4}
                className="rounded-2xl bg-zinc-50/50 border-zinc-200 resize-none focus-visible:ring-zinc-900 text-base p-4 placeholder:text-zinc-400"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label className="text-zinc-900 font-bold text-base">Target Platform</Label>
                <Select value={imagePlatform} onValueChange={setImagePlatform}>
                  <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-zinc-900 text-base font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                          <p.icon className="w-4 h-4 text-zinc-500" />
                          {p.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <Label className="text-zinc-900 font-bold text-base">Visual Style</Label>
                <Select value={imageStyle} onValueChange={setImageStyle}>
                  <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-zinc-900 text-base font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="font-medium cursor-pointer">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-zinc-900 font-bold text-base">Aspect Ratio</Label>
              <Select value={imageRatio} onValueChange={setImageRatio}>
                <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-zinc-900 text-base font-medium w-full lg:w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATIOS.map((r) => (
                    <SelectItem key={r.value} value={r.value} className="font-medium cursor-pointer">
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
              {pendingImageAssetId ? (
                <div className="flex items-center gap-3 text-zinc-900 bg-zinc-100 px-6 py-4 rounded-full font-bold w-full sm:w-auto animate-pulse">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Painting your image...
                </div>
              ) : (
                <Button
                  onClick={() => imageMutation.mutate()}
                  disabled={imageMutation.isPending || !imageIntent.trim()}
                  className="h-14 px-10 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold shadow-xl shadow-zinc-900/10 transition-all active:scale-[0.98] gap-2 text-base w-full sm:w-auto"
                >
                  <Sparkles className="h-5 w-5" />
                  Generate Masterpiece
                </Button>
              )}
            </div>
          </div>

          {(generatedImageUrl || generatedPrompt) && (
            <div className="space-y-6 pt-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <h3 className="text-xl font-bold text-zinc-900 px-2 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-zinc-400" /> 
                {generatedImageUrl ? "Generation Result" : "Engineered Prompt"}
              </h3>
              
              <div className="bg-white rounded-[32px] border border-zinc-200 p-6 sm:p-8 shadow-sm">
                {generatedImageUrl && (
                  <div className="space-y-6 flex flex-col items-center">
                    <div className="relative group w-full flex justify-center bg-zinc-50 rounded-[24px] overflow-hidden border border-zinc-200/60 p-4 sm:p-8">
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL?.replace("/api", "")}${generatedImageUrl}`}
                        alt="AI Generated"
                        className="max-h-[600px] w-auto rounded-xl shadow-sm object-contain"
                      />
                    </div>
                    <Button
                      className="h-12 px-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold gap-2"
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "")}${generatedImageUrl}`;
                        a.download = `ai-image-${Date.now()}.png`;
                        a.target = "_blank";
                        a.click();
                      }}
                    >
                      <Download className="h-5 w-5" />
                      Download High-Res Image
                    </Button>
                  </div>
                )}

                {generatedPrompt && (
                  <div className={cn("bg-zinc-50 rounded-[24px] p-6 border border-zinc-200", generatedImageUrl ? "mt-8" : "")}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        AI Prompt Used
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
                        onClick={() => copyToClipboard(generatedPrompt, "prompt")}
                      >
                        {copiedId === "prompt" ? <><Check className="h-3.5 w-3.5 mr-1 text-green-600" /> Copied</> : <><Copy className="h-3.5 w-3.5 mr-1" /> Copy</>}
                      </Button>
                    </div>
                    <p className="text-[15px] text-zinc-800 leading-relaxed font-medium">{generatedPrompt}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────── GALLERY ────────────────── */}
      {activeSubTab === "gallery" && (
        <div className="space-y-8">
          {renderHeader("Asset Gallery", `Your saved generations (${assets.length})`, <LayoutGrid className="h-6 w-6 text-zinc-700" />)}
          
          {assets.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[32px] border border-zinc-200 shadow-sm">
              <div className="w-20 h-20 bg-zinc-50 rounded-3xl border border-zinc-100 flex items-center justify-center mx-auto mb-6">
                <Palette className="h-10 w-10 text-zinc-300" />
              </div>
              <p className="text-xl font-bold text-zinc-900 mb-2">Your Gallery is Empty</p>
              <p className="text-base text-zinc-500 max-w-sm mx-auto">Generate some images or captions using the tools on the left to see them appear here.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 gap-6 space-y-6 pb-12">
              {groupedAssets.map((group) => (
                <div key={group[0].id} className="break-inside-avoid">
                  <GalleryAssetCard
                    assets={group}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onCopy={copyToClipboard}
                    copiedId={copiedId}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────
// Grouping logic
// ─────────────────────────────────────────────

function groupAssets(assets: CreativeAsset[]): CreativeAsset[][] {
  const groups = new Map<string, CreativeAsset[]>();
  for (const asset of assets) {
    const key = `${asset.type}::${asset.platform || ""}::${(asset.topic || "").trim().toLowerCase().slice(0, 80)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(asset);
  }
  return Array.from(groups.values());
}

// ─────────────────────────────────────────────
// Gallery Card
// ─────────────────────────────────────────────

function GalleryAssetCard({
  assets,
  onDelete,
  onCopy,
  copiedId,
}: {
  assets: CreativeAsset[];
  onDelete: (id: string) => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const first = assets[0];
  const isImage = first.type === "image";
  const imageAssets = isImage ? assets.filter((a) => a.imageUrl) : [];
  const allCaptions = !isImage ? assets.flatMap((a) => (a.captions as CaptionItem[]) || []) : [];
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "";

  return (
    <div className="bg-white rounded-[24px] border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3 min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-zinc-100 text-zinc-900 border-zinc-200 shadow-none font-bold px-2.5 py-1">
                {isImage ? <ImageIcon className="h-3 w-3 mr-1.5 inline" /> : <Type className="h-3 w-3 mr-1.5 inline" />}
                {first.type}
              </Badge>
              {first.platform && <Badge variant="outline" className="text-zinc-600 border-zinc-200 font-bold px-2.5 py-1 capitalize">{first.platform}</Badge>}
              {assets.length > 1 && (
                <Badge className="bg-zinc-900 text-white border-zinc-900 shadow-none font-bold px-2.5 py-1">
                  {isImage ? `${imageAssets.length} items` : `${assets.length} sets`}
                </Badge>
              )}
            </div>
            {first.topic && <p className="text-[15px] font-bold text-zinc-900 leading-snug">{first.topic}</p>}
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 rounded-full shrink-0" onClick={() => setExpanded(!expanded)}>
            <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", expanded && "rotate-180")} />
          </Button>
        </div>

        {isImage && imageAssets.length > 0 && (
          <div className={cn("grid gap-3 pt-2", expanded ? "grid-cols-1" : imageAssets.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
            {(expanded ? imageAssets : imageAssets.slice(0, 4)).map((img) => (
              <div key={img.id} className="relative group rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 cursor-pointer" onClick={() => !expanded && setExpanded(true)}>
                <img src={`${baseUrl}${img.imageUrl}`} alt="Generated" className={cn("w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105", expanded ? "max-h-[500px] object-contain" : "h-40 object-cover")} />
                {expanded && (
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="icon" className="h-10 w-10 bg-white/95 backdrop-blur-md text-zinc-900 shadow-sm rounded-xl hover:bg-white border border-zinc-200/50" onClick={(e) => { e.stopPropagation(); onCopy(img.promptUsed || "", `prompt-${img.id}`); }}>
                      {copiedId === `prompt-${img.id}` ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button variant="secondary" size="icon" className="h-10 w-10 bg-white/95 backdrop-blur-md text-red-600 shadow-sm rounded-xl hover:bg-red-50 border border-red-100/50" onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {expanded && (
                  <div className="absolute bottom-3 left-3 flex gap-2">
                     <span className="text-[10px] font-bold tracking-widest uppercase bg-zinc-900/80 text-white backdrop-blur-md rounded-lg px-3 py-1.5 shadow-sm">
                      {new Date(img.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {!expanded && imageAssets.length > 4 && (
              <button onClick={() => setExpanded(true)} className="h-40 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center text-sm font-bold text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-100 transition-all">
                <div className="w-8 h-8 rounded-full bg-white border shadow-sm flex items-center justify-center mb-2">
                  <Plus className="h-4 w-4 text-zinc-900" />
                </div>
                {imageAssets.length - 4} more
              </button>
            )}
          </div>
        )}

        {!isImage && !expanded && (
          <button onClick={() => setExpanded(true)} className="w-full text-xs font-bold uppercase tracking-widest text-zinc-900 bg-zinc-100 hover:bg-zinc-200 py-3 rounded-xl transition-colors border border-zinc-200 mt-2">
            Read {allCaptions.length} Captions
          </button>
        )}

        {!isImage && expanded && allCaptions.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-zinc-100 mt-2">
            {allCaptions.map((cap, i) => (
              <div key={`${cap.id}-${i}`} className="bg-zinc-50 rounded-[20px] p-5 border border-zinc-200 group hover:border-zinc-300 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 min-w-0 flex-1">
                    <p className="text-[15px] font-medium text-zinc-800 whitespace-pre-wrap leading-relaxed">{cap.text}</p>
                    {cap.hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {cap.hashtags.map((h) => <span key={h} className="text-[13px] font-bold text-zinc-500 hover:text-zinc-900 cursor-pointer">{h}</span>)}
                      </div>
                    )}
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pt-2 flex items-center gap-2">
                      <Type className="w-3 h-3" /> {cap.characterCount} chars <span className="w-1 h-1 rounded-full bg-zinc-300" /> {cap.tone}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-xl transition-all" onClick={() => onCopy(cap.text + (cap.hashtags?.length ? "\n\n" + cap.hashtags.join(" ") : ""), `${cap.id}-${i}`)}>
                    {copiedId === `${cap.id}-${i}` ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
