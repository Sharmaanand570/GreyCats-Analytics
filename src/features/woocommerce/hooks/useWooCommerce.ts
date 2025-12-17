import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  wooCommerceConnectionAPI,
  type wooCommerceConnectionAPIparams,
  type wooCommerceConnectionAPIResponse,
  syncWooCommerceProducts,
  syncWooCommerceOrders,
  getWooCommerceAnalytics,
  getWooCommercePerProductAnalyticsLegacy,
  getWooCommercePerProductAnalytics,
  getWooCommerceAgencyRollup,
  disconnectWooCommerce,
  reconnectWooCommerce,
  getWooCommerceProducts,
  getWooCommerceProduct,
  getWooCommerceOrders,
  getWooCommerceOrder,
  getWooCommerceAccountInfo,
  getWooCommerceSyncStatus,
  saveWooCommerceReportDraft,
  publishWooCommerceSnapshot,
  getWooCommerceSnapshots,
  getWooCommerceAccounts,
  type WooCommerceSyncParams,
  type WooCommerceDisconnectParams,
  type WooCommerceProductsParams,
  type WooCommerceOrdersParams,
  type WooCommercePerProductAnalyticsParams,
  type WooCommerceReportDraftParams,
  type WooCommerceAgencyRollupParams,
} from "../api/woocommerceApi";

// Common query options
const commonQueryOptions = {
  retry: 1,
  staleTime: 30 * 1000, // 30 seconds
};

export const useWooCommerceConnect = () => {
  return useMutation({
    mutationKey: ["woocommerce-connect"],
    mutationFn: ({
      params,
    }: {
      params: wooCommerceConnectionAPIparams;
    }): Promise<wooCommerceConnectionAPIResponse> =>
      wooCommerceConnectionAPI(params),
  });
};

export const useWooCommerceSyncProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["woocommerce-sync-products"],
    mutationFn: ({
      clientId,
      params,
    }: {
      clientId: number;
      params: WooCommerceSyncParams;
    }) => syncWooCommerceProducts(clientId, params),
    onSuccess: (data, { clientId }) => {
      toast.success(`Synced ${data.count} products successfully`);
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-analytics", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-per-product", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-products", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-account", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-sync-status", clientId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to sync products"
      );
    },
  });
};

export const useWooCommerceSyncOrders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["woocommerce-sync-orders"],
    mutationFn: ({
      clientId,
      params,
    }: {
      clientId: number;
      params: WooCommerceSyncParams;
    }) => syncWooCommerceOrders(clientId, params),
    onSuccess: (data, { clientId }) => {
      toast.success(`Synced ${data.count} orders successfully`);
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-analytics", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-per-product", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-orders", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-account", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-sync-status", clientId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to sync orders"
      );
    },
  });
};

export const useWooCommerceAnalytics = (
  clientId: number,
  accountId: number | null
) => {
  return useQuery({
    queryKey: ["woocommerce-analytics", clientId, accountId],
    queryFn: () => getWooCommerceAnalytics(clientId, accountId!),
    enabled: !!clientId && accountId !== null,
    retry: 1,
    staleTime: 30 * 1000,
  });
};

export const useWooCommercePerProduct = (
  clientId: number,
  accountId: number | null
) => {
  return useQuery({
    queryKey: ["woocommerce-per-product", clientId, accountId],
    queryFn: () => getWooCommercePerProductAnalyticsLegacy(clientId, accountId!),
    enabled: !!clientId && accountId !== null,
    ...commonQueryOptions,
  });
};

export const useWooCommercePerProductPaginated = (
  clientId: number,
  params: WooCommercePerProductAnalyticsParams | null
) => {
  return useQuery({
    queryKey: ["woocommerce-per-product-paginated", clientId, params],
    queryFn: () => getWooCommercePerProductAnalytics(clientId, params!),
    enabled: !!clientId && params !== null && params.accountId !== null,
    ...commonQueryOptions,
  });
};

export const useWooCommerceAgencyRollup = (
  clientId: number,
  params?: WooCommerceAgencyRollupParams
) => {
  return useQuery({
    queryKey: ["woocommerce-agency-rollup", clientId, params],
    queryFn: () => getWooCommerceAgencyRollup(clientId, params),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

// Disconnect/Reconnect Hooks
export const useWooCommerceDisconnect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["woocommerce-disconnect"],
    mutationFn: ({
      clientId,
      params,
    }: {
      clientId: number;
      params: WooCommerceDisconnectParams;
    }) => disconnectWooCommerce(clientId, params),
    onSuccess: (data, { clientId }) => {
      toast.success(data.message || "Disconnected successfully");
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-account", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-sync-status", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-accounts", clientId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to disconnect"
      );
    },
  });
};

