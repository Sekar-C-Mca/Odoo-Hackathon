import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, X, ShoppingCart, Send, UserPlus, Tag } from 'lucide-react';
import { SectionLabel, Button, Badge } from '../../components/ui';
import { FloorPopup } from './FloorPopup';
import { useCatalogStore, categoryColor } from '../../store/catalogStore';
import { useCartStore, cartTotals } from '../../store/cartStore';
import { useKDSStore } from '../../store/kdsStore';
import { toast } from '../../components/ui/Toast';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export function OrderView() {
  const navigate = useNavigate();
  const { products, categories, coupons } = useCatalogStore();
  const { items, tableId, tableLabel, customer, coupon, addItem, updateQty, removeItem, setTable, applyCoupon, clearCart } = useCartStore();
  const addTicket = useKDSStore((s) => s.addTicket);
  const addOrder = useCatalogStore((s) => s.addOrder);

  const isMobile = useMediaQuery('(max-width: 899px)');
  const [floorOpen, setFloorOpen] = useState(!tableId);
  const [activeCat, setActiveCat] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    if (!tableId) setFloorOpen(true);
  }, [tableId]);

  const filtered = useMemo(
    () => products.filter((p) => p.available && (activeCat === 'all' || p.categoryId === activeCat)),
    [products, activeCat]
  );
  const totals = useMemo(() => cartTotals(items, coupon), [items, coupon]);

  const sendToKitchen = () => {
    if (items.length === 0) {
      toast.error('Cart is empty.');
      return;
    }
    const orderNum = `#${String(Math.floor(Math.random() * 9000) + 1000)}`;
    addTicket({
      id: `k-${Date.now()}`,
      orderNum,
      tableLabel: tableLabel ?? 'Takeaway',
      items: items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, done: false })),
    });
    addOrder({
      id: `o-${Date.now()}`,
      orderNum,
      tableLabel,
      status: 'paid',
      total: totals.total,
      customer: customer?.name,
      items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
      createdAt: new Date().toISOString(),
    });
    toast.success(`${orderNum} sent to kitchen.`);
    clearCart();
    setCartOpen(false);
    navigate('/pos/history');
  };

  const applyCouponCode = () => {
    const c = coupons.find((x) => x.code.toLowerCase() === couponCode.trim().toLowerCase() && x.active);
    if (!c) {
      toast.error('Invalid or inactive coupon.');
      return;
    }
    applyCoupon({ code: c.code, type: c.type, value: c.value });
    toast.success(`Coupon ${c.code} applied.`);
    setCouponOpen(false);
    setCouponCode('');
  };

  const CartContents = () => (
    <>
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <span className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted">
          {tableLabel ? `Order · Table ${tableLabel}` : 'Order · Takeaway'}
        </span>
        {customer && <Badge variant="gold">{customer.name}</Badge>}
      </div>
      {items.length === 0 ? (
        <p className="text-[17px] font-light text-text-faint py-8 text-center">No items yet. Tap a product to add it.</p>
      ) : (
        <div className="flex flex-col">
          {items.map((i) => (
            <div key={i.id} className="flex items-center justify-between py-3 border-b border-border gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[17px] font-light text-text truncate">{i.name}</div>
                <div className="text-[15px] font-extralight text-text-faint">₹{i.price} each</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => updateQty(i.id, i.qty - 1)} className="w-9 h-9 flex items-center justify-center border border-border text-text-muted hover:border-gold hover:text-gold transition-colors" aria-label="Decrease"><Minus size={13} /></button>
                <span className="w-7 text-center text-[17px] font-light text-text">{i.qty}</span>
                <button onClick={() => updateQty(i.id, i.qty + 1)} className="w-9 h-9 flex items-center justify-center border border-border text-text-muted hover:border-gold hover:text-gold transition-colors" aria-label="Increase"><Plus size={13} /></button>
              </div>
              <div className="w-16 text-right font-display text-[18px] text-text">₹{i.price * i.qty}</div>
              <button onClick={() => removeItem(i.id)} className="w-9 h-9 flex items-center justify-center text-text-faint hover:text-cancel" aria-label="Remove"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
      {items.length > 0 && (
        <div className="mt-auto pt-4 border-t border-[rgba(0,117,74,0.2)]">
          <div className="space-y-1.5">
            <div className="flex justify-between"><span className="text-[14px] tracking-[0.12em] uppercase font-extralight text-text-muted">Subtotal</span><span className="font-display text-[17px] text-text-muted">₹{totals.subtotal}</span></div>
            {totals.discount > 0 && (
              <div className="flex justify-between"><span className="text-[14px] tracking-[0.12em] uppercase font-extralight text-text-muted">Discount</span><span className="font-display text-[17px] text-cancel">−₹{totals.discount}</span></div>
            )}
            <div className="flex justify-between"><span className="text-[14px] tracking-[0.12em] uppercase font-extralight text-text-muted">GST 5%</span><span className="font-display text-[17px] text-text-muted">₹{totals.gst}</span></div>
          </div>
          <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-border">
            <span className="text-[14px] tracking-[0.22em] uppercase font-extralight text-gold">Total</span>
            <span className="font-display text-[28px] text-text">₹{totals.total}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/pos/customers')}><UserPlus size={13} /> {customer ? 'Change' : 'Customer'}</Button>
            <Button variant="ghost" size="sm" onClick={() => setCouponOpen(!couponOpen)}><Tag size={13} /> {coupon ? coupon.code : 'Coupon'}</Button>
          </div>
          {couponOpen && (
            <div className="mt-3 flex gap-2">
              <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="WELCOME10" className="flex-1 bg-transparent border-b border-border py-2 text-[17px] font-light text-text outline-none focus:border-gold placeholder:text-text-faint" />
              <Button size="sm" onClick={applyCouponCode}>Apply</Button>
            </div>
          )}
          <Button fullWidth size="lg" className="mt-4" variant="ghost" onClick={sendToKitchen}><Send size={14} /> Send to kitchen</Button>
          <Button fullWidth size="lg" className="mt-2" onClick={() => navigate('/pos/payment')}>Charge ₹{totals.total}</Button>
        </div>
      )}
    </>
  );

  const CartPanel = ({ className = '' }: { className?: string }) => (
    <div className={`flex flex-col h-full p-5 ${className}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <CartContents />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <FloorPopup open={floorOpen} onClose={() => setFloorOpen(false)} />

      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveCat('all')} className={`px-3.5 py-2 text-[15px] font-semibold whitespace-nowrap min-h-[40px] border bg-transparent ${activeCat === 'all' ? 'text-text border-text' : 'text-text-muted border-border'}`}>All</button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className="px-3.5 py-2 text-[15px] font-semibold whitespace-nowrap min-h-[40px] border bg-transparent flex items-center gap-2"
                style={{
                  color: activeCat === c.id ? 'var(--text)' : 'var(--text-muted)',
                  borderColor: c.color,
                  borderWidth: activeCat === c.id ? 2 : 1,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                {c.name}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setTable('', ''); clearCart(); setFloorOpen(true); }} disabled={!tableId}>
            <ShoppingCart size={13} /> {tableLabel ? `Table ${tableLabel}` : 'Select table'}
          </Button>
        </div>
        <SectionLabel>{filtered.length} products</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto pb-24 lg:pb-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addItem({ id: p.id, name: p.name, price: p.price, categoryColor: categoryColor(categories, p.categoryId) })}
              className="border border-border p-3.5 text-left transition-colors hover:border-[rgba(0,117,74,0.35)]"
              style={{ background: 'var(--surface-raised)' }}
            >
              <span className="block w-5 h-0.5 mb-2.5 opacity-60" style={{ background: categoryColor(categories, p.categoryId) }} />
              <span className="block text-[16px] font-light text-text leading-snug mb-1.5">{p.name}</span>
              <span className="block font-display text-[19px] text-text">₹{p.price}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop cart */}
      {!isMobile && (
        <div className="w-[380px] shrink-0 p-4 sm:p-6 pl-0">
          <CartPanel className="h-full" />
        </div>
      )}

      {/* Mobile sticky bar */}
      {isMobile && items.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4 border-t border-[rgba(0,117,74,0.3)] text-[#1E3932]"
          style={{ background: '#00754A' }}
        >
          <span className="flex items-center gap-2 text-[16px] tracking-[0.18em] uppercase font-medium"><ShoppingCart size={16} /> View cart · {items.length}</span>
          <span className="font-display text-[18px]">₹{totals.total}</span>
        </button>
      )}

      {/* Mobile cart overlay */}
      {isMobile && cartOpen && (
        <div className="fixed inset-0 z-[110]">
          <div className="absolute inset-0 bg-black/70" onClick={() => setCartOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] flex flex-col border-t border-border" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-display font-light italic text-[22px] text-text">Cart</span>
              <button onClick={() => setCartOpen(false)} className="text-text-faint hover:text-gold p-2 min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Close"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col">
              <CartContents />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
