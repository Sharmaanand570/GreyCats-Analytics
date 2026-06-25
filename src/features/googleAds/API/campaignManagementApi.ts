import api from "@/apiConfig";
import type { AxiosError } from "axios";
import type {
  CampaignsListResponse,
  CreateCampaignPayload,
  CampaignDetailResponse,
  MutateCampaignPayload,
  MutateCampaignResponse,
  CampaignFilterParams,
  AdGroupsListResponse,
  AdGroupDetailResponse,
  MutateAdGroupPayload,
  MutateAdGroupResponse,
  AdsListResponse,
  KeywordsListResponse,
  NegativeKeywordsListResponse,
  AddKeywordsPayload,
  AddNegativeKeywordsPayload,
  MutateKeywordPayload,
  KeywordMutateResponse,
  SearchTermsListResponse,
  DateRange,
  CampaignDraft,
  Experiment,
  ExperimentArm,
  PlacementExclusionListsResponse,
  PlacementExclusionsResponse,
  AssetGroup,
  AssetGroupsListResponse
} from "../types/googleAds.types";

// ─────────────────────────────────────────────────────────────
// ERROR HELPER
// ─────────────────────────────────────────────────────────────

type ApiErr = { message?: string; error?: string };

function extractError(error: unknown, fallback: string): never {
  const e = error as AxiosError<ApiErr>;
  throw new Error(
    e.response?.data?.message ?? e.response?.data?.error ?? fallback
  );
}

// ─────────────────────────────────────────────────────────────
// CAMPAIGNS
// ─────────────────────────────────────────────────────────────

