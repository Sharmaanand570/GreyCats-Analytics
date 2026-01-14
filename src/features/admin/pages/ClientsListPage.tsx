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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Plus, Building2 } from "lucide-react";
import { adminApi, type AdminClient } from "@/api/adminApi";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ClientsListPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<AdminClient[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getClients(page, 20, search);

            // Map backend data to frontend format
            const mappedClients = (data.clients || []).map((client: any) => ({
                ...client,
                status: client.isActive ? 'ACTIVE' : 'INACTIVE',
                integrationsCount: (client._count?.metaBusinessAccounts || 0) +
                    (client._count?.shopifyAccounts || 0) +
                    (client._count?.youtubeAccounts || 0),
                usersCount: client._count?.users || 0,
                ownerName: client.user?.fullName || null
            }));

            setClients(mappedClients);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch clients", error);
            toast.error("Failed to load clients. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchClients();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page]);

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Clients"
                description="Manage client accounts and integrations."
                action={{ label: "Add Client", onClick: () => console.log("Add Client"), icon: Plus }}
            >
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </AdminPageHeader>

            <div className="rounded-md border bg-white dark:bg-slate-950 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Client Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Integrations</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No clients found.</TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client) => (
                                <TableRow key={client.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900" onClick={() => navigate(`/admin/clients/${client.id}`)}>
                                    <TableCell>
                                        <Avatar className="h-8 w-8 rounded-md bg-blue-100 text-blue-700">
                                            <AvatarFallback className="rounded-md"><Building2 className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={client.status === "ACTIVE" ? "default" : "secondary"} className={client.status === "ACTIVE" ? "bg-blue-600 hover:bg-blue-700" : ""}>
                                            {client.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{client.ownerName || "N/A"}</TableCell>
                                    <TableCell>{client.integrationsCount}</TableCell>
                                    <TableCell>{client.usersCount}</TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigate(`/admin/clients/${client.id}`)}>
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => console.log("Archive", client.id)}>
                                                    Archive Client
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                >
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
