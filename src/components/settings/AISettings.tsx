import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { aiApi, type SaveAIConfigPayload } from "@/api/aiApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Zap, Trash2, CheckCircle, XCircle, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Provider & Model Presets
// ─────────────────────────────────────────────

const TEXT_PROVIDERS = [
  {
    id: "anthropic",
    label: "Anthropic Claude",
    requiresBaseUrl: false,
    models: ["claude-sonnet-4-6", "claude-opus-4-6", "claude-haiku-4-5-20251001"],
    placeholder: "sk-ant-...",
    docsUrl: "https://console.anthropic.com/",
  },
  {
    id: "openai-compatible",
    label: "OpenAI",
    requiresBaseUrl: false,
    defaultBaseUrl: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-mini"],
    placeholder: "sk-...",
    docsUrl: "https://platform.openai.com/",
  },
  {
    id: "openai-compatible",
    label: "xAI Grok",
    requiresBaseUrl: true,
    defaultBaseUrl: "https://api.x.ai/v1",
    models: ["grok-2", "grok-2-mini", "grok-beta"],
    placeholder: "xai-...",
    docsUrl: "https://console.x.ai/",
  },
  {
    id: "openai-compatible",
    label: "Groq (Fast)",
    requiresBaseUrl: true,
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    models: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"],
    placeholder: "gsk_...",
    docsUrl: "https://console.groq.com/",
  },
  {
    id: "openai-compatible",
    label: "Mistral AI",
    requiresBaseUrl: true,
    defaultBaseUrl: "https://api.mistral.ai/v1",
    models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest"],
    placeholder: "...",
    docsUrl: "https://console.mistral.ai/",
  },
  {
    id: "openai-compatible",
    label: "Together AI",
    requiresBaseUrl: true,
    defaultBaseUrl: "https://api.together.xyz/v1",
    models: ["meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", "mistralai/Mixtral-8x7B-Instruct-v0.1"],
    placeholder: "...",
    docsUrl: "https://api.together.ai/",
  },
  {
    id: "openai-compatible",
    label: "Ollama (Local)",
    requiresBaseUrl: true,
    defaultBaseUrl: "http://localhost:11434/v1",
    models: ["llama3.2", "llama3.1:70b", "mistral", "qwen2.5:72b", "deepseek-r1:70b"],
    placeholder: "ollama (no key needed)",
    docsUrl: "https://ollama.com/",
  },
  {
    id: "openai-compatible",
    label: "Perplexity",
    requiresBaseUrl: true,
    defaultBaseUrl: "https://api.perplexity.ai",
    models: ["sonar-pro", "sonar", "sonar-reasoning"],
    placeholder: "pplx-...",
    docsUrl: "https://www.perplexity.ai/settings/api",
  },
  {
    id: "google",
    label: "Google Gemini",
    requiresBaseUrl: false,
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    placeholder: "AIza...",
    docsUrl: "https://aistudio.google.com/",
  },
] as const;

const IMAGE_PROVIDERS = [
  { id: "openai", label: "OpenAI DALL-E", models: ["dall-e-3", "dall-e-2"] },
  { id: "stability", label: "Stability AI", models: ["stable-diffusion-xl-1024-v1-0", "sd3-medium"] },
  { id: "together", label: "Together AI (Flux)", models: ["black-forest-labs/FLUX.1-schnell", "black-forest-labs/FLUX.1-dev"] },
];

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type FormValues = {
  selectedPreset: string;
  textProvider: string;
  textModel: string;
  textApiKey: string;
  textBaseUrl: string;
  textOrgId: string;
  imageProvider: string;
  imageModel: string;
  imageApiKey: string;
};

