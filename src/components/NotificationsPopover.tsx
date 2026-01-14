import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead } from '../api/alertsApi';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { FiBell, FiCheck } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from './ui/badge';
import { toast } from 'sonner';


export const NotificationsPopover: React.FC = () => {
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => getNotifications({ limit: 20 }),
        refetchInterval: 60000, // Check every minute
    });

    const markReadMutation = useMutation({
        mutationFn: markNotificationRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Notification marked as read');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to mark notification as read';
            toast.error(errorMessage);
        },
    });

    const notifications = data?.data || [];
    const unreadCount = data?.unreadCount || 0;

    const handleMarkAsRead = (id: number) => {
        markReadMutation.mutate(id);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors relative">
                    <FiBell className="text-lg" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="bg-red-50 text-red-600">
                            {unreadCount} New
                        </Badge>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-sm text-red-500 flex flex-col items-center gap-2">
                            <FiBell className="text-2xl opacity-20" />
                            <p className="font-medium">Failed to load notifications</p>
                            <p className="text-xs text-zinc-500">
                                {(error as any)?.response?.data?.message || 'Please try again later'}
                            </p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                            <FiBell className="text-2xl opacity-20" />
                            <p>No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-zinc-50 transition-colors ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className="flex gap-3 items-start">
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notification.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm text-zinc-800 leading-snug">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-xs text-zinc-400">
                                                    {formatDistanceToNow(new Date(notification.triggeredAt), { addSuffix: true })}
                                                </span>
                                                {!notification.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                    >
                                                        <FiCheck className="w-3 h-3" />
                                                        <span className="sr-only">Mark as read</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t bg-zinc-50/50 text-center">
                    <Button variant="link" size="sm" className="text-xs text-zinc-500 h-auto py-1">
                        View all notifications
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
