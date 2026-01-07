/**
 * 🧹 Universal label cleanup utility.
 * Strips "AUTO", "item", and numeric timestamps.
 * Also handles dot-separated metric keys to extract meaningful names.
 */
export const prettifyMetricLabel = (label: string): string => {
    if (!label) return "Metric";

    // 0. Preliminary cleanup: remove common prefixes and handle dot notation
    let base = label.trim();

    // Detect if this is a single-letter system ID or a common placeholder (W, X, Y, Z, AUTO)
    const isSystemNoise = !base ||
        base.length <= 1 ||
        /^[a-z0-9]$/i.test(base) ||
        base.toLowerCase().includes('auto') ||
        base.toLowerCase().includes('item') ||
        /^[0-9a-f]{20,}$/i.test(base); // Hex token

    if (isSystemNoise && label.length <= 1) return "Metric";

    // 1. If it's a full metric key (e.g. meta.facebook.post.likes), extract meaningful parts
    if (base.includes('.')) {
        const parts = base.split('.');
        const last = parts[parts.length - 1];
        const secondLast = parts[parts.length - 2];

        // If we have context like "post", "page", etc., keep it (e.g. "Post Likes")
        if (secondLast && !['google', 'meta', 'woo', 'facebook', 'instagram', 'ga', 'ads'].includes(secondLast.toLowerCase())) {
            base = `${secondLast} ${last}`;
        } else {
            base = last;
        }
    }

    // 2. Standard Cleanup: Strip AUTO, item, and long numeric timestamps
    let clean = base
        .replace(/AUTO/gi, '')
        .replace(/item/gi, '')
        .replace(/\d{10,}/g, '')
        .replace(/[-_]/g, ' ')
        .trim();

    if (!clean || clean.length <= 1) return "Metric";

    // 3. Add spaces before Capitals (CamelCase -> Camel Case)
    if (clean.length > 2) {
        clean = clean.replace(/([A-Z])/g, ' $1').trim();
    }

    // 4. Title Case and final polish
    const final = clean.charAt(0).toUpperCase() + clean.slice(1);

    // Specific overrides for common business metrics
    const lower = final.toLowerCase();
    if (lower === 'spend') return "Spend";
    if (lower === 'clicks') return "Clicks";
    if (lower === 'ctr') return "CTR";
    if (lower === 'cpc') return "CPC";
    if (lower === 'cpm') return "CPM";
    if (lower === 'roas') return "ROAS";
    if (lower === 'reach') return "Reach";
    if (lower === 'impressions') return "Impressions";
    if (lower === 'engagement') return "Engagement";
    if (lower === 'post count') return "Post Count";

    return final;
};
