import type {
  AdScheduleBlock,
  BidStrategy,
  BiddingFocus,
  BudgetType,
  CtaType,
  DisplayImageAsset,
  GoogleAdsCampaignType,
  GoogleAdsNetwork,
  GoogleAdsObjective,
  KeywordMatchType,
  LocationPreset,
  LocationTargetMode,
  PinPosition,
  RsaDescription,
  RsaHeadline,
  SelectedLocation,
} from "../../API/googleAdsManagerApi";

export type WizardFormState = {
  // Step 0 — anchor (chosen Google Ads customer the campaign publishes to).
  customerId: string;

  // Step 1 — Objective & Type
  objective: GoogleAdsObjective;
  campaignType: GoogleAdsCampaignType;

  // Step 2 — Settings
  campaignName: string;
  networks: GoogleAdsNetwork[];
  locationMode: LocationTargetMode;
  locations: SelectedLocation[];
  locationPreset: LocationPreset;
  languageIds: string[];
  adSchedule: AdScheduleBlock[];
  campaignStartDate: string;
  campaignEndDate: string;
  adRotation: "OPTIMIZE" | "ROTATE_FOREVER";

  // Step 3 — Bidding & Budget
  biddingFocus: BiddingFocus;
  bidStrategy: BidStrategy;
  // Optional bid inputs (microcurrency for CPA/CPC, percent for ROAS).
  // Stored in display units (dollars / percent); builder converts to micros.
  setTargetCpa: boolean;
  targetCpa: number;
  setTargetRoas: boolean;
  targetRoasPercent: number;
  setMaxCpc: boolean;
  maxCpc: number;
  conversionActionId: string;
  budgetType: BudgetType;
  budgetAmount: number;
  customerAcquisition: boolean;
  acquisitionOptimizeNew: boolean;
  targetImpressionShareLocation: "ANYWHERE" | "TOP" | "ABSOLUTE_TOP";
  targetImpressionSharePercent: number;
  targetImpressionShareMaxCpc: number;

  // Step 4 — Ad Group + Keywords (Search only)
  adGroupName: string;
  keywordsText: string;

  // Step 5 — Creative
  // RSA fields
  rsaFinalUrl: string;
  rsaPath1: string;
  rsaPath2: string;
  rsaHeadlines: RsaHeadline[];
  rsaDescriptions: RsaDescription[];
  rsaSitelinks: Array<{ text: string; line1: string; line2: string; url: string }>;
  rsaCallouts: string[];
  rsaSnippetsHeader: string;
  rsaSnippetsValues: string[];
  rsaCallCountryCode: string;
  rsaCallPhoneNumber: string;
  // Responsive Display fields
  displayFinalUrl: string;
  displayBusinessName: string;
  displayLongHeadline: string;
  displayHeadlines: string[];
  displayDescriptions: string[];
  displayImages: DisplayImageAsset[];
  displayLogos: DisplayImageAsset[];
  displayYoutubeUrls: string[];
  displayAccentColor: string;
  displayMainColor: string;
  displayCta: CtaType;
  displayEnhance: boolean;
  displayAutoVideo: boolean;
  displayNative: boolean;
  // Tracking
  trackingTemplate: string;
  finalUrlSuffix: string;
  customParameters: Array<{ key: string; value: string }>;
};

// ─── Step constants ─────────────────────────────────────────────────────────

export const MAX_RSA_HEADLINES = 15;
export const MIN_RSA_HEADLINES = 3;
export const MAX_RSA_HEADLINE_LEN = 30;
export const MAX_RSA_DESCRIPTIONS = 4;
export const MIN_RSA_DESCRIPTIONS = 2;
export const MAX_RSA_DESCRIPTION_LEN = 90;
export const MAX_RSA_PATH_LEN = 15;

export const MAX_DISPLAY_HEADLINES = 5;
export const MAX_DISPLAY_DESCRIPTIONS = 5;
export const MAX_DISPLAY_HEADLINE_LEN = 30;
export const MAX_DISPLAY_DESCRIPTION_LEN = 90;
export const MAX_DISPLAY_LONG_HEADLINE_LEN = 90;
export const MAX_DISPLAY_BUSINESS_NAME_LEN = 25;
export const MAX_DISPLAY_IMAGES = 15;
export const MAX_DISPLAY_LOGOS = 5;
export const MAX_DISPLAY_VIDEOS = 5;

// ─── Initial state ──────────────────────────────────────────────────────────

const blankRsaHeadlines = (): RsaHeadline[] =>
  Array.from({ length: MIN_RSA_HEADLINES }, () => ({ text: "", pin: "UNPINNED" as PinPosition }));

