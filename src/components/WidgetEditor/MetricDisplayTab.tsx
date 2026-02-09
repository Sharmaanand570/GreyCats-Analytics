import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { MetricWidgetData } from "../widgetTypes";

interface MetricDisplayTabProps {
    data?: MetricWidgetData;
    onChange: (updates: Partial<MetricWidgetData>) => void;
    isIntegration?: boolean;
}

export function MetricDisplayTab({
    data,
    onChange,
    isIntegration,
}: MetricDisplayTabProps) {
    return (
        <div className="space-y-5 py-4">
            {/* Sparkline Toggle (Integration Only) */}
            {isIntegration && (
                <>
                    <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                        <input
                            type="checkbox"
                            id="showSparkline"
                            checked={data?.showSparkline ?? true}
                            onChange={(e) => onChange({ showSparkline: e.target.checked })}
                            className="h-4 w-4 text-blue-600 rounded"
                        />
                        <Label htmlFor="showSparkline" className="text-xs text-gray-700 cursor-pointer">
                            Show mini chart (sparkline)
                        </Label>
                    </div>
                    <p className="text-[10px] text-gray-500 px-1">
                        Displays a sparkline chart below the main metric value.
                    </p>
                </>
            )}

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="block text-xs text-gray-600 mb-2">Background</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            value={data?.backgroundColor || "#ffffff"}
                            onChange={(e) => onChange({ backgroundColor: e.target.value })}
                            className="h-8 w-10 p-0 border-none"
                        />
                        <Input
                            value={data?.backgroundColor || "#ffffff"}
                            onChange={(e) => onChange({ backgroundColor: e.target.value })}
                            placeholder="#ffffff"
                            className="h-8 text-xs"
                            maxLength={7}
                        />
                    </div>
                </div>
                <div>
                    <Label className="block text-xs text-gray-600 mb-2">Text Color</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            value={data?.textColor || "#000000"}
                            onChange={(e) => onChange({ textColor: e.target.value })}
                            className="h-8 w-10 p-0 border-none"
                        />
                        <Input
                            value={data?.textColor || "#000000"}
                            onChange={(e) => onChange({ textColor: e.target.value })}
                            placeholder="#000000"
                            className="h-8 text-xs"
                            maxLength={7}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
