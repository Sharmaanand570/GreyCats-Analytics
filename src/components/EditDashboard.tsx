import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiMove } from "react-icons/fi";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAvailableMetrics } from "@/features/reports/hooks/useAvailableMetrics";
import {
  createDashboard,
  listDashboards,
  updateDashboard,
} from "@/features/reports/api/reportingApi";
import type {
  ApiError,
  DashboardWidget,
  Dashboard,
} from "@/features/reports/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { useParams } from "react-router-dom";
import { BarChart3, LayoutGrid, LineChart } from "lucide-react";
import { useIntegrations } from "@/features/DataSources/hooks/useIntegrations";

const TABLE_METRIC_KEYS = new Set([
  "meta.facebook.recent_posts",
  "meta.instagram.recent_media",
  "meta.ads.campaign_performance",
  "google_ads.campaign_performance",
  "google_seo.top_pages",
  "google_seo.top_queries",
  "google.channel_traffic",
  "google.browser_used",
  "google.device_category",
  "google.geo_country",
  "google.geo_city",
  "google.top_pages",
]);

const isTableMetric = (metricKey: string) => TABLE_METRIC_KEYS.has(metricKey);


const getIntegrationIcon = (integration: string, className?: string) => {
  const norm = integration.toLowerCase();
  if (norm.includes('google')) return <BarChart3 className={className} />;
  if (norm.includes('meta')) return <LayoutGrid className={className} />;
  if (norm.includes('youtube')) return <div className={className}>▶</div>;
  return <LineChart className={className} />;
};

