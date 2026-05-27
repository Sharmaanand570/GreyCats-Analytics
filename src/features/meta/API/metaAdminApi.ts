import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== AUTOMATION RULES ====================

export type AdRuleScope = {
  object_type: "CAMPAIGN" | "ADSET" | "AD";
  object_ids: string[];
};

export type AdRuleFilter = {
  field: string;            // "spend" | "cpc" | "cpm" | "ctr" | "purchase_roas" | "frequency" | ...
  operator: "GREATER_THAN" | "LESS_THAN" | "EQUAL" | "IN_RANGE" | "NOT_IN_RANGE";
  value: number | number[];
  time_window: number;      // last N days
};

export type AdRuleEvaluationSpec = {
  evaluation_type: "SCHEDULE" | "TRIGGER";
  filters: AdRuleFilter[];
};

export type AdRuleExecutionSpec = {
  execution_type:
    | "PAUSE"
    | "UNPAUSE"
    | "CHANGE_BUDGET"
    | "NOTIFICATION"
    | "REBALANCE_BUDGET";
  // For CHANGE_BUDGET: { field: "daily_budget", operator: "INCREASE_BY", value: 10 } etc.
  execution_options?: Array<{ field: string; operator: string; value: string | number }>;
};

export type AdRuleScheduleSpec = {
  schedule_type: "DAILY" | "HOURLY" | "CUSTOM";
  schedule?: Array<{ days: number[]; hours: number[] }>;
};

export type AdRule = {
  id: string;
  name: string;
  status: "ENABLED" | "DISABLED";
  evaluation_spec: AdRuleEvaluationSpec;
  execution_spec: AdRuleExecutionSpec;
  schedule_spec: AdRuleScheduleSpec;
  scope: AdRuleScope;
  created_time?: string;
  updated_time?: string;
};

export type AdRuleCreatePayload = Omit<AdRule, "id" | "created_time" | "updated_time">;

export type AdRuleListResponse = { success: boolean; data: AdRule[] };
export type AdRuleResponse = { success: boolean; data: AdRule };

// ==================== APPROVAL WORKFLOW ====================

export type DraftCampaign = {
  jobId: number;
  campaignName: string;
  state: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  submittedBy?: string;
  submittedAt?: string;
  approvers?: string[];
  approversNeeded?: number;
  rejectionReason?: string;
  payloadSummary?: Record<string, unknown>;
};

export type DraftsListResponse = { success: boolean; data: DraftCampaign[] };

// ==================== AUDIT LOG ====================

export type AuditEntry = {
  id: number;
  actorUserId: number;
  actorName?: string;
  clientId: number;
  objectType: "campaign" | "adset" | "ad" | "audience" | "rule";
  objectId: string;
  action:
    | "create"
    | "update"
    | "pause"
    | "resume"
    | "delete"
    | "publish"
    | "sync"
    | "approve"
    | "reject";
  fbtrace_id?: string;
  before?: unknown;
  after?: unknown;
  createdAt: string;
};

export type AuditListResponse = { success: boolean; data: AuditEntry[] };

// ==================== VERSIONING ====================

export type CampaignVersion = {
  id: number;
  campaignId: string;
  versionNumber: number;
  snapshot: Record<string, unknown>;
  diff?: Record<string, unknown>;
  actorUserId: number;
  actorName?: string;
  changeReason?: string;
  createdAt: string;
};

export type CampaignVersionsResponse = { success: boolean; data: CampaignVersion[] };

// ==================== RULE HISTORY ====================

export type AdRuleHistoryEntry = {
  id: number;
  ruleId: string;
  executedAt: string;
  evaluatedObjectsCount: number;
  matchedObjectsCount: number;
  actionsTaken: number;
  errors?: string[];
};

type ApiErrorResponse = { message?: string; error?: string };

const wrapError = (error: unknown, fallback: string): Error => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return new Error(
    axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      fallback
  );
};

// ==================== API ====================

// --- Ad Rules
export const listAdRules = async (clientId: number): Promise<AdRule[]> => {
  try {
    const res = await api.get<AdRuleListResponse>(`/clients/${clientId}/ad-rules`);
    return res.data.data ?? [];
  } catch (error) {
    throw wrapError(error, "Failed to load automation rules");
  }
};

export const createAdRule = async (
  clientId: number,
  payload: AdRuleCreatePayload
): Promise<AdRule> => {
  try {
    const res = await api.post<AdRuleResponse>(
      `/clients/${clientId}/ad-rules`,
      payload
    );
    return res.data.data;
  } catch (error) {
    throw wrapError(error, "Failed to create automation rule");
  }
};

export const updateAdRule = async (
  clientId: number,
  ruleId: string,
  payload: Partial<AdRuleCreatePayload>
): Promise<AdRule> => {
  try {
    const res = await api.put<AdRuleResponse>(
      `/clients/${clientId}/ad-rules/${ruleId}`,
      payload
    );
    return res.data.data;
  } catch (error) {
    throw wrapError(error, "Failed to update automation rule");
  }
};

export const deleteAdRule = async (
  clientId: number,
  ruleId: string
): Promise<void> => {
  try {
    await api.delete(`/clients/${clientId}/ad-rules/${ruleId}`);
  } catch (error) {
    throw wrapError(error, "Failed to delete automation rule");
  }
};

