export type AlertCondition =
    | 'greater_than'
    | 'greater_than_or_equal'
    | 'less_than'
    | 'less_than_or_equal'
    | 'exactly_equal'
    | 'increase_by'
    | 'decrease_by';

export type AlertInterval = 'day' | 'week' | 'month' | 'quarter' | 'annual';

export interface Alert {
    id: number;
    userId: number;
    clientId: number;
    integration: string;
    accountId: number;  // Changed from string to number
    metricKey: string;
    metricLabel: string;
    condition: AlertCondition;
    triggerValue: number;
    currentValue?: number;
    interval: AlertInterval;
    isActive: boolean;
    notifyEmail: boolean;
    notifyInApp: boolean;
    emailTo?: string;
    lastCheckedAt?: string;
    lastTriggeredAt?: string | null;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateAlertData {
    integration: string;
    accountId: number | string;
    metricKey: string;
    metricLabel: string;
    condition: AlertCondition;
    triggerValue: number;
    interval: AlertInterval;
    name?: string;
    description?: string;
    notifyEmail?: boolean;
    notifyInApp?: boolean;
    emailTo?: string;
}

export interface UpdateAlertData extends Partial<CreateAlertData> {
    isActive?: boolean;
}

export interface AlertNotification {
    id: number;
    alertId: number;
    triggeredAt: string;
    previousValue: number;
    currentValue: number;
    message: string;
    isRead: boolean;
    readAt?: string | null;
    alert?: Alert;
}

export interface GetAlertsParams {
    integration?: string;
    active?: boolean;
}

export interface GetNotificationsParams {
    unread?: boolean;
    limit?: number;
}
