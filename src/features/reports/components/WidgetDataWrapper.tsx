import React from "react";
import type { DashboardLayout, ReportWidgetDefinition, ResolvedWidgetData } from "@/features/reports/api/types";
import { useWidgetData } from "@/features/reports/hooks/useWidgetData";

// --- Per-widget data wrapper (calls useWidgetData hook per widget) ---
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
  demographicDataMap?: Record<string, any>;
  children: (params: {
    resolvedData: ResolvedWidgetData | undefined;
    isLoading: boolean;
    isFetching: boolean;
  }) => React.ReactNode;
}

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
  const metricConfig = widget.metricConfig;

  // Build a ReportWidgetDefinition for the hook
  // Build a ReportWidgetDefinition for the hook - MEMOIZED to prevent query key thrashing
  const widgetDef: ReportWidgetDefinition = React.useMemo(() => metricConfig ?? {
    id: widget.i,
    metricKey: "",
    integration: "",
    groupBy: "none",
    aggregation: "sum",
    type: widget.widgetType,
  }, [metricConfig, widget.i, widget.widgetType]);

  const { data: widgetResolvedData, status, isFetching } = useWidgetData({
    widget: widgetDef,
    effectiveClientId,
    dateFrom,
    dateTo,
    shareToken,
    integrationsData,
    isLoadingIntegrations,
    isSlideVisible,
  });

  // Merge demographic data if available
  const demoData = demographicDataMap?.[widget.i];
  const finalResolvedData = demoData || widgetResolvedData;

  // Show loading skeleton:
  // 1. While the slide is not yet visible (query disabled - keeps queries paused but shows placeholder)
  // 2. While the query is actively pending after the slide becomes visible
  const isLoading =
    !!widgetDef.metricKey &&
    (!isSlideVisible || status === "pending");

  return <>{children({ resolvedData: finalResolvedData, isLoading, isFetching })}</>;
}
