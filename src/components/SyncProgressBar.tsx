import React from 'react';
import { useSyncProgress } from '@/hooks/useIntegrations';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { FiLoader, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'sonner';
import type { IntegrationType } from '@/types/integration.types';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SyncProgressBarProps {
    clientId: number;
    integrationType: IntegrationType;
    accountId?: string | number;
    onRetry?: () => void;
    compact?: boolean;
}

export const SyncProgressBar: React.FC<SyncProgressBarProps> = ({
    clientId,
    integrationType,
    onRetry,
    compact = false
}) => {
    const { data, isLoading, isError, refetch } = useSyncProgress(clientId, integrationType, true);

    const handleRetryConnection = (e: React.MouseEvent) => {
        e.stopPropagation();
        refetch();
    };

    const handleRetrySync = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRetry) {
            onRetry();
        } else {
            toast.error("Retry function not provided");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                <FiLoader className="animate-spin" />
                <span>Connecting...</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center gap-2 text-xs text-red-500">
                <FiAlertCircle className="flex-shrink-0" />
                <span className="truncate max-w-[100px]">Connection failed</span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-xs hover:bg-red-50 hover:text-red-600 p-0"
                    onClick={handleRetryConnection}
                >
                    Retry
                </Button>
            </div>
        );
    }

    if (!data || !data.success || data.status === 'not_started') {
        return null; // No active sync for this integration
    }

    const { status, progress } = data;

    if (status === 'completed') {
        return (
            <div className="flex items-center gap-2 text-xs text-green-600">
                <FiCheckCircle />
                <span>Sync {progress?.percentage || 100}%</span>
            </div>
        );
    }

    if (status === 'failed') {
        const errorMsg = progress?.errorLog?.error || "Sync failed";
        
        if (compact) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-md cursor-help">
                                <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Failed</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[250px] bg-white border-red-100 text-red-900 p-3 shadow-lg shadow-black/10">
                            <p className="font-semibold mb-1 text-sm text-red-700">Sync Error</p>
                            <p className="text-xs leading-relaxed text-red-600">{errorMsg}</p>
                            {onRetry && (
                                <Button 
                                    variant="link" 
                                    className="h-auto p-0 text-xs text-red-700 hover:text-red-900 mt-2 font-bold underline"
                                    onClick={handleRetrySync}
                                >
                                    Retry Sync
                                </Button>
                            )}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return (
            <div className="flex flex-col gap-1 w-full max-w-[200px]">
                <div className="flex items-center justify-between text-xs text-red-600">
                    <span className="flex items-center gap-1 font-medium">
                        <FiAlertCircle className="w-3.5 h-3.5" />
                        Sync Failed
                    </span>
                    {onRetry && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1.5 text-xs hover:bg-red-50 hover:text-red-700 p-0 font-bold"
                            onClick={handleRetrySync}
                        >
                            Retry
                        </Button>
                    )}
                </div>
                <span className="text-[10px] text-red-500 line-clamp-2 leading-tight" title={errorMsg}>
                    {errorMsg}
                </span>
            </div>
        );
    }

    if (status === 'in_progress' && progress) {
        return (
            <div className={`flex flex-col gap-1.5 w-full ${compact ? 'max-w-[140px]' : 'max-w-xs'}`}>
                <div className="flex justify-between items-end text-xs">
                    <span className="font-medium text-blue-700 truncate max-w-[70%]">
                        {compact ? 'Syncing...' : progress.currentStage || 'Syncing...'}
                    </span>
                    <span className="text-blue-600 font-bold">{progress.percentage}%</span>
                </div>

                <Progress value={progress.percentage} className="h-1.5 bg-blue-100" indicatorClassName="bg-blue-600" />

                {!compact && progress.estimatedMinutesRemaining !== null && (
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{progress.synced}/{progress.total} synced</span>
                        <span>~{progress.estimatedMinutesRemaining}m left</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="text-xs text-muted-foreground">
            Waiting to start...
        </div>
    );
};
