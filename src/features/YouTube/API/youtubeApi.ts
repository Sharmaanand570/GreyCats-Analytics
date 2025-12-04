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

export type YouTubeReconnectResponse = {
  success: boolean;
  message?: string;
  url: string;
};

export type YouTubeDisconnectResponse = {
  success: boolean;
  message: string;
};

export type YouTubeThumbnail = {
  url: string;
  width: number;
  height: number;
};

export type YouTubeChannelResponse = {
  success: boolean;
  channel: {
    kind: string;
    etag: string;
    id: string;
    title?: string;
    customUrl?: string;
    description?: string;
    publishedAt?: string;
    snippet?: {
      title: string;
      description: string;
      customUrl?: string;
      publishedAt: string;
      thumbnails: {
        default?: YouTubeThumbnail;
        medium?: YouTubeThumbnail;
        high?: YouTubeThumbnail;
      };
      localized?: {
        title: string;
        description: string;
      };
    };
    contentDetails?: {
      relatedPlaylists?: Record<string, string>;
    };
    statistics?: {
      viewCount?: string;
      subscriberCount?: string;
      hiddenSubscriberCount?: boolean;
      videoCount?: string;
    };
  };
};

export type YouTubeCallbackResponse = YouTubeChannelResponse;

export type YouTubeSyncResponse = {
  success: boolean;
  message?: string;
};

export type YouTubeVideosParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type YouTubeVideoThumbnails = {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  [key: string]: YouTubeThumbnail | undefined;
};

export type YouTubeVideoItem = {
  videoId: string;
  title: string;
  description?: string;
  thumbnails?: YouTubeVideoThumbnails;
  publishedAt: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  durationISO?: string;
};

export type YouTubeVideosResponse = {
  success: boolean;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  items: YouTubeVideoItem[];
};

export type YouTubeAnalyticsDataPoint = {
  date: string;
  views?: number;
  likes?: number;
  comments?: number;
  subscribers?: number;
  [key: string]: string | number | undefined;
};

export type YouTubeAnalyticsParams = {
  from: string;
  to: string;
};

export type YouTubeAnalyticsResponse = {
  success: boolean;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  series: YouTubeAnalyticsDataPoint[];
};

export type YouTubePerVideoAnalyticsParams = {
  videoId: string;
  from: string;
  to: string;
};

export type YouTubePerVideoAnalyticsResponse = {
  success: boolean;
  videoId: string;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
        search: params?.search || "",
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
 * GET /youtube/analytics?from=2024-01-01&to=2024-02-20
 */
export const getYouTubeAnalytics = async (
  params: YouTubeAnalyticsParams
): Promise<YouTubeAnalyticsResponse> => {
  try {
    const response = await api.get<YouTubeAnalyticsResponse>(
      "/youtube/analytics",
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
 * GET /youtube/analytics/per-video?videoId=xxx&from=...&to=...
 */
export const getYouTubePerVideoAnalytics = async (
  params: YouTubePerVideoAnalyticsParams
): Promise<YouTubePerVideoAnalyticsResponse> => {
  try {
    const response = await api.get<YouTubePerVideoAnalyticsResponse>(
      "/youtube/analytics/per-video",
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

/**
 * STEP 8: Generate reconnect URL
 * GET /youtube/reconnect
 */
export const reconnectYouTube = async (): Promise<YouTubeReconnectResponse> => {
  try {
    const response = await api.get<YouTubeReconnectResponse>(
      "/youtube/reconnect"
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to generate YouTube reconnect URL"
    );
  }
};

/**
 * STEP 9: Disconnect YouTube integration
 * POST /youtube/disconnect
 */
export const disconnectYouTube = async (): Promise<YouTubeDisconnectResponse> => {
  try {
    const response = await api.post<YouTubeDisconnectResponse>(
      "/youtube/disconnect"
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to disconnect YouTube"
    );
  }
};

