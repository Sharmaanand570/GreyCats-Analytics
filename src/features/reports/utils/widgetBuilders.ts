import { type ReportWidgetType } from "@/components/reportTypes";
import type { WidgetData } from "@/components/widgetTypes";
import type { DashboardLayout } from "@/features/reports/api/types";
import { generateWidgetId } from "@/components/reportConstants";
import { prettifyMetricLabel } from "@/utils/labelUtils";
import { DEFAULT_RECENT_POSTS_COLUMNS } from "@/components/TableWidgetForm";
import { getDefaultWidgetData } from "./reportBuilderConstants";
import { CURATED_DEFAULTS, MAX_DEFAULT_WIDGETS, INTEGRATION_TEMPLATES, type IntegrationTemplate } from "./integrationTemplates";

export type MetricOption = {
  metricKey: string;
  integration: string;
  accountId: string;
  displayName?: string;
  filters?: Record<string, unknown>;
};

/**
 * Pick default metrics for an integration, trying curated keys first,
 * then falling back to available metrics from groupedMetrics.
 */
export function pickDefaultMetricsForIntegration(
  integrationKey: string,
  accountId: string,
  groupedMetrics: Record<string, Record<string, MetricOption[]>>,
  notifyFallback: (msg: string) => void
): MetricOption[] {
  // Normalize integration key: lower case, replace underscores OR spaces with hyphens
  // This handles "Meta Ads" -> "meta-ads"
  const normalized = integrationKey.toLowerCase().replace(/[ _]/g, "-");

  // console.log(`🔍 [pickMetrics] Input: '${integrationKey}', Normalized: '${normalized}', Account: '${accountId}'`);

  // Special case: meta-business... (keep existing)

  // ... existing meta-business logic ...

  // Try to find metrics for this integration/account in groupedMetrics
  const perAccount =
    groupedMetrics[integrationKey] ??
    groupedMetrics[normalized] ??
    groupedMetrics[normalized.replace(/-/g, '_')] ?? // Fallback to underscore (meta_ads)
    groupedMetrics[normalized === "google-console" ? "google-search-console" : ""] ??
    {};

  // console.log(`🔍 [pickMetrics] perAccount keys for '${normalized}':`, Object.keys(perAccount));

  // For Shopify, WooCommerce, and Meta Ads/Business, if no metrics are found (cold start), force the curated list immediately
  const coldStartPlatforms = [
    'shopify', 'woo', 'woocommerce',
    'meta-ads', 'meta-business', 'meta-social', 'meta-facebook', 'meta-instagram', 'meta',
    'google-search-console', 'google-console', 'google-analytics', 'google',
    'youtube'
  ];

  // LOGIC CHECK: Is cold start triggered?
  const isColdStart = coldStartPlatforms.includes(normalized) && (!perAccount || Object.keys(perAccount).length === 0);
  // console.log(`❄️ [pickMetrics] Cold Start Check: Platform supported? ${coldStartPlatforms.includes(normalized)}, Empty? ${(!perAccount || Object.keys(perAccount).length === 0)}, Triggered? ${isColdStart}`);

  if (isColdStart) {
    // console.log(`❄️ ${integrationKey} cold start detected - using forced defaults`);
    const defaults = CURATED_DEFAULTS[normalized] ?? [];
    return defaults.map(key => ({
      metricKey: key,
      integration: integrationKey,
      accountId: accountId, // Will be sanitized at the end of function
      displayName: key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim(),
    }));
  }

  // If we can't find metrics for the specific accountId, try to find ANY metrics for this integration
  // This handles cases where client uses accountId '5' but metrics are stored under '1'
  // ALSO: specialized fix for Meta Ads where ID often has 'act_' prefix in data but not in integration
  let candidates = perAccount[accountId] ?? perAccount[`act_${accountId}`] ?? [];

  // Special handling for Meta Business: aggregate from sub-integrations if essentially empty
  if (normalized === 'meta-business' && candidates.length === 0) {
    // console.log('✨ aggregating Meta Business metrics from sub-platforms');
    const fb = groupedMetrics['meta-facebook'] || groupedMetrics['meta_facebook'] || {};
    const ig = groupedMetrics['meta-instagram'] || groupedMetrics['meta_instagram'] || {};

    // Collect all available metrics from sub-integrations
    const allMetrics: MetricOption[] = [];

    // Add Facebook metrics
    Object.values(fb).forEach((accountMetrics: any) => {
      if (Array.isArray(accountMetrics)) {
        allMetrics.push(...accountMetrics.map((m: any) => ({ ...m, integration: 'meta-facebook' })));
      }
    });

    // Add Instagram metrics
    Object.values(ig).forEach((accountMetrics: any) => {
      if (Array.isArray(accountMetrics)) {
        allMetrics.push(...accountMetrics.map((m: any) => ({ ...m, integration: 'meta-instagram' })));
      }
    });

    candidates = allMetrics;
  }

  if (candidates.length === 0) {
    const availableAccounts = Object.keys(perAccount);
    if (availableAccounts.length > 0) {
      // Use the first available account's metrics
      console.log(`⚠️ Metrics mismatch for ${integrationKey}: requested ${accountId}, falling back to ${availableAccounts[0]}`);
      candidates = perAccount[availableAccounts[0]];
    }
  }

  // DEBUG: Log what metrics we found
  console.log('📊 Available metrics for', integrationKey, ':', {
    candidateCount: candidates.length,
    sampleKeys: candidates.slice(0, 5).map(m => m.metricKey),
  });

  if (!candidates.length) {
    console.warn('⚠️ No metrics found in debug list for', integrationKey, accountId);

    // Try to find the ACTUAL accountId from available metrics if the provided one has no hits
    const availableAccounts = Object.keys(perAccount);
    const bestAccountId = availableAccounts.length > 0 ? availableAccounts[0] : accountId;
    if (bestAccountId !== accountId) {
      console.log(`✨ Using accountId fallback for synthetic metrics: ${accountId} -> ${bestAccountId}`);
    }

    // Fallback: use curated defaults if available
    const curated = CURATED_DEFAULTS[normalized] ?? CURATED_DEFAULTS[integrationKey] ?? [];
    if (curated.length > 0) {
      console.log('✨ Using curated defaults as fallback:', curated);
      // Create synthetic metric options from curated defaults
      const syntheticMetrics: MetricOption[] = curated.map(metricKey => ({
        metricKey,
        integration: integrationKey,
        accountId: bestAccountId, // Use best available accountId
        label: metricKey.split('.').pop() || metricKey,
      }));
      return syntheticMetrics;
    }

    console.error('❌ No curated defaults available for', integrationKey);
    return [];
  }

  const curated = CURATED_DEFAULTS[normalized] ?? [];
  const curatedFound: MetricOption[] = [];

  // Try to match curated metric keys (flexible matching by suffix)
  curated.forEach((key) => {
    const hit = candidates.find(
      (m) =>
        m.metricKey === key ||
        m.metricKey.endsWith(`.${key}`) ||
        m.metricKey.toLowerCase().includes(key.toLowerCase())
    );
    if (hit) {
      console.log('✅ Matched curated metric:', key, '→', hit.metricKey);
      curatedFound.push(hit);
    } else {
      console.log('❌ Curated metric not found:', key);
    }
  });

  // If no curated metrics found, use fallback
  if (!curatedFound.length && candidates.length) {
    console.warn('⚠️ Using fallback metrics for', integrationKey);
    notifyFallback(
      `Using available metrics for ${integrationKey} (curated metrics not found).`
    );
    return candidates.slice(0, MAX_DEFAULT_WIDGETS);
  }

  // Fill remaining slots with other available metrics
  const remaining =
    candidates.filter(
      (m) => !curatedFound.some((c) => c.metricKey === m.metricKey)
    ) ?? [];

  const result = [...curatedFound, ...remaining].slice(0, MAX_DEFAULT_WIDGETS);
  // Sanitize accountId in result to strip 'act_' prefix for Meta Ads
  // and generally ensure they match the integration's accountId if we did a fallback
  const sanitizedResult = result.map(m => ({
    ...m,
    accountId: (m.accountId || accountId).replace(/^act_/, '')
  }));

  console.log('✨ Final metrics selected:', sanitizedResult.map(m => m.metricKey));

  return sanitizedResult;
}

