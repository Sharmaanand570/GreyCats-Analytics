import api from "@/apiConfig";
import type { AxiosError } from "axios";

export type MetaInsightsApiErrorResponse = {
  message?: string;
  error?: string;
};

// -------- Facebook --------

export type FacebookPage = {
  id: string;
  name: string;
  instagram_business_account?: { id: string };
  databaseId: number;
};

export type FacebookPagesResponse = {
  success: boolean;
  pages: FacebookPage[];
};

export type FacebookPageTokenResponse = {
  success: boolean;
  pageAccessToken: string;
};

export type FacebookPageInfo = {
  name: string;
  fan_count: number;
  category_list?: { name: string }[];
  link: string;
};

export type FacebookPageInfoResponse = {
  success: boolean;
  page: FacebookPageInfo;
};

export type FacebookPost = {
  id: string;
  message?: string;
  full_picture?: string;
  created_time: string;
  permalink_url: string;
};

export type FacebookPagePostsResponse = {
  success: boolean;
  posts: FacebookPost[];
};

export type FacebookMetricValue = {
  value: number;
  end_time?: string;
};

export type FacebookPostInsight = {
  name: string;
  values: FacebookMetricValue[];
};

export type FacebookPostEngagement = {
  likes: number;
  comments: number;
  shares: number;
  reactions: number;
};

export type FacebookPostInsightsResponse = {
  success: boolean;
  insights: FacebookPostInsight[];
  engagement?: FacebookPostEngagement;
};

export type FacebookSyncBody = {
  pageId: string;
};

export type FacebookSyncResponse = {
  success: boolean;
  insights: unknown;
};

// -------- Instagram --------

export type InstagramBusinessAccountResponse = {
  success: boolean;
  instagramBusinessAccount: {
    id: string;
  };
};

// Instagram Profile
export interface InstagramProfile {
  id: string;
  username: string;
  name: string;
  profile_picture_url: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
}

export type InstagramProfileResponse = {
  success: boolean;
  data: InstagramProfile;
};

export type InstagramMediaItem = {
  id: string;
  caption: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  permalink: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  username: string;
};

export type InstagramMediaResponse = {
  success: boolean;
  pagination: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
  } | null;
  count: number;
  data: InstagramMediaItem[];
};

export type InstagramMetricValue = {
  value: number;
  end_time?: string;
};

export type InstagramMediaInsight = {
  name: string;
  period: string;
  values: { value: number }[];
  title: string;
  id: string;
};

export type InstagramMediaInsightsResponse = {
  success: boolean;
  data: {
    data: InstagramMediaInsight[];
  };
};

export type InstagramSyncBody = {
  igBusinessId: string;
};

export type InstagramSyncResponse = {
  success: boolean;
  insights: unknown;
};

// -------- Meta Insights Accounts --------

export type MetaInsightsAccount = {
  id: number;
  platform: 'facebook' | 'instagram';
  userId: number;
  pageId?: string;
  pageName?: string;
  instagramBusinessId?: string;
  instagramUsername?: string;
  createdAt: string;
  updatedAt: string;
};

export type MetaInsightsAccountsResponse = {
  success: boolean;
  insights: MetaInsightsAccount[];
};

// -------- Saved & Daily --------

export type MetaSavedInsight = {
  platform: string;
  insights: unknown;
};

export type MetaSavedInsightsResponse = {
  success: boolean;
  insights: MetaSavedInsight[];
};

export type MetaDailyHistoryItem = {
  platform: string;
  date: string;
  metrics: Record<string, unknown>;
};

export type MetaDailyHistoryResponse = {
  success: boolean;
  history: MetaDailyHistoryItem[];
};

const handleMetaInsightsError = (
  error: unknown,
  fallbackMessage: string
): never => {
  const axiosError = error as AxiosError<MetaInsightsApiErrorResponse>;
  throw new Error(
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    fallbackMessage
  );
};

// ==================== API FUNCTIONS ====================


export const getFacebookPages = async (
  params?: {
    limit?: number;
    after?: string;
    search?: string;
  }
): Promise<FacebookPagesResponse> => {
  try {
    const response = await api.get<any>(
      '/metabusiness/accounts',
      { params }
    );
    
    // Map the new Meta Business accounts format to the legacy FacebookPagesResponse format
    return {
      success: response.data.success,
      pages: (response.data.accounts || []).map((acc: any) => ({
        id: acc.pageId,
        name: acc.pageName,
        instagram_business_account: acc.instagramBusinessId ? { id: acc.instagramBusinessId } : undefined,
        databaseId: acc.id
      }))
    };
  } catch (error) {
    return handleMetaInsightsError(error, "Failed to load Meta Business accounts");
  }
};

export const getFacebookPageToken = async (
  pageId: string
): Promise<FacebookPageTokenResponse> => {
  try {
    const response = await api.get<FacebookPageTokenResponse>(
      '/meta-insights/facebook/page-token',
      { params: { pageId } }
    );
    return response.data;
  } catch (error) {
    return handleMetaInsightsError(
      error,
      "Failed to fetch Facebook page access token"
    );
  }
};

