import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  enableCampaign,
  pauseCampaign,
  removeCampaign,
  duplicateCampaign,
  updateCampaignBudget,
  listAdGroups,
  getAdGroup,
  createAdGroup,
  updateAdGroup,
  removeAdGroup,
  enableAdGroup,
  pauseAdGroup,
  listAds,
  createResponsiveSearchAd,
  enableAd,
  pauseAd,
  updateAd,
  removeAd,
  listKeywords,
  addKeywords,
  updateKeyword,
  removeKeyword,
  createUserList,
  excludeAudienceFromCampaign,
  excludeAudienceFromAdGroup,
  listNegativeKeywords,
  addNegativeKeywords,
  removeNegativeKeyword,
  listSearchTerms,
  assignAssetToCampaign,
  removeAssetFromCampaign,
  assignAssetToAdGroup,
  removeAssetFromAdGroup,
  listBiddingStrategies,
  createBiddingStrategy,
  updateBiddingStrategy,
  deleteBiddingStrategy,
  assignCampaignBiddingStrategy,
  listSharedBudgets,
  createSharedBudget,
  updateSharedBudget,
  deleteSharedBudget,
  assignCampaignSharedBudget,
  createOfflineUserDataJob,
  getChangeHistory,
  listCampaignDrafts,
  createCampaignDraft,
  promoteCampaignDraft,
  removeCampaignDraft,
  listExperiments,
  createExperiment,
  startExperiment,
  stopExperiment,
  promoteExperiment,
  listPlacementExclusionLists,
  createPlacementExclusionList,
  deletePlacementExclusionList,
  listPlacementExclusions,
  addPlacementExclusions,
  removePlacementExclusion,
  assignCampaignPlacementExclusionList,
  removeCampaignPlacementExclusionList,
  listAssetGroups,
  createAssetGroup,
  updateAssetGroup,
  removeAssetGroup
} from "../API/campaignManagementApi";
import * as api from "../API/campaignManagementApi";
import type {
  CampaignFilterParams,
  MutateCampaignPayload,
  MutateAdGroupPayload,
  AddKeywordsPayload,
  AddNegativeKeywordsPayload,
  MutateKeywordPayload,
  DateRange,
  CreateAssetPayload,
  CreateCampaignPayload,
} from "../types/googleAds.types";

// ─────────────────────────────────────────────────────────────
// QUERY KEYS
// ─────────────────────────────────────────────────────────────

export const googleAdsKeys = {
  all: ["google-ads"] as const,
  campaigns: (clientId: number) => ["google-ads", "campaigns", clientId] as const,
  campaignsFiltered: (clientId: number, filters: CampaignFilterParams) =>
    ["google-ads", "campaigns", clientId, filters] as const,
  campaign: (clientId: number, campaignId: string) =>
    ["google-ads", "campaign", clientId, campaignId] as const,
  adGroups: (clientId: number, campaignId: string) =>
    ["google-ads", "ad-groups", clientId, campaignId] as const,
  adGroup: (clientId: number, adGroupId: string) =>
    ["google-ads", "ad-group", clientId, adGroupId] as const,
  ads: (clientId: number, adGroupId: string) =>
    ["google-ads", "ads", clientId, adGroupId] as const,
  keywords: (clientId: number, params: object) =>
    ["google-ads", "keywords", clientId, params] as const,
  negativeKeywords: (clientId: number, params: object) =>
    ["google-ads", "negative-keywords", clientId, params] as const,
  searchTerms: (clientId: number, params: object) =>
    ["google-ads", "search-terms", clientId, params] as const,
  biddingStrategies: (clientId: number) =>
    ["google-ads", "bidding-strategies", clientId] as const,
};

// ─────────────────────────────────────────────────────────────
// CAMPAIGNS
// ─────────────────────────────────────────────────────────────

export const useCampaigns = (clientId: number, filters?: CampaignFilterParams) =>
  useQuery({
    queryKey: googleAdsKeys.campaignsFiltered(clientId, filters ?? {}),
    queryFn: () => listCampaigns(clientId, filters),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

export const useCampaign = (clientId: number, campaignId: string) =>
  useQuery({
    queryKey: googleAdsKeys.campaign(clientId, campaignId),
    queryFn: () => getCampaign(clientId, campaignId),
    enabled: !!clientId && !!campaignId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

export const useCreateCampaign = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) => createCampaign(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: googleAdsKeys.campaigns(clientId),
      });
      toast.success("Campaign created successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create campaign");
    },
  });
};

