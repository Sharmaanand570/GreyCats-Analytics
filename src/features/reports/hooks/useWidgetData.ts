import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useRef } from "react";
import type { ReportWidgetDefinition, ResolvedWidgetData } from "../api/types";
import type { UnifiedMetricRow } from "../api/reportingApi";
import {
  fetchUnifiedMetric,
  fetchMetaStoredPosts,
  fetchInstagramStoredMedia,
  fetchMetaAdsCampaignPerformance,
  fetchGoogleAdsCampaignPerformance,
  fetchGoogleAdsSummary,
  fetchUnifiedAggregate,
} from "../api/reportingApi";
import {
  getGoogleConsoleTopPages,
  getGoogleConsoleTopQueries
} from "@/features/YouTube/API/googleConsoleapi";
import { getShopifyTrends } from "@/features/shopify/API/shopifyApi";
import { getMetricAggregation } from "@/utils/facebookMetrics";
import api from "@/apiConfig";

// ---------------------------------------------------------------------------
// Concurrency limiter – REMOVED: Let the browser native HTTP/2 multiplexing handle it.
// The artificial JS queue was deadlocking/pausing fast API responses.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseWidgetDataParams {
  widget: ReportWidgetDefinition;
  effectiveClientId: number | null | undefined;
  dateFrom: string;
  dateTo: string;
  shareToken?: string;
  integrationsData: any;
  isLoadingIntegrations: boolean;
  /** Whether the slide containing this widget is visible / near viewport */
  isSlideVisible: boolean;
}

// ---------------------------------------------------------------------------
// Query key generator (shared with useResolvedWidgetsMap)
// ---------------------------------------------------------------------------

export function getWidgetQueryKey(
  widget: ReportWidgetDefinition,
  dateFrom: string,
  dateTo: string,
  shareToken?: string
) {
  const metricKeyLower = (widget.metricKey || "").toLowerCase();
  let integrationForKey = widget.integration;
  if (metricKeyLower.startsWith("google_seo.")) integrationForKey = "google-search-console";
  else if (metricKeyLower.startsWith("google_ads.")) integrationForKey = "google-ads";
  else if (metricKeyLower.startsWith("google.")) integrationForKey = "google-analytics";
  else if (metricKeyLower.startsWith("meta.instagram.")) integrationForKey = "meta-instagram";
  else if (metricKeyLower.startsWith("meta.facebook.") || metricKeyLower.startsWith("meta.page.")) integrationForKey = "meta-facebook";
  else if (metricKeyLower.startsWith("meta.ads.")) integrationForKey = "meta-ads";
  else if (metricKeyLower.startsWith("youtube.")) integrationForKey = "youtube";

  // Derive effective groupBy the same way fetchRawWidgetData does.
  // NOTE: widget.filters is intentionally excluded — it contains heavy snapshot/widget data
  // (widgetData, snapshotData, displayName, slideTitle) that is never sent to any API call.
  // Including it caused multi-MB JSON.stringify per widget on every render cycle.
  const wType = widget.type || (widget as any).widgetType || "";
  const isChart = wType === "chart" || wType === "line_chart" || wType === "bar_chart";
  const effectiveGroupBy = isChart
    ? "day"
    : widget.groupBy && widget.groupBy !== "none"
      ? widget.groupBy
      : "none";

  return [
    "widget-data",
    integrationForKey,
    widget.metricKey,
    widget.accountId ?? "",
    effectiveGroupBy,
    dateFrom,
    dateTo,
    shareToken ?? "",
  ];
}

// ---------------------------------------------------------------------------
// Normalize integration name for API
// ---------------------------------------------------------------------------

