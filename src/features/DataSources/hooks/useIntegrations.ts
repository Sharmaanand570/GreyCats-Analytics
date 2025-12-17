import { useQuery } from "@tanstack/react-query";
import {
  getIntegrations,
  type IntegrationsResponse,
} from "../integrationsAPI";

export const useIntegrations = (clientId: number | null) => {
  return useQuery<IntegrationsResponse, Error>({
    queryKey: ["integrations", clientId],
    queryFn: () => {
      if (!clientId) throw new Error("Client ID is required");
      return getIntegrations(clientId);
    },
    enabled: !!clientId,
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
};


