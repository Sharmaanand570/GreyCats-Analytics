import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PostPlatform, PostType } from '@/features/social-media/api/types';

/* ── Draft (in-progress post being created/edited) ── */
export interface DraftPost {
  date: Date;
  time: string; // "HH:mm"
  platform: PostPlatform | '';
  /** Multi-platform selection (used in create mode). Drives the new platforms[] payload. */
  selectedPlatforms: string[];
  postType: PostType;
  message: string;
  firstComment: string;
  mediaFiles: File[];
  aspectRatio: string;
  metaAccountId: number | null;
  clientId: number | null;
}

const DEFAULT_DRAFT: DraftPost = {
  date: new Date(),
  time: '10:00',
  platform: '',
  selectedPlatforms: [],
  postType: 'FEED',
  message: '',
  firstComment: '',
  mediaFiles: [],
  aspectRatio: '1:1',
  metaAccountId: null,
  clientId: null,
};

/* ── Store ── */
interface SocialMediaState {
  // Draft
  draftPost: DraftPost;
  updateDraft: (draft: Partial<DraftPost>) => void;
  resetDraft: () => void;

  // Step tracking (Specific to the scheduler onboarding flow)
  currentStep: 'select-client' | 'connect-platforms' | 'workspace';
  setCurrentStep: (step: 'select-client' | 'connect-platforms' | 'workspace') => void;
}

/**
 * useSocialMediaStore
 * Primarily handles UI-only session state like the current onboarding step 
 * and the post creation draft. Domain data (Clients, Posts) is handled via React Query.
 */
export const useSocialMediaStore = create<SocialMediaState>()(
  persist(
    (set) => ({
      // ── Draft ──
      draftPost: { ...DEFAULT_DRAFT },
      updateDraft: (draft) =>
        set((state) => ({
          draftPost: { ...state.draftPost, ...draft },
        })),
      resetDraft: () =>
        set({
          draftPost: { ...DEFAULT_DRAFT, date: new Date() },
        }),

      // ── Steps ──
      currentStep: 'select-client',
      setCurrentStep: (step) => set({ currentStep: step }),
    }),
    {
      name: 'social-media-scheduler-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        draftPost: {
          ...state.draftPost,
          mediaFiles: [], // Don't persist File objects (invalid after refresh)
        },
        currentStep: state.currentStep,
      }),
      // Merge persisted (potentially old) state with current defaults so new
      // fields like selectedPlatforms are never undefined after a page reload.
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        draftPost: {
          ...DEFAULT_DRAFT,
          ...(persisted as any)?.draftPost,
          mediaFiles: [], // always reset files
        },
      }),
    }
  )
);
