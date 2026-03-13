import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients, useDeleteClient } from '../hooks/useClients';
import { Plus, Building2, Activity, ArrowUpDown, Trash2, Edit2 } from 'lucide-react';
import { FiSearch, FiBell } from "react-icons/fi";
import { Button } from '../components/ui/button';
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import ClientFormModal from '../components/clients/ClientFormModal';
import { cn } from "@/lib/utils";
import { getProfileImageUrl } from "@/utils/imageUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Client } from "@/types/client.types";
import { getPlatformConfig } from "@/utils/platformMapping";

// Helper to determine status based on integrations (Simulated logic for demo)
const getClientHealth = (client: any) => {
    const totalIntegrations =
        (client._count?.metaBusinessAccounts || 0) +
        (client._count?.metaAdsAccounts || 0) +
        (client._count?.metaInsightsAccounts || 0) +
        (client._count?.youtubeAccounts || 0) +
        (client._count?.shopifyAccounts || 0) +
        (client._count?.woocommerceAccounts || 0) +
        (client._count?.googleSearchConsoleAccounts || 0) +
        (client._count?.googleAnalyticsAccounts || 0);

    if (totalIntegrations > 3) return 'healthy';
    if (totalIntegrations > 0) return 'warning';
    return 'critical'; // No integrations
};

const ClientsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: clients, isLoading, isError, refetch } = useClients();
    const { mutate: deleteClient } = useDeleteClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name-asc");
    const [filterStatus, setFilterStatus] = useState("all");

    const handleClientClick = (clientId: number) => {
        navigate(`/clients/${clientId}`);
    };

    const processedClients = useMemo(() => {
        if (!clients) return [];

        let result = clients.filter(client =>
            client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Filter
        if (filterStatus !== 'all') {
            result = result.filter(client => {
                const health = getClientHealth(client);
                if (filterStatus === 'healthy') return health === 'healthy';
                if (filterStatus === 'warning') return health === 'warning';
                if (filterStatus === 'critical') return health === 'critical';
                if (filterStatus === 'inactive') return !client.isActive;
                return true;
            });
        }

        // Sort
        result.sort((a, b) => {
            const healthA = getClientHealth(a);
            const healthB = getClientHealth(b);
            const integrationsA = (a._count?.metaBusinessAccounts || 0) + (a._count?.metaAdsAccounts || 0); // Simplified for sorting demo
            const integrationsB = (b._count?.metaBusinessAccounts || 0) + (b._count?.metaAdsAccounts || 0);

            switch (sortBy) {
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                case 'date-new': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'date-old': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'health-critical':
                    // Critical first (no ints), then warning, then healthy
                    const score = (h: string) => h === 'critical' ? 0 : h === 'warning' ? 1 : 2;
                    return score(healthA) - score(healthB);
                case 'integrations-high': return integrationsB - integrationsA; // Demo approximation
                default: return 0;
            }
        });

        return result;
    }, [clients, searchQuery, sortBy, filterStatus]);

    return (
        <div className="w-full h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
            <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
                <div className="w-full h-full flex flex-col">
                    {/* Header */}
                    <div className="w-full h-[4.8em] border-b flex justify-between items-center px-5 bg-white/50 backdrop-blur-sm sticky top-0 z-10 box-border">
                        <span className="font-medium text-base text-zinc-800 tracking-wide">Clients</span>
                        <div className="flex items-center gap-4">

                            {/* Control Bar - Filters & Sort */}
                            <div className="hidden lg:flex items-center gap-2 mr-2">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[140px] h-9 bg-white border-zinc-200">
                                        <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-zinc-400" />
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                        <SelectItem value="date-new">Date (Newest)</SelectItem>
                                        <SelectItem value="date-old">Date (Oldest)</SelectItem>
                                        <SelectItem value="health-critical">Health (Critical Issues)</SelectItem>
                                    </SelectContent>
                                </Select>


                            </div>

                            <div className="relative hidden md:block w-56">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    className="pl-9 h-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center border-l pl-4 gap-3">
                                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                    <FiBell className="text-lg" />
                                </button>
                                <Button
                                    onClick={() => {
                                        setEditingClient(null);
                                        setIsModalOpen(true);
                                    }}
                                    className="rounded-[0.4rem] bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Client
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                                <div className="p-4 rounded-full bg-red-50 mb-4">
                                    <Activity className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-zinc-900 mb-2">Failed to load clients</h3>
                                <p className="text-gray-500 mb-6 max-w-sm">
                                    We encountered an issue while fetching your clients. Please try again.
                                </p>
                                <Button onClick={() => refetch()} variant="outline">
                                    Retry
                                </Button>
                            </div>
                        ) : processedClients?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[60vh]">
                                <div className="p-8 rounded-full bg-gray-50 mb-6">
                                    <Building2 className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-zinc-900 mb-2">No matching clients</h3>
                                <p className="text-gray-500 text-center mb-8 max-w-sm">
                                    Try adjusting your filters or search query to find who you're looking for.
                                </p>
                                <Button onClick={() => { setSearchQuery(''); setFilterStatus('all'); }} size="lg" variant="outline" className="rounded-full px-8">
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {processedClients.map((clientData) => {
                                    const client = clientData as any; // Cast for now as processedClients type inference might still be Client[]
                                    const countFromStructure =
                                        (client._count?.metaBusinessAccounts || 0) +
                                        (client._count?.metaAdsAccounts || client._count?.metaAdAccounts || 0) +
                                        (client._count?.metaInsightsAccounts || client._count?.metaInsights || 0) +
                                        (client._count?.youtubeAccounts || 0) +
                                        (client._count?.shopifyAccounts || 0) +
                                        (client._count?.woocommerceAccounts || client._count?.wooCommerceAccounts || 0) +
                                        (client._count?.googleAnalyticsAccounts || client._count?.googleAnalyticsProperties || client._count?.platformAccounts || 0);

                                    const totalIntegrations = (client.integrations?.length || 0) > 0
                                        ? client.integrations.length
                                        : countFromStructure;

                                    const status = getClientHealth(client);

                                    return (
                                        <div
                                            key={client.id}
                                            onClick={() => handleClientClick(client.id)}
                                            className={cn(
                                                "group relative flex flex-col justify-between p-5 h-52 border rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
                                                // Status Tints
                                                status === 'healthy' ? "bg-white hover:border-zinc-300" :
                                                    status === 'warning' ? "bg-amber-50/30 border-amber-100 hover:border-amber-200" :
                                                        "bg-red-50/20 border-red-100 hover:border-red-200"
                                            )}
                                        >


                                            <div className="flex flex-col items-start w-full relative z-10">
                                                <div className="flex justify-between w-full mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 rounded-md border border-zinc-100">
                                                            <AvatarImage
                                                                src={client.logo ? `${getProfileImageUrl(client.logo)}?v=${new Date(client.updatedAt).getTime()}` : undefined}
                                                                alt={client.name}
                                                                className="object-contain"
                                                            />
                                                            <AvatarFallback className={cn(
                                                                "rounded-md",
                                                                status === 'healthy' ? "bg-zinc-50 text-zinc-900 group-hover:bg-zinc-100" :
                                                                    status === 'warning' ? "bg-amber-100/50 text-amber-700" :
                                                                        "bg-red-100/50 text-red-700"
                                                            )}>
                                                                <Building2 className="w-5 h-5" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {client.isActive && (
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100/50 border border-green-200">
                                                                <span className="relative flex h-2 w-2">
                                                                    <span className="animate-pulse-green absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                                </span>
                                                                <span className="text-[10px] font-bold text-green-700 tracking-wide">LIVE</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingClient(client);
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete the client
                                                                        <span className="font-semibold text-zinc-900"> "{client.name}" </span>
                                                                        and remove their data from our servers.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => deleteClient(client.id)}
                                                                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                                                    >
                                                                        Delete Client
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>


                                                <h3 className="font-semibold text-base text-zinc-900 leading-snug line-clamp-1 text-left w-full group-hover:text-black transition-colors tracking-normal">
                                                    {client.name}
                                                </h3>
                                                {client.description && (
                                                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mt-1 tracking-normal">
                                                        {client.description}
                                                    </p>
                                                )}

                                            </div>

                                            <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-black/5 relative z-10">
                                                <div className="flex items-center gap-1">
                                                    {/* Integration Logos as Circles */}
                                                    {client.integrations && client.integrations.length > 0 ? (
                                                        <>
                                                            <div className="flex -space-x-2">
                                                                {client.integrations.slice(0, 4).map((integration: any, idx: number) => {
                                                                    // Determine the actual platform type
                                                                    let platformType = integration.integrationType;

                                                                    // For meta-business and meta-insights, check if it's Facebook or Instagram
                                                                    if (platformType === 'meta-business' || platformType === 'meta-insights') {
                                                                        // Check account name or identifier for instagram keywords
                                                                        const nameOrIdentifier = (integration.accountName || integration.accountIdentifier || '').toLowerCase();
                                                                        if (nameOrIdentifier.includes('instagram') || integration.instagramBusinessId || integration.instagramUsername) {
                                                                            platformType = 'meta-instagram';
                                                                        } else if (integration.pageId || integration.pageName || nameOrIdentifier.includes('facebook') || nameOrIdentifier.includes('page')) {
                                                                            platformType = 'meta-facebook';
                                                                        }
                                                                    }

                                                                    console.log('🔍 Debug Integration:', {
                                                                        type: integration.integrationType,
                                                                        detectedAs: platformType,
                                                                        accountName: integration.accountName,
                                                                        full: integration
                                                                    });

                                                                    const platformConfig = getPlatformConfig(platformType);
                                                                    const Icon = platformConfig?.icon;

                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className="h-7 w-7 rounded-full border-2 border-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110"
                                                                            style={{ backgroundColor: platformConfig?.color || '#71717a' }}
                                                                            title={platformConfig?.name || integration.accountName || platformType}
                                                                        >
                                                                            {Icon && <Icon className="w-3.5 h-3.5 text-white" />}
                                                                        </div>
                                                                    );
                                                                })}
                                                                {client.integrations.length > 4 && (
                                                                    <div className="h-7 w-7 rounded-full border-2 border-white flex items-center justify-center bg-zinc-200 shadow-sm">
                                                                        <span className="text-[10px] font-bold text-zinc-600">+{client.integrations.length - 4}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-zinc-500 text-[11px] font-medium ml-2">
                                                                {client.integrations.length} {client.integrations.length === 1 ? 'integration' : 'integrations'}
                                                            </span>
                                                        </>
                                                    ) : totalIntegrations > 0 ? (
                                                        // Fallback to old display if integrations array not available
                                                        <>
                                                            <Activity className="w-3.5 h-3.5 text-zinc-400" />
                                                            <span className="text-zinc-600 text-[11px] font-medium">
                                                                {totalIntegrations} Connected
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-zinc-400 text-[11px] font-medium italic">
                                                            No integrations
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Hover Action "Quick Peek" */}
                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-zinc-100">
                                                    <span className="text-[10px] font-bold text-zinc-900">View Client →</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Client Form Modal */}
            <ClientFormModal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingClient(null);
                }}
                // Pass the latest version of the client from the list if available
                client={editingClient ? (clients?.find(c => c.id === editingClient.id) || editingClient) : null}
            />
        </div>
    );
};

export default ClientsPage;
