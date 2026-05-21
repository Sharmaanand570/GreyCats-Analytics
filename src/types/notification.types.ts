/**
 * System Notification — sent by admins to users (global or targeted).
 * Distinct from AlertNotification (metric threshold alerts).
 */
export interface SystemNotification {
    id: number;
    title: string;
    message: string;
    isRead: boolean;
    userId: number | null; // null = global broadcast
    createdAt: string;     // ISO date string
    updatedAt: string;     // ISO date string
}

export interface SystemNotificationsResponse {
    data: SystemNotification[];
    unreadCount: number;
}

/** Payload for the admin send-notification endpoint */
export interface SendNotificationPayload {
    title: string;
    message: string;
    target: 'all' | 'specific';
    userIds?: number[]; // Required only when target === 'specific'
}

export interface SendNotificationResponse {
    success: boolean;
    message: string;
    createdCount: number;
}
