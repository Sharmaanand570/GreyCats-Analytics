import { Button } from "./ui/button";
import { ChartLineMultiple } from "./ChartLineMultiple";
import { Link, useNavigate } from "react-router-dom";
import { DateRangePicker } from "./DateRangePicker";
import { type DateRange } from "react-day-picker";
import { useMemo, useState, useEffect, useCallback } from "react";
// Icons
import { FiSearch, FiBell } from "react-icons/fi";
import { LayoutGrid, Building2, Activity } from "lucide-react";
// Components
import { MetricCard } from "./dashboard/MetricCard";
import { getBrandColor } from "@/lib/brandColors";
import { getPlatformConfig } from "@/utils/platformMapping"; // Import platform mapping
import { useQuery } from "@tanstack/react-query";
import {
  listDashboards,
  fetchUnifiedMetric,
  fetchGoogleAdsSummary,
  fetchGoogleAdsCampaignPerformance,
  fetchMetaAdsCampaignPerformance,
  fetchMetaStoredPosts,
  fetchInstagramStoredMedia,
  fetchUnifiedAggregate,
} from "@/features/reports/api/reportingApi";
import type {
  ApiError,
  Dashboard as DashboardModel,
  DashboardWidget,
  ResolvedWidgetData,
} from "@/features/reports/api/types";
import { toast } from "sonner";
import { subDays, format } from "date-fns";
import { useAvailableMetrics } from "@/features/reports/hooks/useAvailableMetrics";
import { getMetricAggregation } from '@/utils/facebookMetrics';
import { useClients } from "@/hooks/useClients";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import {
  getMetaDemographics,
  getGoogleAnalyticsTable,
  getMetricData,
} from "@/services/unifiedMetrics.api";
import {
  getGoogleConsoleTopPages,
  getGoogleConsoleTopQueries,
} from "@/features/YouTube/API/googleConsoleapi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

/* DEFAULT_DASHBOARD_WIDGETS and helper functions removed */



const nameCorrection = (name: string): string => {

  if (name === "google-search-console") return "Google Search Console"

  if (name === "meta_ads") return "Meta Ads"

  if (name === "meta_facebook") return "Facebook"

  if (name === "meta_instagram") return "Instagram"

  if (name === "woo") return "Woo Commerce"

  if (name === "shopify") return "Shopify"

  if (name === "google_analytics") return "Google Analytics"

  return name
}

const getDisplayIntegration = (integration: string, metricKey?: string): string => {
  const normalized = (integration || "").toLowerCase().replace(/_/g, "-");
  if (normalized === "meta-business" || normalized === "meta") {
    const key = (metricKey || "").toLowerCase();
    if (key.startsWith("meta.instagram")) return "meta-instagram";
    if (key.startsWith("meta.facebook") || key.startsWith("meta.page"))
      return "meta-facebook";
    if (key.startsWith("meta.ads")) return "meta-ads";
  }
  return normalized;
};


const formatApiDate = (value: Date) => format(value, "yyyy-MM-dd");

const isCurrencyMetric = (metricKey?: string) => {
  if (!metricKey) return false;
  return metricKey.includes(".cpc") || metricKey.includes(".cost") || metricKey.includes(".spend") || metricKey.endsWith(".avgOrderValue") || metricKey.endsWith(".revenue");
};

