import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DashboardMap, ReportSlideMeta, CustomPage } from "../api/types";
import type { DateRange } from "react-day-picker";

export interface ReportLocalState {
    dashboards: DashboardMap;
    pageOrder: number[];
    customPages: CustomPage[];
    dateRange?: DateRange;
    lastSavedTime: Date | null;
    hasUnsavedChanges: boolean;
    deletedSlideIds: Set<number>;
    slidesMeta?: ReportSlideMeta[];
    processedSlidesMeta?: ReportSlideMeta[];
}

interface ReportStore {
    reports: Record<number, ReportLocalState>;
    activeReportId: number | null;

    // Actions
    initializeReport: (id: number, state: Partial<ReportLocalState>) => void;
    updateReportState: (id: number, updates: Partial<ReportLocalState>) => void;
    clearReport: (id: number) => void;
    getReportState: (id: number) => ReportLocalState | undefined;
}

export const useReportStore = create<ReportStore>()(
    persist(
        (set, get) => ({
            reports: {},
            activeReportId: null,

            initializeReport: (id, state) => set((store) => {
                // If state already exists, DO NOT overwrite it (preserves persistence)
                if (store.reports[id]) {
                    return store;
                }

                return {
                    reports: {
                        ...store.reports,
                        [id]: {
                            dashboards: new Map(),
                            pageOrder: [],
                            customPages: [],
                            lastSavedTime: null,
                            hasUnsavedChanges: false,
                            deletedSlideIds: new Set(),
                            ...state
                        }
                    }
                };
            }),

            updateReportState: (id, updates) => set((store) => ({
                reports: {
                    ...store.reports,
                    [id]: {
                        ...(store.reports[id] || {}),
                        ...updates
                    }
                }
            })),

            clearReport: (id) => set((store) => {
                const newReports = { ...store.reports };
                delete newReports[id];
                return { reports: newReports };
            }),

            getReportState: (id) => get().reports[id]
        }),
        {
            name: 'report-builder-storage',
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    const { state } = JSON.parse(str);

                    // Deserialize Maps, Sets, and Dates
                    if (state.reports) {
                        Object.keys(state.reports).forEach((key) => {
                            const report = state.reports[key];
                            if (report.dashboards && Array.isArray(report.dashboards)) {
                                report.dashboards = new Map(report.dashboards);
                            }
                            if (report.deletedSlideIds && Array.isArray(report.deletedSlideIds)) {
                                report.deletedSlideIds = new Set(report.deletedSlideIds);
                            }
                            if (report.dateRange) {
                                if (report.dateRange.from) {
                                    report.dateRange.from = new Date(report.dateRange.from);
                                }
                                if (report.dateRange.to) {
                                    report.dateRange.to = new Date(report.dateRange.to);
                                }
                            }
                            if (report.lastSavedTime) {
                                report.lastSavedTime = new Date(report.lastSavedTime);
                            }
                        });
                    }

                    return { state };
                },
                setItem: (name, value) => {
                    const { state } = value;

                    // Serialize Maps and Sets
                    const serializable = {
                        ...state,
                        reports: Object.keys(state.reports || {}).reduce((acc, key) => {
                            const report = state.reports[key];
                            acc[key] = {
                                ...report,
                                dashboards: report.dashboards instanceof Map
                                    ? Array.from(report.dashboards.entries())
                                    : report.dashboards,
                                deletedSlideIds: report.deletedSlideIds instanceof Set
                                    ? Array.from(report.deletedSlideIds)
                                    : report.deletedSlideIds
                            };
                            return acc;
                        }, {} as Record<string, any>)
                    };

                    try {
                        localStorage.setItem(name, JSON.stringify({ state: serializable }));
                    } catch (error) {
                        // Handle QuotaExceededError by clearing storage and retrying once
                        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                            console.warn('⚠️ [LocalStorage] Quota exceeded, clearing storage and retrying...');
                            try {
                                localStorage.removeItem(name);
                                localStorage.setItem(name, JSON.stringify({ state: serializable }));
                                console.log('✅ [LocalStorage] Successfully saved after clearing');
                            } catch (retryError) {
                                console.error('❌ [LocalStorage] Failed to save even after clearing:', retryError);
                                // Silently fail - don't crash the app
                            }
                        } else {
                            console.error('❌ [LocalStorage] Unexpected error:', error);
                            // Silently fail - don't crash the app
                        }
                    }
                },
                removeItem: (name) => localStorage.removeItem(name)
            }
        }
    )
);
