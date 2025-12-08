import { FiSearch, FiBell } from "react-icons/fi";
import { Button } from "./ui/button";
import { ChartLineMultiple } from "./ChartLineMultiple";
import { ChartPieInteractive } from "./ChartPieInteractive";
import { getChangeIndicatorClass } from "../utils/statusColors";
import { Link, useNavigate } from "react-router-dom";
import ToolTipComponenet from "./ToolTipComponenet";
import { useMemo, useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  listDashboards,
  resolveMetricWidgets,
} from "@/features/reports/api/reportingApi";
import type {
  ApiError,
  Dashboard as DashboardModel,
  DashboardWidget,
  ResolvedWidgetData,
  WidgetSeriesPoint,
  ResolveWidgetsResponse,
} from "@/features/reports/api/types";
import { toast } from "sonner";
import { subDays, format } from "date-fns";
import { useAvailableMetrics } from "@/features/reports/hooks/useAvailableMetrics";

const DEFAULT_DASHBOARD_WIDGETS: DashboardWidget[] = [
  {
    id: "dw1",
    metricKey: "woo.revenue",
    integration: "woo",
    groupBy: "none",
    aggregation: "sum",
    type: "metric_card",
    source: "woo",
  },
  {
    id: "dw2",
    metricKey: "woo.orders",
    integration: "woo",
    groupBy: "day",
    aggregation: "sum",
    type: "metric_card",
    source: "woo",
  },
  {
    id: "dw3",
    metricKey: "meta.page.impressions",
    integration: "meta",
    groupBy: "day",
    aggregation: "sum",
    type: "metric_card",
    source: "meta",
  },
  {
    id: "dw4",
    metricKey: "youtube.views",
    integration: "youtube",
    groupBy: "day",
    aggregation: "sum",
    type: "metric_card",
    source: "youtube",
  },
  {
    id: "dw5",
    metricKey: "meta.page.impressions",
    integration: "meta",
    groupBy: "day",
    aggregation: "sum",
    type: "line_chart",
    source: "meta",
  },
  {
    id: "dw6",
    metricKey: "woo.revenue",
    integration: "woo",
    groupBy: "none",
    aggregation: "sum",
    type: "chart",
    source: "woo",
  },
];

const getDefaultDateRange = () => ({
  from: subDays(new Date(), 6),
  to: new Date(),
});

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

// Helper to create dashboard widgets from available metrics
const createDashboardWidgetsFromMetrics = (
  groupedMetrics: Record<string, Record<string, Array<{
    metricKey: string;
    integration: string;
    accountId: string;
    displayName: string;
    category: string;
  }>>>
): DashboardWidget[] => {
  const widgets: DashboardWidget[] = [];
  let widgetId = 1;

  // Collect first 4 metrics for metric cards
  for (const integration of Object.keys(groupedMetrics)) {
    for (const accountId of Object.keys(groupedMetrics[integration])) {
      const metrics = groupedMetrics[integration][accountId];
      
      for (const metric of metrics.slice(0, 4 - widgets.length)) {
        widgets.push({
          id: `dw${widgetId++}`,
          metricKey: metric.metricKey,
          integration: metric.integration,
          accountId: metric.accountId,
          groupBy: "none",
          aggregation: "sum",
          type: "metric_card",
        });
      }
      
      if (widgets.length >= 4) break;
    }
    if (widgets.length >= 4) break;
  }

  // Add chart widgets if we have at least one metric
  if (widgets.length > 0) {
    const firstMetric = widgets[0];
    
    // Line chart
    widgets.push({
      id: `dw${widgetId++}`,
      metricKey: firstMetric.metricKey,
      integration: firstMetric.integration,
      accountId: firstMetric.accountId,
      groupBy: "day",
      aggregation: "sum",
      type: "line_chart",
    });

    // Pie chart - use second metric if available
    const secondMetric = widgets.length > 1 ? widgets[1] : firstMetric;
    widgets.push({
      id: `dw${widgetId++}`,
      metricKey: secondMetric.metricKey,
      integration: secondMetric.integration,
      accountId: secondMetric.accountId,
      groupBy: "none",
      aggregation: "sum",
      type: "chart",
    });
  }

  return widgets;
};

const getDefaultDashboardWidgets = (): DashboardWidget[] =>
  DEFAULT_DASHBOARD_WIDGETS.map((widget) => ({ ...widget }));

