import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionLabel, Button, Input, Modal } from '../../components/ui';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useCatalogStore } from '../../store/catalogStore';
import { toast } from '../../components/ui/Toast';
import { CATEGORY_PALETTE, type Category } from '../../data/seed';

export function CategoriesPage() {
  const { categories, products, saveCategory, deleteCategory } = useCatalogStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<Category>({ id: '', name: '', color: CATEGORY_PALETTE[0] });
  const [editing, setEditing] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const openNew = () => {
    setDraft({
      id: `c-${Date.now()}`,
      name: '',
      color: CATEGORY_PALETTE[categories.length % CATEGORY_PALETTE.length],
    });
    setEditing(false);
    setModalOpen(true);
  };
  const openEdit = (c: Category) => {
    setDraft(c);
    setEditing(true);
    setModalOpen(true);
  };
  const save = () => {
    if (!draft.name.trim()) {
      toast.error('Category name is required.');
      return;
    }
    saveCategory(draft);
    toast.success(editing ? 'Category updated.' : 'Category created.');
    setModalOpen(false);
  };
  const count = (id: string) => products.filter((p) => p.categoryId === id).length;

  return (
    <div>
      <PageHeader
        title="Categories"
        accentWord="Categories"
        subtitle="Menu groupings"
        actions={<Button onClick={openNew} size="md"><Plus size={14} /> New category</Button>}
      />
      <SectionLabel>{categories.length} categories</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {categories.map((c) => (
          <div key={c.id} className="border border-border p-4" style={{ background: 'var(--surface)' }}>
            <div className="h-10 w-full mb-3" style={{ background: c.color }} />
            <div className="text-[18px] font-light text-text">{c.name}</div>
            <div className="text-[15px] tracking-[0.15em] uppercase font-extralight text-text-faint mt-1">
              {count(c.id)} products · {c.color}
            </div>
            <div className="flex items-center gap-1 mt-3">
              <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil size={13} /></Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmId(c.id)}><Trash2 size={13} /></Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit category' : 'New category'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={save}>{editing ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Coffee" />
          <div>
            <label className="block mb-2 text-[14px] font-semibold text-text-muted">Colour</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORY_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use ${color}`}
                  onClick={() => setDraft({ ...draft, color })}
                  className="w-10 h-10 rounded-full border-2 transition-transform"
                  style={{
                    background: color,
                    borderColor: draft.color === color ? 'var(--text)' : 'transparent',
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} className="w-12 h-10 border border-border cursor-pointer" />
              <span className="text-[17px] font-light text-text-muted">{draft.color}</span>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) {
            deleteCategory(confirmId);
            toast.info('Category removed.');
          }
        }}
        title="Delete category"
        message="Products in this category will become uncategorised."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
