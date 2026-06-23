// ─────────────────────────────────────────────────────────────
// SHARED / COMMON
// ─────────────────────────────────────────────────────────────

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export type CampaignFilterParams = PaginationParams &
  SortParams & {
    startDate?: string;
    endDate?: string;
    accountId?: string;
    status?: CampaignStatus | "ALL";
    campaignType?: string;
    search?: string;
  };

// ─────────────────────────────────────────────────────────────
// CAMPAIGN
// ─────────────────────────────────────────────────────────────

export type CampaignStatus = "ENABLED" | "PAUSED" | "REMOVED";

export type CampaignType =
  | "SEARCH"
  | "DISPLAY"
  | "SHOPPING"
  | "PERFORMANCE_MAX"
  | "DEMAND_GEN"
  | "VIDEO"
  | "APP"
  | "SMART";

export type BidStrategyType =
  | "MAXIMIZE_CONVERSIONS"
  | "TARGET_CPA"
  | "MAXIMIZE_CONVERSION_VALUE"
  | "TARGET_ROAS"
  | "MAXIMIZE_CLICKS"
  | "MANUAL_CPC"
  | "MANUAL_CPM"
  | "MANUAL_CPV"
  | "TARGET_IMPRESSION_SHARE"
  | "ENHANCED_CPC";

export interface CreateCampaignPayload {
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  budgetAmount: number;
  budgetType?: "DAILY" | "TOTAL";
  biddingFocus?: "CONVERSIONS" | "CONVERSION_VALUE" | "CLICKS" | "IMPRESSION_SHARE";
  targetCpa?: number;
  targetRoas?: number;
  biddingStrategyId?: string;
  onlyNewCustomers?: boolean;
  networks?: {
    searchPartners?: boolean;
    displayNetwork?: boolean;
  };
  locations?: {
    type: "ALL" | "US_CA" | "OTHER";
    specificLocations?: string[];
  };
  languages?: string[];
  euPolitical?: boolean;
  startDate?: string;
  endDate?: string;
  objective?: string;
  // Previously UI Only - Now Part of the Published Payload
  appSubtype?: "installs" | "engagement" | "prereg";
  appPlatform?: "android" | "ios" | null;
  videoSubtype?: string;
  reachGoals?: any;
  clientId?: number;
  youtubeGoal?: "views" | "reach" | "subs";
  storeLocationType?: "business" | "affiliate";
  advertiseProducts?: boolean;
  localGoal?: "contact" | "directions";
  sharedBudgetId?: string;
  finalUrlExpansion?: boolean;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  cost: number;           // in account currency (not micros)
  costMicros?: number;
  conversions: number;
  conversionValue: number;
  allConversions: number;
  ctr: number;            // fraction e.g. 0.12 = 12%
  averageCpc: number;
  averageCpm: number;
  conversionRate: number;
  costPerConversion: number;
  roas: number;
  viewThroughConversions: number;
  interactionRate: number;
  interactions: number;
  searchImpressionShare?: number;
  absoluteTopImpressionPct?: number;
  topImpressionPct?: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  campaignType: CampaignType;
  advertisingChannelType?: string;
  budgetAmountMicros: number;
  budgetAmount: number;      // in account currency
  budgetName?: string;
  budgetExplicitlyShared?: boolean;
  bidStrategyType: BidStrategyType;
  bidStrategyName?: string;
  biddingStrategyId?: string;
  sharedBudgetId?: string;
  targetCpa?: number;
  targetRoas?: number;
  optimizationScore?: number;  // 0-1
  startDate?: string;
  endDate?: string;
  networkSearch?: boolean;
  networkSearchPartners?: boolean;
  networkDisplay?: boolean;
  trackingUrlTemplate?: string;
  finalUrlSuffix?: string;
  metrics: CampaignMetrics;
}

export interface CampaignsListResponse {
  success: boolean;
  campaigns: Campaign[];
  totalCount?: number;
}

export interface CampaignDetailResponse {
  success: boolean;
  campaign: Campaign;
}

export interface MutateCampaignPayload {
  name?: string;
  status?: CampaignStatus;
  budgetAmountMicros?: number;
  targetCpa?: number;
  targetRoas?: number;
  startDate?: string;
  endDate?: string;
  trackingUrlTemplate?: string;
  finalUrlSuffix?: string;
  biddingStrategyId?: string;
}