/** GET /api/google-ads/:clientId/campaigns — enhanced with all filter params */
export const listCampaigns = async (
  clientId: number,
  params?: CampaignFilterParams
): Promise<CampaignsListResponse> => {
  try {
    const res = await api.get<CampaignsListResponse>(
      `/google-ads/${clientId}/campaigns`,
      { params }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load campaigns");
  }
};

/** GET /api/google-ads/:clientId/campaigns/:campaignId */
export const getCampaign = async (
  clientId: number,
  campaignId: string
): Promise<CampaignDetailResponse> => {
  try {
    const res = await api.get<CampaignDetailResponse>(
      `/google-ads/${clientId}/campaigns/${campaignId}`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load campaign detail");
  }
};

/** POST /api/google-ads/:clientId/campaigns */
export const createCampaign = async (
  clientId: number,
  payload: CreateCampaignPayload
): Promise<MutateCampaignResponse> => {
  try {
    const res = await api.post<MutateCampaignResponse>(
      `/google-ads/${clientId}/campaigns`,
      payload
    );
    return res.data;
  } catch (e: any) {
    extractError(e, "Failed to create campaign");
  }
};

/** PATCH /api/google-ads/:clientId/campaigns/:campaignId */
export const updateCampaign = async (
  clientId: number,
  campaignId: string,
  payload: MutateCampaignPayload
): Promise<MutateCampaignResponse> => {
  try {
    const res = await api.patch<MutateCampaignResponse>(
      `/google-ads/${clientId}/campaigns/${campaignId}`,
      payload
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to update campaign");
  }
};

/** POST /api/google-ads/:clientId/campaigns/:campaignId/enable */
export const enableCampaign = async (clientId: number, campaignId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(`/google-ads/${clientId}/campaigns/${campaignId}/enable`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to enable campaign");
  }
};

export const pauseCampaign = async (clientId: number, campaignId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(`/google-ads/${clientId}/campaigns/${campaignId}/pause`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to pause campaign");
  }
};

export const removeCampaign = async (clientId: number, campaignId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete<{ success: boolean }>(`/google-ads/${clientId}/campaigns/${campaignId}`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove campaign");
  }
};

import type { PublishCompleteCampaignPayload, PublishTransactionResponse } from "../types/googleAds.types";

/** POST /api/google-ads/publish */
export const publishCompleteCampaign = async (
  clientId: number,
  payload: PublishCompleteCampaignPayload
): Promise<PublishTransactionResponse> => {
  try {
    const res = await api.post<PublishTransactionResponse>(
      `/google-ads/publish`,
      { ...payload, clientId }
    );
    return res.data;
  } catch (e: any) {
    extractError(e, "Failed to publish complete campaign");
  }
};

/** GET /api/google-ads/publish/operation/:operationId */
export const getPublishOperationStatus = async (
  _clientId: number,
  operationId: string
): Promise<PublishTransactionResponse> => {
  try {
    const res = await api.get<PublishTransactionResponse>(
      `/google-ads/publish/operation/${operationId}`
    );
    return res.data;
  } catch (e: any) {
    extractError(e, "Failed to fetch publish operation status");
  }
};

/**
 * Returns the SSE endpoint URL for streaming publish progress.
 * Use new EventSource(getPublishProgressStreamUrl(...)) in components.
 */
export const getPublishProgressStreamUrl = (_clientId: number, operationId: string) => {
  return `/api/google-ads/publish/stream/${operationId}`;
};

export const duplicateCampaign = async (clientId: number, campaignId: string): Promise<{ success: boolean; newCampaignId: string }> => {
  try {
    const res = await api.post<{ success: boolean; newCampaignId: string }>(`/google-ads/${clientId}/campaigns/${campaignId}/duplicate`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to duplicate campaign");
  }
};

export const updateCampaignBudget = async (clientId: number, campaignId: string, budgetAmountMicros: number): Promise<{ success: boolean }> => {
  try {
    const res = await api.patch<{ success: boolean }>(`/google-ads/${clientId}/campaigns/${campaignId}/budget`, {
      amountMicros: budgetAmountMicros
    });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to update campaign budget");
  }
};

// ─────────────────────────────────────────────────────────────
// AD GROUPS
// ─────────────────────────────────────────────────────────────

/** GET /api/google-ads/:clientId/ad-groups?campaignId= */
export const listAdGroups = async (
  clientId: number,
  campaignId: string,
  params?: DateRange
): Promise<AdGroupsListResponse> => {
  try {
    const res = await api.get<AdGroupsListResponse>(
      `/google-ads/${clientId}/ad-groups`,
      { params: { campaignId, ...params } }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load ad groups");
  }
};

/** GET /api/google-ads/:clientId/ad-groups/:adGroupId */
export const getAdGroup = async (
  clientId: number,
  adGroupId: string
): Promise<AdGroupDetailResponse> => {
  try {
    const res = await api.get<AdGroupDetailResponse>(
      `/google-ads/${clientId}/ad-groups/${adGroupId}`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load ad group");
  }
};

/** POST /api/google-ads/:clientId/ad-groups */
export const createAdGroup = async (
  clientId: number,
  campaignId: string,
  payload: MutateAdGroupPayload
): Promise<MutateAdGroupResponse> => {
  try {
    const res = await api.post<MutateAdGroupResponse>(
      `/google-ads/${clientId}/ad-groups`,
      { campaignId, ...payload }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to create ad group");
  }
};

/** PATCH /api/google-ads/:clientId/ad-groups/:adGroupId */
export const updateAdGroup = async (
  clientId: number,
  adGroupId: string,
  payload: MutateAdGroupPayload
): Promise<MutateAdGroupResponse> => {
  try {
    const res = await api.patch<MutateAdGroupResponse>(
      `/google-ads/${clientId}/ad-groups/${adGroupId}`,
      payload
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to update ad group");
  }
};

export const enableAdGroup = async (clientId: number, adGroupId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(`/google-ads/${clientId}/ad-groups/${adGroupId}/enable`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to enable ad group");
  }
};

export const pauseAdGroup = async (clientId: number, adGroupId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(`/google-ads/${clientId}/ad-groups/${adGroupId}/pause`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to pause ad group");
  }
};

/** DELETE /api/google-ads/:clientId/ad-groups/:adGroupId */
export const removeAdGroup = async (
  clientId: number,
  adGroupId: string
): Promise<MutateAdGroupResponse> => {
  try {
    const res = await api.delete<MutateAdGroupResponse>(
      `/google-ads/${clientId}/ad-groups/${adGroupId}`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove ad group");
  }
};

// ─────────────────────────────────────────────────────────────
// ADS
// ─────────────────────────────────────────────────────────────

/** GET /api/google-ads/:clientId/ads?adGroupId= */
export const listAds = async (
  clientId: number,
  adGroupId: string,
  params?: DateRange
): Promise<AdsListResponse> => {
  try {
    const res = await api.get<AdsListResponse>(
      `/google-ads/${clientId}/ads`,
      { params: { adGroupId, ...params } }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load ads");
  }
};

export const createResponsiveSearchAd = async (clientId: number, adGroupId: string, payload: any): Promise<{ success: boolean; adId: string }> => {
  try {
    const res = await api.post<{ success: boolean; adId: string }>(`/google-ads/${clientId}/ads/rsa`, { adGroupId, ...payload });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to create RSA ad");
  }
};

export const enableAd = async (clientId: number, adId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(`/google-ads/${clientId}/ads/${adId}/enable`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to enable ad");
  }
};

export const pauseAd = async (clientId: number, adId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(`/google-ads/${clientId}/ads/${adId}/pause`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to pause ad");
  }
};

/** PATCH /api/google-ads/:clientId/ads/:adId */
export const updateAd = async (
  clientId: number,
  adId: string,
  payload: { status?: "ENABLED" | "PAUSED" }
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.patch<{ success: boolean; message: string }>(
      `/google-ads/${clientId}/ads/${adId}`,
      payload
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to update ad");
  }
};

/** DELETE /api/google-ads/:clientId/ads/:adId */
export const removeAd = async (
  clientId: number,
  adId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/google-ads/${clientId}/ads/${adId}`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove ad");
  }
};

// ─────────────────────────────────────────────────────────────
// KEYWORDS
// ─────────────────────────────────────────────────────────────

/** GET /api/google-ads/:clientId/keywords?campaignId= */
export const listKeywords = async (
  clientId: number,
  params: { campaignId?: string; adGroupId?: string } & Partial<DateRange>
): Promise<KeywordsListResponse> => {
  try {
    const res = await api.get<KeywordsListResponse>(
      `/google-ads/${clientId}/keywords`,
      { params }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load keywords");
  }
};

/** POST /api/google-ads/:clientId/keywords (bulk) */
export const addKeywords = async (
  clientId: number,
  adGroupId: string,
  payload: AddKeywordsPayload
): Promise<KeywordMutateResponse> => {
  try {
    const res = await api.post<KeywordMutateResponse>(
      `/google-ads/${clientId}/keywords`,
      { adGroupId, ...payload }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to add keywords");
  }
};

/** PATCH /api/google-ads/:clientId/keywords/:keywordId */
export const updateKeyword = async (
  clientId: number,
  keywordId: string,
  payload: MutateKeywordPayload
): Promise<KeywordMutateResponse> => {
  try {
    const res = await api.patch<KeywordMutateResponse>(
      `/google-ads/${clientId}/keywords/${keywordId}`,
      payload
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to update keyword");
  }
};

/** DELETE /api/google-ads/:clientId/keywords/:keywordId */
export const removeKeyword = async (
  clientId: number,
  keywordId: string
): Promise<KeywordMutateResponse> => {
  try {
    const res = await api.delete<KeywordMutateResponse>(
      `/google-ads/${clientId}/keywords/${keywordId}`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove keyword");
  }
};

// ─────────────────────────────────────────────────────────────
// NEGATIVE KEYWORDS
// ─────────────────────────────────────────────────────────────

/** GET /api/google-ads/:clientId/negative-keywords */
export const listNegativeKeywords = async (
  clientId: number,
  params?: { campaignId?: string; adGroupId?: string }
): Promise<NegativeKeywordsListResponse> => {
  try {
    const res = await api.get<NegativeKeywordsListResponse>(
      `/google-ads/${clientId}/negative-keywords`,
      { params }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load negative keywords");
  }
};

/** POST /api/google-ads/:clientId/negative-keywords */
export const addNegativeKeywords = async (
  clientId: number,
  payload: AddNegativeKeywordsPayload
): Promise<KeywordMutateResponse> => {
  try {
    const res = await api.post<KeywordMutateResponse>(
      `/google-ads/${clientId}/negative-keywords`,
      payload
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to add negative keywords");
  }
};

/** DELETE /api/google-ads/:clientId/negative-keywords/:id */
export const removeNegativeKeyword = async (
  clientId: number,
  keywordId: string
): Promise<KeywordMutateResponse> => {
  try {
    const res = await api.delete<KeywordMutateResponse>(
      `/google-ads/${clientId}/negative-keywords/${keywordId}`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove negative keyword");
  }
};

// ─────────────────────────────────────────────────────────────
// SEARCH TERMS
// ─────────────────────────────────────────────────────────────

/** GET /api/google-ads/:clientId/performance/search-terms */
export const listSearchTerms = async (
  clientId: number,
  params: { campaignId?: string; adGroupId?: string } & Partial<DateRange>
): Promise<SearchTermsListResponse> => {
  try {
    const res = await api.get<SearchTermsListResponse>(
      `/google-ads/${clientId}/performance/search-terms`,
      { params }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load search terms");
  }
};

// ─────────────────────────────────────────────────────────────
// AUDIENCES
// ─────────────────────────────────────────────────────────────

import type { AudiencesListResponse, AddAudiencePayload } from "../types/googleAds.types";

/** GET /api/google-ads/:clientId/audiences */
export const listAudiences = async (
  clientId: number,
  params?: { campaignId?: string; adGroupId?: string } & Partial<DateRange>
): Promise<AudiencesListResponse> => {
  try {
    const res = await api.get<AudiencesListResponse>(
      `/google-ads/${clientId}/audiences`,
      { params }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load audiences");
  }
};

/** POST /api/google-ads/:clientId/audiences */
export const createUserList = async (
  clientId: number,
  payload: { name: string; description?: string; membershipLifeSpan?: number; type: "REMARKETING" | "CUSTOM_AFFINITY" | "CUSTOM_INTENT" | "CUSTOMER_MATCH" }
): Promise<{ success: boolean; message: string; userListId?: string }> => {
  try {
    const res = await api.post<{ success: boolean; message: string; userListId?: string }>(
      `/google-ads/${clientId}/audiences`,
      payload
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to create user list");
  }
};

/** POST /api/google-ads/:clientId/audiences/:userListId/offline-user-data-job */
export const createOfflineUserDataJob = async (
  clientId: number,
  userListId: string,
  payload: { emails?: string[]; phoneNumbers?: string[]; firstNames?: string[]; lastNames?: string[]; countries?: string[]; zipCodes?: string[] }
): Promise<{ success: boolean; message: string; jobId?: string }> => {
  try {
    const res = await api.post<{ success: boolean; message: string; jobId?: string }>(
      `/google-ads/${clientId}/audiences/${userListId}/offline-user-data-job`,
      payload
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to upload customer match data");
  }
};

/** POST /api/google-ads/:clientId/audiences/apply */
export const addAudience = async (
  clientId: number,
  payload: AddAudiencePayload & { campaignId?: string; adGroupId?: string }
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.post<{ success: boolean; message: string }>(
      `/google-ads/${clientId}/audiences/apply`,
      payload
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to add audience");
  }
};

/** PATCH /api/google-ads/:clientId/audiences/:id */
export const updateAudience = async (
  clientId: number,
  audienceId: string,
  payload: { bidModifier?: number }
): Promise<AssetMutateResponse> => {
  try {
    const res = await api.patch<AssetMutateResponse>(
      `/google-ads/${clientId}/audiences/${audienceId}`,
      payload
    );
    return res.data;
  } catch (e: any) {
    extractError(e, "Failed to update audience");
  }
};

/** DELETE /api/google-ads/:clientId/audiences/:id */
export const removeAudience = async (
  clientId: number,
  audienceId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/google-ads/${clientId}/audiences/${audienceId}`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove audience");
  }
};

// ─────────────────────────────────────────────────────────────
// AUDIENCE EXCLUSIONS
// ─────────────────────────────────────────────────────────────

/** POST /api/google-ads/:clientId/campaigns/:campaignId/audiences/exclude */
export const excludeAudienceFromCampaign = async (
  clientId: number,
  campaignId: string,
  payload: { audienceId: string }
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.post<{ success: boolean; message: string }>(
      `/google-ads/${clientId}/campaigns/${campaignId}/audiences/exclude`,
      payload
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to exclude audience from campaign");
  }
};

/** POST /api/google-ads/:clientId/adgroups/:adGroupId/audiences/exclude */
export const excludeAudienceFromAdGroup = async (
  clientId: number,
  adGroupId: string,
  payload: { audienceId: string }
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.post<{ success: boolean; message: string }>(
      `/google-ads/${clientId}/adgroups/${adGroupId}/audiences/exclude`,
      payload
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to exclude audience from ad group");
  }
};

// ─────────────────────────────────────────────────────────────
// ASSETS
// ─────────────────────────────────────────────────────────────

import type {
  AssetsListResponse,
  CreateAssetPayload,
  AssetMutateResponse
} from "../types/googleAds.types";

/** GET /api/google-ads/:clientId/assets */
export const listAssets = async (
  clientId: number,
  params?: { type?: string; campaignId?: string; adGroupId?: string }
): Promise<AssetsListResponse> => {
  try {
    const res = await api.get<AssetsListResponse>(
      `/google-ads/${clientId}/assets`,
      { params }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load assets");
  }
};

/** POST /api/google-ads/:clientId/assets */
export const createAsset = async (
  clientId: number,
  payload: CreateAssetPayload
): Promise<AssetMutateResponse> => {
  try {
    const res = await api.post<AssetMutateResponse>(
      `/google-ads/${clientId}/assets`,
      payload
    );
    return res.data;
  } catch (e: any) {
    extractError(e, "Failed to create asset");
  }
};

/** POST /api/google-ads/:clientId/assets/upload */
export const uploadAssetBinary = async (
  clientId: number,
  formData: FormData
): Promise<{ success: boolean; assetId: string; assetUrl: string }> => {
  try {
    const res = await api.post<{ success: boolean; assetId: string; assetUrl: string }>(
      `/google-ads/${clientId}/assets/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  } catch (e: any) {
    extractError(e, "Failed to upload asset binary");
  }
};


/** DELETE /api/google-ads/:clientId/assets/:id */
export const removeAsset = async (
  clientId: number,
  assetId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/google-ads/${clientId}/assets/${assetId}`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove asset");
  }
};

/** POST /api/google-ads/:clientId/campaigns/:campaignId/assets */
export const assignAssetToCampaign = async (
  clientId: number,
  campaignId: string,
  payload: { assetId: string; fieldType: string }
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.post<{ success: boolean; message: string }>(
      `/google-ads/${clientId}/campaigns/${campaignId}/assets`,
      payload
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to assign asset to campaign");
  }
};

/** DELETE /api/google-ads/:clientId/campaigns/:campaignId/assets/:assetId */
export const removeAssetFromCampaign = async (
  clientId: number,
  campaignId: string,
  assetId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/google-ads/${clientId}/campaigns/${campaignId}/assets/${assetId}`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove asset from campaign");
  }
};

/** POST /api/google-ads/:clientId/adgroups/:adGroupId/assets */
export const assignAssetToAdGroup = async (
  clientId: number,
  adGroupId: string,
  payload: { assetId: string; fieldType: string }
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.post<{ success: boolean; message: string }>(
      `/google-ads/${clientId}/adgroups/${adGroupId}/assets`,
      payload
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to assign asset to ad group");
  }
};

/** DELETE /api/google-ads/:clientId/adgroups/:adGroupId/assets/:assetId */
export const removeAssetFromAdGroup = async (
  clientId: number,
  adGroupId: string,
  assetId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/google-ads/${clientId}/adgroups/${adGroupId}/assets/${assetId}`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove asset from ad group");
  }
};

// ─────────────────────────────────────────────────────────────
// END
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// RECOMMENDATIONS
// ─────────────────────────────────────────────────────────────

import type { RecommendationsListResponse } from "../types/googleAds.types";

/** GET /api/google-ads/:clientId/recommendations */
export const listRecommendations = async (
  clientId: number,
  params?: { campaignId?: string }
): Promise<RecommendationsListResponse> => {
  try {
    const res = await api.get<RecommendationsListResponse>(
      `/google-ads/${clientId}/recommendations`,
      { params }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load recommendations");
  }
};

/** POST /api/google-ads/:clientId/recommendations/:id/apply */
export const applyRecommendation = async (
  clientId: number,
  recommendationId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.post<{ success: boolean; message: string }>(
      `/google-ads/${clientId}/recommendations/${recommendationId}/apply`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to apply recommendation");
  }
};

/** POST /api/google-ads/:clientId/recommendations/:id/dismiss */
export const dismissRecommendation = async (
  clientId: number,
  recommendationId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.post<{ success: boolean; message: string }>(
      `/google-ads/${clientId}/recommendations/${recommendationId}/dismiss`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to dismiss recommendation");
  }
};

// ─────────────────────────────────────────────────────────────
// CONVERSIONS
// ─────────────────────────────────────────────────────────────

import type {
  ConversionActionsListResponse,
  MutateConversionActionPayload,
  MutateConversionActionResponse,
} from "../types/googleAds.types";

// ─────────────────────────────────────────────────────────────
// CHANGE HISTORY
// ─────────────────────────────────────────────────────────────

/** GET /api/google-ads/:clientId/change-history */
export const getChangeHistory = async (
  clientId: number,
  params?: { startDate?: string; endDate?: string; resourceTypes?: string[] }
): Promise<{ success: boolean; changes: any[]; totalCount?: number }> => {
  try {
    const res = await api.get<{ success: boolean; changes: any[]; totalCount?: number }>(
      `/google-ads/${clientId}/change-history`,
      { params }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to fetch change history");
    return { success: false, changes: [] };
  }
};

/** GET /api/google-ads/:clientId/conversion-actions */
export const listConversionActions = async (
  clientId: number
): Promise<ConversionActionsListResponse> => {
  try {
    const res = await api.get<ConversionActionsListResponse>(
      `/google-ads/${clientId}/conversion-actions`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load conversion actions");
  }
};

/** POST /api/google-ads/:clientId/conversion-actions */
export const createConversionAction = async (
  clientId: number,
  payload: MutateConversionActionPayload & { type: string }
): Promise<MutateConversionActionResponse> => {
  try {
    const res = await api.post<MutateConversionActionResponse>(
      `/google-ads/${clientId}/conversion-actions`,
      payload
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to create conversion action");
  }
};

/** PATCH /api/google-ads/:clientId/conversion-actions/:id */
export const updateConversionAction = async (
  clientId: number,
  conversionActionId: string,
  payload: MutateConversionActionPayload
): Promise<MutateConversionActionResponse> => {
  try {
    const res = await api.patch<MutateConversionActionResponse>(
      `/google-ads/${clientId}/conversion-actions/${conversionActionId}`,
      payload
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to update conversion action");
  }
};

/** DELETE /api/google-ads/:clientId/conversion-actions/:id */
export const removeConversionAction = async (
  clientId: number,
  conversionActionId: string
): Promise<MutateConversionActionResponse> => {
  try {
    const res = await api.delete<MutateConversionActionResponse>(
      `/google-ads/${clientId}/conversion-actions/${conversionActionId}`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove conversion action");
  }
};

// ─────────────────────────────────────────────────────────────
// REPORTING / GAQL
// ─────────────────────────────────────────────────────────────

import type { GaqlReportResponse, SavedReportsListResponse } from "../types/googleAds.types";

/** POST /api/google-ads/:clientId/reports/query */
export const runGaqlQuery = async (
  clientId: number,
  query: string
): Promise<GaqlReportResponse> => {
  try {
    const res = await api.post<GaqlReportResponse>(
      `/google-ads/${clientId}/reports/query`,
      { query }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to run GAQL query");
  }
};

/** GET /api/google-ads/:clientId/reports/saved */
export const listSavedReports = async (
  clientId: number
): Promise<SavedReportsListResponse> => {
  try {
    const res = await api.get<SavedReportsListResponse>(
      `/google-ads/${clientId}/reports/saved`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load saved reports");
  }
};

// ─────────────────────────────────────────────────────────────
// MCC / ACCOUNT HIERARCHY
// ─────────────────────────────────────────────────────────────

import type { ListAccessibleCustomersResponse, GetCustomerHierarchyResponse } from "../types/googleAds.types";

/** GET /api/google-ads/customers */
export const listAccessibleCustomers = async (): Promise<ListAccessibleCustomersResponse> => {
  try {
    const res = await api.get<ListAccessibleCustomersResponse>(`/google-ads/customers`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load accessible customers");
  }
};

/** GET /api/google-ads/:clientId/hierarchy */
export const getCustomerHierarchy = async (
  clientId: number
): Promise<GetCustomerHierarchyResponse> => {
  try {
    const res = await api.get<GetCustomerHierarchyResponse>(`/google-ads/${clientId}/hierarchy`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load customer hierarchy");
  }
};

// ─────────────────────────────────────────────────────────────
// SHARED LIBRARY (SHARED SETS & CRITERIA)
// ─────────────────────────────────────────────────────────────

import type { SharedSetsListResponse, SharedCriteriaListResponse, CampaignSharedSetsListResponse } from "../types/googleAds.types";

/** GET /api/google-ads/:clientId/shared-sets */
export const listSharedSets = async (clientId: number): Promise<SharedSetsListResponse> => {
  try {
    const res = await api.get<SharedSetsListResponse>(`/google-ads/${clientId}/shared-sets`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load shared sets");
  }
};

/** POST /api/google-ads/:clientId/shared-sets */
export const createSharedSet = async (clientId: number, name: string): Promise<{ success: boolean; sharedSetId: string }> => {
  try {
    const res = await api.post<{ success: boolean; sharedSetId: string }>(`/google-ads/${clientId}/shared-sets`, { name, type: "NEGATIVE_KEYWORDS" });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to create shared set");
  }
};

/** DELETE /api/google-ads/:clientId/shared-sets/:id */
export const deleteSharedSet = async (clientId: number, sharedSetId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete<{ success: boolean }>(`/google-ads/${clientId}/shared-sets/${sharedSetId}`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to delete shared set");
  }
};

/** GET /api/google-ads/:clientId/shared-sets/:id/criteria */
export const listSharedCriteria = async (clientId: number, sharedSetId: string): Promise<SharedCriteriaListResponse> => {
  try {
    const res = await api.get<SharedCriteriaListResponse>(`/google-ads/${clientId}/shared-sets/${sharedSetId}/criteria`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load shared criteria");
  }
};

/** POST /api/google-ads/:clientId/shared-sets/:id/criteria */
export const addSharedCriteria = async (clientId: number, sharedSetId: string, keywords: { text: string; matchType: string }[]): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(`/google-ads/${clientId}/shared-sets/${sharedSetId}/criteria`, { keywords });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to add shared criteria");
  }
};

/** DELETE /api/google-ads/:clientId/shared-sets/:id/criteria/:criterionId */
export const deleteSharedCriterion = async (clientId: number, sharedSetId: string, criterionId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete<{ success: boolean }>(`/google-ads/${clientId}/shared-sets/${sharedSetId}/criteria/${criterionId}`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to delete shared criterion");
  }
};

/** GET /api/google-ads/:clientId/shared-sets/:id/campaigns */
export const listCampaignSharedSets = async (clientId: number, sharedSetId: string): Promise<CampaignSharedSetsListResponse> => {
  try {
    const res = await api.get<CampaignSharedSetsListResponse>(`/google-ads/${clientId}/shared-sets/${sharedSetId}/campaigns`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load campaign shared sets");
  }
};

/** POST /api/google-ads/:clientId/shared-sets/:id/campaigns */
export const associateCampaignSharedSet = async (clientId: number, sharedSetId: string, campaignIds: string[]): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(`/google-ads/${clientId}/shared-sets/${sharedSetId}/campaigns`, { campaignIds });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to associate campaigns to shared set");
  }
};

/** DELETE /api/google-ads/:clientId/shared-sets/:id/campaigns/:campaignId */
export const removeCampaignSharedSet = async (clientId: number, sharedSetId: string, campaignId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete<{ success: boolean }>(`/google-ads/${clientId}/shared-sets/${sharedSetId}/campaigns/${campaignId}`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove campaign association");
  }
};

// ─────────────────────────────────────────────────────────────
// BILLING & BUDGETS
// ─────────────────────────────────────────────────────────────

import type { BillingSummaryResponse } from "../types/googleAds.types";

/** GET /api/google-ads/:clientId/billing/summary */
export const getBillingSummary = async (clientId: number): Promise<BillingSummaryResponse> => {
  try {
    const res = await api.get<BillingSummaryResponse>(`/google-ads/${clientId}/billing/summary`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load billing summary");
  }
};

/** POST /api/google-ads/:clientId/billing/budget-proposals */
export const createBudgetProposal = async (
  clientId: number,
  billingSetupId: string,
  name: string,
  spendingLimitMicros: number,
  startDateTime: string,
  endDateTime: string
): Promise<{ success: boolean; proposalId: string }> => {
  try {
    const res = await api.post<{ success: boolean; proposalId: string }>(`/google-ads/${clientId}/billing/budget-proposals`, {
      billingSetupId,
      name,
      spendingLimitMicros,
      startDateTime,
      endDateTime
    });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to create budget proposal");
  }
};

// ─────────────────────────────────────────────────────────────
// LABELS
// ─────────────────────────────────────────────────────────────

  // @ts-expect-error unused variable
import type { LabelListResponse, GoogleAdsLabel } from "../types/googleAds.types";

export const listLabels = async (clientId: number): Promise<LabelListResponse> => {
  try {
    const res = await api.get<LabelListResponse>(`/google-ads/${clientId}/labels`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load labels");
  }
};

export const createLabel = async (clientId: number, name: string, backgroundColor: string, description: string): Promise<{ success: boolean; labelId: string }> => {
  try {
    const res = await api.post<{ success: boolean; labelId: string }>(`/google-ads/${clientId}/labels`, { name, backgroundColor, description });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to create label");
  }
};

export const updateLabel = async (clientId: number, labelId: string, name: string, backgroundColor: string, description: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.patch<{ success: boolean }>(`/google-ads/${clientId}/labels/${labelId}`, { name, backgroundColor, description });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to update label");
  }
};

export const deleteLabel = async (clientId: number, labelId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete<{ success: boolean }>(`/google-ads/${clientId}/labels/${labelId}`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to delete label");
  }
};

export const assignLabelToEntity = async (clientId: number, labelId: string, entityType: "campaign" | "ad-group" | "ad" | "keyword", entityId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(`/google-ads/${clientId}/labels/${labelId}/assign`, { entityType, entityId });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to assign label");
  }
};

export const removeLabelFromEntity = async (clientId: number, labelId: string, entityType: "campaign" | "ad-group" | "ad" | "keyword", entityId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete<{ success: boolean }>(`/google-ads/${clientId}/labels/${labelId}/remove`, { data: { entityType, entityId } });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove label");
  }
};


// ─────────────────────────────────────────────────────────────
// BIDDING STRATEGIES
// ─────────────────────────────────────────────────────────────

import type { BiddingStrategyListResponse,  BiddingStrategy,
  SharedBudgetListResponse,
  SharedBudget
} from "../types/googleAds.types";

export const listBiddingStrategies = async (clientId: number): Promise<BiddingStrategyListResponse> => {
  try {
    const res = await api.get<BiddingStrategyListResponse>(`/google-ads/${clientId}/bidding-strategies`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load bidding strategies");
  }
};

export const createBiddingStrategy = async (
  clientId: number, 
  data: Omit<BiddingStrategy, "id" | "campaignCount" | "metrics" | "status">
): Promise<{ success: boolean; strategyId: string }> => {
  try {
    const res = await api.post<{ success: boolean; strategyId: string }>(`/google-ads/${clientId}/bidding-strategies`, data);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to create bidding strategy");
  }
};

export const updateBiddingStrategy = async (
  clientId: number, 
  strategyId: string,
  data: Partial<Omit<BiddingStrategy, "id" | "campaignCount" | "metrics" | "type" | "status">> & { name?: string }
): Promise<{ success: boolean }> => {
  try {
    const res = await api.patch<{ success: boolean }>(`/google-ads/${clientId}/bidding-strategies/${strategyId}`, data);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to update bidding strategy");
  }
};

export const deleteBiddingStrategy = async (clientId: number, strategyId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete<{ success: boolean }>(`/google-ads/${clientId}/bidding-strategies/${strategyId}`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to delete bidding strategy");
  }
};

export const assignCampaignBiddingStrategy = async (clientId: number, campaignId: string, strategyId: string | null): Promise<{ success: boolean }> => {
  try {
    const res = await api.patch<{ success: boolean }>(`/google-ads/${clientId}/campaigns/${campaignId}/bidding-strategy`, { strategyId });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to assign bidding strategy to campaign");
  }
};

// ─────────────────────────────────────────────────────────────
// SHARED BUDGETS
// ─────────────────────────────────────────────────────────────

export const listSharedBudgets = async (clientId: number): Promise<SharedBudgetListResponse> => {
  try {
    const res = await api.get<SharedBudgetListResponse>(`/google-ads/${clientId}/shared-budgets`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load shared budgets");
  }
};

export const createSharedBudget = async (
  clientId: number, 
  data: Omit<SharedBudget, "id" | "campaignCount" | "status">
): Promise<{ success: boolean; budgetId: string }> => {
  try {
    // API Mapping: CampaignBudgetService with explicitly_shared = true
    const res = await api.post<{ success: boolean; budgetId: string }>(`/google-ads/${clientId}/shared-budgets`, {
      ...data,
      explicitly_shared: true
    });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to create shared budget");
  }
};

export const updateSharedBudget = async (
  clientId: number, 
  budgetId: string,
  data: Partial<Omit<SharedBudget, "id" | "campaignCount" | "status">>
): Promise<{ success: boolean }> => {
  try {
    const res = await api.patch<{ success: boolean }>(`/google-ads/${clientId}/shared-budgets/${budgetId}`, data);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to update shared budget");
  }
};

export const deleteSharedBudget = async (clientId: number, budgetId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete<{ success: boolean }>(`/google-ads/${clientId}/shared-budgets/${budgetId}`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to delete shared budget");
  }
};

export const assignCampaignSharedBudget = async (clientId: number, campaignId: string, budgetId: string | null): Promise<{ success: boolean }> => {
  try {
    const res = await api.patch<{ success: boolean }>(`/google-ads/${clientId}/campaigns/${campaignId}/shared-budget`, { budgetId });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to assign shared budget to campaign");
  }
};

// ─────────────────────────────────────────────────────────────
// DRAFTS & EXPERIMENTS
// ─────────────────────────────────────────────────────────────

export const listCampaignDrafts = async (clientId: number): Promise<{ success: boolean; drafts?: CampaignDraft[] }> => {
  try {
    const res = await api.get<{ success: boolean; drafts: CampaignDraft[] }>(`/google-ads/${clientId}/drafts`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load drafts");
  }
};

export const createCampaignDraft = async (clientId: number, payload: { baseCampaignId: string; draftName: string }): Promise<{ success: boolean; draftId?: string }> => {
  try {
    const res = await api.post<{ success: boolean; draftId: string }>(`/google-ads/${clientId}/drafts`, payload);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to create draft");
  }
};

export const promoteCampaignDraft = async (clientId: number, draftId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(`/google-ads/${clientId}/drafts/${draftId}/promote`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to promote draft");
  }
};

export const removeCampaignDraft = async (clientId: number, draftId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete<{ success: boolean }>(`/google-ads/${clientId}/drafts/${draftId}`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove draft");
  }
};

export const listExperiments = async (clientId: number): Promise<{ success: boolean; experiments?: Experiment[]; arms?: ExperimentArm[] }> => {
  try {
    const res = await api.get<{ success: boolean; experiments: Experiment[]; arms: ExperimentArm[] }>(`/google-ads/${clientId}/experiments`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to load experiments");
  }
};

export const createExperiment = async (clientId: number, payload: { name: string; draftId: string; baseCampaignId: string; trafficSplit: number; startDate?: string; endDate?: string }): Promise<{ success: boolean; experimentId?: string }> => {
  try {
    const res = await api.post<{ success: boolean; experimentId: string }>(`/google-ads/${clientId}/experiments`, payload);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to create experiment");
  }
};

export const startExperiment = async (clientId: number, experimentId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(`/google-ads/${clientId}/experiments/${experimentId}/start`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to start experiment");
  }
};

export const stopExperiment = async (clientId: number, experimentId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(`/google-ads/${clientId}/experiments/${experimentId}/stop`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to stop experiment");
  }
};

export const promoteExperiment = async (clientId: number, experimentId: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(`/google-ads/${clientId}/experiments/${experimentId}/promote`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to promote experiment");
  }
};

// ─────────────────────────────────────────────────────────────
// PLACEMENT EXCLUSION LISTS (SharedSets)
// ─────────────────────────────────────────────────────────────

export const listPlacementExclusionLists = async (
  clientId: number
): Promise<PlacementExclusionListsResponse> => {
  try {
    const res = await api.get(`/google-ads/${clientId}/shared-sets`, {
      params: { type: "PLACEMENT_EXCLUSION" },
    });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to fetch placement exclusion lists");
  }
};

export const createPlacementExclusionList = async (
  clientId: number,
  payload: { name: string }
): Promise<{ success: boolean; listId: string }> => {
  try {
    const res = await api.post(`/google-ads/${clientId}/shared-sets`, {
      ...payload,
      type: "PLACEMENT_EXCLUSION",
    });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to create placement exclusion list");
  }
};

export const deletePlacementExclusionList = async (
  clientId: number,
  listId: string
): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete(`/google-ads/${clientId}/shared-sets/${listId}`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to delete placement exclusion list");
  }
};

export const listPlacementExclusions = async (
  clientId: number,
  listId: string
): Promise<PlacementExclusionsResponse> => {
  try {
    const res = await api.get(`/google-ads/${clientId}/shared-sets/${listId}/criteria`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to fetch placement exclusions");
  }
};

export const addPlacementExclusions = async (
  clientId: number,
  payload: {
    listId: string;
    placements: Array<{ placement: string; type: "WEBSITE" | "YOUTUBE_CHANNEL" | "YOUTUBE_VIDEO" | "MOBILE_APP" | "MOBILE_APP_CATEGORY" }>;
  }
): Promise<{ success: boolean }> => {
  try {
    const res = await api.post(
      `/google-ads/${clientId}/shared-sets/${payload.listId}/criteria`,
      { criteria: payload.placements }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to add placement exclusions");
  }
};

export const removePlacementExclusion = async (
  clientId: number,
  listId: string,
  criterionId: string
): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete(
      `/google-ads/${clientId}/shared-sets/${listId}/criteria/${criterionId}`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove placement exclusion");
  }
};

export const assignCampaignPlacementExclusionList = async (
  clientId: number,
  payload: { listId: string; campaignIds: string[] }
): Promise<{ success: boolean }> => {
  try {
    const res = await api.post(
      `/google-ads/${clientId}/shared-sets/${payload.listId}/campaigns`,
      { campaignIds: payload.campaignIds }
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to assign list to campaigns");
  }
};

export const removeCampaignPlacementExclusionList = async (
  clientId: number,
  payload: { listId: string; campaignId: string }
): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete(
      `/google-ads/${clientId}/shared-sets/${payload.listId}/campaigns/${payload.campaignId}`
    );
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove list from campaign");
  }
};

// ─────────────────────────────────────────────────────────────
// ASSET GROUPS (Performance Max)
// ─────────────────────────────────────────────────────────────

export const listAssetGroups = async (
  clientId: number,
  campaignId?: string
): Promise<AssetGroupsListResponse> => {
  try {
    const res = await api.get(`/google-ads/${clientId}/asset-groups`, {
      params: { campaignId },
    });
    return res.data;
  } catch (e) {
    extractError(e, "Failed to list asset groups");
  }
};

export const createAssetGroup = async (
  clientId: number,
  payload: Omit<AssetGroup, "id" | "status" | "metrics">
): Promise<{ success: boolean; assetGroupId: string }> => {
  try {
    const res = await api.post(`/google-ads/${clientId}/asset-groups`, payload);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to create asset group");
  }
};

export const updateAssetGroup = async (
  clientId: number,
  assetGroupId: string,
  payload: Partial<AssetGroup>
): Promise<{ success: boolean }> => {
  try {
    const res = await api.put(`/google-ads/${clientId}/asset-groups/${assetGroupId}`, payload);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to update asset group");
  }
};

export const removeAssetGroup = async (
  clientId: number,
  assetGroupId: string
): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete(`/google-ads/${clientId}/asset-groups/${assetGroupId}`);
    return res.data;
  } catch (e) {
    extractError(e, "Failed to remove asset group");
  }
};
