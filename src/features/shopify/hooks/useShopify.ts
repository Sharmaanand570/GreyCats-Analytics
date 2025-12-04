import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  connectShopify,
  deleteShopifyAccount,
  disconnectShopify,
  getShopifyOrder,
  getShopifyOrderAnalytics,
  getShopifyOrdersList,
  getShopifyProduct,
  getShopifyProductsList,
  getShopifyRevenueTrend,
  handleShopifyCallback,
  reconnectShopify,
  syncShopifyProducts,
  type ShopifyCallbackParams,
  type ShopifyCallbackResponse,
  type ShopifyConnectParams,
  type ShopifyConnectResponse,
  type ShopifyDeleteResponse,
  type ShopifyDisconnectResponse,
  type ShopifyOrderAnalyticsResponse,
  type ShopifyOrderListParams,
  type ShopifyOrderListResponse,
  type ShopifyReconnectResponse,
  type ShopifyRevenueTrendResponse,
  type ShopifySingleOrderResponse,
  type ShopifySingleProductResponse,
  type ShopifyProductListParams,
  type ShopifyProductListResponse,
  type ShopifySyncResponse,
} from "../API/shopifyApi";

const commonQueryOptions = {
  retry: 1,
  staleTime: 30 * 1000,
};

export const useShopifyConnect = () => {
  return useMutation<ShopifyConnectResponse, Error, ShopifyConnectParams>({
    mutationFn: (params) => connectShopify(params),
    onError: (error) => {
      toast.error(error.message || "Failed to initiate Shopify connection");
    },
  });
};

export const useShopifyCallback = () => {
  return useMutation<ShopifyCallbackResponse, Error, ShopifyCallbackParams>({
    mutationFn: (params) => handleShopifyCallback(params),
    onError: (error) => {
      toast.error(error.message || "Failed to complete Shopify connection");
    },
  });
};

export const useShopifySyncProducts = () => {
  const queryClient = useQueryClient();

  return useMutation<ShopifySyncResponse, Error, void>({
    mutationFn: () => syncShopifyProducts(),
    onSuccess: (data) => {
      toast.success(data.message || "Products synced successfully");
      queryClient.invalidateQueries({ queryKey: ["shopify", "products"] });
      queryClient.invalidateQueries({ queryKey: ["shopify", "analytics"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync Shopify products");
    },
  });
};

export const useShopifyProductsList = (params?: ShopifyProductListParams) => {
  return useQuery<ShopifyProductListResponse, Error>({
    queryKey: ["shopify", "products", params],
    queryFn: () => getShopifyProductsList(params),
    ...commonQueryOptions,
  });
};

export const useShopifyProduct = (productId?: string | null) => {
  return useQuery<ShopifySingleProductResponse, Error>({
    queryKey: ["shopify", "product", productId],
    queryFn: () => getShopifyProduct(productId as string),
    enabled: Boolean(productId),
    ...commonQueryOptions,
  });
};

export const useShopifyOrdersList = (params?: ShopifyOrderListParams) => {
  return useQuery<ShopifyOrderListResponse, Error>({
    queryKey: ["shopify", "orders", params],
    queryFn: () => getShopifyOrdersList(params),
    ...commonQueryOptions,
  });
};

export const useShopifyOrder = (orderId?: string | null) => {
  return useQuery<ShopifySingleOrderResponse, Error>({
    queryKey: ["shopify", "order", orderId],
    queryFn: () => getShopifyOrder(orderId as string),
    enabled: Boolean(orderId),
    ...commonQueryOptions,
  });
};

export const useShopifyOrderAnalytics = () => {
  return useQuery<ShopifyOrderAnalyticsResponse, Error>({
    queryKey: ["shopify", "analytics", "orders"],
    queryFn: () => getShopifyOrderAnalytics(),
    ...commonQueryOptions,
  });
};

export const useShopifyRevenueTrend = () => {
  return useQuery<ShopifyRevenueTrendResponse, Error>({
    queryKey: ["shopify", "analytics", "revenue"],
    queryFn: () => getShopifyRevenueTrend(),
    ...commonQueryOptions,
  });
};

export const useShopifyDisconnect = () => {
  const queryClient = useQueryClient();

  return useMutation<ShopifyDisconnectResponse, Error, void>({
    mutationFn: () => disconnectShopify(),
    onSuccess: (data) => {
      toast.success(data.message || "Shopify disconnected successfully");
      queryClient.invalidateQueries({ queryKey: ["shopify"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect Shopify");
    },
  });
};

export const useShopifyDelete = () => {
  const queryClient = useQueryClient();

  return useMutation<ShopifyDeleteResponse, Error, void>({
    mutationFn: () => deleteShopifyAccount(),
    onSuccess: (data) => {
      toast.success(data.message || "Shopify account deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["shopify"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete Shopify account");
    },
  });
};

export const useShopifyReconnect = () => {
  return useMutation<ShopifyReconnectResponse, Error, ShopifyConnectParams>({
    mutationFn: (params) => reconnectShopify(params),
    onSuccess: (data) => {
      toast.success("Shopify reconnect flow started");
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.message || "Failed to reconnect Shopify");
    },
  });
};

