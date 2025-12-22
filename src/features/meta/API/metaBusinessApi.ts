import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type MetaBusinessLoginResponse = {
  success: boolean;
  url: string; // Redirect URL to Facebook
};

export type MetaBusinessCallbackParams = {
  code: string;
  state: string;
};

export type MetaBusinessCallbackResponse = {
  success: boolean;
  message: string;
  account: {
    id: number;
    userId: number;
    metaUserId: string;
    pageId: string;
    pageName: string;
    pageCategory: string;
    instagramBusinessId: string | null;
    instagramUsername: string | null;
    createdAt: string;
  };
};

export type MetaBusinessAccount = {
  id: number;
  userId?: number;
  pageId: string;
  pageName: string;
  instagramBusinessId: string | null;
  instagramUsername: string | null;
  hasInstagram: boolean;
  lastSynced: string | null;
  createdAt: string;
};

export type MetaBusinessAccountsResponse = {
  success: boolean;
  total: number;
  accounts: MetaBusinessAccount[];
};

export type MetaBusinessRefreshResponse = {
  success: boolean;
  message: string;
};

export type MetaBusinessDisconnectResponse = {
  success: boolean;
  message: string;
};

export type MetaBusinessInsightValue = {
  value: number;
  end_time?: string;
};

export type MetaBusinessInsightMetric = {
  name: string;
  values: MetaBusinessInsightValue[];
};

export type MetaBusinessInsightsResponse = {
  success: boolean;
  data: {
    data: MetaBusinessInsightMetric[];
  };
};

export type MetaBusinessPost = {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  permalink_url?: string;
  attachments?: {
    data: Array<{
      media?: {
        image?: {
          height: number;
          src: string;
          width: number;
        };
        source?: string;
      };
      type: string;
      media_type: string;
    }>;
  };
  likes?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
};

export type MetaBusinessPostsResponse = {
  success: boolean;
  count: number;
  pagination: any | null;
  data: MetaBusinessPost[];
};

export type MetaBusinessInstagramProfile = {
  id: string;
  username: string;
  followers_count: number;
  media_count: number;
  profile_picture_url?: string;
};

export type MetaBusinessInstagramProfileResponse = {
  success: boolean;
  data: MetaBusinessInstagramProfile;
};

export type MetaBusinessInstagramMediaItem = {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string; // Video thumbnail/poster
  timestamp: string;
  caption?: string;
  permalink?: string;
  like_count: number;
  comments_count: number;
};

export type MetaBusinessInstagramMediaResponse = {
  success: boolean;
  count: number;
  pagination: any | null;
  data: MetaBusinessInstagramMediaItem[];
};

export type MetaBusinessInstagramStoryItem = {
  id: string;
  media_type: "IMAGE" | "VIDEO";
  media_url: string;
  timestamp?: string;
};

export type MetaBusinessInstagramStoriesResponse = {
  success: boolean;
  count: number;
  pagination: any | null;
  data: MetaBusinessInstagramStoryItem[];
};

export type MetaBusinessAnalyticsSummaryResponse = {
  success: boolean;
  summary: {
    page: {
      data: MetaBusinessInsightMetric[];
    };
    instagram: {
      profile: Partial<MetaBusinessInstagramProfile>;
      recentMedia: MetaBusinessInstagramMediaItem[];
    };
  };
};

export type MetaBusinessSyncResponse = {
  success: boolean;
  upsert: {
    id: number;
    platform: string;
    date: string;
    metrics: Record<string, any>;
  };
};

export type MetaBusinessFacebookSyncResponse = {
  success: boolean;
  platform: "facebook";
  metrics: {
    page: Record<string, any>;
    posts: any[];
  };
};

export type MetaBusinessInstagramSyncResponse = {
  success: boolean;
  platform: "instagram";
  metrics: {
    instagram: {
      profile: Record<string, any>;
      data: any[];
    };
    media: any[];
  };
};

export type MetaBusinessRefreshPageResponse = {
  success: boolean;
  message: string;
  page: {
    name: string;
    category: string;
  };
};

