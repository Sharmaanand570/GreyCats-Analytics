import type {
  AdVariant,
  CampaignObjective,
  CarouselCard,
  ConversionEvent,
  CtaButton,
  DetailedTargetingType,
  Gender,
  Placement,
  PublishMode,
  SpecialAdCategory,
  TargetingInterest,
  TargetingLocation,
} from "../../API/metaAdsManagerApi";

export type SelectedLocation = {
  key: string;
  name: string;
  type: string;
  country_code?: string;
  excluded?: boolean;
};

export type SelectedInterest = {
  id: string;
  name: string;
  excluded?: boolean;
};

export type SelectedDetailedTargeting = {
  id: string;
  name: string;
  type: DetailedTargetingType;
};

export type SelectedAudience = {
  id: string;
  name: string;
  audienceType: "CUSTOM" | "WEBSITE" | "LOOKALIKE" | "ENGAGEMENT" | "APP";
  excluded?: boolean;
};

export type DestinationType = "WEBSITE" | "APP" | "MESSENGER" | "INSTANT_FORMS" | "CALLS";

export type AdFormat = "SINGLE_IMAGE_VIDEO" | "CAROUSEL" | "COLLECTION";

export type BuyingType = "AUCTION" | "RESERVATION";

export type BudgetStrategy = "CAMPAIGN" | "AD_SET";

export type AbTestVariable = "CREATIVE" | "AUDIENCE" | "PLACEMENT" | "CUSTOM";

export type AudienceSegment = {
  audienceId?: string;
  audienceName?: string;
};

export type BudgetIncrease = {
  id: string;
  startDate: string;
  endDate: string;
  increasePercent: number;
};

// Performance goal — the optimization signal Meta uses to decide who sees the
// ad. Available options depend on the campaign objective.
export type PerformanceGoal =
  // Awareness
  | "REACH"
  | "IMPRESSIONS"
  | "AD_RECALL_LIFT"
  | "THRUPLAY"
  | "TWO_SECOND_CONTINUOUS_VIDEO_VIEWS"
  // Traffic
  | "LINK_CLICKS"
  | "LANDING_PAGE_VIEWS"
  // Engagement
  | "POST_ENGAGEMENT"
  | "VIDEO_VIEWS"
  | "MESSAGING_CONVERSATIONS_STARTED"
  // Leads
  | "LEAD_GENERATION"
  | "QUALITY_LEADS"
  | "CONVERSATIONS"
  // App promotion
  | "APP_INSTALLS"
  | "APP_INSTALLS_AND_OFFSITE_CONVERSIONS"
  | "VALUE_APP_PROMOTION"
  // Sales
  | "OFFSITE_CONVERSIONS"
  | "VALUE"
  | "LANDING_PAGE_VIEWS_SALES";

export type FrequencyControlMode = "TARGET" | "CAP";

export interface FrequencyControl {
  mode: FrequencyControlMode;
  count: number;
  days: number;
}

export interface PolicyDeclarations {
  // India-specific securities/investments declaration.
  securitiesAndInvestments?: boolean;
}

// Account-level audience controls. Meta scopes these to the ad account and
// applies them across all campaigns (except Advantage+ shopping). They surface
// in the "Audience controls for this ad account" modal on Step 2.
export interface AudienceControls {
  specificLocationsOnly?: boolean;
  ageRestrictedGoods?: boolean;
  brandProtection?: boolean;
  excludeEmployees?: boolean;
}

// Conversion location — where traffic / engagement / leads / sales are sent.
// Available choices depend on the campaign objective.
export type ConversionLocation =
  | "WEBSITE"
  | "APP"
  | "MESSAGE_DESTINATIONS"
  | "INSTAGRAM_OR_FACEBOOK"
  | "CALLS"
  | "INSTANT_FORMS"
  | "MESSENGER"
  | "ON_YOUR_AD"
  | "EVENTS"
  | "REMINDERS";

export type AttributionModel =
  | "STANDARD"
  | "LAST_TOUCH"
  | "DATA_DRIVEN";

