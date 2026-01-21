import React from "react";
import { MdDragIndicator } from "react-icons/md";
import { FiTrash2 } from "react-icons/fi";
import type { DashboardLayout } from "../pages/ReportBuilder";
import { prettifyMetricLabel } from "@/utils/labelUtils";

type WidgetCardProps = {
  widget: DashboardLayout;
  resolvedData?: any;
  onContentClick: (widget: DashboardLayout) => void;
  onDelete?: (widget: DashboardLayout) => void;
  children: React.ReactNode;
  readOnly?: boolean;
};

export default function WidgetCard({
  widget,
  resolvedData,
  onContentClick,
  onDelete,
  children,
  readOnly
}: WidgetCardProps) {
  // Only hide borders and headers for title, image, and custom (text) widgets
  // OR if we are in read-only mode, we might want a cleaner look (or keep borders?)
  // For now keeping borders but disabling interaction.
  const shouldHideBorder = widget.widgetType === 'title' || widget.widgetType === 'image' || widget.widgetType === 'custom';

  return (
    <div
      className={`group rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] overflow-hidden h-full transition-all duration-300 hover:-translate-y-0.5 ${shouldHideBorder
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
        <span className="text-sm font-semibold text-gray-700 leading-normal truncate flex-1 py-0.5">
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
        className={`non-draggable p-1 flex-1 min-h-0 overflow-hidden flex flex-col ${readOnly ? 'pointer-events-none' : ''}`}
        onClick={(e) => {
          if (readOnly) return;
          e.stopPropagation();
          onContentClick(widget);
        }}
      >
        {children}
      </div>
    </div >
  );
}