export const useWooCommerceReconnect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["woocommerce-reconnect"],
    mutationFn: ({
      clientId,
      params,
    }: {
      clientId: number;
      params: WooCommerceDisconnectParams;
    }) => reconnectWooCommerce(clientId, params),
    onSuccess: (data, { clientId }) => {
      toast.success(data.message || "Reconnected successfully");
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-account", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-sync-status", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-accounts", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-analytics", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-per-product", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-per-product-paginated", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-products", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-orders", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-agency-rollup", clientId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to reconnect"
      );
    },
  });
};

// Products Hooks
export const useWooCommerceProducts = (
  clientId: number,
  params: WooCommerceProductsParams | null
) => {
  return useQuery({
    queryKey: ["woocommerce-products", clientId, params],
    queryFn: () => getWooCommerceProducts(clientId, params!),
    enabled: !!clientId && params !== null && params.accountId !== null,
    ...commonQueryOptions,
  });
};

export const useWooCommerceProduct = (
  clientId: number,
  productId: string | null,
  accountId: number | null
) => {
  return useQuery({
    queryKey: ["woocommerce-product", clientId, productId, accountId],
    queryFn: () =>
      getWooCommerceProduct(clientId, productId!, accountId!),
    enabled: !!clientId && productId !== null && accountId !== null,
    ...commonQueryOptions,
  });
};

// Orders Hooks
export const useWooCommerceOrders = (
  clientId: number,
  params: WooCommerceOrdersParams | null
) => {
  return useQuery({
    queryKey: ["woocommerce-orders", clientId, params],
    queryFn: () => getWooCommerceOrders(clientId, params!),
    enabled: !!clientId && params !== null && params.accountId !== null,
    ...commonQueryOptions,
  });
};

export const useWooCommerceOrder = (
  clientId: number,
  orderId: string | null,
  accountId: number | null
) => {
  return useQuery({
    queryKey: ["woocommerce-order", clientId, orderId, accountId],
    queryFn: () =>
      getWooCommerceOrder(clientId, orderId!, accountId!),
    enabled: !!clientId && orderId !== null && accountId !== null,
    ...commonQueryOptions,
  });
};

// Account Info Hooks
export const useWooCommerceAccountInfo = (
  clientId: number,
  accountId: number | null
) => {
  return useQuery({
    queryKey: ["woocommerce-account", clientId, accountId],
    queryFn: () => getWooCommerceAccountInfo(clientId, accountId!),
    enabled: !!clientId && accountId !== null,
    ...commonQueryOptions,
  });
};

export const useWooCommerceSyncStatus = (
  clientId: number,
  accountId: number | null
) => {
  return useQuery({
    queryKey: ["woocommerce-sync-status", clientId, accountId],
    queryFn: () => getWooCommerceSyncStatus(clientId, accountId!),
    enabled: !!clientId && accountId !== null,
    ...commonQueryOptions,
  });
};

// Report Draft Hooks
export const useWooCommerceSaveDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["woocommerce-save-draft"],
    mutationFn: ({
      clientId,
      params,
    }: {
      clientId: number;
      params: WooCommerceReportDraftParams;
    }) => saveWooCommerceReportDraft(clientId, params),
    onSuccess: (data) => {
      toast.success("Report draft saved successfully");
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-draft", data.draft.accountId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to save draft"
      );
    },
  });
};

export const useWooCommercePublishSnapshot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["woocommerce-publish-snapshot"],
    mutationFn: ({
      clientId,
      params,
    }: {
      clientId: number;
      params: WooCommerceSyncParams;
    }) => publishWooCommerceSnapshot(clientId, params),
    onSuccess: (data, { clientId }) => {
      toast.success("Snapshot published successfully");
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-snapshots", clientId, data.snapshot.accountId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to publish snapshot"
      );
    },
  });
};

export const useWooCommerceSnapshots = (
  clientId: number,
  accountId: number | null
) => {
  return useQuery({
    queryKey: ["woocommerce-snapshots", clientId, accountId],
    queryFn: () => getWooCommerceSnapshots(clientId, accountId!),
    enabled: !!clientId && accountId !== null,
    ...commonQueryOptions,
  });
};

// Accounts List Hook
export const useWooCommerceAccounts = (clientId: number) => {
  return useQuery({
    queryKey: ["woocommerce-accounts", clientId],
    queryFn: () => getWooCommerceAccounts(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};
