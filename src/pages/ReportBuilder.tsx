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
  type UnifiedMetricRow,
} from "@/features/reports/api/reportingApi";

import { prettifyMetricLabel } from "@/utils/labelUtils";
import { CreateScheduleModal } from "../components/CreateScheduleModal";
import { getGoogleConsoleUnifiedMetrics } from "@/features/YouTube/API/googleConsoleapi";
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
import { useDemographicData } from "@/features/reports/hooks/useDemographicData";
import { WidgetDataWrapper } from "@/features/reports/components/WidgetDataWrapper";
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
import { useResolvedWidgetsMap } from "@/features/reports/hooks/useResolvedWidgetsMap";

// DashboardLayout and DashboardMap types removed (imported from @/features/reports/api/types)



// Auto width provider for react-grid-layout
const AutoWidthGrid = WidthProvider(GridLayout);








// Table Data moved to reportConstants.ts

// Re-export for backward compatibility (used by ReportElements.tsx)
export type { WidgetFormState } from "@/features/reports/types";




// Main ReportBuilder Component
function ReportBuilderContent({ readOnly = false, providedReportId, shareToken, initialData }: ReportBuilderProps = {}) {
  const params = useParams<{ clientId: string; id?: string }>();
  const parsedClientId = params.clientId ? parseInt(params.clientId) : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // removed duplicate dateRange declaration here, using existing one or defining it once


  // Detect if we're on tablet (using window width)
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
    };

    checkTablet();
    window.addEventListener("resize", checkTablet);
    return () => window.removeEventListener("resize", checkTablet);
  }, []);

  // Detect if we're on mobile (using window width)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        console.log('📦 [Persistence] Restoring dashboards from store', saved.dashboards);
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
    console.log(`🔄 [Store Init] Initializing deletedSlideIds for reportId:`, reportId);
    if (reportId) {
      const saved = useReportStore.getState().getReportState(reportId);
      console.log(`🔄 [Store Init] Saved state from store:`, saved);
      if (saved?.deletedSlideIds) {
        console.log(`🔄 [Store Init] Restoring deletedSlideIds:`, Array.from(saved.deletedSlideIds));
        // Expose to window for debugging
        if (typeof window !== 'undefined') {
          (window as any).__DELETED_SLIDES_DEBUG__ = saved.deletedSlideIds;
        }
        return saved.deletedSlideIds;
      }
    }
    console.log(`🔄 [Store Init] No saved deletedSlideIds, returning empty Set`);
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

  const effectivePageOrder = useMemo(() => {
    // Use pageOrder if available, otherwise use dashboardIds in their natural order (not sorted)
    const order = pageOrder.length > 0 ? pageOrder : dashboardIds;
    const filtered = order.filter(id => dashboards.has(id));

    // Debug logging to trace page order issues
    if (pageOrder.length === 0 && dashboardIds.length > 0) {
      console.warn('⚠️ [PageOrder] Using dashboardIds fallback. pageOrder is empty:', { dashboardIds, filtered });
    } else if (pageOrder.length > 0) {
      console.log('✅ [PageOrder] Using saved pageOrder:', { pageOrder, filtered });
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

  // Slide visibility for lazy loading: only fetch widget data for visible/near-visible slides
  const { registerSlide, isSlideVisible } = useSlideVisibility({
    rootMargin: "0px 0px 300px 0px",
    sticky: true,
  });



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

  // Collect all widgets for demographic data fetching
  const allWidgets = useMemo(() => Array.from(dashboards.values()).flat(), [dashboards]);
  const currentStartDate = dateRange?.from ? formatApiDate(new Date(dateRange.from)) : formatApiDate(subDays(new Date(), 89));
  const currentEndDate = dateRange?.to ? formatApiDate(new Date(dateRange.to)) : formatApiDate(new Date());

  const { data: demographicDataMap } = useDemographicData(
    allWidgets,
    parsedClientId || 0,
    {
      startDate: currentStartDate,
      endDate: currentEndDate
    }
  );

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
    staleTime: 60 * 1000, // Cache for 60 seconds to avoid ghost slides
    placeholderData: keepPreviousData // 🔧 FIX: Keep previous data during refetch to prevent slideIntegrationMap from becoming empty
  });

  // Debug log with safe handling of undefined
  if (integrationsData) {
    console.log(integrationsData, "integrationsData", parsedClientId);
  }

  // NOTE: We only enable 'available metrics' fetch if we have a clientId
  // If we are in 'shared' mode, we might not have clientId initially,
  // but once template loads, effectiveClientId will be set.
  // Force refresh of metrics when integrations change (e.g. newly connected)
  const integrationVersion = integrationsData?.integrations
    ?.map((i) => `${i.id}-${i.platform}`)
    .sort()
    .join(",") || "";

  const {
    groupedMetrics,
    isLoading: isLoadingAvailableMetrics,
    error: availableMetricsError,
  } = useAvailableMetrics(effectiveClientId, {
    enabled: !readOnly,
    integrationVersion
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

  const gscMetricsQuery = useQuery({
    queryKey: [
      "report-builder",
      "integration-metrics",
      selectedIntegrationForMetrics?.platform,
      selectedIntegrationForMetrics?.accountId,
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
    queryFn: () => {
      const normalized = selectedIntegrationForMetrics!.platform
        .toLowerCase()
        .replace(/_/g, "-");
      const integrationKey =
        normalized === "google-console" ? "google-search-console" : normalized;
      return getGoogleConsoleUnifiedMetrics(parsedClientId!, {
        integration: integrationKey,
        metricKey: integrationKey === "google-analytics" ? undefined : "google_seo.clicks",
        dimensionType: isGscSelected ? [gscDimensionType] : undefined,
        startDate: gscStartDate,
        endDate: gscEndDate,
        accountId: selectedIntegrationForMetrics?.accountId,
      });
    },
    staleTime: 60 * 1000,
  });






  const slideIntegrationMap = useMemo(() => {
    // Build a map of slide IDs to integration details
    // Current assumption: slide ID 0 = Integration 0, slide ID 1 = Integration 1, etc.
    const map = new Map<number, {
      platform: string;
      accountId: string;
      accountName: string;
      originalIndex: number; // Important for mapping back to integrations array
      subSlideIndex: number; // 0 for main slide, 1 for second slide (e.g. IG), etc.
    }>();

    let currentSlideId = 0;

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

        // 🔍 DIAGNOSTIC LOG: Track Instagram slide creation
        if (integ.platform?.toLowerCase().includes('instagram')) {
          console.log(`📊 [SlideMap] Creating Instagram slide(s):`, {
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
          map.set(currentSlideId, {
            platform: integ.platform,
            accountId: integ.accountId,
            accountName: integ.accountName,
            originalIndex: index,
            subSlideIndex: i
          });
          currentSlideId++;
        }
      }
    });

    // 🔍 DIAGNOSTIC LOG: Final slideIntegrationMap summary
    console.log(`📊 [SlideMap] Final map created with ${map.size} slides:`,
      Array.from(map.entries()).map(([id, info]) => ({
        slideId: id,
        platform: info.platform,
        accountName: info.accountName
      }))
    );

    // Expose to window for console debugging
    if (typeof window !== 'undefined') {
      (window as any).__SLIDE_MAP_DEBUG__ = map;
      (window as any).__INTEGRATIONS_DEBUG__ = integrationsData;
    }

    return map;
  }, [integrationsData?.integrations]);


  // 🔍 DIAGNOSTIC: Track when slideIntegrationMap becomes empty
  useEffect(() => {
    if (slideIntegrationMap.size === 0 && integrationsData?.integrations?.length) {
      console.error(`⚠️ [SlideMap] Map is EMPTY but integrations exist!`, {
        integrationsCount: integrationsData.integrations.length,
        integrations: integrationsData.integrations.map(i => i.platform)
      });
    }
  }, [slideIntegrationMap, integrationsData?.integrations]);

  // Ref to track if we've hydrated this specific template to prevent re-hydration
  const hydratedTemplateIdRef = useRef<number | null>(null);

  // ✅ FIX 1: Clean Hydration Logic
  useEffect(() => {
    if (!templateQuery.data) return;

    // CRITICAL FIX: Wait for integrations to load so we can properly rescue/map IDs
    if (!readOnly && (isLoadingIntegrations || !integrationsData?.integrations)) return;

    // CRITICAL FIX: Only run hydration once per template to avoid resetting local state
    // Check EITHER isDashboardsInitialized OR the ref to handle remounts in Strict Mode
    // Use OR logic so that even if isDashboardsInitialized is reset, the ref prevents re-hydration
    if (isDashboardsInitialized || hydratedTemplateIdRef.current === templateId) {
      console.log(`⏭️ [Hydration] Skipping - already hydrated templateId ${templateId}`);
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
          console.log(`📅 [Dynamic Dates] Applied preset '${savedPreset}':`, dynamicRange);
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
    console.log('🧹 [Hydration] Starting cleanup. Integrations:', numIntegrations);

    let cleanedSlidesMeta: ReportSlideMeta[] = [];

    if (Array.isArray(templateQuery.data.slidesMeta)) {
      const rawSlidesMeta = templateQuery.data.slidesMeta;

      // ✅ STEP 1: Build valid slide IDs set using slideIntegrationMap
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
          console.log('🔍 [Validation] Adding high-ID page to validSlideIds:', sId, 'source:', slide.source, 'title:', slide.title);
          validSlideIds.add(sId);
        }
      });

      console.log(`🔍 [Hydration] Current deletedSlideIds:`, Array.from(deletedSlideIds));

      // 🔍 DIAGNOSTIC: Check for Instagram slides in deleted list
      const deletedInstagramSlides = Array.from(deletedSlideIds).filter(id => {
        const slideInfo = slideIntegrationMap.get(id);
        return slideInfo?.platform?.toLowerCase().includes('instagram');
      });
      if (deletedInstagramSlides.length > 0) {
        console.warn(`⚠️ [Hydration] Instagram slides in deleted list:`, deletedInstagramSlides);
      }

      // ✅ STEP 2: Filter out ghost slides and explicitly deleted slides
      cleanedSlidesMeta = rawSlidesMeta.filter((slide: any) => {
        const sId = Number(slide.id);

        // Reject if explicitly deleted by user
        if (deletedSlideIds.has(sId)) {
          console.log(`🗑️ [Hydration] Removing deleted slide: ID=${sId}, Title="${slide.title}"`);
          return false;
        }

        // Reject if not in valid set
        if (!validSlideIds.has(sId)) {
          console.log(`👻 [Hydration] Removing ghost slide: ID=${sId}, Title="${slide.title}", Source=${slide.source}`);
          return false;
        }

        // Reject high-ID integration duplicates (ID >= 1000 but source is integration)
        if (sId >= 1000 && slide.source === 'integration') {
          console.log(`👻 [Hydration] Removing high-ID integration duplicate: ID=${sId}`);
          return false;
        }

        return true;
      });

      // ✅ STEP 3: Update customPages with cleaned data
      setCustomPages((prev) => {
        const fromBackend = cleanedSlidesMeta
          .filter((slide: any) => slide.source === 'custom' && Number(slide.id) >= 1000)
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
    console.log(`🔄 [Hydration] Loading ${templateQuery.data.widgets?.length || 0} widgets from database`);
    console.log(`🔄 [Hydration] Widget slideIds:`,
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
        if (!map.has(slideId) && !deletedSlideIds.has(slideId)) {
          console.log(`📝 [Hydration] Creating missing dashboard for slide ${slideId}`);
          map.set(slideId, []);
        }
      });
    }

    // SHARED / READ-ONLY MODE
    if (readOnly) {
      setDashboards(map);
      if (templateQuery.data.pageOrder && templateQuery.data.pageOrder.length > 0) {
        let order = templateQuery.data.pageOrder.map((id: any) => Number(id));
        if (order.includes(0) && !map.has(0) && map.size > 0) {
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
        setPageOrder(Array.from(map.keys()).sort((a, b) => a - b));
      }
      setIsDashboardsInitialized(true);
      return;
    }

    // RESCUE & MIGRATION LOGIC (Simplified but robust)
    const idMapping = new Map<number, number>();
    const pendingMoves: Array<{ from: number; to: number }> = [];

    console.log('🔍 [ID Mapping] cleanedSlidesMeta:', cleanedSlidesMeta.map(s => ({ id: s.id, source: s.source, integrationIndex: s.integrationIndex })));

    // Remap backend IDs to integration indices
    cleanedSlidesMeta.forEach(slide => {
      const bId = Number(slide.id);
      const iIdx = slide.integrationIndex;

      // CRITICAL: Never remap custom pages (ID >= 1000 with source === 'custom')
      if (bId >= 1000 && slide.source === 'custom') {
        console.log('🔍 [ID Mapping] Skipping custom page:', bId);
        return; // Skip custom pages entirely
      }

      if (slide.source === 'integration' && typeof iIdx === 'number') {
        // Find newest frontend ID for this integration (subSlide 0)
        let fId = iIdx;
        for (const [sId, info] of slideIntegrationMap.entries()) {
          if (info.originalIndex === iIdx && info.subSlideIndex === 0) {
            fId = sId;
            break;
          }
        }
        if (bId !== fId) {
          console.log('🔍 [ID Mapping] Mapping integration page:', bId, '->', fId);
          pendingMoves.push({ from: bId, to: fId });
          idMapping.set(bId, fId);
        }
      } else if (bId < 1000 && !slide.source) {
        // Legacy: ID < 1000 is integration index 0
        console.log('🔍 [ID Mapping] Legacy mapping:', bId);
        idMapping.set(bId, bId);
      }
    });

    // Execute Moves
    pendingMoves.forEach(move => {
      const widgets = map.get(move.from);
      if (widgets && widgets.length > 0 && integrationsData?.integrations) {
        // ✅ NEW: Validate that widgets actually belong to the target platform
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
            return false;
          });

          if (!allMatch) {
            console.log(`❌ [Migration] Rejecting move from ${move.from} to ${move.to}: Widget integration mismatch`);
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

    // Content-Based Reclamation (Keep for safety)
    map.forEach((widgets, sId) => {
      if ((sId >= 1000 || !cleanedSlidesMeta.find(m => Number(m.id) === sId)) && widgets.length > 0) {
        const firstInt = widgets[0].metricConfig?.integration;
        if (firstInt && integrationsData?.integrations) {
          const normalize = (s: string) => s.toLowerCase().replace(/[ _-]/g, '');
          const widgetIntNormalized = normalize(firstInt);

          const matchIdx = integrationsData.integrations.findIndex(i => {
            const plat = normalize(i.platform);
            return plat === widgetIntNormalized ||
              (plat === 'woocommerce' && widgetIntNormalized === 'woo') ||
              (plat === 'googlesearchconsole' && widgetIntNormalized === 'googleconsole') ||
              (plat === 'metabusiness' && ['metafacebook', 'metainstagram'].includes(widgetIntNormalized));
          });

          if (matchIdx !== -1) {
            const targetPlatform = normalize(integrationsData.integrations[matchIdx].platform);

            // ✅ NEW: Strict validation for ALL widgets in this ghost slide
            const allMatch = widgets.every(w => {
              const wInt = normalize(w.metricConfig?.integration || '');
              if (wInt === targetPlatform) return true;
              if (targetPlatform === 'metabusiness' && (wInt === 'metafacebook' || wInt === 'metainstagram')) return true;
              if (targetPlatform === 'googleanalytics' && (wInt === 'google' || wInt === 'googleanalytics')) return true;
              return false;
            });

            if (allMatch) {
              console.log(`🩹 [Rescue] Reclaiming content from ${sId} to ${matchIdx}`);
              const existing = map.get(matchIdx) || [];
              const updatedWidgets = widgets.map(w => {
                const updatedW = { ...w, slideId: matchIdx } as any;
                if (updatedW.layout) updatedW.layout = { ...updatedW.layout, slideId: matchIdx };
                if (updatedW.metricConfig?.layout) {
                  updatedW.metricConfig.layout = { ...updatedW.metricConfig.layout, slideId: matchIdx };
                }
                return updatedW;
              });
              map.set(matchIdx, [...existing, ...updatedWidgets]);
              map.delete(sId);
              idMapping.set(sId, matchIdx);
            } else {
              console.log(`❌ [Rescue] Aborting rescue of ${sId}: mixed content detected`);
              // If it's mixed, we're better off deleting it than corrupting a dashboard
              map.delete(sId);
            }
          } else {
            // No matching integration: Delete orphaned content
            console.log(`🗑️ [Rescue] Deleting orphaned widgets from ${sId} (No match for ${firstInt})`);
            map.delete(sId);
          }
        }
      }
    });

    // Final Setup
    setDashboards(map);
    setIsDashboardsInitialized(true);
    // Mark this template as hydrated to prevent re-hydration on remounts
    hydratedTemplateIdRef.current = templateId;
    console.log(`✅ [Hydration] Completed for templateId ${templateId}`);

    // Rebuild processedSlidesMeta
    const finalMeta = cleanedSlidesMeta.map(m => {
      const targetId = idMapping.get(Number(m.id)) ?? Number(m.id);
      return { ...m, id: targetId };
    });

    // Deduplicate Meta and fix integration metadata
    const dedupedMeta: ReportSlideMeta[] = [];
    const seenIds = new Set<number>();

    console.log('🔍 [Hydration] finalMeta before deduplication:', finalMeta.map(m => ({ id: m.id, title: m.title, source: m.source })));

    finalMeta.forEach(m => {
      if (!seenIds.has(m.id)) {
        // If slide ID exists in slideIntegrationMap, it's ALWAYS an integration slide
        // Force correct metadata even if corrupted backend data says it's 'custom'
        const slideInfo = slideIntegrationMap.get(m.id);
        if (slideInfo) {
          dedupedMeta.push({
            id: m.id,
            source: 'integration',
            integrationIndex: slideInfo.originalIndex,
            title: slideInfo.platform,
            subtitle: slideInfo.accountName
          });
        } else {
          // Not in slideIntegrationMap, preserve as-is (custom page)
          console.log('🔍 [Hydration] Adding custom page to dedupedMeta:', m.id, m.title);
          dedupedMeta.push(m);
        }
        seenIds.add(m.id);
      }
    });

    // Safety: Ensure all current integrations exist (unless explicitly deleted)
    slideIntegrationMap.forEach((info, sId) => {
      if (!seenIds.has(sId) && !deletedSlideIds.has(sId)) {
        dedupedMeta.push({
          id: sId,
          source: 'integration',
          integrationIndex: info.originalIndex,
          title: info.platform,
          subtitle: info.accountName
        });
        seenIds.add(sId);
      }
    });

    setProcessedSlidesMeta(dedupedMeta);

    // Clean pageOrder
    if (templateQuery.data.pageOrder) {
      console.log('🔍 [PageOrder Hydration] Raw pageOrder from backend:', templateQuery.data.pageOrder);
      console.log('🔍 [PageOrder Hydration] seenIds:', Array.from(seenIds));
      console.log('🔍 [PageOrder Hydration] idMapping:', Array.from(idMapping.entries()));

      const newOrder = templateQuery.data.pageOrder
        .map((id: any) => {
          const numId = Number(id);
          // Don't remap custom pages (ID >= 1000)
          if (numId >= 1000) {
            console.log('🔍 [PageOrder Mapping] Preserving custom page ID:', numId);
            return numId;
          }
          // Only remap integration pages
          const mapped = idMapping.get(numId) ?? numId;
          if (mapped !== numId) {
            console.log('🔍 [PageOrder Mapping] Remapping integration page:', numId, '->', mapped);
          }
          return mapped;
        });

      console.log('🔍 [PageOrder Hydration] Cleaned pageOrder:', newOrder);

      const uniqueOrder = Array.from(new Set(newOrder)) as number[];

      // 2. Ghost Rescue & Validation
      // We trust the backend order, but we must ensure we don't have IDs that point to nothing.
      // However, for Custom Pages (ID >= 1000), if they are in the order but missing from metadata,
      // we "rescue" them by treating them as valid (they will be rendered as untitled custom pages if not in customPages state).
      const finalValidatedOrder = uniqueOrder.filter(id => {
        // Integration Pages: MUST exist in slideIntegrationMap
        if (id < 1000) {
          const exists = slideIntegrationMap.has(id);
          if (!exists) {
            console.warn(`👻 [PageOrder] Removing ghost INTEGRATION page ID ${id} (Integrations: ${integrationsData?.integrations?.length})`);
          }
          return exists;
        }

        // Custom Pages: Always keep them if they are in the order.
        // The user explicitly ordered them. If metadata is missing, they will just be blank.
        return true;
      });

      setPageOrder(finalValidatedOrder);
    } else {
      // Fallback: Use the order of slides as they appear in metadata
      console.log('⚠️ [PageOrder Hydration] No pageOrder in template data, using dedupedMeta order');
      setPageOrder(dedupedMeta.map(m => m.id));
    }

  }, [templateQuery.data, integrationsData?.integrations, isLoadingIntegrations, isDashboardsInitialized, deletedSlideIds]);

  // Persistence: Sync state changes to store
  const updateReportState = useReportStore((state) => state.updateReportState);

  useEffect(() => {
    // CRITICAL: Prevent syncing empty/initial state back to the store until hydration is complete.
    // If we sync too early, we "poison" the persistence store with empty data before the backend returns.
    if (templateId && isDashboardsInitialized) {
      // console.log(`💾 [Store Persist] Saving state for templateId ${templateId}.`);
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

  // widgetSignature removed — per-widget useQuery handles refetch automatically

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
          if (ENABLE_AUTO_DEFAULT_WIDGETS && groupedMetrics && !isLoadingAvailableMetrics) {
            // Auto-populate with default widgets
            if (integrationInfo) {
              const picked = pickDefaultMetricsForIntegration(
                integrationInfo.platform,
                integrationInfo.accountId,
                groupedMetrics as any,
                (msg) => toast.warning(msg)
              );
              const defaults = buildDefaultWidgetsForIntegration(
                id,
                picked,
                integrationInfo.platform,
                integrationInfo.accountId,
                integrationInfo.subSlideIndex
              );
              updated.set(id, defaults);
              changed = true;
            } else {
              updated.set(id, []);
              changed = true;
            }
          } else {
            // Feature disabled or metrics not loaded - create empty slide
            updated.set(id, []);
            changed = true;
          }
        } else if (ENABLE_AUTO_DEFAULT_WIDGETS && groupedMetrics && !isLoadingAvailableMetrics) {
          // Slide exists - check if it's empty OR has a broken auto-state and should be populated/replaced
          const existing = updated.get(id);

          // A slide is "broken" if it's empty OR if it has 4 or fewer widgets for a Meta integration (our old partial default)
          const isMeta = !!integrationInfo?.platform?.toLowerCase().match(/meta|fb|ig|ads/);
          const isBrokenState = existing && (
            (existing.length === 4 && existing.every(w => w.i.includes('auto'))) ||
            (existing.length < 5 && isMeta)
          );


          // 🛡️ CRITICAL FIX: Do NOT auto-populate if the user has manually touched this slide
          // this ensures widget deletions persist!
          if (existing && (existing.length === 0 || isBrokenState) && !modifiedSlideIds.current.has(id)) {
            if (integrationInfo) {
              // ... rest of logic
              console.log(`♻️ Auto-populating/Replacing slide ${id} for ${integrationInfo.platform} (Metrics: ${existing.length})`);
              const picked = pickDefaultMetricsForIntegration(
                integrationInfo.platform,
                integrationInfo.accountId,
                groupedMetrics as any,
                (msg) => toast.warning(msg)
              );
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

  // --- Per-widget lazy loading replaces the old monolithic reportDataQuery ---
  // Each widget now fetches its own data via useWidgetData (called inside WidgetDataWrapper).
  // useResolvedWidgetsMap aggregates all per-widget cache entries for consumers like buildTemplatePayloadFromDashboards.
  const resolvedWidgets = useResolvedWidgetsMap(dashboards, dateFrom, dateTo, shareToken);

  // Prefetch all widget data (e.g. before PDF export) to ensure off-screen slides have data
  const prefetchAllWidgets = useCallback(async () => {
    const promises: Promise<void>[] = [];
    dashboards.forEach((layout) => {
      layout.forEach((widget) => {
        const metricConfig = widget.metricConfig;
        if (!metricConfig?.metricKey) return;
        promises.push(
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
            staleTime: 5 * 60 * 1000,
          })
        );
      });
    });
    await Promise.all(promises);
  }, [dashboards, dateFrom, dateTo, shareToken, effectiveClientId, integrationsData, queryClient]);

  // LEGACY COMPAT: stub reportDataQuery shape for any remaining references
  const reportDataQuery = {
    data: resolvedWidgets,
    isFetching: false,
    isError: false,
    error: null,
    status: Object.keys(resolvedWidgets).length > 0 ? "success" as const : "pending" as const,
  };



  // gaResolvedWidgets removed

  const buildTemplatePayloadFromDashboards =
    useCallback((): CreateTemplatePayload => {
      console.log(`🔨 [BuildPayload] Building save payload...`, {
        isLoadingIntegrations,
        hasIntegrationsData: !!integrationsData,
        slideMapSize: slideIntegrationMap.size
      });

      const widgets: ReportWidgetDefinition[] = [];
      // Build slidesMeta earlier so we can use it to bake titles into widgets
      // KEY FIX: Use pageOrder as source of truth for which slides exist.
      // Previously used dashboards.keys(), which might miss empty pages or include deleted ones.
      const slideIdList = pageOrder && pageOrder.length > 0 ? pageOrder : Array.from(dashboards.keys());

      // 🔍 DIAGNOSTIC: Warn if slideIntegrationMap is empty during save
      if (slideIntegrationMap.size === 0 && !readOnly && slideIdList.some(id => Number(id) < 1000)) {
        console.warn(`⚠️ [SavePayload] slideIntegrationMap is EMPTY during save!`, {
          integrationsDataExists: !!integrationsData,
          integrationsCount: integrationsData?.integrations?.length,
          slideIdList: slideIdList.filter(id => Number(id) < 1000)
        });
      }

      // CRITICAL FIX: Use processedSlidesMeta (the clean, deduplicated list from state)
      // instead of raw templateQuery data. This ensures rescues/reclamations are persisted.
      const existingMeta = processedSlidesMeta.length > 0 ? processedSlidesMeta : (templateQuery.data?.slidesMeta ?? []);

      const slidesMeta = slideIdList
        .map((slideId) => {
          const slideIdNum = Number(slideId);

          // ✅ STEP 1: Validate slideId is legitimate
          // For integration slides, check if the slide exists in slideIntegrationMap
          // 🔧 FIX: If slideIntegrationMap is empty (timing issue), allow integration IDs 0-999 to pass through
          const isValidIntegrationId = slideIdNum >= 0 && slideIdNum < 1000 &&
            (slideIntegrationMap.has(slideIdNum) || slideIntegrationMap.size === 0);
          const isValidCustomId = slideIdNum >= 1000;

          if (!isValidIntegrationId && !isValidCustomId) {
            console.log(`👻 [SavePayload] Rejecting invalid slideId: ${slideId}`, {
              slideIdNum,
              isIntegrationRange: slideIdNum >= 0 && slideIdNum < 1000,
              inSlideMap: slideIntegrationMap.has(slideIdNum),
              slideMapKeys: Array.from(slideIntegrationMap.keys()),
              slideMapSize: slideIntegrationMap.size,
              reason: slideIdNum < 1000 ? 'Not in slideIntegrationMap' : 'Invalid custom ID'
            });
            return null;
          }

          const fromExisting = existingMeta.find((m: any) => Number(m.id) === slideId);
          const fromCustom = customPages.find((p) => p.id === slideId);

          if (fromExisting) {
            // ✅ CRITICAL: Detect and remove "Untitled page" ghosts
            const isGhostUntitled =
              fromExisting.source === 'custom' &&
              slideIdNum < 1000 && // Custom pages MUST have ID >= 1000
              (!fromExisting.title ||
                fromExisting.title === 'Untitled page' ||
                fromExisting.title === 'Untitled' ||
                fromExisting.title.startsWith('Slide '));

            if (isGhostUntitled) {
              console.log(`👻 [SavePayload] Removing "Untitled page" ghost: ${slideId}`);
              return null;
            }

            // ✅ CRITICAL: Detect and remove high-ID integration duplicates
            if (slideIdNum >= 1000 && fromExisting.source === 'integration') {
              const integrationIdx = typeof fromExisting.integrationIndex === 'number'
                ? fromExisting.integrationIndex
                : slideIdNum;

              // Check if we already have the low-ID version in slideIdList
              const hasDuplicateLowId = slideIdList.includes(integrationIdx) && integrationIdx !== slideIdNum;

              if (hasDuplicateLowId) {
                console.log(`👻 [SavePayload] Removing high-ID duplicate: ${slideId} (integration ${integrationIdx})`);
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
                  console.log(`👻 [SavePayload] removing ghost slide ${slideId} (Integration Disconnected). Index=${idx}`, {
                    platform: slideInfo?.platform,
                    accountName: slideInfo?.accountName,
                    reason: 'Integration no longer exists in integrationsData.integrations array'
                  });
                  return null;
                }
              }
            }

            // Force low IDs (< 1000) to be integration slides
            if (slideIdNum < 1000) {
              // Use slideIntegrationMap to find the correct integration index if not set
              const slideInfo = slideIntegrationMap.get(slideIdNum);
              const integrationIdx = fromExisting.integrationIndex ?? slideInfo?.originalIndex ?? slideIdNum;

              return {
                ...fromExisting,
                source: "integration" as const,
                integrationIndex: integrationIdx,
                title: fromExisting.title?.includes("Untitled") ? "" : fromExisting.title
              };
            }

            // High IDs (>= 1000) that claim to be custom - validate they're real
            if (slideIdNum >= 1000 && fromExisting.source === 'custom') {
              const layout = dashboards.get(slideIdNum);
              const hasWidgets = layout && layout.length > 0;
              const hasRealTitle = fromExisting.title &&
                fromExisting.title !== 'Untitled page' &&
                fromExisting.title !== 'Untitled' &&
                !fromExisting.title.startsWith('Slide ') &&
                fromExisting.title.trim() !== '';

              const isReal = hasRealTitle || hasWidgets;

              if (!isReal) {
                console.log(`👻 [SavePayload] Removing fake custom page: ${slideId}`);
                return null;
              }

              const { integrationIndex, ...rest } = fromExisting;
              return { ...rest, source: "custom" as const };
            }

            return { ...fromExisting };
          }

          // fromCustom logic
          if (fromCustom) {
            // ✅ FIX: Always save custom pages if they exist in our state.
            // Do NOT filter them out even if they are empty or untitled.
            return {
              id: slideIdNum,
              title: fromCustom.name, // Persist the user-defined name
              subtitle: fromCustom.subtitle,
              source: "custom" as const
            };
          }

          // Integration fallback - use slideIntegrationMap to find the correct integration
          const slideInfo = slideIntegrationMap.get(Number(slideId));
          if (slideInfo) {
            const integration = integrationsData?.integrations?.[slideInfo.originalIndex];
            if (integration) {
              const platformConfig = getPlatformConfig(integration.platform);
              return {
                id: slideId,
                title: platformConfig?.name || integration.platform,
                subtitle: integration.accountName,
                source: "integration" as const,
                integrationIndex: slideInfo.originalIndex
              };
            }
          }

          // Final safety: low IDs are integrations
          if (Number(slideId) < 1000) {
            // Use slideIntegrationMap to find the correct integration index
            const slideInfo = slideIntegrationMap.get(Number(slideId));
            const integrationIdx = slideInfo?.originalIndex ?? Number(slideId);

            if (!readOnly && !isLoadingIntegrations && integrationsData?.integrations && !integrationsData.integrations[integrationIdx]) {
              console.log(`👻 [SavePayload] removing ghost slide ${slideId} (Integration Disconnected). Index=${integrationIdx}`);
              return null;
            }

            return {
              id: slideId,
              title: "",
              source: "integration" as const,
              integrationIndex: integrationIdx
            };
          }

          const layout = dashboards.get(slideIdNum);
          const hasWidgets = layout && layout.length > 0;

          // ✅ FIX: Allow saving empty custom pages. 
          // If we have a dashboard entry (which we create when adding a page), it's real.
          // Fallback for "ghost" custom pages that might be continuously resaved:
          // If it's not in customPages AND has no widgets, then maybe it's a true ghost.
          if (!hasWidgets && !fromCustom) {
            console.log(`👻 [SavePayload] Removing true ghost custom page: ${slideId}`);
            return null;
          }

          return {
            id: slideIdNum,
            title: "Untitled page",
            source: "custom" as const
          };
        })
        .filter((s): s is ReportSlideMeta => s !== null);

      // ✅ STEP 2: Clean pageOrder to match cleaned slidesMeta
      const validSlideIds = new Set(slidesMeta.map(s => s.id));
      const cleanedPageOrder = pageOrder.map(id => Number(id)).filter(id => validSlideIds.has(id));

      console.log('💾 [Save] PageOrder being saved:', cleanedPageOrder);
      console.log('💾 [Save] SlidesMeta:', slidesMeta.map(s => ({ id: s.id, title: s.title, source: s.source })));

      // Build widgets array from current dashboards/layouts
      dashboards.forEach((layout, slideId) => {
        // Only include widgets from slides that are still valid after filtering
        if (!validSlideIds.has(slideId)) return;

        const slideMeta = slidesMeta.find(m => m.id === slideId);

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
                console.log(`🔍 [Self-Healing GA Debug] Widget Int: '${metricConfig.integration}', Row Int: '${firstRow.integration}', Widget Acc: '${fixedAccountId}', Row Acc: '${firstRow.accountId}'`);
              }

              // Fix Account ID Mismatch
              // eslint-disable-next-line eqeqeq
              if (firstRow.accountId != fixedAccountId) {
                console.log(`🩹 [Self-Healing] Correction for ${metricConfig.metricKey}: accountId ${fixedAccountId} -> ${firstRow.accountId}`);
                toast.success(`Auto-corrected ${displayName} to Account ID ${firstRow.accountId}`);
                fixedAccountId = firstRow.accountId;
              }

              // Fix Integration Name Mismatch (e.g. google-analytics vs google_analytics)
              if (firstRow.integration && firstRow.integration !== metricConfig.integration) {
                console.log(`🩹 [Self-Healing] Correction for ${metricConfig.metricKey}: integration ${metricConfig.integration} -> ${firstRow.integration}`);
                toast.success(`Auto-corrected ${displayName} integration to ${firstRow.integration}`);
                // modify the config we push
                metricConfig.integration = firstRow.integration;
              }
            }
            // Case 2: Row has NO accountId (e.g. global/client metric) but widget insists on one -> clear it
            else if (fixedAccountId) {
              console.log(`🩹 [Self-Healing] Clearing accountId for ${metricConfig.metricKey} (Global Metric)`);
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
              slideId,
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
              widgetData: (resolvedWidgets[widgetId] || widget.data) as unknown,
              snapshotData: resolvedWidgets[widgetId] ?? widget.snapshotData,
              displayName,
              // Bake slide info into first widget as a recovery beacon
              ...(indexInSlide === 0 ? { slideTitle: slideMeta?.title, slideSubtitle: slideMeta?.subtitle } : {}),
            },
          });
        });

        // console.log(`📦 [PayloadBuilder] Slide ${slideId} has ${layout.length} widgets.`);
      });
      console.log(`🏗️ [BuildPayload] Construction complete. Widgets: ${widgets.length}, Slides: ${slidesMeta.length}`);

      const payload = {
        name: templateName,
        widgets,
        pageOrder: cleanedPageOrder,
        slidesMeta, // Send all slidesMeta
        defaultDateFrom: dateRange?.from?.toISOString(),
        defaultDateTo: dateRange?.to?.toISOString(),
      };

      console.log(`💾 [BuildPayload] Final payload details:`, {
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
      resolvedWidgets,
      dateRange,
      slideIntegrationMap,
      processedSlidesMeta,
      readOnly,
      isLoadingIntegrations
    ]);

  // Ref to always have the latest payload builder for the auto-save effect
  const payloadBuilderRef = useRef(buildTemplatePayloadFromDashboards);
  useEffect(() => {
    payloadBuilderRef.current = buildTemplatePayloadFromDashboards;
  });

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
      console.log('✨ [CreateReport] Using WYSIWYG dashboards state for initial save.');
      payload = {
        ...basePayload,
        name: trimmedName,
      };
    } else {
      console.warn('⚠️ [CreateReport] Dashboards empty or no widgets, falling back to manual generation (Legacy Path).');
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

        const integrationWidgets = buildDefaultWidgetsForIntegration(index, metrics);

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
      console.log(`💾 [SaveMutation] Sending to API:`, {
        templateId,
        clientId: parsedClientId,
        widgetCount: payload.widgets?.length,
        slideCount: payload.slidesMeta?.length
      });
      return updateReportTemplate(parsedClientId, templateId, payload);
    },
    onSuccess: (data) => {
      console.log(`✅ [SaveMutation] Success! Response:`, data);

      // 🔧 CRITICAL FIX: Invalidate template query so refresh loads fresh data
      queryClient.invalidateQueries({ queryKey: ["report-template", templateId] });
      console.log(`🔄 [SaveMutation] Invalidated template query cache`);

      // We already keep the in-memory dashboards (with full widget data)
      // as the source of truth. Avoid immediately re-hydrating from the
      // backend, since the backend may not yet persist manual widgetData
      // (content blocks), which would make them appear to "reset" after save.
      setLastSavedTime(new Date());
      setHasUnsavedChanges(false);
      toast.success("Report template saved");
    },
    onError: (error: ApiError) => {
      console.error(`❌ [SaveMutation] Failed:`, error);
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

      // 🔧 CRITICAL FIX: Allow saving "Structure Only" reports
      // We only block if BOTH widgets AND slides are empty.
      const hasWidgets = payload.widgets && payload.widgets.length > 0;
      const hasSlides = payload.slidesMeta && payload.slidesMeta.length > 0;

      if (!hasWidgets && !hasSlides) {
        console.warn(`⏸️ [Auto-save] BLOCKED - Payload is completely empty (No widgets, No slides)!`);
        return;
      }

      console.log(`💾 [Auto-save] Calling saveTemplate...`, { widgets: payload.widgets?.length, slides: payload.slidesMeta?.length });
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

    console.log("💾 [handleSaveTemplate] Clicked. Checking inputs...");
    console.log(`💾 [handleSaveTemplate] Dashboards Size: ${dashboards.size}`);
    console.log(`💾 [handleSaveTemplate] Dashboards Keys:`, Array.from(dashboards.keys()));

    const basePayload = buildTemplatePayloadFromDashboards();

    // 🔧 SAFETY: Prevent saving with 0 widgets UNLESS it's intentional (user deleted everything)
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
          console.log(`💉 [DataSync] Injecting live data for widget ${w.id} (${w.metricKey})`);

          // Optimization: Strip heavy rows from Metric widgets as they only need summaries
          // This prevents "Request Entity Too Large" errors (413)
          const isMetric = w.type === 'metric' || (w as any).widgetType === 'metric';

          // Create a shallow copy to modify
          // FIX: Merge live data rows/values BUT preserve UI config (columns, title, caption) from the builder state
          const originalData = w.widgetData as any || {};
          const optimizedData = {
            ...originalData,
            ...liveData
          };

          if (isMetric) {
            // Metrics rely on 'value'/'total'/'series'. They rarely need the full 'rows' dump.
            // We replace it with an empty array to save space.
            optimizedData.rows = [];
          }

          return {
            ...w,
            // Inject into widgetData (primary snapshot storage)
            widgetData: optimizedData,
            // Also update filters.widgetData if it exists there (legacy/redundant ref)
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
      await exportAllSlidesToPDF(slidesRef.current, pageOrder);
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
    data: undefined, // ✅ use 'undefined' or just omit
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

  const addCustomPage = useCallback(
    (pageName: string, subtitle?: string) => {
      // Robust ID generation
      const existingIds = Array.from(dashboards.keys());
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : -1;
      // Ensure we jump high enough to avoid collision with low integration IDs
      // If no high IDs exist, start at 1000. If we have 1000+, increment.
      const startId = Math.max(999, maxId);
      const nextId = startId + 1;

      console.log(`[addCustomPage] Creating custom page with ID=${nextId}, name="${pageName}"`);

      // Add to custom pages
      setCustomPages((prev) => [
        ...prev,
        { id: nextId, name: pageName, subtitle },
      ]);

      // CRITICAL FIX: Add to processedSlidesMeta with source: 'custom'
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

      // Add empty slide to dashboards immediately so it's "real"
      setDashboards((prev) => {
        const updated = new Map(prev);
        if (!updated.has(nextId)) {
          updated.set(nextId, []);
        }
        return updated;
      });

      // Add to page order
      setPageOrder((prev) => {
        // If we had no custom order (empty), strictly use current dashboardIds as base
        // otherwise simply append to the existing custom order
        const base = prev.length > 0 ? prev : Array.from(dashboards.keys());
        return [...base, nextId];
      });

      setHasUnsavedChanges(true);
      toast.success(`Added custom page: ${pageName}`);

      return nextId;
    },
    [dashboards]
  );

  const handleDeletePage = useCallback((slideId: number) => {
    console.log(`🗑️ [Delete] Deleting slide ${slideId}`);

    // Remove the slide from dashboards
    setDashboards((prev) => {
      const updated = new Map(prev);
      updated.delete(slideId);
      console.log(`🗑️ [Delete] Updated dashboards, keys:`, Array.from(updated.keys()));
      return updated;
    });

    // Remove from custom pages (if it was a custom page)
    setCustomPages((prev) => prev.filter((p) => p.id !== slideId));

    // Remove from page order
    setPageOrder((prev) => {
      const updated = prev.filter((id) => id !== slideId);
      console.log(`🗑️ [Delete] Updated pageOrder:`, updated);
      return updated;
    });

    // Remove from processedSlidesMeta to prevent ghost pages in sidebar
    setProcessedSlidesMeta((prev) => prev.filter((s) => Number(s.id) !== slideId));

    // Track explicitly deleted slides to prevent auto-restoration
    setDeletedSlideIds((prev) => {
      const updated = new Set(prev);
      updated.add(slideId);
      console.log(`🗑️ [Delete] Updated deletedSlideIds:`, Array.from(updated));
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
        // Use current effective list if possible to ensure we match what the user sees
        // If prevOrder has ghost items, index-based splice will fail.
        // We will cleanup first.
        let baseOrder = prevOrder.length > 0 ? Array.from(new Set(prevOrder)) : Array.from(dashboards.keys());

        // Validate indices - allow toIndex to be equal to length (appending)
        if (
          fromIndex < 0 ||
          fromIndex >= baseOrder.length ||
          toIndex < 0 ||
          toIndex > baseOrder.length
        ) {
          return baseOrder;
        }

        const [movedItem] = baseOrder.splice(fromIndex, 1);
        baseOrder.splice(toIndex, 0, movedItem);

        setHasUnsavedChanges(true); // Triggers auto-save
        return baseOrder;
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
      if (prev.has(availableSlideId)) {
        const updated = new Set(prev);
        updated.delete(availableSlideId);
        console.log(`✅ [Add Integration] Removed slide ${availableSlideId} from deletedSlideIds`);
        return updated;
      }
      return prev;
    });

    // 3. Create the slide with default widgets if enabled
    let defaultWidgets: DashboardLayout[] = [];
    if (ENABLE_AUTO_DEFAULT_WIDGETS) {
      const integration = integrationsData?.integrations?.[integrationIndex];
      if (integration) {
        const picked = pickDefaultMetricsForIntegration(
          integration.platform,
          integration.accountId,
          (groupedMetrics ?? {}) as any,
          (msg) => toast.warning(msg)
        );
        defaultWidgets = buildDefaultWidgetsForIntegration(availableSlideId, picked, integration.platform);
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

      // ✅ Use defaults or fallbacks
      let { w, h } = WIDGET_SIZE_MAP[widgetType] ?? { w: 4, h: 3 };

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

      // 🧠 Use descriptive IDs for better fallback reconstruction on shared reports
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

      // 🪄 Update the dashboards map immutably
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
        // 🛡️ CRITICAL: Ignore layout changes when in mobile view
        if (isMobile) {
          console.log('[ReportBuilder] Ignoring layout change in mobile view');
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
          // ✅ FIX: Use functional state update to ensure we always have the latest dashboards map
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
    [isMobile] // Removed updateDashboard dependency
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
      if (!selectedIntegrationForMetrics) {
        const search = integrationSearch.trim().toLowerCase();
        const integrations = integrationsData?.integrations ?? [];

        const filteredIntegrations = integrations.filter((integration) => {
          if (!search) return true;
          const platformConfig = getPlatformConfig(integration.platform);
          const label =
            platformConfig?.name ||
            `${integration.platform} ${integration.accountName}`;
          return label.toLowerCase().includes(search);
        });

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
                  🔍
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
                      <span className="text-gray-300 text-xs">›</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      }

      // Step 2: metrics list for the selected integration
      const { platform, accountId, accountName } = selectedIntegrationForMetrics;
      const platformConfig = getPlatformConfig(platform);
      const normalizedPlatform = platform.toLowerCase().replace(/_/g, "-");
      const isGoogleConsole =
        normalizedPlatform === "google-console" ||
        normalizedPlatform === "google-search-console";
      const isGoogleAnalytics = normalizedPlatform === "google-analytics";

      // Handle platform aliases (e.g., UI may store "google-console" but metrics come as "google-search-console")
      // Also handle underscore vs hyphen mismatches for other platforms
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
                  ? "meta_business" // Or verify if it's meta_facebook/meta_instagram? Usually unified is separate.
                  : undefined;

      // Try direct, normalized, alias, and fallback matches into groupedMetrics
      const directMetrics = groupedMetrics[platform] ?? {};
      const normalizedMetrics = groupedMetrics[normalizedPlatform] ?? {};
      const aliasMetrics = aliasPlatform ? groupedMetrics[aliasPlatform] ?? {} : {};

      // DEBUG: Log sidebar lookup attempts
      console.log('🔍 Sidebar Metric Lookup:', {
        integration: platform,
        normalized: normalizedPlatform,
        alias: aliasPlatform,
        keysInGroupedMetrics: Object.keys(groupedMetrics),
        foundDirect: Object.keys(directMetrics).length > 0,
        foundNormalized: Object.keys(normalizedMetrics).length > 0,
        foundAlias: Object.keys(aliasMetrics).length > 0,
      });

      const metricsByAccount =
        Object.keys(directMetrics).length > 0
          ? directMetrics
          : Object.keys(normalizedMetrics).length > 0
            ? normalizedMetrics
            : Object.keys(aliasMetrics).length > 0
              ? aliasMetrics
              : {};

      // Special handling for Meta Business: merge Facebook and Instagram metrics
      // We do this even if metrics were found directly, to ensure we have BOTH platforms
      if (platform === "meta-business" || normalizedPlatform === "meta-business") {
        const fbMetrics = groupedMetrics["meta-facebook"] || groupedMetrics["meta_facebook"] || {};
        const igMetrics = groupedMetrics["meta-instagram"] || groupedMetrics["meta_instagram"] || {};

        // Merge accounts from all sources
        const allAccounts = new Set([
          ...Object.keys(metricsByAccount),
          ...Object.keys(fbMetrics),
          ...Object.keys(igMetrics)
        ]);

        // Flatten ALL FB and IG metrics to ensure cross-account visibility
        // This solves the issue where FB Page ID != IG Account ID, causing them to be separated
        const allFbMetrics: any[] = [];
        Object.values(fbMetrics).forEach((list: any) => allFbMetrics.push(...list));

        const allIgMetrics: any[] = [];
        Object.values(igMetrics).forEach((list: any) => allIgMetrics.push(...list));

        allAccounts.forEach(accId => {
          const existing = (metricsByAccount[accId] || []) as any[];

          // Create a map to deduplicate by metricKey
          const uniqueMetrics = new Map<string, any>();

          // Helper to add metrics
          const addMetrics = (list: any[], prefix: string) => {
            list.forEach(m => {
              // Check if we need to add a prefix prefix
              const displayName = m.displayName || m.metricKey;
              const hasPrefix = displayName.startsWith('Facebook - ') || displayName.startsWith('Instagram - ');
              const finalName = hasPrefix ? displayName : `${prefix} - ${displayName}`;

              uniqueMetrics.set(m.metricKey, {
                ...m,
                displayName: finalName,
                integration: "meta-business"
              });
            });
          };

          // Add existing first (giving priority)
          addMetrics(existing, "General");

          // Add ALL Facebook metrics (from any account)
          addMetrics(allFbMetrics, "Facebook");

          // Add ALL Instagram metrics (from any account)
          addMetrics(allIgMetrics, "Instagram");

          if (uniqueMetrics.size > 0) {
            metricsByAccount[accId] = Array.from(uniqueMetrics.values());
          }
        });
      }

      // If Google Search Console or Google Analytics and we have live unified-metrics rows, map them to metric options
      if ((isGoogleConsole || isGoogleAnalytics) && gscMetricsQuery.data?.rows?.length) {
        const gaLabelMap: Record<string, string> = {
          "google.sessions": "Sessions",
          "google.activeUsers": "Active Users",
          "google.pageViews": "Page Views",
          "google.bounceRate": "Bounce Rate",
        };
        const gscLabelMap: Record<string, string> = {
          "google_seo.clicks": "Clicks",
          "google_seo.impressions": "Impressions",
          "google_seo.ctr": "CTR",
          "google_seo.position": "Position",
        };

        // For GA/GSC: drop dimension filters for GA; for GSC keep pure metrics only
        const liveMetrics = gscMetricsQuery.data.rows
          .map((row) => {
            const metricKey =
              row.metricKey ||
              (isGoogleAnalytics ? "google.sessions" : "google_seo.clicks");
            const integrationValue = isGoogleAnalytics
              ? "google-analytics"
              : "google-search-console";

            const allowed = isGoogleAnalytics
              ? gaLabelMap[metricKey]
              : gscLabelMap[metricKey];
            if (!allowed) return null;

            return {
              metricKey,
              integration: integrationValue,
              accountId: row.accountId || accountId,
              displayName: isGoogleAnalytics
                ? gaLabelMap[metricKey] || metricKey
                : gscLabelMap[metricKey] || metricKey,
              category: "metric",
              // For GA/GSC, do NOT include dimension filters to avoid duplicates
              filters: undefined,
              value: row.value,
            };
          })
          .filter(Boolean)
          // Deduplicate GA metrics by metricKey to avoid dimension variants
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
        // Fallback 1: flatten all account metrics for this integration
        metricsForAccount = Object.values(metricsByAccount).flat();
      }

      // Fallback 2: If still empty, use CURATED_DEFAULTS for this platform
      // This handles cases where the API returns no metrics (e.g. Meta Ads/Business in some clients)
      // but we want to allow the user to select them anyway.
      if (!metricsForAccount.length) {
        const defaults = CURATED_DEFAULTS[platform] ||
          CURATED_DEFAULTS[normalizedPlatform] ||
          (aliasPlatform ? CURATED_DEFAULTS[aliasPlatform] : undefined);

        if (defaults) {
          // console.log('⚠️ Sidebar: Using CURATED_DEFAULTS fallback for', platform);
          metricsForAccount = defaults.map(metricKey => {
            // Generate a friendly name like "Meta Instagram Followers"
            const parts = metricKey.split('.');
            const name = parts[parts.length - 1]
              .replace(/([A-Z])/g, ' $1')
              .replace(/[._-]/g, ' ')
              .trim();
            const displayName = name.charAt(0).toUpperCase() + name.slice(1);

            return {
              metricKey,
              integration: platform,
              accountId: accountId,
              displayName: displayName,
              category: "General",
              value: 0
            };
          });
        }
      }

      // INJECT SYNTHETIC METRICS (e.g. Recent Posts Table)
      // These are frontend-only widgets that don't come from the backend metrics API.
      // We explicitly add them so they are selectable.
      if (normalizedPlatform === 'meta-facebook' || normalizedPlatform === 'meta-business' || normalizedPlatform === 'meta') {
        const recentPostsKey = 'meta.facebook.recent_posts';
        const recentMediaKey = 'meta.instagram.recent_media';

        // Check if already present to avoid duplicates
        const hasRecentPosts = metricsForAccount.some(m => m.metricKey === recentPostsKey);
        const hasRecentMedia = metricsForAccount.some(m => m.metricKey === recentMediaKey);

        if (!hasRecentPosts) {
          metricsForAccount.unshift({
            metricKey: recentPostsKey,
            integration: platform, // Use current platform context
            accountId: accountId,
            displayName: "Facebook - Recent Posts",
            category: "Posts",
            value: 0
          });
        }

        if (!hasRecentMedia) {
          metricsForAccount.unshift({
            metricKey: recentMediaKey,
            integration: platform, // Use current platform context
            accountId: accountId,
            displayName: "Instagram - Recent Media",
            category: "Media",
            value: 0
          });
        }
      }

      // Enforce distinct naming for Meta Business metrics (Facebook vs Instagram)
      if (platform === "meta-business" || normalizedPlatform === "meta-business") {
        metricsForAccount = metricsForAccount.map(metric => {
          // If already prefixed, leave it
          if (metric.displayName?.startsWith("Facebook - ") || metric.displayName?.startsWith("Instagram - ")) {
            return metric;
          }

          const isFacebook = metric.metricKey.includes("facebook") || metric.metricKey.startsWith("meta.page.");
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

      // Restrict GA/GSC metrics to curated sets
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

      // Deduplicate by metricKey after filtering (avoids dimension-based repeats)
      const seenKeys = new Set<string>();
      metricsForAccount = metricsForAccount.filter((m) => {
        if (seenKeys.has(m.metricKey)) return false;
        seenKeys.add(m.metricKey);
        return true;
      });

      const search = metricsSearch.trim().toLowerCase();
      const filteredMetrics = metricsForAccount.filter((metric) => {
        if (!search) return true;
        return (
          metric.displayName.toLowerCase().includes(search) ||
          metric.category.toLowerCase().includes(search) ||
          metric.metricKey.toLowerCase().includes(search)
        );
      });

      // Filter based on supported visualization types
      const viewableMetrics = filteredMetrics.filter(metric => {
        const isListMetric = metric.metricKey === 'meta.facebook.recent_posts' || metric.metricKey === 'meta.instagram.recent_media' || metric.metricKey === 'meta.ads.campaign_performance';

        if (selectedMetricWidgetType === 'table') {
          // Table mode: ONLY show list metrics (Recent Posts/Media)
          // User request: "table should work for only data that is can be showen in table"
          return isListMetric;
        } else {
          // Chart/Metric modes: Hide list metrics (they can't be scalars)
          return !isListMetric;
        }
      });
      const metricTypeOptions: Array<{ type: ReportWidgetType; label: string }> =
        [
          { type: "metric", label: "#" },
          { type: "line_chart", label: "↗" },
          { type: "bar_chart", label: "▮▮" },
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
                ←
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
                🔍
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
    integrationsData,
    groupedMetrics,
    isLoadingAvailableMetrics,
    availableMetricsError,
    selectedIntegrationForMetrics,
    integrationSearch,
    metricsSearch,
    selectedMetricWidgetType,
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

  const handleScrollToSlide = (slideId: number) => {
    const el = slidesRef.current[slideId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Manually set active index immediately for better UX
      setActiveSlideId(slideId);
    }
  };

  // Keep skeleton visible until widgets are fully populated with data.
  // Covers the full waterfall: template → integrations → available metrics → auto-defaults → data fetch
  const hasPopulatedLayouts = useMemo(() => {
    let total = 0;
    dashboards.forEach(layout => { total += layout.length; });
    return total > 0;
  }, [dashboards]);

  // Waiting for auto-default widgets to populate empty slides
  // (needs available metrics to finish loading first)
  const isWaitingForAutoDefaults =
    isDashboardsInitialized &&
    templateId != null &&
    !readOnly &&
    !hasPopulatedLayouts &&
    isLoadingAvailableMetrics;

  // With per-widget lazy loading, individual widgets manage their own loading state.
  // We only show a full-page skeleton during template/integration loading, not data loading.
  const isInitialDataLoading = false;

  const showFullPageSkeleton = isTemplateLoading || !isDashboardsInitialized || isWaitingForAutoDefaults || isInitialDataLoading;


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
            <Button onClick={handleConfirmNewReport} isLoading={isCreatingTemplate} disabled={isLoadingAvailableMetrics}>Create Report</Button>
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
                    onAddPage={addCustomPage}
                    onDeletePage={handleDeletePage}
                    onRenamePage={handleRenamePage}
                    onReorderPages={handleReorderPages}
                    onAddIntegrationPage={handleAddIntegrationPage}
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
                      console.log('👻 [SidebarDebug] rawBase:', rawBase.map(s => ({ id: s.id, source: s.source, title: s.title, integrationIndex: s.integrationIndex })));
                      console.log('👻 [SidebarDebug] Integrations Count:', integrationsData?.integrations?.length);
                      console.log('👻 [SidebarDebug] PageOrder:', pageOrder);
                      console.log('👻 [SidebarDebug] Dashboards Keys:', Array.from(dashboards.keys()));

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
                            console.log(`👻 [Sidebar] Filtering out ghost slide ID ${sId} (Out of bounds)`);
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
                        .filter((p) => !existingIds.has(Number(p.id)))
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
                          if (!existingIds.has(numId) && !customPages.find(p => Number(p.id) === numId)) {
                            // Integration slides have IDs that match their index in integrations array
                            // (unless they were remapped, but for new/re-added pages they match)
                            const integration = integrationsData.integrations[numId];
                            if (integration) {
                              integrationExtras.push({
                                id: numId,
                                title: "", // Sidebar logic will fallback to integration name
                                subtitle: "",
                                source: "integration",
                                integrationIndex: numId
                              });
                            }
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

                        // SELF-HEALING: If ID < 1000, Force "source=integration".
                        // This fixes the visual display immediately even if the backend still says "custom".
                        if (Number(updated.id) < 1000) {
                          updated.source = "integration";
                        }

                        // Ensure integration index for integration source
                        if (updated.source === "integration" && updated.integrationIndex === undefined) {
                          updated.integrationIndex = Number(updated.id);
                        }

                        // Hydrate title if empty & we have integration data
                        if (updated.source === "integration") {
                          const idx = typeof updated.integrationIndex === 'number' ? updated.integrationIndex : Number(updated.id);
                          const integration = integrationsData?.integrations?.[idx];

                          if (integration && (!updated.title || updated.title === "" || updated.title.startsWith("Untitled"))) {
                            const platformConfig = getPlatformConfig(integration.platform);
                            updated.title = platformConfig?.name || integration.platform || "Integration";
                            if (!updated.subtitle) updated.subtitle = integration.accountName;
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
                effectivePageOrder.map((id) => {
                  const layout = dashboards.get(id);
                  if (!layout) return null;

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
                  const slideMeta = templateQuery.data?.slidesMeta?.find(
                    (s: any) => s.id === id
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
                    // Use slideIntegrationMap which correctly maps slideId to integration
                    const integration = slideIntegrationMap.get(id);

                    if (integration) {
                      const platformConfig = getPlatformConfig(integration.platform);
                      slideTitle = platformConfig?.name || integration.platform;
                      slideSubtitle = integration.accountName;
                    } else {
                      slideTitle = "Untitled page";
                    }
                  }

                  // Combine title and subtitle for display
                  // 🧼 Professional Cleanup: avoid redundant titles (e.g. Meta Business - Meta Business Account)
                  let displayTitle = slideTitle;
                  if (slideSubtitle && slideSubtitle !== slideTitle && !slideSubtitle.includes(slideTitle)) {
                    displayTitle = `${slideTitle} - ${slideSubtitle}`;
                  } else if (slideSubtitle && !slideTitle) {
                    displayTitle = slideSubtitle;
                  }

                  // 🧼 Professional Cleanup (Self-Healing UI)
                  if (!displayTitle || displayTitle === "Report Page" || displayTitle === "Page" || displayTitle.includes("Untitled")) {
                    const reportName = (templateQuery.data as any)?.templateName || (templateQuery.data as any)?.name || "Report";
                    displayTitle = `${reportName} Overview`;
                  }

                  displayTitle = prettifyMetricLabel(displayTitle);

                  return (
                    <SlideContainer
                      key={id}
                      id={`slide-${id}`}
                      slideId={id}
                      registerSlide={registerSlide}
                      title={displayTitle}
                      dateRange={formatDateRange()}
                      containerRef={(el) => {
                        slidesRef.current[id] = el; // Use slide ID instead of loop index
                      }}
                    >
                      {layout.length === 0 ? (
                        isTemplateLoading ? (
                          <div className="relative w-full min-h-[500px] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                              <Skeleton className="h-16 w-16 rounded-full" />
                              <Skeleton className="h-6 w-48" />
                              <Skeleton className="h-4 w-64" />
                            </div>
                          </div>
                        ) : (
                          /* Empty State - Still accepts drops */
                          <div className="relative w-full min-h-[500px]">
                            <AutoWidthGrid
                              className="layout w-full h-full"
                              layout={[]}
                              cols={currentGridConfig.cols}
                              rowHeight={currentGridConfig.rowHeight}
                              autoSize={false}
                              margin={currentGridConfig.margin}
                              containerPadding={isTablet ? [8, 8] : [14, 14]}
                              isDroppable={!readOnly}
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
                          className="layout w-full"
                          layout={layout}
                          cols={currentGridConfig.cols}
                          rowHeight={currentGridConfig.rowHeight}
                          autoSize={true}
                          margin={currentGridConfig.margin}
                          containerPadding={isTablet ? [8, 8] : [14, 14]}
                          isDroppable={!readOnly && !isMobile}
                          isDraggable={!readOnly && !isMobile}
                          isResizable={!readOnly && !isMobile}
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
                                  isSlideVisible={isSlideVisible(id)}
                                  demographicDataMap={demographicDataMap}
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
                                        readOnly={readOnly}
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
                })
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
                        onAddPage={addCustomPage}
                        onDeletePage={handleDeletePage}
                        onRenamePage={handleRenamePage}
                        onReorderPages={handleReorderPages}
                        onAddIntegrationPage={handleAddIntegrationPage}
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
                          const extras = customPages.filter((p) => !existingIds.has(Number(p.id))).map((p) => ({
                            id: p.id, title: p.name, subtitle: p.subtitle, source: "custom" as const,
                          }));

                          const integrationExtras: ReportSlideMeta[] = [];

                          if (integrationsData?.integrations) {
                            Array.from(dashboards.keys()).forEach(slideId => {
                              const numId = Number(slideId);
                              if (!existingIds.has(numId) && !customPages.find(p => Number(p.id) === numId)) {
                                const integrationInfo = slideIntegrationMap.get(numId);
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
                            if (Number(updated.id) < 1000) updated.source = "integration";
                            if (updated.source === "integration" && updated.integrationIndex === undefined) updated.integrationIndex = Number(updated.id);

                            if (updated.source === "integration") {
                              // Use slideID to lookup integration (Multi-Slide Support)
                              const integrationInfo = slideIntegrationMap.get(Number(updated.id));

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

  if (parsedClientId && overallProgress.isSyncing && !props.readOnly) {
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
