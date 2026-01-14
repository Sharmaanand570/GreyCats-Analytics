import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserDetailsPage from '../UserDetailsPage';
import { adminApi } from '@/api/adminApi';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock API
vi.mock('@/api/adminApi', () => ({
    adminApi: {
        getUserDetails: vi.fn(),
        getClients: vi.fn(),
        getUserSubscriptions: vi.fn(),
        impersonateUser: vi.fn(),
        updateUserStatus: vi.fn(),
    }
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    }
}));

describe('UserDetailsPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders user details and related data', async () => {
        const mockUser = {
            id: 1,
            fullName: 'Test User',
            email: 'test@example.com',
            role: 'USER',
            status: 'ACTIVE',
            clientsCount: 1,
            createdAt: '2023-01-01T00:00:00Z'
        };

        const mockClients = [{
            id: 101,
            name: 'Client A',
            status: 'ACTIVE',
            integrationsCount: 2
        }];

        const mockSubs = [{
            id: 'sub_123',
            planName: 'Pro Plan',
            status: 'active',
            currentPeriodEnd: '2024-01-01T00:00:00Z'
        }];

        (adminApi.getUserDetails as any).mockResolvedValue(mockUser);
        (adminApi.getClients as any).mockResolvedValue({ clients: mockClients });
        (adminApi.getUserSubscriptions as any).mockResolvedValue(mockSubs);

        render(
            <MemoryRouter initialEntries={['/admin/users/1']}>
                <Routes>
                    <Route path="/admin/users/:userId" element={<UserDetailsPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument();
            expect(screen.getByText('test@example.com')).toBeInTheDocument();
            expect(screen.getByText('Client A')).toBeInTheDocument(); // Client tab is default
        });

        // Click on Subscriptions tab to see Pro Plan
        fireEvent.click(screen.getByText('Subscriptions'));

        await waitFor(() => {
            expect(screen.getByText('Pro Plan')).toBeInTheDocument();
        });
    });

    it('shows error if user not found', async () => {
        // user not found scenario, usually api throws or returns null
        (adminApi.getUserDetails as any).mockResolvedValue(null);
        (adminApi.getClients as any).mockResolvedValue({ clients: [] });
        (adminApi.getUserSubscriptions as any).mockResolvedValue([]);

        render(
            <MemoryRouter initialEntries={['/admin/users/999']}>
                <Routes>
                    <Route path="/admin/users/:userId" element={<UserDetailsPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('User not found')).toBeInTheDocument();
        });
    });
});
