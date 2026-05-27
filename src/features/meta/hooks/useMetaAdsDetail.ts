import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  duplicateCampaign,
  getAccountDiagnostics,
  getInsightsBreakdown,
  getSyncStatus,
  type InsightBreakdownRow,
  type InsightsBreakdownParams,
  type MetaAccountDiagnostics,
  type SyncStatusEntry,
} from "../API/metaAdsDetailApi";
import { formatUserMessage, parseMetaError, shouldToast } from "../API/metaErrors";

const toastMetaError = (e: unknown, fallback: string) => {
  const parsed = parseMetaError(e);
  if (!shouldToast(parsed)) return;
  toast.error(formatUserMessage(parsed) || fallback);
};

// Account diagnostics — refreshed on detail-page mount + on focus, since
// `balance` / `spend_cap` change frequently for active accounts.
export const useAccountDiagnostics = (
  clientId: number | null,
  accountId: string | null
) => {
  return useQuery<MetaAccountDiagnostics, Error>({
    queryKey: ["meta-ads-detail", "diagnostics", clientId, accountId],
    queryFn: () => getAccountDiagnostics(clientId as number, accountId as string),
    enabled: !!clientId && !!accountId,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

// Sync status — bell on the detail page so the user knows if data is fresh.
export const useSyncStatus = (clientId: number | null) => {
  return useQuery<SyncStatusEntry[], Error>({
    queryKey: ["meta-ads-detail", "sync-status", clientId],
    queryFn: () => getSyncStatus(clientId as number),
    enabled: !!clientId,
    // Refresh on a 30s tick because sync jobs come and go quickly.
    refetchInterval: 30_000,
    retry: 1,
  });
};

export const useInsightsBreakdown = (
  clientId: number | null,
  params: InsightsBreakdownParams | null
) => {
  return useQuery<InsightBreakdownRow[], Error>({
    queryKey: [
      "meta-ads-detail",
      "insights-breakdown",
      clientId,
      JSON.stringify(params),
    ],
    queryFn: () =>
      getInsightsBreakdown(clientId as number, params as InsightsBreakdownParams),
    enabled: !!clientId && !!params,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

// Campaign duplicate — refreshes campaign list on success.
export const useDuplicateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { id: string; name?: string },
    Error,
    { campaignId: string; clientId: number; deep?: boolean }
  >({
    mutationFn: ({ campaignId, clientId, deep = true }) =>
      duplicateCampaign(clientId, campaignId, deep),
    onSuccess: () => {
      // Invalidate every Meta-ads list view so the duplicate appears.
      ["meta-ads-campaigns", "meta-ads-summary", "meta-ads-meta", "meta-ads-trends"].forEach(
        (k) => queryClient.invalidateQueries({ queryKey: [k] })
      );
      toast.success("Campaign duplicated");
    },
    onError: (e) => toastMetaError(e, "Failed to duplicate campaign"),
  });
};
