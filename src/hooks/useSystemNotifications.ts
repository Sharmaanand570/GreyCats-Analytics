import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserNotifications, markSystemNotificationRead } from '@/api/notificationsApi';
import { toast } from 'sonner';

const QUERY_KEY = ['systemNotifications'] as const;

/**
 * useSystemNotifications
 *
 * Manages system-wide notifications sent by admins.
 * Polls every 60 seconds for new notifications.
 * Supports optimistic mark-as-read with automatic revert on failure.
 */
export function useSystemNotifications() {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: getUserNotifications,
        refetchInterval: 60_000, // poll every minute
        staleTime: 30_000,
    });

    const notifications = data?.data ?? [];
    const unreadCount = data?.unreadCount ?? 0;

    const markReadMutation = useMutation({
        mutationFn: markSystemNotificationRead,

        // Optimistic update: flip isRead before the request lands
        onMutate: async (notificationId: number) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEY });
            const snapshot = queryClient.getQueryData(QUERY_KEY);

            queryClient.setQueryData(
                QUERY_KEY,
                (old: typeof data) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: old.data.map(n =>
                            n.id === notificationId ? { ...n, isRead: true } : n,
                        ),
                        unreadCount: Math.max(0, old.unreadCount - 1),
                    };
                },
            );

            return { snapshot };
        },

        onError: (_err, _id, context) => {
            // Revert to the previous value on failure
            if (context?.snapshot) {
                queryClient.setQueryData(QUERY_KEY, context.snapshot);
            }
            toast.error('Failed to mark notification as read');
        },

        onSettled: () => {
            // Always sync from server after mutation
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });

    const markAsRead = (notificationId: number) => {
        markReadMutation.mutate(notificationId);
    };

    const refreshNotifications = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    };

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        refreshNotifications,
    };
}
