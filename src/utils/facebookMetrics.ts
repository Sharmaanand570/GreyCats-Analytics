export const FACEBOOK_CUMULATIVE_METRICS = [
    'meta.facebook.page.page_follows',
    'meta.facebook.followers',
    'meta.instagram.followers',
    'meta.instagram.profile.followers',
    'meta.page.fans',
    'meta.instagram.mediaCount',
];

export const FACEBOOK_DAILY_METRICS = [
    'meta.facebook.page.page_daily_follows',
    'meta.facebook.page.page_daily_follows_unique',
    'meta.facebook.page.page_daily_unfollows_unique',
    'meta.facebook.page.page_impressions_unique',
    'meta.facebook.page.page_media_view',
    'meta.facebook.page.page_post_engagements',
    'meta.facebook.page.page_total_actions',
    'meta.facebook.page.page_posts_impressions',
    'meta.facebook.page.page_posts_impressions_unique',
    'meta.facebook.post.count',
    'meta.facebook.post.likes',
    'meta.facebook.post.comments',
    'meta.facebook.post.shares',
    'meta.facebook.post.reactions',
    'meta.facebook.post.impressions',
    'meta.facebook.post.reach',
    'meta.facebook.post.clicks',
    'meta.facebook.post.engaged_users',
    'meta.instagram.profile.impressions',
    'meta.instagram.profile.reach',
    'meta.instagram.profile.profile_views',
    // Comprehensive Instagram Daily Metrics
    'meta.instagram.follows',
    'meta.instagram.unfollows',
    'meta.instagram.reach',
    'meta.instagram.accountsEngaged',
    'meta.instagram.likes',
    'meta.instagram.comments',
    'meta.instagram.saved',
    'meta.instagram.replies',
    'meta.instagram.profileViews',
    'meta.instagram.profileLinkTaps',
    // Media Aggregated Metrics
    'meta.instagram.media.aggregated.likes',
    'meta.instagram.media.aggregated.comments',
    'meta.instagram.media.aggregated.saves',
    'meta.instagram.media.aggregated.shares',
    'meta.instagram.media.aggregated.reach',
    // Existing Post metrics (mostly same as above categories generally, but keeping for compatibility)
    'meta.instagram.post.count',
    'meta.instagram.post.likes',
    'meta.instagram.post.comments',
];

export const isCumulativeMetric = (metricKey: string): boolean => {
    return FACEBOOK_CUMULATIVE_METRICS.includes(metricKey);
};

export const getMetricAggregation = (metricKey: string): 'latest' | 'sum' => {
    if (isCumulativeMetric(metricKey)) {
        return 'latest';
    }
    return 'sum';
};
