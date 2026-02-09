import { Button } from "./ui/button";
import { ChartLineMultiple } from "./ChartLineMultiple";
import { Link, useNavigate } from "react-router-dom";
import { DateRangePicker } from "./DateRangePicker";
import { type DateRange } from "react-day-picker";
import { useMemo, useState, useEffect } from "react";
// Icons
import { FiSearch, FiBell } from "react-icons/fi";
import { LayoutGrid, BarChart3, LineChart, Building2, Activity } from "lucide-react";
// Components
import { MetricCard } from "./dashboard/MetricCard";
import { getBrandColor } from "@/lib/brandColors";
import { useQuery } from "@tanstack/react-query";
import {
  listDashboards,
  fetchUnifiedMetric,
} from "@/features/reports/api/reportingApi";
import type {
  ApiError,
  Dashboard as DashboardModel,
  DashboardWidget,
  ResolvedWidgetData,
} from "@/features/reports/api/types";
import { toast } from "sonner";
import { subDays, format } from "date-fns";
import { useAvailableMetrics } from "@/features/reports/hooks/useAvailableMetrics";
import { getMetricAggregation } from '@/utils/facebookMetrics';
import { useClients } from "@/hooks/useClients";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

/* DEFAULT_DASHBOARD_WIDGETS and helper functions removed */



const nameCorrection = (name: string): string => {

  if (name === "google-search-console") return "Google Search Console"

  if (name === "meta_ads") return "Meta Ads"

  if (name === "meta_facebook") return "Facebook"

  if (name === "meta_instagram") return "Instagram"

  if (name === "woo") return "Woo Commerce"

  if (name === "shopify") return "Shopify"

  if (name === "google_analytics") return "Google Analytics"

  return name
}


const formatApiDate = (value: Date) => format(value, "yyyy-MM-dd");

const formatNumber = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return "--";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

// Helper to determine status based on integrations (Simulated logic for demo)
const getClientHealth = (client: any) => {
  const totalIntegrations =
    (client._count?.metaBusinessAccounts || 0) +
    (client._count?.metaAdsAccounts || 0) +
    (client._count?.metaInsightsAccounts || 0) +
    (client._count?.youtubeAccounts || 0) +
    (client._count?.shopifyAccounts || 0) +
    (client._count?.woocommerceAccounts || 0) +
    (client._count?.googleSearchConsoleAccounts || 0) +
    (client._count?.googleAnalyticsAccounts || 0);

  if (totalIntegrations > 3) return 'healthy';
  if (totalIntegrations > 0) return 'warning';
  return 'critical'; // No integrations
};


