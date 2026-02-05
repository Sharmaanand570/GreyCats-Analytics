import api from "@/apiConfig";

export interface AdminUser {
    id: number;
    email: string;
    fullName: string;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    status: 'ACTIVE' | 'SUSPENDED';
    planName?: string;
    clientsCount: number;
    createdAt: string;
}

export interface AdminUsersResponse {
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AdminClient {
    id: number;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    ownerId?: number;
    ownerName?: string;
    integrationsCount: number;
    usersCount: number;
    createdAt: string;
}

export interface AdminClientsResponse {
    clients: AdminClient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AdminStats {
    totalUsers: number;
    userGrowth: number;
    totalClients: number;
    clientGrowth: number;
    activeSubscriptions: number;
    mrr: number;
}

export interface AdminPlan {
    id: string;
    name: string; // internal identifier e.g. "premium"
    displayName: string; // user facing e.g. "Premium Plan"
    description: string;
    price: number;
    currency: string;
    interval: 'monthly' | 'yearly' | 'lifetime';
    limits: {
        maxClients: number;
        maxIntegrations: number;
        maxStorage: number;
        maxApiCalls: number;
    };
    features: string[];
    isPublic: boolean;
    status: 'active' | 'archived';
    activeSubscriptionsCount?: number;
}

export interface AdminSubscription {
    id: string;
    userId: number;
    userEmail: string;
    userName: string;
    planId: string;
    planName: string;
    price: number;
    interval: string;
    status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'expired';
    startDate: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    autoRenew: boolean;
}

export const adminApi = {
    // Users
    getUsers: async (page = 1, limit = 20, search = "", role?: string): Promise<AdminUsersResponse> => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (role) params.append("role", role);

        const response = await api.get(`/admin/users?${params.toString()}`);
        return response.data;
    },

    getUserDetails: async (userId: string | number) => {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data;
    },

    updateUserStatus: async (userId: number, status: 'ACTIVE' | 'SUSPENDED') => {
        const response = await api.patch(`/admin/users/${userId}/status`, { status });
        return response.data;
    },

    impersonateUser: async (userId: number) => {
        const response = await api.post(`/admin/users/${userId}/impersonate`);
        return response.data;
    },

    updateUserRole: async (userId: number, role: 'USER' | 'ADMIN' | 'SUPER_ADMIN') => {
        const response = await api.patch(`/admin/users/${userId}/role`, { role });
        return response.data;
    },

    deleteUser: async (userId: number) => {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    },

    getUserSessions: async (userId: number) => {
        const response = await api.get(`/admin/users/${userId}/sessions`);
        return response.data;
    },

    // Clients
    getClients: async (page = 1, limit = 20, search = "", userId?: number | string): Promise<AdminClientsResponse> => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (search) params.append("search", search);
        if (userId) params.append("userId", userId.toString());

        const response = await api.get(`/admin/clients?${params.toString()}`);
        return response.data;
    },

    getClientDetails: async (clientId: string | number) => {
        const response = await api.get(`/admin/clients/${clientId}`);
        return response.data;
    },

    deleteClient: async (clientId: number) => {
        const response = await api.delete(`/admin/clients/${clientId}`);
        return response.data;
    },

    updateClient: async (clientId: number, data: Partial<AdminClient>) => {
        const response = await api.patch(`/admin/clients/${clientId}`, data);
        return response.data;
    },

    transferClient: async (clientId: number, newUserId: number) => {
        const response = await api.post(`/admin/clients/${clientId}/transfer`, { newUserId });
        return response.data;
    },

    // Dashboard Stats
    getStats: async (): Promise<AdminStats> => {
        const response = await api.get("/superadmin/stats");
        return response.data;
    },

    // Plans Management
    getPlans: async (): Promise<AdminPlan[]> => {
        const response = await api.get('/admin/subscription-plans');
        return response.data;
    },

    createPlan: async (plan: Partial<AdminPlan>): Promise<AdminPlan> => {
        const response = await api.post('/admin/subscription-plans', plan);
        return response.data;
    },

    updatePlan: async (planId: string, plan: Partial<AdminPlan>): Promise<AdminPlan> => {
        const response = await api.patch(`/admin/subscription-plans/${planId}`, plan);
        return response.data;
    },

    deletePlan: async (planId: string): Promise<void> => {
        await api.delete(`/admin/subscription-plans/${planId}`);
    },

