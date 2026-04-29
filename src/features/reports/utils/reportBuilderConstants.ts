import { type ReportWidgetType } from "@/components/reportTypes";
import type {
  WidgetData,
  ImageWidgetData,
  CustomWidgetData,
} from "@/components/widgetTypes";
import type {
  CreateTemplatePayload,
  DashboardLayout,
  ReportSlideMeta,
  ReportWidgetDefinition,
} from "@/features/reports/api/types";
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

// Reserved slide IDs for the seeded "Cover" and "Table of Contents" pages on
// brand-new templates. They sit well above the integration range (0–999) and
// the runtime custom-page range (1000+) so they never collide.
export const COVER_SLIDE_ID = 9001;
export const TOC_SLIDE_ID = 9002;

export interface DefaultSlideSeed {
  id: number;
  meta: ReportSlideMeta;
  widgets: DashboardLayout[];
}

export const buildDefaultCoverSlide = (
  companyName?: string,
  subheading?: string
): DefaultSlideSeed => {
  const id = COVER_SLIDE_ID;
  const ts = Date.now();
  const imageWidget: DashboardLayout = {
    i: `default-cover-image-${ts}`,
    x: 0,
    y: 0,
    w: 6,
    h: 6,
    widgetType: "image",
    data: {
      src: "",
      alt: "Logo",
      imageFit: "contain",
    } as ImageWidgetData,
  };
  const textWidget: DashboardLayout = {
    i: `default-cover-text-${ts + 1}`,
    x: 6,
    y: 0,
    w: 6,
    h: 6,
    widgetType: "custom",
    data: {
      content: `**${companyName ?? "Performance Report"}**\n\n${subheading ?? "Subheading"}`,
      type: "text",
      align: "left",
      fontSize: "text-2xl",
      fontWeight: "font-bold",
    } as CustomWidgetData,
  };
  return {
    id,
    meta: {
      id,
      title: "Cover",
      subtitle: companyName ?? "Performance Report",
      source: "custom",
    },
    widgets: [imageWidget, textWidget],
  };
};

export const buildDefaultTocSlide = (): DefaultSlideSeed => {
  const id = TOC_SLIDE_ID;
  const tocWidget: DashboardLayout = {
    i: `default-toc-${Date.now()}`,
    x: 0,
    y: 0,
    w: 12,
    h: 8,
    widgetType: "custom",
    data: {
      content: "",
      type: "toc",
      autoPopulate: true,
      align: "left",
      fontSize: "text-sm",
    } as CustomWidgetData,
  };
  return {
    id,
    meta: {
      id,
      title: "Table of Contents",
      subtitle: "Overview",
      source: "custom",
    },
    widgets: [tocWidget],
  };
};

// Convert a DashboardLayout (UI form) to the wire format used by
// CreateTemplatePayload.widgets. Mirrors the shape produced inside
// buildTemplatePayloadFromDashboards in ReportBuilder.tsx for non-metric
// widgets so the round-trip through the backend hydrates correctly.
const layoutToPayloadWidget = (
  w: DashboardLayout,
  slideId: number
): ReportWidgetDefinition => {
  return {
    id: w.i,
    metricKey: `__layout__.${w.widgetType}.${w.i}`,
    integration: "",
    groupBy: "none",
    aggregation: "sum",
    type: w.widgetType,
    layout: { slideId, x: w.x, y: w.y, w: w.w, h: w.h },
    widgetData: w.data as unknown,
    config: w.data as unknown,
    filters: { widgetData: w.data as unknown },
  } as ReportWidgetDefinition;
};

// Prepend the seeded "Cover" + "Table of Contents" slides to a CreateTemplate
// payload. Used during initial template creation so every brand-new template
// starts with these two pages. Existing templates are unaffected (this only
// runs in handleConfirmNewReport, never on subsequent saves).
export const prependDefaultSlides = (
  payload: CreateTemplatePayload,
  reportName: string,
  dateRange?: { from?: Date; to?: Date }
): CreateTemplatePayload => {
  const subheading = dateRange?.from && dateRange?.to
    ? `${dateRange.from.toLocaleDateString()} – ${dateRange.to.toLocaleDateString()}`
    : "Performance Overview";

  const cover = buildDefaultCoverSlide(reportName, subheading);
  const toc = buildDefaultTocSlide();

  const seedWidgets: ReportWidgetDefinition[] = [
    ...cover.widgets.map((w) => layoutToPayloadWidget(w, cover.id)),
    ...toc.widgets.map((w) => layoutToPayloadWidget(w, toc.id)),
  ];

  return {
    ...payload,
    widgets: [...seedWidgets, ...(payload.widgets ?? [])],
    slidesMeta: [cover.meta, toc.meta, ...(payload.slidesMeta ?? [])],
    pageOrder: [cover.id, toc.id, ...(payload.pageOrder ?? [])],
  };
};

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