export interface CampaignState {
  accountId: string;
  pageId: string;
  name: string;
  buyingType: BuyingType;
  objective: CampaignObjective;
  specialAdCategories: SpecialAdCategory[];
  isCboEnabled: boolean;
  budgetStrategy: BudgetStrategy;
  campaignSpendingLimit?: number;
  dailyBudget?: number;
  lifetimeBudget?: number;
  bidStrategy?: string;
  bidAmount?: number;
  abTestEnabled: boolean;
  abTestVariable?: AbTestVariable;
  abTestDurationDays?: number;
  abTestComparisonMetric?: string;
  advantagePlusEnabled?: boolean;
  ios14CampaignEnabled?: boolean;
  ios14AppId?: string;
  engagedAudienceSegment?: AudienceSegment;
  existingCustomersSegment?: AudienceSegment;
  budgetScheduleIncreases?: BudgetIncrease[];
  showAdvancedSettings?: boolean;
  dsaBeneficiary?: string;
  dsaPayor?: string;
  budgetRebalanceFlag?: boolean;
}

export interface AdSetState {
  name: string;
  destinationType: DestinationType;
  pixelId?: string;
  conversionEvent?: string;
  conversionLocation?: string;
  optimizationGoal: string;
  billingEvent: string;
  // Per-ad-set Facebook Page (separate from campaign-level pageId — Meta lets
  // each ad set promote a different Page when needed).
  pageId?: string;
  // Performance goal drives Meta's delivery optimization. Options depend on the
  // campaign objective — see PERFORMANCE_GOALS_BY_OBJECTIVE.
  performanceGoal?: PerformanceGoal;
  // Where conversions happen (Website / App / Messenger / etc.). Available
  // options depend on the campaign objective. Awareness omits this field.
  conversionLocationType?: ConversionLocation;
  // Attribution model used to count conversions.
  attributionModel?: AttributionModel;
  // Optional cost cap for the chosen result.
  costPerResultGoal?: number;
  // Frequency control — show ads no more than X times every Y days (Cap), or
  // aim for X average impressions per person (Target).
  frequencyControl?: FrequencyControl;
  // Per-ad-set policy declarations (e.g., India securities & investments).
  policyDeclarations?: PolicyDeclarations;
  // Account-level audience controls (location/age-restricted goods/brand
  // protection/employee exclusions). Stored on the ad set for the wizard's
  // form-state round-trip; backend persistence is at the account level.
  audienceControls?: AudienceControls;
  // Languages used to restrict who sees the ad. Empty = "All languages".
  languages?: number[];
  // Account-level / ad-set-level placements the user has explicitly excluded.
  excludedPlacements?: string[];
  dailyBudget?: number;
  lifetimeBudget?: number;
  scheduleStart: string;
  scheduleEnd?: string;

  // Audience
  useAdvantagePlusAudience: boolean;
  audienceMode?: "ADVANTAGE_PLUS" | "MANUAL"; // for UI toggle state
  locations: SelectedLocation[];
  ageMin: number;
  ageMax: number;
  genders: Gender[];
  interests: SelectedInterest[];
  detailedTargeting: SelectedDetailedTargeting[];
  customAudiences: SelectedAudience[];
  excludedCustomAudiences: SelectedAudience[];
  savedAudienceId?: string;

  // Placements
  useAdvantagePlusPlacements: boolean;
  placementStrategy?: "ADVANTAGE_PLUS" | "MANUAL";
  manualPlatforms: Placement[];
  manualPositions?: string[]; // e.g. facebook_feed

  dynamicCreative: boolean;
  adSetSpendLimitEnabled?: boolean;
  minDailySpend?: number;
  maxDailySpend?: number;
  
  // Advanced
  deliveryType?: string;
  attributionWindow?: string;
  frequencyCapImpressions?: number;
  frequencyCapIntervalDays?: number;
  daypartingBlocks?: string[];
  connections?: unknown[];
  wifiOnly?: boolean;
  inventoryFilter?: string;
  blockLists?: string[];
  contentTypeExclusions?: string[];
  locales?: number[];
  osTargeting?: string[];
  devicePlatforms?: string[];
  zips?: string[];
  customLocations?: string[];
  messagingApps?: string[];
}

// Identity profiles used in the ad. Threads + WhatsApp are recent additions to
// Meta's Identity card; the wizard surfaces them but keeps them optional.
export interface AdIdentity {
  threadsProfileId?: string;
  whatsappPhoneNumber?: string;
}

// Per-ad event details (Meta's "Event details" card on Step 3). When present,
// the ad surfaces a title + reminder button so the audience can subscribe to
// reminders about the event.
export interface AdEventDetails {
  title: string;
  startsAt?: string;
  endsAt?: string;
  notifications?: string;
  timeMode?: "START" | "END";
}

