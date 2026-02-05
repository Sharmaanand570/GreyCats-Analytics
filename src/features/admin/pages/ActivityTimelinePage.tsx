import { useEffect, useState } from "react";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/api/adminApi";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertTriangle,
    Clock,
    Globe,
    Info,
    ShieldAlert,
    User,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ActivityLog {
    id: string;
    action: string;
    userId: number;
    userEmail: string;
    details: string;
    ipAddress: string;
    severity: 'info' | 'warning' | 'error';
    createdAt: string;
}

export default function ActivityTimelinePage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const data = await adminApi.getActivityLogs();
                setLogs(data.activities || []);
            } catch (error) {
                console.error("Failed to fetch activity logs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const getSeverityDetails = (severity: string) => {
        switch (severity) {
            case 'error':
                return {
                    color: "text-red-600 dark:text-red-500",
                    bgColor: "bg-red-100 dark:bg-red-900/30",
                    borderColor: "border-red-200 dark:border-red-800",
                    icon: ShieldAlert
                };
            case 'warning':
                return {
                    color: "text-amber-600 dark:text-amber-500",
                    bgColor: "bg-amber-100 dark:bg-amber-900/30",
                    borderColor: "border-amber-200 dark:border-amber-800",
                    icon: AlertTriangle
                };
            case 'info':
            default:
                return {
                    color: "text-blue-600 dark:text-blue-500",
                    bgColor: "bg-blue-100 dark:bg-blue-900/30",
                    borderColor: "border-blue-200 dark:border-blue-800",
                    icon: Info
                };
        }
    };

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <AdminPageHeader
                title="Activity Timeline"
                description="Audit log of system usage and critical events."
            >
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search logs..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </AdminPageHeader>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    {loading ? (
                        <TimelineSkeleton />
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-card shadow-sm">
                            <div className="rounded-full bg-muted p-4 mb-4">
                                <Clock className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No activity found</h3>
                            <p className="text-muted-foreground max-w-sm mt-1">
                                {search ? "Try adjusting your search terms." : "There are no activity logs to display at this time."}
                            </p>
                        </div>
                    ) : (
                        <div className="relative border-l border-muted ml-4 md:ml-6 space-y-8 pb-10">
                            {filteredLogs.map((log) => {
                                const style = getSeverityDetails(log.severity);
                                const Icon = style.icon;

                                return (
                                    <div key={log.id} className="relative pl-8 md:pl-10 group">
                                        {/* Timeline Dot */}
                                        <div className={cn(
                                            "absolute -left-[13px] md:-left-[15px] top-1 h-7 w-7 md:h-8 md:w-8 rounded-full border-4 border-background flex items-center justify-center transition-transform group-hover:scale-110",
                                            style.bgColor,
                                            style.color
                                        )}>
                                            <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                        </div>

                                        {/* Content Card */}
                                        <div className="flex flex-col gap-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                                                <h4 className="font-semibold text-sm md:text-base text-foreground flex items-center gap-2">
                                                    {log.action}
                                                    {log.severity === 'error' && (
                                                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">CRITICAL</Badge>
                                                    )}
                                                </h4>
                                                <time className="text-xs text-muted-foreground font-medium tabular-nums whitespace-nowrap">
                                                    {format(new Date(log.createdAt), "PP p")}
                                                </time>
                                            </div>

                                            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                                                {log.details}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-dashed text-xs text-muted-foreground bg-card/50 rounded-md">
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50">
                                                    <User className="h-3 w-3" />
                                                    <span className="font-medium text-foreground">{log.userEmail}</span>
                                                    <span className="opacity-60">(ID: {log.userId})</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50">
                                                    <Globe className="h-3 w-3" />
                                                    <span className="font-mono">{log.ipAddress}</span>
                                                </div>
                                                <div className="ml-auto text-xs opacity-60 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function TimelineSkeleton() {
    return (
        <div className="relative border-l border-muted ml-6 space-y-10 pb-10">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="relative pl-10">
                    <div className="absolute -left-[15px] top-1 h-8 w-8 rounded-full border-4 border-background bg-muted" />
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-full max-w-lg" />
                        <div className="flex gap-4 pt-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
