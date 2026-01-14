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
import { adminApi, type AdminPlan } from "@/api/adminApi";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PlanModal } from "../components/PlanModal";

export default function PlansPage() {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<AdminPlan[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<AdminPlan | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getPlans();
            // Defensive check: ensure data is an array
            if (Array.isArray(data)) {
                setPlans(data);
            } else if (data && Array.isArray((data as any).plans)) {
                // Handle case where response might be { plans: [...] }
                setPlans((data as any).plans);
            } else {
                console.warn("API returned unexpected format for plans:", data);
                setPlans([]);
            }
        } catch (error: any) {
            console.error("Failed to fetch plans", error);
            // If backend misses (404), maybe we shouldn't show toast error continuously
            // But for now, we leave it. Or we can mock empty valid response if 404 to avoid confusing user.
            if (error.response && error.response.status === 404) {
                // Fallback mock data for demo if backend not ready
                // setPlans(MOCK_PLANS); 
                // toast.info("Backend not ready: showing mocked plans.");
                setPlans([]); // Empty for now
            } else {
                toast.error("Failed to load plans. Please check your connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleCreatePlan = () => {
        setSelectedPlan(null);
        setIsModalOpen(true);
    };

    const handleEditPlan = (plan: AdminPlan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const handleSavePlan = async (planData: Partial<AdminPlan>) => {
        setIsSaving(true);
        try {
            if (selectedPlan) {
                // Update existing
                await adminApi.updatePlan(selectedPlan.id, planData);
                toast.success("Plan updated successfully");
            } else {
                // Create new
                await adminApi.createPlan(planData);
                toast.success("Plan created successfully");
            }
            setIsModalOpen(false);
            fetchPlans();
        } catch (error) {
            console.error("Failed to save plan", error);
            toast.error("Failed to save plan. Backend might be missing.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePlan = async (planId: string) => {
        if (confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
            try {
                await adminApi.deletePlan(planId);
                toast.success("Plan deleted successfully");
                fetchPlans();
            } catch (error) {
                console.error("Failed to delete plan", error);
                toast.error("Failed to delete plan");
            }
        }
    };

    const handleArchivePlan = async (planId: string) => {
        try {
            await adminApi.updatePlan(planId, { status: "archived" });
            toast.success("Plan archived successfully");
            fetchPlans();
        } catch (error) {
            console.error("Failed to archive plan", error);
            toast.error("Failed to archive plan");
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Subscription Plans"
                description="Manage available pricing tiers and features."
                action={{ label: "Create Plan", onClick: handleCreatePlan, icon: Plus }}
            />

            <div className="rounded-md border bg-white dark:bg-slate-950 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Plan Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Interval</TableHead>
                            <TableHead>Usage Limits</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : plans.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No plans found. Create your first subscription plan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            plans.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{plan.displayName}</span>
                                            <span className="text-xs text-muted-foreground uppercase">{plan.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{plan.currency} {plan.price}</TableCell>
                                    <TableCell className="capitalize">{plan.interval}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                            <span>{plan.limits?.maxClients} Clients</span>
                                            <span>{plan.limits?.maxIntegrations} Integrations</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={plan.status === "active" ? "outline" : "secondary"} className={plan.status === "active" ? "text-green-600 border-green-600" : ""}>
                                            {plan.status}
                                        </Badge>
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
                                                <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                                                    Edit Plan
                                                </DropdownMenuItem>
                                                {plan.status === 'active' && (
                                                    <DropdownMenuItem className="text-orange-600" onClick={() => handleArchivePlan(plan.id)}>
                                                        Archive Plan
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePlan(plan.id)}>
                                                    Delete Plan
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

            <PlanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePlan}
                plan={selectedPlan}
                isLoading={isSaving}
            />
        </div>
    );
}
