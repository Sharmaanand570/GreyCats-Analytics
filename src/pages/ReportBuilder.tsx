import { FiBell, FiSearch } from "react-icons/fi";
import { Button } from "../components/ui/button";
import { RadioButtonGroup } from "../components/RadioButtonGroup";
import WidgetsPageSideComponent from "../components/WidgetsPageSideComponent";
import ReportElements from "../components/ReportElements";
import TitleWidgetForm from "../components/TitleWidgetForm";
import ChartWidgetForm from "../components/ChartWidgetForm";
import TableWidgetForm from "../components/TableWidgetForm";
import ImageWidgetForm from "../components/ImageWidgetForm";
import EmbedWidgetForm from "../components/EmbedWidgetForm";
import { DateRangePicker } from "../components/DateRangePicker";
import { type DateRange } from "react-day-picker";
import { format } from "date-fns";

// Layout lib
import GridLayout, { type Layout, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// UI Components
import { ChartPieInteractive } from "../components/ChartPieInteractive";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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

const defaultLayout1: DashboardLayout[] = [
  {
    i: "chart",
    x: 0,
    y: 0,
    w: 5,
    h: 4,
    widgetType: "chart",
    data: getDefaultWidgetData("chart"),
  },
  {
    i: "map",
    x: 8,
    y: 0,
    w: 4,
    h: 3,
    widgetType: "map",
    data: getDefaultWidgetData("map"),
  },
  {
    i: "table1",
    x: 0,
    y: 4,
    w: 10,
    h: 3,
    widgetType: "table",
    data: getDefaultWidgetData("table"),
  },
  {
    i: "title",
    x: 0,
    y: 8, // Position below table (table occupies rows 4-6, so title starts at y: 7)
    w: 10,
    h: 1,
    widgetType: "title",
    data: getDefaultWidgetData("title"),
  },
];

const defaultLayout2: DashboardLayout[] = [
  {
    i: "table2",
    x: 0,
    y: 0,
    w: 10,
    h: 3,
    widgetType: "table",
    data: getDefaultWidgetData("table"),
  },
];

// Table Data moved to reportConstants.ts

const widgetItems: {
  title: string;
  description: string;
  type: ReportWidgetType;
}[] = [
  { title: "Stat", description: "type in any stat you choose", type: "metric" },
  { title: "Textbox", description: "textbox you can design", type: "title" },
  { title: "Title", description: "Organize using title", type: "title" },
  {
    title: "Table of Content",
    description: "Table of content for your report",
    type: "table",
  },
  { title: "Tasks", description: "Highlight completed tasks", type: "custom" },
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

// Helper: Render widget content with dynamic data
const renderWidgetContent = (widget: DashboardLayout) => {
  const widgetData = widget.data;

  switch (widget.widgetType) {
    case "chart": {
    
      return <ChartPieInteractive />;
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

      return (
        <Card className="h-full bg-white flex flex-col rounded-lg md:rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 md:pb-4 px-3 md:px-6 pt-3 md:pt-6">
            <CardTitle className="text-sm md:text-base">{title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-visible">
            <div className="w-full h-full overflow-x-auto">
              <Table className="w-full table-fixed text-xs md:text-sm">
                <TableCaption className="text-[10px] md:text-xs">{caption}</TableCaption>
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
                            <TableCell key={colIndex} className="truncate px-2 md:px-4">
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
          className={`h-full w-full flex items-center ${alignClass} hover:border bg-white text-xs md:text-sm text-gray-900 px-2`}
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
      return (
        <div className="h-full flex flex-col items-center justify-center text-xs md:text-sm px-2">
          <span className="text-2xl md:text-3xl font-bold text-gray-900">
            {metricData?.value ?? 0}
            {metricData?.unit && (
              <span className="text-base md:text-lg text-gray-600 ml-1">
                {metricData.unit}
              </span>
            )}
          </span>
          {metricData?.label && (
            <span className="text-gray-600 mt-1 md:mt-2 text-xs md:text-sm">{metricData.label}</span>
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
      return (
        <div
          className="h-full flex items-center justify-center text-xs md:text-sm text-gray-500 p-1 md:p-2"
          style={
            embedData?.backgroundColor
              ? { backgroundColor: embedData.backgroundColor }
              : undefined
          }
        >
          {embedData?.url ? (
            <iframe
              src={embedData.url}
              className="w-full h-full border-0 rounded"
              title={embedData.title || "Embedded content"}
            />
          ) : (
            <span className="text-center">Embed Placeholder</span>
          )}
        </div>
      );
    }

    case "custom": {
      const customData = widgetData as CustomWidgetData | undefined;
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
  const [dashboards, setDashboards] = useState<DashboardMap>(
    new Map([
      [0, defaultLayout1],
      [1, defaultLayout2],
    ])
  );
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const widgetRefs = useRef<Map<number, Map<string, HTMLDivElement>>>(
    new Map()
  );
  const [rightPanelTitle, setRightPanelTitle] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

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
  // Get dashboard IDs in order
  const dashboardIds = useMemo(
    () => Array.from(dashboards.keys()).sort((a, b) => a - b),
    [dashboards]
  );

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

      // ✅ Use defaults or fallbacks
      const { w, h } = WIDGET_SIZE_MAP[widgetType] ?? { w: 4, h: 3 };

      // 🧠 Use 0, not -1 — react-grid-layout handles y positioning automatically
      const newItem: DashboardLayout = {
        i: generateWidgetId("item"),
        x: widgetType !== "title" ? layoutItem?.x : 0,
        y: widgetType !== "title" ? layoutItem?.y : -1,
        w,
        h,
        widgetType,
        data: getDefaultWidgetData(widgetType),
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
    (e: React.DragEvent<HTMLDivElement>, widgetType: ReportWidgetType) => {
      e.dataTransfer.setData("widgetType", widgetType);
      e.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  // Memoize PDF export handler
  const handleExportPDF = useCallback(() => {
    exportAllSlidesToPDF(slidesRef.current);
  }, []);

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

  // Memoize right panel content
  const rightPanelContent = useMemo(() => {
    if (rightPanelTitle === "Content Blocks") {
      return (
        <div className="w-full h-full overflow-y-auto p-2 md:p-4">
          {widgetItems.map((item, index) => (
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
  }, [rightPanelTitle, handleDragStart]);
  // Detect if we're on tablet (using window width)
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
    };
    
    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  // Use appropriate grid config based on screen size
  const currentGridConfig = isTablet ? TABLET_GRID_CONFIG : GRID_CONFIG;

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Bar */}
      <div className="sticky z-50 top-0 py-3 md:py-[1.3em] bg-white border-b flex justify-between items-center px-3 md:px-5">
        <span className="font-medium text-lg md:text-xl">Report Builder</span>
        <div className="flex items-center gap-1 md:gap-2">
          <span className="mx-1 md:mx-2 text-base md:text-lg text-gray-500 cursor-pointer">
            <FiSearch />
          </span>
          <span className="mx-1 md:mx-2 text-base md:text-lg text-gray-500 cursor-pointer">
            <FiBell />
          </span>
          <span className="ml-2 md:ml-4">
            <Button className="rounded-[0.4rem] text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2">
              <span className="hidden md:inline">Edit Dashboard</span>
              <span className="md:hidden">Edit</span>
            </Button>
          </span>
        </div>
      </div>

      {/* Sub Header */}
      <div className="sticky z-40 top-[var(--rb-header)] py-2 md:py-[1.2em] bg-white border-b flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 md:gap-0 px-3 md:px-5">
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
            onClick={handleExportPDF}
            className="bg-accent-foreground text-white py-1.5 md:py-2 px-3 md:px-4 rounded-[0.6rem] text-xs md:text-sm hover:cursor-pointer whitespace-nowrap"
          >
            <span className="hidden md:inline">Download PDF</span>
            <span className="md:hidden">PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Left Sidebar */}
        <div className="sticky top-[calc(var(--rb-header)+var(--rb-subheader))] left-0 w-48 md:w-52 lg:w-[15.5rem] bg-white border-r h-[calc(100vh-(var(--rb-header)+var(--rb-subheader)))] overflow-y-auto transition-all duration-300 z-30">
          <div className="w-full h-full">
            <WidgetsPageSideComponent reftype={slidesRef} />
          </div>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto bg-gray-100 flex flex-col items-center h-[calc(100vh-(var(--rb-header)+var(--rb-subheader)))] px-2 md:px-0">
          {dashboardIds.map((id, i) => {
            const layout = dashboards.get(id);
            if (!layout) return null;

            // Format date range for display
            const formatDateRange = () => {
              if (!dateRange?.from && !dateRange?.to) {
                return undefined;
              }
              if (dateRange.from && dateRange.to) {
                return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
              }
              if (dateRange.from) {
                return `From ${format(dateRange.from, "MMM d, yyyy")}`;
              }
              if (dateRange.to) {
                return `Until ${format(dateRange.to, "MMM d, yyyy")}`;
              }
              return undefined;
            };

            return (
              <SlideContainer
                key={id}
                id={`slide-${id}`}
                title={`Slide #${id + 1}`}
                dateRange={formatDateRange()}
                containerRef={(el) => {
                  slidesRef.current[i] = el;
                }}
              >
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
                  {layout.map((widget) => (
                    <div
                      key={widget.i}
                      ref={createWidgetRefCallback(id, widget.i)}
                    >
                      <WidgetCard
                        widget={widget}
                        onContentClick={createWidgetClickHandler(id)}
                      >
                        {renderWidgetContent(widget)}
                      </WidgetCard>
                    </div>
                  ))}
                </AutoWidthGrid>
              </SlideContainer>
            );
          })}
        </div>

        {/* Right Sidebar */}
        <div className="sticky top-[calc(var(--rb-header)+var(--rb-subheader))] right-0 flex bg-white border-l h-[calc(100vh-(var(--rb-header)+var(--rb-subheader)))] overflow-y-visible z-20">
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