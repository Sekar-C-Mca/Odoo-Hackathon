import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionLabel, Button, Input, Select, Badge, Drawer } from '../../components/ui';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useCatalogStore } from '../../store/catalogStore';
import { toast } from '../../components/ui/Toast';
import type { Employee } from '../../data/seed';

const blank: Employee = { id: '', name: '', email: '', role: 'EMPLOYEE', pin: '', active: true };

export function EmployeesPage() {
  const { employees, saveEmployee, deleteEmployee } = useCatalogStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<Employee>(blank);
  const [editing, setEditing] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const openNew = () => {
    setDraft({ ...blank, id: `e-${Date.now()}`, pin: '' });
    setEditing(false);
    setDrawerOpen(true);
  };
  const openEdit = (e: Employee) => {
    setDraft(e);
    setEditing(true);
    setDrawerOpen(true);
  };
  const save = () => {
    if (!draft.name.trim() || !draft.email.includes('@') || draft.pin.length < 4) {
      toast.error('Name, valid email, and a 4+ digit PIN are required.');
      return;
    }
    saveEmployee(draft);
    toast.success(editing ? 'Employee updated.' : 'Employee added.');
    setDrawerOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Employees"
        accentWord="Employees"
        subtitle="Staff & access"
        actions={<Button onClick={openNew} size="md"><Plus size={14} /> New employee</Button>}
      />
      <SectionLabel>{employees.length} staff</SectionLabel>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[14px] tracking-[0.2em] uppercase font-extralight text-text-muted border-b border-border">
              <th className="py-3 pr-4 font-extralight">Name</th>
              <th className="py-3 pr-4 font-extralight">Email</th>
              <th className="py-3 pr-4 font-extralight">Role</th>
              <th className="py-3 pr-4 font-extralight">Status</th>
              <th className="py-3 pr-4 font-extralight text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-b border-border">
                <td className="py-4 pr-4 text-[18px] font-light text-text">{e.name}</td>
                <td className="py-4 pr-4 text-[17px] font-light text-text-muted">{e.email}</td>
                <td className="py-4 pr-4"><Badge variant={e.role === 'ADMIN' ? 'gold' : 'card-pay'}>{e.role}</Badge></td>
                <td className="py-4 pr-4 text-[17px] font-light text-text-muted">{e.active ? 'Active' : 'Inactive'}</td>
                <td className="py-4 pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(e)} className="p-2 text-text-muted hover:text-gold min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Edit"><Pencil size={14} /></button>
                    <button onClick={() => setConfirmId(e.id)} className="p-2 text-text-muted hover:text-cancel min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col">
        {employees.map((e) => (
          <div key={e.id} className="border-b border-border py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[17px] font-light text-text">{e.name}</div>
                <div className="text-[16px] font-light text-text-muted mt-0.5">{e.email}</div>
                <div className="mt-2"><Badge variant={e.role === 'ADMIN' ? 'gold' : 'card-pay'}>{e.role}</Badge></div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button onClick={() => openEdit(e)} className="p-2 text-text-muted hover:text-gold min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Edit"><Pencil size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Edit employee' : 'New employee'}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={save}>{editing ? 'Save' : 'Add'}</Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input label="Full name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Léa Moreau" />
          <Input label="Email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="name@cafeetoile.test" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as Employee['role'] })}>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </Select>
            <Input label="PIN" type="password" value={draft.pin} onChange={(e) => setDraft({ ...draft, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="••••" />
          </div>
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
            deleteEmployee(confirmId);
            toast.info('Employee removed.');
          }
        }}
        title="Delete employee"
        message="This will revoke access for this staff member."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
