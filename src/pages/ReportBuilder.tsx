import { FiBell, FiSearch, FiCalendar } from "react-icons/fi";
import { Button } from "../components/ui/button";
import { RadioButtonGroup } from "../components/RadioButtonGroup";
import WidgetsPageSideComponent from "../components/WidgetsPageSideComponent";
import ReportElements from "../components/ReportElements";
import TitleWidgetForm from "../components/TitleWidgetForm";
import MetricWidgetForm from "../components/MetricWidgetForm";
import CustomWidgetForm from "../components/CustomWidgetForm";
import TasksWidgetForm from "../components/TasksWidgetForm";
import ChartWidgetForm from "../components/ChartWidgetForm";
import TableWidgetForm from "../components/TableWidgetForm";
import ImageWidgetForm from "../components/ImageWidgetForm";
import EmbedWidgetForm from "../components/EmbedWidgetForm";
import { DataSyncBanner } from "../components/DataSyncBanner";
import { DateRangePicker } from "../components/DateRangePicker";
import { type DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Layout lib
import GridLayout, { type Layout, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// UI Components
import { ChartLineMultiple } from "../components/ChartLineMultiple";
import {
  Card,
  CardContent,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
// App constants
import {
  reportTableRows,
  WIDGET_SIZE_MAP,
  generateWidgetId,
} from "../components/reportConstants";
import { getReportStatusBadgeClass } from "../utils/statusColors";
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
  MapWidgetData,
  MetricWidgetData,
  ImageWidgetData,
  EmbedWidgetData,
  CustomWidgetData,
  WidgetData,
} from "../components/widgetTypes";
import {
  createReportTemplate,
  getReportTemplate,
  fetchUnifiedMetric,
  updateReportTemplate,
  listReportSchedules,
  type UnifiedMetricRow,
} from "@/features/reports/api/reportingApi";
import { getShopifyTrends, getShopifySummary } from "@/features/shopify/API/shopifyApi";
import { prettifyMetricLabel } from "@/utils/labelUtils";
import { CreateScheduleModal } from "../components/CreateScheduleModal";
import { getGoogleConsoleUnifiedMetrics } from "@/features/YouTube/API/googleConsoleapi";
import type {
  ApiError,
  CreateTemplatePayload,
  ReportWidgetDefinition,
  ResolvedWidgetData,
  WidgetSeriesPoint,
  ReportSlideMeta,

} from "@/features/reports/api/types";
import { useIntegrations } from "@/features/DataSources/hooks/useIntegrations";
import { getPlatformConfig } from "@/utils/platformMapping";
import { useAvailableMetrics } from "@/features/reports/hooks/useAvailableMetrics";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { exportAllSlidesToPDF } from "../components/functions/reportfunctions";

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

// Types
export interface DashboardLayout extends Layout {
  widgetType: ReportWidgetType;
  data?: WidgetData;
  metricConfig?: ReportWidgetDefinition;
}

export type DashboardMap = Map<number, DashboardLayout[]>;

// Grid constants
const GRID_CONFIG = {
  cols: 12,
  rowHeight: 80,
  width: 1200,
  margin: [16, 16] as [number, number],
} as const;

// Tablet grid config
const TABLET_GRID_CONFIG = {
  cols: 8,
  rowHeight: 80,
  margin: [12, 12] as [number, number],
} as const;

const DEFAULT_WIDGET_SIZE = {
  w: 4,
  h: 4,
} as const;

// Auto width provider for react-grid-layout
const AutoWidthGrid = WidthProvider(GridLayout);

// Default widget data generators
const getDefaultWidgetData = (
  widgetType: ReportWidgetType
): WidgetData | undefined => {
  switch (widgetType) {
    case "title":
      return { text: "performance title", fontSize: "2xl", align: "center" };
    case "table":
      return {
        title: "New Table",
        caption: "Enter a caption",
        rows: [
          { name: "Row 1", value: "Value 1" },
          { name: "Row 2", value: "Value 2" },
        ],
        columns: [
          { name: "Name", width: "50%" },
          { name: "Value" },
        ],
      };
    case "chart":
      return { chartType: "pie" };
    case "map":
      return { location: "Default Location", zoom: 10 };
    case "metric":
      return { label: "Metric", value: 0 };
    case "image":
      return { src: "", alt: "Image" };
    case "embed":
      return { url: "", type: "iframe" };
    case "custom":
      return {
        content: "Enter your text here...",
        type: "text",
        title: "",
        align: "left",
        backgroundColor: "",
        textColor: "",
      };
    default:
      return undefined;
  }
};

// Empty default template - users start with a blank canvas
const DEFAULT_TEMPLATE_WIDGETS: ReportWidgetDefinition[] = [];

// Feature flag: Set to false to disable auto-population of default widgets
const ENABLE_AUTO_DEFAULT_WIDGETS = true;

// Curated default metrics per integration platform
const CURATED_DEFAULTS: Record<string, string[]> = {
  "google-analytics": [
    "google.sessions",        // Match backend format
    "google.activeUsers",
    "google.pageViews",
    "google.bounceRate",
  ],
  "google": [                 // Alias for Google Analytics
    "google.sessions",
    "google.activeUsers",
    "google.pageViews",
    "google.bounceRate",
  ],
  "google-search-console": [
    "google_seo.clicks",      // Match actual DB format
    "google_seo.impressions",
    "google_seo.ctr",
    "google_seo.position",
  ],
  "google-console": [
    "google-console.billing.cost",
  ],
  "meta": [
    "meta.page.impressions",
    "meta.page.engagement",
    "meta.page.fanAdds",
    "meta.instagram.followers",
  ],
  "meta-facebook": [
    // Facebook Page Metrics (Organic)
    "meta.page.impressions",
    "meta.page.uniqueImpressions",
    "meta.page.engagement",
    "meta.page.fans",
    "meta.page.postImpressions",
    "meta.page.views",
    "meta.page.actions",
    // Facebook Post-level Metrics (NEW)
    "meta.facebook.post.likes",
    "meta.facebook.post.comments",
    "meta.facebook.post.shares",
    "meta.facebook.post.reactions",
    "meta.facebook.post.engagement",
  ],
  "meta-instagram": [
    // Instagram Account-level Metrics (ONLY metrics that exist in DB)
    "meta.instagram.followers",
    "meta.instagram.mediaCount",
    // NOTE: The following metrics are defined but not yet in the database:
    // "meta.instagram.profileViews",
    // "meta.instagram.media.likes",
    // "meta.instagram.media.comments",
    // "meta.instagram.media.impressions",
    // "meta.instagram.media.reach",
    // "meta.instagram.media.engagement",
  ],
  "meta-business": [
    // Meta Business integration - combines Facebook + Instagram metrics
    // Facebook Metrics (actual metric keys from API)
    "meta.facebook.followers",
    "meta.facebook.postsCount",
    // Instagram Account Metrics
    "meta.instagram.followers",
    "meta.instagram.mediaCount",
  ],
  "meta-ads": [
    // Meta Ads Campaign Metrics (Paid)
    "meta.ads.impressions",
    "meta.ads.clicks",
    "meta.ads.spend",
    "meta.ads.cpc",
  ],
  "youtube": [
    "youtube.views",
    "youtube.likes",
    "youtube.comments",
    "youtube.subscribersGained",
  ],
  "shopify": [
    "shopify.revenue",
    "shopify.orders",
    "shopify.avgOrderValue",
  ],
  "woo": [                    // Match actual DB integration key
    "woo.revenue",
    "woo.orders",
    "woo.itemsSold",
  ],
  "woocommerce": [            // Alias for compatibility
    "woo.revenue",
    "woo.orders",
    "woo.itemsSold",
  ],
};

const MAX_DEFAULT_WIDGETS = 8;

const ensureSlide = (map: DashboardMap, slideId: number) => {
  if (!map.has(slideId)) {
    map.set(slideId, []);
  }
};

type MetricOption = {
  metricKey: string;
  integration: string;
  accountId: string;
  displayName?: string;
  filters?: Record<string, unknown>;
};

/**
 * Pick default metrics for an integration, trying curated keys first,
 * then falling back to available metrics from groupedMetrics.
 */
function pickDefaultMetricsForIntegration(
  integrationKey: string,
  accountId: string,
  groupedMetrics: Record<string, Record<string, MetricOption[]>>,
  notifyFallback: (msg: string) => void
): MetricOption[] {
  const normalized = integrationKey.toLowerCase().replace(/_/g, "-");
  // Special case: meta-business should pull metrics from BOTH meta-facebook AND meta-instagram
  // logic...

  // Special case: meta-business should pull metrics from BOTH meta-facebook AND meta-instagram
  if (integrationKey === 'meta-business' || normalized === 'meta-business') {
    console.log('🔄 Meta Business detected - combining Facebook + Instagram metrics');

    const facebookMetrics = groupedMetrics['meta-facebook'] ?? groupedMetrics['meta_facebook'] ?? {};
    const instagramMetrics = groupedMetrics['meta-instagram'] ?? groupedMetrics['meta_instagram'] ?? {};

    const facebookCandidates = Object.values(facebookMetrics).flat() ?? [];
    const instagramCandidates = Object.values(instagramMetrics).flat() ?? [];

    const combinedCandidates = [...facebookCandidates, ...instagramCandidates];

    console.log('📊 Combined metrics for meta-business:', {
      facebookCount: facebookCandidates.length,
      instagramCount: instagramCandidates.length,
      totalCount: combinedCandidates.length,
      facebookMetricKeys: facebookCandidates.map(m => m.metricKey),
      instagramMetricKeys: instagramCandidates.map(m => m.metricKey),
    });

    if (combinedCandidates.length > 0) {
      // Use the combined candidates for matching curated defaults
      const curated = CURATED_DEFAULTS['meta-business'] ?? [];
      const curatedFound: MetricOption[] = [];

      curated.forEach((key) => {
        const hit = combinedCandidates.find(
          (m) =>
            m.metricKey === key ||
            m.metricKey.endsWith(`.${key}`) ||
            m.metricKey.toLowerCase().includes(key.toLowerCase())
        );
        if (hit) {
          console.log('✅ Matched meta-business curated metric:', key, '→', hit.metricKey);
          // Add platform prefix to displayName to distinguish Facebook vs Instagram
          const platformPrefix = hit.integration === 'meta-facebook' || hit.integration === 'meta_facebook'
            ? 'Facebook - '
            : hit.integration === 'meta-instagram' || hit.integration === 'meta_instagram'
              ? 'Instagram - '
              : '';
          curatedFound.push({
            ...hit,
            displayName: platformPrefix + (hit.displayName || hit.metricKey.split('.').pop() || hit.metricKey)
          });
        } else {
          console.log('❌ meta-business curated metric not found:', key);
        }
      });

      // Always ensure we have a mix of Facebook and Instagram metrics
      // If we found curated metrics, use them but also include other available metrics
      const usedMetricKeys = new Set(curatedFound.map(m => m.metricKey));
      const remainingCandidates = combinedCandidates.filter(m => !usedMetricKeys.has(m.metricKey));

      // Add remaining metrics with platform prefixes, prioritizing Facebook if we have few
      const facebookRemaining = remainingCandidates.filter(m =>
        m.integration === 'meta-facebook' || m.integration === 'meta_facebook'
      );


      // Ensure we have at least some Facebook metrics if available
      const facebookCount = curatedFound.filter(m =>
        m.integration === 'meta-facebook' || m.integration === 'meta_facebook'
      ).length;

      // If we have no Facebook metrics in the API but curated defaults include Facebook metrics,
      // create synthetic Facebook metrics from curated defaults
      let syntheticFacebookMetrics: MetricOption[] = [];
      if (facebookCount === 0 && facebookCandidates.length === 0) {
        // Find Facebook metrics from curated defaults that weren't matched
        const facebookCuratedMetrics = curated.filter(key =>
          key.startsWith('meta.page.') || key.startsWith('meta.facebook.') || key.includes('facebook')
        );

        facebookCuratedMetrics.forEach(metricKey => {
          // Check if this metric wasn't already found (as Instagram)
          const alreadyFound = curatedFound.some(m => m.metricKey === metricKey);
          if (!alreadyFound) {
            syntheticFacebookMetrics.push({
              metricKey,
              integration: 'meta-facebook',
              accountId: accountId,
              displayName: 'Facebook - ' + (metricKey.split('.').pop() || metricKey),
            });
          }
        });

        if (syntheticFacebookMetrics.length > 0) {
          console.log('✨ Created synthetic Facebook metrics from curated defaults:', syntheticFacebookMetrics.map(m => m.metricKey));
        }
      }

      // If we have few/no Facebook metrics but Facebook metrics are available, prioritize them
      let additionalMetrics: MetricOption[] = [];
      if (facebookCount === 0 && facebookRemaining.length > 0) {
        // Add Facebook metrics first if we have none
        additionalMetrics.push(...facebookRemaining.slice(0, Math.min(2, facebookRemaining.length)));
      }

      // Fill remaining slots with available metrics (both Facebook and Instagram)
      const remainingSlots = MAX_DEFAULT_WIDGETS - curatedFound.length - additionalMetrics.length - syntheticFacebookMetrics.length;
      if (remainingSlots > 0) {
        const otherMetrics = remainingCandidates.filter(m =>
          !additionalMetrics.some(am => am.metricKey === m.metricKey)
        );
        additionalMetrics.push(...otherMetrics.slice(0, remainingSlots));
      }

      // Add platform prefixes to additional metrics
      const additionalWithPrefixes = additionalMetrics.map(metric => {
        const platformPrefix = metric.integration === 'meta-facebook' || metric.integration === 'meta_facebook'
          ? 'Facebook - '
          : metric.integration === 'meta-instagram' || metric.integration === 'meta_instagram'
            ? 'Instagram - '
            : '';
        return {
          ...metric,
          displayName: platformPrefix + (metric.displayName || metric.metricKey.split('.').pop() || metric.metricKey)
        };
      });

      const finalMetrics = [...curatedFound, ...syntheticFacebookMetrics, ...additionalWithPrefixes].slice(0, MAX_DEFAULT_WIDGETS);

      if (finalMetrics.length > 0) {
        console.log('📋 Final Meta Business metrics selected:', {
          total: finalMetrics.length,
          facebook: finalMetrics.filter(m => m.integration === 'meta-facebook' || m.integration === 'meta_facebook').length,
          instagram: finalMetrics.filter(m => m.integration === 'meta-instagram' || m.integration === 'meta_instagram').length,
          metricKeys: finalMetrics.map(m => m.metricKey)
        });
        return finalMetrics;
      }

      // Final fallback: if nothing worked, use all available metrics with prefixes
      const allWithPrefixes = combinedCandidates.slice(0, MAX_DEFAULT_WIDGETS).map(metric => {
        const platformPrefix = metric.integration === 'meta-facebook' || metric.integration === 'meta_facebook'
          ? 'Facebook - '
          : metric.integration === 'meta-instagram' || metric.integration === 'meta_instagram'
            ? 'Instagram - '
            : '';
        return {
          ...metric,
          displayName: platformPrefix + (metric.displayName || metric.metricKey.split('.').pop() || metric.metricKey)
        };
      });

      if (allWithPrefixes.length > 0) {
        console.log('📋 Using all available Meta Business metrics:', allWithPrefixes.map(m => m.metricKey));
        return allWithPrefixes;
      }
    }

    // Fallback: create synthetic metrics from curated defaults
    const curated = CURATED_DEFAULTS['meta-business'] ?? [];
    if (curated.length > 0) {
      console.log('✨ Using curated defaults as fallback for meta-business:', curated);

      // Try to get the actual accountId from Instagram data if available
      const instagramAccountIds = Object.keys(instagramMetrics);
      const instagramAccountId = instagramAccountIds.length > 0 ? instagramAccountIds[0] : accountId;

      const syntheticMetrics: MetricOption[] = curated.map(metricKey => {
        // Determine which integration this metric belongs to
        // Facebook metrics: include "facebook" OR start with "meta.page." or "meta.facebook." (Facebook metrics)
        const isFacebookMetric = metricKey.includes('facebook') || metricKey.startsWith('meta.page.') || metricKey.startsWith('meta.facebook.');
        const isInstagramMetric = metricKey.includes('instagram');

        // Use the actual accountId from the integration or from available data
        const metricAccountId = isInstagramMetric ? instagramAccountId : accountId;
        const integration = isFacebookMetric ? 'meta-facebook' : 'meta-instagram';

        // Add platform prefix to displayName to distinguish Facebook vs Instagram
        const platformPrefix = isFacebookMetric ? 'Facebook - ' : 'Instagram - ';
        const baseDisplayName = metricKey.split('.').pop() || metricKey;

        return {
          metricKey,
          integration,
          accountId: metricAccountId,
          displayName: platformPrefix + baseDisplayName,
        };
      });
      return syntheticMetrics;
    }
  }

  // Try to find metrics for this integration/account in groupedMetrics
  const perAccount =
    groupedMetrics[integrationKey] ??
    groupedMetrics[normalized] ??
    groupedMetrics[normalized === "google-console" ? "google-search-console" : ""] ??
    {};

  // For Shopify, if no metrics are found (cold start), force the curated list immediately
  // This bypasses the search for "candidates" which might fail if the integration key doesn't perfectly match
  if (normalized === 'shopify' && (!perAccount || Object.keys(perAccount).length === 0)) {
    console.log('🛒 Shopify cold start detected - using forced defaults');
    const shopifyDefaults = CURATED_DEFAULTS['shopify'] ?? [];
    return shopifyDefaults.map(key => ({
      metricKey: key,
      integration: integrationKey,
      accountId: accountId,
      displayName: key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim(), // avgOrderValue -> avg Order Value
    }));
  }

  // If we can't find metrics for the specific accountId, try to find ANY metrics for this integration
  // This handles cases where client uses accountId '5' but metrics are stored under '1'
  let candidates = perAccount[accountId] ?? [];

  // Special handling for Meta Business: aggregate from sub-integrations if essentially empty
  if (normalized === 'meta-business' && candidates.length === 0) {
    console.log('✨ aggregating Meta Business metrics from sub-platforms');
    const ads = groupedMetrics['meta-ads'] || groupedMetrics['meta_ads'] || {};
    const fb = groupedMetrics['meta-facebook'] || groupedMetrics['meta_facebook'] || {};
    const ig = groupedMetrics['meta-instagram'] || groupedMetrics['meta_instagram'] || {};

    // Collect all available metrics from sub-integrations
    const allMetrics: MetricOption[] = [];

    // Add Ads metrics
    Object.values(ads).forEach((accountMetrics: any) => {
      if (Array.isArray(accountMetrics)) {
        allMetrics.push(...accountMetrics.map((m: any) => ({ ...m, integration: 'meta-ads' })));
      }
    });

    // Add Facebook metrics
    Object.values(fb).forEach((accountMetrics: any) => {
      if (Array.isArray(accountMetrics)) {
        allMetrics.push(...accountMetrics.map((m: any) => ({ ...m, integration: 'meta-facebook' })));
      }
    });

    // Add Instagram metrics
    Object.values(ig).forEach((accountMetrics: any) => {
      if (Array.isArray(accountMetrics)) {
        allMetrics.push(...accountMetrics.map((m: any) => ({ ...m, integration: 'meta-instagram' })));
      }
    });

    candidates = allMetrics;
  }

  if (candidates.length === 0) {
    const availableAccounts = Object.keys(perAccount);
    if (availableAccounts.length > 0) {
      // Use the first available account's metrics
      console.log(`⚠️ Metrics mismatch for ${integrationKey}: requested ${accountId}, falling back to ${availableAccounts[0]}`);
      candidates = perAccount[availableAccounts[0]];
    }
  }

  // DEBUG: Log what metrics we found
  console.log('📊 Available metrics for', integrationKey, ':', {
    candidateCount: candidates.length,
    sampleKeys: candidates.slice(0, 5).map(m => m.metricKey),
  });

  if (!candidates.length) {
    console.warn('⚠️ No metrics found in debug list for', integrationKey, accountId);

    // Try to find the ACTUAL accountId from available metrics if the provided one has no hits
    const availableAccounts = Object.keys(perAccount);
    const bestAccountId = availableAccounts.length > 0 ? availableAccounts[0] : accountId;
    if (bestAccountId !== accountId) {
      console.log(`✨ Using accountId fallback for synthetic metrics: ${accountId} -> ${bestAccountId}`);
    }

    // Fallback: use curated defaults if available
    const curated = CURATED_DEFAULTS[normalized] ?? CURATED_DEFAULTS[integrationKey] ?? [];
    if (curated.length > 0) {
      console.log('✨ Using curated defaults as fallback:', curated);
      // Create synthetic metric options from curated defaults
      const syntheticMetrics: MetricOption[] = curated.map(metricKey => ({
        metricKey,
        integration: integrationKey,
        accountId: bestAccountId, // Use best available accountId
        label: metricKey.split('.').pop() || metricKey,
      }));
      return syntheticMetrics;
    }

    console.error('❌ No curated defaults available for', integrationKey);
    return [];
  }

  const curated = CURATED_DEFAULTS[normalized] ?? [];
  const curatedFound: MetricOption[] = [];

  // Try to match curated metric keys (flexible matching by suffix)
  curated.forEach((key) => {
    const hit = candidates.find(
      (m) =>
        m.metricKey === key ||
        m.metricKey.endsWith(`.${key}`) ||
        m.metricKey.toLowerCase().includes(key.toLowerCase())
    );
    if (hit) {
      console.log('✅ Matched curated metric:', key, '→', hit.metricKey);
      curatedFound.push(hit);
    } else {
      console.log('❌ Curated metric not found:', key);
    }
  });

  // If no curated metrics found, use fallback
  if (!curatedFound.length && candidates.length) {
    console.warn('⚠️ Using fallback metrics for', integrationKey);
    notifyFallback(
      `Using available metrics for ${integrationKey} (curated metrics not found).`
    );
    return candidates.slice(0, MAX_DEFAULT_WIDGETS);
  }

  // Fill remaining slots with other available metrics
  const remaining =
    candidates.filter(
      (m) => !curatedFound.some((c) => c.metricKey === m.metricKey)
    ) ?? [];

  const result = [...curatedFound, ...remaining].slice(0, MAX_DEFAULT_WIDGETS);
  console.log('✨ Final metrics selected:', result.map(m => m.metricKey));

  return result;
}

/**
 * Build default widget layouts for an integration slide.
 * Creates metric cards and a line chart from the provided metrics.
 */
function buildDefaultWidgetsForIntegration(
  slideId: number,
  metrics: MetricOption[]
): DashboardLayout[] {
  if (!metrics.length) return [];

  const widgets: DashboardLayout[] = [];

  const addWidget = (
    type: ReportWidgetType,
    metric: MetricOption,
    indexInType: number,
    baseY: number = 0
  ) => {
    const id = generateWidgetId("auto");
    const isMetricCard = type === "metric";

    // Get proper label from metric displayName or metricKey
    const label = metric.displayName || prettifyMetricLabel(metric.metricKey);

    // Layout Logic for 12-col grid
    let x = 0;
    let y = baseY;
    let w = 4;
    let h = 4;

    if (isMetricCard) {
      // Metrics: 4 per row (w=3)
      w = 3;
      h = 3;
      x = (indexInType % 4) * 3;
      y = baseY + Math.floor(indexInType / 4) * 3;
    } else {
      // Charts: 2 per row (w=6) or full width (w=12)
      w = 6; // Default to half width for charts
      h = 5;
      x = (indexInType % 2) * 6;
      y = baseY + Math.floor(indexInType / 2) * 5;
    }

    const widget: DashboardLayout = {
      i: id,
      x,
      y,
      w,
      h,
      widgetType: type,
      data: isMetricCard
        ? { label, value: 0 }  // Use proper label for metric cards
        : { chartType: "line", title: label },  // Use proper title for charts
      metricConfig: {
        id,
        metricKey: metric.metricKey,
        integration: metric.integration,
        accountId: metric.accountId,
        groupBy: isMetricCard ? "none" : "day",
        aggregation: "sum",
        type: isMetricCard ? "metric_card" : "line_chart",
        displayName: label,
        layout: {
          slideId,
          x,
          y,
          w,
          h,
        },
        ...(metric.filters ? { filters: metric.filters } : {}),
      },
    };
    widgets.push(widget);
    return widget; // Return for sizing ref
  };

  // 1. Add top 4 metrics as cards in the first row
  let currentY = 0;
  const metricCards = metrics.slice(0, 4);
  metricCards.forEach((m, idx) => addWidget("metric", m, idx, currentY));

  // Advance Y for next section (if metrics were added)
  if (metricCards.length > 0) {
    currentY += 3; // Metrics are h=3
  }

  // 2. Add first metric as a main chart
  if (metrics[0]) {
    const chartWidget = addWidget("chart", metrics[0], 0, currentY);
    // Make first chart full width
    chartWidget.w = 12;
    chartWidget.h = 8;
    // Don't need to update x/y as it's the first in this row/section
    currentY += 8;
  }



  return widgets.slice(0, MAX_DEFAULT_WIDGETS);
}

// Removed createPlaceholderWidget - new reports start with empty slides

const normalizeWidgetType = (type?: string): ReportWidgetType => {
  if (!type) return "metric";
  if (type.includes("chart")) return "chart";
  if (type.includes("metric") || type.includes("stat")) return "metric";
  if (type.includes("table")) return "table";
  return (type as ReportWidgetType) ?? "metric";
};

const buildDashboardMapFromTemplate = (
  widgets: ReportWidgetDefinition[]
): DashboardMap => {
  if (!widgets.length) {
    return new Map([[0, []]]);
  }

  const map: DashboardMap = new Map();

  widgets.forEach((widget, index) => {
    const layoutInfo = widget.layout;
    const slideId = Number(layoutInfo?.slideId ?? 0);
    ensureSlide(map, slideId);

    const widgetType = normalizeWidgetType(widget.type);
    const widgetData = (widget as any).widgetData as WidgetData | undefined;
    const layoutItem: DashboardLayout = {
      i: widget.id ?? generateWidgetId("widget"),
      x: layoutInfo?.x ?? 0,
      y: layoutInfo?.y ?? index * DEFAULT_WIDGET_SIZE.h,
      w: layoutInfo?.w ?? DEFAULT_WIDGET_SIZE.w,
      h: layoutInfo?.h ?? DEFAULT_WIDGET_SIZE.h,
      widgetType,
      data: widgetData ?? getDefaultWidgetData(widgetType),
      metricConfig: {
        ...widget,
        displayName: widget.displayName || prettifyMetricLabel((widget as any).label || (widget as any).title || widget.metricKey || widget.type || "Metric")
      },
    };

    map.set(slideId, [...(map.get(slideId) ?? []), layoutItem]);
  });

  // Always ensure at least one slide exists, even if empty
  if (!map.size) {
    return new Map([[0, []]]);
  }

  return map;
};

// Removed DEFAULT_DASHBOARD_MAP and cloneDashboardMap as we now create slides dynamically based on integrations

const getInitialDateRange = (): DateRange => ({
  from: subDays(new Date(), 6),
  to: new Date(),
});

const formatApiDate = (value: Date) => format(value, "yyyy-MM-dd");

// Table Data moved to reportConstants.ts

const widgetItems: {
  title: string;
  description: string;
  type: ReportWidgetType;
  customKind?: string;
}[] = [
    {
      title: "Textbox",
      description: "textbox you can design",
      type: "custom",
      customKind: "text"
    },
    { title: "Title", description: "Organize using title", type: "title" },
    {
      title: "Table of Contents",
      description: "Table of contents for your report",
      type: "custom",
      customKind: "toc",
    },
    {
      title: "Tasks",
      description: "Highlight completed tasks",
      type: "custom",
      customKind: "tasks",
    },
    {
      title: "Table",
      description: "Create a data table",
      type: "table",
    },
  ];

const customMetricItems: {
  title: string;
  description: string;
  type: ReportWidgetType;
}[] = [
    { title: "Stat", description: "Manual metric with trends", type: "metric" },
  ];

const imageWidgetItems: {
  title: string;
  description: string;
  type: ReportWidgetType;
}[] = [
    { title: "Image", description: "Add any image you like", type: "image" },
  ];

const embedWidgetItems: {
  title: string;
  description: string;
  type: ReportWidgetType;
}[] = [
    {
      title: "Embed",
      description: "Embed YouTube, Google Sheets etc",
      type: "embed",
    },
  ];

// Table helpers
const getStatusBadgeClass = (
  status: (typeof reportTableRows)[number]["status"]
) => {
  return getReportStatusBadgeClass(status);
};

const renderWidgetEmptyState = (
  onConnectIntegration?: () => void,
  message = "No data yet"
) => {
  return (
    <div className="flex flex-col items-center justify-center w-full text-center text-xs md:text-sm text-gray-500 gap-2 py-4">
      <DataSyncBanner compact className="bg-transparent border-0 p-0 justify-center mb-2" />
      <span>{message}</span>
      {onConnectIntegration && (
        <Button
          variant="outline"
          size="sm"
          onClick={onConnectIntegration}
          className="text-xs md:text-sm"
        >
          Connect Integration
        </Button>
      )}
    </div>
  );
};

// Helper: Render widget content with dynamic data
const renderWidgetContent = (
  widget: DashboardLayout,
  resolvedData?: ResolvedWidgetData,
  options?: {
    isLoading?: boolean;
    onConnectIntegration?: () => void;
    readOnly?: boolean;
  }
) => {
  if (options?.isLoading) {
    // Show specific skeleton based on widget type
    if (widget.widgetType === "metric") {
      return (
        <div className="h-full flex flex-col items-center justify-center space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      );
    }
    if (widget.widgetType === "table") {
      return (
        <div className="h-full flex flex-col p-2 space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      );
    }
    if (widget.widgetType === "chart" || widget.widgetType === "line_chart" || widget.widgetType === "bar_chart" || widget.widgetType === "area_chart" || widget.widgetType === "pie_chart") {
      return (
        <div className="h-full flex flex-col p-2 space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="flex-1 w-full rounded-md" />
        </div>
      );
    }

    // Default skeleton
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  const onConnectIntegration = options?.onConnectIntegration;

  const widgetData = widget.data;
  const metricConfig = widget.metricConfig;
  const isIntegrationMetric =
    widget.widgetType === "metric" &&
    !!metricConfig?.metricKey &&
    !!metricConfig?.integration;

  switch (widget.widgetType) {
    case "chart":
    case "pie_chart": {
      const series = Array.isArray((resolvedData as ResolvedWidgetData)?.series)
        ? ((resolvedData as ResolvedWidgetData).series as WidgetSeriesPoint[])
        : [];
      const hasData = series.length > 0;



      const chartData = series.map((point) => ({
        label: point.x,
        value: point.y,
      }));

      if (widget.metricConfig?.metricKey?.startsWith('youtube.')) {
        console.log(`[YouTubeData] Widget ${widget.i}: hasData=${hasData}, seriesCount=${series.length}, firstPoints=`, series.slice(0, 3));
      }

      return (
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="flex-1 min-h-[200px] relative">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={150}>
                {(() => {
                  const cType = (widget.data as ChartWidgetData)?.chartType?.toLowerCase() || (widget.widgetType === "pie_chart" ? "pie" : "area");
                  if (cType === "column" || cType === "bar") {
                    return (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        {!options?.readOnly && (
                          <Tooltip
                            formatter={(value: number) => value.toLocaleString()}
                            labelFormatter={(label: string) => label}
                            cursor={{ fill: "transparent" }}
                          />
                        )}
                        <Bar dataKey="value" fill="#2563EB" />
                      </BarChart>
                    );
                  }
                  if (cType === "line") {
                    return (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        {!options?.readOnly && (
                          <Tooltip
                            formatter={(value: number) => value.toLocaleString()}
                            labelFormatter={(label: string) => label}
                          />
                        )}
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#2563EB"
                          strokeWidth={2}
                          dot={false}
                          activeDot={options?.readOnly ? false : { r: 3, fill: "#2563EB" }}
                        />
                      </LineChart>
                    );
                  }
                  if (cType === "pie") {
                    // Use the existing interactive pie or Recharts pie? 
                    // The existing code fell back to ChartPieInteractive if no data.
                    // Here we have data. Let's use Recharts Pie for consistency with others if possible, or just default to Area/Pie placeholder logic if not fully implemented.
                    // But for now, let's just stick to the requested types that work well.
                    // Actually, if it's pie, let's return Area for now as a fallback if Pie isn't fully set up with Recharts here, 
                    // OR better, render a simple Pie chart.
                    return (
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#2563EB"
                          label
                        />
                        {!options?.readOnly && <Tooltip />}
                      </PieChart>
                    );
                  }
                  // Default to Area
                  return (
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      {!options?.readOnly && (
                        <Tooltip
                          formatter={(value: number) => value.toLocaleString()}
                          labelFormatter={(label: string) => label}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#2563EB"
                        strokeWidth={2}
                        fillOpacity={0.15}
                        fill="#2563EB"
                        dot={false}
                        activeDot={{ r: 3, fill: "#2563EB" }}
                      />
                    </AreaChart>
                  );
                })()}
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                {renderWidgetEmptyState(onConnectIntegration, "No chart data for this date range")}
              </div>
            )}
          </div>
          <div className="border-t px-3 py-2 text-xs md:text-sm space-y-1 min-h-[3.5rem]">
            {hasData
              ? series.slice(0, 4).map((point) => (
                <div
                  className="flex justify-between"
                  key={`${point.x}-${point.y}`}
                >
                  <span className="text-gray-500">{point.x}</span>
                  <span className="font-medium text-gray-900">{point.y}</span>
                </div>
              ))
              : renderWidgetEmptyState(onConnectIntegration)}
          </div>
        </div>
      );
    }

    case "line_chart":
    case "area_chart":
    case "bar_chart": {
      const series = Array.isArray((resolvedData as ResolvedWidgetData)?.series)
        ? ((resolvedData as ResolvedWidgetData).series as WidgetSeriesPoint[])
        : [];
      const hasData =
        series.length > 0 ||
        typeof (resolvedData as ResolvedWidgetData)?.total === "number";



      const chartData = series.map((point) => ({
        label: point.x,
        value: point.y,
      }));

      return (
        <div className="h-full flex flex-col p-1 min-h-0 relative">
          <div className="flex-1 min-h-[200px] relative">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                {widget.widgetType === "bar_chart" ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString()}
                      labelFormatter={(label: string) => label}
                    />
                    <Bar dataKey="value" fill="#2563EB" />
                  </BarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString()}
                      labelFormatter={(label: string) => label}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2563EB"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            ) : (
              <ChartLineMultiple data={[]} />
            )}
          </div>
          {!hasData && (
            <div className="border-t px-3 py-2 mt-2">
              {renderWidgetEmptyState(onConnectIntegration)}
            </div>
          )}
        </div>
      );
    }

    case "map": {
      const mapData = widgetData as MapWidgetData | undefined;
      return (
        <div className="h-full flex items-center justify-center text-xs md:text-sm text-gray-500 px-2">
          <span className="text-center">
            {mapData?.location ? `Map: ${mapData.location}` : "Map Placeholder"}
          </span>
        </div>
      );
    }

    case "table": {
      const tableData = widgetData as TableWidgetData | undefined;

      const isGaTopPagesTable =
        metricConfig?.metricKey === "ga.top_pages_views" &&
        !!metricConfig?.integration;

      const generateColumnsFromRows = (rows: any[]) => {
        if (!rows.length) return [];
        const sample = rows[0] as Record<string, unknown>;
        return Object.keys(sample).slice(0, 8).map((key) => ({
          name: key
            .replace(/[_-]/g, " ")
            .replace(/\s+/g, " ")
            .replace(/^\w/, (c) => c.toUpperCase()),
        }));
      };

      const resolvedRows =
        resolvedData && Array.isArray((resolvedData as any).rows)
          ? ((resolvedData as any).rows as unknown[])
          : null;

      // Check if this is dimensional data (from GET /unified-metrics with dimensionType)
      const isDimensionalData =
        resolvedRows &&
        resolvedRows.length > 0 &&
        resolvedRows[0] &&
        typeof resolvedRows[0] === 'object' &&
        resolvedRows[0] !== null &&
        (resolvedRows[0] as any).dimensionValue && // Check values are truthy (not null)
        'value' in (resolvedRows[0] as Record<string, unknown>);

      // If dimensional data, convert to simple 2-column format
      let dimensionalRows: Array<{ dimension: string; value: number }> | null = null;
      if (isDimensionalData && resolvedRows) {
        dimensionalRows = resolvedRows.map((row: any) => ({
          dimension: row.dimensionValue || row.dimensionType || 'Unknown',
          value: typeof row.value === 'number' ? row.value : 0,
        }));
      }

      const gaRows =
        isGaTopPagesTable &&
          resolvedData &&
          Array.isArray((resolvedData as any).rows)
          ? ((resolvedData as any).rows as unknown[])
          : null;

      // Generic metrics: if we have a series but no GA rows, render a simple
      // 2-column table from the series (label + value).
      let seriesRows =
        !isGaTopPagesTable &&
          !gaRows &&
          !dimensionalRows &&  // Don't use series if we have dimensional data
          (!metricConfig?.groupBy || metricConfig.groupBy === 'none' || metricConfig.groupBy === 'date') && // Only show series (time-series) if grouping is date-based or none. Don't show dates for 'device' tables.
          Array.isArray((resolvedData as ResolvedWidgetData)?.series)
          ? (((resolvedData as ResolvedWidgetData)
            .series as WidgetSeriesPoint[]) as unknown[])
          : null;

      // Fallback: if metric returns only a single value/total, build a 1-row series
      if (
        !isGaTopPagesTable &&
        !gaRows &&
        (!seriesRows || seriesRows.length === 0) &&
        metricConfig?.metricKey &&
        resolvedData
      ) {
        const value =
          typeof (resolvedData as ResolvedWidgetData)?.value === "number"
            ? (resolvedData as ResolvedWidgetData).value
            : typeof (resolvedData as ResolvedWidgetData)?.total === "number"
              ? (resolvedData as ResolvedWidgetData).total
              : null;

        if (value !== null) {
          const metricName =
            metricConfig.metricKey.split(".").pop() || metricConfig.metricKey;
          seriesRows = [{ x: metricName, y: value }] as unknown[];
        }
      }

      // For GA tables, filter series to only the core GA metric keys to avoid noisy dimension rows
      const isGaIntegration =
        (metricConfig?.integration || "").toLowerCase().replace(/_/g, "-") ===
        "google-analytics";
      if (isGaIntegration && seriesRows) {
        const allowedGaKeys = new Set([
          "google.activeUsers",
          "google.bounceRate",
          "google.pageViews",
          "google.sessions",
        ]);
        const filtered = (seriesRows as WidgetSeriesPoint[]).filter((p) =>
          allowedGaKeys.has(p.x)
        );
        seriesRows = filtered.length ? filtered : [];
      }

      // Identify which data source is driving the table so we render correct columns
      const usingGaRows = !!gaRows && gaRows.length > 0;
      const usingDimensionalRows = !usingGaRows && !!dimensionalRows && dimensionalRows.length > 0;
      const usingSeriesRows = !usingGaRows && !usingDimensionalRows && !!seriesRows && seriesRows.length > 0;
      const usingResolvedRows =
        !usingGaRows &&
        !usingDimensionalRows &&
        !usingSeriesRows &&
        !!resolvedRows &&
        resolvedRows.length > 0 &&
        (!metricConfig?.groupBy || metricConfig.groupBy === 'none' || metricConfig.groupBy === 'date');
      const usingTableData =
        !usingGaRows &&
        !usingDimensionalRows &&
        !usingSeriesRows &&
        !usingResolvedRows &&
        (!metricConfig?.metricKey) && // Never use static table data if a metric is configured
        !!tableData?.rows &&
        tableData.rows.length > 0;

      const rows =
        (usingGaRows ? (gaRows as any[]) : null) ??
        (usingDimensionalRows ? (dimensionalRows as any[]) : null) ??
        (usingResolvedRows ? (resolvedRows as any[]) : null) ??
        (usingSeriesRows ? (seriesRows as any[]) : null) ??
        (usingTableData ? tableData?.rows : null) ??
        (metricConfig?.metricKey ? [] : reportTableRows);

      const autoColumns =
        resolvedRows &&
          resolvedRows.length &&
          !gaRows &&
          !dimensionalRows &&
          !seriesRows &&
          (!tableData?.columns || tableData.columns.length === 0)
          ? generateColumnsFromRows(resolvedRows)
          : null;

      // Get dimension type from metricConfig for title
      const dimensionType = metricConfig?.groupBy || '';
      const metricName = metricConfig?.metricKey?.split('.').pop()?.replace(/_/g, ' ') || 'Metric';



      const caption =
        tableData?.caption ??
        (isGaTopPagesTable
          ? "Pages with the highest number of views."
          : "Queue of report deliveries.");

      const columns =
        isGaTopPagesTable
          ? [
            { name: "Page Path", width: "45%" },
            { name: "Title", width: "35%" },
            { name: "Views" },
          ]
          : usingDimensionalRows
            ? [
              { name: dimensionType.charAt(0).toUpperCase() + dimensionType.slice(1), width: "60%" },
              { name: metricName.charAt(0).toUpperCase() + metricName.slice(1) },
            ]
            : usingSeriesRows
              ? [
                { name: "Metric", width: "60%" },
                { name: "Value" },
              ]
              : usingResolvedRows && autoColumns
                ? autoColumns
                : tableData?.columns && tableData.columns.length
                  ? tableData.columns
                  : [
                    { name: "Report", width: "35%" },
                    { name: "Audience" },
                    { name: "Status" },
                    { name: "Last Run" },
                    { name: "Next Send" },
                  ];

      const rawCount =
        typeof resolvedData?.rawCount === "number" ? resolvedData.rawCount : 0;
      const rowCount = Array.isArray(rows) ? rows.length : 0;
      const hasTableData = rawCount > 0 || rowCount > 0;

      return (
        <Card className="h-full flex flex-col rounded-lg border-0 shadow-none">

          <CardContent className="flex-1 p-0 overflow-visible">
            <div className="w-full h-full overflow-x-auto">
              <Table className="w-full table-fixed text-xs md:text-sm">
                <TableCaption className="text-[10px] md:text-xs">
                  {caption}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead
                        key={col.name}
                        className="truncate px-2 md:px-4"
                        style={col.width ? { width: col.width } : undefined}
                      >
                        {col.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={row.name || index}>
                      {columns.map((col, colIndex) => {
                        // For dynamic columns, we need to map column names to row properties
                        let cellValue: unknown;

                        if (isGaTopPagesTable && gaRows) {
                          const gaRow = row as any;
                          cellValue =
                            col.name === "Page Path"
                              ? gaRow.pagePath
                              : col.name === "Title"
                                ? gaRow.pageTitle || "Untitled"
                                : col.name === "Views"
                                  ? gaRow.views
                                  : "";
                        } else if (usingDimensionalRows) {
                          const dimRow = row as { dimension: string; value: number };
                          cellValue =
                            colIndex === 0
                              ? dimRow.dimension
                              : dimRow.value;
                        } else if (usingSeriesRows) {
                          const sRow = row as any as WidgetSeriesPoint;
                          cellValue =
                            col.name === "Metric"
                              ? sRow.x
                              : col.name === "Value"
                                ? sRow.y
                                : "";
                        } else if (resolvedRows) {
                          const genericRow = row as Record<string, unknown>;
                          cellValue =
                            genericRow[col.name] ??
                            genericRow[col.name.replace(/\s+/g, "")] ??
                            genericRow[col.name.toLowerCase()] ??
                            genericRow[col.name
                              .toLowerCase()
                              .replace(/\s+/g, "_")] ??
                            "";
                        } else {
                          cellValue =
                            col.name === "Report"
                              ? (row as any).name
                              : col.name === "Audience"
                                ? (row as any).audience
                                : col.name === "Status"
                                  ? (row as any).status
                                  : col.name === "Last Run"
                                    ? (row as any).lastRun
                                    : col.name === "Next Send"
                                      ? (row as any).nextSend
                                      : (row as Record<string, unknown>)[col.name] ??
                                      (row as Record<string, unknown>)[
                                      col.name.toLowerCase().replace(/\s+/g, "")
                                      ] ?? "";
                        }

                        if (
                          !isGaTopPagesTable &&
                          !usingSeriesRows &&
                          col.name === "Status"
                        ) {
                          return (
                            <TableCell
                              key={colIndex}
                              className="truncate px-2 md:px-4"
                            >
                              <span
                                className={`inline-flex items-center rounded-full border px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium ${getStatusBadgeClass(
                                  row.status
                                )}`}
                              >
                                {String(cellValue)}
                              </span>
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell
                            key={colIndex}
                            className={`px-2 md:px-4 ${colIndex === 0
                              ? "font-medium truncate"
                              : "truncate"
                              }`}
                          >
                            {col.name === "Views" && isGaTopPagesTable
                              ? Number(cellValue ?? 0).toLocaleString()
                              : String(cellValue ?? "")}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          {!hasTableData && (
            <div className="border-t px-3 py-2">
              {renderWidgetEmptyState(
                onConnectIntegration,
                "No table data yet"
              )}
            </div>
          )}
        </Card>
      );
    }

    case "title": {
      const titleData = widgetData as TitleWidgetData | undefined;
      const text = titleData?.text ?? "Demo title";
      const fontSize = titleData?.fontSize ?? "2xl";
      const align = titleData?.align ?? "center";

      // Map fontSize to Tailwind classes
      const fontSizeClass =
        fontSize === "xs"
          ? "text-xs"
          : fontSize === "sm"
            ? "text-sm"
            : fontSize === "base"
              ? "text-base"
              : fontSize === "lg"
                ? "text-lg"
                : fontSize === "xl"
                  ? "text-xl"
                  : fontSize === "2xl"
                    ? "text-2xl"
                    : fontSize === "3xl"
                      ? "text-3xl"
                      : fontSize === "4xl"
                        ? "text-4xl"
                        : "text-2xl";

      const alignClass =
        align === "left"
          ? "justify-start"
          : align === "right"
            ? "justify-end"
            : "justify-center";

      return (
        <div
          className={`h-full w-full flex items-center ${alignClass} hover:border text-xs md:text-sm text-gray-900`}
          style={{
            ...(titleData?.backgroundColor
              ? { backgroundColor: titleData.backgroundColor }
              : {}),
            ...(titleData?.padding
              ? { padding: titleData.padding }
              : {}),
          }}
        >
          <span
            className={`${fontSizeClass} font-semibold break-words text-center`}
            style={titleData?.color ? { color: titleData.color } : undefined}
          >
            {text}
          </span>
        </div>
      );
    }

    case "metric": {
      const metricData = widgetData as MetricWidgetData | undefined;

      // For integration-based metrics, prefer resolved values from the API.
      // For Content Blocks "Stat" widgets (manual), we ignore resolvedData and
      // never show the "Connect Integration" empty state.
      // Check resolved value with loose type checking to support strings
      const val = resolvedData?.value;
      const tot = resolvedData?.total;

      const resolvedValue =
        isIntegrationMetric && val != null && !isNaN(Number(val))
          ? Number(val)
          : isIntegrationMetric && tot != null && !isNaN(Number(tot))
            ? Number(tot)
            : undefined;



      const dataRawCount =
        isIntegrationMetric && typeof resolvedData?.rawCount === "number"
          ? resolvedData.rawCount
          : 0;
      const hasData = isIntegrationMetric
        ? resolvedValue !== undefined || dataRawCount > 0
        : true;

      return (
        <div className="flex-1 w-full flex flex-col items-center justify-center text-xs md:text-sm px-2 text-center min-h-[100px]">
          <span className="text-2xl md:text-3xl font-bold text-gray-900">
            {resolvedValue ?? metricData?.value ?? 0}
            {metricData?.unit && (
              <span className="text-base md:text-lg text-gray-600 ml-1">
                {metricData.unit}
              </span>
            )}
          </span>


          {/* Trend & Comparison (Manual / Custom Metrics) */}
          {(metricData?.trendValue || metricData?.comparisonValue) && (
            <div className="flex flex-col items-center mt-2 gap-0.5">
              {metricData.trendValue && (
                <div
                  className={`flex items-center text-xs font-medium ${metricData.trendDirection === "up"
                    ? "text-green-600"
                    : metricData.trendDirection === "down"
                      ? "text-red-600"
                      : "text-gray-500"
                    }`}
                >
                  {metricData.trendDirection === "up" && "▲ "}
                  {metricData.trendDirection === "down" && "▼ "}
                  {metricData.trendValue}
                </div>
              )}
              {metricData.comparisonValue && (
                <div className="text-[10px] text-gray-400">
                  vs {metricData.comparisonValue}
                </div>
              )}
            </div>
          )}

          {!options?.readOnly && !metricData?.hideDataPoints && (
            <span className="text-[10px] md:text-xs text-gray-500 mt-1">
              {isIntegrationMetric && typeof resolvedData?.rawCount === "number"
                ? resolvedData.rawCount
                : 0}{" "}
              {isIntegrationMetric ? "data points" : ""}
            </span>
          )}
          {isIntegrationMetric && !hasData && (
            <div className="w-full mt-3">
              {renderWidgetEmptyState(onConnectIntegration)}
            </div>
          )}
        </div>
      );
    }

    case "image": {
      const imageData = widgetData as ImageWidgetData | undefined;
      const imageFit = imageData?.imageFit || "contain";
      return (
        <div
          className="h-full flex items-center justify-center text-xs md:text-sm text-gray-500 p-0"
          style={
            imageData?.backgroundColor
              ? { backgroundColor: imageData.backgroundColor }
              : undefined
          }
        >
          {imageData?.src ? (
            <img
              src={imageData.src}
              alt={imageData.alt ?? "Image"}
              className="max-w-full max-h-full rounded"
              style={{ objectFit: imageFit }}
            />
          ) : (
            <span className="text-center">Image Placeholder</span>
          )}
        </div>
      );
    }

    case "embed": {
      const embedData = widgetData as EmbedWidgetData | undefined;
      const title = embedData?.title || "Embedded content";
      const url = embedData?.url || "";

      return (
        <div
          className="h-full flex items-center justify-center text-xs md:text-sm text-gray-500 p-1 md:p-2 embed-widget"
          data-embed-title={title}
          data-embed-url={url}
          style={
            embedData?.backgroundColor
              ? { backgroundColor: embedData.backgroundColor }
              : undefined
          }
        >
          {url ? (
            <iframe
              src={url}
              className="w-full h-full border-0 rounded"
              title={title}
            />
          ) : (
            <span className="text-center">Embed Placeholder</span>
          )}
        </div>
      );
    }

    case "custom": {
      const customData = widgetData as CustomWidgetData | undefined;
      const customStyle = {
        backgroundColor: customData?.backgroundColor || undefined,
        color: customData?.textColor || undefined,
        textAlign: customData?.align ?? "left",
      } as React.CSSProperties;
      const heading =
        customData?.title && customData.title.trim().length > 0
          ? customData.title.trim()
          : null;
      // Tasks-style custom block
      if (customData?.type === "tasks") {
        const tasks =
          (customData.content ?? "")
            .split("\n")
            .map((t) => t.trim())
            .filter(Boolean) || [];

        return (
          <div
            className="h-full flex flex-col items-stretch justify-start text-xs md:text-sm text-gray-800 px-3 py-2 rounded-md"
            style={customStyle}
          >
            {heading && (
              <div className="font-semibold mb-2 text-gray-900">{heading}</div>
            )}
            {tasks.length === 0 ? (
              <span className="text-[11px] text-gray-400">
                No tasks yet. Use the editor to add tasks.
              </span>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {tasks.map((task, idx) => (
                  <li key={idx} className="break-words">
                    {task}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }

      // Table-of-contents style custom block
      if (customData?.type === "toc") {
        const lines =
          (customData.content ?? "")
            .split("\n")
            .map((t) => t.trim())
            .filter(Boolean) || [];

        return (
          <div
            className="h-full flex flex-col items-stretch justify-start text-xs md:text-sm text-gray-800 px-3 py-2 rounded-md"
            style={customStyle}
          >
            <div className="font-semibold mb-2">
              {heading ?? "Table of Contents"}
            </div>
            {lines.length === 0 ? (
              <span className="text-[11px] text-gray-400">
                Add one entry per line in the editor to build the table of
                contents.
              </span>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-1 pr-2 w-8 text-[11px] text-gray-500">
                        #
                      </th>
                      <th className="py-1 text-[11px] text-gray-500">
                        Section
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, idx) => (
                      <tr key={idx} className="border-b last:border-b-0">
                        <td className="py-1 pr-2 align-top text-gray-500">
                          {idx + 1}
                        </td>
                        <td className="py-1 align-top break-words">{line}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      }

      // Generic custom text block with Mini-Markdown support
      const renderMarkdownLine = (line: string, idx: number) => {
        // Helper to process inline styles (bold, italic)
        const processInline = (text: string) => {
          const parts = text.split(/(\*\*.*?\*\*|_.*?_)/g);
          return parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith("_") && part.endsWith("_")) {
              return <em key={i}>{part.slice(1, -1)}</em>;
            }
            return part;
          });
        };

        if (line.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-xl font-bold my-2 text-gray-900">
              {processInline(line.slice(2))}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-lg font-semibold my-2 text-gray-800">
              {processInline(line.slice(3))}
            </h2>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <div key={idx} className="flex gap-2 ml-1 my-0.5">
              <span className="text-gray-400">•</span>
              <span>{processInline(line.slice(2))}</span>
            </div>
          );
        }
        // Regular paragraph (preserve empty lines as spacing)
        return (
          <p key={idx} className={`my-0.5 ${!line.trim() ? "h-2" : ""}`}>
            {processInline(line)}
          </p>
        );
      };

      const lines = (customData?.content ?? "Custom Placeholder").split("\n");

      return (
        <div
          className="h-full flex flex-col items-start justify-start text-xs md:text-sm text-gray-800 px-3 py-2 rounded-md w-full overflow-y-auto whitespace-pre-wrap break-words"
          style={customStyle}
        >
          {heading && (
            <div className="font-semibold mb-2 text-gray-900 border-b pb-1 w-full">
              {heading}
            </div>
          )}
          <div className="w-full">
            {lines.map((line, idx) => renderMarkdownLine(line, idx))}
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="h-full flex items-center justify-center text-xs md:text-sm text-gray-500 px-2">
          <span className="text-center">
            {String(widget.widgetType).charAt(0).toUpperCase() +
              String(widget.widgetType).slice(1)}{" "}
            Placeholder
          </span>
        </div>
      );
  }
};

export interface WidgetFormState {
  slideId: number;
  widgetId: string;
  widgetType: ReportWidgetType | "";
  data?: WidgetData;
  i?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

interface ReportBuilderProps {
  readOnly?: boolean;
  providedReportId?: number;
  shareToken?: string;
  initialData?: any;
}

function ReportBuilder({ readOnly = false, providedReportId, shareToken, initialData }: ReportBuilderProps = {}) {
  const params = useParams<{ clientId: string; id?: string }>();
  const parsedClientId = params.clientId ? parseInt(params.clientId) : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Template State
  const [templateId, setTemplateId] = useState<number | null>(
    providedReportId ?? (params.id && params.id !== "new" ? parseInt(params.id) : null)
  );
  // Initialize dashboards based on integrations
  const [dashboards, setDashboards] = useState<DashboardMap>(() => {
    // Start with empty map, will be populated based on integrations
    return new Map([[0, []]]);
  });
  const [isDashboardsInitialized, setIsDashboardsInitialized] = useState(false);

  // Custom pages state (pages added by user, not from integrations)
  const [customPages, setCustomPages] = useState<
    Array<{ id: number; name: string; subtitle?: string }>
  >([]);

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
  const [pageOrder, setPageOrder] = useState<number[]>([]);

  const dashboardIds = useMemo(
    () => Array.from(dashboards.keys()).sort((a, b) => a - b),
    [dashboards]
  );

  const effectivePageOrder = useMemo(() => {
    const order = pageOrder.length > 0 ? pageOrder : dashboardIds;
    // Filter out IDs that are not in dashboards to prevent rendering ghost pages
    // or pages that have been deleted but linger in pageOrder state
    return order.filter(id => dashboards.has(id));
  }, [pageOrder, dashboardIds, dashboards]);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const widgetRefs = useRef<Map<number, Map<string, HTMLDivElement>>>(
    new Map()
  );
  const [rightPanelTitle, setRightPanelTitle] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    getInitialDateRange()
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
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    data: integrationsData,
    isLoading: isLoadingIntegrations,
  } = useIntegrations(effectiveClientId, { enabled: !readOnly });

  // Debug log with safe handling of undefined
  if (integrationsData) {
    console.log(integrationsData, "integrationsData", parsedClientId);
  }

  // NOTE: We only enable 'available metrics' fetch if we have a clientId
  // If we are in 'shared' mode, we might not have clientId initially,
  // but once template loads, effectiveClientId will be set.
  const {
    groupedMetrics,
    isLoading: isLoadingAvailableMetrics,
    error: availableMetricsError,
  } = useAvailableMetrics(effectiveClientId, { enabled: !readOnly });

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

  const handleConfirmNewReport = useCallback(() => {
    const trimmedName = newReportName.trim();
    if (!trimmedName) {
      toast.error("Please enter a report name");
      return;
    }

    // Prevent creating a report if there are no connected integrations
    if ((integrationsData?.integrations?.length ?? 0) === 0) {

      toast.error(
        "You need to connect at least one data source before creating a report."
      );
      return;
    }

    // Build default widgets for all connected integrations
    const widgets: ReportWidgetDefinition[] = [];
    const slidesMeta: ReportSlideMeta[] = [];
    const pageOrder: number[] = [];

    integrationsData?.integrations.forEach((integration, index) => {
      // 1. Pick default metrics for this integration
      // Use the groupedMetrics from the hook, falling back if needed
      console.log(`[CreateReport] Picking defaults for ${integration.platform} (Account: ${integration.accountId})`);
      const metrics = pickDefaultMetricsForIntegration(
        integration.platform,
        integration.accountId,
        groupedMetrics,
        (msg) => console.log(msg) // valid fallback logger
      );

      // Custom enforced defaults for Meta Business and Meta Ads
      const normalizedPlatform = integration.platform.toLowerCase().replace(/_/g, '-');
      if (['meta-business', 'meta-ads'].includes(normalizedPlatform)) {

        let targetKeys: string[] = [];

        if (normalizedPlatform === 'meta-business') {
          targetKeys = [
            // Facebook
            'meta.facebook.post.comments',
            'meta.facebook.post.engagedUsers',
            'meta.facebook.post.engagement',
            'meta.facebook.followers',
            'meta.facebook.post.impressions',
            'meta.facebook.post.likes',
            'meta.facebook.postsCount',
            'meta.facebook.post.reach',
            'meta.facebook.post.reactions',
            'meta.facebook.post.shares',
            // Instagram
            'meta.instagram.media.comments',
            'meta.instagram.media.engagement',
            'meta.instagram.followers',
            'meta.instagram.media.impressions',
            'meta.instagram.media.likes',
            'meta.instagram.mediaCount',
          ];
        } else if (normalizedPlatform === 'meta-ads') {
          targetKeys = [
            'meta.ads.clicks',
            'meta.ads.cpc',
            'meta.ads.impressions',
            'meta.ads.spend',
          ];
        }

        // Aggregate all potentially relevant metrics
        // We look at all meta sources because sometimes they are cross-listed or grouped
        const allMetrics: MetricOption[] = [];
        const ads = groupedMetrics['meta-ads'] || groupedMetrics['meta_ads'] || {};
        const fb = groupedMetrics['meta-facebook'] || groupedMetrics['meta_facebook'] || {};
        const ig = groupedMetrics['meta-instagram'] || groupedMetrics['meta_instagram'] || {};

        const pushMetrics = (source: any, integ: string) => {
          Object.values(source).forEach((accountMetrics: any) => {
            if (Array.isArray(accountMetrics)) {
              allMetrics.push(...accountMetrics.map((m: any) => ({ ...m, integration: integ })));
            }
          });
        };

        pushMetrics(ads, 'meta-ads');
        pushMetrics(fb, 'meta-facebook');
        pushMetrics(ig, 'meta-instagram');

        // Filter and sort based on targetKeys
        const enforcedMetrics = targetKeys.map(key => allMetrics.find(m => m.metricKey === key)).filter((m): m is MetricOption => !!m);

        if (enforcedMetrics.length > 0) {
          console.log(`[CreateReport] Enforcing ${enforcedMetrics.length} defaults for ${normalizedPlatform}`);
          // Override the default picker result with our enforced list
          // We splice to empty the array and then push new items to keep the reference if it matters, 
          // though assigning metrics = ... would be fine if we weren't in a loop of a larger scope potentially.
          // Actually, 'metrics' here is a local const from pickDefault... return. We can't reassign it if it's const.
          // But wait, the code above defined it as `const metrics = ...`. 
          // We need to mutate the array or change the declaration. 
          // Since I can't change the declaration in this block easily without a larger diff, I will clear and push.
          metrics.length = 0;
          metrics.push(...enforcedMetrics);
        } else {
          console.warn(`[CreateReport] ⚠️ Could not find any enforced defaults for ${integration.platform}. Falling back to standard defaults if any.`);
        }
      }

      // 2. Build widgets from these metrics
      const integrationWidgets = buildDefaultWidgetsForIntegration(index, metrics);

      // 3. Map to API Widget Definitions
      integrationWidgets.forEach((w) => {
        if (w.metricConfig) {
          // Normalize integration name for backend (e.g. google-analytics -> google_analytics)
          // Exception: google-search-console uses hyphens
          // Exception: woocommerce uses 'woo'
          let backendIntegration = w.metricConfig.integration || "";

          if (backendIntegration === 'woocommerce') {
            backendIntegration = 'woo';
          } else if (backendIntegration !== 'google-search-console') {
            backendIntegration = backendIntegration.replace(/-/g, '_');
          }

          widgets.push({
            ...w.metricConfig,
            id: w.i,
            // Ensure integration is set to the normalized backend value
            integration: backendIntegration,
            layout: {
              slideId: index,
              x: w.x,
              y: w.y,
              w: w.w,
              h: w.h,
            },
            type: w.widgetType,
            // Ensure any necessary data is preserved in config
            ...(w.data ? { widgetData: w.data } : {}),
          });
        }
      });

      // 4. Create Slide Meta
      slidesMeta.push({
        id: index,
        title: "", // Will fallback to integration name in sidebar
        subtitle: "",
        source: "integration",
        integrationIndex: index,
      });

      // 5. Add to page order
      pageOrder.push(index);
    });

    const payload: CreateTemplatePayload = {
      ...defaultTemplatePayload,
      name: trimmedName,
      widgets: widgets.length > 0 ? widgets : defaultTemplatePayload.widgets,
      slidesMeta: slidesMeta,
      pageOrder: pageOrder,
    };

    console.log('Sending Report Template Payload:', payload);
    createTemplate(payload);
    setIsNameDialogOpen(false);
  }, [createTemplate, defaultTemplatePayload, newReportName, integrationsData, groupedMetrics]);


  // Apply saved default date range from template (if present)
  useEffect(() => {
    const data = templateQuery.data;
    if (!data?.defaultDateFrom || !data?.defaultDateTo) return;

    const from = new Date(data.defaultDateFrom);
    const to = new Date(data.defaultDateTo);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return;
    }

    setDateRange({ from, to });
  }, [templateQuery.data?.defaultDateFrom, templateQuery.data?.defaultDateTo]);

  // Handle template query errors
  useEffect(() => {
    if (templateQuery.error) {
      const error = templateQuery.error as ApiError;
      if (error.status === 404) {
        // For existing report IDs, do NOT auto-create a new template.
        // Just inform the user and go back to the reports list.
        templateBootstrapRef.current = false;
        toast.error("Report not found");
        if (!readOnly) {
          navigate(`/clients/${parsedClientId}/reports`);
        }
        return;
      }

      if (error.status === 401 || error.status === 403) {
        toast.error("You do not have permission to view this report. The link may be invalid or expired.");
        return;
      }

      toast.error(error.message || "Failed to load report template");
    }
  }, [templateQuery.error, navigate, parsedClientId]);

  // Initialize slides based on connected integrations (only for new reports without template data)
  useEffect(() => {
    // Only initialize if we don't have template data and integrations are loaded
    if (
      templateQuery.data?.widgets ||
      (templateQuery.data?.slides && templateQuery.data.slides.length > 0) ||
      (templateQuery.data?.slidesMeta && templateQuery.data.slidesMeta.length > 0) ||
      !integrationsData?.integrations ||
      isDashboardsInitialized
    ) {
      return;
    }

    const integrations = integrationsData.integrations;

    if (integrations.length === 0) {
      // No integrations, start empty and let AutoPopulate fill in if data arrives later
      setDashboards(new Map());
      setPageOrder([]);
    } else {
      // Create one slide per integration
      const newDashboards = new Map<number, DashboardLayout[]>();
      const initialOrder: number[] = [];
      const seenIds = new Set<number>();

      integrations.forEach((_, index) => {
        if (!seenIds.has(index)) {
          newDashboards.set(index, []);
          initialOrder.push(index);
          seenIds.add(index);
        }
      });
      setDashboards(newDashboards);
      // Force empty order to let Sidebar fallback execute (shows all integrations)
      // AutoPopulate will eventually sort this out if needed, but safe default is empty.
      setPageOrder([]);
    }

    setIsDashboardsInitialized(true);
  }, [integrationsData, templateQuery.data, isDashboardsInitialized]);

  // Ensure pageOrder always matches current slide IDs (integrations + custom pages)
  // Skip this if we have template data with a saved pageOrder (to preserve template order)
  // Ensure pageOrder always matches current slide IDs (integrations + custom pages)
  useEffect(() => {
    // If we have template data with a saved pageOrder, don't auto-sync initially.
    // However, if the user adds a new integration or page, dashboards will change,
    // and we MUST update pageOrder to include the new ID.

    // We rely on the fact that `dashboards` ref only changes when we actually add/remove slides.
    const ids = Array.from(dashboards.keys());

    setPageOrder((prevOrder) => {
      if (ids.length === 0) return prevOrder;

      // If no existing order, just use current ids
      if (prevOrder.length === 0) return ids;

      const idSet = new Set(ids);

      // 1) Keep existing order but drop any ids that no longer exist
      const filtered = prevOrder.filter((id) => idSet.has(id));

      // 2) Deduplicate just in case
      const uniqueFiltered = Array.from(new Set(filtered));

      // 3) Append any new ids that weren't in previous order
      const existingSet = new Set(uniqueFiltered);
      ids.forEach((id) => {
        if (!existingSet.has(id)) {
          uniqueFiltered.push(id);
        }
      });

      // Only update if the order actually changed (optimization)
      if (
        uniqueFiltered.length === prevOrder.length &&
        uniqueFiltered.every((val, index) => val === prevOrder[index])
      ) {
        return prevOrder;
      }

      return uniqueFiltered;
    });
  }, [dashboards]);

  // Map each slideId to its integration (if any) so we can restrict drops to the
  // matching integration page.
  const slideIntegrationMap = useMemo(() => {
    const map = new Map<
      number,
      { platform: string; accountId: string; accountName?: string }
    >();

    // Iterate through integrations array by index
    // The slideId corresponds to the array index
    integrationsData?.integrations?.forEach((integ, index) => {
      if (integ) {
        map.set(index, {
          platform: integ.platform,
          accountId: integ.accountId,
          accountName: integ.accountName,
        });
      }
    });

    return map;
  }, [integrationsData?.integrations]);

  // Update template data when loaded successfully
  useEffect(() => {
    if (!templateQuery.data) return;
    console.log("🐛 [ReportBuilder] Loaded Template Data:", templateQuery.data);

    // Sync customPages (used by the left "Pages" sidebar) with backend slide
    // titles/subtitles so names stay stable across saves/refreshes. Merge
    // backend-provided custom pages with any local-only custom pages so that
    // newly added pages don't disappear immediately after a save.
    if (Array.isArray(templateQuery.data.slidesMeta)) {
      const slidesMeta = templateQuery.data.slidesMeta;

      setCustomPages((prev) => {
        // Custom pages coming from backend slidesMeta
        const fromBackend = slidesMeta
          // Only treat slides explicitly marked as "custom" (or legacy slides
          // that don't clearly map to an integration) as custom pages.
          .filter((slide: any, index: number) => {
            if (slide.source === "custom") return true;
            if (slide.source === "integration") return false;

            // Legacy: if there's an integration at this index or slideId,
            // assume it's an integration slide, not custom.
            const integration =
              integrationsData?.integrations?.[index] ??
              integrationsData?.integrations?.[slide.id];
            return !integration;
          })
          .map((slide: any) => ({
            id: slide.id,
            name: slide.title,
            subtitle: slide.subtitle,
          }));

        const backendIds = new Set(fromBackend.map((p: any) => p.id));

        // Keep any local custom pages that the backend doesn't know about yet
        const preservedLocal = prev.filter((p: any) => !backendIds.has(p.id));

        return [...preservedLocal, ...fromBackend];
      });
    }

    // Prevent race condition: If integrations are still loading, numIntegrations will be 0.
    // This causes legitimate slides (e.g. index 0) to be seen as ghosts and deleted.
    // We must wait for integrationsData to be fully loaded before running this logic.
    if ((!readOnly && isLoadingIntegrations) || (!readOnly && !integrationsData?.integrations)) {
      return;
    }

    const map = buildDashboardMapFromTemplate(
      (templateQuery.data.widgets ?? []) as ReportWidgetDefinition[]
    );

    // Initial population: Ensure every integration has at least an empty dashboard entry
    // so it shows up in the UI and in the saved payload.
    if (integrationsData?.integrations) {
      integrationsData.integrations.forEach((_, index) => {
        if (!map.has(index)) {
          map.set(index, []);
        }
      });
    }

    // Remap backend IDs to integration indices if applicable
    // This fixes the issue where backend assigns new IDs (e.g. 500) to integration slides (e.g. 0),
    // causing duplicates in the sidebar.
    const idMapping = new Map<number, number>(); // backendId -> frontendId
    const numIntegrations = integrationsData?.integrations?.length ?? 0;

    // Helper to rescue widgets from a ghost/malformed slide
    const attemptRescue = (backendId: number) => {
      const ghostWidgets = map.get(backendId) || [];
      if (ghostWidgets.length > 0 && integrationsData?.integrations) {
        const firstWidget = ghostWidgets[0];
        // Helper to normalize backend integration names (snake_case) to frontend (kebab-case)
        const normalize = (s: string) => s.toLowerCase().replace(/_/g, '-');
        const widgetIntegration = normalize(firstWidget.metricConfig?.integration || '');

        console.log(`[RescueDebug] Attempting to rescue ghost ${backendId}. First Widget Int: '${firstWidget.metricConfig?.integration}' -> Normalized: '${widgetIntegration}'`);

        const targetIndex = integrationsData.integrations.findIndex(i => {
          const plat = normalize(i.platform);
          const isMatch = plat === widgetIntegration ||
            (plat === 'woocommerce' && widgetIntegration === 'woo') ||
            (plat === 'google-search-console' && widgetIntegration === 'google-console') ||
            (plat === 'meta-business' && ['meta-facebook', 'meta-instagram'].includes(widgetIntegration)); // Exclude 'meta-ads' to prevent merging

          // console.log(`[RescueDebug] Checking against platform '${i.platform}' (norm: '${plat}') -> Match: ${isMatch}`);
          return isMatch;
        });

        if (targetIndex !== -1) {
          const existing = map.get(targetIndex) || [];
          // Avoid duplicates if we already rescued or populated
          // For Meta Business, we might have multiple "ghost" slides (one for FB, one for IG) mapping to the same target
          // So we should append, not just skip if existing is non-empty, OR be smart about it.
          // Actually, if we simply append, we might duplicate if the target already has its *own* widgets?
          // But usually the target (valid integration) starts empty if it was "lost".
          // If we have mixed content, appending is safer than losing data.

          // Update widgets to point to new slideId (layout consistency)
          const updatedWidgets = ghostWidgets.map(w => ({
            ...w,
            slideId: targetIndex
          }));

          if (existing.length === 0) {
            map.set(targetIndex, updatedWidgets);
            console.log(`[ReportBuilder] Rescued ${ghostWidgets.length} widgets from ghost ${backendId} to ${targetIndex} (${integrationsData.integrations[targetIndex].platform})`);
          } else {
            // If data already exists, merge it
            map.set(targetIndex, [...existing, ...updatedWidgets]);
            console.log(`[ReportBuilder] Merged ${ghostWidgets.length} widgets from ghost ${backendId} into existing slide ${targetIndex}`);
          }
        } else {
          console.warn(`[RescueDebug] FAILED to rescue ghost ${backendId}. No matching integration found for widgetIntegration: '${widgetIntegration}'`);
        }
      } else {
        console.log(`[RescueDebug] Ghost ${backendId} has no widgets to rescue.`);
      }
      map.delete(backendId);
    };

    if (Array.isArray(templateQuery.data.slidesMeta)) {
      templateQuery.data.slidesMeta.forEach((slide: any) => {
        const backendId = Number(slide.id);
        const integrationIndex = slide.integrationIndex;

        // If this slide corresponds to an integration index
        if (typeof integrationIndex === 'number' && !isNaN(integrationIndex)) {

          // Robustness Check: If the saved integration index is out of bounds (e.g. a ghost slide with index=884),
          // we ignore it to prevent it from cluttering the UI as a duplicate "Integration" page.
          if (slide.source === 'integration' && integrationIndex >= numIntegrations) {
            console.warn(`[ReportBuilder] Ignoring ghost slide id=${backendId} index=${integrationIndex}`);
            attemptRescue(backendId);
            return;
          }

          const frontendId = integrationIndex;
          idMapping.set(backendId, frontendId);

          // If the IDs differ, move the widgets
          if (backendId !== frontendId) {
            if (map.has(backendId)) {
              const widgets = map.get(backendId) || [];
              // Merge with any existing widgets at frontendId (though usually empty)
              const existing = map.get(frontendId) || [];
              map.set(frontendId, [...existing, ...widgets]);
              map.delete(backendId);
            }
          }
        } else {
          // Custom page, ensure it has an entry
          // But avoid adding if it looks like a ghost integration slide (large ID, no title, source=integration)
          // This catches cases where integrationIndex might be missing but it's clearly an integration slide
          if (slide.source === 'integration' && numIntegrations > 0) {
            console.warn(`[ReportBuilder] Ignoring malformed ghost slide id=${backendId}`);
            attemptRescue(backendId);
            return;
          }

          if (!map.has(backendId)) {
            map.set(backendId, []);
          }
        }
      });
    }

    setDashboards(map);
    setIsDashboardsInitialized(true);

    // If backend returns a saved page order, apply it so pages/sidebar and slides
    // appear in the same order after reload.
    if (
      Array.isArray(templateQuery.data.pageOrder) &&
      templateQuery.data.pageOrder.length > 0
    ) {
      // Deduplicate and Remap loaded order
      const rawOrder = Array.from(new Set<number>((templateQuery.data.pageOrder as any[]).map((x: any) => Number(x))));
      const remappedOrder: number[] = rawOrder.map((id: number) => idMapping.has(id) ? idMapping.get(id)! : id);
      setPageOrder(Array.from(new Set(remappedOrder)));
    }

    // Sync saved date range from template
    if (templateQuery.data.defaultDateFrom && templateQuery.data.defaultDateTo) {
      const savedFrom = new Date(templateQuery.data.defaultDateFrom);
      const savedTo = new Date(templateQuery.data.defaultDateTo);
      // Only update if valid dates
      if (!isNaN(savedFrom.getTime()) && !isNaN(savedTo.getTime())) {
        setDateRange({ from: savedFrom, to: savedTo });
      }
    }
  }, [templateQuery.data, integrationsData?.integrations]);

  const templateName = isTemplateError
    ? "Report Not Found"
    : prettifyMetricLabel((templateQuery.data?.name ?? newReportName) || "Untitled Report");

  // Signature of all metric widgets in the current dashboards/layout state.
  // This ensures we refetch report data whenever the user adds/removes widgets
  // or changes their metric configuration, even before saving.
  const widgetSignature = useMemo(() => {
    const ids: string[] = [];
    dashboards.forEach((layout) => {
      layout.forEach((widget) => {
        const metric = widget.metricConfig;
        if (!metric?.metricKey) return;
        ids.push(
          [
            metric.id ?? widget.i,
            metric.metricKey,
            metric.integration ?? "",
            metric.accountId ?? "",
            metric.groupBy ?? "",
            metric.aggregation ?? "",
          ].join(":")
        );
      });
    });
    return ids.join("|");
  }, [dashboards]);

  // Auto-save: Debounced save when dashboards, customPages, or templateName changes
  useEffect(() => {
    // Skip auto-save if:
    // - No template ID (new template not yet created)
    // - Template is loading
    // - Template is being bootstrapped
    // - Read-only mode
    if (!templateId || isTemplateLoading || templateBootstrapRef.current || readOnly) {
      return;
    }

    // Mark that there are unsaved changes
    setHasUnsavedChanges(true);

    // Debounce: wait 1 second after last change before saving
    const timer = setTimeout(() => {
      const payload = buildTemplatePayloadFromDashboards();
      saveTemplate(payload);
    }, 1000);

    return () => clearTimeout(timer);
  }, [dashboards, customPages, templateName, templateId, isTemplateLoading, readOnly]);


  // Ensure there is at least one slide per connected integration (e.g., GA + GSC).
  // If integrations were added after the template was created, append empty slides
  // so they show up in the Pages sidebar and canvas.
  // If ENABLE_AUTO_DEFAULT_WIDGETS is true, pre-populate with default widgets.
  useEffect(() => {
    // If we are loading an existing template (params.id exists), do NOT run this
    // auto-population logic if we have populated template data.
    // However, if the template is effectively empty (newly created), allow auto-population.
    const isTemplateEmpty = templateQuery.data &&
      (!templateQuery.data.widgets || templateQuery.data.widgets.length === 0);

    if (params.id && templateQuery.data && !isTemplateEmpty) {
      return;
    }

    // If we are still loading an existing template, wait
    if (params.id && (isTemplateLoading || !templateQuery.data)) {
      return;
    }

    const integrationIds = integrationsData?.integrations?.map((_, idx) => idx) ?? [];

    if (!integrationIds.length || !isDashboardsInitialized) return;

    setDashboards((prev) => {
      let changed = false;
      const updated = new Map(prev);

      integrationIds.forEach((id) => {
        if (!updated.has(id)) {
          // Slide doesn't exist yet - create it
          if (ENABLE_AUTO_DEFAULT_WIDGETS && groupedMetrics && !isLoadingAvailableMetrics) {
            // Auto-populate with default widgets
            const integration = integrationsData?.integrations?.[id];
            if (integration) {
              const picked = pickDefaultMetricsForIntegration(
                integration.platform,
                integration.accountId,
                groupedMetrics as any,
                (msg) => toast.warning(msg)
              );
              const defaults = buildDefaultWidgetsForIntegration(id, picked);
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
          // Slide exists - check if it's empty and should be populated
          const existing = updated.get(id);
          if (existing && existing.length === 0) {
            const integration = integrationsData?.integrations?.[id];
            if (integration) {
              const picked = pickDefaultMetricsForIntegration(
                integration.platform,
                integration.accountId,
                groupedMetrics as any,
                (msg) => toast.warning(msg)
              );
              const defaults = buildDefaultWidgetsForIntegration(id, picked);
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
      console.log('[PageOrderDebug] Update start:', { prev, integrationIds });

      const existing = new Set(base);
      let changed = false;
      integrationIds.forEach((id) => {
        if (!existing.has(id)) {
          base.push(id);
          existing.add(id);
          changed = true;
        }
      });
      console.log('[PageOrderDebug] Update end:', { changed, result: changed ? base : prev });
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
    // We intentionally omit full objects/arrays that might be referentially unstable
    // integrationsData?.integrations, groupedMetrics, templateQuery.data
  ]);
  const dateRangeKey = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return "none";
    return `${dateRange.from.toISOString()}_${dateRange.to.toISOString()}`;
  }, [dateRange]);

  // Allow widget resolution even for new unsaved reports (no templateId yet)
  // This ensures auto-created default widgets get data immediately
  const shouldResolveWidgets =
    Boolean(dateRange?.from && dateRange?.to) &&
    Boolean(widgetSignature) &&
    Boolean(effectiveClientId || shareToken);

  const reportDataQuery = useQuery<Record<string, ResolvedWidgetData>>({
    queryKey: ["report-data", templateId, dateRangeKey, widgetSignature, shareToken],
    enabled: shouldResolveWidgets,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        return {};
      }

      // Build the widgets to resolve from the current dashboards state
      const templatePayload = buildTemplatePayloadFromDashboards();
      const widgets = (templatePayload.widgets ?? []).filter(
        (widget: ReportWidgetDefinition) => widget.metricKey
      );

      if (!widgets.length) {
        return {};
      }



      const dateFrom = formatApiDate(dateRange.from);
      const dateTo = formatApiDate(dateRange.to);

      // Group widgets by unique query parameters to deduplicate requests
      const uniqueQueries = new Map<string, ReportWidgetDefinition[]>();

      widgets.forEach((widget) => {
        // Create a unique hash for the data requirements
        // normalizedIntegration is calculated later, but strict inputs are enough for grouping
        const queryHash = JSON.stringify({
          i: widget.integration,
          m: widget.metricKey,
          a: widget.accountId,
          f: widget.filters
        });

        if (!uniqueQueries.has(queryHash)) {
          uniqueQueries.set(queryHash, []);
        }
        uniqueQueries.get(queryHash)!.push(widget);
      });

      console.log(`🚀 Optimizing Data Fetch: Reduced ${widgets.length} widgets to ${uniqueQueries.size} unique API requests.`);

      // Fetch data for each UNIQUE query signature
      // OR use pre-loaded snapshot data if available (Shared Reports)
      const queryPromises = Array.from(uniqueQueries.entries()).map(async ([hash, localWidgets]) => {
        // Use the first widget in the group as the prototype
        const widget = localWidgets[0];

        // 1. Check for Pre-loaded Snapshot Data (Shared Report Mode)
        // In shared mode, the data is often already in the template response (snapshot object).
        // The API layer (reportingApi.ts) attaches this data to the widget definition as `snapshotData`.

        // IMPORTANT: We only use snapshot data IF the current dateRange matches the report's 
        // default dates. If the user changed the date, we MUST fetch fresh data.
        const defaultFrom = templateQuery.data?.defaultDateFrom ? formatApiDate(new Date(templateQuery.data.defaultDateFrom)) : null;
        const defaultTo = templateQuery.data?.defaultDateTo ? formatApiDate(new Date(templateQuery.data.defaultDateTo)) : null;
        if (!dateRange?.from || !dateRange?.to) return { hash, widgets: localWidgets, data: null };
        const currentFrom = formatApiDate(dateRange.from!);
        const currentTo = formatApiDate(dateRange.to!);

        const isDefaultRange = !defaultFrom || !defaultTo || (currentFrom === defaultFrom && currentTo === defaultTo);

        // Snapshots only apply for Shared views where we want consistent static data
        if ((widget as any).snapshotData && isDefaultRange && !!shareToken) {
          console.log(`⚡ Using snapshot data for widget group [${widget.metricKey}]`);
          return { hash, widgets: localWidgets, data: (widget as any).snapshotData };
        }

        try {
          // 2. Normal Fetch Mode (Editor Mode or Missing Data)
          // Normalize integration key to match backend schema
          let normalizedIntegration = widget.integration.toLowerCase();

          // Only replace underscores with hyphens for non-Meta integrations
          if (!normalizedIntegration.startsWith("meta_")) {
            normalizedIntegration = normalizedIntegration.replace(/_/g, '-');
          }

          if (normalizedIntegration === "google") {
            normalizedIntegration = "google-analytics";
          } else if (normalizedIntegration === "woocommerce") {
            normalizedIntegration = "woo";
          } else if (normalizedIntegration === "meta-business") {
            // "meta-business" is a frontend container; route to underlying API integration
            if (widget.metricKey.includes("facebook") || widget.metricKey.startsWith("meta.page") || widget.metricKey.startsWith("meta.facebook")) {
              normalizedIntegration = "meta-facebook";
            } else if (widget.metricKey.includes("instagram") || widget.metricKey.startsWith("meta.instagram")) {
              normalizedIntegration = "meta-instagram";
            }
          }

          // Validate integration key
          const validIntegrations = [
            'google-analytics',
            'google-search-console',
            'google-console',
            'meta',
            'meta-facebook',
            'meta-instagram',
            'meta-ads',
            'meta_facebook',
            'meta_instagram',
            'meta_ads',
            'youtube', 'shopify', 'woo'
          ];

          if (!validIntegrations.includes(normalizedIntegration)) {
            // Return null for this whole group
            return { hash, widgets: localWidgets, data: null };
          }

          // Validate metric key format
          const hasValidPrefix =
            widget.metricKey.startsWith('google.') ||
            widget.metricKey.startsWith('google_seo.') ||
            widget.metricKey.startsWith('google-console.') ||
            widget.metricKey.startsWith('meta.') ||
            widget.metricKey.startsWith('youtube.') ||
            widget.metricKey.startsWith('shopify.') ||
            widget.metricKey.startsWith('woo.');

          if (!hasValidPrefix) {
            console.warn(`⚠️ Invalid metric key format: ${widget.metricKey}`);
            return { hash, widgets: localWidgets, data: null };
          }

          const params = {
            integration: normalizedIntegration,
            metricKey: widget.metricKey,
            startDate: dateFrom,
            endDate: dateTo,
            token: shareToken,
          };

          // Override for Shopify: Fetch directly from Shopify-specific API
          if (normalizedIntegration === 'shopify') {
            try {
              let rows: UnifiedMetricRow[] = [];
              const startD = dateFrom;
              const endD = dateTo;

              // Only attempt direct fetch if we have a clientId (authenticated session)
              // Shared reports (without clientId) will fall back to unified-metric API below
              if (effectiveClientId) {
                const trendsData = await getShopifyTrends(effectiveClientId, { startDate: startD, endDate: endD });

                if (trendsData.success && trendsData.trends) {
                  // Strictly filter by date range
                  rows = trendsData.trends
                    .filter(t => t.date >= startD && t.date <= endD)
                    .map((t) => {
                      let val = 0;
                      if (widget.metricKey === 'shopify.revenue') val = t.revenue;
                      else if (widget.metricKey === 'shopify.orders') val = t.orders;
                      else if (widget.metricKey === 'shopify.avgOrderValue') val = t.orders > 0 ? (t.revenue / t.orders) : 0;

                      return {
                        id: Math.floor(Math.random() * 1000000), // dummy ID
                        metricKey: widget.metricKey,
                        value: val,
                        date: t.date,
                        integration: 'shopify',
                        // Force undefined to trigger "Global Metric" self-healing
                        accountId: undefined,
                        userId: 0,
                        clientId: effectiveClientId,
                        recordedAt: new Date().toISOString(),
                        dimensionType: '',
                        dimensionValue: '',
                        extra: null
                      } as UnifiedMetricRow;
                    });
                  return { hash, widgets: localWidgets, data: { success: true, rows, pagination: { page: 1, limit: rows.length, total: rows.length, totalPages: 1 } } };
                }
              }
            } catch (err) {
              console.error("Shopify Direct Fetch Error", err);
            }
          }

          const data = await fetchUnifiedMetric(effectiveClientId, params);

          return { hash, widgets: localWidgets, data };
        } catch (error) {
          console.error(`❌ Failed to fetch data for group [${widget.metricKey}]:`, error);
          return { hash, widgets: localWidgets, data: null };
        }
      });

      const responses = await Promise.all(queryPromises);

      // Flatten results back to individual widget IDs
      const results = responses.flatMap(({ widgets: groupWidgets, data }) => {
        return groupWidgets.map(w => ({
          id: w.id,
          widget: w,
          data
        }));
      });

      // Process and format data for each widget type
      const merged: Record<string, ResolvedWidgetData> = {};

      results.forEach(({ id, widget, data }) => {
        // Shared Reports: Snapshot data is ALREADY resolved (has value/total/series directly)
        // We can identify this because it might lack 'rows' but have the other fields.
        const isSnapshotData = data && (
          (data as any).series ||
          typeof (data as any).value === 'number' ||
          typeof (data as any).total === 'number'
        ) && !data.rows;

        if (isSnapshotData) {
          // It's already in the format we need, just use it directly!
          // But ensure we have at least empty arrays for safety
          merged[id] = {
            value: (data as any).value ?? 0,
            total: (data as any).total ?? 0,
            rawCount: (data as any).rawCount ?? 0,
            rows: [], // Snapshot data usually doesn't store raw rows
            series: (data as any).series ?? []
          };
          return;
        }

        // Standard API Response: Must have rows to process
        if (!data || !data.rows || !Array.isArray(data.rows)) {
          console.warn(`⚠️ Widget ${id} has no valid data, using empty state`);
          merged[id] = { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
          return;
        }

        if (widget.integration === 'shopify') {
          console.log('[ShopifyDebug] Raw Data for Widget:', { id, rows: data.rows });
        }

        // Filter rows by accountId and metricKey
        // For metric cards and charts, also filter out dimensional data (dimensionType should be empty)
        // EXCEPTION: WooCommerce uses dimensionType="date" for time-series, which we want to include
        // EXCEPTION: meta-ads returns all campaigns, so we don't filter by accountId
        // For tables, keep dimensional data

        // Helper to normalize integration names (handle underscores, specific mappings)
        const normalizeIntegration = (name: string) => {
          const lower = (name || '').toLowerCase();
          if (lower === 'woo' || lower === 'woocommerce') return 'woocommerce';
          if (lower === 'google' || lower === 'google-analytics' || lower === 'google_analytics') return 'google-analytics';
          if (lower === 'youtube') return 'youtube';

          if (lower.startsWith('meta_') || lower.startsWith('meta-')) {
            return lower.replace(/-/g, '_'); // Meta likes underscores
          }
          return lower.replace(/_/g, '-'); // Others like hyphens
        };

        const widgetIntegration = normalizeIntegration(widget.integration);

        // Check if the widget's integration is a Meta integration (e.g., meta_facebook, meta_instagram, meta_ads)
        // This is used to relax accountId filtering for Meta integrations, as they often return data
        // across multiple accounts or for a "business" container rather than a specific ad account.
        // const isMetaIntegration = widgetIntegration.startsWith('meta_');

        // Loose Matching Logic for accountId mismatch fallback
        // First try strict match
        let matchingRows = data.rows.filter((row: any) => {
          const rowIntegration = normalizeIntegration(row.integration || '');
          const strictMatch = (widgetIntegration.startsWith('meta_') || widgetIntegration === 'meta-business' || widgetIntegration === 'woocommerce')
            ? (row.metricKey === widget.metricKey)
            : (row.metricKey === widget.metricKey &&
              // Handle null vs undefined mismatch (e.g. widget.accountId=null, row.accountId=undefined)
              (row.accountId == widget.accountId || String(row.accountId) === String(widget.accountId)) &&
              rowIntegration === widgetIntegration);
          return strictMatch;
        });

        // If strict match fails, try loose match (ignore account ID) for ANY integration
        // This fixes the issue where cloned templates have stale account IDs but the API returns valid data for the client
        if (matchingRows.length === 0) {
          matchingRows = data.rows.filter((row: any) => {
            const rowIntegration = normalizeIntegration(row.integration || '');
            const looseMatch = (
              row.metricKey === widget.metricKey &&
              rowIntegration === widgetIntegration
            );
            return looseMatch;
          });
          if (matchingRows.length > 0) {
            console.log(`⚠️ Widget ${id} caused accountId mismatch. Falling back to simple metric key match. (Expected: ${widget.accountId})`);
          }
        }

        const filteredRows = matchingRows.filter((row: any) => {
          // Additional Dimension Filters (re-apply on the matched set)
          // For tables, we want dimensional data
          if (widget.type === 'table') {
            return true;
          }

          // For metric cards and charts, exclude dimensional data
          // EXCEPT for time-series dimensions (day, date, week, month)
          // EXCEPT for YouTube which has dimensionType="video" but we want to aggregate by date
          const dimType = (row.dimensionType || '').replace('ga:', '').toLowerCase();
          const isDimensional = dimType !== "";
          const isTimeDimension = dimType === 'day' || dimType === 'date' || dimType === 'week' || dimType === 'month' || dimType === 'year';
          const isYouTubeDimension = widget.metricKey.startsWith('youtube.') && (dimType === 'video' || row.dimensionType === 'video');

          // Include if: not dimensional OR is a time dimension OR is YouTube video dimension
          return (!isDimensional || isTimeDimension || isYouTubeDimension);
        });

        // Calculate total value
        const total = filteredRows.reduce((sum: number, row: any) => sum + (row.value || 0), 0);

        // Create time-series data for charts
        // For YouTube and other integrations with dimensional data, aggregate by date
        const seriesMap = new Map<string, number>();
        filteredRows.forEach((row: any) => {
          const dateKey = row.date || row.dimensionValue || '';
          if (dateKey) {
            const currentValue = seriesMap.get(dateKey) || 0;
            seriesMap.set(dateKey, currentValue + (row.value || 0));
          }
        });

        const series = Array.from(seriesMap.entries())
          .map(([x, y]) => ({ x, y }))
          .sort((a, b) => {
            // Sort by date if x is a date string, otherwise keep original order
            const dateA = new Date(a.x).getTime();
            const dateB = new Date(b.x).getTime();
            if (!isNaN(dateA) && !isNaN(dateB)) {
              return dateA - dateB;
            }
            return 0;
          });

        // Format based on widget type
        if (widget.type === 'table') {
          // For tables, keep dimensional data
          merged[id] = {
            rows: filteredRows,
            rawCount: filteredRows.length,
          };
        } else if (
          widget.type === 'line_chart' ||
          widget.type === 'bar_chart' ||
          widget.type === 'area_chart' ||
          widget.type === 'pie_chart' ||
          widget.type === 'chart'
        ) {
          // For charts, include series
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
          };
        }

      });

      return merged;
    },
  });





  // Handle report data query errors
  useEffect(() => {
    if (reportDataQuery.error) {
      const error = reportDataQuery.error as ApiError;
      toast.error(error.message || "Failed to resolve widget data");
    }
  }, [reportDataQuery.error]);

  // Merge resolved widgets with table widget data and WooCommerce data
  const resolvedWidgets = useMemo(() => {
    // All data is now fetched via reportDataQuery using GET /unified-metrics
    return reportDataQuery.data ?? {};
  }, [reportDataQuery.data]);




  // gaResolvedWidgets removed

  const buildTemplatePayloadFromDashboards =
    useCallback((): CreateTemplatePayload => {
      const widgets: ReportWidgetDefinition[] = [];
      // Build slidesMeta earlier so we can use it to bake titles into widgets
      const slideIdList = Array.from(dashboards.keys());
      const existingMeta = templateQuery.data?.slidesMeta ?? [];

      console.log(`🏗️ [Frontend Builder] Dashboards Size: ${dashboards.size}`);
      console.log(`🏗️ [Frontend Builder] Existing Meta:`, existingMeta);
      console.log(`🏗️ [Frontend Builder] Dashboards Keys:`, Array.from(dashboards.keys()));

      const slidesMeta = slideIdList.map((slideId, index) => {
        const fromExisting = existingMeta.find((m: any) => m.id === slideId);
        const fromCustom = customPages.find((p) => p.id === slideId);

        if (fromExisting && fromCustom) {
          return { ...fromExisting, title: fromCustom.name, subtitle: fromCustom.subtitle ?? fromExisting.subtitle };
        }
        if (fromExisting) return { ...fromExisting };
        if (fromCustom) return { id: slideId, title: fromCustom.name, subtitle: fromCustom.subtitle, source: "custom" as const };

        const integration = integrationsData?.integrations?.[index] ?? integrationsData?.integrations?.[slideId];
        if (integration) {
          const platformConfig = getPlatformConfig(integration.platform);
          return {
            id: slideId,
            title: platformConfig?.name || integration.platform,
            subtitle: integration.accountName,
            source: "integration" as const,
            integrationIndex: slideId
          };
        }
        return { id: slideId, title: "Untitled page", source: "custom" as const };
      });

      // Build widgets array from current dashboards/layouts
      dashboards.forEach((layout, slideId) => {
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

          // DATA INTEGRITY DEBUG
          if (slideMeta?.source === 'integration') {
            const intgName = slideMeta.title;
            console.log(`📦 [PayloadBuilder] Processing widget for ${intgName} (Slide ${slideId}):`, {
              id: widget.i, type: widget.widgetType, key: metricConfig.metricKey
            });
          }

          // Self-Healing: If we have resolved live data, ensure the saved widget
          // uses the correctly matched accountId. This fixes "ghost" attributes
          // where the widget thinks it belongs to Account ID 21 but data only exists for Account ID 1.
          // Self-Healing debug logs
          const widgetId = metricConfig.id ?? widget.i;
          const resolvedData = resolvedWidgets[widgetId] as ResolvedWidgetData | undefined;
          let fixedAccountId = metricConfig.accountId;

          console.log(`🩹 [Self healing check] Widget: ${widgetId} / ${metricConfig.metricKey}`, {
            currentAccountId: fixedAccountId,
            hasResolvedData: !!resolvedData,
            rowsLength: resolvedData?.rows?.length
          });

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
            filters: {
              ...existingFilters,
              widgetData: widget.data as unknown,
              displayName,
              // Bake slide info into first widget as a recovery beacon
              ...(indexInSlide === 0 ? { slideTitle: slideMeta?.title, slideSubtitle: slideMeta?.subtitle } : {}),
            },
          });
        });

        // Per-slide summary log
        // console.log(`📦 [PayloadBuilder] Slide ${slideId} has ${layout.length} widgets.`);
      });

      return {
        name: templateName,
        widgets,
        pageOrder: effectivePageOrder,
        slidesMeta,
      };
    }, [
      dashboards,
      templateName,
      templateQuery.data?.slidesMeta,
      customPages,
      integrationsData,
      effectivePageOrder,
      resolvedWidgets,
    ]);

  const { mutate: saveTemplate, isPending: isSavingTemplate } = useMutation({
    mutationFn: async (payload: CreateTemplatePayload) => {
      if (!templateId || !parsedClientId) {
        throw new Error("Template not ready or missing client id");
      }
      return updateReportTemplate(parsedClientId, templateId, payload);
    },
    onSuccess: () => {
      // We already keep the in-memory dashboards (with full widget data)
      // as the source of truth. Avoid immediately re-hydrating from the
      // backend, since the backend may not yet persist manual widgetData
      // (content blocks), which would make them appear to "reset" after save.
      setLastSavedTime(new Date());
      setHasUnsavedChanges(false);
      toast.success("Report template saved");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to save template");
    },
  });

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

    console.log("💾 [handleSaveTemplate] Clicked. Checking inputs...");
    console.log(`💾 [handleSaveTemplate] Dashboards Size: ${dashboards.size}`);
    console.log(`💾 [handleSaveTemplate] Dashboards Keys:`, Array.from(dashboards.keys()));

    const basePayload = buildTemplatePayloadFromDashboards();

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
          const optimizedData = { ...liveData };

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
      // Persist current page order (slide order) to backend
      pageOrder: pageOrder.length > 0 ? pageOrder : Array.from(dashboardIds),
    };

    console.log("payload", payload);
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
      await exportAllSlidesToPDF(slidesRef.current, effectivePageOrder);
    } catch (error) {
      console.error("Failed to generate PDF from frontend", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [isGeneratingPdf, effectivePageOrder]);

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
      const existingIds = Array.from(dashboards.keys());
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : -1;
      const nextId = Math.max(1000, maxId + 1);

      // Add to custom pages
      setCustomPages((prev) => [
        ...prev,
        { id: nextId, name: pageName, subtitle },
      ]);

      // Add empty slide
      setDashboards((prev) => {
        const updated = new Map(prev);
        updated.set(nextId, []);
        return updated;
      });

      // Add to page order
      setPageOrder((prev) => {
        // If we had no custom order (empty), strictly use current dashboardIds as base
        // otherwise simply append to the existing custom order
        const base = prev.length > 0 ? prev : Array.from(dashboards.keys());
        return [...base, nextId];
      });

      return nextId;
    },
    [dashboards]
  );

  const handleDeletePage = useCallback((slideId: number) => {
    // Remove the slide from dashboards
    setDashboards((prev) => {
      const updated = new Map(prev);
      updated.delete(slideId);
      return updated;
    });

    // Remove from custom pages (if it was a custom page)
    setCustomPages((prev) => prev.filter((p) => p.id !== slideId));

    // Remove from page order
    setPageOrder((prev) => prev.filter((id) => id !== slideId));

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
  }, []);

  const handleReorderPages = useCallback(
    (fromIndex: number, toIndex: number) => {
      setPageOrder((prevOrder) => {
        const baseOrder =
          prevOrder.length > 0 ? [...prevOrder] : Array.from(dashboards.keys());
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= baseOrder.length ||
          toIndex >= baseOrder.length
        ) {
          return baseOrder;
        }
        const [movedItem] = baseOrder.splice(fromIndex, 1);
        baseOrder.splice(toIndex, 0, movedItem);
        return baseOrder;
      });
    },
    [dashboards]
  );

  const handleAddIntegrationPage = useCallback((integrationIndex: number) => {
    // 1. Check if we already have this slide (shouldn't happen if UI filters correctly, but safety first)
    if (dashboards.has(integrationIndex)) {
      toast.error("This integration page already exists");
      return;
    }

    // 2. Create the slide with default widgets if enabled
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
        defaultWidgets = buildDefaultWidgetsForIntegration(integrationIndex, picked);
      }
    }

    // 3. Add to dashboards
    setDashboards((prev) => {
      const updated = new Map(prev);
      updated.set(integrationIndex, defaultWidgets);
      return updated;
    });

    // 4. Add to page order (append to end)
    setPageOrder((prev) => {
      const newOrder = [...prev, integrationIndex];
      // Force immediate save to persist the new slide and its widgets
      // We construct the payload manually here because state updates (setDashboards) are async
      // and wouldn't be reflected in buildTemplatePayloadFromDashboards() immediately.
      setTimeout(() => {
        setHasUnsavedChanges(true); // Trigger the effect or let the effect handle it?
        // Actually, the effect depends on [dashboards], so setDashboards will trigger it.
        // But we want to ensure it happens.
      }, 0);
      return newOrder;
    });

    toast.success("Integration page added");

    // 5. Scroll to new page
    setTimeout(() => {
      if (slidesRef.current[integrationIndex]) {
        slidesRef.current[integrationIndex]?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

  }, [dashboards, groupedMetrics, isLoadingAvailableMetrics, integrationsData]);

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

      // Also update widgetFormState to keep it in sync
      setWidgetFormState((prev) => ({
        ...prev,
        data: newData,
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
      const widgetType = e.dataTransfer?.getData(
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

        if (
          expected &&
          normalize(metricData.integration) !== normalize(expected.platform)
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
      const { w, h } = WIDGET_SIZE_MAP[widgetType] ?? { w: 4, h: 3 };

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

  const createLayoutChangeHandler = useCallback(
    (id: number, currentLayout: DashboardLayout[]) => (newLayout: Layout[]) => {
      const mergedLayout = currentLayout.map((item) => {
        const updated = newLayout.find((n) => n.i === item.i);
        return updated ? { ...item, ...updated } : item;
      });

      updateDashboard(id, mergedLayout);
    },
    [updateDashboard]
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

    switch (widgetFormState.widgetType) {
      case "title":
        return (
          <TitleWidgetForm
            data={widgetFormState.data as TitleWidgetData}
            onChange={changeHandler}
          />
        );
      case "metric":
        return (
          <MetricWidgetForm
            data={widgetFormState.data as MetricWidgetData}
            onChange={changeHandler}
          />
        );
      case "chart":
        return (
          <ChartWidgetForm
            data={widgetFormState.data as ChartWidgetData}
            onChange={changeHandler}
          />
        );
      case "table":
        return (
          <TableWidgetForm
            data={widgetFormState.data as TableWidgetData}
            onChange={changeHandler}
          />
        );
      case "image":
        return (
          <ImageWidgetForm
            data={widgetFormState.data as ImageWidgetData}
            onChange={changeHandler}
          />
        );
      case "embed":
        return (
          <EmbedWidgetForm
            data={widgetFormState.data as EmbedWidgetData}
            onChange={changeHandler}
          />
        );
      case "custom": {
        const customData = widgetFormState.data as CustomWidgetData;
        if (customData?.type === "tasks") {
          return (
            <TasksWidgetForm
              data={customData}
              onChange={changeHandler as (data: CustomWidgetData) => void}
            />
          );
        }
        return (
          <CustomWidgetForm
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
                      onClick={() =>
                        setSelectedIntegrationForMetrics({
                          platform: integration.platform,
                          accountId: integration.accountId,
                          accountName: integration.accountName,
                        })
                      }
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

      // Special handling for Meta Business: merge Facebook and Instagram metrics if not found under "meta-business"
      if ((platform === "meta-business" || normalizedPlatform === "meta-business") && Object.keys(metricsByAccount).length === 0) {
        const fbMetrics = groupedMetrics["meta-facebook"] || groupedMetrics["meta_facebook"] || {};
        const igMetrics = groupedMetrics["meta-instagram"] || groupedMetrics["meta_instagram"] || {};

        // Merge accounts from both
        const allAccounts = new Set([...Object.keys(fbMetrics), ...Object.keys(igMetrics)]);

        allAccounts.forEach(accId => {
          const fb = fbMetrics[accId] || [];
          const ig = igMetrics[accId] || [];

          const combined = [
            ...fb.map(m => ({ ...m, displayName: `Facebook - ${m.displayName || m.metricKey}`, integration: "meta-business" })),
            ...ig.map(m => ({ ...m, displayName: `Instagram - ${m.displayName || m.metricKey}`, integration: "meta-business" }))
          ];

          if (combined.length > 0) {
            metricsByAccount[accId] = combined as any;
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
          console.log('⚠️ Sidebar: Using CURATED_DEFAULTS fallback for', platform);
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
      const metricTypeOptions: Array<{ type: ReportWidgetType; label: string }> =
        [
          { type: "metric", label: "#" },
          { type: "line_chart", label: "↗" },
          { type: "bar_chart", label: "▮▮" },
          { type: "table", label: "T" },
        ];

      return (
        <div className="w-full h-full flex flex-col overflow-y-auto">
          {/* Header with back + integration name */}
          <div className="px-3 pt-3 pb-2 border-b space-y-2">
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
          <div className="flex-1 overflow-y-auto">
            {isLoadingAvailableMetrics ? (
              <div className="px-4 py-4 text-xs text-gray-500">
                Loading metrics...
              </div>
            ) : filteredMetrics.length === 0 ? (
              <div className="px-4 py-4 text-xs text-gray-500">
                No metrics found for this integration.
              </div>
            ) : (
              filteredMetrics.map((metric) => (
                <div
                  key={metric.metricKey}
                  className="flex items-center gap-2 px-3 py-2 border-b hover:bg-gray-50"
                >
                  {platformConfig && (
                    <platformConfig.icon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: platformConfig.color }}
                    />
                  )}
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
                        // Do NOT hardcode widget.accountId here.
                        // Leave it undefined so Self-Healing logic can detect it's a "Global" metric and clear the accountId in the saved template.
                        accountId: undefined,
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

  const showFullPageSkeleton = isTemplateLoading || !isDashboardsInitialized;

  // Use appropriate grid config based on screen size
  const currentGridConfig = isTablet ? TABLET_GRID_CONFIG : GRID_CONFIG;

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
            <span className="font-medium text-lg md:text-xl">Report Builder</span>
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
            {!readOnly && (
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
                    })).filter(integ => !dashboards.has(integ.index)) ?? []}
                    // Pass through slide metadata from the template, augmented with any
                    // in-memory custom pages so newly added pages appear immediately in
                    // the sidebar even before a full save/refresh round-trip.
                    slidesMeta={(() => {
                      const rawBase =
                        (templateQuery.data?.slidesMeta as
                          | ReportSlideMeta[]
                          | undefined) ?? [];

                      const numIntegrations = integrationsData?.integrations?.length ?? 0;

                      // Filter out ghost slides (integration slides with index out of bounds)
                      const base = rawBase.filter(s => {
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

                      // Ensure base integration slides have their integrationIndex set if missing
                      const augmentedBase = base.map(s => {
                        if (s.source === "integration" && s.integrationIndex === undefined) {
                          return { ...s, integrationIndex: Number(s.id) };
                        }
                        return s;
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
                <div className="w-full max-w-5xl my-4 space-y-8">
                  {/* Skeleton Slide 1 */}
                  <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8 border-b pb-4">
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                      </div>
                      <Skeleton className="h-64 w-full rounded-lg" />
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
                          className="layout"
                          layout={layout}
                          cols={currentGridConfig.cols}
                          rowHeight={currentGridConfig.rowHeight}
                          autoSize={true}
                          margin={currentGridConfig.margin}
                          containerPadding={isTablet ? [8, 8] : [14, 14]}
                          isDroppable={!readOnly}
                          isDraggable={!readOnly}
                          isResizable={!readOnly}
                          compactType={null}
                          draggableHandle=".drag-handle"
                          draggableCancel=".non-draggable"
                          onDrop={(layoutArr, layoutItem, e) =>
                            handleDrop(layoutArr, layoutItem, e as DragEvent, id)
                          }
                          onLayoutChange={createLayoutChangeHandler(id, layout)}
                        >
                          {layout.map((widget) => {
                            const dataKey = widget.metricConfig?.id ?? widget.i;
                            const widgetResolvedData: ResolvedWidgetData | undefined =
                              resolvedWidgets[dataKey];

                            // Check if GSC table with no data
                            const isGscTable =
                              widget.widgetType === "table" &&
                              widget.metricConfig?.integration
                                ?.toLowerCase()
                                .includes("google-search-console");
                            const hasData =
                              widgetResolvedData &&
                              Array.isArray(widgetResolvedData.rows) &&
                              widgetResolvedData.rows.length > 0;

                            // If condition met, return null directly (no div wrapper)
                            if (isGscTable && !hasData) {
                              return null;
                            }

                            return (
                              <div
                                key={widget.i}
                                ref={createWidgetRefCallback(id, widget.i)}
                              >
                                <WidgetCard
                                  widget={widget}
                                  resolvedData={widgetResolvedData}
                                  onContentClick={createWidgetClickHandler(id)}
                                  onDelete={() => handleDeleteWidget(id, widget.i)}
                                  readOnly={readOnly}
                                >
                                  {renderWidgetContent(widget, widgetResolvedData, {
                                    isLoading:
                                      (shouldResolveWidgets &&
                                        reportDataQuery.status === "pending") ||
                                      (reportDataQuery.isFetching && !widgetResolvedData),
                                    onConnectIntegration: handleConnectIntegration,
                                    readOnly: readOnly,
                                  })}
                                </WidgetCard>
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
            {!readOnly && (
              <div className="sticky top-[calc(var(--rb-header)+var(--rb-subheader))] right-0 flex  border-l h-[calc(100vh-(var(--rb-header)+var(--rb-subheader)))] overflow-y-visible z-20">
                <div
                  className={`${rightPanelTitle !== ""
                    ? "w-48 md:w-56 lg:w-[16.25rem]"
                    : "w-0 overflow-hidden"
                    } h-full transition-all duration-300`}
                >
                  <div className="w-full p-3 md:p-4 border-b font-semibold text-sm md:text-base text-accent-foreground">
                    {rightPanelTitle}
                  </div>

                  {rightPanelContent}
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
          </>
        )}
      </div>
    </div>
  );
}

export default ReportBuilder;