/**
 * Build default widget layouts for an integration slide.
 * Uses fixed templates if available, otherwise creates metric cards and charts dynamically.
 */
export function buildDefaultWidgetsForIntegration(
  slideId: number,
  metrics: MetricOption[],
  integrationPlatform?: string,
  defaultAccountId?: string,
  subSlideIndex: number = 0
): DashboardLayout[] {
  if (!metrics.length && !integrationPlatform) return [];

  // Normalize platform key for template lookup - very aggressive to catch all naming variations
  const normalizedPlatform = integrationPlatform?.toLowerCase().trim().replace(/[ _-]/g, '');

  console.log(`🔍 [TemplateMatch] Trying to match: "${integrationPlatform}" -> normalized: "${normalizedPlatform}"`);

  // Try exact, then normalized, then hyphenated versions
  const template = normalizedPlatform ? (
    INTEGRATION_TEMPLATES[integrationPlatform || ''] ??
    INTEGRATION_TEMPLATES[normalizedPlatform] ??
    INTEGRATION_TEMPLATES[normalizedPlatform.replace(/(meta)(.+)/, '$1-$2')]
  ) : undefined;

  // If we have a template, use it
  if (template) {
    console.log(`📋 Using fixed template for ${normalizedPlatform}`);
    return buildWidgetsFromTemplate(slideId, template, metrics, integrationPlatform, defaultAccountId, subSlideIndex);
  }

  // Otherwise, fall back to dynamic generation
  console.log(`🔧 Using dynamic widget generation for ${integrationPlatform || 'unknown platform'}`);
  return buildDynamicWidgets(slideId, metrics);
}

