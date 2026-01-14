import { useEffect, useState } from "react";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi, type AdminStats } from "@/api/adminApi";
import { Users, Building2, CreditCard, DollarSign, Activity } from "lucide-react";
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

export default function AdminDashboard() {
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
                userGrowth: 0, // Not provided by backend
                totalClients: rawStats.totalClients || 0,
                clientGrowth: 0, // Not provided by backend
                activeSubscriptions: 0, // Not provided by backend
                mrr: 0 // Not provided by backend
            };

            setStats(finalStats);

            console.log("Stats Data:", statsData);
            console.log("Activity Data:", activityData);

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

    const StatCard = ({ title, value, subtext, icon: Icon }: { title: string, value: string | number, subtext: string, icon: any }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{value}</div>}
                {loading ? <Skeleton className="h-3 w-24 mt-1" /> : <p className="text-xs text-muted-foreground">{subtext}</p>}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Dashboard"
                description="Overview of system performance and recent activity."
            />

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || "0"}
                    subtext={`${stats?.userGrowth || 0}% from last month`}
                    icon={Users}
                />
                <StatCard
                    title="Total Clients"
                    value={stats?.totalClients || "0"}
                    subtext={`${stats?.clientGrowth || 0}% from last month`}
                    icon={Building2}
                />
                <StatCard
                    title="Active Subscriptions"
                    value={stats?.activeSubscriptions || "0"}
                    subtext="Active paid plans"
                    icon={CreditCard}
                />
                <StatCard
                    title="Monthly Revenue"
                    value={`$${stats?.mrr || "0"}`}
                    subtext="Current MRR"
                    icon={DollarSign}
                />
            </div>

            {/* Activity Feed */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : activity.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No recent activity.</TableCell>
                                    </TableRow>
                                ) : (
                                    activity.map((log: any) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">{log.adminName || "System"}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{log.action}</Badge>
                                            </TableCell>
                                            <TableCell>{log.target}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {log.timestamp || log.createdAt
                                                    ? format(new Date(log.timestamp || log.createdAt), "PP p")
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
