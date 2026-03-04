import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { subscriptionApi } from "@/services/subscription.api";
import { SUBSCRIPTION_QUERY_KEY } from "./useSubscriptionQuery";

export function useActivateFreePlanMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (planId: number) => subscriptionApi.activateFreePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
      toast.success("Free plan activated!");
      navigate("/clients");
    },
    onError: () => {
      toast.error("Failed to activate free plan. Please contact support.");
    },
  });
}