/**
 * Build widgets from a fixed template
 */
export function buildWidgetsFromTemplate(
  slideId: number,
  template: IntegrationTemplate,
  availableMetrics: MetricOption[],
  integrationPlatform?: string,
  defaultAccountId?: string,
  subSlideIndex: number = 0
): DashboardLayout[] {
  const widgets: DashboardLayout[] = [];

  // If template has multiple slides, use the requested slide's widgets
  // (Multi-slide templates are handled at a higher level)
  const widgetTemplates = template.slides && template.slides.length > 0
    ? template.slides[subSlideIndex]?.widgets || []
    : template.widgets;

  // 🔍 DIAGNOSTIC: Log which slide we're building
  if (integrationPlatform?.toLowerCase().includes('business') && template.slides) {
    console.log(`📋 [WidgetBuilder] Building ${integrationPlatform} slide ${subSlideIndex}:`, {
      slideName: template.slides[subSlideIndex]?.name,
      widgetCount: widgetTemplates.length,
      slideId
    });
  }

  widgetTemplates.forEach((widgetTemplate, index) => {
    const id = generateWidgetId(`template-${index}`);

    // Find the metric option for this widget (if it's a metric-based widget)
    const metricOption = availableMetrics.find(m => m.metricKey === widgetTemplate.metricKey);

    // Use the first available metric's integration and accountId as fallback
    const fallbackMetric = availableMetrics[0];

    // Determine integration fallback from platform name if metrics are missing
    let integration = metricOption?.integration || fallbackMetric?.integration;
    if (!integration && integrationPlatform) {
      const p = integrationPlatform.toLowerCase();
      if (p.includes('instagram')) integration = 'meta-instagram';
      else if (p.includes('ads')) integration = 'meta-ads';
      else if (p.includes('facebook') || p.includes('business')) {
        // 🔧 FIX: For meta-business, check subSlideIndex to determine Facebook vs Instagram
        if (p.includes('business')) {
          // subSlideIndex 0 = Facebook, subSlideIndex 1 = Instagram
          integration = subSlideIndex === 1 ? 'meta-instagram' : 'meta-facebook';
          console.log(`🔧 [WidgetBuilder] Meta-business widget: subSlideIndex=${subSlideIndex} → integration=${integration}, metricKey=${widgetTemplate.metricKey}`);
        } else {
          integration = 'meta-facebook';
        }
      }
      else integration = 'meta';
    }
    if (!integration) integration = 'meta';

    let accountId = metricOption?.accountId || fallbackMetric?.accountId || defaultAccountId || '';
    // Strip act_ prefix for consistency
    accountId = accountId.replace(/^act_/, '');

    // Build widget data based on type
    let widgetData: WidgetData | undefined;

    if (widgetTemplate.type === 'metric') {
      widgetData = {
        label: widgetTemplate.displayName || prettifyMetricLabel(widgetTemplate.metricKey),
        value: 0,
        hideDataPoints: true,
      };
    } else if (widgetTemplate.type === 'chart') {
      widgetData = {
        chartType: widgetTemplate.chartType || 'column',
        title: widgetTemplate.displayName || prettifyMetricLabel(widgetTemplate.metricKey),
        ...(widgetTemplate.customConfig || {}),
      };
    } else if (widgetTemplate.type === 'table') {
      widgetData = {
        title: widgetTemplate.displayName || 'Table',
        caption: '',
        rows: [],
        columns: widgetTemplate.customConfig?.columns || DEFAULT_RECENT_POSTS_COLUMNS,
      };
    } else if (widgetTemplate.type === 'title') {
      widgetData = {
        text: widgetTemplate.displayName || 'Title',
        fontSize: '2xl',
        align: 'left',
        ...(widgetTemplate.customConfig || {}),
      };
    } else {
      widgetData = getDefaultWidgetData(widgetTemplate.type);
    }

    const widget: DashboardLayout = {
      i: id,
      x: widgetTemplate.x,
      y: widgetTemplate.y,
      w: widgetTemplate.w,
      h: widgetTemplate.h,
      widgetType: widgetTemplate.type,
      data: widgetData,
      metricConfig: {
        id,
        metricKey: widgetTemplate.metricKey,
        integration,
        accountId,
        groupBy: widgetTemplate.groupBy || (widgetTemplate.type === 'metric' ? 'none' : 'day'),
        aggregation: widgetTemplate.aggregation || 'sum',
        type: widgetTemplate.type === 'metric' ? 'metric_card' :
          widgetTemplate.type === 'chart' ? 'bar_chart' :
            widgetTemplate.type === 'table' ? 'table' : 'metric_card',
        displayName: widgetTemplate.displayName || prettifyMetricLabel(widgetTemplate.metricKey),
        layout: {
          slideId,
          x: widgetTemplate.x,
          y: widgetTemplate.y,
          w: widgetTemplate.w,
          h: widgetTemplate.h,
        },
      },
    };

    widgets.push(widget);
  });

  return widgets;
}

