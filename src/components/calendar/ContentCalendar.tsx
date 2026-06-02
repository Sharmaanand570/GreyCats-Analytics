import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  calendarApi,
  type Calendar,
  type CalendarEntry,
  type CalendarSummary,
} from "@/api/calendarApi";
import { creativeApi } from "@/api/creativeApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Sparkles,
  CalendarDays,
  Check,
  X,
  Trash2,
  Clock,
  ChevronLeft,
  Edit2,
  Instagram,
  Facebook,
  Download,
  RotateCcw,
  ImagePlus,
  Copy,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const PLATFORM_ICON: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-3.5 w-3.5" />,
  facebook: <Facebook className="h-3.5 w-3.5" />,
};

function getPlatformColor(p: string) {
  switch (p) {
    case "instagram": return "border-l-pink-500";
    case "facebook": return "border-l-blue-600";
    case "linkedin": return "border-l-sky-600";
    case "twitter": return "border-l-zinc-800";
    default: return "border-l-zinc-400";
  }
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

interface Props {
  clientId: number;
}

export default function ContentCalendar({ clientId }: Props) {
  const queryClient = useQueryClient();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2);
  const [selectedYear, setSelectedYear] = useState(
    now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear()
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "facebook"]);
  const [goals, setGoals] = useState("");
  const [postsPerWeek, setPostsPerWeek] = useState(5);
  const [activeCalendarId, setActiveCalendarId] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<CalendarEntry | null>(null);
  const [pollingId, setPollingId] = useState<string | null>(null);

  // ── List calendars ───────────────────────────────────────────────────────
  const listQuery = useQuery({
    queryKey: ["calendars", clientId],
    queryFn: async () => {
      const res = await calendarApi.list(clientId);
      return res.data.data;
    },
  });

  // ── Active calendar detail ───────────────────────────────────────────────
  const calendarQuery = useQuery({
    queryKey: ["calendar", activeCalendarId],
    queryFn: async () => {
      if (!activeCalendarId) return null;
      const res = await calendarApi.get(activeCalendarId);
      return res.data.data;
    },
    enabled: !!activeCalendarId,
  });

  // ── Poll generating calendar ─────────────────────────────────────────────
  const pollingQuery = useQuery({
    queryKey: ["calendar-poll", pollingId],
    queryFn: async () => {
      if (!pollingId) return null;
      const res = await calendarApi.get(pollingId);
      return res.data.data;
    },
    enabled: !!pollingId,
    refetchInterval: pollingId ? 3000 : false,
  });

  useEffect(() => {
    if (pollingQuery.data) {
      if (pollingQuery.data.status === "COMPLETED") {
        toast.success(`Calendar generated with ${pollingQuery.data.entries.length} entries`);
        setActiveCalendarId(pollingId);
        setPollingId(null);
        queryClient.invalidateQueries({ queryKey: ["calendars", clientId] });
      } else if (pollingQuery.data.status === "FAILED") {
        toast.error("Calendar generation failed. Check your AI configuration.");
        setPollingId(null);
        queryClient.invalidateQueries({ queryKey: ["calendars", clientId] });
      }
    }
  }, [pollingQuery.data, pollingId, clientId, queryClient]);

  // ── Generate mutation ────────────────────────────────────────────────────
  const generateMutation = useMutation({
    mutationFn: () =>
      calendarApi.generate({
        clientId,
        month: selectedMonth,
        year: selectedYear,
        platforms: selectedPlatforms,
        goals: goals || undefined,
        postsPerWeek,
      }),
    onSuccess: (res) => {
      setPollingId(res.data.data.calendarId);
      toast.info("Generating calendar... this may take 15-30 seconds");
    },
    onError: () => toast.error("Failed to start generation"),
  });

  // ── Update entry mutation ────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CalendarEntry> }) =>
      calendarApi.updateEntry(id, data),
    onSuccess: () => {
      toast.success("Entry updated");
      queryClient.invalidateQueries({ queryKey: ["calendar", activeCalendarId] });
      setEditEntry(null);
    },
    onError: () => toast.error("Update failed"),
  });

  // ── Delete calendar mutation ─────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => calendarApi.delete(id),
    onSuccess: () => {
      toast.success("Calendar deleted");
      setActiveCalendarId(null);
      queryClient.invalidateQueries({ queryKey: ["calendars", clientId] });
    },
    onError: () => toast.error("Delete failed"),
  });

  const togglePlatform = useCallback((p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }, []);

  // ─────────────────────────────────────────────
  // RENDER: Polling / generating state
  // ─────────────────────────────────────────────

  if (pollingId) {
    const progress = pollingQuery.data?.progress || 0;
    return (
      <div className="space-y-6">
        <Header />
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-medium">Generating your content calendar...</p>
            <Progress value={progress} className="w-64" />
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // RENDER: Active calendar detail
  // ─────────────────────────────────────────────

  if (activeCalendarId && calendarQuery.data) {
    const cal = calendarQuery.data;
    const entriesByDate = new Map<string, CalendarEntry[]>();
    for (const e of cal.entries) {
      if (!entriesByDate.has(e.date)) entriesByDate.set(e.date, []);
      entriesByDate.get(e.date)!.push(e);
    }
    const sortedDates = Array.from(entriesByDate.keys()).sort();

    return (
      <div className="space-y-6">
        <Header />

        {/* Back + title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setActiveCalendarId(null)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h3 className="font-semibold">
                {MONTHS[cal.month - 1]} {cal.year}
              </h3>
              <p className="text-sm text-muted-foreground">
                {cal.entries.length} entries · {(cal.platforms as string[] || []).join(", ")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => exportCalendarCSV(cal)}
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive gap-1.5"
              onClick={() => deleteMutation.mutate(cal.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Entries grouped by date */}
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date}>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <div className="space-y-2">
                {entriesByDate.get(date)!.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "border rounded-lg p-4 border-l-4 hover:shadow-sm transition-shadow cursor-pointer",
                      getPlatformColor(entry.platform)
                    )}
                    onClick={() => setEditEntry(entry)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="gap-1 text-xs">
                            {PLATFORM_ICON[entry.platform] || null}
                            {entry.platform}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {entry.contentType}
                          </Badge>
                          <Badge className={cn("text-xs", STATUS_COLORS[entry.status])}>
                            {entry.status}
                          </Badge>
                          {entry.source === "chat" && (
                            <Badge className="text-xs bg-violet-100 text-violet-700">
                              <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                              From AI Chat
                            </Badge>
                          )}
                          {entry.bestPostTime && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {entry.bestPostTime}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium">{entry.postIdea}</p>
                        {entry.caption && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {entry.caption}
                          </p>
                        )}
                        {entry.dataInsight && (
                          <p className="text-xs text-violet-600 mt-1">
                            <Sparkles className="h-3 w-3 inline mr-1" />
                            {entry.dataInsight}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {entry.status === "DRAFT" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateMutation.mutate({ id: entry.id, data: { status: "APPROVED" } });
                              }}
                            >
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateMutation.mutate({ id: entry.id, data: { status: "REJECTED" } });
                              }}
                            >
                              <X className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </>
                        )}
                        {entry.status === "REJECTED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Re-approve"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMutation.mutate({ id: entry.id, data: { status: "DRAFT" } });
                            }}
                          >
                            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Edit entry dialog */}
        {editEntry && (
          <EntryEditDialog
            entry={editEntry}
            clientId={clientId}
            onClose={() => setEditEntry(null)}
            onSave={(data) => updateMutation.mutate({ id: editEntry.id, data })}
            isPending={updateMutation.isPending}
          />
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // RENDER: Calendar list + generate form
  // ─────────────────────────────────────────────

  const calendars = listQuery.data || [];

  return (
    <div className="space-y-6">
      <Header />

      {/* Generate Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate New Calendar</CardTitle>
          <CardDescription>
            AI will create a full month of content based on your brand profile and historical data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Month</Label>
              <Select
                value={String(selectedMonth)}
                onValueChange={(v) => setSelectedMonth(Number(v))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Select
                value={String(selectedYear)}
                onValueChange={(v) => setSelectedYear(Number(v))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2025, 2026, 2027].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Posts per week</Label>
              <Input
                type="number"
                min={1}
                max={14}
                value={postsPerWeek}
                onChange={(e) => setPostsPerWeek(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePlatform(p.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-sm transition-colors",
                    selectedPlatforms.includes(p.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Goals (optional)</Label>
            <Textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g. Focus on product launches and brand awareness"
              rows={2}
            />
          </div>

          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || selectedPlatforms.length === 0}
            className="gap-2"
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate Calendar
          </Button>
        </CardContent>
      </Card>

      {/* Past Calendars */}
      {calendars.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Past Calendars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {calendars.map((cal: CalendarSummary) => (
                <button
                  key={cal.calendarId}
                  onClick={() => cal.status === "COMPLETED" && setActiveCalendarId(cal.calendarId)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/40 transition-colors text-left"
                  disabled={cal.status !== "COMPLETED"}
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {MONTHS[cal.month - 1]} {cal.year}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cal.entryCount} entries · {(cal.platforms || []).join(", ")}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "text-xs",
                      cal.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : cal.status === "GENERATING"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {cal.status}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function exportCalendarCSV(cal: Calendar) {
  const headers = ["Date", "Day", "Platform", "Content Type", "Post Idea", "Caption", "Hashtags", "Best Time", "Status", "Data Insight"];
  const rows = cal.entries.map((e) => [
    e.date,
    e.dayOfWeek,
    e.platform,
    e.contentType,
    `"${(e.postIdea || "").replace(/"/g, '""')}"`,
    `"${(e.caption || "").replace(/"/g, '""')}"`,
    `"${(e.hashtags as string[] || []).join(", ")}"`,
    e.bestPostTime || "",
    e.status,
    `"${(e.dataInsight || "").replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `calendar-${MONTHS[cal.month - 1]}-${cal.year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function Header() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-sm">
        <CalendarDays className="h-5 w-5 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">AI Content Calendar</h2>
        <p className="text-sm text-muted-foreground">
          Generate a full month of content powered by your brand profile and data insights
        </p>
      </div>
    </div>
  );
}

function EntryEditDialog({
  entry,
  clientId,
  onClose,
  onSave,
  isPending,
}: {
  entry: CalendarEntry;
  clientId: number;
  onClose: () => void;
  onSave: (data: Partial<CalendarEntry>) => void;
  isPending: boolean;
}) {
  const pollCleanupRef = useRef<(() => void) | null>(null);
  // Cleanup polling on dialog close
  useEffect(() => () => { pollCleanupRef.current?.(); }, []);
  const [postIdea, setPostIdea] = useState(entry.postIdea);
  const [caption, setCaption] = useState(entry.caption || "");
  const [bestPostTime, setBestPostTime] = useState(entry.bestPostTime || "");
  const [status, setStatus] = useState(entry.status);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const ct = entry.contentType?.toLowerCase() || "post";
  const isArticle = ct === "article";
  const isVideo = ct === "reel" || ct === "story";
  const genLabel = isArticle ? "Generate Article" : isVideo ? "Generate Video Script" : "Generate Image";

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (isArticle || isVideo) {
        const res = await creativeApi.generateContent({
          clientId,
          contentType: entry.contentType,
          topic: postIdea,
          platform: entry.platform,
          context: caption || undefined,
        });
        setGeneratedContent(res.data.data.content);
        toast.success(`${isArticle ? "Article" : "Script"} generated! (${res.data.data.wordCount} words)`);
        setIsGenerating(false);
      } else {
        const res = await creativeApi.generateImage({
          clientId,
          intent: `${postIdea}. ${caption || ""}`.trim(),
          platform: entry.platform,
          aspectRatio: ct === "story" ? "9:16" : "1:1",
          style: "photorealistic",
          mode: "sync",
        });
        if (res.data.data.imageUrl) {
          setGeneratedImageUrl(res.data.data.imageUrl);
          setIsGenerating(false);
          toast.success("Image ready!");
        } else {
          toast.error("Image was generated but no URL was returned");
          setIsGenerating(false);
        }
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || "Generation failed";
      toast.error(errMsg);
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Entry — {entry.date}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Badge variant="outline">{entry.platform}</Badge>
            <Badge variant="outline">{entry.contentType}</Badge>
            {entry.source === "chat" && (
              <Badge className="text-xs bg-violet-100 text-violet-700">From AI Chat</Badge>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Post Idea</Label>
            <Textarea value={postIdea} onChange={(e) => setPostIdea(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>{isArticle ? "Article Content" : isVideo ? "Script" : "Caption"}</Label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={isArticle ? 10 : isVideo ? 6 : 4}
              placeholder={isArticle ? "Write or generate the full article..." : isVideo ? "Write or generate the video script..." : "Write the post caption..."}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Best Post Time</Label>
              <Input value={bestPostTime} onChange={(e) => setBestPostTime(e.target.value)} placeholder="09:00" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as CalendarEntry["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {entry.dataInsight && (
            <p className="text-xs text-violet-600 bg-violet-50 rounded-md px-3 py-2">
              <Sparkles className="h-3 w-3 inline mr-1" />
              {entry.dataInsight}
            </p>
          )}

          {/* Generate content section */}
          <div className="border-t pt-4 space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isArticle || isVideo ? (
                <Edit2 className="h-3.5 w-3.5" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" />
              )}
              {isGenerating ? "Generating..." : genLabel}
            </Button>

            {/* Generated image */}
            {generatedImageUrl && (
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL?.replace("/api", "")}${generatedImageUrl}`}
                  alt="Generated"
                  className="w-full h-auto max-h-60 object-contain"
                />
              </div>
            )}

            {/* Generated article/script — large readable area */}
            {generatedContent && (isArticle || isVideo) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">
                    {isArticle ? "Generated Article" : "Generated Script"}
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 h-6 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedContent);
                      toast.success("Copied!");
                    }}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
                <div className="bg-muted rounded-lg p-4 max-h-[300px] overflow-y-auto text-sm prose prose-sm prose-zinc dark:prose-invert max-w-none">
                  <ReactMarkdown>{generatedContent}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Image prompt (collapsible) */}
            {generatedContent && !isArticle && !isVideo && (
              <details className={generatedImageUrl ? "" : "open"}>
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  {generatedImageUrl ? "Show prompt" : "Image prompt"}
                </summary>
                <div className="relative mt-1">
                  <pre className="text-xs bg-muted rounded-lg p-2 whitespace-pre-wrap max-h-20 overflow-y-auto">{generatedContent}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onSave({ postIdea, caption, bestPostTime, status })}
            disabled={isPending}
            className="gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