export const useUpdateCampaign = (clientId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      payload,
    }: {
      campaignId: string;
      payload: MutateCampaignPayload;
    }) => updateCampaign(clientId, campaignId, payload),
    onSuccess: (_data, vars) => {
      toast.success("Campaign updated");
      qc.invalidateQueries({ queryKey: googleAdsKeys.campaigns(clientId) });
      qc.invalidateQueries({
        queryKey: googleAdsKeys.campaign(clientId, vars.campaignId),
      });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update campaign"),
  });
};

export const useEnableCampaign = (clientId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => enableCampaign(clientId, campaignId),
    onSuccess: () => {
      toast.success("Campaign enabled");
      qc.invalidateQueries({ queryKey: googleAdsKeys.campaigns(clientId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to enable campaign"),
  });
};

export const usePauseCampaign = (clientId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => pauseCampaign(clientId, campaignId),
    onSuccess: () => {
      toast.success("Campaign paused");
      qc.invalidateQueries({ queryKey: googleAdsKeys.campaigns(clientId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to pause campaign"),
  });
};

export const useRemoveCampaign = (clientId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => removeCampaign(clientId, campaignId),
    onSuccess: () => {
      toast.success("Campaign removed");
      qc.invalidateQueries({ queryKey: googleAdsKeys.campaigns(clientId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to remove campaign"),
  });
};

export const useDuplicateCampaign = (clientId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => duplicateCampaign(clientId, campaignId),
    onSuccess: () => {
      toast.success("Campaign duplicated");
      qc.invalidateQueries({ queryKey: googleAdsKeys.campaigns(clientId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to duplicate campaign"),
  });
};

export const useUpdateCampaignBudget = (clientId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { campaignId: string; budgetAmountMicros: number }) => updateCampaignBudget(clientId, data.campaignId, data.budgetAmountMicros),
    onSuccess: () => {
      toast.success("Campaign budget updated");
      qc.invalidateQueries({ queryKey: googleAdsKeys.campaigns(clientId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update campaign budget"),
  });
};

// ─────────────────────────────────────────────────────────────
// AD GROUPS
// ─────────────────────────────────────────────────────────────

export const useAdGroups = (clientId: number, campaignId: string, dateRange?: DateRange) =>
  useQuery({
    queryKey: googleAdsKeys.adGroups(clientId, campaignId),
    queryFn: () => listAdGroups(clientId, campaignId, dateRange),
    enabled: !!clientId && !!campaignId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

export const useAdGroup = (clientId: number, adGroupId: string) =>
  useQuery({
    queryKey: googleAdsKeys.adGroup(clientId, adGroupId),
    queryFn: () => getAdGroup(clientId, adGroupId),
    enabled: !!clientId && !!adGroupId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

export const useCreateAdGroup = (clientId: number, campaignId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MutateAdGroupPayload) =>
      createAdGroup(clientId, campaignId, payload),
    onSuccess: () => {
      toast.success("Ad group created");
      qc.invalidateQueries({ queryKey: googleAdsKeys.adGroups(clientId, campaignId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to create ad group"),
  });
};

export const useUpdateAdGroup = (clientId: number, campaignId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      adGroupId,
      payload,
    }: {
      adGroupId: string;
      payload: MutateAdGroupPayload;
    }) => updateAdGroup(clientId, adGroupId, payload),
    onSuccess: (_data, vars) => {
      toast.success("Ad group updated");
      qc.invalidateQueries({ queryKey: googleAdsKeys.adGroups(clientId, campaignId) });
      qc.invalidateQueries({ queryKey: googleAdsKeys.adGroup(clientId, vars.adGroupId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update ad group"),
  });
};

export const useRemoveAdGroup = (clientId: number, campaignId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (adGroupId: string) => removeAdGroup(clientId, adGroupId),
    onSuccess: () => {
      toast.success("Ad group removed");
      qc.invalidateQueries({ queryKey: googleAdsKeys.adGroups(clientId, campaignId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to remove ad group"),
  });
};

export const useEnableAdGroup = (clientId: number, campaignId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (adGroupId: string) => enableAdGroup(clientId, adGroupId),
    onSuccess: () => {
      toast.success("Ad group enabled");
      qc.invalidateQueries({ queryKey: googleAdsKeys.adGroups(clientId, campaignId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to enable ad group"),
  });
};

export const usePauseAdGroup = (clientId: number, campaignId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (adGroupId: string) => pauseAdGroup(clientId, adGroupId),
    onSuccess: () => {
      toast.success("Ad group paused");
      qc.invalidateQueries({ queryKey: googleAdsKeys.adGroups(clientId, campaignId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to pause ad group"),
  });
};

// ─────────────────────────────────────────────────────────────
// ADS
// ─────────────────────────────────────────────────────────────

export const useAds = (clientId: number, adGroupId: string, dateRange?: DateRange) =>
  useQuery({
    queryKey: googleAdsKeys.ads(clientId, adGroupId),
    queryFn: () => listAds(clientId, adGroupId, dateRange),
    enabled: !!clientId && !!adGroupId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

export const useCreateResponsiveSearchAd = (clientId: number, adGroupId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => createResponsiveSearchAd(clientId, adGroupId, payload),
    onSuccess: () => {
      toast.success("Responsive search ad created");
      qc.invalidateQueries({ queryKey: googleAdsKeys.ads(clientId, adGroupId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to create ad"),
  });
};

export const useEnableAd = (clientId: number, adGroupId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (adId: string) => enableAd(clientId, adId),
    onSuccess: () => {
      toast.success("Ad enabled");
      qc.invalidateQueries({ queryKey: googleAdsKeys.ads(clientId, adGroupId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to enable ad"),
  });
};

export const usePauseAd = (clientId: number, adGroupId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (adId: string) => pauseAd(clientId, adId),
    onSuccess: () => {
      toast.success("Ad paused");
      qc.invalidateQueries({ queryKey: googleAdsKeys.ads(clientId, adGroupId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to pause ad"),
  });
};

export const useUpdateAd = (clientId: number, adGroupId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ adId, status }: { adId: string; status: "ENABLED" | "PAUSED" }) =>
      updateAd(clientId, adId, { status }),
    onSuccess: () => {
      toast.success("Ad updated");
      qc.invalidateQueries({ queryKey: googleAdsKeys.ads(clientId, adGroupId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update ad"),
  });
};

export const useRemoveAd = (clientId: number, adGroupId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (adId: string) => removeAd(clientId, adId),
    onSuccess: () => {
      toast.success("Ad removed");
      qc.invalidateQueries({ queryKey: googleAdsKeys.ads(clientId, adGroupId) });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to remove ad"),
  });
};

// ─────────────────────────────────────────────────────────────
// KEYWORDS
// ─────────────────────────────────────────────────────────────

export const useKeywords = (
  clientId: number,
  params: { campaignId?: string; adGroupId?: string } & Partial<DateRange>
) =>
  useQuery({
    queryKey: googleAdsKeys.keywords(clientId, params),
    queryFn: () => listKeywords(clientId, params),
    enabled: !!clientId && (!!params.campaignId || !!params.adGroupId),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

export const useAddKeywords = (clientId: number, adGroupId: string, _campaignId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddKeywordsPayload) =>
      addKeywords(clientId, adGroupId, payload),
    onSuccess: () => {
      toast.success("Keywords added");
      qc.invalidateQueries({ queryKey: ["google-ads", "keywords", clientId] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to add keywords"),
  });
};

export const useUpdateKeyword = (clientId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      keywordId,
      payload,
    }: {
      keywordId: string;
      payload: MutateKeywordPayload;
    }) => updateKeyword(clientId, keywordId, payload),
    onSuccess: () => {
      toast.success("Keyword updated");
      qc.invalidateQueries({ queryKey: ["google-ads", "keywords", clientId] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update keyword"),
  });
};

export const useRemoveKeyword = (clientId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (keywordId: string) => removeKeyword(clientId, keywordId),
    onSuccess: () => {
      toast.success("Keyword removed");
      qc.invalidateQueries({ queryKey: ["google-ads", "keywords", clientId] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to remove keyword"),
  });
};

// ─────────────────────────────────────────────────────────────
// NEGATIVE KEYWORDS
// ─────────────────────────────────────────────────────────────

export const useNegativeKeywords = (
  clientId: number,
  params?: { campaignId?: string; adGroupId?: string }
) =>
  useQuery({
    queryKey: googleAdsKeys.negativeKeywords(clientId, params ?? {}),
    queryFn: () => listNegativeKeywords(clientId, params),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

export const useAddNegativeKeywords = (clientId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddNegativeKeywordsPayload) =>
      addNegativeKeywords(clientId, payload),
    onSuccess: () => {
      toast.success("Negative keywords added");
      qc.invalidateQueries({ queryKey: ["google-ads", "negative-keywords", clientId] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to add negative keywords"),
  });
};

export const useRemoveNegativeKeyword = (clientId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (keywordId: string) => removeNegativeKeyword(clientId, keywordId),
    onSuccess: () => {
      toast.success("Negative keyword removed");
      qc.invalidateQueries({ queryKey: ["google-ads", "negative-keywords", clientId] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to remove negative keyword"),
  });
};

// ─────────────────────────────────────────────────────────────
// SEARCH TERMS
// ─────────────────────────────────────────────────────────────

export const useSearchTerms = (
  clientId: number,
  params: { campaignId?: string; adGroupId?: string } & Partial<DateRange>
) =>
  useQuery({
    queryKey: googleAdsKeys.searchTerms(clientId, params),
    queryFn: () => listSearchTerms(clientId, params),
    enabled: !!clientId && (!!params.campaignId || !!params.adGroupId),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

// ─────────────────────────────────────────────────────────────
// AUDIENCES
// ─────────────────────────────────────────────────────────────

import type {
  AddAudiencePayload,
  ChangeHistoryFilterParams,
  BiddingStrategy,
  SharedBudget
} from "../types/googleAds.types";

export function useAudiences(
  clientId: number,
  params?: { campaignId?: string; adGroupId?: string } & Partial<DateRange>
) {
  return useQuery({
    queryKey: ["google-ads", clientId, "audiences", params],
    queryFn: () => api.listAudiences(clientId, params),
    enabled: !!clientId,
  });
}

export function useAddAudience(clientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddAudiencePayload & { campaignId?: string; adGroupId?: string }) =>
      api.addAudience(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["google-ads", clientId, "audiences"],
      });
      toast.success("Audience added successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to add audience");
    },
  });
}

export function useRemoveAudience(clientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (audienceId: string) => api.removeAudience(clientId, audienceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["google-ads", clientId, "audiences"],
      });
      toast.success("Audience removed successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to remove audience");
    },
  });
}

export function useUpdateAudience(clientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ audienceId, payload }: { audienceId: string; payload: { bidModifier?: number } }) => 
      api.updateAudience(clientId, audienceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["google-ads", clientId, "audiences"],
      });
      toast.success("Audience updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to update audience");
    },
  });
}

export const useCreateUserList = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => createUserList(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["google-ads", clientId, "audiences"],
      });
      toast.success("User list created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to create user list");
    },
  });
};

export const useCreateOfflineUserDataJob = (clientId: number, userListId: string) => {
  return useMutation({
    mutationFn: (payload: { emails?: string[]; phoneNumbers?: string[]; firstNames?: string[]; lastNames?: string[]; countries?: string[]; zipCodes?: string[] }) => 
      createOfflineUserDataJob(clientId, userListId, payload),
    onSuccess: () => {
      toast.success("Customer match data uploaded successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to upload customer match data");
    },
  });
};

export const useExcludeAudienceFromCampaign = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, audienceId }: { campaignId: string; audienceId: string }) =>
      excludeAudienceFromCampaign(clientId, campaignId, { audienceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["google-ads", clientId, "audiences"],
      });
      toast.success("Audience excluded from campaign");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to exclude audience");
    },
  });
};

export const useExcludeAudienceFromAdGroup = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adGroupId, audienceId }: { adGroupId: string; audienceId: string }) =>
      excludeAudienceFromAdGroup(clientId, adGroupId, { audienceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["google-ads", clientId, "audiences"],
      });
      toast.success("Audience excluded from ad group");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to exclude audience");
    },
  });
};

// ─────────────────────────────────────────────────────────────
// ASSETS
// ─────────────────────────────────────────────────────────────

export function useAssets(
  clientId: number,
  params?: { type?: string; campaignId?: string; adGroupId?: string }
) {
  return useQuery({
    queryKey: ["google-ads", clientId, "assets", params],
    queryFn: () => api.listAssets(clientId, params),
    enabled: !!clientId,
  });
}

export function useCreateAsset(clientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAssetPayload) => api.createAsset(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["google-ads", clientId, "assets"],
      });
      toast.success("Asset created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to create asset");
    },
  });
}

