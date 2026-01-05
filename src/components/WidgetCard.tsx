import React from "react";
import { MdDragIndicator } from "react-icons/md";
import { FiTrash2 } from "react-icons/fi";
import type { DashboardLayout } from "../pages/ReportBuilder";

type WidgetCardProps = {
  widget: DashboardLayout;
  onContentClick: (widget: DashboardLayout) => void;
  onDelete?: (widget: DashboardLayout) => void;
  children: React.ReactNode;
};

export default function WidgetCard({
  widget,
  onContentClick,
  onDelete,
  children,
}: WidgetCardProps) {
  // Only hide borders and headers for title, image, and custom (text) widgets
  const shouldHideBorder = widget.widgetType === 'title' || widget.widgetType === 'image' || widget.widgetType === 'custom';

  return (
    <div
      className={`group rounded-lg md:rounded-xl shadow-sm overflow-hidden h-full transition-all duration-200 ${shouldHideBorder
        ? 'border border-transparent hover:border-gray-200'
        : 'border border-gray-200'
        }`}
      style={{ position: "relative", zIndex: 1 }}
    >
      <div
        className={`drag-handle cursor-grab active:cursor-grabbing flex items-center justify-between px-2 md:px-3 py-1.5 md:py-2 transition-all duration-200 ${shouldHideBorder
          ? 'bg-transparent group-hover:bg-gray-50 border-b border-transparent group-hover:border-gray-200 opacity-0 group-hover:opacity-100'
          : 'bg-gray-50 border-b border-gray-200'
          }`}
        aria-label="Drag widget to reposition"
      >
        <span className="text-xs md:text-sm font-medium text-gray-600">
          {((widget.data as any)?.label || (widget.data as any)?.title || widget.widgetType).toUpperCase()}
        </span>
        <div className="flex items-center gap-1">
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
      </div>

      <div
        className="non-draggable p-1 h-full overflow-hidden flex flex-col"
        onClick={(e) => {
          e.stopPropagation();
          onContentClick(widget);
        }}
      >
        {children}
      </div>
    </div>
  );
}
