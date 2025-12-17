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

  return useMutation<ShopifySyncResponse, Error, number>({
    mutationFn: (clientId) => syncShopifyProducts(clientId),
    onSuccess: (data, clientId) => {
      toast.success(data.message || "Products synced successfully");
      queryClient.invalidateQueries({ queryKey: ["shopify", "products", clientId] });
      queryClient.invalidateQueries({ queryKey: ["shopify", "analytics", clientId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync Shopify products");
    },
  });
};

export const useShopifyProductsList = (clientId: number, params?: ShopifyProductListParams) => {
  return useQuery<ShopifyProductListResponse, Error>({
    queryKey: ["shopify", "products", clientId, params],
    queryFn: () => getShopifyProductsList(clientId, params),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useShopifyProduct = (clientId: number, productId?: string | null) => {
  return useQuery<ShopifySingleProductResponse, Error>({
    queryKey: ["shopify", "product", clientId, productId],
    queryFn: () => getShopifyProduct(clientId, productId as string),
    enabled: !!clientId && Boolean(productId),
    ...commonQueryOptions,
  });
};

export const useShopifyOrdersList = (clientId: number, params?: ShopifyOrderListParams) => {
  return useQuery<ShopifyOrderListResponse, Error>({
    queryKey: ["shopify", "orders", clientId, params],
    queryFn: () => getShopifyOrdersList(clientId, params),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useShopifyOrder = (clientId: number, orderId?: string | null) => {
  return useQuery<ShopifySingleOrderResponse, Error>({
    queryKey: ["shopify", "order", clientId, orderId],
    queryFn: () => getShopifyOrder(clientId, orderId as string),
    enabled: !!clientId && Boolean(orderId),
    ...commonQueryOptions,
  });
};

export const useShopifyOrderAnalytics = (clientId: number) => {
  return useQuery<ShopifyOrderAnalyticsResponse, Error>({
    queryKey: ["shopify", "analytics", "orders", clientId],
    queryFn: () => getShopifyOrderAnalytics(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useShopifyRevenueTrend = (clientId: number) => {
  return useQuery<ShopifyRevenueTrendResponse, Error>({
    queryKey: ["shopify", "analytics", "revenue", clientId],
    queryFn: () => getShopifyRevenueTrend(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useShopifyDisconnect = () => {
  const queryClient = useQueryClient();

  return useMutation<ShopifyDisconnectResponse, Error, number>({
    mutationFn: (clientId) => disconnectShopify(clientId),
    onSuccess: (data, clientId) => {
      toast.success(data.message || "Shopify disconnected successfully");
      queryClient.invalidateQueries({ queryKey: ["shopify", clientId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect Shopify");
    },
  });
};

export const useShopifyDelete = () => {
  const queryClient = useQueryClient();

  return useMutation<ShopifyDeleteResponse, Error, number>({
    mutationFn: (clientId) => deleteShopifyAccount(clientId),
    onSuccess: (data, clientId) => {
      toast.success(data.message || "Shopify account deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["shopify", clientId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete Shopify account");
    },
  });
};

export const useShopifyReconnect = () => {
  return useMutation<ShopifyReconnectResponse, Error, { clientId: number; params: ShopifyConnectParams }>({
    mutationFn: ({ clientId, params }) => reconnectShopify(clientId, params),
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