export interface MutateCampaignResponse {
  success: boolean;
  message: string;
  campaign?: Campaign;
}

// ─────────────────────────────────────────────────────────────
// AD GROUP
// ─────────────────────────────────────────────────────────────

export type AdGroupStatus = "ENABLED" | "PAUSED" | "REMOVED";

export type AdGroupType =
  | "SEARCH_STANDARD"
  | "DISPLAY_STANDARD"
  | "SHOPPING_PRODUCT_ADS"
  | "VIDEO_TRUE_VIEW_IN_STREAM"
  | "VIDEO_BUMPER"
  | "APP_UNSPECIFIED";

export interface AdGroupMetrics {
  impressions: number;
  clicks: number;
  cost: number;
  ctr: number;
  averageCpc: number;
  conversions: number;
  conversionValue: number;
  conversionRate: number;
  costPerConversion: number;
  roas: number;
}

export interface AdGroup {
  id: string;
  campaignId: string;
  campaignName?: string;
  name: string;
  status: AdGroupStatus;
  type?: AdGroupType;
  cpcBidMicros?: number;
  cpcBid?: number;
  targetCpa?: number;
  targetRoas?: number;
  qualityScore?: number;
  audienceSignals?: any[];
  metrics: AdGroupMetrics;
}

export interface AdGroupsListResponse {
  success: boolean;
  adGroups: AdGroup[];
  totalCount?: number;
}

export interface AdGroupDetailResponse {
  success: boolean;
  adGroup: AdGroup;
}

export interface MutateAdGroupPayload {
  name?: string;
  status?: AdGroupStatus;
  cpcBidMicros?: number;
  targetCpa?: number;
  targetRoas?: number;
}

export interface MutateAdGroupResponse {
  success: boolean;
  message: string;
  adGroup?: AdGroup;
}

// ─────────────────────────────────────────────────────────────
// AD
// ─────────────────────────────────────────────────────────────

export type AdStatus = "ENABLED" | "PAUSED" | "REMOVED";
export type AdType =
  | "RESPONSIVE_SEARCH_AD"
  | "EXPANDED_TEXT_AD"
  | "RESPONSIVE_DISPLAY_AD"
  | "SHOPPING_PRODUCT_AD"
  | "VIDEO_AD"
  | "APP_AD"
  | "DEMAND_GEN_MULTI_ASSET_AD";

export type AdStrength = "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR" | "PENDING" | "UNSPECIFIED";
export type ApprovalStatus = "APPROVED" | "PENDING_REVIEW" | "UNDER_REVIEW" | "DISAPPROVED" | "UNSPECIFIED";

export type PinPosition = "UNSPECIFIED" | "POSITION_1" | "POSITION_2" | "POSITION_3";

export interface RsaHeadlineAsset {
  text: string;
  pinnedField?: PinPosition;
}

export interface RsaDescriptionAsset {
  text: string;
  pinnedField?: PinPosition;
}

export interface ResponsiveSearchAdInfo {
  headlines: RsaHeadlineAsset[];
  descriptions: RsaDescriptionAsset[];
  path1?: string;
  path2?: string;
}

export interface AdMetrics {
  impressions: number;
  clicks: number;
  cost: number;
  ctr: number;
  averageCpc: number;
  conversions: number;
  conversionRate: number;
  costPerConversion: number;
}

export interface Ad {
  id: string;
  adGroupId: string;
  adGroupName?: string;
  campaignId: string;
  campaignName?: string;
  status: AdStatus;
  type: AdType;
  finalUrls?: string[];
  displayUrl?: string;
  adStrength?: AdStrength;
  approvalStatus?: ApprovalStatus;
  policyTopics?: string[];
  responsiveSearchAd?: ResponsiveSearchAdInfo;
  videoAd?: any;
  metrics: AdMetrics;
}

export interface AdsListResponse {
  success: boolean;
  ads: Ad[];
  totalCount?: number;
}

// ─────────────────────────────────────────────────────────────
// KEYWORD
// ─────────────────────────────────────────────────────────────

export type KeywordMatchType = "BROAD" | "PHRASE" | "EXACT";
export type KeywordStatus = "ENABLED" | "PAUSED" | "REMOVED";

