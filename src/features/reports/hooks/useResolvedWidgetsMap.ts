/**
 * @deprecated SUPERSEDED — do not use.
 *
 * Replaced by: useBatchDashboardData (src/hooks/metrics/useBatchDashboardData.ts)
 * The aggregated result is now provided via BatchMetricsContext.byId.
 *
 * This file remains to avoid breaking imports during incremental cleanup.
 * It is NOT imported by any active production code path.
 * Safe to delete once all imports have been verified removed.
 */
import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type {
  DashboardMap,
  DashboardLayout,
  ResolvedWidgetData,
  ReportWidgetDefinition,
} from "../api/types";
import { getWidgetQueryKey } from "./useWidgetData";

interface WidgetQueryConfig {
  widgetId: string;
  widget: ReportWidgetDefinition;
}

/**
 * Aggregates per-widget React Query cache entries into a single
 * Record<string, ResolvedWidgetData> that is compatible with
 * the old monolithic `reportDataQuery.data` shape.
 *
 * Uses `useQueries` to reactively watch all widget query keys.
 * Each query has `enabled: false` so this hook only READS from cache
 * — the actual fetching is done by `useWidgetData` in each WidgetDataWrapper.
 */
export function useResolvedWidgetsMap(
  dashboards: DashboardMap,
  dateFrom: string,
  dateTo: string,
  shareToken?: string
): Record<string, ResolvedWidgetData> {
  // Build array of widget configs from all dashboards
  const widgetConfigs = useMemo(() => {
    const configs: WidgetQueryConfig[] = [];

    dashboards.forEach((layout: DashboardLayout[]) => {
      layout.forEach((widget: DashboardLayout) => {
        const metricConfig = widget.metricConfig;
        if (!metricConfig?.metricKey) return;

        const widgetId = metricConfig.id ?? widget.i;
        configs.push({ widgetId, widget: metricConfig });
      });
    });

    return configs;
  }, [dashboards]);

  // Memoize the query configurations array to prevent useQueries from thrashing
  const queryDefinitions = useMemo(() => {
    return widgetConfigs.map((config) => ({
      queryKey: getWidgetQueryKey(
        config.widget,
        dateFrom,
        dateTo,
        shareToken
      ),
      enabled: false,
      staleTime: Infinity,
    }));
  }, [widgetConfigs, dateFrom, dateTo, shareToken]);

  // Watch all widget query keys reactively.
  // enabled: false means we only read from cache — we never trigger fetches here.
  const results = useQueries({
    queries: queryDefinitions,
  });

  // Build the resolved map
  return useMemo(() => {
    const map: Record<string, ResolvedWidgetData> = {};

    widgetConfigs.forEach((config, i) => {
      const data = results[i]?.data as ResolvedWidgetData | undefined;
      if (data) {
        map[config.widgetId] = data;
      }
    });

    return map;
  }, [results, widgetConfigs]);
}
