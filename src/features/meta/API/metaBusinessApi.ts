import api from "@/apiConfig";
import { getAuthToken, StorageKey } from "@/utils/storage";
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
  userId: number;
  pageId: string;
  pageName: string;
  instagramBusinessId: string | null;
  instagramUsername: string | null;
};

export type MetaBusinessAccountsResponse = {
  success: boolean;
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
  insights: {
    data: MetaBusinessInsightMetric[];
  };
};

export type MetaBusinessPost = {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  permalink_url?: string;
};

export type MetaBusinessPostsResponse = {
  success: boolean;
  posts: MetaBusinessPost[];
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
  profile: MetaBusinessInstagramProfile;
};

export type MetaBusinessInstagramMediaItem = {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  timestamp: string;
  caption?: string;
  permalink?: string;
};

export type MetaBusinessInstagramMediaResponse = {
  success: boolean;
  media: MetaBusinessInstagramMediaItem[];
};

export type MetaBusinessInstagramStoryItem = {
  id: string;
  media_type: "IMAGE" | "VIDEO";
  media_url: string;
  timestamp?: string;
};

export type MetaBusinessInstagramStoriesResponse = {
  success: boolean;
  stories: MetaBusinessInstagramStoryItem[];
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
 * GET /api/metabusiness/login
 */
export const loginMetaBusiness = async (): Promise<void> => {
  try {
    // Redirect the browser to the backend login endpoint, which initiates the OAuth flow
    // and redirects to Facebook.
    // We must use window.location.href because we need a full page navigation.
    // We cannot use axios/fetch because of CORS on the Facebook login page and to ensure relative links work.
    
    // Use the configured base URL or the NGROK URL if specified
    const baseUrl = import.meta.env.VITE_NGROK_URL || api.defaults.baseURL || "";
    
    // Ensure we don't have double slashes if baseURL ends with /
    let url = baseUrl.endsWith("/") 
      ? `${baseUrl}metabusiness/login` 
      : `${baseUrl}/metabusiness/login`;
      
    // Append the auth token to the URL so the backend can authenticate the request
    // NOTE: The backend MUST be configured to accept the token in the query string for this to work.
    const token = getAuthToken(StorageKey.ANALYTICS_TOKEN);
    if (token) {
      url += `?token=${token}`;
    }

    window.location.href = url;
  } catch (error) {
    console.error("Failed to initiate Meta Business login", error);
    throw error;
  }
};



/**
 * 2) OAUTH CALLBACK
 * GET /api/metabusiness/callback?code=XXXX&state=USERID
 */
export const handleMetaBusinessCallback = async (
  params: MetaBusinessCallbackParams
): Promise<MetaBusinessCallbackResponse> => {
  try {
    const response = await api.get<MetaBusinessCallbackResponse>(
      "/metabusiness/callback",
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
 * GET /api/metabusiness/accounts
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
 * GET /api/metabusiness/refresh/:id
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
 * DELETE /api/metabusiness/disconnect/:id
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
 * GET /api/metabusiness/facebook/insights/:accountId
 */
export const getFacebookPageInsights = async (
  accountId: number
): Promise<MetaBusinessInsightsResponse> => {
  try {
    const response = await api.get<MetaBusinessInsightsResponse>(
      `/metabusiness/facebook/insights/${accountId}`
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
 * GET /api/metabusiness/facebook/posts/:accountId
 */
export const getFacebookPagePosts = async (
  accountId: number
): Promise<MetaBusinessPostsResponse> => {
  try {
    const response = await api.get<MetaBusinessPostsResponse>(
      `/metabusiness/facebook/posts/${accountId}`
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
 * GET /api/metabusiness/facebook/post/:postId/insights
 */
export const getFacebookPostInsights = async (
  postId: string
): Promise<MetaBusinessInsightsResponse> => {
  try {
    const response = await api.get<MetaBusinessInsightsResponse>(
      `/metabusiness/facebook/post/${postId}/insights`
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
 * GET /api/metabusiness/instagram/profile/:accountId
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
 * GET /api/metabusiness/instagram/media/:accountId
 */
export const getInstagramMedia = async (
  accountId: number
): Promise<MetaBusinessInstagramMediaResponse> => {
  try {
    const response = await api.get<MetaBusinessInstagramMediaResponse>(
      `/metabusiness/instagram/media/${accountId}`
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
 * GET /api/metabusiness/instagram/media/:mediaId/insights
 */
export const getInstagramMediaInsights = async (
  mediaId: string
): Promise<MetaBusinessInsightsResponse> => {
  try {
    const response = await api.get<MetaBusinessInsightsResponse>(
      `/metabusiness/instagram/media/${mediaId}/insights`
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
 * GET /api/metabusiness/instagram/stories/:accountId
 */
export const getInstagramStories = async (
  accountId: number
): Promise<MetaBusinessInstagramStoriesResponse> => {
  try {
    const response = await api.get<MetaBusinessInstagramStoriesResponse>(
      `/metabusiness/instagram/stories/${accountId}`
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
 * GET /api/metabusiness/analytics/summary/:accountId
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
 * 14) MANUAL DAILY SYNC
 * POST /api/metabusiness/sync-daily/:accountId
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
 * 15) REFRESH PAGE TOKEN
 * POST /api/metabusiness/refresh-page/:id
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
