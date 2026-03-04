import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { subscriptionApi } from "@/services/subscription.api";
import type { VerifyPaymentPayload } from "@/types/subscription.types";
import { SUBSCRIPTION_QUERY_KEY } from "./useSubscriptionQuery";

export function useVerifyPaymentMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: VerifyPaymentPayload) =>
      subscriptionApi.verifySubscriptionPayment(payload),
    onSuccess: () => {
      // Invalidate subscription cache so BillingPage re-fetches fresh data
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
      toast.success("Plan activated successfully! 🎉");
      navigate("/clients");
    },
    onError: () => {
      toast.error("Payment verification failed. Please contact support.");
    },
  });
}
