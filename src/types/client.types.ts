// Client and Integration Type Definitions

export type IntegrationType =
  | 'meta-business'
  | 'meta-ads'
  | 'meta-insights'
  | 'youtube'
  | 'shopify'
  | 'woocommerce'
  | 'google-search-console'
  | 'google-analytics'
  | 'google-ads'
  | 'twitter'
  | 'linkedin'
  | 'wordpress'
  | 'telegram';

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
    googleAdsAccounts: number;
    twitterAccounts: number;
    linkedinAccounts: number;
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
  // Twitter fields
  username?: string;
  profileImageUrl?: string;
  // LinkedIn fields
  linkedinName?: string;
  urn?: string;
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
  accountId: number | string;
  accountName: string;
  accountIdentifier: string;
  connectedAt: string;
  hasInitialData?: boolean;
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
  googleAdsAccounts?: any[];
  twitterAccounts?: any[];
  linkedinAccounts?: any[];
  
  // Shared access fields
  _isShared?: boolean;
  sharedAccess?: SharedAccessClient;
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

export interface Collaborator {
  id: number;
  clientId: number;
  userId: number;
  role: 'READ_ONLY' | 'READ_WRITE' | 'ADMIN';
  accessAnalytics: boolean;
  accessAlerts: boolean;
  accessReports: boolean;
  accessScheduler: boolean;
  accessAds: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    profilePicture?: string;
  };
}

export interface Invitation {
  id: number;
  email: string;
  role: 'READ_ONLY' | 'READ_WRITE' | 'ADMIN';
  expiresAt: string;
  createdAt: string;
  accessAnalytics: boolean;
  accessAlerts: boolean;
  accessReports: boolean;
  accessScheduler: boolean;
  accessAds: boolean;
  token?: string;
}

export interface SharedAccessClient {
  clientId: number;
  clientName: string;
  clientLogo?: string;
  isActive: boolean;
  ownerName: string;
  ownerEmail: string;
  role: 'READ_ONLY' | 'READ_WRITE' | 'ADMIN';
  accessAnalytics: boolean;
  accessAlerts: boolean;
  accessReports: boolean;
  accessScheduler: boolean;
  accessAds: boolean;
  grantedAt: string;
}
