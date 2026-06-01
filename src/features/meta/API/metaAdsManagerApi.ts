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
  // wizard for now ΓÇö preserved by the backend across PUT calls.
  location_types?: string[];
  // PR C ΓÇö ZIP/postal code targeting. Meta expects { key, name } pairs.
  zips?: { key: string; name?: string }[];
  // PR C ΓÇö radius targeting around a lat/lng pin.
  custom_locations?: Array<{
    latitude: number;
    longitude: number;
    radius: number;
    distance_unit: "mile" | "kilometer";
    name?: string;
  }>;
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
  // Older flat fields ΓÇö what buildPayload emits today. Meta accepts both shapes.
  interests?: FlexibleSpecItem[];
  excluded_interests?: FlexibleSpecItem[];
  custom_audiences?: { id: string }[];
  excluded_custom_audiences?: { id: string }[];
  behaviors?: FlexibleSpecItem[];
  demographics?: FlexibleSpecItem[];
  life_events?: FlexibleSpecItem[];
  work?: WorkItem[];
  education?: EducationItem[];
  // Modern nested model ΓÇö what the GET /campaigns/:id endpoint returns.
  flexible_spec?: FlexibleSpecGroup[];
  exclusions?: FlexibleSpecGroup;
  // PR C ΓÇö language / OS / device targeting
  locales?: number[];
  user_os?: string[];
  device_platforms?: string[];
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
  // When "VIDEO", the card uses videoUrl as its media (imageUrl falls back to
  // a poster frame). Defaults to "IMAGE" if unset, preserving the legacy shape.
  mediaType?: "IMAGE" | "VIDEO";
  videoUrl?: string;
};

// Round 4c ΓÇö A/B testing
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

// Round 4 ΓÇö custom audiences
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
  | "OUTCOME_ENGAGEMENT"
  | "OUTCOME_APP_PROMOTION";

// Most common call-to-action button values Meta supports.
// "NO_BUTTON" is a UI-only marker; backend should omit the call_to_action field
// when this value is sent (Meta defaults to "Learn more" on FB/IG/WhatsApp).
export type CtaButton =
  | "NO_BUTTON"
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

