export const BRAND_COLORS: Record<string, string> = {
    // Meta / Facebook
    'meta': '#1877F2',
    'meta-facebook': '#1877F2',
    'meta_facebook': '#1877F2',
    'facebook': '#1877F2',

    // Instagram
    'meta-instagram': '#E1306C',
    'meta_instagram': '#E1306C',
    'instagram': '#E1306C',

    // Meta Ads
    'meta-ads': '#4F46E5', // Indigo for Ads to distinguish from FB Blue
    'meta_ads': '#4F46E5',

    // Google
    'google': '#4285F4',
    'google-analytics': '#F4B400', // Analytics Orange/Yellow
    'google-console': '#4285F4',
    'google-search-console': '#4285F4',
    'google_search_console': '#4285F4',

    // YouTube
    'youtube': '#FF0000',

    // E-commerce
    'shopify': '#96bf48',
    'woo': '#96588a',
    'woocommerce': '#96588a',

    // Default
    'default': '#71717a' // Zinc-500
};

export const getBrandColor = (integration: string): string => {
    const normalized = integration?.toLowerCase().replace(/_/g, '-') || 'default';
    // Try exact match
    if (BRAND_COLORS[normalized]) return BRAND_COLORS[normalized];

    // Try partial match
    if (normalized.includes('instagram')) return BRAND_COLORS['instagram'];
    if (normalized.includes('facebook')) return BRAND_COLORS['facebook'];
    if (normalized.includes('youtube')) return BRAND_COLORS['youtube'];
    if (normalized.includes('shopify')) return BRAND_COLORS['shopify'];
    if (normalized.includes('woo')) return BRAND_COLORS['woo'];
    if (normalized.includes('google')) return BRAND_COLORS['google'];

    return BRAND_COLORS['default'];
};
