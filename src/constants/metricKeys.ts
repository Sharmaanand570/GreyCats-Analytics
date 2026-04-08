// ============================================================
// Unified Metric Key Constants
// Source of truth for all metric keys used across the platform.
// Mirrors the backend Unified Metrics architecture.
// ============================================================

// ── Meta Ads ─────────────────────────────────────────────────────────────────
export const META_ADS_SPEND = "meta.ads.spend" as const;
export const META_ADS_IMPRESSIONS = "meta.ads.impressions" as const;
export const META_ADS_CLICKS = "meta.ads.clicks" as const;
export const META_ADS_CTR = "meta.ads.ctr" as const;
export const META_ADS_CPC = "meta.ads.cpc" as const;

export const META_ADS_METRICS = [
  META_ADS_SPEND,
  META_ADS_IMPRESSIONS,
  META_ADS_CLICKS,
  META_ADS_CTR,
  META_ADS_CPC,
] as const;

// ── Meta Facebook ─────────────────────────────────────────────────────────────
// NOTE: Templates use the long-form internal metric keys below (from the Meta Insights API).
// The spec guide uses short aliases; both map to the same underlying data.
export const META_FACEBOOK_PAGE_IMPRESSIONS =
  "meta.facebook.page.page_posts_impressions_unique" as const;
export const META_FACEBOOK_PAGE_REACH = "meta.facebook.page.page_impressions_unique" as const;
export const META_FACEBOOK_PAGE_LIKES = "meta.facebook.page.page_follows" as const;
export const META_FACEBOOK_PAGE_UNFOLLOWS =
  "meta.facebook.page.page_unfollows" as const; // [NEW] — add widget in template
export const META_FACEBOOK_PAGE_ENGAGEMENTS =
  "meta.facebook.page.page_post_engagements" as const;
export const META_FACEBOOK_PAGE_CONSUMPTIONS =
  "meta.facebook.page.page_consumptions" as const;
export const META_FACEBOOK_PAGE_VIDEO_VIEWS =
  "meta.facebook.page.page_video_views" as const;
export const META_FACEBOOK_PAGE_VIEWS_TOTAL =
  "meta.page.views" as const;
export const META_FACEBOOK_PAGE_MEDIA_VIEWS =
  "meta.facebook.mediaViews" as const;

export const META_FACEBOOK_METRICS = [
  META_FACEBOOK_PAGE_IMPRESSIONS,
  META_FACEBOOK_PAGE_REACH,
  META_FACEBOOK_PAGE_LIKES,
  META_FACEBOOK_PAGE_UNFOLLOWS,
  META_FACEBOOK_PAGE_ENGAGEMENTS,
  META_FACEBOOK_PAGE_CONSUMPTIONS,
  META_FACEBOOK_PAGE_VIDEO_VIEWS,
  META_FACEBOOK_PAGE_VIEWS_TOTAL,
  META_FACEBOOK_PAGE_MEDIA_VIEWS,
] as const;

// ── Meta Instagram ────────────────────────────────────────────────────────────
export const META_INSTAGRAM_REACH = "meta.instagram.reach" as const;
// Profile views — DB key is profileViews (camelCase, no underscore)
export const META_INSTAGRAM_PROFILE_VIEWS =
  "meta.instagram.profileViews" as const;
// Website clicks — DB key is profileLinkTaps (not websiteClicks)
export const META_INSTAGRAM_WEBSITE_CLICKS =
  "meta.instagram.profileLinkTaps" as const;
// Impressions — DB key is media.impressions (not bare impressions)
export const META_INSTAGRAM_IMPRESSIONS =
  "meta.instagram.media.impressions" as const;
// DB/runtime keys use singular form (reelCount, postCount) — spec guide says reelsCount/postsCount.
// Both are accepted by the backend. The templates use the singular form.
export const META_INSTAGRAM_REELS_COUNT =
  "meta.instagram.reelCount" as const;
export const META_INSTAGRAM_POSTS_COUNT =
  "meta.instagram.postCount" as const;
