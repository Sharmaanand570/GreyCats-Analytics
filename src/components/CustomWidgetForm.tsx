import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import type { CustomWidgetData } from "./widgetTypes";

interface CustomWidgetFormProps {
  data?: CustomWidgetData;
  onChange?: (data: CustomWidgetData) => void;
}

function CustomWidgetForm({
  data,
  onChange,
}: CustomWidgetFormProps): React.JSX.Element {
  const handleChange = (updates: Partial<CustomWidgetData>) => {
    if (onChange) {
      onChange({ ...data, ...updates } as CustomWidgetData);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full p-4 border-b font-semibold text-accent-foreground">
        Edit Content
      </div>

      <div className="w-full px-4 py-4 space-y-4">
        <div>
          <Label className="block text-xs text-gray-600 mb-2">
            Block type
          </Label>
          <Input
            value={data?.type ?? ""}
            onChange={(e) => handleChange({ type: e.target.value })}
            placeholder="e.g. tasks, ai-summary, toc"
          />
        </div>

        <div>
          <Label className="block text-xs text-gray-600 mb-2">
            Content
          </Label>
          <Textarea
            rows={10}
            value={data?.content ?? ""}
            onChange={(e) => handleChange({ content: e.target.value })}
            placeholder={`Add your content here. For tasks, you can add one task per line:\n- Task 1\n- Task 2`}
          />
        </div>
      </div>
    </div>
  );
}

export default CustomWidgetForm;


