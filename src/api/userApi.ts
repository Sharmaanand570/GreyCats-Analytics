import api from "@/apiConfig";
import type {
    UserProfile,
    UserPreferences,
    NotificationSettings,
    ReportDefaults,
    UserSession,
    ApiResponse,
} from "@/types/user.types";

export const userApi = {
    // 1. Personal Information
    getProfile: async (): Promise<ApiResponse<UserProfile>> => {
        const response = await api.get("/user/profile");
        return response.data;
    },

    updateProfile: async (profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
        const response = await api.put("/user/profile", {
            fullName: profileData.fullName,
            phoneNumber: profileData.phoneNumber,
            jobTitle: profileData.jobTitle,
            companyName: profileData.companyName,
        });
        return response.data;
    },

    uploadProfilePicture: async (file: File): Promise<ApiResponse<{ profilePicture: string }>> => {
        const formData = new FormData();
        formData.append("picture", file);
        const response = await api.post("/user/profile/picture", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    // 2. Account Preferences
    getPreferences: async (): Promise<ApiResponse<UserPreferences>> => {
        const response = await api.get("/user/preferences");
        return response.data;
    },

    updatePreferences: async (preferences: UserPreferences): Promise<ApiResponse<UserPreferences>> => {
        const response = await api.put("/user/preferences", preferences);
        return response.data;
    },

    // 3. Notification Settings
    getNotifications: async (): Promise<ApiResponse<NotificationSettings>> => {
        const response = await api.get("/user/notifications");
        return response.data;
    },

    updateNotifications: async (settings: NotificationSettings): Promise<ApiResponse<NotificationSettings>> => {
        const response = await api.put("/user/notifications", settings);
        return response.data;
    },

    // 4. Default Report Settings
    getReportDefaults: async (): Promise<ApiResponse<ReportDefaults>> => {
        const response = await api.get("/user/report-defaults");
        return response.data;
    },

    updateReportDefaults: async (defaults: ReportDefaults): Promise<ApiResponse<ReportDefaults>> => {
        const response = await api.put("/user/report-defaults", defaults);
        return response.data;
    },

    // 5. Security Settings
    changePassword: async (passwords: any): Promise<ApiResponse<void>> => {
        const response = await api.post("/user/change-password", passwords);
        return response.data;
    },

    getSessions: async (): Promise<ApiResponse<UserSession[]>> => {
        const response = await api.get("/user/sessions");
        return response.data;
    },

    revokeSession: async (sessionId: number): Promise<ApiResponse<void>> => {
        const response = await api.delete(`/user/sessions/${sessionId}`);
        return response.data;
    },

    revokeAllSessions: async (): Promise<ApiResponse<void>> => {
        const response = await api.post("/user/sessions/revoke-all");
        return response.data;
    },
};
