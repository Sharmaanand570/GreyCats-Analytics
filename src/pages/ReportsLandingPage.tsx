
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllClients } from '../hooks/useClients';
import { useSyncStatus } from '../features/reports/hooks/useSyncStatus';
import { FileText, ArrowUpDown, Search, Loader2 } from 'lucide-react';
import { NotificationsPopover } from '../components/NotificationsPopover';
import { getProfileImageUrl } from "@/utils/imageUtils";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
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

// Helper to determine status based on integrations removed - calculation is now dynamic


const ReportsLandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: clients, isLoading } = useAllClients();
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name-asc");




    const handleClientClick = (clientId: number) => {
        navigate(`/clients/${clientId}/reports`);
    };

    const processedClients = useMemo(() => {
        if (!clients) return [];

        const result = clients.filter(client =>
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
        <div className="w-full min-h-[100dvh] flex flex-col overflow-x-hidden bg-white">
            <div className="w-full h-full flex flex-col">
                {/* Header */}
                    <div className="w-full h-[4.8em] border-b flex justify-between items-center px-5 bg-white backdrop-blur-sm sticky top-0 z-10">
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
                                <NotificationsPopover />
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
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-10 w-10 rounded-lg" />
                                                        <div className="space-y-2">
                                                            <Skeleton className="h-4 w-48" />
                                                            <Skeleton className="h-3 w-32" />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-5 w-8" />
                                                        <Skeleton className="h-3 w-16" />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Skeleton className="h-8 w-24 ml-auto rounded-md" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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
                                        {processedClients.map((client) => (
                                            <ClientRow
                                                key={client.id}
                                                client={client}
                                                onClick={handleClientClick}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
            </div>
        </div>
    );
};

interface ClientRowProps {
    client: any;
    onClick: (id: number) => void;
}

const ClientRow: React.FC<ClientRowProps> = ({ client, onClick }) => {
    const { overallProgress } = useSyncStatus(client.id);

    // Dynamic counting
    const totalIntegrations = (client.integrations?.length || 0) > 0
        ? client.integrations.length
        : (client._count
            ? Object.values(client._count).reduce((acc: number, curr: any) => acc + (typeof curr === 'number' ? curr : 0), 0)
            : 0);

    const isSyncing = overallProgress.isSyncing;

    return (
        <TableRow
            onClick={() => !isSyncing && onClick(client.id)}
            className={`transition-colors group ${isSyncing ? 'cursor-not-allowed opacity-70 bg-zinc-50' : 'cursor-pointer hover:bg-zinc-50/80'}`}
        >
            <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                    {client.logo ? (
                        <img
                            src={getProfileImageUrl(client.logo)}
                            alt={client.name}
                            className="h-10 w-10 rounded-lg object-cover border border-zinc-200 group-hover:shadow-sm transition-all"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 font-semibold group-hover:bg-white group-hover:shadow-sm transition-all">
                            {client.name.charAt(0).toUpperCase()}
                        </div>
                    )}
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
                {isSyncing ? (
                    <div className="flex items-center justify-end gap-2 text-amber-600">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-sm font-medium">Syncing data...</span>
                    </div>
                ) : (
                    <span className="text-sm font-medium text-blue-600">
                        View Reports &rarr;
                    </span>
                )}
            </TableCell>
        </TableRow>
    );
};

export default ReportsLandingPage;
