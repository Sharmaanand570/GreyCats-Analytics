import api from "@/apiConfig";
import type {
  ApiReportTemplate,
  ApiReportTemplateSlide,
  ApiReportTemplateWidget,
  CloneDashboardResponse,
  CreateDashboardPayload,
  CreateDashboardResponse,
  CreateTemplatePayload,
  CreateTemplateResponse,
  Dashboard,
  DebugMetricsResponse,
  GeneratePdfPayload,
  GeneratePdfResponse,
  GetDashboardsResponse,
  GetTemplateResponse,
  ListTemplatesResponse,
  ReportTemplate,
  ReportWidgetDefinition,
  ResolveWidgetsPayload,
  ResolveWidgetsResponse,
  RunReportPayload,
  RunReportResponse,
  UpdateTemplatePayload,
  DeleteTemplateResponse,
  CreateReportSchedulePayload,
  UpdateReportSchedulePayload,
  ReportScheduleResponse,
  ReportScheduleMessageResponse,
} from "./types";
import { buildApiError, type AxiosApiError } from "./types";

const handleRequest = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    const apiError = buildApiError(error as AxiosApiError);
    throw apiError;
  }
};

// Helpers to bridge between the backend "slides" model and the UI "widgets" model
const buildSlidesFromWidgets = (
  widgets: ReportWidgetDefinition[] | undefined,
  slidesMeta?: ReportTemplate["slidesMeta"]
): ApiReportTemplateSlide[] => {
  if (!widgets || widgets.length === 0) return [];

  const slideMap = new Map<number, ApiReportTemplateSlide>();

  widgets.forEach((widget) => {
    const slideId = widget.layout?.slideId ?? 0;

    let slide = slideMap.get(slideId);
    if (!slide) {
      // Try to preserve any existing slide titles/subtitles using slidesMeta.
      const meta = slidesMeta?.find((s) => s.id === slideId);
      slide = {
        id: slideId,
        title: meta?.title ?? `Slide ${slideId + 1}`,
        ...(meta?.subtitle ? { subtitle: meta.subtitle } : {}),
        widgets: [],
      };
      slideMap.set(slideId, slide);
    }

    const widgetData = (widget as any).widgetData;

    const apiWidget: ApiReportTemplateWidget = {
      id: widget.id,
      type: widget.type,
      metricKey: widget.metricKey,
      integration: widget.integration,
      accountId: widget.accountId,
      groupBy: widget.groupBy,
      aggregation: widget.aggregation,
      layout: widget.layout
        ? {
            x: widget.layout.x,
            y: widget.layout.y,
            w: widget.layout.w,
            h: widget.layout.h,
          }
        : undefined,
      ...(widget.filters ? { filters: widget.filters } : {}),
      ...(widgetData ? { widgetData } : {}),
    };

    slide.widgets.push(apiWidget);
  });

  return Array.from(slideMap.values()).sort(
    (a, b) => (a.id ?? 0) - (b.id ?? 0)
  );
};

const mapApiTemplateToReportTemplate = (
  apiTemplate: ApiReportTemplate
): ReportTemplate => {
  const widgets: ReportWidgetDefinition[] = [];
  // Prefer explicit backend pageOrder if present; otherwise derive from slides.
  let pageOrder: number[] = Array.isArray(apiTemplate.pageOrder)
    ? [...apiTemplate.pageOrder]
    : [];

  const slidesMeta: ReportTemplate["slidesMeta"] = [];

  apiTemplate.slides.forEach((slide, slideIndex) => {
    const slideId = slide.id ?? slideIndex;

    if (!pageOrder.length) {
      pageOrder.push(slideId);
    }

    slidesMeta.push({
      id: slideId,
      title: slide.title,
      subtitle: slide.subtitle,
      // By default, treat API-provided slides as integration-based; the
      // builder can later override to "custom" when users add their own pages.
      source: "integration",
    });

    slide.widgets.forEach((w, widgetIndex) => {
      const widgetId =
        (w.widgetKey as string | undefined) ??
        (typeof w.id === "string" || typeof w.id === "number"
          ? String(w.id)
          : `${slideId}-${widgetIndex}`);

      const layout = w.layout
        ? {
            slideId,
            x: w.layout.x,
            y: w.layout.y,
            w: w.layout.w,
            h: w.layout.h,
          }
        : {
            slideId,
            x: 0,
            y: 0,
            w: 4,
            h: 3,
          };

      const filters = (w.filters ?? {}) as Record<string, unknown>;
      const widgetData =
        (w as any).widgetData ?? (filters.widgetData as unknown);

      widgets.push({
        id: widgetId,
        metricKey: w.metricKey ?? "",
        integration: w.integration ?? "",
        groupBy: (w.groupBy as string | undefined) ?? "none",
        aggregation: (w.aggregation as string | undefined) ?? "sum",
        type: w.type,
        accountId: w.accountId,
        layout,
        ...(w.filters ? { filters: w.filters } : {}),
        ...(widgetData ? { widgetData } : {}),
      });
    });
  });

  return {
    id: apiTemplate.id,
    userId: apiTemplate.userId,
    name: apiTemplate.name,
    description: apiTemplate.description,
    widgets,
    createdAt: apiTemplate.createdAt,
    updatedAt: apiTemplate.updatedAt,
    defaultDateFrom: apiTemplate.defaultDateFrom,
    defaultDateTo: apiTemplate.defaultDateTo,
    pageOrder,
    slidesMeta,
  };
};

export const fetchDebugMetrics = (limit?: number) =>
  handleRequest(async () => {
    const response = await api.get<DebugMetricsResponse>(
      "/unified-metrics/debug/list",
      {
        params: limit ? { limit } : undefined,
      }
    );
    console.log("response fetchDebugMetrics", response.data);
    return response.data;
  });

