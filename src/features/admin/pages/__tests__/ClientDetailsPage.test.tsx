import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClientDetailsPage from '../ClientDetailsPage';
import { adminApi } from '@/api/adminApi';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('@/api/adminApi', () => ({
    adminApi: {
        getClientDetails: vi.fn(),
        updateClient: vi.fn(),
    }
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    }
}));

describe('ClientDetailsPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders client details', async () => {
        const mockClient = {
            id: 1,
            name: 'ACME Inc',
            description: 'A test client',
            status: 'ACTIVE',
            ownerId: 10,
            ownerName: 'Alice Owner',
            createdAt: '2023-01-01'
        };

        (adminApi.getClientDetails as any).mockResolvedValue(mockClient);

        render(
            <MemoryRouter initialEntries={['/admin/clients/1']}>
                <Routes>
                    <Route path="/admin/clients/:clientId" element={<ClientDetailsPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('ACME Inc')).toBeInTheDocument();
            expect(screen.getByDisplayValue('A test client')).toBeInTheDocument();
            expect(screen.getByText('Alice Owner')).toBeInTheDocument();
        });
    });
});
