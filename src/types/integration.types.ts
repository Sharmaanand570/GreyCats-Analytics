export type IntegrationType =
  | 'meta-business'
  | 'youtube'
  | 'shopify'
  | 'woocommerce'
  | 'google-search-console'
  | 'google-analytics'
  | 'google-ads'
  | 'meta-ads'
  | 'meta-insights'
  | 'twitter'
  | 'linkedin';

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
  warning?: string;
  assignment?: any;
}

// Response for Sync Progress API
export interface SyncProgress {
  synced: number;
  failed: number;
  total: number;
  percentage: number;
  successRate: number;
  lastSyncedDate: string | null;
  errorLog: {
    error: string;
    timestamp: string;
  } | null;
  currentStage: string | null;
  estimatedEndTime: string | null;
  estimatedMinutesRemaining: number | null;
  startedAt: string | null;
  elapsedSeconds: number | null;
}

export interface SyncProgressResponse {
  success: boolean;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress: SyncProgress | null;
  updatedAt: string;
  message?: string; // For error cases
  error?: string; // For error cases
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
  link?: string; // Optional link override
}
