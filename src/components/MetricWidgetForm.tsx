import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import type { MetricWidgetData } from "./widgetTypes";

interface MetricWidgetFormProps {
  data?: MetricWidgetData;
  onChange?: (data: MetricWidgetData) => void;
}

function MetricWidgetForm({
  data,
  onChange,
}: MetricWidgetFormProps): React.JSX.Element {
  const handleChange = (updates: Partial<MetricWidgetData>) => {
    if (onChange) {
      onChange({ ...data, ...updates } as MetricWidgetData);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full p-4 border-b font-semibold text-accent-foreground">
        Edit Stat
      </div>

      <div className="w-full px-4 py-4 space-y-5">
        <div>
          <Label className="block text-xs text-gray-600 mb-2">
            Label
          </Label>
          <Input
            value={data?.label ?? ""}
            onChange={(e) => handleChange({ label: e.target.value })}
            placeholder="e.g. Total Revenue"
          />
        </div>

        <div>
          <Label className="block text-xs text-gray-600 mb-2">
            Value
          </Label>
          <Input
            type="text"
            value={String(data?.value ?? "")}
            onChange={(e) => handleChange({ value: e.target.value })}
            placeholder="e.g. 12000"
          />
        </div>

        <div>
          <Label className="block text-xs text-gray-600 mb-2">
            Unit (optional)
          </Label>
          <Input
            value={data?.unit ?? ""}
            onChange={(e) => handleChange({ unit: e.target.value })}
            placeholder="e.g. USD, %, orders"
          />
        </div>
      </div>
    </div>
  );
}

export default MetricWidgetForm;