const DashboardEmptyState = ({
  message,
  onConnectIntegration,
}: {
  message: string;
  onConnectIntegration: () => void;
}) => (
  <div className="flex flex-col items-center justify-center text-center text-sm text-gray-500 gap-2 py-4">
    <span>{message}</span>
    <Button variant="outline" size="sm" onClick={onConnectIntegration}>
      Connect Integration
    </Button>
  </div>
);

function Dashboard() {
  const navigate = useNavigate();
  const [dateRange] = useState(getDefaultDateRange());
  
  const { groupedMetrics } = useAvailableMetrics();

  const handleConnectIntegration = useCallback(() => {
    navigate("/data-sources");
  }, [navigate]);

  const dashboardsQuery = useQuery<DashboardModel[], ApiError>({
    queryKey: ["dashboards"],
    queryFn: async () => {
      const response = await listDashboards();
      return response.dashboards;
    },
  });

  useEffect(() => {
    if (dashboardsQuery.error) {
      toast.error(dashboardsQuery.error.message || "Failed to load dashboards");
    }
  }, [dashboardsQuery.error]);

  const dashboards = dashboardsQuery.data ?? [];
  const activeDashboard = dashboards[0];

  const dashboardWidgets = useMemo<DashboardWidget[]>(() => {
    // If user has a saved dashboard, use it
    if (activeDashboard?.widgets) {
      const entries = Object.entries(
        activeDashboard.widgets
      ) as [string, DashboardWidget][];
      if (entries.length > 0) {
        return entries.map(([id, widget]) => ({
          ...widget,
          id,
        }));
      }
    }
    
    // If we have connected integrations with metrics, create dynamic widgets
    if (Object.keys(groupedMetrics).length > 0) {
      return createDashboardWidgetsFromMetrics(groupedMetrics);
    }
    
    // Otherwise fall back to hardcoded defaults
    return getDefaultDashboardWidgets();
  }, [activeDashboard, groupedMetrics]);

  const dateRangeKey = `${format(dateRange.from, "yyyy-MM-dd")}_${format(
    dateRange.to,
    "yyyy-MM-dd"
  )}`;
  const widgetSignature = dashboardWidgets.map((widget) => widget.id).join("|");

  const resolveQuery = useQuery<ResolveWidgetsResponse, ApiError>({
    queryKey: ["dashboard-widget-data", widgetSignature, dateRangeKey],
    enabled: dashboardWidgets.length > 0,
    queryFn: async () => {
      const response = await resolveMetricWidgets({
        dateFrom: format(dateRange.from, "yyyy-MM-dd"),
        dateTo: format(dateRange.to, "yyyy-MM-dd"),
        widgets: dashboardWidgets.map((widget) => ({
          id: widget.id,
          type: widget.type ?? "metric_card",
          metricKey: widget.metricKey,
          integration: widget.integration,
          groupBy: widget.groupBy,
          aggregation: widget.aggregation,
          accountId: widget.accountId,
          ...(widget.filters ? { filters: widget.filters } : {}),
        })),
      });
      return response;
    },
  });

  useEffect(() => {
    if (resolveQuery.error) {
      toast.error(
        resolveQuery.error.message || "Failed to resolve dashboard data"
      );
    }
  }, [resolveQuery.error]);

  const resolvedWidgets: Record<string, ResolvedWidgetData> =
    resolveQuery.data?.data ?? {};
  const isResolving = resolveQuery.isFetching;

  const metricCards = useMemo(() => {
    const cards = dashboardWidgets.filter((widget) =>
      (widget.type ?? "").toLowerCase().includes("metric")
    );
    if (cards.length >= 4) {
      return cards.slice(0, 4);
    }
    return [...cards, ...getDefaultDashboardWidgets()].slice(0, 4);
  }, [dashboardWidgets]);

  const lineChartWidget = useMemo(() => {
    return (
      dashboardWidgets.find((widget) =>
        (widget.type ?? "").toLowerCase().includes("line")
      ) ?? dashboardWidgets.find((widget) => (widget.type ?? "").includes("chart"))
    );
  }, [dashboardWidgets]);

  const pieChartWidget = useMemo(() => {
    return dashboardWidgets.find(
      (widget) =>
        widget !== lineChartWidget &&
        (widget.type ?? "").toLowerCase().includes("chart")
    );
  }, [dashboardWidgets, lineChartWidget]);

  const renderMetricCard = (widget: DashboardWidget, idx: number) => {
    const data = resolvedWidgets[widget.id];
    const value =
      (typeof data?.total === "number" ? data.total : undefined) ??
      (typeof data?.value === "number" ? data.value : undefined);
    const hasData = hasWidgetData(data);
    return (
      <div
        key={`${widget.id}-${idx}`}
        className="flex-1 min-w-[12rem] sm:min-w-[10rem] md:min-w-[12rem] lg:min-w-[14rem] xl:min-w-[16rem] bg-gradient-to-tr from-[#F3F3F3] to-white rounded-2xl border flex flex-col justify-center p-4 sm:p-5 md:p-6"
      >
        <span className="text-xs sm:text-sm text-gray-500">
          {widget.metricKey}
        </span>
        <span className="text-xl sm:text-2xl md:text-[1.6rem] font-semibold my-1">
          {formatNumber(value ?? 0)}
        </span>
        <span
          className={`text-xs sm:text-sm ${getChangeIndicatorClass(
            hasData
          )} flex items-center gap-2`}
        >
          {hasData
            ? `${data?.rawCount ?? 0} data points`
            : "No data yet"}
        </span>
        {!hasData && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnectIntegration}
            >
              Connect Integration
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full   my-4 bg-background ">
        {/* Header */}
        <div className="w-full h-[4.8em] bg-background border-b flex justify-between items-center px-4 sm:px-5">
          <span className="font-medium text-lg sm:text-xl">Dashboard</span>
          <div className="flex items-center gap-3 sm:gap-4">
            <FiSearch className="text-lg text-gray-500 cursor-pointer" />
            <FiBell className="text-lg text-gray-500 cursor-pointer" />
            <ToolTipComponenet
              content="Edit dashboard layout and widgets."
              side="left"
              align="center"
            >
              <Link to={"/edit-dashboard"}>
                <Button className="rounded-md text-xs sm:text-sm md:text-base">
                  Edit Dashboard
                </Button>
              </Link>
            </ToolTipComponenet>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="w-full flex flex-wrap gap-3 sm:gap-4 px-3 sm:px-5 py-4">
          {metricCards.map(renderMetricCard)}
        </div>

        {/* Charts Section */}
        <div className="w-full px-3 sm:px-5 pb-6 flex flex-col lg:flex-row gap-6">
          {/* Line Chart */}
          <div className="w-full lg:w-2/3  rounded-2xl border p-3 sm:p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs uppercase text-gray-500">
                  {lineChartWidget?.metricKey ?? "Chart"}
                </span>
                <p className="text-base font-semibold text-gray-900">
                  {lineChartWidget?.integration ?? "Unified Metrics"}
                </p>
                <p className="text-xs text-gray-500">
                  {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleConnectIntegration}
              >
                Connect Integration
              </Button>
            </div>
            <ChartLineMultiple />
            <div className="border-t pt-3">
              {hasWidgetData(resolvedWidgets[lineChartWidget?.id ?? ""]) ? (
                <ul className="text-sm text-gray-700 space-y-1">
                  {(
                    (resolvedWidgets[lineChartWidget?.id ?? ""]?.series ??
                      []) as WidgetSeriesPoint[]
                  )
                    .slice(0, 5)
                    .map((point, idx) => (
                    <li key={`${point.x}-${idx}`} className="flex justify-between">
                      <span>{point.x}</span>
                      <span className="font-medium">{point.y}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <DashboardEmptyState
                  message={
                    isResolving
                      ? "Fetching chart data..."
                      : "No chart data yet"
                  }
                  onConnectIntegration={handleConnectIntegration}
                />
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="w-full lg:w-1/3  rounded-2xl border p-3 sm:p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs uppercase text-gray-500">
                  {pieChartWidget?.metricKey ?? "Breakdown"}
                </span>
                <p className="text-base font-semibold text-gray-900">
                  {pieChartWidget?.integration ?? "Unified Metrics"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleConnectIntegration}
              >
                Connect Integration
              </Button>
            </div>
            <ChartPieInteractive />
            <div className="border-t pt-3">
              {hasWidgetData(resolvedWidgets[pieChartWidget?.id ?? ""]) ? (
                <ul className="text-sm text-gray-700 space-y-1">
                  {(
                    (resolvedWidgets[pieChartWidget?.id ?? ""]?.series ?? []) as
                      | WidgetSeriesPoint[]
                  )
                    .slice(0, 5)
                    .map((point, idx) => (
                    <li key={`${point.x}-${idx}`} className="flex justify-between">
                      <span>{point.x}</span>
                      <span className="font-medium">{point.y}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <DashboardEmptyState
                  message={
                    isResolving
                      ? "Fetching widget data..."
                      : "No breakdown data yet"
                  }
                  onConnectIntegration={handleConnectIntegration}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
