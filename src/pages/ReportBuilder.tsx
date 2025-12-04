import { FiBell, FiSearch } from "react-icons/fi";
import { Button } from "../components/ui/button";
import { RadioButtonGroup } from "../components/RadioButtonGroup";
import WidgetsPageSideComponent from "../components/WidgetsPageSideComponent";
import ReportElements from "../components/ReportElements";
import TitleWidgetForm from "../components/TitleWidgetForm";
import MetricWidgetForm from "../components/MetricWidgetForm";
import CustomWidgetForm from "../components/CustomWidgetForm";
import TasksWidgetForm from "../components/TasksWidgetForm";
import ChartWidgetForm from "../components/ChartWidgetForm";
import TableWidgetForm from "../components/TableWidgetForm";
import ImageWidgetForm from "../components/ImageWidgetForm";
import EmbedWidgetForm from "../components/EmbedWidgetForm";
import { DateRangePicker } from "../components/DateRangePicker";
import { type DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Layout lib
import GridLayout, { type Layout, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// UI Components
import { ChartPieInteractive } from "../components/ChartPieInteractive";
import { ChartLineMultiple } from "../components/ChartLineMultiple";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
// App constants
import {
  reportTableRows,
  WIDGET_SIZE_MAP,
  generateWidgetId,
} from "../components/reportConstants";
import { getReportStatusBadgeClass } from "../utils/statusColors";
import { type ReportWidgetType } from "../components/reportTypes";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";

import SlideContainer from "../components/SlideContainer";
import WidgetCard from "../components/WidgetCard";
import WidgetDragItem from "../components/WidgetDragItem";

// Widget Data Types - imported from widgetTypes.ts to avoid circular dependencies
import type {
  TitleWidgetData,
  TableWidgetData,
  ChartWidgetData,
  MapWidgetData,
  MetricWidgetData,
  ImageWidgetData,
  EmbedWidgetData,
  CustomWidgetData,
  WidgetData,
} from "../components/widgetTypes";
import {
  createReportTemplate,
  getReportTemplate,
  resolveMetricWidgets,
  runReport,
  updateReportTemplate,
  createReportSchedule,
  updateReportSchedule,
  deleteReportSchedule,
} from "@/features/reports/api/reportingApi";
import type {
  ApiError,
  CreateTemplatePayload,
  ReportWidgetDefinition,
  ResolvedWidgetData,
  WidgetSeriesPoint,
  ReportSlideMeta,
  ReportSchedule,
  ReportScheduleFrequency,
  CreateReportSchedulePayload,
  UpdateReportSchedulePayload,
} from "@/features/reports/api/types";
import { useIntegrations } from "@/features/DataSources/hooks/useIntegrations";
import { getPlatformConfig } from "@/utils/platformMapping";
import { useAvailableMetrics } from "@/features/reports/hooks/useAvailableMetrics";
import { exportAllSlidesToPDF } from "../components/functions/reportfunctions";

// Re-export for external use
export type {
  TitleWidgetData,
  TableWidgetData,
  ChartWidgetData,
  MapWidgetData,
  MetricWidgetData,
  ImageWidgetData,
  EmbedWidgetData,
  CustomWidgetData,
  WidgetData,
} from "../components/widgetTypes";

// Types
export interface DashboardLayout extends Layout {
  widgetType: ReportWidgetType;
  data?: WidgetData;
  metricConfig?: ReportWidgetDefinition;
}

export type DashboardMap = Map<number, DashboardLayout[]>;

// Grid constants
const GRID_CONFIG = {
  cols: 10,
  rowHeight: 100,
  width: 1200,
  margin: [20, 20] as [number, number],
} as const;

// Tablet grid config
const TABLET_GRID_CONFIG = {
  cols: 8,
  rowHeight: 80,
  margin: [12, 12] as [number, number],
} as const;

const DEFAULT_WIDGET_SIZE = {
  w: 4,
  h: 3,
} as const;

// Auto width provider for react-grid-layout
const AutoWidthGrid = WidthProvider(GridLayout);

// Default widget data generators
const getDefaultWidgetData = (
  widgetType: ReportWidgetType
): WidgetData | undefined => {
  switch (widgetType) {
    case "title":
      return { text: "performance title", fontSize: "2xl", align: "center" };
    case "table":
      return {
        title: "Scheduled Reports",
        caption: "Queue of report deliveries.",
        rows: reportTableRows,
        columns: [
          { name: "Report", width: "35%" },
          { name: "Audience" },
          { name: "Status" },
          { name: "Last Run" },
          { name: "Next Send" },
        ],
      };
    case "chart":
      return { chartType: "pie" };
    case "map":
      return { location: "Default Location", zoom: 10 };
    case "metric":
      return { label: "Metric", value: 0 };
    case "image":
      return { src: "", alt: "Image" };
    case "embed":
      return { url: "", type: "iframe" };
    case "custom":
      return { content: "Custom Widget", type: "text" };
    default:
      return undefined;
  }
};

// Empty default template - users start with a blank canvas
const DEFAULT_TEMPLATE_WIDGETS: ReportWidgetDefinition[] = [];

const ensureSlide = (map: DashboardMap, slideId: number) => {
  if (!map.has(slideId)) {
    map.set(slideId, []);
  }
};

// Removed createPlaceholderWidget - new reports start with empty slides

const normalizeWidgetType = (type?: string): ReportWidgetType => {
  if (!type) return "metric";
  if (type.includes("chart")) return "chart";
  if (type.includes("metric") || type.includes("stat")) return "metric";
  if (type.includes("table")) return "table";
  return (type as ReportWidgetType) ?? "metric";
};

const buildDashboardMapFromTemplate = (
  widgets: ReportWidgetDefinition[]
): DashboardMap => {
  if (!widgets.length) {
    return new Map([[0, []]]);
  }

  const map: DashboardMap = new Map();

  widgets.forEach((widget, index) => {
    const layoutInfo = widget.layout;
    const slideId = layoutInfo?.slideId ?? 0;
    ensureSlide(map, slideId);

    const widgetType = normalizeWidgetType(widget.type);
    const widgetData = (widget as any).widgetData as WidgetData | undefined;
    const layoutItem: DashboardLayout = {
      i: widget.id ?? generateWidgetId("widget"),
      x: layoutInfo?.x ?? 0,
      y: layoutInfo?.y ?? index * DEFAULT_WIDGET_SIZE.h,
      w: layoutInfo?.w ?? DEFAULT_WIDGET_SIZE.w,
      h: layoutInfo?.h ?? DEFAULT_WIDGET_SIZE.h,
      widgetType,
      data: widgetData ?? getDefaultWidgetData(widgetType),
      metricConfig: widget,
    };

    map.set(slideId, [...(map.get(slideId) ?? []), layoutItem]);
  });

  // Always ensure at least one slide exists, even if empty
  if (!map.size) {
    return new Map([[0, []]]);
  }

  return map;
};

// Removed DEFAULT_DASHBOARD_MAP and cloneDashboardMap as we now create slides dynamically based on integrations

const getInitialDateRange = (): DateRange => ({
  from: subDays(new Date(), 6),
  to: new Date(),
});

const formatApiDate = (value: Date) => format(value, "yyyy-MM-dd");

// Table Data moved to reportConstants.ts

const widgetItems: {
  title: string;
  description: string;
  type: ReportWidgetType;
  customKind?: string;
}[] = [
  { title: "Stat", description: "type in any stat you choose", type: "metric" },
  { title: "Textbox", description: "textbox you can design", type: "title" },
  { title: "Title", description: "Organize using title", type: "title" },
  {
    title: "Table of Contents",
    description: "Table of contents for your report",
    type: "custom",
    customKind: "toc",
  },
  {
    title: "AI Summary",
    description: "A snapshot of your section data that you can auto-generate",
    type: "custom",
    customKind: "ai-summary",
  },
  {
    title: "Tasks",
    description: "Highlight completed tasks",
    type: "custom",
    customKind: "tasks",
  },
];

const imageWidgetItems: {
  title: string;
  description: string;
  type: ReportWidgetType;
}[] = [
  { title: "Image", description: "Add any image you like", type: "image" },
];

const embedWidgetItems: {
  title: string;
  description: string;
  type: ReportWidgetType;
}[] = [
  {
    title: "Embed",
    description: "Embed YouTube, Google Sheets etc",
    type: "embed",
  },
];

// Table helpers
const getStatusBadgeClass = (
  status: (typeof reportTableRows)[number]["status"]
) => {
  return getReportStatusBadgeClass(status);
};

const renderWidgetEmptyState = (
  onConnectIntegration?: () => void,
  message = "No data yet"
) => {
  return (
    <div className="flex flex-col items-center justify-center w-full text-center text-xs md:text-sm text-gray-500 gap-2 py-4">
      <span>{message}</span>
      {onConnectIntegration && (
        <Button
          variant="outline"
          size="sm"
          onClick={onConnectIntegration}
          className="text-xs md:text-sm"
        >
          Connect Integration
        </Button>
      )}
    </div>
  );
};

// Helper: Render widget content with dynamic data
const renderWidgetContent = (
  widget: DashboardLayout,
  resolvedData?: ResolvedWidgetData,
  options?: {
    isLoading?: boolean;
    onConnectIntegration?: () => void;
  }
) => {
  if (options?.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="w-5 h-5 border-b-2 border-gray-400 rounded-full animate-spin" />
      </div>
    );
  }

  const onConnectIntegration = options?.onConnectIntegration;

  const widgetData = widget.data;
  const metricConfig = widget.metricConfig;
  const isIntegrationMetric =
    widget.widgetType === "metric" &&
    !!metricConfig?.metricKey &&
    !!metricConfig?.integration;

  switch (widget.widgetType) {
    case "chart":
    case "pie_chart": {
      const series = Array.isArray((resolvedData as ResolvedWidgetData)?.series)
        ? ((resolvedData as ResolvedWidgetData).series as WidgetSeriesPoint[])
        : [];
      const hasData =
        series.length > 0 ||
        typeof (resolvedData as ResolvedWidgetData)?.total === "number";
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1">
            <ChartPieInteractive />
          </div>
          <div className="border-t px-3 py-2 text-xs md:text-sm space-y-1 min-h-[3.5rem]">
            {hasData
              ? series.slice(0, 4).map((point) => (
                  <div
                    className="flex justify-between"
                    key={`${point.x}-${point.y}`}
                  >
                    <span className="text-gray-500">{point.x}</span>
                    <span className="font-medium text-gray-900">{point.y}</span>
                  </div>
                ))
              : renderWidgetEmptyState(onConnectIntegration)}
          </div>
        </div>
      );
    }

    case "line_chart":
    case "area_chart":
    case "bar_chart": {
      const series = Array.isArray((resolvedData as ResolvedWidgetData)?.series)
        ? ((resolvedData as ResolvedWidgetData).series as WidgetSeriesPoint[])
        : [];
      const hasData =
        series.length > 0 ||
        typeof (resolvedData as ResolvedWidgetData)?.total === "number";

      const chartTitle =
        widget.metricConfig?.metricKey?.split(".").pop()?.replace(/_/g, " ") ||
        "Metric";

      return (
        <div className="h-full flex flex-col p-2 md:p-4">
          <div className="text-xs md:text-sm font-medium text-gray-700 mb-2 capitalize">
            {chartTitle}
          </div>
          <div className="flex-1">
            <ChartLineMultiple />
          </div>
          {!hasData && (
            <div className="border-t px-3 py-2 mt-2">
              {renderWidgetEmptyState(onConnectIntegration)}
            </div>
          )}
        </div>
      );
    }

    case "map": {
      const mapData = widgetData as MapWidgetData | undefined;
      return (
        <div className="h-full flex items-center justify-center text-xs md:text-sm text-gray-500 px-2">
          <span className="text-center">
            {mapData?.location ? `Map: ${mapData.location}` : "Map Placeholder"}
          </span>
        </div>
      );
    }

    case "table": {
      const tableData = widgetData as TableWidgetData | undefined;
      const rows = tableData?.rows ?? reportTableRows;
      const title = tableData?.title ?? "Scheduled Reports";
      const caption = tableData?.caption ?? "Queue of report deliveries.";
      const columns = tableData?.columns ?? [
        { name: "Report", width: "35%" },
        { name: "Audience" },
        { name: "Status" },
        { name: "Last Run" },
        { name: "Next Send" },
      ];
      const rawCount =
        typeof resolvedData?.rawCount === "number" ? resolvedData.rawCount : 0;
      const rowCount = Array.isArray(rows) ? rows.length : 0;
      const hasTableData = rawCount > 0 || rowCount > 0;

      return (
        <Card className="h-full  flex flex-col rounded-lg md:rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 md:pb-4 px-3 md:px-6 pt-3 md:pt-6">
            <CardTitle className="text-sm md:text-base">{title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-visible">
            <div className="w-full h-full overflow-x-auto">
              <Table className="w-full table-fixed text-xs md:text-sm">
                <TableCaption className="text-[10px] md:text-xs">
                  {caption}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead
                        key={col.name}
                        className="truncate px-2 md:px-4"
                        style={col.width ? { width: col.width } : undefined}
                      >
                        {col.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={row.name || index}>
                      {columns.map((col, colIndex) => {
                        // For dynamic columns, we need to map column names to row properties
                        const cellValue =
                          col.name === "Report"
                            ? row.name
                            : col.name === "Audience"
                            ? row.audience
                            : col.name === "Status"
                            ? row.status
                            : col.name === "Last Run"
                            ? row.lastRun
                            : col.name === "Next Send"
                            ? row.nextSend
                            : (row as Record<string, unknown>)[
                                col.name.toLowerCase().replace(/\s+/g, "")
                              ] ?? "";

                        if (col.name === "Status") {
                          return (
                            <TableCell
                              key={colIndex}
                              className="truncate px-2 md:px-4"
                            >
                              <span
                                className={`inline-flex items-center rounded-full border px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium ${getStatusBadgeClass(
                                  row.status
                                )}`}
                              >
                                {String(cellValue)}
                              </span>
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell
                            key={colIndex}
                            className={`px-2 md:px-4 ${
                              colIndex === 0
                                ? "font-medium truncate"
                                : "truncate"
                            }`}
                          >
                            {String(cellValue)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          {!hasTableData && (
            <div className="border-t px-3 py-2">
              {renderWidgetEmptyState(
                onConnectIntegration,
                "No table data yet"
              )}
            </div>
          )}
        </Card>
      );
    }

    case "title": {
      const titleData = widgetData as TitleWidgetData | undefined;
      const text = titleData?.text ?? "Demo title";
      const fontSize = titleData?.fontSize ?? "2xl";
      const align = titleData?.align ?? "center";

      // Map fontSize to Tailwind classes
      const fontSizeClass =
        fontSize === "xs"
          ? "text-xs"
          : fontSize === "sm"
          ? "text-sm"
          : fontSize === "base"
          ? "text-base"
          : fontSize === "lg"
          ? "text-lg"
          : fontSize === "xl"
          ? "text-xl"
          : fontSize === "2xl"
          ? "text-2xl"
          : fontSize === "3xl"
          ? "text-3xl"
          : fontSize === "4xl"
          ? "text-4xl"
          : "text-2xl";

      const alignClass =
        align === "left"
          ? "justify-start"
          : align === "right"
          ? "justify-end"
          : "justify-center";

      return (
        <div
          className={`h-full w-full flex items-center ${alignClass} hover:border  text-xs md:text-sm text-gray-900 px-2`}
          style={
            titleData?.backgroundColor
              ? { backgroundColor: titleData.backgroundColor }
              : undefined
          }
        >
          <span
            className={`${fontSizeClass} place-self-center font-semibold break-words text-center`}
            style={titleData?.color ? { color: titleData.color } : undefined}
          >
            {text}
          </span>
        </div>
      );
    }

    case "metric": {
      const metricData = widgetData as MetricWidgetData | undefined;

      // For integration-based metrics, prefer resolved values from the API.
      // For Content Blocks "Stat" widgets (manual), we ignore resolvedData and
      // never show the "Connect Integration" empty state.
      const resolvedValue =
        isIntegrationMetric && typeof resolvedData?.value === "number"
          ? resolvedData.value
          : isIntegrationMetric && typeof resolvedData?.total === "number"
          ? resolvedData.total
          : undefined;

      const dataRawCount =
        isIntegrationMetric && typeof resolvedData?.rawCount === "number"
          ? resolvedData.rawCount
          : 0;
      const hasData = isIntegrationMetric
        ? resolvedValue !== undefined || dataRawCount > 0
        : true;

      return (
        <div className="h-full flex flex-col items-center justify-center text-xs md:text-sm px-2 text-center">
          <span className="text-2xl md:text-3xl font-bold text-gray-900">
            {resolvedValue ?? metricData?.value ?? 0}
            {metricData?.unit && (
              <span className="text-base md:text-lg text-gray-600 ml-1">
                {metricData.unit}
              </span>
            )}
          </span>
          {metricData?.label && (
            <span className="text-gray-600 mt-1 md:mt-2 text-xs md:text-sm">
              {metricData.label}
            </span>
          )}
          <span className="text-[10px] md:text-xs text-gray-500 mt-1">
            {isIntegrationMetric && typeof resolvedData?.rawCount === "number"
              ? resolvedData.rawCount
              : 0}{" "}
            {isIntegrationMetric ? "data points" : ""}
          </span>
          {isIntegrationMetric && !hasData && (
            <div className="w-full mt-3">
              {renderWidgetEmptyState(onConnectIntegration)}
            </div>
          )}
        </div>
      );
    }

    case "image": {
      const imageData = widgetData as ImageWidgetData | undefined;
      const imageFit = imageData?.imageFit || "contain";
      return (
        <div
          className="h-full flex items-center justify-center text-xs md:text-sm text-gray-500 p-1 md:p-2"
          style={
            imageData?.backgroundColor
              ? { backgroundColor: imageData.backgroundColor }
              : undefined
          }
        >
          {imageData?.src ? (
            <img
              src={imageData.src}
              alt={imageData.alt ?? "Image"}
              className="max-w-full max-h-full rounded"
              style={{ objectFit: imageFit }}
            />
          ) : (
            <span className="text-center">Image Placeholder</span>
          )}
        </div>
      );
    }

    case "embed": {
      const embedData = widgetData as EmbedWidgetData | undefined;
      const title = embedData?.title || "Embedded content";
      const url = embedData?.url || "";

      return (
        <div
          className="h-full flex items-center justify-center text-xs md:text-sm text-gray-500 p-1 md:p-2 embed-widget"
          data-embed-title={title}
          data-embed-url={url}
          style={
            embedData?.backgroundColor
              ? { backgroundColor: embedData.backgroundColor }
              : undefined
          }
        >
          {url ? (
            <iframe
              src={url}
              className="w-full h-full border-0 rounded"
              title={title}
            />
          ) : (
            <span className="text-center">Embed Placeholder</span>
          )}
        </div>
      );
    }

    case "custom": {
      const customData = widgetData as CustomWidgetData | undefined;
      // Tasks-style custom block
      if (customData?.type === "tasks") {
        const tasks =
          (customData.content ?? "")
            .split("\n")
            .map((t) => t.trim())
            .filter(Boolean) || [];

        return (
          <div className="h-full flex flex-col items-stretch justify-start text-xs md:text-sm text-gray-800 px-3 py-2">
            {tasks.length === 0 ? (
              <span className="text-[11px] text-gray-400">
                No tasks yet. Use the editor to add tasks.
              </span>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {tasks.map((task, idx) => (
                  <li key={idx} className="break-words">
                    {task}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }

      // Generic custom text block (e.g. AI summary, TOC)
      return (
        <div className="h-full flex items-center justify-center text-xs md:text-sm text-gray-500 px-2">
          <span className="text-center break-words">
            {customData?.content ?? "Custom Placeholder"}
          </span>
        </div>
      );
    }

    default:
      return (
        <div className="h-full flex items-center justify-center text-xs md:text-sm text-gray-500 px-2">
          <span className="text-center">
            {String(widget.widgetType).charAt(0).toUpperCase() +
              String(widget.widgetType).slice(1)}{" "}
            Placeholder
          </span>
        </div>
      );
  }
};

export interface WidgetFormState {
  slideId: number;
  widgetId: string;
  widgetType: ReportWidgetType | "";
  data?: WidgetData;
  i?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

function ReportBuilder() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Initialize dashboards based on integrations
  const [dashboards, setDashboards] = useState<DashboardMap>(() => {
    // Start with empty map, will be populated based on integrations
    return new Map([[0, []]]);
  });
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [isDashboardsInitialized, setIsDashboardsInitialized] = useState(false);

  // Custom pages state (pages added by user, not from integrations)
  const [customPages, setCustomPages] = useState<
    Array<{ id: number; name: string; subtitle?: string }>
  >([]);

  // Page order state - tracks the order of all pages (integration indices + custom page IDs)
  const [pageOrder, setPageOrder] = useState<number[]>([]);

  const dashboardIds = useMemo(
    () => Array.from(dashboards.keys()).sort((a, b) => a - b),
    [dashboards]
  );

  const effectivePageOrder = pageOrder.length > 0 ? pageOrder : dashboardIds;
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const widgetRefs = useRef<Map<number, Map<string, HTMLDivElement>>>(
    new Map()
  );
  const [rightPanelTitle, setRightPanelTitle] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    getInitialDateRange()
  );
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [newReportName, setNewReportName] = useState("");
  const templateBootstrapRef = useRef(false);
  const defaultTemplatePayload = useMemo<CreateTemplatePayload>(
    () => ({
      name: "Untitled Report",
      widgets: DEFAULT_TEMPLATE_WIDGETS.map((widget) => ({
        ...widget,
        layout: widget.layout ? { ...widget.layout } : undefined,
      })),
    }),
    []
  );
  const { mutate: createTemplate, isPending: isCreatingTemplate } = useMutation(
    {
      mutationFn: (payload: CreateTemplatePayload) =>
        createReportTemplate(payload),
      onSuccess: (response) => {
        const newId = response.template.id;
        setTemplateId(newId);
        templateBootstrapRef.current = false;
        navigate(`/reports/${newId}`, { replace: true });
        queryClient.invalidateQueries({ queryKey: ["report-template", newId] });
        toast.success("Report template created");
      },
      onError: (error: ApiError) => {
        templateBootstrapRef.current = false;
        toast.error(error.message || "Failed to create report template");
      },
    }
  );

  // Report schedule state
  const [schedule, setSchedule] = useState<ReportSchedule | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleName, setScheduleName] = useState("Daily Performance Report");
  const [scheduleDescription, setScheduleDescription] = useState(
    "Auto daily metrics at 9 AM"
  );
  const [scheduleFrequency, setScheduleFrequency] =
    useState<ReportScheduleFrequency>("daily");
  const [scheduleTimezone, setScheduleTimezone] =
    useState<string>("Asia/Kolkata");
  const [scheduleTimeOfDay, setScheduleTimeOfDay] =
    useState<string>("09:00");
  const [scheduleSendEmail, setScheduleSendEmail] = useState(false);

  const handleCancelNewReport = useCallback(() => {
    templateBootstrapRef.current = false;
    setIsNameDialogOpen(false);
    setNewReportName("");
    navigate("/reports");
  }, [navigate]);

  const handleConfirmNewReport = useCallback(() => {
    const trimmedName = newReportName.trim();
    if (!trimmedName) {
      toast.error("Please enter a report name");
      return;
    }

    const payload: CreateTemplatePayload = {
      ...defaultTemplatePayload,
      name: trimmedName,
    };

    createTemplate(payload);
    setIsNameDialogOpen(false);
  }, [createTemplate, defaultTemplatePayload, newReportName]);

  const { data: integrationsData, isLoading: isLoadingIntegrations } =
    useIntegrations();
  const { groupedMetrics, isLoading: isLoadingMetrics } = useAvailableMetrics();
  const templateQuery = useQuery({
    queryKey: ["report-template", templateId],
    queryFn: async () => {
      if (templateId == null) {
        throw new Error("Missing template id");
      }
      const response = await getReportTemplate(templateId);
      console.log("getReportTemplate response", response);
      return response.template;
    },
    enabled: templateId != null,
    retry: 0,
  });

  // Apply saved default date range from template (if present)
  useEffect(() => {
    const data = templateQuery.data;
    if (!data?.defaultDateFrom || !data?.defaultDateTo) return;

    const from = new Date(data.defaultDateFrom);
    const to = new Date(data.defaultDateTo);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return;
    }

    setDateRange({ from, to });
  }, [templateQuery.data?.defaultDateFrom, templateQuery.data?.defaultDateTo]);

  // Handle template query errors
  useEffect(() => {
    if (templateQuery.error) {
      const error = templateQuery.error as ApiError;
      if (error.status === 404) {
        // For existing report IDs, do NOT auto-create a new template.
        // Just inform the user and go back to the reports list.
        templateBootstrapRef.current = false;
        toast.error("Report not found");
        navigate("/reports");
        return;
      }
      toast.error(error.message || "Failed to load report template");
    }
  }, [templateQuery.error, navigate]);

  // Initialize slides based on connected integrations (only for new reports without template data)
  useEffect(() => {
    // Only initialize if we don't have template data and integrations are loaded
    if (
      templateQuery.data?.widgets ||
      !integrationsData?.integrations ||
      isDashboardsInitialized
    ) {
      return;
    }

    const integrations = integrationsData.integrations;

    if (integrations.length === 0) {
      // No integrations, show single empty slide
      setDashboards(new Map([[0, []]]));
      setPageOrder([0]);
    } else {
      // Create one slide per integration
      const newDashboards = new Map<number, DashboardLayout[]>();
      const initialOrder: number[] = [];
      integrations.forEach((_, index) => {
        newDashboards.set(index, []);
        initialOrder.push(index);
      });
      setDashboards(newDashboards);
      setPageOrder(initialOrder);
    }

    setIsDashboardsInitialized(true);
  }, [integrationsData, templateQuery.data, isDashboardsInitialized]);

  // Ensure pageOrder always matches current slide IDs (integrations + custom pages)
  useEffect(() => {
    setPageOrder((prevOrder) => {
      const ids = dashboardIds;
      if (ids.length === 0) return prevOrder;

      // If no existing order, just use current ids
      if (prevOrder.length === 0) return ids;

      const idSet = new Set(ids);

      // 1) Keep existing order but drop any ids that no longer exist
      const filtered = prevOrder.filter((id) => idSet.has(id));

      // 2) Append any new ids that weren't in previous order
      const existingSet = new Set(filtered);
      ids.forEach((id) => {
        if (!existingSet.has(id)) {
          filtered.push(id);
        }
      });

      return filtered;
    });
  }, [dashboardIds]);

  // Update template data when loaded successfully
  useEffect(() => {
    if (!templateQuery.data) return;

    // Sync customPages (used by the left "Pages" sidebar) with backend slide
    // titles/subtitles so names stay stable across saves/refreshes. Merge
    // backend-provided custom pages with any local-only custom pages so that
    // newly added pages don't disappear immediately after a save.
    if (Array.isArray(templateQuery.data.slidesMeta)) {
      const slidesMeta = templateQuery.data.slidesMeta;

      setCustomPages((prev) => {
        // Custom pages coming from backend slidesMeta
        const fromBackend = slidesMeta
          // Only treat slides explicitly marked as "custom" (or legacy slides
          // that don't clearly map to an integration) as custom pages.
          .filter((slide, index) => {
            if (slide.source === "custom") return true;
            if (slide.source === "integration") return false;

            // Legacy: if there's an integration at this index or slideId,
            // assume it's an integration slide, not custom.
            const integration =
              integrationsData?.integrations?.[index] ??
              integrationsData?.integrations?.[slide.id];
            return !integration;
          })
          .map((slide) => ({
            id: slide.id,
            name: slide.title,
            subtitle: slide.subtitle,
          }));

        const backendIds = new Set(fromBackend.map((p) => p.id));

        // Keep any local custom pages that the backend doesn't know about yet
        const preservedLocal = prev.filter((p) => !backendIds.has(p.id));

        return [...preservedLocal, ...fromBackend];
      });
    }

    const map = buildDashboardMapFromTemplate(
      (templateQuery.data.widgets ?? []) as ReportWidgetDefinition[]
    );

    if (map.size === 0) {
      // If template has no widgets, create slides based on integrations
      if (
        integrationsData?.integrations &&
        integrationsData.integrations.length > 0
      ) {
        const newDashboards = new Map<number, DashboardLayout[]>();
        integrationsData.integrations.forEach((_, index) => {
          newDashboards.set(index, []);
        });
        setDashboards(newDashboards);
      } else {
        setDashboards(new Map([[0, []]]));
      }
    } else {
      setDashboards(map);
    }

    // If backend returns a saved page order, apply it so pages/sidebar and slides
    // appear in the same order after reload.
    if (
      Array.isArray(templateQuery.data.pageOrder) &&
      templateQuery.data.pageOrder.length > 0
    ) {
      setPageOrder(templateQuery.data.pageOrder);
    }

    setIsDashboardsInitialized(true);
  }, [templateQuery.data, integrationsData]);

  const templateName =
    (templateQuery.data?.name ?? newReportName) || "Untitled Report";
  const isTemplateLoading = templateQuery.isPending || templateQuery.isFetching;
  const widgetSignature = useMemo(() => {
    return (templateQuery.data?.widgets ?? [])
      .map((widget: ReportWidgetDefinition) => widget.id)
      .join("|");
  }, [templateQuery.data?.widgets]);
  const dateRangeKey = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return "none";
    return `${dateRange.from.toISOString()}_${dateRange.to.toISOString()}`;
  }, [dateRange]);
  const shouldResolveWidgets =
    Boolean(templateId) &&
    Boolean(dateRange?.from && dateRange?.to) &&
    Boolean(widgetSignature);

  const reportDataQuery = useQuery<Record<string, ResolvedWidgetData>>({
    queryKey: ["report-data", templateId, dateRangeKey, widgetSignature],
    enabled: shouldResolveWidgets,
    queryFn: async () => {
      if (!templateId || !dateRange?.from || !dateRange?.to) {
        return {};
      }

      const widgets = (templateQuery.data?.widgets ?? []).filter(
        (widget: ReportWidgetDefinition) => widget.metricKey
      );

      if (!widgets.length) {
        return {};
      }

      const dateFrom = formatApiDate(dateRange.from);
      const dateTo = formatApiDate(dateRange.to);

      const [reportResponse, resolvedResponse] = await Promise.all([
        runReport({
          templateId,
          dateFrom,
          dateTo,
        }),
        resolveMetricWidgets({
          dateFrom,
          dateTo,
          widgets: widgets.map((widget: ReportWidgetDefinition) => ({
            id: widget.id,
            type: widget.type ?? "metric_card",
            metricKey: widget.metricKey,
            groupBy: widget.groupBy,
            aggregation: widget.aggregation,
            integration: widget.integration,
            accountId: widget.accountId,
            ...(widget.filters ? { filters: widget.filters } : {}),
          })),
        }),
      ]);

      const merged: Record<string, ResolvedWidgetData> = {};
      Object.entries(reportResponse.data ?? {}).forEach(([key, value]) => {
        merged[key] = { ...(merged[key] ?? {}), ...value };
      });
      Object.entries(resolvedResponse.data ?? {}).forEach(([key, value]) => {
        merged[key] = { ...(merged[key] ?? {}), ...value };
      });

      return merged;
    },
  });

  // Handle report data query errors
  useEffect(() => {
    if (reportDataQuery.error) {
      const error = reportDataQuery.error as ApiError;
      toast.error(error.message || "Failed to resolve widget data");
    }
  }, [reportDataQuery.error]);

  const resolvedWidgets = reportDataQuery.data ?? {};
  const isResolvingWidgets = reportDataQuery.isFetching;
  const { refetch: refetchReportData } = reportDataQuery;

  const buildTemplatePayloadFromDashboards =
    useCallback((): CreateTemplatePayload => {
      const widgets: ReportWidgetDefinition[] = [];

      // Build widgets array from current dashboards/layouts
      dashboards.forEach((layout, slideId) => {
        layout.forEach((widget) => {
          const metricConfig = widget.metricConfig ?? {
            // For widgets without metricConfig, do NOT hardcode any metric/integration.
            // Leave them as non-metric layout-only widgets; backend can ignore empty metrics.
            id: widget.i,
            metricKey: "",
            integration: "",
            groupBy: "none",
            aggregation: "sum",
            type: widget.widgetType,
          };

          const existingFilters =
            (metricConfig.filters as Record<string, unknown> | undefined) ?? {};

          widgets.push({
            ...metricConfig,
            id: metricConfig.id ?? widget.i,
            type: metricConfig.type ?? widget.widgetType,
            layout: {
              slideId,
              x: widget.x,
              y: widget.y,
              w: widget.w,
              h: widget.h,
            },
            // Persist full widget data (manual content blocks, tasks, tables, etc.)
            widgetData: widget.data as unknown,
             // Also tuck widgetData into filters so it survives on backends that only
             // persist the documented "filters" bag.
            filters: {
              ...existingFilters,
              widgetData: widget.data as unknown,
            },
          });
        });
      });

      // Build slidesMeta so we can preserve human-readable slide titles when
      // reconstructing the backend "slides" structure. Prefer any existing
      // titles from the loaded template, then fall back to current customPages,
      // then to integration-based names, and finally to a neutral fallback.
      const slideIdList = Array.from(dashboards.keys());
      const existingMeta = templateQuery.data?.slidesMeta ?? [];

      const slidesMeta =
        slideIdList.length === 0
          ? undefined
          : slideIdList.map((slideId, index) => {
              const fromExisting = existingMeta.find((m) => m.id === slideId);
              const fromCustom = customPages.find((p) => p.id === slideId);

              // 1) If we have both existing meta and a user-defined name,
              //    override the title/subtitle but keep source/grouping.
              if (fromExisting && fromCustom) {
                return {
                  ...fromExisting,
                  title: fromCustom.name,
                  subtitle: fromCustom.subtitle ?? fromExisting.subtitle,
                };
              }

              // 2) Existing backend title/subtitle (no override)
              if (fromExisting) {
                return { ...fromExisting };
              }

              // 3) Name from custom pages (user-defined) only
              if (fromCustom) {
                return {
                  id: slideId,
                  title: fromCustom.name,
                  subtitle: fromCustom.subtitle,
                  source: "custom" as const,
                };
              }

              // 4) Best-effort integration-based name (for integration slides)
              const integration =
                integrationsData?.integrations?.[index] ??
                integrationsData?.integrations?.[slideId];
              if (integration) {
                const platformConfig = getPlatformConfig(integration.platform);
                return {
                  id: slideId,
                  title: platformConfig?.name || integration.platform,
                  subtitle: integration.accountName,
                  source: "integration" as const,
                };
              }

              // 5) Fallback generic name (treat as custom, but without "Slide #")
              return {
                id: slideId,
                title: "Untitled page",
                source: "custom" as const,
              };
            });

      return {
        name: templateName,
        widgets,
        ...(slidesMeta ? { slidesMeta } : {}),
      };
    }, [dashboards, templateName, templateQuery.data?.slidesMeta, customPages, integrationsData]);

  const { mutate: saveTemplate, isPending: isSavingTemplate } = useMutation({
    mutationFn: async (payload: CreateTemplatePayload) => {
      if (!templateId) {
        throw new Error("Template not ready");
      }
      return updateReportTemplate(templateId, payload);
    },
    onSuccess: () => {
      // We already keep the in-memory dashboards (with full widget data)
      // as the source of truth. Avoid immediately re-hydrating from the
      // backend, since the backend may not yet persist manual widgetData
      // (content blocks), which would make them appear to "reset" after save.
      toast.success("Report template saved");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to save template");
    },
  });

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Report schedule mutations
  const { mutate: createSchedule } =
    useMutation({
      mutationFn: async (payload: CreateReportSchedulePayload) =>
        createReportSchedule(payload),
      onSuccess: (response) => {
        setSchedule(response.data);
        toast.success("Schedule created");
      },
      onError: (error: ApiError) => {
        toast.error(error.message || "Failed to create schedule");
      },
    });

  const { mutate: updateSchedule } =
    useMutation({
      mutationFn: async (args: {
        id: number;
        payload: UpdateReportSchedulePayload;
      }) => updateReportSchedule(args.id, args.payload),
      onSuccess: () => {
        toast.success("Schedule updated");
      },
      onError: (error: ApiError) => {
        toast.error(error.message || "Failed to update schedule");
      },
    });

  const { mutate: removeSchedule } = useMutation({
      mutationFn: async (id: number) => deleteReportSchedule(id),
      onSuccess: () => {
        setSchedule(null);
        toast.success("Schedule deleted");
      },
      onError: (error: ApiError) => {
        toast.error(error.message || "Failed to delete schedule");
      },
    });

  const handleSaveTemplate = useCallback(() => {
    if (!templateId) {
      toast.error("Template not ready yet");
      return;
    }

    const basePayload = buildTemplatePayloadFromDashboards();

    const payload = {
      ...basePayload,
      defaultDateFrom: dateRange?.from
        ? formatApiDate(dateRange.from)
        : undefined,
      defaultDateTo: dateRange?.to ? formatApiDate(dateRange.to) : undefined,
      // Persist current page order (slide order) to backend
      pageOrder: pageOrder.length > 0 ? pageOrder : Array.from(dashboardIds),
    };

    console.log("payload", payload);
    saveTemplate(payload);
  }, [
    templateId,
    buildTemplatePayloadFromDashboards,
    saveTemplate,
    dateRange,
    pageOrder,
    dashboardIds,
  ]);

  const handleRunReport = useCallback(() => {
    if (!shouldResolveWidgets) {
      toast.info("Add widgets and select a date range first.");
      return;
    }
    refetchReportData();
  }, [shouldResolveWidgets, refetchReportData]);

  const handleGeneratePdf = useCallback(async () => {
    if (isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      await exportAllSlidesToPDF(slidesRef.current);
    } catch (error) {
      console.error("Failed to generate PDF from frontend", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [isGeneratingPdf]);

  const handleConnectIntegration = useCallback(() => {
    navigate("/data-sources");
  }, [navigate]);

  const handleOpenScheduleDialog = useCallback(() => {
    // Prefill dialog with existing schedule or sensible defaults
    if (schedule) {
      setScheduleName(schedule.name);
      setScheduleDescription(schedule.description ?? "");
      setScheduleFrequency(schedule.frequency as ReportScheduleFrequency);
      setScheduleTimezone(schedule.timezone);
      setScheduleTimeOfDay(schedule.timeOfDay);
      setScheduleSendEmail(Boolean(schedule.sendEmail));
    }
    setIsScheduleDialogOpen(true);
  }, [schedule]);

  const handleSaveSchedule = useCallback(() => {
    if (!templateId) {
      toast.error("Save the template before scheduling");
      return;
    }

    if (!schedule) {
      const payload: CreateReportSchedulePayload = {
        templateId,
        name: scheduleName,
        description: scheduleDescription || undefined,
        frequency: scheduleFrequency,
        timezone: scheduleTimezone,
        timeOfDay: scheduleTimeOfDay,
        sendEmail: scheduleSendEmail,
      };
      createSchedule(payload);
    } else {
      const payload: UpdateReportSchedulePayload = {
        name: scheduleName || undefined,
        description: scheduleDescription || undefined,
        timeOfDay: scheduleTimeOfDay || undefined,
        isActive: true,
        sendEmail: scheduleSendEmail,
      };
      updateSchedule({ id: schedule.id, payload });
    }

    setIsScheduleDialogOpen(false);
  }, [
    templateId,
    schedule,
    scheduleName,
    scheduleDescription,
    scheduleFrequency,
    scheduleTimezone,
    scheduleTimeOfDay,
    scheduleSendEmail,
    createSchedule,
    updateSchedule,
  ]);

  useEffect(() => {
    const routeId = params.id;
    if (!routeId || routeId === "new") {
      if (!isCreatingTemplate && !templateBootstrapRef.current) {
        templateBootstrapRef.current = true;
        setIsNameDialogOpen(true);
      }
      return;
    }

    const numericId = Number(routeId);
    if (Number.isNaN(numericId)) {
      toast.error("Invalid report id");
      return;
    }

    setTemplateId(numericId);
  }, [params.id, isCreatingTemplate, defaultTemplatePayload, createTemplate]);

  const [widgetFormState, setWidgetFormState] = useState<WidgetFormState>({
    slideId: 0,
    widgetId: "",
    widgetType: "",
    data: undefined, // ✅ use 'undefined' or just omit
    i: "", // required by Layout
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  });
  const updateDashboard = useCallback(
    (id: number, newLayout: DashboardLayout[]) => {
      setDashboards((prev) => {
        const updated = new Map(prev);
        updated.set(id, newLayout);
        return updated;
      });
    },
    []
  );

  const addCustomPage = useCallback(
    (pageName: string, subtitle?: string) => {
      // Find the next available slide ID
      const existingIds = Array.from(dashboards.keys());
      const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 0;

      // Add to custom pages
      setCustomPages((prev) => [
        ...prev,
        { id: nextId, name: pageName, subtitle },
      ]);

      // Add empty slide
      setDashboards((prev) => {
        const updated = new Map(prev);
        updated.set(nextId, []);
        return updated;
      });

      // Add to page order
      setPageOrder((prev) => [...prev, nextId]);

      return nextId;
    },
    [dashboards]
  );

  const handleDeletePage = useCallback(
    (slideId: number) => {
      // Remove the slide from dashboards
      setDashboards((prev) => {
        const updated = new Map(prev);
        updated.delete(slideId);
        return updated;
      });

      // Remove from custom pages (if it was a custom page)
      setCustomPages((prev) => prev.filter((p) => p.id !== slideId));

      // Remove from page order
      setPageOrder((prev) => prev.filter((id) => id !== slideId));

      // Clear any references
      if (slidesRef.current[slideId]) {
        slidesRef.current[slideId] = null;
      }
      widgetRefs.current.delete(slideId);

      // If a widget on this slide was selected, clear the selection
      setWidgetFormState((prev) =>
        prev.slideId === slideId
          ? {
              slideId: 0,
              widgetId: "",
              widgetType: "",
              data: undefined,
              i: "",
              x: 0,
              y: 0,
              w: 1,
              h: 1,
            }
          : prev
      );
    },
    []
  );

  const handleRenamePage = useCallback(
    (slideId: number, newName: string) => {
      setCustomPages((prev) => {
        const existing = prev.find((p) => p.id === slideId);
        if (existing) {
          return prev.map((p) =>
            p.id === slideId ? { ...p, name: newName } : p
          );
        }
        // If this slide wasn't in customPages yet (e.g., an older or integration page),
        // add a new entry so the name override is included in slidesMeta on save.
        return [...prev, { id: slideId, name: newName }];
      });
    },
    []
  );

  const handleReorderPages = useCallback(
    (fromIndex: number, toIndex: number) => {
      setPageOrder((prevOrder) => {
        const baseOrder =
          prevOrder.length > 0 ? [...prevOrder] : [...dashboardIds];
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= baseOrder.length ||
          toIndex >= baseOrder.length
        ) {
          return baseOrder;
        }
        const [movedItem] = baseOrder.splice(fromIndex, 1);
        baseOrder.splice(toIndex, 0, movedItem);
        return baseOrder;
      });
    },
    [dashboardIds]
  );

  // Update widget data in dashboards state
  const updateWidgetData = useCallback(
    (slideId: number, widgetId: string, newData: WidgetData) => {
      setDashboards((prev) => {
        const updated = new Map(prev);
        const layout = updated.get(slideId);
        if (!layout) return prev;

        const updatedLayout = layout.map((widget) =>
          widget.i === widgetId ? { ...widget, data: newData } : widget
        );
        updated.set(slideId, updatedLayout);
        return updated;
      });

      // Also update widgetFormState to keep it in sync
      setWidgetFormState((prev) => ({
        ...prev,
        data: newData,
      }));
    },
    []
  );

  // Remove a widget from a specific slide
  const handleDeleteWidget = useCallback(
    (slideId: number, widgetId: string) => {
      setDashboards((prev) => {
        const updated = new Map(prev);
        const layout = updated.get(slideId);
        if (!layout) return prev;

        const newLayout = layout.filter((widget) => widget.i !== widgetId);
        updated.set(slideId, newLayout);
        return updated;
      });

      // If the deleted widget was selected in the right-side editor, clear it
      setWidgetFormState((prev) =>
        prev.widgetId === widgetId
          ? {
              slideId: 0,
              widgetId: "",
              widgetType: "",
              data: undefined,
              i: "",
              x: 0,
              y: 0,
              w: 1,
              h: 1,
            }
          : prev
      );
    },
    []
  );

  // Auto-fit each widget's height to its rendered content by adjusting layout h (in rows)
  const syncWidgetHeightsToContent = useCallback(
    (slideId: number) => {
      const layout = dashboards.get(slideId);
      const slideWidgetRefs = widgetRefs.current.get(slideId);
      if (!layout || !slideWidgetRefs) return;

      const updatedLayout: DashboardLayout[] = layout.map((item) => {
        const el = slideWidgetRefs.get(item.i);
        if (!el) return item;
        const contentHeight = el.clientHeight;
        const desiredRows = Math.max(
          DEFAULT_WIDGET_SIZE.h,
          Math.ceil(contentHeight / GRID_CONFIG.rowHeight)
        );
        if (desiredRows !== item.h) {
          return { ...item, h: desiredRows };
        }
        return item;
      });

      // Only update if something changed
      const changed =
        updatedLayout.length !== layout.length ||
        updatedLayout.some((it, idx) => it.h !== layout[idx].h);
      if (changed) {
        updateDashboard(slideId, updatedLayout);
      }
    },
    [dashboards, updateDashboard]
  );

  // Recalculate on dashboards change (content/layout updated)
  // Use requestAnimationFrame to batch DOM reads
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dashboardIds.forEach((id) => syncWidgetHeightsToContent(id));
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [dashboards, dashboardIds, syncWidgetHeightsToContent]);

  const handleDrop = useCallback(
    (_layoutArr: Layout[], layoutItem: Layout, e: DragEvent, id: number) => {
      const widgetType = e.dataTransfer?.getData(
        "widgetType"
      ) as ReportWidgetType | null;
      if (!widgetType) return;

      // Get metric data if available
      const metricDataStr = e.dataTransfer?.getData("metricData");
      const customKind = e.dataTransfer?.getData("customKind") || undefined;
      let metricData:
        | { metricKey: string; integration: string; accountId: string }
        | undefined;

      if (metricDataStr) {
        try {
          metricData = JSON.parse(metricDataStr);
        } catch (err) {
          console.error("Failed to parse metric data:", err);
        }
      }

      // ✅ Use defaults or fallbacks
      const { w, h } = WIDGET_SIZE_MAP[widgetType] ?? { w: 4, h: 3 };

      // 🧠 Use 0, not -1 — react-grid-layout handles y positioning automatically
      const widgetIdentifier = generateWidgetId("item");
      // Default widget data; for custom content blocks we may specialise later
      let widgetData = getDefaultWidgetData(widgetType);

      // If this is a custom Content Block with a specific kind, annotate it in data
      if (widgetType === "custom" && widgetData && "content" in widgetData) {
        (widgetData as CustomWidgetData).type = customKind || "text";
      }

      const newItem: DashboardLayout = {
        i: widgetIdentifier,
        x: widgetType !== "title" ? layoutItem?.x : 0,
        y: widgetType !== "title" ? layoutItem?.y : -1,
        w,
        h,
        widgetType,
        data: widgetData,
        metricConfig: metricData
          ? {
              id: widgetIdentifier,
              metricKey: metricData.metricKey,
              integration: metricData.integration,
              accountId: metricData.accountId,
              groupBy: "day",
              aggregation: "sum",
              type: widgetType,
            }
          : {
              // If we don't have metric data from the API, don't invent a metric.
              // Treat this as a layout-only widget; backend can ignore empty metric fields.
              id: widgetIdentifier,
              metricKey: "",
              integration: "",
              groupBy: "none",
              aggregation: "sum",
              type: widgetType,
            },
      };

      // 🪄 Update the dashboards map immutably
      setDashboards((prev) => {
        const updated = new Map(prev);
        const existingLayout = updated.get(id) ?? [];
        updated.set(id, [...existingLayout, newItem]);
        return updated;
      });
    },
    []
  );

  const createLayoutChangeHandler = useCallback(
    (id: number, currentLayout: DashboardLayout[]) => (newLayout: Layout[]) => {
      const mergedLayout = currentLayout.map((item) => {
        const updated = newLayout.find((n) => n.i === item.i);
        return updated ? { ...item, ...updated } : item;
      });

      updateDashboard(id, mergedLayout);
    },
    [updateDashboard]
  );

  const handleDragStart = useCallback(
    (
      e: React.DragEvent<HTMLDivElement>,
      widgetType: ReportWidgetType,
      metricDataOrCustomKind?:
        | {
            metricKey: string;
            integration: string;
            accountId: string;
          }
        | string
    ) => {
      e.dataTransfer.setData("widgetType", widgetType);

      if (typeof metricDataOrCustomKind === "string") {
        e.dataTransfer.setData("customKind", metricDataOrCustomKind);
      } else if (metricDataOrCustomKind) {
        e.dataTransfer.setData(
          "metricData",
          JSON.stringify(metricDataOrCustomKind)
        );
      }

      e.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  // Memoize widget click handler factory
  const createWidgetClickHandler = useCallback(
    (slideId: number) => (widget: DashboardLayout) => {
      setRightPanelTitle("");
      if (widgetFormState.widgetId === widget.i) {
        setWidgetFormState({
          widgetType: "",
          slideId: 0,
          widgetId: "",
          i: "",
          x: 0,
          y: 0,
          h: 1,
          w: 1,
        });
      } else {
        setWidgetFormState({
          i: widget.i,
          widgetType: widget.widgetType,
          slideId: slideId,
          widgetId: widget.i,
          x: widget.x,
          y: widget.y,
          h: widget.h,
          w: widget.w,
          data: widget.data,
        });
      }
    },
    [widgetFormState.widgetId]
  );

  // Memoize ref callback factory
  const createWidgetRefCallback = useCallback(
    (slideId: number, widgetId: string) => (el: HTMLDivElement | null) => {
      if (!widgetRefs.current.has(slideId)) {
        widgetRefs.current.set(slideId, new Map());
      }
      const map = widgetRefs.current.get(slideId)!;
      if (el) map.set(widgetId, el);
      else map.delete(widgetId);
    },
    []
  );

  // Memoize widget form onChange handlers
  const createWidgetFormChangeHandler = useCallback(
    (slideId: number, widgetId: string) => (data: WidgetData) => {
      updateWidgetData(slideId, widgetId, data);
    },
    [updateWidgetData]
  );

  // Memoize widget form sections
  const widgetFormSections = useMemo(() => {
    if (widgetFormState.widgetType === "") return null;

    const changeHandler = createWidgetFormChangeHandler(
      widgetFormState.slideId,
      widgetFormState.widgetId
    );

    switch (widgetFormState.widgetType) {
      case "title":
        return (
          <TitleWidgetForm
            data={widgetFormState.data as TitleWidgetData}
            onChange={changeHandler}
          />
        );
      case "metric":
        return (
          <MetricWidgetForm
            data={widgetFormState.data as MetricWidgetData}
            onChange={changeHandler}
          />
        );
      case "chart":
        return (
          <ChartWidgetForm
            data={widgetFormState.data as ChartWidgetData}
            onChange={changeHandler}
          />
        );
      case "table":
        return (
          <TableWidgetForm
            data={widgetFormState.data as TableWidgetData}
            onChange={changeHandler}
          />
        );
      case "image":
        return (
          <ImageWidgetForm
            data={widgetFormState.data as ImageWidgetData}
            onChange={changeHandler}
          />
        );
      case "embed":
        return (
          <EmbedWidgetForm
            data={widgetFormState.data as EmbedWidgetData}
            onChange={changeHandler}
          />
        );
      case "custom": {
        const customData = widgetFormState.data as CustomWidgetData;
        if (customData?.type === "tasks") {
          return (
            <TasksWidgetForm
              data={customData}
              onChange={changeHandler as (data: CustomWidgetData) => void}
            />
          );
        }
        return (
          <CustomWidgetForm
            data={customData}
            onChange={changeHandler as (data: CustomWidgetData) => void}
          />
        );
      }
      default:
        return null;
    }
  }, [
    widgetFormState.widgetType,
    widgetFormState.data,
    widgetFormState.slideId,
    widgetFormState.widgetId,
    createWidgetFormChangeHandler,
  ]);

  // State for expanded integrations
  const [expandedIntegrations, setExpandedIntegrations] = useState<Set<number>>(
    new Set()
  );

  const toggleIntegration = useCallback((integrationId: number) => {
    setExpandedIntegrations((prev) => {
      const next = new Set(prev);
      if (next.has(integrationId)) {
        next.delete(integrationId);
      } else {
        next.add(integrationId);
      }
      return next;
    });
  }, []);

  // Get metrics for a specific integration and accountId from API data
  const getMetricsForIntegration = useCallback(
    (integration: string, accountId: string) => {
      // Try exact match first
      let platformMetrics = groupedMetrics[integration];

      // Try lowercase match
      if (!platformMetrics) {
        platformMetrics = groupedMetrics[integration.toLowerCase()];
      }

      // Try to match by partial name (e.g., "google" matches "google-analytics")
      if (!platformMetrics) {
        const integrationLower = integration.toLowerCase();
        const matchingKey = Object.keys(groupedMetrics).find(
          (key) =>
            key.toLowerCase().includes(integrationLower) ||
            integrationLower.includes(key.toLowerCase())
        );
        if (matchingKey) {
          platformMetrics = groupedMetrics[matchingKey];
        }
      }

      if (!platformMetrics) {
        return [];
      }

      const accountMetrics = platformMetrics[accountId];
      return accountMetrics || [];
    },
    [groupedMetrics]
  );

  // Memoize right panel content
  const rightPanelContent = useMemo(() => {
    if (rightPanelTitle === "Integrations") {
      return (
        <div className="w-full h-full overflow-y-auto">
          {isLoadingIntegrations || isLoadingMetrics ? (
            <div className="text-center text-sm text-gray-500 py-4 px-2">
              Loading integrations...
            </div>
          ) : integrationsData?.integrations &&
            integrationsData.integrations.length > 0 ? (
            <div>
              {integrationsData.integrations.map((integration) => {
                const platformConfig = getPlatformConfig(integration.platform);
                const isExpanded = expandedIntegrations.has(integration.id);
                const metrics = getMetricsForIntegration(
                  integration.platform,
                  integration.accountId
                );

                if (!platformConfig) return null;

                return (
                  <div
                    key={integration.id}
                    className="border-b last:border-b-0"
                  >
                    {/* Integration Header */}
                    <div
                      onClick={() => toggleIntegration(integration.id)}
                      className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <platformConfig.icon
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: platformConfig.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {platformConfig?.name || integration.platform}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {isLoadingMetrics
                            ? "Loading metrics..."
                            : metrics.length === 0
                            ? "No metrics synced yet"
                            : `${metrics.length} ${
                                metrics.length === 1 ? "metric" : "metrics"
                              }`}
                        </div>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>

                    {/* Expanded Metrics */}
                    {isExpanded && (
                      <div className="bg-gray-50">
                        {metrics.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-500 space-y-2">
                            <p className="font-medium">
                              No metrics available yet
                            </p>
                            <p className="text-[10px]">
                              Metrics will appear here after data is synced from{" "}
                              {platformConfig?.name || integration.platform}.
                              This usually takes a few minutes after connecting.
                            </p>
                          </div>
                        ) : (
                          metrics.map((metric) => (
                            <div key={metric.metricKey} className="border-t">
                              {/* Metric Info - Not draggable, just displays the metric */}
                              <div className="flex items-start gap-2 p-3 pl-8 bg-white">
                                <platformConfig.icon
                                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                                  style={{ color: platformConfig.color }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-gray-900 truncate">
                                    {metric.displayName}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                                    {metric.category}
                                  </div>
                                </div>
                              </div>

                              {/* Widget Type Options - Each is draggable */}
                              <div className="flex items-center gap-1 px-3 pb-3 pl-12 bg-white">
                                {/* Metric Card */}
                                <div
                                  draggable
                                  onDragStart={(e) =>
                                    handleDragStart(e, "chart", {
                                      metricKey: metric.metricKey,
                                      integration: metric.integration,
                                      accountId: metric.accountId,
                                    })
                                  }
                                  className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-all"
                                  title="Metric Card"
                                >
                                  <svg
                                    className="w-4 h-4 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 20h10M7 16h10M7 12h10M12 4v4"
                                    />
                                  </svg>
                                </div>

                                {/* Line Chart */}
                                <div
                                  draggable
                                  onDragStart={(e) =>
                                    handleDragStart(e, "line_chart", {
                                      metricKey: metric.metricKey,
                                      integration: metric.integration,
                                      accountId: metric.accountId,
                                    })
                                  }
                                  className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-all"
                                  title="Line Chart"
                                >
                                  <svg
                                    className="w-4 h-4 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 12l3-3 3 3 4-4"
                                    />
                                  </svg>
                                </div>

                                {/* Area Chart */}
                                <div
                                  draggable
                                  onDragStart={(e) =>
                                    handleDragStart(e, "area_chart", {
                                      metricKey: metric.metricKey,
                                      integration: metric.integration,
                                      accountId: metric.accountId,
                                    })
                                  }
                                  className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-all"
                                  title="Area Chart"
                                >
                                  <svg
                                    className="w-4 h-4 text-gray-600"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M3 20h18v-2H3v2zm0-4h18v-2l-4-4-4 4-4-4-6 6v0z" />
                                  </svg>
                                </div>

                                {/* Bar Chart */}
                                <div
                                  draggable
                                  onDragStart={(e) =>
                                    handleDragStart(e, "bar_chart", {
                                      metricKey: metric.metricKey,
                                      integration: metric.integration,
                                      accountId: metric.accountId,
                                    })
                                  }
                                  className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-all"
                                  title="Bar Chart"
                                >
                                  <svg
                                    className="w-4 h-4 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                  </svg>
                                </div>

                                {/* Pie Chart */}
                                <div
                                  draggable
                                  onDragStart={(e) =>
                                    handleDragStart(e, "pie_chart", {
                                      metricKey: metric.metricKey,
                                      integration: metric.integration,
                                      accountId: metric.accountId,
                                    })
                                  }
                                  className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-all"
                                  title="Pie Chart"
                                >
                                  <svg
                                    className="w-4 h-4 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                                    />
                                  </svg>
                                </div>

                                {/* Table */}
                                <div
                                  draggable
                                  onDragStart={(e) =>
                                    handleDragStart(e, "table", {
                                      metricKey: metric.metricKey,
                                      integration: metric.integration,
                                      accountId: metric.accountId,
                                    })
                                  }
                                  className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-all"
                                  title="Table"
                                >
                                  <svg
                                    className="w-4 h-4 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500 py-8 px-4">
              <p className="font-medium mb-2">No integrations connected</p>
              <p className="text-xs mb-4">
                Connect an integration to add metric widgets
              </p>
              <Link to="/data-sources">
                <Button variant="outline" size="sm">
                  Connect Integration
                </Button>
              </Link>
            </div>
          )}
        </div>
      );
    }
    if (rightPanelTitle === "Content Blocks") {
      return (
        <div className="w-full h-full overflow-y-auto p-2 md:p-4">
          {widgetItems.map((item, index) => (
            <WidgetDragItem
              key={index}
              title={item.title}
              description={item.description}
              type={item.type}
              customKind={item.customKind}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      );
    }
    if (rightPanelTitle === "Images") {
      return (
        <div className="w-full h-full overflow-y-auto p-2 md:p-4">
          {imageWidgetItems.map((item, index) => (
            <WidgetDragItem
              key={index}
              title={item.title}
              description={item.description}
              type={item.type}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      );
    }
    if (rightPanelTitle === "Embeds") {
      return (
        <div className="w-full h-full overflow-y-auto p-2 md:p-4">
          {embedWidgetItems.map((item, index) => (
            <WidgetDragItem
              key={index}
              title={item.title}
              description={item.description}
              type={item.type}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      );
    }
    return null;
  }, [
    rightPanelTitle,
    handleDragStart,
    integrationsData,
    isLoadingIntegrations,
    isLoadingMetrics,
    expandedIntegrations,
    toggleIntegration,
    getMetricsForIntegration,
  ]);
  // Detect if we're on tablet (using window width)
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
    };

    checkTablet();
    window.addEventListener("resize", checkTablet);
    return () => window.removeEventListener("resize", checkTablet);
  }, []);

  // Use appropriate grid config based on screen size
  const currentGridConfig = isTablet ? TABLET_GRID_CONFIG : GRID_CONFIG;

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* New Report Name Dialog */}
      <Dialog
        open={isNameDialogOpen}
        onOpenChange={(open) => !open && handleCancelNewReport()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name your report</DialogTitle>
            <DialogDescription>
              Give this report a clear name so you can easily find it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="block text-sm font-medium text-gray-700">
              Report name
            </label>
            <Input
              autoFocus
              placeholder="e.g. Weekly Marketing Performance"
              value={newReportName}
              onChange={(e) => setNewReportName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelNewReport}>
              Cancel
            </Button>
            <Button onClick={handleConfirmNewReport}>Create Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Schedule Dialog */}
      <Dialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {schedule ? "Edit Report Schedule" : "Create Report Schedule"}
            </DialogTitle>
            <DialogDescription>
              Automatically run this report at a specific time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Input
                value={scheduleDescription}
                onChange={(e) => setScheduleDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Frequency
              </label>
              <select
                className="border rounded px-2 py-1 text-sm w-full"
                value={scheduleFrequency}
                onChange={(e) =>
                  setScheduleFrequency(
                    e.target.value as ReportScheduleFrequency
                  )
                }
              >
                <option value="daily">Daily</option>
                <option value="weekly" disabled>
                  Weekly (coming soon)
                </option>
                <option value="monthly" disabled>
                  Monthly (coming soon)
                </option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Time of day
              </label>
              <Input
                type="time"
                value={scheduleTimeOfDay}
                onChange={(e) => setScheduleTimeOfDay(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Timezone
              </label>
              <Input
                value={scheduleTimezone}
                onChange={(e) => setScheduleTimezone(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                id="schedule-send-email"
                type="checkbox"
                checked={scheduleSendEmail}
                onChange={(e) => setScheduleSendEmail(e.target.checked)}
              />
              <label
                htmlFor="schedule-send-email"
                className="text-xs md:text-sm text-gray-700"
              >
                Send report via email when it runs
              </label>
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center">
            {schedule && (
              <Button
                type="button"
                variant="outline"
                className="text-red-600 border-red-300"
                onClick={() => removeSchedule(schedule.id)}
              >
                Delete Schedule
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsScheduleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveSchedule}>
                {schedule ? "Save Changes" : "Create Schedule"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Top Bar */}
      <div className="sticky z-50 top-0 py-3 md:py-[1.3em]  border-b flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-3 md:px-5">
        <div className="flex flex-col">
          <span className="font-medium text-lg md:text-xl">Report Builder</span>
          <span className="text-xs md:text-sm text-gray-500">
            {isTemplateLoading ? "Loading template..." : templateName}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className="mx-1 md:mx-2 text-base md:text-lg text-gray-500 cursor-pointer">
            <FiSearch />
          </span>
          <span className="mx-1 md:mx-2 text-base md:text-lg text-gray-500 cursor-pointer">
            <FiBell />
          </span>
          <Button
            variant="outline"
            className="rounded-[0.4rem] text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2"
            onClick={handleOpenScheduleDialog}
            disabled={isSavingTemplate || isTemplateLoading}
          >
            {schedule ? "Edit Schedule" : "Add Schedule"}
          </Button>
          <Button
            variant="outline"
            className="rounded-[0.4rem] text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2"
            onClick={handleSaveTemplate}
            disabled={isSavingTemplate || isTemplateLoading}
          >
            {isSavingTemplate ? "Saving..." : "Save Template"}
          </Button>
          <Button
            className="rounded-[0.4rem] text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2"
            onClick={handleRunReport}
            disabled={isResolvingWidgets}
          >
            {isResolvingWidgets ? "Running..." : "Run Report"}
          </Button>
        </div>
      </div>

      {/* Sub Header */}
      <div className="sticky z-40 top-[var(--rb-header)] py-2 md:py-[1.2em]  border-b flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 md:gap-0 px-3 md:px-5">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <RadioButtonGroup />
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex-1 md:flex-none">
            <DateRangePicker
              value={dateRange}
              onChange={(range) => {
                setDateRange(range);
              }}
            />
          </div>
          <button
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className="bg-accent-foreground text-white py-1.5 md:py-2 px-3 md:px-4 rounded-[0.6rem] text-xs md:text-sm hover:cursor-pointer whitespace-nowrap disabled:opacity-60"
          >
            <span className="hidden md:inline">
              {isGeneratingPdf ? "Generating..." : "Download PDF"}
            </span>
            <span className="md:hidden">{isGeneratingPdf ? "..." : "PDF"}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Left Sidebar */}
        <div className="sticky top-[calc(var(--rb-header)+var(--rb-subheader))] left-0 w-48 md:w-52 lg:w-[15.5rem]  border-r h-[calc(100vh-(var(--rb-header)+var(--rb-subheader)))] overflow-y-auto transition-all duration-300 z-30">
          <div className="w-full h-full">
            <WidgetsPageSideComponent
              reftype={slidesRef}
              customPages={customPages}
              pageOrder={effectivePageOrder}
              // Pass through slide metadata from the template, augmented with any
              // in-memory custom pages so newly added pages appear immediately in
              // the sidebar even before a full save/refresh round-trip.
              slidesMeta={(() => {
                const base =
                  (templateQuery.data?.slidesMeta as ReportSlideMeta[] | undefined) ??
                  [];
                if (!customPages.length) {
                  return base;
                }
                const existingIds = new Set(base.map((s) => s.id));
                const extras = customPages
                  .filter((p) => !existingIds.has(p.id))
                  .map((p) => ({
                    id: p.id,
                    title: p.name,
                    subtitle: p.subtitle,
                    source: "custom" as const,
                  }));
                return [...base, ...extras];
              })()}
              onDeletePage={handleDeletePage}
              onAddPage={addCustomPage}
              onReorderPages={handleReorderPages}
              onRenamePage={handleRenamePage}
            />
          </div>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto bg-gray-100 flex flex-col items-center h-[calc(100vh-(var(--rb-header)+var(--rb-subheader)))] px-2 md:px-0">
          {effectivePageOrder.map((id, pageIndex) => {
            const layout = dashboards.get(id);
            if (!layout) return null;

            // Format date range for display
            const formatDateRange = () => {
              if (!dateRange?.from && !dateRange?.to) {
                return undefined;
              }
              if (dateRange.from && dateRange.to) {
                return `${format(dateRange.from, "MMM d, yyyy")} - ${format(
                  dateRange.to,
                  "MMM d, yyyy"
                )}`;
              }
              if (dateRange.from) {
                return `From ${format(dateRange.from, "MMM d, yyyy")}`;
              }
              if (dateRange.to) {
                return `Until ${format(dateRange.to, "MMM d, yyyy")}`;
              }
              return undefined;
            };

            // Get slide title - prefer slide metadata from the template so that
            // the main slide header matches the Pages sidebar. Fall back to
            // custom page names, then integration names, and finally a neutral
            // "Untitled page" label.
            const slideMeta = templateQuery.data?.slidesMeta?.find(
              (s) => s.id === id
            );
            let slideTitle: string;
            let slideSubtitle: string | undefined;

            if (slideMeta) {
              slideTitle = slideMeta.title;
              slideSubtitle = slideMeta.subtitle;
            } else {
              const customPage = customPages.find((p) => p.id === id);
              if (customPage) {
                slideTitle = customPage.name;
                slideSubtitle = customPage.subtitle;
              } else {
                const integration = integrationsData?.integrations?.[pageIndex];
                if (integration) {
                  const platformConfig = getPlatformConfig(integration.platform);
                  slideTitle = platformConfig?.name || integration.platform;
                  slideSubtitle = integration.accountName;
                } else {
                  slideTitle = "Untitled page";
                }
              }
            }

            // Combine title and subtitle for display
            const displayTitle = slideSubtitle
              ? `${slideTitle} - ${slideSubtitle}`
              : slideTitle;

            return (
              <SlideContainer
                key={id}
                id={`slide-${id}`}
                title={displayTitle}
                dateRange={formatDateRange()}
                containerRef={(el) => {
                  slidesRef.current[id] = el; // Use slide ID instead of loop index
                }}
              >
                {layout.length === 0 ? (
                  /* Empty State - Still accepts drops */
                  <div className="relative w-full min-h-[500px]">
                    <AutoWidthGrid
                      className="layout w-full h-full"
                      layout={[]}
                      cols={currentGridConfig.cols}
                      rowHeight={currentGridConfig.rowHeight}
                      autoSize={false}
                      margin={currentGridConfig.margin}
                      containerPadding={isTablet ? [8, 8] : [14, 14]}
                      isDroppable={true}
                      isDraggable={false}
                      compactType={null}
                      onDrop={(layoutArr, layoutItem, e) =>
                        handleDrop(layoutArr, layoutItem, e as DragEvent, id)
                      }
                      onLayoutChange={createLayoutChangeHandler(id, layout)}
                      style={{ minHeight: "500px" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                          Start Building Your Report
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-4 max-w-xs sm:max-w-sm mx-auto">
                          Drag and drop widgets from the right sidebar to create
                          your custom report
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                          <span className="hidden sm:inline">
                            Try dragging a metric from Integrations
                          </span>
                          <span className="sm:hidden">
                            Drag from Integrations
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <AutoWidthGrid
                    className="layout"
                    layout={layout}
                    cols={currentGridConfig.cols}
                    rowHeight={currentGridConfig.rowHeight}
                    autoSize={true}
                    margin={currentGridConfig.margin}
                    containerPadding={isTablet ? [8, 8] : [14, 14]}
                    isDroppable={true}
                    isDraggable={true}
                    compactType={null}
                    draggableHandle=".drag-handle"
                    draggableCancel=".non-draggable"
                    onDrop={(layoutArr, layoutItem, e) =>
                      handleDrop(layoutArr, layoutItem, e as DragEvent, id)
                    }
                    onLayoutChange={createLayoutChangeHandler(id, layout)}
                  >
                    {layout.map((widget) => {
                      const dataKey = widget.metricConfig?.id ?? widget.i;
                      const widgetResolvedData: ResolvedWidgetData | undefined =
                        resolvedWidgets[dataKey];
                      return (
                        <div
                          key={widget.i}
                          ref={createWidgetRefCallback(id, widget.i)}
                        >
                          <WidgetCard
                            widget={widget}
                            onContentClick={createWidgetClickHandler(id)}
                      onDelete={() => handleDeleteWidget(id, widget.i)}
                          >
                            {renderWidgetContent(widget, widgetResolvedData, {
                              isLoading:
                                isResolvingWidgets && !widgetResolvedData,
                              onConnectIntegration: handleConnectIntegration,
                            })}
                          </WidgetCard>
                        </div>
                      );
                    })}
                  </AutoWidthGrid>
                )}
              </SlideContainer>
            );
          })}
        </div>

        {/* Right Sidebar */}
        <div className="sticky top-[calc(var(--rb-header)+var(--rb-subheader))] right-0 flex  border-l h-[calc(100vh-(var(--rb-header)+var(--rb-subheader)))] overflow-y-visible z-20">
          <div
            className={`${
              rightPanelTitle !== ""
                ? "w-48 md:w-56 lg:w-[16.25rem]"
                : "w-0 overflow-hidden"
            } h-full transition-all duration-300`}
          >
            <div className="w-full p-3 md:p-4 border-b font-semibold text-sm md:text-base text-accent-foreground">
              {rightPanelTitle}
            </div>

            {rightPanelContent}
          </div>

          <div
            className={`${
              widgetFormState.widgetType !== ""
                ? "w-48 md:w-56 lg:w-[16.25rem]"
                : "w-0 overflow-hidden"
            } h-full transition-all duration-300`}
          >
            {widgetFormSections}
          </div>

          <ReportElements
            setRightPanelTitle={setRightPanelTitle}
            setWidgetFormState={setWidgetFormState}
          />
        </div>
      </div>
    </div>
  );
}

export default ReportBuilder;
