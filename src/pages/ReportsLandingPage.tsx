
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import { Building2, FileText, ArrowUpDown, Filter, Search } from 'lucide-react';
import { FiBell } from "react-icons/fi";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { cn } from "@/lib/utils";

// Helper to determine status based on integrations
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

const ReportsLandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: clients, isLoading } = useClients();
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name-asc");

    const handleClientClick = (clientId: number) => {
        navigate(`/clients/${clientId}/reports`);
    };

    const processedClients = useMemo(() => {
        if (!clients) return [];

        let result = clients.filter(client =>
            client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                case 'date-new': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'date-old': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                default: return 0;
            }
        });

        return result;
    }, [clients, searchQuery, sortBy]);

    return (
        <div className="w-full h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
            <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
                <div className="w-full h-full flex flex-col">
                    {/* Header */}
                    <div className="w-full h-[4.8em] border-b flex justify-between items-center px-5 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                        <span className="font-medium text-xl text-zinc-800">Reports</span>
                        <div className="flex items-center gap-4">
                            {/* Controls */}
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
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="relative hidden md:block w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    className="pl-9 h-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    placeholder="Search clients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center border-l pl-4 gap-3">
                                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                    <FiBell className="text-lg" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-zinc-900">Select a Client</h2>
                            <p className="text-sm text-gray-500">Choose a client to view and manage their reports.</p>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : clients?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[60vh]">
                                <div className="p-8 rounded-full bg-gray-50 mb-6">
                                    <FileText className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-zinc-900 mb-2">No clients found</h3>
                                <p className="text-gray-500 text-center mb-8 max-w-sm">
                                    You need to have clients to view reports.
                                </p>
                            </div>
                        ) : processedClients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[40vh]">
                                <h3 className="text-lg font-medium text-zinc-900 mb-2">No matching results</h3>
                                <p className="text-gray-500 text-center">
                                    Try adjusting your search.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                                <Table>
                                    <TableHeader className="bg-zinc-50/50">
                                        <TableRow>
                                            <TableHead className="w-[400px]">Client Name</TableHead>
                                            <TableHead>Integrations</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
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

                                            return (
                                                <TableRow
                                                    key={client.id}
                                                    onClick={() => handleClientClick(client.id)}
                                                    className="cursor-pointer hover:bg-zinc-50/80 transition-colors group"
                                                >
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                                <Building2 className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-zinc-900">{client.name}</div>
                                                                <div className="text-xs text-zinc-500 line-clamp-1">{client.description || "No description"}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-zinc-700">{totalIntegrations}</span>
                                                            <span className="text-zinc-500 text-xs">Connected</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            View Reports &rarr;
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsLandingPage;
