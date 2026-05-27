import { api } from "@/apiConfig";

/** Max time to wait for background image generation (ms) */
export const IMAGE_GEN_TIMEOUT_MS = 120_000;
/** Polling interval for checking image generation status (ms) */
export const IMAGE_GEN_POLL_MS = 5_000;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface CaptionItem {
  id: string;
  text: string;
  hashtags: string[];
  characterCount: number;
  tone: string;
}

export interface CreativeAsset {
  id: string;
  userId: number;
  clientId: number;
  type: "caption" | "image";
  platform: string | null;
  goal: string | null;
  topic: string | null;
  captions: CaptionItem[] | null;
  imageUrl: string | null;
  promptUsed: string | null;
  aspectRatio: string | null;
  style: string | null;
  dataInsight: string | null;
  createdAt: string;
}

export interface GenerateCaptionsPayload {
  clientId: number;
  platform: string;
  goal?: string;
  topic: string;
  includeHashtags?: boolean;
  tone?: string;
  count?: number;
}

export interface GenerateImagePayload {
  clientId: number;
  intent: string;
  platform?: string;
  aspectRatio?: string;
  style?: string;
  mode?: "sync" | "async";
}

// ─────────────────────────────────────────────
// API calls
// ─────────────────────────────────────────────

export const creativeApi = {
  generateCaptions: (payload: GenerateCaptionsPayload) =>
    api.post<{
      success: boolean;
      data: { captions: CaptionItem[]; assetId: string };
    }>("/ai/creative/caption", payload),

  generateContent: (payload: { clientId: number; contentType: string; topic: string; platform?: string; context?: string }) =>
    api.post<{
      success: boolean;
      data: { content: string; contentType: string; wordCount: number };
    }>("/ai/creative/content", payload, { timeout: 60_000 }),

  generateImage: (payload: GenerateImagePayload) =>
    api.post<{
      success: boolean;
      data: {
        assetId: string;
        imageUrl: string | null;
        promptUsed: string;
        aspectRatio: string;
        generatedAt: string;
        note?: string;
      };
    }>("/ai/creative/image", payload, { timeout: 120_000 }),

  getAssets: (clientId: number, type?: string, page = 1, limit = 20) =>
    api.get<{
      success: boolean;
      data: { assets: CreativeAsset[]; total: number; page: number; limit: number };
    }>(`/ai/creative/assets/${clientId}?type=${type || ""}&page=${page}&limit=${limit}`),

  deleteAsset: (assetId: string) =>
    api.delete<{ success: boolean; message: string }>(`/ai/creative/asset/${assetId}`),
};