// Round 3d ΓÇö detailed targeting categories the backend's /browse endpoint accepts.
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
  // Either dailyBudget or lifetimeBudget is sent ΓÇö never both. budgetType
  // discriminates which one applies.
  dailyBudget?: number;
  // Shared across SINGLE_AD ad types; in AB_TEST mode each variant has its own.
  adText?: string;
  // SINGLE_IMAGE creative fields ΓÇö sent only when adType is SINGLE_IMAGE.
  // For CAROUSEL these are replaced by `carouselCards` (one per card).
  adHeadline?: string;
  adLink?: string;
  imageUrl?: string;
  targeting?: PublishAdTargeting;
  // Tier-1 additions ΓÇö all optional per backend contract
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
  // Round 3a ΓÇö required when objective === "OUTCOME_SALES"
  pixelId?: string;
  conversionEvent?: ConversionEvent;
  // Round 3b ΓÇö when CAROUSEL, send carouselCards instead of (imageUrl, adHeadline, adLink)
  adType?: AdType;
  carouselCards?: CarouselCard[];
  // Round 3c ΓÇö when VIDEO, send these fields. Backend handles the two-step
  // Meta upload (advideos asset ΓåÆ creative reference) internally.
  videoUrl?: string;
  videoThumbnailUrl?: string;
  captionsUrl?: string;
  // Round 4c ΓÇö A/B test mode. When AB_TEST, send adVariants[] instead of
  // single-creative fields. Response shape changes ΓÇö backend returns `ads[]`.
  publishMode?: PublishMode;
  adVariants?: AdVariant[];
  // PR C ΓÇö granular placement positions (e.g. "facebook_feed", "instagram_reels")
  placementPositions?: string[];
  // PR E ΓÇö destination + commerce / lead-form / dynamic creative
  destinationType?: string;
  leadFormId?: string;
  catalogId?: string;
  productSetId?: string;
  instantExperienceId?: string;
  phoneNumber?: string;
  dynamicCreative?: boolean;
  urlTags?: string;
  // PR L ΓÇö Meta UX parity additions not already in "Spec Alignment" below.
  // Every field optional; backend ignores unset ones.
  campaignSpendingLimit?: number;
  abTestEnabled?: boolean;
  chargedEvent?: string;
  deliveryType?: string;
  adSetSpendLimitMin?: number;
  adSetSpendLimitMax?: number;
  useAdvantagePlusAudience?: boolean;
  savedAudienceId?: string;
  excludedCustomAudiences?: Array<{ id: string }>;
  languages?: number[];
  connections?: Array<{ type: string; ids: string[] }>;
  advantagePlusPlacement?: boolean;
  wifiOnly?: boolean;
  inventoryFilter?: string;
  blockLists?: string[];
  contentTypeExclusions?: string[];
  instagramActorId?: string;
  partnershipAdCode?: string;
  adTexts?: string[];
  adHeadlines?: string[];
  descriptions?: string[];
  callToActions?: string[];
  advantagePlusCreative?: boolean;
  displayLink?: string;
  urlParameters?: string;
  appEvents?: boolean;
  offlineEvents?: boolean;
  thirdPartyPixelIds?: string[];
  // PR L (post-spec) ΓÇö App promotion. Backend already wires p.promotedObject
  // into the publish queue per the 2026-05-26 integration note.
  promotedObject?: {
    application_id?: string;
    object_store_url?: string;
    pixel_id?: string;
    custom_event_type?: string;
    page_id?: string;
  };
  // PR B ΓÇö adset/campaign advanced fields. All optional; backend applies
  // Meta defaults when omitted.
  isCbo?: boolean;
  // Only meaningful when isCbo === true ΓÇö backend ignores when CBO is off.
  budgetRebalanceFlag?: boolean;
  bidStrategy?: string;
  bidAmount?: number;
  dsaBeneficiary?: string;
  dsaPayor?: string;
  optimizationGoal?: string;
  billingEvent?: string;
  attributionSpec?: Array<{
    event_type: "CLICK_THROUGH" | "VIEW_THROUGH";
    window_days: number;
  }>;
  frequencyControlSpecs?: Array<{
    event: "IMPRESSIONS";
    interval_days: number;
    max_frequency: number;
  }>;
  adsetSchedule?: Array<{
    days: number[];
    hours_start: number;
    hours_end: number;
    timezone_type?: string;
  }>;
  // Spec Alignment Additions
  adSetName?: string;
  adName?: string;
  conversionLocation?: string;
  audienceMode?: "ADVANTAGE_PLUS" | "ORIGINAL";
  adsetSpendLimitEnabled?: boolean;
  minDailySpend?: number;
  maxDailySpend?: number;
  partnershipAd?: boolean;
  advantageCreative?: boolean;
  placementStrategy?: "ADVANTAGE" | "MANUAL";
  costPerResultGoal?: number;
  messagingApps?: Array<"MESSENGER" | "INSTAGRAM_DM" | "WHATSAPP">;
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
  // Ad set level ΓÇö pass the exact IDs returned by GET so backend doesn't have
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
  // Ad/creative level ΓÇö accountId + pageId required when creative fields change
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
  // PR C granular placements
  placementPositions?: string[];
  // PR E destination + commerce
  destinationType?: string;
  leadFormId?: string;
  catalogId?: string;
  productSetId?: string;
  instantExperienceId?: string;
  phoneNumber?: string;
  dynamicCreative?: boolean;
  urlTags?: string;
  // PR L ΓÇö Meta UX parity additions (same as PublishAdPayload).
  campaignSpendingLimit?: number;
  abTestEnabled?: boolean;
  chargedEvent?: string;
  deliveryType?: string;
  adSetSpendLimitMin?: number;
  adSetSpendLimitMax?: number;
  useAdvantagePlusAudience?: boolean;
  savedAudienceId?: string;
  excludedCustomAudiences?: Array<{ id: string }>;
  languages?: number[];
  connections?: Array<{ type: string; ids: string[] }>;
  advantagePlusPlacement?: boolean;
  wifiOnly?: boolean;
  inventoryFilter?: string;
  blockLists?: string[];
  contentTypeExclusions?: string[];
  instagramActorId?: string;
  partnershipAdCode?: string;
  adTexts?: string[];
  adHeadlines?: string[];
  descriptions?: string[];
  callToActions?: string[];
  advantagePlusCreative?: boolean;
  displayLink?: string;
  urlParameters?: string;
  appEvents?: boolean;
  offlineEvents?: boolean;
  thirdPartyPixelIds?: string[];
  promotedObject?: {
    application_id?: string;
    object_store_url?: string;
    pixel_id?: string;
    custom_event_type?: string;
    page_id?: string;
  };
  // PR B advanced fields
  isCbo?: boolean;
  budgetRebalanceFlag?: boolean;
  bidStrategy?: string;
  bidAmount?: number;
  dsaBeneficiary?: string;
  dsaPayor?: string;
  optimizationGoal?: string;
  billingEvent?: string;
  attributionSpec?: Array<{
    event_type: "CLICK_THROUGH" | "VIEW_THROUGH";
    window_days: number;
  }>;
  frequencyControlSpecs?: Array<{
    event: "IMPRESSIONS";
    interval_days: number;
    max_frequency: number;
  }>;
  adsetSchedule?: Array<{
    days: number[];
    hours_start: number;
    hours_end: number;
    timezone_type?: string;
  }>;
  // Spec Alignment Additions
  adSetName?: string;
  adName?: string;
  conversionLocation?: string;
  audienceMode?: "ADVANTAGE_PLUS" | "ORIGINAL";
  adsetSpendLimitEnabled?: boolean;
  minDailySpend?: number;
  maxDailySpend?: number;
  partnershipAd?: boolean;
  advantageCreative?: boolean;
  placementStrategy?: "ADVANTAGE" | "MANUAL";
  costPerResultGoal?: number;
  messagingApps?: Array<"MESSENGER" | "INSTAGRAM_DM" | "WHATSAPP">;
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

// Shape returned by GET /api/meta-campaign-wizard/campaigns/:campaignId ΓÇö backend
// flattens Meta's Campaign ΓåÆ AdSet ΓåÆ Ad ΓåÆ Creative tree into a single object
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
  // Spec Alignment Additions
  adSetName?: string;
  adName?: string;
  conversionLocation?: string;
  audienceMode?: "ADVANTAGE_PLUS" | "ORIGINAL";
  adsetSpendLimitEnabled?: boolean;
  minDailySpend?: number;
  maxDailySpend?: number;
  partnershipAd?: boolean;
  advantageCreative?: boolean;
  placementStrategy?: "ADVANTAGE" | "MANUAL";
  costPerResultGoal?: number;
  dynamicCreative?: boolean;
  messagingApps?: Array<"MESSENGER" | "INSTAGRAM_DM" | "WHATSAPP">;
  // PR L ΓÇö fields carried through from the hierarchical GET so edit-mode
  // prefill can restore them. toCampaignDetails() (raw ΓåÆ flat) populates
  // these; toWizardFormState() (flat ΓåÆ wizard) reads them. All optional ΓÇö
  // a flat object without them prefills with INITIAL_FORM_STATE defaults.
  isCbo?: boolean;
  budgetRebalanceFlag?: boolean;
  bidStrategy?: string;
  bidAmount?: number;
  campaignSpendingLimit?: number;
  dsaBeneficiary?: string;
  dsaPayor?: string;
  abTestEnabled?: boolean;
  deliveryType?: string;
  adSetSpendLimitMin?: number;
  adSetSpendLimitMax?: number;
  inventoryFilter?: string;
  blockLists?: string[];
  contentTypeExclusions?: string[];
  useAdvantagePlusAudience?: boolean;
  advantagePlusPlacement?: boolean;
  wifiOnly?: boolean;
  optimizationGoal?: string;
  billingEvent?: string;
  attributionWindow?: string;
  frequencyCapImpressions?: number;
  frequencyCapIntervalDays?: number;
  // Creative-level
  instagramActorId?: string;
  partnershipAdCode?: string;
  advantagePlusCreative?: boolean;
  adTexts?: string[];
  adHeadlines?: string[];
  descriptions?: string[];
  callToActions?: string[];
  urlTags?: string;
  displayLink?: string;
  // Tracking
  trackingAppEvents?: boolean;
  trackingOfflineEvents?: boolean;
  thirdPartyPixelIds?: string[];
  // App promotion
  applicationId?: string;
  objectStoreUrl?: string;
  // Disapproval reason ΓÇö surfaced for the UI's disapproval banner.
  disapprovalReason?: string;
};

