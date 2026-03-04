import type {
  CreateOrderResponse,
  VerifyPaymentPayload,
} from "@/types/subscription.types";

/**
 * If Razorpay isn't available yet (e.g. slow network), poll for up to 5s.
 * The static script tag in index.html loads it before the app bundle,
 * so in practice window.Razorpay is always ready by the time this runs.
 */
function waitForRazorpay(timeoutMs = 5000): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const started = Date.now();
    const interval = setInterval(() => {
      if (window.Razorpay) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - started > timeoutMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, 100);
  });
}

export interface RazorpayCheckoutOptions {
  orderData: CreateOrderResponse;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  onSuccess: (payload: VerifyPaymentPayload) => void;
  onDismiss?: () => void;
}

/**
 * Opens the Razorpay checkout modal.
 *
 * Prerequisite: index.html must have:
 *   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
 *
 * Flow:
 *  1. Confirm window.Razorpay is available.
 *  2. Open the modal with order data from create-order API.
 *  3. On payment success call onSuccess() → caller fires verify-payment.
 *     - planId uses orderData.plan.id  (numeric DB plan ID)
 */
export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions
): Promise<void> {
  const { orderData, userEmail, userName, userPhone, onSuccess, onDismiss } =
    options;

  const ready = await waitForRazorpay();
  if (!ready || !window.Razorpay) {
    throw new Error(
      "Razorpay SDK is not available. Please refresh the page and try again."
    );
  }

  const rzp = new window.Razorpay({
    key: orderData.keyId,
    amount: orderData.order.amount,   // paise — from create-order
    currency: orderData.order.currency,
    name: "Greycats Analytics",
    description: `${orderData.plan.displayName} Plan`,
    order_id: orderData.order.id,     // Razorpay order string "order_PXxxxx"
    prefill: {
      name: userName ?? "",
      email: userEmail ?? "",
      contact: userPhone ?? "",
    },
    theme: {
      color: "#111111",
    },
    handler: (response: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      onSuccess({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        // Numeric plan ID from create-order response (NOT the razorpay order string)
        planId: orderData.plan.id,
      });
    },
    modal: {
      ondismiss: () => {
        onDismiss?.();
      },
    },
  } as Record<string, unknown>);

  rzp.open();
}