export function useRemoveAsset(clientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => api.removeAsset(clientId, assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["google-ads", clientId, "assets"],
      });
      toast.success("Asset removed successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to remove asset");
    },
  });
}

// ─────────────────────────────────────────────────────────────
// RECOMMENDATIONS
// ─────────────────────────────────────────────────────────────

export function useRecommendations(
  clientId: number,
  params?: { campaignId?: string }
) {
  return useQuery({
    queryKey: ["google-ads", clientId, "recommendations", params],
    queryFn: () => api.listRecommendations(clientId, params),
    enabled: !!clientId,
  });
}

export function useApplyRecommendation(clientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recommendationId: string) => api.applyRecommendation(clientId, recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["google-ads", clientId, "recommendations"],
      });
      toast.success("Recommendation applied successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to apply recommendation");
    },
  });
}

export function useDismissRecommendation(clientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recommendationId: string) => api.dismissRecommendation(clientId, recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["google-ads", clientId, "recommendations"],
      });
      toast.success("Recommendation dismissed");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to dismiss recommendation");
    },
  });
}

// ─────────────────────────────────────────────────────────────
// CONVERSIONS
// ─────────────────────────────────────────────────────────────

import type { MutateConversionActionPayload } from "../types/googleAds.types";

export function useConversionActions(clientId: number) {
  return useQuery({
    queryKey: ["google-ads", clientId, "conversion-actions"],
    queryFn: () => api.listConversionActions(clientId),
    enabled: !!clientId,
  });
}

