import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { TableWidgetData, ReportTableRow } from "../widgetTypes";

interface TableDataTabProps {
    data?: TableWidgetData;
    onChange: (updates: Partial<TableWidgetData>) => void;
}

export function TableDataTab({
    data,
    onChange,
}: TableDataTabProps) {
    const rows: ReportTableRow[] = data?.rows ?? [];
    const columns = data?.columns ?? [];

    const updateRow = (index: number, updates: Partial<ReportTableRow>) => {
        const nextRows = rows.map((row, i) =>
            i === index ? { ...row, ...updates } : row
        );
        onChange({ rows: nextRows });
    };

    const addRow = () => {
        const newRow: ReportTableRow = {};
        onChange({ rows: [...rows, newRow] });
    };

    const removeRow = (index: number) => {
        const nextRows = rows.filter((_, i) => i !== index);
        onChange({ rows: nextRows });
    };

    return (
        <div className="space-y-4 py-4">
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
    );
}
