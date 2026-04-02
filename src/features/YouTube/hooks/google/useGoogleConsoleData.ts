import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  disconnectGoogleConsole,
  fetchGoogleConsolePerformance,
  getGoogleConsoleProperties,
  getGoogleConsoleUnifiedMetrics,
  getGoogleConsoleSummary,
  getGoogleConsoleTrends,
  getGoogleConsoleTopPages,
  getGoogleConsoleTopQueries,
  getGoogleConsoleMeta,
  reconnectGoogleConsole,
  selectGoogleConsoleProperty,
  type GoogleConsoleDisconnectResponse,
  type GoogleConsolePerformanceRequest,
  type GoogleConsolePerformanceResponse,
  type GoogleConsolePropertiesResponse,
  type GoogleConsoleReconnectResponse,
  type GoogleConsoleSelectPropertyBody,
  type GoogleConsoleSelectPropertyResponse,
  type GoogleConsoleUnifiedMetricsResponse,
  type GoogleConsoleUnifiedMetricsParams,
  type GoogleConsoleSummaryResponse,
  type GoogleConsoleTrendsResponse,
  type GoogleConsoleTopPagesResponse,
  type GoogleConsoleTopQueriesResponse,
  type GoogleConsoleMetaResponse,
} from "../../API/googleConsoleapi";

const commonQueryOptions = {
  retry: 1,
  staleTime: 5 * 60 * 1000,
};

export const useGoogleConsoleReconnect = () => {
  return useMutation<GoogleConsoleReconnectResponse, Error, number>({
    mutationFn: (clientId) => reconnectGoogleConsole(clientId),
    onSuccess: (data) => {
      toast.success("Google Search Console reconnect URL generated");
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reconnect Google Search Console");
    },
  });
};

export const useGoogleConsoleDisconnect = () => {
  const queryClient = useQueryClient();

  return useMutation<GoogleConsoleDisconnectResponse, Error, number>({
    mutationFn: (clientId) => disconnectGoogleConsole(clientId),
    onSuccess: (data, clientId) => {
      toast.success(data.message || "Google Search Console disconnected");
      queryClient.invalidateQueries({ queryKey: ["google-console", clientId] });
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to disconnect Google Search Console"
      );
    },
  });
};

export const useGoogleConsoleProperties = (clientId: number) => {
  return useQuery<GoogleConsolePropertiesResponse, Error>({
    queryKey: ["google-console", "properties", clientId],
    queryFn: () => getGoogleConsoleProperties(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useGoogleConsoleSelectProperty = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GoogleConsoleSelectPropertyResponse,
    Error,
    { clientId: number; body: GoogleConsoleSelectPropertyBody }
  >({
    mutationFn: ({ clientId, body }) =>
      selectGoogleConsoleProperty(clientId, body),
    onSuccess: (data, { clientId }) => {
      toast.success(
        data.message || "Google Search Console property selected successfully"
      );
      queryClient.invalidateQueries({
        queryKey: ["google-console", "properties", clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["google-console", "unified-metrics", clientId],
      });
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to select Google Search Console property"
      );
    },
  });
};

export const useGoogleConsolePerformance = () => {
  return useMutation<
    GoogleConsolePerformanceResponse,
    Error,
    { clientId: number; payload: GoogleConsolePerformanceRequest }
  >({
    mutationFn: ({ clientId, payload }) =>
      fetchGoogleConsolePerformance(clientId, payload),
  });
};

export const useGoogleConsoleUnifiedMetrics = (
  clientId: number,
  params?: GoogleConsoleUnifiedMetricsParams
) => {
  return useQuery<GoogleConsoleUnifiedMetricsResponse, Error>({
    queryKey: ["google-console", "unified-metrics", clientId, params],
    queryFn: () => getGoogleConsoleUnifiedMetrics(clientId, params),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

// ==================== OVERVIEW HOOKS ====================

export const useGoogleConsoleSummary = (
  clientId: number,
  params: { startDate?: string; endDate?: string } = {}
) => {
  return useQuery<GoogleConsoleSummaryResponse, Error>({
    queryKey: ["google-console", "summary", clientId, params],
    queryFn: () => getGoogleConsoleSummary(clientId, params),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useGoogleConsoleTrends = (clientId: number) => {
  return useQuery<GoogleConsoleTrendsResponse, Error>({
    queryKey: ["google-console", "trends", clientId],
    queryFn: () => getGoogleConsoleTrends(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useGoogleConsoleTopPages = (
  clientId: number,
  params: { startDate?: string; endDate?: string } = {}
) => {
  return useQuery<GoogleConsoleTopPagesResponse, Error>({
    queryKey: ["google-console", "top-pages", clientId, params],
    queryFn: () => getGoogleConsoleTopPages(clientId, params),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useGoogleConsoleTopQueries = (
  clientId: number,
  params: { startDate?: string; endDate?: string } = {}
) => {
  return useQuery<GoogleConsoleTopQueriesResponse, Error>({
    queryKey: ["google-console", "top-queries", clientId, params],
    queryFn: () => getGoogleConsoleTopQueries(clientId, params),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};

export const useGoogleConsoleMeta = (clientId: number) => {
  return useQuery<GoogleConsoleMetaResponse, Error>({
    queryKey: ["google-console", "meta", clientId],
    queryFn: () => getGoogleConsoleMeta(clientId),
    enabled: !!clientId,
    ...commonQueryOptions,
  });
};