function normalizeIntegration(widget: ReportWidgetDefinition): string {
  const metricKey = (widget.metricKey || "").toLowerCase();

  // Prefer metric-key-derived integration first to self-heal stale widget configs
  // (e.g. GA metric accidentally saved with integration "meta").
  if (metricKey.startsWith("google_seo.")) return "google-search-console";
  if (metricKey.startsWith("google_ads.")) return "google-ads";
  if (metricKey.startsWith("google.")) return "google-analytics";
  if (metricKey.startsWith("meta.instagram.")) return "meta-instagram";
  if (metricKey.startsWith("meta.facebook.") || metricKey.startsWith("meta.page.")) return "meta-facebook";
  if (metricKey.startsWith("meta.ads.")) return "meta-ads";
  if (metricKey.startsWith("youtube.")) return "youtube";

  let normalized = widget.integration.toLowerCase();

  if (!normalized.startsWith("meta_")) {
    normalized = normalized.replace(/_/g, "-");
  }

  if (normalized === "google") {
    normalized = "google-analytics";
  } else if (normalized === "woocommerce") {
    normalized = "woo";
  } else if (normalized === "meta-business" || normalized === "meta_business") {
    if (
      widget.metricKey.includes("facebook") ||
      widget.metricKey.startsWith("meta.page") ||
      widget.metricKey.startsWith("meta.facebook")
    ) {
      normalized = "meta-facebook";
    } else if (
      widget.metricKey.includes("instagram") ||
      widget.metricKey.startsWith("meta.instagram")
    ) {
      normalized = "meta-instagram";
    } else if (
      widget.metricKey.includes("ads") ||
      widget.metricKey.startsWith("meta.ads")
    ) {
      normalized = "meta-ads";
    }
  }

  return normalized;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const VALID_INTEGRATIONS = [
  "google-analytics",
  "google",
  "google_analytics",
  "google-search-console",
  "google-console",
  "meta",
  "meta-facebook",
  "meta-instagram",
  "meta-ads",
  "meta_facebook",
  "meta_instagram",
  "meta_ads",
  "youtube",
  "shopify",
  "woo",
  "google-ads",
];

function hasValidMetricPrefix(metricKey: string): boolean {
  return (
    metricKey.startsWith("google.") ||
    metricKey.startsWith("google_seo.") ||
    metricKey.startsWith("google-console.") ||
    metricKey.startsWith("meta.") ||
    metricKey.startsWith("youtube.") ||
    metricKey.startsWith("shopify.") ||
    metricKey.startsWith("woo.") ||
    metricKey.startsWith("google_ads.")
  );
}

// ---------------------------------------------------------------------------
// Fetch raw data (integration-specific branching)
// ---------------------------------------------------------------------------

async function fetchRawWidgetData(
  widget: ReportWidgetDefinition,
  normalizedInteg: string,
  effectiveClientId: number | null | undefined,
  dateFrom: string,
  dateTo: string,
  shareToken?: string,
  integrationsData?: any
): Promise<any> {
  // --- Shopify ---
  if (normalizedInteg === "shopify") {
    if (effectiveClientId) {
      try {
        const trendsData = await getShopifyTrends(effectiveClientId, {
          startDate: dateFrom,
          endDate: dateTo,
        });

        if (trendsData.success && trendsData.trends) {
          const rows: UnifiedMetricRow[] = trendsData.trends
            .filter((t: any) => t.date >= dateFrom && t.date <= dateTo)
            .map((t: any) => {
              let val = 0;
              if (widget.metricKey === "shopify.revenue") val = t.revenue;
              else if (widget.metricKey === "shopify.orders") val = t.orders;
              else if (widget.metricKey === "shopify.avgOrderValue")
                val = t.orders > 0 ? t.revenue / t.orders : 0;

              return {
                id: Math.floor(Math.random() * 1000000),
                metricKey: widget.metricKey,
                value: val,
                date: t.date,
                integration: "shopify",
                accountId: "",
                userId: 0,
                clientId: effectiveClientId,
                recordedAt: new Date().toISOString(),
                dimensionType: "",
                dimensionValue: "",
                extra: null,
              } as UnifiedMetricRow;
            });

          return {
            success: true,
            rows,
            pagination: {
              page: 1,
              limit: rows.length,
              total: rows.length,
              totalPages: 1,
            },
          };
        }
      } catch (err) {
        console.error("Shopify Direct Fetch Error", err);
      }
    }
  }

  // --- Meta Facebook Recent Posts ---
  if (widget.metricKey === "meta.facebook.recent_posts") {
    try {
      const targetAccountId = widget.accountId || effectiveClientId;
      if (targetAccountId) {
        const postsData = await fetchMetaStoredPosts(
          targetAccountId as any,
          25,
          "createdTime",
          "desc",
          dateFrom,
          dateTo
        );

        if (postsData?.success && Array.isArray(postsData.posts)) {
          const rows = postsData.posts.map((p: any) => ({
            id: p.id,
            metricKey: widget.metricKey,
            integration: normalizedInteg,
            accountId: targetAccountId,
            date: p.createdTime
              ? new Date(p.createdTime).toLocaleDateString()
              : "",
            value: p.likes || 0,
            post: p.message || "(No caption)",
            impressions: p.impressions || 0,
            clicks: p.clicks || 0,
            likes: p.likes,
            comments: p.comments,
            shares: p.shares,
            reactions: p.reactions,
            fullPicture: p.fullPicture,
            permalinkUrl: p.permalinkUrl,
          }));

          return {
            success: true,
            rows,
            pagination: {
              page: 1,
              limit: rows.length,
              total: rows.length,
              totalPages: 1,
            },
            columns: [
              { name: "Date", width: "15%" },
              { name: "Post", width: "40%" },
              { name: "Impressions" },
              { name: "Clicks" },
              { name: "Likes" },
              { name: "Comments" },
              { name: "Shares" },
              { name: "Reactions" },
            ],
          };
        }
      }
    } catch (err) {
      console.error("Failed to fetch recent posts", err);
    }
  }

  // --- Meta Instagram Recent Media ---
  if (widget.metricKey === "meta.instagram.recent_media") {
    try {
      let targetAccountId: any = widget.accountId;

      // If widget.accountId is empty, look up from already-loaded integrations data.
      // NOTE: integrationsData is guaranteed to be available here because useWidgetData
      // has enabled: !isLoadingIntegrations && !!integrationsData.
      if (!targetAccountId) {
        const integrations = integrationsData?.integrations;
        if (Array.isArray(integrations)) {
          let found = integrations.find(
            (int: any) =>
              int.platform &&
              int.platform.toLowerCase().includes("instagram")
          );

          if (!found) {
            found = integrations.find(
              (int: any) =>
                (int.platform === "meta-business" ||
                  int.platform === "meta_business") &&
                int.accountId &&
                String(int.accountId) !== String(effectiveClientId)
            );
          }

          if (found) {
            targetAccountId = found.accountId;
          }
        }
      }

      if (!targetAccountId) {
        targetAccountId = effectiveClientId;
      }

      if (targetAccountId) {
        const mediaData = await fetchInstagramStoredMedia(
          targetAccountId,
          25,
          dateFrom,
          dateTo
        );

        if (mediaData?.success && Array.isArray(mediaData.media)) {
          const rows = mediaData.media.map((m: any) => ({
            id: m.id,
            metricKey: widget.metricKey,
            integration: normalizedInteg,
            accountId: targetAccountId,
            date: m.timestamp
              ? new Date(m.timestamp).toLocaleDateString()
              : "",
            value: m.views || 0,
            post: m.caption || "(No caption)",
            impressions: m.views || 0,
            clicks: 0,
            likes: m.likeCount,
            shares: m.shares,
            fullPicture: m.mediaUrl,
            permalinkUrl: m.permalinkUrl,
          }));

          return {
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
          };
        }
      }
    } catch (err) {
      console.error("Failed to fetch Instagram media", err);
    }
  }

  // --- Meta Ads Campaign Performance ---
  if (widget.metricKey === "meta.ads.campaign_performance") {
    try {
      if (effectiveClientId) {
        const campaignData = await fetchMetaAdsCampaignPerformance(
          effectiveClientId,
          dateFrom,
          dateTo
        );

        if (
          campaignData?.success &&
          Array.isArray(campaignData.rows)
        ) {
          const rows = campaignData.rows.map((row: any, idx: number) => ({
            id: `campaign-${idx}`,
            metricKey: widget.metricKey,
            integration: "meta-ads",
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
          };
        }
      }
    } catch (err) {
      console.error("Failed to fetch Meta Ads campaign performance", err);
    }
  }

  // --- Google Ads Campaign Performance ---
  if (widget.metricKey === "google_ads.campaign_performance") {
    try {
      if (effectiveClientId) {
        const campaignData = await fetchGoogleAdsCampaignPerformance(
          effectiveClientId,
          dateFrom,
          dateTo,
          widget.accountId || undefined
        );

        if (campaignData?.success && Array.isArray(campaignData.rows)) {
          const rows = campaignData.rows.map((row: any) => ({
            ...row,
            metricKey: widget.metricKey,
            integration: "google-ads",
          }));

          return {
            success: true,
            rows,
            pagination: {
              page: 1,
              limit: rows.length,
              total: rows.length,
              totalPages: 1,
            },
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
          };
        }
      }
    } catch (err) {
      console.error("Failed to fetch Google Ads campaign performance", err);
    }
  }

  // --- Google Ads Metric Cards (Summary Fast Path) ---
  // All standard Google Ads metric cards use the summary endpoint for pre-aggregated values.
  // This includes rate metrics (CTR/CPC/ROAS) AND standard metrics (spend/clicks/impressions/conversions).
  // Chart widgets (needsSeries=true) still fall through to the standard row-based path for time-series data.
  const GOOGLE_ADS_SUMMARY_METRICS = [
    "google_ads.ctr",
    "google_ads.cpc",
    "google_ads.roas",
    "google_ads.spend",
    "google_ads.cost",
    "google_ads.clicks",
    "google_ads.impressions",
    "google_ads.conversions",
    "google_ads.revenue",
    "google_ads.view_through_conversions",
    "google_ads.interactions",
  ];

  // Map from widget metricKey to the summary field name
  const GOOGLE_ADS_SUMMARY_KEY_MAP: Record<string, string> = {
    "google_ads.spend": "spend",
    "google_ads.cost": "spend",
    "google_ads.clicks": "clicks",
    "google_ads.impressions": "impressions",
    "google_ads.conversions": "conversions",
    "google_ads.revenue": "revenue",
    "google_ads.view_through_conversions": "viewThroughConversions",
    "google_ads.interactions": "clicks", // interactions ≈ clicks for display ads
    "google_ads.ctr": "ctr",
    "google_ads.cpc": "cpc",
    "google_ads.roas": "roas",
  };

  const wTypeForAds = (widget.type || (widget as any).widgetType || "").toLowerCase();
  const needsSeriesForAds =
    wTypeForAds === "chart" ||
    wTypeForAds === "line_chart" ||
    wTypeForAds === "bar_chart" ||
    wTypeForAds === "area_chart" ||
    wTypeForAds === "pie_chart";

  if (
    normalizedInteg === "google-ads" &&
    GOOGLE_ADS_SUMMARY_METRICS.includes(widget.metricKey) &&
    !needsSeriesForAds
  ) {
    try {
      const summaryData = await fetchGoogleAdsSummary(effectiveClientId!, {
        startDate: dateFrom,
        endDate: dateTo,
        accountId: widget.accountId || undefined,
      });

      if (summaryData?.success && summaryData.summary) {
        const s = summaryData.summary as any;
        // Build a full summary object for all metrics
        const summary = {
          spend: s.spend ?? 0,
          cost: s.spend ?? 0,
          clicks: s.clicks ?? 0,
          impressions: s.impressions ?? 0,
          conversions: s.conversions ?? 0,
          revenue: s.revenue ?? 0,
          viewThroughConversions: s.viewThroughConversions ?? 0,
          interactions: s.clicks ?? 0,
          ctr: s.ctr ?? 0,
          cpc: s.cpc ?? 0,
          roas: s.roas ?? 0,
        };

        // Pick the relevant field for this specific widget
        const summaryFieldKey = GOOGLE_ADS_SUMMARY_KEY_MAP[widget.metricKey];
        const metricValue = summaryFieldKey !== undefined
          ? (summary as any)[summaryFieldKey] ?? 0
          : 0;

        return {
          success: true,
          rows: [],
          value: metricValue,
          total: metricValue,
          summary,
        };
      }
    } catch (err) {
      console.error("Failed to fetch Google Ads summary", err);
    }
  }

  // --- Google Analytics: Dimensional Table Widgets ---
  // These special metricKeys trigger dimension-specific API calls to /api/unified-metrics
  // and aggregate multi-metric rows into a single row per dimensionValue.
  // dateFrom and dateTo are always forwarded so tables respect the date range picker.
  const GA_DIMENSIONAL_TABLES: Record<string, {
    dimensionType: string;
    metricKeys: string[];
    columns: { name: string; width: string; dataKey: string }[];
    label: string;
  }> = {
    'google.channel_traffic': {
      dimensionType: 'channel',
      metricKeys: ['google.sessions', 'google.engagedSessions', 'google.engagementRate', 'google.avgSessionDuration', 'google.eventCount'],
      columns: [
        { name: 'Channel', width: '20%', dataKey: 'dimensionValue' },
        { name: 'Sessions', width: '13%', dataKey: 'sessions' },
        { name: 'Engaged Sessions', width: '13%', dataKey: 'engagedSessions' },
        { name: 'Engagement Rate', width: '13%', dataKey: 'engagementRate' },
        { name: 'Avg. Session Duration', width: '13%', dataKey: 'avgSessionDuration' },
        { name: 'Event Count', width: '13%', dataKey: 'eventCount' },
      ],
      label: 'Monthly All Channel Traffic',
    },
    'google.browser_used': {
      dimensionType: 'browser',
      metricKeys: ['google.activeUsers', 'google.newUsers', 'google.engagedSessions', 'google.engagementRate', 'google.eventCount'],
      columns: [
        { name: 'Browser', width: '30%', dataKey: 'dimensionValue' },
        { name: 'Active Users', width: '17%', dataKey: 'activeUsers' },
        { name: 'New Users', width: '17%', dataKey: 'newUsers' },
        { name: 'Engaged Sessions', width: '18%', dataKey: 'engagedSessions' },
        { name: 'Event Count', width: '18%', dataKey: 'eventCount' },
      ],
      label: 'Technology: Browser Used',
    },
    'google.device_category': {
      dimensionType: 'device',
      metricKeys: ['google.activeUsers', 'google.newUsers', 'google.engagedSessions', 'google.engagementRate', 'google.eventCount'],
      columns: [
        { name: 'Device', width: '30%', dataKey: 'dimensionValue' },
        { name: 'Active Users', width: '17%', dataKey: 'activeUsers' },
        { name: 'New Users', width: '17%', dataKey: 'newUsers' },
        { name: 'Engaged Sessions', width: '18%', dataKey: 'engagedSessions' },
        { name: 'Event Count', width: '18%', dataKey: 'eventCount' },
      ],
      label: 'Technology: Device Category',
    },
    'google.geo_country': {
      dimensionType: 'country',
      metricKeys: ['google.activeUsers', 'google.newUsers', 'google.engagedSessions', 'google.engagementRate', 'google.eventCount'],
      columns: [
        { name: 'Country', width: '30%', dataKey: 'dimensionValue' },
        { name: 'Active Users', width: '17%', dataKey: 'activeUsers' },
        { name: 'New Users', width: '17%', dataKey: 'newUsers' },
        { name: 'Engaged Sessions', width: '18%', dataKey: 'engagedSessions' },
        { name: 'Event Count', width: '18%', dataKey: 'eventCount' },
      ],
      label: 'Geo Location: Country',
    },
    'google.geo_city': {
      dimensionType: 'city',
      metricKeys: ['google.activeUsers', 'google.newUsers', 'google.engagedSessions', 'google.engagementRate', 'google.eventCount'],
      columns: [
        { name: 'City', width: '30%', dataKey: 'dimensionValue' },
        { name: 'Active Users', width: '17%', dataKey: 'activeUsers' },
        { name: 'New Users', width: '17%', dataKey: 'newUsers' },
        { name: 'Engaged Sessions', width: '18%', dataKey: 'engagedSessions' },
        { name: 'Event Count', width: '18%', dataKey: 'eventCount' },
      ],
      label: 'Geo Location: City',
    },
    'google.top_pages': {
      dimensionType: 'page',
      metricKeys: ['google.pageViews', 'google.activeUsers', 'google.avgSessionDuration', 'google.eventCount'],
      columns: [
        { name: 'Page Path', width: '30%', dataKey: 'dimensionValue' },
        { name: 'Views', width: '14%', dataKey: 'pageViews' },
        { name: 'Active Users', width: '14%', dataKey: 'activeUsers' },
        { name: 'Avg. Session Duration', width: '21%', dataKey: 'avgSessionDuration' },
        { name: 'Event Count', width: '21%', dataKey: 'eventCount' },
      ],
      label: 'Top Landing Pages',
    },
    'google_seo.top_pages': {
      dimensionType: 'page',
      metricKeys: ['google_seo.clicks', 'google_seo.impressions', 'google_seo.ctr', 'google_seo.position'],
      columns: [
        { name: 'Page', width: '50%', dataKey: 'dimensionValue' },
        { name: 'Clicks', width: '15%', dataKey: 'clicks' },
        { name: 'Impressions', width: '15%', dataKey: 'impressions' },
        { name: 'CTR', width: '10%', dataKey: 'ctr' },
        { name: 'Position', width: '10%', dataKey: 'position' },
      ],
      label: 'Top Performing Pages',
    },
    'google_seo.top_queries': {
      dimensionType: 'query',
      metricKeys: ['google_seo.clicks', 'google_seo.impressions', 'google_seo.ctr', 'google_seo.position'],
      columns: [
        { name: 'Query', width: '50%', dataKey: 'dimensionValue' },
        { name: 'Clicks', width: '15%', dataKey: 'clicks' },
        { name: 'Impressions', width: '15%', dataKey: 'impressions' },
        { name: 'CTR', width: '10%', dataKey: 'ctr' },
        { name: 'Position', width: '10%', dataKey: 'position' },
      ],
      label: 'Top Search Queries',
    },
  };

  const gaDimTable = GA_DIMENSIONAL_TABLES[widget.metricKey];
  if (
    gaDimTable &&
    (normalizedInteg === 'google-analytics' || normalizedInteg === 'google' || normalizedInteg === 'google_analytics' || normalizedInteg === 'google-search-console' || normalizedInteg === 'google-console')
  ) {
    try {
      // IMPORTANT: Use direct api.get instead of fetchUnifiedMetric here.
      // fetchUnifiedMetric builds a fixed requestParams whitelist that strips dimensionType,
      // so the backend would return ALL metrics with no dimensional filtering.
      const isGsc = normalizedInteg === 'google-search-console' || normalizedInteg === 'google-console';

      let dimResponse: any;

      if (isGsc && (widget.metricKey === 'google_seo.top_pages' || widget.metricKey === 'google_seo.top_queries')) {
        const fetchFn = widget.metricKey === 'google_seo.top_pages' ? getGoogleConsoleTopPages : getGoogleConsoleTopQueries;
        const gscResp = await fetchFn(Number(effectiveClientId), { startDate: dateFrom, endDate: dateTo });

        // Normalize GSC response to look like unified metrics rows for the aggregator below
        const rawRows = (gscResp as any).topPages || (gscResp as any).topQueries || [];

        dimResponse = {
          success: true,
          rows: rawRows.map((r: any) => ([
            { metricKey: 'google_seo.clicks', value: r.clicks, dimensionValue: r.page || r.query },
            { metricKey: 'google_seo.impressions', value: r.impressions, dimensionValue: r.page || r.query },
            { metricKey: 'google_seo.ctr', value: r.ctr, dimensionValue: r.page || r.query },
            { metricKey: 'google_seo.position', value: r.position, dimensionValue: r.page || r.query },
          ])).flat()
        };
      } else {
        const queryParams = {
          integration: isGsc ? 'google-search-console' : 'google_analytics',
          dimensionType: gaDimTable.dimensionType,
          startDate: dateFrom,
          endDate: dateTo,
          clientId: effectiveClientId ? Number(effectiveClientId) : undefined,
          client_id: effectiveClientId ? Number(effectiveClientId) : undefined,
          limit: 50, // Reduced from 500 to prevent massive payload processing delays
        };
        dimResponse = await api.get('/unified-metrics', {
          params: queryParams,
        }).then((r: any) => r.data);
      }

      if (dimResponse?.rows && Array.isArray(dimResponse.rows) && dimResponse.rows.length > 0) {
        // Aggregate rows by dimensionValue — sum each metricKey across all dates
        const byDimension = new Map<string, Record<string, number>>();

        dimResponse.rows.forEach((row: any) => {
          const dim = row.dimensionValue || '(not set)';
          const metricSuffix = (row.metricKey || '').split('.').pop() || '';

          if (!byDimension.has(dim)) {
            byDimension.set(dim, {
              _activeUsers: 0, _newUsers: 0, _engagedSessions: 0, _engagementRate: 0, _engagementRateCount: 0, _avgSessionDuration: 0, _avgDurationCount: 0, _sessions: 0, _eventCount: 0, _pageViews: 0,
              _clicks: 0, _impressions: 0, _ctr: 0, _ctrCount: 0, _position: 0, _positionCount: 0
            });
          }
          const acc = byDimension.get(dim)!;
          const val = Number(row.value) || 0;

          if (metricSuffix === 'activeUsers') acc._activeUsers += val;
          else if (metricSuffix === 'newUsers') acc._newUsers += val;
          else if (metricSuffix === 'engagedSessions') acc._engagedSessions += val;
          else if (metricSuffix === 'engagementRate') { acc._engagementRate += val; acc._engagementRateCount += 1; }
          else if (metricSuffix === 'avgSessionDuration') { acc._avgSessionDuration += val; acc._avgDurationCount += 1; }
          else if (metricSuffix === 'sessions') acc._sessions += val;
          else if (metricSuffix === 'eventCount') acc._eventCount += val;
          else if (metricSuffix === 'pageViews') acc._pageViews += val;
          else if (metricSuffix === 'clicks') acc._clicks += val;
          else if (metricSuffix === 'impressions') acc._impressions += val;
          else if (metricSuffix === 'ctr') { acc._ctr += val; acc._ctrCount += 1; }
          else if (metricSuffix === 'position') { acc._position += val; acc._positionCount += 1; }
        });

        // Build one display row per dimension value
        const aggregatedRows = Array.from(byDimension.entries()).map(
          ([dim, acc], idx) => ({
            id: idx,
            metricKey: widget.metricKey,
            integration: isGsc ? 'google-search-console' : 'google_analytics',
            dimensionValue: dim,
            activeUsers: acc._activeUsers,
            newUsers: acc._newUsers,
            engagedSessions: acc._engagedSessions,
            sessions: acc._sessions,
            eventCount: acc._eventCount,
            pageViews: acc._pageViews,
            engagementRate: acc._engagementRateCount > 0
              ? parseFloat((acc._engagementRate / acc._engagementRateCount * 100).toFixed(2))
              : 0,
            avgSessionDuration: acc._avgDurationCount > 0
              ? parseFloat((acc._avgSessionDuration / acc._avgDurationCount).toFixed(1))
              : 0,
            clicks: acc._clicks,
            impressions: acc._impressions,
            ctr: acc._ctrCount > 0
              ? `${(acc._ctr / acc._ctrCount * 100).toFixed(2)}%`
              : "0.00%",
            position: acc._positionCount > 0
              ? parseFloat((acc._position / acc._positionCount).toFixed(1))
              : 0,
            value: isGsc ? (acc._clicks || acc._impressions) : (acc._activeUsers || acc._sessions || acc._pageViews),
          })
        );

        // Sort by primary metric descending (most relevant dimension first)
        aggregatedRows.sort((a, b) => (b.value || 0) - (a.value || 0));

        return {
          success: true,
          rows: aggregatedRows,
          pagination: { page: 1, limit: aggregatedRows.length, total: aggregatedRows.length, totalPages: 1 },
          columns: gaDimTable.columns,
        };
      }
    } catch (err) {
      console.error(`Failed to fetch dimensional table (${widget.metricKey}):`, err);
    }
  }

  // --- Pre-start aggregate fetch in parallel with standard fetch ---
  const GSC_AGGREGATE_KEYS = [
    "google_seo.clicks",
    "google_seo.impressions",
    "google_seo.ctr",
    "google_seo.position",
  ] as const;
  const needsGscAggregate =
    (normalizedInteg === "google-search-console" ||
      normalizedInteg === "google-console") &&
    GSC_AGGREGATE_KEYS.includes(widget.metricKey as any);
  const needsMetaAdsAggregate =
    (normalizedInteg === "meta-ads" || normalizedInteg === "meta_ads") &&
    (widget.metricKey === "meta.ads.cpc" || widget.metricKey === "meta.ads.ctr");

  const aggregatePromise = (needsGscAggregate || needsMetaAdsAggregate)
    ? fetchUnifiedAggregate({
      metricKey: widget.metricKey,
      integration: needsGscAggregate ? "google-search-console" : "meta_ads",
      startDate: dateFrom,
      endDate: dateTo,
      accountId: widget.accountId || undefined,
    })
    : null;

  // --- Fast path: Metric cards only need the aggregate value, skip the standard fetch ---
  // Chart widgets still need rows for time-series rendering.
  const wType = widget.type || (widget as any).widgetType || "";
  const needsSeries = wType === "chart" || wType === "line_chart" || wType === "bar_chart";

  if (aggregatePromise && !needsSeries) {
    try {
      const aggregateResult = await aggregatePromise;
      if (aggregateResult?.success && typeof aggregateResult.value === "number") {
        const metricSuffix = widget.metricKey.split(".").pop() || "";
        return {
          success: true,
          rows: [],
          value: aggregateResult.value,
          total: aggregateResult.value,
          rowCount: aggregateResult.rowCount,
          summary: { [metricSuffix]: aggregateResult.value },
        };
      }
    } catch (err) {
      console.warn(`[useWidgetData] Aggregate-only fast path failed for ${widget.metricKey}, falling through to standard fetch`, err);
    }
  }

  // --- Standard: Unified Metrics API ---
  // Pass accountId for all integrations if it exists on the widget.
  const shouldIncludeAccountId = true;

  const params: any = {
    integration: normalizedInteg,
    metricKey: widget.metricKey,
    startDate: dateFrom,
    endDate: dateTo,
    token: shareToken,
    groupBy: (() => {
      const wt = (widget.type || (widget as any).widgetType || "").toLowerCase();
      const isChartWidget =
        wt === "chart" ||
        wt === "line_chart" ||
        wt === "bar_chart" ||
        wt === "area_chart" ||
        wt === "pie_chart";
      if (isChartWidget) return "day";
      return widget.groupBy && widget.groupBy !== "none" ? widget.groupBy : undefined;
    })(),
    ...(shouldIncludeAccountId && widget.accountId
      ? { accountId: widget.accountId }
      : {}),
  };

  // --- Standard / Parallel Fallback Fetch ---
  // For Meta integrations, we often don't know if the metrics are tied to the Facebook Page ID (accountId)
  // or a separated Instagram ID. Previously this was serial (wait 5s for fail, then try again).
  // Now we fire both in parallel to halve the latency for Instagram widgets.

  const needsMetaFallback = normalizedInteg.startsWith("meta") && params.accountId;
  const needsGoogleFallback =
    (normalizedInteg === "google-analytics" ||
      normalizedInteg === "google" ||
      normalizedInteg === "google_analytics" ||
      normalizedInteg === "google-search-console" ||
      normalizedInteg === "google-console") &&
    params.accountId;
  const needsYouTubeFallback = normalizedInteg === "youtube" && params.accountId;
  const needsNoAccountFallback = needsMetaFallback || needsGoogleFallback || needsYouTubeFallback;

  // For YouTube: use AbortController to truly cancel the HTTP request after 8s.
  // The old Promise-wrapper approach cancelled the JS chain but left the HTTP request
  // running for up to VITE_API_TIMEOUT, keeping the widget in loading state.
  // 8s is generous for a fast backend (confirmed via Apidog) but short enough to
  // bail out quickly when the YouTube Analytics API is slow.
  const youtubeController = normalizedInteg === "youtube" ? new AbortController() : null;
  let youtubeAbortTimer: ReturnType<typeof setTimeout> | null = null;
  if (youtubeController) {
    youtubeAbortTimer = setTimeout(() => {
      youtubeController.abort();
    }, 8000);
  }
  const youtubeSignal = youtubeController?.signal;

  const suppressErrors = normalizedInteg === "youtube";
  const primaryTask = fetchUnifiedMetric(effectiveClientId, {
    ...params,
    ...(youtubeSignal ? { signal: youtubeSignal } : {}),
  });
  const fallbackTask = needsNoAccountFallback
    ? fetchUnifiedMetric(effectiveClientId, {
        ...params,
        accountId: undefined,
        ...(youtubeSignal ? { signal: youtubeSignal } : {}),
      })
    : Promise.resolve(null);

  const primaryPromise = suppressErrors
    ? primaryTask.catch((err) => {
        console.warn("YouTube primary metric request failed", err);
        return null;
      })
    : primaryTask;
  const fallbackPromise = suppressErrors
    ? (fallbackTask).catch((err) => {
        console.warn("YouTube fallback metric request failed", err);
        return null;
      })
    : fallbackTask;

  let data: any = null;
  if (needsNoAccountFallback) {
    const fastData: any = await Promise.race([primaryPromise, fallbackPromise]);
    if (fastData?.rows && fastData.rows.length > 0) {
      data = fastData;
    }
  }

  if (!data) {
    const [primaryData, fallbackData] = await Promise.all([
      primaryPromise,
      fallbackPromise
    ]);

    // Use primary if it has rows, otherwise use fallback (which might also be empty, but we tried)
    data = (primaryData?.rows && primaryData.rows.length > 0)
      ? primaryData
      : (fallbackData ?? primaryData);
  }

  // Clear YouTube abort timer now that all requests have settled
  if (youtubeAbortTimer !== null) clearTimeout(youtubeAbortTimer);

  // --- Google Ads Chart Fallback ---
  // Chart widgets skip the summary fast path (needsSeriesForAds = true).
  // When the backend sync hasn't populated the DB yet for the selected date range,
  // fetchUnifiedMetric returns no rows and the chart shows 0.
  // Fallback: call the live summary API and synthesize uniform daily rows so the
  // chart renders actual values instead of an empty 0-line.
  if (
    normalizedInteg === "google-ads" &&
    needsSeriesForAds &&
    GOOGLE_ADS_SUMMARY_METRICS.includes(widget.metricKey) &&
    effectiveClientId &&
    (!data?.rows || data.rows.length === 0)
  ) {
    try {
      const summaryData = await fetchGoogleAdsSummary(effectiveClientId, {
        startDate: dateFrom,
        endDate: dateTo,
        accountId: widget.accountId || undefined,
      });

      if (summaryData?.success && summaryData.summary) {
        const s = summaryData.summary as any;
        const summaryFieldKey = GOOGLE_ADS_SUMMARY_KEY_MAP[widget.metricKey];
        const metricValue = summaryFieldKey !== undefined ? (s[summaryFieldKey] ?? 0) : 0;

        if (metricValue > 0) {
          // Distribute the total evenly across the date range to build a synthetic series.
          const start = new Date(dateFrom);
          const end = new Date(dateTo);
          const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
          const dailyValue = metricValue / diffDays;

          const syntheticRows: any[] = [];
          const cur = new Date(start);
          let rowId = 1;
          while (cur <= end) {
            const dateStr = cur.toISOString().split("T")[0];
            syntheticRows.push({
              id: rowId++,
              metricKey: widget.metricKey,
              value: dailyValue,
              date: dateStr,
              integration: "google-ads",
              accountId: widget.accountId || String(effectiveClientId),
              clientId: effectiveClientId,
              dimensionType: "day",
              dimensionValue: dateStr,
            });
            cur.setDate(cur.getDate() + 1);
          }

          data = {
            success: true,
            rows: syntheticRows,
            value: metricValue,
            total: metricValue,
            summary: summaryData.summary,
          };
        }
      }
    } catch (err) {
      console.error("[Google Ads Chart Fallback] Failed to fetch summary", err);
    }
  }

  // --- Google Search Console: Aggregate Fetch (parallel) ---
  if (needsGscAggregate) {
    try {
      const aggregateResult = await aggregatePromise;

      if (aggregateResult?.success && typeof aggregateResult.value === "number") {
        const metricSuffix = widget.metricKey.split(".").pop() || "";
        return {
          ...data,
          rows: data?.rows ?? [],
          value: aggregateResult.value,
          total: aggregateResult.value,
          rowCount: aggregateResult.rowCount,
          summary: {
            ...data?.summary,
            [metricSuffix]: aggregateResult.value,
          },
        };
      }
    } catch (err) {
      console.error("Failed to fetch GSC aggregate metric", err);
    }
  }

  // --- Meta Ads Ratio Metrics: Aggregate Fetch (parallel) ---
  if (needsMetaAdsAggregate) {
    try {
      const aggregateResult = await aggregatePromise;

      if (aggregateResult?.success && typeof aggregateResult.value === "number") {
        const metricSuffix = widget.metricKey.split(".").pop() || "";
        return {
          ...data,
          rows: data?.rows ?? [],   // Ensure rows is always an array so processWidgetData doesn't early-return 0
          value: aggregateResult.value,
          total: aggregateResult.value,
          summary: {
            ...data?.summary,
            [metricSuffix]: aggregateResult.value,
            cpc: metricSuffix === "cpc" ? aggregateResult.value : data?.summary?.cpc,
            ctr: metricSuffix === "ctr" ? aggregateResult.value : data?.summary?.ctr,
          },
        };
      }
    } catch (err) {
      console.error("Failed to fetch Meta Ads aggregate metric", err);
    }
  }

  return data;
}

// ---------------------------------------------------------------------------
// Process raw data into ResolvedWidgetData
// ---------------------------------------------------------------------------

export function processWidgetData(
  widget: ReportWidgetDefinition,
  data: any,
  effectiveClientId: number | null | undefined
): ResolvedWidgetData {
  // Snapshot data detection (already resolved)
  const isSnapshotData =
    data &&
    ((data as any).series ||
      typeof (data as any).value === "number" ||
      typeof (data as any).total === "number") &&
    (!data.rows || (Array.isArray(data.rows) && data.rows.length === 0));

  if (isSnapshotData) {
    return {
      value: (data as any).value ?? 0,
      total: (data as any).total ?? 0,
      rawCount: (data as any).rawCount ?? 0,
      rows: [],
      series: (data as any).series ?? [],
    };
  }

  // Standard API response: must have rows
  if (!data || !data.rows || !Array.isArray(data.rows)) {
    return { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
  }

  // --- Row filtering ---

  const normalizeInteg = (name: string) => {
    const lower = (name || "").toLowerCase();
    if (lower === "woo" || lower === "woocommerce") return "woocommerce";
    if (
      lower === "google" ||
      lower === "google-analytics" ||
      lower === "google_analytics"
    )
      return "google-analytics";
    if (lower === "youtube") return "youtube";

    if (lower.startsWith("meta_") || lower.startsWith("meta-")) {
      return lower.replace(/-/g, "_");
    }
    return lower.replace(/_/g, "-");
  };

  const widgetIntegration = normalizeInteg(widget.integration);

  // Strict match
  let matchingRows = data.rows.filter((row: any) => {
    const rowInteg = (row.integration || "")
      .replace(/_/g, "-")
      .toLowerCase();
    const widgetInteg = (widgetIntegration || widget.integration || "")
      .replace(/_/g, "-")
      .toLowerCase();

    if (rowInteg !== widgetInteg && widgetInteg !== "meta-business")
      return false;

    let accountMatch = true;
    if (widget.accountId) {
      const rowAcc = String(row.accountId || "").replace(/^act_/, "");
      const widAcc = String(widget.accountId || "").replace(/^act_/, "");

      if (
        (row.dimensionType === "page" || row.dimensionType === "account") &&
        row.dimensionValue
      ) {
        const dimVal = String(row.dimensionValue).replace(/^act_/, "");
        accountMatch = rowAcc === widAcc || dimVal === widAcc;
      } else if (row.dimensionType === "demographic") {
        // Backend filters demographic rows correctly; bypass strict ID vs username mismatch
        accountMatch = true;
      } else {
        accountMatch = rowAcc === widAcc;
      }

      if (widgetInteg === "meta-business") {
        accountMatch = true;
      }

      if (widgetIntegration === "meta-business") accountMatch = true;

      // Google Ads: widget.accountId is an internal DB ID but row.accountId is
      // the Google customer ID (e.g. "7815221497") — they never match.
      // The API already scopes rows to the correct account server-side, so we
      // can safely skip frontend account matching for this integration.
      if (widgetInteg === "google-ads") accountMatch = true;
    }

    let clientMatch = true;
    if (effectiveClientId && row.clientId) {
      clientMatch = String(row.clientId) === String(effectiveClientId);
    }

    const isRateWidget =
      widgetInteg === "google-ads" ||
      widgetInteg === "meta-ads" ||
      widgetInteg === "meta-business";

    // For rate metrics, we might have multiple component metrics (clicks, impressions, etc.)
    const isComponentMetric =
      isRateWidget &&
      (row.metricKey.endsWith(".clicks") ||
        row.metricKey.endsWith(".impressions") ||
        row.metricKey.endsWith(".cost") ||
        row.metricKey.endsWith(".spend") ||
        row.metricKey.endsWith(".revenue") ||
        row.metricKey.endsWith("amount_spent"));

    const match = (
      (row.metricKey === widget.metricKey || isComponentMetric) &&
      (rowInteg === widgetInteg ||
        (widgetInteg === "meta-business" && rowInteg.startsWith("meta"))) &&
      accountMatch &&
      clientMatch
    );

    return match;
  });

  // Loose match fallback
  if (matchingRows.length === 0) {
    matchingRows = data.rows.filter((row: any) => {
      const rowIntegration = (row.integration || "")
        .replace(/_/g, "-")
        .toLowerCase();
      const widgetInteg = (widgetIntegration || "")
        .replace(/_/g, "-")
        .toLowerCase();

      const isMetaBusinessWidget = widgetInteg === "meta-business";
      const isMetaRow = rowIntegration.startsWith("meta");

      return (
        row.metricKey === widget.metricKey &&
        (rowIntegration === widgetInteg ||
          (isMetaBusinessWidget && isMetaRow))
      );
    });
  }

  // Dimensional filtering
  let filteredRows = matchingRows.filter((row: any) => {
    if (widget.type === "table") return true;

    const dimType = (row.dimensionType || "").replace("ga:", "").toLowerCase();
    const isDimensional = dimType !== "";
    const isTimeDimension = ["day", "date", "week", "month", "year"].includes(
      dimType
    );
    const isYouTubeDimension =
      widget.metricKey.startsWith("youtube.") &&
      (dimType === "video" || row.dimensionType === "video");
    const isMetaAdsDimension =
      widget.metricKey.startsWith("meta.") &&
      ["campaign", "adset", "ad", "page", "account", "demographic"].includes(dimType);
    const isGoogleAdsDimension =
      widget.metricKey.startsWith("google_ads") &&
      ["campaign"].includes(dimType);

    const passes = (
      !isDimensional ||
      isTimeDimension ||
      isYouTubeDimension ||
      isMetaAdsDimension ||
      isGoogleAdsDimension
    );

    return passes;
  });

  // GA card fallback:
  // If strict dimensional filtering removed all rows but matching GA rows exist,
  // pick one coherent dimension bucket instead of returning 0.
  const isGoogleMetric = widget.metricKey.startsWith("google.");
  const isMetricCardWidget =
    widget.type === "metric_card" ||
    widget.type === "metric" ||
    (widget as any).widgetType === "metric";

  if (isGoogleMetric && isMetricCardWidget && filteredRows.length === 0 && matchingRows.length > 0) {
    const byDimensionType = new Map<string, any[]>();
    matchingRows.forEach((row: any) => {
      const dimType = ((row.dimensionType || "").replace("ga:", "").toLowerCase()) || "__none__";
      const list = byDimensionType.get(dimType) || [];
      list.push(row);
      byDimensionType.set(dimType, list);
    });

    const preferred = ["day", "date", "week", "month", "year", "__none__"];
    let selectedRows: any[] | undefined;

    for (const dim of preferred) {
      const candidate = byDimensionType.get(dim);
      if (candidate && candidate.length > 0) {
        selectedRows = candidate;
        break;
      }
    }

    if (!selectedRows) {
      selectedRows = Array.from(byDimensionType.values()).sort((a, b) => b.length - a.length)[0];
    }

    if (selectedRows && selectedRows.length > 0) {
      filteredRows = selectedRows;
    }
  }

  // --- Rate metric detection ---
  const metricKeyLower = widget.metricKey?.toLowerCase() || "";
  const isRateMetric =
    metricKeyLower.includes("cpc") ||
    metricKeyLower.includes("ctr") ||
    metricKeyLower.includes("cpm") ||
    metricKeyLower.includes("bouncerate") ||
    metricKeyLower.includes("average") ||
    metricKeyLower.includes("avg") ||
    metricKeyLower.includes("rate") ||
    metricKeyLower.includes("duration") ||
    metricKeyLower.includes("perview") ||
    metricKeyLower.includes("roas");

  // --- Total calculation ---
  // 1. Try pre-calculated total/value from aggregate fetcher first
  //    IMPORTANT: Only treat as pre-computed when non-zero. A value of 0 from the
  //    standard API should fall through to blended/averaging to avoid locking at 0.
  const precomputedValue =
    typeof data.value === 'number' && data.value !== 0 ? data.value
      : typeof data.total === 'number' && data.total !== 0 ? data.total
        : null;
  let total = precomputedValue ?? 0;
  let summaryUsed = precomputedValue !== null;

  const metricSuffix = widget.metricKey.split(".").pop()?.toLowerCase() || "";

  // 2. Try API-provided summary second
  if (!summaryUsed) {
    const summary = (data as any).summary;

    if (summary) {
      let summaryKey = metricSuffix;
      if (summaryKey === "cost_per_click") summaryKey = "cpc";
      if (summaryKey === "click_through_rate") summaryKey = "ctr";
      if (summaryKey === "cost_per_mille") summaryKey = "cpm";
      if (summaryKey === "amount_spent") summaryKey = "spend";

      if (summaryKey && typeof summary[summaryKey] === "number") {
        total = summary[summaryKey];
        summaryUsed = true;
      }
    }
  }

  if (!summaryUsed && filteredRows.length > 0) {
    const aggregationType = getMetricAggregation(widget.metricKey);

    if (aggregationType === "latest") {
      // Cumulative metrics: take latest date value
      const dateMap = new Map<string, number>();
      filteredRows.forEach((row: any) => {
        const dateKey = row.date ? row.date.split("T")[0] : "";
        if (dateKey) {
          dateMap.set(
            dateKey,
            (dateMap.get(dateKey) || 0) + (Number(row.value) || 0)
          );
        }
      });

      const sortedDates = Array.from(dateMap.keys()).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      );

      if (sortedDates.length > 0) {
        total = dateMap.get(sortedDates[0]) || 0;
      }
    } else {
      // Standard / Blended calculation
      let blendedCalculated = false;
      const contextRows = data.rows;

      const getSum = (keySuffix: string) => {
        return contextRows
          .filter(
            (r: any) =>
              r.metricKey.endsWith(keySuffix) &&
              (r.integration || "")
                .replace("_", "-")
                .toLowerCase() ===
              (widgetIntegration || "")
                .replace("_", "-")
                .toLowerCase() &&
              (widgetIntegration === "meta-business" ||
                widgetIntegration === "google-ads" ||
                String(r.accountId) === String(widget.accountId))
          )
          .reduce(
            (sum: number, r: any) => sum + (Number(r.value) || 0),
            0
          );
      };

      if (metricSuffix === "cpc") {
        const sumSpend = getSum("spend") || getSum("amount_spent") || getSum(".cost");
        const sumClicks = getSum("clicks");
        if (sumClicks > 0) {
          total = sumSpend / sumClicks;
          blendedCalculated = true;
        }
      } else if (metricSuffix === "ctr") {
        const sumClicks = getSum("clicks");
        const sumImpressions = getSum("impressions");
        if (sumImpressions > 0) {
          total = (sumClicks / sumImpressions) * 100;
          blendedCalculated = true;
        }
      } else if (metricSuffix === "cpm") {
        const sumSpend = getSum("spend") || getSum(".cost");
        const sumImpressions = getSum("impressions");
        if (sumImpressions > 0) {
          total = (sumSpend / sumImpressions) * 1000;
          blendedCalculated = true;
        }
      } else if (metricSuffix === "roas") {
        const sumRevenue = getSum("revenue");
        const sumCost = getSum("cost") || getSum(".cost");
        if (sumCost > 0) {
          total = sumRevenue / sumCost;
          blendedCalculated = true;
        }
      }

      if (!blendedCalculated) {
        if (isRateMetric) {
          const sum = filteredRows.reduce(
            (a: number, b: any) => a + (b.value || 0),
            0
          );
          total = sum / filteredRows.length;
        } else {
          total = filteredRows.reduce(
            (sum: number, row: any) => sum + (row.value || 0),
            0
          );
        }
      }
    }
  }

  // --- Series aggregation ---
  const dailyMetrics = new Map<string, Record<string, number>>();

  filteredRows.forEach((row: any) => {
    const dateKey = row.date ? row.date.split("T")[0] : row.dimensionValue || "";
    if (!dateKey) return;

    const metrics = dailyMetrics.get(dateKey) || { _count: 0, _sum: 0 };
    const mKey = row.metricKey?.toLowerCase() || "";
    const suffix = mKey.split(".").pop() || "";

    // Store component values for blending
    if (suffix === "clicks") metrics.clicks = (metrics.clicks || 0) + (Number(row.value) || 0);
    if (suffix === "impressions") metrics.impressions = (metrics.impressions || 0) + (Number(row.value) || 0);
    if (suffix === "cost" || suffix === "spend" || suffix === "amount_spent") {
      metrics.spend = (metrics.spend || 0) + (Number(row.value) || 0);
    }
    if (suffix === "revenue") metrics.revenue = (metrics.revenue || 0) + (Number(row.value) || 0);

    if (row.metricKey === widget.metricKey) {
      metrics._primary = (metrics._primary || 0) + (Number(row.value) || 0);
      metrics._sum += Number(row.value) || 0;
      metrics._count += 1;
    }

    dailyMetrics.set(dateKey, metrics);
  });

  const series = Array.from(dailyMetrics.entries())
    .map(([x, m]) => {
      let y = m._primary ?? (isRateMetric ? 0 : m._sum);

      if (metricSuffix === "cpc") {
        const spend = m.spend || 0;
        const clicks = m.clicks || 0;
        if (clicks > 0) y = spend / clicks;
      } else if (metricSuffix === "ctr") {
        const clicks = m.clicks || 0;
        const imps = m.impressions || 0;
        if (imps > 0) y = (clicks / imps) * 100;
      } else if (metricSuffix === "roas") {
        const rev = m.revenue || 0;
        const cost = m.spend || 0; // mapped cost to spend above
        if (cost > 0) y = rev / cost;
      } else if (isRateMetric && m._count > 0 && m._primary === undefined) {
        y = m._sum / m._count;
      }

      return { x, y };
    })
    .sort((a, b) => {
      const dateA = new Date(a.x).getTime();
      const dateB = new Date(b.x).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return dateA - dateB;
      }
      return 0;
    });

  // --- Format by widget type ---


  if (widget.type === "table") {
    return {
      rows: filteredRows,
      rawCount: filteredRows.length,
    };
  } else {
    return {
      value: total,
      total: total,
      series: series,
      rawCount: filteredRows.length,
      rows: filteredRows,
    };
  }
}

// ---------------------------------------------------------------------------
// Standalone fetch+process (for prefetchQuery use, e.g. before PDF export)
// ---------------------------------------------------------------------------

export async function fetchAndProcessWidget(
  widget: ReportWidgetDefinition,
  effectiveClientId: number | null | undefined,
  dateFrom: string,
  dateTo: string,
  shareToken?: string,
  integrationsData?: any
): Promise<ResolvedWidgetData> {
  // Snapshot shortcut
  if ((widget as any).snapshotData && shareToken) {
    const snap = (widget as any).snapshotData;
    const isSnapshot =
      snap.series ||
      typeof snap.value === "number" ||
      typeof snap.total === "number";
    if (isSnapshot) {
      return {
        value: snap.value ?? 0,
        total: snap.total ?? 0,
        rawCount: snap.rawCount ?? 0,
        rows: [],
        series: snap.series ?? [],
      };
    }
  }

  const normalizedInteg = normalizeIntegration(widget);

  if (!VALID_INTEGRATIONS.includes(normalizedInteg)) {
    return { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
  }
  if (!hasValidMetricPrefix(widget.metricKey)) {
    return { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
  }

  // --- Acquire concurrency slot before any API calls ---
  // (Removed manual promise queue, fetch directly)
  try {
    // --- SHORTCUT: Meta Ads CPC / CTR via Campaign Performance ---
    if (
      (normalizedInteg === "meta-ads" || normalizedInteg === "meta_ads") &&
      (widget.metricKey === "meta.ads.cpc" || widget.metricKey === "meta.ads.ctr")
    ) {
      try {
        console.time(`[Widget Timing] Meta Shortcut: ${widget.metricKey} (${widget.accountId})`);
        const campaignData = await fetchMetaAdsCampaignPerformance(
          effectiveClientId!,
          dateFrom,
          dateTo
        );
        console.timeEnd(`[Widget Timing] Meta Shortcut: ${widget.metricKey} (${widget.accountId})`);

        if (campaignData?.success && Array.isArray(campaignData.rows) && campaignData.rows.length > 0) {
          const rows = campaignData.rows;
          const totalClicks = rows.reduce((s, r) => s + (r.clicks || 0), 0);
          const totalImpressions = rows.reduce((s, r) => s + (r.impressions || 0), 0);

          if (widget.metricKey === "meta.ads.cpc") {
            const weightedSpend = rows.reduce((s, r) => s + ((r.clicks || 0) * (r.cpc || 0)), 0);
            if (totalClicks > 0 && weightedSpend > 0) {
              const cpc = weightedSpend / totalClicks;
              return { value: cpc, total: cpc, rawCount: 0, rows: [], series: [] };
            }
          } else {
            if (totalClicks > 0 && totalImpressions > 0) {
              const ctr = (totalClicks / totalImpressions) * 100;
              return { value: ctr, total: ctr, rawCount: 0, rows: [], series: [] };
            }
          }
        }
      } catch (shortcutErr) {
        console.timeEnd(`[Widget Timing] Meta Shortcut: ${widget.metricKey} (${widget.accountId})`);
        console.warn(`Shortcut failed for ${widget.metricKey}:`, shortcutErr);
      }
    }

    console.time(`[Widget Timing] Raw API Fetch: ${widget.metricKey} (${widget.accountId})`);
    const rawData = await fetchRawWidgetData(
      widget,
      normalizedInteg,
      effectiveClientId,
      dateFrom,
      dateTo,
      shareToken,
      integrationsData
    );
    console.timeEnd(`[Widget Timing] Raw API Fetch: ${widget.metricKey} (${widget.accountId})`);

    // GA4 pre-aggregated dimensional table — bypass processWidgetData.
    if (rawData && Array.isArray(rawData.columns) && rawData.columns.length > 0 && Array.isArray(rawData.rows)) {
      return rawData as ResolvedWidgetData;
    }

    console.time(`[Widget Timing] Processing/Aggregation: ${widget.metricKey} (${widget.accountId})`);
    const processedVars = processWidgetData(widget, rawData, effectiveClientId);
    console.timeEnd(`[Widget Timing] Processing/Aggregation: ${widget.metricKey} (${widget.accountId})`);
    return processedVars;
  } finally {
    // releaseFetchSlot(); removed
  }
}

// ---------------------------------------------------------------------------
// The hook
// ---------------------------------------------------------------------------

export function useWidgetData(params: UseWidgetDataParams) {
  const {
    widget,
    effectiveClientId,
    dateFrom,
    dateTo,
    shareToken,
    integrationsData,
    isLoadingIntegrations,
    isSlideVisible,
  } = params;

  const hasMetricKey = !!widget.metricKey;
  const hasDateRange = !!dateFrom && !!dateTo;
  const hasClientOrToken = !!(effectiveClientId || shareToken);

  const isEnabled = 
    hasMetricKey && 
    hasDateRange && 
    hasClientOrToken && 
    isSlideVisible && 
    !isLoadingIntegrations && 
    !!integrationsData;

  // Log once when query first becomes enabled (kept for debugging convenience, low noise)
  const wasEnabledRef = useRef(false);
  if (isEnabled && !wasEnabledRef.current) {
    wasEnabledRef.current = true;
    console.log(`✅ [WIDGET ENABLED] ${widget.metricKey} at ${new Date().toISOString()}`);
  }

  return useQuery<ResolvedWidgetData>({
    queryKey: getWidgetQueryKey(widget, dateFrom, dateTo, shareToken),
    enabled: isEnabled,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ResolvedWidgetData> => {
      const emptyResult: ResolvedWidgetData = { value: 0, total: 0, rawCount: 0, rows: [], series: [] };

      // Hard safety timeout: bail out after 10s for YouTube widgets so the skeleton
      // disappears instead of spinning indefinitely. The inner AbortController (8s)
      // handles most cases; this 10s serves as a final backstop.
      const isYouTubeWidget = (widget.metricKey || "").startsWith("youtube.");
      const hardTimeoutMs = isYouTubeWidget ? 10000 : undefined;

      const fetchPromise = fetchAndProcessWidget(
        widget,
        effectiveClientId,
        dateFrom,
        dateTo,
        shareToken,
        integrationsData
      ).catch((error) => {
        console.error(`Failed to fetch data for widget [${widget.metricKey}]:`, error);
        return emptyResult;
      });

      if (!hardTimeoutMs) return fetchPromise;

      const timeoutPromise = new Promise<ResolvedWidgetData>((resolve) =>
        setTimeout(() => {
          console.warn(`[YouTube] Widget ${widget.metricKey} hard-timeout after ${hardTimeoutMs}ms`);
          resolve(emptyResult);
        }, hardTimeoutMs)
      );

      return Promise.race([fetchPromise, timeoutPromise]);
    },
  });
}

