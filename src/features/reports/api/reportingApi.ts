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

  UpdateTemplatePayload,
  DeleteTemplateResponse,
  CreateReportSchedulePayload,
  UpdateReportSchedulePayload,
  ReportScheduleResponse,
  ReportScheduleMessageResponse,
} from "./types";
import { buildApiError, type AxiosApiError } from "./types";

// Sync Status Types
export interface SyncStatusAccount {
  assignmentId: number;
  accountId: number;
  accountName: string;
  initialSyncComplete: boolean;
  lastSyncDate: string | null;
}

export interface SyncStatusIntegration {
  hasAccounts: boolean;
  allSynced: boolean;
  accounts: SyncStatusAccount[];
}

export interface SyncStatusResponse {
  success: boolean;
  data: Record<string, SyncStatusIntegration>;
}

export const getSyncStatus = (clientId: number) =>
  handleRequest<SyncStatusResponse>(async () => {
    const response = await api.get<SyncStatusResponse>(
      `/clients/${clientId}/sync-status`
    );
    return response.data;
  });

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
  slidesMeta?: ReportTemplate["slidesMeta"],
  pageOrder?: number[]
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

  const slides = Array.from(slideMap.values());

  if (pageOrder && pageOrder.length > 0) {
    return slides.sort((a, b) => {
      const idxA = pageOrder.indexOf(a.id ?? -1);
      const idxB = pageOrder.indexOf(b.id ?? -1);
      // If both are in pageOrder, sort by index
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      // If only A is in pageOrder, A comes first
      if (idxA !== -1) return -1;
      // If only B is in pageOrder, B comes first
      if (idxB !== -1) return 1;
      // If neither, fallback to ID sort
      return (a.id ?? 0) - (b.id ?? 0);
    });
  }

  return slides.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
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

  // Fallback: If no pageOrder from backend, use the order of slides
  if (pageOrder.length === 0) {
    pageOrder = apiTemplate.slides.map((s, i) => s.id ?? i);
  }

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



/**
 * Fetch unified metrics (production data) without resolving specific widgets.
 * This can be used to build the available-metrics list from live data.
 */
