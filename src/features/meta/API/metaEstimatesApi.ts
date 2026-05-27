import api from "@/apiConfig";
import type { AxiosError } from "axios";
import type { PublishAdTargeting } from "./metaAdsManagerApi";

// ==================== TYPES ====================

// Body shape for POST /reach-estimate — backend forwards relevant fields to
// Meta's reach-estimate Graph endpoint. accountId is required so backend can
// route to the right ad account.
export type ReachEstimatePayload = {
  accountId: string;
  targeting: PublishAdTargeting;
  optimizationGoal?: string;
  ageRange?: { min: number; max: number };
  gender?: "ALL" | "MEN" | "WOMEN";
};

export type ReachEstimate = {
  // Meta's API returns a single midpoint estimate, not a range. Backend
  // normalises to `users`. Always non-negative; can be 0 for impossible
  // targeting (e.g. zero-overlap exclusions).
  users: number;
  bid_estimations?: Array<{
    cpa_bid?: number;
    location?: number;
    curve?: Array<{ spend: number; reach: number }>;
  }>;
};

export type ReachEstimateResponse = {
  success: boolean;
  data: ReachEstimate;
};

// Delivery estimate — given a fully-specified adset draft, returns a curve
// of (spend → reach/impressions/actions) outcomes for budget-planning.
export type DeliveryEstimatePayload = {
  accountId: string;
  targeting: PublishAdTargeting;
  optimizationGoal: string;
  billingEvent?: string;
  bidStrategy?: string;
  bidAmount?: number;
  dailyBudget?: number;
  lifetimeBudget?: number;
};

export type DeliveryOutcomePoint = {
  spend: number;
  reach: number;
  impressions: number;
  actions: number;
};

export type DeliveryEstimate = {
  daily_outcomes_curve: DeliveryOutcomePoint[];
  estimate_mau: number;
  estimate_ready: boolean;
};

export type DeliveryEstimateResponse = {
  success: boolean;
  data: DeliveryEstimate;
};

// Ad preview — backend returns one `body` per ad_format containing an iframe
// HTML string. Render inside a sandboxed div.
export type AdPreviewPayload = {
  // Either supply an existing adId (for edit-mode preview) or a creative
  // draft (for new-ad preview). Backend dispatches accordingly.
  adId?: string;
  creativeSpec?: unknown;
  adFormat: string;          // "DESKTOP_FEED_STANDARD", "MOBILE_FEED_STANDARD", "INSTAGRAM_STANDARD", ...
  pagePageId?: string;
};

export type AdPreviewItem = { body: string };

export type AdPreviewResponse = {
  success: boolean;
  data: AdPreviewItem[];
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

// ==================== API ====================

export const getReachEstimate = async (
  payload: ReachEstimatePayload
): Promise<ReachEstimate> => {
  try {
    const response = await api.post<ReachEstimateResponse>(
      "/meta-campaign-wizard/reach-estimate",
      payload
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to fetch reach estimate"
    );
  }
};

export const getDeliveryEstimate = async (
  payload: DeliveryEstimatePayload
): Promise<DeliveryEstimate> => {
  try {
    const response = await api.post<DeliveryEstimateResponse>(
      "/meta-campaign-wizard/delivery-estimate",
      payload
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to fetch delivery estimate"
    );
  }
};

export const getAdPreview = async (
  payload: AdPreviewPayload
): Promise<AdPreviewItem[]> => {
  try {
    const response = await api.post<AdPreviewResponse>(
      "/meta-campaign-wizard/preview",
      payload
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to fetch ad preview"
    );
  }
};
