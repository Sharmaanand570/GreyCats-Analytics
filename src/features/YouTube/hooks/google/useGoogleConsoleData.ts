import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  connectGoogleConsole,
  disconnectGoogleConsole,
  getGoogleConsoleBilling,
  getGoogleConsoleBillingAccounts,
  getGoogleConsoleProjects,
  reconnectGoogleConsole,
  type ConnectGoogleConsoleResponse,
  type GoogleConsoleBillingAccountsResponse,
  type GoogleConsoleBillingResponse,
  type GoogleConsoleDisconnectResponse,
  type GoogleConsoleProjectsResponse,
  type GoogleConsoleReconnectResponse,
} from "../../API/googleConsoleapi";

const commonQueryOptions = {
  retry: 1,
  staleTime: 60 * 1000,
};

export const useGoogleConsoleConnect = () => {
  return useMutation<ConnectGoogleConsoleResponse, Error, void>({
    mutationFn: () => connectGoogleConsole(),
  });
};

export const useGoogleConsoleReconnect = () => {
  return useMutation<GoogleConsoleReconnectResponse, Error, void>({
    mutationFn: () => reconnectGoogleConsole(),
    onSuccess: (data) => {
      toast.success("Google Console reconnect URL generated");
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reconnect Google Console");
    },
  });
};

export const useGoogleConsoleDisconnect = () => {
  const queryClient = useQueryClient();

  return useMutation<GoogleConsoleDisconnectResponse, Error, void>({
    mutationFn: () => disconnectGoogleConsole(),
    onSuccess: (data) => {
      toast.success(data.message || "Google Console disconnected");
      queryClient.invalidateQueries({ queryKey: ["google-console"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect Google Console");
    },
  });
};

export const useGoogleConsoleProjects = () => {
  return useQuery<GoogleConsoleProjectsResponse, Error>({
    queryKey: ["google-console", "projects"],
    queryFn: () => getGoogleConsoleProjects(),
    ...commonQueryOptions,
  });
};

export const useGoogleConsoleBilling = (days: number) => {
  return useQuery<GoogleConsoleBillingResponse, Error>({
    queryKey: ["google-console", "billing", days],
    queryFn: () => getGoogleConsoleBilling(days),
    ...commonQueryOptions,
  });
};

export const useGoogleConsoleBillingAccounts = () => {
  return useQuery<GoogleConsoleBillingAccountsResponse, Error>({
    queryKey: ["google-console", "billing-accounts"],
    queryFn: () => getGoogleConsoleBillingAccounts(),
    ...commonQueryOptions,
  });
};











