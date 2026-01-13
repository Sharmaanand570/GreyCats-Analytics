import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { clientKeys } from "@/hooks/useClients";
import { useClient } from "@/hooks/useClients";

export const useShopifyPolling = (clientId: number | null) => {
    const queryClient = useQueryClient();
    const { data: client } = useClient(clientId);

    useEffect(() => {
        // Only poll if we have a pending OAuth state for Shopify and a valid client ID
        const pendingClientId = localStorage.getItem("pending_oauth_client_id");
        const pendingIntegration = localStorage.getItem("pending_oauth_integration");

        if (
            clientId &&
            pendingClientId === clientId.toString() &&
            pendingIntegration === "shopify"
        ) {
            console.log("Starts polling for Shopify connection...");

            const intervalId = setInterval(async () => {
                // Invalidate client query to fetch latest integrations
                await queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });

                // We check the client data from the hook (which should update after invalidation)
                // However, invalidation is async, so we might need to check the result in the next render
                // OR we can manually fetch in the interval. 
                // For simplicity, we rely on the generic useClient hook updates if invalidation works.
                // But to be robust, let's check the *current* list in the interval by re-fetching manually 
                // or just let the React Query cache update trigger a re-render.

                // Let's rely on checking the client object passed to this hook. 
                // But the interval closure will capture the old client. 
                // So we need to use a ref or just rely on the effect dependency to restart, 
                // OR simpler: just invalidate. The check happens in the Effect below.

            }, 2000);

            const timeoutId = setTimeout(() => {
                clearInterval(intervalId);
                // Clear pending state if timed out? 
                // Maybe not, user might just be slow. But usually this is for the callback redirect.
                // localStorage.removeItem("pending_oauth_client_id");
                // localStorage.removeItem("pending_oauth_integration");
            }, 60000); // 60 seconds timeout

            return () => {
                clearInterval(intervalId);
                clearTimeout(timeoutId);
            };
        }
    }, [clientId, queryClient]);

    // Separate effect to check if we are connected and stop polling/notify
    useEffect(() => {
        const pendingClientId = localStorage.getItem("pending_oauth_client_id");
        const pendingIntegration = localStorage.getItem("pending_oauth_integration");

        if (
            clientId &&
            pendingClientId === clientId.toString() &&
            pendingIntegration === "shopify" &&
            client?.integrations
        ) {
            const isConnected = client.integrations.some(
                (integration) => integration.integrationType === "shopify" // OR match specific key
            );

            if (isConnected) {
                toast.success("Shopify connected successfully!");
                localStorage.removeItem("pending_oauth_client_id");
                localStorage.removeItem("pending_oauth_integration");
                // Trigger a final invalidation to be sure
                queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
            }
        }
    }, [client, clientId, queryClient]);
};
