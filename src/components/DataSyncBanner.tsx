import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

interface DataSyncBannerProps {
    className?: string;
    compact?: boolean;
    autoHide?: boolean;
}

export const DataSyncBanner = ({ className, compact = false, autoHide = true }: DataSyncBannerProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!autoHide) return;

        const STORAGE_KEY = 'data-sync-banner-start-time';
        const DURATION = 5 * 60 * 1000; // 5 minutes

        // Get stored start time or set new one
        let startTime = parseInt(sessionStorage.getItem(STORAGE_KEY) || '0');
        const now = Date.now();

        if (!startTime) {
            startTime = now;
            sessionStorage.setItem(STORAGE_KEY, startTime.toString());
        }

        const elapsed = now - startTime;
        const remaining = DURATION - elapsed;

        if (remaining <= 0) {
            setIsVisible(false);
            return;
        }

        const timer = setTimeout(() => {
            setIsVisible(false);
        }, remaining);

        return () => clearTimeout(timer);
    }, [autoHide]);

    if (!isVisible) return null;

    return (
        <div className={cn(
            compact ? "w-auto rounded-md border border-blue-100" : "w-full border-b border-blue-100",
            "bg-blue-50 flex items-center gap-3",
            compact ? "px-3 py-2" : "px-6 py-3",
            className
        )}>
            <AlertCircle className={cn("text-blue-600", compact ? "w-3 h-3" : "w-4 h-4")} />
            <p className={cn("text-blue-700", compact ? "text-xs" : "text-sm")}>
                <span className="font-semibold">Just connected?</span> Data synchronization takes about 5 minutes.
                {!compact && " If you don't see your data immediately, please check back shortly."}
            </p>
        </div>
    );
};