// Per-ad language translation policy. When `auto` is true Meta auto-translates
// the ad text; `manual` carries any user-supplied translations.
export interface AdLanguages {
  enabled: boolean;
  auto?: boolean;
  manual?: Record<string, { primaryText?: string; headline?: string; description?: string }>;
}

export interface AdState {
  name: string;
  format: AdFormat;
  publishMode: PublishMode;

  // Identity
  instagramAccountId?: string;
  isPartnershipAd: boolean;
  partnershipAdCode?: string;
  threadsProfileId?: string;
  whatsappPhoneNumber?: string;

  // Creative
  advantageCreative: boolean;
  primaryTexts: string[];
  headlines: string[];
  descriptions: string[];
  callToAction: CtaButton;
  // When true, the ad can appear alongside other advertisers' ads inside a
  // single ad unit (Meta's "Multi-advertiser ads" checkbox).
  multiAdvertiserAds?: boolean;

  // Media
  images: string[];
  videos: string[];
  videoThumbnailUrl?: string;
  captionsUrl?: string;
  carouselCards: CarouselCard[];
  adVariants: AdVariant[]; // For A/B Test Mode

  // Destination
  websiteUrl: string;
  displayLink?: string;
  leadFormId?: string;
  catalogId?: string;
  productSetId?: string;
  instantExperienceId?: string;
  phoneNumber?: string;
  objectStoreUrl?: string;
  applicationId?: string;
  // Top-level destination picker on Step 3 — "Instant Experience" or
  // "Website". When WEBSITE the user fills in websiteUrl + displayLink and
  // optionally picks a browser add-on. (Distinct from AdSetState.destinationType,
  // which is the ad-set-level conversion location.)
  destinationKind?: "INSTANT_EXPERIENCE" | "WEBSITE";
  // Browser add-on: an extra button rendered on the ad alongside the CTA.
  browserAddOn?: "NONE" | "WHATSAPP" | "CALL" | "MESSAGING_APPS";
  whatsappLinkNumber?: string;
  messagingAppsTarget?: string;
  mobileAppId?: string;

  // Tracking
  pixelId?: string;
  conversionEvent?: string;
  trackingAppEvents: boolean;
  offlineEvents: boolean;
  thirdPartyPixelIds: string[];
  urlParameters?: string;
  // Whether website-event tracking is enabled for this ad.
  websiteEvents?: boolean;
  // Whether the user has connected a third-party reporting tool (e.g. Google
  // Analytics conversion import).
  thirdPartyReportingConnected?: boolean;

  // Creative testing — when enabled, Meta runs a test comparing up to 5
  // creative variants and reports which performs best.
  creativeTestingEnabled?: boolean;

  // Adds a non-clickable "map card" at the end of a carousel that shows the
  // advertiser's business location pulled from the Facebook Page.
  showMapCard?: boolean;

  // Event details (Add event button on the "Event details" card).
  eventDetails?: AdEventDetails;

  // Language translation card.
  languages?: AdLanguages;
}

export interface WizardState {
  campaign: CampaignState;
  adSet: AdSetState;
  ad: AdState;
  adSetId?: string;
  adId?: string;
}

export const INITIAL_STATE: WizardState = {
  campaign: {
    accountId: "",
    pageId: "",
    name: "",
    buyingType: "AUCTION",
    objective: "OUTCOME_TRAFFIC",
    specialAdCategories: [],
    isCboEnabled: false,
    budgetStrategy: "AD_SET",
    abTestEnabled: false,
    abTestDurationDays: 7,
    advantagePlusEnabled: false,
    ios14CampaignEnabled: false,
    showAdvancedSettings: false,
  },
  adSet: {
    name: "",
    destinationType: "WEBSITE",
    conversionLocation: "WEBSITE",
    optimizationGoal: "REACH",
    billingEvent: "IMPRESSIONS",
    performanceGoal: "REACH",
    frequencyControl: { mode: "CAP", count: 2, days: 7 },
    excludedPlacements: [],
    scheduleStart: "",
    useAdvantagePlusAudience: true,
    audienceMode: "ADVANTAGE_PLUS",
    locations: [],
    ageMin: 18,
    ageMax: 65,
    genders: ["ALL"],
    interests: [],
    detailedTargeting: [],
    customAudiences: [],
    excludedCustomAudiences: [],
    useAdvantagePlusPlacements: true,
    placementStrategy: "ADVANTAGE_PLUS",
    manualPlatforms: [],
    dynamicCreative: false,
  },
  ad: {
    name: "",
    format: "SINGLE_IMAGE_VIDEO",
    publishMode: "SINGLE_AD",
    isPartnershipAd: false,
    advantageCreative: false,
    primaryTexts: [""],
    headlines: [""],
    descriptions: [""],
    callToAction: "LEARN_MORE",
    images: [""],
    videos: [""],
    carouselCards: [],
    adVariants: [],
    websiteUrl: "",
    trackingAppEvents: false,
    offlineEvents: false,
    thirdPartyPixelIds: [],
  },
};