export function useCreateConversionAction(clientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MutateConversionActionPayload & { type: string }) =>
      api.createConversionAction(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["google-ads", clientId, "conversion-actions"],
      });
      toast.success("Conversion action created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to create conversion action");
    },
  });
}

export function useUpdateConversionAction(clientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MutateConversionActionPayload }) =>
      api.updateConversionAction(clientId, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["google-ads", clientId, "conversion-actions"],
      });
      toast.success("Conversion action updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to update conversion action");
    },
  });
}

export function useRemoveConversionAction(clientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.removeConversionAction(clientId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["google-ads", clientId, "conversion-actions"],
      });
      toast.success("Conversion action removed successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to remove conversion action");
    },
  });
}

// ─────────────────────────────────────────────────────────────
// CHANGE HISTORY
// ─────────────────────────────────────────────────────────────

export function useChangeHistory(clientId: number, params?: ChangeHistoryFilterParams) {
  return useQuery({
    queryKey: ["google-ads", clientId, "change-history", params],
    queryFn: () => getChangeHistory(clientId, params),
  });
}

// ─────────────────────────────────────────────────────────────
// REPORTING / GAQL
// ─────────────────────────────────────────────────────────────

export function useRunGaqlQuery(clientId: number) {
  return useMutation({
    mutationFn: (query: string) => api.runGaqlQuery(clientId, query),
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to run report query");
    },
  });
}