/**
 * Build widgets dynamically (original logic)
 */
export function buildDynamicWidgets(
  slideId: number,
  metrics: MetricOption[]
): DashboardLayout[] {
  if (!metrics.length) return [];

  const widgets: DashboardLayout[] = [];

  const addWidget = (
    type: ReportWidgetType,
    metric: MetricOption,
    indexInType: number,
    baseY: number = 0
  ) => {
    const id = generateWidgetId("auto");
    const isMetricCard = type === "metric";

    // Get proper label from metric displayName or metricKey
    const label = metric.displayName || prettifyMetricLabel(metric.metricKey);

    // Layout Logic for 12-col grid
    let x = 0;
    let y = baseY;
    let w = 4;
    let h = 4;

    if (isMetricCard) {
      // Metrics: 4 per row (w=3)
      w = 3;
      h = 3;
      x = (indexInType % 4) * 3;
      y = baseY + Math.floor(indexInType / 4) * 3;
    } else {
      // Charts: 2 per row (w=6) or full width (w=12)
      w = 6; // Default to half width for charts
      h = 5;
      x = (indexInType % 2) * 6;
      y = baseY + Math.floor(indexInType / 2) * 5;
    }

    const widget: DashboardLayout = {
      i: id,
      x,
      y,
      w,
      h,
      widgetType: type,
      data: isMetricCard
        ? { label, value: 0, hideDataPoints: true }  // Use proper label for metric cards
        : { chartType: "column", title: label },  // Use proper title for charts
      metricConfig: {
        id,
        metricKey: metric.metricKey,
        integration: metric.integration,
        accountId: metric.accountId,
        groupBy: isMetricCard ? "none" : "day",
        aggregation: "sum",
        type: isMetricCard ? "metric_card" : "bar_chart",
        displayName: label,
        layout: {
          slideId,
          x,
          y,
          w,
          h,
        },
        ...(metric.filters ? { filters: metric.filters } : {}),
      },
    };
    widgets.push(widget);
    return widget; // Return for sizing ref
  };

  // 1. Add top 4 metrics as cards in the first row
  let currentY = 0;
  const metricCards = metrics.slice(0, 4);
  metricCards.forEach((m, idx) => addWidget("metric", m, idx, currentY));

  // Advance Y for next section (if metrics were added)
  if (metricCards.length > 0) {
    currentY += 3; // Metrics are h=3
  }

  // 2. Add first metric as a main chart
  if (metrics[0]) {
    const chartWidget = addWidget("chart", metrics[0], 0, currentY);
    // Make first chart full width
    chartWidget.w = 12;
    chartWidget.h = 8;
    // Don't need to update x/y as it's the first in this row/section
    currentY += 8;
  }



  return widgets.slice(0, MAX_DEFAULT_WIDGETS);
}
