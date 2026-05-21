import api from "@/apiConfig";
import type { AxiosError } from "axios";

// ==================== TYPES ====================

export type TargetingInterest = {
  id: string;
  name: string;
  audience_size_lower_bound?: number;
  audience_size_upper_bound?: number;
  path?: string[];
};

export type TargetingLocation = {
  key: string;
  name: string;
  type: string;
  country_code?: string;
  region?: string;
};

export type SearchInterestsResponse = {
  success: boolean;
  data: TargetingInterest[];
};

export type SearchLocationsResponse = {
  success: boolean;
  data: TargetingLocation[];
};

type GeoLocationsBlock = {
  countries?: string[];
  cities?: { key: string; name?: string }[];
  regions?: { key: string; name?: string }[];
  // Meta's "people who: live in / recently were in" filter. Read-only on the
  // wizard for now — preserved by the backend across PUT calls.
  location_types?: string[];
};

type FlexibleSpecItem = { id: string; name: string };
type WorkItem = { id: string; name: string; type: "employer" | "position" | "industry" };
type EducationItem = { id: string; name: string; type: "school" | "field_of_study" };

// One "AND" group of OR'd targeting categories. Meta's modern targeting model
// nests interests/behaviors/etc. inside these groups instead of the flat
// top-level fields.
export type FlexibleSpecGroup = {
  interests?: FlexibleSpecItem[];
  behaviors?: FlexibleSpecItem[];
  demographics?: FlexibleSpecItem[];
  life_events?: FlexibleSpecItem[];
  work?: WorkItem[];
  education?: EducationItem[];
};

export type PublishAdTargeting = {
  geo_locations?: GeoLocationsBlock;
  excluded_geo_locations?: GeoLocationsBlock;
  // Older flat fields — what buildPayload emits today. Meta accepts both shapes.
  interests?: FlexibleSpecItem[];
  excluded_interests?: FlexibleSpecItem[];
  custom_audiences?: { id: string }[];
  excluded_custom_audiences?: { id: string }[];
  behaviors?: FlexibleSpecItem[];
  demographics?: FlexibleSpecItem[];
  life_events?: FlexibleSpecItem[];
  work?: WorkItem[];
  education?: EducationItem[];
  // Modern nested model — what the GET /campaigns/:id endpoint returns.
  flexible_spec?: FlexibleSpecGroup[];
  exclusions?: FlexibleSpecGroup;
};

export type SpecialAdCategory =
  | "NONE"
  | "HOUSING"
  | "EMPLOYMENT"
  | "CREDIT"
  | "ISSUES_ELECTIONS_POLITICS";

export type BudgetType = "DAILY" | "LIFETIME";

export type AdType = "SINGLE_IMAGE" | "CAROUSEL" | "VIDEO";

export type CarouselCard = {
  imageUrl: string;
  headline?: string;
  description?: string;
  link: string;
};

// Round 4c — A/B testing
export type PublishMode = "SINGLE_AD" | "AB_TEST";

export type AdVariant = {
  adHeadline: string;
  adText: string;
  description?: string;
  imageUrl: string;
  ctaButton: CtaButton;
};

export type ConversionEvent =
  | "PURCHASE"
  | "LEAD"
  | "COMPLETE_REGISTRATION"
  | "ADD_TO_CART"
  | "INITIATE_CHECKOUT"
  | "VIEW_CONTENT"
  | "SUBSCRIBE";

export type MetaPixel = {
  id: string;
  name: string;
};

export type MetaPixelsResponse = {
  success: boolean;
  pixels: MetaPixel[];
};

// Round 4 — custom audiences
export type AudienceType = "CUSTOM" | "WEBSITE" | "LOOKALIKE";

export type CustomAudience = {
  id: string;
  name: string;
  type: AudienceType;
  approxSize?: number;
  retentionDays?: number;
  createdAt?: string;
};

export type AudiencesResponse = {
  success: boolean;
  audiences: CustomAudience[];
};

// Meta campaign objectives (the modern "OUTCOME_*" family)
export type CampaignObjective =
  | "OUTCOME_TRAFFIC"
  | "OUTCOME_AWARENESS"
  | "OUTCOME_LEADS"
  | "OUTCOME_SALES"
  | "OUTCOME_ENGAGEMENT";

