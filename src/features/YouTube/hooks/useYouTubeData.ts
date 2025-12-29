import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  disconnectYouTube,
  getYouTubeChannel,
  getYouTubeVideoAnalytics,
  getYouTubeVideosList,
  reconnectYouTube,
  syncYouTube,
  getYouTubeSummary,
  getYouTubeTrends,
  getYouTubeTopVideos,
  getYouTubeSubscribersGrowth,
  getYouTubeWatchTime,
  getYouTubeEngagement,
  type YouTubeChannelResponse,
  type YouTubeDisconnectResponse,
  type YouTubeVideoAnalyticsResponse,
  type YouTubeReconnectResponse,
  type YouTubeVideosListResponse,
  type YouTubeSyncResponse,
  type YouTubeSummaryResponse,
  type YouTubeTrendsResponse,
  type YouTubeTopVideosResponse,
  type YouTubeSubscribersGrowthResponse,
  type YouTubeWatchTimeResponse,
  type YouTubeEngagementResponse,
} from "../API/youtubeApi";

const commonQueryOptions = {
  retry: 1,
  staleTime: 60 * 1000,
};

export const useYouTubeChannel = (clientId: number) => {
  return useQuery<YouTubeChannelResponse, Error>({
    queryKey: ["youtube", "channel", clientId],
    queryFn: () => getYouTubeChannel(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useYouTubeSync = () => {
  const queryClient = useQueryClient();

  return useMutation<YouTubeSyncResponse, Error, number>({
    mutationFn: (clientId) => syncYouTube(clientId),
    onSuccess: (data, clientId) => {
      toast.success(data.message || "Sync completed successfully");
      queryClient.invalidateQueries({ queryKey: ["youtube", clientId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync YouTube data");
    },
  });
};

export const useYouTubeVideos = (clientId: number, params?: { page?: number; limit?: number }) => {
  return useQuery<YouTubeVideosListResponse, Error>({
    queryKey: ["youtube", "videos", clientId, params],
    queryFn: () => getYouTubeVideosList(clientId, params),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useYouTubePerVideoAnalytics = (
  clientId: number,
  params?: { videoId: string; from?: string; to?: string }
) => {
  // Only run if we have a videoId. Dates are optional in some API versions but good to check.
  const queryEnabled = useMemo(
    () => !!clientId && !!params?.videoId,
    [clientId, params?.videoId]
  );

  return useQuery<YouTubeVideoAnalyticsResponse, Error>({
    queryKey: ["youtube", "analytics", "video", clientId, params],
    queryFn: () => getYouTubeVideoAnalytics(clientId, params!.videoId),
    enabled: queryEnabled,
    ...commonQueryOptions,
  });
};

export const useYouTubeSummary = (
  clientId: number,
  dateRange?: { from?: Date; to?: Date }
) => {
  return useQuery<YouTubeSummaryResponse, Error>({
    queryKey: ["youtube", "summary", clientId, dateRange],
    queryFn: () =>
      getYouTubeSummary(clientId, {
        startDate: dateRange?.from ? dateRange.from.toISOString().split("T")[0] : undefined,
        endDate: dateRange?.to ? dateRange.to.toISOString().split("T")[0] : undefined,
      }),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useYouTubeTrends = (
  clientId: number,
  dateRange?: { from?: Date; to?: Date }
) => {
  return useQuery<YouTubeTrendsResponse, Error>({
    queryKey: ["youtube", "trends", clientId, dateRange],
    queryFn: () =>
      getYouTubeTrends(clientId, {
        startDate: dateRange?.from ? dateRange.from.toISOString().split("T")[0] : undefined,
        endDate: dateRange?.to ? dateRange.to.toISOString().split("T")[0] : undefined,
      }),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useYouTubeTopVideos = (
  clientId: number,
  params?: {
    metric?: string;
    limit?: number;
    period?: string;
    dateRange?: { from?: Date; to?: Date };
  }
) => {
  return useQuery<YouTubeTopVideosResponse, Error>({
    queryKey: ["youtube", "top-videos", clientId, params],
    queryFn: () =>
      getYouTubeTopVideos(clientId, {
        metric: params?.metric,
        limit: params?.limit,
        period: params?.period,
        startDate: params?.dateRange?.from
          ? params.dateRange.from.toISOString().split("T")[0]
          : undefined,
        endDate: params?.dateRange?.to
          ? params.dateRange.to.toISOString().split("T")[0]
          : undefined,
      }),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useYouTubeSubscribersGrowth = (
  clientId: number,
  params?: { startDate?: string; endDate?: string }
) => {
  return useQuery<YouTubeSubscribersGrowthResponse, Error>({
    queryKey: ["youtube", "subscribers-growth", clientId, params],
    queryFn: () => getYouTubeSubscribersGrowth(clientId, params),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useYouTubeWatchTime = (
  clientId: number,
  dateRange?: { from?: Date; to?: Date }
) => {
  return useQuery<YouTubeWatchTimeResponse, Error>({
    queryKey: ["youtube", "watch-time", clientId, dateRange],
    queryFn: () =>
      getYouTubeWatchTime(clientId, {
        startDate: dateRange?.from ? dateRange.from.toISOString().split("T")[0] : undefined,
        endDate: dateRange?.to ? dateRange.to.toISOString().split("T")[0] : undefined,
      }),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useYouTubeEngagement = (
  clientId: number,
  dateRange?: { from?: Date; to?: Date }
) => {
  return useQuery<YouTubeEngagementResponse, Error>({
    queryKey: ["youtube", "engagement", clientId, dateRange],
    queryFn: () =>
      getYouTubeEngagement(clientId, {
        startDate: dateRange?.from ? dateRange.from.toISOString().split("T")[0] : undefined,
        endDate: dateRange?.to ? dateRange.to.toISOString().split("T")[0] : undefined,
      }),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useYouTubeReconnect = () => {
  return useMutation<YouTubeReconnectResponse, Error, number>({
    mutationFn: (clientId) => reconnectYouTube(clientId),
    onSuccess: (data) => {
      toast.success(data.message || "Reconnect URL generated");
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reconnect YouTube");
    },
  });
};

export const useYouTubeDisconnect = () => {
  const queryClient = useQueryClient();

  return useMutation<YouTubeDisconnectResponse, Error, number>({
    mutationFn: (clientId) => disconnectYouTube(clientId),
    onSuccess: (data, clientId) => {
      toast.success(data.message || "YouTube disconnected");
      queryClient.invalidateQueries({ queryKey: ["youtube", clientId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect YouTube");
    },
  });
};

