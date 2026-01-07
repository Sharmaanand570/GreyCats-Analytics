import { useQuery } from "@tanstack/react-query";
import { fetchUnifiedMetricsList } from "../api/reportingApi";
import type { DebugMetric } from "../api/types";
import { useMemo } from "react";

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
    });

    return grouped;
  }, [data]);

  return {
    groupedMetrics,
    isLoading,
    error,
    totalCount: data?.pagination?.total ?? 0,
  };
};

