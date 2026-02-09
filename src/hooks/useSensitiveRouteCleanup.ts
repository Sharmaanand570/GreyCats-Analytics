import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to cleanup sensitive data when leaving a route
 * Useful for clearing cached admin data, temporary state, etc.
 */
export const useSensitiveRouteCleanup = (cleanup: () => void) => {
    const location = useLocation();

    useEffect(() => {
        // Cleanup function runs when component unmounts (route changes)
        return () => {
            cleanup();
        };
    }, [location.pathname, cleanup]);
};
