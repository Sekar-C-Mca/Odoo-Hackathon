import { create } from 'zustand';

export type KDSStage = 'to_cook' | 'preparing' | 'completed';

export interface KDSItem {
  id: string;
  name: string;
  qty: number;
  done: boolean;
}

export interface KDSTicket {
  id: string;
  orderNum: string;
  tableLabel: string;
  stage: KDSStage;
  items: KDSItem[];
  createdAt: number;
}

interface KDSState {
  tickets: KDSTicket[];
  addTicket: (t: Omit<KDSTicket, 'createdAt' | 'stage'>) => void;
  advanceStage: (id: string) => void;
  markItemDone: (ticketId: string, itemId: string) => void;
  reset: () => void;
}

export const useKDSStore = create<KDSState>((set) => ({
  tickets: [],
  addTicket: (t) =>
    set((s) => ({
      tickets: [
        ...s.tickets,
        { ...t, stage: 'to_cook', createdAt: Date.now() },
      ],
    })),
  advanceStage: (id) =>
    set((s) => ({
      tickets: s.tickets.map((t) => {
        if (t.id !== id) return t;
        const next: KDSStage =
          t.stage === 'to_cook'
            ? 'preparing'
            : t.stage === 'preparing'
            ? 'completed'
            : 'to_cook';
        return { ...t, stage: next };
      }),
    })),
  markItemDone: (ticketId, itemId) =>
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              items: t.items.map((i) =>
                i.id === itemId ? { ...i, done: !i.done } : i
              ),
            }
          : t
      ),
    })),
  reset: () => set({ tickets: [] }),
}));
