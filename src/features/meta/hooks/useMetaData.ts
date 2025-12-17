import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  disconnectMeta,
  getMetaAccounts,
  getMetaCampaigns,
  getMetaInsights,
  reconnectMeta,
  syncMetaAds,
  type MetaAccountsResponse,
  type MetaCampaignsResponse,
  type MetaCampaignInsightsResponse,
  type MetaDisconnectResponse,
  type MetaReconnectResponse,
  type MetaSyncResponse,
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
  clientId: number,
  params?: { limit?: number; after?: string; search?: string }
) => {
  return useQuery<FacebookPagesResponse, Error>({
    queryKey: ["meta", "facebook", "pages", clientId, params],
    queryFn: () => getFacebookPages(clientId, params),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useFacebookPageInfo = (clientId: number, pageId: string | undefined) => {
  return useQuery<FacebookPageInfoResponse, Error>({
    queryKey: ["meta", "facebook", "page-info", clientId, pageId],
    queryFn: () => getFacebookPageInfo(clientId, pageId as string),
    enabled: !!clientId && !!pageId,
    ...commonQueryOptions,
  });
};

export const useFacebookPagePosts = (
  clientId: number,
  pageId: string | undefined,
  limit?: number
) => {
  return useQuery<FacebookPagePostsResponse, Error>({
    queryKey: ["meta", "facebook", "page-posts", clientId, pageId, limit],
    queryFn: () => getFacebookPagePosts(clientId, pageId as string, limit),
    enabled: !!clientId && !!pageId,
    ...commonQueryOptions,
  });
};

export const useFacebookPostInsights = (
  clientId: number,
  postId: string | undefined,
  pageId: string | undefined
) => {
  return useQuery<FacebookPostInsightsResponse, Error>({
    queryKey: ["meta", "facebook", "post-insights", clientId, postId, pageId],
    queryFn: () => getFacebookPostInsights(clientId, postId as string, pageId as string),
    enabled: !!clientId && !!postId && !!pageId,
    ...commonQueryOptions,
  });
};

export const useFacebookSyncInsights = () => {
  const queryClient = useQueryClient();
  return useMutation<FacebookSyncResponse, Error, { clientId: number; body: FacebookSyncBody }>({
    mutationFn: ({ clientId, body }) => syncFacebookInsights(clientId, body),
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

export const useInstagramBusinessAccount = (clientId: number, pageId: string | undefined) => {
  return useQuery<InstagramBusinessAccountResponse, Error>({
    queryKey: ["meta", "instagram", "business-account", clientId, pageId],
    queryFn: () => getInstagramBusinessAccount(clientId, pageId as string),
    enabled: !!clientId && !!pageId,
    ...commonQueryOptions,
  });
};

export const useInstagramProfile = (clientId: number, igBusinessId: string | undefined) => {
  return useQuery<InstagramProfileResponse, Error>({
    queryKey: ["meta", "instagram", "profile", clientId, igBusinessId],
    queryFn: () => getInstagramProfile(clientId, igBusinessId as string),
    enabled: !!clientId && !!igBusinessId,
    ...commonQueryOptions,
  });
};

export const useInstagramMedia = (
  clientId: number,
  igBusinessId: string | undefined,
  limit?: number
) => {
  return useQuery<InstagramMediaResponse, Error>({
    queryKey: ["meta", "instagram", "media", clientId, igBusinessId, limit],
    queryFn: () => getInstagramMedia(clientId, igBusinessId as string, limit),
    enabled: !!clientId && !!igBusinessId,
    ...commonQueryOptions,
  });
};

export const useInstagramMediaInsights = (
  clientId: number,
  accountId: string | undefined,
  mediaId: string | undefined
) => {
  return useQuery<InstagramMediaInsightsResponse, Error>({
    queryKey: ["meta", "instagram", "media-insights", clientId, accountId, mediaId],
    queryFn: () =>
      getInstagramMediaInsights(clientId, accountId as string, mediaId as string),
    enabled: !!clientId && !!accountId && !!mediaId,
    ...commonQueryOptions,
  });
};

export const useInstagramSyncInsights = () => {
  const queryClient = useQueryClient();
  return useMutation<InstagramSyncResponse, Error, { clientId: number; body: InstagramSyncBody }>({
    mutationFn: ({ clientId, body }) => syncInstagramInsights(clientId, body),
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
    queryFn: () => getMetaSavedInsights(clientId, platform),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useMetaDailyInsights = (clientId: number, platform?: string) => {
  return useQuery<MetaDailyHistoryResponse, Error>({
    queryKey: ["meta", "daily-insights", clientId, platform],
    queryFn: () => getMetaDailyInsights(clientId, platform),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};











