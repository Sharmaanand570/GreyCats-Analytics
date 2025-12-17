import api from "@/apiConfig";


export type wooCommerceConnectionAPIparams = {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
};

export type wooCommerceConnectionAPIResponse = {
  success: boolean;
  message: string;
  account: {
    id: number;
    userId: number;
    storeUrl: string;
    consumerKeyEnc: string;
    consumerSecretEnc: string;
    isActive: boolean;
    connectedAt: string;
    updatedAt: string;
    lastProductsSync: string | null;
    lastOrdersSync: string | null;
  };
};

// Connection API Function
export const wooCommerceConnectionAPI = async (
  params: wooCommerceConnectionAPIparams
): Promise<wooCommerceConnectionAPIResponse> => {
  const response = await api.post<wooCommerceConnectionAPIResponse>(
    `/woocommerce/connect`,
    params
  );

  return response.data;
};

// Sync API Types
export type WooCommerceSyncParams = {
  accountId: number;
};

export type WooCommerceSyncResponse = {
  success: boolean;
  count: number;
};

// Analytics API Types
export type WooCommerceAnalyticsResponse = {
  success: boolean;
  analytics: {
    totalRevenue: number;
    orderCount: number;
    avgOrderValue: number;
  };
};

export type WooCommercePerProductResponse = {
  success: boolean;
  products: Array<{
    productId: string;
    name: string;
    revenue: number;
    qty: number;
  }>;
};

export type WooCommerceAgencyRollupResponse = {
  success: boolean;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  totals: {
    totalRevenue: number;
    totalOrders: number;
    totalAvgOrder: number;
  };
  accounts: Array<{
    accountId: number;
    storeUrl: string;
    revenue: number;
    orders: number;
    avgOrderValue: number;
  }>;
};

// Disconnect/Reconnect Types
export type WooCommerceDisconnectParams = {
  accountId: number;
};

export type WooCommerceDisconnectResponse = {
  success: boolean;
  message: string;
};

export type WooCommerceReconnectResponse = {
  success: boolean;
  message: string;
  account: {
    id: number;
    storeUrl: string;
    isActive: boolean;
    lastProductsSync: string | null;
    lastOrdersSync: string | null;
  };
};

// Product Types
export type WooCommerceProduct = {
  productId: string;
  name: string;
  sku: string;
  price: number;
  stockQty: number;
  status: string;
};

export type WooCommerceProductsParams = {
  accountId: number;
  page?: number;
  limit?: number;
  search?: string;
};

export type WooCommerceProductsResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  products: WooCommerceProduct[];
};

export type WooCommerceSingleProductResponse = {
  success: boolean;
  product: WooCommerceProduct;
};

// Order Types
export type WooCommerceOrder = {
  id: number;
  orderId: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
};

export type WooCommerceOrderItem = {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  total: number;
};

export type WooCommerceOrderDetail = WooCommerceOrder & {
  items: WooCommerceOrderItem[];
};

export type WooCommerceOrdersParams = {
  accountId: number;
  page?: number;
  limit?: number;
};

export type WooCommerceOrdersResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  orders: WooCommerceOrder[];
};

export type WooCommerceSingleOrderResponse = {
  success: boolean;
  order: WooCommerceOrderDetail;
};

// Account Info Types
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

// Sync Status Types
export type WooCommerceSyncStatusResponse = {
  success: boolean;
  sync: {
    id: number;
    isActive: boolean;
    lastProductsSync: string | null;
    lastOrdersSync: string | null;
  };
};

// Per Product Analytics with Pagination
export type WooCommercePerProductAnalyticsParams = {
  accountId: number;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  direction?: "asc" | "desc";
};

export type WooCommercePerProductAnalyticsResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  products: Array<{
    productId: string;
    name: string;
    revenue: number;
    qty: number;
  }>;
};

// Report Draft Types
export type WooCommerceReportDraftParams = {
  accountId: number;
  title: string;
  data: Record<string, unknown>;
};

export type WooCommerceReportDraftResponse = {
  success: boolean;
  draft: {
    id: number;
    accountId: number;
    title: string;
    updatedAt: string;
  };
};

// Snapshot Types
export type WooCommerceSnapshot = {
  id: number;
  accountId: number;
  periodStart: string;
  periodEnd: string;
  data: {
    revenue: number;
    orderCount: number;
    avgOrder: number;
    timestamp: string;
  };
  createdAt: string;
};

export type WooCommercePublishSnapshotResponse = {
  success: boolean;
  snapshot: WooCommerceSnapshot;
};

export type WooCommerceSnapshotsResponse = {
  success: boolean;
  snapshots: WooCommerceSnapshot[];
};

// Accounts List Types
export type WooCommerceAccount = {
  id: number;
  storeUrl: string;
  isActive: boolean;
};

export type WooCommerceAccountsResponse = {
  success: boolean;
  accounts: WooCommerceAccount[];
};

// Agency Rollup Params
export type WooCommerceAgencyRollupParams = {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: "asc" | "desc";
};

// Sync API Functions
export const syncWooCommerceProducts = async (
  clientId: number,
  params: WooCommerceSyncParams
): Promise<WooCommerceSyncResponse> => {
  const response = await api.post<WooCommerceSyncResponse>(
    `/clients/${clientId}/woocommerce/sync/products`,
    params
  );
  return response.data;
};

export const syncWooCommerceOrders = async (
  clientId: number,
  params: WooCommerceSyncParams
): Promise<WooCommerceSyncResponse> => {
  const response = await api.post<WooCommerceSyncResponse>(
    `/clients/${clientId}/woocommerce/sync/orders`,
    params
  );
  return response.data;
};

