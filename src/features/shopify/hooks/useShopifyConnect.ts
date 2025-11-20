import { useMutation } from "@tanstack/react-query";
import {
  connectShopify,
  handleShopifyCallback,
  type ShopifyConnectResponse,
  type ShopifyConnectParams,
  type ShopifyCallbackParams,
  type ShopifyCallbackResponse,
} from "../API/shopifyApi";

export const useShopifyConnect = () => {
  return useMutation<ShopifyConnectResponse, Error, ShopifyConnectParams>({
    mutationFn: (params) => connectShopify(params),
  });
};

export const useShopifyCallback = () => {
  return useMutation<ShopifyCallbackResponse, Error, ShopifyCallbackParams>({
    mutationFn: (params) => handleShopifyCallback(params),
  });
};

