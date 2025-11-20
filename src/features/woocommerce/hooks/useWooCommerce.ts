import { useMutation } from "@tanstack/react-query";
import {
  wooCommerceConnectionAPI,
  type wooCommerceConnectionAPIparams,
  type wooCommerceConnectionAPIResponse,
} from "../api/woocommerceApi";

export const useWooCommerceConnect = () => {
  return useMutation({
    mutationKey: ["woocommerce-connect"],
    mutationFn: (
      params: wooCommerceConnectionAPIparams
    ): Promise<wooCommerceConnectionAPIResponse> =>
      wooCommerceConnectionAPI(params),
  });
};
