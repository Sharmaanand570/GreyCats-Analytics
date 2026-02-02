import { useQuery } from "@tanstack/react-query";
import { metaAdsApi } from "../API/metaAdsApi";

export const useMetaAdsMeta = (clientId: number, params?: { startDate?: string; endDate?: string }) => {
    return useQuery({
        queryKey: ["meta-ads-meta", clientId, params],
        queryFn: () => metaAdsApi.getMeta(clientId, params),
        enabled: !!clientId && clientId > 0,
    });
};

export const useMetaAdsSummary = (clientId: number, params?: { startDate?: string; endDate?: string }) => {
    return useQuery({
        queryKey: ["meta-ads-summary", clientId, params],
        queryFn: () => metaAdsApi.getSummary(clientId, params),
        enabled: !!clientId && clientId > 0,
    });
};

export const useMetaAdsCampaigns = (clientId: number, params?: { startDate?: string; endDate?: string }) => {
    return useQuery({
        queryKey: ["meta-ads-campaigns", clientId, params],
        queryFn: () => metaAdsApi.getCampaigns(clientId, params),
        enabled: !!clientId && clientId > 0,
    });
};

export const useMetaAdsTrends = (clientId: number, params?: { startDate?: string; endDate?: string }) => {
    return useQuery({
        queryKey: ["meta-ads-trends", clientId, params],
        queryFn: () => metaAdsApi.getTrends(clientId, params),
        enabled: !!clientId && clientId > 0,
    });
};

