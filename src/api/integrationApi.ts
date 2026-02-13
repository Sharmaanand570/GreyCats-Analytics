import { api } from '../apiConfig';
import type {
  AvailableAccount,
  IntegrationType,
  AccountAssignmentRequest,
  AccountAssignmentResponse,
} from '../types/integration.types';

// Helper to normalize account data based on integration type
const normalizeAccount = (account: any, type: IntegrationType): AvailableAccount => {
  let name = '';
  let identifier = '';


  switch (type) {
    case 'meta-business':
      name = account.pageName;
      identifier = account.pageId;
      break;
    case 'youtube':
      name = account.channelTitle;
      identifier = account.channelId;

      break;
    case 'shopify':
      name = account.shopDomain;
      identifier = account.shopDomain;
      break;
    case 'woocommerce':
      name = account.storeUrl;
      identifier = account.storeUrl;
      break;
    case 'google-search-console':
      name = account.siteUrl;
      identifier = account.siteUrl;
      break;
    case 'google-analytics':
      name = account.propertyName || account.name || `Google Analytics (${account.platform || 'GA4'})`;
      identifier = account.id;
      break;
    case 'meta-ads':
      name = account.name || account.accountId;
      identifier = account.accountId;
      break;
    case 'meta-insights':
      // Handle platform-specific naming
      if (account.platform === 'facebook') {
        name = account.pageName || `Facebook Page`;
        identifier = account.pageId || account.id;
      } else if (account.platform === 'instagram') {
        name = account.instagramUsername || `Instagram Account`;
        identifier = account.instagramBusinessId || account.id;
      } else {
        name = `${account.platform || 'Meta'} Insights`;
        identifier = account.id;
      }
      break;
    default:
      name = account.name || 'Unknown Account';
      identifier = account.id || 'unknown';
  }

  return {
    id: account.id, // This determines what we send to the backend for assignment
    name,
    identifier,
    platform: account.platform,
    original: account,
    assignedToClient: account.assignedToClient
  };
};

export const getAvailableAccounts = async (integration: IntegrationType): Promise<AvailableAccount[]> => {
  try {
    // Special handling for Meta Insights
    if (integration === 'meta-insights') {
      const { getMetaInsightsAccounts } = await import('../features/meta/API/metaInsightsApi');
      const response = await getMetaInsightsAccounts();
      // Map insights array to accounts
      return response.insights.map((acc: any) => normalizeAccount(acc, integration));
    }

    // API endpoints use hyphens (e.g. meta-ads), but types use underscores (e.g. meta-ads)
    const urlIntegration = integration.replace(/_/g, '-');
    console.log(`integrations/${urlIntegration}/available-accounts`);
    const response = await api.get<any>(`/integrations/${urlIntegration}/available-accounts`);
    console.log("getAvailableAccounts", response.data);
    // Handle different response structures if necessary, but guide says { accounts: [] }
    const rawAccounts = response.data.accounts || response.data.properties || response.data.sites || [];

    return rawAccounts.map((acc: any) => normalizeAccount(acc, integration));
  } catch (error) {
    console.error(`Error fetching accounts for ${integration}:`, error);
    throw error;
  }
};

export const assignAccountToClient = async (
  clientId: number,
  integration: IntegrationType,
  accountId: string | number
): Promise<AccountAssignmentResponse> => {
  console.log("assignAccountToClient", clientId, integration, accountId);
  try {
    const response = await api.post<AccountAssignmentResponse>(
      `/clients/${clientId}/accounts`,
      {
        integrationType: integration,
        accountId
      } as AccountAssignmentRequest
    );

    console.log("assignAccountToClient", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error assigning account to client ${clientId}:`, error);
    throw error;
  }
};

export const removeAccountFromClient = async (
  clientId: number,
  integration: IntegrationType,
  accountId: string | number
): Promise<any> => {
  try {
    const response = await api.delete(
      `/clients/${clientId}/accounts/${integration}/${accountId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error removing account from client ${clientId}:`, error);
    throw error;
  }
};

export const getConnectedIntegrations = async (): Promise<import('../types/integration.types').ConnectedIntegrationsResponse> => {
  try {
    const response = await api.get<import('../types/integration.types').ConnectedIntegrationsResponse>('/integrations/connected');
    return response.data;
  } catch (error) {
    console.error('Error fetching connected integrations:', error);
    throw error;
  }
};

export const getSyncProgress = async (
  clientId: number,
  integrationType: IntegrationType
): Promise<import('../types/integration.types').SyncProgressResponse> => {
  try {
    // Normalize key: replace spaces/underscores with hyphens to match API format
    const normalizedType = integrationType.toLowerCase().replace(/[ _]/g, '-');
    const response = await api.get<import('../types/integration.types').SyncProgressResponse>(
      `/sync-status/${clientId}/${normalizedType}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching sync progress for ${integrationType}:`, error);
    throw error;
  }
};
