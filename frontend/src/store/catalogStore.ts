import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CATEGORY_PALETTE,
  categoriesSeed,
  couponsSeed,
  customersSeed,
  employeesSeed,
  floorsSeed,
  ordersSeed,
  paymentMethodsSeed,
  productsSeed,
  tablesSeed,
  type Category,
  type Coupon,
  type Customer,
  type Employee,
  type Floor,
  type FloorTable,
  type Order,
  type PaymentMethod,
  type Product,
} from '../data/seed';

interface CatalogState {
  products: Product[];
  categories: Category[];
  tables: FloorTable[];
  floors: Floor[];
  employees: Employee[];
  coupons: Coupon[];
  paymentMethods: PaymentMethod[];
  orders: Order[];
  customers: Customer[];
  selfOrderEnabled: boolean;
  selfOrderMode: 'online' | 'qr_menu';
  selfOrderBgColor: string;
  selfOrderImages: string[];
  setSelfOrderEnabled: (v: boolean) => void;
  setSelfOrderMode: (v: 'online' | 'qr_menu') => void;
  setSelfOrderBgColor: (v: string) => void;
  setSelfOrderImages: (v: string[]) => void;
  saveProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  deleteProducts: (ids: string[]) => void;
  saveCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (cats: Category[]) => void;
  saveEmployee: (e: Employee) => void;
  deleteEmployee: (id: string) => void;
  deleteEmployees: (ids: string[]) => void;
  archiveEmployee: (id: string) => void;
  archiveEmployees: (ids: string[]) => void;
  changeEmployeePin: (id: string, pin: string) => void;
  saveCoupon: (c: Coupon) => void;
  deleteCoupon: (id: string) => void;
  saveTable: (t: FloorTable) => void;
  deleteTable: (id: string) => void;
  addFloor: (name: string) => void;
  savePaymentMethod: (pm: PaymentMethod) => void;
  deletePaymentMethod: (id: string) => void;
  togglePaymentMethod: (id: string) => void;
  addOrder: (o: Order) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  saveCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      products: productsSeed,
      categories: categoriesSeed,
      tables: tablesSeed,
      floors: floorsSeed,
      employees: employeesSeed,
      coupons: couponsSeed,
      paymentMethods: paymentMethodsSeed,
      orders: ordersSeed,
      customers: customersSeed,
      selfOrderEnabled: true,
      selfOrderMode: 'online',
      selfOrderBgColor: '#1E3932',
      selfOrderImages: [],
      setSelfOrderEnabled: (v) => set({ selfOrderEnabled: v }),
      setSelfOrderMode: (v) => set({ selfOrderMode: v }),
      setSelfOrderBgColor: (v) => set({ selfOrderBgColor: v }),
      setSelfOrderImages: (v) => set({ selfOrderImages: v }),
      saveProduct: (p) =>
        set((s) => ({
          products: s.products.some((x) => x.id === p.id)
            ? s.products.map((x) => (x.id === p.id ? p : x))
            : [...s.products, p],
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      deleteProducts: (ids) =>
        set((s) => ({ products: s.products.filter((p) => !ids.includes(p.id)) })),
      saveCategory: (c) =>
        set((s) => ({
          categories: s.categories.some((x) => x.id === c.id)
            ? s.categories.map((x) => (x.id === c.id ? c : x))
            : [...s.categories, c],
        })),
      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),
      reorderCategories: (cats) => set({ categories: cats }),
      saveEmployee: (e) =>
        set((s) => ({
          employees: s.employees.some((x) => x.id === e.id)
            ? s.employees.map((x) => (x.id === e.id ? e : x))
            : [...s.employees, e],
        })),
      deleteEmployee: (id) =>
        set((s) => ({
          employees: s.employees.filter((e) => e.id !== id),
        })),
      deleteEmployees: (ids) =>
        set((s) => ({
          employees: s.employees.filter((e) => !ids.includes(e.id)),
        })),
      archiveEmployee: (id) =>
        set((s) => ({
          employees: s.employees.map((e) =>
            e.id === id ? { ...e, archived: true, active: false } : e
          ),
        })),
      archiveEmployees: (ids) =>
        set((s) => ({
          employees: s.employees.map((e) =>
            ids.includes(e.id) ? { ...e, archived: true, active: false } : e
          ),
        })),
      changeEmployeePin: (id, pin) =>
        set((s) => ({
          employees: s.employees.map((e) =>
            e.id === id ? { ...e, pin } : e
          ),
        })),
      saveCoupon: (c) =>
        set((s) => ({
          coupons: s.coupons.some((x) => x.id === c.id)
            ? s.coupons.map((x) => (x.id === c.id ? c : x))
            : [...s.coupons, c],
        })),
      deleteCoupon: (id) =>
        set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) })),
      saveTable: (t) =>
        set((s) => ({
          tables: s.tables.some((x) => x.id === t.id)
            ? s.tables.map((x) => (x.id === t.id ? t : x))
            : [...s.tables, t],
        })),
      deleteTable: (id) =>
        set((s) => ({ tables: s.tables.filter((t) => t.id !== id) })),
      addFloor: (name) =>
        set((s) => ({
          floors: [...s.floors, { id: `f-${Date.now()}`, name }],
        })),
      savePaymentMethod: (pm) =>
        set((s) => ({
          paymentMethods: s.paymentMethods.some((x) => x.id === pm.id)
            ? s.paymentMethods.map((x) => (x.id === pm.id ? pm : x))
            : [...s.paymentMethods, pm],
        })),
      deletePaymentMethod: (id) =>
        set((s) => ({
          paymentMethods: s.paymentMethods.filter((p) => p.id !== id),
        })),
      togglePaymentMethod: (id) =>
        set((s) => ({
          paymentMethods: s.paymentMethods.map((p) =>
            p.id === id ? { ...p, enabled: !p.enabled } : p
          ),
        })),
      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      updateOrder: (id, patch) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        })),
      deleteOrder: (id) =>
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
      saveCustomer: (c) =>
        set((s) => ({
          customers: s.customers.some((x) => x.id === c.id)
            ? s.customers.map((x) => (x.id === c.id ? c : x))
            : [...s.customers, c],
        })),
      deleteCustomer: (id) =>
        set((s) => ({
          customers: s.customers.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'cafe-etoile-catalog',
      version: 4,
      migrate: (persistedState) => {
        const state = persistedState as Partial<CatalogState>;
        const builtInColors = new Map(
          categoriesSeed.map((category) => [category.id, category.color])
        );

        return {
          ...state,
          categories: (state.categories ?? categoriesSeed).map((category) => ({
            ...category,
            color: builtInColors.get(category.id) ?? category.color,
          })),
          selfOrderEnabled: state.selfOrderEnabled ?? true,
          selfOrderMode: state.selfOrderMode ?? 'online',
          selfOrderBgColor: state.selfOrderBgColor ?? '#1E3932',
          selfOrderImages: state.selfOrderImages ?? [],
        } as CatalogState;
      },
    }
  )
);

export function categoryName(cats: Category[], id: string): string {
  return cats.find((c) => c.id === id)?.name ?? 'Uncategorised';
}
export function categoryColor(cats: Category[], id: string): string {
  return cats.find((c) => c.id === id)?.color ?? CATEGORY_PALETTE[0];
}
