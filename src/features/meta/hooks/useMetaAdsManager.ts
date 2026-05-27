import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addAdSetToCampaign,
  addAdToAdSet,
  browseTargeting,
  bulkOperations,
  deleteAd,
  deleteAdSet,
  duplicateAd,
  duplicateAdSet,
  getCampaignHierarchical,
  getPublishJobStatus,
  hardDeleteCampaign,
  listAdsManagerPages,
  listCustomAudiencesPicker,
  listSavedAudiencesPicker,
  publishAd,
  searchInterests,
  searchLocations,
  submitForApproval,
  submitPublishJob,
  TERMINAL_JOB_STATES,
  updateAd,
  updateAdSet,
  updateCampaign,
  updateCampaignStatus,
  type AudiencesResponse,
  type CampaignStatus,
  type DetailedTargetingResult,
  type DetailedTargetingType,
  type MetaPixelsResponse,
  type PublishAdPayload,
  type PublishAdResponse,
  type AdPatch,
  type AdSetPatch,
  type AdsManagerPage,
  type BulkRow,
  type BulkResponse,
  type CustomAudiencePicker,
  type PublishJob,
  type PublishJobState,
  type SavedAudiencePicker,
  type TargetingInterest,
  type TargetingLocation,
  type UpdateCampaignPayload,
  type UpdateCampaignResponse,
  type UpdateCampaignStatusResponse,
} from "../API/metaAdsManagerApi";
import {
  createCustomerListAudience,
  createLookalikeAudience,
  createWebsiteTrafficAudience,
  deleteAudience,
  getAudiences,
  getMetaPixels,
} from "../API/metaApi";
import { formatUserMessage, parseMetaError, shouldToast } from "../API/metaErrors";
import type { WizardState } from "../components/adsWizard/types";
import { toWizardState } from "../components/adsWizard/fromCampaignDetails";

// Central toast helper for every Meta mutation. Routes through the error
// envelope parser so `code` prefixes (META_*, VALIDATION_*, AUTH_*, etc.) get
// their right UX treatment ΓÇö silent dedup on idempotency, fbtrace trailer on
// Meta errors, etc.
const toastMetaError = (error: unknown, fallback: string) => {
  const parsed = parseMetaError(error);
  if (!shouldToast(parsed)) return;
  toast.error(formatUserMessage(parsed) || fallback);
};

const MIN_QUERY_LEN = 2;

export const useSearchInterests = (query: string) => {
  const trimmed = query.trim();
  return useQuery<TargetingInterest[], Error>({
    queryKey: ["meta-campaign-wizard", "interests", trimmed],
    queryFn: () => searchInterests(trimmed),
    enabled: trimmed.length >= MIN_QUERY_LEN,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useSearchLocations = (query: string) => {
  const trimmed = query.trim();
  return useQuery<TargetingLocation[], Error>({
    queryKey: ["meta-campaign-wizard", "locations", trimmed],
    queryFn: () => searchLocations(trimmed),
    enabled: trimmed.length >= MIN_QUERY_LEN,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useBrowseTargeting = (type: DetailedTargetingType, query: string) => {
  const trimmed = query.trim();
  return useQuery<DetailedTargetingResult[], Error>({
    queryKey: ["meta-campaign-wizard", "browse", type, trimmed],
    queryFn: () => browseTargeting(type, trimmed),
    enabled: trimmed.length >= MIN_QUERY_LEN,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useMetaPixels = (clientId: number | null) => {
  return useQuery<MetaPixelsResponse, Error>({
    queryKey: ["meta-campaign-wizard", "pixels", clientId],
    queryFn: () => getMetaPixels(clientId as number),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useAudiences = (clientId: number | null) => {
  return useQuery<AudiencesResponse, Error>({
    queryKey: ["meta-campaign-wizard", "audiences", clientId],
    queryFn: () => getAudiences(clientId as number),
    enabled: !!clientId,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useCreateCustomerListAudience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { clientId: number; name: string; emails: string[] }) =>
      createCustomerListAudience(vars.clientId, { name: vars.name, emails: vars.emails }),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({
        queryKey: ["meta-campaign-wizard", "audiences", clientId],
      });
      toast.success("Customer list uploaded ΓÇö Meta is processing it");
    },
    onError: (error: Error) => {
      toastMetaError(error, "Failed to create audience");
    },
  });
};

export const useCreateWebsiteTrafficAudience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      clientId: number;
      name: string;
      pixelId: string;
      retentionDays: number;
      rules: { event: string; url?: string }[];
    }) =>
      createWebsiteTrafficAudience(vars.clientId, {
        name: vars.name,
        pixelId: vars.pixelId,
        retentionDays: vars.retentionDays,
        rules: vars.rules,
      }),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({
        queryKey: ["meta-campaign-wizard", "audiences", clientId],
      });
      toast.success("Website-traffic audience created");
    },
    onError: (error: Error) => {
      toastMetaError(error, "Failed to create audience");
    },
  });
};

export const useCreateLookalikeAudience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      clientId: number;
      name: string;
      sourceAudienceId: string;
      country: string;
      ratio: 0.01 | 0.02 | 0.05 | 0.1;
    }) =>
      createLookalikeAudience(vars.clientId, {
        name: vars.name,
        sourceAudienceId: vars.sourceAudienceId,
        country: vars.country,
        ratio: vars.ratio,
      }),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({
        queryKey: ["meta-campaign-wizard", "audiences", clientId],
      });
      toast.success("Lookalike audience provisioningΓÇª");
    },
    onError: (error: Error) => {
      toastMetaError(error, "Failed to create lookalike");
    },
  });
};