export const META_INSTAGRAM_IMAGES_COUNT =
  "meta.instagram.mediaCount" as const; // mediaCount is the DB key; imagesCount = alias
export const META_INSTAGRAM_FOLLOWERS = "meta.instagram.followers" as const;
export const META_INSTAGRAM_ACCOUNTS_ENGAGED =
  "meta.instagram.accountsEngaged" as const;
export const META_INSTAGRAM_MEDIA_COMMENTS =
  "meta.instagram.media.aggregated.comments" as const;
export const META_INSTAGRAM_MEDIA_SAVES =
  "meta.instagram.media.aggregated.saves" as const;
export const META_INSTAGRAM_MEDIA_REACH =
  "meta.instagram.media.aggregated.reach" as const;
export const META_INSTAGRAM_REPLIES = "meta.instagram.replies" as const;

export const META_INSTAGRAM_METRICS = [
  META_INSTAGRAM_REACH,
  META_INSTAGRAM_IMPRESSIONS,
  META_INSTAGRAM_PROFILE_VIEWS,
  META_INSTAGRAM_WEBSITE_CLICKS,
  META_INSTAGRAM_REELS_COUNT,
  META_INSTAGRAM_POSTS_COUNT,
  META_INSTAGRAM_IMAGES_COUNT,
  META_INSTAGRAM_FOLLOWERS,
  META_INSTAGRAM_ACCOUNTS_ENGAGED,
  META_INSTAGRAM_MEDIA_COMMENTS,
  META_INSTAGRAM_MEDIA_SAVES,
  META_INSTAGRAM_MEDIA_REACH,
  META_INSTAGRAM_REPLIES,
] as const;

// ── Google Analytics (GA4) ────────────────────────────────────────────────────
// NOTE: Backend DB stores these with "google." prefix. The API also accepts "ga4." prefix
// (see inferIntegrationFromMetricKey), but all templates and runtime hooks use "google.*".
export const GA4_SESSIONS = "google.sessions" as const;
export const GA4_ACTIVE_USERS = "google.activeUsers" as const;
export const GA4_EVENT_COUNT = "google.eventCount" as const;
export const GA4_CONVERSIONS = "google.conversions" as const;
export const GA4_NEW_USERS = "google.newUsers" as const;

export const GA4_METRICS = [
  GA4_SESSIONS,
  GA4_ACTIVE_USERS,
  GA4_EVENT_COUNT,
  GA4_CONVERSIONS,
  GA4_NEW_USERS,
] as const;

// ── Google Search Console ─────────────────────────────────────────────────────
export const GOOGLE_SEO_CLICKS = "google_seo.clicks" as const;
export const GOOGLE_SEO_IMPRESSIONS = "google_seo.impressions" as const;
export const GOOGLE_SEO_CTR = "google_seo.ctr" as const;
export const GOOGLE_SEO_POSITION = "google_seo.position" as const;

export const GOOGLE_SEO_METRICS = [
  GOOGLE_SEO_CLICKS,
  GOOGLE_SEO_IMPRESSIONS,
  GOOGLE_SEO_CTR,
  GOOGLE_SEO_POSITION,
] as const;

// ── YouTube ───────────────────────────────────────────────────────────────────
export const YOUTUBE_VIEWS = "youtube.views" as const;
export const YOUTUBE_ESTIMATED_MINUTES_WATCHED =
  "youtube.watchTimeSec" as const;
export const YOUTUBE_SUBSCRIBERS_GAINED =
  "youtube.subscribersGained" as const;
export const YOUTUBE_LIKES = "youtube.likes" as const;

export const YOUTUBE_METRICS = [
  YOUTUBE_VIEWS,
  YOUTUBE_ESTIMATED_MINUTES_WATCHED,
  YOUTUBE_SUBSCRIBERS_GAINED,
  YOUTUBE_LIKES,
] as const;

