/**
 * WidgetDataWrapper
 *
 * Data resolution layer for individual dashboard widgets.
 *
 * Resolution priority:
 *  1. Demographics widgets → BatchMetricsContext.demographicById (from useMetaDemographicsQuery)
 *  2. Regular metric widgets → BatchMetricsContext.byId (from useBatchMetricsQuery / batch resolver)
 *  3. Special widgets (recent_posts, recent_media, campaign tables) → useWidgetData fallback
 *
 * The per-widget useWidgetData query is always instantiated (hooks rules) but is
 * disabled for widgets served by the batch context to prevent duplicate API calls.
 */

import React from "react";
import type { DashboardLayout, ReportWidgetDefinition, ResolvedWidgetData } from "@/features/reports/api/types";
import { useWidgetData } from "@/features/reports/hooks/useWidgetData";
import { useBatchMetricsContext } from "@/features/reports/context/BatchMetricsContext";
import { isBatchableWidget, isSpecialWidget } from "@/hooks/metrics/useBatchDashboardData";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function isDemographicsWidget(widget: DashboardLayout): boolean {
  const demoConfig = (widget.data as any)?.customConfig?.demographics;
  if (demoConfig) return true;
  const key = (widget.metricConfig?.metricKey ?? "").toLowerCase();
  return (
    key.endsWith(".age") ||
    key.endsWith(".gender") ||
    key.endsWith(".country") ||
    key.endsWith(".city")
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface WidgetDataWrapperProps {
  widget: DashboardLayout;
  slideId: number;
  effectiveClientId: number | null | undefined;
  dateFrom: string;
  dateTo: string;
  shareToken?: string;
  integrationsData: any;
  isLoadingIntegrations: boolean;
  isSlideVisible: boolean;
  /**
   * Legacy prop — kept for backward compatibility.
   * When BatchMetricsContext is active, context demographics take priority.
   * This prop acts as a fallback for widgets outside of any provider.
   */
  demographicDataMap?: Record<string, any>;
  children: (params: {
    resolvedData: ResolvedWidgetData | undefined;
    isLoading: boolean;
    isFetching: boolean;
  }) => React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function WidgetDataWrapper({
  widget,
  slideId: _slideId,
  effectiveClientId,
  dateFrom,
  dateTo,
  shareToken,
  integrationsData,
  isLoadingIntegrations,
  isSlideVisible,
  demographicDataMap,
  children,
}: WidgetDataWrapperProps) {
  const batchCtx = useBatchMetricsContext();
  const mc = widget.metricConfig;
  const widgetId = String(mc?.id ?? widget.i);

  // Classify this widget to determine the data source
  const isDemo = isDemographicsWidget(widget);
  const isSpecial = !isDemo && isSpecialWidget(widget);
  const isBatch = !isDemo && !isSpecial && isBatchableWidget(widget);

  // ── Build a stable ReportWidgetDefinition for useWidgetData ─────────────────
  // Must be memoised to prevent query-key thrashing on every render.
  const widgetDef: ReportWidgetDefinition = React.useMemo(
    () =>
      mc ?? {
        id: widget.i,
        metricKey: "",
        integration: "",
        groupBy: "none",
        aggregation: "sum",
        type: widget.widgetType,
      },
    [mc, widget.i, widget.widgetType]
  );

  // ── Per-widget query (useWidgetData) ────────────────────────────────────────
  // Always called (hooks rules), but DISABLED for batch/demo widgets to prevent
  // redundant network requests. Only special-case widgets use it actively.
  const perWidgetEnabled = isSpecial && isSlideVisible;

  const { data: legacyData, status: legacyStatus, isFetching: legacyFetching } =
    useWidgetData({
      widget: widgetDef,
      effectiveClientId,
      dateFrom,
      dateTo,
      shareToken,
      integrationsData,
      isLoadingIntegrations,
      // Pass false for batch/demo widgets to disable the query entirely
      isSlideVisible: perWidgetEnabled,
    });

  // ── Resolve final data, loading, and fetching state ─────────────────────────

  // Shared reports: prefer pre-calculated snapshot data over live API calls.
  // Special widgets (Meta, GA, etc.) normally bypass the batch fetcher and call
  // APIs via useWidgetData, but those API endpoints may not return data when
  // accessed via a share token. The snapshot already has the correct values.
  //
  // IMPORTANT: Distinguish REAL metric snapshots from WIDGET CONFIG data.
  // Widget config objects ({label, value: 0, hideDataPoints}) are baked into every
  // widget definition — they are NOT real snapshot data. Real snapshots never have
  // 'label' or 'hideDataPoints' keys. Without this guard, value=0 config objects
  // would short-circuit the live API fetch and display zeros.
  const snapshotData = (widget as any).snapshotData;
  if (shareToken && snapshotData && !isDemo) {
    const isWidgetConfig = 'label' in snapshotData || 'hideDataPoints' in snapshotData || 'chartType' in snapshotData;
    if (!isWidgetConfig) {
      const hasSeries = Array.isArray(snapshotData.series) && snapshotData.series.length > 0;
      const hasValue = typeof snapshotData.value === "number" ||
        typeof snapshotData.total === "number" || hasSeries;
      if (hasValue) {
        // Compute total from series if value/total are missing (metric cards need this)
        const seriesTotal = hasSeries
          ? snapshotData.series.reduce((acc: number, pt: { y: number }) => acc + (pt.y ?? 0), 0)
          : 0;
        const resolved: ResolvedWidgetData = {
          value: snapshotData.value ?? snapshotData.total ?? seriesTotal,
          total: snapshotData.total ?? snapshotData.value ?? seriesTotal,
          rawCount: snapshotData.rawCount ?? (hasSeries ? snapshotData.series.length : 0),
          series: snapshotData.series ?? [],
          rows: snapshotData.rows ?? [],
          ...(snapshotData.columns ? { columns: snapshotData.columns } : {}),
        } as ResolvedWidgetData;
        return <>{children({ resolvedData: resolved, isLoading: false, isFetching: false })}</>;
      }
    }
  }

  if (isDemo) {
    // Demographics: read from context (useMetaDemographicsQuery-backed), fallback to legacy prop
    const demoData =
      batchCtx.demographicById[widget.i] ?? demographicDataMap?.[widget.i];

    const isLoading =
      !!widgetDef.metricKey && batchCtx.demoIsLoading && !demoData;

    return (
      <>
        {children({
          resolvedData: demoData as ResolvedWidgetData | undefined,
          isLoading,
          isFetching: batchCtx.demoIsFetching,
        })}
      </>
    );
  }

  if (isBatch) {
    // Regular metric: read from batch resolver context
    const batchResult = batchCtx.byId[widgetId];
    const resolvedData = batchResult as unknown as ResolvedWidgetData | undefined;

    // Show skeleton while the batch request is in-flight for the first time
    const isLoading = !!widgetDef.metricKey && batchCtx.isLoading && !batchResult;

    console.log(`[WidgetDataWrapper] 🔍 BATCH widget`, {
      widgetId,
      metricKey: widgetDef.metricKey,
      integration: widgetDef.integration,
      accountId: widgetDef.accountId || '(none)',
      inByIdMap: !!batchResult,
      value: (batchResult as any)?.value,
      total: (batchResult as any)?.total,
      seriesPoints: (batchResult as any)?.series?.length,
      isLoading,
      batchCtxLoading: batchCtx.isLoading,
    });

    return (
      <>
        {children({
          resolvedData,
          isLoading,
          isFetching: batchCtx.isFetching && !batchCtx.isLoading,
        })}
      </>
    );
  }

  // Special widget (recent_posts, campaign tables, etc.): use per-widget hook
  const isLoading =
    !!widgetDef.metricKey && (!isSlideVisible || legacyStatus === "pending");

  return (
    <>{children({ resolvedData: legacyData, isLoading, isFetching: legacyFetching })}</>
  );
}
