import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  disconnectGoogle,
  getGoogleAnalyticsMeta,
  getGoogleAnalyticsSummary,
  getGoogleAnalyticsTopPages,
  getGoogleAnalyticsTrends,
  getGoogleProperties,
  reconnectGoogle,
  selectGoogleProperty,
  type GoogleAnalyticsMetaResponse,
  type GoogleAnalyticsSummaryResponse,
  type GoogleAnalyticsTopPagesResponse,
  type GoogleAnalyticsTrendsResponse,
  type GoogleDisconnectResponse,
  type GooglePropertiesResponse,
  type GoogleReconnectResponse,
  type GoogleSelectPropertyBody,
  type GoogleSelectPropertyResponse,
} from "../../API/googleApi";

const commonQueryOptions = {
  retry: 1,
  staleTime: 60 * 1000,
};

export const useGoogleProperties = (clientId: number) => {
  return useQuery<GooglePropertiesResponse, Error>({
    queryKey: ["google-analytics", "properties", clientId],
    queryFn: () => getGoogleProperties(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useGoogleReconnect = () => {
  return useMutation<GoogleReconnectResponse, Error, number>({
    mutationFn: (clientId) => reconnectGoogle(clientId),
    onSuccess: (data) => {
      toast.success(data.message || "Reconnect URL generated");
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reconnect Google Analytics");
    },
  });
};

export const useGoogleDisconnect = () => {
  const queryClient = useQueryClient();

  return useMutation<GoogleDisconnectResponse, Error, number>({
    mutationFn: (clientId) => disconnectGoogle(clientId),
    onSuccess: (data, clientId) => {
      toast.success(data.message || "Google Analytics disconnected");
      queryClient.invalidateQueries({ queryKey: ["google-analytics", clientId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect Google Analytics");
    },
  });
};

export const useGoogleSelectProperty = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GoogleSelectPropertyResponse,
    Error,
    { clientId: number; body: GoogleSelectPropertyBody }
  >({
    mutationFn: ({ clientId, body }) => selectGoogleProperty(clientId, body),
    onSuccess: (data, { clientId }) => {
      toast.success(data.message || "Property saved successfully");
      // Refresh GA4 properties and all analytics views that depend on the
      // selected property.
      queryClient.invalidateQueries({
        queryKey: ["google-analytics", "properties", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["google-analytics", "meta", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["google-analytics", "summary", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["google-analytics", "trends", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["google-analytics", "top-pages", clientId],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save GA4 property");
    },
  });
};

export const useGoogleAnalyticsSummary = (clientId: number) => {
  return useQuery<GoogleAnalyticsSummaryResponse, Error>({
    queryKey: ["google-analytics", "summary", clientId],
    queryFn: () => getGoogleAnalyticsSummary(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useGoogleAnalyticsTrends = (clientId: number) => {
  return useQuery<GoogleAnalyticsTrendsResponse, Error>({
    queryKey: ["google-analytics", "trends", clientId],
    queryFn: () => getGoogleAnalyticsTrends(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useGoogleAnalyticsTopPages = (clientId: number) => {
  return useQuery<GoogleAnalyticsTopPagesResponse, Error>({
    queryKey: ["google-analytics", "top-pages", clientId],
    queryFn: () => getGoogleAnalyticsTopPages(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useGoogleAnalyticsMeta = (clientId: number) => {
  return useQuery<GoogleAnalyticsMetaResponse, Error>({
    queryKey: ["google-analytics", "meta", clientId],
    queryFn: () => getGoogleAnalyticsMeta(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};


