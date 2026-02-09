import { logger } from '../logger';

interface IntegrityCheckResult {
    devToolsOpen: boolean;
    consoleModified: boolean;
    storageAccessible: boolean;
    timestamp: string;
}

/**
 * Perform basic client-side integrity checks
 * Detects potential tampering or unusual client state
 */
export const performIntegrityChecks = (): IntegrityCheckResult => {
    const checks: IntegrityCheckResult = {
        devToolsOpen: false,
        consoleModified: false,
        storageAccessible: true,
        timestamp: new Date().toISOString(),
    };

    // Check if DevTools might be open (basic heuristic)
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    checks.devToolsOpen = widthDiff > threshold || heightDiff > threshold;

    // Check if console has been modified
    try {
        const consoleStr = console.log.toString();
        checks.consoleModified = !consoleStr.includes('native code');
    } catch {
        checks.consoleModified = true;
    }

    // Check storage accessibility
    try {
        localStorage.setItem('__integrity_test__', 'test');
        localStorage.removeItem('__integrity_test__');
        sessionStorage.setItem('__integrity_test__', 'test');
        sessionStorage.removeItem('__integrity_test__');
    } catch {
        checks.storageAccessible = false;
    }

    // Log warnings if issues detected
    if (checks.devToolsOpen) {
        logger.warn('DevTools may be open');
    }
    if (checks.consoleModified) {
        logger.warn('Console appears to be modified');
    }
    if (!checks.storageAccessible) {
        logger.error('Storage is not accessible');
    }

    return checks;
};

/**
 * Initialize periodic integrity checks
 */
export const initIntegrityMonitoring = (intervalMs: number = 60000) => {
    // Run initial check
    performIntegrityChecks();

    // Run periodic checks (only in production)
    if (import.meta.env.PROD) {
        setInterval(() => {
            const result = performIntegrityChecks();

            // Could send to monitoring service if anomalies detected
            if (result.consoleModified || !result.storageAccessible) {
                logger.error('Integrity check failed:', result);
            }
        }, intervalMs);
    }

    logger.log('Integrity monitoring initialized');
};
