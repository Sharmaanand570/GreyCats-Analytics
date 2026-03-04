import { useMutation } from "@tanstack/react-query";
import { subscriptionApi } from "@/services/subscription.api";

export function useCreateOrderMutation() {
  return useMutation({
    mutationFn: (planId: number) =>
      subscriptionApi.createSubscriptionOrder(planId),
  });
}
