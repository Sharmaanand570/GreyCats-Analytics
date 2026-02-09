import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { MetricWidgetData } from "../widgetTypes";
import type { ReportWidgetDefinition } from "../../features/reports/api/types";

interface MetricDataTabProps {
    data?: MetricWidgetData;
    onChange: (updates: Partial<MetricWidgetData>) => void;
    isIntegration?: boolean;
    metricConfig?: ReportWidgetDefinition;
}

export function MetricDataTab({
    data,
    onChange,
    isIntegration,
    metricConfig,
}: MetricDataTabProps) {
    return (
        <div className="space-y-5 py-4">
            {/* Metric Info (Read-only) */}
            {isIntegration && metricConfig && (
                <div className="p-3 bg-gray-50 rounded-md border text-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Metric Key:</span>
                        <span className="font-mono text-gray-700 truncate max-w-[150px]" title={metricConfig.metricKey}>
                            {metricConfig.metricKey}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Integration:</span>
                        <span className="text-gray-700">{metricConfig.integration}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Aggregation:</span>
                        <span className="text-gray-700 capitalize">{metricConfig.aggregation || 'Sum'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Group By:</span>
                        <span className="text-gray-700 capitalize">{metricConfig.groupBy || 'None'}</span>
                    </div>
                </div>
            )}

            {/* Manual Data Inputs */}
            {!isIntegration && (
                <>
                    <div>
                        <Label className="block text-xs text-gray-600 mb-2">
                            Comparison Value (Previous Period)
                        </Label>
                        <Input
                            value={data?.comparisonValue ?? ""}
                            onChange={(e) => onChange({ comparisonValue: e.target.value })}
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
                                onChange={(e) => onChange({ trendValue: e.target.value })}
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
                                    onChange({
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
                </>
            )}
        </div>
    );
}
