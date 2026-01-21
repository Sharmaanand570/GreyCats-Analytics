import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";


import type { ChartWidgetData } from "./widgetTypes";
import type { ReportWidgetDefinition } from "../features/reports/api/types";
import type { ReportWidgetType } from "./reportTypes";

interface ChartWidgetFormProps {
  data?: ChartWidgetData;
  onChange?: (data: ChartWidgetData) => void;
  isIntegration?: boolean;
  metricConfig?: ReportWidgetDefinition;
  onTypeChange?: (type: ReportWidgetType) => void;
}

function ChartWidgetForm({ data, onChange, isIntegration, metricConfig, onTypeChange }: ChartWidgetFormProps): React.JSX.Element {
  const handleChange = (updates: Partial<ChartWidgetData>) => {
    if (onChange) {
      onChange({ ...data, ...updates } as ChartWidgetData);
    }
  };
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full p-4 border-b font-semibold text-accent-foreground">
        Edit Widget
      </div>

      <div className="w-full px-4">
        {/* Widget Type Selector */}
        {onTypeChange && (
          <div>
            <Label className="block text-xs text-gray-600 mb-2 mt-4">Display As</Label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => onTypeChange('metric')}
                className={`h-9 rounded-md border flex items-center justify-center gap-2 text-xs font-medium border-gray-200 hover:bg-gray-50 text-gray-600`}
                type="button"
              >
                Number
              </button>
              <button
                onClick={() => onTypeChange('chart')}
                className={`h-9 rounded-md border flex items-center justify-center gap-2 text-xs font-medium border-blue-500 ring-1 ring-blue-500 bg-blue-50 text-blue-700`}
                type="button"
              >
                Chart
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 text-sm mt-4 mb-6">
          <button className="border-b-2 border-black pb-1 font-medium">
            General
          </button>

        </div>

        {/* Title */}
        <div className="mb-5">
          <Label className="block text-xs text-gray-600 mb-2">Title</Label>
          <Input
            value={data?.title || (metricConfig?.displayName || "")}
            onChange={(e) => handleChange({ title: e.target.value })}
            placeholder={isIntegration ? "Override chart title" : "Chart title"}
          />
        </div>



        {/* Chart Type */}
        <div className="mb-6">
          <Label className="block text-xs text-gray-600 mb-2">Chart Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Column",
              "Line",
              "Pie",
            ].map((label) => {
              const isSelected = data?.chartType?.toLowerCase() === label.toLowerCase();
              return (
                <button
                  key={label}
                  onClick={() => handleChange({ chartType: label.toLowerCase() })}
                  className={`h-12 rounded-md border flex items-center justify-center gap-2 text-sm ${isSelected ? "border-blue-500 ring-1 ring-blue-500" : ""
                    }`}
                  type="button"
                >
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>


        {/* Colors */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div>
            <Label className="block text-xs text-gray-600 mb-2">Background</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={data?.backgroundColor || "#ffffff"}
                onChange={(e) => handleChange({ backgroundColor: e.target.value })}
                className="h-8 w-10 p-0 border-none"
              />
              <Input
                value={data?.backgroundColor || "#ffffff"}
                onChange={(e) => handleChange({ backgroundColor: e.target.value })}
                placeholder="#ffffff"
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div>
            <Label className="block text-xs text-gray-600 mb-2">Chart Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={data?.chartColor || "#2563eb"}
                onChange={(e) => handleChange({ chartColor: e.target.value })}
                className="h-8 w-10 p-0 border-none"
              />
              <Input
                value={data?.chartColor || "#2563eb"}
                onChange={(e) => handleChange({ chartColor: e.target.value })}
                placeholder="#2563eb"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ChartWidgetForm;


