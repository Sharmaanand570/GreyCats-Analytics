import api from "@/apiConfig";
import { withRetry, classifyError, type SyncError } from "@/utils/errorHandling";

// ============================================================================
// CURRENT CLIENT-SPECIFIC ENDPOINTS (matching Google Analytics pattern)
// Backend automatically finds assigned account based on clientId
// ============================================================================

// Analytics/Summary Types
export type WooCommerceAnalyticsResponse = {
  success: boolean;
  message?: string;
  storeUrl?: string;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    averageOrderValue: number;
  };
};

// Product Types
export type WooCommerceProduct = {
  id: number;
  name: string;
  sku: string;
  price: string;
  regularPrice: string;
  salePrice: string;
  stockStatus: string;
  stockQuantity: number | null;
  permalink: string;
};

export type WooCommerceProductsResponse = {
  success: boolean;
  products: WooCommerceProduct[];
};

// Order Types
export type WooCommerceOrder = {
  id: number;
  orderNumber: string;
  status: string;
  total: string;
  currency: string;
  dateCreated: string;
  customerName: string;
  itemCount: number;
};

export type WooCommerceOrdersResponse = {
  success: boolean;
  orders: WooCommerceOrder[];
};

// Trends Types
export type WooCommerceTrendDataPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export type WooCommerceTrendsResponse = {
  success: boolean;
  trends: WooCommerceTrendDataPoint[];
};

// ============================================================================
// STUB/FUTURE TYPES
// ============================================================================

