// Client and Integration Type Definitions

export type IntegrationType =
  | 'meta-business'
  | 'meta-ads'
  | 'meta-insights'
  | 'youtube'
  | 'shopify'
  | 'woocommerce'
  | 'google-search-console'
  | 'google-analytics';

export interface Client {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    metaBusinessAccounts: number;
    metaAdsAccounts: number;
    metaInsightsAccounts: number;
    youtubeAccounts: number;
    shopifyAccounts: number;
    woocommerceAccounts: number;
    googleSearchConsoleAccounts: number;
    googleAnalyticsAccounts: number;
  };
}

export interface AvailableAccount {
  id: number;
  // Meta Business fields
  pageId?: string;
  pageName?: string;
  instagramUsername?: string;
  instagramBusinessId?: string;
  // YouTube fields
  channelId?: string;
  channelTitle?: string;
  // Shopify fields
  shopDomain?: string;
  // WooCommerce fields
  storeUrl?: string;
  // Google Search Console fields
  siteUrl?: string;
  // Google Analytics fields
  platform?: string;
  // Meta Ads fields
  accountId?: string;
  name?: string;
  // Common fields
  createdAt?: string;
  connectedAt?: string;
  assignedToClient?: {
    id: number;
    name: string;
  } | null;
}

export interface ConnectedIntegration {
  integrationType: IntegrationType;
  accountId: number;
  accountName: string;
  accountIdentifier: string;
  connectedAt: string;
}

export interface ClientWithIntegrations extends Client {
  integrations: ConnectedIntegration[];
  // Legacy fields for backward compatibility
  metaBusinessAccounts?: any[];
  metaAdsAccounts?: any[];
  metaInsightsAccounts?: any[];
  youtubeAccounts?: any[];
  shopifyAccounts?: any[];
  woocommerceAccounts?: any[];
  googleSearchConsoleAccounts?: any[];
  googleAnalyticsAccounts?: any[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ClientsResponse {
  success: boolean;
  total: number;
  clients: Client[];
}

export interface ClientDetailResponse {
  success: boolean;
  client: ClientWithIntegrations;
}

export interface AvailableAccountsResponse {
  success: boolean;
  total: number;
  accounts: AvailableAccount[];
}

export interface AssignAccountRequest {
  integrationType: IntegrationType;
  accountId: number;
}

export interface AssignAccountResponse {
  success: boolean;
  assignment: {
    id: number;
    clientId: number;
    [key: string]: any;
  };
  message?: string;
}
