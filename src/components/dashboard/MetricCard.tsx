import { memo } from "react";
import { ChartLineMultiple } from "../ChartLineMultiple";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface MetricCardProps {
    title: string;
    value: string | number;
    series?: any[];
    isLoading?: boolean;
    className?: string;
    chartType?: "line" | "area" | "bar";
    trend?: number; // Future use
    icon?: React.ReactNode;
    brandColor?: string;
}

export const MetricCard = memo(({
    title,
    value,
    series = [],
    isLoading,
    className,
    chartType = "line",
    icon,
    brandColor
}: MetricCardProps) => {
    if (isLoading) {
        return (
            <div className={cn("flex flex-col p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm h-[160px]", className)}>
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16 mb-auto" />
                <Skeleton className="h-12 w-full mt-4" />
            </div>
        );
    }

    const hasData = series && series.length > 0;



    return (
        <div
            className={cn(
                "group relative flex flex-col justify-between p-5 bg-white rounded-2xl border border-zinc-100/50 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-zinc-200/60 transition-all duration-300 overflow-hidden",
                className
            )}
        >
            {/* Background Decorator - Subtle Gradient */}
            <div
                className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-zinc-50 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:opacity-100 transition-opacity"
                style={brandColor ? { background: `linear-gradient(135deg, ${brandColor}10, transparent)` } : undefined}
            />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    {icon && <span className="text-zinc-400 group-hover:text-zinc-600 transition-colors" style={brandColor ? { color: brandColor } : undefined}>{icon}</span>}
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-700 transition-colors">
                        {title}
                    </h3>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-zinc-900 tracking-tight">
                        {value}
                    </span>
                    {/* Future Trend Indicator */}
                    {/* <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">+12%</span> */}
                </div>
            </div>

            <div className="relative z-10 h-16 mt-4 -mx-2 -mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                {hasData ? (
                    <ChartLineMultiple
                        data={series}
                        metricLabel={title}
                        simple={true}
                        chartType={chartType}
                        color={brandColor} // Pass color to chart
                    />
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <span className="text-xs text-zinc-300 italic">No data available</span>
                    </div>
                )}
            </div>
        </div>
    );
});

MetricCard.displayName = "MetricCard";
