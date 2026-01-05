import { FiLoader, FiCheckCircle } from "react-icons/fi";


interface SyncStatusBadgeProps {
    isSyncing: boolean;
    statusText?: string;
    syncDetails?: {
        total: number;
        synced: number;
    } | null;
}

export const SyncStatusBadge = ({ isSyncing, statusText = "Connected", syncDetails }: SyncStatusBadgeProps) => {
    if (isSyncing) {
        const text = syncDetails
            ? `Syncing... (${syncDetails.synced}/${syncDetails.total})`
            : "Syncing...";

        return (
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md whitespace-nowrap">
                <FiLoader className="w-3 h-3 animate-spin" />
                <span>{text}</span>
            </div>
        );
    }

    // Default connected state
    return (
        <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-md whitespace-nowrap">
            <FiCheckCircle className="w-3 h-3" />
            <span>{statusText}</span>
        </div>
    );
};
