import type { AxiosError } from "axios";

export type ApiSuccessResponse<T> = {
  success: true;
} & T;

export type ApiFailureResponse = {
  success: false;
  message?: string;
  error?: string;
};

export type ApiError = {
  message: string;
  status?: number;
  cause?: unknown;
};

export interface DebugMetric {
  id: number;
  userId: number;
  integration: string;
  accountId: string;
  metricKey: string;
  date: string;
  value: number;
  extra?: Record<string, unknown>;
  recordedAt?: string;
}

export type DebugMetricsResponse = ApiSuccessResponse<{
  count: number;
  rows: DebugMetric[];
}>;

export interface ResolveWidgetsPayload {
  dateFrom: string;
  dateTo: string;
  widgets: Array<{
    id: string;
    type: string;
    metricKey: string;
    groupBy?: string;
    aggregation?: string;
    integration?: string;
    accountId?: string;
    [key: string]: unknown;
  }>;
}

export interface WidgetSeriesPoint {
  x: string;
  y: number;
}

export type ResolvedWidgetData =
  | {
      series?: WidgetSeriesPoint[];
      total?: number;
      value?: number;
      rawCount?: number;
    }
  | Record<string, unknown>;

export type ResolveWidgetsResponse = ApiSuccessResponse<{
  data: Record<string, ResolvedWidgetData>;
}>;

