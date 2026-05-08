import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  disconnectMeta,
  getMetaAccounts,
  getMetaCampaigns,
  getMetaInsights,
  reconnectMeta,
  syncMetaAds,
  getMetaAdsSummary,
  getMetaAdsCampaigns,
  getMetaAdsTrends,
  getMetaAdsMeta,
  type MetaAccountsResponse,
  type MetaCampaignsResponse,
  type MetaCampaignInsightsResponse,
  type MetaDisconnectResponse,
  type MetaReconnectResponse,
  type MetaSyncResponse,
  type MetaAdsSummaryResponse,
  type MetaAdsCampaignsResponse,
  type MetaAdsTrendsResponse,
  type MetaAdsMetaResponse,
} from "../API/metaApi";
import {
  getFacebookPageInfo,
  getFacebookPagePosts,
  getFacebookPages,
  getFacebookPostInsights,
  getInstagramBusinessAccount,
  getInstagramMedia,
  getInstagramMediaInsights,
  getInstagramProfile,
  getMetaDailyInsights,
  getMetaSavedInsights,
  syncFacebookInsights,
  syncInstagramInsights,
  type FacebookPagesResponse,
  type FacebookPageInfoResponse,
  type FacebookPagePostsResponse,
  type FacebookPostInsightsResponse,
  type FacebookSyncBody,
  type FacebookSyncResponse,
  type InstagramBusinessAccountResponse,
  type InstagramMediaInsightsResponse,
  type InstagramMediaResponse,
  type InstagramProfileResponse,
  type InstagramSyncBody,
  type InstagramSyncResponse,
  type MetaDailyHistoryResponse,
  type MetaSavedInsightsResponse,
} from "../API/metaInsightsApi";

const commonQueryOptions = {
  retry: 1,
  staleTime: 60 * 1000,
};

// ============ Meta Ads (ad accounts & campaigns) ============


// ============ Meta Ops ============

