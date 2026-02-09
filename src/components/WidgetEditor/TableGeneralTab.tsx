import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { TableWidgetData } from "../widgetTypes";

// Constants from original file
const META_RECENT_POSTS_COLUMNS = [
    { value: "date", label: "Date" },
    { value: "post", label: "Post Message" },
    { value: "impressions", label: "Impressions" },
    { value: "clicks", label: "Clicks" },
    { value: "likes", label: "Likes" },
    { value: "comments", label: "Comments" },
    { value: "shares", label: "Shares" },
    { value: "reactions", label: "Reactions" },
    { value: "fullPicture", label: "Full Picture" },
    { value: "permalinkUrl", label: "Permalink URL" },
];

const INSTAGRAM_RECENT_MEDIA_COLUMNS = [
    { value: "date", label: "Date" },
    { value: "post", label: "Post Message" },
    { value: "impressions", label: "Impressions" },
    { value: "clicks", label: "Clicks" },
    { value: "likes", label: "Likes" },
    { value: "shares", label: "Shares" },
    { value: "fullPicture", label: "Full Picture" },
    { value: "mediaType", label: "Type" },
    { value: "comments", label: "Comments" },
    { value: "reach", label: "Reach" },
    { value: "engagement", label: "Engagement" },
    { value: "saved", label: "Saved" },
];

export const DEFAULT_RECENT_POSTS_COLUMNS = [
    { name: "Date", width: "15%", dataKey: "date" },
    { name: "Post", width: "40%", dataKey: "post" },
    { name: "Impressions", dataKey: "impressions" },
    { name: "Clicks", dataKey: "clicks" },
    { name: "Likes", dataKey: "likes" },
    { name: "Comments", dataKey: "comments" },
    { name: "Shares", dataKey: "shares" },
];

export const DEFAULT_INSTAGRAM_MEDIA_COLUMNS = [
    { name: "Date", width: "15%", dataKey: "date" },
    { name: "Full Picture", dataKey: "fullPicture" },
    { name: "Post Message", width: "35%", dataKey: "post" },
    { name: "Impressions", dataKey: "impressions" },
    { name: "Clicks", dataKey: "clicks" },
    { name: "Likes", dataKey: "likes" },
    { name: "Shares", dataKey: "shares" },
];

interface TableGeneralTabProps {
    data?: TableWidgetData;
    onChange: (updates: Partial<TableWidgetData>) => void;
    metricKey?: string;
}

export function TableGeneralTab({
    data,
    onChange,
    metricKey,
}: TableGeneralTabProps) {
    const isRecentPosts = metricKey === 'meta.facebook.recent_posts';
    const isInstagramMedia = metricKey === 'meta.instagram.recent_media';
    const isDynamicTable = isRecentPosts || isInstagramMedia;

    const columns = data?.columns ?? [];

    const updateColumn = (
        index: number,
        updates: Partial<NonNullable<TableWidgetData["columns"]>[number]>
    ) => {
        const nextColumns = columns.map((col, i) =>
            i === index ? { ...col, ...updates } : col
        );
        onChange({ columns: nextColumns });
    };

    const addColumn = () => {
        // Standard Behavior
        if (!isDynamicTable) {
            const newColumn = {
                name: `Column ${columns.length + 1}`,
                width: "",
            };
            onChange({ columns: [...columns, newColumn] });
            return;
        }

        const newColumn = {
            name: "New Column",
            width: "",
        };
        onChange({ columns: [...columns, newColumn] });
    };

    const removeColumn = (index: number) => {
        const nextColumns = columns.filter((_, i) => i !== index);
        onChange({ columns: nextColumns });
    };

    const addRecentPostColumn = (fieldValue: string, fieldLabel: string) => {
        const newColumn = {
            name: fieldLabel,
            dataKey: fieldValue,
            width: "",
        };
        onChange({ columns: [...columns, newColumn] });
    };

    return (
        <div className="space-y-5 py-4">
            <p className="text-[11px] text-gray-500">
                Give your table a clear title, optional caption, and define the
                column headers it should use.
            </p>

            {/* Basic Info */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">
                    Title
                </Label>
                <Input
                    value={data?.title || ""}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="Enter table title"
                />
            </div>
            <div>
                <Label className="block text-xs text-gray-600 mb-2">
                    Caption
                </Label>
                <Input
                    value={data?.caption || ""}
                    onChange={(e) => onChange({ caption: e.target.value })}
                    placeholder="Enter table caption"
                    className="placeholder:text-gray-400"
                />
            </div>

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

            {/* Columns Editor */}
            <div className="border-t pt-4 mt-2 space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs text-gray-600">Columns</Label>

                    {isDynamicTable ? (
                        <div className="flex gap-2">
                            <select
                                className="h-8 text-[11px] border rounded px-2 bg-white"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) return;

                                    const options = isRecentPosts ? META_RECENT_POSTS_COLUMNS : INSTAGRAM_RECENT_MEDIA_COLUMNS;
                                    const opt = options.find(c => c.value === val);

                                    if (opt) addRecentPostColumn(opt.value, opt.label);
                                    e.target.value = "";
                                }}
                            >
                                <option value="">+ Add Column</option>
                                {(isRecentPosts ? META_RECENT_POSTS_COLUMNS : INSTAGRAM_RECENT_MEDIA_COLUMNS).map(opt => (
                                    <option key={opt.value} value={opt.value} disabled={columns.some(c => c.dataKey ? c.dataKey === opt.value : c.name === opt.label)}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={addColumn}
                            className="text-xs"
                        >
                            Add Column
                        </Button>
                    )}
                </div>

                {columns.length === 0 && (
                    <p className="text-[11px] text-gray-500">
                        No custom columns yet. Click &quot;Add Column&quot; to define
                        table headers.
                    </p>
                )}

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {columns.map((col, index) => (
                        <div
                            key={index}
                            className="border rounded-md p-2 flex flex-col gap-2 bg-gray-50"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-medium text-gray-700">
                                    {isRecentPosts ? `Column: ${col.name}` : `Column ${index + 1}`}
                                </span>
                                <button
                                    type="button"
                                    className="text-[11px] text-red-500 hover:text-red-700"
                                    onClick={() => removeColumn(index)}
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="block text-[11px] text-gray-600 mb-1">
                                        Header
                                    </Label>
                                    <Input
                                        value={col.name}
                                        onChange={(e) =>
                                            updateColumn(index, { name: e.target.value })
                                        }
                                        placeholder="e.g. Report"
                                        disabled={isDynamicTable}
                                    />
                                </div>
                                <div>
                                    <Label className="block text-[11px] text-gray-600 mb-1">
                                        Width (optional)
                                    </Label>
                                    <Input
                                        value={col.width ?? ""}
                                        onChange={(e) =>
                                            updateColumn(index, { width: e.target.value })
                                        }
                                        placeholder="e.g. 35% or 200px"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