export type CampaignDetailsResponse = {
  success: boolean;
  data: CampaignDetails;
};

// ==================== HIERARCHICAL CAMPAIGN RESPONSE ====================
//
// As of the backend migration (2026-05-25), GET /campaigns/:id returns a
// hierarchical envelope: { campaign, adSets: [{ ads: [{ creative }] }],
// legacy }. The `legacy` block preserves the old flat shape for one release
// so the wizard can hydrate without a backend round-trip.
//
// New consumers (campaign list page, detail table) should use the hierarchical
// types directly. The wizard sticks with CampaignDetails (the flat shape),
// which getCampaignDetails synthesizes from the hierarchical response.

// Campaign-level Meta object as returned by GET /campaigns/:id.
export type MetaCampaignNode = {
  id: string;
  name: string;
  status: CampaignStatus;
  effective_status?: string;
  objective?: CampaignObjective;
  special_ad_categories?: SpecialAdCategory[];
  buying_type?: "AUCTION" | "RESERVED";
  bid_strategy?: string;
  daily_budget?: number | null;
  lifetime_budget?: number | null;
  spend_cap?: number | null;
  start_time?: string | null;
  stop_time?: string | null;
  account_id?: string;
  recommendations?: MetaRecommendation[];
  issues_info?: MetaIssue[];
  dsa_beneficiary?: string | null;
  dsa_payor?: string | null;
  is_cbo?: boolean;
  etag?: string;
  last_synced_at?: string;
  // PR L raw fields backend returns from the campaign Graph query.
  // spend_cap is already divided-by-100 (dollars) per backend's spec.
  budget_rebalance_flag?: boolean;
  ab_test_enabled?: boolean;
  // execution_options[] carries flags like "include_in_ab_test"
  execution_options?: string[];
};

// Ad set node. `targeting` arrives in Meta's raw shape: numeric `genders[]`,
// `age_min`/`age_max`, and either flexible_spec or flat legacy fields. The
// adapter (toCampaignDetails below) normalizes these for the wizard.
export type MetaAdSetNode = {
  id: string;
  name: string;
  status: CampaignStatus;
  effective_status?: string;
  optimization_goal?: string;
  billing_event?: string;
  bid_amount?: number;
  bid_strategy?: string;
  daily_budget?: number | null;
  lifetime_budget?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  targeting?: MetaRawTargeting;
  attribution_spec?: Array<{
    event_type: "CLICK_THROUGH" | "VIEW_THROUGH";
    window_days: number;
  }>;
  promoted_object?: {
    pixel_id?: string;
    custom_event_type?: ConversionEvent;
    page_id?: string;
    application_id?: string;
  };
  is_dynamic_creative?: boolean;
  // Flat strings like "facebook_feed", "instagram_reels". The platform is
  // encoded as the prefix segment.
  placement_positions?: string[];
  recommendations?: MetaRecommendation[];
  issues_info?: MetaIssue[];
  learning_stage_info?: { status: string };
  // PR L raw fields ΓÇö backend added these to the ad set Graph query 2026-05-26.
  // Numeric fields are in cents (Meta convention); adapter divides by 100.
  destination_type?: string;
  pacing_type?: string[];
  daily_min_spend_target?: number;
  daily_spend_cap?: number;
  brand_safety_content_filter_levels?: string[];
  publisher_block_list?: string[];
  content_delivery_preferences?: {
    feed_mobile_component_exclusions?: string[];
    [k: string]: unknown;
  };
  bid_constraints?: {
    roas_average_floor?: number;
    cpa_max?: number;
    [k: string]: unknown;
  };
  targeting_optimization?: string;
  user_connection_types?: string[];
  ads: MetaAdNode[];
};

export type MetaAdNode = {
  id: string;
  name: string;
  status: CampaignStatus;
  effective_status?: string;
  creative?: MetaAdCreativeNode;
  tracking_specs?: Array<Record<string, string[]>>;
  conversion_specs?: Array<Record<string, string[]>>;
  recommendations?: MetaRecommendation[];
  issues_info?: MetaIssue[];
  disapproval_reason?: string | null;
};

export type MetaAdCreativeNode = {
  id: string;
  name?: string;
  object_story_spec?: {
    page_id?: string;
    // SINGLE_IMAGE / VIDEO uses link_data or video_data; CAROUSEL uses
    // link_data.child_attachments.
    link_data?: {
      link?: string;
      message?: string;
      name?: string;
      description?: string;
      image_url?: string;
      // Vanity URL (Meta's `caption`) ΓÇö what shows as the link domain
      // in the rendered ad. Distinct from `link` (the click destination).
      caption?: string;
      call_to_action?: { type?: CtaButton; value?: { link?: string } };
      child_attachments?: Array<{
        link: string;
        image_url?: string;
        name?: string;
        description?: string;
        call_to_action?: { type?: CtaButton };
      }>;
    };
    video_data?: {
      video_id?: string;
      image_url?: string;
      title?: string;
      message?: string;
      call_to_action?: { type?: CtaButton; value?: { link?: string } };
    };
  };
  // Dynamic creative spec ΓÇö present when is_dynamic_creative === true.
  // Backend returns Meta's full shape; the adapter maps to wizard arrays.
  asset_feed_spec?: {
    bodies?: Array<{ text: string }>;
    titles?: Array<{ text: string }>;
    descriptions?: Array<{ text: string }>;
    call_to_action_types?: string[];
  };
  // PR L creative-level raw fields (backend Graph query added 2026-05-26).
  degrees_of_freedom_spec?: {
    creative_features_spec?: {
      standard_enhancements?: {
        enroll_status?: "OPT_IN" | "OPT_OUT";
      };
    };
  };
  branded_content_sponsor_page_id?: string;
  instagram_actor_id?: string;
  url_tags?: string;
  // Fallback singletons used when asset_feed_spec isn't present (regular ads).
  body?: string;
  title?: string;
  call_to_action_type?: string;
};

