import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { ReportWidgetDefinition, ResolvedWidgetData } from "../api/types";
import type { UnifiedMetricRow } from "../api/reportingApi";
import {
  fetchUnifiedMetric,
  fetchMetaStoredPosts,
  fetchInstagramStoredMedia,
  fetchMetaAdsCampaignPerformance,
} from "../api/reportingApi";
import { getShopifyTrends } from "@/features/shopify/API/shopifyApi";
import { getMetricAggregation } from "@/utils/facebookMetrics";
import api from "@/apiConfig";

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
  return [
    "widget-data",
    widget.integration,
    widget.metricKey,
    widget.accountId ?? "",
    JSON.stringify(widget.filters ?? {}),
    dateFrom,
    dateTo,
    shareToken ?? "",
  ];
}

// ---------------------------------------------------------------------------
// Normalize integration name for API
// ---------------------------------------------------------------------------

function normalizeIntegration(widget: ReportWidgetDefinition): string {
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
];

function hasValidMetricPrefix(metricKey: string): boolean {
  return (
    metricKey.startsWith("google.") ||
    metricKey.startsWith("google_seo.") ||
    metricKey.startsWith("google-console.") ||
    metricKey.startsWith("meta.") ||
    metricKey.startsWith("youtube.") ||
    metricKey.startsWith("shopify.") ||
    metricKey.startsWith("woo.")
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

      // If widget.accountId is empty, look up from integrations data
      if (!targetAccountId) {
        try {
          let integrations = integrationsData?.integrations;

          if (!integrations && effectiveClientId) {
            const integrationsResponse = await api.get(
              `/integrations/client/${effectiveClientId}`
            );
            integrations = Array.isArray(integrationsResponse.data)
              ? integrationsResponse.data
              : integrationsResponse.data?.integrations ||
                integrationsResponse.data;
          }

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
        } catch (err) {
          console.error(
            "Failed to fetch Instagram page ID from integrations",
            err
          );
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

  // --- Standard: Unified Metrics API ---
  const shouldIncludeAccountId = !["meta-facebook", "meta-instagram"].includes(
    normalizedInteg
  );

  const params: any = {
    integration: normalizedInteg,
    metricKey: widget.metricKey,
    startDate: dateFrom,
    endDate: dateTo,
    token: shareToken,
    groupBy:
      widget.type === "chart" ||
      (widget as any).widgetType === "chart"
        ? "day"
        : widget.groupBy && widget.groupBy !== "none"
          ? widget.groupBy
          : undefined,
    ...(shouldIncludeAccountId && widget.accountId
      ? { accountId: widget.accountId }
      : {}),
    filters: widget.filters,
  };

  const data = await fetchUnifiedMetric(effectiveClientId, params);
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
    const widgetInteg = (widget.integration || "")
      .replace(/_/g, "-")
      .toLowerCase();

    if (rowInteg !== widgetInteg && widgetInteg !== "meta-business")
      return false;

    let accountMatch = true;
    if (rowInteg.startsWith("meta") || widget.accountId) {
      const rowAcc = String(row.accountId || "").replace(/^act_/, "");
      const widAcc = String(widget.accountId || "").replace(/^act_/, "");

      if (
        !rowAcc &&
        (row.dimensionType === "page" || row.dimensionType === "account") &&
        row.dimensionValue
      ) {
        const dimVal = String(row.dimensionValue).replace(/^act_/, "");
        accountMatch = dimVal === widAcc;
      } else {
        accountMatch = rowAcc === widAcc;
      }

      if (widgetInteg === "meta-business") {
        accountMatch = true;
      }

      if (widgetIntegration === "meta-business") accountMatch = true;
    }

    let clientMatch = true;
    if (effectiveClientId && row.clientId) {
      clientMatch = String(row.clientId) === String(effectiveClientId);
    }

    return (
      row.metricKey === widget.metricKey &&
      (rowInteg === widgetInteg ||
        (widgetInteg === "meta-business" && rowInteg.startsWith("meta"))) &&
      accountMatch &&
      clientMatch
    );
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
  const filteredRows = matchingRows.filter((row: any) => {
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
      ["campaign", "adset", "ad", "page", "account"].includes(dimType);

    return (
      !isDimensional ||
      isTimeDimension ||
      isYouTubeDimension ||
      isMetaAdsDimension
    );
  });

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
    metricKeyLower.includes("perview");

  // --- Total calculation ---
  let total = 0;

  // Try API-provided summary first
  const summary = (data as any).summary;
  const metricSuffix =
    widget.metricKey.split(".").pop()?.toLowerCase() || "";

  if (summary) {
    let summaryKey = metricSuffix;
    if (summaryKey === "cost_per_click") summaryKey = "cpc";
    if (summaryKey === "click_through_rate") summaryKey = "ctr";
    if (summaryKey === "cost_per_mille") summaryKey = "cpm";
    if (summaryKey === "amount_spent") summaryKey = "spend";

    if (summaryKey && typeof summary[summaryKey] === "number") {
      total = summary[summaryKey];
    }
  }

  const summaryUsed =
    summary && typeof summary[metricSuffix] === "number";

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
                String(r.accountId) === String(widget.accountId))
          )
          .reduce(
            (sum: number, r: any) => sum + (Number(r.value) || 0),
            0
          );
      };

      if (metricSuffix === "cpc") {
        const sumSpend = getSum("spend") || getSum("amount_spent");
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
        const sumSpend = getSum("spend");
        const sumImpressions = getSum("impressions");
        if (sumImpressions > 0) {
          total = (sumSpend / sumImpressions) * 1000;
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
  const seriesMap = new Map<string, { sum: number; count: number }>();
  filteredRows.forEach((row: any) => {
    const dateKey = row.date || row.dimensionValue || "";
    if (dateKey) {
      const current = seriesMap.get(dateKey) || { sum: 0, count: 0 };
      seriesMap.set(dateKey, {
        sum: current.sum + (row.value || 0),
        count: current.count + 1,
      });
    }
  });

  const series = Array.from(seriesMap.entries())
    .map(([x, { sum, count }]) => {
      const value = isRateMetric ? sum / count : sum;
      return { x, y: value };
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

  const rawData = await fetchRawWidgetData(
    widget,
    normalizedInteg,
    effectiveClientId,
    dateFrom,
    dateTo,
    shareToken,
    integrationsData
  );

  return processWidgetData(widget, rawData, effectiveClientId);
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

  return useQuery<ResolvedWidgetData>({
    queryKey: getWidgetQueryKey(widget, dateFrom, dateTo, shareToken),
    enabled:
      hasMetricKey && hasDateRange && hasClientOrToken && isSlideVisible,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ResolvedWidgetData> => {
      // Snapshot shortcut (Shared Reports)
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

      // Safety: Don't fetch if integrations not ready
      if (isLoadingIntegrations || !integrationsData) {
        return { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
      }

      const normalizedInteg = normalizeIntegration(widget);

      // Validate integration
      if (!VALID_INTEGRATIONS.includes(normalizedInteg)) {
        return { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
      }

      // Validate metric key format
      if (!hasValidMetricPrefix(widget.metricKey)) {
        console.warn(`Invalid metric key format: ${widget.metricKey}`);
        return { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
      }

      try {
        const rawData = await fetchRawWidgetData(
          widget,
          normalizedInteg,
          effectiveClientId,
          dateFrom,
          dateTo,
          shareToken,
          integrationsData
        );

        return processWidgetData(widget, rawData, effectiveClientId);
      } catch (error) {
        console.error(
          `Failed to fetch data for widget [${widget.metricKey}]:`,
          error
        );
        return { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
      }
    },
  });
}
