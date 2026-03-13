/**
 * Unified Metrics API Service
 *
 * Encapsulates all calls to the /api/unified-metrics/* endpoints.
 * This is the single data-layer entry point for all metric fetching.
 */

import api from "@/apiConfig";
import type { MetricKey, IntegrationId } from "@/constants/metricKeys";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated Legacy row format — use MetricDataResponse.data.series instead */
export interface MetricDataPoint {
  date: string;
  value: number;
  dimensionType?: string;
  dimensionValue?: string;
  extra?: Record<string, unknown>;
}

/**
 * Actual response shape from GET /api/unified-metrics/data
 * { success, data: { series: [{x, y}], total, rawCount } }
 */
export interface MetricDataResponse {
  success: boolean;
  data: {
    series: Array<{ x: string; y: number }>;
    total: number;
    rawCount: number;
  };
}

export interface GetMetricDataParams {
  integration: IntegrationId | string;
  accountId?: string;
  metricKey: MetricKey | string;
  dateFrom: string;
  dateTo: string;
  groupBy?: "day" | "week" | "month" | "none";
  aggregation?: "sum" | "avg" | "min" | "max" | "last";
  fillMissing?: boolean;
  clientId?: number;
  token?: string;
  signal?: AbortSignal;
}

// ── Batch resolver ────────────────────────────────────────────────────────────

export interface BatchWidgetRequest {
  id: string;
  metricKey: MetricKey | string;
  integration: IntegrationId | string;
  accountId?: string;
  groupBy?: string;
  aggregation?: string;
  filters?: Record<string, unknown>;
}

export interface BatchResolvePayload {
  widgets: BatchWidgetRequest[];
  dateFrom: string;
  dateTo: string;
  clientId?: number;
}

export interface ResolvedWidgetResult {
  id: string;
  success: boolean;
  value?: number;
  /** Total / aggregate scalar for the date range */
  total?: number;
  /** Raw row count returned by the backend */
  rawCount?: number;
  series?: Array<{ x: string; y: number }>;
  rows?: unknown[];
  columns?: Array<{ name: string; width?: string }>;
  error?: string;
}

export interface BatchResolveResponse {
  success: boolean;
  results: ResolvedWidgetResult[];
  /** Indexed by widget id for O(1) lookup */
  byId: Record<string, ResolvedWidgetResult>;
}

// ── Demographics ──────────────────────────────────────────────────────────────

/**
 * Actual response from GET /api/meta-business/demographics/:accountId
 * {
 *   "ageGender":      { "M.18-24": 1200, "F.25-34": 800, ... },
 *   "fansByCity":     { "London, England": 450, ... },
 *   "fansByCountry":  { "US": 2000, "GB": 800, ... }
 * }
 */
