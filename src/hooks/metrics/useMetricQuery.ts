/**
 * useMetricQuery
 *
 * Fetch time-series / aggregate data for a single metric via
 * GET /api/unified-metrics/data
 *
 * Includes:
 *  - automatic cache keying by all query dimensions
 *  - 5-minute stale time (configurable)
 *  - disabled when required params are missing
 */

import { useQuery } from "@tanstack/react-query";
import { getMetricData } from "@/services/unifiedMetrics.api";
import type { GetMetricDataParams, MetricDataResponse } from "@/services/unifiedMetrics.api";
import { toChartSeries, sumSeries } from "@/lib/metrics/transformMetricSeries";
import type { ChartPoint } from "@/lib/metrics/transformMetricSeries";

// ─────────────────────────────────────────────────────────────────────────────
// Query key factory
// ─────────────────────────────────────────────────────────────────────────────

export const metricQueryKey = (params: GetMetricDataParams) =>
  [
    "unified-metric",
    params.integration,
    params.metricKey,
    params.accountId ?? "",
    params.dateFrom,
    params.dateTo,
    params.groupBy ?? "none",
    params.aggregation ?? "sum",
    params.clientId ?? "",
  ] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseMetricQueryOptions {
  /** Override stale time (ms). Default: 5 minutes. */
  staleTime?: number;
  /** Disable the query regardless of params. */
  enabled?: boolean;
  /** Shared-report token (bypasses auth redirect). */
  shareToken?: string;
}

export interface UseMetricQueryResult {
  /** Raw API response */
  data: MetricDataResponse | undefined;
  /** Chart-ready `[{ x, y }]` series */
  series: ChartPoint[];
  /** Sum of all values in the series */
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
}

export function useMetricQuery(
  params: Omit<GetMetricDataParams, "token">,
  options: UseMetricQueryOptions = {}
): UseMetricQueryResult {
  const {
    staleTime = 5 * 60 * 1000,
    enabled: externalEnabled = true,
    shareToken,
  } = options;

  const isParamsReady =
    !!params.metricKey && !!params.integration && !!params.dateFrom && !!params.dateTo;

  const { data, isLoading, isFetching, isError, error } =
    useQuery<MetricDataResponse>({
      queryKey: metricQueryKey({ ...params, token: shareToken }),
      queryFn: () =>
        getMetricData({ ...params, token: shareToken }),
      enabled: isParamsReady && externalEnabled,
      staleTime,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });

  const series = toChartSeries(data);
  // Prefer the backend-provided total; fall back to summing the series
  const total = data?.data?.total ?? sumSeries(series);

  return { data, series, total, isLoading, isFetching, isError, error: error as Error | null };
}