export const MIN_VARIANTS = 2;
export const MAX_VARIANTS = 5;

export const blankVariant = (): AdVariant => ({
  adHeadline: "",
  adText: "",
  description: "",
  imageUrl: "",
  ctaButton: "LEARN_MORE",
});

export const MIN_CAROUSEL_CARDS = 2;
export const MAX_CAROUSEL_CARDS = 10;

export const blankCarouselCard = (
  mediaType: "IMAGE" | "VIDEO" = "IMAGE"
): CarouselCard => ({
  imageUrl: "",
  headline: "",
  description: "",
  link: "",
  mediaType,
  videoUrl: "",
});

export const DETAILED_TARGETING_OPTIONS: { value: DetailedTargetingType; label: string; hint: string }[] = [
  { value: "behaviors", label: "Behaviors", hint: "Purchase behavior, device usage, frequent travelers" },
  { value: "demographics", label: "Demographics", hint: "Income, household, parental status, generations" },
  { value: "life_events", label: "Life Events", hint: "Newlywed, new job, anniversary, recently moved" },
  { value: "work_employers", label: "Employers", hint: "Specific companies people work for" },
  { value: "work_positions", label: "Job Titles", hint: "Specific roles like Engineer, Marketing Manager" },
  { value: "education_schools", label: "Schools", hint: "Universities and high schools" },
  { value: "education_majors", label: "Fields of Study", hint: "College majors and disciplines" },
];

export const MAX_DETAILED_TARGETING = 25;

export const CONVERSION_EVENT_OPTIONS: { value: ConversionEvent; label: string; hint: string }[] = [
  { value: "PURCHASE", label: "Purchase", hint: "Optimize for completed purchases" },
  { value: "LEAD", label: "Lead", hint: "Form submissions, sign-ups, contact requests" },
  { value: "COMPLETE_REGISTRATION", label: "Complete Registration", hint: "Account creation events" },
  { value: "ADD_TO_CART", label: "Add to Cart", hint: "Cart add events (upper funnel)" },
  { value: "INITIATE_CHECKOUT", label: "Initiate Checkout", hint: "Checkout start events" },
  { value: "VIEW_CONTENT", label: "View Content", hint: "Product/landing page views" },
  { value: "SUBSCRIBE", label: "Subscribe", hint: "Newsletter or service subscriptions" },
];

export const SPECIAL_AD_CATEGORY_OPTIONS: { value: SpecialAdCategory; label: string; hint: string }[] = [
  { value: "NONE", label: "None", hint: "Standard ad — no special category" },
  { value: "HOUSING", label: "Housing", hint: "Real estate, rentals, mortgages" },
  { value: "EMPLOYMENT", label: "Employment", hint: "Jobs, recruitment, training" },
  { value: "CREDIT", label: "Credit", hint: "Loans, credit cards, financial services" },
  { value: "ISSUES_ELECTIONS_POLITICS", label: "Social Issues, Elections & Politics", hint: "Political or advocacy content" },
];

export const OBJECTIVE_OPTIONS: { value: CampaignObjective; label: string; hint: string }[] = [
  { value: "OUTCOME_AWARENESS", label: "Awareness", hint: "Show your ad to as many people as possible" },
  { value: "OUTCOME_TRAFFIC", label: "Traffic", hint: "Drive visits to your website or app" },
  { value: "OUTCOME_ENGAGEMENT", label: "Engagement", hint: "Get likes, comments, shares, and follows" },
  { value: "OUTCOME_LEADS", label: "Leads", hint: "Collect contact info via forms or messages" },
  { value: "OUTCOME_APP_PROMOTION", label: "App promotion", hint: "Drive app installs and events" },
  { value: "OUTCOME_SALES", label: "Sales", hint: "Drive purchases and conversions" },
];

export const BUYING_TYPE_OPTIONS: { value: BuyingType; label: string; hint: string }[] = [
  { value: "AUCTION", label: "Auction", hint: "Bid against other advertisers for ad placements" },
  { value: "RESERVATION", label: "Reservation", hint: "Reserve impressions ahead of time at a fixed price" },
];