export interface QualityScoreDetail {
  qualityScore?: number;           // 1-10
  expectedCtrScore?: "ABOVE_AVERAGE" | "AVERAGE" | "BELOW_AVERAGE";
  adRelevanceScore?: "ABOVE_AVERAGE" | "AVERAGE" | "BELOW_AVERAGE";
  landingPageScore?: "ABOVE_AVERAGE" | "AVERAGE" | "BELOW_AVERAGE";
}

export interface KeywordMetrics {
  impressions: number;
  clicks: number;
  cost: number;
  ctr: number;
  averageCpc: number;
  conversions: number;
  conversionRate: number;
  costPerConversion: number;
  averagePosition?: number;
  searchImpressionShare?: number;
}

export interface Keyword {
  id: string;
  adGroupId: string;
  adGroupName?: string;
  campaignId: string;
  campaignName?: string;
  text: string;
  matchType: KeywordMatchType;
  status: KeywordStatus;
  negative: boolean;
  cpcBidMicros?: number;
  cpcBid?: number;
  effectiveCpcBid?: number;
  qualityInfo?: QualityScoreDetail;
  metrics: KeywordMetrics;
  bidModifier?: number;
}

export interface NegativeKeyword {
  id: string;
  text: string;
  matchType: KeywordMatchType;
  level: "CAMPAIGN" | "AD_GROUP" | "SHARED_SET";
  campaignId?: string;
  campaignName?: string;
  adGroupId?: string;
  adGroupName?: string;
  sharedSetId?: string;
  sharedSetName?: string;
}

export interface KeywordsListResponse {
  success: boolean;
  keywords: Keyword[];
  totalCount?: number;
}

export interface NegativeKeywordsListResponse {
  success: boolean;
  negativeKeywords: NegativeKeyword[];
  totalCount?: number;
}

export interface AddKeywordsPayload {
  keywords: Array<{
    text: string;
    matchType: KeywordMatchType;
    cpcBidMicros?: number;
  }>;
}

export interface AddNegativeKeywordsPayload {
  keywords: Array<{
    text: string;
    matchType: KeywordMatchType;
    level: "CAMPAIGN" | "AD_GROUP";
    campaignId?: string;
    adGroupId?: string;
  }>;
}

export interface MutateKeywordPayload {
  status?: KeywordStatus;
  cpcBidMicros?: number;
}

export interface KeywordMutateResponse {
  success: boolean;
  message: string;
}

// ─────────────────────────────────────────────────────────────
// BIDDING STRATEGY
// ─────────────────────────────────────────────────────────────

export interface BiddingStrategy {
  id: string;
  name: string;
  type: BidStrategyType;
  status: "ENABLED" | "REMOVED";
  campaignCount: number;
  targetCpa?: number;
  targetRoas?: number;
  targetImpressionShare?: number;
  metrics?: {
    impressions: number;
    clicks: number;
    costMicros: number;
    conversions: number;
    conversionsValue: number;
  };
}

export interface BiddingStrategyListResponse {
  success: boolean;
  strategies: BiddingStrategy[];
}

// ─────────────────────────────────────────────────────────────
// SHARED BUDGETS
// ─────────────────────────────────────────────────────────────

export interface SharedBudget {
  id: string;
  name: string;
  amountMicros: number;
  status: "ENABLED" | "REMOVED";
  campaignCount: number;
  deliveryMethod?: "STANDARD" | "ACCELERATED";
}

export interface SharedBudgetListResponse {
  success: boolean;
  budgets: SharedBudget[];
}

// ─────────────────────────────────────────────────────────────
// PLACEMENT EXCLUSIONS
// ─────────────────────────────────────────────────────────────

export interface PlacementExclusionList {
  id: string;
  name: string;
  status: "ENABLED" | "REMOVED";
  type: "PLACEMENT_EXCLUSION";
  campaignCount: number;
  placementCount: number;
}

export interface PlacementExclusion {
  id: string;
  placement: string;
  type: "WEBSITE" | "YOUTUBE_CHANNEL" | "YOUTUBE_VIDEO" | "MOBILE_APP" | "MOBILE_APP_CATEGORY";
  level: "SHARED_SET" | "CAMPAIGN" | "AD_GROUP";
  sharedSetId?: string;
  sharedSetName?: string;
}

export interface PlacementExclusionListsResponse {
  success: boolean;
  lists: PlacementExclusionList[];
}

