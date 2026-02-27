import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AccountSelectionModal } from "@/components/clients/AccountSelectionModal";
import type { IntegrationType } from "@/types/client.types";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { clientKeys } from "@/hooks/useClients";

/**
 * A global handler that listens for dangling OAuth state in localStorage or
 * success parameters in the URL when the backend redirects to a non-standard
 * callback route (e.g., straight to /clients).
 */
export function GlobalOAuthHandler() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [clientId, setClientId] = useState<number | null>(null);
    const [integrationType, setIntegrationType] = useState<IntegrationType | null>(null);

    useEffect(() => {
        // We don't want to run this if we are actively on a dedicated callback page
        // like /google-ads/callback or /meta/callback, as they handle themselves.
        if (location.pathname.includes("/callback")) return;

        // Check if there is pending OAuth data
        const storedClientId = localStorage.getItem("pending_oauth_client_id");
        const storedIntegration = localStorage.getItem("pending_oauth_integration");

        // Also check if the URL has a success parameter, typical of backend redirects
        // e.g. /integrations/google-ads/connect?success=true
        const searchParams = new URLSearchParams(location.search);
        const isSuccessUrl = searchParams.get("success") === "true";

        // We trigger the flow if:
        // 1. We have stored items AND (we have a success URL OR we just landed back on the app)
        if (storedClientId && storedIntegration) {
            setClientId(parseInt(storedClientId));
            setIntegrationType(storedIntegration as IntegrationType);
            setShowAccountModal(true);

            // Clean up URL if it has ugly connection params
            if (isSuccessUrl) {
                navigate(location.pathname, { replace: true });
            }
        }
    }, [location.pathname, location.search, navigate]);

    const handleAccountSelectionSuccess = () => {
        setShowAccountModal(false);
        setShowSuccessDialog(true);

        // Clear storage now that assignment is done
        localStorage.removeItem("pending_oauth_client_id");
        localStorage.removeItem("pending_oauth_integration");

        if (clientId) {
            queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
        }
    };

    const handleAccountSelectionCancel = () => {
        setShowAccountModal(false);
        toast.info("Account connection cancelled");

        // Cleanup storage
        localStorage.removeItem("pending_oauth_client_id");
        localStorage.removeItem("pending_oauth_integration");
    };

    const handleCloseSuccess = () => {
        setShowSuccessDialog(false);
        // Optionally redirect back to the client page if not already there
        if (clientId && !location.pathname.includes(`/clients/${clientId}`)) {
            navigate(`/clients/${clientId}`);
        }
    };

    return (
        <>
            {clientId && integrationType && (
                <AccountSelectionModal
                    open={showAccountModal}
                    onOpenChange={setShowAccountModal}
                    clientId={clientId}
                    integration={integrationType}
                    onSuccess={handleAccountSelectionSuccess}
                    onCancel={handleAccountSelectionCancel}
                />
            )}

            <AlertDialog open={showSuccessDialog} onOpenChange={handleCloseSuccess}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Connection Successful! 🎉</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>Your account has been connected and assigned successfully.</p>
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-blue-700 text-sm">
                                <p className="font-medium flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Syncing Data...
                                </p>
                                <p className="mt-1">
                                    Please allow up to 5 minutes for your historical data to be fully fetched and processed.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleCloseSuccess}>
                            Got it, continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
