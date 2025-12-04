import React from "react";
import { MdDragIndicator } from "react-icons/md";
import { type ReportWidgetType } from "./reportTypes";

type WidgetDragItemProps = {
  title: string;
  description: string;
  type: ReportWidgetType;
  customKind?: string;
  onDragStart: (
    e: React.DragEvent<HTMLDivElement>,
    type: ReportWidgetType,
    customKind?: string
  ) => void;
};

export default function WidgetDragItem({
  title,
  description,
  type,
  customKind,
  onDragStart,
}: WidgetDragItemProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, type, customKind)}
      role="button"
      tabIndex={0}
      aria-label={`Drag ${title} widget`}
      className="w-full cursor-grab active:cursor-grabbing flex items-center py-2 md:py-3 lg:py-4 border-b hover:bg-gray-50 transition-colors"
    >
      <div className="p-1.5 md:p-2 text-gray-500">
        <MdDragIndicator className="text-base md:text-lg" />
      </div>
      <div className="flex flex-col gap-0.5 md:gap-1 min-w-0 flex-1">
        <span className="font-medium text-xs md:text-sm truncate">
          {title}
        </span>
        <span className="text-[10px] md:text-xs text-gray-400 line-clamp-2">
          {description}
        </span>
      </div>
    </div>
  );
}

