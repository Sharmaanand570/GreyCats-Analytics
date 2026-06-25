export type BroadcastChannel = 'SMS' | 'EMAIL' | 'TELEGRAM' | 'WHATSAPP';
export type BroadcastStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'RUNNING';
export type BroadcastProvider = 'TWILIO' | 'ADBIZZ' | 'MSG91' | 'SHARED' | 'SMTP' | 'TELEGRAM' | 'META';
export type TemplateStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BroadcastOwner {
  id: number;
  email: string;
  fullName: string;
}

export interface WhatsAppQuota {
  tier: string;
  limit: number;
  sentLast24h: number;
  remaining: number;
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
  recipients?: Array<{
    id: number;
    to: string;
    status: BroadcastStatus;
    error: string | null;
  }>;
}

export type WhatsAppTemplateCategory = 'UTILITY' | 'MARKETING';

export interface WhatsAppTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  buttons?: Array<{
    type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY';
    text: string;
    url?: string;
    example?: string[];
  }>;
  example?: {
    header_handle?: string[];
    body_text?: string[][];
  };
}

export interface BroadcastTemplate {
  id: number;
  name: string;
  channel: BroadcastChannel;
  content: string;
  externalId?: string; // DLT Template ID
  status: TemplateStatus;
  category?: WhatsAppTemplateCategory; // WhatsApp only
  language?: string; // WhatsApp Meta language code e.g. en_US
  components?: WhatsAppTemplateComponent[]; // Meta's raw component blueprint
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
  config: Record<string, any> & {
    verificationStatus?: string;
    requiresTwoStepPin?: boolean;
  };
  createdAt: string;
  user?: BroadcastOwner; // Only present on admin endpoints
}

export interface TemplateParamComponent {
  type: 'header' | 'body' | 'button';
  parameters: Array<
    | { type: 'text'; text: string }
    | { type: 'image'; image: { link: string } }
    | { type: 'video'; video: { link: string } }
    | { type: 'document'; document: { link: string; filename?: string } }
  >;
  sub_type?: 'url';
  index?: string;
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
  /** WhatsApp advanced: Dynamic header/body/button params for Meta API */
  templateParams?: TemplateParamComponent[];
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
