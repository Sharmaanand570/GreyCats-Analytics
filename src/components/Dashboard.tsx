import { FiSearch, FiBell } from "react-icons/fi";
import { Button } from "./ui/button";
import { ChartLineMultiple } from "./ChartLineMultiple";
import { Link, useNavigate } from "react-router-dom";
import { DateRangePicker } from "./DateRangePicker";
import ToolTipComponenet from "./ToolTipComponenet";
import { useMemo, useState, useCallback, useEffect } from "react";
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
  WidgetSeriesPoint,
} from "@/features/reports/api/types";
import { toast } from "sonner";
import { subDays, format } from "date-fns";
import { useAvailableMetrics } from "@/features/reports/hooks/useAvailableMetrics";

/* DEFAULT_DASHBOARD_WIDGETS and helper functions removed */

const getDefaultDateRange = () => ({
  from: subDays(new Date(), 6),
  to: new Date(),
});

const formatApiDate = (value: Date) => format(value, "yyyy-MM-dd");

const formatNumber = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return "--";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

const hasWidgetData = (data?: ResolvedWidgetData) => {
  if (!data || typeof data !== "object") return false;
  const rawData = data as ResolvedWidgetData & {
    rawCount?: number;
    value?: number;
    total?: number;
    series?: WidgetSeriesPoint[];
  };
  if (typeof rawData.rawCount === "number" && rawData.rawCount > 0) return true;
  if (typeof rawData.value === "number") return true;
  if (typeof rawData.total === "number") return true;
  if (Array.isArray(rawData.series) && rawData.series.length > 0) return true;
  return false;
};



interface DashboardProps {
  clientId?: number;
  onConnectIntegration?: () => void;
  withLayout?: boolean;
  hideHeader?: boolean;
}

