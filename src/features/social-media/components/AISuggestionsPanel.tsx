import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { calendarApi, type CalendarEntry } from "@/api/calendarApi";
import { creativeApi, IMAGE_GEN_TIMEOUT_MS, IMAGE_GEN_POLL_MS } from "@/api/creativeApi";
import { scheduledPostKeys } from "../hooks/useScheduledPosts";
import { getAuthToken, StorageKey } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Loader2,
  ImagePlus,
  Check,
  Trash2,
  Clock,
  CalendarPlus,
  Send,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Strip markdown for plain-text social media posting
// ─────────────────────────────────────────────

// Unicode bold characters for platforms that render them (LinkedIn, some FB contexts)
const BOLD_MAP: Record<string, string> = {};
"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("").forEach((c, i) => {
  const bold = "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵";
  BOLD_MAP[c] = [...bold][i];
});
function toBold(text: string): string {
  return [...text].map((c) => BOLD_MAP[c] || c).join("");
}

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+(.+)$/gm, (_, t) => `${toBold(t.trim())}`)  // ## heading → 𝗕𝗼𝗹𝗱 heading
    .replace(/\*\*(.+?)\*\*/g, (_, t) => toBold(t))  // **bold** → 𝗯𝗼𝗹𝗱
    .replace(/__(.+?)__/g, (_, t) => toBold(t))       // __bold__ → 𝗯𝗼𝗹𝗱
    .replace(/\*(.+?)\*/g, "$1")           // *italic* → plain (no unicode italic — looks odd)
    .replace(/_(.+?)_/g, "$1")             // _italic_ → plain
    .replace(/~~(.+?)~~/g, "$1")           // ~~strike~~ → plain
    .replace(/`(.+?)`/g, "$1")             // `code` → plain
    .replace(/^\s*[-*+]\s+/gm, "  • ")    // - list → bullet
    .replace(/^\s*(\d+)\.\s+/gm, "  $1. ") // numbered list → indented
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1 ($2)")  // [text](url) → text (url)
    .replace(/!\[.*?\]\(.+?\)/g, "")       // images → remove
    .replace(/^>\s+/gm, "❝ ")             // blockquote → quote mark
    .replace(/---+/g, "─────")             // hr → line
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─────────────────────────────────────────────
// Hook to get pending AI suggestions count
// ─────────────────────────────────────────────

export function useAISuggestionsCount(clientId: number) {
  return useQuery({
    queryKey: ["ai-suggestions-count", clientId],
    queryFn: async () => {
      const res = await calendarApi.list(clientId);
      const calendars = res.data.data;
      // Count all DRAFT entries across all calendars
      let total = 0;
      for (const cal of calendars) {
        if (cal.status === "COMPLETED") {
          const detail = await calendarApi.get(cal.calendarId);
          total += detail.data.data.entries.filter((e) => e.status === "DRAFT").length;
        }
      }
      return total;
    },
    refetchInterval: 30_000,
  });
}

// ─────────────────────────────────────────────
// Main Panel Component
// ─────────────────────────────────────────────

