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
  const widgetDef: ReportWidgetDefinition = metricConfig ?? {
    id: widget.i,
    metricKey: "",
    integration: "",
    groupBy: "none",
    aggregation: "sum",
    type: widget.widgetType,
  };

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

  const isLoading = status === "pending" && !!widgetDef.metricKey && isSlideVisible;

  return <>{children({ resolvedData: finalResolvedData, isLoading, isFetching })}</>;
}
