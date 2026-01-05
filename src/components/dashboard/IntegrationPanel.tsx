import { memo } from "react";
import { cn } from "@/lib/utils";

interface IntegrationPanelProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    dateRangeLabel?: string;
    className?: string;
    action?: React.ReactNode;
    brandColor?: string;
}

export const IntegrationPanel = memo(({
    title,
    icon,
    children,
    dateRangeLabel,
    className,
    action,
    brandColor
}: IntegrationPanelProps) => {
    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    {/* Icon Box */}
                    {icon && (
                        <div
                            className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-zinc-600"
                            style={brandColor ? { color: brandColor, borderColor: `${brandColor}20`, backgroundColor: `${brandColor}05` } : undefined}
                        >
                            {icon}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-zinc-800 capitalize tracking-tight leading-none">
                            {title}
                        </h2>
                        {dateRangeLabel && (
                            <span className="text-xs font-medium text-zinc-400 mt-1">
                                {dateRangeLabel}
                            </span>
                        )}
                    </div>
                </div>

                {action}
            </div>

            {/* Grid Container */}
            <div className="w-full">
                {children}
            </div>
        </div>
    );
});

IntegrationPanel.displayName = "IntegrationPanel";
