import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES (GOOGLE SEARCH CONSOLE / SEO) ====================

export type ConnectGoogleConsoleResponse = {
  success: boolean;
  url: string;
};

export type GoogleConsoleReconnectResponse = {
  success: boolean;
  url: string;
};

export type GoogleConsoleDisconnectResponse = {
  success: boolean;
  message: string;
};

export type GoogleConsoleProperty = {
  id: number;
  siteUrl: string;
  permissionLevel: string;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GoogleConsolePropertiesResponse = {
  success: boolean;
  count: number;
  properties: GoogleConsoleProperty[];
};

export type GoogleConsoleSelectPropertyBody = {
  siteUrl: string;
};

export type GoogleConsoleSelectPropertyResponse = {
  success: boolean;
  message: string;
  selected: string;
};

export type GoogleConsolePerformanceRequest = {
  siteUrl: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dimension: string; // "date" | "query" | "page" | "country" | "device" | ...
};

export type GoogleConsolePerformanceRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GoogleConsolePerformanceResponse = {
  success: boolean;
  rows: GoogleConsolePerformanceRow[];
};

export type GoogleConsoleUnifiedMetricRow = {
  id: number;
  userId: number;
  integration: string;
  accountId: string;
  metricKey: string;
  dimensionType: string | null;
  dimensionValue: string | null;
  date: string;
  value: number;
  extra: unknown;
  recordedAt: string;
};

export type GoogleConsoleUnifiedMetricsResponse = {
  success: boolean;
  rows: GoogleConsoleUnifiedMetricRow[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GoogleConsoleUnifiedMetricsParams = {
  integration?: string;
  metricKey?: string;
  /**
   * Supports either a single dimension or multiple dimensions (array).
   * Example: "query" or ["query", "date"]
   */
  dimensionType?: string | string[];
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  accountId?: string;
  page?: number;
  limit?: number;
};

export type GoogleConsoleApiErrorResponse = {
  message?: string;
  error?: string;
};

// ==================== OVERVIEW ENDPOINTS TYPES ====================

export type GoogleConsoleSummaryMetrics = {
  totalClicks: number;
  totalImpressions: number;
  avgCTR: number;
  avgPosition: number;
};

export type GoogleConsoleSummaryResponse = {
  success: boolean;
  message?: string;
  propertyUrl?: string;
  summary: GoogleConsoleSummaryMetrics;
};

export type GoogleConsoleTrendDataPoint = {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GoogleConsoleTrendsResponse = {
  success: boolean;
  trends: GoogleConsoleTrendDataPoint[];
  period: string;
};

export type GoogleConsoleTopPage = {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GoogleConsoleTopPagesResponse = {
  success: boolean;
  topPages: GoogleConsoleTopPage[];
  period?: string;
};

export type GoogleConsoleTopQuery = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GoogleConsoleTopQueriesResponse = {
  success: boolean;
  topQueries: GoogleConsoleTopQuery[];
  period?: string;
};

export type GoogleConsoleMetaResponse = {
  success: boolean;
  connected: boolean;
  propertyUrl?: string;
  lastSync?: string;
};



const seoHeaders = {};

const handleGoogleConsoleApiError = (
  error: unknown,
  fallbackMessage: string
): never => {
  const axiosError = error as AxiosError<GoogleConsoleApiErrorResponse>;
  throw new Error(
    axiosError.response?.data?.error ||
    axiosError.response?.data?.message ||
    fallbackMessage
  );
};

// ==================== API FUNCTIONS ====================

/**
 * 1) CONNECT GOOGLE SEARCH CONSOLE
 * GET /api/google-seo/connect
 */
export const connectGoogleConsole =
  async (): Promise<ConnectGoogleConsoleResponse> => {
    try {
      const response = await api.post<ConnectGoogleConsoleResponse>(
        "/google-seo/connect",
        {
          baseURL: import.meta.env.VITE_NGROK_URL,
          headers: seoHeaders,
        }
      );
      return response.data;
    } catch (error) {
      return handleGoogleConsoleApiError(
        error,
        "Failed to initiate Google Search Console connection"
      );
    }
  };

/**
 * 2) RECONNECT GOOGLE SEARCH CONSOLE
 * POST /clients/:clientId/google-search-console/reconnect
 */
export const reconnectGoogleConsole = async (
  clientId: number
): Promise<GoogleConsoleReconnectResponse> => {
  try {
    const response = await api.get<GoogleConsoleReconnectResponse>(
      `/google-seo/reconnect`,
      {
        params: { clientId },
        headers: seoHeaders,
      }
    );
    return response.data;
  } catch (error) {
    return handleGoogleConsoleApiError(
      error,
      "Failed to generate Google Search Console reconnect URL"
    );
  }
};

/**
 * 3) DISCONNECT GOOGLE SEARCH CONSOLE
 * POST /clients/:clientId/google-search-console/disconnect
 */
export const disconnectGoogleConsole = async (
  clientId: number
): Promise<GoogleConsoleDisconnectResponse> => {
  const response = await api.post<GoogleConsoleDisconnectResponse>(
    `/clients/${clientId}/google-search-console/disconnect`,
    {},
    {
      headers: seoHeaders,
    }
  );
  return response.data;
};

/**
 * 4) LIST SEARCH CONSOLE PROPERTIES
 * GET /clients/:clientId/google-search-console/properties
 */
export const getGoogleConsoleProperties = async (
  clientId: number
): Promise<GoogleConsolePropertiesResponse> => {
  try {
    const response = await api.get<GoogleConsolePropertiesResponse>(
      `/google-seo/properties`,
      {
        params: { clientId },
        headers: seoHeaders,
      }
    );
    console.log("response-----------------------------", response.data);
    return response.data;
  } catch (error) {
    return handleGoogleConsoleApiError(
      error,
      "Failed to load Google Search Console properties"
    );
  }
};

/**
 * 5) SELECT A PROPERTY
 * POST /clients/:clientId/google-search-console/properties/select
 */
export const selectGoogleConsoleProperty = async (
  clientId: number,
  body: GoogleConsoleSelectPropertyBody
): Promise<GoogleConsoleSelectPropertyResponse> => {
  try {
    const response = await api.post<GoogleConsoleSelectPropertyResponse>(
      `/google-seo/select-property`,
      { ...body, clientId },
      {
        headers: seoHeaders,
      }
    );
    return response.data;
  } catch (error) {
    return handleGoogleConsoleApiError(
      error,
      "Failed to select Google Search Console property"
    );
  }
};

/**
 * 6) MANUAL PERFORMANCE FETCH
 * POST /clients/:clientId/google-search-console/performance
 */
export const fetchGoogleConsolePerformance = async (
  clientId: number,
  payload: GoogleConsolePerformanceRequest
): Promise<GoogleConsolePerformanceResponse> => {
  try {
    const response = await api.post<GoogleConsolePerformanceResponse>(
      `/clients/${clientId}/google-search-console/performance`,
      payload,
      {
        headers: seoHeaders,
      }
    );
    return response.data;
  } catch (error) {
    return handleGoogleConsoleApiError(
      error,
      "Failed to fetch Google Search Console performance data"
    );
  }
};

/**
 * 7) VERIFY CRON OUTPUT (UnifiedMetric)
 * GET /clients/:clientId/google-search-console/unified-metrics
 */
export const getGoogleConsoleUnifiedMetrics = async (
  clientId: number,
  params: GoogleConsoleUnifiedMetricsParams = {}
): Promise<GoogleConsoleUnifiedMetricsResponse> => {
  try {
    const response = await api.get<GoogleConsoleUnifiedMetricsResponse>(
      `/clients/${clientId}/google-search-console/unified-metrics`,
      {
        params: {
          integration: "google-search-console",

          ...params,
        },
        headers: seoHeaders,
      }
    );

    console.log("unified metrics", response);
    return response.data;
  } catch (error) {
    return handleGoogleConsoleApiError(
      error,
      "Failed to load Google Search Console unified metrics"
    );
  }
};

// ==================== OVERVIEW ENDPOINTS ====================

/**
 * 8) GET SUMMARY METRICS
 * GET /clients/:clientId/google-search-console/summary
 */
export const getGoogleConsoleSummary = async (
  clientId: number,
  params: { startDate?: string; endDate?: string } = {}
): Promise<GoogleConsoleSummaryResponse> => {
  try {
    console.log(`[API] Fetching GSC Summary for client ${clientId}`, params);
    const response = await api.get<GoogleConsoleSummaryResponse>(
      `/clients/${clientId}/google-search-console/summary`,
      { params }
    );
    console.log(`[API] GSC Summary Response for client ${clientId}:`, response.data);
    const body = response.data as any;
    return body.data ? { success: body.success, ...body.data } : body;
  } catch (error) {
    console.error(`[API] GSC Summary Error for client ${clientId}:`, error);
    return handleGoogleConsoleApiError(
      error,
      "Failed to load Google Search Console summary"
    );
  }
};

/**
 * 9) GET TRENDS DATA
 * GET /clients/:clientId/google-search-console/trends
 */
export const getGoogleConsoleTrends = async (
  clientId: number
): Promise<GoogleConsoleTrendsResponse> => {
  try {
    const response = await api.get<GoogleConsoleTrendsResponse>(
      `/clients/${clientId}/google-search-console/trends`,
      {
        headers: seoHeaders,
      }
    );
    return response.data;
  } catch (error) {
    return handleGoogleConsoleApiError(
      error,
      "Failed to load Google Search Console trends"
    );
  }
};

/**
 * 10) GET TOP PAGES
 * GET /clients/:clientId/google-search-console/top-pages
 */
export const getGoogleConsoleTopPages = async (
  clientId: number,
  params: { startDate?: string; endDate?: string } = {}
): Promise<GoogleConsoleTopPagesResponse> => {
  try {
    console.log(`[API] Fetching GSC Top Pages for client ${clientId}`, params);
    const response = await api.get<GoogleConsoleTopPagesResponse>(
      `/clients/${clientId}/google-search-console/top-pages`,
      { params, timeout: 60000 }
    );
    console.log(`[API] GSC Top Pages Response for client ${clientId}:`, response.data);
    const body = response.data as any;
    return body.data ? { success: body.success, ...body.data } : body;
  } catch (error) {
    console.error(`[API] GSC Top Pages Error for client ${clientId}:`, error);
    return handleGoogleConsoleApiError(
      error,
      "Failed to load Google Search Console top pages"
    );
  }
};

/**
 * 11) GET TOP QUERIES
 * GET /clients/:clientId/google-search-console/top-queries
 */
export const getGoogleConsoleTopQueries = async (
  clientId: number,
  params: { startDate?: string; endDate?: string } = {}
): Promise<GoogleConsoleTopQueriesResponse> => {
  try {
    console.log(`[API] Fetching GSC Top Queries for client ${clientId}`, params);
    const response = await api.get<GoogleConsoleTopQueriesResponse>(
      `/clients/${clientId}/google-search-console/top-queries`,
      { params, timeout: 60000 }
    );
    console.log(`[API] GSC Top Queries Response for client ${clientId}:`, response.data);
    const body = response.data as any;
    return body.data ? { success: body.success, ...body.data } : body;
  } catch (error) {
    console.error(`[API] GSC Top Queries Error for client ${clientId}:`, error);
    return handleGoogleConsoleApiError(
      error,
      "Failed to load Google Search Console top queries"
    );
  }
};

/**
 * 12) GET META/CONNECTION STATUS
 * GET /clients/:clientId/google-search-console/meta
 */
export const getGoogleConsoleMeta = async (
  clientId: number
): Promise<GoogleConsoleMetaResponse> => {
  try {
    const response = await api.get<GoogleConsoleMetaResponse>(
      `/clients/${clientId}/google-search-console/meta`
    );
    return response.data;
  } catch (error) {
    return handleGoogleConsoleApiError(
      error,
      "Failed to load Google Search Console connection status"
    );
  }
};


