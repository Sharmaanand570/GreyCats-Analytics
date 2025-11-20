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

export const wooCommerceConnectionAPI = async (
  params: wooCommerceConnectionAPIparams
): Promise<wooCommerceConnectionAPIResponse> => {
  const response = await api.post<wooCommerceConnectionAPIResponse>(
    "/woocommerce/connect",
    params
  );

  return response.data;
};
