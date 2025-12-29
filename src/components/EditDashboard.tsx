import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown } from "react-icons/fi";
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
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useParams } from "react-router-dom";

// Helper to create initial default widgets for a newly added integration
const createDefaultWidgetsForIntegration = (
  integration: string,
  accountId: string,
  metrics: Array<{ metricKey: string }>
): DashboardWidget[] => {
  const widgets: DashboardWidget[] = [];
  let widgetId = Date.now();

  if (metrics.length === 0) return [];

  // 1. Main Chart (First metric)
  widgets.push({
    id: `dw${widgetId++}`,
    metricKey: metrics[0].metricKey,
    integration,
    accountId, // Important: keep accountId context
    groupBy: "day",
    aggregation: "sum",
    type: "line_chart",
  });

  // 2. Metric Cards (Next 8 distinct metrics)
  // Ensure we don't duplicate the main chart metric if possible?
  // Current Dashboard logic roughly takes the first 8. Let's do unique ones.
  const cardMetrics = metrics.slice(0, 8);
  for (const m of cardMetrics) {
    widgets.push({
      id: `dw${widgetId++}`,
      metricKey: m.metricKey,
      integration,
      accountId,
      groupBy: "day",
      aggregation: "sum",
      type: "metric_card",
    });
  }

  return widgets;
};

