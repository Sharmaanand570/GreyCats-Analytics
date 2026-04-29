/**
 * useBatchDemographicsData
 *
 * Fetches demographic breakdowns for all demographics widgets via
 * GET /api/metabusiness/demographics/:accountId
 *
 * Response format:
 *   { success, data: { country: {US: 150}, city: {"Mumbai": 120},
 *                      ageGender: {"M.25-34": 45, "F.18-24": 30} } }
 *
 * React Query deduplicates by accountId — one network request per unique
 * account regardless of how many widgets share the same account.
 *
 * Results are adapted into the legacy `{ rows, value }` format consumed by
 * WidgetContentRenderer without modification.
 */

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getMetaDemographics } from "@/services/unifiedMetrics.api";
import { metaDemographicsQueryKey } from "@/hooks/metrics/useMetaDemographicsQuery";
import type { DashboardMap, DashboardLayout } from "@/features/reports/api/types";
import type { DemographicsResponse } from "@/services/unifiedMetrics.api";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type DemoType = "age" | "gender" | "country" | "city";

export type DemographicDataMap = Record<
  string,
  {
    rows: DemoRow[];
    value: number;
    /** True when the account has < 100 followers and Meta privacy rules suppress data. */
    privacyThresholdMet?: boolean;
    /** Current follower count, provided when privacyThresholdMet is true. */
    currentFollowers?: number;
  }
>;

interface DemoRow {
  metricKey: string;
  dimensionValue: string;
  value: number;
}

interface DemoWidgetMeta {
  widgetId: string;
  accountId: string;
  metricKey: string;
  type: DemoType;
}

// Ordered age ranges matching the renderer's expected order
const AGE_RANGES = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Widget classification
// ─────────────────────────────────────────────────────────────────────────────