export const useDeleteAudience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { clientId: number; audienceId: string }) =>
      deleteAudience(vars.clientId, vars.audienceId),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({
        queryKey: ["meta-campaign-wizard", "audiences", clientId],
      });
      toast.success("Audience deleted");
    },
    onError: (error: Error) => {
      toastMetaError(error, "Failed to delete audience");
    },
  });
};

export const useCampaignWizardState = (
  campaignId: string | null,
  clientId: number | null
) => {
  return useQuery<WizardState, Error>({
    queryKey: ["meta-ads-manager", "campaign-details", clientId, campaignId],
    queryFn: async () => {
      const data = await getCampaignHierarchical(campaignId as string, clientId as number);
      return toWizardState(data);
    },
    enabled: !!campaignId && !!clientId,
    staleTime: 30 * 1000,
    retry: 1,
  });
};

const invalidateCampaignViews = (queryClient: ReturnType<typeof useQueryClient>) => {
  // Campaign edits affect summary cards, the trends chart, and the table ΓÇö
  // they all key off these query roots.
  ["meta-ads-campaigns", "meta-ads-summary", "meta-ads-meta", "meta-ads-trends"].forEach(
    (key) => queryClient.invalidateQueries({ queryKey: [key] })
  );
  queryClient.invalidateQueries({ queryKey: ["meta-ads-manager", "campaign-details"] });
};

export const useUpdateCampaignStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateCampaignStatusResponse,
    Error,
    { campaignId: string; status: CampaignStatus; clientId: number }
  >({
    mutationFn: ({ campaignId, status, clientId }) =>
      updateCampaignStatus(campaignId, status, clientId),
    onSuccess: (data, { status }) => {
      invalidateCampaignViews(queryClient);
      const action =
        status === "ACTIVE" ? "resumed" : status === "PAUSED" ? "paused" : "deleted";
      toast.success(data.message || `Campaign ${action}`);
    },
    onError: (error) => {
      toastMetaError(error, "Failed to update campaign status");
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateCampaignResponse,
    Error,
    { campaignId: string; payload: UpdateCampaignPayload; clientId: number }
  >({
    mutationFn: ({ campaignId, payload, clientId }) =>
      updateCampaign(campaignId, payload, clientId),
    onSuccess: (data) => {
      invalidateCampaignViews(queryClient);
      toast.success(data.message || "Campaign updated");
    },
    onError: (error) => {
      toastMetaError(error, "Failed to update campaign");
    },
  });
};

export const usePublishAd = () => {
  return useMutation<PublishAdResponse, Error, PublishAdPayload>({
    mutationFn: (payload) => publishAd(payload),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Ad successfully published to Meta!");
      } else {
        toast.error(data.message || "Meta rejected the ad");
      }
    },
    onError: (error) => {
      toastMetaError(error, "Failed to publish ad");
    },
  });
};

// ==================== ASYNC PUBLISH HOOKS ====================

// Submits a publish job to the async queue. The mutation resolves with the
// jobId; callers then pass that to useJobStatus to poll until terminal.
// No toast on success here ΓÇö the publishing UI in Step 4 communicates state.
// A failure on the submit itself (validation, 5xx) still toasts so the user
// knows something went wrong before polling even started.
export const useSubmitPublishJob = () => {
  return useMutation<
    { jobId: number; state: PublishJobState },
    Error,
    { payload: PublishAdPayload; idempotencyKey: string }
  >({
    mutationFn: ({ payload, idempotencyKey }) =>
      submitPublishJob({ ...payload, idempotencyKey }),
    onError: (error) => {
      toastMetaError(error, "Failed to submit publish job");
    },
  });
};

