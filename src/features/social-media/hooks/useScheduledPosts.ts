import { useQuery } from '@tanstack/react-query';
import { listScheduledPosts, getScheduledPost } from '../api/scheduledPostsApi';
import type { PostStatus } from '../api/types';

export const scheduledPostKeys = {
  all: ['scheduled-posts'] as const,
  lists: () => [...scheduledPostKeys.all, 'list'] as const,
  list: (clientId?: number, status?: PostStatus) =>
    [...scheduledPostKeys.lists(), clientId, status] as const,
  details: () => [...scheduledPostKeys.all, 'detail'] as const,
  detail: (id: number) => [...scheduledPostKeys.details(), id] as const,
};

/** Fetch all scheduled posts, optionally filtered by clientId and status. */
export const useScheduledPosts = (clientId?: number, status?: PostStatus) => {
  return useQuery({
    queryKey: scheduledPostKeys.list(clientId, status),
    queryFn: () => listScheduledPosts({ clientId, status }),
    select: (data) => data.posts,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};

/** Fetch a single scheduled post by ID. */
export const useScheduledPost = (id: number) => {
  return useQuery({
    queryKey: scheduledPostKeys.detail(id),
    queryFn: () => getScheduledPost(id),
    enabled: id > 0,
    staleTime: 30_000,
  });
};
