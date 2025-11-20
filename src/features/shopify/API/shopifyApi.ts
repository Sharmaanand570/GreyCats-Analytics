import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type ShopifyConnectResponse = {
  success: boolean;
  url: string;
};

export type ShopifyCallbackResponse = {
  success: boolean;
  message?: string;
  shop?: string;
};

export type ShopifyConnectParams = {
  shop: string;
};

export type ShopifyCallbackParams = {
  code: string;
  hmac: string;
  host: string;
  shop: string;
  state: string;
  timestamp: string;
};

export type ApiErrorResponse = {
  message?: string;
  error?: string;
};

// ==================== API FUNCTIONS ====================

/**
 * Initiate Shopify OAuth connection
 * GET /shopify/connect?shop=shop-link
 */
export const connectShopify = async (
  params: ShopifyConnectParams
): Promise<ShopifyConnectResponse> => {
  try {
    const response = await api.get<ShopifyConnectResponse>("/shopify/connect", {
      baseURL: import.meta.env.VITE_NGROK_URL,
      params: {
        shop: params.shop,
      },
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to initiate Shopify connection"
    );
  }
};

/**
 * Handle Shopify OAuth callback
 */
export const handleShopifyCallback = async (
  params: ShopifyCallbackParams
): Promise<ShopifyCallbackResponse> => {
  try {
    const response = await api.get<ShopifyCallbackResponse>(
      "/shopify/callback",
      {
        baseURL: import.meta.env.VITE_NGROK_URL,
        params: {
          code: params.code,
          hmac: params.hmac,
          host: params.host,
          shop: params.shop,
          state: params.state,
          timestamp: params.timestamp,
        },
        headers: { "ngrok-skip-browser-warning": "true" },
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to complete Shopify connection"
    );
  }
};
