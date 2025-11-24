import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type MetaConnectResponse = {
  success: boolean;
  url: string;
};

export type MetaCallbackResponse = {
  success: boolean;
  message?: string;
  metaAccount?: {
    id: number;
    userId: number;
    metaUserId: string;
    accessToken: string;
    expiresAt: string;
    createdAt: string;
  };
};

export type MetaCallbackParams = {
  code?: string;
  state?: string;
  status?: string;
  user?: string;
  metaUserId?: string;
};

export type ApiErrorResponse = {
  message?: string;
  error?: string;
};

// ==================== API FUNCTIONS ====================

/**
 * Initiate Meta OAuth connection
 * GET /meta/connect
 */
export const connectMeta = async (): Promise<MetaConnectResponse> => {
  try {
    const response = await api.get<MetaConnectResponse>("/meta/connect", {
      baseURL: import.meta.env.VITE_NGROK_URL,
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to initiate Meta connection"
    );
  }
};

/**
 * Handle Meta OAuth callback
 * GET /meta/callback?code=xxx&state=xxx OR /meta/callback?status=success&user=xxx&metaUserId=xxx
 */
export const handleMetaCallback = async (
  params: MetaCallbackParams
): Promise<MetaCallbackResponse> => {
  try {
    // Build params object, only including defined values
    const queryParams: Record<string, string> = {};
    
    if (params.code) queryParams.code = params.code;
    if (params.state) queryParams.state = params.state;
    if (params.status) queryParams.status = params.status;
    if (params.user) queryParams.user = params.user;
    if (params.metaUserId) queryParams.metaUserId = params.metaUserId;

    const response = await api.get<MetaCallbackResponse>("/meta/callback", {
      baseURL: import.meta.env.VITE_NGROK_URL,
      params: queryParams,
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to complete Meta connection"
    );
  }
};

