import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    initiateGoogleAdsAuth,
    getGoogleAdsAccounts,
    connectGoogleAdsAccount,
    disconnectGoogleAds,
    getGoogleAdsSummary,
    getGoogleAdsCampaigns,
    type GoogleAdsConnectPayload,
} from "../API/googleAdsApi";
import { clientKeys } from "@/hooks/useClients";

// ── OAuth initiation ──────────────────────────────────────────────────────────

export const useGoogleAdsConnect = () => {
    return useMutation({
        mutationFn: initiateGoogleAdsAuth,
    });
};

// ── Account list (after OAuth) ────────────────────────────────────────────────

export const useGoogleAdsAccounts = (enabled = true) => {
    return useQuery({
        queryKey: ["google-ads-accounts"],
        queryFn: getGoogleAdsAccounts,
        enabled,
        retry: 1,
    });
};

// ── Connect account to client ─────────────────────────────────────────────────

export const useConnectGoogleAdsAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: GoogleAdsConnectPayload) => connectGoogleAdsAccount(payload),
        onSuccess: (_data, variables) => {
            // Refresh client data so the integration shows up immediately
            queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.clientId) });
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
        },
    });
};

// ── Disconnect ────────────────────────────────────────────────────────────────

export const useDisconnectGoogleAds = (clientId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => disconnectGoogleAds(clientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
        },
    });
};

// ── Summary metrics ───────────────────────────────────────────────────────────

export const useGoogleAdsSummary = (
    clientId: number,
    params?: { startDate?: string; endDate?: string }
) => {
    return useQuery({
        queryKey: ["google-ads-summary", clientId, params],
        queryFn: () => getGoogleAdsSummary(clientId, params),
        enabled: !!clientId,
        retry: 1,
    });
};

// ── Campaign performance ──────────────────────────────────────────────────────

export const useGoogleAdsCampaigns = (clientId: number) => {
    return useQuery({
        queryKey: ["google-ads-campaigns", clientId],
        queryFn: () => getGoogleAdsCampaigns(clientId),
        enabled: !!clientId,
        retry: 1,
    });
};
