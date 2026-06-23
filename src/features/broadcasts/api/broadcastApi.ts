import api from '@/apiConfig';
import type {
  Broadcast,
  CreateBroadcastPayload,
  BroadcastTemplate,
  BroadcastIntegration,
  CreateTemplateRequest,
  CreateIntegrationRequest
} from './types';

// Tolerate both wrapped ({ success, x }) and unwrapped (x) backend response shapes.
const pickList = <T>(data: any, key: string): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const pickOne = <T>(data: any, key: string): T => {
  return (data?.[key] ?? data?.data ?? data) as T;
};

/**
 * Create a manual broadcast campaign.
 * POST /broadcasts
 */
export const createBroadcast = async (payload: CreateBroadcastPayload): Promise<Broadcast> => {
  const response = await api.post('/broadcasts', payload);
  return pickOne<Broadcast>(response.data, 'broadcast');
};

/**
 * Create a broadcast campaign via CSV upload.
 * POST /broadcasts/csv
 */
export const createBroadcastCsv = async (
  file: File,
  name: string,
  channel: string,
  templateId: number,
  integrationId?: number,
  columnName?: string,
  subject?: string,
  clientId?: number,
  variableMapping?: Record<string, string>
): Promise<Broadcast> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  formData.append('channel', channel);
  formData.append('templateId', String(templateId));
  if (integrationId) formData.append('integrationId', String(integrationId));
  if (columnName) formData.append('columnName', columnName);
  if (subject) formData.append('subject', subject);
  if (clientId) formData.append('clientId', String(clientId));
  if (variableMapping) formData.append('variableMapping', JSON.stringify(variableMapping));

  const response = await api.post('/broadcasts/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return pickOne<Broadcast>(response.data, 'broadcast');
};

/**
 * List all broadcast campaigns, optionally filtered by clientId.
 * GET /broadcasts?clientId=:id
 */
export const listBroadcasts = async (clientId?: number): Promise<Broadcast[]> => {
  const response = await api.get('/broadcasts', {
    params: clientId ? { clientId } : undefined,
  });
  return pickList<Broadcast>(response.data, 'broadcasts');
};

/**
 * Admin: list all broadcast campaigns across all users.
 * GET /broadcasts/admin
 */
export const listAdminBroadcasts = async (): Promise<Broadcast[]> => {
  const response = await api.get('/broadcasts/admin');
  return pickList<Broadcast>(response.data, 'broadcasts');
};

/**
 * Get status of a specific campaign.
 * GET /broadcasts/:id
 */
export const getBroadcastStatus = async (id: number): Promise<Broadcast> => {
  const response = await api.get(`/broadcasts/${id}`);
  return pickOne<Broadcast>(response.data, 'broadcast');
};

/**
 * List all approved templates.
 * GET /broadcasts/templates
 */
export const listTemplates = async (): Promise<BroadcastTemplate[]> => {
  const response = await api.get('/broadcasts/templates');
  return pickList<BroadcastTemplate>(response.data, 'templates');
};

/**
 * Submit a new template for approval.
 * POST /broadcasts/templates
 */
export const createTemplate = async (payload: CreateTemplateRequest): Promise<BroadcastTemplate> => {
  const response = await api.post('/broadcasts/templates', payload);
  return pickOne<BroadcastTemplate>(response.data, 'template');
};

/**
 * Create a system template (Admin only).
 * POST /broadcasts/admin/templates
 */
export const createSystemTemplate = async (payload: CreateTemplateRequest): Promise<BroadcastTemplate> => {
  const response = await api.post('/broadcasts/admin/templates', payload);
  return pickOne<BroadcastTemplate>(response.data, 'template');
};

/**
 * List all templates for admin oversight (includes PENDING).
 * Tries GET /broadcasts/admin/templates first; falls back to the regular
 * /broadcasts/templates endpoint if the admin route is not available.
 */
export const listAdminTemplates = async (): Promise<BroadcastTemplate[]> => {
  try {
    const response = await api.get('/broadcasts/admin/templates');
    return pickList<BroadcastTemplate>(response.data, 'templates');
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      const response = await api.get('/broadcasts/templates');
      return pickList<BroadcastTemplate>(response.data, 'templates');
    }
    throw err;
  }
};

/**
 * Delete a template.
 * DELETE /broadcasts/templates/:id
 */
export const deleteTemplate = async (id: number): Promise<void> => {
  await api.delete(`/broadcasts/templates/${id}`);
};

/**
 * Sync templates from external providers like WhatsApp.
 * POST /broadcasts/templates/sync
 */
export const syncTemplates = async (clientId?: number): Promise<void> => {
  await api.post('/broadcasts/templates/sync', clientId ? { clientId } : {});
};

/**
 * Approve or reject a template (Admin only).
 * PATCH /broadcasts/templates/:id/approve
 */
export const approveTemplate = async (id: number, status: 'APPROVED' | 'REJECTED', externalId?: string): Promise<BroadcastTemplate> => {
  const response = await api.patch(`/broadcasts/templates/${id}/approve`, { status, externalId });
  return pickOne<BroadcastTemplate>(response.data, 'template');
};

/**
 * Connect a new provider integration.
 * POST /broadcasts/integrations
 */
export const createIntegration = async (payload: CreateIntegrationRequest): Promise<BroadcastIntegration> => {
  const response = await api.post('/broadcasts/integrations', payload);
  return pickOne<BroadcastIntegration>(response.data, 'integration');
};

/**
 * List all provider integrations, optionally filtered by clientId.
 * GET /broadcasts/integrations?clientId=:id
 */
export const listIntegrations = async (clientId?: number): Promise<BroadcastIntegration[]> => {
  const response = await api.get('/broadcasts/integrations', {
    params: clientId ? { clientId } : undefined,
  });
  return pickList<BroadcastIntegration>(response.data, 'integrations');
};

/**
 * Admin: list all provider integrations across all users.
 * GET /broadcasts/admin/integrations
 */
export const listAdminIntegrations = async (): Promise<BroadcastIntegration[]> => {
  const response = await api.get('/broadcasts/admin/integrations');
  return pickList<BroadcastIntegration>(response.data, 'integrations');
};
/**
 * Delete a provider integration.
 * DELETE /broadcasts/integrations/:id
 */
export const deleteIntegration = async (id: number): Promise<void> => {
  await api.delete(`/broadcasts/integrations/${id}`);
};

/**
 * Admin: forcefully delete a provider integration.
 * DELETE /broadcasts/admin/integrations/:id
 */
export const deleteAdminIntegration = async (id: number): Promise<void> => {
  await api.delete(`/broadcasts/admin/integrations/${id}`);
};

/**
 * Register Two-Step Verification PIN for WhatsApp
 * POST /broadcasts/integrations/:id/whatsapp/register-pin
 */
export const registerWhatsAppPin = async (id: number, pin: string): Promise<void> => {
  await api.post(`/broadcasts/integrations/${id}/whatsapp/register-pin`, { pin });
};

/**
 * Request SMS Code for WhatsApp Verification
 * POST /broadcasts/integrations/:id/whatsapp/request-code
 */
export const requestWhatsAppCode = async (id: number, code_method: 'SMS' | 'VOICE' = 'SMS'): Promise<void> => {
  await api.post(`/broadcasts/integrations/${id}/whatsapp/request-code`, { code_method });
};

/**
 * Submit Verification Code for WhatsApp
 * POST /broadcasts/integrations/:id/whatsapp/verify-code
 */
export const verifyWhatsAppCode = async (id: number, code: string): Promise<void> => {
  await api.post(`/broadcasts/integrations/${id}/whatsapp/verify-code`, { code });
};
