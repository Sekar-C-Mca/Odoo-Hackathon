import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionLabel, Button, Input, Select, Badge, Drawer } from '../../components/ui';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useCatalogStore } from '../../store/catalogStore';
import { toast } from '../../components/ui/Toast';
import type { Coupon } from '../../data/seed';

const blank: Coupon = { id: '', code: '', type: 'percent', value: 0, active: true, minOrder: 0 };

export function CouponsPage() {
  const { coupons, saveCoupon, deleteCoupon } = useCatalogStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<Coupon>(blank);
  const [editing, setEditing] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const openNew = () => {
    setDraft({ ...blank, id: `cp-${Date.now()}` });
    setEditing(false);
    setDrawerOpen(true);
  };
  const openEdit = (c: Coupon) => {
    setDraft(c);
    setEditing(true);
    setDrawerOpen(true);
  };
  const save = () => {
    if (!draft.code.trim() || draft.value <= 0) {
      toast.error('Code and value are required.');
      return;
    }
    saveCoupon(draft);
    toast.success(editing ? 'Coupon updated.' : 'Coupon created.');
    setDrawerOpen(false);
  };

  const active = coupons.filter((c) => c.active);
  const inactive = coupons.filter((c) => !c.active);

  const Row = ({ c }: { c: Coupon }) => (
    <div className="border-b border-border py-4 flex items-start justify-between gap-4">
      <div>
        <div className="font-display text-[18px] text-text">{c.code}</div>
        <div className="text-[16px] font-light text-text-muted mt-1">
          {c.type === 'percent' ? `${c.value}% off` : `₹${c.value} off`}
          {c.minOrder > 0 && ` · min order ₹${c.minOrder}`}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={c.active ? 'paid' : 'stone'}>{c.active ? 'Active' : 'Inactive'}</Badge>
        <button onClick={() => openEdit(c)} className="p-2 text-text-muted hover:text-gold min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Edit"><Pencil size={14} /></button>
        <button onClick={() => setConfirmId(c.id)} className="p-2 text-text-muted hover:text-cancel min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Delete"><Trash2 size={14} /></button>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Coupons"
        accentWord="Coupons"
        subtitle="Promotions & discounts"
        actions={<Button onClick={openNew} size="md"><Plus size={14} /> New coupon</Button>}
      />
      <SectionLabel>Active · {active.length}</SectionLabel>
      <div className="mb-6">{active.map((c) => <Row key={c.id} c={c} />)}</div>
      <SectionLabel>Inactive · {inactive.length}</SectionLabel>
      <div>{inactive.map((c) => <Row key={c.id} c={c} />)}</div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Edit coupon' : 'New coupon'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={save}>{editing ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input label="Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Coupon['type'] })}>
              <option value="percent">Percent</option>
              <option value="flat">Flat amount</option>
            </Select>
            <Input label={draft.type === 'percent' ? 'Percent (%)' : 'Amount (₹)'} type="number" value={draft.value} onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })} />
          </div>
          <Input label="Minimum order (₹)" type="number" value={draft.minOrder} onChange={(e) => setDraft({ ...draft, minOrder: Number(e.target.value) })} />
          <label className="flex items-center gap-3 text-[17px] font-light text-text">
            <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="accent-[#00754A]" />
            Active
          </label>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) {
            deleteCoupon(confirmId);
            toast.info('Coupon removed.');
          }
        }}
        title="Delete coupon"
        message="This will permanently remove the coupon."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
