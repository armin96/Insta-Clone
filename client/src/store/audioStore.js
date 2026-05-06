import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAudioStore = create(
    persist(
        (set) => ({
            isMuted: true,
            toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
            setMuted: (muted) => set({ isMuted: muted }),
        }),
        {
            name: 'audio-storage',
        }
    )
);
