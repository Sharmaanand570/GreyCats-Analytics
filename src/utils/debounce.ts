/**
 * Debounce utility function
 * Delays function execution until after wait time has elapsed since last call
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    waitMs: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitMs);
    };
};

/**
 * Throttle utility function
 * Ensures function is called at most once per wait period
 */
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    waitMs: number
): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;

    return (...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastCall >= waitMs) {
            lastCall = now;
            func(...args);
        }
    };
};
