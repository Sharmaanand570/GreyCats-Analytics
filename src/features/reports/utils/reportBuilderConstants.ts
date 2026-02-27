import { type ReportWidgetType } from "@/components/reportTypes";
import type { WidgetData } from "@/components/widgetTypes";
import type { ReportWidgetDefinition } from "@/features/reports/api/types";
import { reportTableRows } from "@/components/reportConstants";
import { getReportStatusBadgeClass } from "@/utils/statusColors";

// Chart color palette
export const COLORS = ['#c55df6', '#c46df7', '#c37df8', '#c18cf9', '#c09cfa', '#bfacfb', '#bccbfd'];

// Grid constants
export const GRID_CONFIG = {
  cols: 12,
  rowHeight: 80,
  width: 1200,
  margin: [16, 16] as [number, number],
} as const;

// Tablet grid config
export const TABLET_GRID_CONFIG = {
  cols: 8,
  rowHeight: 80,
  margin: [12, 12] as [number, number],
} as const;

export const DEFAULT_WIDGET_SIZE = {
  w: 4,
  h: 4,
} as const;

// Default widget data generators
export const getDefaultWidgetData = (
  widgetType: ReportWidgetType
): WidgetData | undefined => {
  switch (widgetType) {
    case "title":
      return { text: "performance title", fontSize: "2xl", align: "center" };
    case "table":
      return {
        title: "New Table",
        caption: "Enter a caption",
        rows: [
          { name: "Row 1", value: "Value 1" },
          { name: "Row 2", value: "Value 2" },
        ],
        columns: [
          { name: "Name", width: "50%" },
          { name: "Value" },
        ],
      };
    case "chart":
      return { chartType: "column" };
    case "map":
      return { location: "Default Location", zoom: 10 };
    case "metric":
      return { label: "Metric", value: 0, hideDataPoints: true };
    case "image":
      return { src: "", alt: "Image" };
    case "embed":
      return { url: "", type: "iframe" };
    case "custom":
      return {
        content: "Enter your text here...",
        type: "text",
        title: "",
        align: "left",
        backgroundColor: "",
        textColor: "",
      };
    default:
      return undefined;
  }
};

// Empty default template - users start with a blank canvas
export const DEFAULT_TEMPLATE_WIDGETS: ReportWidgetDefinition[] = [];

// Feature flag: Set to false to disable auto-population of default widgets
export const ENABLE_AUTO_DEFAULT_WIDGETS = true;

// Sidebar widget item definitions
export const widgetItems: {
  title: string;
  description: string;
  type: ReportWidgetType;
  customKind?: string;
}[] = [
    {
      title: "Textbox",
      description: "textbox you can design",
      type: "custom",
      customKind: "text"
    },
    { title: "Title", description: "Organize using title", type: "title" },
    {
      title: "Table of Contents",
      description: "Table of contents for your report",
      type: "custom",
      customKind: "toc",
    },
    {
      title: "Tasks",
      description: "Highlight completed tasks",
      type: "custom",
      customKind: "tasks",
    },
    {
      title: "Table",
      description: "Create a data table",
      type: "table",
    },
  ];

export const customMetricItems: {
  title: string;
  description: string;
  type: ReportWidgetType;
}[] = [
    { title: "Stat", description: "Manual metric with trends", type: "metric" },
  ];

export const imageWidgetItems: {
  title: string;
  description: string;
  type: ReportWidgetType;
}[] = [
    { title: "Image", description: "Add any image you like", type: "image" },
  ];

export const embedWidgetItems: {
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
export const getStatusBadgeClass = (
  status: (typeof reportTableRows)[number]["status"]
) => {
  return getReportStatusBadgeClass(status);
};