export const fetchUnifiedMetricsList = (
  clientId: number,
  params?: {
    integration?: string;
    accountId?: string;
    metricKey?: string;
    dimensionType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
) =>
  handleRequest(async () => {
    // Filter params to only keep allowed keys: integration, metricKey, startDate, endDate
    const requestParams: Record<string, any> = {};
    if (params?.integration) requestParams.integration = params.integration;
    if (params?.metricKey) requestParams.metricKey = params.metricKey;
    if (params?.startDate) requestParams.startDate = params.startDate;
    if (params?.endDate) requestParams.endDate = params.endDate;
    if (params?.page) requestParams.page = params.page;
    if (params?.limit) requestParams.limit = params.limit;

    const response = await api.get<DebugMetricsResponse>(
      `/unified-metrics`,
      {
        params: { ...requestParams, clientId },
      }
    );
    console.log("response fetchUnifiedMetricsList", response.data);
    return response.data;
  });

// Fetch individual metric data with optional dimensional breakdown
// Removed accountId and dimensionType from params - backend handles filtering
export const fetchUnifiedMetric = (
  clientId: number,
  params: {
    integration: string;
    metricKey: string;
    startDate: string;
    endDate: string;
  }
) =>
  handleRequest(async () => {
    // Map frontend integration names to backend format
    // Most integrations (meta-instagram, google-analytics) require underscores
    // Exception: google-search-console requires hyphens
    let integrationName = params.integration;
    if (params.integration !== 'google-search-console') {
      integrationName = params.integration.replace(/-/g, '_');
    }

    // WooCommerce special case: backend expects "woo"
    if (integrationName === 'woocommerce') {
      integrationName = 'woo';
    }

    if (integrationName !== params.integration) {
      console.log(`🔄 Normalized integration for API: ${params.integration} -> ${integrationName}`);
    }

    const requestParams: Record<string, string> = {
      integration: integrationName,
      metricKey: params.metricKey,
      startDate: params.startDate,
      endDate: params.endDate,
    };

    // Removed dimensionType and accountId as requested by user
    // Only keeping: clientId (passed separately), integration, metricKey, startDate, endDate

    console.log("requestParams", requestParams);
    const response = await api.get(`/unified-metrics`, {
      params: { ...requestParams, clientId, client_id: clientId },
    });
    console.log("response requestParams", response.data);
    return response.data;
  });

export const createReportTemplate = (
  clientId: number,
  payload: CreateTemplatePayload
) =>
  handleRequest(async () => {
    const slides = buildSlidesFromWidgets(payload.widgets, payload.slidesMeta, payload.pageOrder);

    const body = {
      name: payload.name,
      description: payload.description,
      defaultDateFrom: payload.defaultDateFrom,
      defaultDateTo: payload.defaultDateTo,
      pageOrder: payload.pageOrder,
      slides,
      clientId, // Include clientId in body instead of path
      client_id: clientId, // Try snake_case too
    };

    const response = await api.post<CreateTemplateResponse>(
      `/report-templates`,
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

export const listReportTemplates = (clientId?: number) =>
  handleRequest(async () => {
    const response = await api.get<ListTemplatesResponse>(
      `/report-templates`,
      {
        params: { clientId, client_id: clientId },
      }
    );
    return response.data;
  });

export const updateReportTemplate = (
  clientId: number,
  templateId: number,
  payload: UpdateTemplatePayload
) =>
  handleRequest(async () => {
    const slides = buildSlidesFromWidgets(payload.widgets, payload.slidesMeta, payload.pageOrder);

    const body = {
      name: payload.name,
      description: payload.description,
      defaultDateFrom: payload.defaultDateFrom,
      defaultDateTo: payload.defaultDateTo,
      pageOrder: payload.pageOrder,
      slides,
      clientId, // Include clientId in body
      client_id: clientId, // Try snake_case in case backend expects it
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
export const createReportSchedule = (
  clientId: number,
  payload: CreateReportSchedulePayload
) =>
  handleRequest(async () => {
    const response = await api.post<ReportScheduleResponse>(
      `/clients/${clientId}/report-schedules`,
      payload
    );
    return response.data;
  });

export const updateReportSchedule = (
  clientId: number,
  scheduleId: number,
  payload: UpdateReportSchedulePayload
) =>
  handleRequest(async () => {
    const response = await api.put<ReportScheduleMessageResponse>(
      `/clients/${clientId}/report-schedules/${scheduleId}`,
      payload
    );
    return response.data;
  });

export const deleteReportSchedule = (clientId: number, scheduleId: number) =>
  handleRequest(async () => {
    const response = await api.delete<ReportScheduleMessageResponse>(
      `/clients/${clientId}/report-schedules/${scheduleId}`
    );
    return response.data;
  });



export const generatePdf = (clientId: number, payload: GeneratePdfPayload) =>
  handleRequest(async () => {
    const response = await api.post<GeneratePdfResponse>(
      `/clients/${clientId}/reportpdf/pdf`,
      payload
    );
    return response.data;
  });

export const getDashboard = (clientId: number, dashboardId: number) =>
  handleRequest(async () => {
    const response = await api.get<CreateDashboardResponse>(
      `/clients/${clientId}/dashboard/${dashboardId}`
    );
    return response.data;
  });

export const listDashboards = (clientId: number) =>
  handleRequest(async () => {
    const response = await api.get<GetDashboardsResponse>(
      `/clients/${clientId}/dashboard`
    );
    return response.data;
  });

export const createDashboard = (
  clientId: number,
  payload: CreateDashboardPayload
) =>
  handleRequest(async () => {
    const response = await api.post<CreateDashboardResponse>(
      `/clients/${clientId}/dashboard`,
      payload
    );
    return response.data;
  });

export const updateDashboard = (
  clientId: number,
  dashboardId: number,
  payload: CreateDashboardPayload
) =>
  handleRequest(async () => {
    const response = await api.put<CreateDashboardResponse>(
      `/clients/${clientId}/dashboard/${dashboardId}`,
      payload
    );
    return response.data;
  });

export const cloneDashboard = (clientId: number, dashboardId: number) =>
  handleRequest(async () => {
    const response = await api.post<CloneDashboardResponse>(
      `/clients/${clientId}/dashboard/${dashboardId}/clone`
    );
    return response.data;
  });

export const addDashboardWidget = (
  clientId: number,
  dashboardId: number,
  widget: Dashboard["widgets"][string]
) =>
  handleRequest(async () => {
    const response = await api.post<CreateDashboardResponse>(
      `/clients/${clientId}/dashboard/${dashboardId}/widgets`,
      widget
    );
    return response.data;
  });

export const updateDashboardWidget = (
  clientId: number,
  dashboardId: number,
  widgetId: string,
  widget: Dashboard["widgets"][string]
) =>
  handleRequest(async () => {
    const response = await api.put<CreateDashboardResponse>(
      `/clients/${clientId}/dashboard/${dashboardId}/widgets/${widgetId}`,
      widget
    );
    return response.data;
  });

export const reorderDashboardWidgets = (
  clientId: number,
  dashboardId: number,
  layouts: Array<{
    id: string;
    layout: { x: number; y: number; w: number; h: number };
  }>
) =>
  handleRequest(async () => {
    const response = await api.patch<CreateDashboardResponse>(
      `/clients/${clientId}/dashboard/${dashboardId}/widgets/reorder`,
      { layouts }
    );
    return response.data;
  });

export const deleteDashboardWidget = (
  clientId: number,
  dashboardId: number,
  widgetId: string
) =>
  handleRequest(async () => {
    const response = await api.delete<CreateDashboardResponse>(
      `/clients/${clientId}/dashboard/${dashboardId}/widgets/${widgetId}`
    );
    return response.data;
  });

