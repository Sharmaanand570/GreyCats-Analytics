import api from '@/apiConfig';
import type { BroadcastStats, BlogStats, OutreachStatsParams } from './types';

const clean = (p?: OutreachStatsParams) => {
  if (!p) return undefined;
  const out: Record<string, string | number> = {};
  if (p.clientId != null) out.clientId = p.clientId;
  if (p.from) out.from = p.from;
  if (p.to) out.to = p.to;
  return Object.keys(out).length ? out : undefined;
};

export const getBroadcastStats = async (params?: OutreachStatsParams): Promise<BroadcastStats> => {
  const response = await api.get('/broadcasts/stats', { params: clean(params) });
  return response.data as BroadcastStats;
};

export const getBlogStats = async (params?: OutreachStatsParams): Promise<BlogStats> => {
  const response = await api.get('/blog/stats', { params: clean(params) });
  return response.data as BlogStats;
};
