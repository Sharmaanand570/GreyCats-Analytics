import api from "@/apiConfig";
import type { AxiosError } from "axios";
import { withRetry, type SyncError } from "@/utils/errorHandling";

// ==================== TYPES ====================

export type ShopifyConnectResponse = {
  success: boolean;
  url: string;
  installLink: string;
  oauthUrl?: string; // Sometimes returned
  shopDomain?: string;
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
/**
 * Initiate Shopify OAuth connection
 * GET /shopify/connect?shop=shop-link
 */
export const connectShopify = async (
  storeUrl: string,
  clientId?: number | null // Added clientId
): Promise<ShopifyConnectResponse & { installLink: string }> => {
  try {
    // Updated to match the working APIDog request: GET /shopify/reconnect
    const response = await api.get("/shopify/reconnect", {
      params: {
        shop: storeUrl,
        client_id: clientId, // Pass client_id to backend
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
    return await withRetry(
      async () => {
        const response = await api.get<ShopifySyncResponse>(`/clients/${clientId}/shopify/sync`);
        return response.data;
      },
      {
        maxRetries: 3,
        timeoutMs: 60000,
      }
    );
  } catch (error) {
    const syncError = error as SyncError;
    if (syncError.type) {
      throw syncError;
    }
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

// ============================================================================
// NEW CLIENT-SPECIFIC ENDPOINTS (matching WooCommerce pattern)
// Backend automatically finds assigned account based on clientId
// ============================================================================

// Summary/Analytics Types
export type ShopifySummaryResponse = {
  success: boolean;
  message?: string;
  shopDomain?: string;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    fulfilledOrders: number;
    averageOrderValue: number;
  };
};

// Product Types (simplified for client-specific endpoint)
export type ShopifySimpleProduct = {
  id: string;
  title: string;
  price: string;
  compareAtPrice: string | null;
  inventoryQuantity: number;
  sku: string;
  status: string;
  productType: string;
};

export type ShopifyProductsResponse = {
  success: boolean;
  products: ShopifySimpleProduct[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
};

// Order Types (simplified for client-specific endpoint)
export type ShopifySimpleOrder = {
  id: string;
  orderNumber: string;
  financialStatus: string;
  fulfillmentStatus: string | null;
  totalPrice: string;
  currency: string;
  createdAt: string;
  customerName: string;
  itemCount: number;
};

export type ShopifyOrdersResponse = {
  success: boolean;
  orders: ShopifySimpleOrder[];
};

// Trends Types
export type ShopifyTrendDataPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export type ShopifyTrendsResponse = {
  success: boolean;
  message?: string;
  trends: ShopifyTrendDataPoint[];
};

// ============================================================================
// NEW API FUNCTIONS - Client-Specific Endpoints
// ============================================================================

/**
 * Get Shopify summary/analytics for a client
 * GET /api/clients/:clientId/shopify/summary
 */
export const getShopifySummary = async (clientId: number): Promise<ShopifySummaryResponse> => {
  try {
    const response = await api.get<ShopifySummaryResponse>(`/clients/${clientId}/shopify/summary`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify summary");
  }
};

/**
 * Get Shopify products for a client
 * GET /api/clients/:clientId/shopify/products
 */
export const getShopifyProducts = async (
  clientId: number,
  params?: { limit?: number }
): Promise<ShopifyProductsResponse> => {
  try {
    const response = await api.get<ShopifyProductsResponse>(
      `/clients/${clientId}/shopify/products`,
      { params }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify products");
  }
};

/**
 * Get Shopify orders for a client
 * GET /api/clients/:clientId/shopify/orders
 */
export const getShopifyOrders = async (
  clientId: number,
  params?: { limit?: number }
): Promise<ShopifyOrdersResponse> => {
  try {
    const response = await api.get<ShopifyOrdersResponse>(
      `/clients/${clientId}/shopify/orders`,
      { params }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify orders");
  }
};

/**
 * Get Shopify trends for a client
 * GET /api/clients/:clientId/shopify/trends
 */
export const getShopifyTrends = async (
  clientId: number | null | undefined,
  params?: { startDate?: string; endDate?: string }
): Promise<ShopifyTrendsResponse> => {
  try {
    if (!clientId) {
      throw new Error("Client ID is required for direct Shopify API calls");
    }
    console.log(`[Widget API] GET /api/clients/${clientId}/shopify/trends`, {
      integration: "shopify",
      metricKey: "shopify.trends",
      dateFrom: params?.startDate ?? "",
      dateTo: params?.endDate ?? "",
      params,
    });
    const response = await api.get<ShopifyTrendsResponse>(
      `/clients/${clientId}/shopify/trends`,
      { params }
    );
    console.log(`[Widget API] Response /api/clients/${clientId}/shopify/trends`, response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify trends");
  }
};

/**
 * Get Shopify meta (same as summary)
 * GET /api/clients/:clientId/shopify/meta
 */
export const getShopifyMeta = async (clientId: number): Promise<ShopifySummaryResponse> => {
  try {
    const response = await api.get<ShopifySummaryResponse>(`/clients/${clientId}/shopify/meta`);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch Shopify meta");
  }
};

export const syncShopifyOrders = async (clientId: number): Promise<ShopifySyncResponse> => {
  try {
    return await withRetry(
      async () => {
        const response = await api.get<ShopifySyncResponse>(`/clients/${clientId}/shopify/orders`);
        return response.data;
      },
      {
        maxRetries: 3,
        timeoutMs: 60000,
      }
    );
  } catch (error) {
    const syncError = error as SyncError;
    if (syncError.type) {
      throw syncError;
    }
    return handleApiError(error, "Failed to sync Shopify orders");
  }
};

export const forceSyncProducts = async (clientId: number): Promise<ShopifySyncResponse> => {
  try {
    return await withRetry(
      async () => {
        const response = await api.get<ShopifySyncResponse>(`/clients/${clientId}/shopify/sync`);
        return response.data;
      },
      {
        maxRetries: 3,
        timeoutMs: 60000,
      }
    );
  } catch (error) {
    const syncError = error as SyncError;
    if (syncError.type) {
      throw syncError;
    }
    return handleApiError(error, "Failed to force sync Shopify products");
  }
};