export function useSavedReports(clientId: number) {
  return useQuery({
    queryKey: ["google-ads", clientId, "reports", "saved"],
    queryFn: () => api.listSavedReports(clientId),
    enabled: !!clientId,
  });
}

// ─────────────────────────────────────────────────────────────
// MCC / ACCOUNT HIERARCHY
// ─────────────────────────────────────────────────────────────

export function useAccessibleCustomers() {
  return useQuery({
    queryKey: ["google-ads", "customers"],
    queryFn: () => api.listAccessibleCustomers(),
  });
}

export function useCustomerHierarchy(clientId: number) {
  return useQuery({
    queryKey: ["google-ads", clientId, "hierarchy"],
    queryFn: () => api.getCustomerHierarchy(clientId),
    enabled: !!clientId,
  });
}

// ─────────────────────────────────────────────────────────────
// SHARED LIBRARY (SHARED SETS & CRITERIA)
// ─────────────────────────────────────────────────────────────

export function useSharedSets(clientId: number) {
  return useQuery({
    queryKey: ["google-ads", clientId, "shared-sets"],
    queryFn: () => api.listSharedSets(clientId),
    enabled: !!clientId,
  });
}

export function useCreateSharedSet(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.createSharedSet(clientId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "shared-sets"] });
      toast.success("Negative keyword list created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to create list");
    },
  });
}

export function useDeleteSharedSet(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSharedSet(clientId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "shared-sets"] });
      toast.success("Negative keyword list deleted");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to delete list");
    },
  });
}

export function useSharedCriteria(clientId: number, sharedSetId: string | null) {
  return useQuery({
    queryKey: ["google-ads", clientId, "shared-sets", sharedSetId, "criteria"],
    queryFn: () => api.listSharedCriteria(clientId, sharedSetId!),
    enabled: !!clientId && !!sharedSetId,
  });
}

export function useAddSharedCriteria(clientId: number, sharedSetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keywords: { text: string; matchType: string }[]) => api.addSharedCriteria(clientId, sharedSetId, keywords),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "shared-sets", sharedSetId, "criteria"] });
      toast.success("Keywords added successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to add keywords");
    },
  });
}

export function useDeleteSharedCriterion(clientId: number, sharedSetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (criterionId: string) => api.deleteSharedCriterion(clientId, sharedSetId, criterionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "shared-sets", sharedSetId, "criteria"] });
      toast.success("Keyword removed");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to remove keyword");
    },
  });
}

export function useCampaignSharedSets(clientId: number, sharedSetId: string | null) {
  return useQuery({
    queryKey: ["google-ads", clientId, "shared-sets", sharedSetId, "campaigns"],
    queryFn: () => api.listCampaignSharedSets(clientId, sharedSetId!),
    enabled: !!clientId && !!sharedSetId,
  });
}

