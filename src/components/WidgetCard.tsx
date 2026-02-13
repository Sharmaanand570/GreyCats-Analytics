import React from "react";
import { MdDragIndicator } from "react-icons/md";
import { FiTrash2 } from "react-icons/fi";
import type { DashboardLayout } from "@/features/reports/api/types";
import { prettifyMetricLabel } from "@/utils/labelUtils";
import { FaFacebook, FaInstagram, FaGoogle, FaShopify, FaYoutube, FaChartLine } from "react-icons/fa";
import { SiGoogleanalytics, SiGooglesearchconsole, SiWoo } from "react-icons/si";

type WidgetCardProps = {
  widget: DashboardLayout;
  resolvedData?: any;
  onContentClick: (widget: DashboardLayout) => void;
  onDelete?: (widget: DashboardLayout) => void;
  children: React.ReactNode;
  readOnly?: boolean;
  isRefetching?: boolean;
};

const getIntegrationIcon = (integration?: string, metricKey?: string, label?: string) => {
  const normIntegration = (integration || "").toLowerCase().replace(/[ _]/g, "-");
  const normKey = (metricKey || "").toLowerCase();
  const normLabel = (label || "").toLowerCase();

  // 1. Explicit Metric/Label overrides (High precision)
  if (normKey.includes("instagram") || normLabel.includes("instagram")) return <FaInstagram className="text-pink-600" />;
  if (normKey.includes("facebook") || normLabel.includes("facebook")) return <FaFacebook className="text-blue-600" />;

  // 2. Integration Name checks
  if (normIntegration.includes("instagram")) return <FaInstagram className="text-pink-600" />;
  if (normIntegration.includes("facebook") || normIntegration.includes("meta-social")) return <FaFacebook className="text-blue-600" />;

  if (normIntegration.includes("google-analytics") || normIntegration.includes("google_analytics")) return <SiGoogleanalytics className="text-orange-500" />;
  if (normIntegration.includes("google-search-console") || normIntegration.includes("google_search_console")) return <SiGooglesearchconsole className="text-blue-500" />;
  if (normIntegration.includes("google-console")) return <FaGoogle className="text-blue-500" />; // Fallback for generic google
  if (normIntegration.includes("youtube")) return <FaYoutube className="text-red-600" />;
  if (normIntegration.includes("shopify")) return <FaShopify className="text-green-600" />;
  if (normIntegration.includes("woo")) return <SiWoo className="text-purple-600" />;

  // 3. Meta Fallback (Lowest priority)
  if (normIntegration.includes("meta")) return <FaFacebook className="text-blue-600" />;

  return <FaChartLine className="text-gray-400" />; // Default icon
};

export default function WidgetCard({
  widget,
  resolvedData,
  onContentClick,
  onDelete,
  children,
  readOnly,
  isRefetching
}: WidgetCardProps) {
  // Only hide borders and headers for title, image, and custom (text) widgets
  // OR if we are in read-only mode, we might want a cleaner look (or keep borders?)
  // For now keeping borders but disabling interaction.
  const shouldHideBorder = widget.widgetType === 'title' || widget.widgetType === 'image' || widget.widgetType === 'custom';

  // Extract integration from metricConfig or try to find it in other places if structure varies
  const integration = widget.metricConfig?.integration || (widget as any).integration || (widget as any).config?.integration;

  return (
    <div
      className={`group rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] overflow-hidden h-full transition-all duration-300 hover:border-gray-300 ${shouldHideBorder
        ? 'border border-transparent'
        : 'border border-gray-100'
        } flex flex-col ${readOnly ? 'cursor-default' : ''}`}
      style={{
        position: "relative",
        zIndex: 1,
        backgroundColor: (widget.data as any)?.backgroundColor || (shouldHideBorder ? "transparent" : "#ffffff"),
        color: (widget.data as any)?.textColor || "inherit"
      }}
    >
      <div
        className={`drag-handle flex items-center justify-between relative px-4 py-3 md:py-4 transition-all duration-200 ${shouldHideBorder
          ? 'bg-transparent border-b border-transparent opacity-0 ' + (readOnly ? '' : 'group-hover:opacity-100 group-hover:bg-white group-hover:border-gray-50')
          : 'bg-white border-b border-transparent'
          } ${readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        aria-label="Widget header"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {!shouldHideBorder && integration && (
            <div className="shrink-0 text-lg">
              {getIntegrationIcon(
                integration,
                widget.metricConfig?.metricKey || (widget as any).data?.metricKey,
                (widget.data as any)?.label || widget.metricConfig?.displayName || (widget as any).displayName || (widget as any).title
              )}
            </div>
          )}
          <span className="text-sm font-semibold text-gray-700 leading-normal truncate py-0.5">
            {prettifyMetricLabel(
              (widget.data as any)?.label && (widget.data as any).label !== "Metric" ? (widget.data as any).label :
                widget.metricConfig?.displayName ||
                (widget as any).displayName ||
                (widget as any).title ||
                widget.metricConfig?.metricKey ||
                resolvedData?.metricLabel ||
                resolvedData?.label ||
                resolvedData?.displayName ||
                resolvedData?.title ||
                (widget.data as any)?.label ||
                (widget.data as any)?.displayName ||
                (widget.data as any)?.title ||
                widget.widgetType
            )}
          </span>
        </div>

        {!readOnly && (
          <div className="absolute right-2 md:right-3 flex items-center gap-1">
            {onDelete && (
              <button
                type="button"
                className="non-draggable p-1 rounded hover:bg-red-50 text-red-500 focus:outline-none focus:ring-1 focus:ring-red-400"
                aria-label="Remove widget"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(widget);
                }}
              >
                <FiTrash2 className="text-xs md:text-sm" />
              </button>
            )}
            <MdDragIndicator className="text-gray-400 text-base md:text-lg" />
          </div>
        )}
      </div>

      <div
        className={`non-draggable p-1 flex-1 min-h-0 overflow-hidden flex flex-col relative ${readOnly ? 'pointer-events-none' : ''}`}
        onClick={(e) => {
          if (readOnly) return;
          e.stopPropagation();
          onContentClick(widget);
        }}
      >
        {children}
        {isRefetching && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity duration-300">
            <div className="flex flex-col items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs text-gray-400 font-medium">Updating...</span>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}
