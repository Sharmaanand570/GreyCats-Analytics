
import { FiBell, FiSearch, FiCalendar } from "react-icons/fi";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { Button } from "../components/ui/button";
import { RadioButtonGroup } from "../components/RadioButtonGroup";
import {
  Sheet,
  SheetContent,
} from "../components/ui/sheet";
import WidgetsPageSideComponent from "../components/WidgetsPageSideComponent";
import ReportElements from "../components/ReportElements";



import TitleWidgetForm from "../components/TitleWidgetForm";
import MetricWidgetForm from "../components/MetricWidgetForm";
import CustomWidgetForm from "../components/CustomWidgetForm";
import TasksWidgetForm from "../components/TasksWidgetForm";
import ChartWidgetForm from "../components/ChartWidgetForm";
import TableWidgetForm, {
  DEFAULT_RECENT_POSTS_COLUMNS,
  DEFAULT_META_ADS_CAMPAIGN_COLUMNS,
} from "../components/TableWidgetForm";

export const DEFAULT_INSTAGRAM_MEDIA_COLUMNS = [
  { name: 'Date', width: '15%', dataKey: 'date' },
  { name: 'Post', width: '15%', dataKey: 'fullPicture' },
  { name: 'Caption', width: '25%', dataKey: 'post' },
  { name: 'Likes', width: '11.25%', dataKey: 'likes' },
  { name: 'Clicks', width: '11.25%', dataKey: 'clicks' },
  { name: 'Comments', width: '11.25%', dataKey: 'comments' },
  { name: 'Shares', width: '11.25%', dataKey: 'shares' }
];

import ImageWidgetForm from "../components/ImageWidgetForm";
import EmbedWidgetForm from "../components/EmbedWidgetForm";
import { DateRangePicker } from "../components/DateRangePicker";

import { type DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";


// Layout lib
import GridLayout, { type Layout, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// UI Components


// App constants
import {
  WIDGET_SIZE_MAP,
  generateWidgetId,
} from "../components/reportConstants";

import { type ReportWidgetType } from "../components/reportTypes";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Skeleton } from "../components/ui/skeleton";

import { Input } from "../components/ui/input";

import SlideContainer from "../components/SlideContainer";
import WidgetCard from "../components/WidgetCard";


import WidgetDragItem from "../components/WidgetDragItem";

// Widget Data Types - imported from widgetTypes.ts to avoid circular dependencies
import type {
  TitleWidgetData,
  TableWidgetData,
  ChartWidgetData,
  MetricWidgetData,
  ImageWidgetData,
  EmbedWidgetData,
  CustomWidgetData,
  WidgetData,
} from "../components/widgetTypes";
import {
  createReportTemplate,
  getReportTemplate,
  updateReportTemplate,
  listReportSchedules,
  fetchUnifiedAggregate,
  type UnifiedMetricRow,
} from "@/features/reports/api/reportingApi";

import { prettifyMetricLabel } from "@/utils/labelUtils";
import { CreateScheduleModal } from "../components/CreateScheduleModal";

import { getMetricData } from "@/services/unifiedMetrics.api";
import type {
  ApiError,
  CreateTemplatePayload,
  ReportWidgetDefinition,
  ResolvedWidgetData,


} from "@/features/reports/api/types";
import { useIntegrations } from "@/features/DataSources/hooks/useIntegrations";
import { getPlatformConfig } from "@/utils/platformMapping";
import { useAvailableMetrics } from "@/features/reports/hooks/useAvailableMetrics";



import { exportAllSlidesToPDF } from "../components/functions/reportfunctions";
import {
  GRID_CONFIG,
  TABLET_GRID_CONFIG,
  DEFAULT_WIDGET_SIZE,
  getDefaultWidgetData,
  DEFAULT_TEMPLATE_WIDGETS,
  ENABLE_AUTO_DEFAULT_WIDGETS,
  widgetItems,
  customMetricItems,
  imageWidgetItems,
  embedWidgetItems,
} from "@/features/reports/utils/reportBuilderConstants";
import {
  CURATED_DEFAULTS,
  INTEGRATION_TEMPLATES,
} from "@/features/reports/utils/integrationTemplates";
import {
  buildDashboardMapFromTemplate,
  getInitialDateRange,
  formatApiDate,
  getRangeFromPreset,
} from "@/features/reports/utils/templateHydration";
import {
  pickDefaultMetricsForIntegration,
  buildDefaultWidgetsForIntegration,
} from "@/features/reports/utils/widgetBuilders";
import { type WidgetFormState, type ReportBuilderProps } from "@/features/reports/types";
import { WidgetDataWrapper } from "@/features/reports/components/WidgetDataWrapper";
import { BatchMetricsProvider } from "@/features/reports/context/BatchMetricsContext";
import { useBatchDashboardData } from "@/hooks/metrics/useBatchDashboardData";
import { useBatchDemographicsData } from "@/hooks/metrics/useBatchDemographicsData";
import { renderWidgetContent } from "@/features/reports/components/WidgetContentRenderer";
import { useSyncStatus } from "@/features/reports/hooks/useSyncStatus";
import { Loader2 } from "lucide-react";

// Re-export for external use
export type {
  TitleWidgetData,
  TableWidgetData,
  ChartWidgetData,
  MapWidgetData,
  MetricWidgetData,
  ImageWidgetData,
  EmbedWidgetData,
  CustomWidgetData,
  WidgetData,
} from "../components/widgetTypes";

// Types & Store
import {
  type DashboardLayout,
  type DashboardMap,
  type CustomPage,
  type ReportSlideMeta
} from "@/features/reports/api/types";
import { useReportStore } from "@/features/reports/store/useReportStore";
import { useSlideVisibility } from "@/features/reports/hooks/useSlideVisibility";
import { getWidgetQueryKey, fetchAndProcessWidget } from "@/features/reports/hooks/useWidgetData";

// DashboardLayout and DashboardMap types removed (imported from @/features/reports/api/types)



// Auto width provider for react-grid-layout
const AutoWidthGrid = WidthProvider(GridLayout);








// Table Data moved to reportConstants.ts

// Re-export for backward compatibility (used by ReportElements.tsx)
export type { WidgetFormState } from "@/features/reports/types";

const useDebouncedValue = <T,>(value: T, delayMs: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);
  return debouncedValue;
};

type CoreMetricPreview = {
  metricKey: string;
  accountId?: string;
  total?: number;
  rawCount?: number;
  series: Array<{ x: string; y: number }>;
};

type CoreMetricPreviewResponse = {
  success: boolean;
  metrics: CoreMetricPreview[];
};

const GA_METRIC_LABELS: Record<string, string> = {
  "google.sessions": "Sessions",
  "google.activeUsers": "Active Users",
  "google.pageViews": "Page Views",
  "google.bounceRate": "Bounce Rate",
};

const GSC_METRIC_LABELS: Record<string, string> = {
  "google_seo.clicks": "Clicks",
  "google_seo.impressions": "Impressions",
  "google_seo.ctr": "CTR",
  "google_seo.position": "Position",
};

const METRIC_AGGREGATION_BY_KEY: Record<
  string,
  "sum" | "avg" | "min" | "max" | "last"
> = {
  "google.bounceRate": "avg",
  "google_seo.ctr": "avg",
  "google_seo.position": "avg",
};

const aggregateSeries = (
  series: Array<{ x: string; y: number }>,
  aggregation: "sum" | "avg" | "min" | "max" | "last"
) => {
  if (!series.length) return 0;
  const values = series.map((point) => point.y ?? 0);
  const sum = values.reduce((acc, val) => acc + val, 0);

  switch (aggregation) {
    case "avg":
      return sum / values.length;
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    case "last":
      return values[values.length - 1] ?? 0;
    case "sum":
    default:
      return sum;
  }
};




