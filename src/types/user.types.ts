export interface UserProfile {
    id: number;
    email: string;
    fullName: string;
    phoneNumber?: string;
    profilePicture?: string;
    jobTitle?: string;
    companyName?: string;
    companyLogo?: string;
    companyWebsite?: string;
    companyStreetAddress?: string;
    companyCity?: string;
    companyState?: string;
    companyCountry?: string;
    companyPIN?: string;
    companyPhone?: string;

    createdAt: string;
}

export interface UserPreferences {
    timezone: string;
    dateFormat: string;
    numberFormat: string;
}

export interface NotificationSettings {
    emailNotifications: {
        reports: boolean;
        alerts: boolean;
        weekly: boolean;
        system: boolean;
    };
    inAppNotifications: {
        alerts: boolean;
        reports: boolean;
        syncStatus: boolean;
    };
    notificationEmail?: string;
}

export interface ReportDefaults {
    defaultDateRange: string;
    defaultReportFreq: string;
    preferredFormat: string;
}

export interface UserSession {
    id: number;
    deviceName: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    ipAddress: string;
    location: string;
    lastActiveAt: string;
    createdAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface EmailChangeOTPRequest {
    newEmail: string;
}

export interface VerifyEmailOTPRequest {
    otp: string;
}

