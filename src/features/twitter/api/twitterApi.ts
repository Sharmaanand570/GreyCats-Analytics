import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type ConnectTwitterResponse = {
  success: boolean;
  url: string;
};

export type TwitterAccountSummary = {
  username: string;
  name: string;
  followersCount: number;
  followingCount: number;
  tweetCount: number;
  profileImageUrl: string;
};

export type TwitterSummaryMetrics = {
  totalFollowers: number;
  followersGained: number;
  totalTweets: number;
  totalFollowing: number;
  tweetsPublishedLast30Days: number;
  impressions?: number;
  likes?: number;
  retweets?: number;
  replies?: number;
};

export type TwitterProfileResponse = {
  success: boolean;
  profile: TwitterAccountSummary;
};

export type TwitterSummaryResponse = {
  success: boolean;
  account: TwitterAccountSummary;
  summary: TwitterSummaryMetrics;
};

export type TwitterAudienceHistoryPoint = {
  date: string;
  followers: number;
  following: number;
  tweetsCount: number;
};

export type TwitterAudienceHistoryResponse = {
  success: boolean;
  history: TwitterAudienceHistoryPoint[];
};

export type TwitterDisconnectResponse = {
  success: boolean;
  message?: string;
};

export type TwitterApiErrorResponse = {
  message?: string;
  error?: string;
};

const handleTwitterApiError = (error: unknown, fallbackMessage: string): never => {
  const axiosError = error as AxiosError<TwitterApiErrorResponse>;
  throw new Error(
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    fallbackMessage
  );
};

// ==================== API FUNCTIONS ====================

export const connectTwitter = async (): Promise<ConnectTwitterResponse> => {
  try {
    const response = await api.get<ConnectTwitterResponse>("/twitter/connect");
    return response.data;
  } catch (error) {
    return handleTwitterApiError(error, "Failed to initiate Twitter connection");
  }
};

export const disconnectTwitter = async (accountId: number): Promise<TwitterDisconnectResponse> => {
  try {
    const response = await api.post<TwitterDisconnectResponse>(`/twitter/disconnect/${accountId}`);
    return response.data;
  } catch (error) {
    return handleTwitterApiError(error, "Failed to disconnect Twitter account");
  }
};

export const getTwitterSummary = async (clientId: number): Promise<TwitterSummaryResponse> => {
  try {
    const response = await api.get<TwitterSummaryResponse>(`/clients/${clientId}/twitter/summary`);
    return response.data;
  } catch (error) {
    return handleTwitterApiError(error, "Failed to fetch Twitter summary");
  }
};

export const getTwitterAudienceHistory = async (clientId: number, days: number = 90): Promise<TwitterAudienceHistoryResponse> => {
  try {
    const response = await api.get<TwitterAudienceHistoryResponse>(`/clients/${clientId}/twitter/audience`, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    return handleTwitterApiError(error, "Failed to fetch Twitter audience history");
  }
};

export const getTwitterProfile = async (accountId: number): Promise<TwitterProfileResponse> => {
  try {
    const response = await api.get<TwitterProfileResponse>(`/twitter/profile/${accountId}`);
    return response.data;
  } catch (error) {
    return handleTwitterApiError(error, "Failed to fetch Twitter profile");
  }
};

/**
 * Search for valid Twitter location IDs (places).
 * GET /api/twitter/locations/:accountId?query=
 */
export const searchTwitterLocations = async (
  accountId: number,
  query: string
): Promise<import("../../../features/social-media/api/types").LocationSearchResult[]> => {
  try {
    const response = await api.get<{ success: boolean; locations: any[] }>(
      `/twitter/locations/${accountId}`,
      { params: { query } }
    );
    return response.data.locations;
  } catch (error) {
    return handleTwitterApiError(error, "Twitter location search failed");
  }
};

