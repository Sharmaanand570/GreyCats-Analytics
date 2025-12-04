import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  disconnectYouTube,
  getYouTubeAnalytics,
  getYouTubeChannel,
  getYouTubePerVideoAnalytics,
  getYouTubeVideos,
  reconnectYouTube,
  syncYouTube,
  type YouTubeAnalyticsParams,
  type YouTubeAnalyticsResponse,
  type YouTubeChannelResponse,
  type YouTubeDisconnectResponse,
  type YouTubePerVideoAnalyticsParams,
  type YouTubePerVideoAnalyticsResponse,
  type YouTubeReconnectResponse,
  type YouTubeVideosParams,
  type YouTubeVideosResponse,
  type YouTubeSyncResponse,
} from "../API/youtubeApi";

const commonQueryOptions = {
  retry: 1,
  staleTime: 60 * 1000,
};

export const useYouTubeChannel = () => {
  return useQuery<YouTubeChannelResponse, Error>({
    queryKey: ["youtube", "channel"],
    queryFn: () => getYouTubeChannel(),
    ...commonQueryOptions,
  });
};

export const useYouTubeSync = () => {
  const queryClient = useQueryClient();

  return useMutation<YouTubeSyncResponse, Error, void>({
    mutationFn: () => syncYouTube(),
    onSuccess: (data) => {
      toast.success(data.message || "Sync completed successfully");
      queryClient.invalidateQueries({ queryKey: ["youtube"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync YouTube data");
    },
  });
};

export const useYouTubeVideos = (params?: YouTubeVideosParams) => {
  return useQuery<YouTubeVideosResponse, Error>({
    queryKey: ["youtube", "videos", params],
    queryFn: () => getYouTubeVideos(params),
    ...commonQueryOptions,
  });
};

export const useYouTubeAnalytics = (params: YouTubeAnalyticsParams) => {
  return useQuery<YouTubeAnalyticsResponse, Error>({
    queryKey: ["youtube", "analytics", params],
    queryFn: () => getYouTubeAnalytics(params),
    enabled: Boolean(params.from && params.to),
    ...commonQueryOptions,
  });
};

export const useYouTubePerVideoAnalytics = (
  params?: YouTubePerVideoAnalyticsParams
) => {
  const queryEnabled = useMemo(
    () => Boolean(params?.videoId && params?.from && params?.to),
    [params?.videoId, params?.from, params?.to]
  );

  return useQuery<YouTubePerVideoAnalyticsResponse, Error>({
    queryKey: ["youtube", "analytics", "video", params],
    queryFn: () => getYouTubePerVideoAnalytics(params as YouTubePerVideoAnalyticsParams),
    enabled: queryEnabled,
    ...commonQueryOptions,
  });
};

export const useYouTubeReconnect = () => {
  return useMutation<YouTubeReconnectResponse, Error>({
    mutationFn: () => reconnectYouTube(),
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

  return useMutation<YouTubeDisconnectResponse, Error>({
    mutationFn: () => disconnectYouTube(),
    onSuccess: (data) => {
      toast.success(data.message || "YouTube disconnected");
      queryClient.invalidateQueries({ queryKey: ["youtube"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect YouTube");
    },
  });
};

