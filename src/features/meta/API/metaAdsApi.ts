import api from "@/apiConfig";

interface Campaign {
    id: string;
    name: string;
    status: string;
    objective: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
}

interface Trend {
    date: string;
    spend: number;
    impressions: number;
    clicks: number;
}

interface MetaSummary {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
}

interface SummaryResponse {
    success: boolean;
    campaigns: Campaign[];
}

interface CampaignsResponse {
    success: boolean;
    campaigns: Campaign[];
}

interface TrendsResponse {
    success: boolean;
    message: string;
    trends: Trend[];
}

interface MetaResponse {
    success: boolean;
    message: string;
    accountId: string;
    accountName: string;
    summary: MetaSummary;
}

export const metaAdsApi = {
    getMeta: async (clientId: number): Promise<MetaResponse> => {
        const response = await api.get(`/clients/${clientId}/meta-ads/meta`);
        return response.data;
    },

    getSummary: async (clientId: number): Promise<SummaryResponse> => {
        const response = await api.get(`/clients/${clientId}/meta-ads/summary`);
        return response.data;
    },

    getCampaigns: async (clientId: number): Promise<CampaignsResponse> => {
        const response = await api.get(`/clients/${clientId}/meta-ads/campaigns`);
        return response.data;
    },

    getTrends: async (clientId: number): Promise<TrendsResponse> => {
        const response = await api.get(`/clients/${clientId}/meta-ads/trends`);
        return response.data;
    },
};
