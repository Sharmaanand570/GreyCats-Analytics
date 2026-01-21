import { useEffect, useState } from "react";
// import { AdminPageHeader } from "../components/AdminPageHeader"; // Removed unused import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminApi, type AdminStats } from "@/api/adminApi";
import { Users, Building2, CreditCard, IndianRupee, Activity } from "lucide-react"; // Removed ArrowUpRight
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "../components/StatsCard";
import { useUserStore } from "@/utils/useUserStore";

export default function AdminDashboard() {
    const { user } = useUserStore();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, activityData] = await Promise.all([
                adminApi.getStats(),
                adminApi.getActivityLogs(1, 10)
            ]);
            // Handle wrapped responses: { success: true, stats: {...} }
            const rawStats = (statsData as any).stats || (statsData as any).data || statsData;

            // Map backend stats structure to frontend AdminStats interface
            const finalStats: AdminStats = {
                totalUsers: rawStats.totalUsers || 0,
                userGrowth: rawStats.userGrowth || 0,
                totalClients: rawStats.totalClients || 0,
                clientGrowth: rawStats.clientGrowth || 0,
                activeSubscriptions: rawStats.activeSubscriptions || 0,
                mrr: rawStats.mrr || 0
            };

            setStats(finalStats);

            // Handle activity structure: { success: true, activities: [...] }
            const finalActivities = activityData.activities || activityData.logs || activityData.data || [];
            setActivity(finalActivities);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            toast.error("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper to determine trend direction (mock logic for now as API might just give numbers)
    const getTrend = (value: number) => ({
        value: value,
        label: "from last month",
        direction: value >= 0 ? "up" as const : "down" as const
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Here's what's happening with your platform today.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Users"
                    value={loading ? "..." : stats?.totalUsers || "0"}
                    trend={loading ? undefined : getTrend(stats?.userGrowth || 0)}
                    icon={Users}
                />
                <StatsCard
                    title="Total Clients"
                    value={loading ? "..." : stats?.totalClients || "0"}
                    trend={loading ? undefined : getTrend(stats?.clientGrowth || 0)}
                    icon={Building2}
                />
                <StatsCard
                    title="Active Subscriptions"
                    value={loading ? "..." : stats?.activeSubscriptions || "0"}
                    description="Active paid plans"
                    icon={CreditCard}
                />
                <StatsCard
                    title="Monthly Revenue"
                    value={loading ? "..." : `₹${stats?.mrr || "0"}`}
                    description="Current MRR"
                    icon={IndianRupee}
                />
            </div>

            {/* Activity Feed */}
            <Card className="border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#111]">
                <CardHeader className="border-b border-gray-100 dark:border-white/5 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Activity className="h-4 w-4 text-gray-500" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription>
                                Latest actions performed across the system.
                            </CardDescription>
                        </div>
                        {/* Could add a 'View All' button here later */}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-gray-100 dark:border-white/5">
                                    <TableHead className="pl-6 w-[200px]">User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead className="text-right pr-6">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="border-gray-100 dark:border-white/5">
                                            <TableCell className="pl-6"><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell className="pr-6"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : activity.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                                            No recent activity found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    activity.map((log: any) => (
                                        <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 border-gray-100 dark:border-white/5 transition-colors">
                                            <TableCell className="pl-6 font-medium text-gray-900 dark:text-gray-200">
                                                {log.adminName || "System"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="font-normal bg-white dark:bg-black/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10"
                                                >
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-400">
                                                {log.target}
                                            </TableCell>
                                            <TableCell className="text-right pr-6 text-sm text-gray-500 dark:text-gray-500">
                                                {log.timestamp || log.createdAt
                                                    ? format(new Date(log.timestamp || log.createdAt), "MMM d, h:mm a")
                                                    : "N/A"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
