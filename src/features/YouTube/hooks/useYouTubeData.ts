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

export const useYouTubeVideos = (clientId: number, params?: YouTubeVideosParams) => {
  return useQuery<YouTubeVideosResponse, Error>({
    queryKey: ["youtube", "videos", clientId, params],
    queryFn: () => getYouTubeVideos(clientId, params),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useYouTubeAnalytics = (clientId: number, params: YouTubeAnalyticsParams) => {
  return useQuery<YouTubeAnalyticsResponse, Error>({
    queryKey: ["youtube", "analytics", clientId, params],
    queryFn: () => getYouTubeAnalytics(clientId, params),
    enabled: !!clientId && Boolean(params.from && params.to),
    ...commonQueryOptions,
  });
};

export const useYouTubePerVideoAnalytics = (
  clientId: number,
  params?: YouTubePerVideoAnalyticsParams
) => {
  const queryEnabled = useMemo(
    () => !!clientId && Boolean(params?.videoId && params?.from && params?.to),
    [clientId, params?.videoId, params?.from, params?.to]
  );

  return useQuery<YouTubePerVideoAnalyticsResponse, Error>({
    queryKey: ["youtube", "analytics", "video", clientId, params],
    queryFn: () => getYouTubePerVideoAnalytics(clientId, params as YouTubePerVideoAnalyticsParams),
    enabled: queryEnabled,
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