// Polls GET /jobs/:jobId on the backend's recommended cadence (`pollAfter`),
// falling back to 3s if absent. Stops polling once the job reaches a terminal
// state (PUBLISHED / FAILED / PARTIAL / NEEDS_REVIEW).
//
// Pass jobId=null to disable. The hook tolerates that and won't fire requests.
export const useJobStatus = (jobId: number | null) => {
  return useQuery<PublishJob, Error>({
    queryKey: ["meta-publish-job", jobId],
    queryFn: () => getPublishJobStatus(jobId as number),
    enabled: jobId !== null,
    // React-query's refetchInterval can be a function ΓÇö return `false` to
    // stop. We read the last seen state to decide.
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      if (state && TERMINAL_JOB_STATES.has(state)) {
        return false;
      }
      // Respect backend's hint, clamp to [1s, 10s] to avoid runaway polling.
      const hint = query.state.data?.pollAfter ?? 3000;
      return Math.max(1000, Math.min(hint, 10_000));
    },
    // Always refetch on focus when actively polling ΓÇö if the user backgrounded
    // the tab during a 30s publish, they want fresh state on return.
    refetchOnWindowFocus: true,
    // No retry ΓÇö if the polling endpoint 500s, surface it; we shouldn't keep
    // spinning indefinitely on a dead jobs API.
    retry: 1,
    staleTime: 0,
  });
};

// ==================== PR H ΓÇö HIERARCHY CRUD HOOKS ====================

// Helper that invalidates everything affected by an ad-set or ad mutation:
// campaign list, hierarchical detail, and insights summaries.
const invalidateAfterHierarchyMutation = (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  ["meta-ads-campaigns", "meta-ads-summary", "meta-ads-meta", "meta-ads-trends"].forEach(
    (k) => queryClient.invalidateQueries({ queryKey: [k] })
  );
  queryClient.invalidateQueries({ queryKey: ["meta-ads-manager", "campaign-details"] });
};

// --- AdSet
export const useUpdateAdSet = () => {
  const qc = useQueryClient();
  return useMutation<
    { success: boolean },
    Error,
    { adSetId: string; payload: AdSetPatch; clientId: number }
  >({
    mutationFn: ({ adSetId, payload, clientId }) => updateAdSet(adSetId, payload, clientId),
    onSuccess: () => {
      invalidateAfterHierarchyMutation(qc);
      toast.success("Ad set updated");
    },
    onError: (e) => toastMetaError(e, "Failed to update ad set"),
  });
};

export const useDeleteAdSet = () => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean }, Error, { adSetId: string; clientId: number }>({
    mutationFn: ({ adSetId, clientId }) => deleteAdSet(adSetId, clientId),
    onSuccess: () => {
      invalidateAfterHierarchyMutation(qc);
      toast.success("Ad set deleted");
    },
    onError: (e) => toastMetaError(e, "Failed to delete ad set"),
  });
};

export const useDuplicateAdSet = () => {
  const qc = useQueryClient();
  return useMutation<
    { id: string },
    Error,
    { adSetId: string; clientId: number; deep?: boolean }
  >({
    mutationFn: ({ adSetId, clientId, deep = true }) =>
      duplicateAdSet(adSetId, clientId, deep),
    onSuccess: () => {
      invalidateAfterHierarchyMutation(qc);
      toast.success("Ad set duplicated");
    },
    onError: (e) => toastMetaError(e, "Failed to duplicate ad set"),
  });
};

export const useAddAdSet = () => {
  const qc = useQueryClient();
  return useMutation<
    { id: string },
    Error,
    { campaignId: string; payload: AdSetPatch & { name: string }; clientId: number }
  >({
    mutationFn: ({ campaignId, payload, clientId }) =>
      addAdSetToCampaign(campaignId, payload, clientId),
    onSuccess: () => {
      invalidateAfterHierarchyMutation(qc);
      toast.success("Ad set added");
    },
    onError: (e) => toastMetaError(e, "Failed to add ad set"),
  });
};

// --- Ad
export const useUpdateAd = () => {
  const qc = useQueryClient();
  return useMutation<
    { success: boolean },
    Error,
    { adId: string; payload: AdPatch; clientId: number }
  >({
    mutationFn: ({ adId, payload, clientId }) => updateAd(adId, payload, clientId),
    onSuccess: () => {
      invalidateAfterHierarchyMutation(qc);
      toast.success("Ad updated");
    },
    onError: (e) => toastMetaError(e, "Failed to update ad"),
  });
};

export const useDeleteAd = () => {
  const qc = useQueryClient();
  return useMutation<{ success: boolean }, Error, { adId: string; clientId: number }>({
    mutationFn: ({ adId, clientId }) => deleteAd(adId, clientId),
    onSuccess: () => {
      invalidateAfterHierarchyMutation(qc);
      toast.success("Ad deleted");
    },
    onError: (e) => toastMetaError(e, "Failed to delete ad"),
  });
};

