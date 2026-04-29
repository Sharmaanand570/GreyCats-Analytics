import { useEffect, useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FiSearch, FiCheck, FiAlertCircle, FiLoader } from "react-icons/fi";
import { getAvailableAccounts, assignAccountToClient } from "@/api/integrationApi";
import type { IntegrationType, AvailableAccount } from "@/types/integration.types";
import { getPlatformConfig } from "@/utils/platformMapping";
import { useQueryClient } from "@tanstack/react-query";
import { showConnectionResultToast } from "@/utils/connectionToasts";

interface AccountSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: number;
    integration: IntegrationType | null; // Can be null if not yet determined
    onSuccess: () => void;
    onCancel?: () => void;
}

export function AccountSelectionModal({
    open,
    onOpenChange,
    clientId,
    integration,
    onSuccess,
    onCancel
}: AccountSelectionModalProps) {
    const [accounts, setAccounts] = useState<AvailableAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAccount, setSelectedAccount] = useState<AvailableAccount | null>(null);

    const queryClient = useQueryClient();

    // Reset state when modal opens
    useEffect(() => {
        if (open && integration) {
            fetchAccounts();
            setSelectedAccount(null);
            setSearchQuery("");
        }
    }, [open, integration]);

    const fetchAccounts = async () => {
        if (!integration) return;
        setLoading(true);
        try {
            const data = await getAvailableAccounts(integration);
            setAccounts(data);
        } catch (error) {
            console.error("Failed to fetch accounts:", error);
            toast.error("Failed to load available accounts. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!integration) return;
        if (!selectedAccount) return;

        const accountIdToAssign = selectedAccount.id;
        const accountNameToAssign = selectedAccount.name;

        setAssigning(true);
        try {
            const response = await assignAccountToClient(
                clientId,
                integration,
                accountIdToAssign
            );
            console.log("[Assign account] response:", response);

            // Invalidate queries to refresh integration list and progress
            queryClient.invalidateQueries({ queryKey: ["clients", "detail", clientId] });
            queryClient.invalidateQueries({ queryKey: ["sync-status", clientId] });
            queryClient.invalidateQueries({ queryKey: ["integrations", clientId] });
            queryClient.invalidateQueries({ queryKey: ["available-metrics", clientId] });

            showConnectionResultToast({
                warning: response.warning,
                successMessage: `Successfully connected ${accountNameToAssign}`,
                warningMessage: `Successfully connected ${accountNameToAssign}. However, we noticed there is currently no data in this account. Your dashboard will update as soon as new activity occurs.`,
            });
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Assignment failed:", error);
            toast.error(error.response?.data?.message || "Failed to connect account");
        } finally {
            setAssigning(false);
        }
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen && onCancel) {
            onCancel();
        }
        onOpenChange(isOpen);
    };

    const filteredAccounts = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase().trim();
        const matches = (acc: AvailableAccount) =>
            !lowerQuery ||
            acc.name.toLowerCase().includes(lowerQuery) ||
            acc.identifier.toLowerCase().includes(lowerQuery);

        const available = accounts.filter(
            acc => (!acc.assignedToClient || acc.assignedToClient.id === clientId) && matches(acc)
        );
        const inUse = accounts.filter(
            acc => acc.assignedToClient && acc.assignedToClient.id !== clientId && matches(acc)
        );

        return { available, inUse };
    }, [accounts, searchQuery, clientId]);

    const platformConfig = integration ? getPlatformConfig(integration.replace(/_/g, '-')) : null;
    const integrationName = platformConfig?.name || integration;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        {platformConfig?.icon && typeof platformConfig.icon !== 'string' && (
                            <platformConfig.icon style={{ color: platformConfig.color }} />
                        )}
                        Connect {integrationName} Account
                    </DialogTitle>
                    <DialogDescription>
                        Select the account you want to assign to this client.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 border-b bg-gray-50/50">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search accounts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-500 gap-2">
                            <FiLoader className="animate-spin text-xl" />
                            <p>Loading accounts...</p>
                        </div>
                    ) : filteredAccounts.available.length === 0 && filteredAccounts.inUse.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-500 p-8 text-center">
                            <p>No available accounts found.</p>
                            <p className="text-xs mt-1">Make sure you are logged into the correct account.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {/* Selectable accounts */}
                            {filteredAccounts.available.map((account: AvailableAccount) => {
                                const isSelected = selectedAccount?.id === account.id;
                                const isAssigned = !!account.assignedToClient;

                                return (
                                    <div
                                        key={account.id}
                                        onClick={() => !isAssigned && setSelectedAccount(account)}
                                        className={`
                                            flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer
                                            ${isSelected
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                : 'border-transparent hover:bg-gray-50'
                                            }
                                            ${isAssigned ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}
                                        `}
                                    >
                                        <div className={`
                                            w-5 h-5 rounded-full border flex items-center justify-center mt-0.5
                                            ${isSelected ? 'border-primary bg-primary text-white' : 'border-gray-300'}
                                        `}>
                                            {isSelected && <FiCheck className="w-3 h-3" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{account.name}</div>
                                            <div className="text-xs text-gray-500 truncate font-mono">
                                                ID: {account.identifier}
                                            </div>
                                            {isAssigned && (
                                                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1 font-medium bg-amber-50 px-2 py-0.5 rounded w-fit">
                                                    <FiAlertCircle className="w-3 h-3" />
                                                    Assigned to: {account.assignedToClient?.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Accounts already in use by other clients */}
                            {filteredAccounts.inUse.length > 0 && (
                                <>
                                    <div className="pt-3 pb-1 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Already in use by other clients
                                    </div>
                                    {filteredAccounts.inUse.map((account: AvailableAccount) => (
                                        <div
                                            key={account.id}
                                            className="flex items-start gap-3 p-3 rounded-lg border border-transparent bg-gray-50 opacity-50 cursor-not-allowed"
                                        >
                                            <div className="w-5 h-5 rounded-full border border-gray-300 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{account.name}</div>
                                                <div className="text-xs text-gray-500 truncate font-mono">
                                                    ID: {account.identifier}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1 font-medium bg-amber-50 px-2 py-0.5 rounded w-fit">
                                                    <FiAlertCircle className="w-3 h-3" />
                                                    Assigned to: {account.assignedToClient?.name}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                            
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 border-t bg-gray-50/50 gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => handleClose(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConnect}
                        isLoading={assigning}
                        disabled={!selectedAccount || assigning || loading}
                    >
                        Connect Selected Account
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
