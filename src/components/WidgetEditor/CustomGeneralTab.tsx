import { useMemo } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import type { CustomWidgetData } from "../widgetTypes";

interface CustomGeneralTabProps {
    data?: CustomWidgetData;
    onChange: (updates: Partial<CustomWidgetData>) => void;
}

export function CustomGeneralTab({ data, onChange }: CustomGeneralTabProps) {
    const isToc = (data?.type ?? "").toLowerCase() === "toc";

    const tocLines = useMemo(() => {
        if (!isToc || !data?.content) return [];
        return data.content.split("\n").map((t) => t.trim()).filter(Boolean);
    }, [isToc, data?.content]);

    const updateTocLine = (index: number, value: string) => {
        const next = [...tocLines];
        next[index] = value;
        onChange({
            type: "toc",
            content: next.join("\n"),
        });
    };

    const addTocLine = () => {
        const next = [...tocLines, `Section ${tocLines.length + 1}`];
        onChange({
            type: "toc",
            content: next.join("\n"),
        });
    };

    const removeTocLine = (index: number) => {
        const next = tocLines.filter((_, i) => i !== index);
        onChange({
            type: "toc",
            content: next.join("\n"),
        });
    };

    const handleBold = () => {
        const el = document.querySelector("textarea[name='content-editor']") as HTMLTextAreaElement;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const text = data?.content ?? "";
        const before = text.substring(0, start);
        const selected = text.substring(start, end);
        const after = text.substring(end);
        onChange({ content: `${before}**${selected}**${after}` });
    };

    const handleItalic = () => {
        const el = document.querySelector("textarea[name='content-editor']") as HTMLTextAreaElement;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const text = data?.content ?? "";
        const before = text.substring(0, start);
        const selected = text.substring(start, end);
        const after = text.substring(end);
        onChange({ content: `${before}_${selected}_${after}` });
    };

    return (
        <div className="space-y-5 py-4">
            <div>
                <Label className="block text-xs text-gray-600 mb-1">Block type</Label>
                <Input
                    value={isToc ? "Table of Contents" : (data?.type || "Custom Content")}
                    readOnly
                    className="bg-gray-100 text-gray-700 text-xs"
                />
            </div>

            {isToc ? (
                <div className="space-y-4">
                    <label className="flex items-start gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!data?.autoPopulate}
                            onChange={(e) => onChange({ autoPopulate: e.target.checked })}
                            className="mt-0.5"
                        />
                        <div>
                            <div className="text-xs text-gray-700 font-medium">Auto-populate from slides</div>
                            <div className="text-[11px] text-gray-500">
                                Build entries automatically from the report's slide list. Disable to edit entries manually.
                            </div>
                        </div>
                    </label>

                    {data?.autoPopulate ? (
                        <p className="text-[11px] text-gray-500 bg-blue-50 border border-blue-100 rounded p-3">
                            Entries are derived from the current slide list. To customise, uncheck "Auto-populate from slides" above.
                        </p>
                    ) : (
                        <>
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
                                <p className="text-[11px] text-gray-400 text-center py-4">
                                    No entries yet. Click "+ Add entry" to start.
                                </p>
                            )}

                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {tocLines.map((line, index) => {
                                    const parts = line.split("|").map(p => p.trim());
                                    const section = parts[0] || "";
                                    const page = parts[1] || String(index + 3);

                                    return (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="text-[11px] text-gray-500 w-5 text-right">
                                                {index + 1}.
                                            </span>
                                            <Input
                                                value={section}
                                                onChange={(e) => updateTocLine(index, `${e.target.value} | ${page}`)}
                                                className="flex-1 text-xs"
                                                placeholder={`Section ${index + 1}`}
                                            />
                                            <Input
                                                value={page}
                                                onChange={(e) => updateTocLine(index, `${section} | ${e.target.value}`)}
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
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <Label className="block text-xs text-gray-600 mb-1">Content</Label>
                    <div className="flex items-center gap-1 mb-1 border rounded-t p-1 bg-gray-50">
                        <button
                            type="button"
                            onClick={handleBold}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Bold"
                        >
                            <span className="font-bold text-xs">B</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleItalic}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Italic"
                        >
                            <span className="italic text-xs">I</span>
                        </button>
                        <div className="w-px h-4 bg-gray-300 mx-1" />
                        <button
                            type="button"
                            onClick={() => onChange({ content: (data?.content || "") + "\n# " })}
                            className="p-1 hover:bg-gray-200 rounded text-xs font-bold"
                            title="Heading 1"
                        >
                            H1
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange({ content: (data?.content || "") + "\n## " })}
                            className="p-1 hover:bg-gray-200 rounded text-xs font-bold"
                            title="Heading 2"
                        >
                            H2
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange({ content: (data?.content || "") + "\n- " })}
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
                        onChange={(e) => onChange({ content: e.target.value })}
                        placeholder={`Add your content here. Supported Markdown:\n**Bold**, _Italic_\n# H1, ## H2\n- List items`}
                        className="text-xs rounded-t-none mt-0 pt-2"
                    />
                </div>
            )}
        </div>
    );
}
