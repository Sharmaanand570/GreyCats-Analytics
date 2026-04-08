/**
 * useBatchDashboardData
 *
 * Fetches all dashboard widget metrics in parallel via
 * GET /api/unified-metrics/data — one request per unique widget.
 *
 * React Query deduplicates identical queries automatically, so widgets
 * that share the same metricKey + accountId produce only ONE network request.
 *
 * Special-case widgets (recent_posts, recent_media, demographics) are excluded
 * and continue to be served by useWidgetData / useBatchDemographicsData.
 */

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getMetricData } from "@/services/unifiedMetrics.api";
import type { ResolvedWidgetResult, BatchResolveResponse } from "@/services/unifiedMetrics.api";
import type { UseBatchMetricsQueryResult } from "./useBatchMetricsQuery";
import type { DashboardMap, DashboardLayout } from "@/features/reports/api/types";

// ─────────────────────────────────────────────────────────────────────────────
// Widget classification helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Metric keys that bypass the parallel fetcher.
 * These are handled by dedicated per-widget fetchers inside useWidgetData.
 */
const BYPASS_BATCH_KEYS = new Set([
  "meta.facebook.recent_posts",
  "meta.instagram.recent_media",
  "meta.ads.campaign_performance",
  "google_ads.campaign_performance",
  "google_seo.top_pages",
  "google_seo.top_queries",
  // GA dimensional table widgets — served by /api/unified-metrics/table via useWidgetData
  "google.channel_traffic",
  "google.browser_used",
  "google.device_category",
  "google.geo_country",
  "google.geo_city",
  "google.top_pages",
  // LinkedIn recent posts table — served by fetchLinkedinPosts via useWidgetData
  "linkedin.recent_posts",
]);

const CHART_WIDGET_TYPES = new Set([
  "chart", "line_chart", "area_chart", "bar_chart", "pie_chart",
]);

/**
 * Returns true when the widget requires dedicated per-widget fetching
 * and must NOT be included in the parallel fetch.
 */
export function isSpecialWidget(widget: DashboardLayout): boolean {
  const mc = widget.metricConfig;
  if (!mc?.metricKey) return false;

  // Explicit bypass list
  if (BYPASS_BATCH_KEYS.has(mc.metricKey)) return true;

  // All Google Ads widgets are handled by useWidgetData:
  // - metric cards → GET /api/unified-metrics/aggregate
  // - chart widgets → GET /api/unified-metrics/data (via getMetricData in useWidgetData)
  if (mc.metricKey.startsWith("google_ads."))
    return true;

  // All Google Analytics widgets are handled by useWidgetData via getMetricData:
  // - metric cards  → GET /api/unified-metrics/data → total value
  // - chart widgets → GET /api/unified-metrics/data with groupBy=day → series
  // - dimensional table widgets are already in BYPASS_BATCH_KEYS above
  if (mc.metricKey.startsWith("google.") || mc.metricKey.startsWith("ga4."))
    return true;

  // Google Search Console widgets use useWidgetData:
  // - metric cards: /api/unified-metrics/aggregate
  // - charts: /api/unified-metrics/data
  // (top_pages / top_queries are already in BYPASS_BATCH_KEYS)
  if (mc.metricKey.startsWith("google_seo."))
    return true;

  // Demographics widgets are fetched via useBatchDemographicsData → getMetaDemographics
  const demoConfig = (widget.data as any)?.customConfig?.demographics;
  if (demoConfig) return true;
  const key = mc.metricKey.toLowerCase();
  if (
    key.endsWith(".age") ||
    key.endsWith(".gender") ||
    key.endsWith(".country") ||
    key.endsWith(".city")
  )
    return true;

  // All Meta Ads metric cards use GET /api/unified-metrics/aggregate so the
  // backend returns correctly pre-aggregated values (sum for clicks/spend,
  // ratio for cpc/ctr) instead of the batch resolver summing daily rows.
  if (mc.metricKey.startsWith("meta.ads."))
    return true;

  // Meta Instagram metric cards use GET /api/unified-metrics/data.
  // recent_media is already in BYPASS_BATCH_KEYS above.
  if (
    mc.metricKey.startsWith("meta.instagram.") &&
    mc.metricKey !== "meta.instagram.recent_media"
  )
    return true;

  // Meta Facebook metric cards use GET /api/unified-metrics/data.
  // recent_posts is already in BYPASS_BATCH_KEYS above.
  if (
    (mc.metricKey.startsWith("meta.facebook.") || mc.metricKey.startsWith("meta.page.")) &&
    mc.metricKey !== "meta.facebook.recent_posts"
  )
    return true;

  // Twitter (X) widgets use direct fetching via useWidgetData
  if (mc.metricKey.startsWith("twitter."))
    return true;

  // LinkedIn widgets use direct fetching via fetchLinkedinAnalytics in useWidgetData
  if (mc.metricKey.startsWith("linkedin."))
    return true;

  return false;
}

