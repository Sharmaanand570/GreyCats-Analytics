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
    channelId: string;
    channelTitle: string;
    channelHandle?: string;
    videoCount: number;
    totalViews: number;
    totalSubscribers: number;
    connectedAt?: string;
    // Legacy support (optional)
    kind?: string;
    etag?: string;
    id?: string;
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

export type YouTubeSummaryResponse = {
  success: boolean;
  message?: string;
  channelTitle?: string;
  channelId?: string;
  summary: {
    totalViews: number;
    totalSubscribers: number;
    totalWatchTime: number;
    totalLikes: number;
    averageViewsPerDay: number;
  };
};

export type YouTubeVideoItem = {
  id: string;
  // Support both id structure and top videos structure
  videoId?: string;
  title: string;
  description?: string;
  publishedAt: string;
  thumbnails: {
    default?: YouTubeThumbnail;
    medium?: YouTubeThumbnail;
    high?: YouTubeThumbnail;
    [key: string]: YouTubeThumbnail | undefined;
  };
  privacyStatus?: string;
  duration?: string;
  // Metrics for Top Videos
  views?: number;
  likes?: number;
  comments?: number;
  watchTime?: number;
  // Legacy support
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  durationISO?: string;
};

export type YouTubeVideosListResponse = {
  success: boolean;
  videos: YouTubeVideoItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
};

export type YouTubeTrendItem = {
  date: string;
  views: number;
  subscribersGained: number;
  watchTimeSec: number;
  likes: number;
  comments: number;
};

export type YouTubeTrendsResponse = {
  success: boolean;
  message?: string;
  trends: YouTubeTrendItem[];
};

export type YouTubeVideoAnalyticsResponse = {
  success: boolean;
  video: {
    id: string;
    title: string;
    publishedAt: string;
    thumbnails: {
      default?: YouTubeThumbnail;
      high?: YouTubeThumbnail;
    };
  };
  analytics: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalWatchTime: number;
    dailyMetrics: Array<{
      date: string;
      views: number;
      likes: number;
      comments: number;
      watchTimeSec: number;
    }>;
  };
};

export type YouTubeTopVideosResponse = {
  success: boolean;
  metric: string;
  period: string;
  topVideos: YouTubeVideoItem[];
};

export type YouTubeSubscribersGrowthResponse = {
  success: boolean;
  totalGained: number;
  growth: Array<{
    date: string;
    subscribersGained: number;
  }>;
};

export type YouTubeWatchTimeResponse = {
  success: boolean;
  totalWatchTimeHours: string;
  averageWatchTimePerDay: string;
  dailyWatchTime: Array<{
    date: string;
    watchTimeSec: number;
    watchTimeHours: string;
  }>;
};

export type YouTubeEngagementResponse = {
  success: boolean;
  engagement: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    engagementRate: string;
    likesPerView: string;
    commentsPerView: string;
  };
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
    const response = await api.get<YouTubeConnectResponse>("/youtube/connect");
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
    const response = await api.get<YouTubeCallbackResponse>("/youtube/callback", {
      params: {
        code: params.code,
        state: params.state,
      },
    });

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
 * 1. Summary
 * GET /api/clients/:clientId/youtube/summary
 */
export const getYouTubeSummary = async (
  clientId: number
): Promise<YouTubeSummaryResponse> => {
  try {
    const response = await api.get<YouTubeSummaryResponse>(
      `/clients/${clientId}/youtube/summary`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch YouTube summary"
    );
  }
};

/**
 * 2. Videos List
 * GET /api/clients/:clientId/youtube/videos/list
 */
export const getYouTubeVideosList = async (
  clientId: number,
  params?: { page?: number; limit?: number }
): Promise<YouTubeVideosListResponse> => {
  try {
    const response = await api.get<YouTubeVideosListResponse>(
      `/clients/${clientId}/youtube/videos/list`,
      {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 25,
        },
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch YouTube videos list"
    );
  }
};

/**
 * 3. Trends
 * GET /api/clients/:clientId/youtube/trends
 */
export const getYouTubeTrends = async (
  clientId: number
): Promise<YouTubeTrendsResponse> => {
  try {
    const response = await api.get<YouTubeTrendsResponse>(
      `/clients/${clientId}/youtube/trends`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch YouTube trends"
    );
  }
};

