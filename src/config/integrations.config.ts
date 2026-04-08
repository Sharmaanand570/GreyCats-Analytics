import type { IntegrationType } from '../types/client.types';

export interface IntegrationConfig {
  name: string;
  icon: string;
  color: string;
  oauthUrl: string;
  availableAccountsUrl: string;
  displayNameField: keyof any;
  identifierField: keyof any;
}

export const INTEGRATION_CONFIG: Record<IntegrationType, IntegrationConfig> = {
  'meta-business': {
    name: 'Facebook',
    icon: '📘',
    color: 'bg-blue-500',
    oauthUrl: '/meta-business/connect',
    availableAccountsUrl: '/api/integrations/meta-business/available-accounts',
    displayNameField: 'pageName',
    identifierField: 'pageId',
  },
  'meta-ads': {
    name: 'Meta Ads',
    icon: '📱',
    color: 'bg-purple-500',
    oauthUrl: '/meta-ads/connect',
    availableAccountsUrl: '/api/integrations/meta-ads/available-accounts',
    displayNameField: 'name',
    identifierField: 'accountId',
  },
  'meta-insights': {
    name: 'Meta Insights',
    icon: '📈',
    color: 'bg-indigo-500',
    oauthUrl: '/meta-insights/connect',
    availableAccountsUrl: '/api/integrations/meta-insights/available-accounts',
    displayNameField: 'platform',
    identifierField: 'id',
  },
  'youtube': {
    name: 'YouTube',
    icon: '📺',
    color: 'bg-red-500',
    oauthUrl: '/youtube/connect',
    availableAccountsUrl: '/api/integrations/youtube/available-accounts',
    displayNameField: 'channelTitle',
    identifierField: 'channelId',
  },
  'shopify': {
    name: 'Shopify',
    icon: '🛒',
    color: 'bg-green-500',
    oauthUrl: '/shopify/connect',
    availableAccountsUrl: '/api/integrations/shopify/available-accounts',
    displayNameField: 'shopDomain',
    identifierField: 'shopDomain',
  },
  'woocommerce': {
    name: 'WooCommerce',
    icon: '💼',
    color: 'bg-purple-600',
    oauthUrl: '/woocommerce/connect',
    availableAccountsUrl: '/api/integrations/woocommerce/available-accounts',
    displayNameField: 'storeUrl',
    identifierField: 'storeUrl',
  },
  'google-search-console': {
    name: 'Google Search Console',
    icon: '🔍',
    color: 'bg-yellow-500',
    oauthUrl: '/google-console/connect',
    availableAccountsUrl: '/api/integrations/google-search-console/available-accounts',
    displayNameField: 'siteUrl',
    identifierField: 'siteUrl',
  },
  'google-analytics': {
    name: 'Google Analytics',
    icon: '📊',
    color: 'bg-orange-500',
    oauthUrl: '/google/connect',
    availableAccountsUrl: '/api/integrations/google-analytics/available-accounts',
    displayNameField: 'platform',
    identifierField: 'id',   
  },
  'google-ads': {
    name: 'Google Ads',
    icon: '🎯',
    color: 'bg-blue-600',
    oauthUrl: '/google-ads/connect',
    availableAccountsUrl: '/api/integrations/google-ads/available-accounts',
    displayNameField: 'name',
    identifierField: 'customerId',
  },
  'twitter': {
    name: 'Twitter (X)',
    icon: '𝕏', // Or a different icon if preferred, maybe '🐦'
    color: 'bg-black dark:bg-white dark:text-black', // Standard X color
    oauthUrl: '/twitter/connect',
    availableAccountsUrl: '/api/integrations/twitter/available-accounts', // Assuming this exists if they use the standard pattern, but callback assignment is what the guide mentioned.
    displayNameField: 'username',
    identifierField: 'accountId',
  },
  'linkedin': {
    name: 'LinkedIn',
    icon: 'in', // Can use SiLinkedin in UI components
    color: 'bg-[#0A66C2] text-white',
    oauthUrl: '/linkedin/portability/connect',
    availableAccountsUrl: '/api/integrations/linkedin/available-accounts',
    displayNameField: 'linkedinName',
    identifierField: 'urn',
  },
};

// Helper functions
export const getIntegrationName = (type: IntegrationType): string => {
  return INTEGRATION_CONFIG[type]?.name || type;
};

export const getIntegrationIcon = (type: IntegrationType): string => {
  return INTEGRATION_CONFIG[type]?.icon || '📦';
};

export const getIntegrationColor = (type: IntegrationType): string => {
  return INTEGRATION_CONFIG[type]?.color || 'bg-gray-500';
};

export const getAccountDisplayName = (account: any, integration: IntegrationType): string => {
  const field = INTEGRATION_CONFIG[integration]?.displayNameField;
  return account[field as string] || 'Unknown Account';
};

export const getAccountIdentifier = (account: any, integration: IntegrationType): string => {
  const field = INTEGRATION_CONFIG[integration]?.identifierField;
  return account[field as string] || '';
};