// Most common call-to-action button values Meta supports
export type CtaButton =
  | "LEARN_MORE"
  | "SHOP_NOW"
  | "SIGN_UP"
  | "DOWNLOAD"
  | "GET_OFFER"
  | "BOOK_TRAVEL"
  | "CONTACT_US"
  | "SUBSCRIBE"
  | "APPLY_NOW"
  | "GET_QUOTE";

export type Gender = "ALL" | "MEN" | "WOMEN";

// Lower-cased publisher platforms the backend forwards to Meta
export type Placement = "facebook" | "instagram" | "audience_network" | "messenger";

// Round 3d — detailed targeting categories the backend's /browse endpoint accepts.
export type DetailedTargetingType =
  | "behaviors"
  | "demographics"
  | "life_events"
  | "work_employers"
  | "work_positions"
  | "education_schools"
  | "education_majors";

export type DetailedTargetingResult = {
  id: string;
  name: string;
  path?: string[];
  audience_size_lower_bound?: number;
  audience_size_upper_bound?: number;
};

export type BrowseTargetingResponse = {
  success: boolean;
  data: DetailedTargetingResult[];
};

export type PublishAdPayload = {
  accountId: string;
  pageId: string;
  campaignName: string;
  // Either dailyBudget or lifetimeBudget is sent — never both. budgetType
  // discriminates which one applies.
  dailyBudget?: number;
  // Shared across SINGLE_AD ad types; in AB_TEST mode each variant has its own.
  adText?: string;
  // SINGLE_IMAGE creative fields — sent only when adType is SINGLE_IMAGE.
  // For CAROUSEL these are replaced by `carouselCards` (one per card).
  adHeadline?: string;
  adLink?: string;
  imageUrl?: string;
  targeting?: PublishAdTargeting;
  // Tier-1 additions — all optional per backend contract
  objective?: CampaignObjective;
  ctaButton?: CtaButton;
  ageRange?: { min: number; max: number };
  gender?: Gender;
  placements?: Placement[];
  // Round 2 additions
  specialAdCategory?: SpecialAdCategory;
  startTime?: string;
  endTime?: string;
  description?: string;
  budgetType?: BudgetType;
  lifetimeBudget?: number;
  // Round 3a — required when objective === "OUTCOME_SALES"
  pixelId?: string;
  conversionEvent?: ConversionEvent;
  // Round 3b — when CAROUSEL, send carouselCards instead of (imageUrl, adHeadline, adLink)
  adType?: AdType;
  carouselCards?: CarouselCard[];
  // Round 3c — when VIDEO, send these fields. Backend handles the two-step
  // Meta upload (advideos asset → creative reference) internally.
  videoUrl?: string;
  videoThumbnailUrl?: string;
  captionsUrl?: string;
  // Round 4c — A/B test mode. When AB_TEST, send adVariants[] instead of
  // single-creative fields. Response shape changes — backend returns `ads[]`.
  publishMode?: PublishMode;
  adVariants?: AdVariant[];
};

export type PublishAdResult = {
  campaignId: string;
  adSetId: string;
  // Single-ad mode returns these; AB-test mode populates `ads[]` instead.
  creativeId?: string;
  adId?: string;
  ads?: { adId: string; creativeId: string }[];
};

export type PublishAdResponse = {
  success: boolean;
  message?: string;
  data?: PublishAdResult;
  rawError?: unknown;
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
  rawError?: unknown;
};

// ==================== API FUNCTIONS ====================

export const searchInterests = async (q: string): Promise<TargetingInterest[]> => {
  try {
    const response = await api.get<SearchInterestsResponse>(
      "/meta-campaign-wizard/targeting/search",
      { params: { q } }
    );
    return response.data.data ?? [];
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to search audience interests"
    );
  }
};

export const browseTargeting = async (
  type: DetailedTargetingType,
  q: string
): Promise<DetailedTargetingResult[]> => {
  try {
    const response = await api.get<BrowseTargetingResponse>(
      "/meta-campaign-wizard/targeting/browse",
      { params: { type, q } }
    );
    return response.data.data ?? [];
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to browse detailed targeting"
    );
  }
};

export const searchLocations = async (q: string): Promise<TargetingLocation[]> => {
  try {
    const response = await api.get<SearchLocationsResponse>(
      "/meta-campaign-wizard/targeting/locations",
      { params: { q } }
    );
    return response.data.data ?? [];
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to search locations"
    );
  }
};

export type CampaignStatus = "ACTIVE" | "PAUSED" | "DELETED";

