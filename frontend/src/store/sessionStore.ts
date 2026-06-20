import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  sessionId: string | null;
  isOpen: boolean;
  openedAt: string | null;
  openSession: () => void;
  closeSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessionId: null,
      isOpen: false,
      openedAt: null,
      openSession: () =>
        set({
          sessionId: `S-${Date.now().toString().slice(-6)}`,
          isOpen: true,
          openedAt: new Date().toISOString(),
        }),
      closeSession: () =>
        set({ sessionId: null, isOpen: false, openedAt: null }),
    }),
    { name: 'cafe-etoile-session' }
  )
);
