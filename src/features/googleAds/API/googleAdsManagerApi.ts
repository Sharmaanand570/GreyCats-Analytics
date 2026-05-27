import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type ApiErrorResponse = {
  message?: string;
  error?: string;
  rawError?: unknown;
};

// Google Ads campaign objectives — mirror what Google's UI offers.
export type GoogleAdsObjective =
  | "SALES"
  | "LEADS"
  | "WEBSITE_TRAFFIC"
  | "BRAND_AWARENESS"
  | "LOCAL_STORE_VISITS"
  | "NO_GUIDANCE";

// Campaign type — drives Step 4 (keywords only for SEARCH) and Step 5 (creative shape).
export type GoogleAdsCampaignType = "SEARCH" | "DISPLAY" | "PERFORMANCE_MAX";

// Networks — only meaningful for SEARCH; SEARCH defaults on, DISPLAY off.
export type GoogleAdsNetwork = "SEARCH" | "DISPLAY" | "SEARCH_PARTNERS";

// Bidding focus — what the optimizer chases. Each unlocks different bid inputs.
export type BiddingFocus = "CONVERSIONS" | "CONVERSION_VALUE" | "CLICKS" | "IMPRESSION_SHARE";

// Bid strategy — derived from focus. We send this on the wire.
export type BidStrategy =
  | "MAXIMIZE_CONVERSIONS"
  | "TARGET_CPA"
  | "MAXIMIZE_CONVERSION_VALUE"
  | "TARGET_ROAS"
  | "MAXIMIZE_CLICKS"
  | "MANUAL_CPC"
  | "TARGET_IMPRESSION_SHARE";

export type BudgetType = "DAILY" | "TOTAL";

export type LocationTargetMode = "ALL_COUNTRIES" | "LOCAL_COUNTRY" | "CUSTOM";

// Location preset — "Presence or Interest" is Google's default; "Presence only"
// restricts to people physically in the location.
export type LocationPreset = "PRESENCE_OR_INTEREST" | "PRESENCE_ONLY";

// A weekly dayparting block. `days` uses Google's encoding 0=Monday … 6=Sunday.
// Hours are 0-23 in the customer's account timezone.
export type AdScheduleBlock = {
  days: number[];
  startHour: number;
  endHour: number;
};

export type CtaType =
  | "LEARN_MORE"
  | "SHOP_NOW"
  | "SIGN_UP"
  | "CONTACT_US"
  | "DOWNLOAD"
  | "BOOK_NOW"
  | "APPLY_NOW"
  | "GET_QUOTE"
  | "SUBSCRIBE";

// Pin position for RSA headlines (1-3) and descriptions (1-2). UNPINNED means
// Google can place the asset in any slot.
export type PinPosition = "UNPINNED" | "POSITION_1" | "POSITION_2" | "POSITION_3";

export type RsaHeadline = {
  text: string;
  pin: PinPosition;
};

export type RsaDescription = {
  text: string;
  pin: Exclude<PinPosition, "POSITION_3">;
};

export type DisplayImageAsset = {
  url: string;
  // Aspect ratio enforced by the cropper. "1.91:1" = landscape, "1:1" = square.
  aspect: "LANDSCAPE" | "SQUARE";
};

// ==================== LOCATION AUTOCOMPLETE ====================

export type GoogleAdsLocation = {
  // Google's geo target constant ID — what publish expects.
  id: string;
  name: string;
  // Type hint for UI grouping — "Country", "City", "Region", etc. Whatever
  // Google's autocomplete returns; we don't enum it.
  type?: string;
  countryCode?: string;
  canonicalName?: string;
};

export type SelectedLocation = GoogleAdsLocation & {
  excluded?: boolean;
};

export type GoogleAdsLocationsResponse = {
  success: boolean;
  data: GoogleAdsLocation[];
};

