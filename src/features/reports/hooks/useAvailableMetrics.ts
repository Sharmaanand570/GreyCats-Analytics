import { useQuery } from "@tanstack/react-query";
import { fetchUnifiedMetricsList } from "../api/reportingApi";
import type { DebugMetric } from "../api/types";
import { useMemo } from "react";
import { FACEBOOK_DAILY_METRICS, FACEBOOK_CUMULATIVE_METRICS } from "../../../utils/facebookMetrics";

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

export const useAvailableMetrics = (clientId: number | null, options?: { enabled?: boolean }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["available-metrics", clientId],
    staleTime: 5 * 60 * 1000,
    enabled: !!clientId && (options?.enabled ?? true),
    queryFn: async () => {
      if (!clientId) throw new Error("Client ID is required");

      try {
        console.log("🔍 Fetching available metrics from /unified-metrics...");

        let allRows: DebugMetric[] = [];
        let page = 1;
        let totalPages = 1;

        // Recursive fetching loop
        do {
          const response = await fetchUnifiedMetricsList(clientId!, {
            limit: 1000, // Fetch in large chunks
            page
          });

          if (response.rows) {
            allRows = [...allRows, ...response.rows];
          }

          totalPages = response.pagination?.totalPages || 1;
          page++;

        } while (page <= totalPages);

        console.log(`📡 Fetched total ${allRows.length} metrics from ${totalPages} pages`);

        return {
          success: true,
          rows: allRows,
          pagination: {
            page: 1,
            limit: allRows.length,
            total: allRows.length,
            totalPages: 1
          }
        };
      } catch (err) {
        console.error("Failed to fetch available metrics:", err);
        throw new Error("Failed to fetch available metrics from /unified-metrics");
      }
    },
  });

  // Group metrics by integration and accountId, and deduplicate
  const groupedMetrics = useMemo<MetricsByIntegration>(() => {
    if (!data?.rows) {
      return {};
    }

    const grouped: MetricsByIntegration = {};
    const seen = new Set<string>(); // To deduplicate by integration+accountId+metricKey

    data.rows.forEach((metric: DebugMetric) => {
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
              ...FACEBOOK_CUMULATIVE_METRICS
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

    // Sort metrics within each account by display name
    Object.values(grouped).forEach((accounts) => {
      Object.values(accounts).forEach((metrics) => {
        metrics.sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        );
      });
    });

    console.log('📊 useAvailableMetrics debug:', {
      totalRows: data?.rows?.length,
      integrations: Object.keys(grouped),
      youtubeAccounts: grouped['youtube'] ? Object.keys(grouped['youtube']) : 'none',
      shopifyAccounts: grouped['shopify'] ? Object.keys(grouped['shopify']) : 'none',
    });

    if (grouped['shopify']) {
      console.log('🛒 [AvailableMetrics] Shopify Data:', grouped['shopify']);
    }

    return grouped;
  }, [data]);

  return {
    groupedMetrics,
    isLoading,
    error,
    totalCount: data?.pagination?.total ?? 0,
  };
};

