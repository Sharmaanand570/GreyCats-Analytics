import { type ReportWidgetType } from "@/components/reportTypes";

// Curated default metrics per integration platform
export const CURATED_DEFAULTS: Record<string, string[]> = {
  "google-analytics": [
    "google.sessions",        // Match backend format
    "google.activeUsers",
    "google.pageViews",
    "google.bounceRate",
  ],
  "google": [                 // Alias for Google Analytics
    "google.sessions",
    "google.activeUsers",
    "google.pageViews",
    "google.bounceRate",
  ],
  "google-search-console": [
    "google_seo.clicks",      // Match actual DB format
    "google_seo.impressions",
    "google_seo.ctr",
    "google_seo.position",
  ],
  "google-console": [
    "google-console.billing.cost",
  ],
  "meta": [
    "meta.facebook.page.page_follows",
    "meta.facebook.post.count",
    "meta.facebook.page.page_post_engagements",
    "meta.instagram.followers",
  ],
  "meta-facebook": [
    "meta.facebook.page.page_follows",
    "meta.facebook.page.page_impressions_unique",
    "meta.facebook.page.page_posts_impressions",
    "meta.facebook.post.count",
    "meta.facebook.page.page_media_view",
    "meta.facebook.page.page_post_engagements",
    "meta.facebook.post.reactions",
    "meta.facebook.post.likes",
    "meta.facebook.recent_posts",
  ],
  "meta-instagram": [
    "meta.instagram.reach",
    "meta.instagram.media.aggregated.reach",
    "meta.instagram.mediaCount",
    "meta.instagram.media.aggregated.likes",
    "meta.instagram.followers",
    "meta.instagram.media.aggregated.shares",
    "meta.instagram.media.aggregated.saves",
    "meta.instagram.recent_media",
  ],
  "metabusinessinstagram": [
    "meta.instagram.reach",
    "meta.instagram.media.aggregated.reach",
    "meta.instagram.mediaCount",
    "meta.instagram.media.aggregated.likes",
    "meta.instagram.followers",
    "meta.instagram.media.aggregated.shares",
    "meta.instagram.media.aggregated.saves",
    "meta.instagram.recent_media",
  ],
  "meta-business": [
    // Facebook metrics
    "meta.facebook.page.page_follows",
    "meta.facebook.page.page_impressions_unique",
    "meta.facebook.page.page_posts_impressions",
    "meta.facebook.post.count",
    "meta.facebook.page.page_media_view",
    "meta.facebook.page.page_post_engagements",
    "meta.facebook.post.reactions",
    "meta.facebook.post.likes",
    "meta.facebook.recent_posts",
    // Instagram metrics
    "meta.instagram.reach",
    "meta.instagram.media.aggregated.reach",
    "meta.instagram.mediaCount",
    "meta.instagram.media.aggregated.likes",
    "meta.instagram.followers",
    "meta.instagram.media.aggregated.shares",
    "meta.instagram.media.aggregated.saves",
    "meta.instagram.recent_media",
  ],
  "metabusiness": [
    "meta.facebook.page.page_follows",
    "meta.facebook.page.page_impressions_unique",
    "meta.facebook.page.page_posts_impressions",
    "meta.facebook.post.count",
    "meta.facebook.page.page_media_view",
    "meta.facebook.page.page_post_engagements",
    "meta.facebook.post.reactions",
    "meta.facebook.post.likes",
    "meta.facebook.recent_posts",
    // Instagram metrics
    "meta.instagram.reach",
    "meta.instagram.media.aggregated.reach",
    "meta.instagram.mediaCount",
    "meta.instagram.media.aggregated.likes",
    "meta.instagram.followers",
    "meta.instagram.media.aggregated.shares",
    "meta.instagram.media.aggregated.saves",
    "meta.instagram.recent_media",
  ],
  "meta-ads": [
    "meta.ads.impressions",
    "meta.ads.clicks",
    "meta.ads.ctr",
    "meta.ads.spend",
    "meta.ads.cpc",
    "meta.ads.campaign_performance",
  ],
  "metaads": [
    "meta.ads.impressions",
    "meta.ads.clicks",
    "meta.ads.ctr",
    "meta.ads.spend",
    "meta.ads.cpc",
    "meta.ads.campaign_performance",
  ],
  "youtube": [
    "youtube.views",
    "youtube.likes",
    "youtube.comments",
    "youtube.subscribersGained",
  ],
  "shopify": [
    "shopify.revenue",
    "shopify.orders",
    "shopify.avgOrderValue",
  ],
  "woo": [                    // Match actual DB integration key
    "woo.revenue",
    "woo.orders",
    "woo.itemsSold",
  ],
  "woocommerce": [            // Alias for compatibility
    "woo.revenue",
    "woo.orders",
    "woo.itemsSold",
  ],
};