// Reservation buying type restricts which objectives are available.
export const RESERVATION_OBJECTIVES: CampaignObjective[] = [
  "OUTCOME_AWARENESS",
  "OUTCOME_ENGAGEMENT",
];

// Objectives that show the "Campaign budget vs Ad set budget" radio + Advantage+ X campaign badge.
export const ADVANTAGE_PLUS_OBJECTIVES: CampaignObjective[] = [
  "OUTCOME_LEADS",
  "OUTCOME_SALES",
  "OUTCOME_APP_PROMOTION",
];

export const AB_TEST_VARIABLE_OPTIONS: { value: AbTestVariable; label: string; hint: string }[] = [
  { value: "CREATIVE", label: "Creative", hint: "Find out which images, videos or ad text work best." },
  { value: "AUDIENCE", label: "Audience", hint: "See how targeting a new audience can affect performance." },
  { value: "PLACEMENT", label: "Placement", hint: "Discover the most effective places to show your ads." },
  { value: "CUSTOM", label: "Custom", hint: "Learn how changing multiple variables can affect results." },
];

// Standard event cost metrics shared across all objectives — alphabetical,
// matches Meta's Ads Manager dropdown.
const STANDARD_EVENT_METRICS = [
  { value: "cost_per_3_second_video_play", label: "Cost per 3-second video play" },
  { value: "cost_per_achievement_unlocked", label: "Cost per achievement unlocked" },
  { value: "cost_per_ad_recall_lift", label: "Cost per ad recall lift" },
  { value: "cost_per_add_of_payment_info", label: "Cost per add of payment info" },
  { value: "cost_per_add_to_cart", label: "Cost per add to cart" },
  { value: "cost_per_add_to_wishlist", label: "Cost per add to wishlist" },
  { value: "cost_per_app_install", label: "Cost per app install" },
  { value: "cost_per_complete_registration", label: "Cost per complete registration" },
  { value: "cost_per_contact", label: "Cost per contact" },
  { value: "cost_per_customize_product", label: "Cost per customize product" },
  { value: "cost_per_donate", label: "Cost per donate" },
  { value: "cost_per_find_location", label: "Cost per find location" },
  { value: "cost_per_initiate_checkout", label: "Cost per initiate checkout" },
  { value: "cost_per_landing_page_view", label: "Cost per landing page view" },
  { value: "cost_per_lead", label: "Cost per lead" },
  { value: "cost_per_level_achieved", label: "Cost per level achieved" },
  { value: "cost_per_like", label: "Cost per like" },
  { value: "cost_per_messaging_conversation", label: "Cost per messaging conversation" },
  { value: "cost_per_mobile_app_d2_retention", label: "Cost per mobile app D2 retention" },
  { value: "cost_per_mobile_app_d7_retention", label: "Cost per mobile app D7 retention" },
  { value: "cost_per_new_messaging_contact", label: "Cost per new messaging contact" },
  { value: "cost_per_other_offline_conversion", label: "Cost per other offline conversion" },
  { value: "cost_per_post_engagement", label: "Cost per post engagement" },
  { value: "cost_per_purchase", label: "Cost per purchase" },
  { value: "cost_per_rating_submitted", label: "Cost per rating submitted" },
  { value: "cost_per_registration_completed", label: "Cost per registration completed" },
  { value: "cost_per_schedule", label: "Cost per schedule" },
  { value: "cost_per_search", label: "Cost per search" },
  { value: "cost_per_start_trial", label: "Cost per start trial" },
  { value: "cost_per_submit_application", label: "Cost per submit application" },
  { value: "cost_per_subscribe", label: "Cost per subscribe" },
  { value: "cost_per_tutorial_completed", label: "Cost per tutorial completed" },
  { value: "cost_per_video_view", label: "Cost per video view" },
  { value: "cost_per_view_content", label: "Cost per view content" },
];

// Common cost metrics shown above the standard events section.
const COMMON_COST_METRICS = [
  { value: "cost_per_result", label: "Cost per result" },
  { value: "cost_per_link_click", label: "CPC (cost per link click)" },
  { value: "cost_per_1000_reached", label: "Cost per 1,000 Meta accounts reached" },
];

// Performance goal options, grouped by header to match Meta's dropdown
// (e.g., "Awareness goals" / "Video view goals"). The empty `group` marker
// behaves like a non-selectable section header.
export type PerformanceGoalOption =
  | { value: PerformanceGoal; label: string; hint: string; group?: undefined }
  | { value: string; label: string; group: string };