    // User Subscriptions
    getSubscriptions: async (status?: string, plan?: string): Promise<AdminSubscription[]> => {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (plan) params.append("plan", plan);

        const response = await api.get(`/superadmin/subscriptions?${params.toString()}`);
        return response.data;
    },

    getUserSubscriptions: async (userId: string | number): Promise<AdminSubscription[]> => {
        const response = await api.get(`/admin/users/${userId}/subscriptions`);
        return response.data;
    },

    assignSubscription: async (userId: number, data: { planId: string; startDate: string; endDate?: string; price?: number; autoRenew?: boolean }) => {
        const response = await api.post(`/admin/users/${userId}/subscription`, data);
        return response.data;
    },

    updateSubscription: async (userId: number, data: any) => {
        const response = await api.patch(`/admin/users/${userId}/subscription`, data);
        return response.data;
    },

    cancelSubscription: async (userId: number) => {
        const response = await api.delete(`/admin/users/${userId}/subscription`);
        return response.data;
    },

    extendSubscription: async (userId: number, days: number) => {
        const response = await api.post(`/admin/users/${userId}/subscription/extend`, { days });
        return response.data;
    },

    // Super Admin Monitoring
    getSystemHealth: async (): Promise<any> => {
        // Backend returns business stats (users, clients, integrations) not hardware stats
        const response = await api.get('/superadmin/stats');
        return response.data;
    },

    getActivityLogs: async (page = 1, limit = 20): Promise<any> => {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        const response = await api.get(`/superadmin/activity?${params.toString()}`);
        return response.data;
    },

    getIntegrationHealth: async (): Promise<any> => {
        const response = await api.get('/superadmin/integrations/health');
        return response.data;
    },

    getFailedSyncs: async (): Promise<any> => {
        const response = await api.get('/superadmin/sync-failures');
        return response.data;
    },

    getDatabaseStats: async (): Promise<any> => {
        const response = await api.get('/superadmin/database/stats');
        return response.data;
    },

    getSubscriptionAnalytics: async (): Promise<any> => {
        const response = await api.get('/superadmin/subscriptions/analytics');
        return response.data;
    },

    // System Config
    getSystemConfigs: async () => {
        const response = await api.get('/superadmin/config');
        return response.data;
    },

    updateSystemConfig: async (config: any) => {
        const response = await api.patch('/superadmin/config', config);
        return response.data;
    },

    // Security (MFA)
    setupSuperAdminMFA: async () => {
        const response = await api.get('/superadmin/mfa/setup');
        return response.data;
    },

    verifySuperAdminMFA: async (token: string) => {
        const response = await api.post('/superadmin/mfa/verify', { token });
        return response.data;
    },

    disableSuperAdminMFA: async () => {
        const response = await api.post('/superadmin/mfa/disable');
        return response.data;
    },
};

// Impersonation Helper Functions
export const stopImpersonating = () => {
    const TOKEN_KEY = 'ANALYTICS_TOKEN_KEY_';

    console.log('Attempting to stop impersonation...');
    console.log('localStorage contents:', {
        originalToken: localStorage.getItem('originalToken'),
        currentToken: localStorage.getItem(TOKEN_KEY),
        impersonationToken: localStorage.getItem('impersonationToken')
    });

    const originalToken = localStorage.getItem('originalToken');

    if (!originalToken) {
        throw new Error('No impersonation session found');
    }

    // Restore the original admin token
    localStorage.setItem(TOKEN_KEY, originalToken);

    // Clear the stored original token
    localStorage.removeItem('originalToken');
    localStorage.removeItem('impersonationToken');

    return { success: true };
};

export const isImpersonating = (): boolean => {
    const TOKEN_KEY = 'ANALYTICS_TOKEN_KEY_';
    const originalToken = localStorage.getItem('originalToken');
    const currentToken = localStorage.getItem(TOKEN_KEY);
    const impersonationToken = localStorage.getItem('impersonationToken');

    // Only return true if we have an originalToken AND the current token matches the impersonation token
    return !!originalToken && !!impersonationToken && currentToken === impersonationToken;
};

export const getImpersonatedUserInfo = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            userId: payload.userId,
            role: payload.role,
            isImpersonation: payload.isImpersonation
        };
    } catch {
        return null;
    }
};
