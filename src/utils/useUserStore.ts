import { create } from "zustand";
import type { UserProfile } from "@/types/user.types";
import { userApi } from "@/api/userApi";

type UserState = {
  user: UserProfile | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  fetchProfile: () => Promise<void>;
  logout: () => void;
  pageNotFound: boolean;
  setPageNotFound: (pageNotFound: boolean) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await userApi.getProfile();
      if (response.success && response.data) {
        set({ user: response.data });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => set({ user: null }),
  pageNotFound: false,
  setPageNotFound: (pageNotFound) => set({ pageNotFound }),
}));
