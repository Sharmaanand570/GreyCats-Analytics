import api from "@/apiConfig";
import type {
  PlansResponse,
  UserSubscriptionResponse,
  CreateOrderResponse,
  VerifyPaymentPayload,
  VerifyPaymentResponse,
  CancelSubscriptionResponse,
} from "@/types/subscription.types";

export const subscriptionApi = {
  /**
   * GET /subscription/plans
   * Returns all public subscription plans.
   */
  getPlans: async (): Promise<PlansResponse> => {
    const response = await api.get("/subscription/plans");
    return response.data;
  },

  /**
   * GET /user/subscription
   * Returns current user's plan + usage. Requires Auth.
   */
  getMySubscription: async (): Promise<UserSubscriptionResponse> => {
    const response = await api.get("/user/subscription");
    return response.data;
  },

  /**
   * POST /subscription/create-order
   * Creates a Razorpay order for the given planId. Requires Auth.
   */
  createSubscriptionOrder: async (
    planId: number
  ): Promise<CreateOrderResponse> => {
    const response = await api.post("/subscription/create-order", { planId });
    return response.data;
  },

  /**
   * POST /subscription/verify-payment
   * Verifies Razorpay signature and activates subscription. Requires Auth.
   */
  verifySubscriptionPayment: async (
    payload: VerifyPaymentPayload
  ): Promise<VerifyPaymentResponse> => {
    const response = await api.post("/subscription/verify-payment", payload);
    return response.data;
  },

  /**
   * POST /subscription/activate-free
   * Directly activates the free plan without Razorpay. Requires Auth.
   */
  activateFreePlan: async (planId: number): Promise<VerifyPaymentResponse> => {
    const response = await api.post("/subscription/activate-free", { planId });
    return response.data;
  },

  /**
   * POST /subscription/cancel
   * Cancels the current subscription. Requires Auth.
   */
  cancelSubscription: async (): Promise<CancelSubscriptionResponse> => {
    const response = await api.post("/subscription/cancel");
    return response.data;
  },
};