export const searchGoogleAdsLocations = async (
  q: string
): Promise<GoogleAdsLocation[]> => {
  try {
    const res = await api.get<GoogleAdsLocationsResponse>(
      "/google-ads/manage/locations",
      { params: { q } }
    );
    return res.data.data ?? [];
  } catch (error) {
    const e = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      e.response?.data?.message ||
        e.response?.data?.error ||
        "Failed to search locations"
    );
  }
};

// ==================== CONVERSION ACTIONS ====================

export type GoogleAdsConversionAction = {
  id: string;
  name: string;
  category?: string;
  status?: "ENABLED" | "REMOVED" | "PAUSED";
  countingType?: string;
};

export type GoogleAdsConversionActionsResponse = {
  success: boolean;
  data: GoogleAdsConversionAction[];
};

export const getGoogleAdsConversionActions = async (
  params?: { clientId?: number; customerId?: string }
): Promise<GoogleAdsConversionAction[]> => {
  try {
    const res = await api.get<GoogleAdsConversionActionsResponse>(
      "/google-ads/manage/conversion-actions",
      { params }
    );
    return res.data.data ?? [];
  } catch (error) {
    const e = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      e.response?.data?.message ||
        e.response?.data?.error ||
        "Failed to load conversion actions"
    );
  }
};

// ==================== KEYWORD RECOMMENDATIONS ====================

export type GoogleAdsKeywordIdea = {
  text: string;
  avgMonthlySearches?: number;
  competition?: "LOW" | "MEDIUM" | "HIGH";
  // Low/high range in micros — display as currency / 1_000_000.
  lowTopBidMicros?: number;
  highTopBidMicros?: number;
};

export type KeywordRecommendationsPayload = {
  url?: string;
  description?: string;
  // Locale + geo to scope the recommendations. Optional; backend has defaults.
  languageId?: string;
  locationIds?: string[];
};

export type KeywordRecommendationsResponse = {
  success: boolean;
  data: GoogleAdsKeywordIdea[];
};

export const getKeywordRecommendations = async (
  payload: KeywordRecommendationsPayload,
  params?: { clientId?: number; customerId?: string }
): Promise<GoogleAdsKeywordIdea[]> => {
  try {
    const res = await api.post<KeywordRecommendationsResponse>(
      "/google-ads/manage/keywords/recommendations",
      payload,
      { params }
    );
    return res.data.data ?? [];
  } catch (error) {
    const e = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      e.response?.data?.message ||
        e.response?.data?.error ||
        "Failed to generate keyword ideas"
    );
  }
};

// ==================== PUBLISH ====================

// Keyword line — text + match type. The wizard's text-area accepts Google's
// match-type syntax ("foo" "phrase" [exact]); the builder parses it into rows
// before sending.
export type KeywordMatchType = "BROAD" | "PHRASE" | "EXACT";

export type PublishKeyword = {
  text: string;
  matchType: KeywordMatchType;
};

export type PublishLocationTarget = {
  geoTargetConstantId: string;
  name?: string;
  excluded?: boolean;
};

export type PublishAdScheduleEntry = {
  days: number[];
  startHour: number;
  endHour: number;
};

export type PublishRsaCreative = {
  finalUrl: string;
  path1?: string;
  path2?: string;
  headlines: RsaHeadline[];
  descriptions: RsaDescription[];
  sitelinks?: Array<{ text: string; line1: string; line2: string; url: string }>;
  callouts?: string[];
  snippetsHeader?: string;
  snippetsValues?: string[];
  callCountryCode?: string;
  callPhoneNumber?: string;
};

export type PublishDisplayCreative = {
  finalUrl: string;
  businessName: string;
  longHeadline: string;
  headlines: string[];
  descriptions: string[];
  images: DisplayImageAsset[];
  logos: DisplayImageAsset[];
  youtubeVideoUrls?: string[];
  accentColor?: string;
  mainColor?: string;
  callToAction?: CtaType;
  displayEnhance?: boolean;
  displayAutoVideo?: boolean;
  displayNative?: boolean;
};