export type UpdateCampaignStatusResponse = {
  success: boolean;
  message?: string;
  data?: { success: boolean };
};

export type UpdateCampaignPayload = {
  // Campaign level
  name?: string;
  status?: CampaignStatus;
  objective?: CampaignObjective;
  specialAdCategory?: SpecialAdCategory;
  // Ad set level — pass the exact IDs returned by GET so backend doesn't have
  // to guess which adset/ad inside the campaign to mutate.
  adSetId?: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  startTime?: string;
  endTime?: string;
  targeting?: PublishAdTargeting;
  ageRange?: { min: number; max: number };
  gender?: Gender;
  placements?: Placement[];
  // Ad/creative level — accountId + pageId required when creative fields change
  adId?: string;
  accountId?: string;
  pageId?: string;
  adType?: AdType;
  adText?: string;
  adHeadline?: string;
  description?: string;
  adLink?: string;
  imageUrl?: string;
  ctaButton?: CtaButton;
  carouselCards?: CarouselCard[];
  videoUrl?: string;
  videoThumbnailUrl?: string;
  captionsUrl?: string;
};

export type UpdateCampaignResponse = {
  success: boolean;
  message?: string;
};

export const updateCampaignStatus = async (
  campaignId: string,
  status: CampaignStatus,
  clientId: number
): Promise<UpdateCampaignStatusResponse> => {
  try {
    const response = await api.post<UpdateCampaignStatusResponse>(
      `/meta-campaign-wizard/campaigns/${campaignId}/status`,
      { status },
      { params: { clientId } }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        `Failed to update campaign status to ${status}`
    );
  }
};

// Shape returned by GET /api/meta-campaign-wizard/campaigns/:campaignId — backend
// flattens Meta's Campaign → AdSet → Ad → Creative tree into a single object
// that mirrors the PUT payload so the wizard can drop it into WizardFormState.
export type CampaignDetails = {
  // Campaign level
  name?: string;
  status?: CampaignStatus;
  objective?: CampaignObjective;
  specialAdCategory?: SpecialAdCategory;
  accountId?: string;
  // Ad set level
  adSetId?: string;
  budgetType?: BudgetType;
  dailyBudget?: number;
  lifetimeBudget?: number;
  startTime?: string;
  endTime?: string;
  targeting?: PublishAdTargeting;
  ageRange?: { min: number; max: number };
  gender?: Gender;
  placements?: Placement[];
  pixelId?: string;
  conversionEvent?: ConversionEvent;
  // Ad/creative level
  adId?: string;
  pageId?: string;
  adType?: AdType;
  adText?: string;
  adHeadline?: string;
  description?: string;
  adLink?: string;
  imageUrl?: string;
  ctaButton?: CtaButton;
  carouselCards?: CarouselCard[];
  videoUrl?: string;
  videoThumbnailUrl?: string;
  captionsUrl?: string;
};

export type CampaignDetailsResponse = {
  success: boolean;
  data: CampaignDetails;
};

export const getCampaignDetails = async (
  campaignId: string,
  clientId: number
): Promise<CampaignDetails> => {
  try {
    const response = await api.get<CampaignDetailsResponse>(
      `/meta-campaign-wizard/campaigns/${campaignId}`,
      { params: { clientId } }
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const backendMsg =
      axiosError.response?.data?.message || axiosError.response?.data?.error;
    const statusPart = status ? ` (HTTP ${status})` : "";
    throw new Error(
      backendMsg
        ? `${backendMsg}${statusPart}`
        : `Failed to load campaign details${statusPart}: ${axiosError.message}`
    );
  }
};

export const updateCampaign = async (
  campaignId: string,
  payload: UpdateCampaignPayload,
  clientId: number
): Promise<UpdateCampaignResponse> => {
  try {
    const response = await api.put<UpdateCampaignResponse>(
      `/meta-campaign-wizard/campaigns/${campaignId}`,
      payload,
      { params: { clientId } }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to update campaign"
    );
  }
};

export const publishAd = async (payload: PublishAdPayload): Promise<PublishAdResponse> => {
  try {
    const response = await api.post<PublishAdResponse>(
      "/meta-campaign-wizard/publish",
      payload
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const message =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to publish ad";
    const err = new Error(message) as Error & { rawError?: unknown };
    err.rawError = axiosError.response?.data?.rawError;
    throw err;
  }
};
