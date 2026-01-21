import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import type { MetricWidgetData } from "./widgetTypes";

import type { ReportWidgetDefinition } from "../features/reports/api/types";

import type { ReportWidgetType } from "./reportTypes";

interface MetricWidgetFormProps {
  data?: MetricWidgetData;
  onChange?: (data: MetricWidgetData) => void;
  isIntegration?: boolean;
  metricConfig?: ReportWidgetDefinition;
  onTypeChange?: (type: ReportWidgetType) => void;
}

function MetricWidgetForm({
  data,
  onChange,
  isIntegration,
  metricConfig,
  onTypeChange,
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
        {/* Widget Type Selector */}
        {onTypeChange && (
          <div>
            <Label className="block text-xs text-gray-600 mb-2">Display As</Label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => onTypeChange('metric')}
                className={`h-9 rounded-md border flex items-center justify-center gap-2 text-xs font-medium border-blue-500 ring-1 ring-blue-500 bg-blue-50 text-blue-700`}
                type="button"
              >
                Number
              </button>
              <button
                onClick={() => onTypeChange('chart')}
                className={`h-9 rounded-md border flex items-center justify-center gap-2 text-xs font-medium border-gray-200 hover:bg-gray-50 text-gray-600`}
                type="button"
              >
                Chart
              </button>
            </div>
          </div>
        )}

        {/* Only show Label edit if it's NOT an integration metric OR if user wants to override it? 
            Usually integration/metricKey based widgets have auto labels, but user might want to rename.
            Let's keep Label visible but maybe note it overrides.
        */}
        <div>
          <Label className="block text-xs text-gray-600 mb-2">
            Label
          </Label>
          <Input
            value={(data?.label && data.label !== "Metric") ? data.label : (metricConfig?.displayName || data?.label || "")}
            onChange={(e) => handleChange({ label: e.target.value })}
            placeholder={isIntegration ? "Override label (optional)" : "e.g. Total Revenue"}
          />
        </div>

        {/* Hide VALUE input for integration metrics as it comes from API */}
        {!isIntegration && (
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
        )}

        {/* Unit is useful for both */}
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

        {/* Comparison Value - usually manual for 'Stat' widgets, but maybe useful to override? 
            For now, keeping it but maybe hide for integration if we start fetching comparison automatically later.
        */}
        {!isIntegration && (
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
        )}

        {/* Trend - usually calculated for integration, manual for Stat. 
            If integration, maybe hide manual trend override or keep it as override? 
            Let's hide it for integration to reduce clutter unless requested. 
        */}
        {!isIntegration && (
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
        )}


        {/* Background & Text Color */}
        <div className="grid grid-cols-2 gap-3">
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
            <Label className="block text-xs text-gray-600 mb-2">Text Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={data?.textColor || "#000000"}
                onChange={(e) => handleChange({ textColor: e.target.value })}
                className="h-8 w-10 p-0 border-none"
              />
              <Input
                value={data?.textColor || "#000000"}
                onChange={(e) => handleChange({ textColor: e.target.value })}
                placeholder="#000000"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MetricWidgetForm;


