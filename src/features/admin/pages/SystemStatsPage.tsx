import { useEffect, useState } from "react";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/api/adminApi";
import { Activity, Cpu, Database, Server } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function SystemStatsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            // Only set loading on first fetch
            if (!stats) setLoading(true);
            try {
                const data = await adminApi.getSystemHealth();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch system stats", error);
                if (!stats) toast.error("Failed to load system health.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
        // Poll every 30s
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) {
        return (
            <div className="space-y-6">
                <AdminPageHeader title="System Health" description="Real-time system performance monitoring." />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-1" />
                                <Skeleton className="h-3 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex justify-between border-b pb-2 last:border-0">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader title="System Health" description="Real-time system performance monitoring." />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.cpu?.usage || "0"}%</div>
                        <p className="text-xs text-muted-foreground">{stats?.cpu?.cores || 1} Cores Active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Memory</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.memory?.used || "0"} MB</div>
                        <p className="text-xs text-muted-foreground">of {stats?.memory?.total || "0"} MB Total</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">API Latency</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.api?.latency || "0"}ms</div>
                        <p className="text-xs text-muted-foreground">Average Response Time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.uptime || "0h"}</div>
                        <p className="text-xs text-muted-foreground">Since Last Restart</p>
                    </CardContent>
                </Card>
            </div>

            {stats?.services && (
                <div className="grid grid-cols-1 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(stats.services).map(([service, status]: [string, any]) => (
                                    <div key={service} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <span className="capitalize">{service}</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${status === 'operational' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
