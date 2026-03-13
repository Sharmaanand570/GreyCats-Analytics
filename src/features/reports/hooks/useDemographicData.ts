/**
 * @deprecated SUPERSEDED — do not use.
 *
 * Replaced by: src/hooks/metrics/useBatchDemographicsData.ts
 * New data source: GET /api/metabusiness/demographics/:accountId
 * Context: src/features/reports/context/BatchMetricsContext (demographicById)
 *
 * This file remains to avoid breaking imports during incremental cleanup.
 * It is NOT imported by any active production code path.
 * Safe to delete once all imports have been verified removed.
 */
import { useQuery } from "@tanstack/react-query";
import type { DashboardLayout } from "@/features/reports/api/types";
import { fetchUnifiedMetric, fetchUnifiedMetricsList } from "@/features/reports/api/reportingApi";

// Hook to fetch detailed demographic data client-side
// This is needed because the backend aggregate endpoint returns 0 for parent keys (e.g. meta.instagram.followers.age)
// but returns valid data for specific keys (e.g. meta.instagram.followers.age.18-24)
export const useDemographicData = (widgets: DashboardLayout[], clientId: number, dateRange: { startDate: string, endDate: string }) => {
  return useQuery({
    queryKey: ['demographic-data', clientId, dateRange, widgets.map(w => w.i).join(',')],
    queryFn: async () => {
      const demographicWidgets = widgets.filter(w => {
        const hasConfig = (w.data as any)?.customConfig?.demographics || (w as any).customConfig?.demographics;
        if (hasConfig) return true;

        // Fallback: Check metricKey for .age or .gender
        const key = (w as any).metricKey || (w as any).metricConfig?.metricKey || '';
        return key.endsWith('.age') || key.endsWith('.gender') || key.endsWith('.country') || key.endsWith('.city');
      });

      const results: Record<string, any> = {};

      await Promise.all(demographicWidgets.map(async (widget) => {
        const widgetId = widget.i;
        let config = (widget.data as any)?.customConfig?.demographics || (widget as any).customConfig?.demographics;


        // Synthesize config if missing
        if (!config) {
          const key = (widget as any).metricKey || (widget as any).metricConfig?.metricKey || '';
          if (key.endsWith('.age')) config = { type: 'age' };
          else if (key.endsWith('.gender')) config = { type: 'gender' };
          else if (key.endsWith('.country')) config = { type: 'country', partialMatch: true };
          else if (key.endsWith('.city')) config = { type: 'city', partialMatch: true };
        }

        let metrics = config.metrics || [];



        // Fallback: Generate metrics if missing (common in existing reports)
        if (metrics.length === 0 && (config.type === 'age' || config.type === 'gender')) {
          const baseKey = (widget as any).metricKey || (widget as any).metricConfig?.metricKey || '';
          if (baseKey) {
            if (config.type === 'age') {
              metrics = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'].map(suffix => `${baseKey}.${suffix}`);
            } else if (config.type === 'gender') {
              metrics = ['M', 'F', 'U'].map(suffix => `${baseKey}.${suffix}`);
            }
          }
        }

        if (metrics.length > 0) {
          // For charts with explicit metric lists (Age, Gender)
          // We fetch ALL metrics in parallel and pick the latest value
          const metricData = await Promise.all(metrics.map(async (key: string) => {
            try {
              // Simple integration detection
              let integration = (widget as any).integration;
              if (!integration || integration === 'unknown') {
                if (key.startsWith('meta.instagram')) integration = 'meta_instagram';
                else if (key.startsWith('meta.facebook')) integration = 'meta_facebook';
              }

              // Integration from user guide is usually underscored: meta_instagram
              integration = integration ? integration.replace('-', '_') : 'meta_instagram';

              const payload = {
                integration: integration,
                metricKey: key,
                startDate: dateRange.startDate || '',
                endDate: dateRange.endDate || ''
              };

              const response = await fetchUnifiedMetricsList(clientId, payload);

              const rows = response.rows || [];
              const latest = rows.length > 0 ? rows[0] : null;

              if (latest) {
                console.log(`[Demographics API] Got data for ${key}`);
              }

              return {
                key,
                value: latest ? latest.value : 0,
                dimensionValue: key.split('.').pop() // fallback dimension
              };
            } catch (e) {
              console.error(`Failed to fetch ${key}`, e);
              return { key, value: 0 };
            }
          }));

          // Construct rows for the widget
          const rows = metricData.map(m => ({
            metricKey: m.key,
            dimensionValue: m.dimensionValue,
            value: m.value
          })).filter(r => r.value > 0);

          results[widgetId] = { rows, value: 1 }; // value=1 signal to prevent "No Data"
        }
        else if (config.partialMatch) {
          try {
            let integration = (widget as any).integration || 'meta_instagram';
            integration = integration.replace('-', '_');

            const response = await fetchUnifiedMetric(clientId, {
              integration: integration,
              metricKey: (widget as any).metricKey,
              startDate: dateRange.startDate,
              endDate: dateRange.endDate
            });

            if (response.rows && response.rows.length > 0) {
              results[widgetId] = response;
            } else {
              const listRes = await fetchUnifiedMetricsList(clientId, {
                integration,
                metricKey: (widget as any).metricKey,
                startDate: dateRange.startDate || '',
                endDate: dateRange.endDate || ''
              });
              if (listRes.rows && listRes.rows.length > 0) {
                results[widgetId] = listRes;
              }
            }
          } catch (e) {
            console.error(`Failed to fetch table data ${(widget as any).metricKey}`, e);
          }
        }
      }));

      console.warn(`[Demographics Hook] Completed. Got results for:`, Object.keys(results));
      return results;
    },
    enabled: widgets.length > 0 && !!clientId
  });
};
