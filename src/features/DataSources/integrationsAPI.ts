import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type Integration = {
  id: number;
  userId: number;
  platform: string;
  accountId: string;
  accountName: string;
  status: string;
  lastSyncedAt: string | null;
  connectedAt: string;
  extra: Record<string, unknown> | null;
};

export type IntegrationsResponse = {
  success: boolean;
  integrations: Integration[];
};

export type ApiErrorResponse = {
  message?: string;
  error?: string;
};

// ==================== API FUNCTIONS ====================

/**
 * Get all integrations
 * GET /integrations
 */
export const getIntegrations = async (): Promise<IntegrationsResponse> => {
  try {
    const response = await api.get<IntegrationsResponse>("/integrations");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to fetch integrations"
    );
  }
};

