export type IntegrationType =
  | 'meta-business'
  | 'youtube'
  | 'shopify'
  | 'woocommerce'
  | 'google-search-console'
  | 'google-analytics'
  | 'meta-ads'
  | 'meta-insights';

export interface AvailableAccount {
  id: string | number;
  name: string; // Normalized name (e.g., pageName, channelTitle)
  identifier: string; // Normalized ID (e.g., pageId, channelId)
  platform?: string; // e.g., 'facebook', 'instagram' for Meta
  original: any; // The original raw account object from the API
  assignedToClient?: {
    id: number;
    name: string;
  } | null;
}

export interface AvailableAccountsResponse {
  success: boolean;
  total: number;
  accounts: AvailableAccount[];
}

export interface ConnectedPlatform {
  platform: string;
  name: string;
  isConnected: boolean;
  accountCount: number;
}

export interface ConnectedIntegrationsResponse {
  success: boolean;
  totalPlatforms: number;
  totalConnected: number;
  platforms: ConnectedPlatform[];
}

export interface AccountAssignmentRequest {
  integrationType: IntegrationType;
  accountId: string | number;
}

export interface AccountAssignmentResponse {
  success: boolean;
  message: string;
  assignment?: any;
}

// Configuration for mapping frontend to API
export interface IntegrationConfig {
  name: string;
  icon: any; // React Icon or string URL
  oauthUrl: string;
  availableAccountsUrl: string;
  displayNameField: string;
  identifierField: string;
  color?: string;
}