export const executeAdRule = async (
  clientId: number,
  ruleId: string
): Promise<void> => {
  try {
    await api.post(`/clients/${clientId}/ad-rules/${ruleId}/execute`);
  } catch (error) {
    throw wrapError(error, "Failed to execute automation rule");
  }
};

// --- Drafts / Approvals
// Backend-confirmed 2026-05-26: there is no dedicated /drafts endpoint.
// Drafts are simply publish jobs in state `NEEDS_REVIEW` — created when the
// user submits with needsReview: true. We list publish jobs for the client
// and filter to that state. The shape adapter below maps PublishJob → DraftCampaign.
type PublishJobRow = {
  jobId: number;
  state: "QUEUED" | "PUBLISHING" | "PUBLISHED" | "FAILED" | "PARTIAL" | "NEEDS_REVIEW";
  campaignName?: string;
  submittedBy?: string;
  createdAt?: string;
  approvers?: string[];
  approversNeeded?: number;
  rejectionReason?: string;
  payloadSummary?: Record<string, unknown>;
};

export const listDrafts = async (clientId: number): Promise<DraftCampaign[]> => {
  try {
    // Backend exposes publish jobs at /meta-campaign-wizard/jobs?clientId=&state=
    // We only want NEEDS_REVIEW jobs for the approvals queue.
    const res = await api.get<{ success: boolean; data: PublishJobRow[] }>(
      `/meta-campaign-wizard/jobs`,
      { params: { clientId, state: "NEEDS_REVIEW" } }
    );
    return (res.data.data ?? []).map((j) => ({
      jobId: j.jobId,
      campaignName: j.campaignName ?? `Job #${j.jobId}`,
      state: j.state === "NEEDS_REVIEW" ? "PENDING_APPROVAL" : "DRAFT",
      submittedBy: j.submittedBy,
      submittedAt: j.createdAt,
      approvers: j.approvers,
      approversNeeded: j.approversNeeded,
      rejectionReason: j.rejectionReason,
      payloadSummary: j.payloadSummary,
    }));
  } catch (error) {
    throw wrapError(error, "Failed to load drafts");
  }
};

export const approveDraft = async (
  clientId: number,
  campaignId: string
): Promise<void> => {
  try {
    await api.post(
      `/meta-campaign-wizard/campaigns/${campaignId}/approve`,
      {},
      { params: { clientId } }
    );
  } catch (error) {
    throw wrapError(error, "Failed to approve draft");
  }
};

export const rejectDraft = async (
  clientId: number,
  campaignId: string,
  reason: string
): Promise<void> => {
  try {
    await api.post(
      `/meta-campaign-wizard/campaigns/${campaignId}/reject`,
      { reason },
      { params: { clientId } }
    );
  } catch (error) {
    throw wrapError(error, "Failed to reject draft");
  }
};

// --- Audit log
// Backend-confirmed paths 2026-05-26:
//   client-wide: GET /meta-campaign-wizard/audit-log (optionally ?campaignId=)
//   per-campaign: GET /meta-campaign-wizard/campaigns/:campaignId/audit-log
// (was /clients/:clientId/meta-ads/audit-log in our guess — backend never had that)
export const listAuditLog = async (
  clientId: number,
  params?: { objectId?: string; objectType?: string; limit?: number; entityType?: string; offset?: number }
): Promise<AuditEntry[]> => {
  try {
    const res = await api.get<AuditListResponse>(
      `/meta-campaign-wizard/audit-log`,
      { params: { ...params, clientId } }
    );
    return res.data.data ?? [];
  } catch (error) {
    throw wrapError(error, "Failed to load audit log");
  }
};

// --- Versions
export const listCampaignVersions = async (
  clientId: number,
  campaignId: string
): Promise<CampaignVersion[]> => {
  try {
    const res = await api.get<CampaignVersionsResponse>(
      `/meta-campaign-wizard/campaigns/${campaignId}/versions`,
      { params: { clientId } }
    );
    return res.data.data ?? [];
  } catch (error) {
    throw wrapError(error, "Failed to load campaign versions");
  }
};

export const rollbackCampaignVersion = async (
  clientId: number,
  campaignId: string,
  versionNumber: number
): Promise<void> => {
  try {
    await api.post(
      `/meta-campaign-wizard/campaigns/${campaignId}/versions/${versionNumber}/rollback`,
      {},
      { params: { clientId } }
    );
  } catch (error) {
    throw wrapError(error, "Failed to rollback version");
  }
};

// --- Rule History (K-4)
export const listAdRuleHistory = async (
  clientId: number,
  ruleId: string
): Promise<AdRuleHistoryEntry[]> => {
  try {
    const res = await api.get<{ success: boolean; data: AdRuleHistoryEntry[] }>(
      `/clients/${clientId}/ad-rules/${ruleId}/history`
    );
    return res.data.data ?? [];
  } catch (error) {
    throw wrapError(error, "Failed to load rule history");
  }
};

// --- Per-campaign audit log (K-5). Reuses the AuditEntry type from line 74.
export const listCampaignAuditLog = async (
  clientId: number,
  campaignId: string,
  params?: { limit?: number }
): Promise<AuditEntry[]> => {
  try {
    const res = await api.get<AuditListResponse>(
      `/meta-campaign-wizard/campaigns/${campaignId}/audit-log`,
      { params: { clientId, ...params } }
    );
    return res.data.data ?? [];
  } catch (error) {
    throw wrapError(error, "Failed to load campaign audit log");
  }
};
