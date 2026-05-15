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
  integrations: (clientId?: number) => ['blog-integrations', clientId] as const,
  linkedinTargets: (clientId?: number) => ['blog-linkedin-targets', clientId] as const,
  platformDetails: (platform: string, accountId: string) =>
    ['blog-platform-details', platform, accountId] as const,
  wordpressTargets: (clientId?: number) => ['blog-wordpress-targets', clientId] as const,
  telegramTargets: (clientId?: number) => ['blog-telegram-targets', clientId] as const,
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

export const useBlogIntegrations = (clientId?: number) => {
  return useQuery({
    queryKey: blogPostKeys.integrations(clientId),
    queryFn: () => getBlogIntegrations(clientId),
    staleTime: 60_000,
  });
};

export const useLinkedInTargets = (clientId?: number) => {
  return useQuery({
    queryKey: blogPostKeys.linkedinTargets(clientId),
    queryFn: () => getLinkedInTargets(clientId),
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

export const useWordPressTargets = (clientId?: number) => {
  return useQuery({
    queryKey: blogPostKeys.wordpressTargets(clientId),
    queryFn: () => getWordPressTargets(clientId),
    staleTime: 60_000,
  });
};

export const useConnectWordPress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConnectWordPressPayload) => connectWordPress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-wordpress-targets'] });
      queryClient.invalidateQueries({ queryKey: ['blog-integrations'] });
    },
  });
};

export const useTelegramTargets = (clientId?: number) => {
  return useQuery({
    queryKey: blogPostKeys.telegramTargets(clientId),
    queryFn: () => getTelegramTargets(clientId),
    staleTime: 60_000,
  });
};

export const useConnectTelegram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConnectTelegramPayload) => connectTelegram(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-telegram-targets'] });
      queryClient.invalidateQueries({ queryKey: ['blog-integrations'] });
    },
  });
};
