import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IntegrationType } from '../types/client.types';
import { Loader2 } from 'lucide-react';
import { AccountSelectionModal } from '../components/clients/AccountSelectionModal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const OAuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [clientId, setClientId] = useState<number | null>(null);
    const [integrationType, setIntegrationType] = useState<IntegrationType | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showErrorDialog, setShowErrorDialog] = useState(false);

    useEffect(() => {
        // Check for error parameters in URL
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
            setErrorMsg(errorDescription || error);
            setShowErrorDialog(true);
            return;
        }

        // Retrieve stored context
        const storedClientId = localStorage.getItem('pending_oauth_client_id');
        const storedIntegration = localStorage.getItem('pending_oauth_integration');

        if (storedClientId && storedIntegration) {
            setClientId(parseInt(storedClientId));
            setIntegrationType(storedIntegration as IntegrationType);
            setShowAccountModal(true);

            // Clear localStorage
            localStorage.removeItem('pending_oauth_client_id');
            localStorage.removeItem('pending_oauth_integration');
        } else {
            // No context found, redirect to clients
            navigate('/clients');
        }
    }, [navigate]);

    const handleModalClose = (open: boolean) => {
        setShowAccountModal(open);
    };

    const handleCancel = () => {
        setShowAccountModal(false);
        if (clientId) {
            navigate(`/clients/${clientId}/integrations`);
        } else {
            navigate('/clients');
        }
    }

    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const handleSuccess = () => {
        setShowAccountModal(false);
        setShowSuccessDialog(true);
    };

    const handleContinue = () => {
        if (clientId) {
            navigate(`/clients/${clientId}/integrations`);
        } else {
            navigate('/clients');
        }
    };

    if (!clientId || !integrationType) {
        return (
            <div className="flex items-center justify-center min-h-[100dvh]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[100dvh]">
            {!showSuccessDialog && (
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Processing OAuth callback...</p>
                </div>
            )}

            <AccountSelectionModal
                open={showAccountModal}
                onOpenChange={handleModalClose}
                clientId={clientId}
                integration={integrationType}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />

            <AlertDialog open={showSuccessDialog} onOpenChange={handleContinue}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Connection Successful! 🎉</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                Your data source has been connected successfully.
                            </p>
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-blue-700 text-sm">
                                <p className="font-medium flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Syncing Data...
                                </p>
                                <p className="mt-1">
                                    Please allow up to 5 minutes for your historical data to be fully fetched and processed.
                                    You can start building reports, but some metrics might be processing.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleContinue}>
                            Got it, continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showErrorDialog} onOpenChange={() => navigate('/clients')}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">Connection Failed ❌</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                There was an error while trying to connect your data source.
                            </p>
                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-red-700 text-sm">
                                <p className="font-medium">Error details:</p>
                                <p className="mt-1 opacity-90">
                                    {errorMsg || "The authentication flow was cancelled or failed."}
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => navigate('/clients')} className="bg-red-600 hover:bg-red-700">
                            Back to Clients
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default OAuthCallbackPage;
