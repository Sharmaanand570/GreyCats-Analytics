import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi, type AdminUser, type AdminClient, type AdminSubscription } from "@/api/adminApi";
import { ArrowLeft, User, Shield, Calendar, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function UserDetailsPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [user, setUser] = useState<AdminUser | null>(null);
    const [clients, setClients] = useState<AdminClient[]>([]);
    const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const [userData, clientsData, subsData] = await Promise.all([
                adminApi.getUserDetails(userId),
                adminApi.getClients(1, 100, "", userId), // Fetch user's clients
                adminApi.getUserSubscriptions(userId)
            ]);
            // Backend returns { success: true, user: {...} }
            const rawUser = (userData as any).user || userData;

            // Map backend fields to frontend AdminUser interface
            const totalIntegrations = (rawUser.MetaBusinessAccount?.length || 0) +
                (rawUser.shopifyData?.length || 0) +
                (rawUser.YouTubeAccount?.length || 0);

            const mappedUser = {
                ...rawUser,
                status: rawUser.isActive ? 'ACTIVE' : 'SUSPENDED',
                clientsCount: rawUser.clients?.length || 0,
                integrationsCount: totalIntegrations
            };

            setUser(mappedUser);
            console.log("User Data:", userData);
            console.log("Mapped User:", mappedUser);
            console.log("Status check - isActive:", rawUser.isActive, "-> status:", mappedUser.status);

            // Backend returns { success: true, clients: [...] } or direct array
            const rawClients = (clientsData as any).clients || clientsData;

            // Map clients to include integrations count and status
            const mappedClients = rawClients.map((client: any) => ({
                ...client,
                status: client.isActive ? 'ACTIVE' : 'INACTIVE',
                integrationsCount: (client._count?.metaBusinessAccounts || 0) +
                    (client._count?.shopifyAccounts || 0) +
                    (client._count?.youtubeAccounts || 0)
            }));

            setClients(mappedClients);
            console.log("Clients Data:", clientsData);
            console.log("Mapped Clients:", mappedClients);

            setSubscriptions(subsData || []);
        } catch (error) {
            console.error("Failed to fetch user data", error);
            toast.error("Failed to load user details.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusChange = async (newStatus: 'ACTIVE' | 'SUSPENDED') => {
        if (!user) return;
        try {
            // Optimistic update
            setUser({ ...user, status: newStatus });
            await adminApi.updateUserStatus(user.id, newStatus);
            toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'} successfully.`);
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update status.");
            fetchData(); // Revert
        }
    };

    if (loading) return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-64 col-span-1" />
                <Skeleton className="h-64 col-span-2" />
            </div>
        </div>
    );

    if (!user) return <div className="p-8 text-center text-red-500">User not found</div>;

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")} className="mb-4 pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
                </Button>
                <AdminPageHeader
                    title={user.fullName}
                    description={user.email}
                    action={{
                        label: "Impersonate",
                        onClick: async () => {
                            try {
                                const response = await adminApi.impersonateUser(user.id);
                                if (response.success && response.impersonationToken) {
                                    // Save the original admin token FIRST using the correct key
                                    const TOKEN_KEY = 'ANALYTICS_TOKEN_KEY_';
                                    const currentToken = localStorage.getItem(TOKEN_KEY);
                                    console.log('Current token before impersonation:', currentToken);

                                    if (currentToken) {
                                        localStorage.setItem('originalToken', currentToken);
                                        console.log('Saved originalToken:', localStorage.getItem('originalToken'));
                                    }

                                    // Then store the impersonation tokens
                                    localStorage.setItem('impersonationToken', response.impersonationToken);
                                    localStorage.setItem(TOKEN_KEY, response.impersonationToken);

                                    console.log('After setting impersonation token:');
                                    console.log('- originalToken:', localStorage.getItem('originalToken'));
                                    console.log('- ANALYTICS_TOKEN_KEY_:', localStorage.getItem(TOKEN_KEY));
                                    console.log('- impersonationToken:', localStorage.getItem('impersonationToken'));

                                    // Clear all cached queries to prevent stale data
                                    queryClient.clear();

                                    toast.success(`Now impersonating ${user.fullName}`);

                                    // Small delay to ensure localStorage writes complete, then reload
                                    setTimeout(() => {
                                        window.location.href = '/#/';
                                    }, 100);
                                } else {
                                    toast.error('Failed to start impersonation session');
                                }
                            } catch (error) {
                                console.error('Impersonation error:', error);
                                toast.error('Failed to impersonate user');
                            }
                        },
                        icon: User
                    }}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Info Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="text-xl">{(user.fullName || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">{user.fullName}</CardTitle>
                                <CardDescription>{user.role}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Shield className="h-4 w-4" /> Status
                            </span>
                            <span className={`text-sm font-medium ${user.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
                                {user.status || ((user as any).isActive ? "ACTIVE" : "SUSPENDED")}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Joined
                            </span>
                            <span className="text-sm font-medium">
                                {user.createdAt ? format(new Date(user.createdAt), "PPP") : "N/A"}
                            </span>
                        </div>

                        <div className="pt-4 flex gap-2">
                            {user.status === "ACTIVE" ? (
                                <Button variant="destructive" className="w-full" onClick={() => handleStatusChange("SUSPENDED")}>
                                    <UserX className="mr-2 h-4 w-4" /> Suspend
                                </Button>
                            ) : (
                                <Button variant="outline" className="w-full text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleStatusChange("ACTIVE")}>
                                    <UserCheck className="mr-2 h-4 w-4" /> Activate
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Details Tabs */}
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="clients" className="w-full">
                        <TabsList>
                            <TabsTrigger value="clients">Clients ({clients.length})</TabsTrigger>
                            <TabsTrigger value="subscriptions">Subscriptions ({subscriptions.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="clients" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Managed Clients</CardTitle>
                                    <CardDescription>Clients owned or managed by this user.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {clients.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Integrations</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {clients.map(client => (
                                                    <TableRow key={client.id}>
                                                        <TableCell className="font-medium">{client.name}</TableCell>
                                                        <TableCell><Badge variant="outline">{client.status}</Badge></TableCell>
                                                        <TableCell>{client.integrationsCount}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/clients/${client.id}`)}>
                                                                View
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">No clients found for this user.</div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="subscriptions" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Subscription History</CardTitle>
                                    <CardDescription>Active and past subscriptions.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {subscriptions.length > 0 ? (
                                        <div className="space-y-4">
                                            {subscriptions.map(sub => (
                                                <div key={sub.id} className="flex items-center justify-between border p-4 rounded-md">
                                                    <div>
                                                        <div className="font-medium">{sub.planName}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Ends: {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), "PP") : "N/A"}
                                                        </div>
                                                    </div>
                                                    <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>{sub.status}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">No subscriptions found.</div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