export const MAX_DEFAULT_WIDGETS = 25;

// Fixed Widget Templates - Define exact layouts for specific integration types
export type WidgetTemplate = {
  type: ReportWidgetType;
  metricKey: string;
  x: number;
  y: number;
  w: number;
  h: number;
  displayName?: string;
  chartType?: 'column' | 'line' | 'area' | 'pie' | 'bar';
  groupBy?: 'none' | 'day' | 'week' | 'month';
  aggregation?: string;
  customConfig?: Record<string, any>;
};

export type IntegrationTemplate = {
  widgets: WidgetTemplate[];
  slides?: Array<{
    name: string;
    widgets: WidgetTemplate[];
  }>;
};

export const INTEGRATION_TEMPLATES: Record<string, IntegrationTemplate> = {
  // META BUSINESS (FACEBOOK PAGE + INSTAGRAM)
  // This template creates TWO slides: one for Facebook, one for Instagram
  'meta-business': {
    widgets: [], // Empty default widgets
    slides: [
      // SLIDE 1: FACEBOOK
      {
        name: 'Facebook',
        widgets: [
          // Row 1: 4 metric cards
          { type: 'metric', metricKey: 'meta.facebook.page.page_follows', x: 0, y: 0, w: 3, h: 3, displayName: 'Page follows' },
          { type: 'metric', metricKey: 'meta.facebook.page.page_posts_impressions_unique', x: 3, y: 0, w: 3, h: 3, displayName: 'Unique page post impressions' },
          { type: 'metric', metricKey: 'meta.facebook.page.page_media_view', x: 6, y: 0, w: 3, h: 3, displayName: 'Page views' },
          { type: 'metric', metricKey: 'meta.facebook.post.count', x: 9, y: 0, w: 3, h: 3, displayName: 'Posts (total)' },

          // Row 2: 4 metric cards
          { type: 'metric', metricKey: 'meta.facebook.page.page_media_view', x: 0, y: 3, w: 3, h: 3, displayName: 'Page media views' },
          { type: 'metric', metricKey: 'meta.facebook.page.page_post_engagements', x: 3, y: 3, w: 3, h: 3, displayName: 'Post engagement' },
          { type: 'metric', metricKey: 'meta.facebook.page.page_daily_follows', x: 6, y: 3, w: 3, h: 3, displayName: 'Page follow growth' },
          { type: 'metric', metricKey: 'meta.facebook.mediaViews', x: 9, y: 3, w: 3, h: 3, displayName: 'Video views' },

          // Row 3: Recent Posts Table
          {
            type: 'table',
            metricKey: 'meta.facebook.recent_posts',
            x: 0,
            y: 6,
            w: 12,
            h: 6,
            displayName: 'Facebook – Posts Table',
            customConfig: {
              columns: [
                { name: 'Date', width: '15%', dataKey: 'date' },
                { name: 'Post', width: '35%', dataKey: 'post' },
                { name: 'Post impressions', width: '12.5%', dataKey: 'impressions' },
                { name: 'Likes', width: '12.5%', dataKey: 'likes' },
                { name: 'Clicks', width: '12.5%', dataKey: 'clicks' },
                { name: 'Shares', width: '12.5%', dataKey: 'shares' },
              ]
            }
          },
        ]
      },
      // SLIDE 2: INSTAGRAM
      {
        name: 'Instagram',
        widgets: [
          // Row 1: 4 metric cards
          { type: 'metric', metricKey: 'meta.instagram.mediaCount', x: 0, y: 0, w: 3, h: 3, displayName: 'Posted content' },
          { type: 'metric', metricKey: 'meta.instagram.reach', x: 3, y: 0, w: 3, h: 3, displayName: 'Reach' },
          { type: 'metric', metricKey: 'meta.instagram.mediaCount', x: 6, y: 0, w: 3, h: 3, displayName: 'Reels' },
          { type: 'metric', metricKey: 'meta.instagram.mediaCount', x: 9, y: 0, w: 3, h: 3, displayName: 'Posts' },

          // Row 2: 4 metric cards
          { type: 'metric', metricKey: 'meta.instagram.media.aggregated.reach', x: 0, y: 3, w: 3, h: 3, displayName: 'Engagement' },
          { type: 'metric', metricKey: 'meta.instagram.followers', x: 3, y: 3, w: 3, h: 3, displayName: 'Followers' },
          { type: 'metric', metricKey: 'meta.instagram.media.aggregated.shares', x: 6, y: 3, w: 3, h: 3, displayName: 'Shares' },
          { type: 'metric', metricKey: 'meta.instagram.media.aggregated.likes', x: 9, y: 3, w: 3, h: 3, displayName: 'Likes' },

          // Row 3: Recent Posts Table
          {
            type: 'table',
            metricKey: 'meta.instagram.recent_media',
            x: 0,
            y: 6,
            w: 12,
            h: 7,
            displayName: 'Instagram – Posts Table',
            customConfig: {
              columns: [
                { name: 'Date', width: '20%', dataKey: 'date' },
                { name: 'Post', width: '35%', dataKey: 'post' },
                { name: 'Like', width: '15%', dataKey: 'likes' },
                { name: 'Comments', width: '15%', dataKey: 'comments' },
                { name: 'Clicks', width: '15%', dataKey: 'clicks' },
              ]
            }
          },

          // Row 4: Demographics Section
          // Age Distribution Chart
          {
            type: 'chart',
            metricKey: 'meta.instagram.followers.age',
            x: 0,
            y: 13,
            w: 6,
            h: 6,
            displayName: 'Age Distribution',
            chartType: 'bar',
            customConfig: {
              demographics: {
                type: 'age',
                metrics: [
                  'meta.instagram.followers.age.13-17',
                  'meta.instagram.followers.age.18-24',
                  'meta.instagram.followers.age.25-34',
                  'meta.instagram.followers.age.35-44',
                  'meta.instagram.followers.age.45-54',
                  'meta.instagram.followers.age.55-64',
                  'meta.instagram.followers.age.65+'
                ]
              }
            }
          },

          // Gender Distribution (Pie Chart)
          {
            type: 'chart',
            metricKey: 'meta.instagram.followers.gender',
            x: 6,
            y: 13,
            w: 6,
            h: 6,
            displayName: 'Gender Distribution',
            chartType: 'pie',
            customConfig: {
              demographics: {
                type: 'gender',
                metrics: [
                  'meta.instagram.followers.gender.U',
                  'meta.instagram.followers.gender.F',
                  'meta.instagram.followers.gender.M'
                ]
              }
            }
          },

          // Row 5: Geographic Demographics
          // Top Countries Table
          {
            type: 'table',
            metricKey: 'meta.instagram.followers.country',
            x: 0,
            y: 19,
            w: 6,
            h: 6,
            displayName: 'Top Countries',
            customConfig: {
              demographics: {
                type: 'country',
                partialMatch: true
              },
              columns: [
                { name: 'Country', width: '60%', dataKey: 'country' },
                { name: 'Followers', width: '40%', dataKey: 'value' }
              ]
            }
          },

          // Top Cities Table
          {
            type: 'table',
            metricKey: 'meta.instagram.followers.city',
            x: 6,
            y: 19,
            w: 6,
            h: 6,
            displayName: 'Top Cities',
            customConfig: {
              demographics: {
                type: 'city',
                partialMatch: true
              },
              columns: [
                { name: 'City', width: '60%', dataKey: 'city' },
                { name: 'Followers', width: '40%', dataKey: 'value' }
              ]
            }
          },
        ]
      }
    ]
  },

  // META BUSINESS INSTAGRAM
  'meta-instagram': {
    widgets: [
      // Row 1: 4 metric cards
      { type: 'metric', metricKey: 'meta.instagram.mediaCount', x: 0, y: 0, w: 3, h: 3, displayName: 'Posted content' },
      { type: 'metric', metricKey: 'meta.instagram.reach', x: 3, y: 0, w: 3, h: 3, displayName: 'Reach' },
      { type: 'metric', metricKey: 'meta.instagram.mediaCount', x: 6, y: 0, w: 3, h: 3, displayName: 'Reels' },
      { type: 'metric', metricKey: 'meta.instagram.mediaCount', x: 9, y: 0, w: 3, h: 3, displayName: 'Posts' },

      // Row 2: 4 metric cards
      { type: 'metric', metricKey: 'meta.instagram.media.aggregated.reach', x: 0, y: 3, w: 3, h: 3, displayName: 'Engagement' },
      { type: 'metric', metricKey: 'meta.instagram.followers', x: 3, y: 3, w: 3, h: 3, displayName: 'Followers' },
      { type: 'metric', metricKey: 'meta.instagram.media.aggregated.shares', x: 6, y: 3, w: 3, h: 3, displayName: 'Shares' },
      { type: 'metric', metricKey: 'meta.instagram.media.aggregated.likes', x: 9, y: 3, w: 3, h: 3, displayName: 'Likes' },

      // Row 3: Recent Media Table
      {
        type: 'table',
        metricKey: 'meta.instagram.recent_media',
        x: 0,
        y: 6,
        w: 12,
        h: 7,
        displayName: 'Instagram – Posts Table',
        customConfig: {
          columns: [
            { name: 'Date', width: '20%', dataKey: 'date' },
            { name: 'Post', width: '35%', dataKey: 'post' },
            { name: 'Like', width: '15%', dataKey: 'likes' },
            { name: 'Comments', width: '15%', dataKey: 'comments' },
            { name: 'Clicks', width: '15%', dataKey: 'clicks' },
          ]
        }
      },

      // Row 4: Demographics Section
      // Age Distribution Chart (Bar/Column Chart)
      {
        type: 'chart',
        metricKey: 'meta.instagram.followers.age',
        x: 0,
        y: 12,
        w: 6,
        h: 6,
        displayName: 'Age Distribution',
        chartType: 'bar',
        customConfig: {
          demographics: {
            type: 'age',
            metrics: [
              'meta.instagram.followers.age.13-17',
              'meta.instagram.followers.age.18-24',
              'meta.instagram.followers.age.25-34',
              'meta.instagram.followers.age.35-44',
              'meta.instagram.followers.age.45-54',
              'meta.instagram.followers.age.55-64',
              'meta.instagram.followers.age.65+'
            ]
          }
        }
      },

      // Gender Distribution (Pie Chart)
      {
        type: 'chart',
        metricKey: 'meta.instagram.followers.gender',
        x: 6,
        y: 12,
        w: 6,
        h: 6,
        displayName: 'Gender Distribution',
        chartType: 'pie',
        customConfig: {
          demographics: {
            type: 'gender',
            metrics: [
              'meta.instagram.followers.gender.U',
              'meta.instagram.followers.gender.F',
              'meta.instagram.followers.gender.M'
            ]
          }
        }
      },

      // Row 5: Geographic Demographics
      // Top Countries Table
      {
        type: 'table',
        metricKey: 'meta.instagram.followers.country',
        x: 0,
        y: 18,
        w: 6,
        h: 6,
        displayName: 'Top Countries',
        customConfig: {
          demographics: {
            type: 'country',
            partialMatch: true
          },
          columns: [
            { name: 'Country', width: '60%', dataKey: 'country' },
            { name: 'Followers', width: '40%', dataKey: 'value' }
          ]
        }
      },

      // Top Cities Table
      {
        type: 'table',
        metricKey: 'meta.instagram.followers.city',
        x: 6,
        y: 18,
        w: 6,
        h: 6,
        displayName: 'Top Cities',
        customConfig: {
          demographics: {
            type: 'city',
            partialMatch: true
          },
          columns: [
            { name: 'City', width: '60%', dataKey: 'city' },
            { name: 'Followers', width: '40%', dataKey: 'value' }
          ]
        }
      },
    ]
  },

  // META ADS
  'meta-ads': {
    widgets: [
      // Row 1: Graph - Clicks
      { type: 'line_chart', metricKey: 'meta.ads.clicks', x: 0, y: 0, w: 6, h: 5, displayName: 'Clicks' },

      // Row 1: Graph - Impressions
      { type: 'line_chart', metricKey: 'meta.ads.impressions', x: 6, y: 0, w: 6, h: 5, displayName: 'Impressions' },

      // Row 2: Number widgets (5 metrics)
      { type: 'metric', metricKey: 'meta.ads.clicks', x: 0, y: 5, w: 2.4, h: 3, displayName: 'Clicks' },
      { type: 'metric', metricKey: 'meta.ads.impressions', x: 2.4, y: 5, w: 2.4, h: 3, displayName: 'Impressions' },
      { type: 'metric', metricKey: 'meta.ads.cpc', x: 4.8, y: 5, w: 2.4, h: 3, displayName: 'CPC' },
      { type: 'metric', metricKey: 'meta.ads.ctr', x: 7.2, y: 5, w: 2.4, h: 3, displayName: 'CTR' },
      { type: 'metric', metricKey: 'meta.ads.spend', x: 9.6, y: 5, w: 2.4, h: 3, displayName: 'Spend' },

      // Row 3: Campaign Performance Table (5 columns)
      {
        type: 'table',
        metricKey: 'meta.ads.campaign_performance',
        x: 0,
        y: 8,
        w: 12,
        h: 8,
        displayName: 'Campaign Name',
        customConfig: {
          columns: [
            { name: 'Campaign', width: '25%', dataKey: 'campaignName' },
            { name: 'Clicks', width: '15%', dataKey: 'clicks' },
            { name: 'Impressions', width: '15%', dataKey: 'impressions' },
            { name: 'CPC', width: '15%', dataKey: 'cpc' },
            { name: 'Spend', width: '30%', dataKey: 'spend' }
          ]
        }
      },
    ]
  },
};

