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
    queryFn: async (): Promise<ClientWithIntegrations[]> => {
      try {
        const response = await api.get<ClientsResponse>('/clients');
        const rawClients = response.data.clients || [];

        // Fetch detailed data for each client to ensure all integrations (like GA) are counted correctly
        // The list endpoint misses some counts (e.g. googleAnalyticsProperties), so we need the detail view.
        const detailedClients = await Promise.all(
          rawClients.map(async (client) => {
            try {
              const detailResponse = await api.get<ClientDetailResponse>(`/clients/${client.id}`);
              return normalizeClientData(detailResponse.data.client);
            } catch (error) {
              console.warn(`Failed to fetch details for client ${client.id}, using list data`, error);
              return normalizeClientData(client);
            }
          })
        );

        setClients(detailedClients);
        return detailedClients;
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
  // If the backend already provides a normalized integrations array, process that first
  const integrations: any[] = [];
  const processedIds = new Set<string>();

  // Helper to map accounts to standardized integration format
  const mapAccount = (account: any, type: IntegrationType) => {
    let name = 'Unknown';
    let identifier = 'unknown';

    // IMPORTANT: Check for duplicate processing to prevent double-entries
    // Construct a unique key for this integration instance
    const uniqueKey = `${type}-${account.id}`;
    if (processedIds.has(uniqueKey)) {
      return null;
    }

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
        // Try to get propertyId as identifier first, as that's what metrics use
        identifier = account.analyticsAccount?.propertyId || account.propertyId || account.analyticsAccount?.id || account.id || identifier;
        name = account.analyticsAccount?.propertyName || account.propertyName || account.platform || name;
        break;
    }

    processedIds.add(uniqueKey);
    return {
      integrationType: type,
      accountId: account.id, // Internal DB ID
      accountName: name,
      accountIdentifier: identifier,
      connectedAt: account.createdAt || new Date().toISOString(),
    };
  };

  // 1. Backend-provided integrations array (Preferred Source)
  if (client.integrations && Array.isArray(client.integrations)) {
    client.integrations.forEach((integration: any) => {
      // If it's the pre-calculated format { type, id, name, assignmentId }
      if (integration.type && integration.assignmentId) {
        const uniqueKey = `${integration.type}-${integration.assignmentId}`;

        if (!processedIds.has(uniqueKey)) {
          // Additional check: prevent duplicates if identifier matches (e.g. for GA properties)
          const identifierKey = `${integration.type}-identifier-${integration.identifier || integration.name}`;
          if (integration.identifier && processedIds.has(identifierKey)) return;

          integrations.push({
            integrationType: integration.type,
            accountId: integration.assignmentId,
            accountName: integration.name,
            accountIdentifier: integration.identifier || 'unknown',
            connectedAt: integration.connectedAt || new Date().toISOString(),
          });
          processedIds.add(uniqueKey);
          if (integration.identifier) processedIds.add(identifierKey);
          processedIds.add(`${integration.type}-name-${integration.name}`);
        }
      }
      // If it's already in the normalized structure { integrationType, accountId... }
      else if (integration.integrationType && integration.accountId) {
        const uniqueKey = `${integration.integrationType}-${integration.accountId}`;
        if (!processedIds.has(uniqueKey)) {
          // Also check identifier/name to prevent duplicates from legacy arrays
          const nameKey = `${integration.integrationType}-name-${integration.accountName}`;
          const identifierKey = `${integration.integrationType}-identifier-${integration.accountIdentifier}`;

          if (processedIds.has(nameKey) || (integration.accountIdentifier !== 'unknown' && processedIds.has(identifierKey))) {
            return;
          }

          integrations.push(integration);
          processedIds.add(uniqueKey);
          processedIds.add(nameKey);
          if (integration.accountIdentifier !== 'unknown') processedIds.add(identifierKey);
        }
      }
    });
  }

  // 2. Fallback / supplementary checks for specific arrays (Legacy support)
  // Only process if not already found in the main integrations array

  if (client.metaBusinessAccounts) {
    client.metaBusinessAccounts.forEach((acc: any) => {
      const result = mapAccount(acc, 'meta-business');
      if (result) integrations.push(result);
    });
  }

  const metaAds = client.metaAdsAccounts || client.metaAdAccounts;
  if (metaAds) {
    metaAds.forEach((acc: any) => {
      const result = mapAccount(acc, 'meta-ads');
      if (result) integrations.push(result);
    });
  }

  if (client.metaInsights) {
    client.metaInsights.forEach((acc: any) => {
      const result = mapAccount(acc, 'meta-insights');
      if (result) integrations.push(result);
    });
  }

  if (client.youtubeAccounts) {
    client.youtubeAccounts.forEach((acc: any) => {
      const result = mapAccount(acc, 'youtube');
      if (result) integrations.push(result);
    });
  }

  if (client.shopifyAccounts) {
    client.shopifyAccounts.forEach((acc: any) => {
      const result = mapAccount(acc, 'shopify');
      if (result) integrations.push(result);
    });
  }

  if (client.woocommerceAccounts) {
    client.woocommerceAccounts.forEach((acc: any) => {
      const result = mapAccount(acc, 'woocommerce');
      if (result) integrations.push(result);
    });
  }

  const searchConsole = client.googleSearchConsoleAccounts || client.googleSearchConsoleProperties;
  if (searchConsole) {
    searchConsole.forEach((acc: any) => {
      const result = mapAccount(acc, 'google-search-console');
      if (result) integrations.push(result);
    });
  }

  if (client.googleAnalyticsAccounts) {
    client.googleAnalyticsAccounts.forEach((acc: any) => {
      const result = mapAccount(acc, 'google-analytics');
      if (result) integrations.push(result);
    });
  }

  if (client.googleAnalyticsProperties) {
    client.googleAnalyticsProperties.forEach((acc: any) => {
      const flatAcc = {
        id: acc.id,
        propertyName: acc.propertyName || acc.platformAccount?.propertyName,
        propertyId: acc.propertyId || acc.platformAccount?.propertyId,
        platform: 'Google Analytics'
      };

      const uniqueKey = `google-analytics-${acc.id}`;
      const propertyNameKey = `google-analytics-name-${flatAcc.propertyName}`;
      const propertyIdKey = `google-analytics-identifier-${flatAcc.propertyId}`;

      // Check if this integration was already added (e.g. from client.integrations) but is missing the identifier
      const existingIndex = integrations.findIndex(i =>
        i.integrationType === 'google-analytics' &&
        i.accountId === acc.id &&
        i.accountIdentifier === 'unknown'
      );

      if (existingIndex !== -1 && flatAcc.propertyId) {
        // Enriched the existing entry with the found propertyId
        integrations[existingIndex].accountIdentifier = flatAcc.propertyId;
        // Also add the identifier to processedIds to prevent future duplicates if any
        processedIds.add(propertyIdKey);
        return;
      }

      // Check ALL possible existing keys to avoid duplication
      if (!processedIds.has(uniqueKey) &&
        (!flatAcc.propertyName || !processedIds.has(propertyNameKey)) &&
        (!flatAcc.propertyId || !processedIds.has(propertyIdKey))) {

        integrations.push({
          integrationType: 'google-analytics',
          accountId: acc.id,
          accountName: flatAcc.propertyName || 'Google Analytics',
          accountIdentifier: flatAcc.propertyId || 'unknown',
          connectedAt: acc.createdAt || new Date().toISOString()
        });
        processedIds.add(uniqueKey);
        if (flatAcc.propertyName) processedIds.add(propertyNameKey);
        if (flatAcc.propertyId) processedIds.add(propertyIdKey);
      }
    });
  }

  if (client.platformAccounts) {
    client.platformAccounts.forEach((platformAcc: any) => {
      if (platformAcc.account?.platform === 'GOOGLE' || platformAcc.account?.platform === 'google-analytics') {
        const uniqueKey = `google-analytics-${platformAcc.id}`;
        const propertyNameKey = `google-analytics-name-${platformAcc.account.propertyName}`;
        const propertyIdKey = `google-analytics-identifier-${platformAcc.account.propertyId}`;

        if (!processedIds.has(uniqueKey) && !processedIds.has(propertyNameKey) && !processedIds.has(propertyIdKey)) {
          integrations.push({
            integrationType: 'google-analytics',
            accountId: platformAcc.id,
            accountName: platformAcc.account.propertyName,
            accountIdentifier: platformAcc.account.propertyId,
            connectedAt: platformAcc.createdAt
          });
          processedIds.add(uniqueKey);
          processedIds.add(propertyNameKey);
          processedIds.add(propertyIdKey);
        }
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
        console.log('Fetching client:', clientId);
        const response = await api.get<ClientDetailResponse>(`/clients/${clientId}`);
        console.log('Client Data:', response.data)
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