function Dashboard({ clientId, onConnectIntegration, withLayout = true, hideHeader = false }: DashboardProps) {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState(getDefaultDateRange());

  const { groupedMetrics } = useAvailableMetrics(clientId ?? null);

  const handleConnectIntegration = useCallback(() => {
    if (onConnectIntegration) {
      onConnectIntegration();
    } else {
      navigate(`/clients/${clientId}?tab=data-sources`);
    }
  }, [navigate, clientId, onConnectIntegration]);

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
        const widgets = entries.map(([id, widget]) => ({
          ...widget,
          id,
        }));
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

          // Build params (no accountId or dimensionType - backend handles filtering)
          const params: Record<string, string> = {
            integration: normalizedIntegration,
            metricKey: widget.metricKey!,
            startDate: dateFrom,
            endDate: dateTo,
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
          console.log(`📡 [Dashboard] GET /unified-metrics response for ${widget.metricKey}:`, {
            hasData: !!data,
            dataKeys: data ? Object.keys(data) : [],
            hasRows: data?.rows ? 'YES' : 'NO',
            rowsType: data?.rows ? typeof data.rows : 'N/A',
            isArray: Array.isArray(data?.rows),
            rowsLength: data?.rows?.length || 0,
            fullResponse: data
          });

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
          console.log(`⚠️ [Dashboard] Widget ${id} (${widget.metricKey}) has no data rows:`, {
            dataType: typeof data,
            dataKeys: data ? Object.keys(data) : [],
            hasRows: !!data?.rows,
            hasData: !!data?.data,
            isDataArray: Array.isArray(data),
            fullResponse: data
          });
          merged[id] = { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
          return;
        }

        // Use the found rows
        data.rows = rows;

        console.log(`📊 [Dashboard] Processing widget ${id} (${widget.metricKey}):`, {
          rawRowsCount: data.rows.length,
          integration: widget.integration,
          type: widget.type
        });

        // Filter rows by integration and metricKey match
        const isMetaIntegration =
          widget.integration === 'meta-ads' ||
          widget.integration === 'meta-facebook' ||
          widget.integration === 'meta-instagram';

        const isSingleAccountIntegration =
          widget.integration === 'woocommerce' ||
          widget.integration === 'youtube';

        const normalizeIntegration = (name: string) => {
          if (name === 'woo') return 'woocommerce';
          // Special case: Meta integrations keep underscores (meta-facebook, meta-instagram, meta-ads)
          if (name.startsWith('meta_')) {
            return name; // Keep underscores for Meta integrations
          }
          return name.replace(/_/g, '-');
        };

        const filteredRows = data.rows.filter((row: any) => {
          const rowIntegration = normalizeIntegration(row.integration || '');
          const widgetIntegration = normalizeIntegration(widget.integration || '');

          // Debug logging for Meta Ads
          if (widget.integration === 'meta-ads' || row.integration === 'meta_ads' || row.integration === 'meta-ads') {
            console.log('📘 [Dashboard] Meta Ads filtering:', {
              rowIntegration: row.integration,
              normalizedRowIntegration: rowIntegration,
              widgetIntegration: widget.integration,
              normalizedWidgetIntegration: widgetIntegration,
              rowMetricKey: row.metricKey,
              widgetMetricKey: widget.metricKey,
              integrationMatch: rowIntegration === widgetIntegration,
              metricMatch: row.metricKey === widget.metricKey
            });
          }

          const matchesBasic = isMetaIntegration || isSingleAccountIntegration
            ? (row.metricKey === widget.metricKey && rowIntegration === widgetIntegration)
            : (row.metricKey === widget.metricKey && rowIntegration === widgetIntegration);

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

          return matchesBasic && (!isDimensional || isWooDateDimension || isYouTubeDimension);
        });

        console.log(`📊 [Dashboard] Widget ${id} filtered rows:`, {
          beforeFilter: data.rows.length,
          afterFilter: filteredRows.length,
          integration: widget.integration,
          metricKey: widget.metricKey
        });

        // Calculate total value
        const total = filteredRows.reduce((sum: number, row: any) => sum + (row.value || 0), 0);

        // Create time-series data for charts
        // For YouTube and other integrations with dimensional data, aggregate by date
        const seriesMap = new Map<string, number>();
        filteredRows.forEach((row: any) => {
          const dateKey = row.date || row.dimensionValue || '';
          if (dateKey) {
            const currentValue = seriesMap.get(dateKey) || 0;
            seriesMap.set(dateKey, currentValue + (row.value || 0));
          }
        });

        const series = Array.from(seriesMap.entries())
          .map(([x, y]) => ({ x, y }))
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


  // Group widgets by integration for rendering
  const integrationSections = useMemo(() => {
    const sections: Record<string, { mainChart?: DashboardWidget, cards: DashboardWidget[] }> = {};

    dashboardWidgets.forEach(widget => {
      // Use integration + accountId as key to distinguish same integration different accounts
      // But purely for UI grouping 'Integration' name might be enough if we assume one account per integration type for now,
      // OR explicitly show account name. Agency analytics usually groups by "Facebook", "Google" etc. 
      // Let's use integration name.
      const key = widget.integration;

      if (!sections[key]) {
        sections[key] = { cards: [] };
      }

      if (['line_chart', 'area_chart', 'bar_chart'].includes(widget.type || '') && !sections[key].mainChart) {
        sections[key].mainChart = widget;
      } else {
        sections[key].cards.push(widget);
      }
    });
    console.log('[Dashboard] Widgets:', dashboardWidgets);
    console.log('[Dashboard] Sections:', sections);
    return sections;
  }, [dashboardWidgets]);

  // renderSparkline removed

  const renderMetricCard = (widget: DashboardWidget, idx: number) => {
    const data = resolvedWidgets[widget.id];
    const value =
      (typeof data?.total === "number" ? data.total : undefined) ??
      (typeof data?.value === "number" ? data.value : undefined);
    const hasData = hasWidgetData(data);

    return (
      <div
        key={`${widget.id}-${idx}`}
        className="flex-1 min-w-[12rem] sm:min-w-[14rem] bg-white rounded-xl border border-gray-100 p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* Icon could go here */}
            <span className="text-xs font-medium uppercase text-gray-500 tracking-wide">
              {widget.metricKey.split('.').pop()?.replace(/_/g, ' ')}
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {formatNumber(value ?? 0)}
          </span>
        </div>

        {hasData ? (
          // Render Sparkline manually (simple rechart without axes)
          // Since we don't have a 'simple' prop on ChartLineMultiple yet, we can render it here or assume ChartLineMultiple handles it.
          // For now, let's just reuse ChartLineMultiple but we need to hide AXIS via CSS or add a prop.
          // I'll assume standard ChartLineMultiple for now, maybe it's too big.
          // Ideally we need a <SparkLine /> component. 
          // Let's rely on ChartLineMultiple adjusting to container height.
          <div className="h-16 -mx-2 -mb-2">
            <ChartLineMultiple
              data={(data.series as any) || []}
              metricLabel={widget.metricKey}
              simple={true}
            />
          </div>
        ) : (
          <span className="text-xs text-gray-400 mt-2">No data</span>
        )}
      </div>
    );
  };

  const content = (
    <>
      {/* Header */}
      {!hideHeader && (
        <div className="w-full h-[4.8em] bg-background border-b flex justify-between items-center px-4 sm:px-5">
          <span className="font-medium text-lg sm:text-xl">Dashboard</span>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* ... existing header controls ... */}
            {clientId && (
              <ToolTipComponenet
                content="Edit dashboard layout and widgets."
                side="left"
                align="center"
              >
                <Link to={`/clients/${clientId}/edit-dashboard`}>
                  <Button className="rounded-md text-xs sm:text-sm md:text-base">
                    Edit Dashboard
                  </Button>
                </Link>
              </ToolTipComponenet>
            )}
            <DateRangePicker
              value={dateRange}
              // @ts-ignore
              onChange={setDateRange}
            />
          </div>
        </div>
      )}
      {hideHeader && (
        <div className="w-full flex justify-end px-3 sm:px-5 py-2">
          {clientId && (
            <Link to={`/clients/${clientId}/edit-dashboard`}>
              <Button variant="outline" size="sm" className="text-xs">
                Edit Dashboard
              </Button>
            </Link>
          )}
          <DateRangePicker
            value={dateRange}
            // @ts-ignore
            onChange={setDateRange}
          />
        </div>
      )}

      {/* Main Content Area - Sections */}
      <div className="w-full flex flex-col gap-8 px-5 py-6">
        {!clientId ? (
          <div className="w-full px-5 py-16 text-center text-gray-500 bg-white rounded-2xl border border-dashed flex flex-col items-center justify-center">
            <div className="p-4 rounded-full bg-gray-50 mb-4">
              <FiSearch className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Client Selected</h3>
            <p className="mb-6 max-w-sm">Please select a client to view their dashboard and metrics.</p>
            <Link to="/clients">
              <Button>View Clients</Button>
            </Link>
          </div>
        ) : Object.keys(integrationSections).length === 0 ? (
          <div className="w-full px-5 py-16 text-center text-gray-500 bg-white rounded-2xl border border-dashed flex flex-col items-center justify-center">
            <div className="p-4 rounded-full bg-gray-50 mb-4">
              <FiBell className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Dashboard is Empty</h3>
            <p className="mb-6 max-w-sm">Start by adding widgets to your dashboard.</p>
            <Link to={`/clients/${clientId}/edit-dashboard`}>
              <Button>Edit Dashboard</Button>
            </Link>
          </div>
        ) : (
          Object.entries(integrationSections).map(([integration, section]) => (
            <div key={integration} className="flex flex-col gap-4">
              {/* Section Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <h2 className="text-xl font-semibold capitalize text-gray-800">{integration}</h2>
                <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-50 rounded-full">
                  {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                </span>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Chart - Takes 2/3 width on large screens */}
                {section.mainChart && (
                  <div className="w-full lg:w-2/3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-gray-700">
                        {section.mainChart.metricKey.split('.').pop()?.replace(/_/g, ' ')}
                      </h3>
                    </div>
                    <div className="w-full h-[300px]">
                      <ChartLineMultiple
                        data={(resolvedWidgets[section.mainChart.id]?.series as any) || []}
                        metricLabel={section.mainChart.metricKey}
                        chartType={
                          section.mainChart.type === 'area_chart' ? 'area' :
                            section.mainChart.type === 'bar_chart' ? 'bar' :
                              'line'
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Metric Cards Row */}
                {section.cards.length > 0 && (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {section.cards.map((widget, idx) => renderMetricCard(widget, idx))}
                  </div>
                )}
              </div>

              {/* Re-rendering Section: Layout Adjustment requested by "Screenshot" logic */}
              {/* Let's ignore the previous flex-row structure which put chart next to cards.
                   We want Chart ROW then Cards ROW.
               */}
            </div>
          ))
        )}
      </div>

      {/* ... corrected render loop below ... */}
    </>
  );


  /* RE-WRITING THE RENDER LOOP PROPERLY FOR REPLACEMENT */
  /* We need to be careful with the replacement. */

  if (!withLayout) {
    return <div className="w-full flex flex-col">{content}</div>;
  }

  return (
    <div className="w-full h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-background ">
        {/* Header */}
        {!hideHeader && (
          <div className="w-full h-[4.8em] bg-background border-b flex justify-between items-center px-4 sm:px-5">
            <span className="font-medium text-lg sm:text-xl">Dashboard</span>
            <div className="flex items-center gap-3 sm:gap-4">
              <FiSearch className="text-lg text-gray-500 cursor-pointer" />
              <FiBell className="text-lg text-gray-500 cursor-pointer" />
              {clientId && (
                <ToolTipComponenet
                  content="Edit dashboard layout and widgets."
                  side="left"
                  align="center"
                >
                  <Link to={`/clients/${clientId}/edit-dashboard`}>
                    <Button className="rounded-md text-xs sm:text-sm md:text-base">
                      Edit Dashboard
                    </Button>
                  </Link>
                </ToolTipComponenet>
              )}
              <DateRangePicker
                value={dateRange}
                // @ts-ignore
                onChange={setDateRange}
              />
            </div>
          </div>
        )}
        {!withLayout && hideHeader && (
          <div className="w-full flex justify-end px-3 sm:px-5 py-2">
            {clientId && (
              <Link to={`/clients/${clientId}/edit-dashboard`}>
                <Button variant="outline" size="sm" className="text-xs">
                  Edit Dashboard
                </Button>
              </Link>
            )}
            <DateRangePicker
              value={dateRange}
              // @ts-ignore
              onChange={setDateRange}
            />
          </div>
        )}

        <div className="w-full flex flex-col gap-4 px-4 py-6 bg-gray-50/50 min-h-screen">
          <div className="w-full flex flex-col gap-4 px-4 py-6 bg-gray-50/50 min-h-screen">
            {!clientId ? (
              <div className="w-full px-5 py-16 text-center text-gray-500 bg-white rounded-2xl border border-dashed flex flex-col items-center justify-center">
                <div className="p-4 rounded-full bg-gray-50 mb-4">
                  <FiSearch className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Client Selected</h3>
                <p className="mb-6 max-w-sm">Please select a client to view their dashboard and metrics.</p>
                <Link to="/clients">
                  <Button>View Clients</Button>
                </Link>
              </div>
            ) : Object.keys(integrationSections).length === 0 ? (
              <div className="w-full px-5 py-16 text-center text-gray-500 bg-white rounded-2xl border border-dashed">
                <p className="mb-4 text-lg">No metrics configured.</p>
                <Button onClick={handleConnectIntegration}>Connect Integrations</Button>
              </div>
            ) : (
              // Render sections in the order they appear in the dashboard configuration
              (() => {
                // Derive order from the first time an integration appears in the resolved widgets list
                // layout-order comes from dashboardWidgets which is what createDashboardWidgetsFromMetrics or strict widgets array returns
                const orderedIntegrations = new Set<string>();
                dashboardWidgets.forEach(w => {
                  if (w.integration) orderedIntegrations.add(w.integration);
                });

                // If we have sections that aren't in the ordered list (edge case), append them
                Object.keys(integrationSections).forEach(k => orderedIntegrations.add(k));

                return Array.from(orderedIntegrations).map((integration) => {
                  const section = integrationSections[integration];
                  console.log(`[Dashboard] Rendering section: ${integration}`, section);
                  if (!section) return null;

                  return (
                    <div key={integration} className="flex flex-col gap-3">
                      {/* Section Header Box */}
                      <div className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800 capitalize">{integration}</h2>
                        {/* Optional: Add account ID or status here */}
                      </div>

                      {/* Main Chart Row */}
                      {section.mainChart && (
                        <div className="w-full bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-base font-medium text-gray-700 capitalize">
                              {section.mainChart.metricKey.split('.').pop()?.replace(/_/g, ' ')}
                            </h3>
                            <span className="ml-auto text-xl font-bold text-gray-900">
                              {formatNumber(
                                (resolvedWidgets[section.mainChart.id]?.total as number) ??
                                (resolvedWidgets[section.mainChart.id]?.value as number)
                              )}
                            </span>
                          </div>
                          <div className="w-full h-[250px]">
                            <ChartLineMultiple
                              data={(resolvedWidgets[section.mainChart.id]?.series as any) || []}
                              metricLabel={section.mainChart.metricKey}
                              chartType={
                                section.mainChart.type === 'area_chart' ? 'area' :
                                  section.mainChart.type === 'bar_chart' ? 'bar' :
                                    'line'
                              }
                            />
                          </div>
                        </div>
                      )}

                      {/* Metric Cards Row */}
                      {section.cards.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                          {section.cards.map((widget, idx) => renderMetricCard(widget, idx))}
                        </div>
                      )}
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>

      </div>
    </div>
  );
}


export default Dashboard;