// --- New Component: Individual Widget Editor Card ---
const WidgetEditCard = memo(({
  widget,
  // index, // Unused
  onRemove,
  onMove,
  onUpdate,
  availableMetrics
}: {
  widget: DashboardWidget,
  index: number,
  onRemove: () => void,
  onMove: (dir: 'up' | 'down') => void,
  onUpdate: (updated: DashboardWidget) => void,
  availableMetrics: Array<{ metricKey: string; displayName: string }>
}) => {

  // Find display name for current metric

  // const isChart = ... // Unused

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center group hover:border-zinc-300 transition-all">
      {/* Drag Handle Area (Visual only for now) */}
      <div className="hidden sm:flex items-center text-zinc-300 cursor-grab active:cursor-grabbing">
        <FiMove />
      </div>

      {/* Icon & Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 bg-zinc-50 rounded border border-zinc-100 text-zinc-500">
            {getIntegrationIcon(widget.integration || '', "w-3.5 h-3.5")}
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            {widget.integration} {widget.accountId ? `• ${widget.accountId}` : ''}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
          {/* Metric Selector */}
          <Select
            value={widget.metricKey}
            onValueChange={(val) => onUpdate({ ...widget, metricKey: val })}
          >
            <SelectTrigger className="h-8 w-full sm:w-[240px] text-sm font-medium border-zinc-200">
              <SelectValue placeholder="Select Metric" />
            </SelectTrigger>
            <SelectContent>
              {availableMetrics.map(m => (
                <SelectItem key={m.metricKey} value={m.metricKey}>{m.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type Selector (Simple) */}
          <Select
            value={widget.type || 'metric_card'}
            onValueChange={(val) => onUpdate({ ...widget, type: val as any })}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs text-zinc-500 border-zinc-100 bg-zinc-50/50">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
          <SelectContent>
            <SelectItem value="metric_card">Card</SelectItem>
            <SelectItem value="line_chart">Line Chart</SelectItem>
            <SelectItem value="bar_chart">Bar Chart</SelectItem>
            <SelectItem value="area_chart">Area Chart</SelectItem>
            <SelectItem value="table">Table</SelectItem>
          </SelectContent>
        </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 self-end sm:self-center">
        <Button variant="ghost" size="icon-sm" onClick={() => onMove('up')} className="h-8 w-8 text-zinc-400 hover:text-zinc-700">
          <FiArrowUp />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => onMove('down')} className="h-8 w-8 text-zinc-400 hover:text-zinc-700">
          <FiArrowDown />
        </Button>
        <div className="w-px h-4 bg-zinc-200 mx-1" />
        <Button variant="ghost" size="icon-sm" onClick={onRemove} className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50">
          <FiTrash2 />
        </Button>
      </div>
    </div>
  );
});
WidgetEditCard.displayName = "WidgetEditCard";


const SidebarAddIntegration = memo(
  ({
    availableIntegrations,
    groupedMetrics,
    onAddMetric,
  }: {
    availableIntegrations: Array<{
      integration: string;
      accountId: string;
      metricsCount: number;
    }>;
    groupedMetrics: Record<string, Record<string, Array<{ metricKey: string; displayName: string }>>>;
    onAddMetric: (integration: string, accountId: string, metricKey: string, displayName: string, type: string) => void;
  }) => {
    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    return (
      <div className="w-full sm:w-[17rem] md:w-[19rem] border-r flex flex-col sticky top-[4.8em] h-[calc(100vh-8.3em)] bg-white overflow-hidden z-20">
        <div className="p-4 border-b bg-gray-50/80">
          <h3 className="text-sm font-semibold text-gray-900">Add Data Source</h3>
          <p className="text-xs text-gray-500 mt-1">
            Select a source, then add metrics one by one.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {availableIntegrations.length === 0 ? (
            <div className="px-4 py-8 text-center bg-gray-50 rounded-lg border border-dashed mx-2 mt-4">
              <p className="text-xs text-gray-500">No sources available.</p>
            </div>
          ) : (
            availableIntegrations.map((item) => {
              const key = `${item.integration}-${item.accountId}`;
              const isExpanded = expandedKey === key;
              const metrics = groupedMetrics[item.integration]?.[item.accountId] ?? [];

              return (
                <div key={key}>
                  {/* Integration header */}
                  <button
                    onClick={() => setExpandedKey(isExpanded ? null : key)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-left ${
                      isExpanded
                        ? "bg-primary/5 border border-primary/20"
                        : "bg-white border border-transparent hover:border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 capitalize truncate">
                        {item.integration.replace(/[-_]/g, " ")}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate">
                        {metrics.length} metrics
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded metrics list */}
                  {isExpanded && (
                    <div className="ml-2 mr-1 mt-1 mb-2 space-y-0.5 max-h-[50vh] overflow-y-auto">
                      {metrics.map((metric) => (
                        <div
                          key={metric.metricKey}
                          className="group flex items-center justify-between gap-1 px-2.5 py-2 rounded-md hover:bg-zinc-50 transition-colors"
                        >
                          <span className="text-xs text-gray-700 truncate flex-1" title={metric.metricKey}>
                            {metric.displayName}
                          </span>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => onAddMetric(item.integration, item.accountId, metric.metricKey, metric.displayName, "metric_card")}
                              className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-zinc-100 hover:bg-primary hover:text-white transition-colors"
                              title="Add as Card"
                            >
                              Card
                            </button>
                            <button
                              onClick={() => onAddMetric(item.integration, item.accountId, metric.metricKey, metric.displayName, "line_chart")}
                              className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-zinc-100 hover:bg-primary hover:text-white transition-colors"
                              title="Add as Chart"
                            >
                              Chart
                            </button>
                            {isTableMetric(metric.metricKey) && (
                              <button
                                onClick={() => onAddMetric(item.integration, item.accountId, metric.metricKey, metric.displayName, "table")}
                                className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-zinc-100 hover:bg-primary hover:text-white transition-colors"
                                title="Add as Table"
                              >
                                Table
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }
);
SidebarAddIntegration.displayName = "SidebarAddIntegration";


function EditDashboard() {
  const [dashboardName, setDashboardName] = useState("My Dashboard");
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const queryClient = useQueryClient();

  const params = useParams<{ clientId?: string }>();
  const clientId = params.clientId ? parseInt(params.clientId, 10) : null;

  const { data: integrationsData } = useIntegrations(clientId, {
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });

  const integrationVersion = useMemo(() => {
    const integrations = integrationsData?.integrations;
    if (!integrations) return undefined;
    return integrations
      .map((integration) => `${integration.id}-${integration.platform}`)
      .sort()
      .join(",");
  }, [integrationsData?.integrations]);

  const connectedIntegrations = useMemo(() => {
    const integrations = integrationsData?.integrations;
    if (!integrations) return [];
    return integrations.map((integration) => ({
      platform: integration.platform,
      accountId: integration.accountId || "default",
    }));
  }, [integrationsData?.integrations]);

  // Metrics hook
  const { groupedMetrics } = useAvailableMetrics(clientId, {
    enabled: integrationVersion !== undefined,
    integrationVersion,
    connectedIntegrations,
  });

  // Fetch Dashboard
  const dashboardsQuery = useQuery<Dashboard[], ApiError>({
    queryKey: ["dashboards", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const response = await listDashboards(clientId);
      return response.dashboards;
    },
    enabled: !!clientId,
  });

  const dashboards = (dashboardsQuery.data ?? []) as Dashboard[];
  const activeDashboard = dashboards[0];

  useEffect(() => {
    if (activeDashboard?.name) {
      setDashboardName(activeDashboard.name);
    }

    if (activeDashboard?.widgets) {
      const entries = Object.entries(activeDashboard.widgets);
      if (entries.length > 0) {
        const allWidgets = entries
          .map(([id, widget]) => ({
            ...(widget as DashboardWidget),
            id,
          }))
          .sort((a, b) => (a.layout?.y ?? 0) - (b.layout?.y ?? 0));

        // Filter out orphaned widgets (widgets referencing disconnected integrations)
        // Only filter if groupedMetrics is available
        if (groupedMetrics && Object.keys(groupedMetrics).length > 0) {
          const validWidgets = allWidgets.filter(widget => {
            // Check if this widget's integration+account exists in available metrics
            const hasMetrics = groupedMetrics[widget.integration]?.[widget.accountId || ''];
            return !!hasMetrics;
          });

          // Show notification if widgets were filtered out
          const removedCount = allWidgets.length - validWidgets.length;
          if (removedCount > 0) {
            toast.info(
              `${removedCount} widget${removedCount > 1 ? 's' : ''} removed due to disconnected data sources`,
              { duration: 5000 }
            );
          }

          setWidgets(validWidgets);
        } else {
          // If no metrics available yet, set all widgets (will be filtered on next render)
          setWidgets(allWidgets);
        }
      } else {
        setWidgets([]);
      }
    } else {
      setWidgets([]);
    }
  }, [activeDashboard, groupedMetrics]);


  // --- Helper: Get available metrics for a widget ---
  const getMetricsForWidget = useCallback((widget: DashboardWidget) => {
    if (!groupedMetrics) return [];
    const accountId = widget.accountId || Object.keys(groupedMetrics[widget.integration] || {})[0];
    return groupedMetrics[widget.integration]?.[accountId] || [];
  }, [groupedMetrics]);


  // --- Actions ---

  const handleAddMetric = useCallback((
    integration: string,
    accountId: string,
    metricKey: string,
    displayName: string,
    type: string
  ) => {
    const newWidget: DashboardWidget = {
      id: `dw${Date.now()}`,
      metricKey,
      integration,
      accountId,
      groupBy: "day",
      aggregation: "sum",
      type: type as any,
    };
    setWidgets(prev => [...prev, newWidget]);
    toast.success(`Added ${displayName} as ${type.replace(/_/g, " ")}`);
  }, []);

  const handleRemoveWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  }, []);

  const handleUpdateWidget = useCallback((updated: DashboardWidget) => {
    setWidgets(prev => prev.map(w => w.id === updated.id ? updated : w));
  }, []);

  const handleMoveWidget = useCallback((index: number, direction: 'up' | 'down') => {
    if (index < 0 || index >= widgets.length) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;

    setWidgets(prev => {
      const newArr = [...prev];
      const temp = newArr[index];
      newArr[index] = newArr[targetIndex];
      newArr[targetIndex] = temp;
      return newArr;
    });
  }, [widgets.length]);


  // --- Available Integrations List ---
  const availableIntegrations = useMemo(() => {
    if (!groupedMetrics) return [];

    // Simply return all available integration+account combos
    // We don't hide them even if added, allowing users to add MORE widgets from same source
    const available: Array<{
      integration: string;
      accountId: string;
      metricsCount: number;
    }> = [];

    Object.keys(groupedMetrics).forEach((integration) => {
      const accounts = groupedMetrics[integration];
      Object.keys(accounts).forEach((accountId) => {
        available.push({
          integration,
          accountId,
          metricsCount: accounts[accountId].length
        });
      });
    });

    return available;
  }, [groupedMetrics]);


  const saveMutation = useMutation<unknown, ApiError | Error, void>({
    mutationFn: async () => {
      if (!clientId) throw new Error("Client ID missing");

      // Filter out any widgets that don't have valid metrics (defensive check)
      const validWidgets = widgets.filter(widget => {
        const hasMetrics = groupedMetrics[widget.integration]?.[widget.accountId || ''];
        return !!hasMetrics;
      });

      // Warn if widgets were filtered during save
      if (validWidgets.length < widgets.length) {
        const removedCount = widgets.length - validWidgets.length;
        console.warn(`Filtered out ${removedCount} invalid widget(s) during save`);
      }

      // Convert flat array to map for API, injecting 'y' order
      const widgetsMap: Record<string, DashboardWidget> = validWidgets.reduce(
        (acc, widget, index) => {
          const layout = widget.layout
            ? { ...widget.layout, y: index }
            : { x: 0, y: index, w: 12, h: 1 };

          acc[widget.id] = { ...widget, layout };
          return acc;
        },
        {} as Record<string, DashboardWidget>
      );

      const payload = {
        name: dashboardName || "Dashboard",
        widgets: widgetsMap,
      };

      if (activeDashboard) {
        return updateDashboard(clientId, activeDashboard.id, payload);
      }

      return createDashboard(clientId, payload);
    },
    onSuccess: () => {
      toast.success("Dashboard saved");
      queryClient.invalidateQueries({ queryKey: ["dashboards", clientId] });
    },
    onError: () => {
      toast.error("Failed to save dashboard");
    },
  });

  if (!clientId) {
    return <div className="p-10 text-center">Invalid Client ID</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-white">
      {/* Top Header */}
      <div className="w-full h-[4.8em] border-b flex justify-between items-center px-6 bg-white shrink-0 z-30">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mr-2"
          >
            ← Back
          </Button>
          <Input
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0 w-[300px]"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="rounded-[0.4rem]"
            disabled={saveMutation.isPending}
            isLoading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            Save Dashboard
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Add Data Sources */}
        <SidebarAddIntegration
          availableIntegrations={availableIntegrations}
          groupedMetrics={groupedMetrics}
          onAddMetric={handleAddMetric}
        />

        {/* Main Canvas - List */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {widgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <FiPlus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Start building your unified dashboard</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  Add widgets from the sidebar. You can mix and match metrics from any source.
                </p>
              </div>
            ) : (
              widgets.map((widget, idx) => (
                <WidgetEditCard
                  key={widget.id}
                  index={idx}
                  widget={widget}
                  availableMetrics={getMetricsForWidget(widget)}
                  onRemove={() => handleRemoveWidget(widget.id)}
                  onMove={(dir) => handleMoveWidget(idx, dir)}
                  onUpdate={(u) => handleUpdateWidget(u)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditDashboard;