function extractDemoType(widget: DashboardLayout): DemoType | null {
  const demoConfig = (widget.data as any)?.customConfig?.demographics;
  if (demoConfig?.type) return demoConfig.type as DemoType;

  const key = (widget.metricConfig?.metricKey ?? "").toLowerCase();
  if (key.endsWith(".age")) return "age";
  if (key.endsWith(".gender")) return "gender";
  if (key.endsWith(".country")) return "country";
  if (key.endsWith(".city")) return "city";
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Format adapter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Adapts the actual API response into the legacy { rows, value } format
 * consumed by WidgetContentRenderer.
 *
 * API response shape (flat, no wrapping `data` key):
 *   fansByCountry: { "US": 2000, "GB": 800 }
 *   fansByCity:    { "London, England": 450, "New York, New York": 320 }
 *   ageGender:     { "M.18-24": 1200, "F.25-34": 800, "M.35-44": 500 }
 *
 * Some older backend versions wrap this under a `data` key — we handle both.
 */
function adaptDemographics(
  response: DemographicsResponse,
  type: DemoType,
  metricKey: string
): { rows: DemoRow[]; value: number; privacyThresholdMet?: boolean; currentFollowers?: number } {
  // Normalise: handle both { fansByCountry, ... } and { data: { fansByCountry, ... } }
  const payload = response.data ?? response;
  const fansByCountry: Record<string, number> =
    (payload as any).fansByCountry ?? (payload as any).country ?? {};
  const fansByCity: Record<string, number> =
    (payload as any).fansByCity ?? (payload as any).city ?? {};
  const ageGender: Record<string, number> =
    (payload as any).ageGender ?? {};

  // Read new privacy fields — present in either the wrapped or flat variant
  const privacyThresholdMet: boolean | undefined =
    (payload as any).privacyThresholdMet ?? response.privacyThresholdMet ?? (payload as any).privacy_threshold_met ?? (response as any).privacy_threshold_met;
  const currentFollowers: number | undefined =
    (payload as any).currentFollowers ?? (response as any).currentFollowers ?? (payload as any).current_followers ?? (response as any).current_followers;

  // If Meta signals that the privacy threshold is not met, return the flag
  // immediately so the renderer can show the informational warning instead
  // of a blank/empty-state chart.
  if (privacyThresholdMet) {
    return { rows: [], value: 0, privacyThresholdMet: true, currentFollowers };
  }

  // ── Country ────────────────────────────────────────────────────────────────
  if (type === "country") {
    const entries = Object.entries(fansByCountry).filter(([, v]) => v > 0);
    if (!entries.length) return { rows: [], value: 0 };
    return {
      value: 1,
      rows: entries
        .map(([country, val]) => ({ metricKey, dimensionValue: country, value: val }))
        .sort((a, b) => b.value - a.value),
    };
  }

  // ── City ───────────────────────────────────────────────────────────────────
  if (type === "city") {
    const entries = Object.entries(fansByCity).filter(([, v]) => v > 0);
    if (!entries.length) return { rows: [], value: 0 };
    return {
      value: 1,
      rows: entries
        .map(([city, val]) => ({ metricKey, dimensionValue: city, value: val }))
        .sort((a, b) => b.value - a.value),
    };
  }

  // ── Age ────────────────────────────────────────────────────────────────────
  // ageGender keys: "M.25-34", "F.18-24", "U.65+" — sum genders per age range
  if (type === "age") {
    const ageMap = new Map<string, number>();
    Object.entries(ageGender).forEach(([key, val]) => {
      const dot = key.indexOf(".");
      const ageRange = dot !== -1 ? key.slice(dot + 1) : key;
      if (ageRange) ageMap.set(ageRange, (ageMap.get(ageRange) ?? 0) + val);
    });

    const rows = AGE_RANGES.map((range) => ({
      metricKey: `${metricKey}.${range}`,
      dimensionValue: range,
      value: ageMap.get(range) ?? 0,
    })).filter((r) => r.value > 0);

    return { value: rows.length > 0 ? 1 : 0, rows };
  }

  // ── Gender ─────────────────────────────────────────────────────────────────
  // ageGender keys: "M.25-34", "F.18-24" — sum age ranges per gender
  if (type === "gender") {
    let totalM = 0;
    let totalF = 0;
    let totalU = 0;

    Object.entries(ageGender).forEach(([key, val]) => {
      const gender = key.split(".")[0];
      if (gender === "M") totalM += val;
      else if (gender === "F") totalF += val;
      else totalU += val;
    });

    const rows: DemoRow[] = [
      { metricKey: `${metricKey}.M`, dimensionValue: "M", value: totalM },
      { metricKey: `${metricKey}.F`, dimensionValue: "F", value: totalF },
      { metricKey: `${metricKey}.U`, dimensionValue: "U", value: totalU },
    ].filter((r) => r.value > 0);

    return { value: rows.length > 0 ? 1 : 0, rows };
  }

  return { rows: [], value: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all demographic data for the dashboard in parallel (one request per
 * unique accountId) and returns a map keyed by widgetId (DashboardLayout.i).
 *
 * @param dashboards - All dashboard layouts (used to find demographics widgets)
 * @param dateRange - Optional date range ({ startDate, endDate } as YYYY-MM-DD)
 *                   forwarded to GET /api/meta-business/demographics/:accountId
 */
export function useBatchDemographicsData(
  dashboards: DashboardMap,
  dateRange?: { startDate?: string; endDate?: string }
): { data: DemographicDataMap; isLoading: boolean; isFetching: boolean } {
  // 1. Collect all demographic widgets
  const demoWidgets = useMemo<DemoWidgetMeta[]>(() => {
    const result: DemoWidgetMeta[] = [];

    dashboards.forEach((layout) => {
      layout.forEach((widget) => {
        const mc = widget.metricConfig;
        if (!mc?.metricKey) return;

        const type = extractDemoType(widget);
        if (!type) return;

        const accountId = mc.accountId ?? "";
        if (!accountId) return; // Cannot fetch demographics without an accountId

        result.push({
          widgetId: widget.i,
          accountId,
          metricKey: mc.metricKey,
          type,
        });
      });
    });

    return result;
  }, [dashboards]);

  // 2. Collect unique accountIds to minimise network requests
  const uniqueAccountIds = useMemo(
    () => Array.from(new Set(demoWidgets.map((w) => w.accountId))),
    [demoWidgets]
  );

  // 3. Fetch demographics per unique accountId (React Query deduplicates identical keys)
  const queries = useQueries({
    queries: uniqueAccountIds.map((accountId) => ({
      queryKey: metaDemographicsQueryKey(accountId, dateRange?.startDate, dateRange?.endDate),
      queryFn: () => getMetaDemographics(accountId, dateRange),
      staleTime: 15 * 60 * 1000, // 15 min — demographics change slowly
      gcTime: 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: !!accountId,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);

  // 4. Build widgetId → adapted data map
  const data = useMemo<DemographicDataMap>(() => {
    const responseByAccountId: Record<string, DemographicsResponse | undefined> = {};
    uniqueAccountIds.forEach((id, i) => {
      responseByAccountId[id] = queries[i]?.data;
    });

    const map: DemographicDataMap = {};

    demoWidgets.forEach(({ widgetId, accountId, metricKey, type }) => {
      const response = responseByAccountId[accountId];

      console.log(`[PrivacyDebug] useBatchDemographicsData EVALUATING widget ${widgetId}:`, {
        accountId, metricKey, type,
        rawResponse: response
      });

      // Handle both flat response { ageGender, fansByCountry, fansByCity }
      // and data-wrapped response { data: { ageGender, ... } }
      const hasData = response && (
        response.data ||
        (response as any).ageGender ||
        (response as any).fansByCountry ||
        (response as any).privacyThresholdMet ||
        (response as any).privacy_threshold_met
      );
      if (!hasData) {
        console.log(`[PrivacyDebug] Skipping widget ${widgetId} because hasData evaluated to false!`);
        return;
      }

      const adapted = adaptDemographics(response, type, metricKey);
      
      console.log(`[PrivacyDebug] useBatchDemographicsData ADAPTED widget ${widgetId}:`, {
        adaptedResult: adapted
      });

      // Store the entry even when rows are empty if a privacy warning should be shown
      if (adapted.rows.length > 0 || adapted.privacyThresholdMet) {
        map[widgetId] = adapted;
      }
    });

    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoWidgets, uniqueAccountIds, queries]);

  return { data, isLoading, isFetching };
}
