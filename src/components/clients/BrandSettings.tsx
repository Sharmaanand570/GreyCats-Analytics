import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  brandApi,
  type BrandVoice,
  type BrandKnowledge,
  type UpsertBrandProfilePayload,
} from "@/api/brandApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Upload,
  Trash2,
  FileText,
  Image,
  X,
  Plus,
  Sparkles,
  Save,
  Globe,
  Target,
  MessageSquare,
  Shield,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const VOICE_OPTIONS: { value: BrandVoice; label: string; desc: string }[] = [
  { value: "PROFESSIONAL", label: "Professional", desc: "Corporate, trustworthy, authoritative" },
  { value: "FRIENDLY", label: "Friendly", desc: "Warm, approachable, conversational" },
  { value: "BOLD", label: "Bold", desc: "Daring, confident, attention-grabbing" },
  { value: "LUXURY", label: "Luxury", desc: "Elegant, premium, sophisticated" },
  { value: "QUIRKY", label: "Quirky", desc: "Fun, playful, unexpected" },
  { value: "MINIMALIST", label: "Minimalist", desc: "Clean, simple, understated" },
];

const KNOWLEDGE_TYPES = [
  { value: "guideline", label: "Brand Guidelines" },
  { value: "successful_content", label: "Successful Content" },
  { value: "reference", label: "Reference Material" },
];

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// ─────────────────────────────────────────────
// Tag Input (reusable for competitors, products, do's, don'ts)
// ─────────────────────────────────────────────

function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const val = input.trim();
    if (val && !values.includes(val)) {
      onChange([...values, val]);
      setInput("");
    }
  };
  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="icon" onClick={add} className="shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <Badge key={v} variant="secondary" className="gap-1 pr-1">
              {v}
              <button type="button" onClick={() => onChange(values.filter((x) => x !== v))}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Color Palette Input
// ─────────────────────────────────────────────

