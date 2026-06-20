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
  saveProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  saveCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  saveEmployee: (e: Employee) => void;
  deleteEmployee: (id: string) => void;
  saveCoupon: (c: Coupon) => void;
  deleteCoupon: (id: string) => void;
  saveTable: (t: FloorTable) => void;
  deleteTable: (id: string) => void;
  addFloor: (name: string) => void;
  togglePaymentMethod: (id: string) => void;
  addOrder: (o: Order) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  saveCustomer: (c: Customer) => void;
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
      saveProduct: (p) =>
        set((s) => ({
          products: s.products.some((x) => x.id === p.id)
            ? s.products.map((x) => (x.id === p.id ? p : x))
            : [...s.products, p],
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
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
      saveCustomer: (c) =>
        set((s) => ({
          customers: s.customers.some((x) => x.id === c.id)
            ? s.customers.map((x) => (x.id === c.id ? c : x))
            : [...s.customers, c],
        })),
    }),
    {
      name: 'cafe-etoile-catalog',
      version: 3,
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