export interface PlacementExclusionsResponse {
  success: boolean;
  exclusions: PlacementExclusion[];
  totalCount?: number;
}

// ─────────────────────────────────────────────────────────────
// ASSET GROUPS (Performance Max)
// ─────────────────────────────────────────────────────────────

export interface AssetGroupAsset {
  assetId: string;
  fieldType: "HEADLINE" | "LONG_HEADLINE" | "DESCRIPTION" | "MANDATORY_AD_TEXT" | "MARKETING_IMAGE" | "SQUARE_MARKETING_IMAGE" | "PORTRAIT_MARKETING_IMAGE" | "LOGO" | "LANDSCAPE_LOGO" | "VIDEO" | "YOUTUBE_VIDEO";
  status?: string;
}

export interface AssetGroup {
  id: string;
  campaignId: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED";
  finalUrls: string[];
  path1?: string;
  path2?: string;
  assets: AssetGroupAsset[];
  audienceSignals?: string[]; // IDs of audiences
  metrics?: {
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
  };
}

export interface AssetGroupsListResponse {
  success: boolean;
  assetGroups: AssetGroup[];
  totalCount?: number;
}

// ─────────────────────────────────────────────────────────────
// SEARCH TERMS
// ─────────────────────────────────────────────────────────────

export interface SearchTerm {
  searchTerm: string;
  matchType: "BROAD" | "PHRASE" | "EXACT" | "NEAR_EXACT" | "NEAR_PHRASE";
  keywordText?: string;
  adGroupId: string;
  adGroupName?: string;
  campaignId: string;
  campaignName?: string;
  status: "ADDED" | "EXCLUDED" | "ADDED_EXCLUDED" | "NONE";
  metrics: {
    impressions: number;
    clicks: number;
    cost: number;
    ctr: number;
    averageCpc: number;
    conversions: number;
    conversionRate: number;
    costPerConversion: number;
  };
}

export interface SearchTermsListResponse {
  success: boolean;
  searchTerms: SearchTerm[];
  totalCount?: number;
}

// ─────────────────────────────────────────────────────────────
// AUDIENCES
// ─────────────────────────────────────────────────────────────

export type AudienceType = "USER_LIST" | "CUSTOM_AUDIENCE" | "COMBINED_AUDIENCE" | "AFFINITY" | "IN_MARKET" | "UNKNOWN";
export type AudienceStatus = "ENABLED" | "PAUSED" | "REMOVED";

export interface Audience {
  id: string;
  name: string;
  type: AudienceType;
  description?: string;
  sizeRange?: string; // e.g. "10K - 50K"
}

export interface OfflineUserDataJob {
  resourceName: string;
  id: string;
  externalId: string;
  type: "CUSTOMER_MATCH_USER_LIST";
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
  failureReason?: string;
}

export interface CampaignAudience {
  id: string;
  audienceId: string;
  audienceName: string;
  audienceType: AudienceType;
  campaignId: string;
  campaignName?: string;
  status: AudienceStatus;
  bidModifier?: number; // e.g. 1.2 for +20%
  metrics: {
    impressions: number;
    clicks: number;
    cost: number;
    ctr: number;
    averageCpc: number;
    conversions: number;
    conversionRate: number;
    costPerConversion: number;
  };
}

export interface AudiencesListResponse {
  success: boolean;
  audiences: CampaignAudience[];
  totalCount?: number;
}

export interface AddAudiencePayload {
  audienceId: string;
  bidModifier?: number;
}

// ─────────────────────────────────────────────────────────────
// ASSETS
// ─────────────────────────────────────────────────────────────

export type AssetType = 
  | "SITELINK" 
  | "CALLOUT" 
  | "STRUCTURED_SNIPPET" 
  | "IMAGE" 
  | "LOGO"
  | "YOUTUBE_VIDEO" 
  | "VIDEO"
  | "CALL" 
  | "PROMOTION" 
  | "PRICE" 
  | "LEAD_FORM" 
  | "UNKNOWN";

export type AssetStatus = "ENABLED" | "PAUSED" | "REMOVED";

export interface Asset {
  id: string;
  type: AssetType;
  status: AssetStatus;
  text?: string;
  finalUrl?: string;
  imageUrl?: string;
  videoId?: string;
  calloutText?: string;
  
  // Backend-ready media asset fields
  assetId?: string;
  assetType?: "IMAGE" | "LOGO" | "VIDEO" | string;
  assetUrl?: string;
  thumbnailUrl?: string;

