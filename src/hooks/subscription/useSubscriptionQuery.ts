import { useQuery } from "@tanstack/react-query";
import { subscriptionApi } from "@/services/subscription.api";
import { isAuthenticated, StorageKey } from "@/utils/storage";

export const SUBSCRIPTION_QUERY_KEY = ["subscription", "current"] as const;

export function useSubscriptionQuery() {
  const authed = isAuthenticated(StorageKey.ANALYTICS_TOKEN);
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEY,
    queryFn: subscriptionApi.getMySubscription,
    staleTime: 2 * 60 * 1000,   // 2 minutes
    gcTime: 10 * 60 * 1000,
    enabled: authed,             // never fires for unauthenticated visitors
    retry: false,                // don't retry 401s
  });
}
