import { useQuery } from "@tanstack/react-query";
import { getSyncStatus, type SyncStatusResponse } from "../api/reportingApi";
import { useEffect, useState } from "react";

export const useSyncStatus = (clientId: number | null) => {
    const [shouldPoll, setShouldPoll] = useState(true);

    const query = useQuery<SyncStatusResponse, Error>({
        queryKey: ["sync-status", clientId],
        queryFn: async () => {
            if (!clientId) throw new Error("Client ID required");
            return getSyncStatus(clientId);
        },
        enabled: !!clientId,
        refetchInterval: (_query) => {
            if (!shouldPoll) return false;
            return 5000; // Poll every 5 seconds
        },
    });

    useEffect(() => {
        if (query.data?.data) {
            const allSynced = Object.values(query.data.data).every(
                (integration) => !integration.hasAccounts || integration.allSynced
            );

            // Stop polling if everything is synced
            if (allSynced && shouldPoll) {
                setShouldPoll(false);
            } else if (!allSynced && !shouldPoll) {
                // Resume polling if something became unsynced (e.g. new account added)
                setShouldPoll(true);
            }
        }
    }, [query.data, shouldPoll]);

    // Helper to check if a specific integration/account is syncing
    const isAccountSyncing = (integrationType: string, accountId?: string | number) => {
        if (!query.data?.data) return false;

        // Normalize integration key (e.g. "google Analytics" -> "google-analytics")
        // Map UI keys to API keys if needed
        let apiKey = integrationType.toLowerCase().replace(/[ _]/g, '-'); // Replace space AND underscore
        if (apiKey === 'google') apiKey = 'google-analytics';
        if (apiKey === 'woo') apiKey = 'woocommerce';

        const integration = query.data.data[apiKey];

        if (!integration) return false;

        if (!integration.hasAccounts) return false;
        if (integration.allSynced) return false;

        // If specific account checking
        if (accountId) {
            const account = integration.accounts.find(a => String(a.accountId) === String(accountId));
            if (account) {
                return !account.initialSyncComplete;
            }
        }

        // Default: if integration is not fully synced, assume this account might be pending
        return true;
    };

    // Calculate overall progress
    const overallProgress = (() => {
        if (!query.data?.data) return { total: 0, synced: 0, percent: 0, isSyncing: false };

        const integrations = Object.values(query.data.data);
        const activeIntegrations = integrations.filter(i => i.hasAccounts);

        let totalAccounts = 0;
        let syncedAccounts = 0;

        activeIntegrations.forEach(integration => {
            totalAccounts += integration.accounts.length;
            syncedAccounts += integration.accounts.filter(a => a.initialSyncComplete).length;
        });

        const isSyncing = totalAccounts > syncedAccounts;
        const percent = totalAccounts === 0 ? 100 : Math.round((syncedAccounts / totalAccounts) * 100);

        return { total: totalAccounts, synced: syncedAccounts, percent, isSyncing };
    })();

    const getIntegrationCounts = (integrationType: string) => {
        if (!query.data?.data) return null;
        let apiKey = integrationType.toLowerCase().replace(/[ _]/g, '-');
        if (apiKey === 'google') apiKey = 'google-analytics';
        if (apiKey === 'woo') apiKey = 'woocommerce';

        const integration = query.data.data[apiKey];
        if (!integration || !integration.hasAccounts) return null;

        const total = integration.accounts.length;
        const synced = integration.accounts.filter(a => a.initialSyncComplete).length;

        return { total, synced, isSynced: integration.allSynced };
    };

    return {
        ...query,
        isAccountSyncing,
        getIntegrationCounts,
        overallProgress
    };
};
