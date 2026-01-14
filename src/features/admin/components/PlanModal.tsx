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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AdminPlan } from "@/api/adminApi";
import { Plus, X } from "lucide-react";

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: Partial<AdminPlan>) => Promise<void>;
    plan?: AdminPlan | null; // null for create mode
    isLoading?: boolean;
}

const DEFAULT_FEATURES = [
    "Dashboards",
    "Reports",
    "Alerts",
    "API Access",
    "White Labeling",
    "Priority Support",
    "Custom Domain",
    "SSO"
];

export function PlanModal({ isOpen, onClose, onSave, plan, isLoading }: PlanModalProps) {
    const [formData, setFormData] = useState<Partial<AdminPlan>>({
        name: "",
        displayName: "",
        description: "",
        price: 0,
        currency: "USD",
        interval: "monthly",
        limits: {
            maxClients: 5,
            maxIntegrations: 10,
            maxStorage: 1024,
            maxApiCalls: 10000
        },
        features: [],
        isPublic: true,
        status: "active"
    });

    const [customFeature, setCustomFeature] = useState("");

    useEffect(() => {
        if (plan) {
            // Ensure features is always an array
            setFormData({
                ...plan,
                features: Array.isArray(plan.features) ? plan.features : []
            });
        } else {
            // Reset for create mode
            setFormData({
                name: "",
                displayName: "",
                description: "",
                price: 0,
                currency: "USD",
                interval: "monthly",
                limits: {
                    maxClients: 5,
                    maxIntegrations: 10,
                    maxStorage: 1024,
                    maxApiCalls: 10000
                },
                features: [],
                isPublic: true,
                status: "active"
            });
        }
    }, [plan, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    const toggleFeature = (feature: string) => {
        setFormData(prev => {
            const features = Array.isArray(prev.features) ? prev.features : [];
            if (features.includes(feature)) {
                return { ...prev, features: features.filter(f => f !== feature) };
            } else {
                return { ...prev, features: [...features, feature] };
            }
        });
    };

    const addCustomFeature = () => {
        if (customFeature.trim()) {
            toggleFeature(customFeature.trim());
            setCustomFeature("");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>{plan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
                    <DialogDescription>
                        {plan ? "Modify existing subscription plan details." : "Define a new subscription tier for your users."}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-4">
                    <form id="plan-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    placeholder="e.g. Pro Plan"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Internal ID</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. pro_monthly"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the plan features..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                        <SelectItem value="INR">INR (₹)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="interval">Interval</Label>
                                <Select
                                    value={formData.interval}
                                    onValueChange={(value: any) => setFormData({ ...formData, interval: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select interval" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                        <SelectItem value="lifetime">Lifetime</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Limits */}
                        <div className="space-y-4 border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
                            <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">Plan Limits</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maxClients">Max Clients</Label>
                                    <Input
                                        id="maxClients"
                                        type="number"
                                        value={formData.limits?.maxClients}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            limits: { ...formData.limits!, maxClients: parseInt(e.target.value) }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxIntegrations">Max Integrations</Label>
                                    <Input
                                        id="maxIntegrations"
                                        type="number"
                                        value={formData.limits?.maxIntegrations}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            limits: { ...formData.limits!, maxIntegrations: parseInt(e.target.value) }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxStorage">Storage (MB)</Label>
                                    <Input
                                        id="maxStorage"
                                        type="number"
                                        value={formData.limits?.maxStorage}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            limits: { ...formData.limits!, maxStorage: parseInt(e.target.value) }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxApiCalls">API Calls / Month</Label>
                                    <Input
                                        id="maxApiCalls"
                                        type="number"
                                        value={formData.limits?.maxApiCalls}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            limits: { ...formData.limits!, maxApiCalls: parseInt(e.target.value) }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                            <Label>Features</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {DEFAULT_FEATURES.map((feature) => (
                                    <div key={feature} className="flex items-center space-x-2">
                                        <Switch
                                            id={`feature-${feature}`}
                                            checked={Array.isArray(formData.features) && formData.features.includes(feature)}
                                            onChange={() => toggleFeature(feature)}
                                        />
                                        <Label htmlFor={`feature-${feature}`}>{feature}</Label>
                                    </div>
                                ))}
                            </div>

                            {/* Custom Features */}
                            <div className="flex gap-2 mt-2">
                                <Input
                                    placeholder="Add custom feature..."
                                    value={customFeature}
                                    onChange={(e) => setCustomFeature(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                                />
                                <Button type="button" variant="outline" size="icon" onClick={addCustomFeature}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Selected Features Chips */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {Array.isArray(formData.features) && formData.features.map(feature => (
                                    <span key={feature} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {feature}
                                        <button
                                            type="button"
                                            onClick={() => toggleFeature(feature)}
                                            className="ml-1.5 h-3.5 w-3.5 rounded-full inline-flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800"
                                        >
                                            <span className="sr-only">Remove</span>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="flex items-center justify-between border-t pt-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Publicly Available</Label>
                                <p className="text-sm text-muted-foreground">
                                    Show this plan on the public pricing page.
                                </p>
                            </div>
                            <Switch
                                checked={formData.isPublic}
                                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Status</Label>
                                <p className="text-sm text-muted-foreground">
                                    Active plans can be subscribed to.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </form>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" form="plan-form" disabled={isLoading}>
                        {isLoading ? "Saving..." : (plan ? "Save Changes" : "Create Plan")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
