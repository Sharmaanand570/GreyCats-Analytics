import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { adminApi, type AdminPlan, type AdminUser } from "@/api/adminApi";
import { toast } from "sonner";

interface AssignSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    preselectedUserId?: number;
}

export function AssignSubscriptionModal({ isOpen, onClose, onSave, preselectedUserId }: AssignSubscriptionModalProps) {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [plans, setPlans] = useState<AdminPlan[]>([]);

    // Form State
    const [userId, setUserId] = useState<string>(preselectedUserId?.toString() || "");
    const [planId, setPlanId] = useState<string>("");
    const [price, setPrice] = useState<number>(0);
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [autoRenew, setAutoRenew] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (preselectedUserId) {
            setUserId(preselectedUserId.toString());
        }
    }, [preselectedUserId]);

    // When plan changes, update default price
    useEffect(() => {
        const selectedPlan = plans.find(p => p.id === planId);
        if (selectedPlan) {
            setPrice(selectedPlan.price);
        }
    }, [planId, plans]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Parallel fetch
            const [usersData, plansData] = await Promise.all([
                adminApi.getUsers(1, 100), // Fetch first 100 users for dropdown
                adminApi.getPlans()
            ]);
            setUsers(usersData.users);

            // Defensive check for plans
            if (Array.isArray(plansData)) {
                setPlans(plansData);
            } else if (plansData && Array.isArray((plansData as any).plans)) {
                setPlans((plansData as any).plans);
            } else {
                setPlans([]);
            }
        } catch (error) {
            console.error("Failed to load form data", error);
            toast.error("Failed to load users or plans");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminApi.assignSubscription(parseInt(userId), {
                planId,
                startDate,
                price: Number(price),
                autoRenew
            });
            toast.success("Subscription assigned successfully");
            onSave();
            onClose();
        } catch (error) {
            console.error("Failed to assign subscription", error);
            toast.error("Failed to assign subscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Subscription</DialogTitle>
                    <DialogDescription>
                        Manually assign a subscription plan to a user.
                    </DialogDescription>
                </DialogHeader>

                <form id="assign-sub-form" onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="user">User</Label>
                        <Select value={userId} onValueChange={setUserId} disabled={!!preselectedUserId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select user..." />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.fullName} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="plan">Plan</Label>
                        <Select value={planId} onValueChange={setPlanId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select plan..." />
                            </SelectTrigger>
                            <SelectContent>
                                {plans.map(plan => (
                                    <SelectItem key={plan.id} value={plan.id}>
                                        {plan.displayName || plan.name} ({plan.currency} {plan.price}/{plan.interval})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Override Price</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                        <Label htmlFor="autorenew">Auto-renew</Label>
                        <Switch
                            id="autorenew"
                            checked={autoRenew}
                            onChange={(e) => setAutoRenew(e.target.checked)}
                        />
                    </div>
                </form>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" form="assign-sub-form" disabled={loading || !userId || !planId}>
                        {loading ? "Assigning..." : "Assign Subscription"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
