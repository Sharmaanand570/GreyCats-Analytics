import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Cooldown hook to prevent rapid repeated actions
 * Useful for preventing abuse of critical operations
 */
export const useCooldown = (cooldownMs: number = 3000) => {
    const [isOnCooldown, setIsOnCooldown] = useState(false);
    const [remainingMs, setRemainingMs] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const trigger = useCallback(() => {
        setIsOnCooldown(true);
        setRemainingMs(cooldownMs);

        // Update remaining time every 100ms
        intervalRef.current = setInterval(() => {
            setRemainingMs((prev) => {
                const next = prev - 100;
                if (next <= 0) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return 0;
                }
                return next;
            });
        }, 100);

        // Clear cooldown after timeout
        timeoutRef.current = setTimeout(() => {
            setIsOnCooldown(false);
            setRemainingMs(0);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }, cooldownMs);
    }, [cooldownMs]);

    const reset = useCallback(() => {
        setIsOnCooldown(false);
        setRemainingMs(0);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return {
        isOnCooldown,
        remainingMs,
        remainingSeconds: Math.ceil(remainingMs / 1000),
        trigger,
        reset,
    };
};