/**
 * Returns true when the widget can be served by the parallel fetcher.
 */
export function isBatchableWidget(widget: DashboardLayout): boolean {
  if (!widget.metricConfig?.metricKey) return false;
  return !isSpecialWidget(widget);
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal widget descriptor
// ─────────────────────────────────────────────────────────────────────────────

interface WidgetFetchDescriptor {
  widgetId: string;
  metricKey: string;
  integration: string;
  accountId?: string;
  groupBy?: string;
  aggregation?: string;
}

const logWidgetMetricRequest = (
  endpoint: string,
  descriptor: WidgetFetchDescriptor,
  dateFrom: string,
  dateTo: string,
  clientId?: number
) => {
  console.log(`[Widget Metrics] ${endpoint}`, {
    widgetId: descriptor.widgetId,
    integration: descriptor.integration,
    metricKey: descriptor.metricKey,
    accountId: descriptor.accountId ?? "",
    dateFrom,
    dateTo,
    groupBy: descriptor.groupBy ?? "none",
    aggregation: descriptor.aggregation ?? "sum",
    clientId: clientId ?? "",
  });
};

const logWidgetMetricResponse = (
  endpoint: string,
  descriptor: WidgetFetchDescriptor,
  response: unknown
) => {
  console.log(`[Widget Metrics] ${endpoint} response`, {
    widgetId: descriptor.widgetId,
    metricKey: descriptor.metricKey,
    integration: descriptor.integration,
    response,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseBatchDashboardDataOptions {
  clientId?: number;
  enabled?: boolean;
  shareToken?: string;
}

export function useBatchDashboardData(
  dashboards: DashboardMap,
  dateFrom: string,
  dateTo: string,
  options: UseBatchDashboardDataOptions = {}
): UseBatchMetricsQueryResult {
  const { clientId, enabled = true, shareToken } = options;

  // 1. Collect all batchable widgets (deduplicated by widgetId)
  //    Also collect snapshot data for shared reports.
  const { descriptors, snapshotById } = useMemo<{
    descriptors: WidgetFetchDescriptor[];
    snapshotById: Record<string, ResolvedWidgetResult>;
  }>(() => {
    const result: WidgetFetchDescriptor[] = [];
    const snapshots: Record<string, ResolvedWidgetResult> = {};
    const seen = new Set<string>();

    dashboards.forEach((layout) => {
      layout.forEach((widget) => {
        const mc = widget.metricConfig;
        if (!mc?.metricKey) {
          console.warn(`[BatchDashboard] ⛔ SKIP (no metricConfig) widgetType=${widget.widgetType} i=${widget.i}`);
          return;
        }
        if (!isBatchableWidget(widget)) {
          console.log(`[BatchDashboard] ⏩ SPECIAL/DEMO widget: ${mc.metricKey}`);
          return;
        }

        const widgetId = String(mc.id ?? widget.i);
        if (seen.has(widgetId)) return;
        seen.add(widgetId);

        // For shared reports: if snapshot data exists AND it is real metric data
        // (not a widget display config object), use it directly without an API call.
        // Widget config objects ({label, value: 0, hideDataPoints}) are baked into
        // every widget definition — they are NOT real snapshots. Real snapshots never
        // contain 'label' or 'hideDataPoints' keys.
        const snap = (widget as any).snapshotData;
        const isWidgetConfig = snap && ('label' in snap || 'hideDataPoints' in snap || 'chartType' in snap);
        if (shareToken && snap && !isWidgetConfig && (snap.series || typeof snap.value === "number" || typeof snap.total === "number")) {
          const hasSeries = Array.isArray(snap.series) && snap.series.length > 0;
          const seriesTotal = hasSeries
            ? snap.series.reduce((acc: number, pt: { x: string; y: number }) => acc + (pt.y ?? 0), 0)
            : 0;
          snapshots[widgetId] = {
            id: widgetId,
            success: true,
            series: snap.series ?? [],
            total: snap.total ?? snap.value ?? seriesTotal,
            value: snap.value ?? snap.total ?? seriesTotal,
            rawCount: snap.rawCount ?? (hasSeries ? snap.series.length : 0),
          };
          return; // Don't add to descriptors — no API call needed
        }

        // Chart widgets always need daily grouping regardless of what's stored on the widget
        const isChartWidget = CHART_WIDGET_TYPES.has(widget.widgetType ?? "");
        const effectiveGroupBy = isChartWidget
          ? "day"
          : mc.groupBy && mc.groupBy !== "none" ? mc.groupBy : undefined;

        result.push({
          widgetId,
          metricKey: mc.metricKey,
          integration: mc.integration,
          accountId: mc.accountId ?? undefined,
          groupBy: effectiveGroupBy,
          aggregation: mc.aggregation ?? undefined,
        });
      });
    });

    console.log(`[BatchDashboard] 📋 Batchable descriptors (${result.length}), snapshots (${Object.keys(snapshots).length}):`,
      result.map(d => ({ metricKey: d.metricKey, integration: d.integration, accountId: d.accountId || '(none)' }))
    );
    return { descriptors: result, snapshotById: snapshots };
  }, [dashboards, shareToken]);

  const canFetch = enabled && !!dateFrom && !!dateTo;

  // 2. Fire one GET /api/unified-metrics/data per unique widget in parallel
  const queries = useQueries({
    queries: descriptors.map((d) => ({
      queryKey: [
        "unified-metric",
        d.integration,
        d.metricKey,
        d.accountId ?? "",
        dateFrom,
        dateTo,
        d.groupBy ?? "none",
        d.aggregation ?? "sum",
        clientId ?? "",
      ],
      queryFn: async () => {
        logWidgetMetricRequest("GET /api/unified-metrics/data", d, dateFrom, dateTo, clientId);
        const response = await getMetricData({
          integration: d.integration,
          metricKey: d.metricKey,
          accountId: d.accountId,
          dateFrom,
          dateTo,
          groupBy: d.groupBy as any,
          aggregation: d.aggregation as any,
          clientId,
          token: shareToken,
        });
        logWidgetMetricResponse("GET /api/unified-metrics/data", d, response);
        return response;
      },
      enabled: canFetch && !!d.metricKey,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);
  const isError = queries.some((q) => q.isError);
  const error = (queries.find((q) => q.error)?.error as Error | null) ?? null;

  // 3. Adapt { success, data: { series, total, rawCount } } → ResolvedWidgetResult
  //    and index by widgetId for O(1) lookup
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const byId = useMemo<Record<string, ResolvedWidgetResult>>(() => {
    // Start with snapshot data (shared reports) — API results will merge on top
    const map: Record<string, ResolvedWidgetResult> = { ...snapshotById };

    descriptors.forEach(({ widgetId, metricKey, integration, accountId }, i) => {
      const apiResponse = queries[i]?.data;
      const queryStatus = queries[i]?.status;

      if (!apiResponse) {
        console.warn(`[BatchDashboard] ⏳ No response yet for ${metricKey} (status=${queryStatus})`);
        return;
      }

      // Support both response shapes:
      //   { success, data: { series, total, rawCount } }  ← standard
      //   { series, total, rawCount }                     ← flat (Google Ads /unified-metrics/data)
      const payload = (apiResponse as any).data ?? apiResponse;
      const series = payload.series ?? [];
      const apiTotal = payload.total;
      const total =
        typeof apiTotal === "number"
          ? apiTotal
          : series.length > 0
            ? series.reduce((acc: number, pt: { x: string; y: number }) => acc + (pt.y ?? 0), 0)
            : undefined;

      console.log(`[BatchDashboard] ✅ ${metricKey}`, {
        integration,
        accountId: accountId || '(none)',
        seriesPoints: series.length,
        total,
        rawCount: payload.rawCount,
        firstPoint: series[0],
      });

      map[widgetId] = {
        id: widgetId,
        success: (apiResponse as any).success ?? true,
        series,
        total,
        value: total,
        rawCount: payload.rawCount ?? (series.length > 0 ? series.length : 0),
      };
    });

    console.log(`[BatchDashboard] 🗂️ byId keys: [${Object.keys(map).join(', ')}]`);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descriptors, queries, snapshotById]);

  const results = Object.values(byId);
  const data: BatchResolveResponse | undefined =
    results.length > 0 ? { success: true, results, byId } : undefined;

  return {
    data,
    byId,
    getWidget: (widgetId: string) => byId[widgetId],
    isLoading,
    isFetching,
    isError,
    error,
  };
}
