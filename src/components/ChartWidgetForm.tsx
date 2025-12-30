import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import { Switch } from "./ui/switch";
import type { ChartWidgetData } from "./widgetTypes";

interface ChartWidgetFormProps {
  data?: ChartWidgetData;
  onChange?: (data: ChartWidgetData) => void;
}

function ChartWidgetForm({ data, onChange }: ChartWidgetFormProps): React.JSX.Element {
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
            value={data?.title || ""}
            onChange={(e) => handleChange({ title: e.target.value })}
            placeholder="Chart title"
          />
        </div>

        {/* Tooltip */}
        <div className="mb-5">
          <Label className="block text-xs text-gray-600 mb-2">Tooltip</Label>
          <Input
            placeholder="The number of times people have enga"
            className="placeholder:text-gray-400"
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

        {/* Override Date Range */}
        <div className="mb-8">
          <Label className="block text-xs text-gray-600 mb-2">
            Override Date Range
          </Label>
          <Switch />
        </div>
      </div>
    </div>
  );
}

export default ChartWidgetForm;


