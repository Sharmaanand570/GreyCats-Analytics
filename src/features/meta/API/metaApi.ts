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

export type MetaAdAccount = {
  dbId: number;
  accountId: string;
  name: string;
  // Business Manager that owns this ad account. Null for personal/unowned
  // accounts or when Meta's /act_{id}?fields=business call fails — treat
  // null as "unknown ownership" and skip cross-business comparisons.
  businessId: string | null;
  businessName: string | null;
};

export type MetaPage = {
  dbId: number;
  pageId: string;
  name: string;
  // Same semantics as MetaAdAccount.businessId — null = personal page or
  // unknown ownership.
  businessId: string | null;
  businessName: string | null;
};

export type MetaAccountsResponse = {
  success: boolean;
  adAccounts: MetaAdAccount[];
  pages: MetaPage[];
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

// -------- New Meta Ads Endpoints Types --------

export type MetaAdsSummary = {
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
};

export type MetaAdsSummaryResponse = {
  success: boolean;
  message?: string;
  accountId?: string;
  accountName?: string;
  summary: MetaAdsSummary;
};

export type MetaAdsCampaignItem = {
  id: string;
  name: string;
  status: string;
  objective: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  spend?: number;
  impressions?: number;
  clicks?: number;
};

export type MetaAdsCampaignsResponse = {
  success: boolean;
  campaigns: MetaAdsCampaignItem[];
};

export type MetaAdsTrendItem = {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
};

export type MetaAdsTrendsResponse = {
  success: boolean;
  trends: MetaAdsTrendItem[];
};

export type MetaAdsMetaResponse = {
  success: boolean;
  connected: boolean;
  accountId?: string;
  accountName?: string;
  lastSync?: string;
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

// ==================== AUDIENCES (Round 4) ====================

/**
 * GET /clients/:clientId/audiences
 * Returns Custom + Website + Lookalike audiences for the client's ad account.
 */
export const getAudiences = async (
  clientId: number
): Promise<import("./metaAdsManagerApi").AudiencesResponse> => {
  try {
    const response = await api.get<import("./metaAdsManagerApi").AudiencesResponse>(
      `/clients/${clientId}/audiences`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to load audiences"
    );
  }
};

/**
 * POST /clients/:clientId/audiences/customer-list
 * Backend SHA-256 hashes emails before forwarding to Meta.
 */
export const createCustomerListAudience = async (
  clientId: number,
  payload: { name: string; emails: string[] }
): Promise<{ id: string; status: string }> => {
  try {
    const response = await api.post<{ id: string; status: string }>(
      `/clients/${clientId}/audiences/customer-list`,
      payload
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to create customer list audience"
    );
  }
};

/**
 * POST /clients/:clientId/audiences/website-traffic
 */
export const createWebsiteTrafficAudience = async (
  clientId: number,
  payload: {
    name: string;
    pixelId: string;
    retentionDays: number;
    rules: { event: string; url?: string }[];
  }
): Promise<{ id: string; status: string }> => {
  try {
    const response = await api.post<{ id: string; status: string }>(
      `/clients/${clientId}/audiences/website-traffic`,
      payload
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to create website-traffic audience"
    );
  }
};

/**
 * POST /clients/:clientId/audiences/lookalike
 */
export const createLookalikeAudience = async (
  clientId: number,
  payload: {
    name: string;
    sourceAudienceId: string;
    country: string;
    ratio: 0.01 | 0.02 | 0.05 | 0.1;
  }
): Promise<{ id: string; status: string }> => {
  try {
    const response = await api.post<{ id: string; status: string }>(
      `/clients/${clientId}/audiences/lookalike`,
      payload
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to create lookalike audience"
    );
  }
};

/**
 * DELETE /clients/:clientId/audiences/:audienceId
 */
export const deleteAudience = async (
  clientId: number,
  audienceId: string
): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete<{ success: boolean }>(
      `/clients/${clientId}/audiences/${audienceId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to delete audience"
    );
  }
};

/**
 * GET /clients/:clientId/meta/pixels
 * Returns the Meta Pixels attached to the client's ad account. Required for
 * the Sales-objective conversion-tracking dropdown.
 */
export const getMetaPixels = async (
  clientId: number
): Promise<import("./metaAdsManagerApi").MetaPixelsResponse> => {
  try {
    const response = await api.get<import("./metaAdsManagerApi").MetaPixelsResponse>(
      `/clients/${clientId}/meta/pixels`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to load Meta pixels"
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
    console.error("❌ Meta Ads Campaigns Error:", error);
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
    console.error("❌ Meta Ads Insights Error:", error);
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

// ==================== NEW META ADS ENDPOINTS ====================

/**
 * GET /api/clients/:clientId/meta-ads/summary
 * Get Meta Ads summary metrics for last 30 days
 */
export const getMetaAdsSummary = async (
  clientId: number
): Promise<MetaAdsSummaryResponse> => {
  try {
    const response = await api.get<MetaAdsSummaryResponse>(
      `/clients/${clientId}/meta-ads/summary`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Meta Ads Summary Error:", error);
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to load Meta Ads summary"
    );
  }
};

/**
 * GET /api/clients/:clientId/meta-ads/campaigns
 * Get list of Meta Ads campaigns with status, objective, budgets
 */
export const getMetaAdsCampaigns = async (
  clientId: number
): Promise<MetaAdsCampaignsResponse> => {
  try {
    const response = await api.get<MetaAdsCampaignsResponse>(
      `/clients/${clientId}/meta-ads/campaigns`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Meta Ads Campaigns Error:", error);
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to load Meta Ads campaigns"
    );
  }
};

/**
 * GET /api/clients/:clientId/meta-ads/trends
 * Get daily breakdown of Meta Ads performance
 */
export const getMetaAdsTrends = async (
  clientId: number,
  params?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<MetaAdsTrendsResponse> => {
  try {
    const response = await api.get<MetaAdsTrendsResponse>(
      `/clients/${clientId}/meta-ads/trends`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Meta Ads Trends Error:", error);
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to load Meta Ads trends"
    );
  }
};

/**
 * GET /api/clients/:clientId/meta-ads/meta
 * Get Meta Ads connection status
 */
export const getMetaAdsMeta = async (
  clientId: number
): Promise<MetaAdsMetaResponse> => {
  try {
    const response = await api.get<MetaAdsMetaResponse>(
      `/clients/${clientId}/meta-ads/meta`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Meta Ads Meta Error:", error);
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to load Meta Ads connection status"
    );
  }
};