export type ApiErrorResponse = {
  message?: string;
  error?: string;
};






// ==================== API FUNCTIONS ====================

/**
 * 1) START OAUTH
 * GET /metabusiness/login
 */
export const loginMetaBusiness = async (): Promise<void> => {
  try {
    // Step 1: Call backend to initiate OAuth and get redirect URL
    // Backend will authenticate using the Authorization header (from axios interceptor)
    const response = await api.get<MetaBusinessLoginResponse>("/metabusiness/login");

    // Step 2: Redirect to the Facebook OAuth URL returned by backend
    window.location.href = response.data.url;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const errorMessage = axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to initiate Meta Business login";
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }
};



/**
 * 2) OAUTH CALLBACK
 * GET /metabusiness/callback?code=XXXX&state=USERID
 */
export const handleMetaBusinessCallback = async (
  params: MetaBusinessCallbackParams
): Promise<MetaBusinessCallbackResponse> => {
  try {
    const response = await api.get<MetaBusinessCallbackResponse>(
      "/meta-business/callback",
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to complete Meta Business connection"
    );
  }
};

/**
 * 3) GET CONNECTED META ACCOUNTS
 * GET /api/meta/accounts
 */
export const getMetaBusinessAccounts = async (): Promise<MetaBusinessAccountsResponse> => {
  try {
    const response = await api.get<MetaBusinessAccountsResponse>(
      "/metabusiness/accounts"
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch Meta Business accounts"
    );
  }
};

/**
 * 4) REFRESH META ACCOUNT
 * GET /metabusiness/refresh/:id
 */
export const refreshMetaBusinessAccount = async (
  id: number
): Promise<MetaBusinessRefreshResponse> => {
  try {
    const response = await api.get<MetaBusinessRefreshResponse>(
      `/metabusiness/refresh/${id}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to refresh Meta Business account"
    );
  }
};

/**
 * 5) DISCONNECT META ACCOUNT
 * DELETE /metabusiness/disconnect/:id
 */
export const disconnectMetaBusinessAccount = async (
  id: number
): Promise<MetaBusinessDisconnectResponse> => {
  try {
    const response = await api.delete<MetaBusinessDisconnectResponse>(
      `/metabusiness/disconnect/${id}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to disconnect Meta Business account"
    );
  }
};

/**
 * 6) GET PAGE INSIGHTS
 * GET /metabusiness/facebook/insights/:accountId
 */
export const getFacebookPageInsights = async (
  accountId: number,
  params?: {
    period?: string;
    since?: string;
    until?: string;
  }
): Promise<MetaBusinessInsightsResponse> => {
  try {
    const response = await api.get<MetaBusinessInsightsResponse>(
      `/metabusiness/facebook/insights/${accountId}`,
      { params }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch Facebook Page insights"
    );
  }
};

/**
 * 7) GET PAGE POSTS
 * GET /metabusiness/facebook/posts/:accountId
 */
export const getFacebookPagePosts = async (
  accountId: number,
  params?: {
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }
): Promise<MetaBusinessPostsResponse> => {
  try {
    const response = await api.get<MetaBusinessPostsResponse>(
      `/metabusiness/facebook/posts/${accountId}`,
      { params }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch Facebook Page posts"
    );
  }
};

/**
 * 8) GET FACEBOOK POST INSIGHTS
 * GET /metabusiness/facebook/post/:postId/insights
 */
export const getFacebookPostInsights = async (
  postId: string,
  params?: {
    metrics?: string;
  }
): Promise<MetaBusinessInsightsResponse> => {
  try {
    const response = await api.get<MetaBusinessInsightsResponse>(
      `/metabusiness/facebook/post/${postId}/insights`,
      { params }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch Facebook Post insights"
    );
  }
};

/**
 * 9) GET INSTAGRAM PROFILE
 * GET /metabusiness/instagram/profile/:accountId
 */
