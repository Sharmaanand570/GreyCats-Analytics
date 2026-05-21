import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead } from '../api/alertsApi';
import { getUserNotifications, markSystemNotificationRead } from '../api/notificationsApi';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { FiBell, FiCheck } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

type Tab = 'alerts' | 'system';

export const NotificationsPopover: React.FC = () => {
    const queryClient = useQueryClient();
    const [tab, setTab] = useState<Tab>('system');

    // ── Alert notifications (metric threshold triggers) ──────────────────
    const { data: alertData, isLoading: alertLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => getNotifications({ limit: 20 }),
        refetchInterval: 60000,
    });

    // ── System notifications (admin broadcasts) ───────────────────────────
    const { data: systemData, isLoading: systemLoading } = useQuery({
        queryKey: ['systemNotifications'],
        queryFn: getUserNotifications,
        refetchInterval: 60000,
        staleTime: 30000,
    });

    const alertNotifications = alertData?.data ?? [];
    const systemNotifications = systemData?.data ?? [];

    const isUnreadFn = (n: any) => !n.isRead && n.isRead !== 1 && n.is_read !== 1 && n.is_read !== true;

    const alertUnread = alertData?.unreadCount ?? alertNotifications.filter(isUnreadFn).length;
    const systemUnread = systemData?.unreadCount ?? systemNotifications.filter(isUnreadFn).length;

    const totalUnread = alertUnread + systemUnread;

    // ── Mark alert read ───────────────────────────────────────────────────
    const markAlertRead = useMutation({
        mutationFn: markNotificationRead,
        onMutate: async (id: number) => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });
            const snapshot = queryClient.getQueryData(['notifications']);
            queryClient.setQueryData(['notifications'], (old: typeof alertData) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map(n => String(n.id) === String(id) ? { ...n, isRead: true } : n),
                    unreadCount: Math.max(0, (old.unreadCount || 0) - 1),
                };
            });
            return { snapshot };
        },
        onError: (error: any, _id, context) => {
            if (context?.snapshot) {
                queryClient.setQueryData(['notifications'], context.snapshot);
            }
            toast.error(error.response?.data?.message ?? 'Failed to mark as read');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    // ── Mark system notification read (optimistic) ────────────────────────
    const markSystemRead = useMutation({
        mutationFn: markSystemNotificationRead,
        onMutate: async (id: number) => {
            await queryClient.cancelQueries({ queryKey: ['systemNotifications'] });
            const snapshot = queryClient.getQueryData(['systemNotifications']);
            queryClient.setQueryData(['systemNotifications'], (old: typeof systemData) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map(n => String(n.id) === String(id) ? { ...n, isRead: true } : n),
                    unreadCount: Math.max(0, old.unreadCount - 1),
                };
            });
            return { snapshot };
        },
        onError: (_err, _id, context) => {
            if (context?.snapshot) {
                queryClient.setQueryData(['systemNotifications'], context.snapshot);
            }
            toast.error('Failed to mark as read');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['systemNotifications'] });
        },
    });

    const isLoading = tab === 'alerts' ? alertLoading : systemLoading;
    const items = tab === 'alerts' ? alertNotifications : systemNotifications;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    id="notifications-bell"
                    aria-label={`Notifications${totalUnread > 0 ? `, ${totalUnread} unread` : ''}`}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors relative"
                >
                    <FiBell className="text-lg" />
                    {totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                            {totalUnread > 99 ? '99+' : totalUnread}
                        </span>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0 bg-white border border-zinc-200 shadow-xl rounded-xl" align="end">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {totalUnread > 0 && (
                        <Badge variant="secondary" className="bg-red-50 text-red-600">
                            {totalUnread} New
                        </Badge>
                    )}
                </div>

                {/* Tab switcher */}
                <div className="flex border-b text-xs font-medium">
                    <button
                        onClick={() => setTab('system')}
                        className={`flex-1 py-2 transition-colors ${
                            tab === 'system'
                                ? 'border-b-2 border-zinc-900 text-zinc-900'
                                : 'text-zinc-400 hover:text-zinc-600'
                        }`}
                    >
                        Announcements
                        {systemUnread > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px]">
                                {systemUnread}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setTab('alerts')}
                        className={`flex-1 py-2 transition-colors ${
                            tab === 'alerts'
                                ? 'border-b-2 border-zinc-900 text-zinc-900'
                                : 'text-zinc-400 hover:text-zinc-600'
                        }`}
                    >
                        Alert Triggers
                        {alertUnread > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px]">
                                {alertUnread}
                            </span>
                        )}
                    </button>
                </div>

                {/* Body */}
                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading…</div>
                    ) : items.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                            <FiBell className="text-2xl opacity-20" />
                            <p>No {tab === 'system' ? 'announcements' : 'alert triggers'}</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {items.map((n) => {
                                const isAlert = tab === 'alerts';
                                // Both types share isRead; alert type uses triggeredAt, system uses createdAt
                                const dateStr = isAlert
                                    ? (n as any).triggeredAt
                                    : (n as any).createdAt;
                                const title = isAlert ? undefined : (n as any).title;
                                const body = (n as any).message;

                                const isUnread = isUnreadFn(n);

                                return (
                                    <div
                                        key={n.id}
                                        className={`p-4 hover:bg-zinc-50 transition-colors ${isUnread ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3 items-start">
                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${isUnread ? 'bg-blue-500' : 'bg-transparent'}`} />
                                            <div className="flex-1 space-y-0.5">
                                                {title && (
                                                    <p className="text-xs font-semibold text-zinc-800 leading-snug">{title}</p>
                                                )}
                                                <p className="text-sm text-zinc-700 leading-snug">{body}</p>
                                                <div className="flex items-center justify-between pt-1">
                                                    <span className="text-xs text-zinc-400">
                                                        {formatDistanceToNow(new Date(dateStr), { addSuffix: true })}
                                                    </span>
                                                    {isUnread && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                if (isAlert) {
                                                                    markAlertRead.mutate(n.id);
                                                                } else {
                                                                    markSystemRead.mutate(n.id);
                                                                }
                                                            }}
                                                        >
                                                            <FiCheck className="w-3 h-3" />
                                                            <span className="sr-only">Mark as read</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <div className="p-2 border-t bg-zinc-50/50 text-center">
                    <p className="text-[10px] text-zinc-400">
                        {items.length} notification{items.length !== 1 ? 's' : ''} shown
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
};
