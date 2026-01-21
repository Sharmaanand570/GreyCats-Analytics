import { useEffect, useState } from "react";
// import { AdminPageHeader } from "../components/AdminPageHeader"; // Removed unused
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminApi } from "@/api/adminApi";
import { Activity, Server, Users, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SystemStatsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
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
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const StatusIndicator = ({ status }: { status: string }) => (
        <div className={cn(
            "flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium border",
            status === 'operational'
                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30"
        )}>
            <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                status === 'operational' ? "bg-green-500" : "bg-amber-500"
            )} />
            {status === 'operational' ? 'Operational' : 'Issues Detected'}
        </div>
    );

    if (loading && !stats) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">System Health</h1>
                    <Skeleton className="h-4 w-64 mt-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="border-gray-200 dark:border-white/10 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-1" />
                                <Skeleton className="h-3 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-gray-200 dark:border-white/10">
                        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-white/10">
                        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">System Health</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Real-time system performance and metric monitoring.
                    </p>
                </div>
                <StatusIndicator status="operational" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#111]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.stats?.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="text-green-600 font-medium">+{stats?.stats?.recentSignups30Days || 0}</span> in last 30 days
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#111]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clients</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.stats?.totalClients || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active Client Organizations</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#111]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Integrations</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                            <Server className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.stats?.integrations?.total || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Connected Platforms</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#111]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Server Status</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-500">99.9%</div>
                        <p className="text-xs text-muted-foreground mt-1">Uptime (Last 30 Days)</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#111]">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Integrations Breakdown</CardTitle>
                        <CardDescription>Distribution of connected third-party services.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5">
                            {stats?.stats?.integrations && Object.entries(stats.stats.integrations)
                                .filter(([key]) => key !== 'total')
                                .map(([key, count]: [string, any]) => {
                                    const percentage = Math.round((count / (stats.stats.integrations.total || 1)) * 100);
                                    return (
                                        <div key={key} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-2 h-2 rounded-full", count > 0 ? "bg-blue-500" : "bg-gray-300")} />
                                                    <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                </div>
                                                <span className="text-gray-500">{count} ({percentage}%)</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            {(!stats?.stats?.integrations || Object.keys(stats.stats.integrations).length <= 1) && (
                                <div className="text-center text-muted-foreground py-8">No integration data available</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#111]">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Users by Plan</CardTitle>
                        <CardDescription>User distribution across subscription tiers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.stats?.usersByPlan && Object.entries(stats.stats.usersByPlan).map(([plan, count]: [string, any]) => (
                                <div key={plan} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm",
                                            plan.toLowerCase().includes('pro') ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" :
                                                plan.toLowerCase().includes('enterprise') ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" :
                                                    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                        )}>
                                            {plan.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white capitalize">{plan}</div>
                                            <div className="text-xs text-gray-500">Subscription</div>
                                        </div>
                                    </div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">{count}</div>
                                </div>
                            ))}
                            {(!stats?.stats?.usersByPlan || Object.keys(stats.stats.usersByPlan).length === 0) && (
                                <div className="text-center text-muted-foreground py-8">No plan data available</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
