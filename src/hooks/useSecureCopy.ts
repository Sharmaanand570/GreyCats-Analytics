import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseSecureCopyOptions {
    requireConfirm?: boolean;
    clearAfterMs?: number;
    confirmMessage?: string;
}

/**
 * Secure copy-to-clipboard hook with confirmation and auto-clear
 */
export const useSecureCopy = (options: UseSecureCopyOptions = {}) => {
    const {
        requireConfirm = false,
        clearAfterMs = 30000, // 30 seconds
        confirmMessage = 'Are you sure you want to copy this sensitive information to clipboard?'
    } = options;

    const [isCopying, setIsCopying] = useState(false);

    const copyToClipboard = useCallback(async (text: string, customConfirm?: boolean) => {
        const needsConfirm = customConfirm ?? requireConfirm;

        if (needsConfirm) {
            const confirmed = window.confirm(confirmMessage);
            if (!confirmed) return false;
        }

        setIsCopying(true);
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Copied to clipboard', {
                description: clearAfterMs > 0 ? `Will be cleared in ${clearAfterMs / 1000}s` : undefined
            });

            // Clear clipboard after timeout
            if (clearAfterMs > 0) {
                setTimeout(() => {
                    navigator.clipboard.writeText('').catch(() => {
                        // Silently fail if clipboard clear fails
                    });
                }, clearAfterMs);
            }

            return true;
        } catch (error) {
            toast.error('Failed to copy to clipboard');
            return false;
        } finally {
            setIsCopying(false);
        }
    }, [requireConfirm, clearAfterMs, confirmMessage]);

    return { copyToClipboard, isCopying };
};
