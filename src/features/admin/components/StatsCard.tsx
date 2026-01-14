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
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend && (
                            <span className={cn(
                                "font-medium mr-1",
                                trend.direction === "up" ? "text-green-500" :
                                    trend.direction === "down" ? "text-red-500" : "text-gray-500"
                            )}>
                                {trend.value > 0 ? "+" : ""}{trend.value}%
                            </span>
                        )}
                        {description || trend?.label}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
