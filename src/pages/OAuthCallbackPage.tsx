import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IntegrationType } from '../types/client.types';
import { Loader2 } from 'lucide-react';
import { AccountSelectionModal } from '../components/clients/AccountSelectionModal';

const OAuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [clientId, setClientId] = useState<number | null>(null);
    const [integrationType, setIntegrationType] = useState<IntegrationType | null>(null);

    useEffect(() => {
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
        if (!open) {
            // Navigate back to client detail page
            if (clientId) {
                navigate(`/clients/${clientId}/integrations`);
            } else {
                navigate('/clients');
            }
        }
    };

    const handleSuccess = () => {
        setShowAccountModal(false);
        if (clientId) {
            navigate(`/clients/${clientId}/integrations`);
        }
    };

    if (!clientId || !integrationType) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Processing OAuth callback...</p>
            </div>

            <AccountSelectionModal
                open={showAccountModal}
                onOpenChange={handleModalClose}
                clientId={clientId}
                integration={integrationType}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default OAuthCallbackPage;