export interface DemographicsResponse {
  success?: boolean;
  data?: {
    /** "{gender}.{ageRange}" → count  e.g. "M.25-34": 45 */
    ageGender: Record<string, number>;
    /** city name → follower count */
    fansByCity: Record<string, number>;
    /** country code → follower count */
    fansByCountry: Record<string, number>;
    date?: string;
  };
  // Some endpoints return the payload at root level (no wrapping data key)
  ageGender?: Record<string, number>;
  fansByCity?: Record<string, number>;
  fansByCountry?: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise integration identifiers to the format the backend expects.
 * The backend uses underscored names (meta_ads, google_analytics) except for
 * google-search-console which uses hyphens.
 */
export function normalizeIntegrationId(integration: string): string {
  if (integration === "google-search-console") return integration;
  if (integration === "woocommerce") return "woo";

  // Convert hyphens → underscores for all other integrations
  return integration.replace(/-/g, "_");
}

/**
 * Infer the canonical integration id from a metricKey prefix so that stale
 * widget configs cannot route to the wrong integration.
 */
export function inferIntegrationFromMetricKey(
  metricKey: string,
  fallback: string
): string {
  const k = metricKey.toLowerCase();
  if (k.startsWith("meta.ads.")) return "meta_ads";
  if (k.startsWith("meta.facebook.") || k.startsWith("meta.page."))
    return "meta_facebook";
  if (k.startsWith("meta.instagram.")) return "meta_instagram";
  if (k.startsWith("google_seo.")) return "google-search-console";
  if (k.startsWith("google_ads.")) return "google_ads";
  if (k.startsWith("ga4.") || k.startsWith("google."))
    return "google_analytics";
  if (k.startsWith("youtube.")) return "youtube";
  if (k.startsWith("shopify.")) return "shopify";
  if (k.startsWith("woo.")) return "woo";
  return normalizeIntegrationId(fallback);
}

// ─────────────────────────────────────────────────────────────────────────────
// Core API functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/unified-metrics/data
 *
 * Fetch time-series or aggregate data for a single metric.
 */
export async function getMetricData(
  params: GetMetricDataParams
): Promise<MetricDataResponse> {
  const integration = inferIntegrationFromMetricKey(
    params.metricKey,
    params.integration
  );

  const queryParams: Record<string, string> = {
    integration,
    metricKey: params.metricKey,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  // Some integrations scope data by clientId — sending accountId causes 0 rows
  // because the stored account ID format may differ from what the frontend holds.
  const NO_ACCOUNT_ID_INTEGRATIONS = new Set(["meta_ads", "meta_instagram", "meta_facebook", "google-search-console"]);
  if (params.accountId && !NO_ACCOUNT_ID_INTEGRATIONS.has(integration)) queryParams.accountId = params.accountId;
  if (params.groupBy && params.groupBy !== "none")
    queryParams.groupBy = params.groupBy;
  if (params.aggregation) queryParams.aggregation = params.aggregation;
  if (params.fillMissing != null)
    queryParams.fillMissing = String(params.fillMissing);
  if (params.clientId) queryParams.clientId = String(params.clientId);
  if (params.token) queryParams.token = params.token;

  // 🔍 DIAGNOSTIC: Log exact API params for debugging zero-value widgets
  console.log(`[getMetricData] →`, {
    integration,
    metricKey: params.metricKey,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    accountId: queryParams.accountId ?? '(none)',
    clientId: queryParams.clientId ?? '(none)',
    groupBy: queryParams.groupBy ?? '(none)',
  });

  console.log(`[UnifiedMetrics] GET /api/unified-metrics/data`, {
    integration,
    metricKey: params.metricKey,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    accountId: queryParams.accountId ?? "",
    clientId: queryParams.clientId ?? "",
    groupBy: queryParams.groupBy ?? "day",
    aggregation: queryParams.aggregation ?? "sum",
    fillMissing: queryParams.fillMissing ?? "true",
  });

  const response = await api.get<MetricDataResponse>(
    "/unified-metrics/data",
    {
      params: queryParams,
      ...(params.token ? { skipAuthRedirect: true } : {}),
      ...(params.signal ? { signal: params.signal } : {}),
    } as any
  );

  // 🔍 DIAGNOSTIC: Log response summary
  console.log(`[UnifiedMetrics] Response /api/unified-metrics/data`, response.data);

  const respSeries = response.data?.data?.series ?? [];
  const respTotal = response.data?.data?.total;
  console.log(`[getMetricData] ← ${params.metricKey}:`, {
    total: respTotal,
    seriesCount: respSeries.length,
    seriesNonZero: respSeries.filter((p: {x:string;y:number}) => p.y !== 0).length,
    firstPoint: respSeries[0],
    lastPoint: respSeries[respSeries.length - 1],
  });

  return response.data;
}

/**
 * POST /api/unified-metrics/resolve
 *
 * Batch resolver — fetches all widget metrics in a single round-trip.
 * Use this as the primary mechanism for dashboard data loading.
 */
export async function resolveDashboardMetrics(
  payload: BatchResolvePayload
): Promise<BatchResolveResponse> {
  const normalizedWidgets = payload.widgets.map((w) => ({
    ...w,
    integration: inferIntegrationFromMetricKey(w.metricKey, w.integration),
  }));

  const body = {
    widgets: normalizedWidgets,
    // New spec format
    dateFrom: payload.dateFrom,
    dateTo: payload.dateTo,
    // Legacy compat: existing backend reads dateRange.startDate / dateRange.endDate
    dateRange: { startDate: payload.dateFrom, endDate: payload.dateTo },
  };

  console.log(`[UnifiedMetrics] POST /api/unified-metrics/resolve`, {
    widgets: body.widgets,
    dateFrom: payload.dateFrom,
    dateTo: payload.dateTo,
    clientId: payload.clientId ?? "",
  });

  const response = await api.post<any>(
    "/unified-metrics/resolve",
    body,
    {
      ...(payload.clientId
        ? { params: { clientId: payload.clientId } }
        : {}),
    }
  );

  const raw = response.data;
  console.log(`[UnifiedMetrics] Response /api/unified-metrics/resolve`, raw);
  let results: ResolvedWidgetResult[] = [];

  // Defensive normalisation — backend may return one of several shapes:
  // 1. { success, results: [{id, value, series, rows}] }  ← new spec
  // 2. { success, data: { widgetId: {...} } }              ← keyed object
  // 3. { widgetId: {...} }                                 ← flat map (no success key)
  if (Array.isArray(raw?.results)) {
    results = raw.results;
  } else if (raw?.data && typeof raw.data === "object") {
    results = Object.entries(raw.data as Record<string, unknown>).map(
      ([id, val]) => ({ id, success: true, ...(val as object) } as ResolvedWidgetResult)
    );
  } else if (raw && typeof raw === "object" && !("success" in raw)) {
    results = Object.entries(raw as Record<string, unknown>).map(
      ([id, val]) => ({ id, success: true, ...(val as object) } as ResolvedWidgetResult)
    );
  }

  // Index by widget id for O(1) lookup in consuming hooks/components
  const byId: Record<string, ResolvedWidgetResult> = {};
  results.forEach((r) => {
    byId[r.id] = r;
  });

  return { success: raw?.success ?? true, results, byId };
}

/**
 * GET /api/meta-business/demographics/:accountId
 *
 * Fetch city, country, and age/gender demographic breakdowns for a Meta
 * Business account.
 *
 * Supports optional date-range filtering via startDate / endDate query params
 * (YYYY-MM-DD). When omitted the backend returns the latest synced snapshot.
 */
export async function getMetaDemographics(
  accountId: string,
  params?: { startDate?: string; endDate?: string }
): Promise<DemographicsResponse> {
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;

  console.log(`[Widget API] GET /api/meta-business/demographics/${accountId}`, {
    integration: "meta_business",
    metricKey: "meta.instagram.followers.demographics",
    accountId,
    ...queryParams,
  });
  const response = await api.get<DemographicsResponse>(
    `/meta-business/demographics/${accountId}`,
    { params: queryParams }
  );
  console.log(`[Widget API] Response /api/meta-business/demographics/${accountId}`, response.data);
  return response.data;
}

// ── Google Analytics Table endpoint ───────────────────────────────────────

/**
 * Dimensioned table row returned by GET /api/unified-metrics/table.
 * Each row has a `dimension` field for the dimension label and metric values
 * keyed by full metric key (e.g. "google.sessions": 1000).
 */
export interface GATableRow extends Record<string, unknown> {
  /** The dimension label (page path, country name, device type, etc.) */
  dimension: string;
}

export interface GATableResponse {
  success: boolean;
  dimensionType?: string;
  metricKeys?: string[];
  totals?: Record<string, number>;
  rows: GATableRow[];
}

export interface GetGATableParams {
  dimensionType: string;
  metricKeys: string[];
  dateFrom: string;
  dateTo: string;
  clientId?: number;
  token?: string;
}

/**
 * GET /api/unified-metrics/table
 *
 * Fetch a pre-aggregated dimensional table for Google Analytics.
 * Returns one row per dimension value with all requested metric columns.
 */
export async function getGoogleAnalyticsTable(
  params: GetGATableParams
): Promise<GATableResponse> {
  const queryParams: Record<string, string> = {
    integration: "google_analytics",
    dimensionType: params.dimensionType,
    metricKeys: params.metricKeys.join(","),
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };
  if (params.clientId) queryParams.clientId = String(params.clientId);
  if (params.token) queryParams.token = params.token;

  console.log(`[UnifiedMetrics] GET /api/unified-metrics/table`, queryParams);

  const response = await api.get<GATableResponse>("/unified-metrics/table", {
    params: queryParams,
    ...(params.token ? { skipAuthRedirect: true } : {}),
  } as any);

  console.log(`[UnifiedMetrics] Response /api/unified-metrics/table`, response.data);
  return response.data;
}

// ── Dimension-breakdown (legacy list endpoint) ─────────────────────────────

export interface UnifiedMetricDimensionRow {
  metricKey: string;
  dimensionValue?: string;
  dimensionType?: string;
  value: number;
  date?: string;
}

export interface UnifiedMetricDimensionResponse {
  rows: UnifiedMetricDimensionRow[];
}

/**
 * GET /api/unified-metrics/data
 *
 * Returns series data; mapped into a row list for legacy callers.
 *
 * Params use startDate / endDate (not dateFrom / dateTo).
 */
export async function getUnifiedMetricRows(params: {
  integration: string;
  metricKey: string;
  startDate: string;
  endDate: string;
  accountId?: string;
  clientId?: number;
  token?: string;
}): Promise<UnifiedMetricDimensionResponse> {
  let integrationName = params.integration;
  if (integrationName !== "google-search-console") {
    integrationName = integrationName.replace(/-/g, "_");
  }
  if (integrationName === "woocommerce") integrationName = "woo";

  const queryParams: Record<string, string> = {
    integration: integrationName,
    metricKey: params.metricKey,
    dateFrom: params.startDate,
    dateTo: params.endDate,
  };
  if (params.accountId) queryParams.accountId = params.accountId;
  if (params.clientId) {
    queryParams.clientId = String(params.clientId);
    queryParams.client_id = String(params.clientId);
  }
  if (params.token) queryParams.token = params.token;

  const response = await api.get<MetricDataResponse>("/unified-metrics/data", {
    params: queryParams,
    ...(params.token ? { skipAuthRedirect: true } : {}),
  } as any);

  const series = response.data?.data?.series ?? [];
  return {
    rows: series.map((point) => ({
      metricKey: params.metricKey,
      dimensionType: "day",
      dimensionValue: point.x,
      value: point.y,
      date: point.x,
    })),
  };
}
