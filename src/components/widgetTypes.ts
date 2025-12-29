// Widget Data Types
export interface TitleWidgetData {
  text: string;
  fontSize?: string;
  align?: "left" | "center" | "right";
  color?: string;
  backgroundColor?: string;
  padding?: string; // e.g., "16px", "1rem", "20px 40px"
}

export type ReportTableRow = {
  name: string;
  audience: string;
  status: "Draft" | "Scheduled" | "Delivered";
  lastRun: string;
  nextSend: string;
};

export interface TableWidgetData {
  title: string;
  caption?: string;
  rows: ReportTableRow[];
  columns?: {
    name: string;
    width?: string;
  }[];
}

export interface ChartWidgetData {
  chartType?: string;
  data?: unknown;
  chartImageUrl?: string; // Base64 image URL from html2canvas conversion
}

export interface MapWidgetData {
  location?: string;
  zoom?: number;
  widgetImageUrl?: string; // Base64 image URL from html2canvas conversion
}

export interface MetricWidgetData {
  label: string;
  value: string | number;
  unit?: string;
  comparisonValue?: string | number; // e.g. "Previous Month: 120"
  trendValue?: string; // e.g. "12%"
  trendDirection?: "up" | "down" | "neutral";
  widgetImageUrl?: string; // Base64 image URL from html2canvas conversion
}

export interface ImageWidgetData {
  src: string;
  alt?: string;
  imageFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  backgroundColor?: string;
}

export interface EmbedWidgetData {
  url: string;
  type?: "url" | "iframe";
  title?: string;
  backgroundColor?: string;
}

export interface CustomWidgetData {
  content: string;
  type?: string; // e.g. "tasks", "ai-summary", "toc", "text"
  title?: string;
  align?: "left" | "center" | "right";
  backgroundColor?: string;
  textColor?: string;
}

// Union type for all widget data
export type WidgetData =
  | TitleWidgetData
  | TableWidgetData
  | ChartWidgetData
  | MapWidgetData
  | MetricWidgetData
  | ImageWidgetData
  | EmbedWidgetData
  | CustomWidgetData;
