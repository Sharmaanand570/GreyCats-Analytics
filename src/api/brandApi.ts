import { api } from "@/apiConfig";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type BrandVoice =
  | "PROFESSIONAL"
  | "QUIRKY"
  | "MINIMALIST"
  | "BOLD"
  | "FRIENDLY"
  | "LUXURY";

export interface BrandProfile {
  id: string;
  userId: number;
  clientId: number;
  websiteUrl: string | null;
  brandName: string;
  tagline: string | null;
  industry: string | null;
  brandVoice: BrandVoice;
  targetAudience: string | null;
  valueProposition: string | null;
  missionStatement: string | null;
  brandStory: string | null;
  colorPalette: string[] | null;
  competitors: string[] | null;
  keyProducts: string[] | null;
  socialHandles: Record<string, string> | null;
  doList: string[] | null;
  dontList: string[] | null;
  additionalContext: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  knowledgeBase?: BrandKnowledge[];
}

export interface BrandKnowledge {
  id: string;
  brandProfileId: string;
  type: "guideline" | "successful_content" | "reference";
  label: string | null;
  fileName: string;
  fileUrl: string;
  mimeType: string | null;
  fileSize: number | null;
  createdAt: string;
}

export interface UpsertBrandProfilePayload {
  clientId: number;
  websiteUrl?: string;
  brandName: string;
  tagline?: string;
  industry?: string;
  brandVoice?: BrandVoice;
  targetAudience?: string;
  valueProposition?: string;
  missionStatement?: string;
  brandStory?: string;
  colorPalette?: string[];
  competitors?: string[];
  keyProducts?: string[];
  socialHandles?: Record<string, string>;
  doList?: string[];
  dontList?: string[];
  additionalContext?: string;
  logoUrl?: string;
}

// ─────────────────────────────────────────────
// API calls
// ─────────────────────────────────────────────

export const brandApi = {
  scrapeWebsite: (url: string) =>
    api.post<{ success: boolean; data: Record<string, any>; message: string }>(
      "/ai/brand/scrape",
      { url },
      { timeout: 30_000 }
    ),

  getProfile: (clientId: number) =>
    api.get<{ success: boolean; data: BrandProfile | null }>(
      `/ai/brand/profile/${clientId}`
    ),

  upsertProfile: (payload: UpsertBrandProfilePayload) =>
    api.post<{ success: boolean; data: BrandProfile; message: string }>(
      "/ai/brand/profile",
      payload
    ),

  listKnowledge: (clientId: number) =>
    api.get<{ success: boolean; data: BrandKnowledge[] }>(
      `/ai/brand/knowledge/${clientId}`
    ),

  uploadKnowledge: (form: FormData) =>
    api.post<{ success: boolean; data: BrandKnowledge; message: string }>(
      "/ai/brand/knowledge",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    ),

  deleteKnowledge: (knowledgeId: string) =>
    api.delete<{ success: boolean; message: string }>(
      `/ai/brand/knowledge/${knowledgeId}`
    ),
};
