import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import type { ClientWithIntegrations } from '../types/client.types';

interface ClientContextType {
    currentClient: ClientWithIntegrations | null;
    setCurrentClient: (client: ClientWithIntegrations | null) => void;
    clients: ClientWithIntegrations[];
    setClients: (clients: ClientWithIntegrations[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

interface ClientProviderProps {
    children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
    const [currentClient, setCurrentClient] = useState<ClientWithIntegrations | null>(null);
    const [clients, setClients] = useState<ClientWithIntegrations[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { clientId } = useParams<{ clientId: string }>();

    // Sync current client from URL
    useEffect(() => {
        if (clientId && clients.length > 0) {
            const client = clients.find((c) => c.id === parseInt(clientId));
            if (client) {
                setCurrentClient(client);
                // Persist last selected client
                localStorage.setItem('lastClientId', clientId);
            }
        }
    }, [clientId, clients]);

    // Restore last selected client on mount
    useEffect(() => {
        const lastClientId = localStorage.getItem('lastClientId');
        if (lastClientId && clients.length > 0 && !currentClient) {
            const client = clients.find((c) => c.id === parseInt(lastClientId));
            if (client) {
                setCurrentClient(client);
            }
        }
    }, [clients, currentClient]);

    const value: ClientContextType = {
        currentClient,
        setCurrentClient,
        clients,
        setClients,
        isLoading,
        setIsLoading,
    };

    return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};

export const useClientContext = (): ClientContextType => {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error('useClientContext must be used within ClientProvider');
    }
    return context;
};
