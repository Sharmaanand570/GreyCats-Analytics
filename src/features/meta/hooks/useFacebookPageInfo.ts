import { useQuery } from "@tanstack/react-query";
import { getFacebookPageInfo } from "../API/metaInsightsApi";
import type { FacebookPageInfoResponse } from "../API/metaInsightsApi";

/**
 * Hook to fetch Facebook Page basic info (followers, category, etc.)
 * Uses Meta Insights API as Meta Business API doesn't have page insights yet
 */
export const useFacebookPageInfo = (pageId: string | undefined) => {
    return useQuery<FacebookPageInfoResponse>({
        queryKey: ["facebook-page-info", pageId],
        queryFn: () => {
            if (!pageId) throw new Error("Page ID is required");
            return getFacebookPageInfo(pageId);
        },
        enabled: !!pageId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};