  metrics: {
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
  };
}

export interface AssetsListResponse {
  success: boolean;
  assets: Asset[];
  totalCount?: number;
}

export interface CreateAssetPayload {
  type: AssetType;
  text?: string;
  finalUrl?: string;
  imageUrl?: string;
  assetUrl?: string;
  videoId?: string;
  calloutText?: string;
  assetId?: string;
}

export interface AssetMutateResponse {
  success: boolean;
  assetId?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────
// RECOMMENDATIONS
// ─────────────────────────────────────────────────────────────

export type RecommendationType = 
  | "KEYWORD"
  | "TEXT_AD"
  | "TARGET_CPA_OPT_IN"
  | "TARGET_ROAS_OPT_IN"
  | "CALLOUT_EXTENSION"
  | "SITELINK_EXTENSION"
  | "RESPONSIVE_SEARCH_AD"
  | "MAXIMIZE_CONVERSIONS_OPT_IN"
  | "ENHANCED_CPC_OPT_IN"
  | "MOVE_UNUSED_BUDGET"
  | "RAISE_TARGET_CPA_BID_TOO_LOW"
  | "UNKNOWN";

export interface RecommendationImpact {
  baseMetrics?: {
    clicks?: number;
    cost?: number;
    conversions?: number;
  };
  potentialMetrics?: {
    clicks?: number;
    cost?: number;
    conversions?: number;
  };
}

export interface Recommendation {
  id: string;
  campaignId?: string;
  campaignName?: string;
  type: RecommendationType;
  headline: string;
  description: string;
  impact?: RecommendationImpact;
  dismissed: boolean;
  optimizationScoreImpact?: number; // e.g., 0.05 for 5%
}

export interface RecommendationsListResponse {
  success: boolean;
  recommendations: Recommendation[];
  accountOptimizationScore?: number; // 0 to 1
}

// ─────────────────────────────────────────────────────────────
// DRAFTS & EXPERIMENTS
// ─────────────────────────────────────────────────────────────

export interface CampaignDraft {
  id: string;
  draftId: string;
  baseCampaignId: string;
  baseCampaignName: string;
  draftCampaignId?: string; // The shadow campaign
  draftName: string;
  status: "PROPOSED" | "PROMOTED" | "REMOVED" | "PROMOTING";
  createdAt?: string;
}

export interface Experiment {
  id: string;
  experimentId: string;
  name: string;
  baseCampaignId: string;
  draftCampaignId: string;
  status: "CREATING" | "ACTIVE" | "PROMOTING" | "PROMOTED" | "REMOVED" | "FINISHED" | "SUSPENDED";
  type: "SEARCH_CUSTOM" | "DISPLAY_CUSTOM" | "PERFORMANCE_MAX_EXPERIMENT" | "UNKNOWN";
  startDate?: string;
  endDate?: string;
}

export interface ExperimentArm {
  armId: string;
  experimentId: string;
  campaignId: string;
  isBase: boolean;
  trafficSplit: number; // e.g., 50 for 50%
}

// ─────────────────────────────────────────────────────────────
// CONVERSIONS
// ─────────────────────────────────────────────────────────────

export type ConversionActionCategory =
  | "DEFAULT"
  | "PAGE_VIEW"
  | "PURCHASE"
  | "SIGNUP"
  | "LEAD"
  | "DOWNLOAD"
  | "ADD_TO_CART"
  | "BEGIN_CHECKOUT"
  | "SUBSCRIBE_PAID"
  | "PHONE_CALL_LEAD"
  | "IMPORTED_LEAD"
  | "STORE_VISIT"
  | "STORE_SALE"
  | "UNKNOWN";

export type ConversionActionType =
  | "WEBPAGE"
  | "WEBSITE_CALL"
  | "CLICK_TO_CALL"
  | "UPLOAD_CLICKS"
  | "UPLOAD_CALLS"
  | "STORE_VISITS"
  | "GOOGLE_PLAY_DOWNLOAD"
  | "GOOGLE_PLAY_IN_APP_PURCHASE"
  | "UNKNOWN";

export type ConversionActionStatus = "ENABLED" | "REMOVED" | "HIDDEN";

export type ConversionTrackingStatus =
  | "TRACKING"
  | "NO_RECENT_CONVERSIONS"
  | "UNVERIFIED"
  | "HIDDEN"
  | "REMOVED"
  | "UNKNOWN";

export interface ConversionAction {
  id: string;
  name: string;
  status: ConversionActionStatus;
  type: ConversionActionType;
  category: ConversionActionCategory;
  primaryForGoal: boolean;
  trackingStatus: ConversionTrackingStatus;
  includeInConversionsMetric: boolean;
  valueSettings?: {
    defaultValue?: number;
    defaultCurrencyCode?: string;
    alwaysUseDefaultValue?: boolean;
  };
  metrics: {
    conversions: number;
    allConversions: number;
    conversionValue: number;
    allConversionValue: number;
  };
}

export interface ConversionActionsListResponse {
  success: boolean;
  conversionActions: ConversionAction[];
  totalCount?: number;
}

export interface MutateConversionActionPayload {
  name?: string;
  status?: ConversionActionStatus;
  category?: ConversionActionCategory;
  primaryForGoal?: boolean;
  includeInConversionsMetric?: boolean;
  valueSettings?: {
    defaultValue?: number;
    defaultCurrencyCode?: string;
    alwaysUseDefaultValue?: boolean;
  };
}

export interface MutateConversionActionResponse {
  success: boolean;
  message: string;
  conversionAction?: ConversionAction;
}

// ─────────────────────────────────────────────────────────────
// REPORTING / GAQL
// ─────────────────────────────────────────────────────────────

export interface GaqlReportColumn {
  name: string;
  type: "STRING" | "NUMBER" | "DATE" | "CURRENCY" | "PERCENTAGE";
}

export type GaqlReportRow = Record<string, any>;

export interface GaqlReportResponse {
  success: boolean;
  query: string;
  columns: GaqlReportColumn[];
  rows: GaqlReportRow[];
  totalRowCount?: number;
}

export type ReportFrequency = "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";

export interface ReportSchedule {
  id: string;
  reportId: string;
  frequency: ReportFrequency;
  emails: string[];
  format: "CSV" | "PDF" | "EXCEL";
  nextRunDate?: string;
}

export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  type: 
    | "CAMPAIGN_PERFORMANCE"
    | "AD_GROUP_PERFORMANCE"
    | "AD_PERFORMANCE"
    | "KEYWORD_PERFORMANCE"
    | "SEARCH_TERMS"
    | "GEOGRAPHIC"
    | "DEVICE"
    | "AUDIENCE"
    | "CONVERSION"
    | "BUDGET"
    | "CUSTOM";
  query: string;
  schedule?: ReportSchedule;
  createdAt: string;
  updatedAt: string;
}

