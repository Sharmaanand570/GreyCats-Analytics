import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { SiMeta } from "react-icons/si";
import {
  Activity,
  CheckCircle2,
  Copy,
  Globe,
  Plus,
  RefreshCw,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useMetaPixels } from "@/features/meta/hooks/useMetaAdsManager";
import {
  useCustomConversions,
  useCreateCustomConversion,
  useDomains,
  usePixelEvents,
  usePixelStats,
  useVerifyDomain,
} from "@/features/meta/hooks/useMetaPixelsAdmin";
import type { CreateCustomConversionPayload } from "@/features/meta/API/metaPixelsApi";
import { useAllClients } from "@/hooks/useClients";
import { cn } from "@/lib/utils";

const CUSTOM_EVENT_TYPES = [
  "PURCHASE",
  "LEAD",
  "OTHER",
  "COMPLETE_REGISTRATION",
  "ADD_TO_CART",
  "INITIATE_CHECKOUT",
  "SUBSCRIBE",
  "VIEW_CONTENT",
];

const VERIFY_METHODS = [
  { value: "meta_tag" as const, label: "Meta Tag", hint: "Add an HTML meta tag to your site" },
  { value: "dns_txt" as const, label: "DNS TXT Record", hint: "Add a TXT record to your DNS" },
  { value: "file_upload" as const, label: "File Upload", hint: "Upload a verification file to your server" },
];

function EmqPill({ score }: { score: number }) {
  const color =
    score <= 3
      ? "bg-rose-100 text-rose-700 border-rose-200"
      : score <= 6
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-emerald-100 text-emerald-700 border-emerald-200";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border", color)}>
      {score.toFixed(1)}
    </span>
  );
}

