import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

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
            "overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-white/20",
            "bg-white dark:bg-[#111] border-gray-200 dark:border-white/10",
            className
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</CardTitle>
                <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-gray-900 dark:text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</div>
                {(description || trend) && (
                    <div className="flex items-center gap-2 mt-2">
                        {trend && (
                            <span className={cn(
                                "flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-opacity-10",
                                trend.direction === "up" ? "text-green-600 bg-green-500 dark:text-green-400 dark:bg-green-500/20" :
                                    trend.direction === "down" ? "text-red-600 bg-red-500 dark:text-red-400 dark:bg-red-500/20" :
                                        "text-gray-600 bg-gray-500 dark:text-gray-400 dark:bg-gray-500/20"
                            )}>
                                {trend.value > 0 ? "+" : ""}{trend.value}%
                            </span>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {description || trend?.label}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
