import { useEffect, useState } from "react";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Settings2, ShieldAlert } from "lucide-react";
import { adminApi, type FeatureFlag } from "@/api/adminApi";
import { Badge } from "@/components/ui/badge";
import { FeatureFlagModal } from "../components/FeatureFlagModal";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeatureFlagsPage() {
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);

    const fetchFlags = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getFeatureFlags();
            setFlags(data || []);
        } catch (error) {
            console.error("Failed to fetch feature flags", error);
            toast.error("Failed to load feature flags.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlags();
    }, []);

    const handleCreate = () => {
        setSelectedFlag(null);
        setIsModalOpen(true);
    };

    const handleEdit = (flag: FeatureFlag) => {
        setSelectedFlag(flag);
        setIsModalOpen(true);
    };

    const handleSave = async (data: Partial<FeatureFlag>) => {
        try {
            if (selectedFlag) {
                await adminApi.updateFeatureFlag(selectedFlag.name, data);
                toast.success("Feature flag updated successfully");
            } else {
                await adminApi.createFeatureFlag(data);
                toast.success("Feature flag created successfully");
            }
            fetchFlags();
        } catch (error) {
            console.error("Failed to save feature flag", error);
            throw error; // Let modal handle error state
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Feature Flags"
                description="Manage incremental rollouts and feature toggles."
                action={{ label: "New Feature Flag", onClick: handleCreate, icon: Plus }}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-5 w-32 mb-2" />
                                <Skeleton className="h-4 w-48" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                        </Card>
                    ))
                ) : flags.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                        <Settings2 className="h-8 w-8 mx-auto mb-3 opacity-50" />
                        <h3 className="text-lg font-medium">No feature flags configured</h3>
                        <p className="text-sm mt-1">Create your first flag to start controlling features.</p>
                        <Button onClick={handleCreate} variant="outline" className="mt-4">
                            Create Flag
                        </Button>
                    </div>
                ) : (
                    flags.map((flag) => (
                        <Card key={flag.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleEdit(flag)}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base font-mono">{flag.name}</CardTitle>
                                        <Badge variant={flag.enabled ? "default" : "secondary"} className={flag.enabled ? "bg-green-600 hover:bg-green-700" : ""}>
                                            {flag.enabled ? "Enabled" : "Disabled"}
                                        </Badge>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50">
                                        <Settings2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {flag.description || "No description provided."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Rollout</span>
                                        <span className="font-medium">{flag.rolloutPercentage}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${flag.enabled ? "bg-primary" : "bg-muted-foreground/30"}`}
                                            style={{ width: `${flag.rolloutPercentage}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground pt-2 flex items-center gap-1">
                                        <ShieldAlert className="h-3 w-3" />
                                        <span>Click to edit settings</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <FeatureFlagModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                flag={selectedFlag}
            />
        </div>
    );
}