// PR L ΓÇö tracking_specs / conversion_specs already present on MetaAdNode.
// Per backend's 2026-05-26 update they now also expose disapproval_reason
// at the ad level for the UI's disapproval banner.

// Meta's raw targeting shape on the GET response ΓÇö superset of our wizard's
// PublishAdTargeting. `genders` is the numeric encoding (1=male, 2=female).
export type MetaRawTargeting = PublishAdTargeting & {
  age_min?: number;
  age_max?: number;
  genders?: number[];
};

export type MetaRecommendation = {
  blame_field?: string;
  code?: number;
  confidence?: string;
  message?: string;
  title?: string;
};

export type MetaIssue = {
  level?: "CAMPAIGN" | "ADSET" | "AD";
  id?: string;
  title?: string;
  description?: string;
};

// What the wizard's edit-mode prefill needs, copied verbatim from the new
// endpoint when present. Saves the adapter from re-deriving anything the
// backend already knows.
export type LegacyCampaignBlock = Partial<{
  campaignName: string;
  status: CampaignStatus;
  objective: CampaignObjective;
  specialAdCategory: SpecialAdCategory;
  accountId: string;
  adSetId: string;
  adId: string;
  pageId: string;
  dailyBudget: number;
  lifetimeBudget: number;
  startTime: string;
  endTime: string;
  targeting: PublishAdTargeting;
  adSetName: string;
  adName: string;
  conversionLocation: string;
  audienceMode: "ADVANTAGE_PLUS" | "ORIGINAL";
  adsetSpendLimitEnabled: boolean;
  minDailySpend: number;
  maxDailySpend: number;
  partnershipAd: boolean;
  advantageCreative: boolean;
  placementStrategy: "ADVANTAGE" | "MANUAL";
  costPerResultGoal: number;
  dynamicCreative: boolean;
  messagingApps: Array<"MESSENGER" | "INSTAGRAM_DM" | "WHATSAPP">;
}>;

export type CampaignHierarchicalData = {
  campaign: MetaCampaignNode;
  adSets: MetaAdSetNode[];
  legacy?: LegacyCampaignBlock;
};

export type CampaignHierarchicalResponse = {
  success: boolean;
  data: CampaignHierarchicalData;
};

// ==================== HIERARCHICAL ΓåÆ FLAT ADAPTER ====================

// Map Meta's numeric `genders` array to the wizard's enum. Meta encodes
// 1=male, 2=female; an empty/missing array means "all genders" by default.
const gendersToEnum = (g: number[] | undefined): Gender | undefined => {
  if (!g || g.length === 0) return undefined;
  const hasMen = g.includes(1);
  const hasWomen = g.includes(2);
  if (hasMen && hasWomen) return "ALL";
  if (hasMen) return "MEN";
  if (hasWomen) return "WOMEN";
  return undefined;
};

// Derive publisher-platform list (the wizard's `placements` granularity) from
// the flat `placement_positions[]` strings (e.g. "facebook_feed",
// "instagram_reels"). Dedupes since multiple positions share a platform.
const positionsToPlatforms = (positions: string[] | undefined): Placement[] => {
  if (!positions || positions.length === 0) return [];
  const platforms = new Set<Placement>();
  for (const p of positions) {
    if (p.startsWith("facebook")) platforms.add("facebook");
    else if (p.startsWith("instagram")) platforms.add("instagram");
    else if (p.startsWith("messenger")) platforms.add("messenger");
    else if (p.startsWith("audience_network")) platforms.add("audience_network");
  }
  return Array.from(platforms);
};

// Pick the AdType from the creative shape. video_data wins; otherwise carousel
// is detected by child_attachments.length > 1; everything else is SINGLE_IMAGE.
const detectAdType = (creative: MetaAdCreativeNode | undefined): AdType => {
  const story = creative?.object_story_spec;
  if (story?.video_data) return "VIDEO";
  if ((story?.link_data?.child_attachments?.length ?? 0) > 0) return "CAROUSEL";
  return "SINGLE_IMAGE";
};

