import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subscriptionApi } from "@/services/subscription.api";
import { SUBSCRIPTION_QUERY_KEY } from "./useSubscriptionQuery";
import type { UserSubscriptionResponse } from "@/types/subscription.types";

export function useCancelSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionApi.cancelSubscription,
    onSuccess: (data) => {
      // Inject cancelled status directly into the query cache so it persists
      // across navigation without requiring a backend refetch
      queryClient.setQueryData<UserSubscriptionResponse>(
        SUBSCRIPTION_QUERY_KEY,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            plan: {
              ...old.plan,
              status: "cancelled",
              accessUntil: data?.accessUntil,
            },
          };
        }
      );
      // Also invalidate so a fresh fetch happens in the background
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });

      const msg =
        data?.message ??
        "Subscription cancelled. You'll have access until your billing period ends.";
      toast.success(msg);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ??
        "Failed to cancel subscription. Please try again.";
      toast.error(msg);
    },
  });
}