export interface ReportWidgetDefinition {
  id: string;
  metricKey: string;
  integration: string;
  groupBy: "none" | "day" | "week" | "month" | string;
  aggregation: "sum" | "avg" | "min" | "max" | string;
  type?: string;
  accountId?: string;
  /**
   * Arbitrary filters that affect how the metric is resolved.
   * Mirrors the backend `filters` object on widgets.
   */
  filters?: Record<string, unknown>;
  layout?: {
    /**
     * Logical slide/page identifier in the builder.
     * This is mapped to the backend slide model.
     */
    slideId?: number;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  [key: string]: unknown;
}

// Lightweight metadata about each slide/page in a template, derived from the
// backend slides array. This is used by the UI to show stable page titles.
export interface ReportSlideMeta {
  id: number;
  title: string;
  subtitle?: string;
  /**
   * Optional source for this slide, used only on the frontend to distinguish
   * between integration-derived pages and user-created custom pages.
   */
  source?: "integration" | "custom";
}

// Full template shape used by the Report Builder UI
export interface ReportTemplate {
  id: number;
  userId: number;
  name: string;
  description?: string;
  // Full widget definitions used by the builder. This is derived from the
  // backend's slide-based representation and may be omitted in list endpoints.
  widgets?: ReportWidgetDefinition[];
  createdAt?: string;
  updatedAt?: string;
  // Optional default date range to use when loading this template
  defaultDateFrom?: string;
  defaultDateTo?: string;
  // Optional page order for multi-slide reports
  pageOrder?: number[];
  // Optional slide metadata (titles/subtitles) for each logical page.
  slidesMeta?: ReportSlideMeta[];
}

// Lightweight summary used by the list endpoint
export interface ReportTemplateSummary {
  id: number;
  name: string;
  defaultDateFrom?: string;
  defaultDateTo?: string;
  createdAt?: string;
  /**
   * Optional stored page order for this template.
   * Present in the new backend contract.
   */
  pageOrder?: number[];
}

export type ListTemplatesResponse = ApiSuccessResponse<{
  templates: ReportTemplateSummary[];
  count?: number;
}>;

// Raw API template types that mirror the backend "slides + widgets" contract
export interface ApiReportTemplateWidget {
  id?: string | number;
  widgetKey?: string;
  type?: string;
  metricKey?: string;
  integration?: string;
  accountId?: string;
  groupBy?: string;
  aggregation?: string;
  layout?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  /**
   * Backend-side filters bag, mirrored onto the UI widget definition.
   */
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ApiReportTemplateSlide {
  id?: number;
  title: string;
  subtitle?: string;
  /**
   * Optional sort order from the backend. We primarily rely on pageOrder.
   */
  sortOrder?: number;
  widgets: ApiReportTemplateWidget[];
}

export interface ApiReportTemplate {
  id: number;
  userId: number;
  name: string;
  description?: string;
  defaultDateFrom?: string;
  defaultDateTo?: string;
  /**
   * New backend field that stores logical page ordering.
   */
  pageOrder?: number[];
  slides: ApiReportTemplateSlide[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTemplatePayload {
  name: string;
  /**
   * Optional description visible in template detail responses.
   */
  description?: string;
  widgets: ReportWidgetDefinition[];
  // Optional default date range to persist with the template
  defaultDateFrom?: string;
  defaultDateTo?: string;
  // Optional page order for multi-slide reports
  pageOrder?: number[];
  /**
   * Optional slide metadata (titles/subtitles) to use when reconstructing
   * the backend "slides" payload. This is not sent directly to the backend;
   * instead it is used to preserve human-readable slide names.
   */
  slidesMeta?: ReportSlideMeta[];
}

export type CreateTemplateResponse = ApiSuccessResponse<{
  template: ApiReportTemplate;
}>;

export type UpdateTemplatePayload = CreateTemplatePayload;

export type GetTemplateResponse = ApiSuccessResponse<{
  template: ReportTemplate;
}>;

export interface RunReportPayload {
  templateId: number;
  dateFrom: string;
  dateTo: string;
}

export type RunReportResponse = ApiSuccessResponse<{
  data: Record<string, ResolvedWidgetData>;
  meta?: {
    templateId: number;
    from: string;
    to: string;
    widgetsResolved: number;
  };
}>;

export interface GeneratePdfPayload {
  templateId: number;
  dateFrom: string;
  dateTo: string;
}

export type GeneratePdfResponse = ApiSuccessResponse<{
  fileUrl: string;
  record: {
    id: number;
    templateId: number;
    userId: number;
    fileUrl: string;
    createdAt: string;
  };
}>;

export type DeleteTemplateResponse = ApiSuccessResponse<{
  message: string;
}>;

// Report schedule types
export type ReportScheduleFrequency = "daily" | "weekly" | "monthly";

export interface ReportSchedule {
  id: number;
  userId: number;
  templateId: number;
  name: string;
  description?: string;
  frequency: ReportScheduleFrequency;
  timezone: string;
  timeOfDay: string;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  isActive: boolean;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  sendEmail: boolean;
  createdAt: string;
}

export interface CreateReportSchedulePayload {
  templateId: number;
  name: string;
  description?: string;
  frequency: ReportScheduleFrequency;
  timezone: string;
  timeOfDay: string;
  sendEmail: boolean;
}

export interface UpdateReportSchedulePayload {
  name?: string;
  description?: string;
  frequency?: ReportScheduleFrequency;
  timezone?: string;
  timeOfDay?: string;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  isActive?: boolean;
  sendEmail?: boolean;
}

export type ReportScheduleResponse = ApiSuccessResponse<{
  data: ReportSchedule;
}>;

export type ReportScheduleMessageResponse = ApiSuccessResponse<{
  message: string;
}>;

export type DashboardWidget = {
  id: string;
  metricKey: string;
  integration: string;
  accountId?: string;
  groupBy: string;
  aggregation: string;
  type?: string;
  source?: string;
  layout?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  filters?: Record<string, unknown>;
};

export interface Dashboard {
  id: number;
  userId: number;
  name: string;
  widgets: Record<string, DashboardWidget>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDashboardPayload {
  name: string;
  widgets: Record<string, DashboardWidget>;
}

export type CreateDashboardResponse = ApiSuccessResponse<{
  dashboard: Dashboard;
}>;

export type GetDashboardsResponse = ApiSuccessResponse<{
  dashboards: Dashboard[];
}>;

export type CloneDashboardResponse = ApiSuccessResponse<{
  dashboard: Dashboard;
}>;

export type AxiosApiError = AxiosError<ApiFailureResponse>;

export const buildApiError = (error: AxiosApiError): ApiError => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Unexpected error";

  return {
    message,
    status: error.response?.status,
    cause: error,
  };
};

