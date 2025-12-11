import { type ReportWidgetType } from "./reportTypes";

// Mock table data
export type ReportTableRow = {
  name: string;
  audience: string;
  status: "Draft" | "Scheduled" | "Delivered";
  lastRun: string;
  nextSend: string;
};

export const reportTableRows: ReportTableRow[] = [
  {
    name: "Weekly Marketing Performance",
    audience: "Acme Co.",
    status: "Scheduled",
    lastRun: "Nov 3, 2025",
    nextSend: "Nov 10, 2025",
  },
  {
    name: "E-commerce Conversion Overview",
    audience: "Globex Retail",
    status: "Delivered",
    lastRun: "Nov 6, 2025",
    nextSend: "Nov 13, 2025",
  },
  {
    name: "Paid Media Attribution",
    audience: "Initech",
    status: "Scheduled",
    lastRun: "Nov 2, 2025",
    nextSend: "Nov 9, 2025",
  },
  {
    name: "Executive KPI Summary",
    audience: "Stark Industries",
    status: "Draft",
    lastRun: "—",
    nextSend: "Nov 15, 2025",
  },
];

// Widget size map for react-grid-layout
export const WIDGET_SIZE_MAP: Record<ReportWidgetType, { w: number; h: number }> = {
  title: { w: 12, h: 2 },
  table: { w: 6, h: 6 },
  chart: { w: 6, h: 5 },
  line_chart: { w: 8, h: 5 },
  area_chart: { w: 8, h: 5 },
  bar_chart: { w: 6, h: 5 },
  pie_chart: { w: 4, h: 5 },
  image: { w: 4, h: 4 },
  custom: { w: 6, h: 4 },
  map: { w: 6, h: 5 },
  metric: { w: 3, h: 3 },
  embed: { w: 8, h: 6 },
};

// Simple ID generator; replace with nanoid if needed
let widgetIdCounter = 0;
export function generateWidgetId(prefix: string = "item"): string {
  widgetIdCounter += 1;
  return `${prefix}-${Date.now()}-${widgetIdCounter.toString(36)}`;
}

 