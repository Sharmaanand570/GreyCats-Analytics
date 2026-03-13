/**
 * BatchMetricsContext
 *
 * Provides the resolved batch metrics results and demographics data to the
 * entire widget tree without prop-drilling.
 *
 * WidgetDataWrapper reads from this context to serve widget data from the
 * single batch resolver request instead of firing per-widget API calls.
 */

import React, { createContext, useContext } from "react";
import type { ResolvedWidgetResult } from "@/services/unifiedMetrics.api";
import type { DemographicDataMap } from "@/hooks/metrics/useBatchDemographicsData";

// ─────────────────────────────────────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────────────────────────────────────

export interface BatchMetricsContextValue {
  /**
   * Indexed batch resolver results by widget id.
   * O(1) lookup: `byId[widgetId]`
   */
  byId: Record<string, ResolvedWidgetResult>;

  /**
   * Indexed demographics results by DashboardLayout.i (widget grid id).
   * Adapts GET /api/metabusiness/demographics/:accountId into the legacy
   * `{ rows, value }` format expected by WidgetContentRenderer.
   */
  demographicById: DemographicDataMap;

  /** True while the batch resolver request is in-flight (first load). */
  isLoading: boolean;

  /** True while the batch resolver is background-refetching. */
  isFetching: boolean;

  /** True while any demographics request is in-flight. */
  demoIsLoading: boolean;

  /** True while any demographics request is background-refetching. */
  demoIsFetching: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const BatchMetricsContext = createContext<BatchMetricsContextValue>({
  byId: {},
  demographicById: {},
  isLoading: false,
  isFetching: false,
  demoIsLoading: false,
  demoIsFetching: false,
});

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export const useBatchMetricsContext = (): BatchMetricsContextValue =>
  useContext(BatchMetricsContext);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export interface BatchMetricsProviderProps {
  children: React.ReactNode;
  byId: Record<string, ResolvedWidgetResult>;
  demographicById: DemographicDataMap;
  isLoading: boolean;
  isFetching: boolean;
  demoIsLoading: boolean;
  demoIsFetching: boolean;
}

export const BatchMetricsProvider: React.FC<BatchMetricsProviderProps> = ({
  children,
  byId,
  demographicById,
  isLoading,
  isFetching,
  demoIsLoading,
  demoIsFetching,
}) => (
  <BatchMetricsContext.Provider
    value={{ byId, demographicById, isLoading, isFetching, demoIsLoading, demoIsFetching }}
  >
    {children}
  </BatchMetricsContext.Provider>
);
