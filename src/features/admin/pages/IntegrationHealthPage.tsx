import { useEffect, useState } from "react";
import { AdminPageHeader } from "../components/AdminPageHeader";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/api/adminApi";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

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
                const data = await adminApi.getIntegrationHealth();
                setIntegrations(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch integration health", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHealth();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'degraded': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case 'outage': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader title="Integration Health" description="Status monitoring for third-party integrations." />

            <div className="rounded-md border bg-white dark:bg-slate-950">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Integration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Connections</TableHead>
                            <TableHead>Error Rate</TableHead>
                            <TableHead>Avg Sync Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : integrations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">No integration data available.</TableCell>
                            </TableRow>
                        ) : (
                            integrations.map((int) => (
                                <TableRow key={int.type}>
                                    <TableCell className="font-medium capitalize">{int.type.replace('_', ' ')}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(int.status)}
                                            <Badge variant="outline" className="capitalize">{int.status}</Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{int.activeConnections} Active</span>
                                            <span className="text-xs text-muted-foreground">{int.totalConnections} Total</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={int.errorRate > 5 ? "text-red-500 font-bold" : ""}>{int.errorRate}%</TableCell>
                                    <TableCell>{int.avgSyncTime}ms</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