function MetaPixelsPage() {
  const navigate = useNavigate();
  const { clientId: clientIdParam } = useParams<{ clientId?: string }>();
  const clientId = clientIdParam ? Number(clientIdParam) : null;

  const { data: clientsData } = useAllClients();
  const clients = clientsData || [];

  const { data: pixelsData } = useMetaPixels(clientId);
  const pixels = pixelsData?.pixels ?? [];

  const [selectedPixelId, setSelectedPixelId] = useState<string>("");
  const activePixelId = selectedPixelId || pixels[0]?.id || "";

  const { data: events, isLoading: isLoadingEvents } = usePixelEvents(clientId, activePixelId);
  const { data: stats } = usePixelStats(clientId, activePixelId);
  const { data: conversions, isLoading: isLoadingConversions } = useCustomConversions(
    clientId,
    activePixelId
  );
  const { data: domains, isLoading: isLoadingDomains } = useDomains(clientId);

  const { mutate: createConversion, isPending: isCreating } = useCreateCustomConversion();
  const { mutate: verifyDomainMut, isPending: isVerifying, data: verifyResult } =
    useVerifyDomain();

  const [createOpen, setCreateOpen] = useState(false);
  const [convDraft, setConvDraft] = useState<CreateCustomConversionPayload>({
    name: "",
    custom_event_type: "PURCHASE",
    rule: {},
  });
  const [ruleJson, setRuleJson] = useState("{}");
  const [ruleJsonError, setRuleJsonError] = useState("");

  const [domainInput, setDomainInput] = useState("");
  const [verifyMethod, setVerifyMethod] = useState<"meta_tag" | "dns_txt" | "file_upload">(
    "meta_tag"
  );
  const [lastVerifiedToken, setLastVerifiedToken] = useState<string | null>(null);

  const handleCreateConversion = () => {
    if (!clientId || !activePixelId || !convDraft.name.trim()) return;
    let parsedRule: Record<string, unknown>;
    try {
      parsedRule = JSON.parse(ruleJson);
    } catch {
      setRuleJsonError("Invalid JSON — check syntax.");
      return;
    }
    createConversion(
      { clientId, pixelId: activePixelId, payload: { ...convDraft, rule: parsedRule } },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setConvDraft({ name: "", custom_event_type: "PURCHASE", rule: {} });
          setRuleJson("{}");
        },
      }
    );
  };

  const handleVerify = () => {
    if (!clientId || !domainInput.trim()) return;
    verifyDomainMut(
      { clientId, domain: domainInput.trim(), method: verifyMethod },
      {
        onSuccess: (result) => {
          setLastVerifiedToken(result.verification_token ?? null);
          setDomainInput("");
        },
      }
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#fafafa]">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-20 border-slate-200/60 shadow-sm px-8 py-6">
        <div className="flex flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList className="text-xs font-medium text-slate-400">
              <BreadcrumbItem>
                <BreadcrumbLink to="/data-sources">Data Sources</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  to={clientId ? `/data-sources/meta-ads/${clientId}` : "/data-sources/meta-ads"}
                >
                  Meta Ads
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-slate-900 font-bold">Pixels</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg">
                <Activity className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  Pixels Admin
                  <SiMeta className="w-4 h-4 text-[#0866FF]" />
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Monitor pixel health, manage custom conversions, and verify domains.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={clientId?.toString() ?? ""}
                onValueChange={(v) => navigate(`/data-sources/meta-ads/pixels/${v}`)}
              >
                <SelectTrigger className="h-11 w-[240px] rounded-xl">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: { id: number; name: string }) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {pixels.length > 1 && (
                <Select value={activePixelId} onValueChange={setSelectedPixelId}>
                  <SelectTrigger className="h-11 w-[220px] rounded-xl">
                    <SelectValue placeholder="Select pixel" />
                  </SelectTrigger>
                  <SelectContent>
                    {pixels.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {!clientId ? (
          <Card className="rounded-2xl border-amber-100 bg-amber-50 p-6 text-sm text-amber-800">
            Select a client to manage pixel data.
          </Card>
        ) : pixels.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-slate-200 p-12 text-center">
            <Zap className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h2 className="text-lg font-bold text-slate-900">No pixels connected</h2>
            <p className="text-sm text-slate-500 mt-1">
              Connect a Meta Pixel to this ad account in Step 1 of the wizard.
            </p>
          </Card>
        ) : (
          <>
            {/* Pixel stats summary bar */}
            {stats && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Events", value: stats.total_events.toLocaleString() },
                  { label: "Last 24h", value: stats.events_last_24h.toLocaleString() },
                  { label: "Last 7 Days", value: stats.events_last_7d.toLocaleString() },
                  {
                    label: "Match Quality",
                    value:
                      stats.match_quality_score !== undefined
                        ? stats.match_quality_score.toFixed(1)
                        : "—",
                  },
                ].map((item) => (
                  <Card key={item.label} className="rounded-2xl border-slate-100 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {item.label}
                    </p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{item.value}</p>
                  </Card>
                ))}
              </div>
            )}

            <Tabs defaultValue="events">
              <TabsList className="mb-4 rounded-xl bg-slate-100">
                <TabsTrigger value="events" className="rounded-lg">
                  Events
                </TabsTrigger>
                <TabsTrigger value="conversions" className="rounded-lg">
                  Custom Conversions
                </TabsTrigger>
                <TabsTrigger value="domains" className="rounded-lg">
                  Domain Verification
                </TabsTrigger>
              </TabsList>

              {/* Events Tab */}
              <TabsContent value="events">
                {isLoadingEvents ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 rounded-xl" />
                    ))}
                  </div>
                ) : !events || events.length === 0 ? (
                  <Card className="rounded-2xl border-dashed border-slate-200 p-12 text-center">
                    <Activity className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm text-slate-500">
                      No pixel events received in the last 7 days. Make sure your pixel is
                      installed correctly.
                    </p>
                  </Card>
                ) : (
                  <Card className="rounded-2xl border-slate-100 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event Name</TableHead>
                          <TableHead>Last Fired</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead className="text-right">EMQ Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((ev) => (
                          <TableRow key={ev.event_name}>
                            <TableCell className="font-bold">{ev.event_name}</TableCell>
                            <TableCell className="text-sm text-slate-500">
                              {ev.last_fired_time
                                ? formatDistanceToNow(new Date(ev.last_fired_time), {
                                    addSuffix: true,
                                  })
                                : "—"}
                            </TableCell>
                            <TableCell>
                              {ev.source ? (
                                <Badge variant="outline" className="capitalize">
                                  {ev.source}
                                </Badge>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell className="text-right text-slate-700">
                              {ev.count?.toLocaleString() ?? "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {ev.event_match_quality !== undefined ? (
                                <EmqPill score={ev.event_match_quality} />
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </TabsContent>

              {/* Custom Conversions Tab */}
              <TabsContent value="conversions">
                <div className="flex justify-end mb-4">
                  <Button
                    onClick={() => setCreateOpen(true)}
                    disabled={!activePixelId}
                    className="h-10 rounded-xl gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Create Conversion
                  </Button>
                </div>

                {isLoadingConversions ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-12 rounded-xl" />
                    ))}
                  </div>
                ) : !conversions || conversions.length === 0 ? (
                  <Card className="rounded-2xl border-dashed border-slate-200 p-12 text-center">
                    <p className="text-sm text-slate-500">
                      No custom conversions yet. Create one to track specific user actions.
                    </p>
                  </Card>
                ) : (
                  <Card className="rounded-2xl border-slate-100 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Pixel</TableHead>
                          <TableHead className="text-right">Default Value</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {conversions.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-bold">{c.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{c.custom_event_type}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-slate-400 font-mono">
                              {c.pixel_id}
                            </TableCell>
                            <TableCell className="text-right">
                              {c.default_conversion_value ?? "—"}
                            </TableCell>
                            <TableCell className="text-sm text-slate-500">
                              {c.created_time
                                ? formatDistanceToNow(new Date(c.created_time), {
                                    addSuffix: true,
                                  })
                                : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </TabsContent>

              {/* Domain Verification Tab */}
              <TabsContent value="domains">
                <Card className="rounded-2xl border-slate-100 p-6 mb-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-700">Verify a domain</h3>
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <Input
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder="example.com"
                      className="h-10 rounded-xl border-slate-200"
                    />
                    <Button
                      onClick={handleVerify}
                      disabled={isVerifying || !domainInput.trim() || !clientId}
                      className="h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-5"
                    >
                      {isVerifying ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    {VERIFY_METHODS.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setVerifyMethod(m.value)}
                        className={cn(
                          "flex-1 text-left px-3 py-2 rounded-xl border text-sm transition-all",
                          verifyMethod === m.value
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="font-bold">{m.label}</div>
                        <div
                          className={cn(
                            "text-[10px] mt-0.5",
                            verifyMethod === m.value ? "text-slate-300" : "text-slate-400"
                          )}
                        >
                          {m.hint}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Show the verification token returned by backend after verify click */}
                  {(lastVerifiedToken ?? verifyResult?.verification_token) && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-600">
                        Verification token — install this on your site:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 block bg-slate-900 text-emerald-400 text-xs font-mono px-3 py-2 rounded-xl break-all">
                          {lastVerifiedToken ?? verifyResult?.verification_token}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 rounded-lg"
                          onClick={() => {
                            const token =
                              lastVerifiedToken ?? verifyResult?.verification_token ?? "";
                            navigator.clipboard.writeText(token);
                            toast.success("Token copied");
                          }}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>

                {isLoadingDomains ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-12 rounded-xl" />
                    ))}
                  </div>
                ) : !domains || domains.length === 0 ? (
                  <Card className="rounded-2xl border-dashed border-slate-200 p-8 text-center">
                    <Globe className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No domains verified yet.</p>
                  </Card>
                ) : (
                  <Card className="rounded-2xl border-slate-100 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Domain</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Verified At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {domains.map((d) => (
                          <TableRow key={d.domain}>
                            <TableCell className="font-mono font-bold">{d.domain}</TableCell>
                            <TableCell>
                              {d.verified ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                  <XCircle className="w-3 h-3" />
                                  Unverified
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-slate-500 capitalize">
                              {d.verification_method?.replace("_", " ") ?? "—"}
                            </TableCell>
                            <TableCell className="text-sm text-slate-500">
                              {d.verified_at
                                ? formatDistanceToNow(new Date(d.verified_at), {
                                    addSuffix: true,
                                  })
                                : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Create custom conversion modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Custom Conversion</DialogTitle>
            <DialogDescription>
              Define a conversion event based on pixel activity.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Name
              </label>
              <Input
                value={convDraft.name}
                onChange={(e) => setConvDraft({ ...convDraft, name: e.target.value })}
                placeholder="e.g. Purchase over $100"
                className="h-10 rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Event Type
              </label>
              <Select
                value={convDraft.custom_event_type}
                onValueChange={(v) => setConvDraft({ ...convDraft, custom_event_type: v })}
              >
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOM_EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Default Conversion Value
              </label>
              <Input
                type="number"
                min={0}
                value={convDraft.default_conversion_value ?? ""}
                onChange={(e) =>
                  setConvDraft({
                    ...convDraft,
                    default_conversion_value: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Optional — e.g. 29.99"
                className="h-10 rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Rule (JSON)
              </label>
              <Textarea
                value={ruleJson}
                onChange={(e) => {
                  setRuleJson(e.target.value);
                  setRuleJsonError("");
                }}
                rows={4}
                className="font-mono text-xs rounded-lg"
                placeholder='{"url": {"i_contains": "/thank-you"}}'
              />
              {ruleJsonError && (
                <p className="text-xs text-rose-600">{ruleJsonError}</p>
              )}
              <p className="text-[10px] text-slate-400">
                Meta's rule spec — paste valid JSON. Leave as{" "}
                <code className="bg-slate-100 px-1 rounded">&#123;&#125;</code> for no filter.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleCreateConversion}
              disabled={isCreating || !convDraft.name.trim()}
              className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MetaPixelsPage;
