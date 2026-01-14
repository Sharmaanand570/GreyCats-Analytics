import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from '../AdminDashboard';
import { adminApi } from '@/api/adminApi';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@/api/adminApi', () => ({
    adminApi: {
        getStats: vi.fn(),
        getActivityLogs: vi.fn(),
    }
}));

vi.mock('@/utils/useUserStore', () => ({
    useUserStore: () => ({ user: { fullName: 'Test Admin' } })
}));

describe('AdminDashboard', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('sanity check', () => {
        expect(true).toBe(true);
    });

    it('renders dashboard with stats', async () => {
        // Mock API response
        (adminApi.getStats as any).mockResolvedValue({
            totalUsers: 100,
            userGrowth: 10,
            totalClients: 50,
            clientGrowth: 5,
            activeSubscriptions: 20,
            mrr: 50000
        });
        (adminApi.getActivityLogs as any).mockResolvedValue({ logs: [] });

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        // Check for skeleton initially (optional, might happen too fast)

        // Wait for stats to load
        await waitFor(() => {
            expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
            expect(screen.getByText('$50000')).toBeInTheDocument();
            expect(screen.getByText('Total Users')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();
        });
    });

    it('handles API errors gracefully', async () => {
        const error = new Error('Failed to fetch');
        (adminApi.getStats as any).mockRejectedValue(error);
        (adminApi.getActivityLogs as any).mockResolvedValue({ logs: [] });

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        // Should not crash, maybe show error toast (implicit check by not crashing)
        // Ideally checking for toast, but toast is usually external.
        // We can just verify it renders the layout even if empty/loading.
        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });
    });
});
