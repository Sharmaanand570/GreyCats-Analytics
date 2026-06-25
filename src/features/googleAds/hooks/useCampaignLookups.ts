/**
 * useCampaignLookups — single clean lookup surface for the LIVE campaign wizard (Stack B).
 *
 * These wrap backend endpoints that already exist:
 *   - GET  /google-ads/manage/locations                 (GeoTargetConstants autocomplete)
 *   - POST /google-ads/manage/keywords/recommendations  (keyword ideas)
 *   - GET  /google-ads/manage/conversion-actions         (conversion actions list)
 *   - GET  /google-ads/:clientId/audiences               (audience lists)
 *
 * The wizard steps should import from here instead of reaching into Stack A
 * (adsWizard) or hardcoding mock data. See GOOGLE_ADS_INTEGRATION_PLAN.md Phase 0/1.
 */
export {
  useGoogleAdsLocations as useLocationSearch,
  useGoogleAdsConversionActions as useConversionActionsLookup,
  useGoogleAdsKeywordIdeas as useKeywordIdeas,
} from "./useGoogleAdsManager";

export { useAudiences as useAudiencesList } from "./useCampaignManagement";

export type {
  GoogleAdsLocation,
  GoogleAdsKeywordIdea,
  GoogleAdsConversionAction,
} from "../API/googleAdsManagerApi";
