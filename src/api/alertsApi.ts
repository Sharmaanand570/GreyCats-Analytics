import api from '../apiConfig';
import type {
    Alert,
    CreateAlertData,
    UpdateAlertData,
    GetAlertsParams,
    AlertNotification,
    GetNotificationsParams
} from '../types/alert.types';

// Alert Endpoints
export const getAlerts = async (clientId: number, params?: GetAlertsParams) => {
    const response = await api.get<{ success: boolean; data: Alert[] }>(
        `/alerts/clients/${clientId}/alerts`,
        { params }
    );
    return response.data;
};

export const createAlert = async (clientId: number, data: CreateAlertData) => {
    const response = await api.post<{ success: boolean; data: Alert }>(
        `/alerts/clients/${clientId}/alerts`,
        data
    );
    return response.data;
};

export const getAlert = async (clientId: number, alertId: number) => {
    const response = await api.get<{ success: boolean; data: Alert }>(
        `/alerts/clients/${clientId}/alerts/${alertId}`
    );
    return response.data;
};

export const updateAlert = async (clientId: number, alertId: number, data: UpdateAlertData) => {
    const response = await api.put<{ success: boolean; data: Alert }>(
        `/alerts/clients/${clientId}/alerts/${alertId}`,
        data
    );
    return response.data;
};

export const deleteAlert = async (clientId: number, alertId: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(
        `/alerts/clients/${clientId}/alerts/${alertId}`
    );
    return response.data;
};

// Notification Endpoints
export const getNotifications = async (params?: GetNotificationsParams) => {
    const response = await api.get<{ success: boolean; data: AlertNotification[]; unreadCount?: number }>(
        `/alerts/alerts/notifications`,
        { params }
    );
    return response.data;
};

export const markNotificationRead = async (notificationId: number) => {
    const response = await api.put<{ success: boolean; data: { id: number; isRead: boolean; readAt: string } }>(
        `/alerts/alerts/notifications/${notificationId}/read`
    );
    return response.data;
};
