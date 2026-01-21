import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/api/adminApi";
import { CheckCircle2, AlertTriangle, XCircle, Activity, Link as LinkIcon, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface IntegrationHealth {
    type: string;
    totalConnections: number;
    activeConnections: number;
    errorRate: number;
    avgSyncTime: number;
    status: 'healthy' | 'degraded' | 'outage';
}

export default function IntegrationHealthPage() {
    const [integrations, setIntegrations] = useState<IntegrationHealth[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealth = async () => {
            setLoading(true);
            try {
                const response = await adminApi.getIntegrationHealth();
                const healthData = response.integrationHealth || response;

                if (Array.isArray(healthData)) {
                    setIntegrations(healthData);
                } else if (typeof healthData === 'object' && healthData !== null) {
                    const mappedIntegrations: IntegrationHealth[] = Object.entries(healthData).map(([type, stats]: [string, any]) => {
                        const total = stats.total || 0;
                        const failed = stats.failed || 0;
                        const errorRate = total > 0 ? Math.round((failed / total) * 100) : 0;

                        let status: 'healthy' | 'degraded' | 'outage' = 'healthy';
                        if (failed > 0 && failed < total) status = 'degraded';
                        if (failed > 0 && failed === total) status = 'outage';
                        if (total === 0) status = 'healthy';

                        return {
                            type,
                            totalConnections: total,
                            activeConnections: stats.completed || 0,
                            errorRate,
                            avgSyncTime: 0,
                            status
                        };
                    });
                    setIntegrations(mappedIntegrations);
                } else {
                    setIntegrations([]);
                }
            } catch (error) {
                console.error("Failed to fetch integration health", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHealth();
    }, []);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'healthy': return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Healthy" };
            case 'degraded': return { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", label: "Degraded" };
            case 'outage': return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Outage" };
            default: return { icon: Activity, color: "text-gray-500", bg: "bg-gray-500/10", label: "Unknown" };
        }
    };

    const overallStatus = integrations.some(i => i.status === 'outage') ? 'critical'
        : integrations.some(i => i.status === 'degraded') ? 'warning'
            : 'healthy';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Integration Health</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Monitor the status and performance of third-party integrations.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#111]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">System Status</CardTitle>
                        <Activity className={cn("h-4 w-4", overallStatus === 'healthy' ? "text-green-500" : overallStatus === 'warning' ? "text-amber-500" : "text-red-500")} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{overallStatus}</div>
                        <p className="text-xs text-muted-foreground mt-1">Overall system health</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#111]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Connections</CardTitle>
                        <LinkIcon className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {integrations.reduce((acc, curr) => acc + curr.totalConnections, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Across all clients</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#111]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Error Rate</CardTitle>
                        <AlertCircle className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {integrations.length > 0
                                ? Math.round(integrations.reduce((acc, curr) => acc + curr.errorRate, 0) / integrations.length)
                                : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Average across services</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#111]">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                                <TableHead className="w-[300px] pl-6 font-semibold text-gray-700 dark:text-gray-300">Integration</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Connections</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Error Rate</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Avg Sync Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i} className="border-gray-100 dark:border-white/5">
                                        <TableCell className="pl-6"><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : integrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No integration data available.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                integrations.map((int) => {
                                    const statusInfo = getStatusInfo(int.status);
                                    const Icon = statusInfo.icon;
                                    return (
                                        <TableRow key={int.type} className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-white/5">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-lg font-bold text-gray-500 dark:text-gray-400">
                                                        {int.type.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white capitalize">{int.type.replace('_', ' ')}</div>
                                                        <div className="text-xs text-gray-500">v1.2.0</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn("pl-1 pr-2 py-0.5 border-0 flex w-fit items-center gap-1.5", statusInfo.bg, statusInfo.color)}>
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 dark:text-white font-medium">{int.activeConnections} Active</span>
                                                    <span className="text-xs text-gray-500">{int.totalConnections} Total</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-full", int.errorRate > 5 ? "bg-red-500" : "bg-green-500")}
                                                            style={{ width: `${Math.min(int.errorRate, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className={cn("text-sm font-medium", int.errorRate > 5 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400")}>
                                                        {int.errorRate}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-500">
                                                {int.avgSyncTime > 0 ? `${int.avgSyncTime}ms` : '-'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
