import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
    value: number;
    label?: string;
    direction?: "up" | "down" | "neutral";
}

export function TrendIndicator({ value, label, direction }: TrendIndicatorProps) {
    // Auto-detect direction if not provided
    const trendDirection = direction || (value > 0 ? "up" : value < 0 ? "down" : "neutral");

    const isPositive = trendDirection === "up";
    const isNegative = trendDirection === "down";
    const isNeutral = trendDirection === "neutral";

    if (value === 0 || isNeutral) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Minus className="h-3 w-3" />
                <span>No change {label}</span>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex items-center gap-1.5 text-xs font-medium transition-colors",
            isPositive && "text-green-600 dark:text-green-500",
            isNegative && "text-red-600 dark:text-red-500"
        )}>
            {isPositive && <ArrowUp className="h-3 w-3" />}
            {isNegative && <ArrowDown className="h-3 w-3" />}
            <span>
                {Math.abs(value)}% {label}
            </span>
        </div>
    );
}