export interface SavedReportsListResponse {
  success: boolean;
  reports: SavedReport[];
}

// ─────────────────────────────────────────────────────────────
// MCC / ACCOUNT HIERARCHY
// ─────────────────────────────────────────────────────────────

export interface GoogleAdsAccount {
  id: number;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  isManager: boolean;
  status: "ENABLED" | "CANCELED" | "SUSPENDED" | "CLOSED" | "UNKNOWN";
  healthScore?: number; // 0 to 1
  optimizationScore?: number; // 0 to 1
  metrics?: {
    clicks: number;
    impressions: number;
    conversions: number;
    cost: number;
  };
  children?: GoogleAdsAccount[]; // For hierarchy tree
}

export interface ListAccessibleCustomersResponse {
  success: boolean;
  customers: GoogleAdsAccount[]; // the root accounts accessible to the user
}

export interface GetCustomerHierarchyResponse {
  success: boolean;
  hierarchy: GoogleAdsAccount;
}

// ─────────────────────────────────────────────────────────────
// SHARED LIBRARY (SHARED SETS & CRITERIA)
// ─────────────────────────────────────────────────────────────

export interface ReportMetric {
  date: string;
  value: number;
}

// ─────────────────────────────────────────────────────────────
// CHANGE HISTORY
// ─────────────────────────────────────────────────────────────

export type ChangeStatus = "CREATED" | "UPDATED" | "REMOVED" | "UNKNOWN";

export type ChangeResourceType = "CAMPAIGN" | "AD_GROUP" | "AD" | "KEYWORD" | "ASSET" | "AUDIENCE" | "BUDGET";

