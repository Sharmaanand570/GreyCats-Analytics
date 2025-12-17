import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../apiConfig';
import type {
  Client,
  ClientsResponse,
  ClientDetailResponse,
  ClientWithIntegrations,
  ApiResponse,
  IntegrationType,
} from '../types/client.types';
import { useClientContext } from '../context/ClientContext';
import { toast } from 'sonner';

// Query Keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters?: any) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: number) => [...clientKeys.details(), id] as const,
};

// Fetch all clients
export const useClients = () => {
  const { setClients } = useClientContext();

  return useQuery({
    queryKey: clientKeys.lists(),
    queryFn: async (): Promise<Client[]> => {
      try {
        const response = await api.get<ClientsResponse>('/clients');
        const clients = response.data.clients || [];
        setClients(clients);
        return clients;
      } catch (error: any) {
        console.error('Error fetching clients:', error);
        
        // If backend is not available (development mode), return empty array
        // This prevents the error state from showing and allows the UI to render
        if (error.code === 'ERR_NETWORK' || error.response?.status === 404 || error.response?.status === 500) {
          console.warn('Backend not available - showing empty client list');
          toast.info('Backend API not connected. Start your backend server to manage clients.', {
            duration: 5000,
          });
          setClients([]);
          return []; // Return empty array instead of throwing
        }
        
        // For other errors, show error message but still return empty array
        toast.error(error.response?.data?.message || 'Failed to fetch clients');
        setClients([]);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on network errors
    refetchOnWindowFocus: false,
  });
};

// Helper to normalize client data
const normalizeClientData = (client: any): ClientWithIntegrations => {
  console.log('normalizeClientData - Raw client data:', client);
  console.log('Has metaInsights?', !!client.metaInsights, client.metaInsights);
  console.log('Has shopifyAccounts?', !!client.shopifyAccounts, client.shopifyAccounts);
  console.log('Has platformAccounts?', !!client.platformAccounts, client.platformAccounts);
  
  if (client.integrations && Array.isArray(client.integrations)) {
    return client;
  }

  const integrations: any[] = [];
  
  const mapAccount = (account: any, type: IntegrationType) => {
    let name = 'Unknown';
    let identifier = 'unknown';

    switch (type) {
      case 'meta-business':
        name = account.metaAccount?.pageName || account.pageName || name;
        identifier = account.metaAccount?.pageId || account.pageId || identifier;
        break;
      case 'youtube':
        name = account.youtubeAccount?.channelTitle || account.channelTitle || name;
        identifier = account.youtubeAccount?.channelId || account.channelId || identifier;
        break;
      case 'meta-ads':
        name = account.metaAdAccount?.name || account.name || name;
        identifier = account.metaAdAccount?.accountId || account.accountId || identifier;
        break;
      case 'meta-insights':
        name = account.platform || account.name || name;
        identifier = account.id || identifier;
        break;
      case 'shopify':
        name = account.shopifyAccount?.shopDomain || account.shopDomain || name;
        identifier = account.shopifyAccount?.shopDomain || account.shopDomain || identifier;
        break;
      case 'woocommerce':
        name = account.woocommerceAccount?.storeUrl || account.storeUrl || name;
        identifier = account.woocommerceAccount?.storeUrl || account.storeUrl || identifier;
        break;
      case 'google-search-console':
        name = account.searchConsoleAccount?.siteUrl || account.siteUrl || name;
        identifier = account.searchConsoleAccount?.siteUrl || account.siteUrl || identifier;
        break;
      case 'google-analytics':
        name = account.analyticsAccount?.platform || account.platform || account.propertyName || name;
        identifier = account.analyticsAccount?.id || account.id || account.propertyId || identifier;
        break;
    }

    return {
      integrationType: type,
      accountId: account.id, // Internal DB ID
      accountName: name,
      accountIdentifier: identifier,
      connectedAt: account.createdAt || new Date().toISOString(),
    };
  };

  // Map all legacy arrays
  if (client.metaBusinessAccounts) {
    client.metaBusinessAccounts.forEach((acc: any) => integrations.push(mapAccount(acc, 'meta-business')));
  }
  
  // Handle both metaAdsAccounts (legacy) and metaAdAccounts (API)
  const metaAds = client.metaAdsAccounts || client.metaAdAccounts;
  if (metaAds) {
    metaAds.forEach((acc: any) => integrations.push(mapAccount(acc, 'meta-ads')));
  }

  // Handle metaInsights
  if (client.metaInsights) {
    client.metaInsights.forEach((acc: any) => integrations.push(mapAccount(acc, 'meta-insights')));
  }

  if (client.youtubeAccounts) {
    client.youtubeAccounts.forEach((acc: any) => integrations.push(mapAccount(acc, 'youtube')));
  }
  if (client.shopifyAccounts) {
    client.shopifyAccounts.forEach((acc: any) => integrations.push(mapAccount(acc, 'shopify')));
  }
  if (client.woocommerceAccounts) {
    client.woocommerceAccounts.forEach((acc: any) => integrations.push(mapAccount(acc, 'woocommerce')));
  }

  // Handle both googleSearchConsoleAccounts (legacy) and googleSearchConsoleProperties (API)
  const searchConsole = client.googleSearchConsoleAccounts || client.googleSearchConsoleProperties;
  if (searchConsole) {
    searchConsole.forEach((acc: any) => integrations.push(mapAccount(acc, 'google-search-console')));
  }

  if (client.googleAnalyticsAccounts) {
    client.googleAnalyticsAccounts.forEach((acc: any) => integrations.push(mapAccount(acc, 'google-analytics')));
  }

  // Handle platformAccounts (contains Google Analytics)
  if (client.platformAccounts) {
    client.platformAccounts.forEach((platformAcc: any) => {
      if (platformAcc.account?.platform === 'GOOGLE') {
        // Map to google-analytics
        // IMPORTANT: Use platformAcc.id (the assignment ID) for deletion, not platformAcc.accountId
        const gaAccount = {
          id: platformAcc.id, // This is the platform account assignment ID used for deletion
          platform: platformAcc.account.platform,
          propertyName: platformAcc.account.propertyName,
          propertyId: platformAcc.account.propertyId,
          createdAt: platformAcc.createdAt,
        };
        integrations.push(mapAccount(gaAccount, 'google-analytics'));
      }
    });
  }

  return {
    ...client,
    integrations,
  };
};

// Fetch single client with integrations
export const useClient = (clientId: number | null) => {
  return useQuery({
    queryKey: clientKeys.detail(clientId!),
    queryFn: async (): Promise<ClientWithIntegrations> => {
      try {
        const response = await api.get<ClientDetailResponse>(`/clients/${clientId}`);
        return normalizeClientData(response.data.client);
      } catch (error: any) {
        console.error('Error fetching client:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch client details');
        throw error;
      }
    },
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// Create client
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { setCurrentClient } = useClientContext();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }): Promise<Client> => {
      try {
        const response = await api.post<any>('/clients', data);
        console.log('Create Client Response:', response.data);
        // Handle both nested data structure and flat structure
        const client = response.data?.data?.client || response.data?.client;
        if (!client) {
          throw new Error('Invalid response from server: missing client data');
        }
        return client;
      } catch (error: any) {
        console.error('Error creating client:', error);
        toast.error(error.response?.data?.message || 'Failed to create client');
        throw error;
      }
    },
    onSuccess: (newClient) => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      // Set as current client
      setCurrentClient(newClient);
      toast.success(`Client "${newClient.name}" created successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create client');
    },
  });
};

// Update client
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Client>;
    }): Promise<Client> => {
      try {
        const response = await api.put<ApiResponse<{ client: Client }>>(
          `/api/clients/${id}`,
          data
        );
        return response.data.data!.client;
      } catch (error: any) {
        console.error('Error updating client:', error);
        toast.error(error.response?.data?.message || 'Failed to update client');
        throw error;
      }
    },
    onSuccess: (updatedClient) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(updatedClient.id) });
      toast.success(`Client "${updatedClient.name}" updated successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update client');
    },
  });
};

// Delete client
export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  const { currentClient, setCurrentClient } = useClientContext();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      try {
        await api.delete(`/clients/${id}`);
      } catch (error: any) {
        console.error('Error deleting client:', error);
        toast.error(error.response?.data?.message || 'Failed to delete client');
        throw error;
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      // Clear current client if it was deleted
      if (currentClient?.id === deletedId) {
        setCurrentClient(null);
        localStorage.removeItem('lastClientId');
      }
      toast.success('Client deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete client');
    },
  });
};
