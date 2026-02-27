import { type ReportWidgetType } from "@/components/reportTypes";

// Curated default metrics per integration platform
export const CURATED_DEFAULTS: Record<string, string[]> = {
  "google-analytics": [
    // Base daily metrics (metric cards)
    "google.sessions",
    "google.activeUsers",
    "google.newUsers",
    "google.pageViews",
    "google.bounceRate",
    "google.engagementRate",
    "google.avgSessionDuration",
    "google.eventCount",
    // Dimensional table widgets
    "google.channel_traffic",
    "google.browser_used",
    "google.device_category",
    "google.geo_country",
    "google.geo_city",
    "google.top_pages",
  ],
  "google": [                 // Alias for Google Analytics
    "google.sessions",
    "google.activeUsers",
    "google.newUsers",
    "google.pageViews",
    "google.bounceRate",
    "google.engagementRate",
    "google.avgSessionDuration",
    "google.eventCount",
    "google.channel_traffic",
    "google.browser_used",
    "google.device_category",
    "google.geo_country",
    "google.geo_city",
    "google.top_pages",
  ],
  "google-search-console": [
    "google_seo.clicks",      // Match actual DB format
    "google_seo.impressions",
    "google_seo.ctr",
    "google_seo.position",
    "google_seo.top_pages",
    "google_seo.top_queries",
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
    "meta.instagram.reelCount",
    "meta.instagram.postCount",
    "meta.instagram.media.aggregated.likes",
    "meta.instagram.followers",
    "meta.instagram.media.aggregated.shares",
    "meta.instagram.media.aggregated.saves",
    "meta.instagram.recent_media",
    // Instagram Demographics
    "meta.instagram.followers.age",
    "meta.instagram.followers.gender",
    "meta.instagram.followers.country",
    "meta.instagram.followers.city",
  ],
  "metabusinessinstagram": [
    "meta.instagram.reach",
    "meta.instagram.media.aggregated.reach",
    "meta.instagram.mediaCount",
    "meta.instagram.reelCount",
    "meta.instagram.postCount",
    "meta.instagram.media.aggregated.likes",
    "meta.instagram.followers",
    "meta.instagram.media.aggregated.shares",
    "meta.instagram.media.aggregated.saves",
    "meta.instagram.recent_media",
    // Instagram Demographics
    "meta.instagram.followers.age",
    "meta.instagram.followers.gender",
    "meta.instagram.followers.country",
    "meta.instagram.followers.city",
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
    "meta.instagram.reelCount",
    "meta.instagram.postCount",
    "meta.instagram.media.aggregated.likes",
    "meta.instagram.followers",
    "meta.instagram.media.aggregated.shares",
    "meta.instagram.media.aggregated.saves",
    "meta.instagram.recent_media",
    // Instagram Demographics
    "meta.instagram.followers.age",
    "meta.instagram.followers.gender",
    "meta.instagram.followers.country",
    "meta.instagram.followers.city",
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
    "meta.instagram.reelCount",
    "meta.instagram.postCount",
    "meta.instagram.media.aggregated.likes",
    "meta.instagram.followers",
    "meta.instagram.media.aggregated.shares",
    "meta.instagram.media.aggregated.saves",
    "meta.instagram.recent_media",
    // Instagram Demographics
    "meta.instagram.followers.age",
    "meta.instagram.followers.gender",
    "meta.instagram.followers.country",
    "meta.instagram.followers.city",
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
  "google-ads": [
    "google_ads.impressions",
    "google_ads.clicks",
    "google_ads.cost",
    "google_ads.conversions",
    "google_ads.revenue",
    "google_ads.roas",
  ],
  "google_ads": [
    "google_ads.impressions",
    "google_ads.clicks",
    "google_ads.cost",
    "google_ads.roas",
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
  unit?: string;
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
          { type: 'metric', metricKey: 'meta.instagram.reelCount', x: 6, y: 0, w: 3, h: 3, displayName: 'Reels' },
          { type: 'metric', metricKey: 'meta.instagram.postCount', x: 9, y: 0, w: 3, h: 3, displayName: 'Posts' },

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
                { name: 'Date', width: '15%', dataKey: 'date' },
                { name: 'Post', width: '15%', dataKey: 'fullPicture' },
                { name: 'Caption', width: '25%', dataKey: 'post' },
                { name: 'Likes', width: '11.25%', dataKey: 'likes' },
                { name: 'Comments', width: '11.25%', dataKey: 'comments' },
                { name: 'Clicks', width: '11.25%', dataKey: 'clicks' },
                { name: 'Shares', width: '11.25%', dataKey: 'shares' },
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
      { type: 'metric', metricKey: 'meta.instagram.reelCount', x: 6, y: 0, w: 3, h: 3, displayName: 'Reels' },
      { type: 'metric', metricKey: 'meta.instagram.postCount', x: 9, y: 0, w: 3, h: 3, displayName: 'Posts' },

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
            { name: 'Date', width: '15%', dataKey: 'date' },
            { name: 'Post', width: '15%', dataKey: 'fullPicture' },
            { name: 'Caption', width: '25%', dataKey: 'post' },
            { name: 'Likes', width: '11.25%', dataKey: 'likes' },
            { name: 'Comments', width: '11.25%', dataKey: 'comments' },
            { name: 'Clicks', width: '11.25%', dataKey: 'clicks' },
            { name: 'Shares', width: '11.25%', dataKey: 'shares' },
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
      { type: 'metric', metricKey: 'meta.ads.cpc', x: 4.8, y: 5, w: 2.4, h: 3, displayName: 'CPC', unit: '₹' },
      { type: 'metric', metricKey: 'meta.ads.ctr', x: 7.2, y: 5, w: 2.4, h: 3, displayName: 'CTR', unit: '%' },
      { type: 'metric', metricKey: 'meta.ads.spend', x: 9.6, y: 5, w: 2.4, h: 3, displayName: 'Spend', unit: '₹' },

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
            { name: 'Campaign', width: '20%', dataKey: 'campaignName' },
            { name: 'Ad', width: '20%', dataKey: 'adName' },
            { name: 'Ad Set', width: '15%', dataKey: 'adsetName' },
            { name: 'Clicks', width: '10%', dataKey: 'clicks' },
            { name: 'Impressions', width: '12%', dataKey: 'impressions' },
            { name: 'Average CPC', width: '12%', dataKey: 'cpc' },
            { name: 'CTR', width: '11%', dataKey: 'ctr' }
          ]
        }
      },
    ]
  },

  // GOOGLE ADS
  'google-ads': {
    widgets: [
      // Row 1: Trend charts
      { type: 'line_chart', metricKey: 'google_ads.clicks', x: 0, y: 0, w: 6, h: 5, displayName: 'Clicks' },
      { type: 'line_chart', metricKey: 'google_ads.impressions', x: 6, y: 0, w: 6, h: 5, displayName: 'Impressions' },

      // Row 2: 6 metric cards
      { type: 'metric', metricKey: 'google_ads.cost', x: 0, y: 5, w: 2, h: 3, displayName: 'Spend' },
      { type: 'metric', metricKey: 'google_ads.impressions', x: 2, y: 5, w: 2, h: 3, displayName: 'Impressions' },
      { type: 'metric', metricKey: 'google_ads.clicks', x: 4, y: 5, w: 2, h: 3, displayName: 'Clicks' },
      { type: 'metric', metricKey: 'google_ads.ctr', x: 6, y: 5, w: 2, h: 3, displayName: 'CTR' },
      { type: 'metric', metricKey: 'google_ads.cpc', x: 8, y: 5, w: 2, h: 3, displayName: 'Avg. CPC' },
      { type: 'metric', metricKey: 'google_ads.roas', x: 10, y: 5, w: 2, h: 3, displayName: 'ROAS' },

      // Row 3: Campaign performance table
      {
        type: 'table',
        metricKey: 'google_ads.campaign_performance',
        x: 0,
        y: 8,
        w: 12,
        h: 8,
        displayName: 'Campaign Performance',
        customConfig: {
          columns: [
            { name: 'Campaign', width: '18%', dataKey: 'name' },
            { name: 'View-through conversions', width: '10%', dataKey: 'viewThroughConversions' },
            { name: 'Avg CPC', width: '10%', dataKey: 'cpc' },
            { name: 'Clicks', width: '9%', dataKey: 'clicks' },
            { name: 'Conversion rate', width: '10%', dataKey: 'conversionRate' },
            { name: 'Conversions', width: '10%', dataKey: 'conversions' },
            { name: 'Cost', width: '11%', dataKey: 'cost' },
            { name: 'Cost / conv.', width: '11%', dataKey: 'costPerConversion' },
            { name: 'Impressions', width: '11%', dataKey: 'impressions' },
          ]
        }
      },
    ]
  },

  // GOOGLE SEARCH CONSOLE
  'google-search-console': {
    widgets: [
      // Row 1: Trend charts
      { type: 'line_chart', metricKey: 'google_seo.clicks', x: 0, y: 0, w: 6, h: 5, displayName: 'Total Clicks' },
      { type: 'line_chart', metricKey: 'google_seo.impressions', x: 6, y: 0, w: 6, h: 5, displayName: 'Total Impressions' },

      // Row 2: Metric cards
      { type: 'metric', metricKey: 'google_seo.clicks', x: 0, y: 5, w: 3, h: 3, displayName: 'Clicks' },
      { type: 'metric', metricKey: 'google_seo.impressions', x: 3, y: 5, w: 3, h: 3, displayName: 'Impressions' },
      { type: 'metric', metricKey: 'google_seo.ctr', x: 6, y: 5, w: 3, h: 3, displayName: 'Average CTR', unit: '%' },
      { type: 'metric', metricKey: 'google_seo.position', x: 9, y: 5, w: 3, h: 3, displayName: 'Avg Position' },

      // Row 3: Top Pages and Top Queries Tables side by side
      {
        type: 'table',
        metricKey: 'google_seo.top_pages',
        x: 0,
        y: 8,
        w: 6,
        h: 8,
        displayName: 'Top Performing Pages',
        customConfig: {
          columns: [
            { name: 'Page', width: '50%', dataKey: 'page' },
            { name: 'Clicks', width: '15%', dataKey: 'clicks' },
            { name: 'Impressions', width: '15%', dataKey: 'impressions' },
            { name: 'CTR', width: '10%', dataKey: 'ctr' },
            { name: 'Position', width: '10%', dataKey: 'position' },
          ]
        }
      },
      {
        type: 'table',
        metricKey: 'google_seo.top_queries',
        x: 6,
        y: 8,
        w: 6,
        h: 8,
        displayName: 'Top Search Queries',
        customConfig: {
          columns: [
            { name: 'Query', width: '50%', dataKey: 'query' },
            { name: 'Clicks', width: '15%', dataKey: 'clicks' },
            { name: 'Impressions', width: '15%', dataKey: 'impressions' },
            { name: 'CTR', width: '10%', dataKey: 'ctr' },
            { name: 'Position', width: '10%', dataKey: 'position' },
          ]
        }
      }
    ]
  },

  // GOOGLE ANALYTICS
  'google-analytics': {
    widgets: [
      // ── Row 1: 4 metric cards (sessions, activeUsers, newUsers, pageViews)
      { type: 'metric', metricKey: 'google.sessions', x: 0, y: 0, w: 3, h: 3, displayName: 'Sessions' },
      { type: 'metric', metricKey: 'google.activeUsers', x: 3, y: 0, w: 3, h: 3, displayName: 'Active Users' },
      { type: 'metric', metricKey: 'google.newUsers', x: 6, y: 0, w: 3, h: 3, displayName: 'New Users' },
      { type: 'metric', metricKey: 'google.pageViews', x: 9, y: 0, w: 3, h: 3, displayName: 'Page Views' },

      // ── Row 2: 4 metric cards (bounceRate, engagementRate, avgSessionDuration, eventCount)
      { type: 'metric', metricKey: 'google.bounceRate', x: 0, y: 3, w: 3, h: 3, displayName: 'Bounce Rate' },
      { type: 'metric', metricKey: 'google.engagementRate', x: 3, y: 3, w: 3, h: 3, displayName: 'Engagement Rate' },
      { type: 'metric', metricKey: 'google.avgSessionDuration', x: 6, y: 3, w: 3, h: 3, displayName: 'Avg. Session Duration' },
      { type: 'metric', metricKey: 'google.eventCount', x: 9, y: 3, w: 3, h: 3, displayName: 'Event Count' },

      // ── Row 3: Sessions trend + Active Users trend
      { type: 'line_chart', metricKey: 'google.sessions', x: 0, y: 6, w: 6, h: 5, displayName: 'Sessions Trend' },
      { type: 'line_chart', metricKey: 'google.activeUsers', x: 6, y: 6, w: 6, h: 5, displayName: 'Active Users Trend' },

      // ── Row 4: Monthly All Channel Traffic table
      {
        type: 'table',
        metricKey: 'google.channel_traffic',
        x: 0, y: 11, w: 12, h: 8,
        displayName: 'Monthly All Channel Traffic',
        customConfig: {
          columns: [
            { name: 'Channel', width: '20%', dataKey: 'dimensionValue' },
            { name: 'Sessions', width: '13%', dataKey: 'sessions' },
            { name: 'Engaged Sessions', width: '13%', dataKey: 'engagedSessions' },
            { name: 'Engagement Rate', width: '13%', dataKey: 'engagementRate' },
            { name: 'Avg. Session Duration', width: '13%', dataKey: 'avgSessionDuration' },
            { name: 'Event Count', width: '13%', dataKey: 'eventCount' },
          ]
        }
      },

      // ── Row 5: Browser + Device side by side
      {
        type: 'table',
        metricKey: 'google.browser_used',
        x: 0, y: 19, w: 6, h: 8,
        displayName: 'Technology: Browser Used',
        customConfig: {
          columns: [
            { name: 'Browser', width: '30%', dataKey: 'dimensionValue' },
            { name: 'Active Users', width: '17%', dataKey: 'activeUsers' },
            { name: 'New Users', width: '17%', dataKey: 'newUsers' },
            { name: 'Engaged Sessions', width: '18%', dataKey: 'engagedSessions' },
            { name: 'Event Count', width: '18%', dataKey: 'eventCount' },
          ]
        }
      },
      {
        type: 'table',
        metricKey: 'google.device_category',
        x: 6, y: 19, w: 6, h: 8,
        displayName: 'Technology: Device Category',
        customConfig: {
          columns: [
            { name: 'Device', width: '30%', dataKey: 'dimensionValue' },
            { name: 'Active Users', width: '17%', dataKey: 'activeUsers' },
            { name: 'New Users', width: '17%', dataKey: 'newUsers' },
            { name: 'Engaged Sessions', width: '18%', dataKey: 'engagedSessions' },
            { name: 'Event Count', width: '18%', dataKey: 'eventCount' },
          ]
        }
      },

      // ── Row 6: Geo Country + City side by side
      {
        type: 'table',
        metricKey: 'google.geo_country',
        x: 0, y: 27, w: 6, h: 8,
        displayName: 'Geo Location: Country',
        customConfig: {
          columns: [
            { name: 'Country', width: '30%', dataKey: 'dimensionValue' },
            { name: 'Active Users', width: '17%', dataKey: 'activeUsers' },
            { name: 'New Users', width: '17%', dataKey: 'newUsers' },
            { name: 'Engaged Sessions', width: '18%', dataKey: 'engagedSessions' },
            { name: 'Event Count', width: '18%', dataKey: 'eventCount' },
          ]
        }
      },
      {
        type: 'table',
        metricKey: 'google.geo_city',
        x: 6, y: 27, w: 6, h: 8,
        displayName: 'Geo Location: City',
        customConfig: {
          columns: [
            { name: 'City', width: '30%', dataKey: 'dimensionValue' },
            { name: 'Active Users', width: '17%', dataKey: 'activeUsers' },
            { name: 'New Users', width: '17%', dataKey: 'newUsers' },
            { name: 'Engaged Sessions', width: '18%', dataKey: 'engagedSessions' },
            { name: 'Event Count', width: '18%', dataKey: 'eventCount' },
          ]
        }
      },

      // ── Row 7: Top Landing Pages (full width)
      {
        type: 'table',
        metricKey: 'google.top_pages',
        x: 0, y: 35, w: 12, h: 8,
        displayName: 'Top Landing Pages',
        customConfig: {
          columns: [
            { name: 'Page Path', width: '30%', dataKey: 'dimensionValue' },
            { name: 'Views', width: '14%', dataKey: 'pageViews' },
            { name: 'Active Users', width: '14%', dataKey: 'activeUsers' },
            { name: 'Avg. Session Duration', width: '21%', dataKey: 'avgSessionDuration' },
            { name: 'Event Count', width: '21%', dataKey: 'eventCount' },
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

// Google Ads aliases
INTEGRATION_TEMPLATES['google_ads'] = INTEGRATION_TEMPLATES['google-ads'];
INTEGRATION_TEMPLATES['googleads'] = INTEGRATION_TEMPLATES['google-ads'];
INTEGRATION_TEMPLATES['google-ads-campaign'] = INTEGRATION_TEMPLATES['google-ads'];

// Google Analytics aliases
INTEGRATION_TEMPLATES['google'] = INTEGRATION_TEMPLATES['google-analytics'];
INTEGRATION_TEMPLATES['google_analytics'] = INTEGRATION_TEMPLATES['google-analytics'];
INTEGRATION_TEMPLATES['googleanalytics'] = INTEGRATION_TEMPLATES['google-analytics'];
INTEGRATION_TEMPLATES['ga'] = INTEGRATION_TEMPLATES['google-analytics'];


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
