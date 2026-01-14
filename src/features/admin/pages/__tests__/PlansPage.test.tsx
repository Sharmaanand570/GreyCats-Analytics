import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlansPage from '../PlansPage';
import { adminApi } from '@/api/adminApi';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/api/adminApi', () => ({
    adminApi: {
        getPlans: vi.fn(),
    }
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    }
}));

describe('PlansPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders plans list', async () => {
        const mockPlans = [
            {
                id: 'plan_1',
                name: 'Basic Plan',
                price: 19.99,
                interval: 'monthly',
                status: 'active',
                features: ['Feature 1', 'Feature 2']
            }
        ];

        (adminApi.getPlans as any).mockResolvedValue(mockPlans);

        render(
            <MemoryRouter>
                <PlansPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Basic Plan')).toBeInTheDocument();
            expect(screen.getByText('$19.99')).toBeInTheDocument();
            expect(screen.getByText('Feature 1')).toBeInTheDocument();
        });
    });

    it('renders empty state', async () => {
        (adminApi.getPlans as any).mockResolvedValue([]);

        render(
            <MemoryRouter>
                <PlansPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('No plans found.')).toBeInTheDocument();
        });
    });
});
