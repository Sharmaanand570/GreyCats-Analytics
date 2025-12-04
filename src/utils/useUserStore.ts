import { create } from "zustand";

type User = {
  id: string;
  name: string;
};

type UserState = {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  pageNotFound: boolean;
  setPageNotFound: (pageNotFound: boolean) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  logout: () => set({ user: null }),
  pageNotFound: false,
  setPageNotFound: (pageNotFound) => set({ pageNotFound }),
}));
