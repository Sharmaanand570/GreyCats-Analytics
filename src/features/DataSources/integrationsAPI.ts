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
 * Get all integrations for a client
 * GET /clients/:clientId (then extract integrations from client data)
 */
export const getIntegrations = async (
  clientId: number
): Promise<IntegrationsResponse> => {
  try {
    const response = await api.get<any>(
      `/clients/${clientId}`
    );

    // Extract integrations from client data
    const client = response.data?.client || response.data;
    const integrations: Integration[] = [];

    // Map all account types to integrations
    if (client.metaBusinessAccounts) {
      client.metaBusinessAccounts.forEach((acc: any) => {
        integrations.push({
          id: acc.id,
          userId: client.userId,
          platform: 'meta-business',
          accountId: acc.pageId || acc.id.toString(),
          accountName: acc.pageName || 'Meta Business Account',
          status: 'connected',
          lastSyncedAt: acc.lastSynced || null,
          connectedAt: acc.createdAt,
          extra: null,
        });
      });
    }

    if (client.shopifyAccounts) {
      client.shopifyAccounts.forEach((acc: any) => {
        integrations.push({
          id: acc.id,
          userId: client.userId,
          platform: 'shopify',
          accountId: acc.shopDomain || acc.id.toString(),
          accountName: acc.shopDomain || 'Shopify Store',
          status: 'connected',
          lastSyncedAt: acc.lastSynced || null,
          connectedAt: acc.createdAt,
          extra: null,
        });
      });
    }

    // Google Analytics Properties (from actual API response structure)
    if (client.googleAnalyticsProperties) {
      client.googleAnalyticsProperties.forEach((gaProperty: any) => {
        integrations.push({
          id: gaProperty.id,
          userId: client.userId,
          platform: 'google-analytics',
          accountId: gaProperty.platformAccount?.propertyId || gaProperty.id.toString(),
          accountName: gaProperty.platformAccount?.propertyName || 'Google Analytics',
          status: 'connected',
          lastSyncedAt: gaProperty.lastHistoricalSyncDate || null,
          connectedAt: gaProperty.createdAt,
          extra: null,
        });
      });
    }

    // Platform Accounts (Google Analytics) - legacy support
    if (client.platformAccounts) {
      client.platformAccounts.forEach((platformAcc: any) => {
        if (platformAcc.account?.platform === 'GOOGLE') {
          integrations.push({
            id: platformAcc.id,
            userId: client.userId,
            platform: 'google-analytics',
            accountId: platformAcc.account.propertyId || platformAcc.id.toString(),
            accountName: platformAcc.account.propertyName || 'Google Analytics',
            status: 'connected',
            lastSyncedAt: null,
            connectedAt: platformAcc.createdAt,
            extra: null,
          });
        }
      });
    }

    // Meta Ads Accounts
    if (client.metaAdAccounts) {
      client.metaAdAccounts.forEach((acc: any) => {
        integrations.push({
          id: acc.id,
          userId: client.userId,
          platform: 'meta-ads',
          accountId: acc.adAccount?.accountId || acc.id.toString(),
          accountName: acc.adAccount?.name || 'Meta Ads Account',
          status: 'connected',
          lastSyncedAt: null,
          connectedAt: acc.createdAt,
          extra: null,
        });
      });
    }

    // Google Search Console Properties
    if (client.googleSearchConsoleProperties) {
      client.googleSearchConsoleProperties.forEach((acc: any) => {
        integrations.push({
          id: acc.id,
          userId: client.userId,
          platform: 'google-search-console',
          accountId: acc.property?.siteUrl || acc.id.toString(),
          accountName: acc.property?.siteUrl || 'Google Search Console',
          status: 'connected',
          lastSyncedAt: null,
          connectedAt: acc.createdAt,
          extra: null,
        });
      });
    }

    // Add other integration types as needed
    if (client.youtubeAccounts) {
      client.youtubeAccounts.forEach((acc: any) => {
        integrations.push({
          id: acc.id,
          userId: client.userId,
          platform: 'youtube',
          accountId: acc.channelId || acc.id.toString(),
          accountName: acc.channelTitle || 'YouTube Channel',
          status: 'connected',
          lastSyncedAt: null,
          connectedAt: acc.createdAt,
          extra: null,
        });
      });
    }

    // WooCommerce Accounts
    if (client.wooCommerceAccounts) {
      client.wooCommerceAccounts.forEach((acc: any) => {
        integrations.push({
          id: acc.id,
          userId: client.userId,
          platform: 'woocommerce',
          // Match the pattern from useClients.ts - check nested woocommerceAccount first
          accountId: acc.woocommerceAccount?.storeUrl || acc.storeUrl || acc.id.toString(),
          accountName: acc.woocommerceAccount?.storeUrl || acc.storeUrl || 'WooCommerce Store',
          status: 'connected',
          lastSyncedAt: acc.lastSynced || null,
          connectedAt: acc.createdAt,
          extra: null,
        });
      });
    }

    return {
      success: true,
      integrations,
    };
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to fetch integrations"
    );
  }
};


// Management
export const deleteIntegrationAccount = async (clientId: number, integrationType: string, accountId: string) => {
  const response = await api.delete(`/clients/${clientId}/accounts/${integrationType}/${accountId}`);
  return response.data;
};

export const markReconnectNeeded = async (platform: string) => {
  const response = await api.put(`/integrations/${platform}/reconnect`);
  return response.data;
};
