/**
 * Logger utility that only outputs in development mode
 * In production builds, log/warn/debug calls are no-ops
 * Errors are always logged for production error tracking
 */

const isDev = import.meta.env.DEV;

export const logger = {
    /**
     * Log general information (development only)
     */
    log: (...args: any[]) => {
        if (isDev) console.log(...args);
    },

    /**
     * Log warnings (development only)
     */
    warn: (...args: any[]) => {
        if (isDev) console.warn(...args);
    },

    /**
     * Log errors (always logged, even in production)
     */
    error: (...args: any[]) => {
        console.error(...args);
    },

    /**
     * Log debug information (development only)
     */
    debug: (...args: any[]) => {
        if (isDev) console.debug(...args);
    },

    /**
     * Log informational messages (development only)
     */
    info: (...args: any[]) => {
        if (isDev) console.info(...args);
    },
};
