import api from '@/apiConfig';
import type {
    SystemNotificationsResponse,
    SendNotificationPayload,
    SendNotificationResponse,
} from '@/types/notification.types';

// ─── User endpoints ───────────────────────────────────────────────────────────

/**
 * GET /api/user/notifications/list
 * Returns the latest 50 notifications (personal + global) for the logged-in user.
 */
export const getUserNotifications = async (): Promise<SystemNotificationsResponse> => {
    const response = await api.get<SystemNotificationsResponse>('/user/notifications/list');
    return response.data;
};

/**
 * PATCH /api/user/notifications/:id/read
 * Marks a single notification as read for the logged-in user.
 */
export const markSystemNotificationRead = async (notificationId: number): Promise<void> => {
    await api.patch(`/user/notifications/${notificationId}/read`);
};

// ─── Admin endpoints ──────────────────────────────────────────────────────────

/**
 * POST /api/admin/notifications/send
 * Dispatches a notification to all users or specific user IDs.
 */
export const sendAdminNotification = async (
    payload: SendNotificationPayload,
): Promise<SendNotificationResponse> => {
    const response = await api.post<SendNotificationResponse>(
        '/admin/notifications/send',
        payload,
    );
    return response.data;
};
