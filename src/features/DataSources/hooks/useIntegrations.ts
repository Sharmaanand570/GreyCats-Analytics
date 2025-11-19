import { useQuery } from "@tanstack/react-query";
import {
  getIntegrations,
  type IntegrationsResponse,
} from "../integrationsAPI";

export const useIntegrations = () => {
  return useQuery<IntegrationsResponse, Error>({
    queryKey: ["integrations"],
    queryFn: () => getIntegrations(),
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
};


