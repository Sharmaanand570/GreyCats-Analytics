import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../apiConfig';
import type {
  IntegrationType,
  AvailableAccount,
  AvailableAccountsResponse,
  AssignAccountRequest,
  AssignAccountResponse,
} from '../types/client.types';
import { toast } from 'sonner';
import { clientKeys } from './useClients';
import { removeAccountFromClient } from '../api/integrationApi';

// Query Keys
export const integrationKeys = {
  all: ['integrations'] as const,
  available: (type: IntegrationType) => [...integrationKeys.all, 'available', type] as const,
};

// Fetch available accounts for an integration
export const useAvailableAccounts = (integrationType: IntegrationType | null) => {
  return useQuery({
    queryKey: integrationKeys.available(integrationType!),
    queryFn: async (): Promise<AvailableAccount[]> => {
      try {
        const response = await api.get<AvailableAccountsResponse>(
          `/integrations/${integrationType}/available-accounts`
        );
        return response.data.accounts || [];
      } catch (error: any) {
        console.error('Error fetching available accounts:', error);
        toast.error(
          error.response?.data?.message || 'Failed to fetch available accounts'
        );
        throw error;
      }
    },
    enabled: !!integrationType,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
};

// Assign account to client
export const useAssignAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      data,
    }: {
      clientId: number;
      data: AssignAccountRequest;
    }): Promise<AssignAccountResponse> => {
      try {
        const response = await api.post<AssignAccountResponse>(
          `/clients/${clientId}/accounts`,
          data
        );
        return response.data;
      } catch (error: any) {
        console.error('Error assigning account:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to assign account';
        toast.error(errorMessage);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate client details to refresh integrations
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.clientId) });
      // Invalidate available accounts to update assignment status
      queryClient.invalidateQueries({
        queryKey: integrationKeys.available(variables.data.integrationType),
      });
      toast.success('Account connected successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to assign account';
      toast.error(errorMessage);
    },
  });
};

// Remove account from client
export const useRemoveAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      integrationType,
      accountId,
    }: {
      clientId: number;
      integrationType: IntegrationType;
      accountId: number | string;
    }): Promise<void> => {
      try {
        await removeAccountFromClient(clientId, integrationType as any, accountId);
      } catch (error: any) {
        console.error('Error removing account:', {
          url: error?.config?.url,
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
        });
        const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to remove account';
        toast.error(msg);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate client details
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.clientId) });
      // Invalidate client lists to ensure UI updates across the app
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      // Invalidate available accounts
      queryClient.invalidateQueries({
        queryKey: integrationKeys.available(variables.integrationType),
      });
      // Invalidate connected integrations to update platform counts
      queryClient.invalidateQueries({
        queryKey: [...integrationKeys.all, 'connected'] as const,
      });
      // Invalidate sync status
      queryClient.invalidateQueries({
        queryKey: ["sync-status", variables.clientId],
      });
      toast.success('Account disconnected successfully');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to remove account';
      toast.error(msg);
    },
  });
};

// Fetch connected integrations
export const useConnectedIntegrations = () => {
  return useQuery({
    queryKey: [...integrationKeys.all, 'connected'] as const,
    queryFn: async () => {
      try {
        const response = await api.get<import('../types/integration.types').ConnectedIntegrationsResponse>('/integrations/connected');
        return response.data;
      } catch (error: any) {
        console.error('Error fetching connected integrations:', error);
        toast.error(
          error.response?.data?.message || 'Failed to fetch connected integrations'
        );
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// Fetch sync progress
export const useSyncProgress = (clientId: number | null, integrationType: IntegrationType | null, enabled: boolean) => {
  return useQuery({
    queryKey: [...integrationKeys.all, 'sync-progress', clientId, integrationType] as const,
    queryFn: async () => {
      if (!clientId || !integrationType) throw new Error("Client ID and Integration Type required");
      try {
        const { getSyncProgress } = await import('../api/integrationApi');
        const response = await getSyncProgress(clientId, integrationType);
        return response;
      } catch (error: any) {
        console.error(`Error fetching sync progress for ${integrationType}:`, error);
        throw error;
      }
    },
    enabled: !!clientId && !!integrationType && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === 'completed' || data.status === 'failed')) {
        return false; // Stop polling
      }
      return 2500; // Poll every 2.5 seconds
    },
    retry: (failureCount, error: any) => {
      // Create a type guard or check for status code property
      const statusCode = error?.response?.status;
      // Don't retry on 4xx errors
      if (statusCode && statusCode >= 400 && statusCode < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
