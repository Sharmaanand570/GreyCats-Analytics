import { useQuery } from '@tanstack/react-query';
import { getBroadcastStats, getBlogStats } from '../api/outreachApi';
import type { OutreachStatsParams } from '../api/types';

export const outreachKeys = {
  broadcastStats: (params?: OutreachStatsParams) => ['outreach-broadcast-stats', params] as const,
  blogStats: (params?: OutreachStatsParams) => ['outreach-blog-stats', params] as const,
};

export const useBroadcastStats = (params?: OutreachStatsParams) => {
  return useQuery({
    queryKey: outreachKeys.broadcastStats(params),
    queryFn: () => getBroadcastStats(params),
    staleTime: 60_000,
  });
};

export const useBlogStats = (params?: OutreachStatsParams) => {
  return useQuery({
    queryKey: outreachKeys.blogStats(params),
    queryFn: () => getBlogStats(params),
    staleTime: 60_000,
  });
};
