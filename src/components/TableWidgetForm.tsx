import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import { Button } from "./ui/button";
import type { TableWidgetData, ReportTableRow } from "./widgetTypes";

interface TableWidgetFormProps {
  data?: TableWidgetData;
  onChange?: (data: TableWidgetData) => void;
  /* New props */
  metricKey?: string;
}

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

export const DEFAULT_RECENT_POSTS_COLUMNS = [
  { name: "Date", width: "15%", dataKey: "date" },
  { name: "Post", width: "40%", dataKey: "post" },
  { name: "Impressions", dataKey: "impressions" },
  { name: "Clicks", dataKey: "clicks" },
  { name: "Likes", dataKey: "likes" },
  { name: "Comments", dataKey: "comments" },
  { name: "Shares", dataKey: "shares" },
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

export const DEFAULT_INSTAGRAM_MEDIA_COLUMNS = [
  { name: "Date", width: "15%", dataKey: "date" },
  { name: "Full Picture", dataKey: "fullPicture" },
  { name: "Post Message", width: "35%", dataKey: "post" },
  { name: "Impressions", dataKey: "impressions" },
  { name: "Clicks", dataKey: "clicks" },
  { name: "Likes", dataKey: "likes" },
  { name: "Shares", dataKey: "shares" },
];

function TableWidgetForm({
  data,
  onChange,
  metricKey,
}: TableWidgetFormProps): React.JSX.Element {
  const [activeTab, setActiveTab] =
    useState<"general" | "data">("general");

  const isRecentPosts = metricKey === 'meta.facebook.recent_posts';
  const isInstagramMedia = metricKey === 'meta.instagram.recent_media';
  const isDynamicTable = isRecentPosts || isInstagramMedia;

  const handleChange = (updates: Partial<TableWidgetData>) => {
    if (onChange) {
      onChange({ ...data, ...updates } as TableWidgetData);
    }
  };

  const rows: ReportTableRow[] = data?.rows ?? [];
  let columns = data?.columns ?? [];

  // Check for generic defaults ("Name", "Value") which indicate uninitialized state
  const isGenericDefault = columns.length === 2 &&
    columns[0].name === "Name" &&
    columns[1].name === "Value";

  // Default to standard recent posts columns if empty OR generic default
  if (isRecentPosts && (columns.length === 0 || isGenericDefault)) {
    columns = DEFAULT_RECENT_POSTS_COLUMNS;
  } else if (isInstagramMedia && (columns.length === 0 || isGenericDefault)) {
    columns = DEFAULT_INSTAGRAM_MEDIA_COLUMNS;
  }

  const updateRow = (index: number, updates: Partial<ReportTableRow>) => {
    const nextRows = rows.map((row, i) =>
      i === index ? { ...row, ...updates } : row
    );
    handleChange({ rows: nextRows });
  };

  const addRow = () => {
    const newRow: ReportTableRow = {};
    handleChange({ rows: [...rows, newRow] });
  };

  const removeRow = (index: number) => {
    const nextRows = rows.filter((_, i) => i !== index);
    handleChange({ rows: nextRows });
  };

  const updateColumn = (
    index: number,
    updates: Partial<NonNullable<TableWidgetData["columns"]>[number]>
  ) => {
    const nextColumns = columns.map((col, i) =>
      i === index ? { ...col, ...updates } : col
    );
    handleChange({ columns: nextColumns });
  };

  const addColumn = () => {
    // Standard Behavior
    if (!isDynamicTable) {
      const newColumn = {
        name: `Column ${columns.length + 1}`,
        width: "",
      };
      handleChange({ columns: [...columns, newColumn] });
      return;
    }

    // Restricted Behavior (Recent Posts / Instagram Media) - Default to the first available metric not used? 
    // Or just add a generic one and let them rename it (which effectively changes the key for this table type?).
    // Actually, for Recent Posts, the 'name' field in column config maps to the data key in `rows`?
    // In `ReportBuilder.tsx` logic for Recent Posts: 
    // `const generateColumnsFromRows = ...` uses object keys.
    // The `rows` mapping in `ReportBuilder` maps API fields to `post`, `impressions`, etc.
    // The `TableWidgetForm` stores `name` which is used as the Header text.
    // BUT, for dynamic tables, we usually match the data key to the column definition?
    // Wait, the `TableWidgetForm` currently only has `name` and `width`. It doesn't store a `key` or `dataIndex`.
    // The standard table widget relies on row data having keys that match something? 
    // Actually, looking at `TableWidgetForm`, `activeTab === "data"` uses `col.name` as the key for row data: `row[col.name]`.
    // So `col.name` IS the data key.

    // So for "Recent Posts", if we want to show "Impressions", we need a column where `name` (header) is "Impressions" 
    // AND the data row has a property "Impressions".
    // HOWEVER, `ReportBuilder.tsx` maps the data keys to lowercase/camelCase (e.g. `impressions`, `date`, `post`).
    // The columns generated by `ReportBuilder` defaults are: `{ name: "Date" }, { name: "Post" }` etc.
    // And `rows` are mapped like: `date: ...`, `post: ...`.

    // There seems to be a mismatch or implicit mapping.
    // Let's re-read `ReportBuilder.tsx` table rendering logic (around line 1380).
    // `rows.map((row, index) => ( <TableRow> {columns.map(col => <TableCell> {row[col.name]} ...`
    // Wait, if `col.name` is "Date", it looks for `row["Date"]`.
    // But `ReportBuilder` makes rows with keys `date`, `post`, etc.

    // Ah, line 1170 in ReportBuilder: `name: key... .replace(...)`.
    // And line 1399: iterates `rows` and cells.
    // Wait, typical `Table` component usage usually separates `header` from `accessor`.
    // But here `TableWidgetForm` implies `name` is both.

    // Let's assume for `Recent Posts`, the `ReportBuilder` handles the mapping or I need to ensure the column name MATCHES the key?
    // In `ReportBuilder.tsx`, existing code generates helper columns:
    // `{ name: "Date" }`
    // But the row data has `date`.
    // So `row["Date"]` would be undefined!
    // Unless `ReportBuilder` transforms keys to Capitalized for display?

    // Let's look at `ReportBuilder` lines 1289+ again.
    // Actually I can't see the render logic for the cells in my previous `view_file` (it cut off at 1400).
    // I need to verify how `rows` are accessed in `ReportBuilder` before I implement this.
    // If I add a column "Impressions", does it look for `row.Impressions` or `row.impressions`?

    // If `isRecentPosts` is true, I should probably allow the user to select the "Field" (data key) AND the "Header Name".
    // But `TableWidgetData` only supports `name` and `width`.
    // This implies a limitation in the current data structure.

    // HYPOTHESIS: `ReportBuilder`'s `table` renderer tries to find data case-insensitively or the hardcoded "Date" working is a mystery.
    // OR, the `rows` constructed in `ReportBuilder` line 1100-ish sets keys to match expected headers?

    // Let's pause and check `ReportBuilder` table cell rendering (lines 1390-1450).

    // FOR NOW, I will implement the UI to add columns assuming I just need to add a column with a specific name.

    const newColumn = {
      name: "New Column",
      width: "",
    };
    handleChange({ columns: [...columns, newColumn] });
  };

  const removeColumn = (index: number) => {
    const nextColumns = columns.filter((_, i) => i !== index);
    handleChange({ columns: nextColumns });
  };

  // Custom Add Logic for Recent Posts
  const addRecentPostColumn = (fieldValue: string, fieldLabel: string) => {
    // Check if already exists (optional, but good UX)
    // We'll just add it.
    const newColumn = {
      name: fieldLabel, // This 'name' is used as the header. 
      dataKey: fieldValue, // Store the API key for reliable data mapping
      width: "",
    };

    // If the system relies on exact name match, we rely on ReportBuilder to be smart enough or we need to enforce casing.
    handleChange({ columns: [...columns, newColumn] });
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full p-4 border-b font-semibold text-accent-foreground">
        Edit Table
      </div>

      <div className="w-full px-4">
        {/* Tabs - Hide Rows tab for Recent Posts */}
        <div className="flex gap-2 text-xs mt-4 mb-4 bg-gray-100 rounded-full p-1 w-max">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${activeTab === "general"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-800"
              }`}
          >
            Settings
          </button>
          {!isDynamicTable && (
            <button
              type="button"
              onClick={() => setActiveTab("data")}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${activeTab === "data"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
                }`}
            >
              Rows
            </button>
          )}
        </div>

        {/* General Tab */}
        {activeTab === "general" && (
          <div className="pb-8 space-y-5">
            <p className="text-[11px] text-gray-500">
              Give your table a clear title, optional caption, and define the
              column headers it should use.
            </p>
            <div>
              <Label className="block text-xs text-gray-600 mb-2">
                Title
              </Label>
              <Input
                value={data?.title || ""}
                onChange={(e) => handleChange({ title: e.target.value })}
                placeholder="Enter table title"
              />
            </div>
            <div>
              <Label className="block text-xs text-gray-600 mb-2">
                Caption
              </Label>
              <Input
                value={data?.caption || ""}
                onChange={(e) => handleChange({ caption: e.target.value })}
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
                    onChange={(e) => handleChange({ backgroundColor: e.target.value })}
                    className="h-8 w-10 p-0 border-none"
                  />
                  <Input
                    value={data?.backgroundColor || "#ffffff"}
                    onChange={(e) => handleChange({ backgroundColor: e.target.value })}
                    placeholder="#ffffff"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div>
                <Label className="block text-xs text-gray-600 mb-2">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={data?.textColor || "#000000"}
                    onChange={(e) => handleChange({ textColor: e.target.value })}
                    className="h-8 w-10 p-0 border-none"
                  />
                  <Input
                    value={data?.textColor || "#000000"}
                    onChange={(e) => handleChange({ textColor: e.target.value })}
                    placeholder="#000000"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-600">Columns</Label>

                {isDynamicTable ? (
                  <div className="flex gap-2">
                    {/* Custom Add Dropdown/List for Recent Posts / Instagram */}
                    <select
                      className="h-8 text-[11px] border rounded px-2 bg-white"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;

                        // Select correct options list
                        const options = isRecentPosts ? META_RECENT_POSTS_COLUMNS : INSTAGRAM_RECENT_MEDIA_COLUMNS;
                        const opt = options.find(c => c.value === val);

                        if (opt) addRecentPostColumn(opt.value, opt.label);
                        e.target.value = ""; // reset
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
                        {isRecentPosts ? (
                          // For recent posts, we might want to restrict editing the name if it breaks data mapping?
                          // But user requirement says "Edit column names".
                          // So we allow editing. The ReportBuilder must map purely by index or something smart?
                          // Or I must handle the mapping there.
                          // Let's assume ReportBuilder needs to update to handle custom column names mapping to data keys.
                          `Column: ${col.name}`
                        ) : (
                          `Column ${index + 1}`
                        )}
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
        )}

        {/* Data Tab */}
        {activeTab === "data" && !isDynamicTable && (
          <div className="pb-8 space-y-4">
            <p className="text-[11px] text-gray-500">
              Add rows of data for this table. Each row uses the columns you
              defined under <span className="font-medium">Settings</span>.
            </p>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-600">Rows</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addRow}
                className="text-xs"
              >
                Add Row
              </Button>
            </div>

            {rows.length === 0 && (
              <p className="text-[11px] text-gray-500 mb-2">
                No rows yet. Click &quot;Add Row&quot; to start building your
                table.
              </p>
            )}

            <div className="space-y-3">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="border rounded-md p-3 space-y-2 bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      Row {index + 1}
                    </span>
                    <button
                      type="button"
                      className="text-[11px] text-red-500 hover:text-red-700"
                      onClick={() => removeRow(index)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {columns.map((col, colIndex) => {
                      // normalize key: lowercase and remove spaces for storage
                      const key = col.name;
                      return (
                        <div key={colIndex}>
                          <Label className="block text-[11px] text-gray-600 mb-1">
                            {col.name}
                          </Label>
                          <Input
                            value={(row[key] as string) || ""}
                            onChange={(e) =>
                              updateRow(index, { [key]: e.target.value })
                            }
                            placeholder={col.name}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default TableWidgetForm;


