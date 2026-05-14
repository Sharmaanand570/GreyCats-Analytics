import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataSyncBanner } from "@/components/DataSyncBanner";
import { ChartLineMultiple } from "@/components/ChartLineMultiple";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { COLORS, getStatusBadgeClass } from "@/features/reports/utils/reportBuilderConstants";
import { reportTableRows } from "@/components/reportConstants";
import type {
  DashboardLayout,
  ResolvedWidgetData,
  WidgetSeriesPoint,
  ReportWidgetDefinition,
  ReportSlideMeta,
} from "@/features/reports/api/types";
import type {
  TitleWidgetData,
  TableWidgetData,
  ChartWidgetData,
  MapWidgetData,
  MetricWidgetData,
  ImageWidgetData,
  EmbedWidgetData,
  CustomWidgetData,
} from "@/components/widgetTypes";

/**
 * Format large numbers into compact human-readable strings.
 * e.g. 1234 → "1.23K", 1500000 → "1.5M", 45 → "45"
 */
function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    const n = abs / 1_000_000_000;
    return sign + (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2).replace(/\.?0+$/, "")) + "B";
  }
  if (abs >= 1_000_000) {
    const n = abs / 1_000_000;
    return sign + (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2).replace(/\.?0+$/, "")) + "M";
  }
  if (abs >= 1_000) {
    const n = abs / 1_000;
    return sign + (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2).replace(/\.?0+$/, "")) + "K";
  }
  return value % 1 !== 0 ? value.toFixed(2) : String(value);
}

/**
 * Format numbers as exact currency values with locale grouping.
 * e.g. 22500 → "22,500", 1500000.5 → "15,00,000.50"
 */
function formatCurrencyNumber(value: number): string {
  return value % 1 !== 0
    ? value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : value.toLocaleString("en-IN");
}

export const renderWidgetEmptyState = (
  onConnectIntegration?: () => void,
  message = "No data yet"
) => {
  return (
    <div className="flex flex-col items-center justify-center w-full text-center text-xs md:text-sm text-gray-500 gap-2 py-4">
      <DataSyncBanner compact className="bg-transparent border-0 p-0 justify-center mb-2" />
      <span>{message}</span>
      {onConnectIntegration && (
        <Button
          variant="outline"
          size="sm"
          onClick={onConnectIntegration}
          className="text-xs md:text-sm"
        >
          Connect Integration
        </Button>
      )}
    </div>
  );
};

