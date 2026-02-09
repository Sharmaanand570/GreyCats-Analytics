import { logger } from '../logger';

/**
 * Initialize CSP violation reporting
 * Logs CSP violations for monitoring and debugging
 */
export const initCSPReporting = () => {
    if (typeof document === 'undefined') return;

    document.addEventListener('securitypolicyviolation', (e) => {
        const violation = {
            blockedURI: e.blockedURI,
            violatedDirective: e.violatedDirective,
            originalPolicy: e.originalPolicy,
            disposition: e.disposition,
            timestamp: new Date().toISOString(),
        };

        logger.error('CSP Violation Detected:', violation);

        // In production, you could send this to a monitoring service
        if (import.meta.env.PROD) {
            // Example: Send to monitoring endpoint
            // fetch('/api/security/csp-report', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(violation)
            // }).catch(() => {});
        }
    });

    logger.log('CSP violation reporting initialized');
};
