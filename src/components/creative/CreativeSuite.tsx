import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { creativeApi, type CaptionItem, type CreativeAsset, IMAGE_GEN_TIMEOUT_MS, IMAGE_GEN_POLL_MS } from "@/api/creativeApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Image,
  Copy,
  Trash2,
  Check,
  ChevronDown,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const PLATFORMS = ["instagram", "facebook", "linkedin", "twitter"];
const GOALS = [
  { value: "awareness", label: "Awareness" },
  { value: "engagement", label: "Engagement" },
  { value: "conversion", label: "Conversion" },
  { value: "product_launch", label: "Product Launch" },
];
const STYLES = ["photorealistic", "illustration", "minimal", "gradient"];
const RATIOS = ["1:1", "16:9", "9:16", "4:5"];

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
}

export default function CreativeSuite({ clientId }: Props) {
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

  // Assets query
  const assetsQuery = useQuery({
    queryKey: ["creative-assets", clientId],
    queryFn: async () => {
      const res = await creativeApi.getAssets(clientId);
      return res.data.data;
    },
  });

  // ── Caption mutation ─────────────────────────────────────────────────────
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

  // ── Image mutation (always async — poll for completion) ──────────────────
  const [pendingImageAssetId, setPendingImageAssetId] = useState<string | null>(null);

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
          toast.success("Image ready! Click to view.", {
            action: {
              label: "View in Gallery",
              onClick: () => {
                const tabEl = document.querySelector('[data-value="gallery"]') as HTMLElement;
                tabEl?.click();
              },
            },
            duration: 10000,
          });
        }
      } catch { /* polling retry */ }
    }, IMAGE_GEN_POLL_MS);

    // Timeout after 2 minutes
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

  // ── Delete mutation ──────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => creativeApi.deleteAsset(id),
    onSuccess: () => {
      toast.success("Asset deleted");
      queryClient.invalidateQueries({ queryKey: ["creative-assets", clientId] });
    },
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const assets = assetsQuery.data?.assets || [];
  const groupedAssets = useMemo(() => groupAssets(assets), [assets]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-sm">
          <Palette className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">AI Creative Suite</h2>
          <p className="text-sm text-muted-foreground">
            Generate captions, images, and content aligned with your brand
          </p>
        </div>
      </div>

      <Tabs defaultValue="captions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="captions" className="gap-1.5">
            <Type className="h-3.5 w-3.5" />
            Captions
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-1.5">
            <Image className="h-3.5 w-3.5" />
            Images
          </TabsTrigger>
          <TabsTrigger value="gallery" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Gallery ({assets.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Captions Tab ── */}
        <TabsContent value="captions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Generate Captions</CardTitle>
              <CardDescription>AI writes multiple caption variations in your brand voice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Platform</Label>
                  <Select value={captionPlatform} onValueChange={setCaptionPlatform}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Goal</Label>
                  <Select value={captionGoal} onValueChange={setCaptionGoal}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GOALS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Count</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={captionCount}
                    onChange={(e) => setCaptionCount(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Topic</Label>
                <Textarea
                  value={captionTopic}
                  onChange={(e) => setCaptionTopic(e.target.value)}
                  placeholder="e.g. Summer sale announcement, New product launch, Behind the scenes"
                  rows={2}
                />
              </div>
              <Button
                onClick={() => captionMutation.mutate()}
                disabled={captionMutation.isPending || !captionTopic.trim()}
                className="gap-2"
              >
                {captionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate Captions
              </Button>
            </CardContent>
          </Card>

          {/* Generated captions */}
          {generatedCaptions.length > 0 && (
            <div className="space-y-3">
              {generatedCaptions.map((cap) => (
                <Card key={cap.id}>
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <p className="text-sm whitespace-pre-wrap">{cap.text}</p>
                        {cap.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cap.hashtags.map((h) => (
                              <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{cap.characterCount} / {PLATFORM_CHAR_LIMITS[captionPlatform] || 2200} chars</span>
                            <span>Tone: {cap.tone}</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => copyToClipboard(cap.text + (cap.hashtags.length ? "\n\n" + cap.hashtags.join(" ") : ""), cap.id)}
                      >
                        {copiedId === cap.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Images Tab ── */}
        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Generate Image Prompt</CardTitle>
              <CardDescription>
                AI auto-engineers a detailed image prompt based on your brand and intent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>What do you want to create?</Label>
                <Textarea
                  value={imageIntent}
                  onChange={(e) => setImageIntent(e.target.value)}
                  placeholder="e.g. A summer sale banner with blue tones, A product showcase for Instagram"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Platform</Label>
                  <Select value={imagePlatform} onValueChange={setImagePlatform}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Aspect Ratio</Label>
                  <Select value={imageRatio} onValueChange={setImageRatio}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RATIOS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Style</Label>
                  <Select value={imageStyle} onValueChange={setImageStyle}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STYLES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => imageMutation.mutate()}
                disabled={imageMutation.isPending || !!pendingImageAssetId || !imageIntent.trim()}
                className="gap-2"
              >
                {imageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Image className="h-4 w-4" />
                )}
                Generate Image
              </Button>
              {pendingImageAssetId && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Image is being generated... You'll be notified when it's ready.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Image result */}
          {(generatedImageUrl || generatedPrompt) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {generatedImageUrl ? "Generated Image" : "Image Prompt"}
                </CardTitle>
                {!generatedImageUrl && (
                  <CardDescription>Use this prompt with DALL-E, Midjourney, or any image generator</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Actual image */}
                {generatedImageUrl && (
                  <div className="space-y-3">
                    <div className="rounded-lg overflow-hidden border bg-muted">
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL?.replace("/api", "")}${generatedImageUrl}`}
                        alt="AI Generated"
                        className="w-full h-auto max-h-[500px] object-contain"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "")}${generatedImageUrl}`;
                          a.download = `ai-image-${Date.now()}.png`;
                          a.target = "_blank";
                          a.click();
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}

                {/* Prompt (collapsible when image exists) */}
                {generatedPrompt && (
                  <details className={generatedImageUrl ? "" : "open"}>
                    <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">
                      {generatedImageUrl ? "Show prompt used" : "Engineered Prompt"}
                    </summary>
                    <div className="relative mt-2">
                      <pre className="text-xs bg-muted rounded-lg p-3 whitespace-pre-wrap">{generatedPrompt}</pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-7 w-7"
                        onClick={() => copyToClipboard(generatedPrompt, "prompt")}
                      >
                        {copiedId === "prompt" ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Gallery Tab ── */}
        <TabsContent value="gallery" className="space-y-4">
          {assets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Palette className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No creative assets yet. Generate some captions or images to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groupedAssets.map((group) => (
                <GalleryAssetCard
                  key={group[0].id}
                  assets={group}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onCopy={copyToClipboard}
                  copiedId={copiedId}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─────────────────────────────────────────────
// Group assets by topic+type+platform
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
// Gallery asset card with grouping + versions
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
    <Card>
      <CardContent className="py-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {isImage ? <Image className="h-3 w-3 mr-1" /> : <Type className="h-3 w-3 mr-1" />}
                {first.type}
              </Badge>
              {first.platform && <Badge variant="outline" className="text-xs">{first.platform}</Badge>}
              {assets.length > 1 && (
                <Badge variant="secondary" className="text-xs">
                  {isImage ? `${imageAssets.length} images` : `${assets.length} sets`}
                </Badge>
              )}
            </div>
            {first.topic && <p className="text-sm font-medium">{first.topic}</p>}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(!expanded)}>
            <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
          </Button>
        </div>

        {/* Image grid (collapsed: show thumbnails, expanded: show all large) */}
        {isImage && imageAssets.length > 0 && (
          <div
            className={cn(
              "grid gap-2",
              expanded
                ? "grid-cols-1"
                : imageAssets.length === 1
                ? "grid-cols-1"
                : "grid-cols-2"
            )}
          >
            {(expanded ? imageAssets : imageAssets.slice(0, 4)).map((img) => (
              <div
                key={img.id}
                className="relative group rounded-lg overflow-hidden border cursor-pointer"
                onClick={() => !expanded && setExpanded(true)}
              >
                <img
                  src={`${baseUrl}${img.imageUrl}`}
                  alt="Generated"
                  className={cn("w-full h-auto object-cover", expanded ? "max-h-64 object-contain" : "h-32 object-cover")}
                />
                {/* Delete button on hover */}
                {expanded && (
                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                      onClick={(e) => { e.stopPropagation(); onCopy(img.promptUsed || "", `prompt-${img.id}`); }}
                    >
                      {copiedId === `prompt-${img.id}` ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {/* Date label */}
                {expanded && (
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-background/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-muted-foreground">
                    {new Date(img.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
            {!expanded && imageAssets.length > 4 && (
              <button
                onClick={() => setExpanded(true)}
                className="h-32 rounded-lg border border-dashed flex items-center justify-center text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                +{imageAssets.length - 4} more
              </button>
            )}
          </div>
        )}

        {/* Caption summary */}
        {!isImage && !expanded && (
          <button onClick={() => setExpanded(true)} className="text-xs text-primary hover:underline">
            {allCaptions.length} captions — click to expand
          </button>
        )}

        {/* Expanded captions */}
        {!isImage && expanded && allCaptions.length > 0 && (
          <div className="space-y-2 border-t pt-3">
            {allCaptions.map((cap, i) => (
              <div key={`${cap.id}-${i}`} className="flex items-start justify-between gap-2 bg-muted/30 rounded-lg p-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-sm whitespace-pre-wrap">{cap.text}</p>
                  {cap.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cap.hashtags.map((h) => <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>)}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{cap.characterCount} chars · {cap.tone}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onCopy(cap.text + (cap.hashtags?.length ? "\n\n" + cap.hashtags.join(" ") : ""), `${cap.id}-${i}`)}>
                  {copiedId === `${cap.id}-${i}` ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