export const useMetaAccounts = (clientId: number) => {
  return useQuery<MetaAccountsResponse, Error>({
    queryKey: ["meta", "accounts", clientId],
    queryFn: () => getMetaAccounts(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useMetaCampaigns = (clientId: number, accountId: string | null) => {
  return useQuery<MetaCampaignsResponse, Error>({
    queryKey: ["meta", "campaigns", clientId, accountId],
    queryFn: () => getMetaCampaigns(clientId, accountId as string),
    enabled: !!clientId && !!accountId,
    ...commonQueryOptions,
  });
};

export const useMetaCampaignInsights = (clientId: number, campaignId: string | null) => {
  return useQuery<MetaCampaignInsightsResponse, Error>({
    queryKey: ["meta", "campaign-insights", clientId, campaignId],
    queryFn: () => getMetaInsights(clientId, campaignId as string),
    enabled: !!clientId && !!campaignId,
    ...commonQueryOptions,
  });
};

export const useMetaReconnect = () => {
  const queryClient = useQueryClient();
  return useMutation<MetaReconnectResponse, Error, number>({
    mutationFn: (clientId) => reconnectMeta(clientId),
    onSuccess: (_, clientId) => {
      toast.success("Meta reconnected successfully");
      queryClient.invalidateQueries({ queryKey: ["meta", clientId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reconnect Meta");
    },
  });
};

export const useMetaDisconnect = () => {
  const queryClient = useQueryClient();
  return useMutation<MetaDisconnectResponse, Error, number>({
    mutationFn: (clientId) => disconnectMeta(clientId),
    onSuccess: (data, clientId) => {
      toast.success(data.message || "Meta disconnected successfully");
      queryClient.invalidateQueries({ queryKey: ["meta", clientId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect Meta");
    },
  });
};

export const useMetaSyncAds = () => {
  const queryClient = useQueryClient();
  return useMutation<MetaSyncResponse, Error, { clientId: number; accountId: string }>({
    mutationFn: ({ clientId, accountId }) => syncMetaAds(clientId, accountId),
    onSuccess: (data, { clientId }) => {
      toast.success(`Synced ${data.totalCampaigns} campaigns successfully`);
      queryClient.invalidateQueries({ queryKey: ["meta", clientId] });
      queryClient.invalidateQueries({ queryKey: ["unified-metrics", clientId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync Meta Ads");
    },
  });
};

// ============ Facebook organic insights ============

export const useFacebookPages = (
  params?: { limit?: number; after?: string; search?: string }
) => {
  return useQuery<FacebookPagesResponse, Error>({
    queryKey: ["meta-insights", "facebook", "pages", params],
    queryFn: () => getFacebookPages(params),
    ...commonQueryOptions,
  });
};

export const useFacebookPageInfo = (accountId: number | undefined) => {
  return useQuery<FacebookPageInfoResponse, Error>({
    queryKey: ["meta-insights", "facebook", "page-info", accountId],
    queryFn: () => getFacebookPageInfo(accountId as number),
    enabled: !!accountId,
    ...commonQueryOptions,
  });
};

export const useFacebookPagePosts = (
  accountId: number | undefined,
  limit?: number
) => {
  return useQuery<FacebookPagePostsResponse, Error>({
    queryKey: ["meta-insights", "facebook", "page-posts", accountId, limit],
    queryFn: () => getFacebookPagePosts(accountId as number, limit),
    enabled: !!accountId,
    ...commonQueryOptions,
  });
};

export const useFacebookPosts = useFacebookPagePosts;

export const useFacebookPostInsights = (
  postId: string | undefined,
  accountId: number | undefined
) => {
  return useQuery<FacebookPostInsightsResponse, Error>({
    queryKey: ["meta-insights", "facebook", "post-insights", postId, accountId],
    queryFn: () => getFacebookPostInsights(postId as string, accountId as number),
    enabled: !!postId && !!accountId,
    ...commonQueryOptions,
  });
};

export const useFacebookSyncInsights = () => {
  const queryClient = useQueryClient();
  return useMutation<FacebookSyncResponse, Error, { clientId: number; body: FacebookSyncBody }>({
    mutationFn: ({ body }) => syncFacebookInsights(body),
    onSuccess: (_, { clientId }) => {
      toast.success("Facebook insights synced successfully");
      queryClient.invalidateQueries({ queryKey: ["meta", clientId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync Facebook insights");
    },
  });
};

// ============ Instagram insights ============

export const useInstagramBusinessAccount = (pageId: string | undefined) => {
  return useQuery<InstagramBusinessAccountResponse, Error>({
    queryKey: ["meta-insights", "instagram", "business-account", pageId],
    queryFn: () => getInstagramBusinessAccount(pageId as string),
    enabled: !!pageId,
    ...commonQueryOptions,
  });
};

export const useInstagramProfile = (clientId: number, accountId: number | undefined) => {
  return useQuery<InstagramProfileResponse, Error>({
    queryKey: ["meta", "instagram", "profile", clientId, accountId],
    queryFn: () => getInstagramProfile(clientId, accountId?.toString() as string),
    enabled: !!clientId && !!accountId,
    ...commonQueryOptions,
  });
};

export const useInstagramMedia = (
  clientId: number,
  accountId: number | undefined,
  limit?: number
) => {
  return useQuery<InstagramMediaResponse, Error>({
    queryKey: ["meta", "instagram", "media", clientId, accountId, limit],
    queryFn: () => getInstagramMedia(clientId, accountId?.toString() as string, limit),
    enabled: !!clientId && !!accountId,
    ...commonQueryOptions,
  });
};

export const useInstagramMediaInsights = (
  clientId: number,
  accountId: number | undefined,
  mediaId: string | undefined
) => {
  return useQuery<InstagramMediaInsightsResponse, Error>({
    queryKey: ["meta", "instagram", "media-insights", clientId, accountId, mediaId],
    queryFn: () =>
      getInstagramMediaInsights(clientId, accountId?.toString() as string, mediaId as string),
    enabled: !!clientId && !!accountId && !!mediaId,
    ...commonQueryOptions,
  });
};

export const useInstagramSyncInsights = () => {
  const queryClient = useQueryClient();
  return useMutation<InstagramSyncResponse, Error, { clientId: number; body: InstagramSyncBody }>({
    mutationFn: () => syncInstagramInsights(),
    onSuccess: (_, { clientId }) => {
      toast.success("Instagram insights synced successfully");
      queryClient.invalidateQueries({ queryKey: ["meta", clientId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync Instagram insights");
    },
  });
};

// ============ Saved & daily history ============

export const useMetaSavedInsights = (clientId: number, platform?: string) => {
  return useQuery<MetaSavedInsightsResponse, Error>({
    queryKey: ["meta", "saved-insights", clientId, platform],
    queryFn: () => getMetaSavedInsights(),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useMetaDailyInsights = (clientId: number, platform?: string) => {
  return useQuery<MetaDailyHistoryResponse, Error>({
    queryKey: ["meta", "daily-insights", clientId, platform],
    queryFn: () => getMetaDailyInsights(),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};












// ============ New Meta Ads Endpoints ============

export const useMetaAdsSummary = (clientId: number) => {
  return useQuery<MetaAdsSummaryResponse, Error>({
    queryKey: ["meta-ads", "summary", clientId],
    queryFn: () => getMetaAdsSummary(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useMetaAdsCampaigns = (clientId: number) => {
  return useQuery<MetaAdsCampaignsResponse, Error>({
    queryKey: ["meta-ads", "campaigns", clientId],
    queryFn: () => getMetaAdsCampaigns(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useMetaAdsTrends = (
  clientId: number,
  params?: {
    startDate?: string;
    endDate?: string;
  }
) => {
  return useQuery<MetaAdsTrendsResponse, Error>({
    queryKey: ["meta-ads", "trends", clientId, params],
    queryFn: () => getMetaAdsTrends(clientId, params),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useMetaAdsMeta = (clientId: number) => {
  return useQuery<MetaAdsMetaResponse, Error>({
    queryKey: ["meta-ads", "meta", clientId],
    queryFn: () => getMetaAdsMeta(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};


