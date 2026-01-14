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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus } from "lucide-react";
import { adminApi, type AdminSubscription } from "@/api/adminApi";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AssignSubscriptionModal } from "../components/AssignSubscriptionModal";

export default function UserSubscriptionsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [planFilter, setPlanFilter] = useState("all");
    const [availablePlans, setAvailablePlans] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        // Fetch plans for filter
        const loadPlans = async () => {
            try {
                const plans = await adminApi.getPlans();
                let plansArray: any[] = [];

                if (Array.isArray(plans)) {
                    plansArray = plans;
                } else if (plans && Array.isArray((plans as any).plans)) {
                    plansArray = (plans as any).plans;
                }

                setAvailablePlans(plansArray.map(p => ({ id: p.id, name: p.displayName || p.name })));
            } catch (error) {
                console.error("Failed to load plans for filter", error);
            }
        };
        loadPlans();
    }, []);

    const fetchSubs = async () => {
        setLoading(true);
        try {
            const status = statusFilter !== "all" ? statusFilter : undefined;
            const plan = planFilter !== "all" ? planFilter : undefined;

            const data = await adminApi.getSubscriptions(status, plan);

            // Defensive check
            if (Array.isArray(data)) {
                setSubscriptions(data);
            } else if (data && Array.isArray((data as any).subscriptions)) {
                setSubscriptions((data as any).subscriptions);
            } else {
                console.warn("API returned unexpected format for subscriptions:", data);
                setSubscriptions([]);
            }
        } catch (error: any) {
            console.error("Failed to fetch subscriptions", error);
            if (error.response && error.response.status === 404) {
                // Backend endpoint missing
                setSubscriptions([]);
            } else {
                toast.error("Failed to load subscriptions. Please check your connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubs();
    }, [statusFilter, planFilter]);

    const handleCancelSubscription = async (userId: number) => {
        if (confirm("Are you sure you want to cancel this subscription? The user will lose access at the end of the period.")) {
            try {
                await adminApi.cancelSubscription(userId);
                toast.success("Subscription canceled successfully");
                fetchSubs();
            } catch (error) {
                console.error("Failed to cancel subscription", error);
                toast.error("Failed to cancel subscription");
            }
        }
    };

    const handleExtendSubscription = async (userId: number) => {
        // For simplicity, just extending by 30 days. In real app, modal for specific date.
        try {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + 30);
            await adminApi.extendSubscription(userId, nextDate.toISOString());
            toast.success("Subscription extended by 30 days");
            fetchSubs();
        } catch (error) {
            console.error("Failed to extend subscription", error);
            toast.error("Failed to extend subscription");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Active</Badge>;
            case 'canceled': return <Badge variant="secondary">Canceled</Badge>;
            case 'past_due': return <Badge variant="destructive">Past Due</Badge>;
            case 'trialing': return <Badge variant="outline" className="text-blue-600 border-blue-600">Trial</Badge>;
            case 'expired': return <Badge variant="outline" className="text-slate-500">Expired</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="User Subscriptions"
                description="Monitor active subscriptions and billing status."
                action={{ label: "Assign Subscription", onClick: () => setIsAssignModalOpen(true), icon: Plus }}
            />

            {/* Filters */}
            <div className="flex gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <select
                        className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="trialing">Trialing</option>
                        <option value="past_due">Past Due</option>
                        <option value="canceled">Canceled</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Plan:</span>
                    <select
                        className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                    >
                        <option value="all">All Plans</option>
                        {availablePlans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                                {plan.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="rounded-md border bg-white dark:bg-slate-950 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : subscriptions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No subscriptions found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            subscriptions.map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium cursor-pointer hover:underline" onClick={() => navigate(`/admin/users/${sub.userId}`)}>
                                                {sub.userName || sub.userEmail || "Unknown User"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{sub.userEmail}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{sub.planName || "Unknown Plan"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {sub.price} / {sub.interval}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs">
                                            <span>
                                                Starts: {
                                                    sub.startDate && !isNaN(new Date(sub.startDate).getTime())
                                                        ? format(new Date(sub.startDate), "PP")
                                                        : "N/A"
                                                }
                                            </span>
                                            <span className={sub.cancelAtPeriodEnd ? "text-amber-600" : "text-muted-foreground"}>
                                                Ends: {
                                                    sub.currentPeriodEnd && !isNaN(new Date(sub.currentPeriodEnd).getTime())
                                                        ? format(new Date(sub.currentPeriodEnd), "PP")
                                                        : "N/A"
                                                }
                                            </span>
                                            {sub.autoRenew && <span className="text-green-600">Auto-renews</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigate(`/admin/users/${sub.userId}`)}>
                                                    View User Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleExtendSubscription(sub.userId)}>
                                                    Extend (+30 days)
                                                </DropdownMenuItem>
                                                {sub.status === 'active' && (
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleCancelSubscription(sub.userId)}>
                                                        Cancel Subscription
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AssignSubscriptionModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onSave={fetchSubs}
            />
        </div>
    );
}
