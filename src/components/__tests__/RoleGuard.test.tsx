import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RoleGuard from '../../components/RoleGuard';
import { useUserStore } from '@/utils/useUserStore';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock the store
vi.mock('@/utils/useUserStore');

const ProtectedComponent = () => <div>Protected Content</div>;
const PublicComponent = () => <div>Public Content</div>;
const LoginComponent = () => <div>Login Page</div>;

describe('RoleGuard', () => {
    it('redirects to login if no user', () => {
        // @ts-ignore
        useUserStore.mockReturnValue({ user: null, isLoading: false, fetchProfile: vi.fn() });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/auth/login" element={<LoginComponent />} />
                    <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                        <Route path="/protected" element={<ProtectedComponent />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('renders content if user has allowed role', () => {
        // @ts-ignore
        useUserStore.mockReturnValue({
            user: { id: 1, role: 'ADMIN', email: 'admin@example.com' },
            isLoading: false,
            fetchProfile: vi.fn()
        });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                        <Route path="/protected" element={<ProtectedComponent />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects to home if user has wrong role', () => {
        // @ts-ignore
        useUserStore.mockReturnValue({
            user: { id: 2, role: 'USER', email: 'user@example.com' },
            isLoading: false,
            fetchProfile: vi.fn()
        });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/" element={<PublicComponent />} />
                    <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                        <Route path="/protected" element={<ProtectedComponent />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Public Content')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
});
