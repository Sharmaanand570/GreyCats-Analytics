import React, { useMemo } from "react";
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
  // Use useMemo to prevent infinite re-renders
  const tocLines = useMemo(() => {
    if (!isToc || !data?.content) return [];
    return data.content.split("\n").map((t) => t.trim()).filter(Boolean);
  }, [isToc, data?.content]);

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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="block text-xs text-gray-600 mb-1">
                  Font Size
                </Label>
                <select
                  className="w-full text-xs border rounded-md h-9 px-2"
                  value={data?.fontSize ?? "text-sm"}
                  onChange={(e) => handleChange({ fontSize: e.target.value })}
                >
                  <option value="text-xs">Extra Small</option>
                  <option value="text-sm">Small</option>
                  <option value="text-base">Medium</option>
                  <option value="text-lg">Large</option>
                  <option value="text-xl">Extra Large</option>
                </select>
              </div>
              <div>
                <Label className="block text-xs text-gray-600 mb-1">
                  Font Weight
                </Label>
                <select
                  className="w-full text-xs border rounded-md h-9 px-2"
                  value={data?.fontWeight ?? "font-normal"}
                  onChange={(e) => handleChange({ fontWeight: e.target.value })}
                >
                  <option value="font-light">Light</option>
                  <option value="font-normal">Normal</option>
                  <option value="font-medium">Medium</option>
                  <option value="font-semibold">Semi Bold</option>
                  <option value="font-bold">Bold</option>
                </select>
              </div>
            </div>

            <p className="text-[11px] text-gray-500">
              Each entry has a section name and page number. Page numbers auto-start at 3 if not specified.
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
              {tocLines.map((line, index) => {
                // Parse existing line to extract section and page
                const parts = line.split("|").map(p => p.trim());
                const section = parts[0] || "";
                const page = parts[1] || String(index + 3);

                return (
                  <div
                    key={index}
                    className="flex items-center gap-2"
                  >
                    <span className="text-[11px] text-gray-500 w-5 text-right">
                      {index + 1}.
                    </span>
                    <Input
                      value={section}
                      onChange={(e) => {
                        const newLine = `${e.target.value} | ${page}`;
                        updateTocLine(index, newLine);
                      }}
                      className="flex-1 text-xs"
                      placeholder={`Section ${index + 1}`}
                      maxLength={100}
                    />
                    <Input
                      value={page}
                      onChange={(e) => {
                        const newLine = `${section} | ${e.target.value}`;
                        updateTocLine(index, newLine);
                      }}
                      className="w-16 text-xs text-center"
                      placeholder="Page"
                      maxLength={5}
                    />
                    <button
                      type="button"
                      onClick={() => removeTocLine(index)}
                      className="text-[11px] text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3">
              {/* Internal Type Field (Hidden) */}
              {/* <div>
                <Label className="block text-xs text-gray-600 mb-2">
                  Block type
                </Label>
                <Input
                  value={data?.type ?? ""}
                  onChange={(e) => handleChange({ type: e.target.value })}
                  placeholder="e.g. text, tasks, toc"
                  className="text-xs"
                />
              </div> */}

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
                    maxLength={100}
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
                    Font Size
                  </Label>
                  <select
                    className="w-full text-xs border rounded-md h-9 px-2"
                    value={data?.fontSize ?? "text-sm"}
                    onChange={(e) => handleChange({ fontSize: e.target.value })}
                  >
                    <option value="text-xs">Extra Small</option>
                    <option value="text-sm">Small</option>
                    <option value="text-base">Medium</option>
                    <option value="text-lg">Large</option>
                    <option value="text-xl">Extra Large</option>
                  </select>
                </div>
                <div>
                  <Label className="block text-xs text-gray-600 mb-1">
                    Font Weight
                  </Label>
                  <select
                    className="w-full text-xs border rounded-md h-9 px-2"
                    value={data?.fontWeight ?? "font-normal"}
                    onChange={(e) => handleChange({ fontWeight: e.target.value })}
                  >
                    <option value="font-light">Light</option>
                    <option value="font-normal">Normal</option>
                    <option value="font-medium">Medium</option>
                    <option value="font-semibold">Semi Bold</option>
                    <option value="font-bold">Bold</option>
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
                    maxLength={50}
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
                    maxLength={50}
                  />
                </div>
              </div>

              <div>
                <Label className="block text-xs text-gray-600 mb-2">
                  Content
                </Label>
                <div className="flex items-center gap-1 mb-1 border rounded-t p-1 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.querySelector(
                        "textarea[name='content-editor']"
                      ) as HTMLTextAreaElement;
                      if (!el) return;
                      const start = el.selectionStart;
                      const end = el.selectionEnd;
                      const text = data?.content ?? "";
                      const before = text.substring(0, start);
                      const selected = text.substring(start, end);
                      const after = text.substring(end);
                      const newVal = `${before}**${selected}**${after}`;
                      handleChange({ content: newVal });
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Bold"
                  >
                    <span className="font-bold text-xs">B</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.querySelector(
                        "textarea[name='content-editor']"
                      ) as HTMLTextAreaElement;
                      if (!el) return;
                      const start = el.selectionStart;
                      const end = el.selectionEnd;
                      const text = data?.content ?? "";
                      const before = text.substring(0, start);
                      const selected = text.substring(start, end);
                      const after = text.substring(end);
                      const newVal = `${before}_${selected}_${after}`;
                      handleChange({ content: newVal });
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Italic"
                  >
                    <span className="italic text-xs">I</span>
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1" />
                  <button
                    type="button"
                    onClick={() => {
                      const text = data?.content ?? "";
                      handleChange({ content: text + "\n# " });
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-xs font-bold"
                    title="Heading 1"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = data?.content ?? "";
                      handleChange({ content: text + "\n## " });
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-xs font-bold"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = data?.content ?? "";
                      handleChange({ content: text + "\n- " });
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-xs"
                    title="Bullet List"
                  >
                    • List
                  </button>
                </div>
                <Textarea
                  name="content-editor"
                  rows={10}
                  value={data?.content ?? ""}
                  onChange={(e) => handleChange({ content: e.target.value })}
                  placeholder={`Add your content here. Supported Markdown:\n**Bold**, _Italic_\n# H1, ## H2\n- List items`}
                  className="text-xs rounded-t-none mt-0 pt-2"
                  maxLength={5000}
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


