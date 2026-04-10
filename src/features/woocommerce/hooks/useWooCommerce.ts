import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWooCommerceAnalytics,
  getWooCommerceProducts,
  getWooCommerceOrders,
  getWooCommerceTrends,
  getWooCommercePerProductPaginated,
  getWooCommerceAgencyRollup,
  getWooCommerceSyncStatus,
  getWooCommerceAccountInfo,
  getWooCommerceProduct,
  getWooCommerceOrder,
  syncWooProducts,
  syncWooOrders,
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
import { format, subDays } from "date-fns";

// Common query options
const commonQueryOptions = {
  retry: 1,
  staleTime: 30 * 1000, // 30 seconds
};

// Helper – always return last 30 days as ISO date strings
const getLast30Days = () => ({
  startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
  endDate: format(new Date(), "yyyy-MM-dd"),
});

// ============================================================================
// CURRENT CLIENT-SPECIFIC HOOKS
// ============================================================================

// 1. Analytics/Summary Hook
export const useWooCommerceAnalytics = (clientId: number, accountId?: number | null, hasAssignment: boolean = true, startDate?: string, endDate?: string) => {
  const dates = getLast30Days();
  return useQuery<WooCommerceAnalyticsResponse>({
    queryKey: ["woocommerce-analytics", clientId, accountId, dates.startDate, dates.endDate],
    queryFn: () => getWooCommerceAnalytics(clientId, accountId, startDate ?? dates.startDate, endDate ?? dates.endDate),
    enabled: !!clientId && (hasAssignment || !!accountId),
    ...commonQueryOptions,
  });
};

// 2. Products Hook
export const useWooCommerceProducts = (clientId: number, accountId?: number | null, enabled: boolean = true) => {
  return useQuery<WooCommerceProductsResponse>({
    queryKey: ["woocommerce-products", clientId, accountId],
    queryFn: () => getWooCommerceProducts(clientId, accountId),
    enabled: !!clientId && (enabled || !!accountId),
    ...commonQueryOptions,
  });
};

// 3. Orders Hook
export const useWooCommerceOrders = (clientId: number, accountId?: number | null, enabled: boolean = true, startDate?: string, endDate?: string) => {
  const dates = getLast30Days();
  return useQuery<WooCommerceOrdersResponse>({
    queryKey: ["woocommerce-orders", clientId, accountId, dates.startDate, dates.endDate],
    queryFn: () => getWooCommerceOrders(clientId, accountId, startDate ?? dates.startDate, endDate ?? dates.endDate),
    enabled: !!clientId && (enabled || !!accountId),
    ...commonQueryOptions,
  });
};

// 4. Trends Hook
export const useWooCommerceTrends = (clientId: number, accountId?: number | null, enabled: boolean = true, startDate?: string, endDate?: string) => {
  const dates = getLast30Days();
  return useQuery<WooCommerceTrendsResponse>({
    queryKey: ["woocommerce-trends", clientId, accountId, dates.startDate, dates.endDate],
    queryFn: () => getWooCommerceTrends(clientId, accountId, startDate ?? dates.startDate, endDate ?? dates.endDate),
    enabled: !!clientId && (enabled || !!accountId),
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
// STUB HOOKS
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
      queryClient.invalidateQueries({ queryKey: ['woocommerce-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
};

// Per-product paginated analytics (used in WooCommerceDetailPage)
export const useWooCommercePerProductPaginated = (
  clientId: number,
  params: {
    accountId: number;
    page: number;
    limit: number;
    sort: string;
    direction: string;
    startDate?: string;
    endDate?: string;
  } | null
) => {
  return useQuery<WooCommercePerProductPaginatedResponse>({
    queryKey: ["woocommerce-per-product-paginated", clientId, params],
    queryFn: () => getWooCommercePerProductPaginated(clientId, params),
    enabled: !!clientId && !!params?.accountId,
  });
};

// Agency rollup (used in WooCommerceDetailPage)
export const useWooCommerceAgencyRollup = (clientId: number) => {
  return useQuery<WooCommerceAgencyRollupResponse>({
    queryKey: ["woocommerce-agency-rollup", clientId],
    queryFn: () => getWooCommerceAgencyRollup(clientId),
    enabled: !!clientId,
  });
};

// Sync status (used in WooCommerceDetailPage)
export const useWooCommerceSyncStatus = (clientId: number, accountId: number | null) => {
  return useQuery<WooCommerceSyncStatusResponse>({
    queryKey: ["woocommerce-sync-status", clientId, accountId],
    queryFn: () => getWooCommerceSyncStatus(clientId, accountId),
    enabled: !!clientId && !!accountId,
  });
};

// Account info (used in WooCommerceDetailPage)
export const useWooCommerceAccountInfo = (clientId: number, accountId: number | null) => {
  return useQuery<WooCommerceAccountInfoResponse>({
    queryKey: ["woocommerce-account-info", clientId, accountId],
    queryFn: () => getWooCommerceAccountInfo(clientId, accountId),
    enabled: !!clientId && !!accountId,
  });
};

// Single product detail (used in WooCommerceDetailPage)
export const useWooCommerceProduct = (clientId: number, productId: string, accountId: number) => {
  return useQuery<WooCommerceProductDetailResponse>({
    queryKey: ["woocommerce-product", clientId, productId, accountId],
    queryFn: () => getWooCommerceProduct(clientId, productId, accountId),
    enabled: !!clientId && !!productId && !!accountId,
  });
};

// Single order detail (used in WooCommerceDetailPage)
export const useWooCommerceOrder = (clientId: number, orderId: string | null, accountId: number | null) => {
  return useQuery<WooCommerceOrderDetailResponse>({
    queryKey: ["woocommerce-order", clientId, orderId, accountId],
    queryFn: () => getWooCommerceOrder(clientId, orderId, accountId),
    enabled: !!clientId && !!orderId && !!accountId,
  });
};

// Sync mutations (used in WooCommerceDetailPage)
export const useWooCommerceSyncProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ accountId }: { accountId: number }) => {
      return syncWooProducts(accountId);
    },
    onSuccess: () => {
      toast.success('Products sync started successfully');
      queryClient.invalidateQueries({ queryKey: ['woocommerce-sync-status'] });
      queryClient.invalidateQueries({ queryKey: ['woocommerce-products'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to sync products');
    }
  });
};

export const useWooCommerceSyncOrders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ accountId }: { accountId: number }) => {
      return syncWooOrders(accountId);
    },
    onSuccess: () => {
      toast.success('Orders sync started successfully');
      queryClient.invalidateQueries({ queryKey: ['woocommerce-sync-status'] });
      queryClient.invalidateQueries({ queryKey: ['woocommerce-orders'] });
      queryClient.invalidateQueries({ queryKey: ['woocommerce-analytics'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to sync orders');
    }
  });
};

export const useWooCommerceDisconnect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ accountId }: { accountId: number }) => {
      const response = await api.post('/woocommerce/disconnect', { accountId });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Disconnected successfully');
      queryClient.invalidateQueries({ queryKey: ['woocommerce-accounts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to disconnect');
    }
  });
};

export const useWooCommerceReconnect = () => {
  return useMutation({
    mutationFn: async ({ accountId }: { accountId: number }) => {
      const response = await api.post('/woocommerce/reconnect', { accountId });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Reconnected successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reconnect');
    }
  });
};
