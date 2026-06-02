import { useState, useEffect, useRef, useCallback, memo } from "react";
import ReactMarkdown from "react-markdown";
import { useMutation } from "@tanstack/react-query";
import { chatApi, type ChatSession, type ChatMessage } from "@/api/chatApi";
import { useAIStream } from "@/hooks/useAIStream";
import { calendarApi } from "@/api/calendarApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  X,
  MessageSquare,
  Send,
  Loader2,
  Trash2,
  History,
  ChevronDown,
  Sparkles,
  TriangleAlert,
  CalendarPlus,
  Clock,
  Check,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface ReportChatbotProps {
  templateId: number;
  clientId?: number | null;
  dateFrom: Date;
  dateTo: Date;
  onClose: () => void;
}

// ─────────────────────────────────────────────
// Date helpers — UTC-safe to avoid timezone shift
// ─────────────────────────────────────────────

/** Get the next occurrence of a day of week (e.g. "Monday"), or next Monday if not specified */
function getNextDate(dayOfWeek?: string): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const target = dayOfWeek ? days.indexOf(dayOfWeek) : 1; // default Monday
  const now = new Date();
  const current = now.getDay();
  let diff = (target === -1 ? 1 : target) - current;
  if (diff <= 0) diff += 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  return localDateStr(next);
}

/** Format a Date as YYYY-MM-DD in LOCAL time (avoids UTC shift from toISOString) */
function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse an ISO date string as UTC and format it without timezone conversion */
function utcDate(isoString: string): Date {
  const [y, m, d] = isoString.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDateRange(fromIso: string, toIso: string): string {
  const from = utcDate(fromIso);
  const to = utcDate(toIso);

  const fromStr = from.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
  const toStr = to.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });

  return `${fromStr} – ${toStr}`;
}

// ─────────────────────────────────────────────
// Markdown renderer (no external CSS needed)
// ─────────────────────────────────────────────