export const getInstagramProfile = async (
  accountId: number
): Promise<MetaBusinessInstagramProfileResponse> => {
  try {
    const response = await api.get<MetaBusinessInstagramProfileResponse>(
      `/metabusiness/instagram/profile/${accountId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch Instagram profile"
    );
  }
};

/**
 * 10) GET INSTAGRAM MEDIA
 * GET /metabusiness/instagram/media/:accountId
 */
export const getInstagramMedia = async (
  accountId: number,
  params?: {
    limit?: number;
    type?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    sort?: string;
    order?: 'asc' | 'desc';
  }
): Promise<MetaBusinessInstagramMediaResponse> => {
  try {
    const response = await api.get<MetaBusinessInstagramMediaResponse>(
      `/metabusiness/instagram/media/${accountId}`,
      { params }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch Instagram media"
    );
  }
};

/**
 * 11) GET INSTAGRAM MEDIA INSIGHTS
 * GET /metabusiness/instagram/media/:accountId/:mediaId/insights
 */
export const getInstagramMediaInsights = async (
  accountId: number,
  mediaId: string,
  params?: {
    metrics?: string;
  }
): Promise<MetaBusinessInsightsResponse> => {
  try {
    const response = await api.get<MetaBusinessInsightsResponse>(
      `/metabusiness/instagram/media/${accountId}/${mediaId}/insights`,
      { params }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch Instagram media insights"
    );
  }
};

/**
 * 12) GET INSTAGRAM STORIES
 * GET /metabusiness/instagram/stories/:accountId
 */
export const getInstagramStories = async (
  accountId: number,
  params?: {
    limit?: number;
  }
): Promise<MetaBusinessInstagramStoriesResponse> => {
  try {
    const response = await api.get<MetaBusinessInstagramStoriesResponse>(
      `/metabusiness/instagram/stories/${accountId}`,
      { params }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch Instagram stories"
    );
  }
};

/**
 * 13) GET ANALYTICS SUMMARY
 * GET /metabusiness/analytics/summary/:accountId
 */
export const getMetaBusinessAnalyticsSummary = async (
  accountId: number
): Promise<MetaBusinessAnalyticsSummaryResponse> => {
  try {
    const response = await api.get<MetaBusinessAnalyticsSummaryResponse>(
      `/metabusiness/analytics/summary/${accountId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch analytics summary"
    );
  }
};

/**
 * 14) SYNC BOTH (DAILY)
 * POST /metabusiness/sync-daily/:accountId
 */
export const syncMetaBusinessDaily = async (
  accountId: number,
  date?: string
): Promise<MetaBusinessSyncResponse> => {
  try {
    const response = await api.post<MetaBusinessSyncResponse>(
      `/metabusiness/sync-daily/${accountId}`,
      {},
      {
        params: { date },
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to sync daily data"
    );
  }
};

/**
 * 15) SYNC FACEBOOK ONLY
 * POST /metabusiness/sync-facebook/:accountId
 */
export const syncMetaBusinessFacebook = async (
  accountId: number,
  date?: string
): Promise<MetaBusinessFacebookSyncResponse> => {
  try {
    const response = await api.post<MetaBusinessFacebookSyncResponse>(
      `/metabusiness/sync-facebook/${accountId}`,
      {},
      {
        params: { date },
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to sync Facebook data"
    );
  }
};

/**
 * 16) SYNC INSTAGRAM ONLY
 * POST /metabusiness/sync-instagram/:accountId
 */
export const syncMetaBusinessInstagram = async (
  accountId: number,
  date?: string
): Promise<MetaBusinessInstagramSyncResponse> => {
  try {
    const response = await api.post<MetaBusinessInstagramSyncResponse>(
      `/metabusiness/sync-instagram/${accountId}`,
      {},
      {
        params: { date },
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to sync Instagram data"
    );
  }
};

/**
 * 17) REFRESH PAGE TOKEN
 * POST /metabusiness/refresh-page/:id
 */
export const refreshMetaBusinessPageToken = async (
  id: number
): Promise<MetaBusinessRefreshPageResponse> => {
  try {
    const response = await api.post<MetaBusinessRefreshPageResponse>(
      `/metabusiness/refresh-page/${id}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to refresh page token"
    );
  }
};
