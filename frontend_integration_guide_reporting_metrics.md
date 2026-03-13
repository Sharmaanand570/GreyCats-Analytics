# Frontend Integration Guide: Reporting & Metrics

This guide provides the necessary endpoints and metric keys for all 9 integrations used in the reporting dashboard.

## 1. Core Metrics Endpoint (Standardized)

Use this endpoint for time-series data (charts) or single aggregated values.

Endpoint: `GET /api/unified-metrics/data`  
Auth: Bearer Token required.

Query Parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| integration | string | One of the 9 platforms (see below) |
| accountId | string | The specific account/page/property ID |
| metricKey | string | The specific metric key (e.g., `meta.ads.spend`) |
| dateFrom | string | Start date (`YYYY-MM-DD`) |
| dateTo | string | End date (`YYYY-MM-DD`) |
| groupBy | string | `day`, `week`, `month`, `dimension`, or `none` (default: `day`) |
| aggregation | string | `sum`, `avg`, `min`, `max`, `last` (default: `sum`) |
| fillMissing | boolean | Whether to return 0 for dates with no data (default: `true`) |

## 2. Integration Specifics & Metric Keys

Meta Ads (`meta_ads`)
- `meta.ads.spend`: Total amount spent.
- `meta.ads.impressions`: Total impressions.
- `meta.ads.clicks`: Total clicks.
- `meta.ads.ctr`: Click-through rate.
- `meta.ads.cpc`: Cost per click.

Facebook Page (`meta_facebook`)
- `meta.facebook.page.impressions`: Page impressions.
- `meta.facebook.page.reach`: Page reach.
- `meta.facebook.page.likes`: Total page likes.
- `meta.facebook.page.page_unfollows`: Total page unfollows. [NEW]
- `meta.facebook.page.engagements`: Total post engagements.

Instagram Business (`meta_instagram`)
- `meta.instagram.reach`: Total profile reach.
- `meta.instagram.profile_views`: Profile views.
- `meta.instagram.reelsCount`: Count of Reels posted. [NEW]
- `meta.instagram.postsCount`: Count of Image/Carousel posts. [NEW]
- `meta.instagram.imagesCount`: Same as postsCount (images only).
- `meta.instagram.followers`: Total follower count.

Google Analytics 4 (`google_analytics`)
- `ga4.sessions`: Total sessions.
- `ga4.activeUsers`: Active users.
- `ga4.eventCount`: Total events.
- `ga4.conversions`: Conversions.
- `ga4.newUsers`: New users.

Google Search Console (`google-search-console`)
- `google_seo.clicks`: Organic clicks.
- `google_seo.impressions`: Organic impressions.
- `google_seo.ctr`: Organic CTR.
- `google_seo.position`: Average position.

YouTube (`youtube`)
- `youtube.views`: Total video views.
- `youtube.estimatedMinutesWatched`: Total watch time (min).
- `youtube.subscribersGained`: New subscribers.
- `youtube.likes`: Total likes.

Shopify (`shopify`)
- `shopify.total_sales`: Gross sales amount.
- `shopify.total_orders`: Number of orders.
- `shopify.average_order_value`: AOV.

WooCommerce (`woo`)
- `woo.total_sales`: Gross sales amount.
- `woo.total_orders`: Number of orders.

Google Ads (`google_ads`)
- `google_ads.cost`: Total spend.
- `google_ads.impressions`: Impressions.
- `google_ads.clicks`: Clicks.

## 3. Demographics API (Facebook & Instagram)

Fetch audience breakdown by country, city, and age/gender.

Endpoint: `GET /api/metabusiness/demographics/:accountId`  
Params: `:accountId` (FB Page ID or IG Business ID)

Response:

```json
{
  "success": true,
  "data": {
    "country": { "US": 150, "IN": 450 },
    "city": { "Mumbai, Maharashtra": 120 },
    "ageGender": { "M.25-34": 45, "F.18-24": 30 },
    "date": "2026-03-05T00:00:00.000Z"
  }
}
```
