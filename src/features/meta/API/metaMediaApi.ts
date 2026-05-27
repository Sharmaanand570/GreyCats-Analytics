import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type MetaMediaUpload = {
  url: string;
  hash?: string;
  width?: number;
  height?: number;
  duration?: number;
  size_bytes: number;
  mime_type: string;
};

export type MetaMediaImage = {
  hash: string;
  url: string;
  thumbnail_url?: string;
  width: number;
  height: number;
  created_time: string;
  name?: string;
};

export type MetaMediaVideo = {
  video_id: string;
  source?: string;
  thumbnail_url?: string;
  duration?: number;
  created_time: string;
  name?: string;
  status?: "uploading" | "encoding" | "ready" | "error";
};

type ApiErrorResponse = { message?: string; error?: string };

const wrapErr = (e: unknown, fallback: string): Error => {
  const ax = e as AxiosError<ApiErrorResponse>;
  return new Error(
    ax.response?.data?.message || ax.response?.data?.error || fallback
  );
};

// ==================== API ====================

// Multipart upload to Meta's ad-account bucket. Backend handles the two-step
// advideos flow for videos (creation → polling → AdCreative reference).
export const uploadAdMedia = async (
  clientId: number,
  accountId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<MetaMediaUpload> => {
  const form = new FormData();
  form.append("file", file);
  try {
    const res = await api.post<{ success: boolean; data: MetaMediaUpload }>(
      `/meta-campaign-wizard/accounts/${accountId}/upload`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        // clientId travels as a query param so backend can authorize against
        // the right client context without us shoving it into the multipart body.
        params: { clientId },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      }
    );
    return res.data.data;
  } catch (e) {
    throw wrapErr(e, "Upload failed");
  }
};

// Backend pulls from an existing CDN URL instead of a local file upload.
export const uploadAdMediaFromUrl = async (
  clientId: number,
  accountId: string,
  url: string
): Promise<MetaMediaUpload> => {
  try {
    const res = await api.post<{ success: boolean; data: MetaMediaUpload }>(
      `/meta-campaign-wizard/accounts/${accountId}/upload`,
      { url },
      { params: { clientId } }
    );
    return res.data.data;
  } catch (e) {
    throw wrapErr(e, "Failed to fetch media from URL");
  }
};

export const listAdImages = async (
  clientId: number,
  accountId: string
): Promise<MetaMediaImage[]> => {
  try {
    const res = await api.get<{ success: boolean; data: MetaMediaImage[] }>(
      `/meta-campaign-wizard/accounts/${accountId}/images`,
      { params: { clientId } }
    );
    return res.data.data ?? [];
  } catch (e) {
    throw wrapErr(e, "Failed to list ad images");
  }
};

export const listAdVideos = async (
  clientId: number,
  accountId: string
): Promise<MetaMediaVideo[]> => {
  try {
    const res = await api.get<{ success: boolean; data: MetaMediaVideo[] }>(
      `/meta-campaign-wizard/accounts/${accountId}/videos`,
      { params: { clientId } }
    );
    return res.data.data ?? [];
  } catch (e) {
    throw wrapErr(e, "Failed to list ad videos");
  }
};
