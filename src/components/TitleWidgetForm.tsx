import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import type { TitleWidgetData } from "./widgetTypes";

interface TitleWidgetFormProps {
  data?: TitleWidgetData;
  onChange?: (data: TitleWidgetData) => void;
}

function TitleWidgetForm({ data, onChange }: TitleWidgetFormProps): React.JSX.Element {
  const handleChange = (updates: Partial<TitleWidgetData>) => {
    if (onChange) {
      onChange({ ...data, ...updates } as TitleWidgetData);
    }
  };
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full p-4 border-b font-semibold text-accent-foreground">
        Edit Widget
      </div>

      <div className="w-full px-4">
        {/* Tabs placeholder (only Display tab active) */}
        <div className="flex gap-4 text-sm mt-4 mb-6">
          <button className="border-b-2 border-black pb-1 font-medium">
            Display
          </button>
        </div>


        {/* Title */}
        <div className="mb-5">
          <Label className="block text-xs text-gray-600 mb-2">Title</Label>
          <Input
            value={data?.text || ""}
            onChange={(e) => handleChange({ text: e.target.value })}
            placeholder="Enter title"
          />
        </div>

        {/* Style */}
        <div className="mb-5">
          <Label className="block text-xs text-gray-600 mb-2">Style</Label>
          <div className="flex gap-3">
            <Select
              value={data?.fontSize || "2xl"}
              onValueChange={(value) => handleChange({ fontSize: value })}
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
        </div>

        {/* Align Text */}
        <div className="mb-5">
          <Label className="block text-xs text-gray-600 mb-2">Align Text</Label>
          <Select
            value={data?.align || "center"}
            onValueChange={(value) => handleChange({ align: value as "left" | "center" | "right" })}
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
        <div className="mb-5">
          <Label className="block text-xs text-gray-600 mb-2">Wrap Text</Label>
          <Switch />
        </div>

        {/* Text Color */}
        <div className="mb-5">
          <Label className="block text-xs text-gray-600 mb-2">Text Color</Label>
          <Input
            type="color"
            value={data?.color || "#000000"}
            onChange={(e) => handleChange({ color: e.target.value })}
            className="h-8 w-10 p-0"
          />
        </div>

        {/* Background */}
        <div className="mb-5">
          <Label className="block text-xs text-gray-600 mb-2">Background</Label>
          <Input
            type="color"
            value={data?.backgroundColor || "#ffffff"}
            onChange={(e) => handleChange({ backgroundColor: e.target.value })}
            className="h-8 w-10 p-0"
          />
        </div>

        {/* Padding */}
        <div className="mb-8">
          <Label className="block text-xs text-gray-600 mb-2">Padding</Label>
          <Select
            value={data?.padding || "16px"}
            onValueChange={(value) => handleChange({ padding: value })}
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
    </div>
  );
}

export default TitleWidgetForm;


