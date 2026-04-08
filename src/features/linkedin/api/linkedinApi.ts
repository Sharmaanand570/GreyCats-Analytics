import api from "@/apiConfig";
import type { AxiosError } from "axios";
import { getAuthToken, StorageKey } from "@/utils/storage";

// ==================== TYPES ====================

export type ConnectLinkedinResponse = {
  success: boolean;
  url: string;
};

export type SyncLinkedinParams = {
  organizationId?: string;
};

export type SyncLinkedinResponse = {
  success: boolean;
  message?: string;
};

export type LinkedinAnalyticsResponse = {
  success: boolean;
  analytics: Record<string, Record<string, number>>;
};

export type LinkedinDisconnectResponse = {
  success: boolean;
  message?: string;
};

export type LinkedinApiErrorResponse = {
  message?: string;
  error?: string;
};

export type LinkedinPost = {
  id?: string;
  text?: string;
  mediaUrl?: string;
  createdAt?: string;
  publishedAt?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  impressions?: number;
  clicks?: number;
  [key: string]: any;
};

export type LinkedinPostsResponse = {
  success: boolean;
  data: LinkedinPost[];
};

const handleLinkedinApiError = (error: unknown, fallbackMessage: string): never => {
  const axiosError = error as AxiosError<LinkedinApiErrorResponse>;
  console.error(`[LinkedIn API] Error:`, {
    status: axiosError.response?.status,
    data: axiosError.response?.data,
    message: axiosError.message,
    url: axiosError.config?.url,
  });
  throw new Error(
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    fallbackMessage
  );
};

// ==================== API FUNCTIONS ====================

export const connectLinkedinPersonal = async (): Promise<ConnectLinkedinResponse> => {
  console.log(`[LinkedIn API] connectLinkedinPersonal → GET /linkedin/connect`);
  console.log(`[LinkedIn API] baseURL:`, api.defaults.baseURL);
  try {
    const response = await api.get<ConnectLinkedinResponse>("/linkedin/connect");
    console.log(`[LinkedIn API] connectLinkedinPersonal ← status:`, response.status);
    console.log(`[LinkedIn API] connectLinkedinPersonal ← data:`, response.data);
    console.log(`[LinkedIn API] connectLinkedinPersonal ← headers:`, response.headers);
    return response.data;
  } catch (error) {
    return handleLinkedinApiError(error, "Failed to initiate LinkedIn Personal connection");
  }
};

export const connectLinkedinOrg = async (): Promise<ConnectLinkedinResponse> => {
  console.log(`[LinkedIn API] connectLinkedinOrg → GET /linkedin/portability/connect`);
  console.log(`[LinkedIn API] baseURL:`, api.defaults.baseURL);
  const token = getAuthToken(StorageKey.ANALYTICS_TOKEN);
  console.log(`[LinkedIn API] token present:`, !!token);
  try {
    // Force the proxy by hitting current origin in dev instead of VITE_API_BASE_URL 
    // to allow the vite proxy interceptor to capture the 302 and return JSON.
    const url = import.meta.env.DEV 
      ? `${window.location.origin}/api/linkedin/portability/connect`
      : "/linkedin/portability/connect";

    const response = await api.get<ConnectLinkedinResponse>(url);
    console.log(`[LinkedIn API] connectLinkedinOrg ← status:`, response.status);
    console.log(`[LinkedIn API] connectLinkedinOrg ← data:`, response.data);
    console.log(`[LinkedIn API] connectLinkedinOrg ← headers:`, response.headers);
    console.log(`[LinkedIn API] connectLinkedinOrg ← responseURL:`, response.request?.responseURL);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`[LinkedIn API] connectLinkedinOrg ERROR:`, {
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
      headers: axiosError.response?.headers,
      responseURL: axiosError.request?.responseURL,
      message: axiosError.message,
      code: axiosError.code,
    });
    return handleLinkedinApiError(error, "Failed to initiate LinkedIn Organization connection");
  }
};

export const disconnectLinkedin = async (accountId: number): Promise<LinkedinDisconnectResponse> => {
  console.log(`[LinkedIn API] disconnectLinkedin → POST /linkedin/disconnect/${accountId}`);
  try {
    const response = await api.post<LinkedinDisconnectResponse>(`/linkedin/disconnect/${accountId}`);
    console.log(`[LinkedIn API] disconnectLinkedin ← status:`, response.status, `data:`, response.data);
    return response.data;
  } catch (error) {
    return handleLinkedinApiError(error, "Failed to disconnect LinkedIn account");
  }
};

export const syncLinkedin = async (params?: SyncLinkedinParams): Promise<SyncLinkedinResponse> => {
  console.log(`[LinkedIn API] syncLinkedin → POST /linkedin/sync`, params);
  try {
    const response = await api.post<SyncLinkedinResponse>(`/linkedin/sync`, params);
    console.log(`[LinkedIn API] syncLinkedin ← status:`, response.status, `data:`, response.data);
    return response.data;
  } catch (error) {
    return handleLinkedinApiError(error, "Failed to sync LinkedIn data");
  }
};

export const fetchLinkedinAnalytics = async (startDate?: string, endDate?: string): Promise<LinkedinAnalyticsResponse> => {
  console.log(`[LinkedIn API] fetchLinkedinAnalytics → GET /linkedin/analytics`, { startDate, endDate });
  try {
    const response = await api.get<LinkedinAnalyticsResponse>(`/linkedin/analytics`, {
      params: { startDate, endDate }
    });
    console.log(`[LinkedIn API] fetchLinkedinAnalytics ← status:`, response.status, `data:`, response.data);
    return response.data;
  } catch (error) {
    return handleLinkedinApiError(error, "Failed to fetch LinkedIn analytics");
  }
};

export const fetchLinkedinPosts = async (): Promise<LinkedinPostsResponse> => {
  console.log(`[LinkedIn API] fetchLinkedinPosts → GET /linkedin/dashboard/posts`);
  try {
    const response = await api.get<LinkedinPostsResponse>(`/linkedin/dashboard/posts`);
    console.log(`[LinkedIn API] fetchLinkedinPosts ← status:`, response.status, `data length:`, response.data?.data?.length);
    return response.data;
  } catch (error) {
    return handleLinkedinApiError(error, "Failed to fetch LinkedIn posts");
  }
};
