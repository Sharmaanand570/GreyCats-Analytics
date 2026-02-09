import { useEffect, useState } from "react";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { adminApi, type AdminStats } from "@/api/adminApi";

export default function SystemConfigPage() {
    const [activeTab, setActiveTab] = useState("config");
    const [stats, setStats] = useState<AdminStats | null>(null);

    // Config form state placeholder
    const [systemConfig, setSystemConfig] = useState("");

    useEffect(() => {
        if (activeTab === "monitoring") loadStats();
    }, [activeTab]);

    const loadStats = async () => {
        try {
            const data = await adminApi.getStats();
            setStats(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load system stats");
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="System Configuration"
                description="Manage global system settings and monitoring."
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="config">System Config</TabsTrigger>
                    <TabsTrigger value="security">Security & MFA</TabsTrigger>
                    <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                </TabsList>

                <TabsContent value="config" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Configuration</CardTitle>
                            <CardDescription>Edit system-wide JSON configuration.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Configuration JSON</Label>
                                <textarea
                                    className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                    value={systemConfig}
                                    onChange={(e) => setSystemConfig(e.target.value)}
                                    placeholder="{ ... }"
                                    maxLength={50000}
                                />
                            </div>
                            <Button disabled>Save Configuration (Not Implemented)</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>Manage MFA and security policies.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <Switch id="mfa-enforce" disabled />
                                <Label htmlFor="mfa-enforce">Enforce MFA for all Admins (Coming Soon)</Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="monitoring" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{stats?.mrr || 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Subs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