export interface ChangeEvent {
  changeEventId: string;
  changeDateTime: string; // ISO string
  changeResourceType: ChangeResourceType;
  changeResourceName: string;
  changeStatus: ChangeStatus;
  userEmail: string;
  clientType: string;
  campaignId?: string;
  adGroupId?: string;
  oldResource?: Record<string, any>;
  newResource?: Record<string, any>;
}

export interface ChangeHistoryFilterParams {
  startDate?: string;
  endDate?: string;
  resourceTypes?: ChangeResourceType[];
}

export interface SharedSet {
  id: string;
  name: string;
  type: "NEGATIVE_KEYWORDS" | "NEGATIVE_PLACEMENTS";
  status: "ENABLED" | "REMOVED" | "UNKNOWN";
  memberCount: number;
  referenceCount: number; // Number of campaigns attached
}

export interface SharedCriterion {
  id: string;
  sharedSetId: string;
  type: "KEYWORD" | "PLACEMENT";
  keyword?: {
    text: string;
    matchType: "EXACT" | "PHRASE" | "BROAD";
  };
}

export interface CampaignSharedSet {
  campaignId: string;
  campaignName: string;
  sharedSetId: string;
  status: "ENABLED" | "REMOVED" | "UNKNOWN";
}

export interface SharedSetsListResponse {
  success: boolean;
  sharedSets: SharedSet[];
}

export interface SharedCriteriaListResponse {
  success: boolean;
  criteria: SharedCriterion[];
}

export interface CampaignSharedSetsListResponse {
  success: boolean;
  campaignSharedSets: CampaignSharedSet[];
}

// ─────────────────────────────────────────────────────────────
// BILLING & BUDGETS
// ─────────────────────────────────────────────────────────────

export interface BillingSetup {
  id: string;
  status: "PENDING" | "APPROVED" | "CANCELLED" | "UNKNOWN";
  paymentsAccount: string;
  paymentsAccountName: string;
}

export interface AccountBudget {
  id: string;
  status: "PENDING" | "APPROVED" | "CANCELLED" | "UNKNOWN";
  name: string;
  proposedStartDateTime: string;
  approvedStartDateTime: string;
  proposedEndDateTime: string;
  approvedEndDateTime: string;
  proposedSpendingLimitMicros: number;
  approvedSpendingLimitMicros: number;
  amountServedMicros: number;
}

export interface Invoice {
  id: string;
  issueDate: string;
  dueDate: string;
  currencyCode: string;
  amountDueMicros: number;
  pdfUrl?: string;
}

export interface BillingSummaryResponse {
  success: boolean;
  billingSetups: BillingSetup[];
  accountBudgets: AccountBudget[];
  invoices: Invoice[];
}

// ─────────────────────────────────────────────────────────────
// LABELS
// ─────────────────────────────────────────────────────────────

export interface GoogleAdsLabel {
  id: string;
  name: string;
  status: "ENABLED" | "REMOVED" | "UNKNOWN";
  textLabel?: {
    backgroundColor: string;
    description: string;
  };
}

export interface LabelListResponse {
  success: boolean;
  labels: GoogleAdsLabel[];
}

export interface EntityLabel {
  entityId: string;
  labelId: string;
}

// ─────────────────────────────────────────────────────────────
// PUBLISH SAGA (Transactional Campaign Creation)
// ─────────────────────────────────────────────────────────────

export interface PublishCompleteCampaignPayload extends CreateCampaignPayload {
  publishOperationId: string;
  adGroups: Partial<AdGroup>[];
  ads: Partial<Ad>[];
  keywords: any[];
  assets: Array<{
    assetId?: string;
    assetName?: string;
    assetType?: string;
    previewUrl?: string;
    type?: string;
    text?: string;
  }>;
}

export type PublishOperationStatus = 
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "COMPLETED_WITH_WARNINGS"
  | "FAILED"
  | "ROLLING_BACK"
  | "ROLLED_BACK";

export interface PublishTransactionResponse {
  success: boolean;
  publishOperationId: string;
  campaignId?: string;
  status: PublishOperationStatus;
  rollbackStatus?: "SUCCESS" | "PARTIAL" | "FAILED" | "NOT_REQUIRED";
  successfulEntities: { type: string; id: string }[];
  failedEntities: { type: string; reason: string }[];
  reconciliationResults?: { type: string; id: string; issue: string }[];
  actionableMessage?: string;
}
