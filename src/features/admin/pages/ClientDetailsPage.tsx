import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi, type AdminClient } from "@/api/adminApi";
import { ArrowLeft, Building2, Globe, Users } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ClientDetailsPage() {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState<AdminClient | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClient = async () => {
            if (!clientId) return;
            setLoading(true);
            try {
                const data = await adminApi.getClientDetails(clientId);
                console.log("Client Details Response:", data);

                // Backend might return { success: true, client: {...} }
                const rawClient = (data as any).client || data;

                // Map backend fields to frontend
                // Map backend fields to frontend
                const totalIntegrations = (rawClient.metaBusinessAccounts?.length || 0) +
                    (rawClient.shopifyAccounts?.length || 0) +
                    (rawClient.youtubeAccounts?.length || 0) +
                    (rawClient.wooCommerceAccounts?.length || 0) +
                    (rawClient.metaAdAccounts?.length || 0) +
                    (rawClient.googleSearchConsoleProperties?.length || 0) +
                    (rawClient.googleAnalyticsProperties?.length || 0) +
                    (rawClient.metaInsights?.length || 0);

                const mappedClient = {
                    ...rawClient,
                    status: rawClient.isActive ? 'ACTIVE' : 'INACTIVE',
                    integrationsCount: totalIntegrations,
                    usersCount: rawClient.usersCount || 0,
                    ownerName: rawClient.user?.fullName || null,
                    ownerId: rawClient.user?.id || rawClient.userId
                };

                console.log("Mapped Client:", mappedClient);
                console.log("Shopify Accounts:", rawClient.shopifyAccounts);
                console.log("YouTube Accounts:", rawClient.youtubeAccounts);
                setClient(mappedClient);
            } catch (error) {
                console.error("Failed to fetch client details", error);
                toast.error("Failed to load client details.");
            } finally {
                setLoading(false);
            }
        };
        fetchClient();
    }, [clientId]);

    if (loading) return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-md" />
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

    if (!client) return <div className="p-8 text-center text-red-500">Client not found</div>;

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/clients")} className="mb-4 pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
                </Button>
                <AdminPageHeader
                    title={client.name}
                    description={`Client ID: ${client.id}`}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Client Info Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 rounded-md">
                                <AvatarFallback className="rounded-md text-2xl">{(client.name || "C").substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">{client.name}</CardTitle>
                                <CardDescription>{client.status}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Building2 className="h-4 w-4" /> Status
                            </span>
                            <Badge variant={client.status === "ACTIVE" ? "outline" : "secondary"} className={client.status === "ACTIVE" ? "text-green-600 border-green-600" : ""}>
                                {client.status}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Users className="h-4 w-4" /> Owner
                            </span>
                            <span className="text-sm font-medium hover:underline cursor-pointer" onClick={() => client.ownerId && navigate(`/ admin / users / ${client.ownerId} `)}>
                                {client.ownerName || "Unassigned"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Globe className="h-4 w-4" /> Created
                            </span>
                            <span className="text-sm font-medium">
                                {client.createdAt ? format(new Date(client.createdAt), "PP") : "N/A"}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Section - Removed tabs since backend doesn't provide integration/user details */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Information</CardTitle>
                            <CardDescription>Basic details about this client.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Connected Integrations</h4>
                                <div className="space-y-1">
                                    {(client as any).metaBusinessAccounts && (client as any).metaBusinessAccounts.length > 0 && (
                                        <div className="text-sm">• Meta Business</div>
                                    )}
                                    {(client as any).shopifyAccounts && (client as any).shopifyAccounts.length > 0 && (
                                        <div className="text-sm">• Shopify</div>
                                    )}
                                    {(client as any).youtubeAccounts && (client as any).youtubeAccounts.length > 0 && (
                                        <div className="text-sm">• YouTube</div>
                                    )}
                                    {(client as any).wooCommerceAccounts && (client as any).wooCommerceAccounts.length > 0 && (
                                        <div className="text-sm">• WooCommerce</div>
                                    )}
                                    {(client as any).metaAdAccounts && (client as any).metaAdAccounts.length > 0 && (
                                        <div className="text-sm">• Meta Ads</div>
                                    )}
                                    {(client as any).googleSearchConsoleProperties && (client as any).googleSearchConsoleProperties.length > 0 && (
                                        <div className="text-sm">• Google Search Console</div>
                                    )}
                                    {(client as any).googleAnalyticsProperties && (client as any).googleAnalyticsProperties.length > 0 && (
                                        <div className="text-sm">• Google Analytics</div>
                                    )}
                                    {(client as any).metaInsights && (client as any).metaInsights.length > 0 && (
                                        <div className="text-sm">• Meta Insights</div>
                                    )}
                                    {(!(client as any).metaBusinessAccounts?.length &&
                                        !(client as any).shopifyAccounts?.length &&
                                        !(client as any).youtubeAccounts?.length &&
                                        !(client as any).wooCommerceAccounts?.length &&
                                        !(client as any).metaAdAccounts?.length &&
                                        !(client as any).googleSearchConsoleProperties?.length &&
                                        !(client as any).googleAnalyticsProperties?.length &&
                                        !(client as any).metaInsights?.length) && (
                                            <p className="text-sm text-muted-foreground">No integrations connected</p>
                                        )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