export const PERFORMANCE_GOALS_BY_OBJECTIVE: Record<CampaignObjective, PerformanceGoalOption[]> = {
  OUTCOME_AWARENESS: [
    { value: "__group_awareness__", label: "Awareness goals", group: "Awareness goals" },
    {
      value: "REACH",
      label: "Maximise reach of ads",
      hint: "We'll try to show your ads to as many people as possible.",
    },
    {
      value: "IMPRESSIONS",
      label: "Maximise number of impressions",
      hint: "We'll try to show your ads to people as many times as possible.",
    },
    {
      value: "AD_RECALL_LIFT",
      label: "Maximise ad recall lift",
      hint: "We'll try to show your ads to people who are likely to remember seeing them.",
    },
    { value: "__group_video__", label: "Video view goals", group: "Video view goals" },
    {
      value: "THRUPLAY",
      label: "Maximise ThruPlay views",
      hint: "We'll try to show your video ads to people who will watch the entire video when it's shorter than 15 seconds. For longer videos, we'll try to show it to people who are likely to watch at least 15 seconds.",
    },
    {
      value: "TWO_SECOND_CONTINUOUS_VIDEO_VIEWS",
      label: "Maximise 2-second continuous video plays",
      hint: "We'll try to show your video ads to people who are likely to watch 2 continuous seconds or more.",
    },
  ],
  OUTCOME_TRAFFIC: [
    { value: "__group_traffic__", label: "Traffic goals", group: "Traffic goals" },
    {
      value: "LANDING_PAGE_VIEWS",
      label: "Maximise number of landing page views",
      hint: "We'll try to show your ads to people who are likely to view the website or Instant Experience that loads from your ad's link.",
    },
    {
      value: "LINK_CLICKS",
      label: "Maximise number of link clicks",
      hint: "We'll try to show your ads to people who are likely to click on them.",
    },
  ],
  OUTCOME_ENGAGEMENT: [
    { value: "__group_engagement__", label: "Engagement goals", group: "Engagement goals" },
    {
      value: "POST_ENGAGEMENT",
      label: "Maximise post engagement",
      hint: "We'll try to show your ads to people who are likely to react, comment, or share.",
    },
    {
      value: "MESSAGING_CONVERSATIONS_STARTED",
      label: "Maximise number of conversations",
      hint: "We'll try to start messaging conversations with people who are likely to engage.",
    },
    { value: "__group_video2__", label: "Video view goals", group: "Video view goals" },
    {
      value: "VIDEO_VIEWS",
      label: "Maximise ThruPlay views",
      hint: "We'll try to show your video ads to people who will watch the entire video.",
    },
  ],
  OUTCOME_LEADS: [
    { value: "__group_leads__", label: "Lead goals", group: "Lead goals" },
    {
      value: "LEAD_GENERATION",
      label: "Maximise number of leads",
      hint: "We'll try to show your ads to people who are likely to share their contact info via an Instant Form.",
    },
    {
      value: "QUALITY_LEADS",
      label: "Maximise number of conversion leads",
      hint: "We'll try to show your ads to people you've identified as quality leads via your CRM.",
    },
    {
      value: "CONVERSATIONS",
      label: "Maximise number of conversations",
      hint: "We'll try to start messaging conversations with people who are likely to convert.",
    },
  ],
  OUTCOME_APP_PROMOTION: [
    { value: "__group_app__", label: "App promotion goals", group: "App promotion goals" },
    {
      value: "APP_INSTALLS",
      label: "Maximise number of app installs",
      hint: "We'll try to show your ads to people most likely to install your app.",
    },
    {
      value: "APP_INSTALLS_AND_OFFSITE_CONVERSIONS",
      label: "Maximise number of app events",
      hint: "We'll try to show your ads to people most likely to take a specific in-app action.",
    },
    {
      value: "VALUE_APP_PROMOTION",
      label: "Maximise value of app events",
      hint: "We'll try to show your ads to people likely to maximise the value of in-app purchases.",
    },
  ],
  OUTCOME_SALES: [
    { value: "__group_sales__", label: "Sales goals", group: "Sales goals" },
    {
      value: "OFFSITE_CONVERSIONS",
      label: "Maximise number of conversions",
      hint: "We'll try to show your ads to people who are likely to convert.",
    },
    {
      value: "VALUE",
      label: "Maximise value of conversions",
      hint: "We'll try to show your ads to people likely to maximise purchase value.",
    },
    {
      value: "LANDING_PAGE_VIEWS_SALES",
      label: "Maximise number of landing page views",
      hint: "We'll try to show your ads to people likely to view your landing page.",
    },
  ],
};

