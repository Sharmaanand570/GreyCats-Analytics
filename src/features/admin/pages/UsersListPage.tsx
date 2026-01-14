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
import { MoreHorizontal, Search, UserCog, UserPlus } from "lucide-react";
import { adminApi, type AdminUser } from "@/api/adminApi";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function UsersListPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getUsers(page, 20, search);
            setUsers(data.users || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page]);

    const handleRowClick = (userId: number) => {
        navigate(`/admin/users/${userId}`);
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Users"
                description="Manage all users and their access."
                action={{ label: "Add User", onClick: () => console.log("Add User"), icon: UserPlus }}
            >
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
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
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Clients</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No users found.</TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900" onClick={() => handleRowClick(user.id)}>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.fullName}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === "SUPER_ADMIN" ? "default" : user.role === "ADMIN" ? "secondary" : "outline"}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === "ACTIVE" ? "outline" : "destructive"} className={user.status === "ACTIVE" ? "text-green-600 border-green-600" : ""}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.clientsCount}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)}>
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={async () => {
                                                    try {
                                                        const TOKEN_KEY = 'ANALYTICS_TOKEN_KEY_';
                                                        const response = await adminApi.impersonateUser(user.id);
                                                        if (response.success && response.impersonationToken) {
                                                            const currentToken = localStorage.getItem(TOKEN_KEY);
                                                            if (currentToken) {
                                                                localStorage.setItem('originalToken', currentToken);
                                                            }
                                                            localStorage.setItem('impersonationToken', response.impersonationToken);
                                                            localStorage.setItem(TOKEN_KEY, response.impersonationToken);

                                                            toast.success(`Now impersonating ${user.fullName}`);
                                                            setTimeout(() => {
                                                                window.location.href = '/';
                                                            }, 100);
                                                        } else {
                                                            toast.error('Failed to start impersonation session');
                                                        }
                                                    } catch (error) {
                                                        console.error('Impersonation error:', error);
                                                        toast.error('Failed to impersonate user');
                                                    }
                                                }}>
                                                    <UserCog className="mr-2 h-4 w-4" /> Impersonate
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
