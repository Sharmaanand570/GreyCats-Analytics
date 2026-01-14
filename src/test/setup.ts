import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver
window.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock matchMedia
window.matchMedia = window.matchMedia || function () {
    return {
        matches: false,
        addListener: function () { },
        removeListener: function () { }
    };
};

// Mock ScrollTo
window.scrollTo = vi.fn();
