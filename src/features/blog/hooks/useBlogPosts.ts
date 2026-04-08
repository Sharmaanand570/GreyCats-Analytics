import { useQuery } from '@tanstack/react-query';
import { listBlogPosts, getBlogPost, getBlogIntegrations, fetchPlatformDetails, getLinkedInTargets } from '../api/blogPostsApi';
import type { BlogPostStatus } from '../api/types';

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
