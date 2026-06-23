import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  brandApi,
  type BrandVoice,
  type BrandKnowledge,
  type BrandSuggestion,
  type UpsertBrandProfilePayload,
} from "@/api/brandApi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
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
  Check,
  XCircle,
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

const FIELD_LABELS: Record<string, string> = {
  brandName: "Brand Name", tagline: "Tagline", industry: "Industry", brandVoice: "Brand Voice",
  targetAudience: "Target Audience", valueProposition: "Value Proposition", missionStatement: "Mission Statement",
  brandStory: "Brand Story", colorPalette: "Color Palette", competitors: "Competitors", keyProducts: "Key Products",
  doList: "Do's", dontList: "Don'ts", additionalContext: "Additional Context", knowledgeBase: "Knowledge Base",
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  missing: { label: "Missing", color: "text-amber-600 bg-amber-50 border-amber-200" },
  improve: { label: "Improve", color: "text-blue-600 bg-blue-50 border-blue-200" },
  inconsistency: { label: "Inconsistency", color: "text-red-600 bg-red-50 border-red-200" },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "border-l-red-500",
  medium: "border-l-amber-500",
  low: "border-l-blue-400",
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// ─────────────────────────────────────────────
// Tag Input
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
    <div className="space-y-2">
      <div className="flex gap-2 relative">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          className="flex-1 bg-white border-zinc-200 focus-visible:ring-zinc-900 rounded-xl"
        />
        <Button type="button" variant="secondary" size="icon" onClick={add} className="shrink-0 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((v) => (
            <Badge key={v} variant="secondary" className="gap-1.5 pr-1.5 py-1 text-sm bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200 rounded-lg font-medium transition-colors">
              {v}
              <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:bg-zinc-300 rounded p-0.5 transition-colors">
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
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="#FF5733" className="w-36 bg-white border-zinc-200 focus-visible:ring-zinc-900 rounded-xl uppercase font-mono" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        <Button type="button" variant="secondary" size="icon" onClick={add} className="shrink-0 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700"><Plus className="h-4 w-4" /></Button>
      </div>
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {colors.map((c) => (
            <button key={c} type="button" className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm border bg-white shadow-sm hover:border-red-200 group transition-all" onClick={() => onChange(colors.filter((x) => x !== c))}>
              <span className="w-4 h-4 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: c }} />
              <span className="font-mono text-zinc-700 font-medium">{c}</span>
              <X className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-red-500 transition-opacity" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

interface Props {
  clientId: number;
  activeSubTab: string;
  onNavigate?: (tab: string) => void;
}

export function BrandProfileView({ clientId, activeSubTab, onNavigate }: Props) {
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

  // Optimization state
  const [optimizeOpen, setOptimizeOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<BrandSuggestion[]>([]);
  const [appliedFields, setAppliedFields] = useState<string[]>([]);
  const [dismissedFields, setDismissedFields] = useState<string[]>([]);
  const [completionPct, setCompletionPct] = useState<number>(0);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const pendingSaveRef = useRef(false);


  // Queries
  const profileQuery = useQuery({
    queryKey: ["brand-profile", clientId],
    queryFn: async () => { const res = await brandApi.getProfile(clientId); return res.data.data; },
  });

  const knowledgeQuery = useQuery({
    queryKey: ["brand-knowledge", clientId],
    queryFn: async () => { const res = await brandApi.listKnowledge(clientId); return res.data.data; },
  });

  // Populate form
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

  // Mutations
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
    onError: () => toast.error("Failed to save profile"),
  });

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

  // Optimize mutation
  const optimizeMutation = useMutation({
    mutationFn: () => {
      const currentProfile = {
        brandName, tagline, industry, brandVoice, targetAudience, valueProposition,
        missionStatement, brandStory, colorPalette, competitors, keyProducts,
        doList, dontList, additionalContext,
        _appliedFields: appliedFields,
        _dismissedFields: dismissedFields,
      };
      return brandApi.optimizeProfile(clientId, currentProfile);
    },
    onSuccess: (res) => {
      const data = res.data.data;
      setSuggestions(data.suggestions || []);
      setAppliedFields(data.appliedFields || []);
      setDismissedFields(data.dismissedFields || []);
      setCompletionPct(data.completionPct || 0);
      setGeneratedAt((data as any).generatedAt || new Date().toISOString());
      setOptimizeOpen(true);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Optimization failed"),
  });

  // Close panel when switching tabs
  useEffect(() => { setOptimizeOpen(false); }, [activeSubTab]);

  useEffect(() => {
    if (profileQuery.data?.optimizationData) {
      const d = profileQuery.data.optimizationData as any;
      if (d.suggestions?.length) setSuggestions(d.suggestions);
      if (d.appliedFields) setAppliedFields(d.appliedFields);
      if (d.dismissedFields) setDismissedFields(d.dismissedFields);
      if (d.completionPct !== undefined) setCompletionPct(d.completionPct);
      if (d.generatedAt) setGeneratedAt(d.generatedAt);
    }
  }, [profileQuery.data]);

  // Auto-save after apply
  useEffect(() => {
    if (!pendingSaveRef.current) return;
    pendingSaveRef.current = false;
    saveMutation.mutate();
  }, [brandStory, tagline, valueProposition, missionStatement, targetAudience, doList, dontList, additionalContext]);

  const handleApplySuggestion = (s: BrandSuggestion) => {
    const setters: Record<string, (v: any) => void> = {
      tagline: setTagline, industry: setIndustry, targetAudience: setTargetAudience,
      valueProposition: setValueProposition, missionStatement: setMissionStatement,
      brandStory: setBrandStory, additionalContext: setAdditionalContext,
    };
    const textToApply = (s as any).suggestedValue || s.suggestion || "";
    if (s.field === "brandVoice" && ["PROFESSIONAL","FRIENDLY","BOLD","LUXURY","QUIRKY","MINIMALIST"].includes(textToApply)) {
      setBrandVoice(textToApply as BrandVoice);
    } else if (s.field === "doList") {
      setDoList(prev => [...new Set([...prev, ...textToApply.split(/[;,]/).map((x: string) => x.trim()).filter(Boolean)])]);
    } else if (s.field === "dontList") {
      setDontList(prev => [...new Set([...prev, ...textToApply.split(/[;,]/).map((x: string) => x.trim()).filter(Boolean)])]);
    } else if (setters[s.field]) {
      setters[s.field](textToApply);
    }
    const newApplied = [...new Set([...appliedFields, s.field])];
    setAppliedFields(newApplied);
    pendingSaveRef.current = true;
    // Persist optimization state
    brandApi.saveOptimizationData(clientId, {
      suggestions,
      appliedFields: newApplied, dismissedFields,
      completionPct, generatedAt
    }).catch(() => {});
    toast.success(`Applied suggestion for ${FIELD_LABELS[s.field] || s.field}`);
  };

  const handleDismissSuggestion = (s: BrandSuggestion) => {
    const newDismissed = [...new Set([...dismissedFields, s.field])];
    setDismissedFields(newDismissed);
    brandApi.saveOptimizationData(clientId, {
      suggestions,
      appliedFields, dismissedFields: newDismissed,
      completionPct, generatedAt
    }).catch(() => {});
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = "";
  }, [uploadMutation]);

  if (profileQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20 h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
          </div>
          <p className="text-sm font-medium text-zinc-500">Loading brand profile...</p>
        </div>
      </div>
    );
  }

  const hasProfile = !!profileQuery.data;
  const knowledge = knowledgeQuery.data || [];

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

      {/* ── Optimize Bar ── */}
      {activeSubTab !== "knowledge" && <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-1/2">
          <div className="text-sm font-bold text-zinc-700 min-w-[40px] text-right">{completionPct}%</div>
          <Progress 
            value={completionPct} 
            className="flex-1"
            indicatorClassName={
              completionPct < 40 ? "bg-red-500" :
              completionPct < 75 ? "bg-amber-500" :
              "bg-green-500"
            }
          />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
          {generatedAt && (
            <span className="text-xs font-medium text-zinc-500">
              Last analyzed: {formatDistanceToNow(new Date(generatedAt))} ago
            </span>
          )}
          {suggestions.length > 0 && (
            <button onClick={() => setOptimizeOpen(true)} className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-full transition-all">
              <Sparkles className="h-3.5 w-3.5" />
              {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""}
            </button>
          )}
          <Button
            onClick={() => {
              if (!hasProfile) { toast.error("Save your brand profile first"); return; }
              if (appliedFields.length > 0 && !window.confirm("Re-analyzing will overwrite your current suggestions and clear pending items. Continue?")) return;
              optimizeMutation.mutate();
            }}
            disabled={optimizeMutation.isPending}
            className="gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-md"
          >
            {optimizeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Optimize with AI
          </Button>
        </div>
      </div>}

      {/* ── Optimization Side Panel ── */}
      <Sheet open={optimizeOpen} onOpenChange={setOptimizeOpen}>
        <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> AI Suggestions
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {suggestions.length === 0 ? (
              <div className="text-center py-12">
                <Check className="h-10 w-10 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-zinc-800">Looking good!</p>
                <p className="text-sm text-zinc-500 mt-1">No more suggestions. Your brand profile is well optimized.</p>
              </div>
            ) : (
              suggestions.map((s, i) => {
                const typeInfo = TYPE_LABELS[s.type] || TYPE_LABELS.improve;
                const isApplied = appliedFields.includes(s.field);
                const isDismissed = dismissedFields.includes(s.field);
                const suggestionText = (s as any).suggestedValue || s.suggestion || "";
                const messageText = (s as any).reason || s.message || "";
                
                if (isDismissed) {
                  return (
                    <div key={`${s.field}-${i}`} className="border rounded-xl p-4 bg-zinc-50 border-l-4 border-l-zinc-300 opacity-60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-zinc-500 line-through">{FIELD_LABELS[s.field] || s.field}</span>
                        <Badge variant="secondary" className="bg-zinc-200 text-zinc-600">Dismissed</Badge>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={`${s.field}-${i}`} className={cn("border rounded-xl p-4 bg-white border-l-4", PRIORITY_COLORS[s.priority] || "border-l-zinc-300")}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-zinc-900">{FIELD_LABELS[s.field] || s.field}</span>
                      <div className="flex items-center gap-2">
                        {isApplied && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none"><Check className="w-3 h-3 mr-1"/> Applied</Badge>}
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", typeInfo.color)}>{typeInfo.label}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mb-2">{messageText}</p>
                    {s.field !== "knowledgeBase" && suggestionText && (
                      <div className="bg-zinc-50 rounded-lg p-3 text-sm text-zinc-700 mb-3 border border-zinc-100">
                        {suggestionText.length > 200 ? suggestionText.slice(0, 200) + "..." : suggestionText}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {s.field === "knowledgeBase" ? (
                        <Button size="sm" variant="outline" className="text-xs rounded-lg gap-1" onClick={() => { setOptimizeOpen(false); onNavigate?.("brand-knowledge"); }}>
                          <Upload className="h-3 w-3" /> Go to Knowledge
                        </Button>
                      ) : (
                        <Button size="sm" disabled={isApplied} className="text-xs rounded-lg gap-1 bg-zinc-900 hover:bg-zinc-800" onClick={() => handleApplySuggestion(s)}>
                          <Check className="h-3 w-3" /> Apply
                        </Button>
                      )}
                      <Button size="sm" disabled={isApplied} variant="ghost" className="text-xs rounded-lg text-zinc-400 hover:text-red-500" onClick={() => handleDismissSuggestion(s)}>
                        <XCircle className="h-3 w-3" /> Dismiss
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Scraper ── */}
      {activeSubTab === "identity" && (
        <div className="mb-10 bg-zinc-100 rounded-3xl p-1 border border-zinc-200">
          <div className="bg-white rounded-[22px] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-5 w-5 text-zinc-900" />
              <h3 className="font-bold text-zinc-900 text-lg">Quick Setup via Website</h3>
            </div>
            <p className="text-sm text-zinc-500 font-medium mb-6">
              Enter your website URL and our AI will automatically scan and fill in your brand profile details.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="flex-1 h-12 text-base rounded-xl border-zinc-200 focus-visible:ring-zinc-900 px-4 shadow-sm"
                onKeyDown={(e) => e.key === "Enter" && websiteUrl.trim() && scrapeMutation.mutate(websiteUrl.trim())}
              />
              <Button
                onClick={() => scrapeMutation.mutate(websiteUrl.trim())}
                disabled={scrapeMutation.isPending || !websiteUrl.trim()}
                className="h-12 px-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-md transition-all active:scale-[0.98] whitespace-nowrap"
              >
                {scrapeMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-5 w-5 mr-2" />
                )}
                {scrapeMutation.isPending ? "Analyzing..." : "Analyze Website"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Content Views ── */}
      {activeSubTab === "identity" && (
        <div className="space-y-8">
          {renderHeader("Identity & Strategy", "Core information that defines what your brand does.", <Target className="h-6 w-6 text-zinc-700" />)}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-zinc-700 font-semibold">Brand Name <span className="text-red-500">*</span></Label>
              <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Ciesta Hotels & Resorts" className="h-11 rounded-xl bg-zinc-50/50 border-zinc-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-700 font-semibold">Tagline / Slogan</Label>
              <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Where comfort meets luxury" className="h-11 rounded-xl bg-zinc-50/50 border-zinc-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-700 font-semibold">Industry</Label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Hospitality, SaaS" className="h-11 rounded-xl bg-zinc-50/50 border-zinc-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-700 font-semibold">Website</Label>
              <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourwebsite.com" className="h-11 rounded-xl bg-zinc-50/50 border-zinc-200" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-700 font-semibold">Value Proposition</Label>
            <Textarea value={valueProposition} onChange={(e) => setValueProposition(e.target.value)} placeholder="What makes your brand unique?" rows={3} className="rounded-xl bg-zinc-50/50 border-zinc-200 resize-none" />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-700 font-semibold">Mission Statement</Label>
            <Textarea value={missionStatement} onChange={(e) => setMissionStatement(e.target.value)} placeholder="Your brand's mission and purpose" rows={3} className="rounded-xl bg-zinc-50/50 border-zinc-200 resize-none" />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-700 font-semibold">Brand Story</Label>
            <Textarea value={brandStory} onChange={(e) => setBrandStory(e.target.value)} placeholder="A brief narrative about your brand's journey" rows={4} className="rounded-xl bg-zinc-50/50 border-zinc-200 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-2">
              <Label className="text-zinc-700 font-semibold">Key Products / Services</Label>
              <TagInput values={keyProducts} onChange={setKeyProducts} placeholder="Add a product or service" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-700 font-semibold">Competitors</Label>
              <TagInput values={competitors} onChange={setCompetitors} placeholder="Add a competitor" />
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "voice" && (
        <div className="space-y-8">
          {renderHeader("Voice & Style", "How your brand sounds and looks to the world.", <MessageSquare className="h-6 w-6 text-zinc-700" />)}
          
          {!brandName && !hasProfile ? (
            <div className="text-center py-16 bg-zinc-50 rounded-3xl border border-zinc-200 border-dashed">
              <div className="w-16 h-16 bg-white rounded-2xl border shadow-sm flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-zinc-300" />
              </div>
              <p className="text-base font-bold text-zinc-900 mb-1">Analyze Website First</p>
              <p className="text-sm font-medium text-zinc-500 max-w-md mx-auto">
                Please return to the Identity tab and analyze your website to automatically generate your brand voice and style.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
            <Label className="text-zinc-700 font-semibold">Brand Voice Archetype</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {VOICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBrandVoice(opt.value)}
                  className={cn(
                    "flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden",
                    brandVoice === opt.value
                      ? "border-zinc-900 bg-zinc-100/50 ring-1 ring-zinc-900 shadow-sm"
                      : "border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm"
                  )}
                >
                  {brandVoice === opt.value && (
                    <div className="absolute top-0 right-0 p-3">
                      <div className="w-2 h-2 rounded-full bg-zinc-1000" />
                    </div>
                  )}
                  <span className={cn("font-bold text-sm mb-1", brandVoice === opt.value ? "text-zinc-900" : "text-zinc-900")}>{opt.label}</span>
                  <span className="text-xs text-zinc-500 font-medium leading-relaxed">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-zinc-700 font-semibold">Target Audience</Label>
            <Textarea value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Describe your ideal customers" rows={3} className="rounded-xl bg-zinc-50/50 border-zinc-200 resize-none" />
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-zinc-700 font-semibold">Color Palette</Label>
            <p className="text-sm text-zinc-500 mb-2">These colors will be prioritized in AI image generation.</p>
            <ColorPaletteInput colors={colorPalette} onChange={setColorPalette} />
          </div>

          <div className="space-y-3 pt-4">
            <Label className="text-zinc-700 font-semibold">Social Media Handles</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["instagram", "facebook", "linkedin", "twitter"].map((platform) => (
                <div key={platform} className="flex items-center gap-3 bg-zinc-50/50 border border-zinc-200 rounded-xl px-3 focus-within:ring-1 focus-within:ring-zinc-900 focus-within:border-zinc-900 transition-all">
                  <span className="text-xs font-bold text-zinc-400 w-16 capitalize shrink-0">{platform}</span>
                  <Input
                    value={socialHandles[platform] || ""}
                    onChange={(e) => setSocialHandles({ ...socialHandles, [platform]: e.target.value })}
                    placeholder={platform === "twitter" ? "@handle" : `@${platform}handle`}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-11 px-0 font-medium text-zinc-700"
                  />
                </div>
              ))}
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {activeSubTab === "guidelines" && (
        <div className="space-y-8">
          {renderHeader("Brand Guidelines", "Tell the AI what to do and what to strictly avoid.", <Shield className="h-6 w-6 text-zinc-700" />)}
          
          {!brandName && !hasProfile ? (
            <div className="text-center py-16 bg-zinc-50 rounded-3xl border border-zinc-200 border-dashed">
              <div className="w-16 h-16 bg-white rounded-2xl border shadow-sm flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-zinc-300" />
              </div>
              <p className="text-base font-bold text-zinc-900 mb-1">Analyze Website First</p>
              <p className="text-sm font-medium text-zinc-500 max-w-md mx-auto">
                Please return to the Identity tab and analyze your website to automatically generate your brand guidelines.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 bg-green-50/30 border border-green-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <Label className="text-green-800 font-bold text-base">Do's</Label>
              </div>
              <p className="text-sm text-green-700/80 font-medium">The AI should always:</p>
              <TagInput values={doList} onChange={setDoList} placeholder='e.g. "Use emojis in captions"' />
            </div>
            
            <div className="space-y-4 bg-red-50/30 border border-red-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </div>
                <Label className="text-red-800 font-bold text-base">Don'ts</Label>
              </div>
              <p className="text-sm text-red-700/80 font-medium">The AI should never:</p>
              <TagInput values={dontList} onChange={setDontList} placeholder='e.g. "Use slang"' />
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Label className="text-zinc-700 font-semibold">Additional Context / Notes</Label>
            <Textarea value={additionalContext} onChange={(e) => setAdditionalContext(e.target.value)} placeholder="Any extra instructions for the AI — tone nuances, seasonal focus, campaign details, etc." rows={5} className="rounded-xl bg-zinc-50/50 border-zinc-200 resize-none" />
          </div>
            </>
          )}
        </div>
      )}

      {activeSubTab === "knowledge" && (
        <div className="space-y-8">
          {renderHeader("Knowledge Base", "Upload reference materials to make the AI smarter.", <BookOpen className="h-6 w-6 text-zinc-700" />)}
          
          {!brandName && !hasProfile ? (
            <div className="text-center py-16 bg-zinc-50 rounded-3xl border border-zinc-200 border-dashed">
              <div className="w-16 h-16 bg-white rounded-2xl border shadow-sm flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-zinc-300" />
              </div>
              <p className="text-base font-bold text-zinc-900 mb-1">Analyze Website First</p>
              <p className="text-sm font-medium text-zinc-500 max-w-md mx-auto">
                Please return to the Identity tab and analyze your website before uploading knowledge files.
              </p>
            </div>
          ) : !hasProfile ? (
            <div className="text-center py-12 bg-zinc-50 rounded-3xl border border-zinc-200 border-dashed">
              <p className="text-sm font-semibold text-zinc-600 mb-2">Profile Required</p>
              <p className="text-xs text-zinc-500">Please save your brand profile details before uploading files.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 bg-zinc-50/50 p-6 rounded-3xl border border-zinc-200/80 shadow-sm">
                <div className="space-y-2 flex-1 w-full">
                  <Label className="text-zinc-700 font-semibold">Document Type</Label>
                  <Select value={uploadType} onValueChange={setUploadType}>
                    <SelectTrigger className="h-11 rounded-xl bg-white border-zinc-200 focus:ring-zinc-900 w-full sm:w-[240px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KNOWLEDGE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="font-medium">{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <label htmlFor="knowledge-file" className="w-full sm:w-auto">
                  <Button type="button" className="h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-md transition-all active:scale-[0.98] w-full sm:w-auto px-8 gap-2 cursor-pointer" disabled={uploadMutation.isPending} asChild>
                    <span>
                      {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload File
                    </span>
                  </Button>
                </label>
                <input id="knowledge-file" type="file" accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />
              </div>

              {knowledge.length > 0 ? (
                <div className="space-y-3">
                  {knowledge.map((file: BrandKnowledge) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:border-zinc-300 transition-colors group">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                          {file.mimeType?.startsWith("image/") ? <Image className="h-5 w-5 text-zinc-500" /> : <FileText className="h-5 w-5 text-zinc-500" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-900 truncate">{file.label || file.fileName}</p>
                          <p className="text-xs font-medium text-zinc-500 mt-0.5">{file.type}{file.fileSize ? ` · ${formatFileSize(file.fileSize)}` : ""}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0 opacity-0 group-hover:opacity-100 transition-all" onClick={() => deleteMutation.mutate(file.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-zinc-50 rounded-3xl border border-zinc-200 border-dashed">
                  <Upload className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-zinc-600">No knowledge files uploaded</p>
                  <p className="text-xs text-zinc-500 mt-1">Upload brand guidelines or content samples.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Save Button */}
      {activeSubTab !== "knowledge" && (
        <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <Button 
            onClick={() => saveMutation.mutate()} 
            disabled={saveMutation.isPending || !brandName.trim()} 
            className="h-14 px-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold shadow-xl shadow-zinc-900/20 transition-all active:scale-[0.98] gap-2 text-base"
          >
            {saveMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Save Profile
          </Button>
        </div>
      )}
    </div>
  );
}
