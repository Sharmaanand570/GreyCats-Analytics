import { useQuery } from "@tanstack/react-query";
import { subscriptionApi } from "@/services/subscription.api";

export const PLANS_QUERY_KEY = ["subscription", "plans"] as const;

export function usePlansQuery() {
  return useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: subscriptionApi.getPlans,
    staleTime: 5 * 60 * 1000,   // 5 minutes — plan list changes rarely
    gcTime: 15 * 60 * 1000,     // keep in cache for 15 minutes
    select: (data) => data.plans,
  });
}
