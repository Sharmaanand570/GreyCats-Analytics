import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, RefreshCw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { useSystemNotifications } from '@/hooks/useSystemNotifications';

/**
 * SystemNotificationsPopover
 *
 * Bell icon + dropdown for admin-sent system notifications (global / targeted).
 * Designed for placement in MainSideBar footer area.
 */
export const SystemNotificationsPopover: React.FC = () => {
    const { notifications, unreadCount, isLoading, error, markAsRead, refreshNotifications } =
        useSystemNotifications();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    id="system-notifications-bell"
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                    className="relative p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent
                className="w-80 p-0 shadow-xl border border-zinc-200 dark:border-zinc-700"
                align="end"
                side="right"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">
                            Notifications
                        </h4>
                        {unreadCount > 0 && (
                            <Badge className="bg-red-50 text-red-600 border-red-100 text-[10px] px-1.5 py-0 h-4">
                                {unreadCount} new
                            </Badge>
                        )}
                    </div>
                    <button
                        onClick={refreshNotifications}
                        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                        aria-label="Refresh notifications"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Body */}
                <ScrollArea className="h-[320px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full py-10 gap-2 text-zinc-400">
                            <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                            <p className="text-xs">Loading…</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full py-10 gap-2 text-center px-4">
                            <Bell className="w-7 h-7 text-zinc-300" />
                            <p className="text-sm font-medium text-zinc-600">Failed to load</p>
                            <p className="text-xs text-zinc-400">
                                {(error as any)?.response?.data?.message ?? 'Please try again later'}
                            </p>
                            <Button size="sm" variant="outline" onClick={refreshNotifications} className="mt-1 h-7 text-xs">
                                Retry
                            </Button>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-10 gap-2 text-center px-4">
                            <Bell className="w-7 h-7 text-zinc-300" />
                            <p className="text-sm text-zinc-500">You're all caught up!</p>
                            <p className="text-xs text-zinc-400">No new notifications.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 transition-colors group ${
                                        !notification.isRead
                                            ? 'bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-50/60'
                                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                                    }`}
                                >
                                    <div className="flex gap-3 items-start">
                                        {/* Unread dot */}
                                        <div
                                            className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                                                !notification.isRead
                                                    ? 'bg-blue-500'
                                                    : 'bg-transparent'
                                            }`}
                                        />

                                        <div className="flex-1 min-w-0 space-y-0.5">
                                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 leading-snug">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-[10px] text-zinc-400">
                                                    {formatDistanceToNow(
                                                        new Date(notification.createdAt),
                                                        { addSuffix: true },
                                                    )}
                                                </span>

                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        aria-label="Mark as read"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        Mark read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
                    <p className="text-[10px] text-zinc-400">
                        Showing latest {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
};
