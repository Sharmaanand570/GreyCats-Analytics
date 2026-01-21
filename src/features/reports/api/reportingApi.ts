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
  ListReportSchedulesResponse,
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
import { prettifyMetricLabel } from "@/utils/labelUtils";

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

    console.log(response.data, "hjvbjhvhjvjhvjhvjhvj");
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
const METRIC_WIDTH = 4;
const METRIC_HEIGHT = 4;


export const buildSlidesFromWidgets = (
  widgets: ReportWidgetDefinition[] | undefined,
  slidesMeta?: ReportTemplate["slidesMeta"],
  pageOrder?: number[]
): ApiReportTemplateSlide[] => {
  const slideMap = new Map<number, ApiReportTemplateSlide>();

  // 1. Initialize slides from metadata first (to capture empty pages)
  if (slidesMeta) {
    slidesMeta.forEach((meta) => {
      slideMap.set(meta.id, {
        id: meta.id,
        title: meta.title,
        subtitle: meta.subtitle,
        widgets: [],
      });
    });
  }

  // 2. Populate widgets
  if (widgets && widgets.length > 0) {
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
        ...widget,
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
  }

  const slides = Array.from(slideMap.values());
  console.log(`🏗️ [buildSlidesFromWidgets] Input: ${widgets?.length || 0} visible widgets, ${slidesMeta?.length || 0} meta pages.`);
  console.log(`🏗️ [buildSlidesFromWidgets] Output: ${slides.length} slides constructed.`, slides);

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



    // Determine if this is a custom page or integration page
    // Custom pages typically have IDs >= 1000 (backend-generated) or have no widgets
    const isCustomPage = slideId >= 1000 || slide.widgets.length === 0;

    slidesMeta.push({
      id: slideId,
      title: slide.title,
      subtitle: slide.subtitle,
      source: isCustomPage ? "custom" : "integration",
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
        ...w, // Preserve all properties from the API widget
        id: widgetId, // Override id with generated/mapped one
        metricKey: w.metricKey ?? "",
        integration: w.integration ?? "",
        groupBy: (w.groupBy as string | undefined) ?? "none",
        aggregation: (w.aggregation as string | undefined) ?? "sum",
        type: w.type || (w as any).widgetType,
        displayName: prettifyMetricLabel(w.displayName || (w as any).title || (w as any).label || w.metricKey || ""),
        layout, // Use the mapped layout
        filters, // Use the mapped filters
        ...(widgetData ? { widgetData, snapshotData: widgetData } : {}), // Add widgetData and alias as snapshotData
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
    name: apiTemplate.name || (apiTemplate as any).templateName,
    description: apiTemplate.description,
    widgets,
    createdAt: apiTemplate.createdAt,
    updatedAt: apiTemplate.updatedAt,
    defaultDateFrom: apiTemplate.defaultDateFrom || (apiTemplate as any).dateFrom,
    defaultDateTo: apiTemplate.defaultDateTo || (apiTemplate as any).dateTo,
    pageOrder,
    slidesMeta,
    clientId: apiTemplate.clientId ?? apiTemplate.client_id,
  };
};



/**
 * Fetch unified metrics (production data) without resolving specific widgets.
 * This can be used to build the available-metrics list from live data.
 */

export interface UnifiedMetricRow {
  id: number;
  metricKey: string;
  value: number;
  date: string;
  integration: string;
  accountId: string;
  userId: number;
  clientId: number;
  recordedAt: string;
  dimensionType?: string;
  dimensionValue?: string;
  extra?: any;
}
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
  clientId: number | null | undefined,
  params: {
    integration: string;
    metricKey: string;
    startDate: string;
    endDate: string;
    token?: string;
    groupBy?: string;
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
      ...(params.token ? { token: params.token } : {}),
      ...(params.groupBy ? { groupBy: params.groupBy } : {}),
    };

    if (clientId) {
      requestParams.clientId = String(clientId);
      requestParams.client_id = String(clientId);
    }

    console.log("[UnifiedMetric API] Request Params:", requestParams);
    const response = await api.get(`/unified-metrics`, {
      params: requestParams,
      skipAuthRedirect: !!params.token,
    } as any);
    console.log("[UnifiedMetric API] Response Data:", response.data);
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



export const getReportTemplate = (templateId: number, token?: string) =>
  handleRequest(async () => {
    const config = token ? { params: { token, expand: true, include: 'slides,widgets' }, skipAuthRedirect: true } : {};
    // Use the dedicated shared report endpoint if a token is present
    const url = token ? `/shared/reports/${templateId}` : `/report-templates/${templateId}`;

    const response = await api.get<CreateTemplateResponse>(
      url,
      config as any
    );

    console.log("response getReportTemplate", response.data);

    // Handle potential structure differences for shared reports
    // The shared endpoint might return the template directly or in a .data property
    // Also check for .report or .sharedReport inside the data
    const rawData = response.data;
    console.log("🐛 [SharedReport] rawData keys:", Object.keys(rawData));

    let apiTemplate =
      rawData.template ||
      (rawData as any).report ||
      (rawData as any).sharedReport ||
      (rawData as any).data?.template ||
      (rawData as any).data?.report ||
      (rawData as any).data ||
      rawData;

    // Data Hydrator: Check for 'snapshot' object which contains pre-calculated data
    // Structure: { snapshot: { [slideId]: { [widgetId]: widgetData } } }
    const snapshot = (rawData as any).snapshot || (apiTemplate as any).snapshot;

    // If we have a snapshot-like object with no slides/widgets but a templateId,
    // we assume we need to fetch the actual layout from the template endpoint.
    if (!(apiTemplate as any)?.slides && !(apiTemplate as any)?.widgets && (apiTemplate as any)?.templateId) {
      const tmplId = (apiTemplate as any).templateId;
      console.log("Report is snapshot-only. Fetching template structure for:", tmplId);
      try {
        const templateResponse = await api.get<CreateTemplateResponse>(
          `/report-templates/${tmplId}`,
          {
            params: { token },
            skipAuthRedirect: true
          } as any
        );

        const fetchedTemplate =
          templateResponse.data?.template ||
          (templateResponse.data as any).report ||
          templateResponse.data;

        if (fetchedTemplate && (fetchedTemplate.slides || (fetchedTemplate as any).widgets)) {
          // Use the fetched layout, but PRESERVE the snapshot data
          apiTemplate = {
            ...apiTemplate,
            ...fetchedTemplate,
            snapshot: snapshot || (fetchedTemplate as any).snapshot,
            id: apiTemplate.id,
            templateId: tmplId,
            templateName: (apiTemplate as any).templateName || fetchedTemplate.name
          } as any;
          console.log("Fetched template structure successfully");
        }
      } catch (err) {
        console.warn("Failed to fetch template structure with token", err);
      }
    }

    if (!apiTemplate) {
      throw new Error("Invalid report response structure");
    }

    // We do NOT reconstruct slides from snapshot anymore, because snapshot contains DATA, not DEFINITIONS.
    // We let the 'Flat Converter' below handle the definitions.
    // Then we intentionally modify the widgets to include this data so ReportBuilder can find it.

    // Converter: Handle 'flat' structure (widgets array + slidesMeta)
    // confirmed to be returned by the Shared Report API.
    // Only run this if we didn't find slides from the snapshot above.
    if ((!apiTemplate.slides || apiTemplate.slides.length === 0) && Array.isArray((apiTemplate as any).widgets)) {
      console.log("✅ [SharedReport] Found flat widgets, converting to nested slides...");

      const flatWidgets = (apiTemplate as any).widgets as any[];
      // Debug log to find where the metric key is hiding
      if (flatWidgets.length > 0) {
        console.log("🐛 [SharedReport] Inspecting first widget:", flatWidgets[0]);
      }

      const slidesMeta = (apiTemplate as any).slidesMeta as any[] || [];
      const slidesMap = new Map<number, ApiReportTemplateSlide>();

      // 1. Create Shell Slides from Metadata
      slidesMeta.forEach(meta => {
        slidesMap.set(meta.id, {
          id: meta.id,
          title: meta.title || "Page",
          subtitle: meta.subtitle,
          widgets: []
        });
      });

      // 2. Group Widgets into Slides
      flatWidgets.forEach((w: any) => {
        const slideId = w.layout?.slideId;
        const targetId = slideId ?? slidesMeta[0]?.id ?? 1;

        if (!slidesMap.has(targetId)) {
          slidesMap.set(targetId, {
            id: targetId,
            title: "Page",
            widgets: []
          });
        }

        // Map potential alternative key names if standard ones are empty
        const mappedWidget = { ...w };
        if (!mappedWidget.metricKey && mappedWidget.widgetKey) mappedWidget.metricKey = mappedWidget.widgetKey; // Fallback

        slidesMap.get(targetId)!.widgets.push(mappedWidget);
      });

      // 3. Assign back to apiTemplate
      apiTemplate.slides = Array.from(slidesMap.values());
      console.log(`✅ [SharedReport] Reconstructed ${apiTemplate.slides.length} slides from flat widgets`);
    }

    // HYDRATION: If we have a snapshot (data) and slides (definitions), combine them.
    if (snapshot && apiTemplate.slides && apiTemplate.slides.length > 0) {
      apiTemplate.slides.forEach(slide => {
        const slideData = (snapshot as Record<string, any>)[String(slide.id || "")];
        if (!slideData) return;

        // Support both flat snapshot and nested { widgets: { ... } } format
        const widgetMap = slideData.widgets || slideData;

        slide.widgets.forEach(widget => {
          // The snapshot uses internal widget IDs, usually mapped from widgetKey or id
          const data = widgetMap[widget.id || ""] || widgetMap[widget.widgetKey || ""] || widgetMap[String(widget.id || "")];
          if (data) {
            // Attach the data to the widget definition so ReportBuilder can find it
            (widget as any).snapshotData = data;
          }
        });
      });

      if (apiTemplate.widgets && Array.isArray(apiTemplate.widgets)) {
        console.log(`💧 [Hydrator] Hydrating flat widgets (${apiTemplate.widgets.length})...`);
        apiTemplate.widgets.forEach(widget => {
          let foundData = null;
          const snapshotData = snapshot as Record<string, any>;
          // console.log(`   🔍 Looking for widget ${widget.id} / ${widget.widgetKey}`);

          for (const slideId of Object.keys(snapshotData)) {
            const slideContent = snapshotData[slideId];
            const widgetMap = slideContent.widgets || slideContent;

            // Try all possible keys
            const key1 = widget.id || "";
            const key2 = widget.widgetKey || "";
            const key3 = String(widget.id || "");

            const data = widgetMap[key1] || widgetMap[key2] || widgetMap[key3];

            if (data) {
              // console.log(`      ✅ Found match in slide ${slideId} for key ${key1}/${key2}`);
              foundData = data;
              break;
            }
          }

          if (foundData) {
            (widget as any).snapshotData = foundData;
          } else {
            console.warn(`      ❌ No data found for widget ${widget.id} / ${widget.widgetKey}`);
          }
        });
      }

    }

    // FALLBACK RECONSTRUCTOR: If we still have no slides (meaning 'widgets' array was missing),
    // but we DO have a snapshot, we must reconstruct the report purely from the data.
    // This happens in some shared report scenarios where definitions are stripped.
    // Data Hydrator: Handle both {snapshot: {...}} and root level snapshot
    const rawSnapshot = (rawData as any).snapshot || (apiTemplate as any).snapshot || (rawData as any).snapshot;

    // Fix variable scoping if needed, ensure we use a stable snapshot ref
    const snapshotObj = (typeof rawSnapshot === 'object' && rawSnapshot !== null) ? rawSnapshot : {};

    // FALLBACK RECONSTRUCTOR
    if ((!apiTemplate.slides || apiTemplate.slides.length === 0) && Object.keys(snapshotObj).length > 0) {
      console.log("⚠️ [SharedReport] definitions missing, performing smart reconstruction...");
      const reconstructedSlides: ApiReportTemplateSlide[] = [];

      Object.entries(snapshotObj).forEach(([slideId, slideContent]) => {
        if (!slideContent || typeof slideContent !== 'object') return;

        const widgets: ApiReportTemplateWidget[] = [];
        let detectedIntegration = "General";

        // Support nested { widgets: { ... }, slideTitle: "..." } or flat structure
        const slideData = slideContent as any;
        const widgetSource = slideData.widgets || slideData;
        const metricEntries = Object.entries(widgetSource as Record<string, any>).filter(([id]) => id !== 'metadata' && id !== 'title' && id !== 'slideTitle');

        let currentX = 0;
        let currentY = 0;
        let maxRowHeight = 0;

        metricEntries.forEach(([wId, wData]) => {
          // Detect integration from baked-in 'integration' field or key
          const widgetIntegration = (wData as any).integration || "";
          if (detectedIntegration === "General") {
            if (widgetIntegration.includes('meta') || widgetIntegration.includes('facebook') || widgetIntegration.includes('instagram')) detectedIntegration = "Meta Business";
            else if (widgetIntegration.includes('google') || widgetIntegration.includes('analytics') || widgetIntegration.includes('search-console')) detectedIntegration = "Google";
            else if (widgetIntegration.includes('woo')) detectedIntegration = "WooCommerce";
            else if (wId.startsWith('meta') || wId.includes('facebook') || wId.includes('instagram')) detectedIntegration = "Meta Business";
            else if (wId.startsWith('google')) detectedIntegration = "Google";
            else if (wId.startsWith('woo')) detectedIntegration = "WooCommerce";
          }

          // Use chartType from backend if available
          const chartType = (wData as any).chartType;
          const isChart = chartType === "line_chart" ||
            (Array.isArray(wData.series) && wData.series.length > 0) ||
            wId.toLowerCase().includes('chart') ||
            wId.toLowerCase().includes('graph');

          const inferredType = isChart ? "line_chart" : "metric";
          const width = isChart ? 12 : METRIC_WIDTH;
          const height = isChart ? 8 : METRIC_HEIGHT;

          // Wrap around if no space
          if (currentX + width > 12) {
            currentX = 0;
            currentY += maxRowHeight;
            maxRowHeight = 0;
          }

          // Prettify Name (Aggressive recovery)
          // Prioritize metricLabel or title from backend snapshot
          let displayName = (wData as any).metricLabel || (wData as any).displayName || (wData as any).title || (wData as any).label || (wData as any).metricKey || (wData as any).widgetKey;

          // Force fallback if we found a single-letter system ID (W, X, Y)
          const isSystemId = !displayName ||
            String(displayName).length <= 1 ||
            /^[a-z0-9]$/i.test(String(displayName)) ||
            String(displayName).toLowerCase().includes("auto") ||
            String(displayName).toLowerCase().includes("item");

          if (isSystemId) {
            displayName = prettifyMetricLabel(displayName || wId);
          } else {
            displayName = prettifyMetricLabel(displayName);
          }

          widgets.push({
            id: wId,
            widgetKey: wId,
            type: inferredType,
            metricKey: (wData as any).metricKey || (wData as any).widgetKey || wId,
            displayName,
            integration: widgetIntegration || "unknown",
            groupBy: (wData as any).groupBy || "none",
            aggregation: (wData as any).aggregation || "sum",
            layout: {
              slideId: Number(slideId),
              x: (wData as any).layout?.x ?? (wData as any).x ?? currentX,
              y: (wData as any).layout?.y ?? (wData as any).y ?? currentY,
              w: (wData as any).layout?.w ?? (wData as any).w ?? width,
              h: (wData as any).layout?.h ?? (wData as any).h ?? height
            },
            snapshotData: wData
          } as any);

          currentX += width;
          maxRowHeight = Math.max(maxRowHeight, height);

          if (currentX >= 12) {
            currentX = 0;
            currentY += maxRowHeight;
            maxRowHeight = 0;
          }
        });

        // Ensure we advance Y if the final row was incomplete
        if (currentX > 0) {
          currentY += maxRowHeight;
        }

        // Set Slide Title - use slideTitle from snapshot if available
        let title = slideData.slideTitle || slideData.title || (slideData.metadata as any)?.title;

        // Recover title from baked-in metadata if still missing
        if (!title || title === "Page" || title === "Report Page") {
          const firstWidgetData = Object.values(widgetSource as Record<string, any>).find(v => v && typeof v === 'object' && v.slideTitle);
          if (firstWidgetData) {
            title = firstWidgetData.slideTitle;
          }
        }

        if (!title || title === "Page" || title === "Report Page") {
          const reportName = (apiTemplate as any).templateName || (apiTemplate as any).name;
          title = detectedIntegration !== "General" ? `${detectedIntegration} Overview` : (reportName || "Report Overview");
        }

        reconstructedSlides.push({
          id: Number(slideId) || Math.random(),
          title: prettifyMetricLabel(title),
          widgets: widgets
        });
      });

      if (reconstructedSlides.length > 0) {
        apiTemplate.slides = reconstructedSlides;
        console.log(`✅ [SharedReport] Reconstructed ${reconstructedSlides.length} slides from snapshot (Fallback)`);
      }
    }

    if (!apiTemplate.slides) {
      apiTemplate.slides = [];
    }

    // REFINE TITLES: Ensure every slide has a descriptive title.
    // In Shared View, we lack 'integrationsData' (sidebar), so 'ReportBuilder' cannot
    // lookup integration names if the title is empty. We must populate them here.
    apiTemplate.slides.forEach(slide => {
      const isGeneric = !slide.title ||
        slide.title === "Page" ||
        slide.title === "Report Page" ||
        /^Slide \d+$/.test(slide.title);

      if (isGeneric && slide.widgets && slide.widgets.length > 0) {
        // Infer from first widget's integration
        const first = slide.widgets[0];
        const integration = (first.integration || (first as any).metricIntegration || "").toLowerCase();

        if (integration) {
          if (integration.includes('meta') || integration.includes('facebook') || integration.includes('instagram')) slide.title = "Meta Business";
          else if (integration.includes('google') && (integration.includes('analytics') || integration.includes('ga4'))) slide.title = "Google Analytics";
          else if (integration.includes('search-console') || integration === 'google-console') slide.title = "Google Search Console";
          else if (integration.includes('woo')) slide.title = "WooCommerce";
          else if (integration.includes('shopify')) slide.title = "Shopify";
          else if (integration.includes('linkedin')) slide.title = "LinkedIn";
          else slide.title = prettifyMetricLabel(integration);
        }
      }
    });

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

export const listReportSchedules = (clientId: number) =>
  handleRequest(async () => {
    const response = await api.get<ListReportSchedulesResponse>(
      `/clients/${clientId}/report-schedules?activeOnly=false`
    );
    return response.data;
  });

export const getReportSchedule = (clientId: number, scheduleId: number) =>
  handleRequest(async () => {
    const response = await api.get<GetReportScheduleResponse>(
      `/clients/${clientId}/report-schedules/${scheduleId}`
    );
    return response.data;
  });

// Generated Reports
export interface GeneratedReport {
  id: string;
  reportScheduleId: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  pdfUrl?: string;
  createdAt: string;
  dateFrom: string;
  dateTo: string;
}

export interface ListGeneratedReportsResponse {
  success: boolean;
  reports: GeneratedReport[];
}

export const listGeneratedReports = (clientId: number) =>
  handleRequest(async () => {
    // Assumes router mounted at /report-schedules based on finding
    const response = await api.get<ListGeneratedReportsResponse>(
      `/report-schedules/${clientId}/generated`
    );
    return response.data;
  });

export const downloadGeneratedReport = (clientId: number, reportId: string) =>
  handleRequest(async () => {
    const response = await api.get(
      `/report-schedules/${clientId}/generated/${reportId}/download`,
      { responseType: 'blob' }
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

export const resolveWidgets = (
  clientId: number,
  widgets: any[], // Type: UnifiedWidgetConfig[]
  dateRange: { startDate: string; endDate: string }
) =>
  handleRequest(async () => {
    const response = await api.post<any>(
      `/unified-metrics/resolve`,
      { widgets, dateRange },
      { params: { clientId } }
    );
    return response.data;
  });


