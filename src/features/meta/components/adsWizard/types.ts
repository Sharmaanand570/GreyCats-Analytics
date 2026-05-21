import type {
  AdType,
  AdVariant,
  BudgetType,
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
  audienceType: "CUSTOM" | "WEBSITE" | "LOOKALIKE";
  excluded?: boolean;
};

export type WizardFormState = {
  // Step 1
  accountId: string;
  pageId: string;
  campaignName: string;
  objective: CampaignObjective;
  specialAdCategory: SpecialAdCategory;
  budgetType: BudgetType;
  dailyBudget: number;
  lifetimeBudget: number;
  startTime: string;
  endTime: string;
  pixelId: string;            // empty unless objective === OUTCOME_SALES
  conversionEvent: ConversionEvent | "";
  // Step 2
  locations: SelectedLocation[];
  interests: SelectedInterest[];
  detailedTargeting: SelectedDetailedTargeting[];
  customAudiences: SelectedAudience[];
  ageMin: number;
  ageMax: number;
  gender: Gender;
  placements: Placement[];
  // Step 3
  publishMode: PublishMode;
  adType: AdType;
  adHeadline: string;
  adText: string;
  description: string;
  adLink: string;
  imageUrl: string;
  ctaButton: CtaButton;
  carouselCards: CarouselCard[];
  videoUrl: string;
  videoThumbnailUrl: string;
  captionsUrl: string;
  adVariants: AdVariant[];
};

// Meta's defaults: 18–65, all genders, auto placements (empty array), traffic objective.
export const INITIAL_FORM_STATE: WizardFormState = {
  accountId: "",
  pageId: "",
  campaignName: "",
  objective: "OUTCOME_TRAFFIC",
  specialAdCategory: "NONE",
  budgetType: "DAILY",
  dailyBudget: 15,
  lifetimeBudget: 100,
  startTime: "",
  endTime: "",
  pixelId: "",
  conversionEvent: "",
  locations: [],
  interests: [],
  detailedTargeting: [],
  customAudiences: [],
  ageMin: 18,
  ageMax: 65,
  gender: "ALL",
  placements: [],
  publishMode: "SINGLE_AD",
  adType: "SINGLE_IMAGE",
  adHeadline: "",
  adText: "",
  description: "",
  adLink: "",
  imageUrl: "",
  ctaButton: "LEARN_MORE",
  carouselCards: [],
  videoUrl: "",
  videoThumbnailUrl: "",
  captionsUrl: "",
  adVariants: [],
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

export const blankCarouselCard = (): CarouselCard => ({
  imageUrl: "",
  headline: "",
  description: "",
  link: "",
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
  { value: "OUTCOME_TRAFFIC", label: "Traffic", hint: "Drive visits to your website or app" },
  { value: "OUTCOME_AWARENESS", label: "Awareness", hint: "Show your ad to as many people as possible" },
  { value: "OUTCOME_ENGAGEMENT", label: "Engagement", hint: "Get likes, comments, shares, and follows" },
  { value: "OUTCOME_LEADS", label: "Leads", hint: "Collect contact info via forms or messages" },
  { value: "OUTCOME_SALES", label: "Sales", hint: "Drive purchases and conversions" },
];

export const CTA_OPTIONS: { value: CtaButton; label: string }[] = [
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
  form: WizardFormState;
  setForm: (updater: (prev: WizardFormState) => WizardFormState) => void;
};

export const toSelectedLocation = (loc: TargetingLocation): SelectedLocation => ({
  key: loc.key,
  name: loc.name,
  type: loc.type,
  country_code: loc.country_code,
});

export const toSelectedInterest = (i: TargetingInterest) => ({ id: i.id, name: i.name });
