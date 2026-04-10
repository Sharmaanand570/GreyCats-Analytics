import api from "@/apiConfig";

interface Campaign {
    id: string;
    name: string;
    status: string;
    objective: string;
    spend: number;
    impressions: number;
    clicks: number;
    likes: number; // Added as per user request
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
    getMeta: async (clientId: number, params?: { startDate?: string; endDate?: string }): Promise<MetaResponse> => {
        const response = await api.get(`/clients/${clientId}/meta-ads/meta`, { 
            params,
            timeout: 5000 // Reverted to 5s per user request
        });
        return response.data;
    },

    getSummary: async (clientId: number, params?: { startDate?: string; endDate?: string }): Promise<SummaryResponse> => {
        const response = await api.get(`/clients/${clientId}/meta-ads/summary`, { 
            params,
            timeout: 5000 
        });
        return response.data;
    },

    getCampaigns: async (clientId: number, params?: { startDate?: string; endDate?: string }): Promise<CampaignsResponse> => {
        const response = await api.get(`/clients/${clientId}/meta-ads/campaigns`, { 
            params,
            timeout: 5000 
        });
        return response.data;
    },

    getTrends: async (clientId: number, params?: { startDate?: string; endDate?: string }): Promise<TrendsResponse> => {
        const response = await api.get(`/clients/${clientId}/meta-ads/trends`, { 
            params,
            timeout: 5000 
        });
        return response.data;
    },
};