export const resolveMetricWidgets = (payload: ResolveWidgetsPayload) =>
  handleRequest(async () => {
    const response = await api.post<ResolveWidgetsResponse>(
      "/unified-metrics/resolve",
      payload
    );
    return response.data;
  });

export const createReportTemplate = (payload: CreateTemplatePayload) =>
  handleRequest(async () => {
    const slides = buildSlidesFromWidgets(payload.widgets, payload.slidesMeta);

    const body = {
      name: payload.name,
      description: payload.description,
      defaultDateFrom: payload.defaultDateFrom,
      defaultDateTo: payload.defaultDateTo,
      pageOrder: payload.pageOrder,
      slides,
    };

    const response = await api.post<CreateTemplateResponse>(
      "/report-templates",
      body
    );
    return response.data;
  });

export const getReportTemplate = (templateId: number) =>
  handleRequest(async () => {
    const response = await api.get<CreateTemplateResponse>(
      `/report-templates/${templateId}`
    );

    console.log("response getReportTemplate", response.data);

    const apiTemplate = response.data.template;
    const mapped: GetTemplateResponse = {
      success: true,
      template: mapApiTemplateToReportTemplate(apiTemplate),
    };

    return mapped;
  });

export const listReportTemplates = () =>
  handleRequest(async () => {
    const response = await api.get<ListTemplatesResponse>("/report-templates");
    return response.data;
  });

export const updateReportTemplate = (
  templateId: number,
  payload: UpdateTemplatePayload
) =>
  handleRequest(async () => {
    const slides = buildSlidesFromWidgets(payload.widgets, payload.slidesMeta);

    const body = {
      name: payload.name,
      description: payload.description,
      defaultDateFrom: payload.defaultDateFrom,
      defaultDateTo: payload.defaultDateTo,
      pageOrder: payload.pageOrder,
      slides,
    };

    const response = await api.put<CreateTemplateResponse>(
      `/report-templates/${templateId}`,
      body
    );

    console.log("response", response.data);
    return response.data;
  });

export const deleteReportTemplate = (templateId: number) =>
  handleRequest(async () => {
    const response = await api.delete<DeleteTemplateResponse>(
      `/report-templates/${templateId}`
    );
    return response.data;
  });

// Report schedules
export const createReportSchedule = (payload: CreateReportSchedulePayload) =>
  handleRequest(async () => {
    const response = await api.post<ReportScheduleResponse>(
      "/report-schedules",
      payload
    );
    return response.data;
  });

export const updateReportSchedule = (
  scheduleId: number,
  payload: UpdateReportSchedulePayload
) =>
  handleRequest(async () => {
    const response = await api.put<ReportScheduleMessageResponse>(
      `/report-schedules/${scheduleId}`,
      payload
    );
    return response.data;
  });

export const deleteReportSchedule = (scheduleId: number) =>
  handleRequest(async () => {
    const response = await api.delete<ReportScheduleMessageResponse>(
      `/report-schedules/${scheduleId}`
    );
    return response.data;
  });

export const runReport = (payload: RunReportPayload) =>
  handleRequest(async () => {
    const response = await api.post<RunReportResponse>("/report/run", payload);
    return response.data;
  });

export const generatePdf = (payload: GeneratePdfPayload) =>
  handleRequest(async () => {
    const response = await api.post<GeneratePdfResponse>(
      "/reportpdf/pdf",
      payload
    );
    return response.data;
  });

export const createDashboard = (payload: CreateDashboardPayload) =>
  handleRequest(async () => {
    const response = await api.post<CreateDashboardResponse>(
      "/dashboard",
      payload
    );
    return response.data;
  });

export const updateDashboard = (
  dashboardId: number,
  payload: CreateDashboardPayload
) =>
  handleRequest(async () => {
    const response = await api.put<CreateDashboardResponse>(
      `/dashboard/${dashboardId}`,
      payload
    );
    return response.data;
  });

export const getDashboard = (dashboardId: number) =>
  handleRequest(async () => {
    const response = await api.get<CreateDashboardResponse>(
      `/dashboard/${dashboardId}`
    );
    return response.data;
  });

export const listDashboards = () =>
  handleRequest(async () => {
    const response = await api.get<GetDashboardsResponse>("/dashboard");
    return response.data;
  });

export const cloneDashboard = (dashboardId: number) =>
  handleRequest(async () => {
    const response = await api.post<CloneDashboardResponse>(
      `/dashboard/${dashboardId}/clone`
    );
    return response.data;
  });

export const addDashboardWidget = (
  dashboardId: number,
  widget: Dashboard["widgets"][string]
) =>
  handleRequest(async () => {
    const response = await api.post<CreateDashboardResponse>(
      `/dashboard/${dashboardId}/widgets`,
      widget
    );
    return response.data;
  });

export const updateDashboardWidget = (
  dashboardId: number,
  widgetId: string,
  widget: Dashboard["widgets"][string]
) =>
  handleRequest(async () => {
    const response = await api.put<CreateDashboardResponse>(
      `/dashboard/${dashboardId}/widgets/${widgetId}`,
      widget
    );
    return response.data;
  });

export const reorderDashboardWidgets = (
  dashboardId: number,
  layouts: Array<{ id: string; layout: { x: number; y: number; w: number; h: number } }>
) =>
  handleRequest(async () => {
    const response = await api.patch<CreateDashboardResponse>(
      `/dashboard/${dashboardId}/widgets/reorder`,
      { layouts }
    );
    return response.data;
  });

export const deleteDashboardWidget = (dashboardId: number, widgetId: string) =>
  handleRequest(async () => {
    const response = await api.delete<CreateDashboardResponse>(
      `/dashboard/${dashboardId}/widgets/${widgetId}`
    );
    return response.data;
  });

