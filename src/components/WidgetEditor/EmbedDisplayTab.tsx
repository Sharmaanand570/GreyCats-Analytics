import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { EmbedWidgetData } from "../widgetTypes";

interface EmbedDisplayTabProps {
    data?: EmbedWidgetData;
    onChange: (updates: Partial<EmbedWidgetData>) => void;
}

export function EmbedDisplayTab({ data, onChange }: EmbedDisplayTabProps) {
    const [embedType, setEmbedType] = useState<"url" | "iframe">(
        (data?.type === "iframe" ? "iframe" : "url") as "url" | "iframe"
    );

    // Sync embedType with data.type
    useEffect(() => {
        if (data?.type) {
            setEmbedType(data.type as "url" | "iframe");
        }
    }, [data?.type]);

    return (
        <div className="space-y-5 py-4">
            {/* Type */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">Type</Label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={embedType === "url" ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                            setEmbedType("url");
                            onChange({ type: "url" });
                        }}
                    >
                        URL
                    </Button>
                    <Button
                        type="button"
                        variant={embedType === "iframe" ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                            setEmbedType("iframe");
                            onChange({ type: "iframe" });
                        }}
                    >
                        iFrame
                    </Button>
                </div>
            </div>

            {/* URL */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">URL</Label>
                <Input
                    value={data?.url || ""}
                    onChange={(e) => onChange({ url: e.target.value })}
                    placeholder="Enter URL"
                />
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-[11px] text-yellow-800">
                    <strong>Note:</strong> Many websites (like Google, Facebook, or specific business sites) block being embedded for security reasons (X-Frame-Options).
                    <br />
                    If your embed doesn't load, try using a Screenshot (Image Widget) instead.
                </div>
            </div>

            {/* Helpful Guides */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">Helpful Guides</Label>
                <div className="space-y-2">
                    <a
                        href="https://www.youtube.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                        <svg
                            className="w-5 h-5 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        <span>YouTube</span>
                    </a>
                    <a
                        href="https://datastudio.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                        <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span>Google Data Studio</span>
                    </a>
                </div>
            </div>

            {/* Title */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">Title</Label>
                <Input
                    value={data?.title || ""}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="Title"
                />
            </div>

            {/* Background Color */}
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
                        className="h-8 text-xs font-mono"
                    />
                </div>
            </div>
        </div>
    );
}
