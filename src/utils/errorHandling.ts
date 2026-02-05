import { AxiosError } from "axios";

// ==================== ERROR TYPES ====================

export const SyncErrorType = {
    TOKEN_EXPIRED: "TOKEN_EXPIRED",
    RATE_LIMIT: "RATE_LIMIT",
    NETWORK_ERROR: "NETWORK_ERROR",
    TIMEOUT: "TIMEOUT",
    PERMISSION_DENIED: "PERMISSION_DENIED",
    INVALID_ACCOUNT: "INVALID_ACCOUNT",
    UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type SyncErrorType = typeof SyncErrorType[keyof typeof SyncErrorType];


export interface SyncError {
    type: SyncErrorType;
    message: string;
    userMessage: string;
    action: "retry" | "reconnect" | "contact_support" | "wait";
    retryable: boolean;
    technicalDetails?: string;
}

// ==================== ERROR CLASSIFICATION ====================

export const classifyError = (error: unknown): SyncError => {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    // Network errors
    if (!axiosError.response) {
        return {
            type: SyncErrorType.NETWORK_ERROR,
            message: axiosError.message || "Network error",
            userMessage: "Network connection issue. Retrying...",
            action: "retry",
            retryable: true,
            technicalDetails: axiosError.message,
        };
    }

    const status = axiosError.response.status;
    const responseMessage = axiosError.response.data?.message || axiosError.response.data?.error || "";

    // 401 - Token expired or invalid
    if (status === 401 || responseMessage.toLowerCase().includes("token") || responseMessage.toLowerCase().includes("unauthorized")) {
        return {
            type: SyncErrorType.TOKEN_EXPIRED,
            message: responseMessage || "Authentication failed",
            userMessage: "Your connection has expired. Please reconnect your account.",
            action: "reconnect",
            retryable: false,
            technicalDetails: responseMessage,
        };
    }

    // 403 - Permission denied
    if (status === 403 || responseMessage.toLowerCase().includes("permission")) {
        return {
            type: SyncErrorType.PERMISSION_DENIED,
            message: responseMessage || "Permission denied",
            userMessage: "Missing permissions. Please reconnect with required permissions.",
            action: "reconnect",
            retryable: false,
            technicalDetails: responseMessage,
        };
    }

    // 429 - Rate limit
    if (status === 429 || responseMessage.toLowerCase().includes("rate limit") || responseMessage.toLowerCase().includes("too many requests")) {
        return {
            type: SyncErrorType.RATE_LIMIT,
            message: responseMessage || "Rate limit exceeded",
            userMessage: "Too many requests. Syncing will resume automatically in a few minutes.",
            action: "wait",
            retryable: true,
            technicalDetails: responseMessage,
        };
    }

    // 400 - Invalid account or configuration
    if (status === 400 || responseMessage.toLowerCase().includes("invalid") || responseMessage.toLowerCase().includes("not found")) {
        return {
            type: SyncErrorType.INVALID_ACCOUNT,
            message: responseMessage || "Invalid account configuration",
            userMessage: "Account configuration issue. Please contact support.",
            action: "contact_support",
            retryable: false,
            technicalDetails: responseMessage,
        };
    }

    // 500+ - Server errors (retryable)
    if (status >= 500) {
        return {
            type: SyncErrorType.UNKNOWN_ERROR,
            message: responseMessage || "Server error",
            userMessage: "Server error occurred. Retrying...",
            action: "retry",
            retryable: true,
            technicalDetails: responseMessage,
        };
    }

    // Default unknown error
    return {
        type: SyncErrorType.UNKNOWN_ERROR,
        message: responseMessage || axiosError.message || "Unknown error",
        userMessage: "An unexpected error occurred. Please try again.",
        action: "retry",
        retryable: true,
        technicalDetails: responseMessage || axiosError.message,
    };
};

// ==================== RETRY LOGIC ====================

export interface RetryOptions {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    timeoutMs?: number;
    onRetry?: (attempt: number, error: SyncError) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    timeoutMs: 60000,
    onRetry: () => { },
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const calculateBackoff = (attempt: number, initialDelay: number, maxDelay: number): number => {
    const delay = initialDelay * Math.pow(2, attempt - 1);
    return Math.min(delay, maxDelay);
};

export const withRetry = async <T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> => {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
    let lastError: SyncError | null = null;

    for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
        try {
            // Wrap the function call with timeout
            const result = await Promise.race([
                fn(),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error("Operation timed out")), opts.timeoutMs)
                ),
            ]);
            return result;
        } catch (error: unknown) {
            // Check if it's a timeout error
            if (error instanceof Error && error.message === "Operation timed out") {
                lastError = {
                    type: SyncErrorType.TIMEOUT,
                    message: "Operation timed out",
                    userMessage: "Sync is taking longer than expected. We'll continue in the background.",
                    action: "retry",
                    retryable: true,
                    technicalDetails: `Timeout after ${opts.timeoutMs}ms`,
                };
            } else {
                lastError = classifyError(error);
            }

            // If not retryable or last attempt, throw
            if (!lastError.retryable || attempt > opts.maxRetries) {
                throw lastError;
            }

            // Calculate backoff delay
            const delay = calculateBackoff(attempt, opts.initialDelayMs, opts.maxDelayMs);

            // Call onRetry callback
            opts.onRetry(attempt, lastError);

            // Wait before retrying
            await sleep(delay);
        }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError || new Error("Unexpected error in retry logic");
};

// ==================== HELPER FUNCTIONS ====================

export const getIntegrationName = (integration: string): string => {
    const integrationNames: Record<string, string> = {
        "meta-business": "Meta Business",
        "meta-ads": "Meta Ads",
        "shopify": "Shopify",
        "woocommerce": "WooCommerce",
        "youtube": "YouTube",
        "google-analytics": "Google Analytics",
        "google-search-console": "Google Search Console",
    };
    return integrationNames[integration.toLowerCase()] || integration;
};

export const formatSyncError = (error: SyncError, integration?: string): string => {
    const integrationName = integration ? getIntegrationName(integration) : "your account";

    switch (error.type) {
        case SyncErrorType.TOKEN_EXPIRED:
            return `Your ${integrationName} connection has expired. Please reconnect.`;
        case SyncErrorType.PERMISSION_DENIED:
            return `Missing permissions for ${integrationName}. Please reconnect with required permissions.`;
        case SyncErrorType.RATE_LIMIT:
            return `Too many requests to ${integrationName}. Syncing will resume automatically in a few minutes.`;
        case SyncErrorType.TIMEOUT:
            return `${integrationName} sync is taking longer than expected. We'll continue in the background.`;
        case SyncErrorType.INVALID_ACCOUNT:
            return `${integrationName} account configuration issue. Please contact support.`;
        case SyncErrorType.NETWORK_ERROR:
            return `Network connection issue while syncing ${integrationName}. Retrying...`;
        default:
            return error.userMessage;
    }
};
