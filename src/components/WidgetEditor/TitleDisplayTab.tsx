import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import type { TitleWidgetData } from "../widgetTypes";

interface TitleDisplayTabProps {
    data?: TitleWidgetData;
    onChange: (updates: Partial<TitleWidgetData>) => void;
}

export function TitleDisplayTab({ data, onChange }: TitleDisplayTabProps) {
    return (
        <div className="space-y-5 py-4">
            {/* Title */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">Title</Label>
                <Input
                    value={data?.text || ""}
                    onChange={(e) => onChange({ text: e.target.value })}
                    placeholder="Enter title"
                />
            </div>

            {/* Style */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">Style</Label>
                <Select
                    value={data?.fontSize || "2xl"}
                    onValueChange={(value) => onChange({ fontSize: value })}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="xs">Extra Small</SelectItem>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="base">Base</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                        <SelectItem value="xl">Extra Large</SelectItem>
                        <SelectItem value="2xl">2X Large</SelectItem>
                        <SelectItem value="3xl">3X Large</SelectItem>
                        <SelectItem value="4xl">4X Large</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Align Text */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">Align Text</Label>
                <Select
                    value={data?.align || "center"}
                    onValueChange={(value) => onChange({ align: value as "left" | "center" | "right" })}
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

            {/* Wrap Text */}
            <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-600">Wrap Text</Label>
                <Switch />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="block text-xs text-gray-600 mb-2">Text Color</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            value={data?.color || "#000000"}
                            onChange={(e) => onChange({ color: e.target.value })}
                            className="h-8 w-10 p-0 border-none"
                        />
                        <Input
                            value={data?.color || "#000000"}
                            onChange={(e) => onChange({ color: e.target.value })}
                            placeholder="#000000"
                            className="h-8 text-xs"
                            maxLength={7}
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
                            className="h-8 text-xs"
                            maxLength={7}
                        />
                    </div>
                </div>
            </div>

            {/* Padding */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">Padding</Label>
                <Select
                    value={data?.padding || "16px"}
                    onValueChange={(value) => onChange({ padding: value })}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0px">None</SelectItem>
                        <SelectItem value="8px">Small (8px)</SelectItem>
                        <SelectItem value="16px">Medium (16px)</SelectItem>
                        <SelectItem value="24px">Large (24px)</SelectItem>
                        <SelectItem value="32px">Extra Large (32px)</SelectItem>
                        <SelectItem value="48px">2X Large (48px)</SelectItem>
                        <SelectItem value="16px 32px">Vertical 16px, Horizontal 32px</SelectItem>
                        <SelectItem value="32px 64px">Vertical 32px, Horizontal 64px</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
