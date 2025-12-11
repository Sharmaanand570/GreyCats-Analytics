import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  disconnectMeta,
  getMetaAccounts,
  getMetaCampaigns,
  getMetaInsights,
  reconnectMeta,
  type MetaAccountsResponse,
  type MetaCampaignsResponse,
  type MetaCampaignInsightsResponse,
  type MetaDisconnectResponse,
  type MetaReconnectResponse,
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


// ============ Meta Ads (ad accounts & campaigns) ============

export const useMetaAccounts = () => {
  return useQuery<MetaAccountsResponse, Error>({
    queryKey: ["meta", "accounts"],
    queryFn: () => getMetaAccounts(),
    ...commonQueryOptions,
  });
};

export const useMetaCampaigns = (accountId: string | null) => {
  return useQuery<MetaCampaignsResponse, Error>({
    queryKey: ["meta", "campaigns", accountId],
    queryFn: () => getMetaCampaigns(accountId as string),
    enabled: !!accountId,
    ...commonQueryOptions,
  });
};

export const useMetaCampaignInsights = (campaignId: string | null) => {
  return useQuery<MetaCampaignInsightsResponse, Error>({
    queryKey: ["meta", "campaign-insights", campaignId],
    queryFn: () => getMetaInsights(campaignId as string),
    enabled: !!campaignId,
    ...commonQueryOptions,
  });
};

export const useMetaReconnect = () => {
  const queryClient = useQueryClient();
  return useMutation<MetaReconnectResponse, Error>({
    mutationFn: () => reconnectMeta(),
    onSuccess: (data) => {
      toast.success("Meta reconnected successfully");
      queryClient.invalidateQueries({ queryKey: ["meta"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reconnect Meta");
    },
  });
};

export const useMetaDisconnect = () => {
  const queryClient = useQueryClient();
  return useMutation<MetaDisconnectResponse, Error>({
    mutationFn: () => disconnectMeta(),
    onSuccess: (data) => {
      toast.success(data.message || "Meta disconnected successfully");
      queryClient.invalidateQueries({ queryKey: ["meta"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect Meta");
    },
  });
};

// ============ Facebook organic insights ============

export const useFacebookPages = (params?: { limit?: number; after?: string; search?: string }) => {
  return useQuery<FacebookPagesResponse, Error>({
    queryKey: ["meta", "facebook", "pages", params],
    queryFn: () => getFacebookPages(params),
    ...commonQueryOptions,
  });
};

export const useFacebookPageInfo = (pageId: string | undefined) => {
  return useQuery<FacebookPageInfoResponse, Error>({
    queryKey: ["meta", "facebook", "page-info", pageId],
    queryFn: () => getFacebookPageInfo(pageId as string),
    enabled: !!pageId,
    ...commonQueryOptions,
  });
};

export const useFacebookPagePosts = (pageId: string | undefined, limit?: number) => {
  return useQuery<FacebookPagePostsResponse, Error>({
    queryKey: ["meta", "facebook", "page-posts", pageId, limit],
    queryFn: () => getFacebookPagePosts(pageId as string, limit),
    enabled: !!pageId,
    ...commonQueryOptions,
  });
};

export const useFacebookPostInsights = (postId: string | undefined, pageId: string | undefined) => {
  return useQuery<FacebookPostInsightsResponse, Error>({
    queryKey: ["meta", "facebook", "post-insights", postId, pageId],
    queryFn: () => getFacebookPostInsights(postId as string, pageId as string),
    enabled: !!postId && !!pageId,
    ...commonQueryOptions,
  });
};

export const useFacebookSyncInsights = () => {
  const queryClient = useQueryClient();
  return useMutation<FacebookSyncResponse, Error, FacebookSyncBody>({
    mutationFn: (body) => syncFacebookInsights(body),
    onSuccess: () => {
      toast.success("Facebook insights synced successfully");
      queryClient.invalidateQueries({ queryKey: ["meta"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync Facebook insights");
    },
  });
};

// ============ Instagram insights ============

export const useInstagramBusinessAccount = (pageId: string | undefined) => {
  return useQuery<InstagramBusinessAccountResponse, Error>({
    queryKey: ["meta", "instagram", "business-account", pageId],
    queryFn: () => getInstagramBusinessAccount(pageId as string),
    enabled: !!pageId,
    ...commonQueryOptions,
  });
};

export const useInstagramProfile = (igBusinessId: string | undefined) => {
  return useQuery<InstagramProfileResponse, Error>({
    queryKey: ["meta", "instagram", "profile", igBusinessId],
    queryFn: () => getInstagramProfile(igBusinessId as string),
    enabled: !!igBusinessId,
    ...commonQueryOptions,
  });
};

export const useInstagramMedia = (igBusinessId: string | undefined, limit?: number) => {
  return useQuery<InstagramMediaResponse, Error>({
    queryKey: ["meta", "instagram", "media", igBusinessId, limit],
    queryFn: () => getInstagramMedia(igBusinessId as string, limit),
    enabled: !!igBusinessId,
    ...commonQueryOptions,
  });
};

export const useInstagramMediaInsights = (mediaId: string | undefined) => {
  return useQuery<InstagramMediaInsightsResponse, Error>({
    queryKey: ["meta", "instagram", "media-insights", mediaId],
    queryFn: () => getInstagramMediaInsights(mediaId as string),
    enabled: !!mediaId,
    ...commonQueryOptions,
  });
};

export const useInstagramSyncInsights = () => {
  const queryClient = useQueryClient();
  return useMutation<InstagramSyncResponse, Error, InstagramSyncBody>({
    mutationFn: (body) => syncInstagramInsights(body),
    onSuccess: () => {
      toast.success("Instagram insights synced successfully");
      queryClient.invalidateQueries({ queryKey: ["meta"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync Instagram insights");
    },
  });
};

// ============ Saved & daily history ============

export const useMetaSavedInsights = (platform?: string) => {
  return useQuery<MetaSavedInsightsResponse, Error>({
    queryKey: ["meta", "saved-insights", platform],
    queryFn: () => getMetaSavedInsights(platform),
    ...commonQueryOptions,
  });
};

export const useMetaDailyInsights = (platform?: string) => {
  return useQuery<MetaDailyHistoryResponse, Error>({
    queryKey: ["meta", "daily-insights", platform],
    queryFn: () => getMetaDailyInsights(platform),
    ...commonQueryOptions,
  });
};











