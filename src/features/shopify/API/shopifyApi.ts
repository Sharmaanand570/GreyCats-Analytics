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
      params: {
        shop: params.shop,
      },
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
        params: {
          shop: params.shop,
          status: params.status,
        },
      }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to complete Shopify connection");
  }
};

export const syncShopifyProducts = async (clientId: number): Promise<ShopifySyncResponse> => {
  try {
    const response = await api.get<ShopifySyncResponse>(`/clients/${clientId}/shopify/sync`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to sync Shopify products");
  }
};

export const getShopifyProductsList = async (
  clientId: number,
  params?: ShopifyProductListParams
): Promise<ShopifyProductListResponse> => {
  try {
    const response = await api.get<ShopifyProductListResponse>(
      `/clients/${clientId}/shopify/products/list`,
      { params }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify products");
  }
};

export const getShopifyProduct = async (
  clientId: number,
  productId: string
): Promise<ShopifySingleProductResponse> => {
  try {
    const response = await api.get<ShopifySingleProductResponse>(
      `/clients/${clientId}/shopify/products/${productId}`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify product");
  }
};

export const getShopifyOrdersList = async (
  clientId: number,
  params?: ShopifyOrderListParams
): Promise<ShopifyOrderListResponse> => {
  try {
    const response = await api.get<ShopifyOrderListResponse>(
      `/clients/${clientId}/shopify/orders/list`,
      { params }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify orders");
  }
};

export const getShopifyOrder = async (
  clientId: number,
  orderId: string
): Promise<ShopifySingleOrderResponse> => {
  try {
    const response = await api.get<ShopifySingleOrderResponse>(
      `/clients/${clientId}/shopify/orders/${orderId}`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify order");
  }
};

export const getShopifyOrderAnalytics = async (
  clientId: number
): Promise<ShopifyOrderAnalyticsResponse> => {
  try {
    const response = await api.get<ShopifyOrderAnalyticsResponse>(
      `/clients/${clientId}/shopify/analytics/orders`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify order analytics");
  }
};

export const getShopifyRevenueTrend = async (
  clientId: number
): Promise<ShopifyRevenueTrendResponse> => {
  try {
    const response = await api.get<ShopifyRevenueTrendResponse>(
      `/clients/${clientId}/shopify/analytics/revenue`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify revenue trend");
  }
};

export const disconnectShopify = async (clientId: number): Promise<ShopifyDisconnectResponse> => {
  try {
    const response = await api.post<ShopifyDisconnectResponse>(
      `/clients/${clientId}/shopify/disconnect`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to disconnect Shopify");
  }
};

export const deleteShopifyAccount = async (clientId: number): Promise<ShopifyDeleteResponse> => {
  try {
    const response = await api.delete<ShopifyDeleteResponse>(
      `/clients/${clientId}/shopify/delete`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to delete Shopify account");
  }
};

export const reconnectShopify = async (
  clientId: number,
  params: ShopifyConnectParams
): Promise<ShopifyReconnectResponse> => {
  try {
    const response = await api.get<ShopifyReconnectResponse>(
      `/clients/${clientId}/shopify/reconnect`,
      { params: { shop: params.shop } }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to initiate Shopify reconnect");
  }
};


