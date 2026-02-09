import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import type { CustomWidgetData } from "../widgetTypes";

interface TasksGeneralTabProps {
    data?: CustomWidgetData;
    onChange: (updates: Partial<CustomWidgetData>) => void;
}

// Helper: convert content string to task array and back
const parseTasks = (content?: string): string[] =>
    (content ?? "")
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);

const serializeTasks = (tasks: string[]): string => tasks.join("\n");

export function TasksGeneralTab({ data, onChange }: TasksGeneralTabProps) {
    const tasks = parseTasks(data?.content);
    const [newTask, setNewTask] = useState("");

    const emit = (nextTasks: string[]) => {
        onChange({
            type: "tasks",
            content: serializeTasks(nextTasks),
        });
    };

    const handleAddTask = () => {
        const trimmed = newTask.trim();
        if (!trimmed) return;
        emit([...tasks, trimmed]);
        setNewTask("");
    };

    const handleUpdateTask = (index: number, value: string) => {
        const next = [...tasks];
        next[index] = value;
        emit(next);
    };

    const handleDeleteTask = (index: number) => {
        const next = tasks.filter((_, i) => i !== index);
        emit(next);
    };

    return (
        <div className="space-y-5 py-4">
            <div>
                <Label className="block text-xs text-gray-600 mb-2">
                    List title (optional)
                </Label>
                <Input
                    value={data?.title || ""}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="e.g. Weekly tasks"
                />
            </div>

            <div>
                <Label className="block text-xs text-gray-600 mb-2">
                    Add task
                </Label>
                <div className="flex gap-2">
                    <Input
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="e.g. Review performance"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTask();
                            }
                        }}
                    />
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleAddTask}
                    >
                        Add
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="block text-xs text-gray-600 mb-1">
                    Tasks
                </Label>
                {tasks.length === 0 && (
                    <p className="text-[11px] text-gray-500 text-center py-4">
                        No tasks yet. Add your first task above.
                    </p>
                )}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {tasks.map((task, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                value={task}
                                onChange={(e) => handleUpdateTask(index, e.target.value)}
                                className="text-xs"
                            />
                            <button
                                type="button"
                                className="text-[11px] text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteTask(index)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t pt-4">
                <Label className="block text-xs text-gray-600 mb-1">
                    Raw content (Markdown)
                </Label>
                <Textarea
                    rows={4}
                    value={serializeTasks(tasks)}
                    onChange={(e) => emit(parseTasks(e.target.value))}
                    className="text-xs"
                />
            </div>
        </div>
    );
}
