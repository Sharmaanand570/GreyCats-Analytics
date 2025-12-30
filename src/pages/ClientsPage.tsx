import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import { Plus, Building2, TrendingUp, Activity, ArrowUpDown } from 'lucide-react';
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
import AddClientModal from '../components/clients/AddClientModal';
import { cn } from "@/lib/utils";

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
    const { data: clients, isLoading } = useClients();
    const [showAddModal, setShowAddModal] = useState(false);
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
                        <span className="font-medium text-xl text-zinc-800">Clients</span>
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
                                    onClick={() => setShowAddModal(true)}
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
                                {processedClients.map((client) => {
                                    const totalIntegrations =
                                        (client._count?.metaBusinessAccounts || 0) +
                                        (client._count?.metaAdsAccounts || 0) +
                                        (client._count?.metaInsightsAccounts || 0) +
                                        (client._count?.youtubeAccounts || 0) +
                                        (client._count?.shopifyAccounts || 0) +
                                        (client._count?.woocommerceAccounts || 0) +
                                        (client._count?.googleSearchConsoleAccounts || 0) +
                                        (client._count?.googleAnalyticsAccounts || 0);

                                    const status = getClientHealth(client);

                                    return (
                                        <div
                                            key={client.id}
                                            onClick={() => handleClientClick(client.id)}
                                            className={cn(
                                                "group relative flex flex-col justify-between p-5 h-56 border rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
                                                // Status Tints
                                                status === 'healthy' ? "bg-white hover:border-zinc-300" :
                                                    status === 'warning' ? "bg-amber-50/30 border-amber-100 hover:border-amber-200" :
                                                        "bg-red-50/20 border-red-100 hover:border-red-200"
                                            )}
                                        >
                                            {/* Micro-Chart Background (Decorative) */}
                                            <div className="absolute right-0 bottom-0 w-32 h-20 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                                                <svg viewBox="0 0 100 40" className="w-full h-full fill-none stroke-current text-zinc-900">
                                                    <path d="M0 30 Q 10 25 20 28 T 40 20 T 60 25 T 80 15 T 100 5" strokeWidth="3" />
                                                </svg>
                                            </div>

                                            <div className="flex flex-col items-start w-full relative z-10">
                                                <div className="flex justify-between w-full mb-4">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-md border flex items-center justify-center transition-colors",
                                                        status === 'healthy' ? "bg-zinc-50 border-zinc-100 text-zinc-900 group-hover:bg-zinc-100" :
                                                            status === 'warning' ? "bg-amber-100/50 border-amber-100 text-amber-700" :
                                                                "bg-red-100/50 border-red-100 text-red-700"
                                                    )}>
                                                        <Building2 className="w-5 h-5" />
                                                    </div>
                                                </div>

                                                <h3 className="font-bold text-lg text-zinc-900 leading-tight line-clamp-1 text-left w-full group-hover:text-black transition-colors">
                                                    {client.name}
                                                </h3>

                                                {/* Micro-Trend (Simulated) */}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-zinc-400 font-medium">Last 7 Days</span>
                                                    <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                                        <TrendingUp className="w-3 h-3 mr-1" /> +12%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-black/5 relative z-10">
                                                <div className="flex items-center gap-1.5">
                                                    <Activity className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span className="text-zinc-600 text-[11px] font-medium">
                                                        {totalIntegrations} Connected
                                                    </span>
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

            {/* Add Client Modal */}
            <AddClientModal open={showAddModal} onClose={() => setShowAddModal(false)} />
        </div>
    );
};

export default ClientsPage;
