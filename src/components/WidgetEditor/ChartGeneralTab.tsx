import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { ChartWidgetData } from "../widgetTypes";
import type { ReportWidgetDefinition } from "../../features/reports/api/types";
import type { ReportWidgetType } from "../reportTypes";

interface ChartGeneralTabProps {
    data?: ChartWidgetData;
    onChange: (updates: Partial<ChartWidgetData>) => void;
    isIntegration?: boolean;
    metricConfig?: ReportWidgetDefinition;
    onTypeChange?: (type: ReportWidgetType) => void;
}

export function ChartGeneralTab({
    data,
    onChange,
    isIntegration,
    metricConfig,
    onTypeChange,
}: ChartGeneralTabProps) {
    return (
        <div className="space-y-5 py-4">
            {/* Widget Type Selector */}
            {onTypeChange && (
                <div>
                    <Label className="block text-xs text-gray-600 mb-2">Display As</Label>
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

            {/* Title */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">Title</Label>
                <Input
                    value={data?.title || (metricConfig?.displayName || "")}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder={isIntegration ? "Override chart title" : "Chart title"}
                />
            </div>

            {/* Chart Type */}
            <div>
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
                                onClick={() => onChange({ chartType: label.toLowerCase() })}
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
        </div>
    );
}
