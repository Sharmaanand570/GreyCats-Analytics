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

export const useGoogleProperties = () => {
  return useQuery<GooglePropertiesResponse, Error>({
    queryKey: ["google-analytics", "properties"],
    queryFn: () => getGoogleProperties(),
    ...commonQueryOptions,
  });
};

export const useGoogleReconnect = () => {
  return useMutation<GoogleReconnectResponse, Error>({
    mutationFn: () => reconnectGoogle(),
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

  return useMutation<GoogleDisconnectResponse, Error>({
    mutationFn: () => disconnectGoogle(),
    onSuccess: (data) => {
      toast.success(data.message || "Google Analytics disconnected");
      queryClient.invalidateQueries({ queryKey: ["google-analytics"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect Google Analytics");
    },
  });
};

export const useGoogleSelectProperty = () => {
  const queryClient = useQueryClient();

  return useMutation<GoogleSelectPropertyResponse, Error, GoogleSelectPropertyBody>({
    mutationFn: (body) => selectGoogleProperty(body),
    onSuccess: (data) => {
      toast.success(data.message || "Property saved successfully");
      // Refresh GA4 properties and all analytics views that depend on the
      // selected property.
      queryClient.invalidateQueries({ queryKey: ["google-analytics", "properties"] });
      queryClient.invalidateQueries({ queryKey: ["google-analytics", "meta"] });
      queryClient.invalidateQueries({ queryKey: ["google-analytics", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["google-analytics", "trends"] });
      queryClient.invalidateQueries({ queryKey: ["google-analytics", "top-pages"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save GA4 property");
    },
  });
};

export const useGoogleAnalyticsSummary = () => {
  return useQuery<GoogleAnalyticsSummaryResponse, Error>({
    queryKey: ["google-analytics", "summary"],
    queryFn: () => getGoogleAnalyticsSummary(),
    ...commonQueryOptions,
  });
};

export const useGoogleAnalyticsTrends = () => {
  return useQuery<GoogleAnalyticsTrendsResponse, Error>({
    queryKey: ["google-analytics", "trends"],
    queryFn: () => getGoogleAnalyticsTrends(),
    ...commonQueryOptions,
  });
};

export const useGoogleAnalyticsTopPages = () => {
  return useQuery<GoogleAnalyticsTopPagesResponse, Error>({
    queryKey: ["google-analytics", "top-pages"],
    queryFn: () => getGoogleAnalyticsTopPages(),
    ...commonQueryOptions,
  });
};

export const useGoogleAnalyticsMeta = () => {
  return useQuery<GoogleAnalyticsMetaResponse, Error>({
    queryKey: ["google-analytics", "meta"],
    queryFn: () => getGoogleAnalyticsMeta(),
    ...commonQueryOptions,
  });
};


