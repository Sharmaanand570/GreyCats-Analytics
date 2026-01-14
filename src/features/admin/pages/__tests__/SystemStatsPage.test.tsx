import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SystemStatsPage from '../SystemStatsPage';
import { adminApi } from '@/api/adminApi';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/api/adminApi', () => ({
    adminApi: {
        getSystemHealth: vi.fn(),
    }
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    }
}));

describe('SystemStatsPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders system stats', async () => {
        const mockHealth = {
            cpu: { usage: 45, cores: 4 },
            memory: { used: 1024, total: 4096 },
            api: { latency: 120 },
            uptime: '24h',
            services: {
                database: 'operational',
                redis: 'operational'
            }
        };

        (adminApi.getSystemHealth as any).mockResolvedValue(mockHealth);

        render(
            <MemoryRouter>
                <SystemStatsPage />
            </MemoryRouter>
        );

        // Advance timers to trigger poll if needed, or wait for useEffect
        await waitFor(() => {
            expect(screen.getByText('45%')).toBeInTheDocument(); // CPU
            expect(screen.getByText('1024 MB')).toBeInTheDocument(); // Memory
            expect(screen.getByText('120ms')).toBeInTheDocument(); // Latency
            expect(screen.getByText('24h')).toBeInTheDocument(); // Uptime
            expect(screen.getByText('database')).toBeInTheDocument();
        });
    });

    it('handles api failures', async () => {
        (adminApi.getSystemHealth as any).mockRejectedValue(new Error('Failed'));

        render(
            <MemoryRouter>
                <SystemStatsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            // In case of error, the explicit content might still be skeleton or nothing specific, 
            // but we can check calls or toast (if we mocked it properly to spy)
            expect(adminApi.getSystemHealth).toHaveBeenCalled();
        });
    });

    it('polls for updates', async () => {
        const mockHealth = {
            cpu: { usage: 10, cores: 4 },
            memory: { used: 100, total: 4000 },
            api: { latency: 50 },
            uptime: '1h',
            services: {}
        };
        (adminApi.getSystemHealth as any).mockResolvedValue(mockHealth);

        render(
            <MemoryRouter>
                <SystemStatsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('10%')).toBeInTheDocument();
        });

        // Fast forward 30s + a bit more to ensure interval fires
        await act(async () => {
            vi.advanceTimersByTime(31000);
        });

        await waitFor(() => {
            expect(adminApi.getSystemHealth).toHaveBeenCalledTimes(2);
        });
    });
});
