import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type ConnectGoogleConsoleResponse = {
  success: boolean;
  url: string;
};

export type GoogleConsoleCallbackResponse = {
  success: boolean;
  message: string;
};

export type GoogleConsoleReconnectResponse = {
  success: boolean;
  url: string;
};

export type GoogleConsoleDisconnectResponse = {
  success: boolean;
  message: string;
};

export type GoogleConsoleProjectsResponse = {
  success: boolean;
  message: string;
  count: number;
  skipped: number;
};

export type GoogleConsoleBillingWindow = {
  start: string;
  end: string;
};

export type GoogleConsoleBillingResponse = {
  success: boolean;
  message: string;
  inserted: number;
  skipped: number;
  window: GoogleConsoleBillingWindow;
};

export type GoogleConsoleBillingAccount = {
  billingAccountId: string;
  name: string;
  open: boolean;
};

export type GoogleConsoleBillingAccountsResponse = {
  success: boolean;
  accounts: GoogleConsoleBillingAccount[];
};

export type GoogleConsoleApiErrorResponse = {
  message?: string;
  error?: string;
};

const handleGoogleConsoleApiError = (
  error: unknown,
  fallbackMessage: string
): never => {
  const axiosError = error as AxiosError<GoogleConsoleApiErrorResponse>;
  throw new Error(
    axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      fallbackMessage
  );
};

// ==================== API FUNCTIONS ====================

export const connectGoogleConsole = async (): Promise<ConnectGoogleConsoleResponse> => {
  try {
    const response = await api.get<ConnectGoogleConsoleResponse>(
      "/google-console/connect",
      {
        baseURL: import.meta.env.VITE_NGROK_URL,
        headers: { "ngrok-skip-browser-warning": "true" },
      }
    );
    return response.data;
  } catch (error) {
    return handleGoogleConsoleApiError(
      error,
      "Failed to initiate Google Console connection"
    );
  }
};

export const handleGoogleConsoleCallback = async (
  status: string,
  reason?: string
): Promise<GoogleConsoleCallbackResponse> => {
  if (status === "error") {
    throw new Error(reason || "Google Console connection failed");
  }

  return {
    success: true,
    message: "Successfully connected to Google Console!",
  };
};

export const reconnectGoogleConsole = async (): Promise<GoogleConsoleReconnectResponse> => {
  try {
    const response = await api.get<GoogleConsoleReconnectResponse>(
      "/google-console/reconnect"
    );
    return response.data;
  } catch (error) {
    return handleGoogleConsoleApiError(
      error,
      "Failed to generate Google Console reconnect URL"
    );
  }
};

export const disconnectGoogleConsole = async (): Promise<GoogleConsoleDisconnectResponse> => {
  try {
    const response = await api.post<GoogleConsoleDisconnectResponse>(
      "/google-console/disconnect"
    );
    return response.data;
  } catch (error) {
    return handleGoogleConsoleApiError(
      error,
      "Failed to disconnect Google Console"
    );
  }
};

export const getGoogleConsoleProjects = async (): Promise<GoogleConsoleProjectsResponse> => {
  try {
    const response = await api.get<GoogleConsoleProjectsResponse>(
      "/google-console/projects"
    );
    return response.data;
  } catch (error) {
    return handleGoogleConsoleApiError(
      error,
      "Failed to fetch Google Cloud projects"
    );
  }
};

export const getGoogleConsoleBilling = async (
  days: number
): Promise<GoogleConsoleBillingResponse> => {
  try {
    const response = await api.get<GoogleConsoleBillingResponse>(
      "/google-console/billing",
      { params: { days } }
    );
    return response.data;
  } catch (error) {
    return handleGoogleConsoleApiError(
      error,
      "Failed to fetch Google Cloud billing data"
    );
  }
};

export const getGoogleConsoleBillingAccounts = async (): Promise<GoogleConsoleBillingAccountsResponse> => {
  try {
    const response = await api.get<GoogleConsoleBillingAccountsResponse>(
      "/google-console/billing-accounts"
    );
    return response.data;
  } catch (error) {
    return handleGoogleConsoleApiError(
      error,
      "Failed to fetch billing accounts"
    );
  }
};

