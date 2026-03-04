// ─── Plan ────────────────────────────────────────────────────────────────────

export interface PlanLimits {
  maxClients: number;        // -1 = unlimited
  maxIntegrations: number;   // -1 = unlimited
  maxReports: number;        // -1 = unlimited
  trialDays?: number;
}

export interface PlanFeatures {
  reports?: boolean;
  scheduledReports: boolean;
  pdfExport: boolean;
  alerts: boolean;
  api: boolean;
  whiteLabel?: boolean;
}

export interface Plan {
  id: number;
  name: string;               // "trial" | "free" | "starter" | "pro" | "agency" | "enterprise"
  displayName: string;
  description: string;
  price: number;              // in RUPEES (₹) — e.g. 2499 means ₹2,499
  currency: string;
  interval: string;           // "trial" | "monthly" | "yearly"
  limits: PlanLimits;
  features: PlanFeatures;
}

export interface PlansResponse {
  success: boolean;
  plans: Plan[];
}

// ─── Current Subscription ────────────────────────────────────────────────────

export interface UsageItem {
  used: number;
  limit: number;        // -1 = unlimited
  unlimited?: boolean;  // backend may also send this explicitly
}

export interface SubscriptionUsage {
  clients: UsageItem;
  integrations: UsageItem;
  reports: UsageItem;
}

export interface CurrentPlanInfo {
  planName: string;
  displayName: string;
  startDate?: string;
  expiryDate?: string;
  /** Injected client-side after cancel API responds */
  status?: "active" | "cancelled" | "expired";
  /** Injected client-side — the date access actually ends after cancellation */
  accessUntil?: string;
  limits: PlanLimits;
  features: PlanFeatures;
}

export interface UserSubscriptionResponse {
  success: boolean;
  plan: CurrentPlanInfo;
  usage: SubscriptionUsage;
}

// ─── Razorpay / Payment ──────────────────────────────────────────────────────

export interface RazorpayOrder {
  id: string;     // Razorpay order ID — e.g. "order_PXxxxx"
  amount: number; // in PAISE — e.g. 249900 = ₹2,499
  currency: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order: RazorpayOrder;
  /** Plan metadata returned alongside the order */
  plan: {
    id: number;           // numeric plan ID — used in verify-payment
    displayName: string;
    price: number;        // in rupees
  };
  keyId: string;          // Razorpay publishable key
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  planId: number;   // numeric plan ID (from CreateOrderResponse.plan.id)
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  subscription?: {
    id: number;
    plan: string;
    startDate: string;
    endDate: string;
  };
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message?: string;
  accessUntil?: string;
}

// ─── API Error with upgrade flag ─────────────────────────────────────────────

export interface SubscriptionApiError {
  success: false;
  message: string;
  code:
    | "CLIENT_LIMIT_REACHED"
    | "INTEGRATION_LIMIT_REACHED"
    | "FEATURE_NOT_AVAILABLE"
    | "REPORT_QUOTA_EXCEEDED"
    | string;
  upgradeRequired?: boolean;
}

// ─── Feature Gate ────────────────────────────────────────────────────────────

export interface FeatureGateResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
}
