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

// Reverting to object based on latest raw response
export type YouTubeThumbnail = {
  url: string;
  width?: number;
  height?: number;
};

export type YouTubeChannelResponse = {
  success: boolean;
  message?: string;
  channel: {
    channelId: string;
    channelTitle: string;
    channelHandle: string;
    description: string;
    customUrl: string;
    publishedAt: string;
    thumbnails: {
      default: YouTubeThumbnail;
      medium: YouTubeThumbnail;
      high: YouTubeThumbnail;
    };
    country?: string;
    viewCount: number;
    subscriberCount: number;
    videoCount: number;
    // connectedAt might be absent, relying on publishedAt or backend
    connectedAt?: string;
  };
};

export type YouTubeCallbackResponse = YouTubeChannelResponse;

export type YouTubeSyncResponse = {
  success: boolean;
  message?: string;
};

// 1. Summary & 10. Meta
export type YouTubeSummaryResponse = {
  success: boolean;
  message?: string;
  channelTitle?: string;
  channelId?: string;
  summary: {
    totalViews: number;
    totalSubscribers: number; // User example 1 says "totalSubscribers" (156). 
    totalVideos: number;
    totalWatchTime: number;
    totalLikes: number;
    averageViewsPerDay: number;
  };
};

export type YouTubeVideoItem = {
  id: string; // User example 2 says "id": "dQw4w9WgXcQ"
  title: string;
  description?: string;
  publishedAt: string;
  thumbnails: {
    default: YouTubeThumbnail;
    medium: YouTubeThumbnail;
    high: YouTubeThumbnail;
    standard?: YouTubeThumbnail;
    maxres?: YouTubeThumbnail;
  };
  privacyStatus?: string;
  duration?: string; // "PT10M30S"

  // Metrics (Direct) - Example 5 has them
  views?: number;
  likes?: number;
  comments?: number;
  watchTime?: number;
};

// 2. Videos List
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

// 3. Trends
export type YouTubeTrendsResponse = {
  success: boolean;
  message?: string;
  trends: YouTubeTrendItem[];
  // Example 3 doesn't explicitly show a summary object in response? 
  // Wait, Example 3 in Step 435 ONLY shows "trends" array!
  // My previous code expected "summary". I will remove "summary" if it's not in Example 3.
  // Actually, I should keep it optional just in case, but strictly the example has none.
  summary?: {
    totalDays: number;
    totalViews: number;
    averageViewsPerDay: number;
    peakDay: string;
    peakViews: number;
  };
};

// 4. Per-Video Analytics
export type YouTubeVideoAnalyticsResponse = {
  success: boolean;
  message?: string;
  video: {
    id: string;
    title: string;
    publishedAt: string;
    thumbnails: {
      default: YouTubeThumbnail;
      medium: YouTubeThumbnail;
      high: YouTubeThumbnail;
    };
  };
  analytics: {
    dailyMetrics: Array<{
      date: string;
      views: number;
      likes: number;
      comments: number;
      watchTimeSec: number;
    }>;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalWatchTime: number;
  };
};

// 5. Top Videos
export type YouTubeTopVideosResponse = {
  success: boolean;
  metric: string;
  period: string;
  topVideos: YouTubeVideoItem[];
};

// 7. Subscribers Growth
export type YouTubeSubscribersGrowthResponse = {
  success: boolean;
  totalGained: number;
  growth: Array<{
    date: string;
    subscribersGained: number;
    // Example 7 doesn't show cumulative?
    // Wait, Example 7 in Step 435 shows: date, subscribersGained.
    // It DOES NOT show cumulative.
    cumulativeSubscribers?: number;
  }>;
};

// 8. Watch Time Breakdown
export type YouTubeWatchTimeResponse = {
  success: boolean;
  totalWatchTimeHours: string; // "25.67"
  averageWatchTimePerDay: string; // "0.86"
  dailyWatchTime: Array<{
    date: string;
    watchTimeSec: number;
    watchTimeHours: string;
  }>;
  // Example 8 does NOT show "totals" object.
  totals?: any;
};