export function useAssociateCampaignSharedSet(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { campaignIds: string[]; sharedSetId: string }) => api.associateCampaignSharedSet(clientId, data.sharedSetId, data.campaignIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "shared-sets", variables.sharedSetId, "campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "shared-sets"] });
      toast.success("Campaigns applied successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to apply campaigns");
    },
  });
}

export function useRemoveCampaignSharedSet(clientId: number, sharedSetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => api.removeCampaignSharedSet(clientId, sharedSetId, campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "shared-sets", sharedSetId, "campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "shared-sets"] });
      toast.success("Campaign association removed");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to remove campaign association");
    },
  });
}

// ─────────────────────────────────────────────────────────────
// BILLING & BUDGETS
// ─────────────────────────────────────────────────────────────

export function useBillingSummary(clientId: number) {
  return useQuery({
    queryKey: ["google-ads", clientId, "billing"],
    queryFn: () => api.getBillingSummary(clientId),
    enabled: !!clientId,
  });
}

export function useCreateBudgetProposal(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { billingSetupId: string; name: string; spendingLimitMicros: number; startDateTime: string; endDateTime: string }) => 
      api.createBudgetProposal(clientId, data.billingSetupId, data.name, data.spendingLimitMicros, data.startDateTime, data.endDateTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "billing"] });
      toast.success("Budget proposal submitted for approval");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to submit budget proposal");
    },
  });
}

// ─────────────────────────────────────────────────────────────
// LABELS
// ─────────────────────────────────────────────────────────────

export function useLabels(clientId: number) {
  return useQuery({
    queryKey: ["google-ads", clientId, "labels"],
    queryFn: () => api.listLabels(clientId),
    enabled: !!clientId,
  });
}

export function useCreateLabel(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; backgroundColor: string; description: string }) => 
      api.createLabel(clientId, data.name, data.backgroundColor, data.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "labels"] });
      toast.success("Label created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to create label");
    },
  });
}

export function useUpdateLabel(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { labelId: string; name: string; backgroundColor: string; description: string }) => 
      api.updateLabel(clientId, data.labelId, data.name, data.backgroundColor, data.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "labels"] });
      toast.success("Label updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to update label");
    },
  });
}

export function useDeleteLabel(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => api.deleteLabel(clientId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "labels"] });
      toast.success("Label deleted");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to delete label");
    },
  });
}

export function useAssignLabel(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { labelId: string; entityType: "campaign" | "ad-group" | "ad" | "keyword"; entityId: string }) => 
      api.assignLabelToEntity(clientId, data.labelId, data.entityType, data.entityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId] });
      toast.success("Label applied");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to apply label");
    },
  });
}

export function useRemoveLabel(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { labelId: string; entityType: "campaign" | "ad-group" | "ad" | "keyword"; entityId: string }) => 
      api.removeLabelFromEntity(clientId, data.labelId, data.entityType, data.entityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId] });
      toast.success("Label removed");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to remove label");
    },
  });
}

// ─────────────────────────────────────────────────────────────
// ASSET ASSIGNMENTS
// ─────────────────────────────────────────────────────────────

export const useAssignAssetToCampaign = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, assetId, fieldType }: { campaignId: string; assetId: string; fieldType: string }) =>
      assignAssetToCampaign(clientId, campaignId, { assetId, fieldType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleAdsKeys.campaigns(clientId) });
      toast.success("Asset assigned to campaign");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to assign asset");
    },
  });
};

export const useRemoveAssetFromCampaign = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, assetId }: { campaignId: string; assetId: string }) =>
      removeAssetFromCampaign(clientId, campaignId, assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleAdsKeys.campaigns(clientId) });
      toast.success("Asset removed from campaign");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to remove asset");
    },
  });
};

export const useAssignAssetToAdGroup = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adGroupId, assetId, fieldType }: { adGroupId: string; assetId: string; fieldType: string }) =>
      assignAssetToAdGroup(clientId, adGroupId, { assetId, fieldType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleAdsKeys.campaigns(clientId) }); // Invalidate all, or specific ad groups
      toast.success("Asset assigned to ad group");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to assign asset");
    },
  });
};

export const useRemoveAssetFromAdGroup = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adGroupId, assetId }: { adGroupId: string; assetId: string }) =>
      removeAssetFromAdGroup(clientId, adGroupId, assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleAdsKeys.campaigns(clientId) });
      toast.success("Asset removed from ad group");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to remove asset");
    },
  });
};

