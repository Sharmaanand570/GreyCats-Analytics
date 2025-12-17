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

export type MetaSyncResponse = {
  success: boolean;
  totalCampaigns: number;
  totalNormalized: number;
  results: any[];
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
    const response = await api.get<MetaConnectResponse>("/meta/connect");

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
      params: queryParams,
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
 * GET /clients/:clientId/meta/reconnect
 */
export const reconnectMeta = async (clientId: number): Promise<MetaReconnectResponse> => {
  try {
    const response = await api.get<MetaReconnectResponse>(`/clients/${clientId}/meta/reconnect`);
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
 * POST /clients/:clientId/meta/disconnect
 */
export const disconnectMeta = async (clientId: number): Promise<MetaDisconnectResponse> => {
  try {
    const response = await api.post<MetaDisconnectResponse>(`/clients/${clientId}/meta/disconnect`);
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
 * GET /clients/:clientId/meta/accounts
 */
export const getMetaAccounts = async (clientId: number): Promise<MetaAccountsResponse> => {
  try {
    const response = await api.get<MetaAccountsResponse>(`/clients/${clientId}/meta/accounts`);
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
 * GET /clients/:clientId/meta/campaigns?accountId=xxx
 */
export const getMetaCampaigns = async (
  clientId: number,
  accountId: string
): Promise<MetaCampaignsResponse> => {
  try {
    const response = await api.get<MetaCampaignsResponse>(`/clients/${clientId}/meta/campaigns`, {
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
 * GET /clients/:clientId/meta/insights?campaignId=xxx
 */
export const getMetaInsights = async (
  clientId: number,
  campaignId: string
): Promise<MetaCampaignInsightsResponse> => {
  try {
    const response = await api.get<MetaCampaignInsightsResponse>(
      `/clients/${clientId}/meta/insights`,
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

/**
 * POST /clients/:clientId/meta/sync/:accountId
 * Sync Meta Ads campaigns and insights for an account
 */
export const syncMetaAds = async (
  clientId: number,
  accountId: string
): Promise<MetaSyncResponse> => {
  try {
    const response = await api.post<MetaSyncResponse>(
      `/clients/${clientId}/meta/sync/${accountId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to sync Meta Ads data"
    );
  }
};
