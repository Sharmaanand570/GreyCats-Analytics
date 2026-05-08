import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listBlogPosts, getBlogPost, getBlogIntegrations, fetchPlatformDetails, getLinkedInTargets, connectWordPress, getWordPressTargets, connectTelegram, getTelegramTargets } from '../api/blogPostsApi';
import type { BlogPostStatus, ConnectWordPressPayload, ConnectTelegramPayload } from '../api/types';

export const blogPostKeys = {
  all: ['blog-posts'] as const,
  lists: () => [...blogPostKeys.all, 'list'] as const,
  list: (clientId?: number, status?: BlogPostStatus) =>
    [...blogPostKeys.lists(), clientId, status] as const,
  details: () => [...blogPostKeys.all, 'detail'] as const,
  detail: (id: number) => [...blogPostKeys.details(), id] as const,
  integrations: () => ['blog-integrations'] as const,
  linkedinTargets: () => ['blog-linkedin-targets'] as const,
  platformDetails: (platform: string, accountId: string) =>
    ['blog-platform-details', platform, accountId] as const,
  wordpressTargets: () => ['blog-wordpress-targets'] as const,
  telegramTargets: () => ['blog-telegram-targets'] as const,
};

export const useBlogPosts = (clientId?: number, status?: BlogPostStatus) => {
  return useQuery({
    queryKey: blogPostKeys.list(clientId, status),
    queryFn: () => listBlogPosts({ clientId, status }),
    select: (data) => data.posts,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};

export const useBlogPost = (id: number) => {
  return useQuery({
    queryKey: blogPostKeys.detail(id),
    queryFn: () => getBlogPost(id),
    enabled: id > 0,
    staleTime: 30_000,
  });
};

export const useBlogIntegrations = () => {
  return useQuery({
    queryKey: blogPostKeys.integrations(),
    queryFn: getBlogIntegrations,
    staleTime: 60_000,
  });
};

export const useLinkedInTargets = () => {
  return useQuery({
    queryKey: blogPostKeys.linkedinTargets(),
    queryFn: getLinkedInTargets,
    staleTime: 60_000,
  });
};

export const usePlatformDetails = (platform: string, accountId: string) => {
  return useQuery({
    queryKey: blogPostKeys.platformDetails(platform, accountId),
    queryFn: () => fetchPlatformDetails(platform, accountId),
    enabled: !!platform && !!accountId,
    staleTime: 60_000,
  });
};

export const useWordPressTargets = () => {
  return useQuery({
    queryKey: blogPostKeys.wordpressTargets(),
    queryFn: getWordPressTargets,
    staleTime: 60_000,
  });
};

export const useConnectWordPress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConnectWordPressPayload) => connectWordPress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogPostKeys.wordpressTargets() });
      queryClient.invalidateQueries({ queryKey: blogPostKeys.integrations() });
    },
  });
};

export const useTelegramTargets = () => {
  return useQuery({
    queryKey: blogPostKeys.telegramTargets(),
    queryFn: getTelegramTargets,
    staleTime: 60_000,
  });
};

export const useConnectTelegram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConnectTelegramPayload) => connectTelegram(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogPostKeys.telegramTargets() });
      queryClient.invalidateQueries({ queryKey: blogPostKeys.integrations() });
    },
  });
};
