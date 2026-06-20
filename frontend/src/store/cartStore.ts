import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  categoryColor?: string;
  notes?: string;
}

interface CartState {
  tableId: string | null;
  tableLabel: string | null;
  customer: { id: string; name: string } | null;
  coupon: { code: string; type: 'percent' | 'flat'; value: number } | null;
  items: CartItem[];
  setTable: (id: string, label: string) => void;
  setCustomer: (c: { id: string; name: string } | null) => void;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  applyCoupon: (c: CartState['coupon']) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  tableId: null,
  tableLabel: null,
  customer: null,
  coupon: null,
  items: [],
  setTable: (tableId, tableLabel) => set({ tableId, tableLabel }),
  setCustomer: (customer) => set({ customer }),
  addItem: (item) =>
    set((s) => {
      const existing = s.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: s.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { items: [...s.items, { ...item, qty: 1 }] };
    }),
  updateQty: (id, qty) =>
    set((s) => ({
      items:
        qty <= 0
          ? s.items.filter((i) => i.id !== id)
          : s.items.map((i) => (i.id === id ? { ...i, qty } : i)),
    })),
  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  applyCoupon: (coupon) => set({ coupon }),
  clearCart: () =>
    set({ items: [], customer: null, coupon: null }),
}));

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function cartTotals(items: CartItem[], coupon: CartState['coupon']) {
  const subtotal = cartSubtotal(items);
  let discount = 0;
  if (coupon) {
    discount =
      coupon.type === 'percent'
        ? Math.round((subtotal * coupon.value) / 100)
        : Math.min(coupon.value, subtotal);
  }
  const taxable = subtotal - discount;
  const gst = Math.round(taxable * 0.05);
  const total = taxable + gst;
  return { subtotal, discount, gst, total };
}
