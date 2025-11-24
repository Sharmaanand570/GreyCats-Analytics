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
    mutationFn: (
      params: wooCommerceConnectionAPIparams
    ): Promise<wooCommerceConnectionAPIResponse> =>
      wooCommerceConnectionAPI(params),
  });
};

export const useWooCommerceSyncProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["woocommerce-sync-products"],
    mutationFn: (params: WooCommerceSyncParams) => syncWooCommerceProducts(params),
    onSuccess: (data) => {
      toast.success(`Synced ${data.count} products successfully`);
      queryClient.invalidateQueries({ queryKey: ["woocommerce-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-per-product"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-products"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-account"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-sync-status"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to sync products");
    },
  });
};

export const useWooCommerceSyncOrders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["woocommerce-sync-orders"],
    mutationFn: (params: WooCommerceSyncParams) => syncWooCommerceOrders(params),
    onSuccess: (data) => {
      toast.success(`Synced ${data.count} orders successfully`);
      queryClient.invalidateQueries({ queryKey: ["woocommerce-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-per-product"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-orders"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-account"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-sync-status"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to sync orders");
    },
  });
};

export const useWooCommerceAnalytics = (accountId: number | null) => {
  return useQuery({
    queryKey: ["woocommerce-analytics", accountId],
    queryFn: () => getWooCommerceAnalytics(accountId!),
    enabled: accountId !== null,
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useWooCommercePerProduct = (accountId: number | null) => {
  return useQuery({
    queryKey: ["woocommerce-per-product", accountId],
    queryFn: () => getWooCommercePerProductAnalyticsLegacy(accountId!),
    enabled: accountId !== null,
    ...commonQueryOptions,
  });
};

export const useWooCommercePerProductPaginated = (
  params: WooCommercePerProductAnalyticsParams | null
) => {
  return useQuery({
    queryKey: ["woocommerce-per-product-paginated", params],
    queryFn: () => getWooCommercePerProductAnalytics(params!),
    enabled: params !== null && params.accountId !== null,
    ...commonQueryOptions,
  });
};

export const useWooCommerceAgencyRollup = (
  params?: WooCommerceAgencyRollupParams
) => {
  return useQuery({
    queryKey: ["woocommerce-agency-rollup", params],
    queryFn: () => getWooCommerceAgencyRollup(params),
    ...commonQueryOptions,
  });
};

// Disconnect/Reconnect Hooks
export const useWooCommerceDisconnect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["woocommerce-disconnect"],
    mutationFn: (params: WooCommerceDisconnectParams) =>
      disconnectWooCommerce(params),
    onSuccess: (data) => {
      toast.success(data.message || "Disconnected successfully");
      queryClient.invalidateQueries({ queryKey: ["woocommerce-account"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-sync-status"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-accounts"] });
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
    mutationFn: (params: WooCommerceDisconnectParams) =>
      reconnectWooCommerce(params),
    onSuccess: (data) => {
      toast.success(data.message || "Reconnected successfully");
      // Invalidate all WooCommerce queries to refetch all overview data
      queryClient.invalidateQueries({ queryKey: ["woocommerce-account"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-sync-status"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-per-product"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-per-product-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-products"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-orders"] });
      queryClient.invalidateQueries({ queryKey: ["woocommerce-agency-rollup"] });
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
  params: WooCommerceProductsParams | null
) => {
  return useQuery({
    queryKey: ["woocommerce-products", params],
    queryFn: () => getWooCommerceProducts(params!),
    enabled: params !== null && params.accountId !== null,
    ...commonQueryOptions,
  });
};

export const useWooCommerceProduct = (
  productId: string | null,
  accountId: number | null
) => {
  return useQuery({
    queryKey: ["woocommerce-product", productId, accountId],
    queryFn: () => getWooCommerceProduct(productId!, accountId!),
    enabled: productId !== null && accountId !== null,
    ...commonQueryOptions,
  });
};

// Orders Hooks
export const useWooCommerceOrders = (
  params: WooCommerceOrdersParams | null
) => {
  return useQuery({
    queryKey: ["woocommerce-orders", params],
    queryFn: () => getWooCommerceOrders(params!),
    enabled: params !== null && params.accountId !== null,
    ...commonQueryOptions,
  });
};

export const useWooCommerceOrder = (
  orderId: string | null,
  accountId: number | null
) => {
  return useQuery({
    queryKey: ["woocommerce-order", orderId, accountId],
    queryFn: () => getWooCommerceOrder(orderId!, accountId!),
    enabled: orderId !== null && accountId !== null,
    ...commonQueryOptions,
  });
};

// Account Info Hooks
export const useWooCommerceAccountInfo = (accountId: number | null) => {
  return useQuery({
    queryKey: ["woocommerce-account", accountId],
    queryFn: () => getWooCommerceAccountInfo(accountId!),
    enabled: accountId !== null,
    ...commonQueryOptions,
  });
};

export const useWooCommerceSyncStatus = (accountId: number | null) => {
  return useQuery({
    queryKey: ["woocommerce-sync-status", accountId],
    queryFn: () => getWooCommerceSyncStatus(accountId!),
    enabled: accountId !== null,
    ...commonQueryOptions,
  });
};

// Report Draft Hooks
export const useWooCommerceSaveDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["woocommerce-save-draft"],
    mutationFn: (params: WooCommerceReportDraftParams) =>
      saveWooCommerceReportDraft(params),
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
    mutationFn: (params: WooCommerceSyncParams) =>
      publishWooCommerceSnapshot(params),
    onSuccess: (data) => {
      toast.success("Snapshot published successfully");
      queryClient.invalidateQueries({
        queryKey: ["woocommerce-snapshots", data.snapshot.accountId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to publish snapshot"
      );
    },
  });
};

export const useWooCommerceSnapshots = (accountId: number | null) => {
  return useQuery({
    queryKey: ["woocommerce-snapshots", accountId],
    queryFn: () => getWooCommerceSnapshots(accountId!),
    enabled: accountId !== null,
    ...commonQueryOptions,
  });
};

// Accounts List Hook
export const useWooCommerceAccounts = () => {
  return useQuery({
    queryKey: ["woocommerce-accounts"],
    queryFn: () => getWooCommerceAccounts(),
    ...commonQueryOptions,
  });
};
