import api from "@/apiConfig";

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
  products: (WooCommerceProduct & { revenue: number; qty: number })[];
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
// ACCOUNT MANAGEMENT
// ============================================================================
// For WooCommerce account management operations, use the generic integration API:
//
// 1. Get available accounts:
//    import { getAvailableAccounts } from '@/api/integrationApi';
//    const accounts = await getAvailableAccounts('woocommerce');
//
// 2. Assign account to client:
//    import { assignAccountToClient } from '@/api/integrationApi';
//    await assignAccountToClient(clientId, 'woocommerce', accountId);
//
// 3. Remove account from client:
//    import { removeAccountFromClient } from '@/api/integrationApi';
//    await removeAccountFromClient(clientId, 'woocommerce', accountId);
//
// These functions are consistent across all integrations and handle proper
// endpoint routing and data normalization automatically.