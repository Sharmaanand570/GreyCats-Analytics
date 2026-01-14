import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UsersListPage from '../UsersListPage';
import { adminApi } from '@/api/adminApi';
import { MemoryRouter } from 'react-router-dom';

// Explicit mocks
vi.mock('@/api/adminApi', () => ({
    adminApi: {
        getUsers: vi.fn(),
        impersonateUser: vi.fn(),
    }
}));

// Mock Toaster prevents errors
vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    }
}));

describe('UsersListPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders users list successfully', async () => {
        const mockUsers = [
            {
                id: 1,
                fullName: 'John Doe',
                email: 'john@example.com',
                role: 'USER',
                status: 'ACTIVE',
                clientsCount: 2,
                createdAt: '2023-01-01T00:00:00Z'
            },
            {
                id: 2,
                fullName: 'Jane Admin',
                email: 'jane@example.com',
                role: 'ADMIN',
                status: 'ACTIVE',
                clientsCount: 0,
                createdAt: '2023-02-01T00:00:00Z'
            }
        ];

        (adminApi.getUsers as any).mockResolvedValue({
            users: mockUsers,
            total: 2,
            page: 1,
            limit: 20,
            totalPages: 1
        });

        render(
            <MemoryRouter>
                <UsersListPage />
            </MemoryRouter>
        );

        // Check loading state implicit (skeletons usually present)

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
            expect(screen.getByText('Jane Admin')).toBeInTheDocument();
        });

        expect(screen.getByText('USER')).toBeInTheDocument();
        expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });

    it('handles search input', async () => {
        (adminApi.getUsers as any).mockResolvedValue({
            users: [],
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 1
        });

        render(
            <MemoryRouter>
                <UsersListPage />
            </MemoryRouter>
        );

        const searchInput = screen.getByPlaceholderText('Search users...');
        fireEvent.change(searchInput, { target: { value: 'test' } });

        // Wait for debounce (500ms in component)
        await waitFor(() => {
            expect(adminApi.getUsers).toHaveBeenCalledWith(1, 20, 'test');
        }, { timeout: 1000 });
    });

    it('displays empty state when no users found', async () => {
        (adminApi.getUsers as any).mockResolvedValue({
            users: [],
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0
        });

        render(
            <MemoryRouter>
                <UsersListPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('No users found.')).toBeInTheDocument();
        });
    });
});
