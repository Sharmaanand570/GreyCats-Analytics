import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type connectGoogleTypeResponse = {
  success: boolean;
  url: string;
};

export type GoogleCallbackResponse = {
  success: boolean;
  message: string;
};

export type GoogleCallbackParams = {
  code: string;
  state: string;
};

export type GoogleReconnectResponse = {
  success: boolean;
  message?: string;
  url: string;
};

export type GoogleDisconnectResponse = {
  success: boolean;
  message: string;
};

export type GoogleProperty = {
  id: string;
  displayName: string;
  currencyCode: string;
  createTime: string;
  accountName: string;
};

export type GooglePropertiesResponse = {
  success: boolean;
  message: string;
  count: number;
  properties: GoogleProperty[];
};

export type GoogleSelectPropertyBody = {
  propertyId: string;
  propertyName: string;
};

export type GoogleSelectPropertyResponse = {
  success: boolean;
  message: string;
  propertyId: string;
  propertyName: string;
};

export type GoogleAnalyticsPropertiesResponse = {
  success: boolean;
  message: string;
  count: number;
  properties: GoogleProperty[];
};

export type GoogleAnalyticsTrendsPoint = {
  date: string;
  sessions: number;
  activeUsers: number;
  pageViews: number;
};

export type GoogleAnalyticsTrendsResponse = {
  success: boolean;
  message: string;
  trends: GoogleAnalyticsTrendsPoint[];
};

export type GoogleAnalyticsTopPage = {
  pagePath: string;
  pageTitle: string;
  views: number;
};

export type GoogleAnalyticsTopPagesResponse = {
  success: boolean;
  message: string;
  topPages: GoogleAnalyticsTopPage[];
};

export type GoogleAnalyticsMetaResponse = {
  success: boolean;
  message: string;
  property: string;
  dataCount: number;
};

export type GoogleAnalyticsSummary = {
  totalSessions: number;
  totalUsers: number;
  totalViews: number;
  avgBounceRate: number;
};

export type GoogleAnalyticsSummaryResponse = {
  success: boolean;
  message: string;
  summary: GoogleAnalyticsSummary;
};

export type GoogleApiErrorResponse = {
  message?: string;
  error?: string;
};

const handleGoogleApiError = (error: unknown, fallbackMessage: string): never => {
  const axiosError = error as AxiosError<GoogleApiErrorResponse>;
  throw new Error(
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    fallbackMessage
  );
};

// ==================== API FUNCTIONS ====================

// ==================== API FUNCTIONS ====================

export const connectGoogle = async (): Promise<connectGoogleTypeResponse> => {
  try {
    // Using standard api client to avoid CORS issues with manual baseURL
    const response = await api.get<connectGoogleTypeResponse>("/google/connect");
    return response.data;
  } catch (error) {
    return handleGoogleApiError(error, "Failed to initiate Google connection");
  }
};

export const handleGoogleCallback = async (
  params: GoogleCallbackParams
): Promise<GoogleCallbackResponse> => {
  try {
    const response = await api.get<GoogleCallbackResponse>("/google/callback", {
      params: {
        code: params.code,
        state: params.state,
      },
    });
    return response.data;
  } catch (error) {
    return handleGoogleApiError(error, "Failed to complete Google connection");
  }
};

export const reconnectGoogle = async (
  clientId: number
): Promise<GoogleReconnectResponse> => {
  try {
    const response = await api.get<GoogleReconnectResponse>(
      `/clients/${clientId}/google-analytics/reconnect`
    );
    return response.data;
  } catch (error) {
    return handleGoogleApiError(
      error,
      "Failed to generate Google reconnect URL"
    );
  }
};

export const disconnectGoogle = async (
  clientId: number
): Promise<GoogleDisconnectResponse> => {
  console.log("Disconnecting Google Analytics for client:", clientId);
  try {

    const response = await api.delete<GoogleDisconnectResponse>(
      `/clients/${clientId}/google-analytics/disconnect`
    );
    return response.data;
  } catch (error) {
    console.log("Error disconnecting Google Analytics:", error);
    return handleGoogleApiError(error, "Failed to disconnect Google Analytics");
  }
};

export const getGoogleProperties = async (
  clientId: number
): Promise<GooglePropertiesResponse> => {
  try {
    const response = await api.get<GooglePropertiesResponse>(
      `/clients/${clientId}/google-analytics/properties`
    );
    return response.data;
  } catch (error) {
    return handleGoogleApiError(error, "Failed to load GA4 properties");
  }
};

export const selectGoogleProperty = async (
  clientId: number,
  body: GoogleSelectPropertyBody
): Promise<GoogleSelectPropertyResponse> => {
  try {
    const response = await api.post<GoogleSelectPropertyResponse>(
      `/clients/${clientId}/google-analytics/select-property`,
      body
    );
    return response.data;
  } catch (error) {
    return handleGoogleApiError(error, "Failed to save GA4 property");
  }
};

export const getGoogleAnalyticsProperties = async (
  clientId: number
): Promise<GoogleAnalyticsPropertiesResponse> => {
  try {
    const response = await api.get<GoogleAnalyticsPropertiesResponse>(
      `/clients/${clientId}/google-analytics/meta`
    );
    return response.data;
  } catch (error) {
    return handleGoogleApiError(
      error,
      "Failed to load Google Analytics properties"
    );
  }
};

export const getGoogleAnalyticsTrends = async (
  clientId: number
): Promise<GoogleAnalyticsTrendsResponse> => {
  try {
    const response = await api.get<GoogleAnalyticsTrendsResponse>(
      `/clients/${clientId}/google-analytics/trends`
    );
    return response.data;
  } catch (error) {
    return handleGoogleApiError(error, "Failed to load analytics trends");
  }
};

export const getGoogleAnalyticsTopPages = async (
  clientId: number
): Promise<GoogleAnalyticsTopPagesResponse> => {
  try {
    const response = await api.get<GoogleAnalyticsTopPagesResponse>(
      `/clients/${clientId}/google-analytics/top-pages`
    );
    return response.data;
  } catch (error) {
    return handleGoogleApiError(error, "Failed to load top pages");
  }
};

export const getGoogleAnalyticsMeta = async (
  clientId: number
): Promise<GoogleAnalyticsMetaResponse> => {
  try {
    const response = await api.get<GoogleAnalyticsMetaResponse>(
      `/clients/${clientId}/google-analytics/meta`
    );
    return response.data;
  } catch (error) {
    return handleGoogleApiError(error, "Failed to load Google analytics meta");
  }
};

export const getGoogleAnalyticsSummary = async (
  clientId: number
): Promise<GoogleAnalyticsSummaryResponse> => {
  try {
    const response = await api.get<GoogleAnalyticsSummaryResponse>(
      `/clients/${clientId}/google-analytics/summary`
    );
    return response.data;
  } catch (error) {
    return handleGoogleApiError(error, "Failed to load analytics summary");
  }
};
