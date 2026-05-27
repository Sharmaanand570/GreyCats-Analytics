import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  approveDraft,
  createAdRule,
  deleteAdRule,
  executeAdRule,
  listAdRules,
  listAdRuleHistory,
  listAuditLog,
  listCampaignAuditLog,
  listCampaignVersions,
  listDrafts,
  rejectDraft,
  rollbackCampaignVersion,
  updateAdRule,
  type AdRule,
  type AdRuleCreatePayload,
  type AdRuleHistoryEntry,
  type AuditEntry,
  type CampaignVersion,
  type DraftCampaign,
} from "../API/metaAdminApi";
import { formatUserMessage, parseMetaError, shouldToast } from "../API/metaErrors";

const toastMetaError = (e: unknown, fallback: string) => {
  const parsed = parseMetaError(e);
  if (!shouldToast(parsed)) return;
  toast.error(formatUserMessage(parsed) || fallback);
};

// ==================== AD RULES ====================

export const useAdRules = (clientId: number | null) => {
  return useQuery<AdRule[], Error>({
    queryKey: ["meta-admin", "ad-rules", clientId],
    queryFn: () => listAdRules(clientId as number),
    enabled: !!clientId,
    staleTime: 30 * 1000,
  });
};

export const useCreateAdRule = () => {
  const qc = useQueryClient();
  return useMutation<AdRule, Error, { clientId: number; payload: AdRuleCreatePayload }>({
    mutationFn: ({ clientId, payload }) => createAdRule(clientId, payload),
    onSuccess: (_, { clientId }) => {
      qc.invalidateQueries({ queryKey: ["meta-admin", "ad-rules", clientId] });
      toast.success("Automation rule created");
    },
    onError: (e) => toastMetaError(e, "Failed to create rule"),
  });
};

export const useUpdateAdRule = () => {
  const qc = useQueryClient();
  return useMutation<
    AdRule,
    Error,
    { clientId: number; ruleId: string; payload: Partial<AdRuleCreatePayload> }
  >({
    mutationFn: ({ clientId, ruleId, payload }) =>
      updateAdRule(clientId, ruleId, payload),
    onSuccess: (_, { clientId }) => {
      qc.invalidateQueries({ queryKey: ["meta-admin", "ad-rules", clientId] });
      toast.success("Automation rule updated");
    },
    onError: (e) => toastMetaError(e, "Failed to update rule"),
  });
};

export const useDeleteAdRule = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, { clientId: number; ruleId: string }>({
    mutationFn: ({ clientId, ruleId }) => deleteAdRule(clientId, ruleId),
    onSuccess: (_, { clientId }) => {
      qc.invalidateQueries({ queryKey: ["meta-admin", "ad-rules", clientId] });
      toast.success("Rule deleted");
    },
    onError: (e) => toastMetaError(e, "Failed to delete rule"),
  });
};

export const useExecuteAdRule = () => {
  return useMutation<void, Error, { clientId: number; ruleId: string }>({
    mutationFn: ({ clientId, ruleId }) => executeAdRule(clientId, ruleId),
    onSuccess: () => toast.success("Rule executed"),
    onError: (e) => toastMetaError(e, "Failed to execute rule"),
  });
};

// ==================== APPROVALS ====================

export const useDrafts = (clientId: number | null) => {
  return useQuery<DraftCampaign[], Error>({
    queryKey: ["meta-admin", "drafts", clientId],
    queryFn: () => listDrafts(clientId as number),
    enabled: !!clientId,
    staleTime: 30 * 1000,
  });
};

export const useApproveDraft = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, { clientId: number; campaignId: string }>({
    mutationFn: ({ clientId, campaignId }) => approveDraft(clientId, campaignId),
    onSuccess: (_, { clientId }) => {
      qc.invalidateQueries({ queryKey: ["meta-admin", "drafts", clientId] });
      toast.success("Draft approved");
    },
    onError: (e) => toastMetaError(e, "Failed to approve draft"),
  });
};

export const useRejectDraft = () => {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { clientId: number; campaignId: string; reason: string }
  >({
    mutationFn: ({ clientId, campaignId, reason }) =>
      rejectDraft(clientId, campaignId, reason),
    onSuccess: (_, { clientId }) => {
      qc.invalidateQueries({ queryKey: ["meta-admin", "drafts", clientId] });
      toast.success("Draft rejected");
    },
    onError: (e) => toastMetaError(e, "Failed to reject draft"),
  });
};

// ==================== AUDIT LOG ====================

export const useAuditLog = (
  clientId: number | null,
  params?: { objectId?: string; objectType?: string; limit?: number }
) => {
  return useQuery<AuditEntry[], Error>({
    queryKey: ["meta-admin", "audit-log", clientId, params],
    queryFn: () => listAuditLog(clientId as number, params),
    enabled: !!clientId,
    staleTime: 30 * 1000,
  });
};

// ==================== VERSIONS ====================

export const useCampaignVersions = (
  clientId: number | null,
  campaignId: string | null
) => {
  return useQuery<CampaignVersion[], Error>({
    queryKey: ["meta-admin", "versions", clientId, campaignId],
    queryFn: () =>
      listCampaignVersions(clientId as number, campaignId as string),
    enabled: !!clientId && !!campaignId,
    staleTime: 30 * 1000,
  });
};

export const useRollbackVersion = () => {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { clientId: number; campaignId: string; versionNumber: number }
  >({
    mutationFn: ({ clientId, campaignId, versionNumber }) =>
      rollbackCampaignVersion(clientId, campaignId, versionNumber),
    onSuccess: (_, { clientId, campaignId }) => {
      qc.invalidateQueries({
        queryKey: ["meta-admin", "versions", clientId, campaignId],
      });
      qc.invalidateQueries({ queryKey: ["meta-ads-manager", "campaign-details"] });
      ["meta-ads-campaigns", "meta-ads-summary"].forEach((k) =>
        qc.invalidateQueries({ queryKey: [k] })
      );
      toast.success("Rolled back to previous version");
    },
    onError: (e) => toastMetaError(e, "Failed to rollback"),
  });
};

// --- K-4: Rule execution history
export const useAdRuleHistory = (clientId: number | null, ruleId: string | null) => {
  return useQuery<AdRuleHistoryEntry[], Error>({
    queryKey: ["meta-admin", "rule-history", clientId, ruleId],
    queryFn: () => listAdRuleHistory(clientId as number, ruleId as string),
    enabled: !!clientId && !!ruleId,
    staleTime: 30 * 1000,
  });
};

// --- K-5: Per-campaign audit log
export const useCampaignAuditLog = (
  clientId: number | null,
  campaignId: string | null,
  limit?: number
) => {
  return useQuery<AuditEntry[], Error>({
    queryKey: ["meta-admin", "campaign-audit", clientId, campaignId, limit],
    queryFn: () =>
      listCampaignAuditLog(clientId as number, campaignId as string, { limit }),
    enabled: !!clientId && !!campaignId,
    staleTime: 30 * 1000,
  });
};
