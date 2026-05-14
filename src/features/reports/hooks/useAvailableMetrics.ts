import { useQuery } from "@tanstack/react-query";
import type { DebugMetric } from "../api/types";
import { useMemo } from "react";
import { FACEBOOK_DAILY_METRICS, FACEBOOK_CUMULATIVE_METRICS } from "../../../utils/facebookMetrics";
import { normalizeIntegrationId } from "@/services/unifiedMetrics.api";

export interface AvailableMetric {
  metricKey: string;
  integration: string;
  accountId: string;
  displayName: string;
  category: string;
  filters?: Record<string, unknown>;
  value?: number;
}

export interface MetricsByIntegration {
  [integration: string]: {
    [accountId: string]: AvailableMetric[];
  };
}

// Helper function to extract display name from metricKey
const getMetricDisplayName = (metricKey: string): string => {
  const overrides: Record<string, string> = {
    "meta.facebook.page.page_follows": "Page follows",
    "meta.facebook.page.page_posts_impressions_unique": "Unique page post impressions",
    "meta.facebook.page.page_consumptions": "Page views",
    "meta.facebook.post.count": "Posts (total)",
    "meta.facebook.page.page_media_view": "Page media views",
    "meta.facebook.page.page_post_engagements": "Post engagement",
    "meta.facebook.page.page_video_views": "Video views",
  };
  if (overrides[metricKey]) return overrides[metricKey];

  // Special handling for aggregated metrics
  if (metricKey.includes('aggregated')) {
    const parts = metricKey.split('.');
    const metricName = parts[parts.length - 1]; // e.g. 'likes'
    return `Aggregated ${metricName.charAt(0).toUpperCase() + metricName.slice(1)}`;
  }

  // Extract the last part after the last dot
  const parts = metricKey.split('.');
  const name = parts[parts.length - 1];

  // Convert snake_case or camelCase to Title Case
  return name
    .replace(/[_-]/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
};

// Helper function to extract category from metricKey
const getMetricCategory = (metricKey: string): string => {
  const parts = metricKey.split('.');
  if (parts.length > 1) {
    // Use the second-to-last part as category if available
    const categoryPart = parts.length > 2 ? parts[parts.length - 2] : parts[0];
    return categoryPart
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  return 'General';
};

// Static metric definitions for each integration — injected even when the backend API
// returns no rows for that integration (e.g. first sync, API error, empty DB).
const GOOGLE_ADS_STATIC_METRICS: Array<{ metricKey: string; displayName: string; category: string }> = [
  { metricKey: 'google_ads.clicks',       displayName: 'Clicks',       category: 'Performance' },
  { metricKey: 'google_ads.impressions',  displayName: 'Impressions',  category: 'Performance' },
  { metricKey: 'google_ads.cost',         displayName: 'Spend',        category: 'Performance' },
  { metricKey: 'google_ads.ctr',          displayName: 'CTR',          category: 'Performance' },
  { metricKey: 'google_ads.average_cpc',  displayName: 'Avg. CPC',     category: 'Performance' },
  { metricKey: 'google_ads.conversions',  displayName: 'Conversions',  category: 'Conversions' },
  { metricKey: 'google_ads.conv_rate',    displayName: 'Conv. Rate',   category: 'Conversions' },
  { metricKey: 'google_ads.campaign_performance', displayName: 'Campaign Performance (Table)', category: 'Tables' },
];

const GSC_STATIC_METRICS: Array<{ metricKey: string; displayName: string; category: string }> = [
  { metricKey: 'google_seo.clicks',      displayName: 'Clicks',       category: 'Overview' },
  { metricKey: 'google_seo.impressions', displayName: 'Impressions',  category: 'Overview' },
  { metricKey: 'google_seo.ctr',         displayName: 'CTR',          category: 'Overview' },
  { metricKey: 'google_seo.position',    displayName: 'Avg. Position',category: 'Overview' },
  { metricKey: 'google_seo.top_pages',   displayName: 'Top Pages (Table)',   category: 'Tables' },
  { metricKey: 'google_seo.top_queries', displayName: 'Top Queries (Table)', category: 'Tables' },
];

const YOUTUBE_STATIC_METRICS: Array<{ metricKey: string; displayName: string; category: string }> = [
  { metricKey: 'youtube.views',                    displayName: 'Views',               category: 'Overview' },
  { metricKey: 'youtube.likes',                    displayName: 'Likes',               category: 'Engagement' },
  { metricKey: 'youtube.comments',                 displayName: 'Comments',            category: 'Engagement' },
  { metricKey: 'youtube.subscribersGained',        displayName: 'Subscribers Gained',  category: 'Overview' },
  { metricKey: 'youtube.watchTimeSec',             displayName: 'Watch Time',          category: 'Overview' },
];

const META_ADS_STATIC_METRICS: Array<{ metricKey: string; displayName: string; category: string }> = [
  { metricKey: 'meta.ads.spend',       displayName: 'Spend',       category: 'Performance' },
  { metricKey: 'meta.ads.impressions', displayName: 'Impressions', category: 'Performance' },
  { metricKey: 'meta.ads.clicks',      displayName: 'Clicks',      category: 'Performance' },
  { metricKey: 'meta.ads.ctr',         displayName: 'CTR',         category: 'Performance' },
  { metricKey: 'meta.ads.cpc',         displayName: 'CPC',         category: 'Performance' },
];

const SHOPIFY_STATIC_METRICS: Array<{ metricKey: string; displayName: string; category: string }> = [
  { metricKey: 'shopify.revenue',       displayName: 'Total Revenue',      category: 'Sales' },
  { metricKey: 'shopify.orders',        displayName: 'Total Orders',        category: 'Sales' },
  { metricKey: 'shopify.avgOrderValue', displayName: 'Avg. Order Value',    category: 'Sales' },
];

const WOO_STATIC_METRICS: Array<{ metricKey: string; displayName: string; category: string }> = [
  { metricKey: 'woo.revenue',    displayName: 'Total Revenue', category: 'Sales' },
  { metricKey: 'woo.orders',     displayName: 'Total Orders',  category: 'Sales' },
  { metricKey: 'woo.itemsSold',  displayName: 'Items Sold',    category: 'Sales' },
];

const TWITTER_STATIC_METRICS: Array<{ metricKey: string; displayName: string; category: string }> = [
  { metricKey: 'twitter.impressions',      displayName: 'Impressions',      category: 'Overview' },
  { metricKey: 'twitter.likes',            displayName: 'Likes',            category: 'Engagement' },
  { metricKey: 'twitter.retweets',         displayName: 'Retweets',         category: 'Engagement' },
  { metricKey: 'twitter.replies',          displayName: 'Replies',          category: 'Engagement' },
  { metricKey: 'twitter.followers',        displayName: 'Followers',        category: 'Overview' },
  { metricKey: 'twitter.tweets',           displayName: 'Tweets',           category: 'Overview' },
  { metricKey: 'twitter.recent_posts',     displayName: 'Recent Posts (Table)', category: 'Tables' },
];

const LINKEDIN_STATIC_METRICS: Array<{ metricKey: string; displayName: string; category: string }> = [
  { metricKey: 'linkedin.impressions',  displayName: 'Impressions',  category: 'Overview' },
  { metricKey: 'linkedin.clicks',       displayName: 'Clicks',       category: 'Overview' },
  { metricKey: 'linkedin.likes',        displayName: 'Likes',        category: 'Engagement' },
  { metricKey: 'linkedin.comments',     displayName: 'Comments',     category: 'Engagement' },
  { metricKey: 'linkedin.shares',       displayName: 'Shares',       category: 'Engagement' },
  { metricKey: 'linkedin.followers',    displayName: 'Followers',    category: 'Overview' },
  { metricKey: 'linkedin.recent_posts', displayName: 'Recent Posts (Table)', category: 'Tables' },
];

const BROADCAST_STATIC_METRICS: Array<{ metricKey: string; displayName: string; category: string }> = [
  { metricKey: 'broadcast.total',       displayName: 'Total Messages',       category: 'Overview' },
  { metricKey: 'broadcast.sent',        displayName: 'Sent Messages',        category: 'Overview' },
  { metricKey: 'broadcast.failed',      displayName: 'Failed Messages',      category: 'Overview' },
  { metricKey: 'broadcast.successRate', displayName: 'Success Rate',         category: 'Overview' },
  { metricKey: 'broadcast.sms',         displayName: 'SMS Sent',             category: 'Channels' },
  { metricKey: 'broadcast.email',       displayName: 'Email Sent',           category: 'Channels' },
  { metricKey: 'broadcast.telegram',    displayName: 'Telegram Sent',        category: 'Channels' },
  { metricKey: 'broadcast.perDay',      displayName: 'Messages Per Day',     category: 'Overview' },
  { metricKey: 'broadcast.channelSplit',displayName: 'Channel Split',        category: 'Channels' },
  { metricKey: 'broadcast.recent',      displayName: 'Recent Campaigns (Table)', category: 'Tables' },
];

const BLOG_STATIC_METRICS: Array<{ metricKey: string; displayName: string; category: string }> = [
  { metricKey: 'blog.published',    displayName: 'Published Posts', category: 'Overview' },
  { metricKey: 'blog.scheduled',    displayName: 'Scheduled Posts', category: 'Overview' },
  { metricKey: 'blog.failed',       displayName: 'Failed Posts',    category: 'Overview' },
  { metricKey: 'blog.totalViews',   displayName: 'Total Views',     category: 'Overview' },
  { metricKey: 'blog.wordpress',    displayName: 'WordPress Posts', category: 'Platforms' },
  { metricKey: 'blog.linkedin',     displayName: 'LinkedIn Posts',  category: 'Platforms' },
  { metricKey: 'blog.postingCadence',displayName: 'Posting Cadence',category: 'Overview' },
  { metricKey: 'blog.postsByPlatform',displayName: 'Posts By Platform',category: 'Platforms' },
  { metricKey: 'blog.recent',       displayName: 'Recent Posts (Table)', category: 'Tables' },
];

// Map from normalised integration platform → static metrics + canonical integration key
const STATIC_METRIC_MAP: Record<string, { integration: string; metrics: Array<{ metricKey: string; displayName: string; category: string }> }> = {
  'google-ads':           { integration: 'google_ads',             metrics: GOOGLE_ADS_STATIC_METRICS },
  'google_ads':           { integration: 'google_ads',             metrics: GOOGLE_ADS_STATIC_METRICS },
  'google-search-console':{ integration: 'google-search-console',  metrics: GSC_STATIC_METRICS },
  'google_search_console':{ integration: 'google-search-console',  metrics: GSC_STATIC_METRICS },
  'meta-ads':             { integration: 'meta_ads',               metrics: META_ADS_STATIC_METRICS },
  'meta_ads':             { integration: 'meta_ads',               metrics: META_ADS_STATIC_METRICS },
  'youtube':              { integration: 'youtube',                 metrics: YOUTUBE_STATIC_METRICS },
  'shopify':              { integration: 'shopify',                 metrics: SHOPIFY_STATIC_METRICS },
  'woocommerce':          { integration: 'woo',                     metrics: WOO_STATIC_METRICS },
  'woo':                  { integration: 'woo',                     metrics: WOO_STATIC_METRICS },
  'twitter':              { integration: 'twitter',                 metrics: TWITTER_STATIC_METRICS },
  'linkedin':             { integration: 'linkedin',                metrics: LINKEDIN_STATIC_METRICS },
  'broadcast':            { integration: 'broadcast',               metrics: BROADCAST_STATIC_METRICS },
  'blog':                 { integration: 'blog',                    metrics: BLOG_STATIC_METRICS },
};

function injectStaticMetrics(
  grouped: MetricsByIntegration,
  integrationKey: string,
  accountId: string,
  staticMetrics: Array<{ metricKey: string; displayName: string; category: string }>
) {
  if (!grouped[integrationKey]) grouped[integrationKey] = {};
  if (!grouped[integrationKey][accountId]) grouped[integrationKey][accountId] = [];
  const existing = grouped[integrationKey][accountId];
  staticMetrics.forEach(({ metricKey, displayName, category }) => {
    if (!existing.some(m => m.metricKey === metricKey)) {
      existing.push({ metricKey, integration: integrationKey, accountId, displayName, category });
    }
  });
}

export interface ConnectedIntegration {
  platform: string;
  accountId?: string;
  accountName?: string;
}

export const useAvailableMetrics = (clientId: number | null, options?: {
  enabled?: boolean;
  integrationVersion?: string;
  /** Connected integrations — used to inject static metrics even when API returns no rows */
  connectedIntegrations?: ConnectedIntegration[];
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["available-metrics", clientId, options?.integrationVersion],

    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!clientId && (options?.enabled ?? true),
    queryFn: async () => {
      if (!clientId) throw new Error("Client ID is required");
      // /unified-metrics is deprecated; rely on static + connected integration
      // injection and fetch data via /unified-metrics/data at render time.
      return {
        success: true,
        rows: [] as DebugMetric[],
        pagination: { page: 1, limit: 0, total: 0, totalPages: 1 },
      };
    },
  });

  const connectedIntegrations = options?.connectedIntegrations;

  // Group metrics by integration and accountId, and deduplicate
  const groupedMetrics = useMemo<MetricsByIntegration>(() => {
    const rows = data?.rows ?? [];

    const grouped: MetricsByIntegration = {};
    const seen = new Set<string>(); // To deduplicate by integration+accountId+metricKey

    rows.forEach((metric: DebugMetric) => {
      const key = `${metric.integration}:${metric.accountId}:${metric.metricKey}`;

      // Skip duplicates
      if (seen.has(key)) return;
      seen.add(key);

      // Initialize integration group if needed
      if (!grouped[metric.integration]) {
        grouped[metric.integration] = {};
      }

      // Initialize account group if needed
      if (!grouped[metric.integration][metric.accountId]) {
        grouped[metric.integration][metric.accountId] = [];
      }

      // Add metric
      grouped[metric.integration][metric.accountId].push({
        metricKey: metric.metricKey,
        integration: metric.integration,
        accountId: metric.accountId,
        displayName: getMetricDisplayName(metric.metricKey),
        category: getMetricCategory(metric.metricKey),
      });
    });

    if (connectedIntegrations?.length) {
      const normalizedToKey = new Map<string, string>();
      Object.keys(grouped).forEach((integrationKey) => {
        normalizedToKey.set(
          integrationKey.toLowerCase().replace(/_/g, "-"),
          integrationKey
        );
      });

      connectedIntegrations.forEach(({ platform, accountId = "default" }) => {
        const normalizedPlatform = platform.toLowerCase().replace(/_/g, "-");
        const normalizedKey = normalizeIntegrationId(normalizedPlatform);
        const normalizedKeyAlias = normalizedKey.toLowerCase().replace(/_/g, "-");
        const existingKey =
          normalizedToKey.get(normalizedPlatform) ??
          normalizedToKey.get(normalizedKeyAlias);
        const integrationKey = existingKey ?? normalizedKey;

        if (!grouped[integrationKey]) {
          grouped[integrationKey] = {};
          normalizedToKey.set(normalizedPlatform, integrationKey);
          normalizedToKey.set(normalizedKeyAlias, integrationKey);
        }

        if (!grouped[integrationKey][accountId]) {
          grouped[integrationKey][accountId] = [];
        }
      });
    }

    // Manually inject 'Recent Media/Posts' table metrics if they are missing
    // identifying accounts based on the presence of other metrics
    Object.keys(grouped).forEach((integration) => {
      // Check Meta Business / Meta integrations (handle both hyphen and underscore)
      const normalizedInt = integration.toLowerCase().replace(/_/g, '-');
      const isMetaIntegration = ['meta-business', 'meta', 'meta-facebook', 'meta-instagram'].includes(normalizedInt);

      if (isMetaIntegration) {
        Object.keys(grouped[integration]).forEach((accountId) => {
          const metrics = grouped[integration][accountId];

          // --- Instagram Injection Logic ---
          const hasInstagramMetrics = metrics.some(m => m.metricKey.includes('instagram'));
          const isInstagramInt = normalizedInt === 'meta-instagram';
          const shouldInjectInstagram = hasInstagramMetrics || isInstagramInt || normalizedInt === 'meta-business' || normalizedInt === 'meta';

          if (shouldInjectInstagram) {
            // 1. Ensure Recent Media widget is present
            if (!metrics.some(m => m.metricKey === 'meta.instagram.recent_media')) {
              metrics.push({
                metricKey: 'meta.instagram.recent_media',
                integration,
                accountId,
                displayName: 'Instagram - Recent Media',
                category: 'General'
              });
            }

            // 2. Inject all known Instagram metrics
            const allKnownInstagramMetrics = [
              ...FACEBOOK_DAILY_METRICS,
              ...FACEBOOK_CUMULATIVE_METRICS,
              'meta.instagram.reelCount',
              'meta.instagram.postCount'
            ].filter(key => key.includes('instagram') && key !== 'meta.instagram.recent_media');

            allKnownInstagramMetrics.forEach(key => {
              if (!metrics.some(m => m.metricKey === key)) {
                metrics.push({
                  metricKey: key,
                  integration,
                  accountId,
                  displayName: getMetricDisplayName(key),
                  category: getMetricCategory(key)
                });
              }
            });
          }

          // --- Facebook Injection Logic ---
          const hasFacebookMetrics = metrics.some(m => m.metricKey.includes('facebook') || m.metricKey.includes('page_'));
          const isFacebookInt = normalizedInt === 'meta-facebook';
          const shouldInjectFacebook = hasFacebookMetrics || isFacebookInt || normalizedInt === 'meta-business' || normalizedInt === 'meta';

          if (shouldInjectFacebook) {
            // 1. Ensure Recent Posts widget is present
            if (!metrics.some(m => m.metricKey === 'meta.facebook.recent_posts')) {
              metrics.push({
                metricKey: 'meta.facebook.recent_posts',
                integration,
                accountId,
                displayName: 'Facebook - Recent Posts',
                category: 'General'
              });
            }

            // 2. Inject all known Facebook metrics
            const allKnownFacebookMetrics = [
              ...FACEBOOK_DAILY_METRICS,
              ...FACEBOOK_CUMULATIVE_METRICS
            ].filter(key => (key.includes('facebook') || key.startsWith('meta.page')) && key !== 'meta.facebook.recent_posts');

            allKnownFacebookMetrics.forEach(key => {
              if (!metrics.some(m => m.metricKey === key)) {
                metrics.push({
                  metricKey: key,
                  integration,
                  accountId,
                  displayName: getMetricDisplayName(key),
                  category: getMetricCategory(key)
                });
              }
            });
          }
        });
      }
    });

    // --- Google Analytics: Inject dimensional table metric keys ---
    // These are frontend-only metric keys that drive the dimensional table widgets.
    // The /unified-metrics/data endpoint doesn't return them as individual rows, so we inject them.
    const GA_TABLE_METRICS: Array<{ metricKey: string; displayName: string; category: string }> = [
      { metricKey: 'google.channel_traffic', displayName: 'Monthly All Channel Traffic', category: 'Channel' },
      { metricKey: 'google.browser_used', displayName: 'Technology: Browser Used', category: 'Technology' },
      { metricKey: 'google.device_category', displayName: 'Technology: Device Category', category: 'Technology' },
      { metricKey: 'google.geo_country', displayName: 'Geo Location: Country', category: 'Geography' },
      { metricKey: 'google.geo_city', displayName: 'Geo Location: City', category: 'Geography' },
      { metricKey: 'google.top_pages', displayName: 'Top Landing Pages', category: 'Pages' },
    ];

    // Also inject any missing base GA4 metric keys
    const GA_BASE_METRICS: Array<{ metricKey: string; displayName: string; category: string }> = [
      { metricKey: 'google.sessions', displayName: 'Sessions', category: 'Overview' },
      { metricKey: 'google.activeUsers', displayName: 'Active Users', category: 'Overview' },
      { metricKey: 'google.newUsers', displayName: 'New Users', category: 'Overview' },
      { metricKey: 'google.pageViews', displayName: 'Page Views', category: 'Overview' },
      { metricKey: 'google.bounceRate', displayName: 'Bounce Rate', category: 'Overview' },
      { metricKey: 'google.engagementRate', displayName: 'Engagement Rate', category: 'Overview' },
      { metricKey: 'google.avgSessionDuration', displayName: 'Avg. Session Duration', category: 'Overview' },
      { metricKey: 'google.eventCount', displayName: 'Event Count', category: 'Overview' },
      { metricKey: 'google.engagedSessions', displayName: 'Engaged Sessions', category: 'Overview' },
    ];

    Object.keys(grouped).forEach((integration) => {
      const normalizedInt = integration.toLowerCase().replace(/_/g, '-');
      const isGAIntegration = ['google-analytics', 'google'].includes(normalizedInt);

      if (isGAIntegration) {
        Object.keys(grouped[integration]).forEach((accountId) => {
          const metrics = grouped[integration][accountId];

          // Inject base metric keys that may be missing
          GA_BASE_METRICS.forEach(({ metricKey, displayName, category }) => {
            if (!metrics.some(m => m.metricKey === metricKey)) {
              metrics.push({ metricKey, integration, accountId, displayName, category });
            }
          });

          // Inject dimensional table metric keys
          GA_TABLE_METRICS.forEach(({ metricKey, displayName, category }) => {
            if (!metrics.some(m => m.metricKey === metricKey)) {
              metrics.push({ metricKey, integration, accountId, displayName, category });
            }
          });
        });
      }
    });

    // --- Static injection for Google Ads, GSC, YouTube, Shopify, WooCommerce ---
    // Step 1: inject for any of these integrations already present in grouped (from API)
    Object.keys(grouped).forEach((integration) => {
      const normalizedInt = integration.toLowerCase().replace(/_/g, '-');
      const staticDef = STATIC_METRIC_MAP[normalizedInt] ?? STATIC_METRIC_MAP[integration];
      if (!staticDef) return;
      Object.keys(grouped[integration]).forEach((accountId) => {
        injectStaticMetrics(grouped, integration, accountId, staticDef.metrics);
      });
    });

    // Step 2: inject for connected integrations that returned NO rows from the API
    if (connectedIntegrations?.length) {
      connectedIntegrations.forEach(({ platform, accountId = 'default' }) => {
        const normalizedPlatform = platform.toLowerCase().replace(/_/g, '-');
        const staticDef = STATIC_METRIC_MAP[normalizedPlatform] ?? STATIC_METRIC_MAP[platform];
        if (!staticDef) return;
        injectStaticMetrics(grouped, staticDef.integration, accountId, staticDef.metrics);
      });
    }

    // Sort metrics within each account by display name
    Object.values(grouped).forEach((accounts) => {
      Object.values(accounts).forEach((metrics) => {
        metrics.sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        );
      });
    });

    console.log('📊 useAvailableMetrics debug:', {
      totalRows: rows.length,
      integrations: Object.keys(grouped),
      youtubeAccounts: grouped['youtube'] ? Object.keys(grouped['youtube']) : 'none',
      shopifyAccounts: grouped['shopify'] ? Object.keys(grouped['shopify']) : 'none',
    });

    if (grouped['shopify']) {
      console.log('🛒 [AvailableMetrics] Shopify Data:', grouped['shopify']);
    }

    return grouped;
   
  }, [data, connectedIntegrations]);

  return {
    groupedMetrics,
    isLoading,
    error,
    totalCount: data?.pagination?.total ?? 0,
  };
};

