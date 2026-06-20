import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, QrCode as QrIcon, Mail } from 'lucide-react';
import { Button, Input, SectionLabel } from '../../components/ui';
import { useCartStore, cartTotals } from '../../store/cartStore';
import { useCatalogStore } from '../../store/catalogStore';
import { useAuthStore } from '../../store/authStore';
import { useKDSStore } from '../../store/kdsStore';
import { ReceiptEmailModal } from './ReceiptEmailModal';
import { toast } from '../../components/ui/Toast';

type Method = 'cash' | 'upi' | 'card';

export function PaymentScreen() {
  const navigate = useNavigate();
  const { items, tableLabel, coupon, customer, clearCart } = useCartStore();
  const { addOrder, updateOrder, orders } = useCatalogStore();
  const addTicket = useKDSStore((s) => s.addTicket);
  const user = useAuthStore((s) => s.user);
  const totals = useMemo(() => cartTotals(items, coupon), [items, coupon]);
  const [method, setMethod] = useState<Method>('cash');
  const [cash, setCash] = useState('');
  const [cardRef, setCardRef] = useState('');
  const [done, setDone] = useState(false);
  const [orderNum, setOrderNum] = useState('');
  const [emailOpen, setEmailOpen] = useState(false);

  if (items.length === 0 && !done) {
    return (
      <div className="p-6">
        <SectionLabel>No active order</SectionLabel>
        <p className="py-12 text-center text-[17px] font-light text-text-muted">Add items to the cart first.</p>
        <Button variant="ghost" size="md" onClick={() => navigate('/pos')}><ArrowLeft size={14} /> Back to order</Button>
      </div>
    );
  }

  const change = cash ? Number(cash) - totals.total : 0;

  const finalize = (pm: Method) => {
    const num = `#${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setOrderNum(num);

    // Check if there's already a draft order for this (from "Send to kitchen")
    // If so, update it to paid status. Otherwise, create a new order.
    const existingDraft = orders.find(
      (o) => o.status === 'draft' && o.tableLabel === tableLabel && tableLabel !== null
    );

    if (existingDraft) {
      updateOrder(existingDraft.id, {
        status: 'paid',
        total: totals.total,
        paymentMethod: pm,
        employeeName: user?.name,
        items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, discount: i.discount })),
      });
    } else {
      addOrder({
        id: `o-${Date.now()}`,
        orderNum: num,
        tableLabel,
        status: 'paid',
        total: totals.total,
        customer: customer?.name,
        employeeName: user?.name,
        items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, discount: i.discount })),
        createdAt: new Date().toISOString(),
        paymentMethod: pm,
      });
      addTicket({
        id: `k-${Date.now()}`,
        orderNum: num,
        tableLabel: tableLabel ?? 'Takeaway',
        items: items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, done: false })),
      });
    }
    toast.success(`${existingDraft ? existingDraft.orderNum : num} paid via ${pm}.`);
    clearCart();
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-14 h-14 flex items-center justify-center text-paid mb-6"><Check size={56} strokeWidth={1.2} /></div>
        <div className="text-[14px] tracking-[0.28em] uppercase font-extralight text-text-muted mb-2">Payment complete</div>
        <div className="font-display font-light italic text-[clamp(48px,12vw,96px)] text-gold leading-none mb-6">{orderNum}</div>
        <div className="text-[17px] font-light text-text-muted mb-8">Thank you. The kitchen has been notified.</div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Button fullWidth size="md" onClick={() => navigate('/pos')}>New order</Button>
          <Button fullWidth variant="ghost" size="md" onClick={() => setEmailOpen(true)}>
            <Mail size={14} /> Send receipt
          </Button>
          <Button fullWidth variant="ghost" size="md" onClick={() => navigate('/pos/history')}>View history</Button>
        </div>
        <ReceiptEmailModal
          open={emailOpen}
          onClose={() => setEmailOpen(false)}
          orderNum={orderNum}
          total={totals.total}
        />
      </div>
    );
  }

  const tabs: { id: Method; label: string }[] = [
    { id: 'cash', label: 'Cash' },
    { id: 'upi', label: 'UPI QR' },
    { id: 'card', label: 'Card' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/pos')}><ArrowLeft size={14} /> Back</Button>
        <span className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted">Table {tableLabel ?? '—'}</span>
      </div>
      <div className="text-center mb-8">
        <div className="text-[14px] tracking-[0.28em] uppercase font-extralight text-text-muted mb-2">Amount due</div>
        <div className="font-display font-light text-[clamp(56px,14vw,96px)] text-text leading-none">₹{totals.total}</div>
      </div>
      <SectionLabel>Method</SectionLabel>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setMethod(t.id)} className={`py-3 text-[15px] tracking-[0.18em] uppercase font-light min-h-[44px] transition-colors ${method === t.id ? 'text-gold border border-[rgba(0,117,74,0.4)] bg-[rgba(0,117,74,0.05)]' : 'text-text-muted border border-border'}`}>{t.label}</button>
        ))}
      </div>

      {method === 'cash' && (
        <div>
          <Input label="Cash received (₹)" type="number" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="0" />
          {cash && change >= 0 && (
            <div className="mt-6 text-center">
              <div className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted mb-1">Change due</div>
              <div className="font-display text-[44px] text-paid leading-none">₹{change}</div>
            </div>
          )}
          <Button fullWidth size="lg" className="mt-8" disabled={!cash || Number(cash) < totals.total} onClick={() => finalize('cash')}>
            Confirm payment
          </Button>
        </div>
      )}

      {method === 'upi' && (
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 border border-border flex items-center justify-center text-gold mb-4"><QrIcon size={120} strokeWidth={1} /></div>
          <div className="text-[15px] tracking-[0.18em] uppercase font-extralight text-text-muted mb-6">Scan to pay ₹{totals.total}</div>
          <Button fullWidth size="lg" onClick={() => finalize('upi')}>Confirm payment received</Button>
        </div>
      )}

      {method === 'card' && (
        <div>
          <Input label="Reference number" value={cardRef} onChange={(e) => setCardRef(e.target.value)} placeholder="Optional" />
          <Button fullWidth size="lg" className="mt-8" onClick={() => finalize('card')}>Confirm payment</Button>
        </div>
      )}
    </div>
  );
}
