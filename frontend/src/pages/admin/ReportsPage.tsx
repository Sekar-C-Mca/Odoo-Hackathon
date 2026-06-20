import { useMemo, useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionLabel, Button, Select, Badge } from '../../components/ui';
import { useCatalogStore } from '../../store/catalogStore';
import { toast } from '../../components/ui/Toast';

export function ReportsPage() {
  const { orders, products, categories } = useCatalogStore();
  const [range, setRange] = useState('today');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      if (range === 'today') return d.toDateString() === now.toDateString();
      if (range === 'week') {
        const wk = new Date(now);
        wk.setDate(now.getDate() - 7);
        return d >= wk;
      }
      return true;
    });
  }, [orders, range]);

  const revenue = filtered.filter((o) => o.status === 'paid').reduce((s, o) => s + o.total, 0);
  const tickets = filtered.length;
  const avg = tickets ? Math.round(revenue / tickets) : 0;

  const productAgg = products
    .map((p) => ({
      name: p.name,
      qty: filtered.reduce(
        (s, o) => s + o.items.filter((i) => i.name === p.name).reduce((q, i) => q + i.qty, 0),
        0
      ),
    }))
    .filter((x) => x.qty > 0)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const catAgg = categories
    .map((c) => ({
      name: c.name,
      color: c.color,
      qty: filtered
        .flatMap((o) => o.items)
        .filter((i) => products.find((p) => p.name === i.name)?.categoryId === c.id)
        .reduce((s, i) => s + i.qty, 0),
    }))
    .filter((x) => x.qty > 0);

  const totalCat = catAgg.reduce((s, c) => s + c.qty, 0) || 1;
  const maxProd = productAgg[0]?.qty || 1;

  return (
    <div>
      <PageHeader
        title="Reports"
        accentWord="Reports"
        subtitle="Sales & performance"
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="md" onClick={() => setFiltersOpen((v) => !v)}><Filter size={14} /> Filters</Button>
            <Button variant="ghost" size="md" onClick={() => toast.info('Export queued (demo).')}><Download size={14} /> Export</Button>
          </div>
        }
      />

      <div className={`${filtersOpen ? 'block' : 'hidden'} sm:block mb-2`}>
        <div className="sm:w-56">
          <Select label="Range" value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="all">All time</option>
          </Select>
        </div>
      </div>

      <SectionLabel>Metrics</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border mb-6">
        {[
          { label: 'Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, accent: true },
          { label: 'Tickets', value: tickets, accent: false },
          { label: 'Avg. ticket', value: `₹${avg.toLocaleString('en-IN')}`, accent: false },
        ].map((m) => (
          <div key={m.label} className="p-6" style={{ background: 'var(--surface)' }}>
            <div className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted mb-3">{m.label}</div>
            <div className={`font-display font-light text-[clamp(32px,5vw,48px)] leading-none ${m.accent ? 'text-gold' : 'text-text'}`}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border mb-6">
        <div className="p-6" style={{ background: 'var(--surface)' }}>
          <div className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted mb-5">Top products</div>
          <div className="space-y-3">
            {productAgg.length === 0 && <p className="text-[17px] font-light text-text-faint">No sales in range.</p>}
            {productAgg.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[17px] font-light text-text">{p.name}</span>
                  <span className="text-[16px] font-light text-text-muted">{p.qty}</span>
                </div>
                <div className="h-1 bg-border">
                  <div className="h-full bg-gold" style={{ width: `${(p.qty / maxProd) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6" style={{ background: 'var(--surface)' }}>
          <div className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted mb-5">By category</div>
          <div className="space-y-3">
            {catAgg.length === 0 && <p className="text-[17px] font-light text-text-faint">No sales in range.</p>}
            {catAgg.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2" style={{ background: c.color }} />
                  <span className="text-[17px] font-light text-text">{c.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1 bg-border">
                    <div className="h-full" style={{ width: `${(c.qty / totalCat) * 100}%`, background: c.color }} />
                  </div>
                  <span className="text-[16px] font-light text-text-muted w-8 text-right">{Math.round((c.qty / totalCat) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionLabel>Recent orders</SectionLabel>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="text-[14px] tracking-[0.2em] uppercase font-extralight text-text-muted border-b border-border">
              <th className="py-3 pr-4 font-extralight">Order</th>
              <th className="py-3 pr-4 font-extralight">Status</th>
              <th className="py-3 pr-4 font-extralight">Payment</th>
              <th className="py-3 pr-4 font-extralight text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 8).map((o) => (
              <tr key={o.id} className="border-b border-border">
                <td className="py-4 pr-4 font-display text-[19px] text-text">{o.orderNum}</td>
                <td className="py-4 pr-4"><Badge variant={o.status === 'paid' ? 'paid' : o.status === 'cancelled' ? 'cancel' : 'stone'}>{o.status}</Badge></td>
                <td className="py-4 pr-4 text-[17px] font-light text-text-muted uppercase">{o.paymentMethod ?? '—'}</td>
                <td className="py-4 pr-4 text-right font-display text-[19px] text-text">₹{o.total.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