// Main ReportBuilder Component
function ReportBuilderContent({ readOnly = false, providedReportId, shareToken, initialData }: ReportBuilderProps = {}) {
  const params = useParams<{ clientId: string; id?: string }>();
  const parsedClientId = params.clientId ? parseInt(params.clientId) : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // removed duplicate dateRange declaration here, using existing one or defining it once


  // Detect if we're on tablet/mobile using INITIAL window width only.
  // We intentionally do NOT listen to "resize" so that opening DevTools
  // (or the browser inspector) does not change the grid layout.
  const [isTablet] = useState(() => {
    const width = window.innerWidth;
    return width >= 768 && width < 1024;
  });

  const [isMobile] = useState(() => {
    const width = window.innerWidth;
    return width < 768;
  });


  // Detect if we should use overlay layout (Mobile + Tablet + Small Desktop < 1280px)
  const [isOverlayLayout, setIsOverlayLayout] = useState(false);

  useEffect(() => {
    const checkOverlay = () => {
      const width = window.innerWidth;
      setIsOverlayLayout(width < 1280);
    };

    checkOverlay();
    window.addEventListener("resize", checkOverlay);
    return () => window.removeEventListener("resize", checkOverlay);
  }, []);

  // Mobile Sidebar States
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // Use appropriate grid config based on screen size
  const currentGridConfig = isMobile ? {
    cols: 2,
    rowHeight: 80,
    margin: [8, 8] as [number, number],
  } : isTablet ? TABLET_GRID_CONFIG : GRID_CONFIG;


  // Template State
  const [templateId, setTemplateId] = useState<number | null>(
    providedReportId ?? (params.id && params.id !== "new" ? parseInt(params.id) : null)
  );
  // Initialize dashboards with persistence check
  const [dashboards, setDashboards] = useState<DashboardMap>(() => {
    // Check if we have persisted state for this ID
    // Note: params.id is available here
    const reportId = params.id && params.id !== "new" ? parseInt(params.id) : null;
    if (reportId) {
      const saved = useReportStore.getState().getReportState(reportId);
      if (saved?.dashboards) {
        console.log('Ã°Å¸â€œÂ¦ [Persistence] Restoring dashboards from store', saved.dashboards);
        return saved.dashboards;
      }
    }
    // Default fallback
    return new Map([[0, []]]);
  });
  const [isDashboardsInitialized, setIsDashboardsInitialized] = useState(() => {
    const reportId = params.id && params.id !== "new" ? parseInt(params.id) : null;
    // CRITICAL FIX: Even if we have saved state in store, we MUST set initialized=false 
    // for existing reports on a fresh mount. This forces the hydration effect to run 
    // at least once to verify data from the backend/database. 
    // If we return 'true' here, the hydration effect exits early and we risk showing "stale/empty" poison state.
    if (reportId) return false;

    return false;
  });
  const [deletedSlideIds, setDeletedSlideIds] = useState<Set<number>>(() => {
    const reportId = params.id && params.id !== "new" ? parseInt(params.id) : null;
    console.log(`Ã°Å¸â€â€ž [Store Init] Initializing deletedSlideIds for reportId:`, reportId);
    if (reportId) {
      const saved = useReportStore.getState().getReportState(reportId);
      console.log(`Ã°Å¸â€â€ž [Store Init] Saved state from store:`, saved);
      if (saved?.deletedSlideIds) {
        console.log(`Ã°Å¸â€â€ž [Store Init] Restoring deletedSlideIds:`, Array.from(saved.deletedSlideIds));
        // Expose to window for debugging
        if (typeof window !== 'undefined') {
          (window as any).__DELETED_SLIDES_DEBUG__ = saved.deletedSlideIds;
        }
        return saved.deletedSlideIds;
      }
    }
    console.log(`Ã°Å¸â€â€ž [Store Init] No saved deletedSlideIds, returning empty Set`);
    return new Set();
  });

  // Custom pages state (pages added by user, not from integrations)
  const [customPages, setCustomPages] = useState<CustomPage[]>(() => {
    const reportId = params.id && params.id !== "new" ? parseInt(params.id) : null;
    if (reportId) {
      const saved = useReportStore.getState().getReportState(reportId);
      if (saved?.customPages) return saved.customPages;
    }
    return [];
  });

  // State to hold the "live" version of slidesMeta, which may differ from the backend data
  // if we perform rescues or cleanups. This is what the Sidebar should render.
  const [processedSlidesMeta, setProcessedSlidesMeta] = useState<ReportSlideMeta[]>(() => {
    const reportId = params.id && params.id !== "new" ? parseInt(params.id) : null;
    if (reportId) {
      const saved = useReportStore.getState().getReportState(reportId);
      if (saved?.processedSlidesMeta) return saved.processedSlidesMeta;
    }
    return [];
  });

  // Template Query - Must be before integrations to derive clientId
  // Template Query - Must be before integrations to derive clientId
  const templateQuery = useQuery({
    queryKey: ["report-template", templateId, shareToken],
    queryFn: async () => {
      if (templateId == null) {
        throw new Error("Missing template id");
      }

      // Pass token if we have one (for shared reports) or undefined for normal auth
      const response = await getReportTemplate(templateId, shareToken);
      console.log("getReportTemplate response", response);
      return response.template;
    },
    enabled: templateId != null,
    retry: 0,
    initialData: initialData,
    // For shared reports, always fetch fresh data (don't use stale cache)
    staleTime: shareToken ? 0 : undefined,
  });

  const { isLoading: isTemplateLoading, isError: isTemplateError } = templateQuery;

  // Derive clientId from template if not in params
  // Robustness Fix: Check initialData directly as well to ensure we capture it for shared reports
  const effectiveClientId = parsedClientId ??
    templateQuery.data?.clientId ??
    (initialData as any)?.clientId ??
    (initialData as any)?.client_id ??
    null;

  // ── SHARED REPORT DIAGNOSTICS ──────────────────────────────────────────────
  if (shareToken && templateQuery.data) {
    console.log('%c[SharedReport] 📋 TEMPLATE LOADED', 'color:#e74c3c;font-weight:bold;font-size:14px', {
      effectiveClientId,
      parsedClientId,
      'templateQuery.data.clientId': templateQuery.data?.clientId,
      'initialData.clientId': (initialData as any)?.clientId,
      'initialData.client_id': (initialData as any)?.client_id,
      widgetsCount: templateQuery.data?.widgets?.length,
      slidesMetaCount: templateQuery.data?.slidesMeta?.length,
      pageOrder: templateQuery.data?.pageOrder,
      slidesMeta: templateQuery.data?.slidesMeta?.map((s: any) => ({ id: s.id, title: s.title, source: s.source })),
      sampleWidget: templateQuery.data?.widgets?.[0] ? {
        metricKey: templateQuery.data.widgets[0].metricKey,
        integration: templateQuery.data.widgets[0].integration,
        slideId: templateQuery.data.widgets[0].layout?.slideId,
        hasSnapshotData: !!(templateQuery.data.widgets[0] as any).snapshotData,
      } : 'NO WIDGETS',
    });
  }

  // Page order state - tracks the order of all pages (integration indices + custom page IDs)
  const [pageOrder, setPageOrder] = useState<number[]>(() => {
    const reportId = params.id && params.id !== "new" ? parseInt(params.id) : null;
    if (reportId) {
      const saved = useReportStore.getState().getReportState(reportId);
      if (saved?.pageOrder && saved.pageOrder.length > 0) return saved.pageOrder;
    }
    return [];
  });

  const dashboardIds = useMemo(
    () => Array.from(dashboards.keys()),
    [dashboards]
  );

  // Store mapping from Frontend ID (0, 1) -> Real Backend ID (55, 56)
  // This ensures we update existing slides instead of recreating them on every save.
  const backendIdMap = useRef<Map<number, number>>(new Map());

  const effectivePageOrder = useMemo(() => {
    // Use pageOrder if available, otherwise use dashboardIds in their natural order (not sorted)
    const rawOrder = pageOrder.length > 0 ? pageOrder : dashboardIds;

    // Create reverse map: Backend ID (5438) -> Frontend ID (0)
    // accessible via backendIdMap ref
    const backendToFrontend = new Map<number, number>();
    backendIdMap.current.forEach((bId, fId) => {
      backendToFrontend.set(bId, fId);
    });

    const translatedOrder = rawOrder.map(id => {
      // If this ID already exists in dashboards, use it directly (frontend ID)
      if (dashboards.has(id)) return id;
      // If the ID is a backend ID that maps to a frontend ID, use the frontend ID
      if (backendToFrontend.has(id)) {
        return backendToFrontend.get(id)!;
      }
      return id;
    });

    const filtered = Array.from(new Set(translatedOrder.filter(id => {
      // Ã¢Å“â€¦ Never render slides the user explicitly deleted
      if (deletedSlideIds.has(id)) {
        console.log(`Ã°Å¸â€”â€˜Ã¯Â¸Â [effectivePageOrder] Excluding user-deleted slide ${id}`);
        return false;
      }
      const exists = dashboards.has(id);
      if (!exists) {
        console.warn(`Ã¢Å¡Â Ã¯Â¸Â [effectivePageOrder] Filtering out ID ${id} - not in dashboards Map. dashboards keys:`, Array.from(dashboards.keys()));
      }
      return exists;
    })));

    // Debug logging to trace page order issues
    console.log(`Ã°Å¸â€œÅ  [effectivePageOrder] Recalculating.`, {
      pageOrderLen: pageOrder.length,
      dashboardIdsLen: dashboardIds.length,
      pageOrder,
      translatedOrder,
      filtered
    });

    if (pageOrder.length === 0 && dashboardIds.length > 0) {
      console.warn('Ã¢Å¡Â Ã¯Â¸Â [PageOrder] Using dashboardIds fallback (Natural Order). pageOrder is empty:', { dashboardIds, filtered });
    } else if (pageOrder.length > 0) {
      console.log('Ã¢Å“â€¦ [PageOrder] Using saved pageOrder:', { pageOrder, filtered });
    }

    return filtered;
  }, [pageOrder, dashboardIds, dashboards]);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const widgetRefs = useRef<Map<number, Map<string, HTMLDivElement>>>(
    new Map()
  );

  // Track slides that have been manually edited in this session (widgets added/deleted/moved)
  // This blocks the "Self-Healing" logic from undoing manual deletions.
  const modifiedSlideIds = useRef<Set<number>>(new Set());

  // Slide visibility for lazy loading: only fetch widget data for visible/near-visible slides.
  // Ã¢Å¡Â¡ rootMargin "0px 0px 1200px 0px" Ã¢â€ â€™ starts fetching ~1.5 screens before the slide enters view.
  // Ã¢Å¡Â¡ fallbackDelay 8000 Ã¢â€ â€™ after 8s, ALL slides are marked visible so background prefetch fires.
  // NOTE: 8s (not 5s) because hydration + rescue can take 3-6s depending on API latency.
  //       Fetching before hydration completes caches 0 for 5 min (staleTime).
  const { registerSlide, isSlideVisible } = useSlideVisibility({
    rootMargin: "0px 0px 1200px 0px",
    sticky: true,
    fallbackDelay: 1000,
  });

  const registerSlideWithBackend = useCallback((slideId: number, el: HTMLElement | null) => {
    registerSlide(slideId, el);
    const backendId = backendIdMap.current.get(slideId);
    if (backendId != null && backendId !== slideId) {
      registerSlide(backendId, el);
    }
  }, [registerSlide]);

  const isSlideVisibleWithBackend = useCallback((slideId: number) => {
    const backendId = backendIdMap.current.get(slideId);
    return isSlideVisible(slideId) || (backendId != null && isSlideVisible(backendId));
  }, [isSlideVisible]);



  const [rightPanelTitle, setRightPanelTitle] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const reportId = params.id && params.id !== "new" ? parseInt(params.id) : null;
    if (reportId) {
      const saved = useReportStore.getState().getReportState(reportId);
      if (saved?.dateRange) return saved.dateRange;
    }
    return getInitialDateRange();
  });
  // Date Preset State (e.g. "Last 30 Days") to allow dynamic recalculation in Shared Reports
  const [_datePreset, setDatePreset] = useState<string | undefined>();

  // Demographics — one GET /api/metabusiness/demographics/:accountId per unique account.
  // React Query deduplicates so N widgets sharing an account → 1 network request.
  // Date params are forwarded so the endpoint returns data for the selected date range.
  const {
    data: demographicById,
    isLoading: demoIsLoading,
    isFetching: demoIsFetching,
  } = useBatchDemographicsData(dashboards, {
    startDate: dateRange?.from ? formatApiDate(dateRange.from) : undefined,
    endDate: dateRange?.to ? formatApiDate(dateRange.to) : undefined,
  });

  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [newReportName, setNewReportName] = useState("");
  const templateBootstrapRef = useRef(false);
  const defaultTemplatePayload = useMemo<CreateTemplatePayload>(
    () => ({
      name: "Untitled Report",
      widgets: DEFAULT_TEMPLATE_WIDGETS.map((widget) => ({
        ...widget,
        layout: widget.layout ? { ...widget.layout } : undefined,
      })),
    }),
    []
  );
  const { mutate: createTemplate, isPending: isCreatingTemplate } = useMutation(
    {
      mutationFn: (payload: CreateTemplatePayload) => {
        if (!parsedClientId) throw new Error("Client ID is required");
        return createReportTemplate(parsedClientId, payload);
      },
      onSuccess: () => {
        // const newId = response.template.id;
        // setTemplateId(newId); // No longer needed as we redirect
        templateBootstrapRef.current = false;
        setIsNameDialogOpen(false); // Close dialog

        // Invalidate list query so the new report appears in the table
        queryClient.invalidateQueries({ queryKey: ["report-templates", "list", parsedClientId] });

        // Redirect to reports list
        navigate(`/clients/${parsedClientId}/reports`);

        toast.success("Report template created");
      },
      onError: (error: ApiError) => {
        templateBootstrapRef.current = false;
        setIsNameDialogOpen(false); // Also close on error
        toast.error(error.message || "Failed to create report template");
      },
    }
  );

  // Report schedule state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const { data: schedulesData } = useQuery({
    queryKey: ["report-schedules", parsedClientId],
    queryFn: () => {
      if (!parsedClientId) throw new Error("Client ID is required");
      return listReportSchedules(parsedClientId);
    },
    enabled: !!parsedClientId && !readOnly,
  });

  const currentSchedule = useMemo(() => {
    if (!schedulesData?.data || !templateId) return null;
    return schedulesData.data.find(s => s.templateId === templateId) || null;
  }, [schedulesData, templateId]);

  // Auto-save state
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(() => {
    const reportId = params.id && params.id !== "new" ? parseInt(params.id) : null;
    if (reportId) {
      const saved = useReportStore.getState().getReportState(reportId);
      if (saved?.lastSavedTime) return saved.lastSavedTime;
    }
    return null;
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(() => {
    const reportId = params.id && params.id !== "new" ? parseInt(params.id) : null;
    if (reportId) {
      const saved = useReportStore.getState().getReportState(reportId);
      if (saved?.hasUnsavedChanges !== undefined) return saved.hasUnsavedChanges;
    }
    return false;
  });

  const {
    data: integrationsData,
    isLoading: isLoadingIntegrations,
  } = useIntegrations(effectiveClientId, {
    enabled: !readOnly,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes instead of 60s to prevent constant widget hydration blocking
    placeholderData: keepPreviousData // Ã°Å¸â€Â§ FIX: Keep previous data during refetch to prevent slideIntegrationMap from becoming empty
  });

  // Debug log with safe handling of undefined
  if (integrationsData) {
    console.log(integrationsData, "integrationsData", parsedClientId);
  }

  // NOTE: We only enable 'available metrics' fetch if we have a clientId
  // If we are in 'shared' mode, we might not have clientId initially,
  // but once template loads, effectiveClientId will be set.
  // Force refresh of metrics when integrations change (e.g. newly connected)
  const integrationVersion = useMemo(() => {
    const integrations = integrationsData?.integrations;
    if (!integrations) return undefined;
    return integrations
      .map((i) => `${i.id}-${i.platform}`)
      .sort()
      .join(",");
  }, [integrationsData?.integrations]);

  const {
    groupedMetrics,
    isLoading: isLoadingAvailableMetrics,
    error: availableMetricsError,
  } = useAvailableMetrics(effectiveClientId, {
    enabled: !readOnly && integrationVersion !== undefined,
    integrationVersion,
    connectedIntegrations: integrationsData?.integrations?.map((i: any) => ({
      platform: i.platform,
      accountId: i.accountId ?? i.account_id ?? 'default',
    })),
  });

  // UI state for the AgencyAnalytics-style "Choose your Metrics" panel
  const [selectedIntegrationForMetrics, setSelectedIntegrationForMetrics] =
    useState<{
      platform: string;
      accountId: string;
      accountName: string;
    } | null>(null);
  const [integrationSearch, setIntegrationSearch] = useState("");
  const [metricsSearch, setMetricsSearch] = useState("");
  const debouncedIntegrationSearch = useDebouncedValue(integrationSearch, 300);
  const debouncedMetricsSearch = useDebouncedValue(metricsSearch, 300);
  const [selectedMetricWidgetType, setSelectedMetricWidgetType] =
    useState<ReportWidgetType>("metric");
  const [gscDimensionType, setGscDimensionType] = useState<string>("query");
  const [gscStartDate, setGscStartDate] = useState<string>(
    dateRange?.from ? formatApiDate(dateRange.from) : formatApiDate(subDays(new Date(), 6))
  );
  const [gscEndDate, setGscEndDate] = useState<string>(
    dateRange?.to ? formatApiDate(dateRange.to) : formatApiDate(new Date())
  );
  const isGscSelected = useMemo(() => {
    if (!selectedIntegrationForMetrics) return false;
    const normalized = selectedIntegrationForMetrics.platform
      .toLowerCase()
      .replace(/_/g, "-");
    return normalized === "google-console" || normalized === "google-search-console";
  }, [selectedIntegrationForMetrics]);
  const isGaSelected = useMemo(() => {
    if (!selectedIntegrationForMetrics) return false;
    const normalized = selectedIntegrationForMetrics.platform
      .toLowerCase()
      .replace(/_/g, "-");
    return normalized === "google-analytics";
  }, [selectedIntegrationForMetrics]);

  const handleCancelNewReport = useCallback(() => {
    templateBootstrapRef.current = false;
    setIsNameDialogOpen(false);
    setNewReportName("");
    navigate(`/clients/${parsedClientId}/reports`);
  }, [navigate, parsedClientId]);

  // Keep GSC param defaults in sync with the main date range
  useEffect(() => {
    if (dateRange?.from) {
      setGscStartDate(formatApiDate(dateRange.from));
    }
    if (dateRange?.to) {
      setGscEndDate(formatApiDate(dateRange.to));
    }
  }, [dateRange?.from, dateRange?.to]);

  // If GSC or GA panel is active and dates change there, sync them to the report dateRange
  useEffect(() => {
    if (!isGscSelected && !isGaSelected) return;
    if (!gscStartDate || !gscEndDate) return;
    const from = new Date(gscStartDate);
    const to = new Date(gscEndDate);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return;
    setDateRange((prev) => {
      const prevFrom = prev?.from?.getTime() ?? 0;
      const prevTo = prev?.to?.getTime() ?? 0;
      if (prevFrom === from.getTime() && prevTo === to.getTime()) {
        return prev;
      }
      return { from, to };
    });
  }, [isGscSelected, isGaSelected, gscStartDate, gscEndDate, setDateRange]);

  const gscMetricsQuery = useQuery<CoreMetricPreviewResponse>({
    queryKey: [
      "report-builder",
      "integration-metrics",
      selectedIntegrationForMetrics?.platform,
      selectedIntegrationForMetrics?.accountId,
      selectedMetricWidgetType,
      gscDimensionType,
      gscStartDate,
      gscEndDate,
    ],
    enabled:
      !!selectedIntegrationForMetrics &&
      !!gscStartDate &&
      !!gscEndDate &&
      (isGscSelected ||
        selectedIntegrationForMetrics.platform
          .toLowerCase()
          .replace(/_/g, "-") === "google-analytics") &&
      !readOnly,
    queryFn: async () => {
      if (!selectedIntegrationForMetrics || !gscStartDate || !gscEndDate) {
        return { success: true, metrics: [] };
      }

      const normalized = selectedIntegrationForMetrics.platform
        .toLowerCase()
        .replace(/_/g, "-");
      const isGoogleAnalytics = normalized === "google-analytics";

      const metricKeys = isGoogleAnalytics
        ? Object.keys(GA_METRIC_LABELS)
        : Object.keys(GSC_METRIC_LABELS);
      const integrationKey = isGoogleAnalytics
        ? "google_analytics"
        : "google-search-console";
      const wantsSeries =
        selectedMetricWidgetType === "line_chart" ||
        selectedMetricWidgetType === "bar_chart";

      const metrics = await Promise.all(
        metricKeys.map(async (metricKey) => {
          const aggregation = METRIC_AGGREGATION_BY_KEY[metricKey] ?? "sum";
          if (!isGoogleAnalytics && !wantsSeries) {
            const aggregateResult = await fetchUnifiedAggregate({
              metricKey,
              integration: "google-search-console",
              startDate: gscStartDate,
              endDate: gscEndDate,
              clientId: parsedClientId ?? undefined,
            });

            if (aggregateResult?.success && typeof aggregateResult.value === "number") {
              return {
                metricKey,
                accountId: selectedIntegrationForMetrics.accountId,
                total: aggregateResult.value,
                rawCount: aggregateResult.rowCount ?? 0,
                series: [],
              };
            }
          }

          const response = await getMetricData({
            integration: integrationKey,
            metricKey,
            accountId: selectedIntegrationForMetrics.accountId,
            dateFrom: gscStartDate,
            dateTo: gscEndDate,
            groupBy: wantsSeries ? "day" : undefined,
            aggregation,
            clientId: parsedClientId ?? undefined,
          });

          const series = response.data?.series ?? [];
          const apiTotal = response.data?.total;
          const total =
            typeof apiTotal === "number"
              ? apiTotal
              : aggregateSeries(series, aggregation);

          return {
            metricKey,
            accountId: selectedIntegrationForMetrics.accountId,
            total,
            rawCount: response.data?.rawCount ?? series.length,
            series,
          };
        })
      );

      return { success: true, metrics };
    },
    staleTime: 60 * 1000,
  });

  const filteredIntegrations = useMemo(() => {
    const search = debouncedIntegrationSearch.trim().toLowerCase();
    const integrations = integrationsData?.integrations ?? [];
    if (!search) return integrations;
    return integrations.filter((integration) => {
      const platformConfig = getPlatformConfig(integration.platform);
      const label =
        platformConfig?.name ||
        `${integration.platform} ${integration.accountName}`;
      return label.toLowerCase().includes(search);
    });
  }, [integrationsData?.integrations, debouncedIntegrationSearch]);

  const selectedIntegrationMeta = useMemo(() => {
    if (!selectedIntegrationForMetrics) return null;
    const { platform, accountId, accountName } = selectedIntegrationForMetrics;
    const normalizedPlatform = platform.toLowerCase().replace(/_/g, "-");
    const isGoogleConsole =
      normalizedPlatform === "google-console" ||
      normalizedPlatform === "google-search-console";
    const isGoogleAnalytics = normalizedPlatform === "google-analytics";

    const aliasPlatform =
      platform === "google-console" || normalizedPlatform === "google-console"
        ? "google-search-console"
        : (platform === "woocommerce" || normalizedPlatform === "woocommerce")
          ? "woo"
          : (platform === "meta-ads" || normalizedPlatform === "meta-ads")
            ? "meta_ads"
            : (platform === "google-analytics" || normalizedPlatform === "google-analytics")
              ? "google_analytics"
              : (platform === "meta-business" || normalizedPlatform === "meta-business")
                ? "meta_business"
                : undefined;

    return {
      platform,
      accountId,
      accountName,
      platformConfig: getPlatformConfig(platform),
      normalizedPlatform,
      isGoogleConsole,
      isGoogleAnalytics,
      aliasPlatform,
    };
  }, [selectedIntegrationForMetrics]);

  const metricsForAccount = useMemo(() => {
    if (!selectedIntegrationMeta) return [];

    const {
      platform,
      accountId,
      normalizedPlatform,
      isGoogleConsole,
      isGoogleAnalytics,
      aliasPlatform,
    } = selectedIntegrationMeta;

    const directMetrics = groupedMetrics[platform] ?? {};
    const normalizedMetrics = groupedMetrics[normalizedPlatform] ?? {};
    const aliasMetrics = aliasPlatform ? groupedMetrics[aliasPlatform] ?? {} : {};

    const metricsByAccount =
      Object.keys(directMetrics).length > 0
        ? directMetrics
        : Object.keys(normalizedMetrics).length > 0
          ? normalizedMetrics
          : Object.keys(aliasMetrics).length > 0
            ? aliasMetrics
            : {};

    if (platform === "meta-business" || normalizedPlatform === "meta-business") {
      const fbMetrics = groupedMetrics["meta-facebook"] || groupedMetrics["meta_facebook"] || {};
      const igMetrics = groupedMetrics["meta-instagram"] || groupedMetrics["meta_instagram"] || {};

      const allAccounts = new Set([
        ...Object.keys(metricsByAccount),
        ...Object.keys(fbMetrics),
        ...Object.keys(igMetrics),
      ]);

      const allFbMetrics: any[] = [];
      Object.values(fbMetrics).forEach((list: any) => allFbMetrics.push(...list));

      const allIgMetrics: any[] = [];
      Object.values(igMetrics).forEach((list: any) => allIgMetrics.push(...list));

      allAccounts.forEach((accId) => {
        const existing = (metricsByAccount[accId] || []) as any[];
        const uniqueMetrics = new Map<string, any>();

        const addMetrics = (list: any[], prefix: string) => {
          list.forEach((m) => {
            const displayName = m.displayName || m.metricKey;
            const hasPrefix =
              displayName.startsWith("Facebook - ") ||
              displayName.startsWith("Instagram - ");
            const finalName = hasPrefix ? displayName : `${prefix} - ${displayName}`;

            uniqueMetrics.set(m.metricKey, {
              ...m,
              displayName: finalName,
              integration: "meta-business",
            });
          });
        };

        addMetrics(existing, "General");
        addMetrics(allFbMetrics, "Facebook");
        addMetrics(allIgMetrics, "Instagram");

        if (uniqueMetrics.size > 0) {
          metricsByAccount[accId] = Array.from(uniqueMetrics.values());
        }
      });
    }

    if ((isGoogleConsole || isGoogleAnalytics) && gscMetricsQuery.data?.metrics?.length) {
      const liveMetrics = gscMetricsQuery.data.metrics
        .map((metric) => {
          const metricKey =
            metric.metricKey ||
            (isGoogleAnalytics ? "google.sessions" : "google_seo.clicks");
          const integrationValue = isGoogleAnalytics
            ? "google-analytics"
            : "google-search-console";

          const allowed = isGoogleAnalytics
            ? GA_METRIC_LABELS[metricKey]
            : GSC_METRIC_LABELS[metricKey];
          if (!allowed) return null;

          return {
            metricKey,
            integration: integrationValue,
            accountId: metric.accountId || accountId,
            displayName: isGoogleAnalytics
              ? GA_METRIC_LABELS[metricKey] || metricKey
              : GSC_METRIC_LABELS[metricKey] || metricKey,
            category: "metric",
            filters: undefined,
            value: metric.total ?? 0,
          };
        })
        .filter(Boolean)
        .reduce<Record<string, (typeof metricsByAccount)[string][number]>>(
          (acc, item) => {
            if (!item) return acc;
            if (!acc[item.metricKey]) {
              acc[item.metricKey] = item;
            }
            return acc;
          },
          {}
        );

      metricsByAccount[accountId] = Object.values(liveMetrics);
    }

    let metricsForAccount = metricsByAccount[accountId] ?? [];
    if (!metricsForAccount.length) {
      metricsForAccount = Object.values(metricsByAccount).flat();
    }

    if (!metricsForAccount.length) {
      const defaults =
        CURATED_DEFAULTS[platform] ||
        CURATED_DEFAULTS[normalizedPlatform] ||
        (aliasPlatform ? CURATED_DEFAULTS[aliasPlatform] : undefined);

      if (defaults) {
        metricsForAccount = defaults.map((metricKey) => {
          const parts = metricKey.split(".");
          const name = parts[parts.length - 1]
            .replace(/([A-Z])/g, " $1")
            .replace(/[._-]/g, " ")
            .trim();
          const displayName = name.charAt(0).toUpperCase() + name.slice(1);

          return {
            metricKey,
            integration: platform,
            accountId,
            displayName,
            category: "General",
            value: 0,
          };
        });
      }
    }

    if (normalizedPlatform === "meta-facebook" || normalizedPlatform === "meta-business" || normalizedPlatform === "meta") {
      const recentPostsKey = "meta.facebook.recent_posts";
      const recentMediaKey = "meta.instagram.recent_media";

      const hasRecentPosts = metricsForAccount.some((m) => m.metricKey === recentPostsKey);
      const hasRecentMedia = metricsForAccount.some((m) => m.metricKey === recentMediaKey);

      if (!hasRecentPosts) {
        metricsForAccount.unshift({
          metricKey: recentPostsKey,
          integration: platform,
          accountId,
          displayName: "Facebook - Recent Posts",
          category: "Posts",
          value: 0,
        });
      }

      if (!hasRecentMedia) {
        metricsForAccount.unshift({
          metricKey: recentMediaKey,
          integration: platform,
          accountId,
          displayName: "Instagram - Recent Media",
          category: "Media",
          value: 0,
        });
      }

      const demographicMetrics = [
        { metricKey: "meta.instagram.followers.age", displayName: "Instagram - Age Distribution", category: "Demographics" },
        { metricKey: "meta.instagram.followers.gender", displayName: "Instagram - Gender Distribution", category: "Demographics" },
        { metricKey: "meta.instagram.followers.country", displayName: "Instagram - Top Countries", category: "Demographics" },
        { metricKey: "meta.instagram.followers.city", displayName: "Instagram - Top Cities", category: "Demographics" },
      ];
      demographicMetrics.forEach((dm) => {
        if (!metricsForAccount.some((m) => m.metricKey === dm.metricKey)) {
          metricsForAccount.push({
            metricKey: dm.metricKey,
            integration: platform,
            accountId,
            displayName: dm.displayName,
            category: dm.category,
            value: 0,
          });
        }
      });
    }

    if (normalizedPlatform === "meta-ads" || normalizedPlatform === "metaads") {
      const campaignKey = "meta.ads.campaign_performance";
      if (!metricsForAccount.some((m) => m.metricKey === campaignKey)) {
        metricsForAccount.push({
          metricKey: campaignKey,
          integration: platform,
          accountId,
          displayName: "Campaign Name",
          category: "Campaigns",
          value: 0,
        });
      }
    }

    if (normalizedPlatform === "linkedin") {
      const recentPostsKey = "linkedin.recent_posts";
      if (!metricsForAccount.some((m) => m.metricKey === recentPostsKey)) {
        metricsForAccount.push({
          metricKey: recentPostsKey,
          integration: platform,
          accountId,
          displayName: "LinkedIn - Recent Posts",
          category: "Posts",
          value: 0,
        });
      }
    }

    if (platform === "meta-business" || normalizedPlatform === "meta-business") {
      metricsForAccount = metricsForAccount.map((metric) => {
        if (metric.displayName?.startsWith("Facebook - ") || metric.displayName?.startsWith("Instagram - ")) {
          return metric;
        }

        const isFacebook =
          metric.metricKey.includes("facebook") || metric.metricKey.startsWith("meta.page.");
        const isInstagram = metric.metricKey.includes("instagram");

        if (isFacebook) {
          return { ...metric, displayName: `Facebook - ${metric.displayName || "Metric"}` };
        }
        if (isInstagram) {
          return { ...metric, displayName: `Instagram - ${metric.displayName || "Metric"}` };
        }
        return metric;
      });
    }

    if (isGoogleAnalytics) {
      const allowedGaKeys = new Set([
        "google.activeUsers",
        "google.bounceRate",
        "google.pageViews",
        "google.sessions",
      ]);
      metricsForAccount = metricsForAccount.filter((metric) =>
        allowedGaKeys.has(metric.metricKey)
      );
    } else if (isGoogleConsole) {
      const allowedGscKeys = new Set([
        "google_seo.clicks",
        "google_seo.impressions",
        "google_seo.ctr",
        "google_seo.position",
      ]);
      metricsForAccount = metricsForAccount.filter((metric) =>
        allowedGscKeys.has(metric.metricKey)
      );
    }

    const seenKeys = new Set<string>();
    metricsForAccount = metricsForAccount.filter((m) => {
      if (seenKeys.has(m.metricKey)) return false;
      seenKeys.add(m.metricKey);
      return true;
    });

    return metricsForAccount;
  }, [selectedIntegrationMeta, groupedMetrics, gscMetricsQuery.data]);

  const filteredMetrics = useMemo(() => {
    const search = debouncedMetricsSearch.trim().toLowerCase();
    if (!search) return metricsForAccount;
    return metricsForAccount.filter((metric) => {
      return (
        metric.displayName.toLowerCase().includes(search) ||
        metric.category.toLowerCase().includes(search) ||
        metric.metricKey.toLowerCase().includes(search)
      );
    });
  }, [metricsForAccount, debouncedMetricsSearch]);

  const viewableMetrics = useMemo(() => {
    return filteredMetrics.filter((metric) => {
      const isListMetric =
        metric.metricKey === "meta.facebook.recent_posts" ||
        metric.metricKey === "meta.instagram.recent_media" ||
        metric.metricKey === "meta.ads.campaign_performance" ||
        metric.metricKey === "meta.instagram.followers.country" ||
        metric.metricKey === "meta.instagram.followers.city";

      if (selectedMetricWidgetType === "table") {
        return isListMetric;
      }
      return !isListMetric;
    });
  }, [filteredMetrics, selectedMetricWidgetType]);






  const slideIntegrationMap = useMemo(() => {
    // Build a map of slide IDs to integration details
    // Current assumption: slide ID 0 = Integration 0, slide ID 1 = Integration 1, etc.
    const map = new Map<number, {
      platform: string;
      accountId: string;
      accountName: string;
      originalIndex: number; // Important for mapping back to integrations array
      subSlideIndex: number; // 0 for main slide, 1 for second slide (e.g. IG), etc.
      stableId: string; // Deterministic integration+platform key for dedupe
      platformKey: string; // Normalized sub-platform key (facebook/instagram/etc)
      slideTitle: string; // Ã°Å¸â€Â§ FIX: Slide-specific title from template
    }>();

    let currentSlideId = 0;
    const stableKeyToSlideId = new Map<string, number>();

    const getOrCreateSlideId = (stableKey: string) => {
      const existingId = stableKeyToSlideId.get(stableKey);
      if (existingId !== undefined) return existingId;
      const nextId = currentSlideId++;
      stableKeyToSlideId.set(stableKey, nextId);
      return nextId;
    };

    const normalizeKey = (value: string) =>
      value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Iterate through integrations array by index
    integrationsData?.integrations?.forEach((integ, index) => {
      if (integ) {
        // Normalize platform key for template lookup
        let normalizedPlatform = integ.platform?.toLowerCase().trim().replace(/[ _-]/g, '');
        // Special mapping for meta business
        if (normalizedPlatform === 'metabusiness') normalizedPlatform = 'meta-business';

        const template = normalizedPlatform ? (
          INTEGRATION_TEMPLATES[integ.platform || ''] ??
          INTEGRATION_TEMPLATES[normalizedPlatform] ??
          INTEGRATION_TEMPLATES[normalizedPlatform.replace(/(meta)(.+)/, '$1-$2')]
        ) : undefined;

        const slideCount = template?.slides?.length || 1;
        const integrationKey = String(integ.id ?? integ.accountId ?? index);

        // Ã°Å¸â€Â DIAGNOSTIC LOG: Track Instagram slide creation
        if (integ.platform?.toLowerCase().includes('instagram')) {
          console.log(`Ã°Å¸â€œÅ  [SlideMap] Creating Instagram slide(s):`, {
            platform: integ.platform,
            normalizedPlatform,
            accountId: integ.accountId,
            accountName: integ.accountName,
            templateFound: !!template,
            slideCount,
            startingSlideId: currentSlideId,
            integrationIndex: index
          });
        }

        for (let i = 0; i < slideCount; i++) {
          // Ã°Å¸â€Â§ FIX: Get slide-specific title from template
          const slideTitle = String(template?.slides?.[i]?.name || integ.platform || "");
          const slideTitleKey = normalizeKey(slideTitle);
          let platformKey = slideTitleKey;

          if (normalizedPlatform === "meta-business") {
            if (slideTitleKey.includes("instagram") || i === 1) {
              platformKey = "instagram";
            } else {
              platformKey = "facebook";
            }
          } else if (normalizedPlatform === "twitter") {
            platformKey = "twitter";
          } else if (normalizedPlatform.includes("linkedin")) {
            platformKey = "linkedin";
          } else if (!platformKey) {
            platformKey = normalizedPlatform || `slide-${i}`;
          }

          const stableId = `${integrationKey}-${platformKey}`;
          const slideId = getOrCreateSlideId(stableId);

          map.set(slideId, {
            platform: integ.platform,
            accountId: integ.accountId,
            accountName: integ.accountName,
            originalIndex: index,
            subSlideIndex: i,
            slideTitle: slideTitle, // Store slide-specific title
            stableId,
            platformKey
          });
        }
      }
    });

    // Ã°Å¸â€œÂ  [SlideMap] Generated map:
    console.log('Ã°Å¸â€œÂ  [SlideMap] Generated map:', Array.from(map.entries()));

    // Expose to window for console debugging
    if (typeof window !== 'undefined') {
      (window as any).__SLIDE_MAP_DEBUG__ = map;
      (window as any).__INTEGRATIONS_DEBUG__ = integrationsData;
    }

    return map;
  }, [integrationsData?.integrations]);


  // Ã°Å¸â€Â DIAGNOSTIC: Track when slideIntegrationMap becomes empty
  useEffect(() => {
    if (slideIntegrationMap.size === 0 && integrationsData?.integrations?.length) {
      console.error(`Ã¢Å¡Â Ã¯Â¸Â [SlideMap] Map is EMPTY but integrations exist!`, {
        integrationsCount: integrationsData.integrations.length,
        integrations: integrationsData.integrations.map(i => i.platform)
      });
    }
  }, [slideIntegrationMap, integrationsData?.integrations]);

  const resolveFrontendSlideId = useCallback((id: number) => {
    for (const [fId, bId] of backendIdMap.current.entries()) {
      if (bId === id) return fId;
    }
    return id;
  }, []);

  const inferIntegrationKeyFromWidget = useCallback((widget: any): string | null => {
    const metricKey = String(widget?.metricConfig?.metricKey || widget?.metricKey || "").toLowerCase();
    if (metricKey.startsWith("google_seo.")) return "google-search-console";
    if (metricKey.startsWith("google_ads.")) return "google-ads";
    if (metricKey.startsWith("google.")) return "google-analytics";
    if (metricKey.startsWith("meta.instagram.")) return "meta-instagram";
    if (metricKey.startsWith("meta.facebook.") || metricKey.startsWith("meta.page.")) return "meta-facebook";
    if (metricKey.startsWith("meta.ads.")) return "meta_ads";
    if (metricKey.startsWith("youtube.")) return "youtube";
    if (metricKey.startsWith("twitter.")) return "twitter";
    if (metricKey.startsWith("linkedin.")) return "linkedin";

    const integration = String(widget?.metricConfig?.integration || widget?.integration || "")
      .toLowerCase()
      .replace(/[_ ]/g, "-");

    if (!integration) return null;
    if (integration === "google" || integration === "google-analytics" || integration === "googleanalytics") return "google-analytics";
    if (integration === "google-search-console" || integration === "google-console" || integration === "googleconsole") return "google-search-console";
    if (integration === "google-ads" || integration === "googleads") return "google-ads";
    if (integration.includes("meta-instagram") || integration === "instagram") return "meta-instagram";
    if (integration.includes("meta-facebook") || integration === "facebook") return "meta-facebook";
    if (integration.includes("meta-ads")) return "meta_ads";
    if (integration.includes("youtube")) return "youtube";
    if (integration.includes("twitter")) return "twitter";
    if (integration.includes("linkedin")) return "linkedin";
    if (integration.includes("meta-business") || integration === "metabusiness") return "meta-facebook";

    return null;
  }, []);

  const inferIntegrationInfoFromWidgets = useCallback((
    widgets: DashboardLayout[] | undefined,
    titleHint?: string
  ) => {
    if (!widgets || widgets.length === 0) return null;

    let inferredKey: string | null = null;
    for (const widget of widgets) {
      inferredKey = inferIntegrationKeyFromWidget(widget);
      if (inferredKey) break;
    }
    if (!inferredKey) return null;

    const matches = Array.from(slideIntegrationMap.entries()).filter(([, info]) => {
      const platform = (info.platform || "").toLowerCase().replace(/[_ ]/g, "-");

      if (inferredKey === "google-analytics") {
        return platform.includes("google-analytics") || platform === "google";
      }
      if (inferredKey === "google-search-console") {
        return platform.includes("google-search-console") || platform.includes("google-console");
      }
      if (inferredKey === "google-ads") {
        return platform.includes("google-ads");
      }
      if (inferredKey === "meta-ads") {
        return platform.includes("meta-ads");
      }
      if (inferredKey === "youtube") {
        return platform.includes("youtube");
      }
      if (inferredKey === "twitter") {
        return platform.includes("twitter");
      }
      if (inferredKey === "linkedin") {
        return platform.includes("linkedin");
      }
      if (inferredKey === "meta-instagram" || inferredKey === "meta-facebook") {
        return (
          platform.includes("meta-business") ||
          platform.includes("metabusiness") ||
          platform.includes("meta-instagram") ||
          platform.includes("meta-facebook") ||
          platform.includes("instagram") ||
          platform.includes("facebook")
        );
      }

      return false;
    });

    if (matches.length === 0) return null;

    if (inferredKey === "meta-instagram" || inferredKey === "meta-facebook") {
      const lowerTitle = (titleHint || "").toLowerCase();
      const wantInstagram = inferredKey === "meta-instagram" || lowerTitle.includes("instagram");
      const preferred = matches.find(([, info]) => {
        const slideTitle = (info.slideTitle || "").toLowerCase();
        return wantInstagram ? slideTitle.includes("instagram") : (slideTitle.includes("facebook") || !slideTitle.includes("instagram"));
      });
      if (preferred) {
        const [frontendId, info] = preferred;
        return { frontendId, info };
      }
    }

    const [frontendId, info] = matches[0];
    return { frontendId, info };
  }, [slideIntegrationMap, inferIntegrationKeyFromWidget]);

  const getIntegrationInfoForSlideId = useCallback((id: number) => {
    const direct = slideIntegrationMap.get(id);
    if (direct) return { frontendId: id, info: direct };

    const frontendId = resolveFrontendSlideId(id);
    const viaMapped = slideIntegrationMap.get(frontendId);
    if (viaMapped) return { frontendId, info: viaMapped };

    return null;
  }, [slideIntegrationMap, resolveFrontendSlideId]);

  const getIntegrationInfoForSlideIdOrWidgets = useCallback((
    id: number,
    widgets: DashboardLayout[] | undefined,
    titleHint?: string
  ) => {
    const byId = getIntegrationInfoForSlideId(id);
    if (byId) return byId;
    return inferIntegrationInfoFromWidgets(widgets, titleHint);
  }, [getIntegrationInfoForSlideId, inferIntegrationInfoFromWidgets]);

  // Ref to track if we've hydrated this specific template to prevent re-hydration
  const hydratedTemplateIdRef = useRef<number | null>(null);

  // Ã¢Å“â€¦ FIX 1: Clean Hydration Logic
  useEffect(() => {
    if (!templateQuery.data) return;

    // CRITICAL FIX: Wait for integrations to load so we can properly rescue/map IDs
    // If we hydrate before integrations are known, all backend integration slides 
    // will be treated as "Custom Pages" (because they aren't in the map yet), 
    // causing ID mismatch and duplicates on save.
    if (!readOnly && (isLoadingIntegrations || !integrationsData || !integrationsData.integrations)) {
      console.log(`Ã¢ÂÂ³ [Hydration] Waiting for integrations... (Loading: ${isLoadingIntegrations}, Data: ${!!integrationsData})`);
      return;
    }

    // CRITICAL FIX: Only run hydration once per template to avoid resetting local state
    // Check EITHER isDashboardsInitialized OR the ref to handle remounts in Strict Mode
    // Use OR logic so that even if isDashboardsInitialized is reset, the ref prevents re-hydration
    if (isDashboardsInitialized || hydratedTemplateIdRef.current === templateId) {
      console.log(`Ã¢ÂÂ­Ã¯Â¸Â [Hydration] Skipping - already hydrated templateId ${templateId}`);
      return;
    }

    // Restore saved date range if available
    if ((templateQuery.data as any).defaultDateFrom && (templateQuery.data as any).defaultDateTo) {
      const savedPreset = (templateQuery.data as any).datePreset;
      if (savedPreset) {
        setDatePreset(savedPreset);
      }

      if (readOnly && savedPreset) {
        const dynamicRange = getRangeFromPreset(savedPreset);
        if (dynamicRange && dynamicRange.from && dynamicRange.to) {
          console.log(`Ã°Å¸â€œâ€¦ [Dynamic Dates] Applied preset '${savedPreset}':`, dynamicRange);
          setDateRange(dynamicRange);
        } else {
          const from = new Date((templateQuery.data as any).defaultDateFrom);
          const to = new Date((templateQuery.data as any).defaultDateTo);
          if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
            setDateRange({ from, to });
          }
        }
      } else {
        const from = new Date((templateQuery.data as any).defaultDateFrom);
        const to = new Date((templateQuery.data as any).defaultDateTo);
        if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
          setDateRange(prev => {
            if (prev?.from?.getTime() === from.getTime() && prev?.to?.getTime() === to.getTime()) {
              return prev;
            }
            return { from, to };
          });
        }
      }
    }

    const numIntegrations = integrationsData?.integrations?.length ?? 0;
    console.log('Ã°Å¸Â§Â¹ [Hydration] Starting cleanup. Integrations:', numIntegrations);

    let cleanedSlidesMeta: ReportSlideMeta[] = [];

    if (Array.isArray(templateQuery.data.slidesMeta)) {
      let rawSlidesMeta = [...templateQuery.data.slidesMeta];

      // CRITICAL FIX: Sort slidesMeta according to the saved pageOrder!
      // The backend 'pageOrder' array is the source of truth for sorting.
      // slidesMeta array itself might be returned in arbitrary DB insertion order.
      if (templateQuery.data.pageOrder && templateQuery.data.pageOrder.length > 0) {
        const orderMap = new Map<number, number>();
        templateQuery.data.pageOrder.forEach((id: number, index: number) => {
          orderMap.set(Number(id), index);
        });

        console.log(`Ã°Å¸â€œÅ  [Hydration] Sorting slides based on pageOrder (Count: ${templateQuery.data.pageOrder.length})`);

        rawSlidesMeta.sort((a: any, b: any) => {
          const idA = Number(a.id);
          const idB = Number(b.id);

          const hasA = orderMap.has(idA);
          const hasB = orderMap.has(idB);

          if (hasA && hasB) {
            return orderMap.get(idA)! - orderMap.get(idB)!;
          }

          // If one is missing from the order, put it at the end? 
          // Or keep original relative order?
          // Default to putting at end, but use a stable sort for the unknown ones.
          if (hasA) return -1;
          if (hasB) return 1;

          return 0;
        });
      }

      // Ã¢Å“â€¦ STEP 1: Build valid slide IDs set using slideIntegrationMap
      const validSlideIds = new Set<number>();
      // Add all slide IDs from slideIntegrationMap (handles multi-slide integrations)
      slideIntegrationMap.forEach((_, slideId) => {
        validSlideIds.add(slideId);
      });

      rawSlidesMeta.forEach((slide: any) => {
        const sId = Number(slide.id);

        // Add ALL pages with ID >= 1000 as custom pages, regardless of their source field
        // This handles cases where backend incorrectly marks custom pages as 'integration'
        if (sId >= 1000) {
          console.log('Ã°Å¸â€Â [Validation] Adding high-ID page to validSlideIds:', sId, 'source:', slide.source, 'title:', slide.title);
          validSlideIds.add(sId);
        }
      });

      console.log(`Ã°Å¸â€Â [Hydration] Current deletedSlideIds:`, Array.from(deletedSlideIds));

      // Ã°Å¸â€Â DIAGNOSTIC: Check for Instagram slides in deleted list
      const deletedInstagramSlides = Array.from(deletedSlideIds).filter(id => {
        const slideInfo = slideIntegrationMap.get(id);
        return slideInfo?.platform?.toLowerCase().includes('instagram');
      });
      if (deletedInstagramSlides.length > 0) {
        console.warn(`Ã¢Å¡Â Ã¯Â¸Â [Hydration] Instagram slides in deleted list:`, deletedInstagramSlides);
      }

      // Ã¢Å“â€¦ STEP 2: Filter out ghost slides and explicitly deleted slides
      cleanedSlidesMeta = rawSlidesMeta.filter((slide: any) => {
        const sId = Number(slide.id);

        // Reject if explicitly deleted by user (frontend ID match)
        if (deletedSlideIds.has(sId)) {
          console.log(`Ã°Å¸â€”â€˜Ã¯Â¸Â [Hydration] Removing deleted slide: ID=${sId}, Title="${slide.title}"`);
          return false;
        }

        // Ã¢Å“â€¦ CRITICAL FIX: cross-reference against frontend slots
        if (slide.source === 'integration' && slide.integrationIndex !== undefined && slide.integrationIndex !== null) {
          const slideIntegIdx = Number(slide.integrationIndex);
          for (const deletedFrontendId of deletedSlideIds) {
            const info = slideIntegrationMap.get(deletedFrontendId);
            if (!info || info.originalIndex !== slideIntegIdx) continue;

            const siblingCount = Array.from(slideIntegrationMap.values())
              .filter(i => i.originalIndex === slideIntegIdx).length;

            if (siblingCount <= 1) {
              console.log(`Ã°Å¸â€”â€˜Ã¯Â¸Â [Hydration] Blocking backend slide ${sId} Ã¢â‚¬â€ integration index ${slideIntegIdx} was explicitly deleted as frontend slot ${deletedFrontendId}`);
              return false;
            }

            const slideTitle = (slide.title || '').toLowerCase();
            const deletedTitle = (info.slideTitle || '').toLowerCase();
            const sameKind =
              (slideTitle.includes('instagram') && deletedTitle.includes('instagram')) ||
              (slideTitle.includes('facebook') && deletedTitle.includes('facebook')) ||
              // Fix non-Meta Business slides that share an index (should be rare)
              (!slideTitle.includes('instagram') && !slideTitle.includes('facebook') &&
                !deletedTitle.includes('instagram') && !deletedTitle.includes('facebook'));

            if (sameKind) {
              console.log(`Ã°Å¸â€”â€˜Ã¯Â¸Â [Hydration] Blocking backend multi-slide ${sId} ("${slide.title}") Ã¢â‚¬â€ matches deleted slot ${deletedFrontendId} ("${info.slideTitle}")`);
              return false;
            }
          }
        }

        // Reject if not in valid set
        if (!validSlideIds.has(sId)) {
          // Ã°Å¸â€Â¥ FIX: Allow 'integration' source slides to pass through even if ID mismatch.
          // They might be Backend IDs (e.g. 5503) that map to a valid integration (e.g. 0).
          // We let the ID Mapping logic (Step 4) decide if they are valid.
          if (slide.source === 'integration') return true;

          // Ã°Å¸â€Â§ FIX: Allow custom pages through regardless of their backend ID.
          // Custom pages with backend-assigned IDs < 1000 were being incorrectly dropped here.
          // The id >= 1000 check only applies to FRONTEND IDs, not backend DB IDs.
          if (slide.source === 'custom') {
            console.log(`Ã¢Å“â€¦ [Hydration] Preserving custom page (source=custom): ID=${sId}, Title="${slide.title}"`);
            return true;
          }

          console.log(`Ã°Å¸â€˜Â» [Hydration] Removing ghost slide: ID=${sId}, Title="${slide.title}", Source=${slide.source}`);
          return false;
        }

        return true;
      });

      // Ã¢Å“â€¦ STEP 3: Update customPages with cleaned data
      setCustomPages((prev) => {
        // Ã°Å¸â€Â§ FIX: Remove the `id >= 1000` guard Ã¢â‚¬â€ this was designed for frontend IDs only.
        // After a save+refresh, backend assigns its own DB IDs which may be < 1000.
        // Trust the `source === 'custom'` field as the source of truth.
        const fromBackend = cleanedSlidesMeta
          .filter((slide: any) => slide.source === 'custom')
          .map((slide: any) => ({
            id: Number(slide.id),
            name: slide.title,
            subtitle: slide.subtitle,
          }));

        const backendIds = new Set(fromBackend.map((p: any) => p.id));
        const preservedLocal = prev.filter((p: any) => !backendIds.has(p.id));
        return [...preservedLocal, ...fromBackend];
      });
    }

    // Populate widgets map
    console.log(`Ã°Å¸â€â€ž [Hydration] Loading ${templateQuery.data.widgets?.length || 0} widgets from database`);
    console.log(`Ã°Å¸â€â€ž [Hydration] Widget slideIds:`,
      (templateQuery.data.widgets ?? []).map((w: any) => w.layout?.slideId).filter((id: number, i: number, arr: number[]) => arr.indexOf(id) === i)
    );
    const map = buildDashboardMapFromTemplate(
      (templateQuery.data.widgets ?? []) as ReportWidgetDefinition[]
    );

    // Ensure all integration slides have dashboards (even if empty), unless explicitly deleted
    // This fixes reports that were created with missing slides
    if (!readOnly && integrationsData?.integrations) {
      // Use slideIntegrationMap to create dashboards for all slides (handles multi-slide integrations)
      slideIntegrationMap.forEach((_, slideId) => {
        // Ã°Å¸â€ Â§ CRITICAL FIX: Check if this "Frontend Slide ID" (e.g. 0) is already mapped to a "Backend Slide ID" (e.g. 5946)
        // If it is, we check if the DASHBOARD for that Backend ID exists.
        // We only create a new dashboard if the slot is truly empty.

        let shouldCreate = false;
        if (backendIdMap.current.has(slideId)) {
          const mappedBackendId = backendIdMap.current.get(slideId)!;
          if (!map.has(mappedBackendId)) {
            shouldCreate = true; // Mapped ID exists but no dashboard? Weird, but create it.
          }
        } else {
          // No backend mapping found. 
          // BUT wait! The deduplication loop above POPULATES backendIdMap.
          // If we are here, it means this integration slot was NOT claimed by any backend slide.
          // So we should create it.
          if (!map.has(slideId)) {
            shouldCreate = true;
          }
        }

        if (shouldCreate && !deletedSlideIds.has(slideId)) {
          const info = slideIntegrationMap.get(slideId);
          console.log(`Ã°Å¸â€œÂ  [Hydration] Creating missing dashboard for slide ${slideId} (${info?.platform || 'unknown'})`);
          
          // Ã°Å¸â€ Â§ CRITICAL FIX: Populate with default widgets instead of an empty array!
          let defaultWidgets: DashboardLayout[] = [];
          if (info && integrationsData?.integrations?.[info.originalIndex]) {
            const integration = integrationsData.integrations[info.originalIndex];
             defaultWidgets = buildDefaultWidgetsForIntegration(
              slideId,
              [], // No metrics yet, builder will handle cold-start
              integration.platform,
              integration.accountId,
              info.subSlideIndex
            );
          }
          
          map.set(slideId, defaultWidgets);

          // Also map it to itself since it's a new "frontend-only" slide for now
          if (!backendIdMap.current.has(slideId)) {
            backendIdMap.current.set(slideId, slideId);
          }
        }
      });
    }

    // SHARED / READ-ONLY MODE
    if (readOnly) {
      // Deduplicate slides: widgets may have stale frontend slideIds (0, 1)
      // while slidesMeta uses backend DB IDs (5503, 5504). Both get created in
      // the map, producing duplicate integration slides in the shared view.
      //
      // NOTE: We only run the merge when there are MORE map entries than slidesMeta
      // entries. Running it unconditionally caused integration-based merging to
      // STACK widgets from multiple orphan slides into the same target (3x bug).
      const slidesMetaIds = new Set<number>(
        (templateQuery.data.slidesMeta || []).map((s: any) => Number(s.id))
      );

      if (slidesMetaIds.size > 0 && map.size > slidesMetaIds.size) {
        const orphanedSlideIds: number[] = [];
        map.forEach((_, slideId) => {
          if (!slidesMetaIds.has(slideId)) orphanedSlideIds.push(slideId);
        });

        console.log(`🔍 [SharedDedup] ${orphanedSlideIds.length} orphan slides to merge:`, orphanedSlideIds);

        orphanedSlideIds.forEach(orphanId => {
          const orphanWidgets = map.get(orphanId) || [];
          if (orphanWidgets.length === 0) { map.delete(orphanId); return; }

          // Normalise integration string for comparison
          const norm = (s: string) => (s || '').toLowerCase().replace(/[_\- ]/g, '');
          const orphanInteg = norm(orphanWidgets[0].metricConfig?.integration || '');

          // Find the slidesMeta entry whose widgets share the same integration
          let targetSlideId: number | null = null;
          for (const metaId of slidesMetaIds) {
            const existing = map.get(metaId);
            if (!existing || existing.length === 0) continue;
            const existingInteg = norm(existing[0].metricConfig?.integration || '');
            // Match exact or Meta sub-integrations to the same slide
            if (existingInteg === orphanInteg) { targetSlideId = metaId; break; }
          }

          if (targetSlideId !== null) {
            const existing = map.get(targetSlideId) || [];
            const existingKeys = new Set(existing.map(w => w.metricConfig?.metricKey));
            const newWidgets = orphanWidgets.filter(w => !existingKeys.has(w.metricConfig?.metricKey));
            if (newWidgets.length > 0) {
              map.set(targetSlideId, [...existing, ...newWidgets]);
            }
            console.log(`🔗 [SharedDedup] Merged orphan slide ${orphanId} → ${targetSlideId} (${newWidgets.length} new widgets)`);
          } else {
            console.log(`🗑️ [SharedDedup] Removing orphan slide ${orphanId} (no matching slidesMeta target)`);
          }
          map.delete(orphanId);
        });
      }

      setDashboards(map);

      // Build page order, strictly filtered to only IDs that exist in both the map
      // AND slidesMeta. This prevents stale frontend IDs (0, 1, 2…) from appearing
      // as extra/blank slides in the shared report sidebar.
      const validSlideIds: Set<number> | null = slidesMetaIds.size > 0
        ? new Set((Array.from(slidesMetaIds) as number[]).filter((id: number) => map.has(id)))
        : null;

      if (templateQuery.data.pageOrder && templateQuery.data.pageOrder.length > 0) {
        let order = templateQuery.data.pageOrder.map((id: any) => Number(id));

        // If validSlideIds is available, filter order to only known backend IDs.
        // This removes any stale frontend IDs (e.g., 0) from the rendered order.
        if (validSlideIds && validSlideIds.size > 0) {
          const filteredOrder = order.filter((id: number) => validSlideIds!.has(id));
          if (filteredOrder.length > 0) {
            // Some IDs in validSlideIds may be missing from pageOrder — append them
            const missing = Array.from(validSlideIds).filter((id: number) => !filteredOrder.includes(id));
            order = [...filteredOrder, ...missing];
          }
          // Fallback: if filtering removes everything, keep original order but log warning
          if (order.length === 0) {
            console.warn('[SharedDedup] pageOrder filter removed all slides, using map keys');
            order = Array.from(map.keys()).sort((a, b) => a - b);
          }
        } else if (order.includes(0) && !map.has(0) && map.size > 0) {
          // Legacy stale-0 fix (kept for backward compat)
          const mapKeys = Array.from(map.keys());
          const orphanedKeys = mapKeys.filter(k => !order.includes(k));
          if (orphanedKeys.length === 1) {
            order = order.map((id: number) => (id === 0 ? orphanedKeys[0] : id));
          } else {
            order = [...order.filter((id: number) => id !== 0), ...orphanedKeys];
          }
        }

        setPageOrder(order);
      } else {
        // No stored pageOrder — use validSlideIds if we have them, otherwise map keys
        const keys: number[] = validSlideIds && validSlideIds.size > 0
          ? Array.from(validSlideIds).sort((a: number, b: number) => a - b)
          : Array.from(map.keys()).sort((a: number, b: number) => a - b);
        setPageOrder(keys);
      }
      setIsDashboardsInitialized(true);
      return;
    }

    // RESCUE & MIGRATION LOGIC (Simplified but robust)
    const idMapping = new Map<number, number>();
    const pendingMoves: Array<{ from: number; to: number }> = [];

    // Clear backend ID map on fresh hydration
    backendIdMap.current.clear();

    // Initialize ref to max existing ID + 1 to ensure uniqueness
    const maxExistingId = Math.max(...Array.from(map.keys()), 999);
    nextCustomIdRef.current = maxExistingId + 1;

    // Ã¢Å“â€¦ Backend now returns accurate source field - no correction needed!
    console.log('Ã°Å¸â€ Â  [Hydration] slidesMeta from backend:', cleanedSlidesMeta.map(s => ({
      id: s.id,
      source: s.source,
      integrationIndex: s.integrationIndex,
      title: s.title
    })));

    console.log('Ã°Å¸â€ Â  [ID Mapping] cleanedSlidesMeta AFTER correction:', cleanedSlidesMeta.map(s => ({ id: s.id, source: s.source, integrationIndex: s.integrationIndex })));

    // Remap backend IDs to integration indices
    cleanedSlidesMeta.forEach(slide => {
      const bId = Number(slide.id); // This IS the backend database ID
      const iIdx = slide.integrationIndex;

      console.log(`Ã°Å¸â€ Â  [ID Mapping] Slide ${bId}: source="${slide.source}", integrationIndex=${iIdx}, typeof iIdx=${typeof iIdx}`);

      // CRITICAL: Never remap custom pages (ID >= 1000 with source === 'custom')
      if (bId >= 1000 && slide.source === 'custom') {
        console.log('Ã°Å¸â€ Â  [ID Mapping] Skipping custom page:', bId);
        // For custom pages, the ID is already the DB ID (if hydrated from DB)
        // or a temp ID (if created locally). We map it 1:1.
        backendIdMap.current.set(bId, bId);
        idMapping.set(bId, bId); // Ã¢Å“â€¦ Explicitly mark as mapped to avoid any fallback logic
        return;
      }

      if (slide.source === 'integration' && typeof iIdx === 'number') {
        console.log(`Ã°Å¸â€ Â  [ID Mapping] Processing integration slide: bId=${bId}, iIdx=${iIdx}`);
        // Ã°Å¸â€ Â§ CRITICAL FIX: For multi-slide integrations (e.g., Meta Business with Facebook + Instagram),
        // we need to map ALL sub-slides, not just subSlideIndex 0.
        // Find ALL frontend IDs for this integration index
        const matchingSlides: Array<{ frontendId: number; subSlideIndex: number }> = [];

        for (const [sId, info] of slideIntegrationMap.entries()) {
          if (info.originalIndex === iIdx) {
            matchingSlides.push({ frontendId: sId, subSlideIndex: info.subSlideIndex });
          }
        }

        if (matchingSlides.length === 0) {
          console.warn(`Ã¢Å¡Â Ã¯Â¸Â  [ID Mapping] Could not find any frontend IDs for integration index ${iIdx}! Attempting stable ID recovery...`);
        }

        // Ã¢Å“â€¦ STABLE ID RECOVERY & DISAMBIGUATION
        // Even if integrationIndex matches (or doesn't), we MUST verify by widget content
        // to prevent GA widgets from ending up on GSC slides if indices shift.
        const slideWidgets = map.get(bId) || [];
        const firstWidget = slideWidgets[0] as any;
        const widgetPlatform = (firstWidget?.metricConfig?.integration || firstWidget?.integration || '').toLowerCase().replace(/[_-]/g, '');
        const widgetAccountId = firstWidget?.metricConfig?.accountId || firstWidget?.accountId;

        let matchingSlide: { frontendId: number; subSlideIndex: number } | undefined;

        if (slideWidgets.length > 0) {
          console.log(`Ã°Å¸â€ Â  [ID Mapping] Slide ${bId} widget content: platform="${widgetPlatform}", accountId="${widgetAccountId}"`);

          const stableMatch = Array.from(slideIntegrationMap.entries()).find(([_fId, info]) => {
            const infoPlatform = (info.platform || '').toLowerCase().replace(/[_-]/g, '');
            const infoAccountId = info.accountId;

            // Check if platform matches
            const platformEquals = infoPlatform === widgetPlatform;
            const isGoogleMatch = (infoPlatform.includes('google') && widgetPlatform.includes('google'));

            const platformMatches = platformEquals || (isGoogleMatch && (
              (infoPlatform.includes('analytics') && widgetPlatform.includes('analytics')) ||
              (infoPlatform.includes('console') && widgetPlatform.includes('console')) ||
              (infoPlatform.includes('ads') && widgetPlatform.includes('ads'))
            ));

            // Mandatory Account ID match if both have it
            if (widgetAccountId && infoAccountId && widgetAccountId !== infoAccountId) return false;

            // LinkedIn is single-slide — match by platform directly
            if (infoPlatform.includes('linkedin') && widgetPlatform.includes('linkedin')) return true;
            if (infoPlatform.includes('linkedin') !== widgetPlatform.includes('linkedin')) return false;

            // For multi-slide integrations (Meta), also check against slide titles
            if (infoPlatform.includes('meta') || infoPlatform.includes('facebook') || infoPlatform.includes('instagram')) {
              const infoTitle = (info.slideTitle || '').toLowerCase();
              const isInstagramContent = widgetPlatform.includes('instagram') ||
                slideWidgets.some(w => (w.metricConfig?.metricKey || '').toLowerCase().includes('instagram'));

              if (isInstagramContent) return infoTitle.includes('instagram');
              return infoTitle.includes('facebook') || !infoTitle.includes('instagram');
            }

            return platformMatches;
          });

          if (stableMatch) {
            const [stableFId] = stableMatch;
            if (!deletedSlideIds.has(stableFId)) {
              matchingSlide = { frontendId: stableFId, subSlideIndex: slideIntegrationMap.get(stableFId)!.subSlideIndex };
              console.log(`Ã¢Å“â€¦ [ID Mapping] Stable match found for slide ${bId}: platform="${widgetPlatform}" -> slot ${stableFId}`);
            } else {
              console.log(`Ã°Å¸â€”â€˜Ã¯Â¸Â  [ID Mapping] Stable match for slide ${bId} is a DELETED slot (${stableFId}) Ã¢â‚¬â€  skipping`);
            }
          }
        }

        // Fallback to index-based if no stable match found and indices exist
        if (!matchingSlide && matchingSlides.length > 0) {
          matchingSlide = matchingSlides.find(s => !deletedSlideIds.has(s.frontendId)) || matchingSlides[0];
          console.log(`Ã¢Å¡Â Ã¯Â¸Â  [ID Mapping] Fallback to index-based mapping for slide ${bId} -> slot ${matchingSlide.frontendId}`);
        }

        if (matchingSlide) {
          const fId = matchingSlide.frontendId;

          // Ã¢Å“â€¦ CRITICAL FIX: Only push to pendingMoves if this frontend slot hasn't been claimed yet.
          // Without this guard, BOTH sub-slides of a multi-slide integration (e.g. 5503=Facebook
          // and 5504=Instagram) would both push {to: FacebookSlot}, merging Instagram into Facebook.
          // The second sub-slide stays with its backend key and is handled by the rescue loop.
          if (!backendIdMap.current.has(fId)) {
            backendIdMap.current.set(fId, bId);
            console.log(`Ã°Å¸â€ â€” [BackendIdMap] Mapped Frontend ${fId} (subSlide ${matchingSlide.subSlideIndex}) -> Backend ${bId}`);

            if (bId !== fId) {
              console.log('Ã°Å¸â€ Â  [ID Mapping] Mapping integration page:', bId, '->', fId);
              pendingMoves.push({ from: bId, to: fId });
              idMapping.set(bId, fId);
            }
          } else {
            console.warn(`Ã¢Å¡Â Ã¯Â¸Â  [BackendIdMap] Frontend ${fId} already claimed by ${backendIdMap.current.get(fId)}, leaving bId ${bId} for rescue loop`);
            // Do NOT push to pendingMoves Ã¢â‚¬â€  rescue loop will handle this correctly
          }
        } else {
          console.warn(`Ã¢Å¡Â Ã¯Â¸Â  [ID Mapping] Could not find frontend ID for integration ${iIdx}!`);
        }
      } else if (bId < 1000 && !slide.source) {
        // Legacy: ID < 1000 is integration index 0
        console.log('Ã°Å¸â€ Â  [ID Mapping] Legacy mapping:', bId);
        idMapping.set(bId, bId);
        // For legacy where ID matched index, map 1:1
        backendIdMap.current.set(bId, bId);
      }
    });

    console.log(`Ã°Å¸â€ Â  [ID Mapping] backendIdMap AFTER forEach:`, Array.from(backendIdMap.current.entries()));

    // Execute Moves
    pendingMoves.forEach(move => {
      const widgets = map.get(move.from);
      if (widgets && widgets.length > 0 && integrationsData?.integrations) {
        // Ã¢Å“â€¦ NEW: Validate that widgets actually belong to the target platform
        const targetIntegration = integrationsData.integrations[move.to];
        if (targetIntegration) {
          const normalize = (s: string) => s.toLowerCase().replace(/[ _-]/g, '');
          const targetPlatform = normalize(targetIntegration.platform);

          const allMatch = widgets.every(w => {
            const wInt = normalize(w.metricConfig?.integration || '');
            if (wInt === targetPlatform) return true;
            if (targetPlatform === 'metabusiness' && (wInt === 'metafacebook' || wInt === 'metainstagram')) return true;
            if (targetPlatform === 'googleanalytics' && (wInt === 'google' || wInt === 'googleanalytics')) return true;
            if (targetPlatform === 'googlesearchconsole' && (wInt === 'googleconsole' || wInt === 'googlelandingpages')) return true;
            if (targetPlatform === 'linkedin' && wInt === 'linkedin') return true;
            return false;
          });

          if (!allMatch) {
            console.log(`Ã¢Â Å’ [Migration] Rejecting move from ${move.from} to ${move.to}: Widget integration mismatch`);
            return; // Leave widgets in ghost slide for content-based rescue to find later
          }
        }

        const updated = widgets.map(w => {
          const updatedW = { ...w, slideId: move.to } as any;
          if (updatedW.layout) updatedW.layout = { ...updatedW.layout, slideId: move.to };
          if (updatedW.metricConfig?.layout) {
            updatedW.metricConfig.layout = { ...updatedW.metricConfig.layout, slideId: move.to };
          }
          return updatedW;
        });
        const existing = map.get(move.to) || [];
        map.set(move.to, [...existing, ...updated]);
        map.delete(move.from);
      }
    });

    // Ã¢Å“â€¦ DELETED SLIDE CLEANUP: After all moves, wipe any frontend slot that was
    // explicitly deleted by the user. Without this, dedupeSlides correctly routes
    // Instagram widgets to slot 4 (good!), but if slot 4 was user-deleted, those
    // widgets silently reappear.
    deletedSlideIds.forEach(deletedFrontendId => {
      if (map.has(deletedFrontendId)) {
        console.log(`Ã°Å¸â€”â€˜Ã¯Â¸Â  [Hydration] Clearing user-deleted slide slot ${deletedFrontendId} from map`);
        map.delete(deletedFrontendId);
      }
    });

    // Content-Based Reclamation Ã¢â‚¬â€  rescue orphaned widgets from ghost slides
    // CRITICAL: Skip slides that are legitimate custom pages in cleanedSlidesMeta
    const cleanedSlideIdSet = new Set(cleanedSlidesMeta.map(m => Number(m.id)));

    // Ã¢Å¸â€ Â§ CRITICAL FIX: Also get all backend IDs to avoid treating them as ghost slides
    const backendSlideIds = new Set(cleanedSlidesMeta.map(m => Number(m.id)));


    console.log(`Ã°Å¸â€ Â  [Rescue] cleanedSlideIdSet:`, Array.from(cleanedSlideIdSet));
    console.log(`Ã°Å¸â€ Â  [Rescue] map.keys():`, Array.from(map.keys()));

    map.forEach((widgets, sId) => {
      console.log(`Ã°Å¸â€ Â  [Rescue] Checking slide ${sId}: inCleanedSet=${cleanedSlideIdSet.has(sId)}, hasWidgets=${widgets.length > 0}`);

      // Ã¢Å¸â€ Â§ CRITICAL FIX: Skip rescue logic for frontend IDs (< 1000)
      // These are legitimate integration slides that just need ID mapping, not content reclamation
      if (sId < 1000) {
        console.log(`Ã°Å¸â€ Â  [Rescue] Skipping frontend ID ${sId} - not a ghost slide`);
        return;
      }

      // Ã¢Å¸â€ Â§ CRITICAL FIX: Skip rescue for legitimate CUSTOM PAGES.
      // The rescue logic moves widgets to integration slots based on their `integration` field.
      // But custom pages can also contain metric widgets Ã¢â‚¬â€  those must NOT be moved.
      // A custom page is confirmed if it appears in cleanedSlidesMeta with source='custom'.
      const isConfirmedCustomPage = cleanedSlidesMeta.some(
        (m: any) => Number(m.id) === sId && m.source === 'custom'
      );
      if (isConfirmedCustomPage) {
        console.log(`Ã¢Å“â€¦ [Rescue] Skipping confirmed custom page ID ${sId} - preserving its widgets`);
        return;
      }

      // Ã¢Å¸â€ Â§ CRITICAL FIX: Allow rescue logic for ANY slide ID > 1000 that looks like an integration slide
      // Whether it's in cleanedSlideIdSet (Active) or not (Ghost), we want to map it correctly.
      if (sId >= 1000 && widgets.length > 0) {
        const firstInt = widgets[0].metricConfig?.integration;
        if (firstInt && integrationsData?.integrations) {
          const normalize = (s: string) => s.toLowerCase().replace(/[ _-]/g, '');
          const widgetIntNormalized = normalize(firstInt);

          const matchIdx = integrationsData.integrations.findIndex(i => {
            const plat = normalize(i.platform);
            return plat === widgetIntNormalized ||
              (plat === 'woocommerce' && widgetIntNormalized === 'woo') ||
              (plat === 'googlesearchconsole' && widgetIntNormalized === 'googleconsole') ||
              (plat === 'twitter' && widgetIntNormalized === 'twitter') ||
              (plat === 'linkedin' && widgetIntNormalized === 'linkedin') ||
              (plat === 'metabusiness' && ['metafacebook', 'metainstagram'].includes(widgetIntNormalized));
          });

          if (matchIdx !== -1) {
            const targetPlatform = normalize(integrationsData.integrations[matchIdx].platform);

            // Ã¢Å¸â€ Â§ FIX: For multi-slide integrations (e.g. Meta Business with Facebook + Instagram),
            // `matchIdx` is the integration ARRAY INDEX (same for both sub-slides).
            // We must find the correct SUB-SLIDE frontend ID from slideIntegrationMap
            // based on the widget's specific integration string (e.g. meta-instagram Ã¢â€ â€™ slot 1).
            let targetFrontendId = matchIdx; // Default: 1:1 for single-slide integrations

            const subSlides: Array<{ fId: number; info: any }> = [];
            slideIntegrationMap.forEach((info, fId) => {
              if (info.originalIndex === matchIdx) subSlides.push({ fId, info });
            });

            if (subSlides.length > 1) {
              // Multi-slide: disambiguate by matching widget integration against slide title
              const isInstagramWidget =
                widgetIntNormalized.includes('instagram') ||
                widgets.some(w => (w.metricConfig?.metricKey || '').includes('instagram'));

              const matched = subSlides.find(({ info }) => {
                const titleLower = (info.slideTitle || '').toLowerCase();
                if (isInstagramWidget) return titleLower.includes('instagram');
                return titleLower.includes('facebook') || !titleLower.includes('instagram');
              });

              if (matched) {
                targetFrontendId = matched.fId;
                console.log(`Ã°Å¸â€ Â§ [Rescue] Multi-slide disambiguation: ${sId} Ã¢â€ â€™ slot ${targetFrontendId} (${isInstagramWidget ? 'instagram' : 'facebook'})`);
              }
            } else if (subSlides.length === 1) {
              targetFrontendId = subSlides[0].fId;
            }

            // Ã¢Å“â€¦ NEW: Strict validation for ALL widgets in this ghost slide
            const allMatch = widgets.every(w => {
              const wInt = normalize(w.metricConfig?.integration || '');
              if (wInt === targetPlatform) return true;
              if (targetPlatform === 'metabusiness' && (wInt === 'metafacebook' || wInt === 'metainstagram')) return true;
              if (targetPlatform === 'googleanalytics' && (wInt === 'google' || wInt === 'googleanalytics')) return true;
              if (targetPlatform === 'twitter' && wInt === 'twitter') return true;
              if (targetPlatform === 'linkedin' && wInt === 'linkedin') return true;
              return false;
            });

            if (allMatch) {
              console.log(`Ã°Å¸Â©Â¹ [Rescue] Reclaiming content from ${sId} to slot ${targetFrontendId}`);
              const existing = map.get(targetFrontendId) || [];
              const updatedWidgets = widgets.map(w => {
                const updatedW = { ...w, slideId: targetFrontendId } as any;
                if (updatedW.layout) updatedW.layout = { ...updatedW.layout, slideId: targetFrontendId };
                if (updatedW.metricConfig?.layout) {
                  updatedW.metricConfig.layout = { ...updatedW.metricConfig.layout, slideId: targetFrontendId };
                }
                return updatedW;
              });
              map.set(targetFrontendId, [...existing, ...updatedWidgets]);
              map.delete(sId);
              idMapping.set(sId, targetFrontendId);

              // CRITICAL: Ensure we persist this link for the next save!
              if (!backendIdMap.current.has(targetFrontendId)) {
                backendIdMap.current.set(targetFrontendId, sId);
                console.log(`Ã°Å¸â€ â€” [Rescue] Mapped Frontend ${targetFrontendId} Ã¢â€ â€™ Backend ${sId}`);
              } else {
                const existingBId = backendIdMap.current.get(targetFrontendId);
                if (existingBId !== sId) {
                  console.log(`Ã°Å¸â€ â€” [Rescue] Updating Frontend ${targetFrontendId} Ã¢â€ â€™ Backend ${sId} (was ${existingBId})`);
                  backendIdMap.current.set(targetFrontendId, sId);
                }
              }

            } else {
              console.log(`Ã¢Â Å’ [Rescue] Aborting rescue of ${sId}: mixed content detected`);
              // Only delete if it's NOT in the active set (truly ghost)
              if (!cleanedSlideIdSet.has(sId) && !backendSlideIds.has(sId)) {
                map.delete(sId);
              }
            }
          } else {
            // No matching integration: Delete orphaned content only if ghost
            if (!cleanedSlideIdSet.has(sId) && !backendSlideIds.has(sId)) {
              console.log(`Ã°Å¸â€”â€˜Ã¯Â¸Â  [Rescue] Deleting orphaned widgets from ${sId} (No match for ${firstInt})`);
              map.delete(sId);
            }
          }
        }
      }
    });

    // Ã°Å¸â€ Â§ CRITICAL: Also ensure this slide exists in dashboards Map
    slideIntegrationMap.forEach((info, sId) => {
      if (!map.has(sId)) {
        console.log(`Ã°Å¸â€ Â§ [Hydration] Adding dashboard for rescued slide ${sId} (${info.platform})`);
        
        let defaultWidgets: DashboardLayout[] = [];
        if (integrationsData?.integrations?.[info.originalIndex]) {
          const integration = integrationsData.integrations[info.originalIndex];
          defaultWidgets = buildDefaultWidgetsForIntegration(
            sId,
            [], // Metrics will load later
            integration.platform,
            integration.accountId,
            info.subSlideIndex
          );
        }
        map.set(sId, defaultWidgets);
      }
    });

    // Mark this template as hydrated to prevent re-hydration on remounts
    hydratedTemplateIdRef.current = templateId;

    // Rebuild processedSlidesMeta
    const finalMeta = cleanedSlidesMeta.map(m => {
      const targetId = idMapping.get(Number(m.id)) ?? Number(m.id);
      return { ...m, id: targetId };
    });

    // Deduplicate Meta and fix integration metadata
    const dedupedMeta: ReportSlideMeta[] = [];
    const seenIds = new Set<number>();

    console.log('Ã°Å¸â€ Â  [Hydration] finalMeta before deduplication:', finalMeta.map(m => ({ id: m.id, title: m.title, source: m.source })));

    // Ã¢Å¸â€ Â§ CRITICAL FIX: Deduplicate based on Integration Index ONLY. Title is mutable.
    // This prevents "Ghost" duplicates when a user renames an integration slide (e.g. "Facebook" -> "FB")
    const claimedSlots = new Set<string>();
    const claimedStableIds = new Set<string>();
    const getSlotKey = (idx: number) => `${idx}`;

    finalMeta.forEach(m => {
      // ... existing duplicate ID check ...
      if (seenIds.has(m.id)) {
        console.warn(`Ã¢Å¡Â Ã¯Â¸Â  [Hydration] Skipping duplicate slide ID ${m.id}`);
        return;
      }

      // --- 1. Custom Page Handling ---
      if (m.metadata?.originalSource === 'custom') {
        // ... custom page logic ...
        console.log('Ã°Å¸â€ Â  [Hydration] Preserving custom page (via metadata):', m.id, m.title);
        dedupedMeta.push(m);
        seenIds.add(m.id);
        return;
      }

      const hasExplicitIndex = typeof m.metadata?.integrationIndex === 'number' || (typeof m.integrationIndex === 'number' && m.integrationIndex >= 0);
      const isIntegrationSlide =
        m.source === 'integration' ||
        typeof m.metadata?.integrationIndex === 'number' ||
        (typeof m.integrationIndex === 'number' && m.integrationIndex >= 0);

      // --- 2. Rescue Logic (Legacy Custom -> Integration) ---
      // Only rescue if no explicit index is set. If explicit index exists, trust it!
      if (!hasExplicitIndex && (m.id >= 1000 || m.source === 'custom')) {
        // ... existing rescue logic ...
        let rescued = false;

        // Ã¢Å¸â€ Â§ NEW RESCUE LOGIC: Iterate ALL possible integration slots
        for (const [frontendId, info] of slideIntegrationMap.entries()) {
          const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
          const slideTitleNorm = normalize(m.title || '');
          const integrationTitleNorm = normalize(info.slideTitle || '');

          let isMatch = false;

          // 1. Exact Title Match
          if (slideTitleNorm === integrationTitleNorm) {
            isMatch = true;
          }
          // 2. Strong Substring Match (relaxed for "Meta Ads" etc)
          else if (slideTitleNorm.length > 4 && integrationTitleNorm.length > 4 && (slideTitleNorm.includes(integrationTitleNorm) || integrationTitleNorm.includes(slideTitleNorm))) {
            isMatch = true;
          }

          // Ã¢Å¸â€ºÂ¡Ã¯Â¸Â  REJECT Mismatches (e.g. Google title on Meta slide)
          if (isMatch) {
            const isMeta = info.platform?.toLowerCase().includes('meta') || info.platform?.toLowerCase().includes('facebook') || info.platform?.toLowerCase().includes('instagram');
            const isGoogle = info.platform?.toLowerCase().includes('google');

            if (isMeta && (slideTitleNorm.includes('google') || slideTitleNorm.includes('searchconsole'))) isMatch = false;
            if (isGoogle && (slideTitleNorm.includes('meta') || slideTitleNorm.includes('facebook') || slideTitleNorm.includes('instagram'))) isMatch = false;
          }

          if (isMatch) {
            const key = getSlotKey(info.originalIndex);

            if (claimedSlots.has(key)) {
              console.warn(`Ã°Å¸â€”â€˜Ã¯Â¸Â  [Hydration-Dedup] Skipping RESCUED duplicate for slot ${key} (Slide ID ${m.id})`);
              seenIds.add(m.id); // Mark seen so we don't process again
              return;
            }

            console.log(`Ã¢â€ºâ€˜Ã¯Â¸Â  [Hydration] Rescued Custom Slide ID ${m.id} -> Integration Slot ${key} (${info.slideTitle})`);

            dedupedMeta.push({
              ...m,
              source: 'integration' as const,
              integrationIndex: info.originalIndex,
              title: info.slideTitle,
              subtitle: info.accountName
            });

            claimedSlots.add(key);
            seenIds.add(m.id);
            rescued = true;

            // Map the frontend ID to this backend ID if not already mapped
            if (!backendIdMap.current.has(frontendId)) {
              backendIdMap.current.set(frontendId, m.id);
            }
            break; // Stop looking after first match
          }
        }
        if (rescued) return;

        // Fallback to custom
        dedupedMeta.push(m);
        seenIds.add(m.id);
        return;
      }

      // --- 3. Integration Slide Handling (Explicit or Metadata) ---
      const slideInfo = slideIntegrationMap.get(m.id);

      let integrationIdxFromMeta: number | undefined;


      // Determine Index
      if (typeof m.metadata?.integrationIndex === 'number') {
        integrationIdxFromMeta = m.metadata.integrationIndex;
      } else if (typeof m.integrationIndex === 'number' && m.integrationIndex >= 0) {
        integrationIdxFromMeta = m.integrationIndex;
      }

      if (slideInfo) {
        integrationIdxFromMeta = slideInfo.originalIndex;
      } else if (integrationIdxFromMeta !== undefined) {
        // Find platform info from index
        for (const [, info] of slideIntegrationMap.entries()) {
          if (info.originalIndex === integrationIdxFromMeta) {
            // Ã¢Å¸â€ºÂ¡Ã¯Â¸Â  MISMATCH CHECK: Does the slide Title match the Platform?
            // If slide title is "Google..." but index maps to "Meta", REJECT IT.
            const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normSlideTitle = normalize(m.title || '');
            const normPlatform = normalize(info.platform || '');
            const normRealTitle = normalize(info.slideTitle || '');

            // If title is totally different from platform, likely a corruption mismatch
            // Exception: "Integration" generic title
            if (normSlideTitle.length > 5 && !normSlideTitle.includes(normPlatform) && !normPlatform.includes(normSlideTitle) && !normRealTitle.includes(normSlideTitle)) {
              // Check for cross-platform contamination (e.g. Google title on Meta index)
              if (
                (normPlatform.includes('meta') && normSlideTitle.includes('google')) ||
                (normPlatform.includes('google') && normSlideTitle.includes('meta')) ||
                (normPlatform.includes('facebook') && normSlideTitle.includes('google'))
              ) {
                console.warn(`Ã°Å¸â€ºâ€˜ [Hydration-Mismatch] Rejecting corrupted slide ID ${m.id}. Title="${m.title}" but Index ${integrationIdxFromMeta} is ${info.platform}`);
                seenIds.add(m.id);
                return;
              }
            }
            break;
          }
        }
      }

      // Final Dedup Check for Integration Slides
      if (isIntegrationSlide) {
        const metaId = Number(m.id);
        const metaLayout = map.get(metaId) ?? map.get(resolveFrontendSlideId(metaId));
        const inferred = getIntegrationInfoForSlideIdOrWidgets(metaId, metaLayout, m.title);
        const stableId = inferred?.info?.stableId;

        if (stableId) {
          if (claimedStableIds.has(stableId)) {
            console.warn(`[Hydration-Dedup] Skipping duplicate integration slide ID ${m.id} for stableId ${stableId}`);
            seenIds.add(m.id);
            return;
          }
          claimedStableIds.add(stableId);
        } else if (integrationIdxFromMeta !== undefined) {
          const key = getSlotKey(integrationIdxFromMeta);
          if (claimedSlots.has(key)) {
            console.warn(`[Hydration-Dedup] Skipping duplicate integration slide ID ${m.id} for slot ${key}`);
            seenIds.add(m.id);
            return;
          }
          claimedSlots.add(key);
        }
      }



      // ... push logic ...
      if (slideInfo) {
        dedupedMeta.push({
          ...m,
          source: 'integration' as const,
          integrationIndex: slideInfo.originalIndex,
          title: slideInfo.slideTitle,
          subtitle: slideInfo.accountName,
        });
        seenIds.add(m.id);
      } else if (integrationIdxFromMeta !== undefined) {
        let found = false;
        for (const [, info] of slideIntegrationMap.entries()) {
          if (info.originalIndex === integrationIdxFromMeta) {
            dedupedMeta.push({
              ...m,
              source: 'integration' as const,
              integrationIndex: info.originalIndex,
              title: info.slideTitle,
              subtitle: info.accountName
            });
            seenIds.add(m.id);
            found = true;
            break;
          }
        }
        if (!found) {
          // Fallback
          dedupedMeta.push(m);
          seenIds.add(m.id);
        }
      } else {
        dedupedMeta.push(m);
        seenIds.add(m.id);
      }

    });

    // Safety: Ensure all current integrations exist (unless explicitly deleted)
    // Ã°Å¸â€ Â§ CRITICAL FIX: Also add to dashboards Map if missing
    slideIntegrationMap.forEach((info, sId) => {
      const slotKey = getSlotKey(info.originalIndex);

      // Ã°Å¸â€ºÂ¡Ã¯Â¸Â  CRITICAL FIX: Only create if slot is NOT claimed by ANY slide (backend or custom-rescue)
      if (!claimedSlots.has(slotKey) && !seenIds.has(sId) && !deletedSlideIds.has(sId)) {
        console.log(`Ã¢Å¾â€¢ [Hydration] Adding missing integration slide for slot ${slotKey} (Frontend ID ${sId})`);

        dedupedMeta.push({
          id: sId,
          // templateId, columns, data removed to fix type error
          title: info.slideTitle,
          subtitle: info.accountName,
          source: 'integration' as const,
          integrationIndex: info.originalIndex
        });

        // Mark as claimed so we don't duplicate if map has multiple entries for same slot
        claimedSlots.add(slotKey);

        // Map the frontend ID to itself since it finds no backend ID
        backendIdMap.current.set(sId, sId);

        // Ã°Å¸â€ Â§ CRITICAL: Also ensure this slide exists in dashboards Map
        if (!map.has(sId)) {
          console.log(`Ã°Å¸â€ Â§ [Hydration] Adding empty dashboard for slide ${sId}`);
          map.set(sId, []);
        }

        // Ã°Å¸â€ Â§ CRITICAL: Ensure backendIdMap is populated for this slide
        // For new/missing slides, frontend ID = backend ID initially
        if (!backendIdMap.current.has(sId)) {
          backendIdMap.current.set(sId, sId);
          console.log(`Ã°Å¸â€ â€” [Hydration] Auto-mapped Frontend ${sId} -> Backend ${sId}`);
        } else {
          console.log(`Ã°Å¸â€ â€” [Hydration] Skipping auto-map for Frontend ${sId}, already mapped to Backend ${backendIdMap.current.get(sId)}`);
        }
      }
    });

    console.log(`Ã°Å¸â€ Â  [Hydration] backendIdMap AFTER auto-population:`, Array.from(backendIdMap.current.entries()));

    // Ã°Å¸â€ Â§ CRITICAL: Set the hydrated dashboards map to state
    // This was missing! The comment at line 1168 said it would be called after auto-population,
    // but it was never added. Without this, all the hydration work above is discarded.
    // Ã°Å¸â€ Â§ CRITICAL FIX: Ensure ALL slides (including empty Custom Pages) are in dashboards map
    // The previous logic only populated map from 'widgets' or 'slideIntegrationMap',
    // skipping empty Custom Pages which caused them to disappear from the sidebar (ghosted).
    dedupedMeta.forEach(m => {
      if (!map.has(m.id)) {
        console.log(`Ã°Å¸â€ Â§ [Hydration] Adding empty dashboard for slide ${m.id} (${m.title}) during final check`);
        map.set(m.id, []);
      }

      // Also ensure backendIdMap knows about these IDs
      if (!backendIdMap.current.has(m.id)) {
        // If it's a backend ID (which it is, during hydration), map it to itself
        backendIdMap.current.set(m.id, m.id);
      }
    });

    console.log(`Ã¢Å“â€¦ [Hydration] Setting dashboards map with ${map.size} slides:`, Array.from(map.keys()));
    setDashboards(map);
    setIsDashboardsInitialized(true);
    console.log(`Ã¢Å“â€¦ [Hydration] Completed for templateId ${templateId}`);

    // Ã°Å¸â€ Â§ CRITICAL FIX: Correct corrupted slide titles from backend
    // Backend may have wrong titles (e.g., all "meta-ads"), so override with correct titles from slideIntegrationMap
    console.log(`Ã°Å¸â€ Â  [Hydration] backendIdMap before title correction:`, Array.from(backendIdMap.current.entries()));
    console.log(`Ã°Å¸â€ Â  [Hydration] dedupedMeta before title correction:`, dedupedMeta.map(m => ({ id: m.id, title: m.title, integrationIndex: m.integrationIndex })));
    console.log(`Ã°Å¸â€ Â  [Hydration] slideIntegrationMap:`, Array.from(slideIntegrationMap.entries()).map(([id, info]) => ({ id, slideTitle: info.slideTitle, originalIndex: info.originalIndex })));

    const correctedMeta = dedupedMeta.map(meta => {
      const metaId = Number(meta.id);
      const metaLayout = map.get(metaId) ?? map.get(resolveFrontendSlideId(metaId));
      const inferredIntegration = getIntegrationInfoForSlideIdOrWidgets(metaId, metaLayout, meta.title);

      if (meta.source === "custom" && inferredIntegration) {
        return {
          ...meta,
          title: inferredIntegration.info.slideTitle,
          subtitle: inferredIntegration.info.accountName,
          source: "integration" as const,
          integrationIndex: inferredIntegration.info.originalIndex
        };
      }
      // Ã°Å¸â€ Â§ CRITICAL FIX: Match by slide ID directly, not by integrationIndex
      // Backend data may have undefined integrationIndex, so we can't rely on it

      // First, try to find this slide in slideIntegrationMap by ID
      const slideInfo = slideIntegrationMap.get(meta.id);
      if (slideInfo) {
        console.log(`Ã°Å¸â€ Â§ [Hydration] Correcting slide title by direct ID match: "${meta.title}" -> "${slideInfo.slideTitle}" for ID ${meta.id}`);
        return {
          ...meta,
          title: slideInfo.slideTitle,
          subtitle: slideInfo.accountName,
          source: 'integration' as const,
          integrationIndex: slideInfo.originalIndex
        };
      }

      // If not found by direct ID, try to find by backendIdMap reverse lookup
      for (const [frontendId, backendId] of backendIdMap.current.entries()) {
        if (backendId === meta.id) {
          const info = slideIntegrationMap.get(frontendId);
          if (info) {
            console.log(`Ã°Å¸â€ Â§ [Hydration] Correcting slide title by backendIdMap reverse lookup: "${meta.title}" -> "${info.slideTitle}" for ID ${meta.id} (frontend ID ${frontendId})`);
            return {
              ...meta,
              title: info.slideTitle,
              subtitle: info.accountName,
              source: 'integration' as const,
              integrationIndex: info.originalIndex
            };
          }
        }
      }

      return meta;
    });

    setProcessedSlidesMeta(correctedMeta);

    // Keep customPages aligned with corrected metadata and remove integration-mapped ghosts.
    setCustomPages((prev) => {
      const fromBackend = correctedMeta
        .filter((slide: any) => {
          if (slide.source !== "custom") return false;
          const slideId = Number(slide.id);
          const layout = map.get(slideId) ?? map.get(resolveFrontendSlideId(slideId));
          return !getIntegrationInfoForSlideIdOrWidgets(slideId, layout, slide.title);
        })
        .map((slide: any) => ({
          id: Number(slide.id),
          name: slide.title,
          subtitle: slide.subtitle,
        }));

      const backendIds = new Set(fromBackend.map((p) => Number(p.id)));
      const preservedLocal = prev.filter((p) => {
        if (backendIds.has(Number(p.id))) return false;
        const pageId = Number(p.id);
        const layout = map.get(pageId) ?? map.get(resolveFrontendSlideId(pageId));
        return !getIntegrationInfoForSlideIdOrWidgets(pageId, layout, p.name);
      });

      return [...preservedLocal, ...fromBackend];
    });

    // Clean pageOrder Ã¢â‚¬â€  translate ALL backend IDs to frontend IDs.
    // pageOrder must use the same IDs as dashboards keys (frontend IDs).
    // Backend now returns clean backend DB IDs (e.g. [6395, 6396, 7000]),
    // but dashboards use frontend IDs (0, 1, 1000). We must translate.
    if (templateQuery.data.pageOrder) {
      console.log('Ã°Å¸â€ Â  [PageOrder Hydration] Raw pageOrder from backend:', templateQuery.data.pageOrder);
      console.log('Ã°Å¸â€ Â  [PageOrder Hydration] idMapping:', Array.from(idMapping.entries()));
      console.log('Ã°Å¸â€ Â  [PageOrder Hydration] backendIdMap (FrontendÃ¢â€ â€™Backend):', Array.from(backendIdMap.current.entries()));

      // Build reverse map: Backend ID Ã¢â€ â€™ Frontend ID
      const backendToFrontendMap = new Map<number, number>();
      backendIdMap.current.forEach((bId, fId) => {
        backendToFrontendMap.set(bId, fId);
      });
      idMapping.forEach((frontendId, backendId) => {
        backendToFrontendMap.set(backendId, frontendId);
      });

      console.log('Ã°Å¸â€ Â  [PageOrder Hydration] backendToFrontendMap:', Array.from(backendToFrontendMap.entries()));
      console.log('Ã°Å¸â€ Â  [PageOrder Hydration] map.keys():', Array.from(map.keys()));

      const newOrder = templateQuery.data.pageOrder
        .map((id: any) => {
          const numId = Number(id);

          // Ã°Å¸â€ Â§ CRITICAL FIX: Always try to translate backend ID Ã¢â€ â€™ frontend ID first
          // Don't check map.has(numId) because map contains BOTH backend and frontend IDs
          const frontendId = backendToFrontendMap.get(numId);
          if (frontendId !== undefined) {
            console.log('Ã°Å¸â€ Â  [PageOrder Mapping] Backend -> Frontend:', numId, '->', frontendId);
            return frontendId;
          }

          // If no mapping found and it's a custom page ID (>= 1000), keep it as-is
          if (numId >= 1000) {
            console.log('Ã°Å¸â€ Â  [PageOrder Mapping] Preserving custom page ID:', numId);
            return numId;
          }

          // Fallback: try idMapping directly
          const mapped = idMapping.get(numId);
          if (mapped !== undefined) {
            console.log('Ã°Å¸â€ Â  [PageOrder Mapping] idMapping fallback:', numId, '->', mapped);
            return mapped;
          }

          return numId;
        });

      console.log('Ã°Å¸â€ Â  [PageOrder Hydration] Translated to frontend IDs:', newOrder);

      const uniqueOrder = Array.from(new Set(newOrder)) as number[];

      // Validate: only keep IDs that exist in dashboards or dedupedMeta
      const finalValidatedOrder = uniqueOrder.filter(id => {
        if (map.has(id)) return true;
        // Ã°Å¸â€ Â§ FIX: Custom pages may exist in dedupedMeta even without dashboard entries.
        // Use source === 'custom' instead of id >= 1000 Ã¢â‚¬â€  backend DB IDs can be any number.
        if (dedupedMeta.some(m => m.id === id && m.source === 'custom')) return true;

        console.warn(`Ã°Å¸â€˜Â» [PageOrder] Removing ghost page ID ${id} - not in dashboards`);
        return false;
      });

      // Ã¢Å“â€¦ Filter out explicitly deleted slides so they don't re-enter pageOrder
      // (which would feed back into auto-save and re-create the slide in the backend)
      const withoutDeleted = finalValidatedOrder.filter(id => !deletedSlideIds.has(id));
      setPageOrder(withoutDeleted);
    } else {
      console.log('Ã¢Å¡Â Ã¯Â¸Â  [PageOrder Hydration] No pageOrder in template data, using dedupedMeta order');
      setPageOrder(dedupedMeta.map(m => m.id).filter(id => !deletedSlideIds.has(id)));

    }

  }, [templateQuery.data, integrationsData?.integrations, isLoadingIntegrations, isDashboardsInitialized, deletedSlideIds, getIntegrationInfoForSlideIdOrWidgets, resolveFrontendSlideId]);

  // Persistence: Sync state changes to store
  const updateReportState = useReportStore((state) => state.updateReportState);

  useEffect(() => {
    // CRITICAL: Prevent syncing empty/initial state back to the store until hydration is complete.
    // If we sync too early, we "poison" the persistence store with empty data before the backend returns.
    if (templateId && isDashboardsInitialized) {
      // console.log(`Ã°Å¸â€™Â¾ [Store Persist] Saving state for templateId ${templateId}.`);
      updateReportState(templateId, {
        dashboards,
        pageOrder,
        customPages,
        dateRange,
        lastSavedTime,
        hasUnsavedChanges,
        deletedSlideIds,
        // We persist processedSlidesMeta to keep sidebar consistent
        processedSlidesMeta
      });
    }
  }, [templateId, dashboards, pageOrder, customPages, dateRange, lastSavedTime, hasUnsavedChanges, deletedSlideIds, processedSlidesMeta, updateReportState, isDashboardsInitialized]);


  const templateName = isTemplateError
    ? "Report Not Found"
    : prettifyMetricLabel((templateQuery.data?.name ?? newReportName) || "Untitled Report");

  // widgetSignature removed Ã¢â‚¬â€ per-widget useQuery handles refetch automatically

  // Auto-save: Debounced save when dashboards, customPages, or templateName changes



  // Ensure there is at least one slide per connected integration (e.g., GA + GSC).
  // If integrations were added after the template was created, append empty slides
  // so they show up in the Pages sidebar and canvas.
  // If ENABLE_AUTO_DEFAULT_WIDGETS is true, pre-populate with default widgets.
  useEffect(() => {
    // If we are still loading an existing template, wait
    if (params.id && (isTemplateLoading || !templateQuery.data)) {
      return;
    }

    const slideIds = Array.from(slideIntegrationMap.keys());

    if (!slideIds.length || !isDashboardsInitialized) return;

    const inferIntegrationForWidget = (
      metricKey: string | undefined,
      platform: string,
      subSlideIndex: number
    ): string | null => {
      const m = (metricKey || "").toLowerCase();
      if (m.startsWith("google_seo.")) return "google-search-console";
      if (m.startsWith("google_ads.")) return "google-ads";
      if (m.startsWith("google.")) return "google-analytics";
      if (m.startsWith("meta.instagram.")) return "meta-instagram";
      if (m.startsWith("meta.facebook.") || m.startsWith("meta.page.")) return "meta-facebook";
      if (m.startsWith("meta.ads.")) return "meta_ads";
      if (m.startsWith("youtube.")) return "youtube";
      if (m.startsWith("twitter.")) return "twitter";
      if (m.startsWith("linkedin.")) return "linkedin";

      const p = (platform || "").toLowerCase().replace(/[_ ]/g, "-");
      if (p.includes("google-search-console") || p.includes("google-console")) return "google-search-console";
      if (p.includes("google-analytics") || p === "google") return "google-analytics";
      if (p.includes("google-ads")) return "google-ads";
      if (p.includes("meta-business") || p.includes("business")) {
        return subSlideIndex === 1 ? "meta-instagram" : "meta-facebook";
      }
      if (p.includes("meta-instagram") || p.includes("instagram")) return "meta-instagram";
      if (p.includes("meta-facebook") || p.includes("facebook")) return "meta-facebook";
      if (p.includes("meta-ads")) return "meta_ads";
      if (p.includes("youtube")) return "youtube";
      if (p.includes("twitter")) return "twitter";
      if (p.includes("linkedin")) return "linkedin";

      return null;
    };

    setDashboards((prev) => {
      let changed = false;
      const updated = new Map(prev);

      slideIds.forEach((id) => {
        // Skip if explicitly deleted in this session
        if (deletedSlideIds.has(id)) return;

        const integrationInfo = slideIntegrationMap.get(id);

        // CRITICAL FIX: Check if THIS SPECIFIC SLIDE (not just the integration) is already represented
        // For multi-slide integrations, each slide (0, 1) must be checked individually
        if (integrationInfo && !updated.has(id)) {
          // Check if THIS EXACT slide (by ID) is already represented by another ID
          const isThisSlideRepresented = Array.from(updated.keys()).some(existingId => {
            if (existingId === id) return true; // Same ID

            // Check if metadata points to this exact slide (same integration AND subSlideIndex)
            const meta = processedSlidesMeta.find(m => Number(m.id) === existingId);
            if (meta?.source === 'integration' &&
              meta?.integrationIndex === integrationInfo.originalIndex) {
              // Same integration - but is it the same SUB-SLIDE?
              const existingInfo = slideIntegrationMap.get(existingId);
              if (existingInfo && existingInfo.subSlideIndex === integrationInfo.subSlideIndex) {
                return true; // Same integration AND same sub-slide (e.g., both are Instagram)
              }
            }

            return false;
          });

          if (isThisSlideRepresented) {
            // This specific slide is represented elsewhere - skip it
            return;
          }
        }

        if (!updated.has(id)) {
          // Slide doesn't exist yet - create it ONLY if not represented!
          if (ENABLE_AUTO_DEFAULT_WIDGETS && integrationInfo) {
            const picked = groupedMetrics && !isLoadingAvailableMetrics
              ? pickDefaultMetricsForIntegration(
                integrationInfo.platform,
                integrationInfo.accountId,
                groupedMetrics as any,
                (msg) => toast.warning(msg)
              )
              : [];
            // Build from integration templates during metrics cold-start to avoid empty-slide skeleton stalls.
            const defaults = buildDefaultWidgetsForIntegration(
              id,
              picked,
              integrationInfo.platform,
              integrationInfo.accountId,
              integrationInfo.subSlideIndex
            );
            updated.set(id, defaults);
            changed = true;

            // Ã°Å¸â€ Â§ CRITICAL FIX: Also add to processedSlidesMeta so it shows in the Sidebar!
            setProcessedSlidesMeta((prevMeta) => {
              if (prevMeta.find(m => Number(m.id) === Number(id))) return prevMeta;
              return [...prevMeta, {
                id,
                title: integrationInfo.slideTitle,
                subtitle: integrationInfo.accountName,
                source: 'integration' as const,
                integrationIndex: integrationInfo.originalIndex
              }];
            });
          } else {
            updated.set(id, []);
            changed = true;
          }
        } else if (ENABLE_AUTO_DEFAULT_WIDGETS) {
          // Slide exists - check if it's empty OR has a broken auto-state and should be populated/replaced
          let existing = updated.get(id);

          // Self-heal old/cold-start widgets that were created with wrong integration
          // or missing accountId (e.g. GA metric keys tagged as meta, or empty accountId).
          if (existing && integrationInfo) {
            let healedAny = false;
            const healed = existing.map((w) => {
              const metricKey = w.metricConfig?.metricKey;
              if (!w.metricConfig) return w;

              const expected = inferIntegrationForWidget(
                metricKey,
                integrationInfo.platform,
                integrationInfo.subSlideIndex
              );

              const current = (w.metricConfig.integration || "").toLowerCase();
              const expectedNormalized = (expected || "").toLowerCase();
              // Treat meta_ads and meta-ads as equivalent for comparison
              const normalize = (s: string) => s.replace(/-/g, "_");
              const integrationWrong = !!expected && normalize(current) !== normalize(expectedNormalized);
              const accountIdMissing = !w.metricConfig.accountId && !!integrationInfo.accountId;

              if (!integrationWrong && !accountIdMissing) return w;

              healedAny = true;
              return {
                ...w,
                metricConfig: {
                  ...w.metricConfig,
                  ...(integrationWrong ? { integration: expected } : {}),
                  accountId: w.metricConfig.accountId || integrationInfo.accountId,
                },
              };
            });

            if (healedAny) {
              updated.set(id, healed);
              existing = healed;
              changed = true;
            }
          }

          // A slide is "broken" if it is clearly an old auto-generated partial layout.
          const normalizedPlatform = integrationInfo?.platform?.toLowerCase().replace(/[_ ]/g, '-') || '';
          const isMeta = normalizedPlatform.includes('meta') || normalizedPlatform.includes('facebook') || normalizedPlatform.includes('instagram') || normalizedPlatform.includes('ads');
          const isGoogleAnalytics = normalizedPlatform === 'google-analytics' || normalizedPlatform === 'google';
          const gaTableMetricKeys = ['google.channel_traffic', 'google.browser_used', 'google.device_category', 'google.geo_country', 'google.geo_city', 'google.top_pages'];
          const hasAnyGaTableWidget = !!existing?.some(w => gaTableMetricKeys.includes(String(w.metricConfig?.metricKey || '')));
          const isLegacyGaAutoState = !!existing &&
            isGoogleAnalytics &&
            existing.length <= 6 &&
            existing.every(w => w.i.includes('auto')) &&
            !hasAnyGaTableWidget;

          // Detect slides saved in old format: metric/chart/table widgets missing metricConfig
          const METRIC_WIDGET_TYPES = ['metric', 'line_chart', 'bar_chart', 'area_chart', 'pie_chart', 'chart', 'table'];
          const hasMetricWidgetsWithoutConfig = !!existing?.some(
            w => METRIC_WIDGET_TYPES.includes(w.widgetType || '') && !w.metricConfig?.metricKey
          );

          const isBrokenState = existing && (
            (existing.length === 0) ||
            (existing.length === 4 && existing.every(w => w.i.includes('auto'))) ||
            (existing.length < 5 && isMeta) ||
            (existing.length < 5 && normalizedPlatform.includes('linkedin')) ||
            isLegacyGaAutoState ||
            hasMetricWidgetsWithoutConfig
          );


          // Ã°Å¸â€ºÂ¡Ã¯Â¸Â CRITICAL FIX: Do NOT auto-populate if the user has manually touched this slide
          // this ensures widget deletions persist!
          if (existing && (existing.length === 0 || isBrokenState) && !modifiedSlideIds.current.has(id)) {
            if (integrationInfo) {
              // ... rest of logic
              console.log(`Ã¢â„¢Â»Ã¯Â¸Â Auto-populating/Replacing slide ${id} for ${integrationInfo.platform} (Metrics: ${existing.length})`);
              const picked = groupedMetrics && !isLoadingAvailableMetrics
                ? pickDefaultMetricsForIntegration(
                  integrationInfo.platform,
                  integrationInfo.accountId,
                  groupedMetrics as any,
                  (msg) => toast.warning(msg)
                )
                : [];
              const defaults = buildDefaultWidgetsForIntegration(
                id,
                picked,
                integrationInfo.platform,
                integrationInfo.accountId,
                integrationInfo.subSlideIndex
              );
              if (defaults.length > 0) {
                updated.set(id, defaults);
                changed = true;

                // Ã°Å¸â€ Â§ CRITICAL FIX: Also add to processedSlidesMeta so it shows in the Sidebar!
                setProcessedSlidesMeta((prevMeta) => {
                  if (prevMeta.find(m => Number(m.id) === Number(id))) return prevMeta;
                  return [...prevMeta, {
                    id,
                    title: integrationInfo.slideTitle,
                    subtitle: integrationInfo.accountName,
                    source: 'integration' as const,
                    integrationIndex: integrationInfo.originalIndex
                  }];
                });
              }
            }
          }
        }
      });

      return changed ? updated : prev;
    });


    setPageOrder((prev) => {
      const base = prev.length ? [...prev] : Array.from(dashboards.keys());

      const existing = new Set(base);
      let changed = false;
      slideIds.forEach((id) => {
        // Skip if explicitly deleted
        if (deletedSlideIds.has(id)) return;

        if (!existing.has(id)) {
          base.push(id);
          existing.add(id);
          changed = true;
        }
      });
      return changed ? base : prev;
    });
  }, [
    // Use stable primitive dependencies to prevent infinite loops
    integrationsData?.integrations?.length,
    Object.keys(groupedMetrics || {}).join(','),
    isLoadingAvailableMetrics,
    isDashboardsInitialized,
    params.id,
    isTemplateLoading,
    deletedSlideIds,
    // We intentionally omit full objects/arrays that might be referentially unstable
    // integrationsData?.integrations, groupedMetrics, templateQuery.data
  ]);
  // Compute formatted date strings for per-widget hooks
  const dateFrom = useMemo(() => dateRange?.from ? formatApiDate(dateRange.from) : "", [dateRange?.from]);
  const dateTo = useMemo(() => dateRange?.to ? formatApiDate(dateRange.to) : "", [dateRange?.to]);

  // ── Unified batch data loading ──────────────────────────────────────────────
  // Parallel GET /api/unified-metrics/data per unique widget instead of N
  // individual per-widget requests. Special widgets (recent_posts, campaign
  // tables) are excluded and continue using per-widget useWidgetData.
  const {
    byId: batchById,
    isLoading: batchIsLoading,
    isFetching: batchIsFetching,
  } = useBatchDashboardData(dashboards, dateFrom, dateTo, {
    clientId: effectiveClientId ?? undefined,
    enabled: isDashboardsInitialized && !!dateFrom && !!dateTo,
    shareToken,
  });

  // resolvedWidgets: merged view used by buildTemplatePayloadFromDashboards for
  // self-healing and snapshot data. Batch results take priority; per-widget
  // cache entries fill in special widgets still resolved by useWidgetData.
  const resolvedWidgets: Record<string, any> = batchById;

  // prefetchAllWidgets: with the batch resolver all data is already loaded in
  // a single request. Special widgets still use per-widget prefetch via the
  // existing queryClient cache.
  const prefetchAllWidgets = useCallback(async () => {
    const specialPromises: Promise<void>[] = [];
    dashboards.forEach((layout) => {
      layout.forEach((widget) => {
        const metricConfig = widget.metricConfig;
        if (!metricConfig?.metricKey) return;
        // Only prefetch widgets NOT handled by the batch resolver
        const isSpecial =
          metricConfig.metricKey === "meta.facebook.recent_posts" ||
          metricConfig.metricKey === "meta.instagram.recent_media";
        if (!isSpecial) return;
        specialPromises.push(
          queryClient.prefetchQuery({
            queryKey: getWidgetQueryKey(metricConfig, dateFrom, dateTo, shareToken),
            queryFn: () =>
              fetchAndProcessWidget(
                metricConfig,
                effectiveClientId,
                dateFrom,
                dateTo,
                shareToken,
                integrationsData
              ),
            staleTime: 10 * 60 * 1000,
          })
        );
      });
    });
    await Promise.all(specialPromises);
  }, [dashboards, dateFrom, dateTo, shareToken, effectiveClientId, integrationsData, queryClient]);

  // LEGACY COMPAT: stub reportDataQuery shape for any remaining references
  const reportDataQuery = {
    data: resolvedWidgets,
    isFetching: batchIsFetching,
    isError: false,
    error: null,
    status: Object.keys(resolvedWidgets).length > 0 ? "success" as const : "pending" as const,
  };



  // gaResolvedWidgets removed

  const buildTemplatePayloadFromDashboards =
    useCallback((): CreateTemplatePayload => {
      console.log(`Ã°Å¸â€Â¨ [BuildPayload] Building save payload...`, {
        isLoadingIntegrations,
        hasIntegrationsData: !!integrationsData,
        slideMapSize: slideIntegrationMap.size,
        backendIdMapSize: backendIdMap.current.size,
        backendIdMap: Array.from(backendIdMap.current.entries())
      });

      const widgets: ReportWidgetDefinition[] = [];
      // Build slidesMeta earlier so we can use it to bake titles into widgets
      // KEY FIX: Use pageOrder as source of truth for which slides exist.
      // Previously used dashboards.keys(), which might miss empty pages or include deleted ones.
      const rawSlideIdList = pageOrder && pageOrder.length > 0 ? pageOrder : Array.from(dashboards.keys());

      // Ã°Å¸â€Â§ FIX: Never include explicitly deleted integration slides in the save payload.
      // Without this, a stale pageOrder from the backend (loaded before deletion saves) could
      // re-add the deleted slide to the backend, causing it to reappear after every refresh.
      const filteredSlideIdList = rawSlideIdList.filter(id => !deletedSlideIds.has(Number(id)));

      // Ã°Å¸â€Â§ CRITICAL FIX: Deduplicate slideIdList to prevent duplicate slides in save payload
      const slideIdList = Array.from(new Set(filteredSlideIdList.map(id => Number(id))));

      if (rawSlideIdList.length !== slideIdList.length) {
        console.warn(`Ã¢Å¡Â Ã¯Â¸Â [SavePayload] Removed ${rawSlideIdList.length - slideIdList.length} duplicate slide IDs from pageOrder`, {
          raw: rawSlideIdList,
        });
      }

      // Ã°Å¸â€Â DIAGNOSTIC: Warn if slideIntegrationMap is empty during save
      if (slideIntegrationMap.size === 0 && !readOnly && slideIdList.some(id => Number(id) < 1000)) {
        console.warn(`Ã¢Å¡Â Ã¯Â¸Â [SavePayload] slideIntegrationMap is EMPTY during save!`, {
          integrationsDataExists: !!integrationsData,
          integrationsCount: integrationsData?.integrations?.length,
          slideIdList: slideIdList.filter(id => Number(id) < 1000)
        });
      }

      // CRITICAL FIX: Use processedSlidesMeta (the clean, deduplicated list from state)
      // instead of raw templateQuery data. This ensures rescues/reclamations are persisted.
      // Ã°Å¸â€Â§ CRITICAL FIX: Filter processedSlidesMeta to only include slides in slideIdList
      // This prevents corrupted metadata from adding extra slides to the save payload
      const rawExistingMeta = processedSlidesMeta.length > 0 ? processedSlidesMeta : (templateQuery.data?.slidesMeta ?? []);
      const slideIdSet = new Set(slideIdList.map(id => Number(id)));
      const existingMeta = rawExistingMeta.filter((meta: ReportSlideMeta) => slideIdSet.has(Number(meta.id)));

      console.log(`Ã°Å¸Â§Â¹ [SavePayload] Cleaned existingMeta from ${rawExistingMeta.length} to ${existingMeta.length} slides based on pageOrder`);

      console.log(`Ã°Å¸â€”ÂºÃ¯Â¸Â [SavePayload] backendIdMap size: ${backendIdMap.current.size}`, Array.from(backendIdMap.current.entries()));
      console.log(`Ã°Å¸â€”ÂºÃ¯Â¸Â [SavePayload] slideIntegrationMap size: ${slideIntegrationMap.size}`, Array.from(slideIntegrationMap.entries()).map(([id, info]) => ({
        id,
        platform: info.platform,
        slideTitle: info.slideTitle,
        originalIndex: info.originalIndex
      })));

      const slidesMeta = slideIdList
        .map((slideId, index) => {
          const slideIdNum = Number(slideId);

          // Ã°Å¸â€â€” BACKEND ID LOOKUP:
          // If we have a mapped backend ID for this frontend index (e.g. 0 -> 55), use it.
          // Otherwise, fall back to the frontend ID (new slides or custom pages).
          const originalId = backendIdMap.current.get(slideIdNum) ?? slideIdNum;
          const frontendSlideId = resolveFrontendSlideId(slideIdNum);
          const layoutForSlide = dashboards.get(slideIdNum) ?? dashboards.get(frontendSlideId);
          const integrationMatchByIdOrContent = getIntegrationInfoForSlideIdOrWidgets(slideIdNum, layoutForSlide);

          if (originalId !== slideIdNum) {
            console.log(`Ã°Å¸â€â€” [SavePayload] Mapping Slide ${slideIdNum} -> Backend ID ${originalId}`);
          }

          // Ã¢Å“â€¦ STEP 1: Validate slideId is legitimate
          // CRITICAL FIX: slideIdNum might be a backend ID (e.g., 5503) OR a frontend ID (e.g., 0)
          // We need to check if it's:
          // 1. A frontend integration ID (0-999) that exists in slideIntegrationMap
          // 2. A backend integration ID (any value) that maps back to a valid frontend ID
          // 3. A custom page ID (>= 1000 AND not in backendIdMap)

          // Check if this is a backend ID that maps to a frontend integration
          let isMappedBackendId = false;
          for (const [frontendId, backendId] of backendIdMap.current.entries()) {
            if (backendId === slideIdNum && slideIntegrationMap.has(frontendId)) {
              isMappedBackendId = true;
              break;
            }
          }

          const isFrontendIntegrationId = slideIdNum >= 0 && slideIdNum < 1000 && slideIntegrationMap.has(slideIdNum);
          const isValidIntegrationId = isFrontendIntegrationId || isMappedBackendId;

          // Ã°Å¸â€Â§ FIX: Custom pages are identified by source='custom' in processedSlidesMeta,
          // NOT by id >= 1000. After a save+refresh, backend assigns real DB IDs (e.g. 423).
          // Check if this slide ID corresponds to a known custom page.
          const metaEntry = existingMeta.find((m: any) => Number(m.id) === slideIdNum || Number(m.id) === originalId);
          const hasCustomOverride = customPages.some(p => p.id === slideIdNum);
          const isMappedIntegration = !!integrationMatchByIdOrContent;
          // A rename override in customPages must not turn an integration slide into source=custom.
          const isCustomPageBySource = !isMappedIntegration && (metaEntry?.source === 'custom' || hasCustomOverride);
          const isValidCustomId = isCustomPageBySource;

          if (!isValidIntegrationId && !isValidCustomId) {
            console.log(`Ã°Å¸â€˜Â» [SavePayload] Rejecting invalid slideId: ${slideId}`, {
              slideIdNum,
              isFrontendIntegrationId,
              isMappedBackendId,
              isValidCustomId,
              inSlideMap: slideIntegrationMap.has(slideIdNum),
              slideMapKeys: Array.from(slideIntegrationMap.keys()),
              slideMapSize: slideIntegrationMap.size,
              backendIdMapSize: backendIdMap.current.size
            });
            return null;
          }

          const fromExisting = existingMeta.find((m: any) => Number(m.id) === slideId || Number(m.id) === originalId); // Check both
          const fromCustom = customPages.find((p) => p.id === slideId);

          if (fromExisting) {
            // Ã¢Å“â€¦ CRITICAL: Detect and remove "Untitled page" ghosts
            // Ã°Å¸â€Â§ FIX: Only treat as a ghost if it IS a custom page (by source field).
            // The old check `slideIdNum < 1000` was wrong Ã¢â‚¬â€ after refresh, custom pages
            // can have backend DB IDs like 423. Use source field as the truth.
            const isGhostUntitled =
              fromExisting.source === 'custom' &&
              !isValidCustomId && // Only ghost if we didn't validate it as custom above
              (!fromExisting.title ||
                fromExisting.title === 'Untitled page' ||
                fromExisting.title === 'Untitled' ||
                fromExisting.title.startsWith('Slide '));

            if (isGhostUntitled) {
              console.log(`Ã°Å¸â€˜Â» [SavePayload] Removing "Untitled page" ghost: ${slideId}`);
              return null;
            }

            // Ã¢Å“â€¦ CRITICAL: Detect and remove high-ID integration duplicates
            if (slideIdNum >= 1000 && fromExisting.source === 'integration') {
              const integrationIdx = typeof fromExisting.integrationIndex === 'number'
                ? fromExisting.integrationIndex
                : slideIdNum;

              // Check if we already have the low-ID version in slideIdList
              const hasDuplicateLowId = slideIdList.includes(integrationIdx) && integrationIdx !== slideIdNum;

              if (hasDuplicateLowId) {
                console.log(`Ã°Å¸â€˜Â» [SavePayload] Removing high-ID duplicate: ${slideId} (integration ${integrationIdx})`);
                return null;
              }
            }

            // Ghost check for disconnected integrations
            if (!readOnly && !isLoadingIntegrations && integrationsData?.integrations) {
              if (fromExisting.source === 'integration') {
                // Use slideIntegrationMap to find the correct integration index
                const slideInfo = slideIntegrationMap.get(slideIdNum);
                const idx = typeof fromExisting.integrationIndex === 'number'
                  ? fromExisting.integrationIndex
                  : (slideInfo?.originalIndex ?? slideIdNum);

                if (!integrationsData.integrations[idx]) {
                  const slideInfo = slideIntegrationMap.get(slideIdNum);
                  console.log(`Ã°Å¸â€˜Â» [SavePayload] removing ghost slide ${slideId} (Integration Disconnected). Index=${idx}`, {
                    platform: slideInfo?.platform,
                    accountName: slideInfo?.accountName,
                    reason: 'Integration no longer exists in integrationsData.integrations array'
                  });
                  return null;
                }
              }
            }

            // Force integration source by mapping, not numeric ID ranges.
            // Backend integration IDs can be >1000, and custom IDs can be <1000.
            const integrationMatch = integrationMatchByIdOrContent;
            if (integrationMatch && !isCustomPageBySource) {
              const slideInfo = integrationMatch.info;
              const integrationIdx = fromExisting.integrationIndex ?? slideInfo?.originalIndex ?? slideIdNum;

              // Ã°Å¸â€Â§ CRITICAL FIX: Use slideInfo.slideTitle to get correct slide-specific title
              // Don't use fromExisting.title as it may be corrupted
              const correctTitle = slideInfo?.slideTitle || fromExisting.title;

              return {
                ...fromExisting,
                id: originalId, // Ã°Å¸â€â€” Use Backend ID
                source: "integration" as const,
                integrationIndex: integrationIdx,
                title: correctTitle?.includes("Untitled") ? "" : correctTitle,
                sortOrder: index
              };
            }

            // High IDs (>= 1000) that claim to be custom - validate they're real.
            // Also handles custom pages with low backend DB IDs (isCustomPageBySource = true).
            if (isCustomPageBySource && fromExisting.source === 'custom') {
              const layout = layoutForSlide;
              const hasWidgets = layout && layout.length > 0;
              const hasRealTitle = fromExisting.title &&
                fromExisting.title !== 'Untitled page' &&
                fromExisting.title !== 'Untitled' &&
                !fromExisting.title.startsWith('Slide ') &&
                fromExisting.title.trim() !== '';

              const isReal = hasRealTitle || hasWidgets;

              if (!isReal) {
                console.log(`Ã°Å¸â€˜Â» [SavePayload] Removing fake custom page: ${slideId}`);
                return null;
              }

              const { integrationIndex, ...rest } = fromExisting;
              return { ...rest, id: originalId, source: "custom" as const, sortOrder: index };
            }

            return { ...fromExisting, id: originalId, sortOrder: index };
          }

          // fromCustom logic
          if (fromCustom) {
            if (integrationMatchByIdOrContent) {
              const slideInfo = integrationMatchByIdOrContent.info;
              return {
                id: originalId,
                title: fromCustom.name || slideInfo.slideTitle,
                subtitle: fromCustom.subtitle || slideInfo.accountName,
                source: "integration" as const,
                integrationIndex: slideInfo.originalIndex,
                sortOrder: index
              };
            }
            // Ã¢Å“â€¦ FIX: Always save custom pages if they exist in our state.
            // Do NOT filter them out even if they are empty or untitled.
            return {
              id: originalId, // Ã°Å¸â€â€” Use Backend ID
              title: fromCustom.name, // Persist the user-defined name
              subtitle: fromCustom.subtitle,
              source: "custom" as const,
              sortOrder: index
            };
          }

          // Integration fallback - use slideIntegrationMap to find the correct integration
          const slideInfo = integrationMatchByIdOrContent?.info ?? slideIntegrationMap.get(Number(slideId));
          if (slideInfo) {
            const integration = integrationsData?.integrations?.[slideInfo.originalIndex];
            if (integration) {
              return {
                id: originalId, // Ã°Å¸â€â€” Use Backend ID
                title: slideInfo.slideTitle || integration.platform, // Ã°Å¸â€Â§ Use slide-specific title!
                subtitle: integration.accountName,
                source: "integration" as const,
                integrationIndex: slideInfo.originalIndex,
                sortOrder: index
              };
            }
          }

          // Final safety: low IDs are integrations
          if (Number(slideId) < 1000) {
            // Use slideIntegrationMap to find the correct integration index
            const slideInfo = slideIntegrationMap.get(Number(slideId));
            const integrationIdx = slideInfo?.originalIndex ?? Number(slideId);

            if (!readOnly && !isLoadingIntegrations && integrationsData?.integrations && !integrationsData.integrations[integrationIdx]) {
              console.log(`Ã°Å¸â€˜Â» [SavePayload] removing ghost slide ${slideId} (Integration Disconnected). Index=${integrationIdx}`);
              return null;
            }

            return {
              id: originalId, // Ã°Å¸â€â€” Use Backend ID
              title: "",
              source: "integration" as const,
              integrationIndex: integrationIdx,
              sortOrder: index
            };
          }

          const layout = layoutForSlide;
          const hasWidgets = layout && layout.length > 0;

          // Ã¢Å“â€¦ FIX: Allow saving empty custom pages. 
          // If we have a dashboard entry (which we create when adding a page), it's real.
          // Fallback for "ghost" custom pages that might be continuously resaved:
          // If it's not in customPages AND has no widgets, then maybe it's a true ghost.
          if (!hasWidgets && !fromCustom) {
            console.log(`Ã°Å¸â€˜Â» [SavePayload] Removing true ghost custom page: ${slideId}`);
            return null;
          }

          return {
            id: originalId, // Ã°Å¸â€â€” Use Backend ID
            title: "Untitled page",
            source: "custom" as const,
            sortOrder: index
          };
        })
        .filter((s): s is ReportSlideMeta => s !== null);

      // Ã¢Å“â€¦ STEP 2: Clean pageOrder to match cleaned slidesMeta
      // Ã°Å¸â€Â§ CRITICAL FIX: Build pageOrder from user's order, but ONLY include validated slides
      // 
      // PROBLEM: If we use the raw pageOrder state directly, it might include:
      // - Slides that were filtered out during validation (e.g., 6030 removed)
      // - Temporary IDs (e.g., 3) that haven't been created yet
      // This causes the backend to delete valid slides that aren't in the list!
      // 
      // SOLUTION: 
      // 1. Start with user's pageOrder (to preserve their ordering)
      // 2. Translate frontend IDs Ã¢â€ â€™ backend IDs
      // 3. Filter to only include IDs that made it into slidesMeta
      const validSlideIds = new Set(slidesMeta.map(s => s.id));
      const frontendPageOrder = pageOrder.length > 0 ? pageOrder : slideIdList;

      const cleanedPageOrder = frontendPageOrder
        .map(fId => {
          // Translate frontend ID to backend ID
          const backendId = backendIdMap.current.get(fId);
          if (backendId !== undefined) {
            console.log(`Ã°Å¸â€™Â¾ [Save] Translating pageOrder: Frontend ${fId} -> Backend ${backendId}`);
            return backendId;
          }
          // Custom pages (>= 1000) use their ID as-is
          console.log(`Ã°Å¸â€™Â¾ [Save] Keeping pageOrder ID as-is: ${fId}`);
          return fId;
        })
        .filter(id => {
          const isValid = validSlideIds.has(id);
          if (!isValid) {
            console.warn(`Ã¢Å¡Â Ã¯Â¸Â [Save] Filtering out ID ${id} from pageOrder - not in validated slidesMeta`);
          }
          return isValid;
        });

      console.log('Ã°Å¸â€™Â¾ [Save] PageOrder being saved (backend IDs):', cleanedPageOrder);
      console.log('Ã°Å¸â€™Â¾ [Save] SlidesMeta:', slidesMeta.map(s => ({ id: s.id, title: s.title, source: s.source })));

      // Build widgets array from current dashboards/layouts
      dashboards.forEach((layout, slideId) => {
        // We iterate dashboards using Frontend IDs (slideId)

        // Find if this slide ended up in the final payload
        // We need to match frontend slideId to the final Backend ID we generated/looked up above
        const originalId = backendIdMap.current.get(slideId) ?? slideId;
        const validSlide = slidesMeta.find(m => m.id === originalId); // 'id' here is already originalId from above

        if (!validSlide) return;

        layout.forEach((widget, indexInSlide) => {
          const metricConfig = widget.metricConfig ?? {
            id: widget.i,
            metricKey: "",
            integration: "",
            groupBy: "none",
            aggregation: "sum",
            type: widget.widgetType,
          };

          const existingFilters = (metricConfig.filters as Record<string, unknown> | undefined) ?? {};
          // Ensure we have a high-quality name for the backend to use as a label
          const displayName = prettifyMetricLabel(
            metricConfig.displayName ||
            (widget as any).displayName ||
            (widget.data as any)?.displayName ||
            (widget.data as any)?.label ||
            metricConfig.metricKey ||
            "Metric"
          );

          // Self-Healing: If we have resolved live data, ensure the saved widget
          // uses the correctly matched accountId. This fixes "ghost" attributes
          // where the widget thinks it belongs to Account ID 21 but data only exists for Account ID 1.
          // Self-Healing debug logs
          const widgetId = metricConfig.id ?? widget.i;
          const resolvedData = resolvedWidgets[widgetId] as ResolvedWidgetData | undefined;
          let fixedAccountId = metricConfig.accountId;

          if (resolvedData && Array.isArray(resolvedData.rows) && resolvedData.rows.length > 0) {
            const firstRow = resolvedData.rows[0] as UnifiedMetricRow;

            // Case 1: Row has a specific accountId -> enforce it
            if (firstRow.accountId) {
              // Debug GA specifically
              if (metricConfig.integration.includes('google')) {
                console.log(`Ã°Å¸â€Â [Self-Healing GA Debug] Widget Int: '${metricConfig.integration}', Row Int: '${firstRow.integration}', Widget Acc: '${fixedAccountId}', Row Acc: '${firstRow.accountId}'`);
              }

              // Fix Account ID Mismatch
              // eslint-disable-next-line eqeqeq
              if (firstRow.accountId != fixedAccountId) {
                console.log(`Ã°Å¸Â©Â¹ [Self-Healing] Correction for ${metricConfig.metricKey}: accountId ${fixedAccountId} -> ${firstRow.accountId}`);
                toast.success(`Auto-corrected ${displayName} to Account ID ${firstRow.accountId}`);
                fixedAccountId = firstRow.accountId;
              }

              // Fix Integration Name Mismatch (e.g. google-analytics vs google_analytics)
              if (firstRow.integration && firstRow.integration !== metricConfig.integration) {
                console.log(`Ã°Å¸Â©Â¹ [Self-Healing] Correction for ${metricConfig.metricKey}: integration ${metricConfig.integration} -> ${firstRow.integration}`);
                toast.success(`Auto-corrected ${displayName} integration to ${firstRow.integration}`);
                // modify the config we push
                metricConfig.integration = firstRow.integration;
              }
            }
            // Case 2: Row has NO accountId (e.g. global/client metric) but widget insists on one -> clear it
            else if (fixedAccountId) {
              console.log(`Ã°Å¸Â©Â¹ [Self-Healing] Clearing accountId for ${metricConfig.metricKey} (Global Metric)`);
              toast.success(`Auto-corrected ${displayName} to Global Metric`);
              fixedAccountId = undefined;
            }
          }

          widgets.push({
            ...metricConfig,
            id: metricConfig.id ?? widget.i,
            type: metricConfig.type ?? widget.widgetType,
            // Apply the corrected accountId
            accountId: fixedAccountId,
            displayName, // Explicit root level name for snapshotting
            layout: {
              slideId: originalId, // Ã°Å¸â€â€” Use Backend ID
              x: widget.x,
              y: widget.y,
              w: widget.w,
              h: widget.h,
            },
            widgetData: widget.data as unknown,
            // Backend expects 'config', so map our data there for persistence
            config: widget.data as unknown,
            // Persist the snapshot data: Use resolved live data if available, otherwise fall back to existing snapshot/data
            snapshotData: resolvedWidgets[widgetId] ?? widget.snapshotData,
            filters: {
              ...existingFilters,
              // Merge resolved data with widget config so UI properties (columns, title, caption) survive round-trip
              widgetData: resolvedWidgets[widgetId]
                ? { ...resolvedWidgets[widgetId], ...(widget.data as any) }
                : (widget.data as unknown),
              snapshotData: resolvedWidgets[widgetId] ?? widget.snapshotData,
              displayName,
              // Bake slide info into first widget as a recovery beacon
              ...(indexInSlide === 0 ? { slideTitle: validSlide?.title, slideSubtitle: validSlide?.subtitle } : {}),
            },
          });

          console.log(`Ã°Å¸â€œÂ¦ [Widget] Slide ${originalId}: Widget ${widget.i} - pos(${widget.x},${widget.y}) size(${widget.w}x${widget.h})`);
        });

        // console.log(`Ã°Å¸â€œÂ¦ [PayloadBuilder] Slide ${slideId} has ${layout.length} widgets.`);
      });
      console.log(`Ã°Å¸Ââ€”Ã¯Â¸Â [BuildPayload] Construction complete. Widgets: ${widgets.length}, Slides: ${slidesMeta.length}`);

      const payload = {
        name: templateName,
        widgets,
        pageOrder: cleanedPageOrder,
        slidesMeta, // Send all slidesMeta
        defaultDateFrom: dateRange?.from?.toISOString(),
        defaultDateTo: dateRange?.to?.toISOString(),
      };

      console.log(`Ã°Å¸â€™Â¾ [BuildPayload] Final payload details:`, {
        totalWidgets: widgets.length,
        widgetsBySlide: slidesMeta.map(s => ({
          slideId: s.id,
          slideTitle: s.title,
          widgetCount: widgets.filter(w => w.layout?.slideId === s.id).length
        }))
      });

      return payload;
    }, [
      dashboards,
      templateName,
      // Removed: templateQuery.data?.slidesMeta (redundant with processedSlidesMeta)
      customPages,
      integrationsData,
      pageOrder,
      batchById, // batch resolver results (Record<widgetId, ResolvedWidgetResult>)
      dateRange,
      slideIntegrationMap,
      processedSlidesMeta,
      readOnly,
      isLoadingIntegrations,
      deletedSlideIds, // Ensures filter always uses latest Set even in edge cases
      getIntegrationInfoForSlideIdOrWidgets,
      resolveFrontendSlideId
    ]);

  // Ref to always have the latest payload builder for the auto-save effect
  const payloadBuilderRef = useRef(buildTemplatePayloadFromDashboards);
  useEffect(() => {
    payloadBuilderRef.current = buildTemplatePayloadFromDashboards;
  });

  // Ã°Å¸â€Â§ FIX: Track when a slide deletion happens DURING an in-progress save.
  // If a save is already running when the user deletes a slide, isSavingTemplate=true
  // blocks the auto-save timer. Then onSuccess resets hasUnsavedChanges=false and
  // the deletion payload is NEVER sent to the backend.
  // This ref flags that we must keep hasUnsavedChanges=true after the current save
  // completes, so the auto-save fires one more time with the deletion included.
  const deletionNeedsSaveRef = useRef(false);

  // MOVED: handleConfirmNewReport now lives here to access buildTemplatePayloadFromDashboards
  const handleConfirmNewReport = useCallback(() => {
    const trimmedName = newReportName.trim();
    if (!trimmedName) {
      toast.error("Please enter a report name");
      return;
    }

    // Prevent creating a report if integrations are still loading
    if (isLoadingIntegrations) {
      toast.warning("Please wait for integrations to load.");
      return;
    }

    // Prevent creating a report if there are no connected integrations
    if ((integrationsData?.integrations?.length ?? 0) === 0) {
      toast.error("You need to connect at least one data source before creating a report.");
      return;
    }

    // FIX: Prefer "WYSIWYG" (What You See Is What You Get)
    // If dashboards have been auto-populated (which they should be, due to the useEffect),
    // we should use the visually generated widgets instead of regenerating them blindly.
    // This avoids race conditions where groupedMetrics might be empty during 'save' but the
    // UI has already successfully rendered widgets via cold-start or subsequent updates.

    let payload: CreateTemplatePayload;

    // Generate WYSIWYG payload first
    const basePayload = buildTemplatePayloadFromDashboards();
    const hasVisualWidgets = basePayload.widgets && basePayload.widgets.length > 0;

    if (dashboards.size > 0 && hasVisualWidgets) {
      console.log('Ã¢Å“Â¨ [CreateReport] Using WYSIWYG dashboards state for initial save.');
      payload = {
        ...basePayload,
        name: trimmedName,
      };
    } else {
      console.warn('Ã¢Å¡Â Ã¯Â¸Â [CreateReport] Dashboards empty or no widgets, falling back to manual generation (Legacy Path).');
      // FALLBACK: Manual Generation (Original Logic)
      // Only runs if the UI is somehow completely empty.

      const widgets: ReportWidgetDefinition[] = [];
      const slidesMeta: ReportSlideMeta[] = [];
      const pageOrder: number[] = [];

      integrationsData?.integrations.forEach((integration, index) => {
        let metrics = pickDefaultMetricsForIntegration(
          integration.platform,
          integration.accountId,
          groupedMetrics ?? {}, // Handle null
          (msg) => console.log(msg)
        );

        // --- START FIX: Force Default Metrics if Lookup Failed ---
        // If groupedMetrics was loading/empty, 'metrics' might be empty.
        // We force standard defaults here so the report isn't created empty.
        if (metrics.length === 0) {
          console.log(`[CreateReport] No metrics found for ${integration.platform}, forcing defaults.`);
          const normalized = integration.platform.toLowerCase().replace(/[ _]/g, '-');

          // Find matching defaults keys
          const defaultKeys = CURATED_DEFAULTS[normalized] ||
            CURATED_DEFAULTS[integration.platform] ||
            CURATED_DEFAULTS['meta-ads']; // Safe fallback

          if (defaultKeys && defaultKeys.length > 0) {
            metrics = defaultKeys.map(key => ({
              metricKey: key,
              integration: integration.platform,
              accountId: integration.accountId,
              displayName: prettifyMetricLabel(key),
            }));
          }
        }
        // --- END FIX ---

        const integrationWidgets = buildDefaultWidgetsForIntegration(index, metrics, integration.platform, integration.accountId, 0);

        integrationWidgets.forEach((w) => {
          if (w.metricConfig) {
            let backendIntegration = (w.metricConfig.integration || "").toLowerCase();
            // ... (normalization logic) ...
            if (backendIntegration === 'woocommerce') backendIntegration = 'woo';
            else if (!backendIntegration.includes('meta-ads') && !backendIntegration.includes('meta ads') && backendIntegration !== 'google-search-console') {
              backendIntegration = backendIntegration.replace(/[- ]/g, '_');
            } else if (backendIntegration.includes('meta-ads')) {
              backendIntegration = 'meta-ads';
            }

            widgets.push({
              ...w.metricConfig,
              id: w.i,
              integration: backendIntegration,
              layout: { slideId: index, x: w.x, y: w.y, w: w.w, h: w.h },
              type: w.widgetType,
              ...(w.data ? { widgetData: w.data } : {}),
            } as any);
          }
        });

        slidesMeta.push({
          id: index,
          title: "",
          subtitle: "",
          source: "integration",
          integrationIndex: index,
        });
        pageOrder.push(index);
      });

      payload = {
        ...defaultTemplatePayload,
        name: trimmedName,
        widgets: widgets,
        slidesMeta: slidesMeta,
        pageOrder: pageOrder,
      };
    }

    console.log('sending Report Template Payload:', payload);
    const customPageCount = (payload.slidesMeta || []).filter((s: any) => s.source === 'custom').length;
    const integrationPageCount = (payload.slidesMeta || []).filter((s: any) => s.source === 'integration').length;
    toast.info(`Saving: ${customPageCount} Custom, ${integrationPageCount} Int. Pages`);

    createTemplate(payload);
    setIsNameDialogOpen(false);
  }, [
    createTemplate,
    defaultTemplatePayload,
    newReportName,
    integrationsData,
    groupedMetrics,
    dashboards,
    buildTemplatePayloadFromDashboards // Dependency on the WYSIWYG builder
  ]);

  const { mutate: saveTemplate, isPending: isSavingTemplate } = useMutation({
    mutationFn: async (payload: CreateTemplatePayload) => {
      if (!templateId || !parsedClientId) {
        throw new Error("Template not ready or missing client id");
      }
      console.log(`Ã°Å¸â€™Â¾ [SaveMutation] Sending to API:`, {
        templateId,
        clientId: parsedClientId,
        widgetCount: payload.widgets?.length,
        slideCount: payload.slidesMeta?.length
      });
      return updateReportTemplate(parsedClientId, templateId, payload);
    },
    onSuccess: (data) => {
      console.log(`Ã¢Å“â€¦ [SaveMutation] Success! Response:`, data);

      // DO NOT sync pageOrder from backend response.
      // pageOrder must always stay in frontend IDs (matching dashboards keys, customPages IDs,
      // and processedSlidesMeta IDs). The backend returns backend DB IDs (e.g. [6395, 6396, 7000])
      // which don't match frontend state Ã¢â‚¬â€ syncing them causes pages to disappear.
      // The backend's pageOrder is only consumed during initial hydration (page refresh),
      // where it gets translated back to frontend IDs.

      // Only update backendIdMap Ã¢â‚¬â€ maps frontend IDs Ã¢â€ â€™ backend DB IDs for subsequent saves
      if (data?.template?.slides && Array.isArray(data.template.slides)) {
        console.log(`Ã°Å¸â€â€” [SaveMutation] Updating backendIdMap from slides:`, data.template.slides.map((s: any) => ({ id: s.id, sortOrder: s.sortOrder, title: s.title, source: s.source })));

        // Build reverse map from current backendIdMap: backendId Ã¢â€ â€™ frontendId
        const currentBackendToFrontend = new Map<number, number>();
        backendIdMap.current.forEach((bId, fId) => {
          currentBackendToFrontend.set(bId, fId);
        });

        data.template.slides.forEach((slide: any) => {
          if (!slide.id) return;

          // 1. If we already have a mapping for this backend ID, preserve it
          const existingFrontendId = currentBackendToFrontend.get(slide.id);
          if (existingFrontendId !== undefined) {
            backendIdMap.current.set(existingFrontendId, slide.id);
            console.log(`Ã°Å¸â€â€” [SaveMutation] Preserved: Frontend ${existingFrontendId} -> Backend ${slide.id} (${slide.title})`);
            return;
          }

          // 2. Ã°Å¸â€Â§ CRITICAL FIX: Use pageOrder to map sortOrder -> Frontend ID
          // Do NOT use sortOrder directly as a key, because reordering changes the index!
          // Example: If Custom Page (ID 1000) is moved to index 0:
          // - sortOrder = 0
          // - We MUST map Frontend ID 1000 -> Backend ID
          // - We must NOT map Frontend ID 0 -> Backend ID (that would overwrite Facebook!)
          const sentOrder = pageOrder.length > 0 ? pageOrder : Array.from(dashboards.keys());

          if (typeof slide.sortOrder === 'number' && slide.sortOrder < sentOrder.length) {
            const frontendId = sentOrder[slide.sortOrder];

            // Validate the frontend ID exists in our state
            if (typeof frontendId === 'number' && (dashboards.has(frontendId) || frontendId >= 1000)) {
              backendIdMap.current.set(frontendId, slide.id);
              console.log(`Ã°Å¸â€â€” [SaveMutation] Mapped via Order: Frontend ${frontendId} -> Backend ${slide.id} (SortOrder ${slide.sortOrder})`);
              return;
            }
          }

          console.warn(`Ã¢Å¡Â Ã¯Â¸Â [SaveMutation] Could not map slide ${slide.id} to a frontend ID. SortOrder: ${slide.sortOrder}`);
        });
      }

      setLastSavedTime(new Date());

      // Ã°Å¸â€Â§ FIX: If a slide was deleted WHILE this save was in progress,
      // DO NOT reset hasUnsavedChanges Ã¢â‚¬â€ the deletion payload hasn't been sent yet.
      // Keeping it true lets the auto-save fire one more time with the deletion.
      if (deletionNeedsSaveRef.current) {
        console.log(`Ã°Å¸â€â€ž [SaveMutation] Pending deletion detected Ã¢â‚¬â€ keeping hasUnsavedChanges=true for follow-up save`);
        deletionNeedsSaveRef.current = false; // Clear after first follow-up
        // hasUnsavedChanges stays true Ã¢â€ â€™ auto-save will fire again with the deletion
      } else {
        setHasUnsavedChanges(false);
        toast.success("Report template saved");
      }
    },
    onError: (error: ApiError) => {
      console.error(`Ã¢ÂÅ’ [SaveMutation] Failed:`, error);
      toast.error(error.message || "Failed to save template");
    },
  });

  // Auto-save: Debounced save when dashboards, customPages, or templateName changes
  useEffect(() => {
    // Skip auto-save if:
    // - No template ID (new template not yet created)
    // - Template is loading
    // - Template is being bootstrapped
    // - Read-only mode
    // - Data is currently fetching (to avoid saving empty snapshots)
    // - Dashboards not yet initialized (prevents saving empty state during hydration race conditions)
    // - Integrations are loading (prevents saving with empty slideIntegrationMap)
    if (
      !templateId ||
      isTemplateLoading ||
      templateBootstrapRef.current ||
      readOnly ||
      reportDataQuery.isFetching ||
      !isDashboardsInitialized ||
      isLoadingIntegrations ||
      isSavingTemplate || // Don't auto-save if a save is already in progress
      !hasUnsavedChanges   // CRITICAL: Only save if there are actual unsaved changes
    ) {
      return;
    }

    // Debounce: wait 1 second after last change before saving
    const timer = setTimeout(() => {
      const payload = payloadBuilderRef.current();

      // Ã°Å¸â€Â§ CRITICAL FIX: Allow saving "Structure Only" reports
      // We only block if BOTH widgets AND slides are empty.
      const hasWidgets = payload.widgets && payload.widgets.length > 0;
      const hasSlides = payload.slidesMeta && payload.slidesMeta.length > 0;

      if (!hasWidgets && !hasSlides) {
        console.warn(`Ã¢ÂÂ¸Ã¯Â¸Â [Auto-save] BLOCKED - Payload is completely empty (No widgets, No slides)!`);
        return;
      }

      console.log(`Ã°Å¸â€™Â¾ [Auto-save] Calling saveTemplate...`, { widgets: payload.widgets?.length, slides: payload.slidesMeta?.length });
      saveTemplate(payload);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    dashboards,
    customPages,
    pageOrder,
    templateName,
    templateId,
    isTemplateLoading,
    readOnly,
    isDashboardsInitialized,
    isLoadingIntegrations,
    isSavingTemplate,
    hasUnsavedChanges // Added hasUnsavedChanges to break the loop on success
  ]);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);


  // We do NOT auto-save on mount/refresh. User must click Save to persist self-healing fixes.
  const handleSaveTemplate = useCallback(() => {
    if (!templateId) {
      toast.error("Template not ready yet");
      return;
    }

    // Prevent saving if data is still loading, as Self-Healing needs resolved widgets
    if (reportDataQuery.isFetching) {
      toast.warning("Please wait for all data to load before saving to ensure report link integrity.");
      return;
    }

    // Prevent saving if integrations are still loading
    if (isLoadingIntegrations) {
      toast.warning("Please wait for integrations to load before saving.");
      return;
    }

    console.log("Ã°Å¸â€™Â¾ [handleSaveTemplate] Clicked. Checking inputs...");
    console.log(`Ã°Å¸â€™Â¾ [handleSaveTemplate] Dashboards Size: ${dashboards.size}`);
    console.log(`Ã°Å¸â€™Â¾ [handleSaveTemplate] Dashboards Keys:`, Array.from(dashboards.keys()));
    console.log('Ã°Å¸â€™Â¾ [handleSaveTemplate] Current pageOrder State:', pageOrder);

    const basePayload = buildTemplatePayloadFromDashboards();

    // Ã°Å¸â€Â§ SAFETY: Prevent saving with 0 widgets UNLESS it's intentional (user deleted everything)
    // If dashboards exist but have 0 widgets, we allow it (user might be clearing a report).
    // If dashboards also 0, it might be a hydration failure.
    if ((!basePayload.widgets || basePayload.widgets.length === 0) && dashboards.size === 0) {
      toast.error("Cannot save - No data loaded. Please wait for widgets to load.");
      return;
    }

    // DEBUG: Show user what is being saved
    const widgetCount = basePayload.widgets?.length || 0;
    const customPageCount = (basePayload.slidesMeta || []).filter(s => s.source === 'custom').length;
    const integrationPageCount = (basePayload.slidesMeta || []).filter(s => s.source === 'integration').length;
    toast.info(`Saving ${widgetCount} widgets across ${customPageCount + integrationPageCount} pages...`);

    // DATA SYNC FIX: Inject live data from reportDataQuery into the payload
    // This forces the backend snapshot to match the "WYSIWYG" Builder view (e.g. 1888 value)
    // instead of regenerating it with potentially different backend logic (e.g. 799 value).
    if (basePayload.widgets && reportDataQuery.data) {
      basePayload.widgets = basePayload.widgets.map(w => {
        // Find matching data in the query result
        // The query result uses widget IDs as keys
        const liveData = reportDataQuery.data?.[w.id];

        if (liveData) {
          console.log(`Ã°Å¸â€™â€° [DataSync] Injecting live data for widget ${w.id} (${w.metricKey})`);

          // Optimization: Strip heavy rows from Metric widgets as they only need summaries
          // This prevents "Request Entity Too Large" errors (413)
          const isMetric = w.type === 'metric' || (w as any).widgetType === 'metric';

          // Create a shallow copy to modify
          // Ã¢Å“â€¦ FIX: Merge live data rows/values BUT preserve UI config (columns, title, caption) from the builder state
          const originalData = w.widgetData as any || {};
          const optimizedData = {
            ...liveData,
            ...originalData,
            // Force the actual metric results from liveData to ensure the snapshot is accurate
            rows: liveData.rows ?? [],
            value: liveData.value,
            total: liveData.total,
            series: liveData.series,
            pagination: liveData.pagination,
            success: liveData.success
          };

          if (isMetric) {
            optimizedData.rows = [];
          }

          return {
            ...w,
            // Update all persistence fields (widgetData AND config) to ensure the backend saves the correct configuration
            widgetData: optimizedData,
            config: optimizedData,
            filters: {
              ...w.filters,
              widgetData: optimizedData
            }
          };
        }
        return w;
      });
    }

    const payload = {
      ...basePayload,
      defaultDateFrom: dateRange?.from
        ? formatApiDate(dateRange.from)
        : undefined,
      defaultDateTo: dateRange?.to ? formatApiDate(dateRange.to) : undefined,
      // Use pageOrder from basePayload (already cleaned by buildTemplatePayloadFromDashboards)
      // Don't override with sorted dashboardIds fallback as it breaks custom page ordering
    };

    saveTemplate(payload);
  }, [
    templateId,
    reportDataQuery.data, // Add dependency to ensure we have latest data
    buildTemplatePayloadFromDashboards,
    saveTemplate,
    dateRange,
    pageOrder,
    dashboardIds,
    dashboards,
  ]);



  const handleGeneratePdf = useCallback(async () => {
    if (isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      // Ensure all widget data is fetched (including off-screen slides) before exporting
      await prefetchAllWidgets();
      await exportAllSlidesToPDF(slidesRef.current, effectivePageOrder);
    } catch (error) {
      console.error("Failed to generate PDF from frontend", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [isGeneratingPdf, pageOrder]);

  const handleConnectIntegration = useCallback(() => {
    navigate(`/clients/${parsedClientId}?tab=data-sources`);
  }, [navigate, parsedClientId]);



  useEffect(() => {
    const routeId = providedReportId ? String(providedReportId) : params.id;
    if (!routeId || routeId === "new") {
      if (!readOnly && !isCreatingTemplate && !templateBootstrapRef.current) {
        templateBootstrapRef.current = true;
        setIsNameDialogOpen(true);
      }
      return;
    }

    const numericId = Number(routeId);
    if (Number.isNaN(numericId)) {
      toast.error("Invalid report id");
      return;
    }

    setTemplateId(numericId);
  }, [params.id, providedReportId, isCreatingTemplate, defaultTemplatePayload, createTemplate, readOnly]);

  const [widgetFormState, setWidgetFormState] = useState<WidgetFormState>({
    slideId: 0,
    widgetId: "",
    widgetType: "",
    data: undefined, // Ã¢Å“â€¦ use 'undefined' or just omit
    i: "", // required by Layout
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  });
  const updateDashboard = useCallback(
    (id: number, newLayout: DashboardLayout[]) => {
      setDashboards((prev) => {
        const updated = new Map(prev);
        updated.set(id, newLayout);
        return updated;
      });
    },
    []
  );

  // Ref for robust ID generation
  const nextCustomIdRef = useRef(1000);

  const addCustomPage = useCallback(
    (pageName: string, subtitle?: string) => {
      // Robust ID generation using ref (initialized during hydration)
      const nextId = nextCustomIdRef.current++;

      console.log(`[addCustomPage] Creating custom page with ID=${nextId}, name="${pageName}"`);

      // CRITICAL FIX: Update dashboards first, then nest pageOrder update inside
      // This ensures the new empty dashboard exists before we update pageOrder
      setDashboards((prevDashboards) => {
        const updated = new Map(prevDashboards);
        // Force set empty array to ensure new slide starts with no widgets
        updated.set(nextId, []);
        console.log(`Ã¢Å“â€¦ [Add Custom Page] Created empty dashboard for ID ${nextId}`);
        console.log(`Ã¢Å“â€¦ [Add Custom Page] Dashboard has ${updated.get(nextId)?.length || 0} widgets`);

        // Update pageOrder immediately after dashboards update
        // This ensures pageOrder uses the most up-to-date dashboard keys
        setPageOrder((prevOrder) => {
          const base = prevOrder.length > 0 ? prevOrder : Array.from(prevDashboards.keys());
          const newOrder = [...base, nextId];
          console.log(`Ã¢Å“â€¦ [Add Custom Page] Updated pageOrder:`, newOrder);
          return newOrder;
        });

        return updated;
      });

      // Add to custom pages
      setCustomPages((prev) => [
        ...prev,
        { id: nextId, name: pageName, subtitle },
      ]);

      // Add to processedSlidesMeta with source: 'custom'
      // This ensures the page is saved with the correct metadata and persists after refresh
      setProcessedSlidesMeta((prev) => [
        ...prev,
        {
          id: nextId,
          title: pageName,
          subtitle: subtitle || 'Custom page',
          source: 'custom' as const
        }
      ]);

      setHasUnsavedChanges(true);
      toast.success(`Added custom page: ${pageName}`);

      return nextId;
    },
    [] // Removed dashboards dependency to prevent stale closures
  );


  const handleDeletePage = useCallback((slideId: number) => {
    console.log(`Ã°Å¸â€”â€˜Ã¯Â¸Â [Delete] Deleting slide ${slideId}`);

    // Remove the slide from dashboards
    setDashboards((prev) => {
      const updated = new Map(prev);
      updated.delete(slideId);
      console.log(`Ã°Å¸â€”â€˜Ã¯Â¸Â [Delete] Updated dashboards, keys:`, Array.from(updated.keys()));
      return updated;
    });

    // Remove from custom pages (if it was a custom page)
    setCustomPages((prev) => prev.filter((p) => p.id !== slideId));

    // Remove from page order
    setPageOrder((prev) => {
      const updated = prev.filter((id) => id !== slideId);
      console.log(`Ã°Å¸â€”â€˜Ã¯Â¸Â [Delete] Updated pageOrder:`, updated);
      return updated;
    });

    // Remove from processedSlidesMeta to prevent ghost pages in sidebar
    setProcessedSlidesMeta((prev) => prev.filter((s) => Number(s.id) !== slideId));

    // Track explicitly deleted slides to prevent auto-restoration
    setDeletedSlideIds((prev) => {
      const updated = new Set(prev);
      updated.add(slideId);
      const backendId = backendIdMap.current.get(slideId);
      if (backendId != null) {
        updated.add(backendId);
      }
      console.log(`Ã°Å¸â€”â€˜Ã¯Â¸Â [Delete] Updated deletedSlideIds:`, Array.from(updated));
      return updated;
    });

    // Clear any references
    if (slidesRef.current[slideId]) {
      slidesRef.current[slideId] = null;
    }
    widgetRefs.current.delete(slideId);

    // If a widget on this slide was selected, clear the selection
    setWidgetFormState((prev) =>
      prev.slideId === slideId
        ? {
          slideId: 0,
          widgetId: "",
          widgetType: "",
          data: undefined,
          i: "",
          x: 0,
          y: 0,
          w: 1,
          h: 1,
        }
        : prev
    );

    // Ã°Å¸â€Â§ FIX: Mark that a deletion is pending so that if a save is currently in
    // progress, its onSuccess doesn't reset hasUnsavedChanges before the deletion
    // payload is sent. This prevents the deletion from being silently dropped.
    deletionNeedsSaveRef.current = true;
    setHasUnsavedChanges(true);
    toast.success("Page removed");
  }, []);

  const handleRenamePage = useCallback((slideId: number, newName: string) => {
    setCustomPages((prev) => {
      const existing = prev.find((p) => p.id === slideId);
      if (existing) {
        return prev.map((p) =>
          p.id === slideId ? { ...p, name: newName } : p
        );
      }
      // If this slide wasn't in customPages yet (e.g., an older or integration page),
      // add a new entry so the name override is included in slidesMeta on save.
      return [...prev, { id: slideId, name: newName }];
    });
    setHasUnsavedChanges(true); // Triggers auto-save
  }, []);

  const handleReorderPages = useCallback(
    (fromIndex: number, toIndex: number) => {
      setPageOrder((prevOrder) => {
        // Ã°Å¸â€Â¥ FIX: Ensure we operate on the VISIBLE list indices, not the raw pageOrder which might have ghosts.
        // The UI (Sidebar) renders 'effectivePageOrder', so indices match that filtered list.
        const validIds = new Set(dashboards.keys());
        const rawOrder = prevOrder.length > 0 ? prevOrder : Array.from(dashboards.keys());

        // FIX: Don't filter out Backend IDs just because they aren't in dashboards map!
        // We must check if they MAP to a dashboard.
        const visibleOrder = Array.from(new Set(rawOrder.filter(id => {
          if (validIds.has(id)) return true; // Direct match (Frontend ID)

          // Backend ID match?
          // Check if this ID is a value in backendIdMap, and its key is in validIds
          for (const [fId, bId] of backendIdMap.current.entries()) {
            if (bId === id && validIds.has(fId)) return true;
          }
          return false;
        })));

        // Validate indices
        if (
          fromIndex < 0 ||
          fromIndex >= visibleOrder.length ||
          toIndex < 0 ||
          toIndex > visibleOrder.length
        ) {
          console.warn('Ã¢Å¡Â Ã¯Â¸Â [Reorder] Indices out of bounds', { fromIndex, toIndex, length: visibleOrder.length });
          return prevOrder;
        }

        // Perform move on the cleansed list
        const [movedItem] = visibleOrder.splice(fromIndex, 1);
        visibleOrder.splice(toIndex, 0, movedItem);

        console.log('Ã°Å¸â€â€ž [handleReorderPages] Updating pageOrder to:', visibleOrder);
        setHasUnsavedChanges(true); // Triggers auto-save
        return visibleOrder;
      });
    },
    [dashboards]
  );

  const handleAddIntegrationPage = useCallback((integrationIndex: number) => {
    // 1. Find all slide IDs that belong to this integration
    const integrationSlideIds = Array.from(slideIntegrationMap.entries())
      .filter(([_, info]) => info.originalIndex === integrationIndex)
      .map(([slideId, _]) => slideId);

    if (integrationSlideIds.length === 0) {
      toast.error("Integration not found");
      return;
    }

    // 2. Find the first slide ID that doesn't have a dashboard yet
    const availableSlideId = integrationSlideIds.find(slideId => !dashboards.has(slideId));

    if (availableSlideId === undefined) {
      toast.error("This integration page already exists");
      return;
    }

    // 2.5. Remove from deletedSlideIds if it was previously deleted
    setDeletedSlideIds((prev) => {
      const updated = new Set(prev);
      const backendId = backendIdMap.current.get(availableSlideId);
      const hadFrontend = updated.delete(availableSlideId);
      const hadBackend = backendId != null ? updated.delete(backendId) : false;
      const backendLabel = backendId != null ? ` (backend ${backendId})` : "";

      if (hadFrontend || hadBackend) {
        console.log(`[Add Integration] Removed slide ${availableSlideId}${backendLabel} from deletedSlideIds`);
        return updated;
      }
      return prev;
    });

    // 3. Create the slide with default widgets if enabled
    let defaultWidgets: DashboardLayout[] = [];
    if (ENABLE_AUTO_DEFAULT_WIDGETS) {
      const integration = integrationsData?.integrations?.[integrationIndex];
      const slideInfo = slideIntegrationMap.get(availableSlideId);

      if (integration && slideInfo) {
        const picked = pickDefaultMetricsForIntegration(
          integration.platform,
          integration.accountId,
          (groupedMetrics ?? {}) as any,
          (msg) => toast.warning(msg)
        );

        // Ã°Å¸â€Â§ CRITICAL FIX: Pass subSlideIndex to ensure correct widgets for multi-slide integrations
        // For Meta Business: slideInfo.slideTitle tells us if it's Facebook (0) or Instagram (1)
        const subSlideIndex = slideInfo.slideTitle.toLowerCase().includes('instagram') ? 1 : 0;
        console.log(`Ã°Å¸â€Â§ [Add Integration] Building widgets for ${slideInfo.slideTitle} with subSlideIndex=${subSlideIndex}`);

        defaultWidgets = buildDefaultWidgetsForIntegration(
          availableSlideId,
          picked,
          integration.platform,
          integration.accountId,
          subSlideIndex
        );
      }
    }

    // 4. Add to dashboards using the correct slide ID
    setDashboards((prev) => {
      const updated = new Map(prev);
      updated.set(availableSlideId, defaultWidgets);
      return updated;
    });

    // 5. Add to page order (append to end) using the correct slide ID
    setPageOrder((prev) => {
      // Don't add if already in pageOrder (e.g., orphaned from corrupted template data)
      if (prev.includes(availableSlideId)) {
        return prev;
      }
      const newOrder = [...prev, availableSlideId];
      setHasUnsavedChanges(true);
      return newOrder;
    });

    // 6. Update processedSlidesMeta with correct title from slideIntegrationMap
    const slideInfo = slideIntegrationMap.get(availableSlideId);
    if (slideInfo) {
      setProcessedSlidesMeta((prev) => {
        // Check if this slide already has metadata
        const existingIndex = prev.findIndex(m => m.id === availableSlideId);
        const integration = integrationsData?.integrations?.[integrationIndex];

        const newMeta = {
          id: availableSlideId,
          title: slideInfo.slideTitle,
          subtitle: integration?.accountName || slideInfo.accountName,
          source: 'integration' as const,
          integrationIndex: slideInfo.originalIndex,
          sortOrder: prev.length // Append to end
        };

        if (existingIndex >= 0) {
          // Update existing metadata
          const updated = [...prev];
          updated[existingIndex] = newMeta;
          console.log(`Ã¢Å“â€¦ [Add Integration] Updated processedSlidesMeta for slide ${availableSlideId}: "${newMeta.title}"`);
          return updated;
        } else {
          // Add new metadata
          console.log(`Ã¢Å“â€¦ [Add Integration] Added processedSlidesMeta for slide ${availableSlideId}: "${newMeta.title}"`);
          return [...prev, newMeta];
        }
      });
    }

    toast.success("Integration page added");

    // 6. Scroll to new page using the correct slide ID
    setTimeout(() => {
      if (slidesRef.current[availableSlideId]) {
        slidesRef.current[availableSlideId]?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

  }, [dashboards, groupedMetrics, isLoadingAvailableMetrics, integrationsData, slideIntegrationMap]);

  // Update widget data in dashboards state
  const updateWidgetData = useCallback(
    (slideId: number, widgetId: string, newData: WidgetData) => {
      setDashboards((prev) => {
        const updated = new Map(prev);
        const layout = updated.get(slideId);
        if (!layout) return prev;

        const updatedLayout = layout.map((widget) =>
          widget.i === widgetId ? { ...widget, data: newData } : widget
        );
        updated.set(slideId, updatedLayout);
        return updated;
      });

      setHasUnsavedChanges(true);
      modifiedSlideIds.current.add(slideId);

      // Also update widgetFormState to keep it in sync
      setWidgetFormState((prev) => ({
        ...prev,
        data: newData,
      }));
    },
    []
  );

  // Update widget type in dashboards state and convert data/config if needed
  const updateWidgetType = useCallback(
    (slideId: number, widgetId: string, newType: ReportWidgetType) => {
      setDashboards((prev) => {
        const updated = new Map(prev);
        const layout = updated.get(slideId);
        if (!layout) return prev;

        const updatedLayout = layout.map((widget) => {
          if (widget.i === widgetId) {
            // Get default data for the new type to merge/overwrite
            const defaultNewData = getDefaultWidgetData(newType);

            // Preserve common fields if possible (label/title)
            let mergedData: any = { ...defaultNewData };
            const oldData: any = widget.data || {};

            if (newType === 'chart' && (widget.widgetType === 'metric' || widget.widgetType === 'chart')) {
              // Converting Metric -> Chart or Chart type change
              mergedData.title = oldData.label || oldData.title || widget.metricConfig?.displayName || "Chart";
              mergedData.chartType = 'column'; // Default to column
            } else if (newType === 'metric' && widget.widgetType === 'chart') {
              // Converting Chart -> Metric
              mergedData.label = oldData.title || oldData.label || widget.metricConfig?.displayName || "Metric";
            }

            return {
              ...widget,
              widgetType: newType,
              data: mergedData,
              metricConfig: widget.metricConfig ? {
                ...widget.metricConfig,
                type: newType,
                groupBy: newType === 'chart' ? 'day' : 'none'
              } : undefined
            };
          }
          return widget;
        });
        updated.set(slideId, updatedLayout);
        return updated;
      });

      setHasUnsavedChanges(true);

      // Update widgetFormState immediately to reflect the change in the editor
      setWidgetFormState((prev) => ({
        ...prev,
        widgetType: newType,
        // Data will be updated via the layout update effect or next render, but let's reset it here effectively
        // Actually, we should probably wait for the effect to sync, but setting state helps immediate UI switch
        data: getDefaultWidgetData(newType)
      }));
    },
    []
  );

  // Remove a widget from a specific slide
  const handleDeleteWidget = useCallback(
    (slideId: number, widgetId: string) => {
      setDashboards((prev) => {
        const updated = new Map(prev);
        const layout = updated.get(slideId);
        if (!layout) return prev;

        const newLayout = layout.filter((widget) => widget.i !== widgetId);
        updated.set(slideId, newLayout);
        return updated;
      });

      // If the deleted widget was selected in the right-side editor, clear it
      setWidgetFormState((prev) =>
        prev.widgetId === widgetId
          ? {
            slideId: 0,
            widgetId: "",
            widgetType: "",
            data: undefined,
            i: "",
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          }
          : prev
      );
      setHasUnsavedChanges(true);
      modifiedSlideIds.current.add(slideId);
    },
    []
  );

  // Auto-fit each widget's height to its rendered content by adjusting layout h (in rows)
  const syncWidgetHeightsToContent = useCallback(
    (slideId: number) => {
      const layout = dashboards.get(slideId);
      const slideWidgetRefs = widgetRefs.current.get(slideId);
      if (!layout || !slideWidgetRefs) return;

      const updatedLayout: DashboardLayout[] = layout.map((item) => {
        const el = slideWidgetRefs.get(item.i);
        if (!el) return item;
        const contentHeight = el.clientHeight;
        const desiredRows = Math.max(
          DEFAULT_WIDGET_SIZE.h,
          Math.ceil(contentHeight / GRID_CONFIG.rowHeight)
        );
        if (desiredRows !== item.h) {
          return { ...item, h: desiredRows };
        }
        return item;
      });

      // Only update if something changed
      const changed =
        updatedLayout.length !== layout.length ||
        updatedLayout.some((it, idx) => it.h !== layout[idx].h);
      if (changed) {
        updateDashboard(slideId, updatedLayout);
      }
    },
    [dashboards, updateDashboard]
  );

  // Recalculate on dashboards change (content/layout updated)
  // Use requestAnimationFrame to batch DOM reads
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dashboardIds.forEach((id) => syncWidgetHeightsToContent(id));
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [dashboards, dashboardIds, syncWidgetHeightsToContent]);

  const handleDrop = useCallback(
    (_layoutArr: Layout[], layoutItem: Layout, e: DragEvent, id: number) => {
      let widgetType = e.dataTransfer?.getData(
        "widgetType"
      ) as ReportWidgetType | null;
      if (!widgetType) return;

      // Get metric data if available
      const metricDataStr = e.dataTransfer?.getData("metricData");
      const customKind = e.dataTransfer?.getData("customKind") || undefined;
      let metricData:
        | {
          metricKey: string;
          integration: string;
          accountId: string;
          label?: string;
          filters?: Record<string, unknown>;
        }
        | undefined;

      if (metricDataStr) {
        try {
          metricData = JSON.parse(metricDataStr);
        } catch (err) {
          console.error("Failed to parse metric data:", err);
        }
      }

      // Force Recent Posts to be a Table
      if (metricData?.metricKey === 'meta.facebook.recent_posts') {
        widgetType = 'table';
      }

      // Enforce dropping metrics only on their matching integration slide
      if (metricData) {
        const expected = slideIntegrationMap.get(id);
        const normalize = (val?: string) => {
          const l = (val ?? "").toLowerCase().replace(/_/g, "-");
          if (l === "woo") return "woocommerce";
          if (l === "google-console") return "google-search-console";
          return l;
        };

        console.log("[ReportBuilder][drop]", {
          slideId: id,
          expectedIntegration: expected?.platform,
          expectedAccountId: expected?.accountId,
          metricIntegration: metricData.integration,
          metricAccountId: metricData.accountId,
        });

        const isMetaBusinessChild = expected && (expected.platform === 'meta-business' || expected.platform === 'meta_business') &&
          (normalize(metricData.integration) === 'meta-facebook' ||
            normalize(metricData.integration) === 'meta-instagram');

        if (
          expected &&
          normalize(metricData.integration) !== normalize(expected.platform) &&
          !isMetaBusinessChild
        ) {
          // Soften strict block to a warning to prevent invisible failures for slightly mismatched keys
          toast.warning(
            `Metric integration (${metricData.integration}) differs from page (${expected.platform}).`
          );
        }
        // Account mismatch should not hard-block if integration matches; allow but warn
        // Use loose equality for string/number account IDs
        if (
          expected &&
          metricData.accountId &&
          expected.accountId &&
          // eslint-disable-next-line eqeqeq
          metricData.accountId != expected.accountId &&
          expected.platform !== "meta-business" // Skip for meta-business (Business ID != Page/IG ID is expected)
        ) {
          toast.warning(
            "This metric is from another account. Verify before using."
          );
        }
      } else {
        console.log("[ReportBuilder][drop] non-metric widget", {
          slideId: id,
          widgetType,
        });
      }

      // Ã¢Å“â€¦ Use defaults or fallbacks
      let { w, h } = WIDGET_SIZE_MAP[widgetType] ?? { w: 4, h: 3 };

      // Force full width and appropriate height for data tables (posts, media, campaigns, demographics)
      if (metricData && widgetType === 'table') {
        const key = metricData.metricKey || "";
        const isDataTable = key === 'meta.facebook.recent_posts' || key === 'meta.instagram.recent_media' || key === 'meta.ads.campaign_performance' || key === 'meta.instagram.followers.country' || key === 'meta.instagram.followers.city';
        if (isDataTable) {
          w = 12; // Full width
          h = 8;  // Enough height for rows
        }
      }

      // Strict Safety Check: Only affect "metric" type widgets (Metric Cards)
      if (metricData && widgetType === 'metric') {
        const key = (metricData.metricKey || "").toLowerCase();
        const integration = (metricData.integration || "").toLowerCase().replace(/_/g, '-');

        // Scope strictly to Meta Ads integration or metric keys (Handles both 'meta-ads' and 'meta_ads')
        if (integration === 'meta-ads' || key.startsWith('meta.ads')) {
          w = 3; // Force 1/4 width (standard for metrics)
          h = 3; // Force standard height
        }
      }

      // Ã°Å¸Â§Â  Use descriptive IDs for better fallback reconstruction on shared reports
      const safeLabel = (metricData?.label || widgetType).replace(/[^a-zA-Z0-9]/g, '_');
      const widgetIdentifier = generateWidgetId(safeLabel);

      // Default widget data
      let widgetData = getDefaultWidgetData(widgetType);

      // Apply the metric label if available
      if (metricData?.label && widgetData) {
        if ("label" in widgetData) {
          (widgetData as any).label = metricData.label;
        }
        if ("title" in widgetData) {
          (widgetData as any).title = metricData.label;
        }
        // Bake the displayName into the widget data so it's persisted in snapshots
        (widgetData as any).displayName = metricData.label;
      }

      // FIX: Inject correct default columns for Meta Recent Posts/Media
      if (metricData?.metricKey === 'meta.facebook.recent_posts' && widgetData && 'columns' in widgetData) {
        (widgetData as any).columns = DEFAULT_RECENT_POSTS_COLUMNS;
        // Start empty, data will be fetched
        (widgetData as any).rows = [];
      } else if (metricData?.metricKey === 'meta.instagram.recent_media' && widgetData && 'columns' in widgetData) {
        (widgetData as any).columns = DEFAULT_INSTAGRAM_MEDIA_COLUMNS;
        (widgetData as any).rows = [];
      } else if (metricData?.metricKey === 'meta.ads.campaign_performance' && widgetData && 'columns' in widgetData) {
        (widgetData as any).columns = DEFAULT_META_ADS_CAMPAIGN_COLUMNS;
        (widgetData as any).rows = [];
      }

      // If this is a custom Content Block with a specific kind, annotate it in data
      if (widgetType === "custom" && widgetData && "content" in widgetData) {
        const kind = customKind || "text";
        (widgetData as CustomWidgetData).type = kind;
        if (kind === "tasks") {
          (widgetData as CustomWidgetData).content = "Task 1\nTask 2";
        } else if (kind === "toc") {
          (widgetData as CustomWidgetData).content = "Section 1";
        }
      }

      const newItem: DashboardLayout = {
        i: widgetIdentifier,
        x: widgetType !== "title" ? layoutItem?.x : 0,
        y: widgetType !== "title" ? layoutItem?.y : -1,
        w,
        h,
        widgetType,
        data: widgetData,
        metricConfig: metricData
          ? {
            id: widgetIdentifier,
            metricKey: metricData.metricKey,
            integration: metricData.integration,
            accountId: metricData.accountId,
            groupBy: "day",
            aggregation: "sum",
            type: widgetType,
            displayName: prettifyMetricLabel(metricData.label || metricData.metricKey),
            ...(metricData.filters ? { filters: metricData.filters } : {}),
          }
          : {
            // If we don't have metric data from the API, don't invent a metric.
            // Treat this as a layout-only widget; backend can ignore empty metric fields.
            id: widgetIdentifier,
            metricKey: "",
            integration: "",
            groupBy: "none",
            aggregation: "sum",
            type: widgetType,
          },
      };

      if (widgetType === "table") {
        console.log("[ReportBuilder] Dropped table widget", {
          widgetId: widgetIdentifier,
          slideId: id,
          metricData,
          widgetData,
        });
      }

      // Ã°Å¸Âªâ€ž Update the dashboards map immutably
      setDashboards((prev) => {
        const updated = new Map(prev);
        const existingLayout = updated.get(id) ?? [];
        updated.set(id, [...existingLayout, newItem]);
        return updated;
      });
    },
    [slideIntegrationMap]
  );

  // Layout change helper: used when widgets are moved or resized
  // Layout change helper: used when widgets are moved or resized
  const createLayoutChangeHandler = useCallback(
    (slideId: number, currentLayout: DashboardLayout[]) =>
      (newLayout: Layout[]) => {
        // Ã°Å¸â€ºÂ¡Ã¯Â¸Â CRITICAL: Ignore layout changes when in mobile view
        if (isMobile || isTablet) {
          console.log('[ReportBuilder] Ignoring layout change in mobile/tablet view');
          return;
        }

        // Only update if there's an actual change in x, y, w, or h
        const isActuallyChanged = newLayout.some((newWidget) => {
          const oldWidget = currentLayout.find((w) => w.i === newWidget.i);
          if (!oldWidget) return true;
          return (
            newWidget.x !== oldWidget.x ||
            newWidget.y !== oldWidget.y ||
            newWidget.w !== oldWidget.w ||
            newWidget.h !== oldWidget.h
          );
        });

        if (isActuallyChanged) {
          // Ã¢Å“â€¦ FIX: Use functional state update to ensure we always have the latest dashboards map
          setDashboards(prev => {
            const updated = new Map(prev);
            const currentSlideLayout = updated.get(slideId) || [];

            // Merge the new layout positions (x,y,w,h) into the existing widgets (preserving data, config etc)
            const mergedLayout = currentSlideLayout.map(item => {
              const updatedItem = newLayout.find(n => n.i === item.i);
              return updatedItem ? { ...item, ...updatedItem } : item;
            });

            updated.set(slideId, mergedLayout);
            return updated;
          });

          setHasUnsavedChanges(true); // Triggers auto-save
          modifiedSlideIds.current.add(slideId);
        }
      },
    [isMobile, isTablet] // Removed updateDashboard dependency
  );



  const handleDragStart = useCallback(
    (
      e: React.DragEvent<HTMLDivElement>,
      widgetType: ReportWidgetType,
      metricDataOrCustomKind?:
        | {
          metricKey: string;
          integration: string;
          accountId: string;
          label?: string;
          filters?: Record<string, unknown>;
        }
        | string
    ) => {
      e.dataTransfer.setData("widgetType", widgetType);

      if (typeof metricDataOrCustomKind === "string") {
        e.dataTransfer.setData("customKind", metricDataOrCustomKind);
      } else if (metricDataOrCustomKind) {
        e.dataTransfer.setData(
          "metricData",
          JSON.stringify(metricDataOrCustomKind)
        );
      }

      e.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  // Memoize widget click handler factory
  const createWidgetClickHandler = useCallback(
    (slideId: number) => (widget: DashboardLayout) => {
      setRightPanelTitle("");
      if (widgetFormState.widgetId === widget.i) {
        setWidgetFormState({
          widgetType: "",
          slideId: 0,
          widgetId: "",
          i: "",
          x: 0,
          y: 0,
          h: 1,
          w: 1,
        });
      } else {
        setWidgetFormState({
          i: widget.i,
          widgetType: widget.widgetType,
          slideId: slideId,
          widgetId: widget.i,
          x: widget.x,
          y: widget.y,
          h: widget.h,
          w: widget.w,
          data: widget.data,
        });
      }
    },
    [widgetFormState.widgetId]
  );

  // Memoize ref callback factory
  const createWidgetRefCallback = useCallback(
    (slideId: number, widgetId: string) => (el: HTMLDivElement | null) => {
      if (!widgetRefs.current.has(slideId)) {
        widgetRefs.current.set(slideId, new Map());
      }
      const map = widgetRefs.current.get(slideId)!;
      if (el) map.set(widgetId, el);
      else map.delete(widgetId);
    },
    []
  );

  // Memoize widget form onChange handlers
  const createWidgetFormChangeHandler = useCallback(
    (slideId: number, widgetId: string) => (data: WidgetData) => {
      updateWidgetData(slideId, widgetId, data);
    },
    [updateWidgetData]
  );

  // Memoize widget form sections
  const widgetFormSections = useMemo(() => {
    if (widgetFormState.widgetType === "") return null;

    const changeHandler = createWidgetFormChangeHandler(
      widgetFormState.slideId,
      widgetFormState.widgetId
    );

    const typeChangeHandler = (newType: ReportWidgetType) => {
      updateWidgetType(widgetFormState.slideId, widgetFormState.widgetId, newType);
    };

    switch (widgetFormState.widgetType) {
      case "title":
        return (
          <TitleWidgetForm
            id={widgetFormState.widgetId}
            data={widgetFormState.data as TitleWidgetData}
            onChange={changeHandler}
          />
        );
      case "metric": {
        const layoutItem = dashboards.get(widgetFormState.slideId)?.find(w => w.i === widgetFormState.widgetId);
        const isIntegration = !!(layoutItem?.metricConfig?.metricKey && layoutItem?.metricConfig?.integration);
        return (
          <MetricWidgetForm
            data={widgetFormState.data as MetricWidgetData}
            onChange={changeHandler}
            isIntegration={isIntegration}
            metricConfig={layoutItem?.metricConfig}
            onTypeChange={typeChangeHandler}
          />
        );
      }
      case "chart": {
        const layoutItem = dashboards.get(widgetFormState.slideId)?.find(w => w.i === widgetFormState.widgetId);
        const isIntegration = !!(layoutItem?.metricConfig?.metricKey && layoutItem?.metricConfig?.integration);
        return (
          <ChartWidgetForm
            data={widgetFormState.data as ChartWidgetData}
            onChange={changeHandler}
            isIntegration={isIntegration}
            metricConfig={layoutItem?.metricConfig}
            onTypeChange={typeChangeHandler}
          />
        );
      }
      case "table": {
        const layoutItem = dashboards.get(widgetFormState.slideId)?.find(w => w.i === widgetFormState.widgetId);
        return (
          <TableWidgetForm
            id={widgetFormState.widgetId}
            data={widgetFormState.data as TableWidgetData}
            onChange={changeHandler}
            metricKey={layoutItem?.metricConfig?.metricKey}
          />
        );
      }
      case "image":
        return (
          <ImageWidgetForm
            id={widgetFormState.widgetId}
            data={widgetFormState.data as ImageWidgetData}
            onChange={changeHandler}
          />
        );
      case "embed":
        return (
          <EmbedWidgetForm
            id={widgetFormState.widgetId}
            data={widgetFormState.data as EmbedWidgetData}
            onChange={changeHandler}
          />
        );
      case "custom": {
        const customData = widgetFormState.data as CustomWidgetData;
        if (customData?.type === "tasks") {
          return (
            <TasksWidgetForm
              id={widgetFormState.widgetId}
              data={customData}
              onChange={changeHandler as (data: CustomWidgetData) => void}
            />
          );
        }
        return (
          <CustomWidgetForm
            id={widgetFormState.widgetId}
            data={customData}
            onChange={changeHandler as (data: CustomWidgetData) => void}
          />
        );
      }
      default:
        return null;
    }
  }, [
    widgetFormState.widgetType,
    widgetFormState.data,
    widgetFormState.slideId,
    widgetFormState.widgetId,
    createWidgetFormChangeHandler,
  ]);

  // Helper to update all widgets of a platform to a new account ID
  const updateWidgetsForAccount = useCallback((platform: string, newAccountId: string, accountName: string) => {
    if (!platform || !newAccountId) return;

    setDashboards((prev) => {
      const next = new Map(prev);
      let updatedCount = 0;
      const normalize = (p: string) => (p || "").toLowerCase().replace(/_/g, '-');
      const targetPlatform = normalize(platform);

      // Special handling for Meta Business to match sub-platforms
      const isMetaBusiness = targetPlatform === 'meta-business' || targetPlatform === 'meta';

      for (const [slideId, widgets] of next.entries()) {
        const newWidgets = widgets.map(w => {
          // Check if widget has integration matching the switched platform
          const wPlatform = normalize(w.metricConfig?.integration || "");

          // Match logic: Exact match OR is sub-platform of Meta Business
          const isMatch = wPlatform === targetPlatform ||
            (isMetaBusiness && (wPlatform === 'meta-facebook' || wPlatform === 'meta-instagram'));

          if (isMatch && w.metricConfig?.accountId && w.metricConfig.accountId !== newAccountId) {
            updatedCount++;
            return {
              ...w,
              metricConfig: {
                ...w.metricConfig!,
                accountId: newAccountId
              }
            };
          }
          return w;
        });

        // Update layout for this slide if changed
        if (newWidgets.some((w, i) => w !== widgets[i])) {
          next.set(slideId, newWidgets);
        }
      }

      if (updatedCount > 0) {
        toast.info(`Updated ${updatedCount} widget${updatedCount !== 1 ? 's' : ''} to use ${accountName}`);
      }
      return next;
    });
  }, []);

  // Memoize right panel content
  const rightPanelContent = useMemo(() => {
    if (rightPanelTitle === "Integrations") {
      // If no integration is selected yet, show the integrations list (step 1)
      if (!selectedIntegrationMeta) {

        return (
          <div className="w-full h-full flex flex-col overflow-y-auto">
            <div className="px-3 pt-3 pb-2 border-b space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-700">
                  Choose your Metrics
                </span>
              </div>
              <div className="relative">
                <Input
                  placeholder="Search integrations..."
                  value={integrationSearch}
                  onChange={(e) => setIntegrationSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  Ã°Å¸â€Â
                </span>
              </div>
            </div>

            {availableMetricsError && (
              <div className="px-3 py-2 text-[11px] text-destructive border-b bg-destructive/5">
                Failed to load metrics catalog: {availableMetricsError.message}
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {filteredIntegrations.length === 0 ? (
                <div className="px-4 py-6 text-xs text-gray-500 text-center">
                  No integrations match your search.
                </div>
              ) : (
                filteredIntegrations.map((integration) => {
                  const platformConfig = getPlatformConfig(integration.platform);
                  return (
                    <button
                      key={`${integration.platform}-${integration.accountId}`}
                      type="button"
                      onClick={() => {
                        setSelectedIntegrationForMetrics({
                          platform: integration.platform,
                          accountId: integration.accountId,
                          accountName: integration.accountName,
                        });
                        // Automatically update existing widgets to use the newly selected account
                        updateWidgetsForAccount(integration.platform, integration.accountId, integration.accountName);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 border-b text-left hover:bg-gray-50 transition-colors"
                    >
                      {platformConfig && (
                        <platformConfig.icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: platformConfig.color }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">
                          {platformConfig?.name || integration.platform}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">
                          {integration.accountName}
                        </div>
                      </div>
                      <span className="text-gray-300 text-xs">Ã¢â‚¬Âº</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      }

      // Step 2: metrics list for the selected integration
      const { platform, accountId, accountName, platformConfig, isGoogleConsole, isGoogleAnalytics } =
        selectedIntegrationMeta;

      const metricTypeOptions: Array<{ type: ReportWidgetType; label: string }> =
        [
          { type: "metric", label: "#" },
          { type: "line_chart", label: "Ã¢â€ â€”" },
          { type: "bar_chart", label: "Ã¢â€“Â®Ã¢â€“Â®" },
          { type: "table", label: "T" },
        ];

      return (
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Header with back + integration name */}
          <div className="px-3 pt-3 pb-2 border-b space-y-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedIntegrationForMetrics(null);
                  setMetricsSearch("");
                }}
                className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 text-xs hover:bg-gray-50"
              >
                Ã¢â€ Â
              </button>
              {platformConfig && (
                <platformConfig.icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: platformConfig.color }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900 truncate">
                  {platformConfig?.name || platform}
                </div>
                <div className="text-[11px] text-gray-500 truncate">
                  {accountName}
                </div>
              </div>
            </div>

            {/* Widget type toolbar */}
            <div className="flex items-center gap-1 mt-2">
              {metricTypeOptions.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setSelectedMetricWidgetType(opt.type)}
                  className={`flex-1 h-7 flex items-center justify-center rounded border text-[10px] ${selectedMetricWidgetType === opt.type
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Metrics search */}
            <div className="relative mt-2">
              <Input
                placeholder="Search metrics..."
                value={metricsSearch}
                onChange={(e) => setMetricsSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                Ã°Å¸â€Â
              </span>
            </div>

            {(isGoogleConsole || isGoogleAnalytics) && (
              <div className="mt-3 space-y-2 border rounded-md p-3 bg-gray-50">
                <div className="text-[11px] font-semibold text-gray-700">
                  {isGoogleConsole
                    ? "Google Search Console params"
                    : "Google Analytics params"}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {isGoogleConsole && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500">Dimension</span>
                      <select
                        className="h-8 rounded border border-gray-200 text-xs px-2"
                        value={gscDimensionType}
                        onChange={(e) => setGscDimensionType(e.target.value)}
                      >
                        <option value="query">Query</option>
                        <option value="page">Page</option>
                        <option value="country">Country</option>
                        <option value="device">Device</option>
                        <option value="date">Date</option>
                      </select>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500">Start date</span>
                    <Input
                      type="date"
                      value={gscStartDate}
                      onChange={(e) => setGscStartDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500">End date</span>
                    <Input
                      type="date"
                      value={gscEndDate}
                      onChange={(e) => setGscEndDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex flex-col justify-end text-[10px] text-gray-500 gap-1">
                    <span>Applied when you drag a metric.</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] px-2"
                      onClick={() => {
                        if (gscStartDate && gscEndDate) {
                          setDateRange({
                            from: new Date(gscStartDate),
                            to: new Date(gscEndDate),
                          });
                        }
                      }}
                    >
                      Apply dates to report
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Metrics list */}
          <div className="flex-1 overflow-y-auto min-h-0 pb-20">
            {isLoadingAvailableMetrics ? (
              <div className="px-4 py-4 text-xs text-gray-500">
                Loading metrics...
              </div>
            ) : (viewableMetrics.length === 0 && filteredMetrics.length > 0) ? (
              <div className="px-4 py-4 text-xs text-gray-500">
                No metrics available for the selected visualization type.
              </div>
            ) : filteredMetrics.length === 0 ? (
              <div className="px-4 py-4 text-xs text-gray-500">
                No metrics found for this integration.
              </div>
            ) : (
              viewableMetrics.map((metric) => (
                <div
                  key={metric.metricKey}
                  className="flex items-center gap-2 px-3 py-2 border-b hover:bg-gray-50"
                >
                  {(() => {
                    const isFacebook = metric.metricKey?.includes('facebook') || metric.displayName?.includes('Facebook');
                    const isInstagram = metric.metricKey?.includes('instagram') || metric.displayName?.includes('Instagram');

                    if (isFacebook) return <FaFacebook className="w-4 h-4 text-[#1877F2] flex-shrink-0" />;
                    if (isInstagram) return <FaInstagram className="w-4 h-4 text-[#E4405F] flex-shrink-0" />;

                    return platformConfig && (
                      <platformConfig.icon
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: platformConfig.color }}
                      />
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {metric.displayName}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                        {metric.category}
                      </span>
                      <span className="text-[10px] text-gray-400 truncate">
                        {metric.metricKey}
                      </span>
                    </div>
                  </div>
                  <div
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, selectedMetricWidgetType, {
                        metricKey: metric.metricKey,
                        integration: metric.integration,
                        // Do NOT hardcode widget.accountId here generally.
                        // Leave it undefined so Self-Healing logic can detect it's a "Global" metric.
                        // EXCEPTION: Recent Posts table explicit needs the account ID to fetch data.
                        accountId: metric.metricKey.includes('recent_posts') ? metric.accountId || accountId : "",
                        label: metric.displayName,
                        ...(metric.filters
                          ? { filters: metric.filters }
                          : isGoogleConsole
                            ? {
                              filters: {
                                dimensionType: gscDimensionType,
                                startDate: gscStartDate,
                                endDate: gscEndDate,
                              },
                            }
                            : {}),
                      })
                    }
                    className="flex items-center justify-center w-7 h-7 rounded border border-gray-300 text-[10px] hover:border-blue-500 hover:bg-blue-50 cursor-grab active:cursor-grabbing"
                    title={`Drag to add as a ${selectedMetricWidgetType === "metric"
                      ? "metric card"
                      : selectedMetricWidgetType === "line_chart"
                        ? "line chart"
                        : selectedMetricWidgetType === "bar_chart"
                          ? "bar chart"
                          : "table"
                      }`}
                  >
                    {metricTypeOptions.find(
                      (opt) => opt.type === selectedMetricWidgetType
                    )?.label ?? "#"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }
    if (rightPanelTitle === "Content Blocks") {
      return (
        <div className="w-full h-full overflow-y-auto p-2 md:p-4">
          {widgetItems.map((item, index) => (
            <WidgetDragItem
              key={index}
              title={item.title}
              description={item.description}
              type={item.type}
              customKind={item.customKind}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      );
    }
    if (rightPanelTitle === "Images") {
      return (
        <div className="w-full h-full overflow-y-auto p-2 md:p-4">
          {imageWidgetItems.map((item, index) => (
            <WidgetDragItem
              key={index}
              title={item.title}
              description={item.description}
              type={item.type}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      );
    }
    if (rightPanelTitle === "Embeds") {
      return (
        <div className="w-full h-full overflow-y-auto p-2 md:p-4">
          {embedWidgetItems.map((item, index) => (
            <WidgetDragItem
              key={index}
              title={item.title}
              description={item.description}
              type={item.type}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      );
    }
    if (rightPanelTitle === "Custom Metrics") {
      return (
        <div className="w-full h-full overflow-y-auto p-2 md:p-4">
          {customMetricItems.map((item, index) => (
            <WidgetDragItem
              key={index}
              title={item.title}
              description={item.description}
              type={item.type}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      );
    }
    return null;
  }, [
    rightPanelTitle,
    handleDragStart,
    updateWidgetsForAccount,
    filteredIntegrations,
    isLoadingAvailableMetrics,
    availableMetricsError,
    selectedIntegrationMeta,
    integrationSearch,
    metricsSearch,
    selectedMetricWidgetType,
    filteredMetrics,
    viewableMetrics,
    gscDimensionType,
    gscStartDate,
    gscEndDate,
  ]);

  const [activeSlideId, setActiveSlideId] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio
        const visible = entries.reduce((max, entry) => {
          return (entry.intersectionRatio > max.intersectionRatio) ? entry : max;
        }, entries[0]);

        if (visible && visible.isIntersecting) {
          const slideId = visible.target.id.replace('slide-', '');
          setActiveSlideId(parseInt(slideId, 10));
        }
      },
      {
        root: null, // viewport
        threshold: [0.1, 0.5, 0.9], // Trigger at different visibility levels
        rootMargin: "-10% 0px -50% 0px" // Bias towards the top half of the screen
      }
    );

    // Observe all slide elements
    const currentSlides = slidesRef.current;
    Object.values(currentSlides).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [effectivePageOrder, isTemplateLoading]); // Re-run when pages change

  // Ã¢Å“â€¦ PRE-SANITIZE ALL LAYOUTS AT ONCE (Fixes Rules of Hooks & Object Thrashing)
  // Prevents resolveCompactionCollision stack overflow caused by:
  //   1. Duplicate `i` keys (keep first occurrence)
  //   2. Invalid positions: NaN, Infinity, or negative values
  // By doing this once securely outside the render loop, we maintain referential
  // identity of the layout arrays, which stops aggressive WidgetDataWrapper unmounting.
  const sanitizedLayoutsMap = useMemo(() => {
    const sanitizedMap = new Map<number, DashboardLayout[]>();
    
    dashboards.forEach((rawLayout, frontendId) => {
      const seen = new Set<string>();
      const sanitized = rawLayout
        .filter(w => {
          if (!w.i || seen.has(w.i)) return false;
          seen.add(w.i);
          return true;
        })
        .map(w => ({
          ...w,
          x: Number.isFinite(w.x) && w.x >= 0 ? w.x : 0,
          y: Number.isFinite(w.y) && w.y >= 0 ? w.y : 0,
          w: Number.isFinite(w.w) && w.w > 0 ? w.w : 4,
          h: Number.isFinite(w.h) && w.h > 0 ? w.h : 3,
        }));
      sanitizedMap.set(frontendId, sanitized);
    });

    return sanitizedMap;
  }, [dashboards]);

  const handleScrollToSlide = (slideId: number) => {
    const el = slidesRef.current[slideId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Manually set active index immediately for better UX
      setActiveSlideId(slideId);
    }
  };

  // With per-widget lazy loading, individual widgets manage their own loading state.
  // We only show a full-page skeleton during template loading and BEFORE dashboards are initialized.
  const showFullPageSkeleton = isTemplateLoading || !isDashboardsInitialized;


  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* New Report Name Dialog */}
      <Dialog
        open={isNameDialogOpen}
        onOpenChange={(open) => !open && handleCancelNewReport()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name your report</DialogTitle>
            <DialogDescription>
              Give this report a clear name so you can easily find it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="block text-sm font-medium text-gray-700">
              Report name
            </label>
            <Input
              autoFocus
              placeholder="e.g. Weekly Marketing Performance"
              value={newReportName}
              onChange={(e) => setNewReportName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelNewReport}>
              Cancel
            </Button>
                        <Button
              onClick={handleConfirmNewReport}
              isLoading={isCreatingTemplate}
              disabled={isLoadingIntegrations || !newReportName.trim()}
            >
              Create Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Schedule Dialog */}
      {effectiveClientId && (
        <CreateScheduleModal
          open={isScheduleModalOpen}
          onOpenChange={setIsScheduleModalOpen}
          clientId={effectiveClientId}
          templates={templateId ? [{ id: templateId, name: templateName }] : []}
          scheduleToEdit={currentSchedule}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["report-schedules", effectiveClientId] });
          }}
        />
      )}
      {/* Top Bar */}
      {!readOnly && (
        <div className="sticky z-50 top-0 py-3 md:py-[1.3em]  border-b flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-3 md:px-5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden mr-2"
                  onClick={() => setIsLeftSidebarOpen(true)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </Button>
              )}
              <span className="font-medium text-lg md:text-xl">Report Builder</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-gray-500">
                {showFullPageSkeleton ? "Loading template..." : templateName}
              </span>
              {templateId && (
                <span className="text-xs text-gray-400">
                  {isSavingTemplate ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      Saving...
                    </span>
                  ) : hasUnsavedChanges ? (
                    <span>Unsaved changes</span>
                  ) : lastSavedTime ? (
                    <span>All changes saved</span>
                  ) : null}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="mx-1 md:mx-2 text-base md:text-lg text-gray-500 cursor-pointer">
              <FiSearch />
            </span>
            <span className="mx-1 md:mx-2 text-base md:text-lg text-gray-500 cursor-pointer">
              <FiBell />
            </span>
            {isOverlayLayout && (
              <Button
                variant="outline"
                size="sm"
                className="xl:hidden ml-1 h-8 w-8 p-0"
                onClick={() => setIsRightSidebarOpen(true)}
                disabled={isGeneratingPdf || isMobile}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </Button>
            )}
            <Button
              variant="outline"
              className="rounded-[0.4rem] text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2"
              onClick={() => setIsScheduleModalOpen(true)}
              disabled={isSavingTemplate || showFullPageSkeleton}
            >
              {currentSchedule ? "Edit Schedule" : "Add Schedule"}
            </Button>
            <Button
              variant="outline"
              className="rounded-[0.4rem] text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2"
              onClick={handleSaveTemplate}
              disabled={showFullPageSkeleton}
              isLoading={isSavingTemplate}
            >
              Save Template
            </Button>

          </div>
        </div>
      )}

      {/* Shared View Top Bar (Minimal) */}
      {readOnly && (
        <div className="sticky z-50 top-0 py-3 md:py-[1.3em] border-b flex items-center justify-between px-3 md:px-5 bg-white">
          <div className="flex flex-col">
            <span className="font-medium text-lg md:text-xl">{templateName}</span>
          </div>
        </div>
      )}

      {/* Sub Header */}
      <div className="sticky z-40 top-[var(--rb-header)] py-2 md:py-[1.2em]  border-b flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 md:gap-0 px-3 md:px-5">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          {!readOnly && <RadioButtonGroup />}
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex-1 md:flex-none">
            {!readOnly ? (
              <DateRangePicker
                value={dateRange}
                onChange={(range) => {
                  setDateRange(range);
                }}
                onPresetChange={setDatePreset}
              />
            ) : dateRange?.from && dateRange?.to && (
              <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-gray-50 text-sm text-gray-600">
                <FiCalendar />
                <span>
                  {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={handleGeneratePdf}
            className="bg-accent-foreground text-white py-1.5 md:py-2 px-3 md:px-4 rounded-[0.6rem] text-xs md:text-sm hover:cursor-pointer whitespace-nowrap disabled:opacity-60"
            isLoading={isGeneratingPdf}
          >
            <span className="hidden md:inline">
              Download PDF
            </span>
            <span className="md:hidden">PDF</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 relative">
        {readOnly && isTemplateError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 h-[calc(100vh-(var(--rb-header)+var(--rb-subheader)))]">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm max-w-md w-full flex flex-col items-center border">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                Report Not Found
              </h2>
              <p className="text-gray-500 mb-8">
                The report you are looking for does not exist or you do not have permission to view it.
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Left Sidebar */}
            {/* Desktop: Static Sidebar (Only for XL screens) */}
            {!readOnly && !isOverlayLayout && (
              <div className="sticky top-[calc(var(--rb-header)+var(--rb-subheader))] left-0 w-48 md:w-52 lg:w-[15.5rem]  border-r h-[calc(100vh-(var(--rb-header)+var(--rb-subheader)))] overflow-y-auto transition-all duration-300 z-30">
                <div className="w-full h-full">
                  <WidgetsPageSideComponent
                    // reftype was removed in favor of controlled state
                    activeSlideId={activeSlideId}
                    onSlideClick={handleScrollToSlide}
                    customPages={customPages}
                    pageOrder={effectivePageOrder}
                    onAddPage={isGeneratingPdf ? undefined : addCustomPage}
                    onDeletePage={isGeneratingPdf ? undefined : handleDeletePage}
                    onRenamePage={isGeneratingPdf ? undefined : handleRenamePage}
                    onReorderPages={isGeneratingPdf ? undefined : handleReorderPages}
                    onAddIntegrationPage={isGeneratingPdf ? undefined : handleAddIntegrationPage}
                    availableIntegrations={integrationsData?.integrations?.map((integ, idx) => ({
                      index: idx,
                      platform: integ.platform,
                      accountName: integ.accountName
                    })).filter(integ => {
                      // Find all slide IDs that belong to this integration
                      const integrationSlideIds = Array.from(slideIntegrationMap.entries())
                        .filter(([_, info]) => info.originalIndex === integ.index)
                        .map(([slideId, _]) => slideId);

                      // Show integration if ANY of its slides is MISSING (available to add)
                      // This allows re-adding removed slides, especially for multi-slide integrations
                      return integrationSlideIds.some(slideId => !dashboards.has(slideId));
                    }) ?? []}
                    // Pass through slide metadata from the template, augmented with any
                    // in-memory custom pages so newly added pages appear immediately in
                    // the sidebar even before a full save/refresh round-trip.
                    slidesMeta={(() => {
                      const rawBase =
                        (processedSlidesMeta as
                          | ReportSlideMeta[]
                          | undefined) ?? [];

                      // DEBUG: Inspect ghost slides
                      console.log('Ã°Å¸â€˜Â» [SidebarDebug] rawBase:', rawBase.map(s => ({ id: s.id, source: s.source, title: s.title, integrationIndex: s.integrationIndex })));
                      console.log('Ã°Å¸â€˜Â» [SidebarDebug] Integrations Count:', integrationsData?.integrations?.length);
                      console.log('Ã°Å¸â€˜Â» [SidebarDebug] PageOrder:', pageOrder);
                      console.log('Ã°Å¸â€˜Â» [SidebarDebug] Dashboards Keys:', Array.from(dashboards.keys()));

                      const numIntegrations = integrationsData?.integrations?.length ?? 0;

                      // Filter out ghost slides (integration slides with index out of bounds)
                      const base = rawBase.filter(s => {
                        const sId = Number(s.id);

                        // FIX: Aggressively remove any slide with ID < 1000 if it doesn't map to a valid integration
                        // usage. This catches both explicit 'integration' source AND 'custom' source ghosts.
                        if (sId < 1000) {
                          // If it's an integration index, check if valid
                          const idx = typeof s.integrationIndex === 'number' ? s.integrationIndex : sId;
                          if (!isNaN(idx) && idx >= numIntegrations) {
                            console.log(`Ã°Å¸â€˜Â» [Sidebar] Filtering out ghost slide ID ${sId} (Out of bounds)`);
                            return false;
                          }
                        }

                        // Double check explicit source
                        if (s.source === "integration") {
                          const idx = typeof s.integrationIndex === 'number' ? s.integrationIndex : Number(s.id);
                          if (!isNaN(idx) && idx >= numIntegrations) {
                            return false;
                          }
                        }
                        return true;
                      });

                      const existingIds = new Set(base.map((s) => Number(s.id)));

                      // Add custom pages not in base
                      const extras = customPages
                        .filter((p) => {
                          const pageId = Number(p.id);
                          const pageLayout = dashboards.get(pageId) ?? dashboards.get(resolveFrontendSlideId(pageId));
                          return !existingIds.has(pageId) && !getIntegrationInfoForSlideIdOrWidgets(pageId, pageLayout, p.name);
                        })
                        .map((p) => ({
                          id: p.id,
                          title: p.name,
                          subtitle: p.subtitle,
                          source: "custom" as const,
                        }));

                      // Add integration slides
                      const integrationExtras: ReportSlideMeta[] = [];
                      if (integrationsData?.integrations) {
                        Array.from(dashboards.keys()).forEach(slideId => {
                          const numId = Number(slideId);

                          // CRITICAL FIX: Ensure we skip slides that are:
                          // 1. Already in the base list (hydrated slides)
                          // 2. Custom pages
                          // 3. Mapped via backend ID (Ghost duplicate protection)
                          if (existingIds.has(numId) || customPages.find(p => Number(p.id) === numId)) {
                            return;
                          }

                          // Check if this slide ID maps to an integration
                          const layoutForId = dashboards.get(numId) ?? dashboards.get(resolveFrontendSlideId(numId));
                          const integrationMatch = getIntegrationInfoForSlideIdOrWidgets(numId, layoutForId);
                          const integrationInfo = integrationMatch?.info;
                          if (integrationInfo) {

                            // Check by TITLE (New logic): If I have a custom page named "Facebook", don't show the "Facebook" integration fallback
                            // Use slideTitle as the name property might not exist on integrationInfo
                            const customPageWithSameName = customPages.some(cp => cp.name.toLowerCase() === integrationInfo.slideTitle.toLowerCase());

                            if (customPageWithSameName) {
                              return;
                            }

                            integrationExtras.push({
                              id: numId,
                              title: "", // Sidebar logic will fallback to integration name
                              subtitle: "",
                              source: "integration",
                              integrationIndex: integrationInfo.originalIndex
                            });
                          }
                        });
                      }

                      // AND hydrate missing titles if they were saved as empty placeholders
                      // AND prioritize names from current customPages state over stale backend data
                      const augmentedBase = base.map(s => {
                        let updated = { ...s };

                        // Check if we have an override in customPages
                        const customOverride = customPages.find(p => Number(p.id) === Number(s.id));
                        if (customOverride) {
                          updated.title = customOverride.name;
                          updated.subtitle = customOverride.subtitle || updated.subtitle;
                          // If it's in customPages, it's a custom page (or a renamed integration page)
                          // We keep its source but ensure the title stays updated.
                        }

                        // SELF-HEALING: Determine integration by actual mapping, not numeric ID range.
                        const updatedId = Number(updated.id);
                        const layoutForId = dashboards.get(updatedId) ?? dashboards.get(resolveFrontendSlideId(updatedId));
                        const integrationMatch = getIntegrationInfoForSlideIdOrWidgets(updatedId, layoutForId, updated.title);
                        if (integrationMatch) {
                          updated.source = "integration";
                        }

                        // Ensure integration index for integration source
                        if (updated.source === "integration" && updated.integrationIndex === undefined) {
                          updated.integrationIndex = integrationMatch?.info.originalIndex ?? Number(updated.id);
                        }

                        // Hydrate title if empty & we have integration data
                        if (updated.source === "integration") {
                          const integrationInfo = integrationMatch?.info;
                          if (integrationInfo && (!updated.title || updated.title === "" || updated.title.startsWith("Untitled"))) {
                            updated.title = integrationInfo.slideTitle || integrationInfo.platform || "Integration";
                            if (!updated.subtitle) updated.subtitle = integrationInfo.accountName;
                          }
                        }
                        return updated;
                      });

                      return [...augmentedBase, ...extras, ...integrationExtras];
                    })()}
                  />
                </div>
              </div>
            )}

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto bg-gray-100 flex flex-col items-center h-[calc(100vh-(var(--rb-header)+var(--rb-subheader)))] px-2 md:px-0">
              {showFullPageSkeleton ? (
                <div className="w-full md:w-[95%] lg:w-[90%] my-4 space-y-8">
                  {/* Skeleton Slide 1 */}
                  <div className="rounded-xl md:rounded-2xl border border-black/[0.03] bg-white/40 backdrop-blur-sm p-4 md:p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-6 border-b border-black/[0.03] pb-4">
                      <div className="space-y-2">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Skeleton className="h-28 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-52 w-full rounded-xl" />
                        <Skeleton className="h-52 w-full rounded-xl" />
                      </div>
                    </div>
                  </div>
                  {/* Skeleton Slide 2 */}
                  <div className="rounded-xl md:rounded-2xl border border-black/[0.03] bg-white/40 backdrop-blur-sm p-4 md:p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-6 border-b border-black/[0.03] pb-4">
                      <div className="space-y-2">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Skeleton className="h-28 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                      </div>
                      <Skeleton className="h-56 w-full rounded-xl" />
                    </div>
                  </div>
                </div>
              ) : (
                // BatchMetricsProvider supplies the single batch resolver result
                // and demographics data to every WidgetDataWrapper in the tree.
                // This avoids N per-widget API calls — one POST replaces them all.
                <BatchMetricsProvider
                  byId={batchById}
                  demographicById={demographicById}
                  isLoading={batchIsLoading}
                  isFetching={batchIsFetching}
                  demoIsLoading={demoIsLoading}
                  demoIsFetching={demoIsFetching}
                >
                {effectivePageOrder.map((id) => {
                  // Resolve backend slide IDs to frontend integration slots when possible.
                  // Backend integration IDs can be >1000, so numeric thresholds are unreliable.
                  const frontendId = resolveFrontendSlideId(id);
                  if (frontendId !== id) {
                    console.log(`[SlideRender] Mapped Backend ID ${id} -> Frontend ID ${frontendId}`);
                  }

                  // Fetch pre-sanitized layout (Stable reference to prevent unmounting loop)
                  const layout = sanitizedLayoutsMap.get(frontendId) || [];

                  // Format date range for display
                  const formatDateRange = () => {
                    if (!dateRange?.from && !dateRange?.to) {
                      return undefined;
                    }
                    if (dateRange.from && dateRange.to) {
                      return `${format(dateRange.from, "MMM d, yyyy")} - ${format(
                        dateRange.to,
                        "MMM d, yyyy"
                      )}`;
                    }
                    if (dateRange.from) {
                      return `From ${format(dateRange.from, "MMM d, yyyy")}`;
                    }
                    if (dateRange.to) {
                      return `Until ${format(dateRange.to, "MMM d, yyyy")}`;
                    }
                    return undefined;
                  };

                  // Get slide title - prefer the current customPages (Pages sidebar)
                  // so that renaming a page immediately updates the main slide
                  // header. Fall back to slide metadata from the template, then
                  // integration names, and finally a neutral "Untitled page" label.

                  // Ã°Å¸â€Â§ FIX: Use backend ID for slidesMeta lookup (backend data uses backend IDs)
                  const slideMeta = templateQuery.data?.slidesMeta?.find(
                    (s: any) => s.id === id // id is the backend ID from pageOrder
                  );
                  const customPage = customPages.find((p) => p.id === id);

                  let slideTitle: string;
                  let slideSubtitle: string | undefined;

                  if (customPage) {
                    slideTitle = customPage.name;
                    slideSubtitle = customPage.subtitle;
                  } else if (slideMeta) {
                    slideTitle = slideMeta.title;
                    slideSubtitle = slideMeta.subtitle;
                  } else {
                    // Ã°Å¸â€Â§ FIX: Use frontend ID for slideIntegrationMap lookup (map uses frontend IDs)
                    const integration = slideIntegrationMap.get(frontendId);

                    if (integration) {
                      // Ã°Å¸â€Â§ FIX: Use slideTitle from integration (which includes slide-specific names)
                      slideTitle = integration.slideTitle || integration.platform;
                      slideSubtitle = integration.accountName;
                    } else {
                      slideTitle = "Untitled page";
                    }
                  }

                  // Combine title and subtitle for display
                  // Ã°Å¸Â§Â¼ Professional Cleanup: avoid redundant titles (e.g. Meta Business - Meta Business Account)
                  let displayTitle = slideTitle;
                  if (slideSubtitle && slideSubtitle !== slideTitle && !slideSubtitle.includes(slideTitle)) {
                    displayTitle = `${slideTitle} - ${slideSubtitle}`;
                  } else if (slideSubtitle && !slideTitle) {
                    displayTitle = slideSubtitle;
                  }

                  // Ã°Å¸Â§Â¼ Professional Cleanup (Self-Healing UI)
                  if (!displayTitle || displayTitle === "Report Page" || displayTitle === "Page" || displayTitle.includes("Untitled")) {
                    const reportName = (templateQuery.data as any)?.templateName || (templateQuery.data as any)?.name || "Report";
                    displayTitle = `${reportName} Overview`;
                  }

                  // displayTitle = prettifyMetricLabel(displayTitle);

                  return (
                    <SlideContainer
                      key={id}
                      id={`slide-${id}`}
                      slideId={id}
                      registerSlide={registerSlideWithBackend}
                      title={displayTitle}
                      dateRange={formatDateRange()}
                      containerRef={(el) => {
                        slidesRef.current[id] = el; // Use slide ID instead of loop index
                      }}
                    >
                      {layout.length === 0 ? (
                        // Integration slides auto-populate after hydration Ã¢â‚¬â€ show a skeleton
                        // grid instead of "Start Building Your Report" to avoid the blank flash.
                        (isTemplateLoading || slideIntegrationMap.has(frontendId)) ? (
                          <div className="relative w-full min-h-[500px] p-4 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Skeleton className="h-28 w-full rounded-xl" />
                              <Skeleton className="h-28 w-full rounded-xl" />
                              <Skeleton className="h-28 w-full rounded-xl" />
                              <Skeleton className="h-28 w-full rounded-xl" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <Skeleton className="h-52 w-full rounded-xl" />
                              <Skeleton className="h-52 w-full rounded-xl" />
                            </div>
                            <Skeleton className="h-40 w-full rounded-xl" />
                          </div>
                        ) : (
                          /* Empty State for custom pages - Still accepts drops */
                          <div className="relative w-full min-h-[500px]">
                            <AutoWidthGrid
                              key={`grid-empty-${id}-${isMobile ? 'm' : 'd'}`}
                              className="layout w-full h-full"
                              layout={[]}
                              cols={currentGridConfig.cols}
                              rowHeight={currentGridConfig.rowHeight}
                              autoSize={false}
                              margin={currentGridConfig.margin}
                              containerPadding={isTablet ? [8, 8] : [14, 14]}
                              isDroppable={!readOnly && !isGeneratingPdf}
                              isDraggable={false}
                              compactType={null}
                              onDrop={(layoutArr, layoutItem, e) =>
                                handleDrop(layoutArr, layoutItem, e as DragEvent, id)
                              }
                              onLayoutChange={createLayoutChangeHandler(id, layout)}
                              style={{ minHeight: "500px" }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
                              <div className="text-center">
                                <svg
                                  className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                                  Start Building Your Report
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 mb-4 max-w-xs sm:max-w-sm mx-auto">
                                  Drag and drop widgets from the right sidebar to create
                                  your custom report
                                </p>
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                  </svg>
                                  <span className="hidden sm:inline">
                                    Try dragging a metric from Integrations
                                  </span>
                                  <span className="sm:hidden">
                                    Drag from Integrations
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        <AutoWidthGrid
                          key={`grid-${id}-${isMobile ? 'm' : 'd'}`}
                          className="layout w-full"
                          layout={layout}
                          cols={currentGridConfig.cols}
                          rowHeight={currentGridConfig.rowHeight}
                          autoSize={true}
                          margin={currentGridConfig.margin}
                          containerPadding={isTablet ? [8, 8] : [14, 14]}
                          isDroppable={!readOnly && !isMobile && !isGeneratingPdf}
                          isDraggable={!readOnly && !isMobile && !isGeneratingPdf}
                          isResizable={!readOnly && !isMobile && !isGeneratingPdf}
                          compactType={null}
                          draggableHandle=".drag-handle"
                          draggableCancel=".non-draggable"
                          onDrop={(layoutArr, layoutItem, e) =>
                            handleDrop(layoutArr, layoutItem, e as DragEvent, id)
                          }
                          onLayoutChange={createLayoutChangeHandler(id, layout)}
                        >
                          {layout.map((widget) => {
                            // Patch widget type for demographics if needed
                            let finalWidget = widget;
                            const demoConfig = (widget.data as any)?.customConfig?.demographics;
                            if (demoConfig) {
                              if (demoConfig.type === 'age') {
                                finalWidget = { ...widget, widgetType: 'chart', data: { ...widget.data, chartType: 'bar' } as any };
                              } else if (demoConfig.type === 'gender') {
                                finalWidget = { ...widget, widgetType: 'pie_chart', data: { ...widget.data, chartType: 'pie' } as any };
                              } else if (demoConfig.type === 'country' || demoConfig.type === 'city') {
                                finalWidget = { ...widget, widgetType: 'table' };
                              }
                            }

                            return (
                              <div
                                key={widget.i}
                                ref={createWidgetRefCallback(id, widget.i)}
                              >
                                <WidgetDataWrapper
                                  widget={finalWidget}
                                  slideId={id}
                                  effectiveClientId={effectiveClientId}
                                  dateFrom={dateFrom}
                                  dateTo={dateTo}
                                  shareToken={shareToken}
                                  integrationsData={integrationsData}
                                  isLoadingIntegrations={isLoadingIntegrations}
                                  isSlideVisible={isSlideVisibleWithBackend(id)}
                                >
                                  {({ resolvedData: finalResolvedData, isLoading, isFetching }) => {
                                    // Check if GSC table with no data
                                    const isGscTable =
                                      finalWidget.widgetType === "table" &&
                                      finalWidget.metricConfig?.integration
                                        ?.toLowerCase()
                                        .includes("google-search-console");
                                    const hasData =
                                      finalResolvedData &&
                                      Array.isArray((finalResolvedData as any).rows) &&
                                      (finalResolvedData as any).rows.length > 0;

                                    if (isGscTable && !hasData && !isLoading) {
                                      return null;
                                    }

                                    return (
                                      <WidgetCard
                                        widget={finalWidget}
                                        resolvedData={finalResolvedData}
                                        onContentClick={createWidgetClickHandler(id)}
                                        onDelete={() => handleDeleteWidget(id, widget.i)}
                                        readOnly={readOnly || isGeneratingPdf || isMobile}
                                        isRefetching={isFetching && !isLoading && !!widget.metricConfig?.metricKey}
                                      >
                                        {renderWidgetContent(finalWidget, finalResolvedData, {
                                          isLoading,
                                          onConnectIntegration: handleConnectIntegration,
                                          readOnly: !!readOnly,
                                        })}
                                      </WidgetCard>
                                    );
                                  }}
                                </WidgetDataWrapper>
                              </div>
                            );
                          })}
                        </AutoWidthGrid>
                      )}
                    </SlideContainer>
                  );
                })}
              </BatchMetricsProvider>
              )}

            </div>

            {/* Right Sidebar */}
            {/* Desktop: Static Sidebar (Only for XL screens) */}
            {!readOnly && !isOverlayLayout && (
              <div className="sticky top-[calc(var(--rb-header)+var(--rb-subheader))] right-0 flex  border-l h-[calc(100vh-(var(--rb-header)+var(--rb-subheader)))] overflow-y-visible z-20">
                <div
                  className={`${rightPanelTitle !== ""
                    ? "w-48 md:w-56 lg:w-[16.25rem]"
                    : "w-0 overflow-hidden"
                    } h-full transition-all duration-300 flex flex-col`}
                >
                  <div className="w-full p-3 md:p-4 border-b font-semibold text-sm md:text-base text-accent-foreground flex-shrink-0">
                    {rightPanelTitle}
                  </div>

                  <div className="flex-1 overflow-hidden min-h-0">
                    {rightPanelContent}
                  </div>
                </div>

                <div
                  className={`${widgetFormState.widgetType !== ""
                    ? "w-48 md:w-56 lg:w-[16.25rem]"
                    : "w-0 overflow-hidden"
                    } h-full transition-all duration-300`}
                >
                  {widgetFormSections}
                </div>

                <ReportElements
                  setRightPanelTitle={setRightPanelTitle}
                  setWidgetFormState={setWidgetFormState}
                  disabled={isGeneratingPdf || isMobile}
                />
              </div>
            )}

            {/* Mobile: Sheet Sidebars */}
            {/* Mobile/Tablet/Small Desktop: Sheet Sidebars */}
            {!readOnly && isOverlayLayout && (
              <>
                <Sheet open={isLeftSidebarOpen} onOpenChange={setIsLeftSidebarOpen}>
                  <SheetContent side="left" className="p-0 w-[85vw] max-w-[300px]">
                    <div className="w-full h-full pt-6"> {/* Add padding for close button space */}
                      <WidgetsPageSideComponent
                        activeSlideId={activeSlideId}
                        onSlideClick={(id) => {
                          handleScrollToSlide(id);
                          setIsLeftSidebarOpen(false); // Close sidebar on selection
                        }}
                        customPages={customPages}
                        pageOrder={effectivePageOrder}
                        onAddPage={(isGeneratingPdf || isMobile) ? undefined : addCustomPage}
                        onDeletePage={(isGeneratingPdf || isMobile) ? undefined : handleDeletePage}
                        onRenamePage={(isGeneratingPdf || isMobile) ? undefined : handleRenamePage}
                        onReorderPages={(isGeneratingPdf || isMobile) ? undefined : handleReorderPages}
                        onAddIntegrationPage={(isGeneratingPdf || isMobile) ? undefined : handleAddIntegrationPage}
                        availableIntegrations={integrationsData?.integrations?.map((integ, idx) => ({
                          index: idx,
                          platform: integ.platform,
                          accountName: integ.accountName
                        })).filter(integ => {
                          // Find all slide IDs that belong to this integration
                          const integrationSlideIds = Array.from(slideIntegrationMap.entries())
                            .filter(([_, info]) => info.originalIndex === integ.index)
                            .map(([slideId, _]) => slideId);

                          // Show integration if ANY of its slides is MISSING (available to add)
                          // This allows re-adding removed slides, especially for multi-slide integrations
                          return integrationSlideIds.some(slideId => !dashboards.has(slideId));
                        }) ?? []}
                        slidesMeta={(() => {
                          const rawBase = (processedSlidesMeta as ReportSlideMeta[] | undefined) ?? [];

                          // Correctly filter base slides that are out of bounds
                          // (Legacy logic used index, now checks valid IDs)
                          const base = rawBase.filter(s => {
                            if (s.source === "integration") {
                              // If it has a mapped integration, check if that integration still exists
                              // (We can assume if slideId maps to something in slideIntegrationMap, it's valid)
                              // But rawBase might have stale data.
                              return true;
                            }
                            return true;
                          });

                          const existingIds = new Set(base.map((s) => Number(s.id)));
                          const extras = customPages.filter((p) => {
                            const pageId = Number(p.id);
                            const pageLayout = dashboards.get(pageId) ?? dashboards.get(resolveFrontendSlideId(pageId));
                            return !existingIds.has(pageId) && !getIntegrationInfoForSlideIdOrWidgets(pageId, pageLayout, p.name);
                          }).map((p) => ({
                            id: p.id, title: p.name, subtitle: p.subtitle, source: "custom" as const,
                          }));

                          const integrationExtras: ReportSlideMeta[] = [];

                          if (integrationsData?.integrations) {
                            Array.from(dashboards.keys()).forEach(slideId => {
                              const numId = Number(slideId);
                              if (!existingIds.has(numId) && !customPages.find(p => Number(p.id) === numId)) {
                                const layoutForId = dashboards.get(numId) ?? dashboards.get(resolveFrontendSlideId(numId));
                                const integrationMatch = getIntegrationInfoForSlideIdOrWidgets(numId, layoutForId);
                                const integrationInfo = integrationMatch?.info;
                                if (integrationInfo) {
                                  // Use the multi-slide template to get specific slide name (e.g. "Facebook", "Instagram")
                                  // Or just empty, and let the UI resolve it using the same map later
                                  // For sidebar, we want specific titles.

                                  const normalizedPlatform = integrationInfo.platform?.toLowerCase().trim().replace(/[ _-]/g, '');
                                  const template = normalizedPlatform ? (
                                    INTEGRATION_TEMPLATES[integrationInfo.platform || ''] ??
                                    INTEGRATION_TEMPLATES[normalizedPlatform] ??
                                    INTEGRATION_TEMPLATES[normalizedPlatform.replace(/(meta)(.+)/, '$1-$2')]
                                  ) : undefined;

                                  let title = "";
                                  if (template?.slides && template.slides[integrationInfo.subSlideIndex]) {
                                    title = template.slides[integrationInfo.subSlideIndex].name;
                                  }

                                  integrationExtras.push({
                                    id: numId,
                                    title: title,
                                    subtitle: "",
                                    source: "integration",
                                    integrationIndex: integrationInfo.originalIndex
                                  });
                                }
                              }
                            });
                          }
                          const augmentedBase = base.map(s => {
                            let updated = { ...s };
                            const customOverride = customPages.find(p => Number(p.id) === Number(s.id));
                            if (customOverride) {
                              updated.title = customOverride.name;
                              updated.subtitle = customOverride.subtitle || updated.subtitle;
                            }
                            const updatedId = Number(updated.id);
                            const layoutForId = dashboards.get(updatedId) ?? dashboards.get(resolveFrontendSlideId(updatedId));
                            const integrationMatch = getIntegrationInfoForSlideIdOrWidgets(updatedId, layoutForId, updated.title);
                            if (integrationMatch) updated.source = "integration";
                            if (updated.source === "integration" && updated.integrationIndex === undefined) {
                              updated.integrationIndex = integrationMatch?.info.originalIndex ?? Number(updated.id);
                            }

                            if (updated.source === "integration") {
                              // Use slideID to lookup integration (Multi-Slide Support)
                              const integrationInfo = integrationMatch?.info ?? slideIntegrationMap.get(Number(updated.id));

                              if (integrationInfo && (!updated.title || updated.title === "" || updated.title.startsWith("Untitled"))) {
                                // Specific logic for sub-slides
                                const normalizedPlatform = integrationInfo.platform?.toLowerCase().trim().replace(/[ _-]/g, '');
                                const template = normalizedPlatform ? (
                                  INTEGRATION_TEMPLATES[integrationInfo.platform || ''] ??
                                  INTEGRATION_TEMPLATES[normalizedPlatform] ??
                                  INTEGRATION_TEMPLATES[normalizedPlatform.replace(/(meta)(.+)/, '$1-$2')]
                                ) : undefined;

                                if (template?.slides && template.slides[integrationInfo.subSlideIndex]) {
                                  updated.title = template.slides[integrationInfo.subSlideIndex].name;
                                } else {
                                  const platformConfig = getPlatformConfig(integrationInfo.platform);
                                  updated.title = platformConfig?.name || integrationInfo.platform || "Integration";
                                }

                                if (!updated.subtitle) updated.subtitle = integrationInfo.accountName;
                              }
                            }
                            return updated;
                          });
                          return [...augmentedBase, ...extras, ...integrationExtras];
                        })()}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <Sheet open={isRightSidebarOpen} onOpenChange={setIsRightSidebarOpen}>
                  <SheetContent side="right" className="p-0 w-[85vw] max-w-[400px]">
                    <div className="w-full h-full flex flex-col pt-6">
                      <div className="w-full p-3 md:p-4 border-b font-semibold text-sm md:text-base text-accent-foreground flex-shrink-0">
                        {rightPanelTitle}
                      </div>

                      <div className="flex-1 overflow-hidden min-h-0">
                        {rightPanelContent}
                      </div>

                      <div className={`${widgetFormState.widgetType !== "" ? "flex-1" : "hidden"} overflow-y-auto`}>
                        {widgetFormSections}
                      </div>

                      <div className="mt-auto border-t">
                        <ReportElements
                          setRightPanelTitle={setRightPanelTitle}
                          setWidgetFormState={setWidgetFormState}
                          orientation="horizontal"
                          disabled={isGeneratingPdf || isMobile}
                        />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const ReportBuilder = (props: ReportBuilderProps) => {
  const { clientId } = useParams<{ clientId: string }>();
  // Handle optional props or fallback to params


  // Note: ReportBuilderContent uses its own useParams to get clientId too, 
  // but we need it here for the guard.
  // If providedReportId is passed (embedded mode), we might not have clientId in params?
  // Actually, standard usage URL is /clients/:clientId/reports/...
  // Let's rely on parsedClientId logic similar to inside the component.

  const parsedClientId = clientId ? parseInt(clientId) : null;
  const { overallProgress } = useSyncStatus(parsedClientId);
  const pendingClientId = localStorage.getItem("pending_oauth_client_id");
  const pendingIntegration = localStorage.getItem("pending_oauth_integration");
  const hasPendingOAuthForClient = Boolean(
    parsedClientId &&
    pendingClientId &&
    Number(pendingClientId) === parsedClientId &&
    pendingIntegration
  );

  if (parsedClientId && (overallProgress.isSyncing || hasPendingOAuthForClient) && !props.readOnly) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
        <div className="flex flex-col items-center max-w-md p-8 text-center bg-white rounded-xl shadow-xl border border-zinc-200">
          <div className="mb-6 p-4 bg-amber-50 rounded-full">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Data Synchronization in Progress</h2>
          <p className="text-zinc-600 mb-8">
            We are currently syncing the latest data for this client.
            Please wait until the process is complete ensuring your reports are accurate.
          </p>
          <div className="flex gap-3">
            <div className="flex flex-col gap-2 w-full">
              <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${overallProgress.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Syncing integrations...</span>
                <span>{Math.round(overallProgress.percent)}%</span>
              </div>
            </div>
          </div>
          <a
            href="/reports"
            className="mt-8 w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Go back to Reports
          </a>
        </div>
      </div>
    );
  }

  return <ReportBuilderContent {...props} />;
};

export default ReportBuilder;

