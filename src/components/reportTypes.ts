export const REPORT_ELEMENT_MIME_TYPE = "application/greycats-report-widget";

export type ReportWidgetType =
  | "chart"
  | "line_chart"
  | "area_chart"
  | "bar_chart"
  | "pie_chart"
  | "map"
  | "table"
  | "metric"
  | "image"
  | "embed"
  | "custom"
  | "title";
