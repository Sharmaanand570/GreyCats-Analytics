import { useEffect, useState } from "react";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { adminApi, type FeatureFlag, type AdminStats } from "@/api/adminApi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SystemConfigPage() {
    const [activeTab, setActiveTab] = useState("features");
    const [features, setFeatures] = useState<FeatureFlag[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(false);

    // Config form state placeholder
    const [systemConfig, setSystemConfig] = useState("");

    useEffect(() => {
        if (activeTab === "features") loadFeatures();
        if (activeTab === "monitoring") loadStats();
    }, [activeTab]);

    const loadFeatures = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getFeatureFlags();
            setFeatures(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load feature flags");
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getStats();
            setStats(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load system stats");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeature = async (flag: FeatureFlag) => {
        try {
            await adminApi.updateFeatureFlag(flag.name, { enabled: !flag.enabled });
            toast.success(`Feature ${flag.name} updated`);
            loadFeatures();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update feature");
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="System Configuration"
                description="Manage global system settings, feature flags, and monitoring."
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="features">Feature Flags</TabsTrigger>
                    <TabsTrigger value="config">System Config</TabsTrigger>
                    <TabsTrigger value="security">Security & MFA</TabsTrigger>
                    <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                </TabsList>

                <TabsContent value="features" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Feature Flags</CardTitle>
                            <CardDescription>Manage global feature toggles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Feature Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {features.map((flag) => (
                                        <TableRow key={flag.id}>
                                            <TableCell className="font-medium">{flag.name}</TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={flag.enabled}
                                                    onChange={() => handleToggleFeature(flag)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {features.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">No feature flags found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

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