const formatNumber = (value?: number, metricKey?: string) => {
  if (value === undefined || Number.isNaN(value)) return "--";
  if (isCurrencyMetric(metricKey)) {
    const prefix = "₹";
    const formatted = value % 1 !== 0
      ? value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : value.toLocaleString("en-IN");
    return `${prefix}${formatted}`;
  }
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

const TABLE_INTERNAL_KEYS = new Set([
  "id",
  "metricKey",
  "integration",
  "accountId",
  "dimensionType",
  "dimensionValue",
  "date",
  "recordedAt",
  "userId",
  "clientId",
]);

const formatColumnLabel = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim();

const buildTableColumns = (
  rows: Array<Record<string, any>>,
  columns?: Array<{ name?: string; dataKey?: string }>
) => {
  if (columns?.length) {
    return columns
      .map((col) => ({
        key: col.dataKey || col.name || "",
        label: col.name || col.dataKey || "",
      }))
      .filter((col) => col.key);
  }

  const firstRow = rows[0];
  if (!firstRow) return [];

  const keys = Object.keys(firstRow).filter((key) => !TABLE_INTERNAL_KEYS.has(key));
  if (firstRow.dimensionValue && !keys.includes("dimensionValue")) {
    keys.unshift("dimensionValue");
  }
  if (firstRow.value != null && !keys.includes("value")) {
    keys.push("value");
  }

  return keys.map((key) => ({ key, label: formatColumnLabel(key) || key }));
};

const buildSeriesFromRows = (
  rows: Array<Record<string, any>>,
  isRateMetric: boolean
) => {
  const seriesMap = new Map<string, { sum: number; count: number }>();
  rows.forEach((row) => {
    const dateKey = row.date || row.dimensionValue || "";
    if (!dateKey) return;
    const current = seriesMap.get(dateKey) || { sum: 0, count: 0 };
    seriesMap.set(dateKey, {
      sum: current.sum + (Number(row.value) || 0),
      count: current.count + 1,
    });
  });

  return Array.from(seriesMap.entries())
    .map(([x, { sum, count }]) => ({
      x,
      y: isRateMetric ? sum / count : sum,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.x).getTime();
      const dateB = new Date(b.x).getTime();
      if (!Number.isNaN(dateA) && !Number.isNaN(dateB)) {
        return dateA - dateB;
      }
      return 0;
    });
};

const DASHBOARD_GA_DIMENSIONAL_TABLES: Record<
  string,
  {
    dimensionType: string;
    metricKeys: string[];
    columns: { name: string; width?: string; dataKey: string }[];
  }
> = {
  "google.channel_traffic": {
    dimensionType: "channel",
    metricKeys: [
      "google.sessions",
      "google.engagedSessions",
      "google.engagementRate",
      "google.avgSessionDuration",
      "google.eventCount",
    ],
    columns: [
      { name: "Channel", width: "20%", dataKey: "dimensionValue" },
      { name: "Sessions", width: "13%", dataKey: "sessions" },
      { name: "Engaged Sessions", width: "13%", dataKey: "engagedSessions" },
      { name: "Engagement Rate", width: "13%", dataKey: "engagementRate" },
      { name: "Avg. Session Duration", width: "13%", dataKey: "avgSessionDuration" },
      { name: "Event Count", width: "13%", dataKey: "eventCount" },
    ],
  },
  "google.browser_used": {
    dimensionType: "browser",
    metricKeys: [
      "google.activeUsers",
      "google.newUsers",
      "google.engagedSessions",
      "google.engagementRate",
      "google.eventCount",
    ],
    columns: [
      { name: "Browser", width: "30%", dataKey: "dimensionValue" },
      { name: "Active Users", width: "17%", dataKey: "activeUsers" },
      { name: "New Users", width: "17%", dataKey: "newUsers" },
      { name: "Engaged Sessions", width: "18%", dataKey: "engagedSessions" },
      { name: "Event Count", width: "18%", dataKey: "eventCount" },
    ],
  },
  "google.device_category": {
    dimensionType: "device",
    metricKeys: [
      "google.activeUsers",
      "google.newUsers",
      "google.engagedSessions",
      "google.engagementRate",
      "google.eventCount",
    ],
    columns: [
      { name: "Device", width: "30%", dataKey: "dimensionValue" },
      { name: "Active Users", width: "17%", dataKey: "activeUsers" },
      { name: "New Users", width: "17%", dataKey: "newUsers" },
      { name: "Engaged Sessions", width: "18%", dataKey: "engagedSessions" },
      { name: "Event Count", width: "18%", dataKey: "eventCount" },
    ],
  },
  "google.geo_country": {
    dimensionType: "country",
    metricKeys: [
      "google.activeUsers",
      "google.newUsers",
      "google.engagedSessions",
      "google.engagementRate",
      "google.eventCount",
    ],
    columns: [
      { name: "Country", width: "30%", dataKey: "dimensionValue" },
      { name: "Active Users", width: "17%", dataKey: "activeUsers" },
      { name: "New Users", width: "17%", dataKey: "newUsers" },
      { name: "Engaged Sessions", width: "18%", dataKey: "engagedSessions" },
      { name: "Event Count", width: "18%", dataKey: "eventCount" },
    ],
  },
  "google.geo_city": {
    dimensionType: "city",
    metricKeys: [
      "google.activeUsers",
      "google.newUsers",
      "google.engagedSessions",
      "google.engagementRate",
      "google.eventCount",
    ],
    columns: [
      { name: "City", width: "30%", dataKey: "dimensionValue" },
      { name: "Active Users", width: "17%", dataKey: "activeUsers" },
      { name: "New Users", width: "17%", dataKey: "newUsers" },
      { name: "Engaged Sessions", width: "18%", dataKey: "engagedSessions" },
      { name: "Event Count", width: "18%", dataKey: "eventCount" },
    ],
  },
  "google.top_pages": {
    dimensionType: "page",
    metricKeys: [
      "google.sessions",
      "google.activeUsers",
      "google.avgSessionDuration",
      "google.eventCount",
    ],
    columns: [
      { name: "Page Path", width: "30%", dataKey: "dimensionValue" },
      { name: "Sessions", width: "14%", dataKey: "sessions" },
      { name: "Active Users", width: "14%", dataKey: "activeUsers" },
      { name: "Avg. Session Duration", width: "21%", dataKey: "avgSessionDuration" },
      { name: "Event Count", width: "21%", dataKey: "eventCount" },
    ],
  },
  "google_seo.top_pages": {
    dimensionType: "page",
    metricKeys: [
      "google_seo.clicks",
      "google_seo.impressions",
      "google_seo.ctr",
      "google_seo.position",
    ],
    columns: [
      { name: "Page", width: "50%", dataKey: "dimensionValue" },
      { name: "Clicks", width: "15%", dataKey: "clicks" },
      { name: "Impressions", width: "15%", dataKey: "impressions" },
      { name: "CTR", width: "10%", dataKey: "ctr" },
      { name: "Position", width: "10%", dataKey: "position" },
    ],
  },
  "google_seo.top_queries": {
    dimensionType: "query",
    metricKeys: [
      "google_seo.clicks",
      "google_seo.impressions",
      "google_seo.ctr",
      "google_seo.position",
    ],
    columns: [
      { name: "Query", width: "50%", dataKey: "dimensionValue" },
      { name: "Clicks", width: "15%", dataKey: "clicks" },
      { name: "Impressions", width: "15%", dataKey: "impressions" },
      { name: "CTR", width: "10%", dataKey: "ctr" },
      { name: "Position", width: "10%", dataKey: "position" },
    ],
  },
};

const DASHBOARD_SPECIAL_METRIC_KEYS = new Set([
  "meta.facebook.recent_posts",
  "meta.instagram.recent_media",
  "meta.ads.campaign_performance",
  "google_ads.campaign_performance",
  "google_seo.clicks",
  "google_seo.impressions",
  "google_seo.ctr",
  "google_seo.position",
  "google_seo.top_pages",
  "google_seo.top_queries",
  "google.channel_traffic",
  "google.browser_used",
  "google.device_category",
  "google.geo_country",
  "google.geo_city",
  "google.top_pages",
]);

const isDashboardRateMetric = (metricKey?: string) => {
  const key = (metricKey || "").toLowerCase();
  return (
    key.includes("cpc") ||
    key.includes("ctr") ||
    key.includes("cpm") ||
    key.includes("bouncerate") ||
    key.includes("average") ||
    key.includes("avg") ||
    key.includes("rate") ||
    key.includes("duration") ||
    key.includes("perview")
  );
};

const isDashboardSpecialWidget = (widget: DashboardWidget) => {
  const metricKey = widget.metricKey || "";
  if (DASHBOARD_SPECIAL_METRIC_KEYS.has(metricKey)) return true;

  const normalizedIntegration = (widget.integration || "")
    .toLowerCase()
    .replace(/_/g, "-");

  if (metricKey.startsWith("meta.instagram.followers.")) {
    return true;
  }

  if (metricKey.startsWith("google.") || metricKey.startsWith("ga4.")) {
    return true;
  }

  if (normalizedIntegration === "meta-ads" || normalizedIntegration === "meta_ads") {
    return true;
  }

  if (
    (normalizedIntegration === "meta-ads" || normalizedIntegration === "meta_ads") &&
    (metricKey === "meta.ads.cpc" || metricKey === "meta.ads.ctr")
  ) {
    return true;
  }

  if (
    (normalizedIntegration === "google-ads" || normalizedIntegration === "google_ads") &&
    isDashboardRateMetric(metricKey)
  ) {
    return true;
  }

  return false;
};

const parseMetaDemographicMetric = (metricKey: string) => {
  const prefix = "meta.instagram.followers.";
  if (!metricKey.startsWith(prefix)) return null;
  const suffix = metricKey.slice(prefix.length);

  const parse = (type: "age" | "gender" | "country" | "city", value?: string) => ({
    type,
    value: value || "",
  });

  if (suffix.startsWith("age.")) return parse("age", suffix.slice(4));
  if (suffix.startsWith("gender.")) return parse("gender", suffix.slice(7));
  if (suffix.startsWith("country.")) return parse("country", suffix.slice(8));
  if (suffix.startsWith("city.")) return parse("city", suffix.slice(5));
  if (suffix === "age") return parse("age");
  if (suffix === "gender") return parse("gender");
  if (suffix === "country") return parse("country");
  if (suffix === "city") return parse("city");
  return null;
};

// Helper to determine status based on integrations (Simulated logic for demo)
const getClientHealth = (client: any) => {
  const totalIntegrations =
    (client._count?.metaBusinessAccounts || 0) +
    (client._count?.metaAdsAccounts || 0) +
    (client._count?.metaInsightsAccounts || 0) +
    (client._count?.youtubeAccounts || 0) +
    (client._count?.shopifyAccounts || 0) +
    (client._count?.woocommerceAccounts || 0) +
    (client._count?.googleSearchConsoleAccounts || 0) +
    (client._count?.googleAnalyticsAccounts || 0);

  if (totalIntegrations > 3) return 'healthy';
  if (totalIntegrations > 0) return 'warning';
  return 'critical'; // No integrations
};


interface DashboardProps {
  clientId?: number;
  onConnectIntegration?: () => void;
  withLayout?: boolean;
  hideHeader?: boolean;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

export const getDefaultDateRange = () => ({
  from: subDays(new Date(), 6),
  to: new Date(),
});

function Dashboard({
  clientId,
  withLayout = true,
  hideHeader = false,
  dateRange: externalDateRange,
  onDateRangeChange
}: DashboardProps) {
  // Restore saved date range from localStorage (survives refresh)
  const [internalDateRange, setInternalDateRange] = useState<DateRange>(() => {
    if (clientId) {
      try {
        const saved = localStorage.getItem(`dashboard-daterange-${clientId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          const from = new Date(parsed.from);
          const to = new Date(parsed.to);
          if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
            return { from, to };
          }
        }
      } catch { /* ignore corrupt data */ }
    }
    return getDefaultDateRange();
  });
  const navigate = useNavigate();

  const dateRange = externalDateRange || internalDateRange;
  const setDateRange = onDateRangeChange || setInternalDateRange;

  // Fetch clients only if no clientId is provided
  const { data: clients, isLoading: isLoadingClients, isError: isClientsError, refetch: refetchClients } = useClients();

  const { groupedMetrics } = useAvailableMetrics(clientId ?? null);



  const dashboardsQuery = useQuery<DashboardModel[], ApiError>({
    queryKey: ["dashboards", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const response = await listDashboards(clientId);
      return response.dashboards;
    },
    enabled: !!clientId,
  });

  useEffect(() => {
    if (dashboardsQuery.error) {
      toast.error(
        dashboardsQuery.error.message || "Failed to load dashboards"
      );
    }
  }, [dashboardsQuery.error]);

  const dashboards = dashboardsQuery.data ?? [];
  const activeDashboard = dashboards[0];

  // Save date range to localStorage + backend whenever user changes it
  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    if (range) setDateRange(range);
    if (range?.from && range?.to && clientId) {
      const payload = { from: formatApiDate(range.from), to: formatApiDate(range.to) };
      localStorage.setItem(`dashboard-daterange-${clientId}`, JSON.stringify(payload));
    }
  }, [setDateRange, clientId]);

  const dashboardWidgets = useMemo<DashboardWidget[]>(() => {


    // If user has a saved dashboard, use it
    if (activeDashboard?.widgets) {
      const entries = Object.entries(
        activeDashboard.widgets
      ) as [string, DashboardWidget][];
      console.log('🔍 [Dashboard] Found widgets in activeDashboard:', entries.length);
      if (entries.length > 0) {
        const widgets = entries
          .map(([id, widget]) => ({
            ...widget,
            id,
          }))
          .sort((a, b) => (a.layout?.y ?? 0) - (b.layout?.y ?? 0));
        console.log('🔍 [Dashboard] Mapped widgets:', widgets);
        return widgets;
      }
    }

    // Default to empty (User must explicitly add widgets via Edit Dashboard)
    return [];
  }, [activeDashboard, groupedMetrics]);

  // Create widget signature and date range key for query caching
  const widgetSignature = useMemo(() => {
    return dashboardWidgets
      .map((w) =>
        [w.id, w.metricKey, w.type, w.groupBy, w.accountId].join(":")
      )
      .join("|");
  }, [dashboardWidgets]);

  const dateRangeKey = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return "none";
    return `${formatApiDate(dateRange.from)}_${formatApiDate(dateRange.to)}`;
  }, [dateRange]);

  // Fetch widget data using the batch resolver with a fallback for special widgets
  const widgetDataQuery = useQuery<Record<string, ResolvedWidgetData>>({
    queryKey: ["dashboard-widget-data", clientId, widgetSignature, dateRangeKey],
    enabled: !!clientId && dashboardWidgets.length > 0 && !!dateRange?.from && !!dateRange?.to,
    queryFn: async () => {
      if (!clientId || !dateRange?.from || !dateRange?.to) {
        return {};
      }

      const dateFrom = formatApiDate(dateRange.from);
      const dateTo = formatApiDate(dateRange.to);

      // Filter widgets that have metricKey
      const widgetsWithMetrics = dashboardWidgets.filter(w => w.metricKey);

      if (!widgetsWithMetrics.length) {
        return {};
      }

      const specialWidgets = widgetsWithMetrics.filter(isDashboardSpecialWidget);
      const batchWidgets = widgetsWithMetrics.filter((widget) => !isDashboardSpecialWidget(widget));

        const fetchSpecialWidgetData = async (widget: DashboardWidget) => {
          try {
          // Normalize integration key to match backend schema
          let normalizedIntegration = widget.integration?.toLowerCase() || "";

          // Only replace underscores with hyphens for non-Meta integrations
          if (!normalizedIntegration.startsWith("meta_")) {
            normalizedIntegration = normalizedIntegration.replace(/_/g, '-');
          }

          if (normalizedIntegration === "google") {
            normalizedIntegration = "google-analytics";
          } else if (normalizedIntegration === "woocommerce") {
            normalizedIntegration = "woo";
          } else if (normalizedIntegration === "meta-business" || normalizedIntegration === "meta_business") {
            const metricKey = widget.metricKey?.toLowerCase() || "";
            if (metricKey.includes("facebook") || metricKey.startsWith("meta.page") || metricKey.startsWith("meta.facebook")) {
              normalizedIntegration = "meta-facebook";
            } else if (metricKey.includes("instagram") || metricKey.startsWith("meta.instagram")) {
              normalizedIntegration = "meta-instagram";
            } else if (metricKey.includes("ads") || metricKey.startsWith("meta.ads")) {
              normalizedIntegration = "meta_ads";
            }
          }

          // Validate integration key (accept both underscore and hyphen variants for Meta integrations)
          const validIntegrations = [
            'google-analytics',
            'google-search-console',
            'google-console',
            'meta',
            'meta-business',
            'meta_business',
            'meta-facebook',
            'meta-instagram',
            'meta-ads',
            'meta_ads',      // Accept underscore variant for Meta Ads
            'meta_facebook', // Accept underscore variant for Meta Facebook
            'meta_instagram', // Accept underscore variant for Meta Instagram
            'youtube', 'shopify', 'woo'
          ];

          if (!validIntegrations.includes(normalizedIntegration)) {
            console.warn(`⚠️ Invalid integration key: ${normalizedIntegration} (original: ${widget.integration})`);
            return { id: widget.id, widget, data: null };
          }

          // Validate metric key format (should have platform prefix)
          const hasValidPrefix =
            widget.metricKey?.startsWith('google.') ||
            widget.metricKey?.startsWith('google_ads.') || // ✅ Added Google Ads
            widget.metricKey?.startsWith('google_seo.') ||
            widget.metricKey?.startsWith('google-console.') ||
            widget.metricKey?.startsWith('meta.') ||
            widget.metricKey?.startsWith('youtube.') ||
            widget.metricKey?.startsWith('shopify.') ||
            widget.metricKey?.startsWith('woo.');

          if (!hasValidPrefix) {
            console.warn(`⚠️ Invalid metric key format: ${widget.metricKey} (missing platform prefix)`);
            return { id: widget.id, widget, data: null };
          }

          // Handle 90-day limit for Meta integrations (Organic Social only)
          let effectiveDateFrom = dateFrom;
          // Exclude 'meta-ads' and 'meta_ads' from this limit as ads data is often needed for longer periods
          const isMetaLimitIntegration =
            (['meta_facebook', 'meta_instagram'].includes(normalizedIntegration) ||
              (normalizedIntegration.startsWith('meta-') && !normalizedIntegration.includes('ads'))) &&
            normalizedIntegration !== 'meta_ads'; // Explicitly check underscore variant

          if (isMetaLimitIntegration) {
            const ninetyDaysAgo = subDays(new Date(), 90);
            const selectedDateFrom = new Date(dateFrom); // Assuming dateFrom is YYYY-MM-DD string
            if (selectedDateFrom < ninetyDaysAgo) {
              effectiveDateFrom = formatApiDate(ninetyDaysAgo);

            }
          }

          // For Meta Ads and Google Ads, do NOT send accountId to backend for rate metrics
          // unless it's a direct fetch. But actually, normalized filtering in frontend is safer for some types.
          const isRateMetric =
            widget.metricKey?.toLowerCase().includes("cpc") ||
            widget.metricKey?.toLowerCase().includes("ctr") ||
            widget.metricKey?.toLowerCase().includes("roas");

          const shouldIncludeAccountId = !['meta-facebook', 'meta-instagram', 'meta-ads', 'meta_ads', 'google_ads', 'google-ads'].includes(normalizedIntegration) || !isRateMetric;

            const params: Record<string, string> = {
              integration: normalizedIntegration,
              metricKey: widget.metricKey!,
              startDate: effectiveDateFrom,
              endDate: dateTo,
              ...(shouldIncludeAccountId && widget.accountId ? { accountId: widget.accountId } : {}),
            };

            const gaDimTable = widget.metricKey
              ? DASHBOARD_GA_DIMENSIONAL_TABLES[widget.metricKey]
              : undefined;
            if (gaDimTable && clientId) {
              const isGscTable = widget.metricKey?.startsWith("google_seo.");
              if (isGscTable) {
                const fetchFn =
                  widget.metricKey === "google_seo.top_pages"
                    ? getGoogleConsoleTopPages
                    : getGoogleConsoleTopQueries;
                const gscResp = await fetchFn(clientId, {
                  startDate: effectiveDateFrom,
                  endDate: dateTo,
                });
                const rawRows =
                  (gscResp as any).topPages || (gscResp as any).topQueries || [];
                const rows = rawRows.map((row: any, idx: number) => ({
                  id: idx,
                  metricKey: widget.metricKey!,
                  integration: normalizedIntegration,
                  accountId: widget.accountId || "",
                  dimensionValue: row.page || row.query || "(not set)",
                  clicks: Number(row.clicks ?? 0),
                  impressions: Number(row.impressions ?? 0),
                  ctr: Number(row.ctr ?? 0),
                  position: Number(row.position ?? 0),
                  value: Number(row.clicks ?? row.impressions ?? 0),
                }));

                return {
                  id: widget.id,
                  widget,
                  data: {
                    success: true,
                    rows,
                    columns: gaDimTable.columns,
                    pagination: {
                      page: 1,
                      limit: rows.length,
                      total: rows.length,
                      totalPages: 1,
                    },
                  },
                };
              }

              const gaTable = await getGoogleAnalyticsTable({
                dimensionType: gaDimTable.dimensionType,
                metricKeys: gaDimTable.metricKeys,
                dateFrom: effectiveDateFrom,
                dateTo,
                clientId,
              });
              const mappedRows = (gaTable.rows || []).map((row: any, idx: number) => {
                const dimensionValue = row.dimension || row.dimensionValue || "(not set)";
                const sessions = Number(row["google.sessions"] ?? row.sessions ?? 0);
                const activeUsers = Number(row["google.activeUsers"] ?? row.activeUsers ?? 0);
                const newUsers = Number(row["google.newUsers"] ?? row.newUsers ?? 0);
                const engagedSessions = Number(
                  row["google.engagedSessions"] ?? row.engagedSessions ?? 0
                );
                const engagementRate = Number(
                  row["google.engagementRate"] ?? row.engagementRate ?? 0
                );
                const avgSessionDuration = Number(
                  row["google.avgSessionDuration"] ?? row.avgSessionDuration ?? 0
                );
                const eventCount = Number(row["google.eventCount"] ?? row.eventCount ?? 0);
                const pageViews = Number(row["google.pageViews"] ?? row.pageViews ?? 0);
                const primaryValue = sessions || activeUsers || pageViews;

                return {
                  id: idx,
                  metricKey: widget.metricKey!,
                  integration: "google_analytics",
                  accountId: widget.accountId || "",
                  dimensionValue,
                  sessions,
                  activeUsers,
                  newUsers,
                  engagedSessions,
                  engagementRate: parseFloat((engagementRate * 100).toFixed(2)),
                  avgSessionDuration: parseFloat(avgSessionDuration.toFixed(1)),
                  eventCount,
                  pageViews,
                  value: primaryValue,
                };
              });

              return {
                id: widget.id,
                widget,
                data: {
                  success: true,
                  rows: mappedRows,
                  columns: gaDimTable.columns,
                  pagination: {
                    page: 1,
                    limit: mappedRows.length,
                    total: mappedRows.length,
                    totalPages: 1,
                  },
                },
              };
            }

            const demoMetric = widget.metricKey ? parseMetaDemographicMetric(widget.metricKey) : null;
            if (demoMetric && widget.accountId) {
              const response = await getMetaDemographics(widget.accountId, {
                startDate: effectiveDateFrom,
                endDate: dateTo,
            });
            const payload = response.data ?? response;
            const ageGender: Record<string, number> = (payload as any).ageGender ?? {};
            const fansByCountry: Record<string, number> =
              (payload as any).fansByCountry ?? (payload as any).country ?? {};
            const fansByCity: Record<string, number> =
              (payload as any).fansByCity ?? (payload as any).city ?? {};

            let value = 0;
            if (demoMetric.type === "age") {
              if (demoMetric.value) {
                const suffix = `.${demoMetric.value}`;
                value = Object.entries(ageGender).reduce(
                  (sum, [key, val]) => (key.endsWith(suffix) ? sum + val : sum),
                  0
                );
              } else {
                value = Object.values(ageGender).reduce((sum, val) => sum + val, 0);
              }
            } else if (demoMetric.type === "gender") {
              if (demoMetric.value) {
                const prefix = `${demoMetric.value}.`;
                value = Object.entries(ageGender).reduce(
                  (sum, [key, val]) => (key.startsWith(prefix) ? sum + val : sum),
                  0
                );
              } else {
                value = Object.values(ageGender).reduce((sum, val) => sum + val, 0);
              }
            } else if (demoMetric.type === "country") {
              if (demoMetric.value) {
                value = Number(fansByCountry[demoMetric.value] ?? 0);
              } else {
                value = Object.values(fansByCountry).reduce((sum, val) => sum + val, 0);
              }
            } else if (demoMetric.type === "city") {
              if (demoMetric.value) {
                value = Number(fansByCity[demoMetric.value] ?? 0);
              } else {
                value = Object.values(fansByCity).reduce((sum, val) => sum + val, 0);
              }
            }

            return {
              id: widget.id,
              widget,
              data: {
                rows: [
                  {
                    id: 0,
                    metricKey: widget.metricKey!,
                    integration: widget.integration,
                    accountId: widget.accountId || "",
                    value,
                    date: dateTo,
                  },
                ],
                value,
                total: value,
              },
              };
            }

            if (widget.metricKey === "meta.facebook.recent_posts") {
              const targetAccountId = widget.accountId
                ? String(widget.accountId)
                : "";
              if (targetAccountId) {
                const postsData = await fetchMetaStoredPosts(
                  targetAccountId,
                  25,
                  "createdTime",
                  "desc",
                  effectiveDateFrom,
                  dateTo
                );

                if (postsData?.success && Array.isArray(postsData.posts)) {
                  const rows = postsData.posts.map((post: any) => ({
                    id: post.id,
                    metricKey: widget.metricKey!,
                    integration: normalizedIntegration,
                    accountId: targetAccountId,
                    date: post.createdTime
                      ? new Date(post.createdTime).toLocaleDateString()
                      : "",
                    value: post.likes || 0,
                    post: post.message || "(No caption)",
                    impressions: post.impressions || 0,
                    clicks: post.clicks || 0,
                    likes: post.likes || 0,
                    comments: post.comments || 0,
                    shares: post.shares || 0,
                    reactions: post.reactions || 0,
                    fullPicture: post.fullPicture,
                    permalinkUrl: post.permalinkUrl,
                  }));

                  return {
                    id: widget.id,
                    widget,
                    data: {
                      success: true,
                      rows,
                      pagination: {
                        page: 1,
                        limit: rows.length,
                        total: rows.length,
                        totalPages: 1,
                      },
                      columns: [
                        { name: "Date", width: "15%", dataKey: "date" },
                        { name: "Post", width: "40%", dataKey: "post" },
                        { name: "Impressions", dataKey: "impressions" },
                        { name: "Clicks", dataKey: "clicks" },
                        { name: "Likes", dataKey: "likes" },
                        { name: "Comments", dataKey: "comments" },
                        { name: "Shares", dataKey: "shares" },
                        { name: "Reactions", dataKey: "reactions" },
                      ],
                    },
                  };
                }
              }
            }

            if (widget.metricKey === "meta.instagram.recent_media") {
              const targetAccountId = widget.accountId
                ? String(widget.accountId)
                : "";
              if (targetAccountId) {
                const mediaData = await fetchInstagramStoredMedia(
                  targetAccountId,
                  25,
                  effectiveDateFrom,
                  dateTo
                );

                if (mediaData?.success && Array.isArray(mediaData.media)) {
                  const rows = mediaData.media.map((media: any, idx: number) => ({
                    id: media.id || `media-${idx}`,
                    metricKey: widget.metricKey!,
                    integration: normalizedIntegration,
                    accountId: targetAccountId,
                    date: media.createdTime
                      ? new Date(media.createdTime).toLocaleDateString()
                      : "",
                    value: media.views || 0,
                    post: media.caption || "(No caption)",
                    impressions: media.views || 0,
                    clicks: 0,
                    likes: media.likeCount || 0,
                    comments: media.comments || 0,
                    shares: media.shares || 0,
                    fullPicture: media.mediaUrl || media.fullPicture,
                    permalinkUrl: media.permalinkUrl,
                  }));

                  return {
                    id: widget.id,
                    widget,
                    data: {
                      success: true,
                      rows,
                      pagination: {
                        page: 1,
                        limit: rows.length,
                        total: rows.length,
                        totalPages: 1,
                      },
                      columns: [
                        { name: "Date", width: "15%", dataKey: "date" },
                        { name: "Full Picture", dataKey: "fullPicture" },
                        { name: "Post Message", width: "35%", dataKey: "post" },
                        { name: "Impressions", dataKey: "impressions" },
                        { name: "Clicks", dataKey: "clicks" },
                        { name: "Likes", dataKey: "likes" },
                        { name: "Shares", dataKey: "shares" },
                      ],
                    },
                  };
                }
              }
            }

            if (widget.metricKey === "meta.ads.campaign_performance") {
              if (clientId) {
                const campaignData = await fetchMetaAdsCampaignPerformance(
                  clientId,
                  effectiveDateFrom,
                  dateTo
                );

                if (campaignData?.success && Array.isArray(campaignData.rows)) {
                  const rows = campaignData.rows.map((row: any, idx: number) => ({
                    id: `campaign-${idx}`,
                    metricKey: widget.metricKey!,
                    integration: "meta_ads",
                    accountId: widget.accountId || "",
                    campaignName: row.campaignName,
                    adName: row.adName,
                    adsetName: row.adsetName,
                    clicks: row.clicks,
                    impressions: row.impressions,
                    cpc: row.cpc,
                    ctr: row.ctr,
                  }));

                  return {
                    id: widget.id,
                    widget,
                    data: {
                      success: true,
                      rows,
                      pagination: {
                        page: 1,
                        limit: rows.length,
                        total: rows.length,
                        totalPages: 1,
                      },
                      columns: [
                        { name: "Campaign", width: "20%", dataKey: "campaignName" },
                        { name: "Ad", width: "20%", dataKey: "adName" },
                        { name: "Ad Set", width: "15%", dataKey: "adsetName" },
                        { name: "Clicks", width: "10%", dataKey: "clicks" },
                        { name: "Impressions", width: "12%", dataKey: "impressions" },
                        { name: "Average CPC", width: "12%", dataKey: "cpc" },
                        { name: "CTR", width: "11%", dataKey: "ctr" },
                      ],
                    },
                  };
                }
              }
            }

            if (widget.metricKey?.startsWith("google.") || widget.metricKey?.startsWith("ga4.")) {
              const groupBy = ['line_chart', 'area_chart', 'bar_chart'].includes(widget.type || "")
                ? "day"
              : undefined;
              const gaResult = await getMetricData({
                integration: "google_analytics",
                metricKey: widget.metricKey!,
                dateFrom: effectiveDateFrom,
                dateTo: dateTo,
                groupBy: groupBy as any,
                clientId,
              });
              const series = gaResult?.data?.series ?? [];
              const rows = series.map((point, index) => ({
                id: index,
                metricKey: widget.metricKey!,
                integration: "google_analytics",
                accountId: widget.accountId || "",
                value: point.y,
                date: point.x,
                dimensionType: "day",
                dimensionValue: point.x,
                userId: 0,
                clientId,
                recordedAt: point.x,
              }));
              return {
                id: widget.id,
                widget,
                data: {
                  rows,
                  series,
                  data: gaResult.data,
                  total: gaResult.data?.total,
                  value: gaResult.data?.total,
                },
              };
            }

          // --- START GOOGLE ADS MULTI-FETCH ---
          if ((normalizedIntegration === 'google-ads' || normalizedIntegration === 'google_ads')) {
            if (isRateMetric) {
              const summaryData = await fetchGoogleAdsSummary(clientId, {
                startDate: params.startDate,
                endDate: params.endDate,
                accountId: widget.accountId || undefined
              });

              if (summaryData?.success && summaryData.summary) {
                const summary = {
                  ctr: summaryData.summary.ctr,
                  cpc: summaryData.summary.cpc,
                  roas: summaryData.summary.roas,
                  cost: summaryData.summary.spend,
                  clicks: summaryData.summary.clicks,
                  revenue: summaryData.summary.revenue,
                  impressions: summaryData.summary.impressions,
                };
                return { id: widget.id, widget, data: { rows: [], summary } };
              }
            } else if (widget.metricKey === 'google_ads.campaign_performance') {
              const campaignData = await fetchGoogleAdsCampaignPerformance(
                clientId,
                params.startDate,
                params.endDate,
                widget.accountId || undefined
              );

              if (campaignData?.success && Array.isArray(campaignData.rows)) {
                const rows = campaignData.rows.map((row: any) => ({
                  ...row,
                  metricKey: widget.metricKey,
                  integration: "google-ads",
                }));

                return {
                  id: widget.id,
                  widget,
                  data: {
                    success: true,
                    rows,
                    columns: [
                      { name: "Campaign", width: "18%", dataKey: "name" },
                      { name: "View-through conversions", width: "10%", dataKey: "viewThroughConversions" },
                      { name: "Avg CPC", width: "10%", dataKey: "cpc" },
                      { name: "Clicks", width: "9%", dataKey: "clicks" },
                      { name: "Conversion rate", width: "10%", dataKey: "conversionRate" },
                      { name: "Conversions", width: "10%", dataKey: "conversions" },
                      { name: "Cost", width: "11%", dataKey: "cost" },
                      { name: "Cost / conv.", width: "11%", dataKey: "costPerConversion" },
                      { name: "Impressions", width: "11%", dataKey: "impressions" },
                    ],
                  }
                };
              }
            }
          }
          // --- END GOOGLE ADS MULTI-FETCH ---

          // --- START META ADS RATIO METRIC AGGREGATE FETCH ---
          // CPC = Total Spend / Total Clicks. CTR = (Total Clicks / Total Impressions) * 100
          // Uses the dedicated /unified-metrics/aggregate endpoint for mathematically correct totals.
          if (
            (normalizedIntegration === "meta-ads" || normalizedIntegration === "meta_ads") &&
            (widget.metricKey === "meta.ads.cpc" || widget.metricKey === "meta.ads.ctr")
          ) {
            console.log(`📡 [Dashboard] Aggregate fetch for ${widget.metricKey}`);
            try {
              // Fetch trend data (for sparklines) and aggregate (for total) in parallel
              const [trendData, aggregateResult] = await Promise.all([
                fetchUnifiedMetric(clientId, params as any),
                fetchUnifiedAggregate({
                  metricKey: widget.metricKey,
                  integration: "meta_ads",
                  startDate: params.startDate,
                  endDate: params.endDate,
                  accountId: widget.accountId || undefined,
                }),
              ]);

              if (aggregateResult?.success && typeof aggregateResult.value === "number") {
                console.log(`📡 [Dashboard] Aggregate OK for ${widget.metricKey}:`, aggregateResult.value);
                const metricSuffix = widget.metricKey!.split(".").pop() || "";
                return {
                  id: widget.id,
                  widget,
                  data: {
                    ...trendData,
                    rows: trendData?.rows ?? [],   // Ensure rows is always an array so the processing loop doesn't early-return 0
                    value: aggregateResult.value,
                    total: aggregateResult.value,
                    summary: {
                      ...(trendData as any)?.summary,
                      [metricSuffix]: aggregateResult.value,
                      cpc: metricSuffix === "cpc" ? aggregateResult.value : (trendData as any)?.summary?.cpc,
                      ctr: metricSuffix === "ctr" ? aggregateResult.value : (trendData as any)?.summary?.ctr,
                    },
                  },
                };
              } else {
                console.warn(`📡 [Dashboard] Aggregate returned no value for ${widget.metricKey}:`, aggregateResult);
              }
            } catch (err) {
              console.error("Failed to fetch Meta Ads aggregate for dashboard", err);
            }
          }
          // --- END META ADS RATIO METRIC AGGREGATE FETCH ---

          // --- START GOOGLE SEARCH CONSOLE AGGREGATE FETCH ---
          // Uses /unified-metrics/aggregate for all 4 GSC metric keys.
          // Clicks/Impressions → summed. CTR → already in % (e.g. 0.69 = 0.69%). Position → averaged.
          const GSC_AGGREGATE_KEYS = [
            "google_seo.clicks",
            "google_seo.impressions",
            "google_seo.ctr",
            "google_seo.position",
          ];
          const isGscWidget =
            (normalizedIntegration === "google-search-console" ||
              normalizedIntegration === "google-console") &&
            GSC_AGGREGATE_KEYS.includes(widget.metricKey!);

          if (isGscWidget) {
            console.log(`📡 [Dashboard] GSC Aggregate fetch for ${widget.metricKey}`);
            try {
              const [trendData, aggregateResult] = await Promise.all([
                fetchUnifiedMetric(clientId, params as any),
                fetchUnifiedAggregate({
                  metricKey: widget.metricKey!,
                  integration: "google-search-console",
                  startDate: params.startDate,
                  endDate: params.endDate,
                  accountId: widget.accountId || undefined,
                }),
              ]);

              if (
                aggregateResult?.success &&
                typeof aggregateResult.value === "number"
              ) {
                console.log(
                  `📡 [Dashboard] GSC Aggregate OK for ${widget.metricKey}:`,
                  aggregateResult.value
                );
                const metricSuffix = widget.metricKey!.split(".").pop() || "";
                return {
                  id: widget.id,
                  widget,
                  data: {
                    ...trendData,
                    rows: trendData?.rows ?? [],
                    value: aggregateResult.value,
                    total: aggregateResult.value,
                    rowCount: aggregateResult.rowCount,
                    summary: {
                      ...(trendData as any)?.summary,
                      [metricSuffix]: aggregateResult.value,
                    },
                  },
                };
              } else {
                console.warn(
                  `📡 [Dashboard] GSC Aggregate returned no value for ${widget.metricKey}:`,
                  aggregateResult
                );
              }
            } catch (err) {
              console.error("Failed to fetch GSC aggregate for dashboard", err);
            }
          }
          // --- END GOOGLE SEARCH CONSOLE AGGREGATE FETCH ---

          const shouldTryMetaFallback =
            normalizedIntegration.startsWith("meta") && widget.accountId;
          if (shouldTryMetaFallback) {
            const [primaryData, fallbackData] = await Promise.all([
              fetchUnifiedMetric(clientId, params as any),
              fetchUnifiedMetric(clientId, {
                ...params,
                accountId: undefined,
              } as any),
            ]);
            const data =
              primaryData?.rows && primaryData.rows.length > 0
                ? primaryData
                : fallbackData ?? primaryData;
            return { id: widget.id, widget, data };
          }

          const data = await fetchUnifiedMetric(clientId, params as {
            integration: string;
            metricKey: string;
            startDate: string;
            endDate: string;
          });

          return { id: widget.id, widget, data };
        } catch (error) {
          console.error(`❌ [Dashboard] Failed to fetch data for widget ${widget.id} (${widget.metricKey}):`, error);
          return { id: widget.id, widget, data: null };
        }
      };

      // Fetch batch widgets using GET /api/unified-metrics/data (same as Report Builder)
      const batchFetches = batchWidgets.map(async (widget) => {
        const isChartType = ["line_chart", "bar_chart", "area_chart"].includes(widget.type || "");
        const groupBy = widget.groupBy || (isChartType ? "day" : undefined);
        try {
          const response = await getMetricData({
            integration: widget.integration,
            metricKey: widget.metricKey!,
            accountId: widget.accountId,
            dateFrom,
            dateTo,
            groupBy: groupBy as any,
            aggregation: widget.aggregation as any,
            clientId,
          });
          return { widget, response };
        } catch (error) {
          console.error(`❌ [Dashboard] Batch fetch failed for ${widget.metricKey}:`, error);
          return { widget, response: null };
        }
      });

      const [batchResults, specialResults] = await Promise.all([
        batchFetches.length ? Promise.all(batchFetches) : Promise.resolve([]),
        specialWidgets.length ? Promise.all(specialWidgets.map(fetchSpecialWidgetData)) : Promise.resolve([]),
      ]);

      // Process and format data for each widget type
      const merged: Record<string, ResolvedWidgetData> = {};

        batchResults.forEach(({ widget, response }) => {
          if (!response) return;
          const payload = (response as any).data ?? response;
          const series = payload.series ?? [];
          const apiTotal = payload.total;
          const total =
            typeof apiTotal === "number"
              ? apiTotal
              : series.length > 0
                ? series.reduce((acc: number, pt: { x: string; y: number }) => acc + (pt.y ?? 0), 0)
                : 0;

          merged[widget.id] = {
            value: total,
            total,
            rawCount: payload.rawCount ?? series.length,
            rows: [],
            series,
            columns: [],
          };
        });

      specialResults.forEach(({ id, widget, data }) => {
        // Check for different response structures
        if (!data) {

          merged[id] = { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
          return;
        }

        // Handle different API response structures
        let rows = data.rows;
        if (!rows && data.data && Array.isArray(data.data)) {
          rows = data.data;
        }
        if (!rows && Array.isArray(data)) {
          rows = data;
        }

        if (!rows || !Array.isArray(rows)) {
          merged[id] = { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
          return;
        }

        // Use the found rows
        data.rows = rows;

        // Filter rows by integration and metricKey match
        const normalizeIntegration = (name: string) => {
          if (name === 'woo') return 'woocommerce';
          return (name || '').toLowerCase().replace(/_/g, '-');
        };

        // Smart Account ID Comparator
        const areAccountIdsEqual = (id1: any, id2: any) => {
          if (!id1 || !id2) return true;
          const s1 = String(id1).replace(/^act_/, '');
          const s2 = String(id2).replace(/^act_/, '');
          return s1 === s2;
        };

        const filteredRows = data.rows.filter((row: any) => {
          const rowIntegration = normalizeIntegration(row.integration || '');
          const widgetIntegration = normalizeIntegration(widget.integration || '');

          // Debug logging for Meta Ads
          if (widget.integration === 'meta-ads' || row.integration === 'meta_ads' || row.integration === 'meta-ads') {
            // console.log('📘 [Dashboard] Meta Ads filtering...');
          }

          const isMeta = widgetIntegration.startsWith('meta_');

          let accountMatch = true;
          if (isMeta || widget.accountId) {
            // Fix: If row.accountId is empty but we have dimensionValue for page/account, use that for matching
            if (!row.accountId && (row.dimensionType === 'page' || row.dimensionType === 'account') && row.dimensionValue) {
              accountMatch = areAccountIdsEqual(row.dimensionValue, widget.accountId);
            } else {
              accountMatch = areAccountIdsEqual(row.accountId, widget.accountId);
            }
          }
          if (widgetIntegration === 'meta-business') accountMatch = true;


          // Double Safety: Check Client ID if available to avoid cross-client data leakage
          let clientMatch = true;
          if (clientId && row.clientId) {
            clientMatch = String(row.clientId) === String(clientId);
          }

          const matchesBasic = (row.metricKey === widget.metricKey) &&
            (rowIntegration === widgetIntegration) &&
            accountMatch &&
            clientMatch;

          // For tables, we want dimensional data
          if (widget.type === 'table') {
            return matchesBasic;
          }

          // For metric cards and charts, exclude dimensional data
          // EXCEPT for WooCommerce which uses dimensionType="date" for time-series
          // EXCEPT for YouTube which has dimensionType="video" but we want to aggregate by date
          const isDimensional = row.dimensionType && row.dimensionType !== "";
          const isWooDateDimension = widget.metricKey?.startsWith('woo.') && row.dimensionType === 'date';
          const isYouTubeDimension = widget.metricKey?.startsWith('youtube.') && row.dimensionType === 'video';
          // Allow specific dimension types for Meta Ads (campaign, adset, ad) as these are the primary data rows
          // Fix: Allow 'page' and 'account' dimensions for Meta metrics
          const isMetaSpecificDimension = (widget.metricKey?.startsWith('meta') || widget.metricKey?.startsWith('meta_')) &&
            ['campaign', 'adset', 'ad', 'date', 'page', 'account'].includes(row.dimensionType);

          return matchesBasic && (!isDimensional || isWooDateDimension || isYouTubeDimension || isMetaSpecificDimension);
        });

        // Check for rate metrics vs countable metrics
        const isRateMetric =
          widget.metricKey?.toLowerCase().includes("cpc") ||
          widget.metricKey?.toLowerCase().includes("ctr") ||
          widget.metricKey?.toLowerCase().includes("cpm") ||
          widget.metricKey?.toLowerCase().includes("bouncerate") ||
          widget.metricKey?.toLowerCase().includes("average") ||
          widget.metricKey?.toLowerCase().includes("avg") || // Covers avgOrderValue
          widget.metricKey?.toLowerCase().includes("rate") || // Covers conversionRate, engagementRate
          widget.metricKey?.toLowerCase().includes("duration") || // Covers averageSessionDuration
          widget.metricKey?.toLowerCase().includes("perview"); // Covers likesPerView, commentsPerView

        // Calculate total value
        const metricSuffix = widget.metricKey?.split('.').pop()?.toLowerCase() || '';

        // 1. Try pre-calculated total/value from individual fetcher first (e.g. Meta Ads Aggregate)
        //    IMPORTANT: Only treat as pre-computed when non-zero. A value of 0 from the
        //    standard API should fall through to blended/averaging to avoid locking at 0.
        const precomputedValue =
          typeof data.value === 'number' && data.value !== 0 ? data.value
            : typeof data.total === 'number' && data.total !== 0 ? data.total
              : null;
        let total = precomputedValue ?? 0;
        let summaryUsed = precomputedValue !== null;

        // 2. Try to use API-provided summary (Blended Calculation) second
        if (!summaryUsed) {
          const summary = (data as any).summary;

          if (summary && metricSuffix) {
            let summaryKey = metricSuffix;
            // Map common variations
            if (summaryKey === 'cost_per_click') summaryKey = 'cpc';
            else if (summaryKey === 'click_through_rate') summaryKey = 'ctr';
            else if (summaryKey === 'cost_per_mille') summaryKey = 'cpm';
            else if (summaryKey === 'amount_spent') summaryKey = 'spend';

            if (typeof summary[summaryKey] === 'number') {
              total = summary[summaryKey];
              summaryUsed = true;
            }
          }
        }

        if (!summaryUsed && filteredRows.length > 0) {

          // Check for Cumulative Metrics (Facebook Page Likes, etc.)
          // These should take the LATEST value, not the SUM/AVG
          const aggregationType = getMetricAggregation(widget.metricKey);

          if (aggregationType === 'latest') {
            // Group by date to handle multiple accounts correctly (sum across accounts for the same day)
            const dateMap = new Map<string, number>();

            filteredRows.forEach((row: any) => {
              // Ensure we have a valid date
              const dateKey = row.date ? row.date.split('T')[0] : '';
              if (dateKey) {
                dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + (Number(row.value) || 0));
              }
            });

            // Sort dates descending
            const sortedDates = Array.from(dateMap.keys()).sort((a, b) =>
              new Date(b).getTime() - new Date(a).getTime()
            );

            if (sortedDates.length > 0) {
              // Take the value of the latest date
              total = dateMap.get(sortedDates[0]) || 0;
            }

          } else {
            // Manual Blended Calculation Fallback
            let blendedCalculated = false;
            const contextRows = data.rows || [];
            const widgetInteg = normalizeIntegration(widget.integration || '');

            const getSum = (keySuffix: string) => {
              return contextRows
                .filter((r: any) =>
                  (r.metricKey || '').endsWith(keySuffix) &&
                  normalizeIntegration(r.integration || '') === widgetInteg &&
                  (widgetInteg === 'meta-business' || areAccountIdsEqual(r.accountId, widget.accountId))
                )
                .reduce((sum: number, r: any) => sum + (Number(r.value) || 0), 0);
            };

            if (metricSuffix === 'cpc') {
              const sumSpend = getSum('spend') || getSum('amount_spent');
              const sumClicks = getSum('clicks');
              if (sumClicks > 0) { total = sumSpend / sumClicks; blendedCalculated = true; }
            } else if (metricSuffix === 'ctr') {
              const sumClicks = getSum('clicks');
              const sumImpressions = getSum('impressions');
              if (sumImpressions > 0) { total = (sumClicks / sumImpressions) * 100; blendedCalculated = true; }
            } else if (metricSuffix === 'cpm') {
              const sumSpend = getSum('spend') || getSum('amount_spent');
              const sumImpressions = getSum('impressions');
              if (sumImpressions > 0) { total = (sumSpend / sumImpressions) * 1000; blendedCalculated = true; }
            }

            if (!blendedCalculated) {
              if (isRateMetric) {
                // For rate metrics like CPC/CTR, calculate AVERAGE instead of SUM
                const sum = filteredRows.reduce((a: number, b: any) => a + (b.value || 0), 0);
                total = sum / filteredRows.length;
              } else {
                // For countable metrics (Spend, Impressions), SUM is correct
                total = filteredRows.reduce((sum: number, row: any) => sum + (row.value || 0), 0);
              }
            }
          }

        }

          const rawSeries = Array.isArray((data as any).series)
            ? (data as any).series
            : Array.isArray((data as any).data?.series)
              ? (data as any).data.series
              : [];
          const series =
            rawSeries.length > 0
              ? rawSeries
              : buildSeriesFromRows(filteredRows, isRateMetric);

        // Format based on widget type
        if (widget.type === 'table') {
          merged[id] = {
            rows: filteredRows,
            rawCount: filteredRows.length,
            columns: (data as any).columns,
          };
        } else if (widget.type === 'line_chart' || widget.type === 'bar_chart' || widget.type === 'area_chart') {
          merged[id] = {
            value: total,
            total: total,
            series: series,
            rawCount: filteredRows.length,
            rows: filteredRows,
          };
        } else {
          // For metric cards, just value and total
          merged[id] = {
            value: total,
            total: total,
            rawCount: filteredRows.length,
            rows: filteredRows,
            series: series,
          };
        }
      });

      widgetsWithMetrics.forEach((widget) => {
        if (!merged[widget.id]) {
          merged[widget.id] = { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
        }
      });

      return merged;
    },
  });

  // Handle widget data query errors
  useEffect(() => {
    if (widgetDataQuery.error) {
      toast.error(
        (widgetDataQuery.error as ApiError).message || "Failed to load widget data"
      );
    }
  }, [widgetDataQuery.error]);

  // Use resolved widgets from query
  const resolvedWidgets: Record<string, ResolvedWidgetData> = useMemo(() => {
    return widgetDataQuery.data ?? {};
  }, [widgetDataQuery.data]);




  const getIntegrationIcon = (integration: string, className?: string, metricKey?: string) => {
    const displayIntegration = getDisplayIntegration(integration, metricKey);
    const platformConfig = getPlatformConfig(displayIntegration);
    const Icon = platformConfig?.icon || LayoutGrid; // Default fallback if not found
    return <Icon className={className} />;
  };

  useEffect(() => {
    // Force unified mode
  }, []);

  const content = (
    <>
      {/* Header */}
      {!hideHeader && (
        <div className="w-full h-[4.8em] border-b flex justify-between items-center px-4 sm:px-5 sticky top-0 z-40 backdrop-blur-md bg-white/80">
          <span className="font-medium text-lg sm:text-xl text-zinc-800 tracking-tight">
            {clientId ? 'Executive Dashboard' : 'Select Client'}
          </span>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Show view clients button if client is selected */}
            {clientId && (
              <Button
                variant="ghost"
                onClick={() => navigate('/clients')}
                className="text-zinc-500 hover:text-zinc-800"
              >
                Switch Client
              </Button>
            )}

            {clientId && (
              <Link to={`/clients/${clientId}/edit-dashboard`}>
                <Button variant="outline" className="shadow-sm border-zinc-200 text-zinc-700 hover:bg-zinc-50">
                  Edit Layout
                </Button>
              </Link>
            )}

            {/* Only show date picker if client is selected */}
            {clientId && (
              <DateRangePicker
                value={dateRange}
                // @ts-ignore
                onChange={handleDateRangeChange}
              />
            )}
          </div>
        </div>
      )}

      {/* Main Content Area - Unified Grid */}
      <div className="w-full flex flex-col gap-6 px-4 py-8 max-w-[1600px] mx-auto">
        {!clientId ? (
          // CLIENT SELECTOR GRID (Replaces "No Client Selected" placeholder)
          <div className="w-full">
            {isLoadingClients ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-56 w-full rounded-xl" />
                ))}
              </div>
            ) : isClientsError ? (
              <div className="w-full px-5 py-24 text-center text-zinc-500 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-red-200 flex flex-col items-center justify-center">
                <div className="p-5 rounded-full bg-red-50 mb-6 shadow-sm">
                  <Activity className="text-4xl text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-800 mb-3 tracking-tight">Failed to load clients</h3>
                <p className="mb-8 max-w-sm text-zinc-500 font-medium">We encountered an issue while fetching your clients.</p>
                <Button onClick={() => refetchClients()} size="lg" className="rounded-xl px-8 shadow-lg shadow-red-500/20 bg-red-600 hover:bg-red-700">
                  Retry
                </Button>
              </div>
            ) : clients?.length === 0 ? (
              // No Clients Found
              <div className="w-full px-5 py-24 text-center text-zinc-500 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-zinc-200 flex flex-col items-center justify-center transition-all hover:bg-white/80">
                <div className="p-5 rounded-full bg-zinc-50 mb-6 shadow-sm">
                  <FiSearch className="text-4xl text-zinc-300" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-800 mb-3 tracking-tight">No Clients Found</h3>
                <p className="mb-8 max-w-sm text-zinc-500 font-medium">Get started by creating your first client workspace.</p>
                <Link to="/clients">
                  <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">Add Client</Button>
                </Link>
              </div>
            ) : (
              // Client Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
                {clients?.map((client) => {
                  const status = getClientHealth(client);
                  const totalIntegrations =
                    (client._count?.metaBusinessAccounts || 0) +
                    (client._count?.metaAdsAccounts || 0) +
                    (client._count?.metaInsightsAccounts || 0) +
                    (client._count?.youtubeAccounts || 0) +
                    (client._count?.shopifyAccounts || 0) +
                    (client._count?.woocommerceAccounts || 0) +
                    (client._count?.googleSearchConsoleAccounts || 0) +
                    (client._count?.googleAnalyticsAccounts || 0);

                  return (
                    <div
                      key={client.id}
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className={cn(
                        "group relative flex flex-col justify-between p-5 h-56 border rounded-xl transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-md",
                        // Status Tints
                        status === 'healthy' ? "bg-white border-zinc-200 hover:border-primary/50" :
                          status === 'warning' ? "bg-amber-50/10 border-amber-200/50 hover:border-amber-300/50" :
                            "bg-white border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      {/* Micro-Chart Background (Decorative) */}
                      <div className="absolute right-0 bottom-0 w-32 h-20 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                        <svg viewBox="0 0 100 40" className="w-full h-full fill-none stroke-current text-zinc-900">
                          <path d="M0 30 Q 10 25 20 28 T 40 20 T 60 25 T 80 15 T 100 5" strokeWidth="3" />
                        </svg>
                      </div>

                      <div className="flex flex-col items-start w-full relative z-10">
                        <div className="flex justify-between w-full mb-4">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                            status === 'healthy' ? "bg-primary/5 text-primary" :
                              status === 'warning' ? "bg-amber-50 text-amber-600" :
                                "bg-zinc-100 text-zinc-500"
                          )}>
                            <Building2 className="w-5 h-5" />
                          </div>
                        </div>

                        <h3 className="font-bold text-lg text-zinc-900 leading-tight line-clamp-1 text-left w-full group-hover:text-primary transition-colors">
                          {client.name}
                        </h3>

                        {/* Micro-Trend (Simulated) */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            status === 'healthy' ? "bg-emerald-50 text-emerald-600" : "bg-zinc-50 text-zinc-500"
                          )}>
                            {status === 'healthy' ? 'Active' : 'Setup Required'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-black/5 relative z-10">
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="text-zinc-600 text-[11px] font-medium">
                            {totalIntegrations} Connected
                          </span>
                        </div>

                        {/* Hover Action "Quick Peek" */}
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-zinc-100">
                          <span className="text-[10px] font-bold text-primary">View Dashboard →</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : dashboardsQuery.isLoading ? (
          // Loading Skeleton for Dashboard Layout
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in duration-500">
            {/* Hero Widget Skeleton */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-white rounded-3xl border border-zinc-100/60 p-6 shadow-sm h-[380px] flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full mt-4">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            </div>
            {/* Metric Card Skeletons */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-zinc-100/60 p-6 shadow-sm h-40 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-12 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        ) : dashboardWidgets.length === 0 ? (
          <div className="w-full px-5 py-24 text-center text-zinc-500 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-zinc-200 flex flex-col items-center justify-center transition-all hover:bg-white/80">
            <div className="p-5 rounded-full bg-zinc-50 mb-6 shadow-sm">
              <FiBell className="text-4xl text-zinc-300" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-800 mb-3 tracking-tight">Dashboard is Empty</h3>
            <p className="mb-8 max-w-sm text-zinc-500 font-medium">Start by customizing your executive dashboard.</p>
            <Link to={`/clients/${clientId}/edit-dashboard`}>
              <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">Customize Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in duration-500">
            {dashboardWidgets.map((widget) => {
              const data = resolvedWidgets[widget.id];
              const displayIntegration = getDisplayIntegration(widget.integration || '', widget.metricKey);
              const brandColor = getBrandColor(displayIntegration);
              const isHero = ['line_chart', 'area_chart', 'bar_chart'].includes(widget.type || '');
              const isTable = widget.type === 'table';

              // Determine if this specific widget is loading (if we had granular loading)
              // For now, we rely on the main queries. 
              // But we can check if data is undefined but query is fetching.

              if (widgetDataQuery.isLoading) {
                return (
                  <div
                    key={widget.id}
                    className={cn(
                      "bg-white rounded-3xl border border-zinc-100/60 p-6 shadow-sm flex flex-col gap-4",
                      isHero || isTable ? "col-span-1 md:col-span-2 lg:col-span-2 row-span-2 h-[380px]" : "h-40"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-auto">
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-6 w-1/2 opacity-50" />
                    </div>
                  </div>
                );
              }

              // Value resolution
              const value = (typeof data?.total === "number" ? data.total : undefined) ??
                (typeof data?.value === "number" ? data.value : undefined);

              if (isTable) {
                const rows = (data?.rows as Array<Record<string, any>>) || [];
                const columns = buildTableColumns(rows, (data as any)?.columns);
                return (
                  <div
                    key={widget.id}
                    className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-white rounded-3xl border border-zinc-100/60 p-6 shadow-sm flex flex-col gap-4 h-[380px]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="p-1.5 rounded-md bg-zinc-50/50"
                          style={{ color: brandColor, backgroundColor: `${brandColor}10` }}
                        >
                          {getIntegrationIcon(widget.integration || '', "w-4 h-4", widget.metricKey)}
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          {nameCorrection(widget.integration || '')} • {widget.metricKey.split('.').pop()?.replace(/_/g, ' ')}
                        </h3>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto rounded-xl border border-zinc-100/80">
                      {rows.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-sm text-zinc-400">
                          No data available
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {columns.map((col) => (
                                <TableHead key={col.key} className="text-xs text-zinc-500">
                                  {col.label}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rows.map((row, idx) => (
                              <TableRow key={row.id ?? idx}>
                                {columns.map((col) => (
                                  <TableCell key={col.key} className="text-xs">
                                    {row[col.key] ?? "--"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </div>
                );
              }

              if (isHero) {
                // Render Large Chart
                return (
                  <div
                    key={widget.id}
                    className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-white rounded-3xl border border-zinc-100/60 p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between group h-[380px]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="p-1.5 rounded-md bg-zinc-50/50"
                            style={{ color: brandColor, backgroundColor: `${brandColor}10` }}
                          >
                          {getIntegrationIcon(widget.integration || '', "w-4 h-4", widget.metricKey)}
                          </div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                            {nameCorrection(widget.integration || '')} • {widget.metricKey.split('.').pop()?.replace(/_/g, ' ')}
                          </h3>
                        </div>
                        <span className="text-4xl font-bold text-zinc-900 tracking-tighter">
                          {formatNumber(value, widget.metricKey)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full flex-1 relative min-h-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent pointer-events-none z-10" />
                      <ChartLineMultiple
                        data={(data?.series as any) || []}
                        metricLabel={widget.metricKey}
                        color={brandColor}
                        chartType={
                          widget.type === 'area_chart' ? 'area' :
                            widget.type === 'bar_chart' ? 'bar' : 'line'
                        }
                      />
                    </div>
                  </div>
                );
              }

              // Render Metric Card
              return (
                <MetricCard
                  key={widget.id}
                  title={widget.metricKey.split('.').pop()?.replace(/_/g, ' ') || ''}
                  value={formatNumber(value ?? 0, widget.metricKey)}
                  series={(data?.series as any) || []}
                  brandColor={brandColor}
                  className="col-span-1 h-[180px]"
                  icon={getIntegrationIcon(widget.integration || '', "w-4 h-4", widget.metricKey)}
                  chartType="line"
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  if (!withLayout) {
    return <div className="w-full min-h-screen bg-slate-50/50">{content}</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-x-hidden bg-slate-50">
      {!hideHeader && (
        <div className="w-full h-[4.8em] bg-white/80 backdrop-blur-md border-b flex justify-between items-center px-6 sticky top-0 z-20">
          <span className="font-bold text-lg text-zinc-800 tracking-tight">Overview</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-600">
                <FiSearch className="text-lg" />
              </Button>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-600">
                <FiBell className="text-lg" />
              </Button>
            </div>
            {clientId && (
              <DateRangePicker
                value={dateRange}
                // @ts-ignore
                onChange={handleDateRangeChange}
              />
            )}
            {!clientId ? (
              <Link to="/clients/new">
                <Button className="shadow-sm">
                  New Client
                </Button>
              </Link>
            ) : (
              <Link to={`/clients/${clientId}/edit-dashboard`}>
                <Button variant="outline" className="shadow-sm border-zinc-200 text-zinc-700 hover:bg-zinc-50">
                  Edit Layout
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {content}
      </div>
    </div>
  );
}

export default Dashboard;