// ── Shopify ───────────────────────────────────────────────────────────────────
// NOTE: The Shopify widget data is served via the Shopify Trends direct API
// (not /unified-metrics/data). The runtime keys used by useWidgetData and
// integrationTemplates are: shopify.revenue, shopify.orders, shopify.avgOrderValue.
export const SHOPIFY_TOTAL_SALES = "shopify.revenue" as const;
export const SHOPIFY_TOTAL_ORDERS = "shopify.orders" as const;
export const SHOPIFY_AVERAGE_ORDER_VALUE = "shopify.avgOrderValue" as const;

export const SHOPIFY_METRICS = [
  SHOPIFY_TOTAL_SALES,
  SHOPIFY_TOTAL_ORDERS,
  SHOPIFY_AVERAGE_ORDER_VALUE,
] as const;

// ── WooCommerce ───────────────────────────────────────────────────────────────
// Runtime keys match what's stored in the DB by the WooCommerce sync service.
export const WOO_TOTAL_SALES = "woo.revenue" as const;
export const WOO_TOTAL_ORDERS = "woo.orders" as const;
export const WOO_ITEMS_SOLD = "woo.itemsSold" as const;

export const WOO_METRICS = [WOO_TOTAL_SALES, WOO_TOTAL_ORDERS, WOO_ITEMS_SOLD] as const;

// ── Google Ads ────────────────────────────────────────────────────────────────
export const GOOGLE_ADS_COST = "google_ads.cost" as const;
export const GOOGLE_ADS_IMPRESSIONS = "google_ads.impressions" as const;
export const GOOGLE_ADS_CLICKS = "google_ads.clicks" as const;

export const GOOGLE_ADS_METRICS = [
  GOOGLE_ADS_COST,
  GOOGLE_ADS_IMPRESSIONS,
  GOOGLE_ADS_CLICKS,
] as const;

// ── LinkedIn ─────────────────────────────────────────────────────────────────
export const LINKEDIN_IMPRESSIONS = "linkedin.impressions" as const;
export const LINKEDIN_CLICKS = "linkedin.clicks" as const;
export const LINKEDIN_LIKES = "linkedin.likes" as const;
export const LINKEDIN_COMMENTS = "linkedin.comments" as const;
export const LINKEDIN_SHARES = "linkedin.shares" as const;
export const LINKEDIN_FOLLOWERS = "linkedin.followers" as const;

export const LINKEDIN_METRICS = [
  LINKEDIN_IMPRESSIONS,
  LINKEDIN_CLICKS,
  LINKEDIN_LIKES,
  LINKEDIN_COMMENTS,
  LINKEDIN_SHARES,
  LINKEDIN_FOLLOWERS,
] as const;

// ── Integration identifiers ───────────────────────────────────────────────────
export const INTEGRATION = {
  META_ADS: "meta_ads",
  META_FACEBOOK: "meta_facebook",
  META_INSTAGRAM: "meta_instagram",
  GOOGLE_ANALYTICS: "google_analytics",
  GOOGLE_SEARCH_CONSOLE: "google-search-console",
  YOUTUBE: "youtube",
  SHOPIFY: "shopify",
  WOO: "woo",
  GOOGLE_ADS: "google_ads",
  LINKEDIN: "linkedin",
} as const;

export type IntegrationId = (typeof INTEGRATION)[keyof typeof INTEGRATION];

// ── All metric key union type ─────────────────────────────────────────────────
export type MetricKey =
  | (typeof META_ADS_METRICS)[number]
  | (typeof META_FACEBOOK_METRICS)[number]
  | (typeof META_INSTAGRAM_METRICS)[number]
  | (typeof GA4_METRICS)[number]
  | (typeof GOOGLE_SEO_METRICS)[number]
  | (typeof YOUTUBE_METRICS)[number]
  | (typeof SHOPIFY_METRICS)[number]
  | (typeof WOO_METRICS)[number]
  | (typeof GOOGLE_ADS_METRICS)[number]
  | (typeof LINKEDIN_METRICS)[number]
  | (string & {}); // allow arbitrary keys without losing autocomplete
