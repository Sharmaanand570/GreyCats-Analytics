import { useQuery } from "@tanstack/react-query";
import { getIntegrationAccountIdAPI } from "./reusableAPI";





export const useGetIntegrationAccountId = (platform: string) => {
    return useQuery({
        queryKey: ["integration-account-id", platform],
        queryFn: () => getIntegrationAccountIdAPI(platform),
        enabled: !!platform,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        retry: 1,
    });
}