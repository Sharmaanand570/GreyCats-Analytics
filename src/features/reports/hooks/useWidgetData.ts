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
  fetchUnifiedAggregate,
} from "../api/reportingApi";
import { getMetricData } from "@/services/unifiedMetrics.api";
import {
  getGoogleConsoleTopPages,
  getGoogleConsoleTopQueries
} from "@/features/YouTube/API/googleConsoleapi";
import { getShopifyTrends } from "@/features/shopify/API/shopifyApi";
import { getMetricAggregation } from "@/utils/facebookMetrics";
import { getTwitterSummary, getTwitterAudienceHistory } from "@/features/twitter/api/twitterApi";
import { fetchLinkedinAnalytics, fetchLinkedinPosts } from "@/features/linkedin/api/linkedinApi";
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
  else if (metricKeyLower.startsWith("meta.ads.")) integrationForKey = "meta_ads";
  else if (metricKeyLower.startsWith("youtube.")) integrationForKey = "youtube";
  else if (metricKeyLower.startsWith("twitter.")) integrationForKey = "twitter";

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
  if (metricKey.startsWith("meta.ads.")) return "meta_ads";
  if (metricKey.startsWith("youtube.")) return "youtube";
  if (metricKey.startsWith("twitter.")) return "twitter";
  if (metricKey.startsWith("linkedin.")) return "linkedin";
  if (metricKey.startsWith("broadcast.")) return "broadcast";
  if (metricKey.startsWith("blog.")) return "blog";

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
      normalized = "meta_ads";
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
  "twitter",
  "linkedin",
  "broadcast",
  "blog",
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
    metricKey.startsWith("google_ads.") ||
    metricKey.startsWith("twitter.") ||
    metricKey.startsWith("linkedin.") ||
    metricKey.startsWith("broadcast.") ||
    metricKey.startsWith("blog.")
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
  // --- Broadcast ---
  if (normalizedInteg === "broadcast") {
    if (effectiveClientId || shareToken) {
      try {
        if (widget.metricKey === "broadcast.recent") {
          const response = await api.get('/broadcasts', {
            params: {
              clientId: effectiveClientId ?? undefined,
              from: dateFrom,
              to: dateTo,
            }
          });
          const rows = (response.data?.broadcasts || response.data || []).map((b: any) => ({
            id: b.id,
            metricKey: widget.metricKey,
            integration: "broadcast",
            name: b.name,
            channel: b.channel,
            status: b.status,
            sent: b.sent ?? b.sentCount ?? 0,
            failed: b.failed ?? b.failedCount ?? 0,
            total: b.total ?? b.totalCount ?? 0,
            date: b.date ?? (b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ""),
          }));
          return {
            success: true,
            rows,
            pagination: { page: 1, limit: rows.length, total: rows.length, totalPages: 1 },
            columns: [
              { name: "Date", width: "15%", dataKey: "date" },
              { name: "Name", width: "35%", dataKey: "name" },
              { name: "Channel", width: "15%", dataKey: "channel" },
              { name: "Status", width: "15%", dataKey: "status" },
              { name: "Sent", width: "10%", dataKey: "sent" },
              { name: "Failed", width: "10%", dataKey: "failed" },
            ]
          };
        } else {
          const channelFilter = widget.metricKey === "broadcast.sms" ? "SMS" :
                                widget.metricKey === "broadcast.email" ? "EMAIL" :
                                widget.metricKey === "broadcast.telegram" ? "TELEGRAM" : undefined;
                                
          const response = await api.get('/broadcasts/stats', {
            params: {
              clientId: effectiveClientId ?? undefined,
              channel: channelFilter,
              from: dateFrom,
              to: dateTo
            }
          });
          const stats = response.data;
          
          if (widget.metricKey === "broadcast.perDay") {
            const series = (stats.byDay || []).map((day: any) => ({
              x: day.date,
              y: day.total || 0,
              SMS: day.SMS || 0,
              EMAIL: day.EMAIL || 0,
              TELEGRAM: day.TELEGRAM || 0
            }));
            const total = series.reduce((acc: number, pt: any) => acc + pt.y, 0);
            return {
              success: true,
              series,
              total,
              value: total,
              rows: [],
              rawCount: series.length
            };
          } else if (widget.metricKey === "broadcast.channelSplit") {
            const series = Object.entries(stats.byChannel || {}).map(([channel, count]) => ({
              name: channel,
              value: count
            }));
            return {
              success: true,
              series,
              total: stats.total || 0,
              value: stats.total || 0,
              rows: [],
              rawCount: series.length
            };
          } else {
            let value = 0;
            if (widget.metricKey === "broadcast.total") value = stats.total || 0;
            else if (widget.metricKey === "broadcast.sent") value = stats.sent || 0;
            else if (widget.metricKey === "broadcast.failed") value = stats.failed || 0;
            else if (widget.metricKey === "broadcast.successRate") value = stats.total > 0 ? (stats.sent / stats.total) * 100 : 0;
            else if (channelFilter) {
              value = stats.sent || 0;
            }
            return {
              success: true,
              rows: [],
              value,
              total: value,
              summary: { [widget.metricKey.split('.').pop()!]: value }
            };
          }
        }
      } catch(err) {
        console.error("Failed to fetch Broadcast widget data", err);
      }
    }
  }

  // --- Blog ---
  if (normalizedInteg === "blog") {
    if (effectiveClientId || shareToken) {
      try {
        if (widget.metricKey === "blog.recent") {
          // Use /blog-posts/posts — same endpoint the Blog Scheduler uses, confirmed
          // to return posts for a client. (/blog/posts was claimed canonical by
          // backend but returns empty / 404 in practice.)
          const response = await api.get('/blog-posts/posts', {
            params: {
              clientId: effectiveClientId ?? undefined,
              from: dateFrom,
              to: dateTo,
            }
          });
          // A scheduled blog post can target multiple platforms (e.g. WordPress + LinkedIn).
          // Join all target platforms with " · " into a single label rather than picking one.
          const PLATFORM_LABELS: Record<string, string> = {
            wordpress: 'WordPress',
            linkedin: 'LinkedIn',
            telegram: 'Telegram',
            blogger: 'Blogger',
            reddit: 'Reddit',
          };
          const platformLabel = (t: any) => {
            const key = String(t?.platform ?? '').toLowerCase();
            return PLATFORM_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
          };
          const rows = (response.data?.posts || response.data || []).map((p: any) => {
            // Backend may already supply a joined `platforms` string; if not, build it
            // from `targets[]` for backwards compatibility with the older /blog/posts shape.
            const targets = Array.isArray(p.targets) ? p.targets : [];
            const platforms = p.platforms
              ?? (targets.length
                ? Array.from(new Set(targets.map(platformLabel).filter(Boolean))).join(' · ')
                : (p.platform ? platformLabel({ platform: p.platform }) : '—'));
            return {
              id: p.id,
              metricKey: widget.metricKey,
              integration: "blog",
              title: p.title,
              platforms,
              status: p.status,
              date: p.scheduledFor ? new Date(p.scheduledFor).toLocaleDateString() : "",
            };
          });
          return {
            success: true,
            rows,
            pagination: { page: 1, limit: rows.length, total: rows.length, totalPages: 1 },
            columns: [
              { name: "Date", width: "20%", dataKey: "date" },
              { name: "Title", width: "40%", dataKey: "title" },
              { name: "Platforms", width: "20%", dataKey: "platforms" },
              { name: "Status", width: "20%", dataKey: "status" },
            ]
          };
        } else {
          // NOTE: /api/blog/stats does NOT exist on the backend. All non-`blog.recent`
          // metric keys are served by /api/unified-metrics/data via the backend's
          // intercept in getUnifiedMetricData. Falling through to the unified path.
          // (Returning undefined here lets the rest of useWidgetData take over.)
        }
      } catch(err) {
        console.error("Failed to fetch Blog widget data", err);
      }
    }
  }

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

  // --- Twitter (X) ---
  if (normalizedInteg === "twitter") {
    if (effectiveClientId) {
      try {
        if (widget.metricKey === "twitter.audience_history") {
          // Calculate requested days diff
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          const daysDiff = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)));
          // Add 1 to ensure we cover the range inclusively if possible
          const audienceData = await getTwitterAudienceHistory(effectiveClientId, daysDiff + 1);
          console.log(`📊 [TwitterDebug] Audience History Raw:`, audienceData);
          
          if (audienceData?.success && Array.isArray(audienceData.history)) {
            // Transform history to generic series
            const series = audienceData.history.map(point => ({
              x: point.date,
              y: Number(point.followers ?? 0),
            }));
            
            // Filter series to strictly fall within dateFrom and dateTo
            // Normalize dates to start of day for cleaner comparison
            const startStr = new Date(dateFrom).toISOString().split('T')[0];
            const endStr = new Date(dateTo).toISOString().split('T')[0];
            
            const filteredSeries = series.filter(p => {
              const pDate = p.x.split('T')[0];
              return pDate >= startStr && pDate <= endStr;
            });

            console.log(`📊 [TwitterDebug] Filtered Series (${filteredSeries.length} points):`, filteredSeries);
            
            // For the value metric card on the chart slide, use the latest point in range
            const lastVal = filteredSeries.length > 0 ? filteredSeries[filteredSeries.length - 1].y : 0;
            
            return {
              success: true,
              series: filteredSeries,
              total: lastVal,
              value: lastVal,
              rows: [],
              rawCount: filteredSeries.length
            };
          }
        } else {
          // Summary Metrics
          const summaryData = await getTwitterSummary(effectiveClientId);
          console.log(`📊 [TwitterDebug] Summary Raw:`, summaryData);

          if (summaryData?.success) {
            let val = 0;
            const summary = summaryData.summary || {};
            const account = summaryData.account || {};

            if (widget.metricKey === "twitter.followers") {
              val = Number(summary.totalFollowers ?? account.followersCount ?? 0);
            } else if (widget.metricKey === "twitter.tweets") {
              val = Number(summary.tweetsPublishedLast30Days ?? summary.totalTweets ?? account.tweetCount ?? 0);
            } else if (widget.metricKey === "twitter.following") {
              val = Number(account.followingCount ?? summary.totalFollowing ?? 0);
            } else if (widget.metricKey === "twitter.followers_gained") {
              val = Number(summary.followersGained ?? 0);
            }

            console.log(`📊 [TwitterDebug] Metric ${widget.metricKey} resolved to:`, val);

            return {
              success: true,
              rows: [],
              value: val,
              total: val,
              summary: { [widget.metricKey.split('.').pop()!]: val },
            };
          }
        }
      } catch (err) {
        console.error("Failed to fetch Twitter widget data", err);
      }
    }
  }

  // --- LinkedIn ---
  if (normalizedInteg === "linkedin") {
    if (effectiveClientId || shareToken) {
      try {
        const analyticsData = await fetchLinkedinAnalytics(dateFrom, dateTo);
        console.log(`📊 [LinkedInDebug] Analytics Raw:`, analyticsData);

        if (analyticsData?.success && analyticsData.analytics) {
          const dates = Object.keys(analyticsData.analytics).sort();
          
          if (widget.type === "line_chart" || widget.type === "bar_chart" || widget.type === "chart" || (widget as any).widgetType === "chart") {
            // It's a time-series chart
            const series = dates.map(dateKey => ({
              x: dateKey,
              y: Number(analyticsData.analytics[dateKey][widget.metricKey] || 0)
            }));
            
            // Filter dates within range (assuming backend already filters, but double check)
            const filteredSeries = series.filter(p => p.x >= dateFrom && p.x <= dateTo);
            const total = filteredSeries.reduce((sum, p) => sum + p.y, 0);

            return {
              success: true,
              series: filteredSeries,
              total: total,
              value: total,
              rows: [],
              rawCount: filteredSeries.length
            };
          } else {
            // It's a metric card (scalar value)
            let totalVal = 0;
            dates.forEach(dateKey => {
              if (dateKey >= dateFrom && dateKey <= dateTo) {
                // followers might be a snapshot, don't sum if logic requires latest. The guide is vague. Summing usually safe for clicks.
                // For followers, we take the max or the last day's value
                if (widget.metricKey === "linkedin.followers") {
                   totalVal = Number(analyticsData.analytics[dateKey][widget.metricKey] || totalVal);
                } else {
                   totalVal += Number(analyticsData.analytics[dateKey][widget.metricKey] || 0);
                }
              }
            });

            return {
              success: true,
              rows: [],
              value: totalVal,
              total: totalVal,
              summary: { [widget.metricKey.split('.').pop()!]: totalVal },
            };
          }
        }
      } catch (err) {
        console.error("Failed to fetch LinkedIn widget data", err);
      }
    }
  }

  // --- LinkedIn Recent Posts ---
  if (widget.metricKey === "linkedin.recent_posts") {
    try {
      if (effectiveClientId || shareToken) {
        const postsData = await fetchLinkedinPosts();
        
        if (postsData?.success && Array.isArray(postsData.data)) {
          const rows = postsData.data.map((p: any) => ({
            id: p.id,
            metricKey: widget.metricKey,
            integration: "linkedin",
            accountId: widget.accountId || "",
            date: p.postedAt ? new Date(p.postedAt).toLocaleDateString() : "",
            post: p.content || "(No text)",
            impressions: p.impressions || 0,
            clicks: p.clicks || 0,
            likes: p.likes || 0,
            comments: p.comments || 0,
            shares: p.shares || 0,
            fullPicture: p.mediaUrl || null,
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
              { name: "Post", width: "35%", dataKey: "post" },
              { name: "Impressions", width: "12.5%", dataKey: "impressions" },
              { name: "Likes", width: "12.5%", dataKey: "likes" },
              { name: "Comments", width: "12.5%", dataKey: "comments" },
              { name: "Shares", width: "12.5%", dataKey: "shares" },
            ],
          };
        }
      }
    } catch (err) {
      console.error("Failed to fetch LinkedIn recent posts", err);
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
          if (postsData.posts.length > 0) {
            console.log('[recent_posts] sample post fields:', Object.keys(postsData.posts[0]));
            console.log('[recent_posts] sample fullPicture:', postsData.posts[0].fullPicture, '| full_picture:', (postsData.posts[0] as any).full_picture);
          }
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
            fullPicture: p.fullPicture || p.full_picture || null,
            permalinkUrl: p.permalinkUrl || p.permalink_url || null,
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
              { name: "Date", width: "10%" },
              { name: "Image", dataKey: "fullPicture" },
              { name: "Post", width: "35%", dataKey: "post" },
              { name: "Clicks", dataKey: "clicks" },
              { name: "Likes", dataKey: "likes" },
              { name: "Comments", dataKey: "comments" },
              { name: "Shares", dataKey: "shares" },
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
            comments: m.commentsCount,
            shares: m.shares,
            fullPicture: (m as any).thumbnailUrl || m.mediaUrl,
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
              { name: "Comments", dataKey: "comments" },
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
            integration: "meta_ads",
            accountId: widget.accountId || "",
            campaignName: row.campaignName,
            adName: row.adName,
            adsetName: row.adsetName,
            clicks: row.clicks,
            impressions: row.impressions,
            likes: row.likes,
            spend: row.spend,
            cpc: row.cpc,
            ctr: row.ctr,
            thumbnailUrl: row.thumbnailUrl,
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
              { name: "Ad", width: "15%", dataKey: "adName" },
              { name: "Ad Set", width: "15%", dataKey: "adsetName" },
              { name: "Spend", width: "10%", dataKey: "spend" },
              { name: "Impressions", width: "12%", dataKey: "impressions" },
              { name: "Clicks", width: "10%", dataKey: "clicks" },
              { name: "Likes", width: "8%", dataKey: "likes" },
              { name: "Avg CPC", width: "10%", dataKey: "cpc" },
              { name: "CTR", width: "10%", dataKey: "ctr" },
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

  // --- Google Ads Metric Cards (Aggregate Fast Path) ---
  // Metric cards (non-chart) use GET /api/unified-metrics/aggregate for pre-aggregated scalar values.
  // Response: { success, metricKey, value, rowCount, isRatioMetric, aggregation }
  // Chart widgets (needsSeries=true) fall through to the standard row-based path for time-series data.
  const GOOGLE_ADS_SUMMARY_METRICS = [
    "google_ads.clicks",
    "google_ads.impressions",
    "google_ads.average_cpc",
    "google_ads.conversions",
    "google_ads.conv_rate",
    "google_ads.ctr",
    "google_ads.cost",
    // Legacy aliases kept for backward-compat with existing saved widgets
    "google_ads.cpc",
    "google_ads.spend",
    "google_ads.roas",
    "google_ads.revenue",
    "google_ads.view_through_conversions",
    "google_ads.interactions",
  ];

  const wTypeForAds = (widget.type || (widget as any).widgetType || "").toLowerCase();
  const needsSeriesForAds =
    wTypeForAds === "chart" ||
    wTypeForAds === "line_chart" ||
    wTypeForAds === "bar_chart" ||
    wTypeForAds === "area_chart" ||
    wTypeForAds === "pie_chart";

  if (
    (normalizedInteg === "google-ads" || normalizedInteg === "google_ads") &&
    GOOGLE_ADS_SUMMARY_METRICS.includes(widget.metricKey) &&
    !needsSeriesForAds &&
    (effectiveClientId || shareToken)
  ) {
    try {
      const aggResult = await fetchUnifiedAggregate({
        metricKey: widget.metricKey,
        integration: "google_ads",
        startDate: dateFrom,
        endDate: dateTo,
        clientId: effectiveClientId ?? undefined,
      });

      if (aggResult?.success && typeof aggResult.value === "number") {
        const metricSuffix = widget.metricKey.split(".").pop()!;
        return {
          success: true,
          rows: [],
          value: aggResult.value,
          total: aggResult.value,
          rowCount: aggResult.rowCount,
          summary: { [metricSuffix]: aggResult.value },
        };
      }
    } catch (err) {
      console.error("Failed to fetch Google Ads aggregate metric", err);
    }
  }

  // --- Google Ads Chart Widgets (Time-Series Fast Path) ---
  // Chart widgets call GET /api/unified-metrics/data with groupBy=day to get
  // daily series data. Response: { success, data: { series, total, rawCount } }
  if (
    (normalizedInteg === "google-ads" || normalizedInteg === "google_ads") &&
    GOOGLE_ADS_SUMMARY_METRICS.includes(widget.metricKey) &&
    needsSeriesForAds &&
    (effectiveClientId || shareToken)
  ) {
    try {
      const seriesResult = await getMetricData({
        integration: "google_ads",
        metricKey: widget.metricKey,
        dateFrom,
        dateTo,
        groupBy: "day",
        clientId: effectiveClientId ?? undefined,
        token: shareToken,
      });

      const series = seriesResult?.data?.series ?? [];
      const total = seriesResult?.data?.total;
      console.log(`[useWidgetData] Google Ads chart ${widget.metricKey}:`, { seriesPoints: series.length, total });
      return {
        success: true,
        series,
        total,
        value: total,
        rows: [],
        rawCount: seriesResult?.data?.rawCount ?? series.length,
        privacyThresholdMet: (seriesResult as any)?.data?.privacyThresholdMet,
        currentFollowers: (seriesResult as any)?.data?.currentFollowers,
      };
    } catch (err) {
      console.error("Failed to fetch Google Ads chart time-series", err);
    }
  }

  // --- Meta Instagram: metric cards and chart widgets ---
  // Uses GET /api/unified-metrics/data for all regular instagram metrics.
  const isInstagramMetric =
    (normalizedInteg === "meta-instagram") &&
    widget.metricKey.startsWith("meta.instagram.") &&
    widget.metricKey !== "meta.instagram.recent_media";

  if (isInstagramMetric && (effectiveClientId || shareToken)) {
    try {
      const groupBy = needsSeriesForAds ? "day" : undefined;
      const result = await getMetricData({
        integration: "meta_instagram",
        metricKey: widget.metricKey,
        dateFrom,
        dateTo,
        groupBy: groupBy as any,
        clientId: effectiveClientId ?? undefined,
        token: shareToken,
      });
      const series = result?.data?.series ?? [];
      const total = result?.data?.total;
      console.log(`[useWidgetData] Instagram ${widget.metricKey}:`, { total, seriesPoints: series.length });
      return {
        success: true,
        series,
        total,
        value: total,
        rows: [],
        rawCount: result?.data?.rawCount ?? series.length,
        privacyThresholdMet: (result as any)?.data?.privacyThresholdMet,
        currentFollowers: (result as any)?.data?.currentFollowers,
      };
    } catch (err) {
      console.error(`Failed to fetch Instagram metric ${widget.metricKey}`, err);
    }
  }

  // --- Meta Facebook: metric cards and chart widgets ---
  // Uses GET /api/unified-metrics/data for all regular facebook metrics.
  const isFacebookMetric =
    (normalizedInteg === "meta-facebook") &&
    (widget.metricKey.startsWith("meta.facebook.") || widget.metricKey.startsWith("meta.page.")) &&
    widget.metricKey !== "meta.facebook.recent_posts";

  if (isFacebookMetric && (effectiveClientId || shareToken)) {
    try {
      const groupBy = needsSeriesForAds ? "day" : undefined;
      const result = await getMetricData({
        integration: "meta_facebook",
        metricKey: widget.metricKey,
        dateFrom,
        dateTo,
        groupBy: groupBy as any,
        clientId: effectiveClientId ?? undefined,
        token: shareToken,
      });
      const series = result?.data?.series ?? [];
      const total = result?.data?.total;
      console.log(`[useWidgetData] Facebook ${widget.metricKey}:`, { total, seriesPoints: series.length });
      return {
        success: true,
        series,
        total,
        value: total,
        rows: [],
        rawCount: result?.data?.rawCount ?? series.length,
        privacyThresholdMet: (result as any)?.data?.privacyThresholdMet,
        currentFollowers: (result as any)?.data?.currentFollowers,
      };
    } catch (err) {
      console.error(`Failed to fetch Facebook metric ${widget.metricKey}`, err);
    }
  }

  // --- Google Analytics & GSC: metric cards and chart widgets ---
  // Both use GET /api/unified-metrics/data.
  // - Metric cards: no groupBy → reads total as scalar value
  // - Charts: groupBy=day → reads series for time-series rendering
  // Dimensional table widgets (google.channel_traffic etc.) fall through to
  // the GA_DIMENSIONAL_TABLES handler below.
  const GA_DIMENSIONAL_KEYS = new Set([
    'google.channel_traffic', 'google.browser_used', 'google.device_category',
    'google.geo_country', 'google.geo_city', 'google.top_pages',
    'google_seo.top_pages', 'google_seo.top_queries',
  ]);

  const isGAMetric = (
    widget.metricKey.startsWith('google.') || widget.metricKey.startsWith('ga4.')
  ) && !GA_DIMENSIONAL_KEYS.has(widget.metricKey);

  const isGSCMetric = widget.metricKey.startsWith('google_seo.') &&
    !GA_DIMENSIONAL_KEYS.has(widget.metricKey);

  if ((isGAMetric || isGSCMetric) && (effectiveClientId || shareToken)) {
    try {
      if (isGSCMetric) {
        if (needsSeriesForAds) {
          const gscResult = await getMetricData({
            integration: "google-search-console",
            metricKey: widget.metricKey,
            dateFrom,
            dateTo,
            groupBy: "day",
            clientId: effectiveClientId ?? undefined,
            token: shareToken,
          });

          const series = gscResult?.data?.series ?? [];
          const total = gscResult?.data?.total;
          console.log(`[useWidgetData] GSC chart ${widget.metricKey}:`, { seriesPoints: series.length, total });
          return {
            success: true,
            series,
            total,
            value: total,
            rows: [],
            rawCount: gscResult?.data?.rawCount ?? series.length,
          };
        }

        const aggregateResult = await fetchUnifiedAggregate({
          metricKey: widget.metricKey,
          integration: "google-search-console",
          startDate: dateFrom,
          endDate: dateTo,
          clientId: effectiveClientId ?? undefined,
        });

        if (aggregateResult?.success && typeof aggregateResult.value === "number") {
          return {
            success: true,
            rows: [],
            value: aggregateResult.value,
            total: aggregateResult.value,
            rawCount: aggregateResult.rowCount ?? 0,
          };
        }

        const fallbackResult = await getMetricData({
          integration: "google-search-console",
          metricKey: widget.metricKey,
          dateFrom,
          dateTo,
          clientId: effectiveClientId ?? undefined,
          token: shareToken,
        });

        const series = fallbackResult?.data?.series ?? [];
        const total = fallbackResult?.data?.total;
        console.log(`[useWidgetData] GSC fallback ${widget.metricKey}:`, { seriesPoints: series.length, total });
        return {
          success: true,
          series,
          total,
          value: total,
          rows: [],
          rawCount: fallbackResult?.data?.rawCount ?? series.length,
        };
      }

      const gaGroupBy = needsSeriesForAds ? "day" : undefined;
      const gaResult = await getMetricData({
        integration: "google_analytics",
        metricKey: widget.metricKey,
        dateFrom,
        dateTo,
        groupBy: gaGroupBy as any,
        clientId: effectiveClientId ?? undefined,
        token: shareToken,
      });

      const series = gaResult?.data?.series ?? [];
      const total = gaResult?.data?.total;
      console.log(`[useWidgetData] GA ${widget.metricKey}:`, { seriesPoints: series.length, total, groupBy: gaGroupBy });
      return {
        success: true,
        series,
        total,
        value: total,
        rows: [],
        rawCount: gaResult?.data?.rawCount ?? series.length,
      };
    } catch (err) {
      console.error(`Failed to fetch GA/GSC metric ${widget.metricKey}`, err);
    }
  }

  // --- Google Analytics: Dimensional Table Widgets ---
  // These special metricKeys call GET /api/unified-metrics/table which returns
  // pre-aggregated rows (one per dimension value) with all metric columns.
  // Response shape: { success, rows: [{ dimension, "google.sessions": N, ... }] }
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
      metricKeys: ['google.sessions', 'google.activeUsers', 'google.avgSessionDuration', 'google.eventCount'],
      columns: [
        { name: 'Page Path', width: '30%', dataKey: 'dimensionValue' },
        { name: 'Sessions', width: '14%', dataKey: 'sessions' },
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
        // GA table widgets: use the new /api/unified-metrics/table endpoint
        // Response: { success, rows: [{ dimension, "google.sessions": N, ... }] }
        const tableQueryParams: Record<string, any> = {
          integration: 'google_analytics',
          dimensionType: gaDimTable.dimensionType,
          metricKeys: gaDimTable.metricKeys.join(','),
          dateFrom,
          dateTo,
          clientId: effectiveClientId ? Number(effectiveClientId) : undefined,
        };
        console.log(`[Widget API] GET /api/unified-metrics/table`, {
          metricKey: widget.metricKey,
          dimensionType: gaDimTable.dimensionType,
          metricKeys: gaDimTable.metricKeys,
          dateFrom,
          dateTo,
        });
        dimResponse = await api.get('/unified-metrics/table', {
          params: tableQueryParams,
        }).then((r: any) => r.data);
        console.log(`[Widget API] Response /api/unified-metrics/table`, dimResponse);
      }

      if (dimResponse?.rows && Array.isArray(dimResponse.rows) && dimResponse.rows.length > 0) {
        if (isGsc) {
          // GSC rows are already aggregated by the normalisation above — use legacy logic
          const byDimension = new Map<string, Record<string, number>>();
          dimResponse.rows.forEach((row: any) => {
            const dim = row.dimensionValue || '(not set)';
            const metricSuffix = (row.metricKey || '').split('.').pop() || '';
            if (!byDimension.has(dim)) {
              byDimension.set(dim, { _clicks: 0, _impressions: 0, _ctr: 0, _ctrCount: 0, _position: 0, _positionCount: 0 });
            }
            const acc = byDimension.get(dim)!;
            const val = Number(row.value) || 0;
            if (metricSuffix === 'clicks') acc._clicks += val;
            else if (metricSuffix === 'impressions') acc._impressions += val;
            else if (metricSuffix === 'ctr') { acc._ctr += val; acc._ctrCount += 1; }
            else if (metricSuffix === 'position') { acc._position += val; acc._positionCount += 1; }
          });
          const aggregatedRows = Array.from(byDimension.entries()).map(([dim, acc], idx) => ({
            id: idx,
            metricKey: widget.metricKey,
            integration: 'google-search-console',
            dimensionValue: dim,
            page: dim,
            query: dim,
            clicks: acc._clicks,
            impressions: acc._impressions,
            ctr: acc._ctrCount > 0 ? `${(acc._ctr / acc._ctrCount * 100).toFixed(2)}%` : "0.00%",
            position: acc._positionCount > 0 ? parseFloat((acc._position / acc._positionCount).toFixed(1)) : 0,
            value: acc._clicks || acc._impressions,
          }));
          aggregatedRows.sort((a, b) => (b.value || 0) - (a.value || 0));
          return {
            success: true,
            rows: aggregatedRows,
            pagination: { page: 1, limit: aggregatedRows.length, total: aggregatedRows.length, totalPages: 1 },
            columns: gaDimTable.columns,
          };
        }

        // GA new table endpoint: rows have { dimension, "google.sessions": N, ... }
        const mappedRows = dimResponse.rows.map((row: any, idx: number) => {
          const dimensionValue = row.dimension || row.dimensionValue || '(not set)';
          const sessions = Number(row['google.sessions'] ?? row.sessions ?? 0);
          const activeUsers = Number(row['google.activeUsers'] ?? row.activeUsers ?? 0);
          const newUsers = Number(row['google.newUsers'] ?? row.newUsers ?? 0);
          const engagedSessions = Number(row['google.engagedSessions'] ?? row.engagedSessions ?? 0);
          const engagementRate = Number(row['google.engagementRate'] ?? row.engagementRate ?? 0);
          const avgSessionDuration = Number(row['google.avgSessionDuration'] ?? row.avgSessionDuration ?? 0);
          const eventCount = Number(row['google.eventCount'] ?? row.eventCount ?? 0);
          const pageViews = Number(row['google.pageViews'] ?? row.pageViews ?? 0);

          const primaryValue = sessions || activeUsers || pageViews;

          return {
            id: idx,
            metricKey: widget.metricKey,
            integration: 'google_analytics',
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
          success: true,
          rows: mappedRows,
          pagination: { page: 1, limit: mappedRows.length, total: mappedRows.length, totalPages: 1 },
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
  const META_ADS_AGGREGATE_KEYS = [
    "meta.ads.spend",
    "meta.ads.impressions",
    "meta.ads.clicks",
    "meta.ads.cpc",
    "meta.ads.ctr",
  ] as const;
  const needsMetaAdsAggregate =
    (normalizedInteg === "meta-ads" || normalizedInteg === "meta_ads") &&
    META_ADS_AGGREGATE_KEYS.includes(widget.metricKey as any);

  const aggregatePromise = (needsGscAggregate || needsMetaAdsAggregate)
    ? fetchUnifiedAggregate({
      metricKey: widget.metricKey,
      integration: needsGscAggregate ? "google-search-console" : "meta_ads",
      startDate: dateFrom,
      endDate: dateTo,
      accountId: widget.accountId || undefined,
      clientId: effectiveClientId ?? undefined,
    })
    : null;

  // --- Fast path: Metric cards only need the aggregate value, skip the standard fetch ---
  // Chart widgets still need rows for time-series rendering.
  const wType = widget.type || (widget as any).widgetType || "";
  const needsSeries = wType === "chart" || wType === "line_chart" || wType === "bar_chart";

  if (aggregatePromise && !needsSeries) {
    try {
      const aggregateResult = await aggregatePromise;
      console.log(`[Aggregate Response] ${widget.metricKey}:`, {
        value: aggregateResult?.value,
        isRatioMetric: aggregateResult?.isRatioMetric,
        aggregation: aggregateResult?.aggregation,
        rowCount: aggregateResult?.rowCount,
        success: aggregateResult?.success,
      });
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
  // Chart widgets skip the aggregate fast path (needsSeriesForAds = true).
  // When the backend hasn't populated the DB for the selected date range,
  // fetchUnifiedMetric returns no rows and the chart shows 0.
  // Fallback: call the aggregate API and synthesize uniform daily rows so the
  // chart renders actual values instead of an empty 0-line.
  if (
    (normalizedInteg === "google-ads" || normalizedInteg === "google_ads") &&
    needsSeriesForAds &&
    GOOGLE_ADS_SUMMARY_METRICS.includes(widget.metricKey) &&
    effectiveClientId &&
    (!data?.rows || data.rows.length === 0)
  ) {
    try {
      const aggResult = await fetchUnifiedAggregate({
        metricKey: widget.metricKey,
        integration: "google_ads",
        startDate: dateFrom,
        endDate: dateTo,
        clientId: effectiveClientId,
      });

      if (aggResult?.success && typeof aggResult.value === "number" && aggResult.value > 0) {
        const metricValue = aggResult.value;
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
          summary: { [widget.metricKey.split(".").pop()!]: metricValue },
        };
      }
    } catch (err) {
      console.error("[Google Ads Chart Fallback] Failed to fetch aggregate", err);
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
  // Snapshot data detection (already resolved, e.g. from batch dashboard fetcher)
  const isSnapshotData =
    data &&
    (Array.isArray((data as any).series) ||
      typeof (data as any).value === "number" ||
      typeof (data as any).total === "number") &&
    (!data.rows || (Array.isArray(data.rows) && data.rows.length === 0));

  if (isSnapshotData) {
    const hasSeries = Array.isArray((data as any).series) && (data as any).series.length > 0;
    const seriesTotal = hasSeries
      ? (data as any).series.reduce((acc: number, pt: { x: string; y: number }) => acc + (pt.y ?? 0), 0)
      : 0;
    return {
      value: (data as any).value ?? (data as any).total ?? seriesTotal,
      total: (data as any).total ?? (data as any).value ?? seriesTotal,
      rawCount: (data as any).rawCount ?? (hasSeries ? (data as any).series.length : 0),
      rows: data.rows ?? [],
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

      // Google Search Console: widget.accountId is often the site URL (e.g. sc-domain:example.com)
      // which might not strictly match the row account ID. Trust API scoping.
      if (widgetInteg === "google-search-console") accountMatch = true;
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
    const isGscDimension =
      widget.metricKey.startsWith("google_seo") &&
      ["page", "query"].includes(dimType);

    const passes = (
      !isDimensional ||
      isTimeDimension ||
      isYouTubeDimension ||
      isMetaAdsDimension ||
      isGoogleAdsDimension ||
      isGscDimension
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
  // Snapshot shortcut — use pre-calculated data from scheduled reports.
  // IMPORTANT: Distinguish REAL metric snapshots (series, total, rows from API)
  // from WIDGET CONFIG data ({label, value: 0, hideDataPoints}) which is the
  // default display config baked into every widget. Widget config has 'label'
  // or 'hideDataPoints' keys — real snapshots never do.
  if ((widget as any).snapshotData && shareToken) {
    const snap = (widget as any).snapshotData;
    const isWidgetConfig = 'label' in snap || 'hideDataPoints' in snap || 'chartType' in snap;
    if (!isWidgetConfig) {
      const hasSeries = Array.isArray(snap.series) && snap.series.length > 0;
      const hasValue = typeof snap.value === "number" || typeof snap.total === "number";
      if (hasSeries || hasValue) {
        const seriesTotal = hasSeries
          ? snap.series.reduce((acc: number, pt: { x: string; y: number }) => acc + (pt.y ?? 0), 0)
          : 0;
        const effectiveValue = snap.value ?? snap.total ?? seriesTotal;
        const effectiveTotal = snap.total ?? snap.value ?? seriesTotal;
        console.log(`%c[SharedWidget] ✅ SNAPSHOT used for ${widget.metricKey}`, 'color:#27ae60;font-weight:bold', {
          value: effectiveValue, total: effectiveTotal, seriesPoints: snap.series?.length ?? 0,
        });
        return {
          value: effectiveValue,
          total: effectiveTotal,
          rawCount: snap.rawCount ?? (hasSeries ? snap.series.length : 0),
          rows: snap.rows ?? [],
          series: snap.series ?? [],
        };
      }
    }
  }

  const normalizedInteg = normalizeIntegration(widget);

  if (!VALID_INTEGRATIONS.includes(normalizedInteg)) {
    if (shareToken) console.warn(`[SharedWidget] ❌ INVALID integration "${normalizedInteg}" for ${widget.metricKey}`);
    return { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
  }
  if (!hasValidMetricPrefix(widget.metricKey)) {
    if (shareToken) console.warn(`[SharedWidget] ❌ INVALID metricKey prefix "${widget.metricKey}"`);
    return { value: 0, total: 0, rawCount: 0, rows: [], series: [] };
  }

  // --- Acquire concurrency slot before any API calls ---
  // (Removed manual promise queue, fetch directly)
  try {
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

    if (shareToken) {
      console.log(`%c[SharedWidget] 📦 API response for ${widget.metricKey}`, 'color:#3498db;font-weight:bold', {
        hasData: !!rawData,
        value: rawData?.value, total: rawData?.total,
        seriesLen: rawData?.series?.length, rowsLen: rawData?.rows?.length,
        success: rawData?.success,
        rawDataKeys: rawData ? Object.keys(rawData) : [],
      });
    }

    // GA4 pre-aggregated dimensional table — bypass processWidgetData.
    if (rawData && Array.isArray(rawData.columns) && rawData.columns.length > 0 && Array.isArray(rawData.rows)) {
      return rawData as ResolvedWidgetData;
    }

    console.time(`[Widget Timing] Processing/Aggregation: ${widget.metricKey} (${widget.accountId})`);
    const processedVars = processWidgetData(widget, rawData, effectiveClientId);
    console.timeEnd(`[Widget Timing] Processing/Aggregation: ${widget.metricKey} (${widget.accountId})`);

    if (shareToken) {
      console.log(`%c[SharedWidget] 🏁 FINAL for ${widget.metricKey}`, 'color:#9b59b6;font-weight:bold', {
        value: processedVars.value, total: processedVars.total,
        seriesLen: (processedVars as any).series?.length, rowsLen: (processedVars as any).rows?.length,
      });
    }

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
    // In shared mode, integrations are never fetched (readOnly) — skip the requirement
    (shareToken ? true : (!isLoadingIntegrations && !!integrationsData));

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

