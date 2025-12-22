import { useQuery } from "@tanstack/react-query";
import { metaAdsApi } from "../API/metaAdsApi";

export const useMetaAdsMeta = (clientId: number) => {
    return useQuery({
        queryKey: ["meta-ads-meta", clientId],
        queryFn: () => metaAdsApi.getMeta(clientId),
        enabled: !!clientId && clientId > 0,
    });
};

export const useMetaAdsSummary = (clientId: number) => {
    return useQuery({
        queryKey: ["meta-ads-summary", clientId],
        queryFn: () => metaAdsApi.getSummary(clientId),
        enabled: !!clientId && clientId > 0,
    });
};

export const useMetaAdsCampaigns = (clientId: number) => {
    return useQuery({
        queryKey: ["meta-ads-campaigns", clientId],
        queryFn: () => metaAdsApi.getCampaigns(clientId),
        enabled: !!clientId && clientId > 0,
    });
};

export const useMetaAdsTrends = (clientId: number) => {
    return useQuery({
        queryKey: ["meta-ads-trends", clientId],
        queryFn: () => metaAdsApi.getTrends(clientId),
        enabled: !!clientId && clientId > 0,
    });
};