// UI Component for an Active Integration Section
const IntegrationEditorCard = memo(
  ({
    integration,
    accountId, // Distinct integrations might share a platform name but have different accounts
    sectionWidgets,
    allAvailableMetrics,
    onMoveUp,
    onMoveDown,
    onRemove,
    onUpdateWidgets,
    isFirst,
    isLast,
  }: {
    integration: string;
    accountId: string;
    sectionWidgets: DashboardWidget[];
    allAvailableMetrics: Array<{ metricKey: string; displayName: string }>;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
    onUpdateWidgets: (newWidgets: DashboardWidget[]) => void;
    isFirst: boolean;
    isLast: boolean;
  }) => {
    // Identify Main Chart Widget
    const mainChartWidget = sectionWidgets.find((w) => ['line_chart', 'area_chart', 'bar_chart'].includes(w.type || ''));
    // Identify Active Card Widgets
    const cardWidgets = sectionWidgets.filter((w) => w.type === "metric_card");
    const activeMetricKeys = new Set(cardWidgets.map((w) => w.metricKey));

    const handleMainMetricChange = (metricKey: string) => {
      // If we already have a main chart, update it. If not (shouldn't happen), create it.
      if (mainChartWidget) {
        const updated = sectionWidgets.map((w) =>
          w.id === mainChartWidget.id ? { ...w, metricKey } : w
        );
        onUpdateWidgets(updated);
      } else {
        // Create new main chart
        const newWidget: DashboardWidget = {
          id: `dw${Date.now()}`,
          metricKey,
          integration,
          accountId,
          groupBy: "day",
          aggregation: "sum",
          type: "line_chart",
        };
        onUpdateWidgets([newWidget, ...sectionWidgets]);
      }
    };

    const toggleCardMetric = (metricKey: string, checked: boolean) => {
      if (checked) {
        // Add
        if (cardWidgets.length >= 8) {
          toast.error("Maximum 8 metric cards per section");
          return;
        }
        const newWidget: DashboardWidget = {
          id: `dw${Date.now()}-${metricKey}`, // Unique ID
          metricKey,
          integration,
          accountId,
          groupBy: "day",
          aggregation: "sum",
          type: "metric_card",
        };
        onUpdateWidgets([...sectionWidgets, newWidget]);
      } else {
        // Remove
        const updated = sectionWidgets.filter(
          (w) => !(w.type === "metric_card" && w.metricKey === metricKey)
        );
        onUpdateWidgets(updated);
      }
    };

    return (
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-800 capitalize">
              {integration.replace(/-/g, " ")}
            </h3>
            {accountId && (
              <Badge variant="outline" className="text-xs font-normal bg-white text-gray-500">
                {accountId}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              className="h-8 w-8 text-gray-500"
              onClick={onMoveUp}
              disabled={isFirst}
              title="Move Section Up"
            >
              <FiArrowUp />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="h-8 w-8 text-gray-500"
              onClick={onMoveDown}
              disabled={isLast}
              title="Move Section Down"
            >
              <FiArrowDown />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={onRemove}
              title="Remove Integration Section"
            >
              <FiTrash2 />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Main Chart Selection */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Main Chart Metric
              </Label>
              <Select
                value={mainChartWidget?.metricKey}
                onValueChange={handleMainMetricChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Metric" />
                </SelectTrigger>
                <SelectContent>
                  {allAvailableMetrics.map((m) => (
                    <SelectItem key={m.metricKey} value={m.metricKey}>
                      {m.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-[180px] space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Chart Type
              </Label>
              <Select
                value={mainChartWidget?.type || "line_chart"}
                onValueChange={(type) => {
                  if (!mainChartWidget) return;
                  const updated = sectionWidgets.map((w) =>
                    w.id === mainChartWidget.id ? { ...w, type } : w
                  );
                  onUpdateWidgets(updated);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line_chart">Line Chart</SelectItem>
                  <SelectItem value="area_chart">Area Chart</SelectItem>
                  <SelectItem value="bar_chart">Bar Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sparkline Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Sparkline Cards ({cardWidgets.length}/8)
              </Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-gray-50/50 p-4 rounded-lg border">
              {allAvailableMetrics.map((m) => {
                const isSelected = activeMetricKeys.has(m.metricKey);
                // Unique key for loop
                const key = `${integration}-${accountId}-${m.metricKey}`;
                return (
                  <div
                    key={key}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`chk-${key}`}
                      checked={isSelected}
                      onCheckedChange={(c) =>
                        toggleCardMetric(m.metricKey, c === true)
                      }
                    />
                    <label
                      htmlFor={`chk-${key}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {m.displayName}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
IntegrationEditorCard.displayName = "IntegrationEditorCard";

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
          <h3 className="text-sm font-semibold text-gray-900">Add Data Sources</h3>
          <p className="text-xs text-gray-500 mt-1">
            Connect connected sources to your dashboard.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {availableIntegrations.length === 0 ? (
            <div className="px-4 py-8 text-center bg-gray-50 rounded-lg border border-dashed mx-2 mt-4">
              <p className="text-xs text-gray-500">All available sources are added!</p>
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
                    {item.accountId} • {item.metricsCount} Metrics
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
          entries.map(([id, widget]) => ({
            ...(widget as DashboardWidget),
            id,
          }))
        );
      }
    }
  }, [activeDashboard]); // Only run on first load of dashboard data


  // --- Derived State: Distinct Sections ---
  // To handle reordering, we need to know the order of "Sections".
  // A section is defined by (integration + accountId).
  // We infer the order from the `widgets` array.
  const sections = useMemo(() => {
    const sectionMap = new Map<string, DashboardWidget[]>();
    const sectionOrder: string[] = [];

    widgets.forEach((w) => {
      // Fallback for missing accountId (e.g. legacy widgets)
      const acc = (w as any).accountId || 'default';
      const key = `${w.integration}|${acc}`;

      if (!sectionMap.has(key)) {
        sectionMap.set(key, []);
        sectionOrder.push(key);
      }
      sectionMap.get(key)!.push(w);
    });

    return sectionOrder.map((key) => {
      const parts = key.split('|');
      // Handle case where split might have more parts if | in name? Unlikely.
      const integration = parts[0];
      const accountId = parts.slice(1).join('|');

      // Handle 'default' accountId restoration if needed, though most should have it
      const finalAccountId = accountId === 'default' ? '' : accountId;

      return {
        key,
        integration,
        accountId: finalAccountId,
        widgets: sectionMap.get(key) || []
      };
    });
  }, [widgets]);

  // --- Derived State: Available Integrations (for Sidebar) ---
  const availableIntegrations = useMemo(() => {
    if (!groupedMetrics) {
      console.log('🔍 [EditDashboard] groupedMetrics is empty/null');
      return [];
    }

    const available: Array<{
      integration: string;
      accountId: string;
      metricsCount: number;
    }> = [];

    console.log('🔍 [EditDashboard] Calculating availableIntegrations:', {
      groupedMetricsKeys: Object.keys(groupedMetrics),
      sectionsCount: sections.length,
      sectionsKeys: sections.map(s => s.key)
    });

    Object.keys(groupedMetrics).forEach((integration) => {
      const accounts = groupedMetrics[integration];
      Object.keys(accounts).forEach((accountId) => {
        const key = `${integration}|${accountId || 'default'}`;
        const isInSections = sections.find(s => s.key === key);
        
        console.log('🔍 [EditDashboard] Checking integration:', {
          integration,
          accountId,
          key,
          isInSections: !!isInSections,
          metricsCount: accounts[accountId].length
        });

        // If NOT already in sections, it's available
        if (!isInSections) {
          available.push({
            integration,
            accountId,
            metricsCount: accounts[accountId].length
          });
        }
      });
    });

    console.log('🔍 [EditDashboard] Final availableIntegrations:', available);
    return available;
  }, [groupedMetrics, sections]);

  // --- Actions ---

  const handleAddIntegration = useCallback((integration: string, accountId: string) => {
    // Determine metrics
    const metricsForAccount = groupedMetrics[integration]?.[accountId] || [];
    if (metricsForAccount.length === 0) {
      toast.error("No metrics found for this integration");
      return;
    }

    const newWidgets = createDefaultWidgetsForIntegration(integration, accountId, metricsForAccount);
    setWidgets(prev => [...prev, ...newWidgets]);
    toast.success(`${integration} added to dashboard`);
  }, [groupedMetrics]);

  const handleRemoveSection = useCallback((key: string) => {
    // Remove all widgets belonging to this section key
    setWidgets(prev => {
      return prev.filter(w => {
        const acc = (w as any).accountId || 'default';
        const wKey = `${w.integration}|${acc}`;
        return wKey !== key;
      });
    });
  }, []);

  const handleMoveSection = useCallback((index: number, direction: 'up' | 'down') => {
    // We rely on 'sections' state which is derived from 'widgets'.
    // BUT 'widgets' is the source of truth.
    // We need to reorder 'widgets' such that the widgets for specific SECTION move.

    // Logic:
    // 1. Get all sections (ordered)
    // 2. Swap sections in the list
    // 3. Flatten back to widget list

    // We need access to current 'sections' inside the callback.
    // Since 'sections' is a dependency, this callback updates when 'sections' update.
    if (index < 0 || index >= sections.length) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const newWidgets = newSections.flatMap(s => s.widgets);
    setWidgets(newWidgets);
  }, [sections]);

  const handleUpdateSectionWidgets = useCallback((key: string, updatedSectionWidgets: DashboardWidget[]) => {
    // Update widgets for this section, preserving order of OTHER sections
    setWidgets(() => {
      // Re-derive sections from 'prev' to be safe? 
      // Actually, we must rely on 'sections' memo stability or re-derive inside.
      // Since 'sections' depends on 'widgets' (prev), and we are in setWidgets...
      // We can't access 'sections' derived from 'prev' easily inside the updater unless we capture 'sections' from closure.
      // BUT 'sections' in closure matches 'prev' if no other updates happened.

      // Safer way: Iterate sections from closure.
      return sections.flatMap(s => {
        if (s.key === key) {
          return updatedSectionWidgets;
        }
        return s.widgets;
      });
    });
  }, [sections]);


  const saveMutation = useMutation<unknown, ApiError | Error, void>({
    mutationFn: async () => {
      if (!clientId) throw new Error("Client ID missing");
      // if (!widgets.length) {
      //   throw new Error("Add at least one widget before saving");
      // }

      // Convert flat array to map for API
      const widgetsMap: Record<string, DashboardWidget> = widgets.reduce(
        (acc, widget) => {
          acc[widget.id] = widget;
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
          {clientId && (
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mr-2"
            >
              ← Back
            </Button>
          )}
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
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? "Saving..." : "Save Dashboard"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Add Data Sources */}
        <SidebarAddIntegration
          availableIntegrations={availableIntegrations}
          onAdd={handleAddIntegration}
        />

        {/* Main Canvas - Sections List */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <FiPlus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Start building your dashboard</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  Select data sources from the sidebar to add them to your dashboard.
                </p>
              </div>
            ) : (
              sections.map((section, idx) => (
                <IntegrationEditorCard
                  key={section.key}
                  integration={section.integration}
                  accountId={section.accountId}
                  sectionWidgets={section.widgets}
                  allAvailableMetrics={
                    groupedMetrics[section.integration]?.[section.accountId || ''] ||
                    // Fallback: try to find metrics regardless of account if missing?
                    // Actually groupedMetrics key structure is rigid.
                    []
                  }
                  onMoveUp={() => handleMoveSection(idx, 'up')}
                  onMoveDown={() => handleMoveSection(idx, 'down')}
                  onRemove={() => handleRemoveSection(section.key)}
                  onUpdateWidgets={(updated) => handleUpdateSectionWidgets(section.key, updated)}
                  isFirst={idx === 0}
                  isLast={idx === sections.length - 1}
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
