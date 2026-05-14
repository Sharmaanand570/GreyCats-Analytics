import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface BroadcastState {
  currentStep: 'select-client' | 'workspace';
  setCurrentStep: (step: 'select-client' | 'workspace') => void;
}

export const useBroadcastStore = create<BroadcastState>()(
  persist(
    (set) => ({
      currentStep: 'select-client',
      setCurrentStep: (step) => set({ currentStep: step }),
    }),
    {
      name: 'broadcast-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