/**
 * 4. Per-Video Analytics
 * GET /api/clients/:clientId/youtube/videos/:videoId/analytics
 */
export const getYouTubeVideoAnalytics = async (
  clientId: number,
  videoId: string
): Promise<YouTubeVideoAnalyticsResponse> => {
  try {
    const response = await api.get<YouTubeVideoAnalyticsResponse>(
      `/clients/${clientId}/youtube/videos/${videoId}/analytics`
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
 * 5. Top Performing Videos
 * GET /api/clients/:clientId/youtube/videos/top
 */
export const getYouTubeTopVideos = async (
  clientId: number,
  params?: { metric?: string; limit?: number; period?: string }
): Promise<YouTubeTopVideosResponse> => {
  try {
    const response = await api.get<YouTubeTopVideosResponse>(
      `/clients/${clientId}/youtube/videos/top`,
      {
        params: {
          metric: params?.metric || "views",
          limit: params?.limit || 10,
          period: params?.period || "30d",
        },
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch top videos"
    );
  }
};

/**
 * 6. Channel Info
 * GET /api/clients/:clientId/youtube/channel
 */
export const getYouTubeChannel = async (
  clientId: number
): Promise<YouTubeChannelResponse> => {
  try {
    const response = await api.get<YouTubeChannelResponse>(
      `/clients/${clientId}/youtube/channel`
    );
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
 * Manual sync for YouTube data
 * POST /clients/:clientId/youtube/sync
 */
export const syncYouTube = async (
  clientId: number
): Promise<YouTubeSyncResponse> => {
  try {
    const response = await api.post<YouTubeSyncResponse>(
      `/clients/${clientId}/youtube/sync`
    );
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
 * 7. Subscribers Growth
 * GET /api/clients/:clientId/youtube/subscribers/growth
 */
export const getYouTubeSubscribersGrowth = async (
  clientId: number,
  params?: { startDate?: string; endDate?: string }
): Promise<YouTubeSubscribersGrowthResponse> => {
  try {
    const response = await api.get<YouTubeSubscribersGrowthResponse>(
      `/clients/${clientId}/youtube/subscribers/growth`,
      {
        params: {
          startDate: params?.startDate,
          endDate: params?.endDate,
        },
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch subscribers growth"
    );
  }
};

/**
 * 8. Watch Time Breakdown
 * GET /api/clients/:clientId/youtube/watch-time
 */
export const getYouTubeWatchTime = async (
  clientId: number
): Promise<YouTubeWatchTimeResponse> => {
  try {
    const response = await api.get<YouTubeWatchTimeResponse>(
      `/clients/${clientId}/youtube/watch-time`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch watch time breakdown"
    );
  }
};

/**
 * 9. Engagement Metrics
 * GET /api/clients/:clientId/youtube/engagement
 */
export const getYouTubeEngagement = async (
  clientId: number
): Promise<YouTubeEngagementResponse> => {
  try {
    const response = await api.get<YouTubeEngagementResponse>(
      `/clients/${clientId}/youtube/engagement`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch engagement metrics"
    );
  }
};

/**
 * 10. Meta (Summary Alias)
 * GET /api/clients/:clientId/youtube/meta
 */
export const getYouTubeMeta = async (
  clientId: number
): Promise<YouTubeSummaryResponse> => {
  try {
    const response = await api.get<YouTubeSummaryResponse>(
      `/clients/${clientId}/youtube/meta`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch YouTube meta summary"
    );
  }
};

/**
 * Generate reconnect URL
 * GET /clients/:clientId/youtube/reconnect
 */
export const reconnectYouTube = async (
  clientId: number
): Promise<YouTubeReconnectResponse> => {
  try {
    const response = await api.get<YouTubeReconnectResponse>(
      `/clients/${clientId}/youtube/reconnect`
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
 * Disconnect YouTube integration
 * POST /clients/:clientId/youtube/disconnect
 */
export const disconnectYouTube = async (
  clientId: number
): Promise<YouTubeDisconnectResponse> => {
  try {
    const response = await api.post<YouTubeDisconnectResponse>(
      `/clients/${clientId}/youtube/disconnect`
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

