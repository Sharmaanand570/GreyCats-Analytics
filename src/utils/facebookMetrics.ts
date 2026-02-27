export const FACEBOOK_CUMULATIVE_METRICS = [
    // Facebook Page - Cumulative snapshot
    'meta.facebook.page.page_follows',

    // Instagram - Cumulative snapshot
    'meta.instagram.followers',
    'meta.instagram.mediaCount',

    // Instagram Demographics - Age
    'meta.instagram.followers.age.13-17',
    'meta.instagram.followers.age.18-24',
    'meta.instagram.followers.age.25-34',
    'meta.instagram.followers.age.35-44',
    'meta.instagram.followers.age.45-54',
    'meta.instagram.followers.age.55-64',
    'meta.instagram.followers.age.65+',

    // Instagram Demographics - Gender (Backend uses U/F/M keys)
    'meta.instagram.followers.gender.U',
    'meta.instagram.followers.gender.F',
    'meta.instagram.followers.gender.M',
];

export const FACEBOOK_DAILY_METRICS = [
    // Facebook Page (daily aggregated)
    'meta.facebook.page.page_daily_follows',
    'meta.facebook.page.page_daily_follows_unique',
    'meta.facebook.page.page_daily_unfollows_unique',
    'meta.facebook.page.page_impressions_unique',
    'meta.facebook.page.page_media_view',
    'meta.facebook.page.page_post_engagements',
    'meta.facebook.page.page_posts_impressions',
    'meta.facebook.page.page_posts_impressions_unique',

    // Facebook Post (daily aggregated)
    'meta.facebook.post.count',
    'meta.facebook.post.likes',
    'meta.facebook.post.reactions',
    'meta.facebook.post.shares',
    'meta.facebook.post.engagement',
    'meta.facebook.mediaViews',

    // Instagram Core (daily aggregated)
    'meta.instagram.reach',
    'meta.instagram.reelCount',
    'meta.instagram.postCount',

    // Instagram Media Aggregated (historical engagement)
    'meta.instagram.media.aggregated.likes',
    'meta.instagram.media.aggregated.comments',
    'meta.instagram.media.aggregated.saves',
    'meta.instagram.media.aggregated.shares',
    'meta.instagram.media.aggregated.reach',

    // Instagram Individual Media (recent)
    'meta.instagram.media.likes',
    'meta.instagram.media.comments',
];

export const isCumulativeMetric = (metricKey: string): boolean => {
    // Exact match for known lists
    if (FACEBOOK_CUMULATIVE_METRICS.includes(metricKey)) {
        return true;
    }

    // Check for dynamic demographic keys (country/city) that are cumulative snapshots
    const cumulativePrefixes = [
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