function ColorPaletteInput({ colors, onChange }: { colors: string[]; onChange: (c: string[]) => void }) {
  const [input, setInput] = useState("#");
  const add = () => {
    const val = input.trim();
    if (/^#[0-9a-fA-F]{3,8}$/.test(val) && !colors.includes(val)) {
      onChange([...colors, val]);
      setInput("#");
    }
  };
  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="#FF5733" className="w-32" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        <Button type="button" variant="outline" size="icon" onClick={add}><Plus className="h-4 w-4" /></Button>
      </div>
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button key={c} type="button" className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs border hover:border-destructive group transition-colors" onClick={() => onChange(colors.filter((x) => x !== c))}>
              <span className="w-5 h-5 rounded-full border shadow-sm" style={{ backgroundColor: c }} />
              <span className="font-mono">{c}</span>
              <X className="h-3 w-3 opacity-0 group-hover:opacity-100 text-destructive transition-opacity" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

interface Props {
  clientId: number;
}

export default function BrandSettings({ clientId }: Props) {
  const queryClient = useQueryClient();

  // Form state
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [brandName, setBrandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [industry, setIndustry] = useState("");
  const [brandVoice, setBrandVoice] = useState<BrandVoice>("PROFESSIONAL");
  const [targetAudience, setTargetAudience] = useState("");
  const [valueProposition, setValueProposition] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [brandStory, setBrandStory] = useState("");
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [keyProducts, setKeyProducts] = useState<string[]>([]);
  const [socialHandles, setSocialHandles] = useState<Record<string, string>>({});
  const [doList, setDoList] = useState<string[]>([]);
  const [dontList, setDontList] = useState<string[]>([]);
  const [additionalContext, setAdditionalContext] = useState("");
  const [uploadType, setUploadType] = useState("guideline");
  const [populated, setPopulated] = useState(false);

  // ── Queries ──────────────────────────────────────────────────────────────
  const profileQuery = useQuery({
    queryKey: ["brand-profile", clientId],
    queryFn: async () => { const res = await brandApi.getProfile(clientId); return res.data.data; },
  });

  const knowledgeQuery = useQuery({
    queryKey: ["brand-knowledge", clientId],
    queryFn: async () => { const res = await brandApi.listKnowledge(clientId); return res.data.data; },
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profileQuery.data && !populated) {
      const p = profileQuery.data;
      setWebsiteUrl(p.websiteUrl || "");
      setBrandName(p.brandName || "");
      setTagline(p.tagline || "");
      setIndustry(p.industry || "");
      setBrandVoice((p.brandVoice as BrandVoice) || "PROFESSIONAL");
      setTargetAudience(p.targetAudience || "");
      setValueProposition(p.valueProposition || "");
      setMissionStatement(p.missionStatement || "");
      setBrandStory(p.brandStory || "");
      setColorPalette((p.colorPalette as string[]) || []);
      setCompetitors((p.competitors as string[]) || []);
      setKeyProducts((p.keyProducts as string[]) || []);
      setSocialHandles((p.socialHandles as Record<string, string>) || {});
      setDoList((p.doList as string[]) || []);
      setDontList((p.dontList as string[]) || []);
      setAdditionalContext(p.additionalContext || "");
      setPopulated(true);
    }
  }, [profileQuery.data, populated]);

  // ── Scrape mutation ──────────────────────────────────────────────────────
  const scrapeMutation = useMutation({
    mutationFn: (url: string) => brandApi.scrapeWebsite(url),
    onSuccess: (res) => {
      const d = res.data.data;
      if (d.brandName) setBrandName(d.brandName);
      if (d.tagline) setTagline(d.tagline);
      if (d.industry) setIndustry(d.industry);
      if (d.brandVoice) setBrandVoice(d.brandVoice);
      if (d.targetAudience) setTargetAudience(d.targetAudience);
      if (d.valueProposition) setValueProposition(d.valueProposition);
      if (d.missionStatement) setMissionStatement(d.missionStatement);
      if (d.brandStory) setBrandStory(d.brandStory);
      if (d.colorPalette?.length) setColorPalette(d.colorPalette);
      if (d.competitors?.length) setCompetitors(d.competitors);
      if (d.keyProducts?.length) setKeyProducts(d.keyProducts);
      if (d.socialHandles) setSocialHandles(d.socialHandles);
      if (d.doList?.length) setDoList(d.doList);
      if (d.dontList?.length) setDontList(d.dontList);
      if (d.websiteUrl) setWebsiteUrl(d.websiteUrl);
      toast.success("Brand info extracted! Review and save.");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to analyze website"),
  });

  // ── Save mutation ────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: UpsertBrandProfilePayload = {
        clientId,
        websiteUrl: websiteUrl || undefined,
        brandName,
        tagline: tagline || undefined,
        industry: industry || undefined,
        brandVoice,
        targetAudience: targetAudience || undefined,
        valueProposition: valueProposition || undefined,
        missionStatement: missionStatement || undefined,
        brandStory: brandStory || undefined,
        colorPalette: colorPalette.length ? colorPalette : undefined,
        competitors: competitors.length ? competitors : undefined,
        keyProducts: keyProducts.length ? keyProducts : undefined,
        socialHandles: Object.keys(socialHandles).length ? socialHandles : undefined,
        doList: doList.length ? doList : undefined,
        dontList: dontList.length ? dontList : undefined,
        additionalContext: additionalContext || undefined,
      };
      return brandApi.upsertProfile(payload);
    },
    onSuccess: () => {
      toast.success("Brand profile saved");
      queryClient.invalidateQueries({ queryKey: ["brand-profile", clientId] });
    },
    onError: () => toast.error("Failed to save"),
  });

  // ── File upload ──────────────────────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("clientId", String(clientId));
      form.append("type", uploadType);
      form.append("label", file.name);
      form.append("file", file);
      return brandApi.uploadKnowledge(form);
    },
    onSuccess: () => { toast.success("File uploaded"); queryClient.invalidateQueries({ queryKey: ["brand-knowledge", clientId] }); },
    onError: () => toast.error("Upload failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => brandApi.deleteKnowledge(id),
    onSuccess: () => { toast.success("File deleted"); queryClient.invalidateQueries({ queryKey: ["brand-knowledge", clientId] }); },
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = "";
  }, [uploadMutation]);

  if (profileQuery.isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const hasProfile = !!profileQuery.data;
  const knowledge = knowledgeQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Train Your Brand</h2>
          <p className="text-sm text-muted-foreground">
            Teach the AI your brand's identity so all generated content matches your voice
          </p>
        </div>
      </div>

      {/* URL Scraper — always visible at top */}
      <Card className="border-violet-200 bg-gradient-to-r from-violet-50/50 to-indigo-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-violet-600" />
            <p className="text-sm font-medium">Quick Setup — Enter your website and AI will fill in your brand profile</p>
          </div>
          <div className="flex gap-2">
            <Input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && websiteUrl.trim() && scrapeMutation.mutate(websiteUrl.trim())}
            />
            <Button
              onClick={() => scrapeMutation.mutate(websiteUrl.trim())}
              disabled={scrapeMutation.isPending || !websiteUrl.trim()}
              className="gap-2 bg-violet-600 hover:bg-violet-700"
            >
              {scrapeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {scrapeMutation.isPending ? "Analyzing..." : "Analyze Website"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main form in tabs */}
      <Tabs defaultValue="identity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="identity" className="gap-1.5 text-xs"><Target className="h-3.5 w-3.5" />Identity</TabsTrigger>
          <TabsTrigger value="voice" className="gap-1.5 text-xs"><MessageSquare className="h-3.5 w-3.5" />Voice & Style</TabsTrigger>
          <TabsTrigger value="guidelines" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Guidelines</TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-1.5 text-xs"><BookOpen className="h-3.5 w-3.5" />Knowledge Base</TabsTrigger>
        </TabsList>

        {/* ── Identity Tab ── */}
        <TabsContent value="identity">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Brand Identity</CardTitle>
              <CardDescription>Core information about your brand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Brand Name *</Label>
                  <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Ciesta Hotels & Resorts" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tagline / Slogan</Label>
                  <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Where comfort meets luxury" />
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Hospitality, E-commerce, SaaS" />
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourwebsite.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Value Proposition</Label>
                <Textarea value={valueProposition} onChange={(e) => setValueProposition(e.target.value)} placeholder="What makes your brand unique? Why should customers choose you?" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Mission Statement</Label>
                <Textarea value={missionStatement} onChange={(e) => setMissionStatement(e.target.value)} placeholder="Your brand's mission and purpose" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Brand Story</Label>
                <Textarea value={brandStory} onChange={(e) => setBrandStory(e.target.value)} placeholder="A brief narrative about your brand's journey, values, and what you stand for" rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label>Key Products / Services</Label>
                <TagInput values={keyProducts} onChange={setKeyProducts} placeholder="Add a product or service" />
              </div>
              <div className="space-y-1.5">
                <Label>Competitors</Label>
                <TagInput values={competitors} onChange={setCompetitors} placeholder="Add a competitor" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Voice & Style Tab ── */}
        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Voice & Style</CardTitle>
              <CardDescription>How your brand sounds and looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Brand Voice</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {VOICE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBrandVoice(opt.value)}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-all hover:shadow-sm",
                        brandVoice === opt.value
                          ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500"
                          : "border-border hover:border-violet-300"
                      )}
                    >
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Target Audience</Label>
                <Textarea value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g. Business travelers aged 30-55 looking for premium hotel experiences near airports" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Color Palette</Label>
                <ColorPaletteInput colors={colorPalette} onChange={setColorPalette} />
              </div>
              <div className="space-y-1.5">
                <Label>Social Media Handles</Label>
                <div className="grid grid-cols-2 gap-3">
                  {["instagram", "facebook", "linkedin", "twitter"].map((platform) => (
                    <div key={platform} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16 capitalize">{platform}</span>
                      <Input
                        value={socialHandles[platform] || ""}
                        onChange={(e) => setSocialHandles({ ...socialHandles, [platform]: e.target.value })}
                        placeholder={platform === "twitter" ? "@handle" : `@${platform}handle`}
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Guidelines Tab ── */}
        <TabsContent value="guidelines">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Guidelines</CardTitle>
              <CardDescription>Tell the AI what to do and what to avoid when creating content for this brand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-green-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Do's — The AI should:
                  </Label>
                  <TagInput values={doList} onChange={setDoList} placeholder='e.g. "Use emojis in captions"' />
                </div>
                <div className="space-y-2">
                  <Label className="text-red-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Don'ts — The AI should never:
                  </Label>
                  <TagInput values={dontList} onChange={setDontList} placeholder='e.g. "Use slang or abbreviations"' />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Additional Context / Notes</Label>
                <Textarea value={additionalContext} onChange={(e) => setAdditionalContext(e.target.value)} placeholder="Any extra instructions for the AI — tone nuances, seasonal focus, campaign details, etc." rows={4} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Knowledge Base Tab ── */}
        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Knowledge Base</CardTitle>
              <CardDescription>Upload brand guidelines, past content, and reference materials to train the AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasProfile ? (
                <p className="text-sm text-muted-foreground">Save a brand profile first to upload files.</p>
              ) : (
                <div className="flex items-end gap-3">
                  <div className="space-y-1.5">
                    <Label>File Type</Label>
                    <Select value={uploadType} onValueChange={setUploadType}>
                      <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {KNOWLEDGE_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <label htmlFor="knowledge-file">
                    <Button type="button" variant="outline" className="gap-2 cursor-pointer" disabled={uploadMutation.isPending} asChild>
                      <span>
                        {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Upload File
                      </span>
                    </Button>
                  </label>
                  <input id="knowledge-file" type="file" accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />
                  <span className="text-xs text-muted-foreground">PDF, DOCX, TXT, PNG, JPG (max 10MB)</span>
                </div>
              )}
              {knowledge.length > 0 && (
                <div className="border rounded-lg divide-y">
                  {knowledge.map((file: BrandKnowledge) => (
                    <div key={file.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        {file.mimeType?.startsWith("image/") ? <Image className="h-4 w-4 text-muted-foreground shrink-0" /> : <FileText className="h-4 w-4 text-muted-foreground shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{file.label || file.fileName}</p>
                          <p className="text-xs text-muted-foreground">{file.type}{file.fileSize ? ` · ${formatFileSize(file.fileSize)}` : ""}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => deleteMutation.mutate(file.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {knowledge.length === 0 && hasProfile && (
                <p className="text-sm text-muted-foreground text-center py-4">No files yet. Upload brand guidelines or content samples.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save button — always visible */}
      <div className="flex justify-end sticky bottom-0 bg-background/80 backdrop-blur-sm py-3 border-t -mx-2 px-2">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !brandName.trim()} className="gap-2 min-w-[140px]">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Brand Profile
        </Button>
      </div>
    </div>
  );
}
