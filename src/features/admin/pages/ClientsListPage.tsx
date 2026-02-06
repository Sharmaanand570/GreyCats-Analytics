import { useEffect, useState } from "react";
// import { AdminPageHeader } from "../components/AdminPageHeader"; // Removed unused
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
import { Card } from "@/components/ui/card"; // Removed unused Card sub-components
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Building2, User, ArrowRightLeft, Trash2 } from "lucide-react";
import { adminApi, type AdminClient } from "@/api/adminApi";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getProfileImageUrl } from "@/utils/imageUtils";

export default function ClientsListPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<AdminClient[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [transferDialogOpen, setTransferDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null);
    const [newOwnerId, setNewOwnerId] = useState<string>("");
    const [potentialOwners, setPotentialOwners] = useState<any[]>([]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getClients(page, 20, search);

            const mappedClients = (data.clients || []).map((client: any) => ({
                ...client,
                status: client.isActive ? 'ACTIVE' : 'INACTIVE',
                integrationsCount: client.integrationCount || 0,
                usersCount: client._count?.users || 0,
                ownerName: client.user?.fullName || null
            }));

            setClients(mappedClients);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch clients", error);
            toast.error("Failed to load clients.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPotentialOwners = async () => {
        try {
            const data = await adminApi.getUsers(1, 100);
            setPotentialOwners(data.users);
        } catch (error) {
            console.error("Failed to fetch owners", error);
        }
    };

    const handleTransferClient = async () => {
        if (!selectedClient || !newOwnerId) return;
        try {
            await adminApi.transferClient(selectedClient.id, Number(newOwnerId));
            toast.success("Client ownership transferred successfully");
            setTransferDialogOpen(false);
            fetchClients();
        } catch (error) {
            console.error("Failed to transfer client", error);
            toast.error("Failed to transfer client");
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchClients();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Clients</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your client organizations and their workspaces.
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search clients..."
                        className="pl-9 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 focus-visible:ring-gray-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#111]">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                                <TableHead className="w-[60px] pl-6"></TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Client Name</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Owner</TableHead>
                                <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-300">Integrations</TableHead>
                                <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-300">Users</TableHead>
                                <TableHead className="text-right pr-6 font-semibold text-gray-700 dark:text-gray-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-gray-100 dark:border-white/5">
                                        <TableCell className="pl-6"><Skeleton className="h-9 w-9 rounded-lg" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                                        <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                                        <TableCell className="pr-6"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : clients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-48 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Building2 className="h-8 w-8 mb-2 opacity-50" />
                                            <p>No clients found matching your search.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clients.map((client) => (
                                    <TableRow
                                        key={client.id}
                                        className="cursor-pointer group hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-white/5 transition-colors"
                                        onClick={() => navigate(`/admin/clients/${client.id}`)}
                                    >
                                        <TableCell className="pl-6 py-4">
                                            <Avatar className="h-9 w-9 rounded-lg border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                                                <AvatarImage src={getProfileImageUrl(client.logo)} alt={client.name} className="object-contain" />
                                                <AvatarFallback className="rounded-lg bg-gray-50 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                                    {client.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900 dark:text-white">
                                            {client.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`font-medium border-0 px-2.5 py-0.5 ${client.status === "ACTIVE"
                                                    ? "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                                    }`}
                                            >
                                                {client.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                                <User className="h-3.5 w-3.5" />
                                                {client.ownerName || "No Owner"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center text-gray-600 dark:text-gray-400">
                                            {client.integrationsCount}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-600 dark:text-gray-400">
                                            {client.usersCount}
                                        </TableCell>
                                        <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => navigate(`/admin/clients/${client.id}`)}>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedClient(client);
                                                        setTransferDialogOpen(true);
                                                        fetchPotentialOwners();
                                                    }}>
                                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                        Transfer Ownership
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
                                                        onClick={async () => {
                                                            if (confirm("Are you sure you want to delete this client? This cannot be undone.")) {
                                                                try {
                                                                    await adminApi.deleteClient(client.id);
                                                                    toast.success("Client deleted successfully");
                                                                    fetchClients();
                                                                } catch (error) {
                                                                    console.error("Failed to delete client", error);
                                                                    toast.error("Failed to delete client");
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Client
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
            </Card>

            <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing page {page} of {totalPages}
                </p>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="h-8 border-gray-200 dark:border-white/10"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading}
                        className="h-8 border-gray-200 dark:border-white/10"
                    >
                        Next
                    </Button>
                </div>
            </div>

            <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transfer Ownership</DialogTitle>
                        <DialogDescription>
                            Select a new owner for {selectedClient?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="owner" className="text-right">
                                New Owner
                            </Label>
                            <Select value={newOwnerId} onValueChange={setNewOwnerId}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {potentialOwners.length > 0 ? (
                                        potentialOwners.map((u: any) => (
                                            <SelectItem key={u.id} value={u.id.toString()}>
                                                {u.fullName} ({u.email})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-gray-500">No users found</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleTransferClient}>Transfer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