// Aliases for consistent matching
INTEGRATION_TEMPLATES['meta-facebook'] = INTEGRATION_TEMPLATES['meta-business'];
INTEGRATION_TEMPLATES['meta_facebook'] = INTEGRATION_TEMPLATES['meta-business'];
INTEGRATION_TEMPLATES['fb'] = INTEGRATION_TEMPLATES['meta-business'];
INTEGRATION_TEMPLATES['facebook'] = INTEGRATION_TEMPLATES['meta-business'];
INTEGRATION_TEMPLATES['metafacebook'] = INTEGRATION_TEMPLATES['meta-business'];
INTEGRATION_TEMPLATES['meta_business'] = INTEGRATION_TEMPLATES['meta-business'];
INTEGRATION_TEMPLATES['metabusiness'] = INTEGRATION_TEMPLATES['meta-business'];

INTEGRATION_TEMPLATES['meta_instagram'] = INTEGRATION_TEMPLATES['meta-instagram'];
INTEGRATION_TEMPLATES['instagram'] = INTEGRATION_TEMPLATES['meta-instagram'];
INTEGRATION_TEMPLATES['metainstagram'] = INTEGRATION_TEMPLATES['meta-instagram'];
INTEGRATION_TEMPLATES['metabusinessinstagram'] = INTEGRATION_TEMPLATES['meta-instagram'];
INTEGRATION_TEMPLATES['meta-business-instagram'] = INTEGRATION_TEMPLATES['meta-instagram'];