// ─────────────────────────────────────────────────────────────
// BIDDING STRATEGIES
// ─────────────────────────────────────────────────────────────

export function useBiddingStrategies(clientId: number) {
  return useQuery({
    queryKey: ["google-ads", clientId, "bidding-strategies"],
    queryFn: () => listBiddingStrategies(clientId),
  });
}

export function useCreateBiddingStrategy(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<BiddingStrategy, "id" | "campaignCount" | "metrics" | "status">) => 
      createBiddingStrategy(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "bidding-strategies"] });
      toast.success("Portfolio bid strategy created successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to create portfolio bid strategy");
    }
  });
}

export function useUpdateBiddingStrategy(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { strategyId: string } & Partial<Omit<BiddingStrategy, "id" | "campaignCount" | "metrics" | "type" | "status">> & { name?: string }) => {
      const { strategyId, ...rest } = data;
      return updateBiddingStrategy(clientId, strategyId, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "bidding-strategies"] });
      toast.success("Portfolio bid strategy updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update portfolio bid strategy");
    }
  });
}

export function useDeleteBiddingStrategy(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (strategyId: string) => deleteBiddingStrategy(clientId, strategyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "bidding-strategies"] });
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "campaigns"] });
      toast.success("Portfolio bid strategy deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to delete portfolio bid strategy");
    }
  });
}

export function useAssignCampaignBiddingStrategy(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { campaignId: string; strategyId: string | null }) => 
      assignCampaignBiddingStrategy(clientId, data.campaignId, data.strategyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "bidding-strategies"] });
      toast.success("Campaign bid strategy updated");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update campaign bid strategy");
    }
  });
}

// ─────────────────────────────────────────────────────────────
// SHARED BUDGETS
// ─────────────────────────────────────────────────────────────

export function useSharedBudgets(clientId: number) {
  return useQuery({
    queryKey: ["google-ads", clientId, "shared-budgets"],
    queryFn: () => listSharedBudgets(clientId),
    enabled: !!clientId,
  });
}

export function useCreateSharedBudget(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<SharedBudget, "id" | "campaignCount" | "status">) => createSharedBudget(clientId, data),
    onSuccess: () => {
      toast.success("Shared budget created");
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "shared-budgets"] });
    },
    onError: (error: Error) => toast.error(`Failed to create shared budget: ${error.message}`),
  });
}

export function useUpdateSharedBudget(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { budgetId: string } & Partial<Omit<SharedBudget, "id" | "campaignCount" | "status">>) => {
      const { budgetId, ...payload } = data;
      return updateSharedBudget(clientId, budgetId, payload);
    },
    onSuccess: () => {
      toast.success("Shared budget updated");
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "shared-budgets"] });
    },
    onError: (error: Error) => toast.error(`Failed to update shared budget: ${error.message}`),
  });
}

export function useDeleteSharedBudget(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (budgetId: string) => deleteSharedBudget(clientId, budgetId),
    onSuccess: () => {
      toast.success("Shared budget deleted");
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "shared-budgets"] });
    },
    onError: (error: Error) => toast.error(`Failed to delete shared budget: ${error.message}`),
  });
}

export function useAssignCampaignSharedBudget(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { campaignId: string; budgetId: string | null }) => 
      assignCampaignSharedBudget(clientId, data.campaignId, data.budgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "shared-budgets"] });
      toast.success("Campaign shared budget updated");
    },
    onError: (error: Error) => toast.error(`Failed to assign shared budget: ${error.message}`)
  });
}

// ─────────────────────────────────────────────────────────────
// DRAFTS
// ─────────────────────────────────────────────────────────────

export const useCampaignDrafts = (clientId: number) => {
  return useQuery({
    queryKey: ["google-ads", clientId, "drafts"],
    queryFn: () => listCampaignDrafts(clientId),
    enabled: !!clientId,
  });
};

export const useCreateCampaignDraft = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { baseCampaignId: string; draftName: string }) => createCampaignDraft(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "drafts"] });
      toast.success("Draft created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to create draft");
    },
  });
};

export const usePromoteCampaignDraft = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => promoteCampaignDraft(clientId, draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "drafts"] });
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "campaigns"] });
      toast.success("Draft promoted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to promote draft");
    },
  });
};

export const useRemoveCampaignDraft = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => removeCampaignDraft(clientId, draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "drafts"] });
      toast.success("Draft removed successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to remove draft");
    },
  });
};

// ─────────────────────────────────────────────────────────────
// EXPERIMENTS
// ─────────────────────────────────────────────────────────────

export const useExperiments = (clientId: number) => {
  return useQuery({
    queryKey: ["google-ads", clientId, "experiments"],
    queryFn: () => listExperiments(clientId),
    enabled: !!clientId,
  });
};

