import { type ReportWidgetType } from "@/components/reportTypes";
import type { WidgetData } from "@/components/widgetTypes";
import type { DashboardLayout, DashboardMap, ReportWidgetDefinition } from "@/features/reports/api/types";
import { generateWidgetId } from "@/components/reportConstants";
import { prettifyMetricLabel } from "@/utils/labelUtils";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { type DateRange } from "react-day-picker";
import { getDefaultWidgetData, DEFAULT_WIDGET_SIZE } from "./reportBuilderConstants";

export const ensureSlide = (map: DashboardMap, slideId: number) => {
  if (!map.has(slideId)) {
    map.set(slideId, []);
  }
};

export const normalizeWidgetType = (type?: string): ReportWidgetType => {
  if (!type) return "metric";
  if (type.includes("chart")) return "chart";
  if (type.includes("metric") || type.includes("stat")) return "metric";
  if (type.includes("table")) return "table";
  return (type as ReportWidgetType) ?? "metric";
};

export const buildDashboardMapFromTemplate = (
  widgets: ReportWidgetDefinition[]
): DashboardMap => {
  console.log(`[Hydrate] 🏗️ Processing ${widgets.length} template widgets...`);
  if (!widgets.length) {
    console.log(`[Hydrate] ⚠️ No widgets found in template data.`);
    return new Map([[0, []]]);
  }

  // ── Deduplication ────────────────────────────────────────────────────────────
  // The backend appends new widget rows on each save instead of replacing them,
  // causing the same widget to accumulate (2x, 3x…) over multiple saves.
  // We deduplicate here so the frontend always renders each widget exactly once.
  //
  // Strategy:
  //   1. By widget.id (DB primary key) — fastest, catches exact DB duplicates.
  //   2. By (slideId + metricKey + type) — catches duplicates saved with new IDs
  //      (e.g. after a report was copied or re-saved with fresh IDs).
  const seenWidgetIds = new Set<string | number>();
  const seenCompositeKeys = new Set<string>();
  
  // Create a reversed array so we process the NEWEST appended database rows first.
  // This guarantees we keep the most recent layout positions (x,y,w,h) instead 
  // of sticking to the oldest first-saved positions.
  const reversedWidgets = [...widgets].reverse();
  
  const dedupedReversed = reversedWidgets.filter((widget) => {
    // Primary: deduplicate by DB widget ID
    if (widget.id !== undefined && widget.id !== null) {
      if (seenWidgetIds.has(widget.id)) return false;
      seenWidgetIds.add(widget.id);
    }
    // Secondary: deduplicate by (slideId + metricKey + normalizedType).
    // Use normalizeWidgetType so "line_chart" / "bar_chart" / "chart" all become "chart",
    // preventing the same chart widget from surviving under two different raw type strings.
    const slideId = Number(widget.layout?.slideId ?? 0);
    const normType = normalizeWidgetType(widget.type); // "chart" | "metric" | "table" | ...
    const compositeKey = `${slideId}::${widget.metricKey ?? ''}::${normType}`;
    if (seenCompositeKeys.has(compositeKey)) {
      console.warn(`[Hydrate] ⚠️ Duplicate widget removed: ${compositeKey} (id=${widget.id}, rawType=${widget.type})`);
      return false;
    }
    seenCompositeKeys.add(compositeKey);
    return true;
  });

  // Reverse back to maintain the original relative order 
  const dedupedWidgets = dedupedReversed.reverse();

  if (dedupedWidgets.length < widgets.length) {
    console.warn(
      `[Hydrate] 🧹 Deduplication: ${widgets.length} → ${dedupedWidgets.length} widgets ` +
      `(removed ${widgets.length - dedupedWidgets.length} duplicates)`
    );
  }
  // ─────────────────────────────────────────────────────────────────────────────

  const map: DashboardMap = new Map();

  dedupedWidgets.forEach((widget, index) => {

    const layoutInfo = widget.layout;
    const slideId = Number(layoutInfo?.slideId ?? 0);
    ensureSlide(map, slideId);

    const widgetType = normalizeWidgetType(widget.type);
    // Backend stores data in 'config', but we use 'widgetData' internally. Handle both.
    const rawConfig = (widget as any).config;
    const rawWidgetData = (widget as any).widgetData;
    // START FIX: Merge logic
    // We prioritize rawWidgetData for the *data* (rows, values), but we MUST restore
    // the configuration (chartType) from rawConfig if it exists.
    let widgetData = (rawWidgetData || rawConfig) as WidgetData | undefined;

    if (rawConfig && widgetData) {
      widgetData = {
        ...widgetData,
        chartType: rawConfig.chartType || (widgetData as any).chartType,
        chartColor: rawConfig.chartColor || (widgetData as any).chartColor,
        backgroundColor: rawConfig.backgroundColor || (widgetData as any).backgroundColor,
        textColor: rawConfig.textColor || (widgetData as any).textColor,
      };
    }
    // END FIX
    const layoutItem: DashboardLayout = {
      i: widget.id ?? generateWidgetId("widget"),
      x: layoutInfo?.x ?? 0,
      y: layoutInfo?.y ?? index * DEFAULT_WIDGET_SIZE.h,
      w: layoutInfo?.w ?? DEFAULT_WIDGET_SIZE.w,
      h: layoutInfo?.h ?? DEFAULT_WIDGET_SIZE.h,
      widgetType,
      data: widgetData ?? getDefaultWidgetData(widgetType),
      metricConfig: {
        ...widget,
        displayName: widget.displayName || prettifyMetricLabel((widget as any).label || (widget as any).title || widget.metricKey || widget.type || "Metric")
      },
      // Essential for Shared Reports: Hoist snapshotData from the API response
      // so it sits at the root of the layout item, where the builder (and data resolution logic) expects it.
      snapshotData: (widget as any).snapshotData,
    } as DashboardLayout;

    if (widget.integration?.includes('meta') || (widget as any).config?.integration?.includes('meta')) {
      console.log(`[Hydrate] Found Meta-like widget: ID=${layoutItem.i}, slideId=${slideId}`);
      console.log(`   Integration: '${widget.integration}'`);
      console.log(`   Config Integration: '${(widget as any).config?.integration}'`);
      console.log(`   MetricKey: '${widget.metricKey}'`);
    }

    map.set(slideId, [...(map.get(slideId) ?? []), layoutItem]);
  });

  console.log(`[Hydrate] Final map keys:`, Array.from(map.keys()));
  // Always ensure at least one slide exists, even if empty
  if (!map.size) {
    return new Map([[0, []]]);
  }

  return map;
};

// Removed DEFAULT_DASHBOARD_MAP and cloneDashboardMap as we now create slides dynamically based on integrations

export const getInitialDateRange = (): DateRange => ({
  from: subDays(new Date(), 6),
  to: new Date(),
});

export const formatApiDate = (value: Date) => format(value, "yyyy-MM-dd");

export const getRangeFromPreset = (preset: string): DateRange | undefined => {
  switch (preset) {
    case "Today":
      return { from: new Date(), to: new Date() };
    case "Yesterday":
      return { from: subDays(new Date(), 1), to: subDays(new Date(), 1) };
    case "Last 7 Days":
      return { from: subDays(new Date(), 6), to: new Date() };
    case "Last 30 Days":
      return { from: subDays(new Date(), 29), to: new Date() };
    case "Last 90 Days":
      return { from: subDays(new Date(), 89), to: new Date() };
    case "This Month":
      return { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
    case "Last Month":
      return { from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) };
    case "This Year":
      return { from: startOfYear(new Date()), to: new Date() };
    default:
      return undefined;
  }
};
