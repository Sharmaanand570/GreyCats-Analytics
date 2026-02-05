import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { useSyncStatus } from '@/features/reports/hooks/useSyncStatus';
import { useClientContext } from '@/context/ClientContext';

interface DataSyncBannerProps {
    className?: string;
    compact?: boolean;
}

export const DataSyncBanner = ({ className, compact = false }: DataSyncBannerProps) => {
    const { currentClient } = useClientContext();
    const { hasError, errorMessage, retrySync, overallProgress, isLoading } = useSyncStatus(currentClient?.id || null);
    const [showDetails, setShowDetails] = useState(false);

    // Don't show banner if no client selected
    if (!currentClient) return null;

    // Error state
    if (hasError) {
        return (
            <div className={cn(
                compact ? "w-auto rounded-md border border-red-200" : "w-full border-b border-red-200",
                "bg-red-50 flex flex-col",
                compact ? "px-3 py-2" : "px-6 py-3",
                className
            )}>
                <div className="flex items-center gap-3">
                    <AlertCircle className={cn("text-red-600 flex-shrink-0", compact ? "w-3 h-3" : "w-4 h-4")} />
                    <div className="flex-1">
                        <p className={cn("text-red-700", compact ? "text-xs" : "text-sm")}>
                            <span className="font-semibold">Sync Error:</span> {errorMessage || "Failed to fetch sync status"}
                        </p>
                    </div>
                    <button
                        onClick={retrySync}
                        disabled={isLoading}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md",
                            "bg-red-600 text-white hover:bg-red-700",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "transition-colors",
                            compact ? "text-xs" : "text-sm"
                        )}
                    >
                        <RefreshCw className={cn(isLoading && "animate-spin", compact ? "w-3 h-3" : "w-4 h-4")} />
                        Retry
                    </button>
                    {!compact && (
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                        >
                            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    )}
                </div>
                {showDetails && !compact && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                        <p className="text-xs text-red-600 font-mono">
                            Technical Details: {errorMessage}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // Syncing state
    if (overallProgress.isSyncing) {
        return (
            <div className={cn(
                compact ? "w-auto rounded-md border border-blue-100" : "w-full border-b border-blue-100",
                "bg-blue-50 flex items-center gap-3",
                compact ? "px-3 py-2" : "px-6 py-3",
                className
            )}>
                <div className="relative">
                    <AlertCircle className={cn("text-blue-600", compact ? "w-3 h-3" : "w-4 h-4")} />
                    <div className="absolute inset-0 animate-ping">
                        <AlertCircle className={cn("text-blue-400 opacity-75", compact ? "w-3 h-3" : "w-4 h-4")} />
                    </div>
                </div>
                <div className="flex-1">
                    <p className={cn("text-blue-700", compact ? "text-xs" : "text-sm")}>
                        <span className="font-semibold">Syncing data...</span> {overallProgress.synced} of {overallProgress.total} accounts synced ({overallProgress.percent}%)
                        {!compact && " - This may take a few minutes."}
                    </p>
                </div>
                {!compact && (
                    <div className="w-32 bg-blue-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${overallProgress.percent}%` }}
                        />
                    </div>
                )}
            </div>
        );
    }

    // All synced - don't show banner
    return null;
};
