import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionLabel, Button, Input, Select, Badge, Drawer } from '../../components/ui';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useCatalogStore, categoryColor, categoryName } from '../../store/catalogStore';
import { useDebounce } from '../../hooks/useDebounce';
import { toast } from '../../components/ui/Toast';
import type { Product } from '../../data/seed';

const blank: Product = {
  id: '',
  name: '',
  price: 0,
  categoryId: 'c-coffee',
  taxRate: 5,
  uom: 'pc',
  available: true,
};

export function ProductsPage() {
  const { products, categories, saveProduct, deleteProduct } = useCatalogStore();
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const debounced = useDebounce(query);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<Product>(blank);
  const [editing, setEditing] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (filterCat === 'all' || p.categoryId === filterCat) &&
          p.name.toLowerCase().includes(debounced.toLowerCase())
      ),
    [products, debounced, filterCat]
  );

  const openNew = () => {
    setDraft({ ...blank, id: `p-${Date.now()}` });
    setEditing(false);
    setDrawerOpen(true);
  };
  const openEdit = (p: Product) => {
    setDraft(p);
    setEditing(true);
    setDrawerOpen(true);
  };
  const save = () => {
    if (!draft.name.trim() || draft.price <= 0) {
      toast.error('Name and price are required.');
      return;
    }
    saveProduct(draft);
    toast.success(editing ? 'Product updated.' : 'Product created.');
    setDrawerOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Products"
        accentWord="Products"
        subtitle="Menu catalogue"
        actions={
          <Button onClick={openNew} size="md">
            <Plus size={14} /> New product
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-2">
        <div className="flex-1">
          <Input
            label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name"
          />
        </div>
        <div className="sm:w-56">
          <Select label="Category" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <SectionLabel>{filtered.length} items</SectionLabel>

      {filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Adjust filters or add a new product to the menu."
          action={<Button onClick={openNew} size="md"><Plus size={14} /> New product</Button>}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[14px] tracking-[0.2em] uppercase font-extralight text-text-muted border-b border-border">
                  <th className="py-3 pr-4 font-extralight">Name</th>
                  <th className="py-3 pr-4 font-extralight">Category</th>
                  <th className="py-3 pr-4 font-extralight">Price</th>
                  <th className="py-3 pr-4 font-extralight">Tax</th>
                  <th className="py-3 pr-4 font-extralight">UoM</th>
                  <th className="py-3 pr-4 font-extralight text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="py-4 pr-4 text-[18px] font-light text-text">{p.name}</td>
                    <td className="py-4 pr-4">
                      <Badge color={categoryColor(categories, p.categoryId)}>
                        {categoryName(categories, p.categoryId)}
                      </Badge>
                    </td>
                    <td className="py-4 pr-4 font-display text-[19px] text-text">₹{p.price}</td>
                    <td className="py-4 pr-4 text-[17px] font-light text-text-muted">{p.taxRate}%</td>
                    <td className="py-4 pr-4 text-[17px] font-light text-text-muted uppercase">{p.uom}</td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-2 text-text-muted hover:text-gold min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setConfirmId(p.id)} className="p-2 text-text-muted hover:text-cancel min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col">
            {filtered.map((p) => (
              <div key={p.id} className="border-b border-border py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[17px] font-light text-text">{p.name}</div>
                    <div className="mt-1">
                      <Badge color={categoryColor(categories, p.categoryId)}>
                        {categoryName(categories, p.categoryId)}
                      </Badge>
                    </div>
                    <div className="mt-1 text-[16px] font-light text-text-faint">{p.taxRate}% tax · {p.uom}</div>
                  </div>
                  <div className="font-display text-[20px] text-text">₹{p.price}</div>
                </div>
                <div className="flex items-center justify-end gap-1 mt-3">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil size={13} /> Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmId(p.id)}><Trash2 size={13} /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Edit product' : 'New product'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={save}>{editing ? 'Save changes' : 'Create product'}</Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Flat White" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (₹)" type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
            <Input label="Tax %" type="number" value={draft.taxRate} onChange={(e) => setDraft({ ...draft, taxRate: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={draft.categoryId} onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            <Select label="Unit" value={draft.uom} onChange={(e) => setDraft({ ...draft, uom: e.target.value as Product['uom'] })}>
              <option value="pc">Piece</option>
              <option value="g">Gram</option>
              <option value="ml">Millilitre</option>
            </Select>
          </div>
          <label className="flex items-center gap-3 text-[17px] font-light text-text">
            <input type="checkbox" checked={draft.available} onChange={(e) => setDraft({ ...draft, available: e.target.checked })} className="accent-[#00754A]" />
            Available for sale
          </label>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) {
            deleteProduct(confirmId);
            toast.info('Product removed.');
          }
        }}
        title="Delete product"
        message="This will remove the product from the menu. This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
