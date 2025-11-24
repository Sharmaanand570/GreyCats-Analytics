import api from "@/apiConfig";

type AccountIdParams = {
  success: boolean;
  integration: {
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
};

export const getIntegrationAccountIdAPI = async (
  platform: string
): Promise<AccountIdParams> => {
  const response = await api.get(`/integrations/${platform}`);
  return response.data;
};




