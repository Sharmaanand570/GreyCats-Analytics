import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface FeatureFlag {
    id?: string;
    name: string;
    description?: string;
    enabled: boolean;
    rolloutPercentage: number;
}

interface FeatureFlagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (flag: Partial<FeatureFlag>) => Promise<void>;
    flag?: FeatureFlag | null;
}

export function FeatureFlagModal({ isOpen, onClose, onSave, flag }: FeatureFlagModalProps) {
    const [formData, setFormData] = useState<Partial<FeatureFlag>>({
        name: "",
        description: "",
        enabled: false,
        rolloutPercentage: 100
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (flag) {
            setFormData(flag);
        } else {
            setFormData({
                name: "",
                description: "",
                enabled: false,
                rolloutPercentage: 100
            });
        }
    }, [flag, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Failed to save feature flag", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{flag ? "Edit Feature Flag" : "New Feature Flag"}</DialogTitle>
                    <DialogDescription>
                        Control feature availability and rollout strategies.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Flag Name (Key)</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. new_dashboard_v2"
                            disabled={!!flag} // Key cannot be changed after creation
                            required
                        />
                        <p className="text-xs text-muted-foreground">Unique identifier used in code.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="What does this feature control?"
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                        <div className="space-y-0.5">
                            <Label>Enabled</Label>
                            <div className="text-xs text-muted-foreground">
                                Is this feature active?
                            </div>
                        </div>
                        <Switch
                            checked={formData.enabled}
                            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                        />
                    </div>

                    <div className="space-y-4 border p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <Label>Rollout Percentage</Label>
                            <span className="text-sm font-medium">{formData.rolloutPercentage}%</span>
                        </div>
                        <Input
                            type="range"
                            min="0"
                            max="100"
                            value={formData.rolloutPercentage}
                            onChange={(e) => setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) })}
                            className="accent-primary"
                        />
                        <p className="text-xs text-muted-foreground">
                            Percentage of users who will see this feature if enabled.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : flag ? "Update Flag" : "Create Flag"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
