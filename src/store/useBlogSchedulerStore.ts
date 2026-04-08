import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BlogTarget } from '@/features/blog/api/types';

export interface BlogDraft {
  date: Date;
  time: string; // "HH:mm"
  title: string;
  content: string; // HTML
  mediaFiles: File[];
  targets: BlogTarget[];
  clientId: number | null;
}

const DEFAULT_DRAFT: BlogDraft = {
  date: new Date(),
  time: '10:00',
  title: '',
  content: '',
  mediaFiles: [],
  targets: [],
  clientId: null,
};

interface BlogSchedulerState {
  draftPost: BlogDraft;
  updateDraft: (draft: Partial<BlogDraft>) => void;
  resetDraft: () => void;
  currentStep: 'select-client' | 'workspace';
  setCurrentStep: (step: 'select-client' | 'workspace') => void;
}

export const useBlogSchedulerStore = create<BlogSchedulerState>()(
  persist(
    (set) => ({
      draftPost: { ...DEFAULT_DRAFT },
      updateDraft: (draft) =>
        set((state) => ({
          draftPost: { ...state.draftPost, ...draft },
        })),
      resetDraft: () =>
        set({ draftPost: { ...DEFAULT_DRAFT, date: new Date() } }),

      currentStep: 'select-client',
      setCurrentStep: (step) => set({ currentStep: step }),
    }),
    {
      name: 'blog-scheduler-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        draftPost: {
          ...state.draftPost,
          mediaFiles: [],
        },
        currentStep: state.currentStep,
      }),
    }
  )
);
