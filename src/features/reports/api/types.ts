import type { AxiosError } from "axios";
import type { Layout } from "react-grid-layout";
import type { ReportWidgetType } from "../../../components/reportTypes";





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
  id?: number;
  userId?: number;
  integration: string;
  accountId: string;
  metricKey: string;
  dimensionType?: string;
  dimensionValue?: string;
  date: string;
  value: number;
  extra?: Record<string, unknown>;
  recordedAt?: string;
}

export type DebugMetricsResponse = ApiSuccessResponse<{
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  rows: DebugMetric[];
}>;

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
    rows?: unknown[];
  }
  | Record<string, unknown>;


export interface ReportWidgetDefinition {
  id: string;
  metricKey: string;
  integration: string;
  groupBy: "none" | "day" | "week" | "month" | string;
  aggregation: "sum" | "avg" | "min" | "max" | string;
  type?: string;
  displayName?: string;
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

  /**
   * Data snapshot for shared reports, hydrated from the API response.
   * This allows the builder to render data without refetching when in read-only/shared mode.
   */
  snapshotData?: any;
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
  /**
   * For integration slides, the index in the integrations array.
   */
  integrationIndex?: number;
  /**
   * Optional sort order used by the sidebar.
   */
  sortOrder?: number;
  /**
    * For multi-slide templates, which slide index (0-based) this page represents.
    */
  subSlideIndex?: number;
  metadata?: {
    integrationIndex?: number;
    originalSource?: string;
  };
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
  datePreset?: string;
  // Optional page order for multi-slide reports
  pageOrder?: number[];
  // Optional slide metadata (titles/subtitles) for each logical page.
  slidesMeta?: ReportSlideMeta[];
  clientId?: number;
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
  clientId?: number;
  client_id?: number;
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
   * Source of the slide: 'integration' for auto-generated slides, 'custom' for user-created pages
   */
  source?: "integration" | "custom";
  /**
   * Optional sort order from the backend. We primarily rely on pageOrder.
   */
  sortOrder?: number;
  widgets: ApiReportTemplateWidget[];
  metadata?: {
    integrationIndex?: number;
    originalSource?: string;
    frontendId?: number;
  };
}

export interface ApiReportTemplate {
  id: number;
  userId: number;
  name: string;
  description?: string;
  defaultDateFrom?: string;
  defaultDateTo?: string;
  datePreset?: string;
  /**
   * New backend field that stores logical page ordering.
   */
  pageOrder?: number[];
  slides: ApiReportTemplateSlide[];
  widgets?: ApiReportTemplateWidget[]; // Flat array sometimes returned by backend
  createdAt?: string;
  updatedAt?: string;
  clientId?: number;
  client_id?: number;
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
  // Optional preset name (e.g. "Last 30 Days") to allow dynamic date calculation
  datePreset?: string;
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
  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;
  createdAt: string;
  clientId?: number;
  client_id?: number;
}

export interface CreateReportSchedulePayload {
  templateId: number;
  name: string;
  description?: string;
  frequency: ReportScheduleFrequency;
  timezone: string;
  timeOfDay: string;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  sendEmail: boolean;
  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;
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
  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;
}

export type ReportScheduleResponse = ApiSuccessResponse<{
  data: ReportSchedule;
}>;

export type ListReportSchedulesResponse = ApiSuccessResponse<{
  data: ReportSchedule[];
}>;

export type GetReportScheduleResponse = ApiSuccessResponse<{
  data: ReportSchedule & {
    template: { id: number; name: string };
    runLogs: {
      id: number;
      status: string;
      startedAt: string;
      finishedAt?: string;
      generatedReport?: { id: number; fileName: string };
    }[];
  };
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
  // type is optional in older definitions but we should standardize
  type?: "line_chart" | "area_chart" | "bar_chart" | "metric_card" | string;
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
  clientId?: number;
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


export interface MetaPost {
  id: string;
  userId: number;
  clientId: number;
  pageId: string;
  message?: string;
  createdTime: string;
  fullPicture?: string;
  permalinkUrl?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  reactions?: number;
  impressions?: number | null;
  clicks?: number | null;
  reach?: number | null;
  lastSyncedAt?: string;
}

export type MetaStoredPostsResponse = ApiSuccessResponse<{
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  posts: MetaPost[];
}>;

export interface InstagramMedia {
  id: string;
  userId: number;
  clientId: number | null;
  instagramBusinessId: string;
  caption: string | null;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS';
  timestamp: string; // ISO 8601
  mediaUrl: string | null;
  permalinkUrl: string | null;
  likeCount: number;
  commentsCount: number;
  views: number | null;
  reach: number | null;
  shares: number | null;
  saved: number | null;
  totalInteractions: number | null;
  follows: number | null;
  profileVisits: number | null;
  lastSyncedAt: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface InstagramMediaResponse {
  success: boolean;
  count: number;
  media: InstagramMedia[];
}

// Meta Ads Campaign Performance
export interface MetaAdsCampaignRow {
  campaignName: string;
  adName: string;
  adsetName: string;
  clicks: number;
  impressions: number;
  cpc: number;
  ctr: number;
}

export interface MetaAdsCampaignPerformanceResponse {
  success: boolean;
  rows: MetaAdsCampaignRow[];
}

// Google Ads Campaign Performance
export interface GoogleAdsCampaignRow {
  name: string;
  status: string;
  cost: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  roas: number;
}

export interface GoogleAdsCampaignPerformanceResponse {
  success: boolean;
  rows: GoogleAdsCampaignRow[];
}

// Moved from ReportBuilder.tsx - Shared types for Store
export interface DashboardLayout extends Layout {
  widgetType: ReportWidgetType; // ReportWidgetType (string union)

  data?: any; // WidgetData
  metricConfig?: ReportWidgetDefinition;
  snapshotData?: Record<string, any>;
}


export interface CustomPage {
  id: number;
  name: string;
  subtitle?: string;
}

export type DashboardMap = Map<number, DashboardLayout[]>;


