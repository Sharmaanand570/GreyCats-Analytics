export type BroadcastChannel = 'SMS' | 'EMAIL' | 'TELEGRAM' | 'WHATSAPP';
export type BroadcastStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'RUNNING';
export type BroadcastProvider = 'TWILIO' | 'ADBIZZ' | 'MSG91' | 'SHARED' | 'SMTP' | 'TELEGRAM' | 'META';
export type TemplateStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BroadcastOwner {
  id: number;
  email: string;
  fullName: string;
}

export interface Broadcast {
  id: number;
  name: string;
  channel: BroadcastChannel;
  message: string;
  subject?: string;
  templateId?: number;
  template?: BroadcastTemplate;
  integrationId?: number;
  clientId?: number | null;
  status: BroadcastStatus;
  sentCount: number;
  failedCount: number;
  recipientCount?: number;
  totalCount: number;
  createdAt: string;
  updatedAt: string;
  user?: BroadcastOwner; // Only present on admin endpoints
}

export type WhatsAppTemplateCategory = 'UTILITY' | 'MARKETING';

export interface BroadcastTemplate {
  id: number;
  name: string;
  channel: BroadcastChannel;
  content: string;
  externalId?: string; // DLT Template ID
  status: TemplateStatus;
  category?: WhatsAppTemplateCategory; // WhatsApp only
  language?: string; // WhatsApp Meta language code e.g. en_US
  createdAt: string;
  userId?: number | null; // null = system template (visible to everyone)
}

export interface BroadcastIntegration {
  id: number;
  type: BroadcastChannel;
  provider: BroadcastProvider;
  name: string;
  isDefault: boolean;
  clientId?: number | null;
  config: Record<string, any>;
  createdAt: string;
  /** ISO timestamp — if in the future, the gateway is temporarily paused (v2.0) */
  coolDownUntil?: string | null;
  /** Human-readable error message from the last gateway failure (v2.0) */
  lastErrorMsg?: string | null;
  user?: BroadcastOwner; // Only present on admin endpoints
}

export interface CreateBroadcastPayload {
  name: string;
  channel: BroadcastChannel;
  subject?: string;
  /** Required for SMS / EMAIL. Telegram uses `message` instead. */
  templateId?: number;
  integrationId?: number;
  clientId?: number;
  /** Plain-text body used by Telegram broadcasts (no template). */
  message?: string;
  recipients: string[];
}

export interface CreateBroadcastCsvPayload {
  file: File;
  name: string;
  channel: BroadcastChannel;
  subject?: string;
  templateId: number;
  columnName?: string;
  variableMapping?: Record<string, string>;
  clientId?: number;
}

export interface CreateTemplateRequest {
  name: string;
  channel: BroadcastChannel;
  content: string;
  externalId?: string;
  category?: WhatsAppTemplateCategory; // WhatsApp only — sent to Meta
  language?: string; // WhatsApp only — Meta language code e.g. en_US
}

export interface CreateIntegrationRequest {
  type: BroadcastChannel;
  provider: BroadcastProvider;
  name: string;
  isDefault?: boolean;
  clientId?: number;
  config: Record<string, any>;
}

export interface BroadcastsListResponse {
  success: boolean;
  broadcasts: Broadcast[];
}

export interface BroadcastResponse {
  success: boolean;
  broadcast: Broadcast;
}

/** GET /broadcasts/stats — engagement metrics (v2.0) */
export interface BroadcastStats {
  total: number;
  sent: number;
  failed: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  byChannel?: Record<string, number>;
  byDay?: Array<{ date: string; sent: number }>;
}

/** POST /broadcasts/test — request/response (v2.0) */
export interface SendTestPayload {
  campaignId: number;
  testTo: string;
}

export interface SendTestResponse {
  message: string;
}
