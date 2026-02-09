import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { ChartWidgetData } from "../widgetTypes";

interface ChartDisplayTabProps {
    data?: ChartWidgetData;
    onChange: (updates: Partial<ChartWidgetData>) => void;
}

export function ChartDisplayTab({
    data,
    onChange,
}: ChartDisplayTabProps) {
    return (
        <div className="space-y-5 py-4">
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
                    <Label className="block text-xs text-gray-600 mb-2">Chart Color</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            value={data?.chartColor || "#2563eb"}
                            onChange={(e) => onChange({ chartColor: e.target.value })}
                            className="h-8 w-10 p-0 border-none"
                        />
                        <Input
                            value={data?.chartColor || "#2563eb"}
                            onChange={(e) => onChange({ chartColor: e.target.value })}
                            placeholder="#2563eb"
                            className="h-8 text-xs"
                            maxLength={7}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
