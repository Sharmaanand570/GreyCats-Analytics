import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
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

        <div>
          <Label className="block text-xs text-gray-600 mb-2">
            Comparison Value (Previous Period)
          </Label>
          <Input
            value={data?.comparisonValue ?? ""}
            onChange={(e) => handleChange({ comparisonValue: e.target.value })}
            placeholder="e.g. 10500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="block text-xs text-gray-600 mb-2">
              Trend %
            </Label>
            <Input
              value={data?.trendValue ?? ""}
              onChange={(e) => handleChange({ trendValue: e.target.value })}
              placeholder="e.g. 12%"
            />
          </div>
          <div>
            <Label className="block text-xs text-gray-600 mb-2">
              Trend Direction
            </Label>
            <select
              className="w-full text-xs border rounded-md h-9 px-2"
              value={data?.trendDirection ?? "neutral"}
              onChange={(e) =>
                handleChange({
                  trendDirection: e.target.value as "up" | "down" | "neutral",
                })
              }
            >
              <option value="neutral">Neutral (-)</option>
              <option value="up">Up (Green)</option>
              <option value="down">Down (Red)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="block text-xs text-gray-600">
            Hide "Data Points" count
          </Label>
          <Switch
            checked={data?.hideDataPoints ?? false}
            onChange={(e) => handleChange({ hideDataPoints: e.target.checked })}
          />
        </div>
      </div>
    </div>
  );
}

export default MetricWidgetForm;


