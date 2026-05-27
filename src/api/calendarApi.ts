import { api } from "@/apiConfig";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface CalendarEntry {
  id: string;
  calendarId: string;
  date: string;
  dayOfWeek: string;
  platform: string;
  contentType: string;
  postIdea: string;
  caption: string | null;
  hashtags: string[] | null;
  bestPostTime: string | null;
  dataInsight: string | null;
  imageUrl: string | null;
  source: "generated" | "chat" | "manual";
  status: "DRAFT" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface Calendar {
  id: string;
  userId: number;
  clientId: number;
  month: number;
  year: number;
  platforms: string[] | null;
  goals: string | null;
  postsPerWeek: number;
  status: "GENERATING" | "COMPLETED" | "FAILED";
  progress: number;
  generatedAt: string | null;
  createdAt: string;
  entries: CalendarEntry[];
}

export interface CalendarSummary {
  calendarId: string;
  month: number;
  year: number;
  status: string;
  progress: number;
  platforms: string[] | null;
  entryCount: number;
  generatedAt: string | null;
  createdAt: string;
}

export interface GeneratePayload {
  clientId: number;
  month: number;
  year: number;
  platforms: string[];
  goals?: string;
  postsPerWeek?: number;
}

export interface CreateEntryFromChatPayload {
  clientId: number;
  calendarId?: string;
  date: string;
  dayOfWeek?: string;
  platform: string;
  contentType?: string;
  postIdea: string;
  caption?: string;
  hashtags?: string[];
  bestPostTime?: string;
  dataInsight?: string;
}

// ─────────────────────────────────────────────
// API calls
// ─────────────────────────────────────────────

export const calendarApi = {
  generate: (payload: GeneratePayload) =>
    api.post<{ success: boolean; data: { calendarId: string; status: string; message: string } }>(
      "/ai/calendar/generate",
      payload
    ),

  get: (calendarId: string) =>
    api.get<{ success: boolean; data: Calendar }>(`/ai/calendar/${calendarId}`),

  list: (clientId: number, page = 1, limit = 10) =>
    api.get<{ success: boolean; data: CalendarSummary[] }>(
      `/ai/calendar/client/${clientId}?page=${page}&limit=${limit}`
    ),

  updateEntry: (entryId: string, data: Partial<CalendarEntry>) =>
    api.put<{ success: boolean; data: CalendarEntry }>(
      `/ai/calendar/entry/${entryId}`,
      data
    ),

  delete: (calendarId: string) =>
    api.delete<{ success: boolean; message: string }>(`/ai/calendar/${calendarId}`),

  createEntryFromChat: (payload: CreateEntryFromChatPayload) =>
    api.post<{ success: boolean; data: CalendarEntry; message: string }>(
      "/ai/calendar/entry/from-chat",
      payload
    ),
};