interface DashboardProps {
  clientId?: number;
  onConnectIntegration?: () => void;
  withLayout?: boolean;
  hideHeader?: boolean;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

export const getDefaultDateRange = () => ({
  from: subDays(new Date(), 6),
  to: new Date(),
});

function Dashboard({
  clientId,
  withLayout = true,
  hideHeader = false,
  dateRange: externalDateRange,
  onDateRangeChange
}: DashboardProps) {
  const [internalDateRange, setInternalDateRange] = useState(getDefaultDateRange());
  const navigate = useNavigate();

  const dateRange = externalDateRange || internalDateRange;
  const setDateRange = onDateRangeChange || setInternalDateRange;

  // Fetch clients only if no clientId is provided
  const { data: clients, isLoading: isLoadingClients, isError: isClientsError, refetch: refetchClients } = useClients();

  const { groupedMetrics } = useAvailableMetrics(clientId ?? null);



  const dashboardsQuery = useQuery<DashboardModel[], ApiError>({
    queryKey: ["dashboards", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const response = await listDashboards(clientId);
      return response.dashboards;
    },
    enabled: !!clientId,
  });

  useEffect(() => {
    if (dashboardsQuery.error) {
      toast.error(
        dashboardsQuery.error.message || "Failed to load dashboards"
      );
    }
  }, [dashboardsQuery.error]);

  const dashboards = dashboardsQuery.data ?? [];
  const activeDashboard = dashboards[0];

  const dashboardWidgets = useMemo<DashboardWidget[]>(() => {
    console.log('🔍 [Dashboard] activeDashboard:', activeDashboard);
    console.log('🔍 [Dashboard] activeDashboard?.widgets:', activeDashboard?.widgets);

    // If user has a saved dashboard, use it
    if (activeDashboard?.widgets) {
      const entries = Object.entries(
        activeDashboard.widgets
      ) as [string, DashboardWidget][];
      console.log('🔍 [Dashboard] Found widgets in activeDashboard:', entries.length);
      if (entries.length > 0) {
        const widgets = entries
          .map(([id, widget]) => ({
            ...widget,
            id,
          }))
          .sort((a, b) => (a.layout?.y ?? 0) - (b.layout?.y ?? 0));
        console.log('🔍 [Dashboard] Mapped widgets:', widgets);
        return widgets;
      }
    }

    // Default to empty (User must explicitly add widgets via Edit Dashboard)
    console.log('🔍 [Dashboard] No widgets found - returning empty array');
    return [];
  }, [activeDashboard, groupedMetrics]);

  // Create widget signature and date range key for query caching
  const widgetSignature = useMemo(() => {
    return dashboardWidgets.map(w => w.id).join("|");
  }, [dashboardWidgets]);

  const dateRangeKey = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return "none";
    return `${formatApiDate(dateRange.from)}_${formatApiDate(dateRange.to)}`;
  }, [dateRange]);

  // Fetch widget data using GET /unified-metrics (same pattern as ReportBuilder)
  const widgetDataQuery = useQuery<Record<string, ResolvedWidgetData>>({
    queryKey: ["dashboard-widget-data", clientId, widgetSignature, dateRangeKey],
    enabled: !!clientId && dashboardWidgets.length > 0 && !!dateRange?.from && !!dateRange?.to,
    queryFn: async () => {
      if (!clientId || !dateRange?.from || !dateRange?.to) {
        return {};
      }

      const dateFrom = formatApiDate(dateRange.from);
      const dateTo = formatApiDate(dateRange.to);

      // Filter widgets that have metricKey
      const widgetsWithMetrics = dashboardWidgets.filter(w => w.metricKey);

      if (!widgetsWithMetrics.length) {
        return {};
      }

      // Fetch data for each widget using GET /unified-metrics
      const promises = widgetsWithMetrics.map(async (widget: DashboardWidget) => {
        try {
          // Normalize integration key to match backend schema
          let normalizedIntegration = widget.integration?.toLowerCase() || "";

          // Only replace underscores with hyphens for non-Meta integrations
          if (!normalizedIntegration.startsWith("meta_")) {
            normalizedIntegration = normalizedIntegration.replace(/_/g, '-');
          }

          if (normalizedIntegration === "google") {
            normalizedIntegration = "google-analytics";
          } else if (normalizedIntegration === "woocommerce") {
            normalizedIntegration = "woo";
          }

          // Validate integration key (accept both underscore and hyphen variants for Meta integrations)
          const validIntegrations = [
            'google-analytics',
            'google-search-console',
            'google-console',
            'meta',
            'meta-facebook',
            'meta-instagram',
            'meta-ads',
            'meta_ads',      // Accept underscore variant for Meta Ads
            'meta_facebook', // Accept underscore variant for Meta Facebook
            'meta_instagram', // Accept underscore variant for Meta Instagram
            'youtube', 'shopify', 'woo'
          ];

          if (!validIntegrations.includes(normalizedIntegration)) {
            console.warn(`⚠️ Invalid integration key: ${normalizedIntegration} (original: ${widget.integration})`);
            return { id: widget.id, widget, data: null };
          }

          // Validate metric key format (should have platform prefix)
          const hasValidPrefix =
            widget.metricKey?.startsWith('google.') ||
            widget.metricKey?.startsWith('google_seo.') ||
            widget.metricKey?.startsWith('google-console.') ||
            widget.metricKey?.startsWith('meta.') ||
            widget.metricKey?.startsWith('youtube.') ||
            widget.metricKey?.startsWith('shopify.') ||
            widget.metricKey?.startsWith('woo.');

          if (!hasValidPrefix) {
            console.warn(`⚠️ Invalid metric key format: ${widget.metricKey} (missing platform prefix)`);
            return { id: widget.id, widget, data: null };
          }

          // Handle 90-day limit for Meta integrations (Organic Social only)
          let effectiveDateFrom = dateFrom;
          // Exclude 'meta-ads' and 'meta_ads' from this limit as ads data is often needed for longer periods
          const isMetaLimitIntegration =
            (['meta_facebook', 'meta_instagram'].includes(normalizedIntegration) ||
              (normalizedIntegration.startsWith('meta-') && !normalizedIntegration.includes('ads'))) &&
            normalizedIntegration !== 'meta_ads'; // Explicitly check underscore variant

          if (isMetaLimitIntegration) {
            const ninetyDaysAgo = subDays(new Date(), 90);
            const selectedDateFrom = new Date(dateFrom); // Assuming dateFrom is YYYY-MM-DD string
            if (selectedDateFrom < ninetyDaysAgo) {
              effectiveDateFrom = formatApiDate(ninetyDaysAgo);
              console.log(`⚠️ [Dashboard] Clamping start date for ${normalizedIntegration} to 90 days ago: ${effectiveDateFrom}`);
            }
          }

          // For Meta Ads, do NOT send accountId to backend, fetch all and filter in frontend to handle act_ prefix
          const shouldIncludeAccountId = !['meta-facebook', 'meta-instagram', 'meta-ads', 'meta_ads'].includes(normalizedIntegration);

          const params: Record<string, string> = {
            integration: normalizedIntegration,
            metricKey: widget.metricKey!,
            startDate: effectiveDateFrom,
            endDate: dateTo,
            ...(shouldIncludeAccountId && widget.accountId ? { accountId: widget.accountId } : {}),
          };

          console.log(`📤 [Dashboard] GET /unified-metrics params for ${widget.metricKey}:`, params);
          console.log(`🔧 [Dashboard] Widget config:`, {
            id: widget.id,
            metricKey: widget.metricKey,
            integration: widget.integration,
            normalizedIntegration: normalizedIntegration,
            accountId: widget.accountId,
            startDate: dateFrom,
            endDate: dateTo
          });

          const data = await fetchUnifiedMetric(clientId, params as {
            integration: string;
            metricKey: string;
            startDate: string;
            endDate: string;
          });

          // Log the full API response for debugging
          // console.log(`📡 [Dashboard] GET raw response...`);

          return { id: widget.id, widget, data };
        } catch (error) {
          console.error(`❌ [Dashboard] Failed to fetch data for widget ${widget.id} (${widget.metricKey}):`, error);
          return { id: widget.id, widget, data: null };
        }
      });

      const results = await Promise.all(promises);

      // Process and format data for each widget type
      const merged: Record<string, ResolvedWidgetData> = {};

      results.forEach(({ id, widget, data }) => {
        // Check for different response structures
        if (!data) {
          console.log(`⚠️ [Dashboard] Widget ${id} (${widget.metricKey}) has no data - data is null/undefined`);
          merged[id] = { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
          return;
        }

        // Handle different API response structures
        let rows = data.rows;
        if (!rows && data.data && Array.isArray(data.data)) {
          rows = data.data;
        }
        if (!rows && Array.isArray(data)) {
          rows = data;
        }

        if (!rows || !Array.isArray(rows)) {
          merged[id] = { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
          return;
        }

        // Use the found rows
        data.rows = rows;

        // Filter rows by integration and metricKey match
        const normalizeIntegration = (name: string) => {
          if (name === 'woo') return 'woocommerce';
          return (name || '').toLowerCase().replace(/_/g, '-');
        };

        // Smart Account ID Comparator
        const areAccountIdsEqual = (id1: any, id2: any) => {
          if (!id1 || !id2) return true;
          const s1 = String(id1).replace(/^act_/, '');
          const s2 = String(id2).replace(/^act_/, '');
          return s1 === s2;
        };

        const filteredRows = data.rows.filter((row: any) => {
          const rowIntegration = normalizeIntegration(row.integration || '');
          const widgetIntegration = normalizeIntegration(widget.integration || '');

          // Debug logging for Meta Ads
          if (widget.integration === 'meta-ads' || row.integration === 'meta_ads' || row.integration === 'meta-ads') {
            // console.log('📘 [Dashboard] Meta Ads filtering...');
          }

          const isMeta = widgetIntegration.startsWith('meta_');

          let accountMatch = true;
          if (isMeta || widget.accountId) {
            // Fix: If row.accountId is empty but we have dimensionValue for page/account, use that for matching
            if (!row.accountId && (row.dimensionType === 'page' || row.dimensionType === 'account') && row.dimensionValue) {
              accountMatch = areAccountIdsEqual(row.dimensionValue, widget.accountId);
            } else {
              accountMatch = areAccountIdsEqual(row.accountId, widget.accountId);
            }
          }
          if (widgetIntegration === 'meta-business') accountMatch = true;


          // Double Safety: Check Client ID if available to avoid cross-client data leakage
          let clientMatch = true;
          if (clientId && row.clientId) {
            clientMatch = String(row.clientId) === String(clientId);
          }

          const matchesBasic = (row.metricKey === widget.metricKey) &&
            (rowIntegration === widgetIntegration) &&
            accountMatch &&
            clientMatch;

          // For tables, we want dimensional data
          if (widget.type === 'table') {
            return matchesBasic;
          }

          // For metric cards and charts, exclude dimensional data
          // EXCEPT for WooCommerce which uses dimensionType="date" for time-series
          // EXCEPT for YouTube which has dimensionType="video" but we want to aggregate by date
          const isDimensional = row.dimensionType && row.dimensionType !== "";
          const isWooDateDimension = widget.metricKey?.startsWith('woo.') && row.dimensionType === 'date';
          const isYouTubeDimension = widget.metricKey?.startsWith('youtube.') && row.dimensionType === 'video';
          // Allow specific dimension types for Meta Ads (campaign, adset, ad) as these are the primary data rows
          // Fix: Allow 'page' and 'account' dimensions for Meta metrics
          const isMetaSpecificDimension = (widget.metricKey?.startsWith('meta') || widget.metricKey?.startsWith('meta_')) &&
            ['campaign', 'adset', 'ad', 'date', 'page', 'account'].includes(row.dimensionType);

          return matchesBasic && (!isDimensional || isWooDateDimension || isYouTubeDimension || isMetaSpecificDimension);
        });

        console.log(`📊 [Dashboard] Widget ${id} filtered rows:`, {
          beforeFilter: data.rows.length,
          afterFilter: filteredRows.length,
          integration: widget.integration,
          metricKey: widget.metricKey
        });

        // Check for rate metrics vs countable metrics
        const isRateMetric =
          widget.metricKey?.toLowerCase().includes("cpc") ||
          widget.metricKey?.toLowerCase().includes("ctr") ||
          widget.metricKey?.toLowerCase().includes("cpm") ||
          widget.metricKey?.toLowerCase().includes("bouncerate") ||
          widget.metricKey?.toLowerCase().includes("average") ||
          widget.metricKey?.toLowerCase().includes("avg") || // Covers avgOrderValue
          widget.metricKey?.toLowerCase().includes("rate") || // Covers conversionRate, engagementRate
          widget.metricKey?.toLowerCase().includes("duration") || // Covers averageSessionDuration
          widget.metricKey?.toLowerCase().includes("perview"); // Covers likesPerView, commentsPerView

        // Calculate total value
        let total = 0;

        // Try to use API-provided summary (Blended Calculation) first
        const summary = (data as any).summary;
        const metricSuffix = widget.metricKey?.split('.').pop()?.toLowerCase();
        let summaryUsed = false;

        if (summary && metricSuffix) {
          let summaryKey = metricSuffix;
          // Map common variations
          if (summaryKey === 'cost_per_click') summaryKey = 'cpc';
          else if (summaryKey === 'click_through_rate') summaryKey = 'ctr';
          else if (summaryKey === 'cost_per_mille') summaryKey = 'cpm';
          else if (summaryKey === 'amount_spent') summaryKey = 'spend';

          if (typeof summary[summaryKey] === 'number') {
            total = summary[summaryKey];
            summaryUsed = true;
          }
        }

        if (!summaryUsed && filteredRows.length > 0) {

          // Check for Cumulative Metrics (Facebook Page Likes, etc.)
          // These should take the LATEST value, not the SUM/AVG
          const aggregationType = getMetricAggregation(widget.metricKey);

          if (aggregationType === 'latest') {
            // Group by date to handle multiple accounts correctly (sum across accounts for the same day)
            const dateMap = new Map<string, number>();

            filteredRows.forEach((row: any) => {
              // Ensure we have a valid date
              const dateKey = row.date ? row.date.split('T')[0] : '';
              if (dateKey) {
                dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + (Number(row.value) || 0));
              }
            });

            // Sort dates descending
            const sortedDates = Array.from(dateMap.keys()).sort((a, b) =>
              new Date(b).getTime() - new Date(a).getTime()
            );

            if (sortedDates.length > 0) {
              // Take the value of the latest date
              total = dateMap.get(sortedDates[0]) || 0;
            }

          } else {
            // Manual Blended Calculation Fallback
            let blendedCalculated = false;
            const contextRows = data.rows || [];
            const widgetInteg = normalizeIntegration(widget.integration || '');

            const getSum = (keySuffix: string) => {
              return contextRows
                .filter((r: any) =>
                  (r.metricKey || '').endsWith(keySuffix) &&
                  normalizeIntegration(r.integration || '') === widgetInteg &&
                  (widgetInteg === 'meta-business' || areAccountIdsEqual(r.accountId, widget.accountId))
                )
                .reduce((sum: number, r: any) => sum + (Number(r.value) || 0), 0);
            };

            if (metricSuffix === 'cpc') {
              const sumSpend = getSum('spend') || getSum('amount_spent');
              const sumClicks = getSum('clicks');
              if (sumClicks > 0) { total = sumSpend / sumClicks; blendedCalculated = true; }
            } else if (metricSuffix === 'ctr') {
              const sumClicks = getSum('clicks');
              const sumImpressions = getSum('impressions');
              if (sumImpressions > 0) { total = (sumClicks / sumImpressions) * 100; blendedCalculated = true; }
            } else if (metricSuffix === 'cpm') {
              const sumSpend = getSum('spend') || getSum('amount_spent');
              const sumImpressions = getSum('impressions');
              if (sumImpressions > 0) { total = (sumSpend / sumImpressions) * 1000; blendedCalculated = true; }
            }

            if (!blendedCalculated) {
              if (isRateMetric) {
                // For rate metrics like CPC/CTR, calculate AVERAGE instead of SUM
                const sum = filteredRows.reduce((a: number, b: any) => a + (b.value || 0), 0);
                total = sum / filteredRows.length;
              } else {
                // For countable metrics (Spend, Impressions), SUM is correct
                total = filteredRows.reduce((sum: number, row: any) => sum + (row.value || 0), 0);
              }
            }

          }

        }

        // Create time-series data for charts
        // For YouTube and other integrations with dimensional data, aggregate by date
        const seriesMap = new Map<string, { sum: number; count: number }>();
        filteredRows.forEach((row: any) => {
          const dateKey = row.date || row.dimensionValue || '';
          if (dateKey) {
            const current = seriesMap.get(dateKey) || { sum: 0, count: 0 };
            seriesMap.set(dateKey, {
              sum: current.sum + (row.value || 0),
              count: current.count + 1
            });
          }
        });

        const series = Array.from(seriesMap.entries())
          .map(([x, { sum, count }]) => {
            // If the WIDGET metric is a rate, the daily value is likely already an average for that day.
            // However, if we have multiple rows for the same day (e.g. from multiple accounts),
            // we should average them for that day too if it's a rate metric.
            const value = isRateMetric ? (sum / count) : sum;
            return { x, y: value };
          })
          .sort((a, b) => {
            // Sort by date if x is a date string, otherwise keep original order
            const dateA = new Date(a.x).getTime();
            const dateB = new Date(b.x).getTime();
            if (!isNaN(dateA) && !isNaN(dateB)) {
              return dateA - dateB;
            }
            return 0;
          });

        // Format based on widget type
        if (widget.type === 'table') {
          merged[id] = {
            rows: filteredRows,
            rawCount: filteredRows.length,
          };
        } else if (widget.type === 'line_chart' || widget.type === 'bar_chart' || widget.type === 'area_chart') {
          merged[id] = {
            value: total,
            total: total,
            series: series,
            rawCount: filteredRows.length,
            rows: filteredRows,
          };
        } else {
          // For metric cards, just value and total
          merged[id] = {
            value: total,
            total: total,
            rawCount: filteredRows.length,
            rows: filteredRows,
            series: series,
          };
        }
      });

      return merged;
    },
  });

  // Handle widget data query errors
  useEffect(() => {
    if (widgetDataQuery.error) {
      toast.error(
        (widgetDataQuery.error as ApiError).message || "Failed to load widget data"
      );
    }
  }, [widgetDataQuery.error]);

  // Use resolved widgets from query
  const resolvedWidgets: Record<string, ResolvedWidgetData> = useMemo(() => {
    return widgetDataQuery.data ?? {};
  }, [widgetDataQuery.data]);




  const getIntegrationIcon = (integration: string, className?: string) => {
    const norm = integration.toLowerCase();
    if (norm.includes('google')) return <BarChart3 className={className} />;
    if (norm.includes('meta')) return <LayoutGrid className={className} />;
    if (norm.includes('youtube')) return <div className={className}>▶</div>;
    return <LineChart className={className} />;
  };

  useEffect(() => {
    // Force unified mode
  }, []);

  const content = (
    <>
      {/* Header */}
      {!hideHeader && (
        <div className="w-full h-[4.8em] border-b flex justify-between items-center px-4 sm:px-5 sticky top-0 z-40 backdrop-blur-md bg-white/80">
          <span className="font-medium text-lg sm:text-xl text-zinc-800 tracking-tight">
            {clientId ? 'Executive Dashboard' : 'Select Client'}
          </span>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Show view clients button if client is selected */}
            {clientId && (
              <Button
                variant="ghost"
                onClick={() => navigate('/clients')}
                className="text-zinc-500 hover:text-zinc-800"
              >
                Switch Client
              </Button>
            )}

            {clientId && (
              <Link to={`/clients/${clientId}/edit-dashboard`}>
                <Button variant="outline" className="shadow-sm border-zinc-200 text-zinc-700 hover:bg-zinc-50">
                  Edit Layout
                </Button>
              </Link>
            )}

            {/* Only show date picker if client is selected */}
            {clientId && (
              <DateRangePicker
                value={dateRange}
                // @ts-ignore
                onChange={setDateRange}
              />
            )}
          </div>
        </div>
      )}

      {/* Main Content Area - Unified Grid */}
      <div className="w-full flex flex-col gap-6 px-4 py-8 max-w-[1600px] mx-auto">
        {!clientId ? (
          // CLIENT SELECTOR GRID (Replaces "No Client Selected" placeholder)
          <div className="w-full">
            {isLoadingClients ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-56 w-full rounded-xl" />
                ))}
              </div>
            ) : isClientsError ? (
              <div className="w-full px-5 py-24 text-center text-zinc-500 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-red-200 flex flex-col items-center justify-center">
                <div className="p-5 rounded-full bg-red-50 mb-6 shadow-sm">
                  <Activity className="text-4xl text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-800 mb-3 tracking-tight">Failed to load clients</h3>
                <p className="mb-8 max-w-sm text-zinc-500 font-medium">We encountered an issue while fetching your clients.</p>
                <Button onClick={() => refetchClients()} size="lg" className="rounded-xl px-8 shadow-lg shadow-red-500/20 bg-red-600 hover:bg-red-700">
                  Retry
                </Button>
              </div>
            ) : clients?.length === 0 ? (
              // No Clients Found
              <div className="w-full px-5 py-24 text-center text-zinc-500 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-zinc-200 flex flex-col items-center justify-center transition-all hover:bg-white/80">
                <div className="p-5 rounded-full bg-zinc-50 mb-6 shadow-sm">
                  <FiSearch className="text-4xl text-zinc-300" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-800 mb-3 tracking-tight">No Clients Found</h3>
                <p className="mb-8 max-w-sm text-zinc-500 font-medium">Get started by creating your first client workspace.</p>
                <Link to="/clients">
                  <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">Add Client</Button>
                </Link>
              </div>
            ) : (
              // Client Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
                {clients?.map((client) => {
                  const status = getClientHealth(client);
                  const totalIntegrations =
                    (client._count?.metaBusinessAccounts || 0) +
                    (client._count?.metaAdsAccounts || 0) +
                    (client._count?.metaInsightsAccounts || 0) +
                    (client._count?.youtubeAccounts || 0) +
                    (client._count?.shopifyAccounts || 0) +
                    (client._count?.woocommerceAccounts || 0) +
                    (client._count?.googleSearchConsoleAccounts || 0) +
                    (client._count?.googleAnalyticsAccounts || 0);

                  return (
                    <div
                      key={client.id}
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className={cn(
                        "group relative flex flex-col justify-between p-5 h-56 border rounded-xl transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-md",
                        // Status Tints
                        status === 'healthy' ? "bg-white border-zinc-200 hover:border-primary/50" :
                          status === 'warning' ? "bg-amber-50/10 border-amber-200/50 hover:border-amber-300/50" :
                            "bg-white border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      {/* Micro-Chart Background (Decorative) */}
                      <div className="absolute right-0 bottom-0 w-32 h-20 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                        <svg viewBox="0 0 100 40" className="w-full h-full fill-none stroke-current text-zinc-900">
                          <path d="M0 30 Q 10 25 20 28 T 40 20 T 60 25 T 80 15 T 100 5" strokeWidth="3" />
                        </svg>
                      </div>

                      <div className="flex flex-col items-start w-full relative z-10">
                        <div className="flex justify-between w-full mb-4">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                            status === 'healthy' ? "bg-primary/5 text-primary" :
                              status === 'warning' ? "bg-amber-50 text-amber-600" :
                                "bg-zinc-100 text-zinc-500"
                          )}>
                            <Building2 className="w-5 h-5" />
                          </div>
                        </div>

                        <h3 className="font-bold text-lg text-zinc-900 leading-tight line-clamp-1 text-left w-full group-hover:text-primary transition-colors">
                          {client.name}
                        </h3>

                        {/* Micro-Trend (Simulated) */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            status === 'healthy' ? "bg-emerald-50 text-emerald-600" : "bg-zinc-50 text-zinc-500"
                          )}>
                            {status === 'healthy' ? 'Active' : 'Setup Required'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-black/5 relative z-10">
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="text-zinc-600 text-[11px] font-medium">
                            {totalIntegrations} Connected
                          </span>
                        </div>

                        {/* Hover Action "Quick Peek" */}
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-zinc-100">
                          <span className="text-[10px] font-bold text-primary">View Dashboard →</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : dashboardsQuery.isLoading ? (
          // Loading Skeleton for Dashboard Layout
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in duration-500">
            {/* Hero Widget Skeleton */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-white rounded-3xl border border-zinc-100/60 p-6 shadow-sm h-[380px] flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full mt-4">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            </div>
            {/* Metric Card Skeletons */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-zinc-100/60 p-6 shadow-sm h-40 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-12 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        ) : dashboardWidgets.length === 0 ? (
          <div className="w-full px-5 py-24 text-center text-zinc-500 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-zinc-200 flex flex-col items-center justify-center transition-all hover:bg-white/80">
            <div className="p-5 rounded-full bg-zinc-50 mb-6 shadow-sm">
              <FiBell className="text-4xl text-zinc-300" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-800 mb-3 tracking-tight">Dashboard is Empty</h3>
            <p className="mb-8 max-w-sm text-zinc-500 font-medium">Start by customizing your executive dashboard.</p>
            <Link to={`/clients/${clientId}/edit-dashboard`}>
              <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">Customize Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in duration-500">
            {dashboardWidgets.map((widget) => {
              const data = resolvedWidgets[widget.id];
              const brandColor = getBrandColor(widget.integration || '');
              const isHero = ['line_chart', 'area_chart', 'bar_chart'].includes(widget.type || '');

              // Determine if this specific widget is loading (if we had granular loading)
              // For now, we rely on the main queries. 
              // But we can check if data is undefined but query is fetching.

              if (widgetDataQuery.isLoading) {
                return (
                  <div
                    key={widget.id}
                    className={cn(
                      "bg-white rounded-3xl border border-zinc-100/60 p-6 shadow-sm flex flex-col gap-4",
                      isHero ? "col-span-1 md:col-span-2 lg:col-span-2 row-span-2 h-[380px]" : "h-40"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-auto">
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-6 w-1/2 opacity-50" />
                    </div>
                  </div>
                );
              }

              // Value resolution
              const value = (typeof data?.total === "number" ? data.total : undefined) ??
                (typeof data?.value === "number" ? data.value : undefined);

              if (isHero) {
                // Render Large Chart
                return (
                  <div
                    key={widget.id}
                    className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-white rounded-3xl border border-zinc-100/60 p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between group h-[380px]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="p-1.5 rounded-md bg-zinc-50/50"
                            style={{ color: brandColor, backgroundColor: `${brandColor}10` }}
                          >
                            {getIntegrationIcon(widget.integration || '', "w-4 h-4")}
                          </div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                            {nameCorrection(widget.integration || '')} • {widget.metricKey.split('.').pop()?.replace(/_/g, ' ')}
                          </h3>
                        </div>
                        <span className="text-4xl font-bold text-zinc-900 tracking-tighter">
                          {formatNumber(value)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full flex-1 relative min-h-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent pointer-events-none z-10" />
                      <ChartLineMultiple
                        data={(data?.series as any) || []}
                        metricLabel={widget.metricKey}
                        color={brandColor}
                        chartType={
                          widget.type === 'area_chart' ? 'area' :
                            widget.type === 'bar_chart' ? 'bar' : 'line'
                        }
                      />
                    </div>
                  </div>
                );
              }

              // Render Metric Card
              return (
                <MetricCard
                  key={widget.id}
                  title={widget.metricKey.split('.').pop()?.replace(/_/g, ' ') || ''}
                  value={formatNumber(value ?? 0)}
                  series={(data?.series as any) || []}
                  brandColor={brandColor}
                  className="col-span-1 h-[180px]"
                  icon={getIntegrationIcon(widget.integration || '', "w-4 h-4")}
                  chartType="line"
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  if (!withLayout) {
    return <div className="w-full min-h-screen bg-slate-50/50">{content}</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-x-hidden bg-slate-50">
      {!hideHeader && (
        <div className="w-full h-[4.8em] bg-white/80 backdrop-blur-md border-b flex justify-between items-center px-6 sticky top-0 z-20">
          <span className="font-bold text-lg text-zinc-800 tracking-tight">Overview</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-600">
                <FiSearch className="text-lg" />
              </Button>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-600">
                <FiBell className="text-lg" />
              </Button>
            </div>
            {clientId && (
              <DateRangePicker
                value={dateRange}
                // @ts-ignore
                onChange={setDateRange}
              />
            )}
            {!clientId ? (
              <Link to="/clients/new">
                <Button className="shadow-sm">
                  New Client
                </Button>
              </Link>
            ) : (
              <Link to={`/clients/${clientId}/edit-dashboard`}>
                <Button variant="outline" className="shadow-sm border-zinc-200 text-zinc-700 hover:bg-zinc-50">
                  Edit Layout
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {content}
      </div>
    </div>
  );
}

export default Dashboard;
