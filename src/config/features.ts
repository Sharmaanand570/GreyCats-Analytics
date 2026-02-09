/**
 * Feature flags for environment-specific functionality
 * Controls what features are enabled in dev vs production
 */
export const features = {
    // Development-only features
    enableDebugPanel: import.meta.env.DEV,
    enableVerboseLogging: import.meta.env.DEV,
    enableDevTools: import.meta.env.DEV,

    // Production-only features
    enableAnalytics: import.meta.env.PROD,
    enableErrorReporting: import.meta.env.PROD,
    enableSecurityMonitoring: import.meta.env.PROD,

    // Feature toggles (can be controlled via env vars)
    enableExperimentalFeatures: import.meta.env.VITE_ENABLE_EXPERIMENTAL === 'true',
} as const;

export type FeatureFlags = typeof features;
