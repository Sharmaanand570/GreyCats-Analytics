/**
 * Metric Series Transformers
 *
 * Convert raw API responses from /unified-metrics into chart-friendly formats
 * consumed by Recharts and other UI components without touching the components
 * themselves.
 */

import type {
  MetricDataResponse,
  ResolvedWidgetResult,
  DemographicsResponse,
} from "@/services/unifiedMetrics.api";

// ─────────────────────────────────────────────────────────────────────────────
// Shared chart point types
// ─────────────────────────────────────────────────────────────────────────────

export interface ChartPoint {
  x: string;
  y: number;
}

export interface NamedChartPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface MultiSeriesPoint {
  date: string;
  [seriesKey: string]: string | number;
}

export interface AgeGenderChartPoint {
  ageRange: string;
  male: number;
  female: number;
  unknown: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Time-series transforms
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a MetricDataResponse into a `[{ x: date, y: value }]` series
 * suitable for line/bar/area charts.
 * Reads from the actual API shape: response.data.series
 */
export function toChartSeries(
  response: MetricDataResponse | null | undefined
): ChartPoint[] {
  const series = response?.data?.series;
  if (!series?.length) return [];

  return series
    .map((pt) => ({ x: pt.x, y: Number(pt.y) || 0 }))
    .sort((a, b) => a.x.localeCompare(b.x));
}

/**
 * Convert a ResolvedWidgetResult (from batch resolver) into a chart series.
 */
export function resolvedToChartSeries(
  result: ResolvedWidgetResult | null | undefined
): ChartPoint[] {
  if (!result?.series?.length) return [];

  return result.series
    .map((pt) => ({ x: pt.x, y: Number(pt.y) || 0 }))
    .sort((a, b) => a.x.localeCompare(b.x));
}

/**
 * Aggregate a chart series into a single scalar total.
 */
export function sumSeries(series: ChartPoint[]): number {
  return series.reduce((acc, pt) => acc + pt.y, 0);
}

/**
 * Return the latest (last by date) value in a series.
 */
export function latestValue(series: ChartPoint[]): number {
  if (!series.length) return 0;
  return series[series.length - 1].y;
}

/**
 * Fill missing dates in a series with 0 so that charts are gapless.
 * `dateFrom` / `dateTo` are ISO date strings (YYYY-MM-DD).
 */
export function fillMissingDates(
  series: ChartPoint[],
  dateFrom: string,
  dateTo: string
): ChartPoint[] {
  if (!series.length) return series;

  const existingByDate = new Map(series.map((pt) => [pt.x, pt.y]));
  const result: ChartPoint[] = [];

  const cursor = new Date(dateFrom);
  const end = new Date(dateTo);

  while (cursor <= end) {
    const dateStr = cursor.toISOString().slice(0, 10);
    result.push({ x: dateStr, y: existingByDate.get(dateStr) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

/**
 * Merge multiple named series into an array of `{ date, [seriesKey]: value }`
 * objects for multi-series Recharts charts (e.g. ComposedChart).
 */
export function mergeNamedSeries(
  seriesMap: Record<string, ChartPoint[]>
): MultiSeriesPoint[] {
  const dateSet = new Set<string>();
  Object.values(seriesMap).forEach((s) =>
    s.forEach((pt) => dateSet.add(pt.x))
  );

  const dates = Array.from(dateSet).sort();

  return dates.map((date) => {
    const point: MultiSeriesPoint = { date };
    for (const [key, series] of Object.entries(seriesMap)) {
      const match = series.find((pt) => pt.x === date);
      point[key] = match ? match.y : 0;
    }
    return point;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Pie / bar chart named-value transforms
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert country demographics into `[{ name, value }]` for pie/bar charts.
 * Accepts the actual API format: Record<countryCode, count>
 */
export function countryToChartData(
  data: Record<string, number> | null | undefined
): NamedChartPoint[] {
  if (!data) return [];
  return Object.entries(data)
    .map(([name, value]) => ({ name, value: Number(value) || 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

/**
 * Convert city demographics into `[{ name, value }]` for pie/bar charts.
 * Accepts the actual API format: Record<cityName, count>
 */
export function cityToChartData(
  data: Record<string, number> | null | undefined
): NamedChartPoint[] {
  if (!data) return [];
  return Object.entries(data)
    .map(([name, value]) => ({ name, value: Number(value) || 0 }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
}

/**
 * Convert age/gender demographics into stacked bar chart data.
 * Accepts the actual API format: Record<"M.25-34" | "F.18-24" | ..., count>
 */
export function ageGenderToChartData(
  data: Record<string, number> | null | undefined
): AgeGenderChartPoint[] {
  if (!data) return [];
  const map = new Map<string, { male: number; female: number; unknown: number }>();

  Object.entries(data).forEach(([key, val]) => {
    const dot = key.indexOf(".");
    const gender = dot !== -1 ? key.slice(0, dot) : "U";
    const ageRange = dot !== -1 ? key.slice(dot + 1) : key;
    if (!ageRange) return;

    const entry = map.get(ageRange) ?? { male: 0, female: 0, unknown: 0 };
    if (gender === "M") entry.male += val;
    else if (gender === "F") entry.female += val;
    else entry.unknown += val;
    map.set(ageRange, entry);
  });

  return Array.from(map.entries()).map(([ageRange, counts]) => ({
    ageRange,
    ...counts,
  }));
}

/**
 * Convenience function: transform a full demographics response into chart-ready
 * structures in one call.
 */
export function transformDemographics(response: DemographicsResponse | null | undefined): {
  country: NamedChartPoint[];
  city: NamedChartPoint[];
  ageGender: AgeGenderChartPoint[];
} {
  return {
    country: countryToChartData(response?.data?.fansByCountry),
    city: cityToChartData(response?.data?.fansByCity),
    ageGender: ageGenderToChartData(response?.data?.ageGender),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Dimension / table row transforms
// ─────────────────────────────────────────────────────────────────────────────

export interface DimensionRow {
  dimension: string;
  value: number;
}

/**
 * Convert raw metric rows that carry a `dimensionValue` field into a sorted
 * table/chart array. Useful for geo, browser, device-category breakdowns.
 */
/**
 * Convert dimension rows from a ResolvedWidgetResult (batch resolver) into a
 * sorted table/chart array. The single-metric endpoint does not return dimension
 * rows — use the batch resolver's `result.rows` for dimension data.
 */
export function toDimensionRows(
  result: { rows?: unknown[] } | null | undefined,
  dimensionKey = "dimensionValue"
): DimensionRow[] {
  if (!result?.rows?.length) return [];

  const aggregated = new Map<string, number>();

  result.rows.forEach((row: any) => {
    const dim: string = row[dimensionKey] ?? row.dimensionValue ?? "Unknown";
    aggregated.set(dim, (aggregated.get(dim) ?? 0) + (Number(row.value) || 0));
  });

  return Array.from(aggregated.entries())
    .map(([dimension, value]) => ({ dimension, value }))
    .sort((a, b) => b.value - a.value);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sparkline helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Downsample a series to at most `maxPoints` points for compact sparkline
 * display, preserving the shape of the curve.
 */
export function toSparkline(
  series: ChartPoint[],
  maxPoints = 30
): ChartPoint[] {
  if (series.length <= maxPoints) return series;
  const step = Math.ceil(series.length / maxPoints);
  return series.filter((_, i) => i % step === 0);
}
