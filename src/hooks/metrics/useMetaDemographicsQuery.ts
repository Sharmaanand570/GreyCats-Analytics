/**
 * useMetaDemographicsQuery
 *
 * Fetch Meta Business demographic breakdowns (country, city, age/gender) via
 * GET /api/metabusiness/demographics/:accountId
 *
 * Returns both raw data and chart-ready transformed data via the metric
 * transformers so UI components never need to massage the response themselves.
 */

import { useQuery } from "@tanstack/react-query";
import { getMetaDemographics } from "@/services/unifiedMetrics.api";
import type { DemographicsResponse } from "@/services/unifiedMetrics.api";
import {
  transformDemographics,
} from "@/lib/metrics/transformMetricSeries";
import type {
  NamedChartPoint,
  AgeGenderChartPoint,
} from "@/lib/metrics/transformMetricSeries";

// ─────────────────────────────────────────────────────────────────────────────
// Query key factory
// ─────────────────────────────────────────────────────────────────────────────

export const metaDemographicsQueryKey = (
  accountId: string,
  startDate?: string,
  endDate?: string
) => ["meta-demographics", accountId, startDate ?? "", endDate ?? ""] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseMetaDemographicsQueryOptions {
  /** Filter data to this start date (YYYY-MM-DD). */
  startDate?: string;
  /** Filter data to this end date (YYYY-MM-DD). */
  endDate?: string;
  /** Override stale time (ms). Default: 15 minutes (demographics change slowly). */
  staleTime?: number;
  /** Disable the query regardless of params. */
  enabled?: boolean;
}

export interface UseMetaDemographicsQueryResult {
  /** Raw API response */
  data: DemographicsResponse | undefined;
  /** Chart-ready country data */
  country: NamedChartPoint[];
  /** Chart-ready city data */
  city: NamedChartPoint[];
  /** Chart-ready age/gender stacked data */
  ageGender: AgeGenderChartPoint[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
}

export function useMetaDemographicsQuery(
  accountId: string,
  options: UseMetaDemographicsQueryOptions = {}
): UseMetaDemographicsQueryResult {
  const { startDate, endDate, staleTime = 15 * 60 * 1000, enabled: externalEnabled = true } = options;

  const { data, isLoading, isFetching, isError, error } =
    useQuery<DemographicsResponse>({
      queryKey: metaDemographicsQueryKey(accountId, startDate, endDate),
      queryFn: () => getMetaDemographics(accountId, { startDate, endDate }),
      enabled: !!accountId && externalEnabled,
      staleTime,
      gcTime: 60 * 60 * 1000, // 1 hour — demographics are slow-moving
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });

  const transformed = transformDemographics(data);

  return {
    data,
    country: transformed.country,
    city: transformed.city,
    ageGender: transformed.ageGender,
    isLoading,
    isFetching,
    isError,
    error: error as Error | null,
  };
}
