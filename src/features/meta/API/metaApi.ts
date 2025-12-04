import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type MetaConnectResponse = {
  success: boolean;
  url: string;
};

export type MetaCallbackResponse = {
  success: boolean;
  message?: string;
  metaAccount?: {
    id: number;
    userId: number;
    metaUserId: string;
    accessToken: string;
    expiresAt: string;
    createdAt: string;
  };
};

export type MetaCallbackParams = {
  code?: string;
  state?: string;
  status?: string;
  user?: string;
  metaUserId?: string;
};

export type MetaReconnectResponse = {
  success: boolean;
  url: string;
};

export type MetaDisconnectResponse = {
  success: boolean;
  message: string;
};

export type MetaAccount = {
  id: string;
  account_id: string;
  name: string;
};

export type MetaAccountsResponse = {
  success: boolean;
  accounts: MetaAccount[];
};

export type MetaCampaign = {
  id: string;
  name: string;
  status: string;
};

export type MetaCampaignsResponse = {
  success: boolean;
  campaigns: MetaCampaign[];
};

export type MetaCampaignInsight = {
  impressions: string;
  clicks: string;
  spend: string;
  cpc: string;
  date_start: string;
};

export type MetaCampaignInsightsResponse = {
  success: boolean;
  insights: MetaCampaignInsight[];
};

export type ApiErrorResponse = {
  message?: string;
  error?: string;
};

// ==================== API FUNCTIONS ====================

/**
 * Initiate Meta OAuth connection
 * GET /meta/connect
 */
export const connectMeta = async (): Promise<MetaConnectResponse> => {
  try {
    const response = await api.get<MetaConnectResponse>("/meta/connect", {
      baseURL: import.meta.env.VITE_NGROK_URL,
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to initiate Meta connection"
    );
  }
};

/**
 * Handle Meta OAuth callback
 * GET /meta/callback?code=xxx&state=xxx OR /meta/callback?status=success&user=xxx&metaUserId=xxx
 */
export const handleMetaCallback = async (
  params: MetaCallbackParams
): Promise<MetaCallbackResponse> => {
  try {
    // Build params object, only including defined values
    const queryParams: Record<string, string> = {};
    
    if (params.code) queryParams.code = params.code;
    if (params.state) queryParams.state = params.state;
    if (params.status) queryParams.status = params.status;
    if (params.user) queryParams.user = params.user;
    if (params.metaUserId) queryParams.metaUserId = params.metaUserId;

    const response = await api.get<MetaCallbackResponse>("/meta/callback", {
      baseURL: import.meta.env.VITE_NGROK_URL,
      params: queryParams,
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to complete Meta connection"
    );
  }
};

/**
 * GET /meta/reconnect
 */
export const reconnectMeta = async (): Promise<MetaReconnectResponse> => {
  try {
    const response = await api.get<MetaReconnectResponse>("/meta/reconnect");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to generate Meta reconnect URL"
    );
  }
};

/**
 * POST /meta/disconnect
 */
export const disconnectMeta = async (): Promise<MetaDisconnectResponse> => {
  try {
    const response = await api.post<MetaDisconnectResponse>("/meta/disconnect");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to disconnect Meta"
    );
  }
};

/**
 * GET /meta/accounts
 */
export const getMetaAccounts = async (): Promise<MetaAccountsResponse> => {
  try {
    const response = await api.get<MetaAccountsResponse>("/meta/accounts");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to load Meta ad accounts"
    );
  }
};

/**
 * GET /meta/campaigns?accountId=xxx
 */
export const getMetaCampaigns = async (
  accountId: string
): Promise<MetaCampaignsResponse> => {
  try {
    const response = await api.get<MetaCampaignsResponse>("/meta/campaigns", {
      params: { accountId },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to load Meta campaigns"
    );
  }
};

/**
 * GET /meta/insights?campaignId=xxx
 */
export const getMetaInsights = async (
  campaignId: string
): Promise<MetaCampaignInsightsResponse> => {
  try {
    const response = await api.get<MetaCampaignInsightsResponse>(
      "/meta/insights",
      { params: { campaignId } }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to load Meta campaign insights"
    );
  }
};