// Flatten the hierarchical response into the wizard's existing CampaignDetails
// shape. The wizard handles ONE ad set with ONE ad ΓÇö we read adSets[0].ads[0].
// If the user has a multi-adset campaign (created via Ads Manager directly),
// the wizard will only show the first of each; the campaign detail page in
// PR 6 is where multi-* lives.
export const toCampaignDetails = (
  data: CampaignHierarchicalData
): CampaignDetails => {
  const { campaign, adSets, legacy } = data;
  const adSet = adSets[0];
  const ad = adSet?.ads?.[0];
  const creative = ad?.creative;
  const story = creative?.object_story_spec;
  const adType = detectAdType(creative);

  // Pick the live link_data branch (single-image vs carousel) up-front so
  // both branches below can read from the same source without re-narrowing.
  const isCarousel = adType === "CAROUSEL";
  const linkData = story?.link_data;
  const videoData = story?.video_data;
  const cta =
    linkData?.call_to_action?.type ??
    videoData?.call_to_action?.type;

  return {
    // Campaign level ΓÇö prefer hierarchical, fall back to legacy block.
    name: campaign.name ?? legacy?.campaignName,
    status: campaign.status ?? legacy?.status,
    objective: campaign.objective ?? legacy?.objective,
    specialAdCategory:
      campaign.special_ad_categories?.[0] ?? legacy?.specialAdCategory,
    accountId: campaign.account_id ?? legacy?.accountId,

    // Ad set level
    adSetId: adSet?.id ?? legacy?.adSetId,
    // CBO: budget lives on the campaign; non-CBO: on the adset. Backend
    // returns `is_cbo` to disambiguate, but we just read whichever is non-null.
    dailyBudget:
      campaign.daily_budget ??
      adSet?.daily_budget ??
      legacy?.dailyBudget ??
      undefined,
    lifetimeBudget:
      campaign.lifetime_budget ??
      adSet?.lifetime_budget ??
      legacy?.lifetimeBudget ??
      undefined,
    budgetType: (campaign.lifetime_budget ?? adSet?.lifetime_budget)
      ? "LIFETIME"
      : "DAILY",
    startTime: adSet?.start_time ?? legacy?.startTime ?? undefined,
    endTime: adSet?.end_time ?? legacy?.endTime ?? undefined,

    // Targeting ΓÇö pass through the raw shape; toWizardFormState handles
    // both flexible_spec and the legacy flat fields. Strip Meta's numeric
    // genders / age_min / age_max into the wizard's normalized fields.
    targeting: adSet?.targeting ?? legacy?.targeting,
    ageRange:
      adSet?.targeting?.age_min !== undefined ||
      adSet?.targeting?.age_max !== undefined
        ? {
            min: adSet.targeting?.age_min ?? 18,
            max: adSet.targeting?.age_max ?? 65,
          }
        : undefined,
    gender: gendersToEnum(adSet?.targeting?.genders),
    placements: positionsToPlatforms(adSet?.placement_positions),

    // Sales objective extras
    pixelId: adSet?.promoted_object?.pixel_id,
    conversionEvent: adSet?.promoted_object?.custom_event_type,

    // Ad / creative level
    adId: ad?.id ?? legacy?.adId,
    pageId: story?.page_id ?? legacy?.pageId,
    adType,
    adText: linkData?.message ?? videoData?.message,
    adHeadline: isCarousel ? undefined : linkData?.name ?? videoData?.title,
    description: isCarousel ? undefined : linkData?.description,
    adLink:
      linkData?.call_to_action?.value?.link ??
      videoData?.call_to_action?.value?.link ??
      linkData?.link,
    imageUrl: isCarousel ? undefined : linkData?.image_url ?? videoData?.image_url,
    ctaButton: cta,
    carouselCards: isCarousel
      ? (linkData?.child_attachments ?? []).map((c) => ({
          imageUrl: c.image_url ?? "",
          link: c.link,
          headline: c.name,
          description: c.description,
        }))
      : undefined,
    videoUrl: adType === "VIDEO" ? videoData?.video_id : undefined,
    videoThumbnailUrl: adType === "VIDEO" ? videoData?.image_url : undefined,
    // Spec Alignment Additions
    adSetName: adSet?.name ?? legacy?.adSetName,
    adName: ad?.name ?? legacy?.adName,
    // (conversionLocation now derived from adSet.destination_type below ΓÇö see PR L block)
    audienceMode: legacy?.audienceMode ?? "ADVANTAGE_PLUS",
    adsetSpendLimitEnabled: legacy?.adsetSpendLimitEnabled ?? false,
    minDailySpend: legacy?.minDailySpend ?? 0,
    maxDailySpend: legacy?.maxDailySpend ?? 0,
    partnershipAd: legacy?.partnershipAd ?? false,
    advantageCreative: legacy?.advantageCreative ?? false,
    placementStrategy: legacy?.placementStrategy ?? "ADVANTAGE",
    costPerResultGoal: legacy?.costPerResultGoal ?? 0,
    dynamicCreative: adSet?.is_dynamic_creative ?? legacy?.dynamicCreative ?? false,
    messagingApps: legacy?.messagingApps ?? ["MESSENGER"],

    // PR L ΓÇö raw ΓåÆ flat mappings per backend's 2026-05-26 spec. Each one
    // pulls from the hierarchical response so edit-mode prefill restores
    // exactly what the user last published.
    isCbo: campaign.is_cbo ?? false,
    budgetRebalanceFlag: campaign.budget_rebalance_flag ?? false,
    bidStrategy: campaign.bid_strategy ?? adSet?.bid_strategy,
    bidAmount: adSet?.bid_amount,
    // spend_cap arrives already in dollars per backend's spec (no /100).
    campaignSpendingLimit: campaign.spend_cap ?? undefined,
    dsaBeneficiary: campaign.dsa_beneficiary ?? undefined,
    dsaPayor: campaign.dsa_payor ?? undefined,
    abTestEnabled:
      campaign.ab_test_enabled ??
      campaign.execution_options?.includes("include_in_ab_test") ??
      false,

    // Ad set ΓÇö destination_type, pacing, spend limits, brand safety.
    // Backend's raw fields are in cents ΓÇö divide by 100 for the wizard's
    // dollar inputs.
    conversionLocation:
      (adSet?.destination_type as CampaignDetails["conversionLocation"]) ??
      legacy?.conversionLocation ??
      "WEBSITE",
    deliveryType: adSet?.pacing_type?.[0]?.toUpperCase(),
    adSetSpendLimitMin: adSet?.daily_min_spend_target
      ? adSet.daily_min_spend_target / 100
      : undefined,
    adSetSpendLimitMax: adSet?.daily_spend_cap
      ? adSet.daily_spend_cap / 100
      : undefined,
    inventoryFilter: adSet?.brand_safety_content_filter_levels?.[0]?.replace(
      "_INVENTORY",
      ""
    ),
    blockLists: adSet?.publisher_block_list ?? [],
    contentTypeExclusions:
      adSet?.content_delivery_preferences?.feed_mobile_component_exclusions ?? [],
    // Advantage+ audience flag ΓÇö Meta stores it as targeting_optimization
    // === "expansion_all". audienceMode above is the wizard's "ADVANTAGE_PLUS"
    // toggle; we also expose the raw boolean for downstream consumers.
    useAdvantagePlusAudience:
      adSet?.targeting_optimization === "expansion_all",
    advantagePlusPlacement: legacy?.placementStrategy === "ADVANTAGE",
    wifiOnly: adSet?.user_connection_types?.includes("wifi") ?? false,
    // Optimization / billing / attribution / frequency cap ΓÇö already on adSet.
    optimizationGoal: adSet?.optimization_goal,
    billingEvent: adSet?.billing_event,
    attributionWindow: (() => {
      const spec = adSet?.attribution_spec;
      if (!spec?.length) return undefined;
      const click = spec.find((s) => s.event_type === "CLICK_THROUGH");
      const view = spec.find((s) => s.event_type === "VIEW_THROUGH");
      if (click?.window_days === 7 && view?.window_days === 1) return "7d_click_1d_view";
      if (click?.window_days === 1) return "1d_click";
      if (click?.window_days === 7) return "7d_click";
      if (view?.window_days === 1) return "1d_view";
      return undefined;
    })(),
    frequencyCapImpressions: undefined,
    frequencyCapIntervalDays: undefined,

    // Creative ΓÇö pull from creative.* per backend's 2026-05-26 spec.
    instagramActorId: creative?.instagram_actor_id,
    partnershipAdCode: creative?.branded_content_sponsor_page_id,
    advantagePlusCreative:
      creative?.degrees_of_freedom_spec?.creative_features_spec
        ?.standard_enhancements?.enroll_status === "OPT_IN",
    // Asset Feed Spec arrays ΓÇö fall back to the singletons when the ad
    // isn't using Dynamic Creative.
    adTexts: creative?.asset_feed_spec?.bodies?.map((b) => b.text) ??
      (creative?.body ? [creative.body] : []),
    adHeadlines: creative?.asset_feed_spec?.titles?.map((t) => t.text) ??
      (creative?.title ? [creative.title] : []),
    descriptions: creative?.asset_feed_spec?.descriptions?.map((d) => d.text) ??
      [],
    callToActions: (creative?.asset_feed_spec?.call_to_action_types as CtaButton[] | undefined) ??
      (creative?.call_to_action_type ? [creative.call_to_action_type as CtaButton] : []),
    urlTags: creative?.url_tags,
    displayLink: linkData?.caption,

    // Tracking ΓÇö derive from tracking_specs[].
    trackingAppEvents: !!ad?.tracking_specs?.some((s) =>
      Object.values(s).flat().some((v) => v?.toString().toLowerCase().includes("mobile_app_install"))
    ),
    trackingOfflineEvents: !!ad?.tracking_specs?.some((s) =>
      Object.values(s).flat().some((v) => v?.toString().toLowerCase().includes("offline_conversion"))
    ),
    thirdPartyPixelIds: (() => {
      const ids: string[] = [];
      ad?.tracking_specs?.forEach((s) => {
        if (Array.isArray(s.fb_pixel)) ids.push(...s.fb_pixel);
      });
      return ids;
    })(),

    // Disapproval reason for the UI banner.
    disapprovalReason: ad?.disapproval_reason ?? undefined,
  };
};

