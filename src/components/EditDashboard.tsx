import { FiBell, FiSearch } from "react-icons/fi";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
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

const DataSourcesSidebar = memo(
  ({
    searchQuery,
    onSearchChange,
    filteredCategories,
    expandedCategories,
    onValueChange,
    isMobile = false,
  }: {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    filteredCategories: string[];
    expandedCategories: string[];
    onValueChange: (value: string[]) => void;
    isMobile?: boolean;
  }) => {
    const sidebarContent = (
      <>
        <div className="p-3 sm:p-4 border-b sticky top-0  z-10">
          <Input
            type="text"
            placeholder="Search data sources..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-[0.5rem] focus-visible:ring-2 focus-visible:ring-primary text-sm sm:text-base"
            aria-label="Search data sources"
          />
        </div>
        <div className="flex-1 p-2 overflow-y-auto">
          <div className="text-xs uppercase tracking-wider text-gray-500 px-2 py-2 font-medium">
            DATA SOURCES
          </div>
          {filteredCategories.length === 0 ? (
            <div className="px-2 py-4 text-sm text-gray-500 text-center">
              No data sources found
            </div>
          ) : (
            <Accordion
              type="multiple"
              value={expandedCategories}
              onValueChange={onValueChange}
              className="w-full"
            >
              <div className="space-y-0.5">
                {filteredCategories.map((category) => (
                  <AccordionItem
                    key={category}
                    value={category}
                    className="border-none"
                  >
                    <AccordionTrigger className="px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1">
                      <span className="truncate">{category}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 py-1">
                      <div className="pl-4 py-1 text-xs text-gray-600">
                        <div className="py-1 text-gray-500">No items</div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </div>
            </Accordion>
          )}
        </div>
      </>
    );

    if (isMobile) {
      return sidebarContent;
    }

    return (
      <div className="w-full sm:w-[14rem] md:w-[15.5rem]  border-r flex flex-col sticky top-[calc(4.8em+3.5em)] h-[calc(100vh-8.3em)] overflow-y-auto z-30">
        {sidebarContent}
      </div>
    );
  }
);
DataSourcesSidebar.displayName = "DataSourcesSidebar";

const DATA_SOURCE_CATEGORIES = [
  "SEO",
  "Analytics",
  "Social",
  "Paid Ads",
  "Call Tracking",
  "Email",
  "Local",
  "Ecommerce",
] as const;

const DEFAULT_LAYOUT_WIDTH = 12;
const DEFAULT_WIDGET_WIDTH = 6;
const DEFAULT_WIDGET_HEIGHT = 4;

const createDashboardWidgetsFromMetrics = (
  groupedMetrics: Record<
    string,
    Record<
      string,
      Array<{
        metricKey: string;
        integration: string;
        accountId: string;
        displayName: string;
        category: string;
      }>
    >
  >
): DashboardWidget[] => {
  const widgets: DashboardWidget[] = [];
  let widgetId = 1;

  for (const integration of Object.keys(groupedMetrics)) {
    for (const accountId of Object.keys(groupedMetrics[integration])) {
      const metrics = groupedMetrics[integration][accountId];

      for (const metric of metrics.slice(0, 6 - widgets.length)) {
        const widget: DashboardWidget & { accountId?: string } = {
          id: `dw${widgetId++}`,
          metricKey: metric.metricKey,
          integration: metric.integration,
          groupBy: "none",
          aggregation: "sum",
          type: "metric_card",
        };
        widget.accountId = metric.accountId;
        widgets.push(widget);
      }

      if (widgets.length >= 6) break;
    }
    if (widgets.length >= 6) break;
  }

  return widgets;
};

function EditDashboard() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardName, setDashboardName] = useState("My Dashboard");
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [selectedMetricId, setSelectedMetricId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<"metric_card" | "line_chart" | "chart">("metric_card");

  const queryClient = useQueryClient();

  const { groupedMetrics, isLoading: isLoadingMetrics } = useAvailableMetrics();

  const dashboardsQuery = useQuery<Dashboard[], ApiError>({
    queryKey: ["dashboards"],
    queryFn: async () => {
      const response = await listDashboards();
      return response.dashboards;
    },
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
        return;
      }
    }

    if (!activeDashboard && widgets.length === 0 && Object.keys(groupedMetrics).length > 0) {
      setWidgets(createDashboardWidgetsFromMetrics(groupedMetrics as any));
    }
  }, [activeDashboard, groupedMetrics, widgets.length]);

  const availableMetricOptions = useMemo(() => {
    const items: Array<{
      id: string;
      label: string;
      metricKey: string;
      integration: string;
      accountId: string;
    }> = [];

    Object.entries(groupedMetrics).forEach(([integration, accounts]) => {
      Object.entries(accounts).forEach(([accountId, metrics]) => {
        metrics.forEach((metric) => {
          items.push({
            id: `${integration}:${accountId}:${metric.metricKey}`,
            label: `${metric.displayName} (${integration} – ${accountId})`,
            metricKey: metric.metricKey,
            integration,
            accountId,
          });
        });
      });
    });

    return items;
  }, [groupedMetrics]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return [...DATA_SOURCE_CATEGORIES];
    }
    return DATA_SOURCE_CATEGORIES.filter((category) =>
      category.toLowerCase().includes(normalizedQuery)
    );
  }, [searchQuery]);

  const handleAccordionValueChange = useCallback((value: string[]) => {
    setExpandedCategories(value);
  }, []);

  const handleAddWidget = useCallback(() => {
    if (!selectedMetricId) {
      toast.error("Select a metric to add a widget");
      return;
    }

    const option = availableMetricOptions.find((item) => item.id === selectedMetricId);
    if (!option) {
      toast.error("Selected metric not found");
      return;
    }

    const newId = `dw${Date.now()}`;
    const widget: DashboardWidget & { accountId?: string } = {
      id: newId,
      metricKey: option.metricKey,
      integration: option.integration,
      groupBy: selectedType === "line_chart" ? "day" : "none",
      aggregation: "sum",
      type: selectedType,
    };
    widget.accountId = option.accountId;

    setWidgets((prev) => [...prev, widget]);
  }, [availableMetricOptions, selectedMetricId, selectedType]);

  const handleRemoveWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== id));
  }, []);

  const moveWidget = useCallback((index: number, direction: "up" | "down") => {
    setWidgets((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  }, []);

  const saveMutation = useMutation<unknown, ApiError | Error, void>({
    mutationFn: async () => {
      if (!widgets.length) {
        throw new Error("Add at least one widget before saving");
      }

      const widgetsMap: Record<string, DashboardWidget> = widgets.reduce(
        (acc, widget, index) => {
          const { id, ...rest } = widget;

          const layout =
            (rest as any).layout ?? {
              x:
                (index % (DEFAULT_LAYOUT_WIDTH / DEFAULT_WIDGET_WIDTH)) *
                DEFAULT_WIDGET_WIDTH,
              y:
                Math.floor(
                  index / (DEFAULT_LAYOUT_WIDTH / DEFAULT_WIDGET_WIDTH)
                ) * DEFAULT_WIDGET_HEIGHT,
              w: DEFAULT_WIDGET_WIDTH,
              h: DEFAULT_WIDGET_HEIGHT,
            };

          acc[id] = {
            ...(rest as DashboardWidget),
            layout,
          };
          return acc;
        },
        {} as Record<string, DashboardWidget>
      );

      const payload = {
        name: dashboardName || "Dashboard",
        widgets: widgetsMap,
      };

      if (activeDashboard) {
        return updateDashboard(activeDashboard.id, payload);
      }

      return createDashboard(payload);
    },
    onSuccess: () => {
      toast.success("Dashboard saved");
      queryClient.invalidateQueries({ queryKey: ["dashboards"] });
    },
    onError: (error) => {
      const apiError = error as ApiError | Error;
      const message =
        (apiError as ApiError).message ||
        (apiError as Error).message ||
        "Failed to save dashboard";
      toast.error(message);
    },
  });

  const isSaving = saveMutation.isPending;

  return (
    <div className="w-full  h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 ">
      <div className="w-full  rounded-l-2xl overflow-hidden h-full   my-4 bg-[#fdfdfd] ">
        <div className="w-full h-full relative flex flex-col">
          <div className="w-full h-[4.8em]  border-b flex justify-between items-center px-5 ">
            <span className="font-medium text-xl">Edit Dashboard</span>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-2 text-sm text-gray-500">
                <span className="mx-2 text-lg text-gray-500">
                  <FiSearch />
                </span>
                <span className="mx-2 text-lg text-gray-500 ">
                  <FiBell />
                </span>
              </span>
              <span className="ml-2">
                <Button
                  className="rounded-[0.4rem]"
                  disabled={isSaving || widgets.length === 0}
                  onClick={() => saveMutation.mutate()}
                >
                  {isSaving ? "Saving..." : "Save Dashboard"}
                </Button>
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row h-full">
            <DataSourcesSidebar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              filteredCategories={filteredCategories}
              expandedCategories={expandedCategories}
              onValueChange={handleAccordionValueChange}
              isMobile={false}
            />

            <div className="flex-1 p-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div className="flex-1 max-w-md space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Dashboard name
                  </label>
                  <Input
                    value={dashboardName}
                    onChange={(e) => setDashboardName(e.target.value)}
                    placeholder="Enter dashboard name"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {dashboardsQuery.isLoading
                    ? "Loading dashboard..."
                    : activeDashboard
                    ? "Editing saved dashboard layout"
                    : "New dashboard – will be created on save"}
                </div>
              </div>

              <div className="border rounded-xl p-3 sm:p-4 bg-white space-y-3">
  <div className="flex items-center justify-between gap-2">
    <div className="space-y-1">
      <p className="text-sm font-medium">Widgets</p>
      <p className="text-xs text-gray-500">
        Add, remove, and reorder widgets. Layout is saved when you click Save.
      </p>
    </div>
    <span className="text-xs text-gray-400">
      {widgets.length} widget{widgets.length === 1 ? "" : "s"}
    </span>
  </div>

  <div className="space-y-2">
    {widgets.length === 0 ? (
      <div className="text-xs text-gray-500 border border-dashed rounded-lg p-4 text-center">
        No widgets yet. Use the form below to add your first metric widget.
      </div>
    ) : (
      widgets.map((widget, index) => (
        <div
          key={widget.id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border rounded-lg px-3 py-2 bg-gray-50"
        >
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{widget.metricKey}</p>
            <p className="text-xs text-gray-500">
              {widget.integration} •{" "}
              {(widget as any).accountId ?? "Account"}
            </p>
            <p className="text-xs text-gray-400">
              Type: {widget.type ?? "metric_card"} • Position: {index + 1}
            </p>
          </div>
          <div className="flex items-center gap-1 self-stretch sm:self-auto">
            <Button
              variant="outline"
              size="icon-sm"
              className="text-xs"
              type="button"
              disabled={index === 0}
              onClick={() => moveWidget(index, "up")}
            >
              ↑
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="text-xs"
              type="button"
              disabled={index === widgets.length - 1}
              onClick={() => moveWidget(index, "down")}
            >
              ↓
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="ml-1 text-xs"
              type="button"
              onClick={() => handleRemoveWidget(widget.id)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))
    )}
  </div>
</div>

              <div className="border rounded-xl p-3 sm:p-4 bg-white space-y-3">
                <p className="text-sm font-medium">Add widget</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium text-gray-700">
                      Metric
                    </label>
                    <Select
                      value={selectedMetricId}
                      onValueChange={setSelectedMetricId}
                      disabled={isLoadingMetrics || availableMetricOptions.length === 0}
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue
                          placeholder={
                            isLoadingMetrics
                              ? "Loading metrics..."
                              : availableMetricOptions.length === 0
                              ? "No metrics available"
                              : "Select a metric"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMetricOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Widget type
                    </label>
                    <Select
                      value={selectedType}
                      onValueChange={(value) =>
                        setSelectedType(value as "metric_card" | "line_chart" | "chart")
                      }
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metric_card">Metric card</SelectItem>
                        <SelectItem value="line_chart">Line chart</SelectItem>
                        <SelectItem value="chart">Pie / bar chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end md:justify-start">
                    <Button
                      type="button"
                      size="sm"
                      className="mt-1"
                      onClick={handleAddWidget}
                    >
                      Add widget
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditDashboard;
