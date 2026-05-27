import api from "@/apiConfig";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ChatSession {
  sessionId: string;
  templateId: number | null;
  clientId: number | null;
  dateFrom: string;
  dateTo: string;
  reportName: string;
  metricCount: number;
  suggestions: string[];
  messages: ChatMessage[];   // populated on resume, empty on new session
  resumed: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: any[];
  rating?: number | null;
  createdAt: string;
}

export interface CreateSessionPayload {
  templateId: number;
  clientId?: number | null;
  dateFrom: string;
  dateTo: string;
}

export interface SSEChunkEvent {
  type: "chunk";
  content: string;
}

export interface SSEDoneEvent {
  type: "done";
  fullResponse: string;
  messageId: string;
}

export interface SSEErrorEvent {
  type: "error";
  message: string;
}

export type SSEEvent = SSEChunkEvent | SSEDoneEvent | SSEErrorEvent;

// ─────────────────────────────────────────────
// API methods
// ─────────────────────────────────────────────

export const chatApi = {
  /**
   * Create a new chat session for a report.
   * Returns sessionId + AI-generated question suggestions.
   */
  createSession: async (payload: CreateSessionPayload): Promise<{ success: boolean; data: ChatSession }> => {
    const res = await api.post("/ai/chat/session", payload);
    return res.data;
  },

  /**
   * Fetch chat history for an existing session.
   */
  getHistory: async (sessionId: string): Promise<{ success: boolean; data: { session: any; messages: ChatMessage[] } }> => {
    const res = await api.get(`/ai/chat/session/${sessionId}/messages`);
    return res.data;
  },

  /**
   * List all sessions for the current user (optionally filtered by templateId).
   */
  listSessions: async (templateId?: number): Promise<{ success: boolean; data: any }> => {
    const res = await api.get("/ai/chat/sessions", {
      params: templateId ? { templateId } : {},
    });
    return res.data;
  },

  /**
   * Close and delete a session.
   */
  clearSession: async (sessionId: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/ai/chat/session/${sessionId}`);
    return res.data;
  },

  /**
   * Send a message and stream the AI response via SSE.
   *
   * Uses fetch directly (not axios) because axios doesn't support streaming.
   * Returns a ReadableStream reader. Caller uses parseSSEStream() to consume it.
   */
  sendMessage: async (
    sessionId: string,
    message: string,
    token: string
  ): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

    const response = await fetch(`${baseUrl}/ai/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId, message }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(err.message || `HTTP ${response.status}`);
    }

    if (!response.body) throw new Error("No response body");
    return response.body.getReader();
  },

  markActionApplied: async (messageId: string, actionIndex: number) => {
    const res = await api.put(`/ai/chat/message/${messageId}/action/${actionIndex}/apply`);
    return res.data;
  },

  rateMessage: async (messageId: string, rating: 1 | -1) => {
    const res = await api.put(`/ai/chat/message/${messageId}/feedback`, { rating });
    return res.data;
  },

  generateSummary: async (payload: { templateId: number; clientId?: number | null; dateFrom: string; dateTo: string }) => {
    const res = await api.post("/ai/chat/summary", payload);
    return res.data as { success: boolean; data: { summary: string } };
  },
};

/**
 * Parse a raw SSE chunk string into typed events.
 * Handles partial / multi-event buffers correctly.
 */
export function parseSSEBuffer(buffer: string): { events: SSEEvent[]; remainder: string } {
  const events: SSEEvent[] = [];
  const lines = buffer.split("\n");
  let remainder = "";

  // The last element may be an incomplete line — hold it back
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("data: ")) continue;
    try {
      const payload = JSON.parse(line.slice(6));
      events.push(payload as SSEEvent);
    } catch {
      // ignore malformed line
    }
  }

  // The last item may be partial — keep it for next iteration
  remainder = lines[lines.length - 1];

  return { events, remainder };
}