export const getCampaignDetails = async (
  campaignId: string,
  clientId: number
): Promise<CampaignDetails> => {
  try {
    // Backend's hierarchical envelope contains BOTH the new tree and the
    // legacy flat block in `data.legacy`. We adapt to the flat shape the
    // wizard already consumes ΓÇö toCampaignDetails merges both, preferring
    // hierarchical fields when present.
    const response = await api.get<CampaignHierarchicalResponse>(
      `/meta-campaign-wizard/campaigns/${campaignId}`,
      { params: { clientId } }
    );
    return toCampaignDetails(response.data.data);
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

// Returns the full hierarchical tree. New consumers (campaign list page,
// multi-adset detail view) should use this; the wizard sticks with the
// flat getCampaignDetails above.
export const getCampaignHierarchical = async (
  campaignId: string,
  clientId: number
): Promise<CampaignHierarchicalData> => {
  try {
    const response = await api.get<CampaignHierarchicalResponse>(
      `/meta-campaign-wizard/campaigns/${campaignId}`,
      { params: { clientId } }
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to load campaign hierarchy"
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

// ==================== ASYNC PUBLISH ====================
//
// As of 2026-05-25 the backend exposes POST /async-publish ΓÇö synchronous
// publishing is being phased out. The async endpoint returns a 202 + jobId
// immediately; the frontend polls GET /jobs/:jobId until terminal state.
//
// Idempotency: the frontend generates a per-submit-click UUID and sends it
// as `idempotencyKey` in the body. Backend stores payloadHash + key and
// rejects with 422 IDEMPOTENCY_CONFLICT if the same key arrives with a
// different payload. Network retries with the same key + same payload
// return the cached job.

export type PublishJobState =
  | "QUEUED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "FAILED"
  | "PARTIAL"
  | "NEEDS_REVIEW";

// Terminal states ΓÇö once a job reaches one of these the frontend stops
// polling and surfaces the outcome. NEEDS_REVIEW is terminal even though
// the campaign isn't live yet: the user has to wait for an approver.
export const TERMINAL_JOB_STATES: ReadonlySet<PublishJobState> = new Set([
  "PUBLISHED",
  "FAILED",
  "PARTIAL",
  "NEEDS_REVIEW",
]);

export type PublishJob = {
  jobId: number;
  state: PublishJobState;
  // Populated on PUBLISHED / PARTIAL. PARTIAL means at least the campaign
  // was created but a child entity (adset or ad) failed mid-flight ΓÇö the
  // user has to address the rest manually.
  fbCampaignId?: string;
  fbAdSetId?: string;
  fbAdId?: string;
  // Populated on FAILED. lastError mirrors the parsed Meta envelope.
  lastError?: string;
  fbtrace_id?: string;
  // Backend hint for next poll cadence (ms). Defaults to 3000 when missing.
  pollAfter?: number;
  attempts?: number;
  startedAt?: string;
  completedAt?: string;
};

export type SubmitPublishJobPayload = PublishAdPayload & {
  idempotencyKey: string;
};

export type SubmitPublishJobResponse = {
  success: boolean;
  message?: string;
  data: { jobId: number; state: PublishJobState };
};

export type GetPublishJobResponse = {
  success: boolean;
  data: PublishJob;
};

export const submitPublishJob = async (
  payload: SubmitPublishJobPayload
): Promise<{ jobId: number; state: PublishJobState }> => {
  try {
    const response = await api.post<SubmitPublishJobResponse>(
      "/meta-campaign-wizard/async-publish",
      payload
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const message =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      "Failed to submit publish job";
    const err = new Error(message) as Error & {
      code?: string;
      fbtrace_id?: string;
      rawError?: unknown;
    };
    err.code = (axiosError.response?.data as { code?: string } | undefined)?.code;
    err.fbtrace_id = (
      axiosError.response?.data as { fbtrace_id?: string } | undefined
    )?.fbtrace_id;
    err.rawError = axiosError.response?.data?.rawError;
    throw err;
  }
};

export const getPublishJobStatus = async (
  jobId: number
): Promise<PublishJob> => {
  try {
    const response = await api.get<GetPublishJobResponse>(
      `/meta-campaign-wizard/jobs/${jobId}`
    );
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to fetch publish job status"
    );
  }
};

// ==================== PR H ΓÇö HIERARCHY CRUD ====================
//
// Per-level endpoints that complement the campaign-level wizard. The wizard
// still owns "create whole campaign in one flow"; these unlock multi-adset /
// multi-ad campaigns and inline editing without re-doing the whole wizard.

// Minimal patch shapes ΓÇö backend accepts partial updates so we only send
// fields the user actually changed.
export type AdSetPatch = {
  name?: string;
  status?: CampaignStatus;
  daily_budget?: number;
  lifetime_budget?: number;
  start_time?: string;
  end_time?: string;
  optimization_goal?: string;
  billing_event?: string;
  bid_amount?: number;
  bid_strategy?: string;
  targeting?: PublishAdTargeting;
  attribution_spec?: Array<{
    event_type: "CLICK_THROUGH" | "VIEW_THROUGH";
    window_days: number;
  }>;
  placement_positions?: string[];
};

export type AdPatch = {
  name?: string;
  status?: CampaignStatus;
  ad_text?: string;
  ad_headline?: string;
  description?: string;
  ad_link?: string;
  image_url?: string;
  cta_button?: CtaButton;
  video_url?: string;
  carousel_cards?: CarouselCard[];
};

type WrapError = (msg: string) => Error;
const wrapErr = (axiosError: AxiosError<ApiErrorResponse>, fallback: string) =>
  new Error(
    axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      fallback
  );

// --- Ad Set
export const updateAdSet = async (
  adSetId: string,
  payload: AdSetPatch,
  clientId: number
): Promise<{ success: boolean }> => {
  try {
    const res = await api.put<{ success: boolean }>(
      `/meta-campaign-wizard/ad-sets/${adSetId}`,
      payload,
      { params: { clientId } }
    );
    return res.data;
  } catch (error) {
    throw wrapErr(error as AxiosError<ApiErrorResponse>, "Failed to update ad set");
  }
};

export const deleteAdSet = async (
  adSetId: string,
  clientId: number
): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete<{ success: boolean }>(
      `/meta-campaign-wizard/ad-sets/${adSetId}`,
      { params: { clientId } }
    );
    return res.data;
  } catch (error) {
    throw wrapErr(error as AxiosError<ApiErrorResponse>, "Failed to delete ad set");
  }
};

export const duplicateAdSet = async (
  adSetId: string,
  clientId: number,
  deep = true
): Promise<{ id: string }> => {
  try {
    const res = await api.post<{ success: boolean; data: { id: string } }>(
      `/meta-campaign-wizard/ad-sets/${adSetId}/duplicate`,
      { deep },
      { params: { clientId } }
    );
    return res.data.data;
  } catch (error) {
    throw wrapErr(error as AxiosError<ApiErrorResponse>, "Failed to duplicate ad set");
  }
};

export const addAdSetToCampaign = async (
  campaignId: string,
  payload: AdSetPatch & { name: string },
  clientId: number
): Promise<{ id: string }> => {
  try {
    const res = await api.post<{ success: boolean; data: { id: string } }>(
      `/meta-campaign-wizard/campaigns/${campaignId}/ad-sets`,
      payload,
      { params: { clientId } }
    );
    return res.data.data;
  } catch (error) {
    throw wrapErr(error as AxiosError<ApiErrorResponse>, "Failed to add ad set");
  }
};

// --- Ad
export const updateAd = async (
  adId: string,
  payload: AdPatch,
  clientId: number
): Promise<{ success: boolean }> => {
  try {
    const res = await api.put<{ success: boolean }>(
      `/meta-campaign-wizard/ads/${adId}`,
      payload,
      { params: { clientId } }
    );
    return res.data;
  } catch (error) {
    throw wrapErr(error as AxiosError<ApiErrorResponse>, "Failed to update ad");
  }
};

export const deleteAd = async (
  adId: string,
  clientId: number
): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete<{ success: boolean }>(
      `/meta-campaign-wizard/ads/${adId}`,
      { params: { clientId } }
    );
    return res.data;
  } catch (error) {
    throw wrapErr(error as AxiosError<ApiErrorResponse>, "Failed to delete ad");
  }
};

export const duplicateAd = async (
  adId: string,
  clientId: number
): Promise<{ id: string }> => {
  try {
    const res = await api.post<{ success: boolean; data: { id: string } }>(
      `/meta-campaign-wizard/ads/${adId}/duplicate`,
      {},
      { params: { clientId } }
    );
    return res.data.data;
  } catch (error) {
    throw wrapErr(error as AxiosError<ApiErrorResponse>, "Failed to duplicate ad");
  }
};

export const addAdToAdSet = async (
  adSetId: string,
  payload: AdPatch & { name: string },
  clientId: number
): Promise<{ id: string }> => {
  try {
    const res = await api.post<{ success: boolean; data: { id: string } }>(
      `/meta-campaign-wizard/ad-sets/${adSetId}/ads`,
      payload,
      { params: { clientId } }
    );
    return res.data.data;
  } catch (error) {
    throw wrapErr(error as AxiosError<ApiErrorResponse>, "Failed to add ad");
  }
};

// --- Campaign hard-delete (vs status="DELETED" which is a soft delete via
// updateCampaignStatus). Use this only when the user wants the campaign
// completely removed from Meta's storage.
export const hardDeleteCampaign = async (
  campaignId: string,
  clientId: number
): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete<{ success: boolean }>(
      `/meta-campaign-wizard/campaigns/${campaignId}`,
      { params: { clientId } }
    );
    return res.data;
  } catch (error) {
    throw wrapErr(error as AxiosError<ApiErrorResponse>, "Failed to delete campaign");
  }
};

