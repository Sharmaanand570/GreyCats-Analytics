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


export const getFacebookPages = async (params?: {
  limit?: number;
  after?: string;
  search?: string;
}): Promise<FacebookPagesResponse> => {
  try {
    const response = await api.get<FacebookPagesResponse>(
      "/meta-insights/facebook/pages",
      { params }
    );
    return response.data;
  } catch (error) {
    return handleMetaInsightsError(error, "Failed to load Facebook pages");
  }
};

export const getFacebookPageToken = async (
  pageId: string
): Promise<FacebookPageTokenResponse> => {
  try {
    const response = await api.get<FacebookPageTokenResponse>(
      "/meta-insights/facebook/page-token",
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
  pageId: string
): Promise<FacebookPageInfoResponse> => {
  try {
    const response = await api.get<FacebookPageInfoResponse>(
      "/meta-insights/facebook/page-info",
      { params: { pageId } }
    );
    return response.data;
  } catch (error) {
    return handleMetaInsightsError(error, "Failed to load Facebook page info");
  }
};

export const getFacebookPagePosts = async (
  pageId: string,
  limit?: number
): Promise<FacebookPagePostsResponse> => {
  try {
    const response = await api.get<FacebookPagePostsResponse>(
      "/meta-insights/facebook/page-posts",
      { params: { pageId, limit } }
    );
    return response.data;
  } catch (error) {
    return handleMetaInsightsError(
      error,
      "Failed to load Facebook page posts"
    );
  }
};

export const getFacebookPostInsights = async (
  postId: string,
  pageId: string
): Promise<FacebookPostInsightsResponse> => {
  try {
    const response = await api.get<FacebookPostInsightsResponse>(
      "/meta-insights/facebook/post-insights",
      { params: { postId, pageId } }
    );
    console.log("✅ Facebook Post Insights Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Facebook Post Insights Error:", error);
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
      "/meta-insights/facebook/sync",
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
      "/meta-insights/instagram/business",
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

export const getInstagramProfile = async (
  accountId: string
): Promise<InstagramProfileResponse> => {
  try {
    console.log("accountId", accountId);
    // UPDATED: Using /api/metabusiness/instagram/profile/:accountId
    const response = await api.get<InstagramProfileResponse>(
      `/metabusiness/instagram/profile/${accountId}`
    );
    console.log("✅ Instagram Profile Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Instagram Profile Error:", error);
    return handleMetaInsightsError(error, "Failed to load Instagram profile");
  }
};

export const getInstagramMedia = async (
  accountId: string,
  limit: number = 20
): Promise<InstagramMediaResponse> => {
  console.log("accountId", accountId);
  try {
    // UPDATED: Using /api/metabusiness/instagram/media/:accountId
    const response = await api.get<InstagramMediaResponse>(
      `/metabusiness/instagram/media/${accountId}`,
      { params: { limit } }
    );
    return response.data;
  } catch (error) {
    return handleMetaInsightsError(error, "Failed to load Instagram media");
  }
};

export const getInstagramMediaInsights = async (
  accountId: string,
  mediaId: string
): Promise<InstagramMediaInsightsResponse> => {
  console.log("accountId", accountId);
  console.log("mediaId", mediaId);
  try {
    // UPDATED: Using /api/metabusiness/instagram/media/:accountId/:mediaId/insights
    const response = await api.get<InstagramMediaInsightsResponse>(
      `/metabusiness/instagram/media/${accountId}/${mediaId}/insights`
    );
    console.log("✅ Instagram Media Insights Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Instagram Media Insights Error:", error);
    return handleMetaInsightsError(
      error,
      "Failed to load Instagram media insights"
    );
  }
};

export const syncInstagramInsights = async (
  body: InstagramSyncBody
): Promise<InstagramSyncResponse> => {
  try {
    const response = await api.post<InstagramSyncResponse>(
      "/meta-insights/instagram/sync",
      body
    );
    return response.data;
  } catch (error) {
    return handleMetaInsightsError(
      error,
      "Failed to sync Instagram insights"
    );
  }
};

export const getMetaSavedInsights = async (
  platform?: string
): Promise<MetaSavedInsightsResponse> => {
  try {
    const response = await api.get<MetaSavedInsightsResponse>(
      "/meta-insights/saved",
      { params: { platform } }
    );
    return response.data;
  } catch (error) {
    return handleMetaInsightsError(error, "Failed to load saved insights");
  }
};

export const getMetaDailyInsights = async (
  platform?: string
): Promise<MetaDailyHistoryResponse> => {
  try {
    const response = await api.get<MetaDailyHistoryResponse>(
      "/meta-insights/daily",
      { params: { platform } }
    );
    return response.data;
  } catch (error) {
    return handleMetaInsightsError(error, "Failed to load daily insights");
  }
};


