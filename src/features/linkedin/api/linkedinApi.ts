import api from "@/apiConfig";
import type { AxiosError } from "axios";

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

export const connectLinkedinOrg = async (clientId?: string | number): Promise<ConnectLinkedinResponse> => {
  console.log(`[LinkedIn API] connectLinkedinOrg → GET /linkedin/portability/connect`, { clientId });
  
  try {
    const url = import.meta.env.DEV 
      ? `${window.location.origin}/api/linkedin/portability/connect`
      : "/linkedin/portability/connect";

    const response = await api.get<ConnectLinkedinResponse>(url);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    // CORS/Redirect Block Fallback: If we hit a Network Error (likely a 303 redirect blocked by CORS),
    // we manually construct the LinkedIn OAuth URL to allow full-page navigation.
    if (axiosError.message === "Network Error" || axiosError.code === "ERR_NETWORK") {
      console.warn(`[LinkedIn API] Network error detected. Constructing manual OAuth URL fallback...`);
      
      const baseURL = api.defaults.baseURL || "https://api.analytics.greycats.tech/api";
      // Ensure baseURL doesn't have a trailing slash for consistency
      const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
      const redirectUri = `${cleanBaseURL}/linkedin/portability/callback`;
      
      const manualUrl = `https://www.linkedin.com/oauth/v2/authorization?` + 
        `response_type=code&` +
        `client_id=77ilw5hr3ban3e&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${clientId || ''}&` +
        `scope=r_organization_social%20rw_organization_admin%20w_organization_social`;
        
      return { success: true, url: manualUrl };
    }
    
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
