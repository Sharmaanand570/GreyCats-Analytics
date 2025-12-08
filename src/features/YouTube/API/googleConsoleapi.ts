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

const buildGoogleSeoBaseUrl = (): string => {
  const rawBase = import.meta.env.VITE_NGROK_URL || api.defaults.baseURL || "";
  if (!rawBase) return "";

  // Normalize to avoid accidental double "/api/google-seo" when the env already
  // contains it (common when pointing directly to the SEO service).
  const base = rawBase.endsWith("/")
    ? rawBase.slice(0, -1)
    : rawBase;

  if (base.includes("/google-seo")) {
    return base;
  }

  if (base.endsWith("/api")) {
    return `${base}/google-seo`;
  }

  return `${base}/api/google-seo`;
};

const seoHeaders = { "ngrok-skip-browser-warning": "true" };

const handleGoogleConsoleApiError = (
  error: unknown,
  fallbackMessage: string
): never => {
  const axiosError = error as AxiosError<GoogleConsoleApiErrorResponse>;
  throw new Error(
    axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      fallbackMessage
  );
};

// ==================== API FUNCTIONS ====================

/**
 * 1) CONNECT GOOGLE SEARCH CONSOLE
 * POST /api/google-seo/connect
 */
export const connectGoogleConsole =
  async (): Promise<ConnectGoogleConsoleResponse> => {
    try {
      const response = await api.post<ConnectGoogleConsoleResponse>(
        "/connect",
        {},
        {
          baseURL: buildGoogleSeoBaseUrl(),
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
 * POST /api/google-seo/reconnect
 */
export const reconnectGoogleConsole =
  async (): Promise<GoogleConsoleReconnectResponse> => {
    try {
      const response = await api.post<GoogleConsoleReconnectResponse>(
        "/reconnect",
        {},
        {
          baseURL: buildGoogleSeoBaseUrl(),
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
 * POST /api/google-seo/disconnect
 */
export const disconnectGoogleConsole =
  async (): Promise<GoogleConsoleDisconnectResponse> => {
    try {
      const response = await api.post<GoogleConsoleDisconnectResponse>(
        "/disconnect",
        {},
        {
          baseURL: buildGoogleSeoBaseUrl(),
        headers: seoHeaders,
        }
      );
      return response.data;
    } catch (error) {
      return handleGoogleConsoleApiError(
        error,
        "Failed to disconnect Google Search Console"
      );
    }
  };

/**
 * 4) LIST SEARCH CONSOLE PROPERTIES
 * GET /api/google-seo/properties
 */
export const getGoogleConsoleProperties =
  async (): Promise<GoogleConsolePropertiesResponse> => {
    try {
    const response = await api.get<GoogleConsolePropertiesResponse>(
      "/properties",
      {
        baseURL: buildGoogleSeoBaseUrl(),
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
 * POST /api/google-seo/properties/select
 */
export const selectGoogleConsoleProperty = async (
  body: GoogleConsoleSelectPropertyBody
): Promise<GoogleConsoleSelectPropertyResponse> => {
  try {
    const response = await api.post<GoogleConsoleSelectPropertyResponse>(
      "/properties/select",
      body,
      {
        baseURL: buildGoogleSeoBaseUrl(),
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
 * POST /api/google-seo/performance
 */
export const fetchGoogleConsolePerformance = async (
  payload: GoogleConsolePerformanceRequest
): Promise<GoogleConsolePerformanceResponse> => {
  try {
    const response = await api.post<GoogleConsolePerformanceResponse>(
      "/performance",
      payload,
      {
        baseURL: buildGoogleSeoBaseUrl(),
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
 * GET /api/unified-metrics?integration=google-search-console&metricKey=google_seo.clicks
 */
export const getGoogleConsoleUnifiedMetrics = async (
  params: GoogleConsoleUnifiedMetricsParams = {}
): Promise<GoogleConsoleUnifiedMetricsResponse> => {
  try {
    const response = await api.get<GoogleConsoleUnifiedMetricsResponse>(
      "/unified-metrics",
      {
        params: {
          integration: "google-search-console",
          metricKey: "google_seo.clicks",
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

 