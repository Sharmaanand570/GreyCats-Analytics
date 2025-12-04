import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  disconnectMetaBusinessAccount,
  getFacebookPageInsights,
  getFacebookPagePosts,
  getFacebookPostInsights,
  getInstagramMedia,
  getInstagramMediaInsights,
  getInstagramProfile,
  getInstagramStories,
  getMetaBusinessAccounts,
  getMetaBusinessAnalyticsSummary,
  handleMetaBusinessCallback,
  loginMetaBusiness,
  refreshMetaBusinessAccount,
  refreshMetaBusinessPageToken,
  syncMetaBusinessDaily,
  type MetaBusinessCallbackParams,
  type MetaBusinessCallbackResponse,
  type MetaBusinessDisconnectResponse,
  type MetaBusinessRefreshResponse,
  type MetaBusinessSyncResponse,
  type MetaBusinessRefreshPageResponse,
} from "../API/metaBusinessApi";

const commonQueryOptions = {
  retry: 1,
  staleTime: 60 * 1000,
};

export const useMetaBusinessConnect = () => {
  return useMutation<void, Error>({
    mutationFn: () => loginMetaBusiness(),
    onError: (error) => {
      toast.error(error.message || "Failed to initiate Meta Business connection");
    },
  });
};

export const useMetaBusinessCallback = () => {
  const queryClient = useQueryClient();
  return useMutation<MetaBusinessCallbackResponse, Error, MetaBusinessCallbackParams>({
    mutationFn: (params) => handleMetaBusinessCallback(params),
    onSuccess: (data) => {
      toast.success(data.message || "Meta Business connected successfully");
      queryClient.invalidateQueries({ queryKey: ["meta-business"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to connect Meta Business");
    },
  });
};

export const useMetaBusinessAccounts = () => {
  return useQuery({
    queryKey: ["meta-business", "accounts"],
    queryFn: () => getMetaBusinessAccounts(),
    ...commonQueryOptions,
  });
};

export const useMetaBusinessRefresh = () => {
  const queryClient = useQueryClient();
  return useMutation<MetaBusinessRefreshResponse, Error, number>({
    mutationFn: (id) => refreshMetaBusinessAccount(id),
    onSuccess: (data) => {
      toast.success(data.message || "Account refreshed successfully");
      queryClient.invalidateQueries({ queryKey: ["meta-business"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to refresh account");
    },
  });
};

export const useMetaBusinessDisconnect = () => {
  const queryClient = useQueryClient();
  return useMutation<MetaBusinessDisconnectResponse, Error, number>({
    mutationFn: (id) => disconnectMetaBusinessAccount(id),
    onSuccess: (data) => {
      toast.success(data.message || "Account disconnected successfully");
      queryClient.invalidateQueries({ queryKey: ["meta-business"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect account");
    },
  });
};

export const useFacebookInsights = (accountId: number | undefined) => {
  return useQuery({
    queryKey: ["meta-business", "facebook", "insights", accountId],
    queryFn: () => getFacebookPageInsights(accountId!),
    enabled: !!accountId,
    ...commonQueryOptions,
  });
};

export const useFacebookPosts = (accountId: number | undefined) => {
  return useQuery({
    queryKey: ["meta-business", "facebook", "posts", accountId],
    queryFn: () => getFacebookPagePosts(accountId!),
    enabled: !!accountId,
    ...commonQueryOptions,
  });
};

export const useFacebookPostInsights = (postId: string | undefined) => {
  return useQuery({
    queryKey: ["meta-business", "facebook", "post-insights", postId],
    queryFn: () => getFacebookPostInsights(postId!),
    enabled: !!postId,
    ...commonQueryOptions,
  });
};

export const useInstagramProfile = (accountId: number | undefined) => {
  return useQuery({
    queryKey: ["meta-business", "instagram", "profile", accountId],
    queryFn: () => getInstagramProfile(accountId!),
    enabled: !!accountId,
    ...commonQueryOptions,
  });
};

export const useInstagramMedia = (accountId: number | undefined) => {
  return useQuery({
    queryKey: ["meta-business", "instagram", "media", accountId],
    queryFn: () => getInstagramMedia(accountId!),
    enabled: !!accountId,
    ...commonQueryOptions,
  });
};

export const useInstagramMediaInsights = (mediaId: string | undefined) => {
  return useQuery({
    queryKey: ["meta-business", "instagram", "media-insights", mediaId],
    queryFn: () => getInstagramMediaInsights(mediaId!),
    enabled: !!mediaId,
    ...commonQueryOptions,
  });
};

export const useInstagramStories = (accountId: number | undefined) => {
  return useQuery({
    queryKey: ["meta-business", "instagram", "stories", accountId],
    queryFn: () => getInstagramStories(accountId!),
    enabled: !!accountId,
    ...commonQueryOptions,
  });
};

export const useMetaBusinessAnalyticsSummary = (accountId: number | undefined) => {
  return useQuery({
    queryKey: ["meta-business", "analytics", "summary", accountId],
    queryFn: () => getMetaBusinessAnalyticsSummary(accountId!),
    enabled: !!accountId,
    ...commonQueryOptions,
  });
};

export const useMetaBusinessSync = () => {
  const queryClient = useQueryClient();
  return useMutation<MetaBusinessSyncResponse, Error, { accountId: number; date?: string }>({
    mutationFn: ({ accountId, date }) => syncMetaBusinessDaily(accountId, date),
    onSuccess: () => {
      toast.success("Sync completed successfully");
      queryClient.invalidateQueries({ queryKey: ["meta-business"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync data");
    },
  });
};

export const useMetaBusinessRefreshPage = () => {
  const queryClient = useQueryClient();
  return useMutation<MetaBusinessRefreshPageResponse, Error, number>({
    mutationFn: (id) => refreshMetaBusinessPageToken(id),
    onSuccess: (data) => {
      toast.success(data.message || "Page token refreshed");
      queryClient.invalidateQueries({ queryKey: ["meta-business"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to refresh page token");
    },
  });
};
