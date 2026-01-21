import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import { Button } from "./ui/button";
import type { TableWidgetData, ReportTableRow } from "./widgetTypes";

interface TableWidgetFormProps {
  data?: TableWidgetData;
  onChange?: (data: TableWidgetData) => void;
}

function TableWidgetForm({
  data,
  onChange,
}: TableWidgetFormProps): React.JSX.Element {
  const [activeTab, setActiveTab] =
    useState<"general" | "data">("general");

  const handleChange = (updates: Partial<TableWidgetData>) => {
    if (onChange) {
      onChange({ ...data, ...updates } as TableWidgetData);
    }
  };

  const rows: ReportTableRow[] = data?.rows ?? [];
  const columns = data?.columns ?? [];

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
    const newColumn = {
      name: `Column ${columns.length + 1}`,
      width: "",
    };
    handleChange({ columns: [...columns, newColumn] });
  };

  const removeColumn = (index: number) => {
    const nextColumns = columns.filter((_, i) => i !== index);
    handleChange({ columns: nextColumns });
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full p-4 border-b font-semibold text-accent-foreground">
        Edit Table
      </div>

      <div className="w-full px-4">
        {/* Tabs */}
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
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addColumn}
                  className="text-xs"
                >
                  Add Column
                </Button>
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
                        Column {index + 1}
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
        {activeTab === "data" && (
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


