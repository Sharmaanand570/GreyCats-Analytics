import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
    useState<"general" | "data">("data");

  const handleChange = (updates: Partial<TableWidgetData>) => {
    if (onChange) {
      onChange({ ...data, ...updates } as TableWidgetData);
    }
  };

  const rows: ReportTableRow[] = data?.rows ?? [];

  const updateRow = (index: number, updates: Partial<ReportTableRow>) => {
    const nextRows = rows.map((row, i) =>
      i === index ? { ...row, ...updates } : row
    );
    handleChange({ rows: nextRows });
  };

  const addRow = () => {
    const newRow: ReportTableRow = {
      name: "",
      audience: "",
      status: "Draft",
      lastRun: "",
      nextSend: "",
    };
    handleChange({ rows: [...rows, newRow] });
  };

  const removeRow = (index: number) => {
    const nextRows = rows.filter((_, i) => i !== index);
    handleChange({ rows: nextRows });
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full p-4 border-b font-semibold text-accent-foreground">
        Edit Table
      </div>

      <div className="w-full px-4">
        {/* Tabs */}
        <div className="flex gap-4 text-sm mt-4 mb-6">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-1 font-medium ${
              activeTab === "general"
                ? "border-b-2 border-blue-500 text-gray-900"
                : "text-gray-500"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`pb-1 font-medium ${
              activeTab === "data"
                ? "border-b-2 border-blue-500 text-gray-900"
                : "text-gray-500"
            }`}
          >
            Data
          </button>
        </div>

        {/* General Tab */}
        {activeTab === "general" && (
          <div className="pb-8 space-y-5">
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
          </div>
        )}

        {/* Data Tab */}
        {activeTab === "data" && (
          <div className="pb-8 space-y-4">
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
                    <div>
                      <Label className="block text-[11px] text-gray-600 mb-1">
                        Name
                      </Label>
                      <Input
                        value={row.name}
                        onChange={(e) =>
                          updateRow(index, { name: e.target.value })
                        }
                        placeholder="Report name"
                      />
                    </div>
                    <div>
                      <Label className="block text-[11px] text-gray-600 mb-1">
                        Audience
                      </Label>
                      <Input
                        value={row.audience}
                        onChange={(e) =>
                          updateRow(index, { audience: e.target.value })
                        }
                        placeholder="Client / Team"
                      />
                    </div>
                    <div>
                      <Label className="block text-[11px] text-gray-600 mb-1">
                        Status
                      </Label>
                      <Select
                        value={row.status}
                        onValueChange={(value) =>
                          updateRow(index, {
                            status: value as ReportTableRow["status"],
                          })
                        }
                      >
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="block text-[11px] text-gray-600 mb-1">
                        Last run
                      </Label>
                      <Input
                        value={row.lastRun}
                        onChange={(e) =>
                          updateRow(index, { lastRun: e.target.value })
                        }
                        placeholder="e.g. Dec 1, 2025"
                      />
                    </div>
                    <div>
                      <Label className="block text-[11px] text-gray-600 mb-1">
                        Next send
                      </Label>
                      <Input
                        value={row.nextSend}
                        onChange={(e) =>
                          updateRow(index, { nextSend: e.target.value })
                        }
                        placeholder="e.g. Dec 8, 2025"
                      />
                    </div>
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