const blankRsaDescriptions = (): RsaDescription[] =>
  Array.from({ length: MIN_RSA_DESCRIPTIONS }, () => ({
    text: "",
    pin: "UNPINNED" as Exclude<PinPosition, "POSITION_3">,
  }));

const blankDisplayHeadlines = (): string[] =>
  Array.from({ length: 3 }, () => "");

const blankDisplayDescriptions = (): string[] =>
  Array.from({ length: 2 }, () => "");

export const INITIAL_FORM_STATE: WizardFormState = {
  customerId: "",

  objective: "WEBSITE_TRAFFIC",
  campaignType: "SEARCH",

  campaignName: "",
  networks: ["SEARCH"],
  locationMode: "LOCAL_COUNTRY",
  locations: [],
  locationPreset: "PRESENCE_OR_INTEREST",
  languageIds: ["1000"], // Google's ID for English
  adSchedule: [],

  campaignStartDate: new Date().toISOString().split("T")[0],
  campaignEndDate: "",
  adRotation: "OPTIMIZE",

  biddingFocus: "CONVERSIONS",
  bidStrategy: "MAXIMIZE_CONVERSIONS",
  setTargetCpa: false,
  targetCpa: 0,
  setTargetRoas: false,
  targetRoasPercent: 0,
  setMaxCpc: false,
  maxCpc: 0,
  conversionActionId: "",
  budgetType: "DAILY",
  budgetAmount: 20,
  customerAcquisition: false,
  acquisitionOptimizeNew: false,
  targetImpressionShareLocation: "ANYWHERE",
  targetImpressionSharePercent: 70,
  targetImpressionShareMaxCpc: 0,

  adGroupName: "Ad Group 1",
  keywordsText: "",

  rsaFinalUrl: "",
  rsaPath1: "",
  rsaPath2: "",
  rsaHeadlines: blankRsaHeadlines(),
  rsaDescriptions: blankRsaDescriptions(),
  rsaSitelinks: [
    { text: "", line1: "", line2: "", url: "" },
    { text: "", line1: "", line2: "", url: "" },
    { text: "", line1: "", line2: "", url: "" },
    { text: "", line1: "", line2: "", url: "" },
  ],
  rsaCallouts: ["", "", "", ""],
  rsaSnippetsHeader: "Types",
  rsaSnippetsValues: ["", "", ""],
  rsaCallCountryCode: "US",
  rsaCallPhoneNumber: "",

  displayFinalUrl: "",
  displayBusinessName: "",
  displayLongHeadline: "",
  displayHeadlines: blankDisplayHeadlines(),
  displayDescriptions: blankDisplayDescriptions(),
  displayImages: [],
  displayLogos: [],
  displayYoutubeUrls: [],
  displayAccentColor: "#1A73E8",
  displayMainColor: "#FFFFFF",
  displayCta: "LEARN_MORE",
  displayEnhance: true,
  displayAutoVideo: true,
  displayNative: true,

  trackingTemplate: "",
  finalUrlSuffix: "",
  customParameters: [],
};

// ─── Display option arrays ──────────────────────────────────────────────────

export const OBJECTIVE_OPTIONS: {
  value: GoogleAdsObjective;
  label: string;
  hint: string;
}[] = [
  { value: "SALES", label: "Sales", hint: "Drive online sales and purchases" },
  { value: "LEADS", label: "Leads", hint: "Capture form fills, calls, sign-ups" },
  { value: "WEBSITE_TRAFFIC", label: "Website Traffic", hint: "Get the right people to visit your site" },
  { value: "BRAND_AWARENESS", label: "Brand Awareness", hint: "Reach a broad audience" },
  { value: "LOCAL_STORE_VISITS", label: "Local Store Visits", hint: "Drive visits to physical locations" },
  { value: "NO_GUIDANCE", label: "Create without guidance", hint: "Skip objective recommendations" },
];

export const CAMPAIGN_TYPE_OPTIONS: {
  value: GoogleAdsCampaignType;
  label: string;
  hint: string;
}[] = [
  { value: "SEARCH", label: "Search", hint: "Text ads on Google Search results" },
  { value: "DISPLAY", label: "Display", hint: "Image ads across Google Display Network" },
  { value: "PERFORMANCE_MAX", label: "Performance Max", hint: "All Google networks in one campaign" },
];

// Which campaign types are recommended per objective. Used to highlight or
// filter the type cards on Step 1.
export const OBJECTIVE_RECOMMENDED_TYPES: Record<
  GoogleAdsObjective,
  GoogleAdsCampaignType[]