// --- Submit draft for approval
export const submitForApproval = async (
  campaignId: string,
  clientId: number
): Promise<{ success: boolean }> => {
  try {
    const res = await api.post<{ success: boolean }>(
      `/meta-campaign-wizard/campaigns/${campaignId}/submit-for-approval`,
      {},
      { params: { clientId } }
    );
    return res.data;
  } catch (error) {
    throw wrapErr(error as AxiosError<ApiErrorResponse>, "Failed to submit for approval");
  }
};

// --- Bulk import
export type BulkRow = {
  type: "campaign" | "adset" | "ad";
  action: "create" | "update" | "delete";
  data: Record<string, unknown>;
};

export type BulkResponse = {
  success: boolean;
  results: Array<{
    type: string;
    action: string;
    id?: string;
    error?: string;
  }>;
};

export const bulkOperations = async (
  rows: BulkRow[],
  clientId: number
): Promise<BulkResponse> => {
  try {
    const res = await api.post<BulkResponse>(
      `/meta-campaign-wizard/bulk`,
      { rows },
      { params: { clientId } }
    );
    return res.data;
  } catch (error) {
    throw wrapErr(error as AxiosError<ApiErrorResponse>, "Bulk operation failed");
  }
};

// Suppress unused warning while keeping the signature for downstream readability.
void ((_: WrapError | undefined) => undefined);

