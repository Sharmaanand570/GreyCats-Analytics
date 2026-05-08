import { create } from "zustand";
import { persist } from "zustand/middleware";
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

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      setUser: (user) => set({ user }),

      fetchProfile: async () => {
        set({ isLoading: true });
        try {
          const response = await userApi.getProfile();
          if (response.success && response.data) {
            const currentUser = get().user;
            const newProfile = response.data;
            set({
              user: {
                ...newProfile,
                // Preserve existing role if API returns undefined/null, or fallback to 'USER'
                role: newProfile.role || currentUser?.role || "USER",
              },
            });
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        // Clear all storage
        localStorage.removeItem("user-storage");
        localStorage.removeItem("ANALYTICS_TOKEN_KEY_");

        // Clear any cached data
        localStorage.removeItem("pending_oauth_client_id");
        localStorage.removeItem("pending_oauth_integration");
        localStorage.removeItem("originalToken");
        localStorage.removeItem("impersonationToken");
        // Clear feature-specific persisted stores so a different user
        // logging in on the same browser never sees another user's draft.
        localStorage.removeItem("social-media-scheduler-storage");
        localStorage.removeItem("blog-scheduler-storage");
        localStorage.removeItem("lastClientId");
        localStorage.removeItem("lastBlogClientId");

        // Clear session storage
        sessionStorage.clear();

        // Reset state
        set({ user: null });
      },
      pageNotFound: false,
      setPageNotFound: (pageNotFound) => set({ pageNotFound }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
