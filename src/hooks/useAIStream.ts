import { useState, useCallback, useRef } from "react";
import { chatApi, parseSSEBuffer, type ChatMessage } from "@/api/chatApi";
import { getAuthToken, StorageKey } from "@/utils/storage";

export type StreamStatus = "idle" | "streaming" | "done" | "error";

export interface ActionItem {
  platform: string;
  contentType: string;
  postIdea: string;
  caption?: string;
  hashtags?: string[];
  bestPostTime?: string;
  dayOfWeek?: string;
  dataInsight?: string;
}

interface UseAIStreamReturn {
  status: StreamStatus;
  messages: ChatMessage[];
  streamingContent: string;
  actions: ActionItem[];
  followups: string[];
  error: string | null;
  send: (sessionId: string, message: string) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  clearActions: () => void;
  reset: () => void;
}

export function useAIStream(): UseAIStreamReturn {
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [followups, setFollowups] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track abort — avoids stale closure issues
  const abortRef = useRef(false);
  // Buffer streaming content in a ref, flush to state via rAF for smooth rendering
  const streamBufferRef = useRef("");
  const rafRef = useRef<number | null>(null);

  const clearActions = useCallback(() => setActions([]), []);

  const reset = useCallback(() => {
    setStatus("idle");
    setMessages([]);
    setStreamingContent("");
    setActions([]);
    setFollowups([]);
    setError(null);
  }, []);

  const send = useCallback(async (sessionId: string, userMessage: string) => {
    const token = getAuthToken(StorageKey.ANALYTICS_TOKEN);
    if (!token) {
      setError("Not authenticated");
      return;
    }

    // Optimistically add user message
    const userMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setStreamingContent("");
    setActions([]);
    setFollowups([]);
    setStatus("streaming");
    setError(null);
    abortRef.current = false;

    let buffer = "";
    let fullResponse = "";

    try {
      const reader = await chatApi.sendMessage(sessionId, userMessage, token);
      const decoder = new TextDecoder();

      while (true) {
        if (abortRef.current) break;

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const { events, remainder } = parseSSEBuffer(buffer);
        buffer = remainder;

        for (const event of events) {
          if (abortRef.current) break;

          if (event.type === "chunk") {
            fullResponse += event.content;
            // Buffer content and flush once per animation frame for smooth rendering
            streamBufferRef.current = fullResponse.replace(/<!-- ACTIONS -->[\s\S]*$/g, "").trim();
            if (!rafRef.current) {
              rafRef.current = requestAnimationFrame(() => {
                setStreamingContent(streamBufferRef.current);
                rafRef.current = null;
              });
            }
          } else if (event.type === "done") {
            // Cancel any pending rAF
            if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
            fullResponse = event.fullResponse;
            // Strip action block from final content
            const clean = fullResponse.replace(/<!-- ACTIONS -->[\s\S]*?<!-- \/ACTIONS -->/g, "").trim();
            const assistantMsg: ChatMessage = {
              id: event.messageId,
              role: "assistant",
              content: clean,
              createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
            setStreamingContent("");
            setStatus("done");
            fullResponse = ""; // Clear so the fallback below doesn't add it again
            // Don't return — continue loop to catch "actions" event that may follow
          } else if (event.type === "actions") {
            setActions(event.items || []);
          } else if (event.type === "followups") {
            setFollowups(event.items || []);
          } else if (event.type === "error") {
            throw new Error(event.message);
          }
        }
      }

      // If there is any remaining buffer, process it now
      if (buffer.trim() && !abortRef.current) {
        const { events } = parseSSEBuffer(buffer + "\n");
        for (const event of events) {
          if (event.type === "done") {
            if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
            fullResponse = event.fullResponse;
            const clean = fullResponse.replace(/<!-- ACTIONS -->[\s\S]*?<!-- \/ACTIONS -->/g, "").trim();
            const assistantMsg: ChatMessage = {
              id: event.messageId,
              role: "assistant",
              content: clean,
              createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
            setStreamingContent("");
            setStatus("done");
            fullResponse = "";
          } else if (event.type === "actions") {
            setActions(event.items || []);
          } else if (event.type === "followups") {
            setFollowups(event.items || []);
          }
        }
      }

      // If loop ends without a "done" event (rare edge case), finalize
      if (fullResponse && !abortRef.current) {
        const assistantMsg: ChatMessage = {
          id: `local-${Date.now()}`,
          role: "assistant",
          content: fullResponse,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setStreamingContent("");
        setStatus("done");
      }
    } catch (err: any) {
      setError(err.message || "Failed to get AI response");
      setStreamingContent("");
      setStatus("error");
    }
  }, []);

  return { status, messages, streamingContent, actions, followups, error, send, setMessages, clearActions, reset };
}
