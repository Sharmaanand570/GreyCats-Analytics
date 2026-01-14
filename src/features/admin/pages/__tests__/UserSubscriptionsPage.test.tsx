import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserSubscriptionsPage from '../UserSubscriptionsPage';
import { adminApi } from '@/api/adminApi';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/api/adminApi', () => ({
    adminApi: {
        getSubscriptions: vi.fn(),
    }
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    }
}));

describe('UserSubscriptionsPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders subscriptions list', async () => {
        const mockSubs = [
            {
                id: 'sub_1',
                userId: 101,
                userEmail: 'user@example.com',
                planName: 'Pro Plan',
                status: 'active',
                currentPeriodEnd: '2025-01-01T00:00:00Z',
                cancelAtPeriodEnd: false
            }
        ];

        (adminApi.getSubscriptions as any).mockResolvedValue(mockSubs);

        render(
            <MemoryRouter>
                <UserSubscriptionsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('user@example.com')).toBeInTheDocument();
            expect(screen.getByText('Pro Plan')).toBeInTheDocument();
            expect(screen.getByText('Active')).toBeInTheDocument();
        });
    });

    it('renders empty state', async () => {
        (adminApi.getSubscriptions as any).mockResolvedValue([]);

        render(
            <MemoryRouter>
                <UserSubscriptionsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('No subscriptions found.')).toBeInTheDocument();
        });
    });
});