interface Props {
  clientId: number;
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export function AISuggestionsPanel({ clientId, isOpen, onClose, onPostCreated }: Props) {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState<Record<string, string>>({});
  const [editingDate, setEditingDate] = useState<Record<string, string>>({});
  const [editingTime, setEditingTime] = useState<Record<string, string>>({});
  const [generatingImage, setGeneratingImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [creatingPost, setCreatingPost] = useState<string | null>(null);
  const pollIntervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  // Cleanup all polling intervals when panel closes
  useEffect(() => () => { pollIntervalsRef.current.forEach((id) => clearInterval(id)); }, []);

  // Fetch all draft entries
  const entriesQuery = useQuery({
    queryKey: ["ai-suggestions", clientId],
    queryFn: async () => {
      const res = await calendarApi.list(clientId);
      const allEntries: (CalendarEntry & { calendarId: string })[] = [];
      for (const cal of res.data.data) {
        if (cal.status === "COMPLETED") {
          const detail = await calendarApi.get(cal.calendarId);
          for (const entry of detail.data.data.entries) {
            if (entry.status === "DRAFT") {
              allEntries.push({ ...entry, calendarId: cal.calendarId });
            }
          }
        }
      }
      return allEntries;
    },
    enabled: isOpen,
  });

  const deleteMutation = useMutation({
    mutationFn: async (entry: CalendarEntry) => {
      // Mark as rejected to remove from drafts
      await calendarApi.updateEntry(entry.id, { status: "REJECTED" });
    },
    onSuccess: () => {
      toast.success("Suggestion dismissed");
      queryClient.invalidateQueries({ queryKey: ["ai-suggestions", clientId] });
      queryClient.invalidateQueries({ queryKey: ["ai-suggestions-count", clientId] });
    },
  });

  const handleGenerateImage = async (entry: CalendarEntry) => {
    setGeneratingImage(entry.id);
    try {
      const res = await creativeApi.generateImage({
        clientId,
        intent: `${entry.postIdea}. ${entry.caption || ""}`.trim(),
        platform: entry.platform === "linkedin" ? "linkedin" : entry.platform,
        aspectRatio: "1:1",
        style: "photorealistic",
        mode: "async",
      });

      const assetId = res.data.data.assetId;
      toast.info("Generating image...");

      // Poll for completion
      const poll = setInterval(async () => {
        try {
          const check = await creativeApi.getAssets(clientId, "image");
          const found = check.data.data.assets.find((a) => a.id === assetId);
          if (found?.imageUrl) {
            clearInterval(poll);
            pollIntervalsRef.current.delete(entry.id);
            setGeneratedImages((prev) => ({ ...prev, [entry.id]: found.imageUrl! }));
            calendarApi.updateEntry(entry.id, { imageUrl: found.imageUrl } as Partial<CalendarEntry>).catch(() => {});
            setGeneratingImage(null);
            toast.success("Image ready!");
          }
        } catch { /* retry next tick */ }
      }, IMAGE_GEN_POLL_MS);
      pollIntervalsRef.current.set(entry.id, poll);

      setTimeout(() => { clearInterval(poll); pollIntervalsRef.current.delete(entry.id); setGeneratingImage(null); }, IMAGE_GEN_TIMEOUT_MS);
    } catch {
      toast.error("Image generation failed");
      setGeneratingImage(null);
    }
  };

  const handleCreatePost = async (entry: CalendarEntry) => {
    setCreatingPost(entry.id);
    try {
      const rawCaption = editingCaption[entry.id] ?? entry.caption ?? entry.postIdea;
      const ct = entry.contentType?.toLowerCase() || "post";
      // For articles: send the raw content — backend will create a teaser
      // For regular posts: convert markdown to social-friendly text
      const caption = (ct === "article" && rawCaption.length > 500)
        ? rawCaption  // backend handles teaser extraction
        : stripMarkdown(rawCaption);
      const date = editingDate[entry.id] ?? entry.date;
      const time = editingTime[entry.id] ?? entry.bestPostTime ?? "09:00";

      // Convert to scheduled post — pass message/date/time directly
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const token = getAuthToken(StorageKey.ANALYTICS_TOKEN) || "";
      const scheduleRes = await fetch(`${baseUrl}/ai/calendar/entry/${entry.id}/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: caption, date, time }),
      });
      if (!scheduleRes.ok) throw new Error("Schedule failed");

      toast.success("Post scheduled! It now appears on your calendar.");
      // Invalidate all relevant queries so calendar + suggestions refresh
      queryClient.invalidateQueries({ queryKey: ["ai-suggestions", clientId] });
      queryClient.invalidateQueries({ queryKey: ["ai-suggestions-count", clientId] });
      queryClient.invalidateQueries({ queryKey: scheduledPostKeys.all });
      queryClient.invalidateQueries({ queryKey: scheduledPostKeys.list(clientId) });
      onPostCreated?.();
    } catch {
      toast.error("Failed to create post");
    } finally {
      setCreatingPost(null);
    }
  };

  const entries = entriesQuery.data || [];
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            Content Suggestions
            {entries.length > 0 && (
              <Badge variant="secondary" className="text-xs">{entries.length} pending</Badge>
            )}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Review content ideas and schedule them as posts
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {entriesQuery.isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!entriesQuery.isLoading && entries.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarPlus className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No pending suggestions</p>
              <p className="text-xs mt-1">Use the report chatbot to get content recommendations</p>
            </div>
          )}

          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const imageUrl = generatedImages[entry.id] || entry.imageUrl;
            const caption = editingCaption[entry.id] ?? entry.caption ?? "";

            return (
              <div
                key={entry.id}
                className={cn(
                  "rounded-xl border transition-all",
                  isExpanded ? "border-violet-300 bg-violet-50/30 shadow-sm" : "border-zinc-200 bg-white hover:border-zinc-300"
                )}
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">{entry.platform}</Badge>
                        <Badge variant="outline" className="text-[10px]">{entry.contentType}</Badge>
                        {entry.bestPostTime && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />{entry.date} {entry.bestPostTime}
                          </span>
                        )}
                        {entry.source === "chat" && (
                          <Badge className="text-[10px] bg-violet-100 text-violet-700 py-0">From AI Chat</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">{entry.postIdea}</p>
                      {entry.dataInsight && (
                        <p className="text-[10px] text-violet-600">
                          <Sparkles className="h-2.5 w-2.5 inline mr-0.5" />{entry.dataInsight}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(entry); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Expanded: edit + create */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t pt-3">
                    {/* Content field — label changes by type */}
                    {(() => {
                      const ct = entry.contentType?.toLowerCase() || "post";
                      const isArticle = ct === "article";
                      const isVideo = ct === "reel" || ct === "story";
                      const fieldLabel = isArticle ? "Article Content" : isVideo ? "Script" : "Caption";
                      const fieldRows = isArticle ? 8 : isVideo ? 5 : 3;
                      const fieldPlaceholder = isArticle
                        ? "Write or generate the full article..."
                        : isVideo
                        ? "Write or generate the video script..."
                        : "Write the post caption...";

                      return (
                        <div className="space-y-1">
                          <Label className="text-xs">{fieldLabel}</Label>
                          <Textarea
                            value={caption}
                            onChange={(e) => setEditingCaption({ ...editingCaption, [entry.id]: e.target.value })}
                            rows={fieldRows}
                            placeholder={fieldPlaceholder}
                            className="text-sm"
                          />
                        </div>
                      );
                    })()}

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="date"
                          value={editingDate[entry.id] ?? entry.date}
                          onChange={(e) => setEditingDate({ ...editingDate, [entry.id]: e.target.value })}
                          className="text-sm h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Time</Label>
                        <Input
                          type="time"
                          value={editingTime[entry.id] ?? entry.bestPostTime ?? "09:00"}
                          onChange={(e) => setEditingTime({ ...editingTime, [entry.id]: e.target.value })}
                          className="text-sm h-9"
                        />
                      </div>
                    </div>

                    {/* Content generation — context-aware */}
                    {(() => {
                      const ct = entry.contentType?.toLowerCase() || "post";
                      const isArticle = ct === "article";
                      const isVideo = ct === "reel" || ct === "story";

                      if (isArticle || isVideo) {
                        // Article / Video script — no image needed
                        return (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 w-full"
                            onClick={async () => {
                              setGeneratingImage(entry.id);
                              try {
                                const res = await creativeApi.generateContent({
                                  clientId,
                                  contentType: entry.contentType,
                                  topic: entry.postIdea,
                                  platform: entry.platform,
                                  context: caption,
                                });
                                setEditingCaption({ ...editingCaption, [entry.id]: res.data.data.content });
                                toast.success(`${isArticle ? "Article" : "Script"} generated! (${res.data.data.wordCount} words)`);
                              } catch {
                                toast.error("Generation failed");
                              } finally {
                                setGeneratingImage(null);
                              }
                            }}
                            disabled={generatingImage === entry.id}
                          >
                            {generatingImage === entry.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Edit2 className="h-3.5 w-3.5" />
                            )}
                            {generatingImage === entry.id ? "Generating..." : isArticle ? "Generate Article" : "Generate Script"}
                          </Button>
                        );
                      }

                      // Image content types (Post, Carousel, etc.)
                      if (imageUrl) {
                        return (
                          <div className="rounded-lg overflow-hidden border">
                            <img src={`${baseUrl}${imageUrl}`} alt="Generated" className="w-full h-40 object-cover" />
                          </div>
                        );
                      }
                      return (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 w-full"
                          onClick={() => handleGenerateImage(entry)}
                          disabled={generatingImage === entry.id}
                        >
                          {generatingImage === entry.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ImagePlus className="h-3.5 w-3.5" />
                          )}
                          {generatingImage === entry.id ? "Generating..." : "Generate Image"}
                        </Button>
                      );
                    })()}

                    {/* Create Post button */}
                    <Button
                      className="w-full gap-2"
                      onClick={() => handleCreatePost(entry)}
                      disabled={creatingPost === entry.id}
                    >
                      {creatingPost === entry.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Schedule Post
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