export type GoogleAdsPublishPayload = {
  // Required — which Google Ads customer account this campaign belongs to.
  customerId: string;
  clientId: number;
  campaignName: string;
  objective: GoogleAdsObjective;
  campaignType: GoogleAdsCampaignType;
  // Step 2
  networks: GoogleAdsNetwork[];
  locationMode: LocationTargetMode;
  locations: PublishLocationTarget[];
  locationPreset: LocationPreset;
  languageIds: string[];
  adSchedule?: PublishAdScheduleEntry[];
  campaignStartDate?: string;
  campaignEndDate?: string;
  adRotation?: "OPTIMIZE" | "ROTATE_FOREVER";
  // Step 3
  biddingFocus: BiddingFocus;
  bidStrategy: BidStrategy;
  targetCpaMicros?: number;
  targetRoasPercent?: number;
  maxCpcBidMicros?: number;
  conversionActionId?: string;
  budgetType: BudgetType;
  budgetAmount: number;
  customerAcquisition?: boolean;
  acquisitionOptimizeNew?: boolean;
  targetImpressionShareLocation?: "ANYWHERE" | "TOP" | "ABSOLUTE_TOP";
  targetImpressionSharePercent?: number;
  targetImpressionShareMaxCpcMicros?: number;
  // Step 4 — SEARCH only
  adGroupName?: string;
  keywords?: PublishKeyword[];
  // Step 5 — one of these depending on campaignType
  rsaCreative?: PublishRsaCreative;
  displayCreative?: PublishDisplayCreative;
  // Tracking (Shared)
  trackingTemplate?: string;
  finalUrlSuffix?: string;
  customParameters?: Array<{ key: string; value: string }>;
};

export type PublishJobState =
  | "QUEUED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "FAILED"
  | "PARTIAL"
  | "NEEDS_REVIEW";

export const TERMINAL_JOB_STATES: ReadonlySet<PublishJobState> = new Set([
  "PUBLISHED",
  "FAILED",
  "PARTIAL",
  "NEEDS_REVIEW",
]);

// Steps the backend reports during async publish — used by the progress UI.
export type PublishJobStep = {
  key: string;
  label: string;
  status: "PENDING" | "RUNNING" | "DONE" | "FAILED";
  message?: string;
};

export type GoogleAdsPublishJob = {
  jobId: string;
  state: PublishJobState;
  steps?: PublishJobStep[];
  customerId?: string;
  campaignId?: string;
  adGroupId?: string;
  adIds?: string[];
  lastError?: string;
  // Backend hint for next poll cadence (ms). Falls back to 3s.
  pollAfter?: number;
  startedAt?: string;
  completedAt?: string;
};

export type SubmitPublishResponse = {
  success: boolean;
  message?: string;
  data: { jobId: string; state: PublishJobState };
};

export type GetPublishJobResponse = {
  success: boolean;
  data: GoogleAdsPublishJob;
};

export const submitGoogleAdsPublish = async (
  payload: GoogleAdsPublishPayload & { idempotencyKey: string }
): Promise<{ jobId: string; state: PublishJobState }> => {
  try {
    const res = await api.post<SubmitPublishResponse>(
      "/google-ads/manage/publish",
      payload
    );
    return res.data.data;
  } catch (error) {
    const e = error as AxiosError<ApiErrorResponse>;
    const message =
      e.response?.data?.message ||
      e.response?.data?.error ||
      "Failed to submit Google Ads campaign";
    const err = new Error(message) as Error & { rawError?: unknown };
    err.rawError = e.response?.data?.rawError;
    throw err;
  }
};

export const getGoogleAdsPublishStatus = async (
  jobId: string
): Promise<GoogleAdsPublishJob> => {
  try {
    const res = await api.get<GetPublishJobResponse>(
      `/google-ads/manage/publish/status/${jobId}`
    );
    return res.data.data;
  } catch (error) {
    const e = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      e.response?.data?.message ||
        e.response?.data?.error ||
        "Failed to fetch publish status"
    );
  }
};