INTEGRATION_TEMPLATES['meta_ads'] = INTEGRATION_TEMPLATES['meta-ads'];
INTEGRATION_TEMPLATES['ads'] = INTEGRATION_TEMPLATES['meta-ads'];
INTEGRATION_TEMPLATES['metaads'] = INTEGRATION_TEMPLATES['meta-ads'];
INTEGRATION_TEMPLATES['meta-ads-campaign'] = INTEGRATION_TEMPLATES['meta-ads'];


// COMPREHENSIVE ALIASES - Force fixed templates for all naming variations
(function () {
  const aliases: Record<string, string> = {
    'fb': 'meta-facebook', 'facebook': 'meta-facebook', 'metafacebook': 'meta-facebook', 'meta_facebook': 'meta-facebook',
    'ig': 'meta-instagram', 'instagram': 'meta-instagram', 'metainstagram': 'meta-instagram', 'meta_instagram': 'meta-instagram',
    'mb': 'meta-business', 'metabusiness': 'meta-business', 'meta_business': 'meta-business', 'meta-social': 'meta-business',
    'google': 'google-analytics', 'ga': 'google-analytics', 'googleanalytics': 'google-analytics',
    'gsc': 'google-search-console', 'googlesearchconsole': 'google-search-console',
    'ads': 'meta-ads', 'metaads': 'meta-ads', 'meta_ads': 'meta-ads'
  };

  Object.entries(aliases).forEach(([alias, target]) => {
    if (INTEGRATION_TEMPLATES[target] && !INTEGRATION_TEMPLATES[alias]) {
      INTEGRATION_TEMPLATES[alias] = INTEGRATION_TEMPLATES[target];
    }
  });
})();
