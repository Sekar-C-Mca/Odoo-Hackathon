import { useMemo, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionLabel, Input, Button, Badge } from '../../components/ui';
import { useCatalogStore } from '../../store/catalogStore';
import { useCartStore } from '../../store/cartStore';
import { useDebounce } from '../../hooks/useDebounce';
import { toast } from '../../components/ui/Toast';

export function CustomerPage() {
  const { customers, saveCustomer } = useCatalogStore();
  const { setCustomer, customer } = useCartStore();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(debounced.toLowerCase()) ||
          c.phone.includes(debounced)
      ),
    [customers, debounced]
  );

  const select = (id: string, name: string) => {
    setCustomer({ id, name });
    toast.success(`${name} attached to order.`);
  };

  const addNew = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error('Name and phone are required.');
      return;
    }
    const id = `cu-${Date.now()}`;
    saveCustomer({ id, name: name.trim(), phone: phone.trim(), visits: 0, totalSpend: 0 });
    select(id, name.trim());
    setName('');
    setPhone('');
    setAdding(false);
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Customers" accentWord="Customers" subtitle="Find or attach a guest" />
      <div className="grid lg:grid-cols-2 gap-px bg-border">
        <div className="p-5" style={{ background: 'var(--surface)' }}>
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Input label="Search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or phone" />
              <Search size={14} className="absolute right-0 bottom-3 text-text-faint" />
            </div>
            <Button variant="ghost" size="sm" onClick={() => setAdding((v) => !v)} className="self-end"><UserPlus size={13} /> New</Button>
          </div>
          <SectionLabel>{filtered.length} results</SectionLabel>
          {customer && (
            <div className="mb-4 p-3 border border-[rgba(0,117,74,0.4)] bg-[rgba(0,117,74,0.05)]">
              <div className="text-[14px] tracking-[0.22em] uppercase font-extralight text-gold mb-1">Attached to order</div>
              <div className="text-[18px] font-light text-text">{customer.name}</div>
            </div>
          )}
          <div className="flex flex-col">
            {filtered.map((c) => (
              <button key={c.id} onClick={() => select(c.id, c.name)} className="border-b border-border py-3 text-left hover:bg-[rgba(0,117,74,0.04)] transition-colors flex items-center justify-between">
                <div>
                  <div className="text-[18px] font-light text-text">{c.name}</div>
                  <div className="text-[16px] font-extralight text-text-faint">{c.phone} · {c.visits} visits</div>
                </div>
                <Badge variant="stone">₹{c.totalSpend.toLocaleString('en-IN')}</Badge>
              </button>
            ))}
          </div>
        </div>
        <div className="p-5" style={{ background: 'var(--surface)' }}>
          {adding ? (
            <div>
              <SectionLabel>New customer</SectionLabel>
              <div className="space-y-5">
                <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Nair" />
                <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." />
                <Button size="md" onClick={addNew}>Create & attach</Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="font-display font-light italic text-[26px] text-text mb-2">No customer selected</div>
              <p className="text-[16px] font-light text-text-muted mb-6">Attach a customer to the current order, or create a new one.</p>
              <Button variant="ghost" size="md" onClick={() => setAdding(true)}><UserPlus size={14} /> New customer</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
