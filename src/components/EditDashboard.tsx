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

// Helper to create initial default widgets for a newly added integration
const createDefaultWidgetsForIntegration = (
  integration: string,
  accountId: string,
  metrics: Array<{ metricKey: string; displayName: string }>
): DashboardWidget[] => {
  const widgets: DashboardWidget[] = [];
  let widgetId = Date.now();

  if (metrics.length === 0) return [];

  // 1. Main Chart (First metric)
  widgets.push({
    id: `dw${widgetId++}`,
    metricKey: metrics[0].metricKey,
    integration,
    accountId,
    groupBy: "day",
    aggregation: "sum",
    type: "line_chart",
  });

  // 2. Metric Cards (Next 8 distinct metrics)
  // const cardMetrics = metrics.slice(0, 8); 
  // Let's just add the first 5 unique metrics as cards for a good start.
  const uniqueMetrics = Array.from(new Set(metrics.map(m => m.metricKey))).slice(0, 5);

  for (const mKey of uniqueMetrics) {
    widgets.push({
      id: `dw${widgetId++}`,
      metricKey: mKey,
      integration,
      accountId,
      groupBy: "day",
      aggregation: "sum",
      type: "metric_card",
    });
  }

  return widgets;
};

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
    onAdd,
  }: {
    availableIntegrations: Array<{
      integration: string;
      accountId: string;
      metricsCount: number;
    }>;
    onAdd: (integration: string, accountId: string) => void;
  }) => {
    return (
      <div className="w-full sm:w-[15rem] md:w-[16rem] border-r flex flex-col sticky top-[4.8em] h-[calc(100vh-8.3em)] bg-white overflow-hidden z-20">
        <div className="p-4 border-b bg-gray-50/80">
          <h3 className="text-sm font-semibold text-gray-900">Add Data Source</h3>
          <p className="text-xs text-gray-500 mt-1">
            Add widgets from your connected sources.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {availableIntegrations.length === 0 ? (
            <div className="px-4 py-8 text-center bg-gray-50 rounded-lg border border-dashed mx-2 mt-4">
              <p className="text-xs text-gray-500">No sources available.</p>
            </div>
          ) : (
            availableIntegrations.map((item) => (
              <button
                key={`${item.integration}-${item.accountId}`}
                onClick={() => onAdd(item.integration, item.accountId)}
                className="w-full flex items-center justify-between p-3 bg-white border rounded-lg hover:border-primary hover:shadow-sm hover:bg-blue-50/10 transition-all group text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 capitalize truncate">
                    {item.integration.replace(/-/g, " ")}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {item.accountId}
                  </div>
                </div>
                <FiPlus className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))
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

  // Metrics hook
  const { groupedMetrics } = useAvailableMetrics(clientId);

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
        setWidgets(
          entries
            .map(([id, widget]) => ({
              ...(widget as DashboardWidget),
              id,
            }))
            .sort((a, b) => (a.layout?.y ?? 0) - (b.layout?.y ?? 0))
        );
      }
    }
  }, [activeDashboard]);


  // --- Helper: Get available metrics for a widget ---
  const getMetricsForWidget = useCallback((widget: DashboardWidget) => {
    if (!groupedMetrics) return [];
    const accountId = widget.accountId || Object.keys(groupedMetrics[widget.integration] || {})[0];
    return groupedMetrics[widget.integration]?.[accountId] || [];
  }, [groupedMetrics]);


  // --- Actions ---

  const handleAddIntegration = useCallback((integration: string, accountId: string) => {
    const metricsForAccount = groupedMetrics[integration]?.[accountId] || [];
    if (metricsForAccount.length === 0) {
      toast.error("No metrics found for this integration");
      return;
    }

    const newWidgets = createDefaultWidgetsForIntegration(integration, accountId, metricsForAccount);
    setWidgets(prev => [...prev, ...newWidgets]);
    toast.success(`Widgets added for ${integration}`);
  }, [groupedMetrics]);

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

      // Convert flat array to map for API, injecting 'y' order
      const widgetsMap: Record<string, DashboardWidget> = widgets.reduce(
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
          onAdd={handleAddIntegration}
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
