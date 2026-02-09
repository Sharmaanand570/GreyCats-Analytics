import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import type { ImageWidgetData } from "../widgetTypes";
import { validateImageFile } from "@/utils/fileValidation";
import { logger } from "@/utils/logger";

interface ImageDisplayTabProps {
    data?: ImageWidgetData;
    onChange: (updates: Partial<ImageWidgetData>) => void;
}

export function ImageDisplayTab({ data, onChange }: ImageDisplayTabProps) {
    // Helper to compress image before setting state
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const MAX_WIDTH = 1024;
            const MAX_HEIGHT = 1024;
            const QUALITY = 0.8;

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        reject(new Error("Could not get canvas context"));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG
                    const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);
                    resolve(dataUrl);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (file: File) => {
        const validation = validateImageFile(file);
        if (!validation.valid) return;

        try {
            const compressedSrc = await compressImage(file);
            onChange({ src: compressedSrc });
        } catch (error) {
            logger.error("Image compression failed:", error);
            const reader = new FileReader();
            reader.onload = (event) => {
                const src = event.target?.result as string;
                onChange({ src });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-5 py-4">
            {/* Image Upload Zone */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">Image</Label>
                <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "copy";
                    }}
                    onDrop={async (e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith("image/")) {
                            handleFileChange(file);
                        }
                    }}
                >
                    {data?.src ? (
                        <div className="space-y-2">
                            <img
                                src={data.src}
                                alt={data.alt || "Image"}
                                className="max-w-full max-h-32 mx-auto object-contain"
                            />
                            <p className="text-xs text-gray-500">Click to change image</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <svg
                                className="w-8 h-8 mx-auto text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <p className="text-sm text-gray-500">Choose image</p>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileChange(file);
                        }}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer absolute inset-0 w-full h-full opacity-0" />
                </div>
            </div>

            {/* Image URL */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">Image URL</Label>
                <Input
                    value={data?.src || ""}
                    onChange={(e) => onChange({ src: e.target.value })}
                    placeholder="Enter image URL"
                />
            </div>

            {/* Alt Text */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">Alt Text</Label>
                <Input
                    value={data?.alt || ""}
                    onChange={(e) => onChange({ alt: e.target.value })}
                    placeholder="Enter alt text"
                />
            </div>

            {/* Image Fit */}
            <div>
                <Label className="block text-xs text-gray-600 mb-2">Image Fit</Label>
                <Select
                    value={data?.imageFit || "contain"}
                    onValueChange={(value) =>
                        onChange({
                            imageFit: value as
                                | "contain"
                                | "cover"
                                | "fill"
                                | "none"
                                | "scale-down",
                        })
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="fill">Fill</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="scale-down">Scale Down</SelectItem>
                    </SelectContent>
                </Select>
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
                        className="h-8 text-xs"
                    />
                </div>
            </div>
        </div>
    );
}
