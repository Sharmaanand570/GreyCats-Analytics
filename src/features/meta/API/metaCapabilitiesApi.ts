import api from "@/apiConfig";
import type { AxiosError } from "axios";
import type {
  CampaignObjective,
  SpecialAdCategory,
} from "./metaAdsManagerApi";

// ==================== TYPES ====================

// Optimization goals Meta exposes for the optimization_goal adset field.
// Backend may add to this list — treat the type as a hint, not a closed enum.
export type OptimizationGoal =
  | "LINK_CLICKS"
  | "LANDING_PAGE_VIEWS"
  | "IMPRESSIONS"
  | "REACH"
  | "POST_ENGAGEMENT"
  | "VIDEO_VIEWS"
  | "THRUPLAY"
  | "LEAD_GENERATION"
  | "OFFSITE_CONVERSIONS"
  | "VALUE";

export type BidStrategy =
  | "LOWEST_COST_WITHOUT_CAP"
  | "LOWEST_COST_WITH_BID_CAP"
  | "COST_CAP"
  | "LOWEST_COST_WITH_MIN_ROAS";

// Placement positions are flat strings like "facebook_feed", "instagram_reels",
// "messenger_story". The platform is encoded as the prefix.
export type PlacementPosition = string;

export type InsightsBreakdown =
  | "age"
  | "gender"
  | "country"
  | "region"
  | "publisher_platform"
  | "platform_position"
  | "impression_device"
  | "device_platform"
  | "hourly_stats_aggregated_by_advertiser_time_zone";

// Feature flags the wizard reads to show/hide entire sub-systems. When a flag
// is `false`, the corresponding UI must hide rather than 404 on a missing
// endpoint. New flags should default to `false` in selectors below.
export type MetaCapabilityFeatures = {
  cbo: boolean;
  dynamic_creative: boolean;
  lead_forms: boolean;
  catalog_ads: boolean;
  capi: boolean;
  automation_rules: boolean;
  approval_workflow: boolean;
  reach_estimate: boolean;
  delivery_estimate: boolean;
  ad_preview: boolean;
  ab_testing: boolean;
  dayparting: boolean;
  frequency_cap: boolean;
  custom_audiences: boolean;
};

export type MetaCapabilities = {
  api_version: string;
  objectives: CampaignObjective[];
  optimization_goals: OptimizationGoal[];
  bid_strategies: BidStrategy[];
  // Publisher platforms (facebook|instagram|messenger|audience_network).
  placements: string[];
  // Granular per-platform positions. Optional — older backends may not return.
  placement_positions?: PlacementPosition[];
  creative_formats: string[];
  destination_types: string[];
  special_ad_categories: SpecialAdCategory[];
  insights_breakdowns?: InsightsBreakdown[];
  attribution_windows?: string[];
  currencies?: string[];
  features: MetaCapabilityFeatures;
};

export type MetaCapabilitiesResponse = {
  success: boolean;
  data: MetaCapabilities;
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
  code?: string;
};

// ==================== API ====================

export const getMetaCapabilities = async (): Promise<MetaCapabilities> => {
  try {
    const response = await api.get<MetaCapabilitiesResponse>(
      "/meta-campaign-wizard/capabilities"
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to load Meta capabilities"
    );
  }
};
