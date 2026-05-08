import { useQuery } from "@tanstack/react-query";
import { getFacebookPageInfo } from "../API/metaInsightsApi";
import type { FacebookPageInfoResponse } from "../API/metaInsightsApi";

/**
 * Hook to fetch Facebook Page basic info (followers, category, etc.)
 * Uses Meta Insights API as Meta Business API doesn't have page insights yet
 */
export const useFacebookPageInfo = (accountId: number | undefined) => {
    return useQuery<FacebookPageInfoResponse>({
        queryKey: ["facebook-page-info", accountId],
        queryFn: () => {
            if (!accountId) throw new Error("Account ID is required");
            return getFacebookPageInfo(accountId);
        },
        enabled: !!accountId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};