export const getFacebookPageInfo = async (
  accountId: number
): Promise<FacebookPageInfoResponse> => {
  try {
    const response = await api.get<any>(
      `/metabusiness/facebook/insights/${accountId}`
    );
    console.log("RAW_FACEBOOK_PAGE_INFO:", response.data);
    
    // Map the unified insights structure back to the legacy PageInfo format
    const metrics = response.data.data?.data || [];
    const fansMetric = metrics.find((m: any) => m.name === 'page_fans' || m.name === 'fans');
    const fanCount = fansMetric?.values?.[fansMetric.values.length - 1]?.value || 0;

    return {
      success: response.data.success,
      page: {
        name: response.data.data?.name || response.data.pageName || "Facebook Page",
        fan_count: fanCount,
        category_list: response.data.pageCategory ? [{ name: response.data.pageCategory }] : [],
        link: response.data.data?.link || response.data.pageLink || ""
      }
    };
  } catch (error) {
    return handleMetaInsightsError(error, "Failed to load Facebook page info");
  }
};

export const getFacebookPagePosts = async (
  accountId: number,
  limit?: number
): Promise<FacebookPagePostsResponse> => {
  try {
    const response = await api.get<any>(
      `/metabusiness/facebook/posts/${accountId}`,
      { params: { limit } }
    );
    console.log("RAW_FACEBOOK_PAGE_POSTS:", response.data);
    if (response.data.data?.length > 0) {
      console.log("FIRST_POST_STRUCTURE:", response.data.data[0]);
    }
    
    // Map the new 'data' property to the legacy 'posts' property
    return {
      success: response.data.success,
      posts: response.data.data || []
    };
  } catch (error) {
    return handleMetaInsightsError(
      error,
      "Failed to load Facebook page posts"
    );
  }
};

export const getFacebookPostInsights = async (
  postId: string,
  accountId: number
): Promise<FacebookPostInsightsResponse> => {
  try {
    const response = await api.get<any>(
      `/metabusiness/facebook/post/${postId}/insights`,
      { params: { accountId } }
    );
    
    // Map the unified response to the legacy insights format
    return {
      success: response.data.success,
      insights: response.data.data?.data || []
    };
  } catch (error) {
    return handleMetaInsightsError(
      error,
      "Failed to load Facebook post insights"
    );
  }
};

export const syncFacebookInsights = async (
  body: FacebookSyncBody
): Promise<FacebookSyncResponse> => {
  try {
    const response = await api.post<FacebookSyncResponse>(
      '/meta-insights/facebook/sync',
      body
    );
    return response.data;
  } catch (error) {
    return handleMetaInsightsError(
      error,
      "Failed to sync Facebook insights"
    );
  }
};

export const getInstagramBusinessAccount = async (
  pageId: string
): Promise<InstagramBusinessAccountResponse> => {
  try {
    const response = await api.get<InstagramBusinessAccountResponse>(
      '/meta-insights/instagram/business',
      { params: { pageId } }
    );
    return response.data;
  } catch (error) {
    return handleMetaInsightsError(
      error,
      "Failed to load Instagram business account"
    );
  }
};

/**
 * @deprecated Use getInstagramProfile from metaBusinessApi.ts instead
 * This is a legacy wrapper that will be removed in a future version
 */
export const getInstagramProfile = async (
  _clientId: number,
  accountId: string
): Promise<InstagramProfileResponse> => {
  try {
    const response = await api.get<InstagramProfileResponse>(
      `/metabusiness/instagram/profile/${accountId}`
    );
    return response.data;
  } catch (error) {
    return handleMetaInsightsError(error, "Failed to load Instagram profile");
  }
};

/**
 * @deprecated Use getInstagramMedia from metaBusinessApi.ts instead
 * This is a legacy wrapper that will be removed in a future version
 */
export const getInstagramMedia = async (
  _clientId: number,
  accountId: string,
  limit: number = 20
): Promise<InstagramMediaResponse> => {
  try {
    const response = await api.get<InstagramMediaResponse>(
      `/metabusiness/instagram/media/${accountId}`,
      { params: { limit } }
    );
    return response.data;
  } catch (error) {
    return handleMetaInsightsError(error, "Failed to load Instagram media");
  }
};

/**
 * @deprecated Use getInstagramMediaInsights from metaBusinessApi.ts instead
 * This is a legacy wrapper that will be removed in a future version
 */
export const getInstagramMediaInsights = async (
  _clientId: number,
  accountId: string,
  mediaId: string
): Promise<InstagramMediaInsightsResponse> => {
  try {
    const response = await api.get<InstagramMediaInsightsResponse>(
      `/metabusiness/instagram/media/${accountId}/${mediaId}/insights`
    );
    return response.data;
  } catch (error) {
    return handleMetaInsightsError(
      error,
      "Failed to load Instagram media insights"
    );
  }
};

/**
 * @deprecated This endpoint doesn't exist in Meta Insights API
 * Use Meta Business sync endpoints instead
 */
export const syncInstagramInsights = async (): Promise<InstagramSyncResponse> => {
  throw new Error("syncInstagramInsights is not available in Meta Insights API. Use Meta Business API instead.");
};

/**
 * @deprecated This endpoint doesn't exist in Meta Insights API
 * Saved insights are accessed through /api/meta-insights/accounts
 */
export const getMetaSavedInsights = async (): Promise<MetaSavedInsightsResponse> => {
  throw new Error("getMetaSavedInsights is not available. Use getMetaInsightsAccounts instead.");
};

/**
 * @deprecated This endpoint doesn't exist in Meta Insights API
 */
export const getMetaDailyInsights = async (): Promise<MetaDailyHistoryResponse> => {
  throw new Error("getMetaDailyInsights is not available in Meta Insights API.");
};


export const getMetaInsightsAccounts = async (): Promise<MetaInsightsAccountsResponse> => {
  try {
    const response = await api.get<MetaInsightsAccountsResponse>("/meta-insights/accounts");
    return response.data;
  } catch (error) {
    return handleMetaInsightsError(error, "Failed to load Meta Insights accounts");
  }
};