type TestStatus = "idle" | "loading" | "success" | "error";

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function AISettings() {
  const queryClient = useQueryClient();
  const [showTextKey, setShowTextKey] = useState(false);
  const [showImageKey, setShowImageKey] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number | null>(null);

  const { data: configRes, isLoading } = useQuery({
    queryKey: ["aiConfig"],
    queryFn: aiApi.getConfig,
  });

  const config = configRes?.data;

  const { register, handleSubmit, watch, setValue, getValues } = useForm<FormValues>({
    values: {
      selectedPreset: "",
      textProvider: config?.textProvider || "anthropic",
      textModel: config?.textModel || "",
      textApiKey: "",
      textBaseUrl: config?.textBaseUrl || "",
      textOrgId: config?.textOrgId || "",
      imageProvider: config?.imageProvider || "openai",
      imageModel: config?.imageModel || "dall-e-3",
      imageApiKey: "",
    },
  });

  const watchedImageProvider = watch("imageProvider");

  const saveMutation = useMutation({
    mutationFn: aiApi.saveConfig,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("AI configuration saved");
        queryClient.invalidateQueries({ queryKey: ["aiConfig"] });
      } else {
        toast.error(res.message || "Failed to save");
      }
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to save AI config"),
  });

  const deleteMutation = useMutation({
    mutationFn: aiApi.deleteConfig,
    onSuccess: () => {
      toast.success("Custom config removed — system defaults restored");
      queryClient.invalidateQueries({ queryKey: ["aiConfig"] });
    },
    onError: () => toast.error("Failed to remove config"),
  });

  const handlePresetSelect = (idx: number) => {
    const preset = TEXT_PROVIDERS[idx];
    setSelectedPresetIdx(idx);
    setValue("textProvider", preset.id);
    setValue("textBaseUrl", preset.defaultBaseUrl || "");
    setValue("textModel", preset.models[0]);
    setValue("textApiKey", "");
  };

  const handleTest = async () => {
    const values = getValues();
    setTestStatus("loading");
    setTestLatency(null);
    try {
      const res = await aiApi.testConfig({
        textProvider: values.textProvider,
        textModel: values.textModel,
        textApiKey: values.textApiKey || undefined,
        textBaseUrl: values.textBaseUrl || undefined,
        textOrgId: values.textOrgId || undefined,
      });
      if (res.success && res.data) {
        setTestStatus("success");
        setTestLatency(res.data.latencyMs);
        toast.success(`Connected in ${res.data.latencyMs}ms`);
      } else {
        setTestStatus("error");
        toast.error(res.message || "Connection failed");
      }
    } catch (err: any) {
      setTestStatus("error");
      toast.error(err.response?.data?.message || "Connection test failed");
    }
  };

  const onSubmit = (data: FormValues) => {
    const payload: SaveAIConfigPayload = {
      textProvider: data.textProvider || undefined,
      textModel: data.textModel || undefined,
      textApiKey: data.textApiKey || undefined,
      textBaseUrl: data.textBaseUrl || undefined,
      textOrgId: data.textOrgId || undefined,
      imageProvider: data.imageProvider || undefined,
      imageModel: data.imageModel || undefined,
      imageApiKey: data.imageApiKey || undefined,
    };
    saveMutation.mutate(payload);
  };

  const currentPreset = selectedPresetIdx !== null ? TEXT_PROVIDERS[selectedPresetIdx] : null;
  const imageProviderModels = IMAGE_PROVIDERS.find(p => p.id === watchedImageProvider)?.models ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* System Default Banner */}
      {config?.usingSystemDefault && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <span className="font-medium">Using system defaults</span> — the platform is using{" "}
            <span className="font-mono">{config.systemTextProvider} / {config.systemTextModel}</span> for text
            and <span className="font-mono">{config.systemImageProvider} / {config.systemImageModel}</span> for images.
            Configure your own keys below to override.
          </div>
        </div>
      )}

      {/* Active custom config badge */}
      {!config?.usingSystemDefault && (
        <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span>Custom AI config active —</span>
            <span className="font-mono">{config?.textProvider} / {config?.textModel}</span>
            {config?.updatedAt && (
              <span className="text-green-400/60">· Updated {new Date(config.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span className="ml-1">Reset to defaults</span>
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* Text AI Configuration */}
        <Card className="shadow-none border-none bg-transparent">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Text AI Provider</CardTitle>
            <CardDescription>
              Used for the AI Report Chatbot, Content Calendar, and Caption generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-6">

            {/* Provider Preset Grid */}
            <div>
              <Label className="mb-3 block">Select Provider</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TEXT_PROVIDERS.map((preset, idx) => (
                  <button
                    key={`${preset.id}-${idx}`}
                    type="button"
                    onClick={() => handlePresetSelect(idx)}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      selectedPresetIdx === idx
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card hover:border-primary/50 hover:bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    <div className="font-medium">{preset.label}</div>
                    <div className="text-xs opacity-60 mt-0.5 truncate">{preset.models[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 max-w-xl">

              {/* Model */}
              <div className="grid gap-2">
                <Label htmlFor="textModel">Model</Label>
                <input
                  id="textModel"
                  list="text-model-list"
                  placeholder={currentPreset ? currentPreset.models[0] : "e.g. claude-sonnet-4-6"}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("textModel")}
                />
                <datalist id="text-model-list">
                  {(currentPreset?.models ?? []).map(m => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>

              {/* API Key */}
              <div className="grid gap-2">
                <Label htmlFor="textApiKey">
                  API Key
                  {currentPreset?.label === "Ollama (Local)" && (
                    <span className="ml-2 text-xs text-muted-foreground">(not required for local Ollama)</span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="textApiKey"
                    type={showTextKey ? "text" : "password"}
                    placeholder={currentPreset?.placeholder || config?.textApiKey || "Paste your API key"}
                    className="pr-10 font-mono text-sm"
                    {...register("textApiKey")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowTextKey(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showTextKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {config?.textApiKey && (
                  <p className="text-xs text-muted-foreground">
                    Current: <span className="font-mono">{config.textApiKey}</span> — leave blank to keep existing
                  </p>
                )}
              </div>

              {/* Base URL — shown when provider needs it */}
              {(currentPreset?.requiresBaseUrl || watch("textBaseUrl")) && (
                <div className="grid gap-2">
                  <Label htmlFor="textBaseUrl">Base URL</Label>
                  <Input
                    id="textBaseUrl"
                    placeholder={currentPreset?.defaultBaseUrl || "https://api.provider.com/v1"}
                    className="font-mono text-sm"
                    {...register("textBaseUrl")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for OpenAI-compatible providers. Leave empty for OpenAI default.
                  </p>
                </div>
              )}

              {/* Organization ID — OpenAI-compatible only */}
              {watch("textProvider") === "openai-compatible" && (
                <div className="grid gap-2">
                  <Label htmlFor="textOrgId">
                    Organization ID
                    <span className="ml-2 text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="textOrgId"
                    placeholder="org-..."
                    className="font-mono text-sm"
                    {...register("textOrgId")}
                  />
                  <p className="text-xs text-muted-foreground">
                    OpenAI organization ID. Leave blank if you don't use org-level billing.
                  </p>
                </div>
              )}

              {/* Test Connection */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={testStatus === "loading"}
                >
                  {testStatus === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
                {testStatus === "success" && (
                  <span className="flex items-center gap-1 text-sm text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    Connected {testLatency !== null && `· ${testLatency}ms`}
                  </span>
                )}
                {testStatus === "error" && (
                  <span className="flex items-center gap-1 text-sm text-red-400">
                    <XCircle className="h-4 w-4" />
                    Failed
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Image AI Configuration */}
        <Card className="shadow-none border-none bg-transparent">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Image Generation Provider</CardTitle>
            <CardDescription>
              Used for the AI Creative Suite image generation feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="grid gap-5 max-w-xl">

              {/* Image Provider */}
              <div className="grid gap-2">
                <Label>Provider</Label>
                <div className="flex gap-2 flex-wrap">
                  {IMAGE_PROVIDERS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setValue("imageProvider", p.id);
                        setValue("imageModel", p.models[0]);
                      }}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        watchedImageProvider === p.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:border-primary/50 text-muted-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Model */}
              <div className="grid gap-2">
                <Label htmlFor="imageModel">Model</Label>
                <input
                  id="imageModel"
                  list="image-model-list"
                  placeholder={imageProviderModels[0] || "e.g. dall-e-3"}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("imageModel")}
                />
                <datalist id="image-model-list">
                  {imageProviderModels.map(m => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>

              {/* Image API Key */}
              <div className="grid gap-2">
                <Label htmlFor="imageApiKey">API Key</Label>
                <div className="relative">
                  <Input
                    id="imageApiKey"
                    type={showImageKey ? "text" : "password"}
                    placeholder={config?.imageApiKey || "Paste your API key"}
                    className="pr-10 font-mono text-sm"
                    {...register("imageApiKey")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowImageKey(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showImageKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {config?.imageApiKey && (
                  <p className="text-xs text-muted-foreground">
                    Current: <span className="font-mono">{config.imageApiKey}</span> — leave blank to keep existing
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save AI Configuration
          </Button>
        </div>

      </form>
    </div>
  );
}
