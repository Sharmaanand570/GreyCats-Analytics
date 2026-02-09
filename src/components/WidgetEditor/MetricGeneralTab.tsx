import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { MetricWidgetData } from "../widgetTypes";
import type { ReportWidgetDefinition } from "../../features/reports/api/types";
import type { ReportWidgetType } from "../reportTypes";

interface MetricGeneralTabProps {
    data?: MetricWidgetData;
    onChange: (updates: Partial<MetricWidgetData>) => void;
    isIntegration?: boolean;
    metricConfig?: ReportWidgetDefinition;
    onTypeChange?: (type: ReportWidgetType) => void;
}

export function MetricGeneralTab({
    data,
    onChange,
    isIntegration,
    metricConfig,
    onTypeChange,
}: MetricGeneralTabProps) {
    return (
        <div className="space-y-5 py-4">
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

            {/* Label */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">
                    Label
                </Label>
                <Input
                    value={(data?.label && data.label !== "Metric") ? data.label : (metricConfig?.displayName || data?.label || "")}
                    onChange={(e) => onChange({ label: e.target.value })}
                    placeholder={isIntegration ? "Override label (optional)" : "e.g. Total Revenue"}
                />
            </div>

            {/* Value (Manual Only) */}
            {!isIntegration && (
                <div>
                    <Label className="block text-xs text-gray-600 mb-2">
                        Value
                    </Label>
                    <Input
                        type="text"
                        value={String(data?.value ?? "")}
                        onChange={(e) => onChange({ value: e.target.value })}
                        placeholder="e.g. 12000"
                    />
                </div>
            )}

            {/* Unit */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">
                    Unit (optional)
                </Label>
                <Input
                    value={data?.unit ?? ""}
                    onChange={(e) => onChange({ unit: e.target.value })}
                    placeholder="e.g. USD, %, orders"
                />
            </div>
        </div>
    );
}
