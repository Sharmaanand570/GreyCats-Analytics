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
import { MoreHorizontal, Search, UserCog } from "lucide-react";
import { adminApi, type AdminUser } from "@/api/adminApi";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
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
import { useUserStore } from "@/utils/useUserStore";

export default function UsersListPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user: currentUser, logout, fetchProfile } = useUserStore();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selfDemoteWarning, setSelfDemoteWarning] = useState(false);
    const [newRole, setNewRole] = useState<'USER' | 'ADMIN' | 'SUPER_ADMIN'>('USER');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getUsers(page, 20, search);

            console.log("Users data:", data);

            // Map backend fields to the interface
            const mappedUsers = (data.users || []).map((user: any) => ({
                ...user,
                // isActive is now available in the API
                status: user.isActive ? 'ACTIVE' : 'SUSPENDED',
                // API returns 'clientCount', map to component's 'clientsCount'
                clientsCount: typeof user.clientCount === 'number'
                    ? user.clientCount
                    : (user.clients?.length || user._count?.clients || 0)
            }));

            setUsers(mappedUsers);
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

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setActionLoading(true);
        try {
            await adminApi.deleteUser(selectedUser.id);
            toast.success("User deleted successfully");
            setDeleteDialogOpen(false);
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete user");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateRole = async () => {
        if (!selectedUser) return;

        // SECURITY: Check if admin is trying to demote themselves
        const isSelfDemotion = selectedUser.id === currentUser?.id &&
            newRole === 'USER' &&
            (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN');

        // Show warning dialog first if self-demoting
        if (isSelfDemotion && !selfDemoteWarning) {
            setSelfDemoteWarning(true);
            return; // Don't proceed yet, wait for confirmation
        }

        setActionLoading(true);
        try {
            await adminApi.updateUserRole(selectedUser.id, newRole);

            // SECURITY: If user changed their own role
            if (selectedUser.id === currentUser?.id) {
                // If demoted to USER, force logout immediately
                if (isSelfDemotion) {
                    toast.success("Your role has been changed to USER. Logging out for security...");
                    setRoleDialogOpen(false);
                    setSelfDemoteWarning(false);

                    // Force logout after brief delay
                    setTimeout(() => {
                        logout();
                        navigate('/auth/login', { replace: true });
                    }, 1500);
                    return;
                }

                // If role changed but still admin, update the store
                await fetchProfile();
            }

            toast.success("User role updated");
            setRoleDialogOpen(false);
            setSelfDemoteWarning(false);
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update role");
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusUpdate = async (user: AdminUser, newStatus: 'ACTIVE' | 'SUSPENDED') => {
        try {
            setActionLoading(true);
            const response = await adminApi.updateUserStatus(user.id, newStatus);
            console.log("DEBUG: Status update response:", response);

            // Optimistically update local state for immediate UI feedback
            setUsers(prevUsers => prevUsers.map(u =>
                u.id === user.id ? { ...u, status: newStatus, isActive: newStatus === 'ACTIVE' } : u
            ));

            toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'} successfully.`);
            // Silent refresh in the background
            fetchUsers();
        } catch (error) {
            console.error("Failed to update user status", error);
            toast.error("Failed to update user status.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Users"
                description="Manage all users and their access."
            >
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        maxLength={100}
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
                                            <AvatarImage src={getProfileImageUrl(user.profilePicture)} alt={user.fullName} className="object-cover" />
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
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(user, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}>
                                                    {user.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
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

                                                            // Clear feature-specific state before starting impersonation
                                                            // to prevent admin's drafts from leaking into the user's session.
                                                            localStorage.removeItem('social-media-scheduler-storage');
                                                            localStorage.removeItem('blog-scheduler-storage');
                                                            localStorage.removeItem('lastClientId');
                                                            localStorage.removeItem('lastBlogClientId');

                                                            // Clear all cached queries to prevent stale data
                                                            queryClient.clear();

                                                            toast.success(`Now impersonating ${user.fullName}`);
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
                                                }}>
                                                    <UserCog className="mr-2 h-4 w-4" /> Impersonate
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedUser(user);
                                                    setNewRole(user.role);
                                                    setRoleDialogOpen(true);
                                                }}>
                                                    Change Role
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => {
                                                    setSelectedUser(user);
                                                    setDeleteDialogOpen(true);
                                                }}>
                                                    Delete User
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

            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Select a new role for {selectedUser?.fullName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                                Role
                            </Label>
                            <Select value={newRole} onValueChange={(val: any) => setNewRole(val)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateRole} disabled={actionLoading}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedUser?.fullName}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteUser} disabled={actionLoading}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Self-Demotion Warning Dialog */}
            <Dialog open={selfDemoteWarning} onOpenChange={setSelfDemoteWarning}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="text-2xl">⚠️</span>
                            Warning: Self-Demotion
                        </DialogTitle>
                        <DialogDescription className="space-y-3 pt-2">
                            <p>You are about to change your own role from <strong>{currentUser?.role}</strong> to <strong>USER</strong>.</p>
                            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3">
                                <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">This will immediately:</p>
                                <ul className="list-disc pl-5 space-y-1 text-yellow-800 dark:text-yellow-300 text-sm">
                                    <li>Remove your admin access</li>
                                    <li>Log you out of the admin panel</li>
                                    <li>Require another admin to restore your privileges</li>
                                </ul>
                            </div>
                            <p className="text-sm font-semibold">Are you absolutely sure you want to proceed?</p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelfDemoteWarning(false)} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleUpdateRole} disabled={actionLoading}>
                            {actionLoading ? "Processing..." : "Yes, Demote Myself"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