// Analytics API Functions
export const getWooCommerceAnalytics = async (
  clientId: number,
  accountId: number
): Promise<WooCommerceAnalyticsResponse> => {
  const response = await api.get<WooCommerceAnalyticsResponse>(
    `/clients/${clientId}/woocommerce/analytics`,
    {
      params: { accountId },
    }
  );
  return response.data;
};

// Legacy function for backward compatibility (without pagination)
export const getWooCommercePerProductAnalyticsLegacy = async (
  clientId: number,
  accountId: number
): Promise<WooCommercePerProductResponse> => {
  const response = await api.get<WooCommercePerProductResponse>(
    `/clients/${clientId}/woocommerce/analytics/per-product`,
    {
      params: { accountId },
    }
  );
  return response.data;
};

export const getWooCommerceAgencyRollup = async (
  clientId: number,
  params?: WooCommerceAgencyRollupParams
): Promise<WooCommerceAgencyRollupResponse> => {
  const response = await api.get<WooCommerceAgencyRollupResponse>(
    `/clients/${clientId}/woocommerce/agency/rollup`,
    { params }
  );
  return response.data;
};

// Disconnect/Reconnect API Functions
export const disconnectWooCommerce = async (
  clientId: number,
  params: WooCommerceDisconnectParams
): Promise<WooCommerceDisconnectResponse> => {
  const response = await api.post<WooCommerceDisconnectResponse>(
    `/clients/${clientId}/woocommerce/disconnect`,
    params
  );
  return response.data;
};

export const reconnectWooCommerce = async (
  clientId: number,
  params: WooCommerceDisconnectParams
): Promise<WooCommerceReconnectResponse> => {
  const response = await api.post<WooCommerceReconnectResponse>(
    `/clients/${clientId}/woocommerce/reconnect`,
    params
  );
  return response.data;
};

// Products API Functions
export const getWooCommerceProducts = async (
  clientId: number,
  params: WooCommerceProductsParams
): Promise<WooCommerceProductsResponse> => {
  const response = await api.get<WooCommerceProductsResponse>(
    `/clients/${clientId}/woocommerce/products`,
    { params }
  );
  return response.data;
};

export const getWooCommerceProduct = async (
  clientId: number,
  productId: string,
  accountId: number
): Promise<WooCommerceSingleProductResponse> => {
  const response = await api.get<WooCommerceSingleProductResponse>(
    `/clients/${clientId}/woocommerce/products/${productId}`,
    { params: { accountId } }
  );
  return response.data;
};

// Orders API Functions
export const getWooCommerceOrders = async (
  clientId: number,
  params: WooCommerceOrdersParams
): Promise<WooCommerceOrdersResponse> => {
  const response = await api.get<WooCommerceOrdersResponse>(
    `/clients/${clientId}/woocommerce/orders`,
    { params }
  );
  return response.data;
};

export const getWooCommerceOrder = async (
  clientId: number,
  orderId: string,
  accountId: number
): Promise<WooCommerceSingleOrderResponse> => {
  const response = await api.get<WooCommerceSingleOrderResponse>(
    `/clients/${clientId}/woocommerce/orders/${orderId}`,
    { params: { accountId } }
  );
  return response.data;
};

// Account Info API Functions
export const getWooCommerceAccountInfo = async (
  clientId: number,
  accountId: number
): Promise<WooCommerceAccountInfoResponse> => {
  const response = await api.get<WooCommerceAccountInfoResponse>(
    `/clients/${clientId}/woocommerce/account`,
    { params: { accountId } }
  );
  return response.data;
};

export const getWooCommerceSyncStatus = async (
  clientId: number,
  accountId: number
): Promise<WooCommerceSyncStatusResponse> => {
  const response = await api.get<WooCommerceSyncStatusResponse>(
    `/clients/${clientId}/woocommerce/sync/status`,
    { params: { accountId } }
  );
  return response.data;
};

// Per Product Analytics with Pagination
export const getWooCommercePerProductAnalytics = async (
  clientId: number,
  params: WooCommercePerProductAnalyticsParams
): Promise<WooCommercePerProductAnalyticsResponse> => {
  const response = await api.get<WooCommercePerProductAnalyticsResponse>(
    `/clients/${clientId}/woocommerce/analytics/per-product`,
    { params }
  );
  return response.data;
};

// Report Draft API Functions
export const saveWooCommerceReportDraft = async (
  clientId: number,
  params: WooCommerceReportDraftParams
): Promise<WooCommerceReportDraftResponse> => {
  const response = await api.put<WooCommerceReportDraftResponse>(
    `/clients/${clientId}/woocommerce/report/draft`,
    params
  );
  return response.data;
};

export const publishWooCommerceSnapshot = async (
  clientId: number,
  params: WooCommerceSyncParams
): Promise<WooCommercePublishSnapshotResponse> => {
  const response = await api.post<WooCommercePublishSnapshotResponse>(
    `/clients/${clientId}/woocommerce/report/publish`,
    params
  );
  return response.data;
};

export const getWooCommerceSnapshots = async (
  clientId: number,
  accountId: number
): Promise<WooCommerceSnapshotsResponse> => {
  const response = await api.get<WooCommerceSnapshotsResponse>(
    `/clients/${clientId}/woocommerce/snapshots`,
    { params: { accountId } }
  );
  return response.data;
};

// Accounts List API Function
export const getWooCommerceAccounts = async (
  clientId: number
): Promise<WooCommerceAccountsResponse> => {
  const response = await api.get<WooCommerceAccountsResponse>(
    `/clients/${clientId}/woocommerce/accounts`
  );
  return response.data;
};