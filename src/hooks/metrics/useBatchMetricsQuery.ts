/**
 * useBatchMetricsQuery
 *
 * Resolve all dashboard widget metrics in a single round-trip via
 * POST /api/unified-metrics/resolve
 *
 * This is the primary hook for dashboard data loading. It replaces per-widget
 * API calls with a single batch request and caches the indexed result by
 * widget id.
 */

import { useQuery } from "@tanstack/react-query";
import { resolveDashboardMetrics } from "@/services/unifiedMetrics.api";
import type {
  BatchWidgetRequest,
  BatchResolveResponse,
  ResolvedWidgetResult,
} from "@/services/unifiedMetrics.api";

// ─────────────────────────────────────────────────────────────────────────────
// Query key factory
// ─────────────────────────────────────────────────────────────────────────────

export const batchMetricsQueryKey = (
  widgets: BatchWidgetRequest[],
  dateFrom: string,
  dateTo: string,
  clientId?: number
) =>
  [
    "batch-metrics",
    clientId ?? "",
    dateFrom,
    dateTo,
    // Sort widget ids so key is stable regardless of order
    widgets
      .map((w) => `${w.id}:${w.metricKey}:${w.integration}:${w.accountId ?? ""}`)
      .sort()
      .join("|"),
  ] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseBatchMetricsQueryOptions {
  clientId?: number;
  /** Override stale time (ms). Default: 5 minutes. */
  staleTime?: number;
  /** Disable the query regardless of params. */
  enabled?: boolean;
}

export interface UseBatchMetricsQueryResult {
  /** Full batch response */
  data: BatchResolveResponse | undefined;
  /** O(1) lookup of resolved data by widget id */
  byId: Record<string, ResolvedWidgetResult>;
  /** Get resolved data for a specific widget id */
  getWidget: (widgetId: string) => ResolvedWidgetResult | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
}

export function useBatchMetricsQuery(
  widgets: BatchWidgetRequest[],
  dateFrom: string,
  dateTo: string,
  options: UseBatchMetricsQueryOptions = {}
): UseBatchMetricsQueryResult {
  const { clientId, staleTime = 5 * 60 * 1000, enabled: externalEnabled = true } = options;

  const hasWidgets = widgets.length > 0;
  const hasDateRange = !!dateFrom && !!dateTo;

  const { data, isLoading, isFetching, isError, error } =
    useQuery<BatchResolveResponse>({
      queryKey: batchMetricsQueryKey(widgets, dateFrom, dateTo, clientId),
      queryFn: () =>
        resolveDashboardMetrics({ widgets, dateFrom, dateTo, clientId }),
      enabled: hasWidgets && hasDateRange && externalEnabled,
      staleTime,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });

  const byId = data?.byId ?? {};

  return {
    data,
    byId,
    getWidget: (widgetId: string) => byId[widgetId],
    isLoading,
    isFetching,
    isError,
    error: error as Error | null,
  };
}