export const useCreateExperiment = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; draftId: string; baseCampaignId: string; trafficSplit: number; startDate?: string; endDate?: string }) => 
      createExperiment(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "experiments"] });
      toast.success("Experiment created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to create experiment");
    },
  });
};

export const useStartExperiment = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (experimentId: string) => startExperiment(clientId, experimentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "experiments"] });
      toast.success("Experiment started");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to start experiment");
    },
  });
};

export const useStopExperiment = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (experimentId: string) => stopExperiment(clientId, experimentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "experiments"] });
      toast.success("Experiment stopped");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to stop experiment");
    },
  });
};

export const usePromoteExperiment = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (experimentId: string) => promoteExperiment(clientId, experimentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "experiments"] });
      queryClient.invalidateQueries({ queryKey: ["google-ads", clientId, "campaigns"] });
      toast.success("Winning arm promoted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to promote experiment");
    },
  });
};

// ─────────────────────────────────────────────────────────────
// PLACEMENT EXCLUSION LISTS (SharedSets)
// ─────────────────────────────────────────────────────────────

export const usePlacementExclusionLists = (clientId: number) => {
  return useQuery({
    queryKey: ["placementExclusionLists", clientId],
    queryFn: () => listPlacementExclusionLists(clientId),
    enabled: !!clientId,
  });
};

export const useCreatePlacementExclusionList = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) => createPlacementExclusionList(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placementExclusionLists", clientId] });
      toast.success("Placement exclusion list created");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to create placement exclusion list");
    },
  });
};

export const useDeletePlacementExclusionList = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => deletePlacementExclusionList(clientId, listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placementExclusionLists", clientId] });
      toast.success("List deleted");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to delete list");
    },
  });
};

export const usePlacementExclusions = (clientId: number, listId: string) => {
  return useQuery({
    queryKey: ["placementExclusions", clientId, listId],
    queryFn: () => listPlacementExclusions(clientId, listId),
    enabled: !!clientId && !!listId,
  });
};

export const useAddPlacementExclusions = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { listId: string; placements: Array<{ placement: string; type: any }> }) =>
      addPlacementExclusions(clientId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["placementExclusions", clientId, variables.listId] });
      queryClient.invalidateQueries({ queryKey: ["placementExclusionLists", clientId] });
      toast.success("Placements added");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to add placements");
    },
  });
};

export const useRemovePlacementExclusion = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, criterionId }: { listId: string; criterionId: string }) =>
      removePlacementExclusion(clientId, listId, criterionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["placementExclusions", clientId, variables.listId] });
      queryClient.invalidateQueries({ queryKey: ["placementExclusionLists", clientId] });
      toast.success("Placement removed");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to remove placement");
    },
  });
};

export const useAssignCampaignPlacementExclusionList = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { listId: string; campaignIds: string[] }) =>
      assignCampaignPlacementExclusionList(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placementExclusionLists", clientId] });
      queryClient.invalidateQueries({ queryKey: ["campaigns", clientId] });
      toast.success("List assigned to campaigns");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to assign list");
    },
  });
};

export const useRemoveCampaignPlacementExclusionList = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { listId: string; campaignId: string }) =>
      removeCampaignPlacementExclusionList(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placementExclusionLists", clientId] });
      queryClient.invalidateQueries({ queryKey: ["campaigns", clientId] });
      toast.success("List removed from campaign");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to remove list");
    },
  });
};

// ─────────────────────────────────────────────────────────────
// ASSET GROUPS (Performance Max)
// ─────────────────────────────────────────────────────────────

export const useAssetGroups = (clientId: number, campaignId?: string) => {
  return useQuery({
    queryKey: ["assetGroups", clientId, campaignId],
    queryFn: () => listAssetGroups(clientId, campaignId),
    enabled: !!clientId,
  });
};

export const useCreateAssetGroup = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => createAssetGroup(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetGroups", clientId] });
      toast.success("Asset group created");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to create asset group");
    },
  });
};

export const useUpdateAssetGroup = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assetGroupId, payload }: { assetGroupId: string; payload: any }) => updateAssetGroup(clientId, assetGroupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetGroups", clientId] });
      toast.success("Asset group updated");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to update asset group");
    },
  });
};

export const useRemoveAssetGroup = (clientId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assetGroupId: string) => removeAssetGroup(clientId, assetGroupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetGroups", clientId] });
      toast.success("Asset group removed");
    },
    onError: (err: any) => {
      toast.error(err.message ?? "Failed to remove asset group");
    },
  });
};
