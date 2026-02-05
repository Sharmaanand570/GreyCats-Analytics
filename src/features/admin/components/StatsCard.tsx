import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { TrendIndicator } from "./TrendIndicator";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string; // e.g. "from last month"
        direction: "up" | "down" | "neutral";
    };
    className?: string;
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300",
            "hover:shadow-xl hover:-translate-y-1",
            "bg-white dark:bg-[#111]",
            "border border-gray-200 dark:border-white/10",
            "hover:border-gray-300 dark:hover:border-white/20",
            className
        )}>
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {title}
                </CardTitle>
                <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    "bg-gray-100 dark:bg-white/5",
                    "group-hover:bg-gray-200 dark:group-hover:bg-white/10",
                    "group-hover:scale-110"
                )}>
                    <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
            </CardHeader>

            <CardContent className="relative">
                <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    <AnimatedCounter value={value} />
                </div>

                {(description || trend) && (
                    <div className="flex items-center gap-2 mt-3">
                        {trend && (
                            <TrendIndicator
                                value={trend.value}
                                label={trend.label}
                                direction={trend.direction}
                            />
                        )}
                        {description && !trend && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