// Default performance goal per objective — used when the user hasn't picked
// one yet, and to show the "Recommended" badge in the picker.
export const DEFAULT_PERFORMANCE_GOAL: Record<CampaignObjective, PerformanceGoal> = {
  OUTCOME_AWARENESS: "REACH",
  OUTCOME_TRAFFIC: "LANDING_PAGE_VIEWS",
  OUTCOME_ENGAGEMENT: "POST_ENGAGEMENT",
  OUTCOME_LEADS: "LEAD_GENERATION",
  OUTCOME_APP_PROMOTION: "APP_INSTALLS",
  OUTCOME_SALES: "OFFSITE_CONVERSIONS",
};

// Card title for the objective section on Step 2. Awareness keeps its name;
// every other objective uses "Conversion" since the picker is about where the
// conversion happens (Meta's exact wording).
export const STEP2_OBJECTIVE_CARD_TITLE: Record<CampaignObjective, string> = {
  OUTCOME_AWARENESS: "Awareness",
  OUTCOME_TRAFFIC: "Conversion",
  OUTCOME_ENGAGEMENT: "Conversion",
  OUTCOME_LEADS: "Conversion",
  OUTCOME_APP_PROMOTION: "App",
  OUTCOME_SALES: "Conversion",
};

// Conversion location options per objective. Awareness has no conversion
// location picker; App promotion is locked to "APP".
export type ConversionLocationOption = {
  value: ConversionLocation;
  label: string;
  hint: string;
};

export const CONVERSION_LOCATIONS_BY_OBJECTIVE: Partial<
  Record<CampaignObjective, ConversionLocationOption[]>
> = {
  OUTCOME_TRAFFIC: [
    { value: "WEBSITE", label: "Website", hint: "Send traffic to your website." },
    { value: "APP", label: "App", hint: "Send traffic to your app." },
    {
      value: "MESSAGE_DESTINATIONS",
      label: "Message destinations",
      hint: "Send traffic to Messenger, Instagram and WhatsApp.",
    },
    {
      value: "INSTAGRAM_OR_FACEBOOK",
      label: "Instagram or Facebook",
      hint: "Send traffic to an Instagram profile, Facebook Page or both.",
    },
    { value: "CALLS", label: "Calls", hint: "Get people to call your business." },
  ],
  OUTCOME_ENGAGEMENT: [
    {
      value: "MESSAGE_DESTINATIONS",
      label: "Message destinations",
      hint: "Drive conversations on Messenger, Instagram and WhatsApp.",
    },
    { value: "ON_YOUR_AD", label: "On your ad", hint: "Drive likes, comments, shares and video views on your ad." },
    { value: "WEBSITE", label: "Website", hint: "Get people to engage with your website." },
    { value: "APP", label: "App", hint: "Get people to engage with your app." },
    { value: "EVENTS", label: "Events", hint: "Promote events you've created on Facebook." },
    { value: "CALLS", label: "Calls", hint: "Get people to call your business." },
  ],
  OUTCOME_LEADS: [
    { value: "INSTANT_FORMS", label: "Instant forms", hint: "Collect leads using a form on Meta." },
    { value: "MESSENGER", label: "Messenger", hint: "Generate leads via Messenger conversations." },
    { value: "WEBSITE", label: "Website", hint: "Send people to a form on your website." },
    { value: "APP", label: "App", hint: "Generate leads inside your app." },
    { value: "CALLS", label: "Calls", hint: "Generate leads via phone calls." },
  ],
  OUTCOME_SALES: [
    { value: "WEBSITE", label: "Website", hint: "Drive purchases on your website." },
    { value: "APP", label: "App", hint: "Drive purchases inside your app." },
    {
      value: "MESSAGE_DESTINATIONS",
      label: "Message destinations",
      hint: "Drive purchases via Messenger, Instagram or WhatsApp.",
    },
    { value: "CALLS", label: "Calls", hint: "Drive purchases via phone calls." },
  ],
  OUTCOME_APP_PROMOTION: [
    { value: "APP", label: "App", hint: "Drive installs and in-app actions." },
  ],
};

