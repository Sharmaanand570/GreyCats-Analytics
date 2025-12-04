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
  shop: string;
  status: string;
};

export type ApiErrorResponse = {
  message?: string;
  error?: string;
};

export type ShopifyReconnectResponse = {
  success: boolean;
  url: string;
};

export type ShopifySyncResponse = {
  success: boolean;
  message: string;
  count: number;
};

export type ShopifyProductListParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  vendor?: string;
  status?: string;
};

export type ShopifyProductListItem = {
  productId: string;
  title: string;
  vendor: string;
  status: string;
  price: number;
  inventoryCount: number;
  updatedAt: string;
};

export type ShopifyProductListResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  products: ShopifyProductListItem[];
};

export type ShopifyProductDetail = {
  id: number;
  accountId: number;
  productId: string;
  title: string;
  vendor: string;
  status: string;
  price: number;
  inventoryCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ShopifySingleProductResponse = {
  success: boolean;
  product: ShopifyProductDetail;
};

export type ShopifyOrderListParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  financialStatus?: string;
  fulfillmentStatus?: string;
  search?: string;
};

export type ShopifyOrderListItem = {
  orderId: string;
  currency: string;
  subtotalPrice: number;
  totalPrice: number;
  totalTax: number;
  financialStatus: string;
  fulfillmentStatus: string;
  createdAtISO: string;
};

export type ShopifyOrderListResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  orders: ShopifyOrderListItem[];
};

export type ShopifyOrderDetail = {
  id: number;
  accountId: number;
  orderId: string;
  currency: string;
  subtotalPrice: number;
  totalPrice: number;
  totalTax: number;
  financialStatus: string;
  fulfillmentStatus: string;
  createdAtISO: string;
  updatedAtISO: string;
  createdAt: string;
  updatedAt: string;
};

export type ShopifySingleOrderResponse = {
  success: boolean;
  order: ShopifyOrderDetail;
};

export type ShopifyOrderAnalyticsResponse = {
  success: boolean;
  message: string;
  data: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    statusBreakdown: Record<string, number>;
  };
};

export type ShopifyRevenueTrendResponse = {
  success: boolean;
  message: string;
  data: Record<string, number>;
};

export type ShopifyDisconnectResponse = {
  success: boolean;
  message: string;
};

export type ShopifyDeleteResponse = {
  success: boolean;
  message: string;
};

const handleApiError = (error: unknown, fallbackMessage: string): never => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  throw new Error(
    axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      fallbackMessage
  );
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
    return handleApiError(error, "Failed to initiate Shopify connection");
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
          shop: params.shop,
          status: params.status,
        },
        headers: { "ngrok-skip-browser-warning": "true" },
      }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to complete Shopify connection");
  }
};

export const syncShopifyProducts = async (): Promise<ShopifySyncResponse> => {
  try {
    const response = await api.get<ShopifySyncResponse>("/shopify/sync");
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to sync Shopify products");
  }
};

export const getShopifyProductsList = async (
  params?: ShopifyProductListParams
): Promise<ShopifyProductListResponse> => {
  try {
    const response = await api.get<ShopifyProductListResponse>(
      "/shopify/products/list",
      { params }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify products");
  }
};

export const getShopifyProduct = async (
  productId: string
): Promise<ShopifySingleProductResponse> => {
  try {
    const response = await api.get<ShopifySingleProductResponse>(
      `/shopify/products/${productId}`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify product");
  }
};

export const getShopifyOrdersList = async (
  params?: ShopifyOrderListParams
): Promise<ShopifyOrderListResponse> => {
  try {
    const response = await api.get<ShopifyOrderListResponse>(
      "/shopify/orders/list",
      { params }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify orders");
  }
};

export const getShopifyOrder = async (
  orderId: string
): Promise<ShopifySingleOrderResponse> => {
  try {
    const response = await api.get<ShopifySingleOrderResponse>(
      `/shopify/orders/${orderId}`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify order");
  }
};

export const getShopifyOrderAnalytics = async (): Promise<ShopifyOrderAnalyticsResponse> => {
  try {
    const response = await api.get<ShopifyOrderAnalyticsResponse>(
      "/shopify/analytics/orders"
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify order analytics");
  }
};

export const getShopifyRevenueTrend = async (): Promise<ShopifyRevenueTrendResponse> => {
  try {
    const response = await api.get<ShopifyRevenueTrendResponse>(
      "/shopify/analytics/revenue"
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify revenue trend");
  }
};

export const disconnectShopify = async (): Promise<ShopifyDisconnectResponse> => {
  try {
    const response = await api.post<ShopifyDisconnectResponse>(
      "/shopify/disconnect"
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to disconnect Shopify");
  }
};

export const deleteShopifyAccount = async (): Promise<ShopifyDeleteResponse> => {
  try {
    const response = await api.delete<ShopifyDeleteResponse>(
      "/shopify/delete"
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to delete Shopify account");
  }
};

export const reconnectShopify = async (
  params: ShopifyConnectParams
): Promise<ShopifyReconnectResponse> => {
  try {
    const response = await api.get<ShopifyReconnectResponse>(
      "/shopify/reconnect",
      { params: { shop: params.shop } }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to initiate Shopify reconnect");
  }
};


