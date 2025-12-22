import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWooCommerceAnalytics,
  getWooCommerceProducts,
  getWooCommerceOrders,
  getWooCommerceTrends,
} from "../api/woocommerceApi";
import type {
  WooCommerceAnalyticsResponse,
  WooCommerceProductsResponse,
  WooCommerceOrdersResponse,
  WooCommerceTrendsResponse,
  WooCommercePerProductPaginatedResponse,
  WooCommerceAgencyRollupResponse,
  WooCommerceSyncStatusResponse,
  WooCommerceAccountInfoResponse,
  WooCommerceProductDetailResponse,
  WooCommerceOrderDetailResponse,
} from "../api/woocommerceApi";
import {
  getAvailableAccounts,
  assignAccountToClient,
  removeAccountFromClient,
} from "@/api/integrationApi";
import api from "@/apiConfig";
import { toast } from "sonner";

// Common query options
const commonQueryOptions = {
  retry: 1,
  staleTime: 30 * 1000, // 30 seconds
};

// ============================================================================
// CURRENT CLIENT-SPECIFIC HOOKS
// ============================================================================

// 1. Analytics/Summary Hook
export const useWooCommerceAnalytics = (clientId: number) => {
  return useQuery<WooCommerceAnalyticsResponse>({
    queryKey: ["woocommerce-analytics", clientId],
    queryFn: () => getWooCommerceAnalytics(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

// 2. Products Hook
export const useWooCommerceProducts = (clientId: number) => {
  return useQuery<WooCommerceProductsResponse>({
    queryKey: ["woocommerce-products", clientId],
    queryFn: () => getWooCommerceProducts(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

// 3. Orders Hook
export const useWooCommerceOrders = (clientId: number) => {
  return useQuery<WooCommerceOrdersResponse>({
    queryKey: ["woocommerce-orders", clientId],
    queryFn: () => getWooCommerceOrders(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

// 4. Trends Hook
export const useWooCommerceTrends = (clientId: number) => {
  return useQuery<WooCommerceTrendsResponse>({
    queryKey: ["woocommerce-trends", clientId],
    queryFn: () => getWooCommerceTrends(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Available Accounts Hook (for account management)
export const useWooCommerceAccounts = () => {
  return useQuery({
    queryKey: ["woocommerce-accounts"],
    queryFn: () => getAvailableAccounts('woocommerce'),
    ...commonQueryOptions,
  });
};

// Assign WooCommerce Account to Client
export const useAssignWooCommerceAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, accountId }: { clientId: number; accountId: string | number }) =>
      assignAccountToClient(clientId, 'woocommerce', accountId),
    onSuccess: () => {
      toast.success('WooCommerce account assigned successfully');
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['woocommerce-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['woocommerce-analytics'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign WooCommerce account');
    },
  });
};

// Remove WooCommerce Account from Client
export const useRemoveWooCommerceAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, accountId }: { clientId: number; accountId: string | number }) =>
      removeAccountFromClient(clientId, 'woocommerce', accountId),
    onSuccess: () => {
      toast.success('WooCommerce account removed successfully');
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['woocommerce-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['woocommerce-analytics'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove WooCommerce account');
    },
  });
};

// ============================================================================
// STUB HOOKS (Not yet implemented in backend - returning disabled/empty states)
// ============================================================================

// Connection hook (used in ConnectDataSource.tsx)
export const useWooCommerceConnect = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ params }: { params: { storeUrl: string; consumerKey: string; consumerSecret: string } }) => {
      const response = await api.post('/woocommerce/connect', params);
      return response.data;
    },
    onSuccess: () => {
      toast.success('WooCommerce store connected successfully');
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['woocommerce-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to connect WooCommerce store. Please check your credentials.');
    },
  });
};

// Per-product paginated analytics (used in WooCommerceDetailPage)
export const useWooCommercePerProductPaginated = (
  clientId: number,
  params: { accountId: number; page: number; limit: number; sort: string; direction: string } | null
) => {
  return useQuery<WooCommercePerProductPaginatedResponse>({
    queryKey: ["woocommerce-per-product-paginated", clientId, params],
    queryFn: () => Promise.resolve({ success: true, products: [], page: 1, limit: 10, total: 0, totalPages: 0 }),
    enabled: false, // Disabled until backend endpoint is available
  });
};

// Agency rollup (used in WooCommerceDetailPage)
export const useWooCommerceAgencyRollup = (clientId: number) => {
  return useQuery<WooCommerceAgencyRollupResponse>({
    queryKey: ["woocommerce-agency-rollup", clientId],
    queryFn: () => Promise.resolve({ success: true, totals: { totalRevenue: 0, totalOrders: 0, totalAvgOrder: 0 }, accounts: [] }),
    enabled: false, // Disabled until backend endpoint is available
  });
};

// Sync status (used in WooCommerceDetailPage)
export const useWooCommerceSyncStatus = (clientId: number, accountId: number | null) => {
  return useQuery<WooCommerceSyncStatusResponse>({
    queryKey: ["woocommerce-sync-status", clientId, accountId],
    queryFn: () => Promise.resolve({ success: true, sync: { id: 0, isActive: false, lastProductsSync: null, lastOrdersSync: null } }),
    enabled: false, // Disabled until backend endpoint is available
  });
};

// Account info (used in WooCommerceDetailPage)
export const useWooCommerceAccountInfo = (clientId: number, accountId: number | null) => {
  return useQuery<WooCommerceAccountInfoResponse>({
    queryKey: ["woocommerce-account-info", clientId, accountId],
    queryFn: () => Promise.resolve({ success: true, account: { id: 0, storeUrl: '', isActive: false, lastProductsSync: null, lastOrdersSync: null } }),
    enabled: false, // Disabled until backend endpoint is available
  });
};

// Single product detail (used in WooCommerceDetailPage)
export const useWooCommerceProduct = (clientId: number, productId: string, accountId: number) => {
  return useQuery<WooCommerceProductDetailResponse>({
    queryKey: ["woocommerce-product", clientId, productId, accountId],
    queryFn: () => Promise.resolve({ success: true, product: null }),
    enabled: false, // Disabled until backend endpoint is available
  });
};

// Single order detail (used in WooCommerceDetailPage)
export const useWooCommerceOrder = (clientId: number, orderId: string | null, accountId: number | null) => {
  return useQuery<WooCommerceOrderDetailResponse>({
    queryKey: ["woocommerce-order", clientId, orderId, accountId],
    queryFn: () => Promise.resolve({ success: true, order: null }),
    enabled: false, // Disabled until backend endpoint is available
  });
};

// Sync mutations (used in WooCommerceDetailPage)
export const useWooCommerceSyncProducts = () => {
  return { mutate: () => { }, mutateAsync: async () => { }, isPending: false };
};

export const useWooCommerceSyncOrders = () => {
  return { mutate: () => { }, mutateAsync: async () => { }, isPending: false };
};

export const useWooCommerceDisconnect = () => {
  return { mutate: () => { }, mutateAsync: async () => { }, isPending: false };
};

export const useWooCommerceReconnect = () => {
  return { mutate: () => { }, mutateAsync: async () => { }, isPending: false };
};