export const DEFAULT_CONVERSION_LOCATION: Partial<Record<CampaignObjective, ConversionLocation>> = {
  OUTCOME_TRAFFIC: "WEBSITE",
  OUTCOME_ENGAGEMENT: "MESSAGE_DESTINATIONS",
  OUTCOME_LEADS: "INSTANT_FORMS",
  OUTCOME_SALES: "WEBSITE",
  OUTCOME_APP_PROMOTION: "APP",
};

export const ATTRIBUTION_MODEL_OPTIONS: { value: AttributionModel; label: string; hint: string }[] = [
  { value: "STANDARD", label: "Standard", hint: "1-day view, 7-day click (default)." },
  { value: "LAST_TOUCH", label: "Last touch", hint: "Attribute to the last touchpoint." },
  { value: "DATA_DRIVEN", label: "Data-driven", hint: "Meta's machine-learning model picks the model." },
];

// Per-objective default ("Recommended") metric — used to drive the
// Recommended pill in the comparison dropdown.
export const RECOMMENDED_METRIC_BY_OBJECTIVE: Record<CampaignObjective, string> = {
  OUTCOME_AWARENESS: "cost_per_reach",
  OUTCOME_TRAFFIC: "cost_per_landing_page_view",
  OUTCOME_ENGAGEMENT: "cost_per_post_engagement",
  OUTCOME_LEADS: "cost_per_lead",
  OUTCOME_APP_PROMOTION: "cost_per_app_install",
  OUTCOME_SALES: "cost_per_purchase",
};

// AB-test comparison metrics. Same flat list for every objective — the
// objective only drives the *default* (Recommended pill) via
// RECOMMENDED_METRIC_BY_OBJECTIVE. A `group` field marks a non-selectable
// section header.
export type AbTestMetricOption =
  | { value: string; label: string; group?: undefined }
  | { value: string; label: string; group: string };

export const AB_TEST_METRICS: AbTestMetricOption[] = [
  ...COMMON_COST_METRICS,
  { value: "__group_standard_events__", label: "Standard events", group: "Standard events" },
  ...STANDARD_EVENT_METRICS,
];

// Kept as a per-objective record so the existing call sites (and the wizard
// payload) continue to compile. All objectives now share the same option list;
// only the default value differs.
export const AB_TEST_METRIC_BY_OBJECTIVE: Record<CampaignObjective, AbTestMetricOption[]> = {
  OUTCOME_AWARENESS: AB_TEST_METRICS,
  OUTCOME_TRAFFIC: AB_TEST_METRICS,
  OUTCOME_ENGAGEMENT: AB_TEST_METRICS,
  OUTCOME_LEADS: AB_TEST_METRICS,
  OUTCOME_APP_PROMOTION: AB_TEST_METRICS,
  OUTCOME_SALES: AB_TEST_METRICS,
};

export const CTA_OPTIONS: { value: CtaButton; label: string }[] = [
  { value: "NO_BUTTON", label: "No button" },
  { value: "LEARN_MORE", label: "Learn More" },
  { value: "SHOP_NOW", label: "Shop Now" },
  { value: "SIGN_UP", label: "Sign Up" },
  { value: "DOWNLOAD", label: "Download" },
  { value: "GET_OFFER", label: "Get Offer" },
  { value: "BOOK_TRAVEL", label: "Book Now" },
  { value: "CONTACT_US", label: "Contact Us" },
  { value: "SUBSCRIBE", label: "Subscribe" },
  { value: "APPLY_NOW", label: "Apply Now" },
  { value: "GET_QUOTE", label: "Get Quote" },
];

export const PLACEMENT_OPTIONS: { value: Placement; label: string; hint: string }[] = [
  { value: "facebook", label: "Facebook", hint: "Feed, Stories, Reels, Marketplace" },
  { value: "instagram", label: "Instagram", hint: "Feed, Stories, Reels, Explore" },
  { value: "audience_network", label: "Audience Network", hint: "Third-party apps and sites" },
  { value: "messenger", label: "Messenger", hint: "Inbox and Stories" },
];

export const AGE_MIN_FLOOR = 13;
export const AGE_MAX_CEILING = 65;

export type StepProps = {
  form: WizardState;
  setForm: (updater: (prev: WizardState) => WizardState) => void;
  clientId?: number;
  showAllErrors?: boolean;
};

export const toSelectedLocation = (loc: TargetingLocation): SelectedLocation => ({
  key: loc.key,
  name: loc.name,
  type: loc.type,
  country_code: loc.country_code,
});

export const toSelectedInterest = (i: TargetingInterest) => ({ id: i.id, name: i.name });