// 9. Engagement Metrics
export type YouTubeEngagementResponse = {
  success: boolean;
  engagement: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    engagementRate: string; // "2.79%"
    likesPerView: string; // "2.22" (User example keys: likesPerView, commentsPerView)
    commentsPerView: string; // "0.58"

    // Optional compatibility if needed, but Example 9 only has above.
  };
  // Example 9 does NOT show "daily" array.
  daily?: any;
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
  clientId: number,
  params?: { startDate?: string; endDate?: string }
): Promise<YouTubeSummaryResponse> => {
  try {
    const requestParams = {
      startDate: params?.startDate,
      endDate: params?.endDate,
    };
    console.log(`[YouTube API] Fetching summary for client ${clientId}`, requestParams);

    const response = await api.get<YouTubeSummaryResponse>(
      `/clients/${clientId}/youtube/summary`,
      {
        params: requestParams,
      }
    );
    console.log(`[YouTube API] Summary response:`, response.data);
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
    const requestParams = {
      page: params?.page || 1,
      limit: params?.limit || 25,
    };
    console.log(`[YouTube API] Fetching videos list for client ${clientId}`, requestParams);

    const response = await api.get<YouTubeVideosListResponse>(
      `/clients/${clientId}/youtube/videos`,
      {
        params: requestParams,
      }
    );
    console.log(`[YouTube API] Videos list response:`, response.data);
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
  clientId: number,
  params?: { startDate?: string; endDate?: string }
): Promise<YouTubeTrendsResponse> => {
  try {
    const requestParams = {
      startDate: params?.startDate,
      endDate: params?.endDate,
    };
    console.log(`[YouTube API] Fetching trends for client ${clientId}`, requestParams);

    const response = await api.get<YouTubeTrendsResponse>(
      `/clients/${clientId}/youtube/trends`,
      {
        params: requestParams,
      }
    );
    console.log(`[YouTube API] Trends response:`, response.data);
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
    console.log(`[YouTube API] Fetching analytics for video ${videoId}`);
    const response = await api.get<YouTubeVideoAnalyticsResponse>(
      `/clients/${clientId}/youtube/videos/${videoId}/analytics`
    );
    console.log(`[YouTube API] Video analytics response:`, response.data);
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
  params?: { metric?: string; limit?: number; period?: string; startDate?: string; endDate?: string }
): Promise<YouTubeTopVideosResponse> => {
  try {
    // Helper to calculate period from date range
    let derivedPeriod = params?.period || "30d";
    if (params?.startDate && params?.endDate) {
      const start = new Date(params.startDate);
      const end = new Date(params.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) derivedPeriod = "7d";
      else if (diffDays <= 30) derivedPeriod = "30d";
      else if (diffDays <= 90) derivedPeriod = "90d";
      else derivedPeriod = "365d";
    }

    const requestParams = {
      metric: params?.metric || "views",
      limit: params?.limit || 10,
      period: derivedPeriod,
      // User indicated endpoint does not support custom startDate/endDate
      // so we rely on the mapped period.
    };
    console.log(`[YouTube API] Fetching top videos`, requestParams);

    const response = await api.get<YouTubeTopVideosResponse>(
      `/clients/${clientId}/youtube/videos/top`,
      {
        params: requestParams,
      }
    );
    console.log(`[YouTube API] Top videos response:`, response.data);
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
    console.log(`[YouTube API] Fetching channel info for client ${clientId}`);
    const response = await api.get<YouTubeChannelResponse>(
      `/clients/${clientId}/youtube/channel`
    );
    console.log(`[YouTube API] Channel info response:`, response.data);
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
    const requestParams = {
      startDate: params?.startDate,
      endDate: params?.endDate,
    };
    console.log(`[YouTube API] Fetching subscribers growth for client ${clientId}`, requestParams);

    const response = await api.get<YouTubeSubscribersGrowthResponse>(
      `/clients/${clientId}/youtube/subscribers/growth`,
      {
        params: requestParams,
      }
    );
    console.log(`[YouTube API] Subscribers growth response:`, response.data);
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
  clientId: number,
  params?: { startDate?: string; endDate?: string }
): Promise<YouTubeWatchTimeResponse> => {
  try {
    const requestParams = {
      startDate: params?.startDate,
      endDate: params?.endDate,
    };
    console.log(`[YouTube API] Fetching watch time breakdown for client ${clientId}`, requestParams);

    const response = await api.get<YouTubeWatchTimeResponse>(
      `/clients/${clientId}/youtube/watch-time`,
      {
        params: requestParams,
      }
    );
    console.log(`[YouTube API] Watch time response:`, response.data);
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
  clientId: number,
  params?: { startDate?: string; endDate?: string }
): Promise<YouTubeEngagementResponse> => {
  try {
    const requestParams = {
      startDate: params?.startDate,
      endDate: params?.endDate,
    };
    console.log(`[YouTube API] Fetching engagement metrics for client ${clientId}`, requestParams);

    const response = await api.get<YouTubeEngagementResponse>(
      `/clients/${clientId}/youtube/engagement`,
      {
        params: requestParams,
      }
    );
    console.log(`[YouTube API] Engagement response:`, response.data);
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