export const useDuplicateAd = () => {
  const qc = useQueryClient();
  return useMutation<{ id: string }, Error, { adId: string; clientId: number }>({
    mutationFn: ({ adId, clientId }) => duplicateAd(adId, clientId),
    onSuccess: () => {
      invalidateAfterHierarchyMutation(qc);
      toast.success("Ad duplicated");
    },
    onError: (e) => toastMetaError(e, "Failed to duplicate ad"),
  });
};

export const useAddAd = () => {
  const qc = useQueryClient();
  return useMutation<
    { id: string },
    Error,
    { adSetId: string; payload: AdPatch & { name: string }; clientId: number }
  >({
    mutationFn: ({ adSetId, payload, clientId }) =>
      addAdToAdSet(adSetId, payload, clientId),
    onSuccess: () => {
      invalidateAfterHierarchyMutation(qc);
      toast.success("Ad added");
    },
    onError: (e) => toastMetaError(e, "Failed to add ad"),
  });
};

// --- Campaign hard-delete
export const useHardDeleteCampaign = () => {
  const qc = useQueryClient();
  return useMutation<
    { success: boolean },
    Error,
    { campaignId: string; clientId: number }
  >({
    mutationFn: ({ campaignId, clientId }) => hardDeleteCampaign(campaignId, clientId),
    onSuccess: () => {
      invalidateAfterHierarchyMutation(qc);
      toast.success("Campaign deleted permanently");
    },
    onError: (e) => toastMetaError(e, "Failed to delete campaign"),
  });
};

// --- Submit draft for approval
export const useSubmitForApproval = () => {
  const qc = useQueryClient();
  return useMutation<
    { success: boolean },
    Error,
    { campaignId: string; clientId: number }
  >({
    mutationFn: ({ campaignId, clientId }) => submitForApproval(campaignId, clientId),
    onSuccess: (_, { clientId }) => {
      // Drafts list lives under meta-admin keyspace.
      qc.invalidateQueries({ queryKey: ["meta-admin", "drafts", clientId] });
      toast.success("Submitted for approval");
    },
    onError: (e) => toastMetaError(e, "Failed to submit for approval"),
  });
};

// --- Bulk import
export const useBulkOperations = () => {
  const qc = useQueryClient();
  return useMutation<BulkResponse, Error, { rows: BulkRow[]; clientId: number }>({
    mutationFn: ({ rows, clientId }) => bulkOperations(rows, clientId),
    onSuccess: (data) => {
      invalidateAfterHierarchyMutation(qc);
      const failed = data.results.filter((r) => r.error);
      if (failed.length === 0) {
        toast.success(`Bulk import complete ΓÇö ${data.results.length} rows processed`);
      } else {
        toast.error(
          `Bulk import: ${data.results.length - failed.length} succeeded, ${failed.length} failed`
        );
      }
    },
    onError: (e) => toastMetaError(e, "Bulk import failed"),
  });
};

// ==================== PR L ΓÇö PICKER HOOKS ====================
//
// The new /meta-campaign-wizard picker endpoints. Custom + saved audiences
// are scoped by `accountId` (Meta's act_*); pages are user-scoped.
// All three power dropdowns in the wizard and rarely change ΓåÆ long staleTime.

export const useCustomAudiencesPicker = (
  accountId: string | null,
  clientId: number | null
) => {
  return useQuery<CustomAudiencePicker[], Error>({
    queryKey: ["meta-campaign-wizard", "custom-audiences", accountId, clientId],
    queryFn: () =>
      listCustomAudiencesPicker(accountId as string, {
        clientId: clientId ?? undefined,
        limit: 100,
      }),
    enabled: !!accountId,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useSavedAudiencesPicker = (
  accountId: string | null,
  clientId: number | null
) => {
  return useQuery<SavedAudiencePicker[], Error>({
    queryKey: ["meta-campaign-wizard", "saved-audiences", accountId, clientId],
    queryFn: () =>
      listSavedAudiencesPicker(accountId as string, {
        clientId: clientId ?? undefined,
        limit: 100,
      }),
    enabled: !!accountId,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useAdsManagerPages = (clientId: number | null) => {
  return useQuery<AdsManagerPage[], Error>({
    queryKey: ["meta-campaign-wizard", "pages", clientId],
    queryFn: () => listAdsManagerPages({ clientId: clientId ?? undefined }),
    // Enabled even without clientId ΓÇö backend defaults to the JWT user's pages.
    enabled: true,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
