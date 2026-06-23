import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DateRange, CampaignStatus } from "../types/googleAds.types";

// ── Date helpers ────────────────────────────────────────────────────────────

function toIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export type DatePreset =
  | "TODAY"
  | "YESTERDAY"
  | "LAST_7_DAYS"
  | "LAST_14_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "CUSTOM";

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  LAST_7_DAYS: "Last 7 days",
  LAST_14_DAYS: "Last 14 days",
  LAST_30_DAYS: "Last 30 days",
  THIS_MONTH: "This month",
  LAST_MONTH: "Last month",
  CUSTOM: "Custom",
};

export function getPresetRange(preset: DatePreset): DateRange {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  switch (preset) {
    case "TODAY":
      return { startDate: toIso(now), endDate: toIso(now) };
    case "YESTERDAY": {
      const y = daysAgo(1);
      return { startDate: toIso(y), endDate: toIso(y) };
    }
    case "LAST_7_DAYS":
      return { startDate: toIso(daysAgo(6)), endDate: toIso(now) };
    case "LAST_14_DAYS":
      return { startDate: toIso(daysAgo(13)), endDate: toIso(now) };
    case "LAST_30_DAYS":
      return { startDate: toIso(daysAgo(29)), endDate: toIso(now) };
    case "THIS_MONTH":
      return { startDate: toIso(firstOfMonth), endDate: toIso(now) };
    case "LAST_MONTH":
      return { startDate: toIso(lastMonth), endDate: toIso(lastMonthEnd) };
    case "CUSTOM":
      return { startDate: toIso(daysAgo(29)), endDate: toIso(now) };
  }
}

// ── Campaign table filter state ─────────────────────────────────────────────

export interface CampaignTableFilters {
  search: string;
  status: CampaignStatus | "ALL";
  campaignType: string; // "ALL" or specific type
}

// ── Store ───────────────────────────────────────────────────────────────────

interface GoogleAdsState {
  // Date range
  datePreset: DatePreset;
  dateRange: DateRange;
  setDatePreset: (preset: DatePreset) => void;
  setCustomDateRange: (range: DateRange) => void;

  // Selected account (customerId)
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;

  // Campaign table filters
  campaignFilters: CampaignTableFilters;
  setCampaignFilter: <K extends keyof CampaignTableFilters>(
    key: K,
    value: CampaignTableFilters[K]
  ) => void;
  resetCampaignFilters: () => void;

  // Selected campaign rows (bulk actions)
  selectedCampaignIds: Set<string>;
  toggleCampaignSelection: (id: string) => void;
  selectAllCampaigns: (ids: string[]) => void;
  clearCampaignSelection: () => void;

  // Active campaign for detail view
  activeCampaignId: string | null;
  setActiveCampaignId: (id: string | null) => void;
}

const DEFAULT_FILTERS: CampaignTableFilters = {
  search: "",
  status: "ALL",
  campaignType: "ALL",
};

export const useGoogleAdsStore = create<GoogleAdsState>()(
  persist(
    (set) => ({
      // Date range — default: last 30 days
      datePreset: "LAST_30_DAYS",
      dateRange: getPresetRange("LAST_30_DAYS"),
      setDatePreset: (preset) =>
        set({ datePreset: preset, dateRange: getPresetRange(preset) }),
      setCustomDateRange: (range) =>
        set({ datePreset: "CUSTOM", dateRange: range }),

      // Selected account
      selectedCustomerId: null,
      setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),

      // Campaign filters
      campaignFilters: DEFAULT_FILTERS,
      setCampaignFilter: (key, value) =>
        set((s) => ({
          campaignFilters: { ...s.campaignFilters, [key]: value },
        })),
      resetCampaignFilters: () => set({ campaignFilters: DEFAULT_FILTERS }),

      // Bulk selection
      selectedCampaignIds: new Set(),
      toggleCampaignSelection: (id) =>
        set((s) => {
          const next = new Set(s.selectedCampaignIds);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return { selectedCampaignIds: next };
        }),
      selectAllCampaigns: (ids) =>
        set({ selectedCampaignIds: new Set(ids) }),
      clearCampaignSelection: () =>
        set({ selectedCampaignIds: new Set() }),

      // Active campaign
      activeCampaignId: null,
      setActiveCampaignId: (id) => set({ activeCampaignId: id }),
    }),
    {
      name: "google-ads-store",
      storage: createJSONStorage(() => sessionStorage),
      // Don't persist transient selection state
      partialize: (s) => ({
        datePreset: s.datePreset,
        dateRange: s.dateRange,
        selectedCustomerId: s.selectedCustomerId,
      }),
    }
  )
);