// Helper: Render widget content with dynamic data
export const renderWidgetContent = (
  widget: DashboardLayout,
  resolvedData?: ResolvedWidgetData,
  options?: {
    isLoading?: boolean;
    onConnectIntegration?: () => void;
    readOnly?: boolean;
    // For TOC widgets with `autoPopulate: true`. The renderer derives the
    // entries from this list (in order) and skips the slide that hosts the
    // TOC itself.
    slidesMeta?: ReportSlideMeta[];
    currentSlideId?: number;
  }
) => {
  if (options?.isLoading) {
    // Show specific skeleton based on widget type
    if (widget.widgetType === "metric") {
      return (
        <div className="h-full flex flex-col items-center justify-center space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      );
    }
    if (widget.widgetType === "table") {
      return (
        <div className="h-full flex flex-col p-2 space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      );
    }
    if (widget.widgetType === "chart" || widget.widgetType === "line_chart" || widget.widgetType === "bar_chart" || widget.widgetType === "area_chart" || widget.widgetType === "pie_chart") {
      return (
        <div className="h-full flex flex-col p-2 space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="flex-1 w-full rounded-md" />
        </div>
      );
    }
    if (widget.widgetType === "title") {
      return (
        <div className="h-full flex items-center justify-center p-4">
          <Skeleton className="h-8 w-3/4" />
        </div>
      );
    }
    if (widget.widgetType === "image") {
      return (
        <div className="h-full flex items-center justify-center p-4">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      );
    }
    if (widget.widgetType === "embed") {
      return (
        <div className="h-full flex flex-col p-2 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="flex-1 w-full rounded-md" />
        </div>
      );
    }
    if (widget.widgetType === "custom") {
      const customData = widget.data as CustomWidgetData | undefined;
      if (customData?.type === "tasks") {
        return (
          <div className="h-full flex flex-col p-3 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        );
      }
      if (customData?.type === "toc") {
        return (
          <div className="h-full flex flex-col p-3 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        );
      }
      // Default custom text block
      return (
        <div className="h-full flex flex-col p-3 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      );
    }
    if (widget.widgetType === "map") {
      return (
        <div className="h-full flex items-center justify-center p-4">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      );
    }

    // Default skeleton
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  const onConnectIntegration = options?.onConnectIntegration;

  // Merge processed with resolved
  const finalResolvedData = resolvedData;
  const widgetData = widget.data; // Keep original widget data structure

  // But we might need to pass resolved values down if the widget relies on them.
  // Actually, renderWidget already handles this merging logic locally. 
  // We just need to ensure 'renderWidget' gets the RIGHT data.
  // Wait, renderWidgetContent is a helper called BY renderWidget? 
  // No, renderWidgetContent is called BY renderWidget (indirectly through JSX?).
  // Let's check renderWidget function again.

  const metricConfig = widget.metricConfig || ((widget as any).metricKey ? widget as any as ReportWidgetDefinition : undefined);

  const isIntegrationMetric =
    (widget.widgetType === "metric" || !!metricConfig?.metricKey) &&
    !!metricConfig?.metricKey &&
    !!metricConfig?.integration;

  const privacyThresholdMet = finalResolvedData?.privacyThresholdMet || (finalResolvedData as any)?.privacy_threshold_met || (finalResolvedData as any)?.data?.privacyThresholdMet || (finalResolvedData as any)?.data?.privacy_threshold_met || (widgetData as any)?.privacyThresholdMet || (widgetData as any)?.privacy_threshold_met;
  const currentFollowers = finalResolvedData?.currentFollowers ?? (finalResolvedData as any)?.current_followers ?? (finalResolvedData as any)?.data?.currentFollowers ?? (finalResolvedData as any)?.data?.current_followers ?? (widgetData as any)?.currentFollowers ?? (widgetData as any)?.current_followers ?? 0;

  console.log(`[PrivacyDebug] Widget ${widget.i} (${widget.metricConfig?.metricKey}):`, {
    privacyThresholdMet,
    currentFollowers,
    finalResolvedData,
    widgetData
  });

  if (privacyThresholdMet) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="bg-yellow-50 text-yellow-800 rounded-md p-4 flex flex-col gap-2 max-w-sm text-center shadow-sm text-sm">
          <p className="font-semibold text-base mb-1">⚠️ Data Unavailable</p>
          <p>
            Meta (Facebook/Instagram) privacy rules require a minimum of 100 followers to provide demographic insights. This account currently has <strong>{currentFollowers}</strong> followers.
          </p>
          <p className="text-xs opacity-80 mt-1">
            The charts will automatically appear once the account reaches the 100-follower threshold.
          </p>
        </div>
      </div>
    );
  }

  switch (widget.widgetType) {
    case "chart":
    case "pie_chart": {
      // Demographics: Chart Aggregation Logic
      let demographicsConfig = (widgetData as any)?.customConfig?.demographics;

      // Fallback: Synthesize config if missing (matches hook logic)
      if (!demographicsConfig && widget.metricConfig?.metricKey) {
        const key = widget.metricConfig.metricKey;
        if (key.endsWith('.age')) demographicsConfig = { type: 'age' };
        else if (key.endsWith('.gender')) demographicsConfig = { type: 'gender' };
        else if (key.endsWith('.country')) demographicsConfig = { type: 'country', partialMatch: true };
        else if (key.endsWith('.city')) demographicsConfig = { type: 'city', partialMatch: true };
      }



      const demographicChartData: Array<{ label: string; value: number }> = [];

      if (demographicsConfig && finalResolvedData && (finalResolvedData as any).rows) {
        const rows = (finalResolvedData as any).rows as any[];

        if (demographicsConfig.type === 'age' || demographicsConfig.type === 'gender') {
          const targetMetrics = new Set(demographicsConfig.metrics || []);

          rows.forEach((row) => {
            // If config has specific metrics, ensure row matches one of them
            if (targetMetrics.size > 0 && !targetMetrics.has(row.metricKey)) return;

            let label = row.dimensionValue || "";
            // Clean label: "age:18-24" -> "18-24", "gender:M" -> "M"
            if (label.includes(':')) {
              label = label.split(':')[1];
            }

            // Fallback: extract from metricKey
            if (!label && row.metricKey) {
              label = row.metricKey.split('.').pop() || "";
            }

            // Gender formatting
            if (demographicsConfig.type === 'gender') {
              const map: Record<string, string> = { 'M': 'Male', 'F': 'Female', 'U': 'Unknown' };
              if (map[label]) label = map[label];
            }

            if (label && typeof row.value === 'number') {
              demographicChartData.push({ label, value: row.value });
            }
          });

          // Optional: Sort age groups if needed? 
          // Usually the API or Config order is preferred.
          // For now, let's trust the order we pushed them or (if from map) keys order.
        }
      }

      const series = Array.isArray((resolvedData as ResolvedWidgetData)?.series)
        ? ((resolvedData as ResolvedWidgetData).series as WidgetSeriesPoint[])
        : [];
      const hasData =
        demographicChartData.length > 0 ||
        series.length > 0 ||
        typeof (finalResolvedData as ResolvedWidgetData)?.total === "number" ||
        typeof (finalResolvedData as ResolvedWidgetData)?.value === "number";

      const chartColor = (widgetData as ChartWidgetData)?.chartColor || "#2563EB";
      const backgroundColor = (widgetData as ChartWidgetData)?.backgroundColor;

      // Generate chart data from series, or demographic data, or create a single point from total/value
      const chartData = demographicChartData.length > 0
        ? demographicChartData
        : series.length > 0
          ? series.map((point) => ({
            label: point.x,
            value: point.y,
          }))
          : (() => {
            const value = (finalResolvedData as ResolvedWidgetData)?.total ?? (finalResolvedData as ResolvedWidgetData)?.value;
            if (typeof value === "number") {
              const metricName = widget.metricConfig?.displayName ||
                widget.metricConfig?.metricKey?.split('.').pop() ||
                "Total";
              return [{ label: metricName, value }];
            }
            return [];
          })();

      if (widget.metricConfig?.metricKey?.startsWith('youtube.')) {
        console.log(`[YouTubeData] Widget ${widget.i}: hasData=${hasData}, seriesCount=${series.length}, firstPoints=`, series.slice(0, 3));
      }

      return (
        <div
          className="flex-1 flex flex-col min-h-0 relative"
          style={{ backgroundColor: backgroundColor || undefined }}
        >
          <div className="flex-1 min-h-[200px] relative">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={150}>
                {(() => {
                  const cType = (widget.data as ChartWidgetData)?.chartType?.toLowerCase() || (widget.widgetType === "pie_chart" ? "pie" : "area");
                  if (cType === "column" || cType === "bar") {
                    return (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        {!options?.readOnly && (
                          <Tooltip
                            formatter={(value: number) => value.toLocaleString()}
                            labelFormatter={(label: string) => label}
                            cursor={{ fill: "transparent" }}
                          />
                        )}
                        <Bar dataKey="value" fill={chartColor}>
                          {chartData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    );
                  }
                  if (cType === "line") {
                    return (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        {!options?.readOnly && (
                          <Tooltip
                            formatter={(value: number) => value.toLocaleString()}
                            labelFormatter={(label: string) => label}
                          />
                        )}
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={chartColor}
                          strokeWidth={2}
                          dot={false}
                          activeDot={options?.readOnly ? false : { r: 3, fill: chartColor }}
                        />
                      </LineChart>
                    );
                  }
                  if (cType === "pie") {
                    return (
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={65}
                          fill={chartColor}
                          label={({ label, percent }: { label: string; percent: number }) => `${label} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={true}
                        >
                          {chartData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    );
                  }
                  // Default to Area
                  return (
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      {!options?.readOnly && (
                        <Tooltip
                          formatter={(value: number) => value.toLocaleString()}
                          labelFormatter={(label: string) => label}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={chartColor}
                        strokeWidth={2}
                        fillOpacity={0.15}
                        fill={chartColor}
                        dot={false}
                        activeDot={{ r: 3, fill: chartColor }}
                      />
                    </AreaChart>
                  );
                })()}
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                {renderWidgetEmptyState(onConnectIntegration, "No chart data for this date range")}
              </div>
            )}
          </div>

        </div>
      );
    }

    case "line_chart":
    case "area_chart":
    case "bar_chart": {
      const series = Array.isArray((resolvedData as ResolvedWidgetData)?.series)
        ? ((resolvedData as ResolvedWidgetData).series as WidgetSeriesPoint[])
        : [];
      const hasData =
        series.length > 0 ||
        typeof (resolvedData as ResolvedWidgetData)?.total === "number";



      const chartData = series.map((point) => ({
        label: point.x,
        value: point.y,
      }));

      return (
        <div className="h-full flex flex-col p-1 min-h-0 relative">
          <div className="flex-1 min-h-[200px] relative">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                {widget.widgetType === "bar_chart" ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString()}
                      labelFormatter={(label: string) => label}
                    />
                    <Bar dataKey="value" fill="#2563EB" />
                  </BarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value: number) => value.toLocaleString()}
                      labelFormatter={(label: string) => label}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2563EB"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            ) : (
              <ChartLineMultiple data={[]} />
            )}
          </div>
          {!hasData && (
            <div className="border-t px-3 py-2 mt-2">
              {renderWidgetEmptyState(onConnectIntegration)}
            </div>
          )}
        </div>
      );
    }

    case "map": {
      const mapData = widgetData as MapWidgetData | undefined;
      return (
        <div className="h-full flex items-center justify-center text-xs md:text-sm text-gray-500 px-2">
          <span className="text-center">
            {mapData?.location ? `Map: ${mapData.location}` : "Map Placeholder"}
          </span>
        </div>
      );
    }

    case "table": {
      const tableData = widgetData as TableWidgetData | undefined;

      const isGaTopPagesTable =
        metricConfig?.metricKey === "ga.top_pages_views" &&
        !!metricConfig?.integration;

      // GA4 dimensional table widgets (channel, browser, device, country, city, top_pages)
      const GA4_DIMENSIONAL_KEYS = new Set([
        'google.channel_traffic',
        'google.browser_used',
        'google.device_category',
        'google.geo_country',
        'google.geo_city',
        'google.top_pages',
        'google_seo.top_pages',
        'google_seo.top_queries',
      ]);
      const isGa4DimensionalTable =
        !!metricConfig?.metricKey &&
        GA4_DIMENSIONAL_KEYS.has(metricConfig.metricKey);

      // Pull column definitions from resolvedData.columns (injected by useWidgetData GA4 path)
      const ga4Columns: Array<{ name: string; width?: string; dataKey: string }> =
        isGa4DimensionalTable && (resolvedData as any)?.columns
          ? (resolvedData as any).columns
          : [];

      // Check if it's a list-style table (Recent Posts, Media, or Campaign Performance)
      const isListTable =
        metricConfig?.metricKey === 'meta.facebook.recent_posts' ||
        metricConfig?.metricKey === 'meta.instagram.recent_media' ||
        metricConfig?.metricKey === 'meta.ads.campaign_performance' ||
        metricConfig?.metricKey === 'google_ads.campaign_performance' ||
        metricConfig?.metricKey === 'broadcast.recent' ||
        metricConfig?.metricKey === 'blog.recent';

      const generateColumnsFromRows = (rows: any[]) => {
        if (!rows.length) return [];
        const sample = rows[0] as Record<string, unknown>;
        return Object.keys(sample).slice(0, 8).map((key) => ({
          name: key
            .replace(/[_-]/g, " ")
            .replace(/\s+/g, " ")
            .replace(/^\w/, (c) => c.toUpperCase()),
        }));
      };

      const resolvedRows =
        resolvedData && Array.isArray((resolvedData as any).rows)
          ? ((resolvedData as any).rows as unknown[])
          : null;

      // Aggregated GA4 rows have flat fields (activeUsers, sessions, etc.) — declared after resolvedRows
      const ga4DimensionalRows: any[] | null =
        isGa4DimensionalTable && resolvedRows && resolvedRows.length > 0
          ? (resolvedRows as any[])
          : null;

      // Check if this is dimensional data (from GET /unified-metrics with dimensionType)
      const isDimensionalData =
        resolvedRows &&
        resolvedRows.length > 0 &&
        resolvedRows[0] &&
        typeof resolvedRows[0] === 'object' &&
        resolvedRows[0] !== null &&
        (resolvedRows[0] as any).dimensionValue && // Check values are truthy (not null)
        'value' in (resolvedRows[0] as Record<string, unknown>);

      // If dimensional data, convert to simple 2-column format
      let dimensionalRows: Array<{ dimension: string; value: number }> | null = null;
      if (isDimensionalData && resolvedRows) {
        dimensionalRows = resolvedRows.map((row: any) => ({
          dimension: row.dimensionValue || row.dimensionType || 'Unknown',
          value: typeof row.value === 'number' ? row.value : 0,
        }));
      }

      // Demographics Table Aggregation (Country/City)
      let demographicsConfig = (widgetData as any)?.customConfig?.demographics;

      // Fallback: Synthesize config if missing (matches hook/chart logic)
      if (!demographicsConfig && widget.metricConfig?.metricKey) {
        const key = widget.metricConfig.metricKey;
        if (key.endsWith('.country')) demographicsConfig = { type: 'country', partialMatch: true };
        else if (key.endsWith('.city')) demographicsConfig = { type: 'city', partialMatch: true };
        else if (key.endsWith('.age')) demographicsConfig = { type: 'age' };
        else if (key.endsWith('.gender')) demographicsConfig = { type: 'gender' };
      }

      const isDemographicsTable = demographicsConfig && (demographicsConfig.type === 'country' || demographicsConfig.type === 'city');
      let demographicTableRows: Array<{ dimension: string; value: number }> | null = null;

      if (isDemographicsTable && resolvedData) {
        const rows = (resolvedData as any).rows || [];
        if (rows.length > 0) {
          const type = demographicsConfig.type;
          const groupedData = new Map<string, number>();

          rows.forEach((row: any) => {
            const val = row.dimensionValue || "";
            // Only include rows matching the table type
            if (type === 'country' && !val.startsWith('country:')) return;
            if (type === 'city' && !val.startsWith('city:')) return;

            let label = val;
            // Clean prefix: "country:IN" -> "IN", "city:Mumbai" -> "Mumbai"
            if (label.includes(':')) label = label.split(':').slice(1).join(':');
            if (!label && row.metricKey) label = row.metricKey.split('.').pop() || "";

            if (label) {
              // API returns newest first, so we keep the first one encountered
              if (!groupedData.has(label)) {
                groupedData.set(label, typeof row.value === 'number' ? row.value : 0);
              }
            }
          });

          demographicTableRows = Array.from(groupedData.entries())
            .map(([dimension, value]) => ({ dimension, value }))
            .filter(r => r.value > 0)
            .sort((a, b) => b.value - a.value);
        }
      }

      const gaRows =
        isGaTopPagesTable &&
          resolvedData &&
          Array.isArray((resolvedData as any).rows)
          ? ((resolvedData as any).rows as unknown[])
          : null;

      // Generic metrics: if we have a series but no GA rows, render a simple
      // 2-column table from the series (label + value).
      let seriesRows =
        !isGaTopPagesTable &&
          !isListTable && // List tables (posts, campaigns) are handled via resolvedRows
          !gaRows &&
          !dimensionalRows &&  // Don't use series if we have dimensional data
          (!metricConfig?.groupBy || metricConfig.groupBy === 'none' || metricConfig.groupBy === 'date') && // Only show series (time-series) if grouping is date-based or none. Don't show dates for 'device' tables.
          Array.isArray((resolvedData as ResolvedWidgetData)?.series)
          ? (((resolvedData as ResolvedWidgetData)
            .series as WidgetSeriesPoint[]) as unknown[])
          : null;

      // Fallback: if metric returns only a single value/total, build a 1-row series
      if (
        !isGaTopPagesTable &&
        !isListTable &&
        !gaRows &&
        (!seriesRows || seriesRows.length === 0) &&
        metricConfig?.metricKey &&
        resolvedData
      ) {
        const value =
          typeof (resolvedData as ResolvedWidgetData)?.value === "number"
            ? (resolvedData as ResolvedWidgetData).value
            : typeof (resolvedData as ResolvedWidgetData)?.total === "number"
              ? (resolvedData as ResolvedWidgetData).total
              : null;

        if (value !== null) {
          const metricName =
            metricConfig.metricKey.split(".").pop() || metricConfig.metricKey;
          seriesRows = [{ x: metricName, y: value }] as unknown[];
        }
      }

      // For GA tables, filter series to only the core GA metric keys to avoid noisy dimension rows
      const isGaIntegration =
        (metricConfig?.integration || "").toLowerCase().replace(/_/g, "-") ===
        "google-analytics";
      if (isGaIntegration && seriesRows) {
        const allowedGaKeys = new Set([
          "google.activeUsers",
          "google.bounceRate",
          "google.pageViews",
          "google.sessions",
        ]);
        const filtered = (seriesRows as WidgetSeriesPoint[]).filter((p) =>
          allowedGaKeys.has(p.x)
        );
        seriesRows = filtered.length ? filtered : [];
      }

      // Identify which data source is driving the table so we render correct columns
      const usingGaRows = !!gaRows && gaRows.length > 0;
      console.log('[Renderer Debug] metricKey:', metricConfig?.metricKey, '| isGa4DimensionalTable:', isGa4DimensionalTable, '| resolvedRows:', resolvedRows?.length, '| ga4DimensionalRows:', ga4DimensionalRows?.length, '| ga4Columns:', ga4Columns?.length);
      const usingGa4DimensionalRows = !usingGaRows && !!ga4DimensionalRows && ga4DimensionalRows.length > 0;
      const usingDemographicRows = !usingGaRows && !usingGa4DimensionalRows && !!demographicTableRows && demographicTableRows.length > 0;
      const usingDimensionalRows = !usingGaRows && !usingGa4DimensionalRows && !usingDemographicRows && !!dimensionalRows && dimensionalRows.length > 0;
      const usingSeriesRows = !usingGaRows && !usingGa4DimensionalRows && !usingDemographicRows && !usingDimensionalRows && !!seriesRows && seriesRows.length > 0;
      const usingResolvedRows =
        !usingGaRows &&
        !usingGa4DimensionalRows &&
        !usingDemographicRows &&
        !usingDimensionalRows &&
        !usingSeriesRows &&
        !!resolvedRows &&
        resolvedRows.length > 0 &&
        (isListTable || !metricConfig?.groupBy || metricConfig.groupBy === 'none' || metricConfig.groupBy === 'date');
      const usingTableData =
        !usingGaRows &&
        !usingGa4DimensionalRows &&
        !usingDemographicRows &&
        !usingDimensionalRows &&
        !usingSeriesRows &&
        !usingResolvedRows &&
        (!metricConfig?.metricKey) &&
        !!tableData?.rows &&
        tableData.rows.length > 0;

      const rows =
        (usingGaRows ? (gaRows as any[]) : null) ??
        (usingGa4DimensionalRows ? (ga4DimensionalRows as any[]) : null) ??
        (usingDemographicRows ? (demographicTableRows as any[]) : null) ??
        (usingDimensionalRows ? (dimensionalRows as any[]) : null) ??
        (usingResolvedRows ? (resolvedRows as any[]) : null) ??
        (usingSeriesRows ? (seriesRows as any[]) : null) ??
        (usingTableData ? tableData?.rows : null) ??
        (metricConfig?.metricKey ? [] : reportTableRows);



      const autoColumns =
        resolvedRows &&
          resolvedRows.length &&
          !gaRows &&
          !dimensionalRows &&
          !seriesRows &&
          (!tableData?.columns || tableData.columns.length === 0)
          ? generateColumnsFromRows(resolvedRows)
          : null;

      // Get dimension type from metricConfig for title
      const dimensionType = metricConfig?.groupBy || '';
      const metricName = metricConfig?.metricKey?.split('.').pop()?.replace(/_/g, ' ') || 'Metric';



      const caption =
        tableData?.caption ??
        (isGaTopPagesTable
          ? "Pages with the highest number of views."
          : isListTable
            ? (() => {
              if (metricConfig?.metricKey === 'google_ads.campaign_performance') return "Performance metrics for your Google Ads campaigns.";
              if (metricConfig?.metricKey === 'meta.ads.campaign_performance') return "Performance metrics for your Meta Ads campaigns.";
              if (metricConfig?.metricKey === 'meta.instagram.recent_media') return "Recent media from your Instagram account.";
              if (metricConfig?.metricKey === 'broadcast.recent') return "Most recent broadcast campaigns for this client.";
              if (metricConfig?.metricKey === 'blog.recent') return "Most recent scheduled blog posts for this client.";
              return "Recent posts from your Facebook Page.";
            })()
            : "Queue of report deliveries.");

      const columns =
        isGaTopPagesTable
          ? [
            { name: "Page Path", width: "45%" },
            { name: "Title", width: "35%" },
            { name: "Views" },
          ]
          : isListTable
            ? (() => {
              // Check if tableData has generic "Name/Value" columns (legacy default)
              const hasGenericColumns = tableData?.columns?.length === 2 &&
                tableData.columns[0]?.name === 'Name' &&
                tableData.columns[1]?.name === 'Value';

              // Always prefer saved/user-customized columns (respects add/remove/reorder)
              // Only fall back to defaults when columns are generic ("Name"/"Value") or empty
              const savedCols = tableData?.columns?.length ? tableData.columns : null;
              const resolvedCols = (resolvedData as any)?.columns;

              // If user has real saved columns (not generic defaults), always use them
              if (savedCols && !hasGenericColumns) return savedCols;

              // For generic defaults or empty columns, fall back to type-specific defaults
              if (metricConfig?.metricKey === 'meta.ads.campaign_performance') {
                return [
                  { name: "Ad Image", width: "10%", dataKey: "thumbnailUrl" },
                  { name: "Campaign", width: "18%", dataKey: "campaignName" },
                  { name: "Ad", width: "12%", dataKey: "adName" },
                  { name: "Ad Set", width: "12%", dataKey: "adsetName" },
                  { name: "Spend", width: "8%", dataKey: "spend" },
                  { name: "Impressions", width: "10%", dataKey: "impressions" },
                  { name: "Clicks", width: "10%", dataKey: "clicks" },
                  { name: "Likes", width: "8%", dataKey: "likes" },
                  { name: "Average CPC", width: "10%", dataKey: "cpc" },
                  { name: "CTR", width: "12%", dataKey: "ctr" }
                ];
              }
              if (metricConfig?.metricKey === 'google_ads.campaign_performance') {
                return [
                  { name: "Campaign", width: "18%", dataKey: "name" },
                  { name: "View-through conversions", width: "10%", dataKey: "viewThroughConversions" },
                  { name: "Avg CPC", width: "10%", dataKey: "cpc" },
                  { name: "Clicks", width: "9%", dataKey: "clicks" },
                  { name: "Conversion rate", width: "10%", dataKey: "conversionRate" },
                  { name: "Conversions", width: "10%", dataKey: "conversions" },
                  { name: "Cost", width: "11%", dataKey: "cost" },
                  { name: "Cost / conv.", width: "11%", dataKey: "costPerConversion" },
                  { name: "Impressions", width: "11%", dataKey: "impressions" },
                ];
              }
              if (metricConfig?.metricKey === 'meta.instagram.recent_media') {
                return [
                  { name: "Date", width: "15%", dataKey: "date" },
                  { name: "Full Picture", dataKey: "fullPicture" },
                  { name: "Post Message", width: "35%", dataKey: "post" },
                  { name: "Impressions", dataKey: "impressions" },
                  { name: "Clicks", dataKey: "clicks" },
                  { name: "Likes", dataKey: "likes" },
                  { name: "Comments", dataKey: "comments" },
                  { name: "Shares", dataKey: "shares" }
                ];
              }
              if (metricConfig?.metricKey === 'meta.facebook.recent_posts') {
                return [
                  { name: "Date", width: "10%" },
                  { name: "Image", dataKey: "fullPicture" },
                  { name: "Post", width: "35%", dataKey: "post" },
                  { name: "Clicks", dataKey: "clicks" },
                  { name: "Likes", dataKey: "likes" },
                  { name: "Comments", dataKey: "comments" },
                  { name: "Shares", dataKey: "shares" },
                ];
              }
              if (metricConfig?.metricKey === 'broadcast.recent') {
                return [
                  { name: "Date", width: "14%", dataKey: "date" },
                  { name: "Name", width: "30%", dataKey: "name" },
                  { name: "Channel", width: "12%", dataKey: "channel" },
                  { name: "Status", width: "12%", dataKey: "status" },
                  { name: "Sent", width: "8%", dataKey: "sent" },
                  { name: "Total", width: "8%", dataKey: "total" },
                  { name: "Failed", width: "8%", dataKey: "failed" },
                ];
              }
              if (metricConfig?.metricKey === 'blog.recent') {
                return [
                  { name: "Date", width: "20%", dataKey: "date" },
                  { name: "Title", width: "40%", dataKey: "title" },
                  { name: "Platforms", width: "20%", dataKey: "platforms" },
                  { name: "Status", width: "20%", dataKey: "status" },
                ];
              }

              // Final fallback: resolved data columns or generic
              if (resolvedCols?.length) return resolvedCols;
              return [
                { name: "Date", width: "10%" },
                { name: "Image", dataKey: "fullPicture" },
                { name: "Post", width: "35%", dataKey: "post" },
                { name: "Clicks", dataKey: "clicks" },
                { name: "Likes", dataKey: "likes" },
                { name: "Comments", dataKey: "comments" },
                { name: "Shares", dataKey: "shares" }
              ];
            })()
            : usingGa4DimensionalRows
              ? (tableData?.columns?.length && !(tableData.columns.length === 2 && tableData.columns[0]?.name === 'Name') ? tableData.columns : ga4Columns)
              : usingDemographicRows
                ? [
                  { name: demographicsConfig?.type === 'country' ? 'Country' : 'City', width: "60%" },
                  { name: "Followers", width: "40%" },
                ]
                : usingDimensionalRows
                  ? [
                    { name: dimensionType.charAt(0).toUpperCase() + dimensionType.slice(1), width: "60%" },
                    { name: metricName.charAt(0).toUpperCase() + metricName.slice(1) },
                  ]
                  : usingSeriesRows
                    ? [
                      { name: "Metric", width: "60%" },
                      { name: "Value" },
                    ]
                    : usingResolvedRows && autoColumns
                      ? autoColumns
                      : tableData?.columns && tableData.columns.length
                        ? tableData.columns
                        : [
                          { name: "Report", width: "35%" },
                          { name: "Audience" },
                          { name: "Status" },
                          { name: "Last Run" },
                          { name: "Next Send" },
                        ];

      const rawCount =
        typeof resolvedData?.rawCount === "number" ? resolvedData.rawCount : 0;
      const rowCount = Array.isArray(rows) ? rows.length : 0;
      const hasTableData = rawCount > 0 || rowCount > 0;

      return (
        <Card
          className="h-full flex flex-col rounded-lg border-0 shadow-none"
          style={{
            backgroundColor: tableData?.backgroundColor || undefined,
            color: tableData?.textColor || undefined
          }}
        >

          <CardContent className="flex-1 p-0 overflow-visible">
            <div className="w-full h-full overflow-x-auto">
              <Table className="w-full table-fixed text-xs md:text-sm" style={{ color: "inherit" }}>
                <TableCaption className="text-[10px] md:text-xs">
                  {caption}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    {columns.map((col: { name: string; width?: string }) => (
                      <TableHead
                        key={col.name}
                        className="whitespace-normal px-2 md:px-4"
                        style={col.width ? { width: col.width } : undefined}
                      >
                        {col.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={row.name || index}>
                      {columns.map((col: { name: string; width?: string; dataKey?: string }, colIndex: number) => {
                        // For dynamic columns, we need to map column names to row properties
                        let cellValue: unknown;

                        if (isGaTopPagesTable && gaRows) {
                          const gaRow = row as any;
                          cellValue =
                            col.name === "Page Path"
                              ? gaRow.pagePath
                              : col.name === "Title"
                                ? gaRow.pageTitle || "Untitled"
                                : col.name === "Views"
                                  ? gaRow.views
                                  : "";
                        } else if (isGa4DimensionalTable && usingGa4DimensionalRows) {
                          // GA4 dimensional table: use dataKey to access the pre-aggregated row fields
                          const gaRow = row as any;
                          const dataKey = (col as any).dataKey || '';
                          const raw = gaRow[dataKey];
                          if (dataKey === 'avgSessionDuration' && typeof raw === 'number') {
                            // Convert seconds to m:ss
                            const minutes = Math.floor(raw / 60);
                            const seconds = Math.floor(raw % 60);
                            cellValue = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                          } else if (dataKey === 'engagementRate' && typeof raw === 'number') {
                            cellValue = `${raw.toFixed(1)}%`;
                          } else if (typeof raw === 'number') {
                            cellValue = raw.toLocaleString();
                          } else {
                            cellValue = raw ?? '—';
                          }
                        } else if (isListTable) {
                          const pRow = row as any;
                          // Use dataKey if available, otherwise fallback to name mapping or direct property access
                          let key = (col as any).dataKey;

                          if (!key) {
                            // Fallback for legacy columns without dataKey
                            const nameLower = col.name.toLowerCase();
                            if (col.name === "Date") key = "date";
                            else if (col.name === "Post" || col.name === "Post Message") key = "post";
                            else if (col.name === "Full Picture") key = "fullPicture";
                            else if (col.name === "Permalink URL") key = "permalinkUrl";
                            else key = nameLower;
                          }

                          cellValue = pRow[key];

                          // Handle numeric defaults if needed (though API processing usually sets defaults)
                          if (key === 'impressions' || key === 'clicks' || key === 'conversions' || key === 'viewThroughConversions') {
                            cellValue = cellValue != null ? Number(cellValue).toLocaleString() : '0';
                          } else if (key === 'cpc' || key === 'cost' || key === 'costPerConversion') {
                            cellValue = cellValue != null ? `₹${Number(cellValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹0.00';
                          } else if (key === 'ctr' || key === 'conversionRate') {
                            cellValue = cellValue != null ? `${Number(cellValue).toFixed(2)}%` : '0.00%';
                          }
                        } else if (usingDemographicRows) {
                          const demRow = row as { dimension: string; value: number };
                          cellValue = colIndex === 0 ? demRow.dimension : demRow.value.toLocaleString();
                        } else if (usingDimensionalRows) {
                          const dimRow = row as { dimension: string; value: number };
                          cellValue =
                            colIndex === 0
                              ? dimRow.dimension
                              : dimRow.value;
                        } else if (usingSeriesRows) {
                          const sRow = row as any as WidgetSeriesPoint;
                          cellValue =
                            col.name === "Metric"
                              ? sRow.x
                              : col.name === "Value"
                                ? sRow.y
                                : "";
                        } else if (resolvedRows) {
                          const genericRow = row as Record<string, unknown>;
                          const key = (col as any).dataKey;
                          cellValue =
                            (key && genericRow[key] !== undefined)
                              ? genericRow[key]
                              : genericRow[col.name] ??
                              genericRow[col.name.replace(/\s+/g, "")] ??
                              genericRow[col.name.toLowerCase()] ??
                              genericRow[col.name
                                .toLowerCase()
                                .replace(/\s+/g, "_")] ??
                              "";
                        } else {
                          cellValue =
                            col.name === "Report"
                              ? (row as any).name
                              : col.name === "Audience"
                                ? (row as any).audience
                                : col.name === "Status"
                                  ? (row as any).status
                                  : col.name === "Last Run"
                                    ? (row as any).lastRun
                                    : col.name === "Next Send"
                                      ? (row as any).nextSend
                                      : (row as Record<string, unknown>)[col.name] ??
                                      (row as Record<string, unknown>)[
                                      col.name.toLowerCase().replace(/\s+/g, "")
                                      ] ?? "";
                        }

                        if (
                          !isGaTopPagesTable &&
                          !usingSeriesRows &&
                          col.name === "Status"
                        ) {
                          return (
                            <TableCell
                              key={colIndex}
                              className="whitespace-normal px-2 md:px-4"
                            >
                              <span
                                className={`inline-flex items-center rounded-full border px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium ${getStatusBadgeClass(
                                  row.status
                                )}`}
                              >
                                {String(cellValue)}
                              </span>
                            </TableCell>
                          );
                        }

                        // Special rendering for image thumbnail column (dataKey is fullPicture or thumbnailUrl)
                        if ((col.dataKey === "fullPicture" || col.dataKey === "thumbnailUrl") && (cellValue || (row as any).fullPicture || (row as any).thumbnailUrl)) {
                          const imgSrc = String(cellValue || (row as any).fullPicture || (row as any).thumbnailUrl);
                          const permalinkUrl = (row as any).permalinkUrl as string | undefined;
                          return (
                            <TableCell key={colIndex} className="px-2 md:px-4 py-2">
                              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded overflow-hidden border">
                                <img
                                  src={imgSrc}
                                  alt="Media"
                                  className={`w-full h-full object-cover transition-opacity ${permalinkUrl ? 'cursor-pointer hover:opacity-80' : ''}`}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-gray-400">No image</span>';
                                  }}
                                  onClick={() => permalinkUrl && window.open(permalinkUrl, '_blank')}
                                />
                              </div>
                            </TableCell>
                          );
                        }

                        // Special rendering for "Post" column with image
                        if (col.name === "Post" && (row as any).fullPicture) {
                          return (
                            <TableCell key={colIndex} className="px-2 md:px-4 py-2">
                              <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden border">
                                  <img
                                    src={(row as any).fullPicture}
                                    alt="Post"
                                    className="w-full h-full object-cover"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                  />
                                </div>
                                <span className="text-[11px] md:text-xs text-gray-700 line-clamp-3 break-words">
                                  {String(cellValue ?? "")}
                                </span>
                              </div>
                            </TableCell>
                          );
                        }

                        // Special rendering for "Full Picture" column - show image thumbnail
                        if (col.name === "Full Picture" && cellValue) {
                          const permalinkUrl = (row as any).permalinkUrl as string | undefined;
                          return (
                            <TableCell key={colIndex} className="px-2 md:px-4 py-2">
                              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded overflow-hidden border">
                                <img
                                  src={String(cellValue)}
                                  alt="Media"
                                  className={`w-full h-full object-cover transition-opacity ${permalinkUrl ? 'cursor-pointer hover:opacity-80' : ''}`}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-gray-400">No image</span>';
                                  }}
                                  onClick={() => permalinkUrl && window.open(permalinkUrl, '_blank')}
                                />
                              </div>
                            </TableCell>
                          );
                        }

                        // Truncate long text in Caption/Post columns
                        const isTextColumn = col.dataKey === 'post' || col.name === 'Caption' || col.name === 'Post Message';
                        return (
                          <TableCell
                            key={colIndex}
                            className={`px-2 md:px-4 ${colIndex === 0
                              ? "font-medium"
                              : ""
                              } whitespace-normal break-words`}
                          >
                            {col.name === "Views" && isGaTopPagesTable
                              ? Number(cellValue ?? 0).toLocaleString()
                              : isTextColumn
                                ? <span className="line-clamp-3 text-[11px] md:text-xs">{String(cellValue ?? "")}</span>
                                : String(cellValue ?? "")}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          {!hasTableData && (
            <div className="border-t px-3 py-2">
              {renderWidgetEmptyState(
                onConnectIntegration,
                "No table data yet"
              )}
            </div>
          )}
        </Card>
      );
    }

    case "title": {
      const titleData = widgetData as TitleWidgetData | undefined;
      const text = titleData?.text ?? "Demo title";
      const fontSize = titleData?.fontSize ?? "2xl";
      const align = titleData?.align ?? "center";

      // Map fontSize to Tailwind classes
      const fontSizeClass =
        fontSize === "xs"
          ? "text-xs"
          : fontSize === "sm"
            ? "text-sm"
            : fontSize === "base"
              ? "text-base"
              : fontSize === "lg"
                ? "text-lg"
                : fontSize === "xl"
                  ? "text-xl"
                  : fontSize === "2xl"
                    ? "text-2xl"
                    : fontSize === "3xl"
                      ? "text-3xl"
                      : fontSize === "4xl"
                        ? "text-4xl"
                        : "text-2xl";

      const alignClass =
        align === "left"
          ? "justify-start"
          : align === "right"
            ? "justify-end"
            : "justify-center";

      return (
        <div
          className={`h-full w-full flex items-center ${alignClass} hover:border text-xs md:text-sm text-gray-900`}
          style={{
            ...(titleData?.backgroundColor
              ? { backgroundColor: titleData.backgroundColor }
              : {}),
            ...(titleData?.padding
              ? { padding: titleData.padding }
              : {}),
          }}
        >
          <span
            className={`${fontSizeClass} font-semibold break-words text-center`}
            style={titleData?.color ? { color: titleData.color } : undefined}
          >
            {text}
          </span>
        </div>
      );
    }

    case "metric": {
      const metricData = widgetData as MetricWidgetData | undefined;

      // For integration-based metrics, prefer resolved values from the API.
      // For Content Blocks "Stat" widgets (manual), we ignore resolvedData and
      // never show the "Connect Integration" empty state.
      // Check resolved value with loose type checking to support strings
      const val = resolvedData?.value;
      const tot = resolvedData?.total;

      const resolvedValue =
        isIntegrationMetric && val != null && !isNaN(Number(val))
          ? Number(val)
          : isIntegrationMetric && tot != null && !isNaN(Number(tot))
            ? Number(tot)
            : undefined;



      const dataRawCount =
        isIntegrationMetric && typeof resolvedData?.rawCount === "number"
          ? resolvedData.rawCount
          : 0;
      const hasData = isIntegrationMetric
        ? resolvedValue !== undefined || dataRawCount > 0
        : true;

      const finalValue = resolvedValue ?? metricData?.value ?? 0;

      // Fallback unit if not specified in config
      let displayUnit = metricData?.unit;
      let isCurrency = false;
      if (!displayUnit && widget.metricConfig?.metricKey) {
        const key = widget.metricConfig.metricKey;
        if (key.includes(".cpc") || key.includes(".cost") || key.includes(".spend") || key.endsWith(".avgOrderValue") || key.endsWith(".revenue")) {
          displayUnit = "₹";
          isCurrency = true;
        } else if (key.includes(".ctr") || key.includes(".bounceRate") || key.includes(".conversionRate") || key === "broadcast.successRate") {
          displayUnit = "%";
        }
      }
      if (!isCurrency && (displayUnit === "₹" || displayUnit === "$" || displayUnit === "€" || displayUnit === "£")) {
        isCurrency = true;
      }

      const formattedValue = typeof finalValue === "number"
        ? (isCurrency ? formatCurrencyNumber(finalValue) : formatCompactNumber(finalValue))
        : finalValue;

      // NEW: Auto-populate sparklineData from resolved series
      const sparklineData = resolvedData?.series && Array.isArray(resolvedData.series)
        ? resolvedData.series.map((point: any) => ({ x: point.x, y: point.y }))
        : metricData?.sparklineData || [];

      return (
        <div
          className="flex-1 w-full flex flex-col items-center justify-center text-xs md:text-sm px-2 text-center min-h-[100px]"
          style={{
            backgroundColor: metricData?.backgroundColor || undefined,
            color: metricData?.textColor || undefined
          }}
        >
          <span
            className="text-2xl md:text-3xl font-bold"
            style={{ color: metricData?.textColor || "inherit" }}
          >
            {formattedValue}
            {displayUnit && (
              <span
                className="text-base md:text-lg ml-1"
                style={{ color: metricData?.textColor ? "inherit" : "#4b5563" }} // Default to gray-600 if no custom color
              >
                {displayUnit}
              </span>
            )}
          </span>

          {/* NEW: Sparkline Chart (Agency Analytics style graph+number) */}
          {(metricData?.showSparkline !== false) && sparklineData.length > 0 && (
            <div className="w-full mt-3 px-2" style={{ height: '60px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke={metricData?.textColor || "#2563eb"}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}


          {/* Trend & Comparison (Manual / Custom Metrics) */}
          {(metricData?.trendValue || metricData?.comparisonValue) && (
            <div className="flex flex-col items-center mt-2 gap-0.5">
              {metricData.trendValue && (
                <div
                  className={`flex items-center text-xs font-medium ${metricData.trendDirection === "up"
                    ? "text-green-600"
                    : metricData.trendDirection === "down"
                      ? "text-red-600"
                      : "text-gray-500"
                    }`}
                >
                  {metricData.trendDirection === "up" && "▲ "}
                  {metricData.trendDirection === "down" && "▼ "}
                  {metricData.trendValue}
                </div>
              )}
              {metricData.comparisonValue && (
                <div className="text-[10px] text-gray-400">
                  vs {metricData.comparisonValue}
                </div>
              )}
            </div>
          )}


          {isIntegrationMetric && !hasData && (
            <div className="w-full mt-3">
              {renderWidgetEmptyState(onConnectIntegration)}
            </div>
          )}
        </div>
      );
    }

    case "image": {
      const imageData = widgetData as ImageWidgetData | undefined;
      const imageFit = imageData?.imageFit || "contain";
      console.log(`[Render][IMG] ${widget.i}`, {
        hasWidgetData: !!widgetData,
        hasImageData: !!imageData,
        srcType: typeof imageData?.src,
        srcLen: typeof imageData?.src === 'string' ? imageData!.src!.length : 0,
        srcPrefix: typeof imageData?.src === 'string' ? imageData!.src!.slice(0, 30) : imageData?.src,
      });
      return (
        <div
          className="h-full flex items-center justify-center text-xs md:text-sm text-gray-500 p-0"
          style={
            imageData?.backgroundColor
              ? { backgroundColor: imageData.backgroundColor }
              : undefined
          }
        >
          {imageData?.src ? (
            <img
              src={imageData.src}
              alt={imageData.alt ?? "Image"}
              className="max-w-full max-h-full rounded"
              style={{ objectFit: imageFit }}
            />
          ) : (
            <span className="text-center">Image Placeholder</span>
          )}
        </div>
      );
    }

    case "embed": {
      const embedData = widgetData as EmbedWidgetData | undefined;
      const title = embedData?.title || "Embedded content";
      const url = embedData?.url || "";

      return (
        <div
          className="h-full flex items-center justify-center text-xs md:text-sm text-gray-500 p-1 md:p-2 embed-widget"
          data-embed-title={title}
          data-embed-url={url}
          style={
            embedData?.backgroundColor
              ? { backgroundColor: embedData.backgroundColor }
              : undefined
          }
        >
          {url ? (
            <iframe
              src={url}
              className="w-full h-full border-0 rounded"
              title={title}
            />
          ) : (
            <span className="text-center">Embed Placeholder</span>
          )}
        </div>
      );
    }

    case "custom": {
      const customData = widgetData as CustomWidgetData | undefined;
      const customStyle = {
        backgroundColor: customData?.backgroundColor || undefined,
        color: customData?.textColor || undefined,
        textAlign: customData?.align ?? "left",
      } as React.CSSProperties;
      const heading =
        customData?.title && customData.title.trim().length > 0
          ? customData.title.trim()
          : null;
      // Tasks-style custom block
      if (customData?.type === "tasks") {
        const tasks =
          (customData.content ?? "")
            .split("\n")
            .map((t) => t.trim())
            .filter(Boolean) || [];

        return (
          <div
            className="h-full flex flex-col items-stretch justify-start text-xs md:text-sm text-gray-800 px-3 py-2 rounded-md"
            style={customStyle}
          >
            {heading && (
              <div className="font-semibold mb-2 text-gray-900">{heading}</div>
            )}
            {tasks.length === 0 ? (
              <span className="text-[11px] text-gray-400">
                No tasks yet. Use the editor to add tasks.
              </span>
            ) : (
              <ul className={`list-disc list-inside space-y-1 ${customData.fontSize || ''} ${customData.fontWeight || ''}`}>
                {tasks.map((task, idx) => (
                  <li key={idx} className="break-words">
                    {task}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }

      // Table-of-contents style custom block
      if (customData?.type === "toc") {
        let parsedLines: { section: string; page: string }[] = [];

        if (customData.autoPopulate && options?.slidesMeta?.length) {
          // Auto-build entries from the live slidesMeta list. Page numbers use
          // each slide's 1-indexed position in the full pageOrder. Skip:
          //   - the slide that hosts this TOC widget (so it doesn't list itself)
          //   - the seeded cover slide (matched by title)
          // so the auto-rendered TOC focuses on content slides.
          parsedLines = options.slidesMeta
            .map((m, idx) => ({ meta: m, page: idx + 1 }))
            .filter(({ meta }) => {
              if (Number(meta.id) === options.currentSlideId) return false;
              if ((meta.title || "").trim().toLowerCase() === "cover") return false;
              return true;
            })
            .map(({ meta, page }, idx) => ({
              section: meta.title || `Slide ${idx + 1}`,
              page: String(page),
            }));
        } else {
          const lines =
            (customData.content ?? "")
              .split("\n")
              .map((t) => t.trim())
              .filter(Boolean) || [];

          // Parse lines to extract section name and page number
          // Format: "Section Name | 3" or just "Section Name" (auto-number)
          parsedLines = lines.map((line, idx) => {
            const parts = line.split("|").map(p => p.trim());
            if (parts.length >= 2) {
              return {
                section: parts[0],
                page: parts[1]
              };
            }
            return {
              section: line,
              page: String(idx + 3) // Auto-number starting from page 3
            };
          });
        }

        return (
          <div
            className="h-full flex flex-col items-stretch justify-start px-6 py-4 rounded-md"
            style={customStyle}
          >
            <div className="text-center font-bold text-lg mb-6 text-gray-700 dark:text-gray-300">
              {heading ?? "Table of Contents"}
            </div>
            {parsedLines.length === 0 ? (
              <span className="text-xs text-gray-400 text-center">
                {customData.autoPopulate
                  ? "Add slides to see them listed here"
                  : 'Add entries like "Section Name | 3" (one per line)'}
              </span>
            ) : (
              <div className="w-full space-y-2.5">
                {parsedLines.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-baseline gap-2 text-gray-700 dark:text-gray-300 ${customData.fontSize || 'text-sm'} ${customData.fontWeight || 'font-normal'}`}
                  >
                    <span className="flex-shrink-0">{item.section}</span>
                    <span className="flex-1 border-b border-dotted border-gray-400 dark:border-gray-600 mb-1"></span>
                    <span className="flex-shrink-0 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                      {item.page}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // Generic custom text block with Mini-Markdown support
      const renderMarkdownLine = (line: string, idx: number) => {
        // Helper to process inline styles (bold, italic)
        const processInline = (text: string) => {
          const parts = text.split(/(\*\*.*?\*\*|_.*?_)/g);
          return parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith("_") && part.endsWith("_")) {
              return <em key={i}>{part.slice(1, -1)}</em>;
            }
            return part;
          });
        };

        if (line.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-xl font-bold my-2 text-gray-900">
              {processInline(line.slice(2))}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-lg font-semibold my-2 text-gray-800">
              {processInline(line.slice(3))}
            </h2>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <div key={idx} className="flex gap-2 ml-1 my-0.5">
              <span className="text-gray-400">•</span>
              <span>{processInline(line.slice(2))}</span>
            </div>
          );
        }
        // Regular paragraph (preserve empty lines as spacing)
        return (
          <p key={idx} className={`my-0.5 ${!line.trim() ? "h-2" : ""}`}>
            {processInline(line)}
          </p>
        );
      };

      const lines = (customData?.content ?? "Custom Placeholder").split("\n");

      return (
        <div
          className={`h-full flex flex-col items-start justify-start text-gray-800 px-3 py-2 rounded-md w-full overflow-y-auto whitespace-pre-wrap break-words ${customData?.fontSize || 'text-xs md:text-sm'} ${customData?.fontWeight || 'font-normal'}`}
          style={customStyle}
        >
          {heading && (
            <div className="font-semibold mb-2 text-gray-900 border-b pb-1 w-full">
              {heading}
            </div>
          )}
          <div className="w-full">
            {lines.map((line, idx) => renderMarkdownLine(line, idx))}
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="h-full flex items-center justify-center text-xs md:text-sm text-gray-500 px-2">
          <span className="text-center">
            {String(widget.widgetType).charAt(0).toUpperCase() +
              String(widget.widgetType).slice(1)}{" "}
            Placeholder
          </span>
        </div>
      );
  }
};
