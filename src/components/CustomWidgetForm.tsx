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

  const isToc = (data?.type ?? "").toLowerCase() === "toc";

  // For TOC, treat each line as an entry and provide per-row inputs.
  const tocLines =
    isToc && data?.content
      ? data.content.split("\n").map((t) => t.trim())
          .filter(Boolean)
      : [];

  const updateTocLine = (index: number, value: string) => {
    if (!onChange) return;
    const next = [...tocLines];
    next[index] = value;
    onChange({
      ...(data ?? { type: "toc" }),
      type: "toc",
      content: next.join("\n"),
    });
  };

  const addTocLine = () => {
    if (!onChange) return;
    const next = [...tocLines, `Section ${tocLines.length + 1}`];
    onChange({
      ...(data ?? { type: "toc" }),
      type: "toc",
      content: next.join("\n"),
    });
  };

  const removeTocLine = (index: number) => {
    if (!onChange) return;
    const next = tocLines.filter((_, i) => i !== index);
    onChange({
      ...(data ?? { type: "toc" }),
      type: "toc",
      content: next.join("\n"),
    });
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full p-4 border-b font-semibold text-accent-foreground">
        Edit Content
      </div>

      <div className="w-full px-4 py-4 space-y-4">
        {/* TOC-specific UI */}
        {isToc ? (
          <>
            <div>
              <Label className="block text-xs text-gray-600 mb-1">
                Block type
              </Label>
              <Input value="Table of Contents" readOnly className="bg-gray-100 text-gray-700 text-xs" />
            </div>

            <p className="text-[11px] text-gray-500">
              Each entry becomes a row in the Table of Contents. You can rename
              or remove entries, and add new ones below.
            </p>

            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-600">Entries</Label>
              <button
                type="button"
                onClick={addTocLine}
                className="text-[11px] text-blue-600 hover:text-blue-700"
              >
                + Add entry
              </button>
            </div>

            {tocLines.length === 0 && (
              <p className="text-[11px] text-gray-400">
                No entries yet. Click &quot;Add entry&quot; to start building
                your table of contents.
              </p>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {tocLines.map((line, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2"
                >
                  <span className="text-[11px] text-gray-500 w-5 text-right">
                    {index + 1}.
                  </span>
                  <Input
                    value={line}
                    onChange={(e) => updateTocLine(index, e.target.value)}
                    className="flex-1 text-xs"
                    placeholder={`Section ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeTocLine(index)}
                    className="text-[11px] text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label className="block text-xs text-gray-600 mb-2">
                  Block type
                </Label>
                <Input
                  value={data?.type ?? ""}
                  onChange={(e) => handleChange({ type: e.target.value })}
                  placeholder="e.g. text, tasks, ai-summary, toc"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="block text-xs text-gray-600 mb-1">
                    Title (optional)
                  </Label>
                  <Input
                    value={data?.title ?? ""}
                    onChange={(e) => handleChange({ title: e.target.value })}
                    placeholder="Section heading"
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="block text-xs text-gray-600 mb-1">
                    Align
                  </Label>
                  <select
                    className="w-full text-xs border rounded-md h-9 px-2"
                    value={data?.align ?? "left"}
                    onChange={(e) =>
                      handleChange({
                        align: e.target.value as CustomWidgetData["align"],
                      })
                    }
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="block text-xs text-gray-600 mb-1">
                    Background
                  </Label>
                  <Input
                    value={data?.backgroundColor ?? ""}
                    onChange={(e) =>
                      handleChange({ backgroundColor: e.target.value })
                    }
                    placeholder="#F8FAFC or rgba(...)"
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="block text-xs text-gray-600 mb-1">
                    Text color
                  </Label>
                  <Input
                    value={data?.textColor ?? ""}
                    onChange={(e) => handleChange({ textColor: e.target.value })}
                    placeholder="#0F172A"
                    className="text-xs"
                  />
                </div>
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
                  className="text-xs"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CustomWidgetForm;


