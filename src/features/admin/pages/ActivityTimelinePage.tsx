import { useEffect, useState } from "react";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/api/adminApi";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const data = await adminApi.getActivityLogs();
                setLogs(data.logs || []); // Assuming response structure { logs: [], total: ... }
            } catch (error) {
                console.error("Failed to fetch activity logs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="space-y-6">
            <AdminPageHeader title="Activity Timeline" description="Audit log of system usage and critical events." />

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading activity logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No recent activity found.</div>
                    ) : (
                        <div className="divide-y">
                            {logs.map((log) => (
                                <div key={log.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex flex-col sm:flex-row gap-4 sm:items-start text-sm">
                                    <div className="min-w-[140px] text-xs text-muted-foreground pt-1">
                                        {format(new Date(log.createdAt), "PP pp")}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={log.severity === 'error' ? 'destructive' : log.severity === 'warning' ? 'secondary' : 'outline'} className="uppercase text-[10px]">
                                                {log.severity}
                                            </Badge>
                                            <span className="font-medium">{log.action}</span>
                                        </div>
                                        <p className="text-muted-foreground">{log.details}</p>
                                        <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                                            <span className="flex items-center gap-1">User: {log.userEmail} (ID: {log.userId})</span>
                                            <span>IP: {log.ipAddress}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
