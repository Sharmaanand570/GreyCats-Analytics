import React from "react";

type SlideContainerProps = {
  title: string;
  containerRef: (el: HTMLDivElement | null) => void;
  children: React.ReactNode;
  id?: string;
  dateRange?: string;
};

export default function SlideContainer({ title, containerRef, children, id, dateRange }: SlideContainerProps) {
  return (
    <div
      id={id}
      ref={containerRef}
      className="w-full md:w-[95%] lg:w-[90%] h-auto my-4 md:my-6 lg:my-10 shadow pb-6 md:pb-8 lg:pb-10 rounded-xl md:rounded-2xl bg-white"
    >
      <div className="p-3 md:p-4 mb-3 md:mb-4">
        <h1 className="text-base md:text-lg font-semibold text-gray-800">
          {title}
        </h1>
        {dateRange && (
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            {dateRange}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