// ==================== PR L ΓÇö NEW PICKER ENDPOINTS ====================
//
// Three GETs added 2026-05-25 to power the wizard's audience and identity
// pickers. All three live under /meta-campaign-wizard rather than the
// client-scoped /clients/:clientId/... path ΓÇö clientId is passed as a
// query param when relevant.

export type CustomAudiencePicker = {
  id: string;
  name: string;
  description?: string;
  subtype?: "CUSTOM" | "WEBSITE" | "LOOKALIKE" | "ENGAGEMENT" | "APP";
  approximate_count_lower_bound?: number;
  approximate_count_upper_bound?: number;
  delivery_status?: { code: number; description: string };
  data_source?: { type: string };
};

export type SavedAudiencePicker = {
  id: string;
  name: string;
  approximate_count_lower_bound?: number;
  approximate_count_upper_bound?: number;
  targeting?: PublishAdTargeting & {
    age_min?: number;
    age_max?: number;
    genders?: number[];
  };
};

// Combined Page + linked Instagram account from /pages ΓÇö used in Step 3's
// identity row. instagram_business_account is null when the page hasn't
// connected an IG account, in which case the wizard hides the IG selector.
export type AdsManagerPage = {
  id: string;
  name: string;
  category?: string;
  picture?: { data?: { url?: string } };
  instagram_business_account?: {
    id: string;
    username: string;
    profile_picture_url?: string;
  } | null;
};

export type CustomAudiencesPickerResponse = {
  success: boolean;
  data: CustomAudiencePicker[];
  paging?: { cursors?: { before?: string; after?: string } };
};

export type SavedAudiencesPickerResponse = {
  success: boolean;
  data: SavedAudiencePicker[];
  paging?: { cursors?: { before?: string; after?: string } };
};

export type AdsManagerPagesResponse = {
  success: boolean;
  data: AdsManagerPage[];
};

export const listCustomAudiencesPicker = async (
  accountId: string,
  params?: { clientId?: number; limit?: number }
): Promise<CustomAudiencePicker[]> => {
  try {
    const res = await api.get<CustomAudiencesPickerResponse>(
      `/meta-campaign-wizard/accounts/${accountId}/custom-audiences`,
      { params }
    );
    return res.data.data ?? [];
  } catch (error) {
    throw wrapErr(
      error as AxiosError<ApiErrorResponse>,
      "Failed to load custom audiences"
    );
  }
};

export const listSavedAudiencesPicker = async (
  accountId: string,
  params?: { clientId?: number; limit?: number }
): Promise<SavedAudiencePicker[]> => {
  try {
    const res = await api.get<SavedAudiencesPickerResponse>(
      `/meta-campaign-wizard/accounts/${accountId}/saved-audiences`,
      { params }
    );
    return res.data.data ?? [];
  } catch (error) {
    throw wrapErr(
      error as AxiosError<ApiErrorResponse>,
      "Failed to load saved audiences"
    );
  }
};

export const listAdsManagerPages = async (
  params?: { clientId?: number }
): Promise<AdsManagerPage[]> => {
  try {
    const res = await api.get<AdsManagerPagesResponse>(
      `/meta-campaign-wizard/pages`,
      { params }
    );
    return res.data.data ?? [];
  } catch (error) {
    throw wrapErr(
      error as AxiosError<ApiErrorResponse>,
      "Failed to load pages"
    );
  }
};