export type WooCommercePerProductPaginatedResponse = {
  success: boolean;
  products: {
    productId: string;
    name: string;
    revenue: number;
    qty: number;
  }[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type WooCommerceAgencyRollupResponse = {
  success: boolean;
  totals: {
    totalRevenue: number;
    totalOrders: number;
    totalAvgOrder: number;
  };
  accounts: {
    id: number;
    storeUrl: string;
    revenue: number;
    orders: number;
    avgOrderValue: number;
  }[];
};

export type WooCommerceSyncStatusResponse = {
  success: boolean;
  sync: {
    id: number;
    isActive: boolean;
    lastProductsSync: string | null;
    lastOrdersSync: string | null;
  };
};

export type WooCommerceAccountInfoResponse = {
  success: boolean;
  account: {
    id: number;
    storeUrl: string;
    isActive: boolean;
    lastProductsSync: string | null;
    lastOrdersSync: string | null;
  };
};

export type WooCommerceProductDetailResponse = {
  success: boolean;
  product: WooCommerceProduct | null;
};

export type WooCommerceOrderDetailResponse = {
  success: boolean;
  order: (WooCommerceOrder & { items: any[]; billing: any; shipping: any }) | null;
};

// ============================================================================
// API FUNCTIONS - Client-Specific Endpoints
// ============================================================================

// 1. Summary (Analytics)
export const getWooCommerceAnalytics = async (
  clientId: number
): Promise<WooCommerceAnalyticsResponse> => {
  try {
    const response = await api.get<WooCommerceAnalyticsResponse>(
      `/clients/${clientId}/woocommerce/summary`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching WooCommerce analytics:', error);
    throw new Error(
      error.response?.data?.message ||
      'Failed to fetch WooCommerce analytics. Please try again.'
    );
  }
};

// 2. Products
export const getWooCommerceProducts = async (
  clientId: number
): Promise<WooCommerceProductsResponse> => {
  try {
    const response = await api.get<WooCommerceProductsResponse>(
      `/clients/${clientId}/woocommerce/products`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching WooCommerce products:', error);
    throw new Error(
      error.response?.data?.message ||
      'Failed to fetch WooCommerce products. Please try again.'
    );
  }
};

// 3. Orders
export const getWooCommerceOrders = async (
  clientId: number
): Promise<WooCommerceOrdersResponse> => {
  try {
    const response = await api.get<WooCommerceOrdersResponse>(
      `/clients/${clientId}/woocommerce/orders`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching WooCommerce orders:', error);
    throw new Error(
      error.response?.data?.message ||
      'Failed to fetch WooCommerce orders. Please try again.'
    );
  }
};

// 4. Trends
export const getWooCommerceTrends = async (
  clientId: number
): Promise<WooCommerceTrendsResponse> => {
  try {
    const response = await api.get<WooCommerceTrendsResponse>(
      `/clients/${clientId}/woocommerce/trends`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching WooCommerce trends:', error);
    throw new Error(
      error.response?.data?.message ||
      'Failed to fetch WooCommerce trends. Please try again.'
    );
  }
};

// ============================================================================
// DIRECT INTEGRATION ENDPOINTS (woocommerce.routes.ts)
// ============================================================================

// Per-product paginated analytics
export const getWooCommercePerProductPaginated = async (
  _clientId: number, // kept for signature compatibility, unused by backend endpoint
  params: { accountId: number; page: number; limit: number; sort: string; direction: string } | null
): Promise<WooCommercePerProductPaginatedResponse> => {
  if (!params) return { success: true, products: [], page: 1, limit: 10, total: 0, totalPages: 0 };

  try {
    const response = await api.get<WooCommercePerProductPaginatedResponse>(
      `/woocommerce/analytics/per-product`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching WooCommerce per-product analytics:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch product analytics.');
  }
};

// Agency rollup
export const getWooCommerceAgencyRollup = async (
  _clientId: number // kept for signature compatibility
): Promise<WooCommerceAgencyRollupResponse> => {
  try {
    const response = await api.get<WooCommerceAgencyRollupResponse>(
      `/woocommerce/agency/rollup`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching WooCommerce agency rollup:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch agency rollup.');
  }
};

// Sync status
export const getWooCommerceSyncStatus = async (
  _clientId: number,
  accountId: number | null
): Promise<WooCommerceSyncStatusResponse> => {
  if (!accountId) return { success: true, sync: { id: 0, isActive: false, lastProductsSync: null, lastOrdersSync: null } };

  try {
    const response = await api.get<{ success: boolean; sync: any }>(
      `/woocommerce/sync/status`,
      { params: { accountId } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching WooCommerce sync status:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch sync status.');
  }
};

// Account info
// Note: Backend returns list of accounts. We filter for the specific one.
export const getWooCommerceAccountInfo = async (
  _clientId: number,
  accountId: number | null
): Promise<WooCommerceAccountInfoResponse> => {
  // If no accountId, we can't fetch a specific account info
  if (!accountId) {
    return { success: true, account: { id: 0, storeUrl: '', isActive: false, lastProductsSync: null, lastOrdersSync: null } };
  }

  try {
    const response = await api.get<{ success: boolean; accounts: any[] }>(
      `/woocommerce/accounts`
    );

    if (response.data.success && response.data.accounts) {
      const account = response.data.accounts.find((acc: any) => acc.id === accountId);
      if (account) {
        return { success: true, account };
      }
    }

    // Fallback if not found
    return { success: false, account: { id: 0, storeUrl: '', isActive: false, lastProductsSync: null, lastOrdersSync: null } };
  } catch (error: any) {
    console.error('Error fetching WooCommerce account info:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch account info.');
  }
};

// Single product detail
export const getWooCommerceProduct = async (
  _clientId: number,
  productId: string,
  accountId: number
): Promise<WooCommerceProductDetailResponse> => {
  try {
    const response = await api.get<{ success: boolean; product: any }>(
      `/woocommerce/products/${productId}`,
      { params: { accountId } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching WooCommerce product:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch product details.');
  }
};

// Single order detail
export const getWooCommerceOrder = async (
  _clientId: number,
  orderId: string | null,
  accountId: number | null
): Promise<WooCommerceOrderDetailResponse> => {
  if (!orderId || !accountId) return { success: true, order: null };

  try {
    const response = await api.get<{ success: boolean; order: any }>(
      `/woocommerce/orders/${orderId}`,
      { params: { accountId } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching WooCommerce order:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch order details.');
  }
};

// Sync operations
export const syncWooProducts = async (accountId: number): Promise<any> => {
  try {
    return await withRetry(
      async () => {
        const response = await api.post(`/woocommerce/sync/products`, { accountId });
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
    throw classifyError(error);
  }
};

export const syncWooOrders = async (accountId: number): Promise<any> => {
  try {
    return await withRetry(
      async () => {
        const response = await api.post(`/woocommerce/sync/orders`, { accountId });
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
    throw classifyError(error);
  }
};

// Account Management (keep comments for reference, but implementation is generic)
// The generic integrationApi functions should be used for connect/disconnect/assign