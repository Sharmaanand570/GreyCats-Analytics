/**
 * Unified Metrics Hooks
 *
 * Public barrel export for all metric-related React Query hooks.
 * Import from here instead of individual files.
 *
 * @example
 *   import { useMetricQuery, useBatchMetricsQuery, useMetaDemographicsQuery } from "@/hooks/metrics";
 */

export { useMetricQuery, metricQueryKey } from "./useMetricQuery";
export type {
  UseMetricQueryOptions,
  UseMetricQueryResult,
} from "./useMetricQuery";

export { useBatchMetricsQuery, batchMetricsQueryKey } from "./useBatchMetricsQuery";
export type {
  UseBatchMetricsQueryOptions,
  UseBatchMetricsQueryResult,
} from "./useBatchMetricsQuery";

export {
  useMetaDemographicsQuery,
  metaDemographicsQueryKey,
} from "./useMetaDemographicsQuery";
export type {
  UseMetaDemographicsQueryOptions,
  UseMetaDemographicsQueryResult,
} from "./useMetaDemographicsQuery";

export { useBatchDashboardData, isBatchableWidget, isSpecialWidget } from "./useBatchDashboardData";
export type { UseBatchDashboardDataOptions } from "./useBatchDashboardData";

export { useBatchDemographicsData } from "./useBatchDemographicsData";
export type { DemographicDataMap } from "./useBatchDemographicsData";
