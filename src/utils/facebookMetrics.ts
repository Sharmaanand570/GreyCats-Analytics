export const FACEBOOK_CUMULATIVE_METRICS = [
    // Facebook Page - Standard
    'meta.facebook.page.page_follows',

    // Facebook Demographics - Age
    'meta.facebook.page.followers.age.13-17',
    'meta.facebook.page.followers.age.18-24',
    'meta.facebook.page.followers.age.25-34',
    'meta.facebook.page.followers.age.35-44',
    'meta.facebook.page.followers.age.45-54',
    'meta.facebook.page.followers.age.55-64',
    'meta.facebook.page.followers.age.65+',

    // Facebook Demographics - Gender
    'meta.facebook.page.followers.gender.male',
    'meta.facebook.page.followers.gender.female',
    'meta.facebook.page.followers.gender.unknown',

    // Instagram - Standard
    'meta.instagram.followers.total',

    // Instagram Demographics - Age
    'meta.instagram.followers.age.13-17',
    'meta.instagram.followers.age.18-24',
    'meta.instagram.followers.age.25-34',
    'meta.instagram.followers.age.35-44',
    'meta.instagram.followers.age.45-54',
    'meta.instagram.followers.age.55-64',
    'meta.instagram.followers.age.65+',

    // Instagram Demographics - Gender
    'meta.instagram.followers.gender.male',
    'meta.instagram.followers.gender.female',
    'meta.instagram.followers.gender.unknown',

    // Legacy / Other
    'meta.facebook.followers',
    'meta.instagram.followers',
    'meta.instagram.profile.followers',
    'meta.page.fans',
    'meta.instagram.mediaCount',
];

export const FACEBOOK_DAILY_METRICS = [
    // Facebook Page
    'meta.facebook.page.page_daily_follows',
    'meta.facebook.page.page_daily_follows_unique',
    'meta.facebook.page.page_daily_unfollows_unique',
    'meta.facebook.page.page_impressions_unique',
    'meta.facebook.page.page_media_view',
    'meta.facebook.page.page_post_engagements',
    'meta.facebook.page.page_total_actions',
    'meta.facebook.page.page_posts_impressions',
    'meta.facebook.page.page_posts_impressions_unique',

    // Facebook Post
    'meta.facebook.post.count',
    'meta.facebook.post.impressions',
    'meta.facebook.post.reach',
    'meta.facebook.post.engaged_users',
    'meta.facebook.post.clicks',
    'meta.facebook.post.likes',
    'meta.facebook.post.comments',
    'meta.facebook.post.shares',
    'meta.facebook.post.reactions',

    // Instagram Standard
    'meta.instagram.followers.daily_change',
    'meta.instagram.impressions',
    'meta.instagram.reach',
    'meta.instagram.profile_views',
    'meta.instagram.website_clicks',
    'meta.instagram.email_contacts',
    'meta.instagram.get_directions_clicks',
    'meta.instagram.phone_call_clicks',
    'meta.instagram.text_message_clicks',

    // Instagram Media
    'meta.instagram.media.count',
    'meta.instagram.media.impressions',
    'meta.instagram.media.reach',
    'meta.instagram.media.engagement',
    'meta.instagram.media.saved',
    'meta.instagram.media.video_views',
    'meta.instagram.media.likes',
    'meta.instagram.media.comments',

    // Legacy / Compat
    'meta.instagram.profile.impressions',
    'meta.instagram.profile.reach',
    'meta.instagram.profile.profile_views',
    'meta.instagram.follows',
    'meta.instagram.unfollows',
    'meta.instagram.accountsEngaged',
    'meta.instagram.replies', // not in new list but keeping if legacy
    'meta.instagram.profileViews',
    'meta.instagram.profileLinkTaps',

    // Media Aggregated Metrics (Frontend Calculated or Legacy)
    'meta.instagram.media.aggregated.likes',
    'meta.instagram.media.aggregated.comments',
    'meta.instagram.media.aggregated.saves',
    'meta.instagram.media.aggregated.shares',
    'meta.instagram.media.aggregated.reach',

    'meta.instagram.post.count',
    'meta.instagram.post.likes',
    'meta.instagram.post.comments',
];

export const isCumulativeMetric = (metricKey: string): boolean => {
    // Exact match for known lists
    if (FACEBOOK_CUMULATIVE_METRICS.includes(metricKey)) {
        return true;
    }

    // Check for dynamic demographic keys (country/city) that are cumulative snapshots
    const cumulativePrefixes = [
        'meta.facebook.page.followers.country',
        'meta.facebook.page.followers.city',
        'meta.instagram.followers.country',
        'meta.instagram.followers.city'
    ];

    if (cumulativePrefixes.some(prefix => metricKey.startsWith(prefix))) {
        return true;
    }

    return false;
};

export const getMetricAggregation = (metricKey: string): 'latest' | 'sum' => {
    if (isCumulativeMetric(metricKey)) {
        return 'latest';
    }
    return 'sum';
};
