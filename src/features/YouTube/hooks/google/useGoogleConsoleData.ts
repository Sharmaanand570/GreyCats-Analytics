import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  disconnectGoogleConsole,
  fetchGoogleConsolePerformance,
  getGoogleConsoleProperties,
  getGoogleConsoleUnifiedMetrics,
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
} from "../../API/googleConsoleapi";

const commonQueryOptions = {
  retry: 1,
  staleTime: 60 * 1000,
};

export const useGoogleConsoleReconnect = () => {
  return useMutation<GoogleConsoleReconnectResponse, Error, void>({
    mutationFn: () => reconnectGoogleConsole(),
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

  return useMutation<GoogleConsoleDisconnectResponse, Error, void>({
    mutationFn: () => disconnectGoogleConsole(),
    onSuccess: (data) => {
      toast.success(data.message || "Google Search Console disconnected");
      queryClient.invalidateQueries({ queryKey: ["google-console"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect Google Search Console");
    },
  });
};

export const useGoogleConsoleProperties = () => {
  return useQuery<GoogleConsolePropertiesResponse, Error>({
    queryKey: ["google-console", "properties"],
    queryFn: () => getGoogleConsoleProperties(),
    ...commonQueryOptions,
  });
};

export const useGoogleConsoleSelectProperty = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GoogleConsoleSelectPropertyResponse,
    Error,
    GoogleConsoleSelectPropertyBody
  >({
    mutationFn: (body) => selectGoogleConsoleProperty(body),
    onSuccess: (data) => {
      toast.success(
        data.message || "Google Search Console property selected successfully"
      );
      queryClient.invalidateQueries({
        queryKey: ["google-console", "properties"],
      });
      queryClient.invalidateQueries({
        queryKey: ["google-console", "unified-metrics"],
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
    GoogleConsolePerformanceRequest
  >({
    mutationFn: (payload) => fetchGoogleConsolePerformance(payload),
  });
};

export const useGoogleConsoleUnifiedMetrics = (
  params?: GoogleConsoleUnifiedMetricsParams
) => {
  return useQuery<GoogleConsoleUnifiedMetricsResponse, Error>({
    queryKey: ["google-console", "unified-metrics", params],
    queryFn: () => getGoogleConsoleUnifiedMetrics(params),
    ...commonQueryOptions,
  });
};