> = {
  SALES: ["SEARCH", "PERFORMANCE_MAX", "DISPLAY"],
  LEADS: ["SEARCH", "PERFORMANCE_MAX"],
  WEBSITE_TRAFFIC: ["SEARCH", "DISPLAY", "PERFORMANCE_MAX"],
  BRAND_AWARENESS: ["DISPLAY", "PERFORMANCE_MAX"],
  LOCAL_STORE_VISITS: ["PERFORMANCE_MAX"],
  NO_GUIDANCE: ["SEARCH", "DISPLAY", "PERFORMANCE_MAX"],
};

export const NETWORK_OPTIONS: {
  value: GoogleAdsNetwork;
  label: string;
  hint: string;
}[] = [
  { value: "SEARCH", label: "Google Search", hint: "Ads on Google Search results" },
  { value: "SEARCH_PARTNERS", label: "Search Partners", hint: "Search results on Google partner sites" },
  { value: "DISPLAY", label: "Google Display Network", hint: "Image ads across 3M+ sites & apps" },
];

export const BIDDING_FOCUS_OPTIONS: {
  value: BiddingFocus;
  label: string;
  hint: string;
}[] = [
  { value: "CONVERSIONS", label: "Conversions", hint: "Optimize for conversion volume" },
  { value: "CONVERSION_VALUE", label: "Conversion Value", hint: "Maximize total conversion value" },
  { value: "CLICKS", label: "Clicks", hint: "Drive the most clicks for your budget" },
  { value: "IMPRESSION_SHARE", label: "Impression Share", hint: "Boost visibility on key searches" },
];

export const PIN_POSITION_OPTIONS: { value: PinPosition; label: string }[] = [
  { value: "UNPINNED", label: "Unpinned (any position)" },
  { value: "POSITION_1", label: "Pin to Position 1" },
  { value: "POSITION_2", label: "Pin to Position 2" },
  { value: "POSITION_3", label: "Pin to Position 3" },
];

export const DESCRIPTION_PIN_OPTIONS: {
  value: Exclude<PinPosition, "POSITION_3">;
  label: string;
}[] = [
  { value: "UNPINNED", label: "Unpinned (any position)" },
  { value: "POSITION_1", label: "Pin to Position 1" },
  { value: "POSITION_2", label: "Pin to Position 2" },
];

export const CTA_OPTIONS: { value: CtaType; label: string }[] = [
  { value: "LEARN_MORE", label: "Learn More" },
  { value: "SHOP_NOW", label: "Shop Now" },
  { value: "SIGN_UP", label: "Sign Up" },
  { value: "CONTACT_US", label: "Contact Us" },
  { value: "DOWNLOAD", label: "Download" },
  { value: "BOOK_NOW", label: "Book Now" },
  { value: "APPLY_NOW", label: "Apply Now" },
  { value: "GET_QUOTE", label: "Get Quote" },
  { value: "SUBSCRIBE", label: "Subscribe" },
];

// Most-used Google Ads language constant IDs. The full list is hundreds long;
// this covers the common cases. Backend accepts any valid ID.
export const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "1000", label: "English" },
  { value: "1003", label: "Spanish" },
  { value: "1002", label: "French" },
  { value: "1001", label: "German" },
  { value: "1004", label: "Italian" },
  { value: "1014", label: "Portuguese" },
  { value: "1010", label: "Dutch" },
  { value: "1030", label: "Polish" },
  { value: "1037", label: "Turkish" },
  { value: "1031", label: "Russian" },
  { value: "1019", label: "Arabic" },
  { value: "1023", label: "Hindi" },
  { value: "1057", label: "Indonesian" },
  { value: "1040", label: "Vietnamese" },
  { value: "1044", label: "Thai" },
  { value: "1005", label: "Japanese" },
  { value: "1012", label: "Korean" },
  { value: "1017", label: "Chinese (Simplified)" },
  { value: "1018", label: "Chinese (Traditional)" },
];

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Keyword parsing ────────────────────────────────────────────────────────
//
// User pastes keywords one per line. We support Google's standard syntax:
//   foo bar      — broad match
//   "foo bar"    — phrase match
//   [foo bar]    — exact match
// Lines with leading +word are treated as broad-modifier (deprecated by Google
// in 2021 but still understood as broad here).

export const parseKeywords = (
  text: string
): { text: string; matchType: KeywordMatchType }[] => {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith("[") && line.endsWith("]")) {
        return { text: line.slice(1, -1).trim(), matchType: "EXACT" as const };
      }
      if (line.startsWith('"') && line.endsWith('"')) {
        return { text: line.slice(1, -1).trim(), matchType: "PHRASE" as const };
      }
      return { text: line, matchType: "BROAD" as const };
    })
    .filter((k) => k.text.length > 0);
};

// ─── Shared props ───────────────────────────────────────────────────────────

export type StepProps = {
  form: WizardFormState;
  setForm: (updater: (prev: WizardFormState) => WizardFormState) => void;
  clientId: number;
  showAllErrors?: boolean;
};
