import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { sendAdminNotification } from '@/api/notificationsApi';
import { adminApi, type AdminUser } from '@/api/adminApi';
import type { SendNotificationPayload } from '@/types/notification.types';
import { toast } from 'sonner';
import { Bell, Send, Users, Globe, CheckCircle2, AlertCircle, X, ChevronsUpDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

const MAX_TITLE_LEN = 100;
const MAX_MSG_LEN = 500;

export default function AdminNotificationsPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState<'all' | 'specific'>('all');
    const [userIds, setUserIds] = useState<number[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<{ id: number; name: string; email: string }[]>([]);
    const [lastResult, setLastResult] = useState<{ count: number; msg: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [openPopover, setOpenPopover] = useState(false);

    // Fetch users for selector
    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['adminUsersList', searchQuery],
        queryFn: () => adminApi.getUsers(1, 20, searchQuery),
    });

    const { mutate: send, isPending } = useMutation({
        mutationFn: (payload: SendNotificationPayload) => sendAdminNotification(payload),
        onSuccess: (data) => {
            setLastResult({ count: data.createdCount, msg: data.message ?? 'Notification sent.' });
            toast.success(`Sent to ${data.createdCount} user${data.createdCount !== 1 ? 's' : ''}`);
            // Reset form
            setTitle('');
            setMessage('');
            setTarget('all');
            setUserIds([]);
            setSelectedUsers([]);
            setSearchQuery('');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message ?? 'Failed to send notification');
        },
    });

    const toggleUser = (user: AdminUser) => {
        if (userIds.includes(user.id)) {
            setUserIds(prev => prev.filter(id => id !== user.id));
            setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
        } else {
            setUserIds(prev => [...prev, user.id]);
            setSelectedUsers(prev => [...prev, { id: user.id, name: user.fullName, email: user.email }]);
        }
    };

    const removeUserId = (id: number) => {
        setUserIds(prev => prev.filter(u => u !== id));
        setSelectedUsers(prev => prev.filter(u => u.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { toast.error('Title is required'); return; }
        if (!message.trim()) { toast.error('Message is required'); return; }
        if (target === 'specific' && userIds.length === 0) {
            toast.error('Add at least one User ID for a specific notification');
            return;
        }

        const payload: SendNotificationPayload = {
            title: title.trim(),
            message: message.trim(),
            target,
            ...(target === 'specific' ? { userIds } : {}),
        };
        send(payload);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Send Notification
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Dispatch a system notification to all users or specific accounts.
                    </p>
                </div>
            </div>

            {/* Success banner */}
            {lastResult && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">
                        {lastResult.msg} — reached <span className="font-bold">{lastResult.count}</span> user{lastResult.count !== 1 ? 's' : ''}.
                    </p>
                    <button onClick={() => setLastResult(null)} className="ml-auto text-green-600 hover:text-green-800">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Form Card */}
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-8 space-y-6"
            >
                {/* Target Selector */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        Audience
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {(['all', 'specific'] as const).map(opt => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => setTarget(opt)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                                    target === opt
                                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                                        : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                                }`}
                            >
                                {opt === 'all' ? (
                                    <Globe className="w-4 h-4 shrink-0" />
                                ) : (
                                    <Users className="w-4 h-4 shrink-0" />
                                )}
                                <span className="text-sm font-medium capitalize">
                                    {opt === 'all' ? 'All Users' : 'Specific Users'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Specific User IDs */}
                {target === 'specific' && (
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                            Select Users
                        </label>
                        <Popover open={openPopover} onOpenChange={setOpenPopover}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openPopover}
                                    className="w-full justify-between h-11 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                >
                                    {userIds.length > 0
                                        ? `${userIds.length} user(s) selected`
                                        : "Search and select users..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0 bg-white dark:bg-zinc-900 shadow-xl border border-gray-200 dark:border-zinc-700 rounded-xl z-50" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput 
                                        placeholder="Search by name or email..." 
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                    />
                                    <CommandList>
                                        <CommandEmpty>{usersLoading ? 'Loading users...' : 'No users found.'}</CommandEmpty>
                                        <CommandGroup>
                                            {usersData?.users.map((user) => (
                                                <CommandItem
                                                    key={user.id}
                                                    value={user.id.toString()}
                                                    onSelect={() => toggleUser(user)}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{user.fullName}</span>
                                                        <span className="text-xs text-gray-500">{user.email}</span>
                                                    </div>
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            userIds.includes(user.id) ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {selectedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {selectedUsers.map(u => (
                                    <Badge
                                        key={u.id}
                                        variant="secondary"
                                        className="gap-1 pl-2.5 pr-1.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                                    >
                                        {u.name}
                                        <button
                                            type="button"
                                            onClick={() => removeUserId(u.id)}
                                            className="rounded-full hover:bg-gray-300 dark:hover:bg-zinc-600 p-0.5 ml-1"
                                            aria-label={`Remove user ${u.name}`}
                                        >
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {userIds.length === 0 && (
                            <p className="text-xs text-amber-600 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Add at least one User ID to send.
                            </p>
                        )}
                    </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="notif-title" className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                            Title
                        </label>
                        <span className={`text-[10px] ${title.length > MAX_TITLE_LEN * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}>
                            {title.length}/{MAX_TITLE_LEN}
                        </span>
                    </div>
                    <input
                        id="notif-title"
                        type="text"
                        maxLength={MAX_TITLE_LEN}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. System maintenance scheduled"
                        required
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white placeholder:text-gray-400"
                    />
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="notif-message" className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                            Message
                        </label>
                        <span className={`text-[10px] ${message.length > MAX_MSG_LEN * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}>
                            {message.length}/{MAX_MSG_LEN}
                        </span>
                    </div>
                    <textarea
                        id="notif-message"
                        rows={4}
                        maxLength={MAX_MSG_LEN}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Write a clear, concise message for your users…"
                        required
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white placeholder:text-gray-400 resize-none"
                    />
                </div>

                {/* Preview */}
                {(title || message) && (
                    <div className="rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 p-4 space-y-1 bg-gray-50 dark:bg-zinc-800/50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Preview</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                            {title || <span className="text-gray-400 italic">No title yet</span>}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">
                            {message || <span className="italic text-gray-400">No message yet</span>}
                        </p>
                        <p className="text-[10px] text-gray-400 pt-1">
                            Target: <span className="font-medium">{target === 'all' ? 'All users' : `${userIds.length} specific user(s)`}</span>
                        </p>
                    </div>
                )}

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-11 gap-2 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-100 font-semibold"
                >
                    {isPending ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin dark:border-black/30 dark:border-t-black" />
                            Sending…
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Send Notification
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
