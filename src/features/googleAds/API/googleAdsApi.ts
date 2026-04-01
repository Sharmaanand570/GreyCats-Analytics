import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type ApiErrorResponse = {
    message?: string;
    error?: string;
};

/** Step A: GET /api/google-ads/auth */
export type GoogleAdsAuthResponse = {
    success: boolean;
    url: string;
};

/** Step C: GET /api/google-ads/accounts */
export type GoogleAdsAccount = {
    customerId: string;
    descriptiveName: string;
    currencyCode: string;
    timeZone: string;
};

export type GoogleAdsAccountsResponse = {
    success: boolean;
    accounts: GoogleAdsAccount[];
};

/** Step D: POST /api/google-ads/connect */
export type GoogleAdsConnectPayload = {
    customerId: string;
    customerName: string;
    clientId: number;
};

export type GoogleAdsConnectResponse = {
    success: boolean;
    message: string;
    accountId: number;
    warning?: string;
};

/** Step E: DELETE /api/google-ads/:clientId/disconnect */
export type GoogleAdsDisconnectResponse = {
    success: boolean;
    message: string;
};

/** Summary endpoint */
export type GoogleAdsSummary = {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    viewThroughConversions: number;
    ctr: number;
    cpc: number;
    cpm: number;
    conversionRate: number;
    costPerConversion: number;
    roas: number;
};

export type GoogleAdsSummaryResponse = {
    success: boolean;
    accountName: string;
    customerId: string;
    summary: GoogleAdsSummary;
};

/** Campaign endpoint */
export type GoogleAdsCampaign = {
    id: string;
    name: string;
    status: string;
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
    revenue: number;
    viewThroughConversions: number;
    ctr: number;
    cpc: number;
    conversionRate: number;
    costPerConversion: number;
    roas: number;
};

export type GoogleAdsCampaignsResponse = {
    success: boolean;
    campaigns: GoogleAdsCampaign[];
};

// ==================== API FUNCTIONS ====================

/**
 * Step A: Initiate Google Ads OAuth
 * GET /api/google-ads/auth
 */
export const initiateGoogleAdsAuth = async (): Promise<GoogleAdsAuthResponse> => {
    try {
        const response = await api.get<GoogleAdsAuthResponse>("/google-ads/auth");
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            "Failed to initiate Google Ads connection"
        );
    }
};

/**
 * Step C: List available Google Ads accounts
 * GET /api/google-ads/accounts
 */
export const getGoogleAdsAccounts = async (): Promise<GoogleAdsAccountsResponse> => {
    try {
        const response = await api.get<GoogleAdsAccountsResponse>("/google-ads/accounts");
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            "Failed to fetch Google Ads accounts"
        );
    }
};

/**
 * Step D: Connect a Google Ads account to a client
 * POST /api/google-ads/connect
 */
export const connectGoogleAdsAccount = async (
    payload: GoogleAdsConnectPayload
): Promise<GoogleAdsConnectResponse> => {
    try {
        const response = await api.post<GoogleAdsConnectResponse>("/google-ads/connect", payload);
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            "Failed to connect Google Ads account"
        );
    }
};

/**
 * Step E: Disconnect Google Ads from a client
 * DELETE /api/google-ads/:clientId/disconnect
 */
export const disconnectGoogleAds = async (
    clientId: number
): Promise<GoogleAdsDisconnectResponse> => {
    try {
        const response = await api.delete<GoogleAdsDisconnectResponse>(
            `/google-ads/${clientId}/disconnect`
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            "Failed to disconnect Google Ads"
        );
    }
};

/**
 * Summary metrics
 * GET /api/google-ads/:clientId/summary
 */
export const getGoogleAdsSummary = async (
    clientId: number,
    params?: { startDate?: string; endDate?: string; accountId?: string }
): Promise<GoogleAdsSummaryResponse> => {
    try {
        const response = await api.get<GoogleAdsSummaryResponse>(
            `/google-ads/${clientId}/summary`,
            { params }
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            "Failed to load Google Ads summary"
        );
    }
};

/**
 * Campaign performance
 * GET /api/google-ads/:clientId/campaigns
 */
export const getGoogleAdsCampaigns = async (
    clientId: number,
    params?: { startDate?: string; endDate?: string; accountId?: string }
): Promise<GoogleAdsCampaignsResponse> => {
    try {
        const response = await api.get<GoogleAdsCampaignsResponse>(
            `/google-ads/${clientId}/campaigns`,
            { params }
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            "Failed to load Google Ads campaigns"
        );
    }
};
