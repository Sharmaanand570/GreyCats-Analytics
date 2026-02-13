import { useQuery } from "@tanstack/react-query";
import {
  getIntegrations,
  type IntegrationsResponse,
} from "../integrationsAPI";

export const useIntegrations = (clientId: number | null, options?: { enabled?: boolean; staleTime?: number; placeholderData?: any }) => {
  return useQuery<IntegrationsResponse, Error>({
    queryKey: ["integrations", clientId],
    queryFn: () => {
      if (!clientId) throw new Error("Client ID is required");
      return getIntegrations(clientId);
    },
    enabled: !!clientId && (options?.enabled ?? true),
    retry: 1,
    staleTime: options?.staleTime ?? 30 * 1000, // Default 30s, can be overridden
    placeholderData: options?.placeholderData
  });
};


