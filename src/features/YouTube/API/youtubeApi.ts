import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type YouTubeConnectResponse = {
  success: boolean;
  url: string;
};

export type YouTubeCallbackParams = {
  code: string;
  state: string;
};

export type YouTubeChannel = {
  channelId: string;
  title: string;
  handle: string;
};

export type YouTubeCallbackResponse = {
  success: boolean;
  channel: YouTubeChannel;
};

export type YouTubeChannelResponse = {
  success: boolean;
  channel: YouTubeChannel;
};

export type YouTubeSyncResponse = {
  success: boolean;
  message?: string;
};

export type YouTubeVideo = {
  videoId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  publishedAt: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
};

export type YouTubeVideosParams = {
  page?: number;
  pageSize?: number;
  q?: string;
};

export type YouTubeVideosResponse = {
  success: boolean;
  items: YouTubeVideo[];
  total?: number;
  page?: number;
  pageSize?: number;
};

export type YouTubeAnalyticsDataPoint = {
  date: string;
  views?: number;
  likes?: number;
  comments?: number;
  subscribers?: number;
  [key: string]: string | number | undefined;
};

export type YouTubeAnalyticsSummaryParams = {
  from: string;
  to: string;
};

export type YouTubeAnalyticsSummaryResponse = {
  success: boolean;
  series: YouTubeAnalyticsDataPoint[];
};

export type YouTubeVideoAnalyticsParams = {
  videoId: string;
  from?: string;
  to?: string;
};

export type YouTubeVideoAnalyticsResponse = {
  success: boolean;
  series: YouTubeAnalyticsDataPoint[];
};

export type ApiErrorResponse = {
  message?: string;
  error?: string;
};

// ==================== API FUNCTIONS ====================

/**
 * STEP 1: Initiate YouTube OAuth connection
 * GET /youtube/connect
 */
export const connectYouTube = async (): Promise<YouTubeConnectResponse> => {
  try {
    const response = await api.get<YouTubeConnectResponse>("/youtube/connect",{
      baseURL:import.meta.env.VITE_NGROK_URL,
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to initiate YouTube connection"
    );
  }
};

/**
 * STEP 2: Handle OAuth callback
 * GET /youtube/callback?code=xxx&state=xxx
 */
export const handleYouTubeCallback = async (
  params: YouTubeCallbackParams
): Promise<YouTubeCallbackResponse> => {
  try {
    const response = await api.get<YouTubeCallbackResponse>(
      "/youtube/callback",
      {
        params: {
          code: params.code,
          state: params.state,
        },
      }
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to complete YouTube connection"
    );
  }
};

/**
 * STEP 3: Get YouTube channel information
 * GET /youtube/channel
 */
export const getYouTubeChannel = async (): Promise<YouTubeChannelResponse> => {
  try {
    const response = await api.get<YouTubeChannelResponse>("/youtube/channel");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to fetch YouTube channel"
    );
  }
};

/**
 * STEP 4: Manual sync for YouTube data
 * POST /youtube/sync
 */
export const syncYouTube = async (): Promise<YouTubeSyncResponse> => {
  try {
    const response = await api.post<YouTubeSyncResponse>("/youtube/sync");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to sync YouTube data"
    );
  }
};

/**
 * STEP 5: Get paginated videos list
 * GET /youtube/videos?page=1&pageSize=20&q=searchText
 */
export const getYouTubeVideos = async (
  params?: YouTubeVideosParams
): Promise<YouTubeVideosResponse> => {
  try {
    const response = await api.get<YouTubeVideosResponse>("/youtube/videos", {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 20,
        q: params?.q || "",
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to fetch YouTube videos"
    );
  }
};

/**
 * STEP 6: Get analytics summary
 * GET /youtube/analytics/summary?from=2024-01-01&to=2024-02-20
 */
export const getYouTubeAnalyticsSummary = async (
  params: YouTubeAnalyticsSummaryParams
): Promise<YouTubeAnalyticsSummaryResponse> => {
  try {
    const response = await api.get<YouTubeAnalyticsSummaryResponse>(
      "/youtube/analytics/summary",
      {
        params: {
          from: params.from,
          to: params.to,
        },
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to fetch YouTube analytics summary"
    );
  }
};

/**
 * STEP 7: Get per-video analytics
 * GET /youtube/analytics/video?videoId=xxx&from=...&to=...
 */
export const getYouTubeVideoAnalytics = async (
  params: YouTubeVideoAnalyticsParams
): Promise<YouTubeVideoAnalyticsResponse> => {
  try {
    const response = await api.get<YouTubeVideoAnalyticsResponse>(
      "/youtube/analytics/video",
      {
        params: {
          videoId: params.videoId,
          from: params.from,
          to: params.to,
        },
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to fetch video analytics"
    );
  }
};

