import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import type { CustomWidgetData } from "../widgetTypes";

interface CustomDisplayTabProps {
    data?: CustomWidgetData;
    onChange: (updates: Partial<CustomWidgetData>) => void;
}

export function CustomDisplayTab({ data, onChange }: CustomDisplayTabProps) {
    const isToc = (data?.type ?? "").toLowerCase() === "toc";

    return (
        <div className="space-y-5 py-4">
            {/* Title (Standard only) */}
            {!isToc && (
                <div>
                    <Label className="block text-xs text-gray-600 mb-2">Title (optional)</Label>
                    <Input
                        value={data?.title || ""}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder="Section heading"
                    />
                </div>
            )}

            {/* Alignment (Standard only) */}
            {!isToc && (
                <div>
                    <Label className="block text-xs text-gray-600 mb-2">Align Text</Label>
                    <Select
                        value={data?.align || "left"}
                        onValueChange={(value) => onChange({ align: value as CustomWidgetData["align"] })}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Font Style */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="block text-xs text-gray-600 mb-2">Font Size</Label>
                    <Select
                        value={data?.fontSize || (isToc ? "text-sm" : "text-sm")}
                        onValueChange={(value) => onChange({ fontSize: value })}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text-xs">Extra Small</SelectItem>
                            <SelectItem value="text-sm">Small</SelectItem>
                            <SelectItem value="text-base">Medium</SelectItem>
                            <SelectItem value="text-lg">Large</SelectItem>
                            <SelectItem value="text-xl">Extra Large</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="block text-xs text-gray-600 mb-2">Font Weight</Label>
                    <Select
                        value={data?.fontWeight || "font-normal"}
                        onValueChange={(value) => onChange({ fontWeight: value })}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="font-light">Light</SelectItem>
                            <SelectItem value="font-normal">Normal</SelectItem>
                            <SelectItem value="font-medium">Medium</SelectItem>
                            <SelectItem value="font-semibold">Semi Bold</SelectItem>
                            <SelectItem value="font-bold">Bold</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Colors (Standard only) */}
            {!isToc && (
                <div className="grid grid-cols-2 gap-3">
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
                                className="h-8 text-xs font-mono"
                            />
                        </div>
                    </div>
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
                                className="h-8 text-xs font-mono"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
