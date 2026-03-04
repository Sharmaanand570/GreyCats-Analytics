import { create } from "zustand";

interface UpgradeModalState {
  isOpen: boolean;
  reason: string;
  open: (reason?: string) => void;
  close: () => void;
}

/**
 * Global store for the upgrade modal.
 * Triggered by 403 upgradeRequired errors from the Axios interceptor.
 */
export const useUpgradeModalStore = create<UpgradeModalState>((set) => ({
  isOpen: false,
  reason: "",
  open: (reason = "") => set({ isOpen: true, reason }),
  close: () => set({ isOpen: false, reason: "" }),
}));
