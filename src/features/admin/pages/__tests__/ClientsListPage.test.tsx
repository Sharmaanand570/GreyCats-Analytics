import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClientsListPage from '../ClientsListPage';
import { adminApi } from '@/api/adminApi';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@/api/adminApi', () => ({
    adminApi: {
        getClients: vi.fn(),
    }
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    }
}));

describe('ClientListPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders client list', async () => {
        const mockClients = [
            {
                id: 1,
                name: 'ACME Corp',
                status: 'ACTIVE',
                ownerName: 'John Owner',
                integrationsCount: 5,
                usersCount: 10,
                createdAt: '2023-01-01'
            }
        ];

        (adminApi.getClients as any).mockResolvedValue({
            clients: mockClients,
            total: 1,
            amount: 1,
            totalPages: 1
        });

        render(
            <MemoryRouter>
                <ClientsListPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('ACME Corp')).toBeInTheDocument();
            expect(screen.getByText('John Owner')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument(); // Integration count
        });
    });

    it('handles empty list', async () => {
        (adminApi.getClients as any).mockResolvedValue({
            clients: [],
            total: 0,
            page: 1,
            totalPages: 0
        });

        render(
            <MemoryRouter>
                <ClientsListPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('No clients found.')).toBeInTheDocument();
        });
    });
});
