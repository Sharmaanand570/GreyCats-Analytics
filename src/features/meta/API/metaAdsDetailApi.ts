import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

// Account-level diagnostics from GET /accounts/:accountId/diagnostics.
// Backend forwards account_status / spend_cap / balance plus an aggregated
// issues[] of disapprovals + delivery problems across the account.
export type MetaAccountDiagnostics = {
  account_status: string;
  disable_reason?: number;
  is_prepay_account?: boolean;
  balance?: string;
  spend_cap?: string;
  amount_spent?: string;
  funding_source_details?: {
    display_string?: string;
    id?: string;
  };
  issues?: Array<{
    level: "CAMPAIGN" | "ADSET" | "AD";
    id: string;
    title: string;
    description?: string;
  }>;
};

export type AccountDiagnosticsResponse = {
  success: boolean;
  data: MetaAccountDiagnostics;
};

// Sync status — per-object-type lastSyncedAt + queue depth.
export type SyncStatusEntry = {
  objectType: "campaign" | "adset" | "ad" | "creative" | "insight";
  lastSyncedAt: string | null;
  pendingJobs: number;
};

export type SyncStatusResponse = {
  success: boolean;
  data: SyncStatusEntry[];
};

// Insights with breakdowns — backend forwards Meta's breakdown[] enum.
// Numeric values arrive as strings from Meta; consumers must Number() them.
export type InsightBreakdownRow = {
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
  // Breakdown dimensions (any subset depending on requested breakdowns[]).
  age?: string;
  gender?: string;
  country?: string;
  region?: string;
  publisher_platform?: string;
  platform_position?: string;
  impression_device?: string;
  device_platform?: string;
  hourly_stats_aggregated_by_advertiser_time_zone?: string;
  // Metrics
  impressions?: string;
  clicks?: string;
  spend?: string;
  reach?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  actions?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
  purchase_roas?: Array<{ action_type: string; value: string }>;
};

export type InsightsBreakdownResponse = {
  success: boolean;
  data: InsightBreakdownRow[];
};

export type InsightsBreakdownParams = {
  level: "account" | "campaign" | "adset" | "ad";
  objectIds?: string[];
  startDate?: string;
  endDate?: string;
  fields?: string[];
  breakdowns?: string[];
  attributionWindows?: string[];
};

// Duplicate response shape — always returns the new object's ID. `deep`
// duplicates children too (adsets + ads + creatives).
export type DuplicateResponse = {
  success: boolean;
  data: { id: string; name?: string };
};

type ApiErrorResponse = { message?: string; error?: string };

// ==================== API ====================

export const getAccountDiagnostics = async (
  clientId: number,
  accountId: string
): Promise<MetaAccountDiagnostics> => {
  try {
    const res = await api.get<AccountDiagnosticsResponse>(
      `/clients/${clientId}/meta-ads/accounts/${accountId}/diagnostics`
    );
    return res.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to load account diagnostics"
    );
  }
};

export const getSyncStatus = async (
  clientId: number
): Promise<SyncStatusEntry[]> => {
  try {
    // Backend-confirmed path 2026-05-26: /sync-status/:clientId/meta_ads
    // (not the /clients/:clientId/meta-ads/sync-status I originally guessed).
    const res = await api.get<SyncStatusResponse>(
      `/sync-status/${clientId}/meta_ads`
    );
    return res.data.data ?? [];
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to load sync status"
    );
  }
};

export const getInsightsBreakdown = async (
  clientId: number,
  params: InsightsBreakdownParams
): Promise<InsightBreakdownRow[]> => {
  try {
    const res = await api.get<InsightsBreakdownResponse>(
      `/clients/${clientId}/meta-ads/insights`,
      {
        params: {
          level: params.level,
          object_ids: params.objectIds?.join(","),
          start_date: params.startDate,
          end_date: params.endDate,
          fields: params.fields?.join(","),
          breakdowns: params.breakdowns?.join(","),
          action_attribution_windows: params.attributionWindows?.join(","),
        },
      }
    );
    return res.data.data ?? [];
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to load insights breakdown"
    );
  }
};

export const duplicateCampaign = async (
  clientId: number,
  campaignId: string,
  deep = true
): Promise<{ id: string; name?: string }> => {
  try {
    const res = await api.post<DuplicateResponse>(
      `/meta-campaign-wizard/campaigns/${campaignId}/duplicate`,
      { deep },
      { params: { clientId } }
    );
    return res.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to duplicate campaign"
    );
  }
};