const AIMessage = memo(function AIMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        strong: ({ children }: any) => <strong className="font-semibold text-foreground">{children}</strong>,
        ul: ({ children }: any) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }: any) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
        li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
        h3: ({ children }: any) => <h3 className="font-semibold text-sm mb-1 mt-3">{children}</h3>,
        h4: ({ children }: any) => <h4 className="font-semibold text-sm mb-1 mt-2">{children}</h4>,
        code: ({ children, className }: any) => {
          const isBlock = className?.includes("language-");
          return isBlock ? (
            <code className="block bg-muted rounded-md px-3 py-2 text-xs font-mono mt-1 mb-2 overflow-x-auto">
              {children}
            </code>
          ) : (
            <code className="bg-muted rounded px-1 py-0.5 text-xs font-mono">{children}</code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

// ─────────────────────────────────────────────
// Typing indicator
// ─────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 ring-2 ring-violet-400/40 ring-offset-2 ring-offset-background shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-5">
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-duration:0.9s] [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-duration:0.9s] [animation-delay:200ms]" />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-duration:0.9s] [animation-delay:400ms]" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function ReportChatbot({
  templateId,
  clientId,
  dateFrom,
  dateTo,
  onClose,
}: ReportChatbotProps) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { status, messages, streamingContent, actions: streamActions, followups, error, send, setMessages, clearActions, reset } = useAIStream();
  const [addingAction, setAddingAction] = useState<string | null>(null); // "msgId-idx"

  // When stream actions arrive, attach them to the last assistant message
  useEffect(() => {
    if (streamActions.length > 0) {
      setMessages((prev) => {
        const lastAssistant = [...prev].reverse().find((m) => m.role === "assistant");
        if (!lastAssistant || (lastAssistant.actions && (lastAssistant.actions as any[]).length > 0)) return prev;
        return prev.map((m) =>
          m.id === lastAssistant.id ? { ...m, actions: streamActions } : m
        );
      });
      clearActions();
    }
  }, [streamActions, setMessages, clearActions]);

  // ── Initialize session ──────────────────────
  const initSession = useCallback(async () => {
    setIsInitializing(true);
    setInitError(null);
    reset();
    try {
      const res = await chatApi.createSession({
        templateId,
        clientId,
        dateFrom: localDateStr(dateFrom),
        dateTo: localDateStr(dateTo),
      });
      if (res.success) {
        setSession(res.data);
        // Pre-populate messages if resuming an existing session
        if (res.data.resumed && res.data.messages.length > 0) {
          setMessages(res.data.messages);
        }
      } else {
        setInitError("Failed to start session");
      }
    } catch (err: any) {
      setInitError(err?.response?.data?.message || err?.message || "Failed to connect to AI");
    } finally {
      setIsInitializing(false);
    }
  }, [templateId, clientId, dateFrom, dateTo, reset]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // ── Auto-scroll to bottom ───────────────────
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingContent, isAtBottom]);

  // ── Auto-resize textarea ────────────────────
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // ── Send handler ────────────────────────────
  const handleRate = useCallback(async (messageId: string, rating: 1 | -1) => {
    try {
      await chatApi.rateMessage(messageId, rating);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, rating } : m))
      );
    } catch {
      toast.error("Failed to record feedback");
    }
  }, [setMessages]);

  const handleExport = useCallback(() => {
    if (!messages.length) return;
    const lines = messages.map((m) => {
      const time = new Date(m.createdAt).toLocaleString();
      const role = m.role === "user" ? "You" : "AI Analyst";
      return `[${time}] ${role}:\n${m.content}\n`;
    });
    const text = `Chat Export — ${session?.reportName || "Report"}\n${"=".repeat(50)}\n\n${lines.join("\n")}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages, session]);

  const handleSend = useCallback(async (directMessage?: string) => {
    const msg = (directMessage || input).trim();
    if (!session || !msg || status === "streaming") return;
    setInput("");
    setIsAtBottom(true);
    await send(session.sessionId, msg);
  }, [session, input, status, send]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Clear session mutation ──────────────────
  const clearMutation = useMutation({
    mutationFn: () => chatApi.clearSession(session!.sessionId),
    onSuccess: () => {
      toast.success("Conversation cleared");
      initSession();
    },
    onError: () => toast.error("Failed to clear conversation"),
  });

  // ── Scroll detection ────────────────────────
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setIsAtBottom(atBottom);
  };

  const isStreaming = status === "streaming";
  const isEmpty = messages.length === 0 && !isStreaming;

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-background border-l shadow-xl">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center ring-2 ring-violet-400/40 ring-offset-2 ring-offset-background shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">AI Analyst</p>
            <p className="text-xs text-muted-foreground">Ask about your report data</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleExport}
              title="Export conversation"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {session && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending || isStreaming}
              title="Delete conversation"
            >
              {clearMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Initializing */}
      {isInitializing && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading report data...</p>
        </div>
      )}

      {/* Init error */}
      {!isInitializing && initError && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <TriangleAlert className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-medium text-sm">Failed to load AI</p>
            <p className="text-xs text-muted-foreground mt-1">{initError}</p>
          </div>
          <Button size="sm" variant="outline" onClick={initSession}>
            Try again
          </Button>
        </div>
      )}

      {/* Chat area */}
      {!isInitializing && !initError && session && (
        <>
          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4"
            onScroll={handleScroll}
            ref={scrollAreaRef}
          >
            {/* Report meta */}
            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="flex items-center gap-1.5 bg-muted/60 rounded-full px-3 py-1.5 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span className="font-medium">{session.reportName}</span>
                <span>·</span>
                <span>{formatDateRange(session.dateFrom, session.dateTo)}</span>
                <span>·</span>
                <span>{session.metricCount} metrics</span>
              </div>
              {session.resumed && messages.length > 0 && (
                <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                  <History className="h-2.5 w-2.5" />
                  Resumed previous conversation
                </div>
              )}
            </div>

            {/* Suggestions — shown whenever there are no messages yet */}
            {isEmpty && session.suggestions.length > 0 && (
              <div className="space-y-3 mb-6">
                <p className="text-xs text-muted-foreground font-medium px-1">Suggested questions</p>
                <div className="grid gap-2">
                  {session.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(s);
                        inputRef.current?.focus();
                      }}
                      className="text-left text-sm px-3 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/40 transition-colors text-foreground/80 leading-snug"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages list */}
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onRate={handleRate}
                onAddToCalendar={async (msgId, idx, action) => {
                  const key = `${msgId}-${idx}`;
                  setAddingAction(key);
                  try {
                    const targetDate = getNextDate(action.dayOfWeek);
                    await calendarApi.createEntryFromChat({
                      clientId: clientId || session?.clientId || 0,
                      date: targetDate,
                      platform: action.platform,
                      contentType: action.contentType || "Post",
                      postIdea: action.postIdea,
                      caption: action.caption,
                      hashtags: action.hashtags,
                      bestPostTime: action.bestPostTime,
                      dataInsight: action.dataInsight,
                    });
                    await chatApi.markActionApplied(msgId, idx).catch(() => {});
                    setMessages((prev) =>
                      prev.map((m) => {
                        if (m.id === msgId && m.actions) {
                          const updated = [...(m.actions as any[])];
                          updated[idx] = { ...updated[idx], applied: true };
                          return { ...m, actions: updated };
                        }
                        return m;
                      })
                    );
                    toast.success("Added to calendar!");
                  } catch {
                    toast.error("Failed to add to calendar");
                  } finally {
                    setAddingAction(null);
                  }
                }}
                addingAction={addingAction}
              />
            ))}

            {/* Live streaming message */}
            {isStreaming && streamingContent && (
              <div className="flex items-end gap-2 mb-4 animate-in fade-in-0 duration-150">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 ring-2 ring-violet-400/40 ring-offset-2 ring-offset-background shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] text-sm text-foreground/90 transition-all duration-100 ease-out">
                  <AIMessage content={streamingContent} />
                </div>
              </div>
            )}

            {/* Typing indicator (before first chunk arrives) */}
            {isStreaming && !streamingContent && <TypingIndicator />}

            {/* Stream error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-4">
                <TriangleAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Follow-up question suggestions */}
            {followups.length > 0 && !isStreaming && (
              <div className="flex flex-wrap gap-2 mb-4">
                {followups.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-muted hover:bg-muted/80 rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {!isAtBottom && (
            <div className="absolute bottom-24 right-6">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full shadow-md"
                onClick={() => {
                  setIsAtBottom(true);
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Input bar */}
          <div className="shrink-0 border-t bg-card px-4 py-3">
            <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary/60 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about this report..."
                rows={1}
                disabled={isStreaming}
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50 py-0.5 max-h-[120px] leading-relaxed"
              />
              <Button
                size="icon"
                className="h-7 w-7 shrink-0 rounded-lg"
                onClick={() => handleSend()}
                disabled={!input.trim() || isStreaming}
              >
                {isStreaming ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-1.5 px-1">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Message bubble
// ─────────────────────────────────────────────

function MessageBubble({
  message,
  onRate,
  onAddToCalendar,
  addingAction,
}: {
  message: ChatMessage;
  onRate?: (messageId: string, rating: 1 | -1) => void;
  onAddToCalendar?: (messageId: string, actionIndex: number, action: any) => void;
  addingAction?: string | null;
}) {
  const isUser = message.role === "user";
  const actions = (!isUser && message.actions) ? (message.actions as any[]) : [];

  return (
    <div className={cn("flex items-end gap-2 mb-4", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 ring-2 ring-violet-400/40 ring-offset-2 ring-offset-background shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      <div className="max-w-[85%] space-y-2">
        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground/90 rounded-bl-sm"
          )}
        >
          {isUser ? (
            <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <AIMessage content={message.content} />
          )}

          <div className={cn("flex items-center gap-2 mt-1", isUser ? "justify-end" : "justify-between")}>
            <p className={cn("text-[10px]", isUser ? "text-primary-foreground/60" : "text-muted-foreground/60")}>
              {new Date(message.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </p>
            {!isUser && onRate && (
              <div className="flex gap-0.5">
                <button
                  onClick={() => onRate(message.id, 1)}
                  className={cn("p-0.5 rounded hover:bg-background/50 transition-colors", message.rating === 1 ? "text-green-600" : "text-muted-foreground/40 hover:text-green-600")}
                >
                  <svg className="h-3 w-3" fill={message.rating === 1 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" /></svg>
                </button>
                <button
                  onClick={() => onRate(message.id, -1)}
                  className={cn("p-0.5 rounded hover:bg-background/50 transition-colors", message.rating === -1 ? "text-red-500" : "text-muted-foreground/40 hover:text-red-500")}
                >
                  <svg className="h-3 w-3" fill={message.rating === -1 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Inline action cards for this message */}
        {actions.length > 0 && (
          <div className="space-y-1.5 pl-1">
            <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
              <CalendarPlus className="h-3 w-3" />
              Suggested Actions
            </p>
            {actions.map((action: any, idx: number) => {
              const actionKey = `${message.id}-${idx}`;
              return (
                <div key={idx} className="rounded-lg border border-violet-200 bg-violet-50/50 p-2.5 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{action.platform}</Badge>
                        {action.contentType && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{action.contentType}</Badge>}
                        {action.bestPostTime && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />{action.bestPostTime}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium">{action.postIdea}</p>
                      {action.dataInsight && (
                        <p className="text-[10px] text-violet-600">
                          <Sparkles className="h-2.5 w-2.5 inline mr-0.5" />
                          {action.dataInsight}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {action.applied ? (
                        <Badge variant="outline" className="gap-0.5 text-[10px] text-green-600 border-green-200 py-0 px-1.5">
                          <Check className="h-2.5 w-2.5" />
                          Added
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1 h-7 text-xs px-2"
                          disabled={addingAction === actionKey}
                          onClick={() => onAddToCalendar?.(message.id, idx, action)}
                        >
                          {addingAction === actionKey ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CalendarPlus className="h-3 w-3" />
                          )}
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
