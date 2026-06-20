import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, X, ArrowRight, Check, Clock, ChefHat, Coffee, Search, Tag, History } from 'lucide-react';
import { useCatalogStore, categoryColor } from '../../store/catalogStore';
import { cartTotals } from '../../store/cartStore';
import { useKDSStore } from '../../store/kdsStore';
import { Button, SectionLabel, Input, Badge } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import type { Product, Order } from '../../data/seed';

type Screen = 'splash' | 'menu' | 'cart' | 'status' | 'history';

export function SelfOrderPage() {
  const { token } = useParams<{ token: string }>();
  const { products, categories, coupons, tables, orders, addOrder, selfOrderEnabled, selfOrderMode } = useCatalogStore();
  const { addTicket, tickets } = useKDSStore();

  // Resolve token to table
  const table = tables.find((t) => t.token === token);
  const tableLabel = table?.label ?? null;

  const [activeCat, setActiveCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Product[]>([]);
  const [screen, setScreen] = useState<Screen>('splash');
  const [detail, setDetail] = useState<Product | null>(null);
  const [orderNum, setOrderNum] = useState('');
  const [stage, setStage] = useState(0);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'percent' | 'flat'; value: number } | null>(null);
  const [myOrders, setMyOrders] = useState<string[]>([]);

  // Auto-advance from splash after 3 seconds
  useEffect(() => {
    if (screen !== 'splash') return;
    const t = setTimeout(() => setScreen('menu'), 3000);
    return () => clearTimeout(t);
  }, [screen]);

  // If self-ordering is disabled, show message
  if (!selfOrderEnabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg p-6 text-center">
        <div className="font-display font-light italic text-[32px] text-text mb-4">Café <span className="text-gold">Étoile</span></div>
        <p className="text-[18px] font-light text-text-muted">Self-ordering is currently unavailable. Please ask your server.</p>
      </div>
    );
  }

  const filtered = useMemo(
    () => products.filter((p) => {
      if (!p.available) return false;
      if (activeCat !== 'all' && p.categoryId !== activeCat) return false;
      if (searchQuery.trim() && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }),
    [products, activeCat, searchQuery]
  );

  const totals = cartTotals(
    cart.map((p) => ({ id: p.id, name: p.name, price: p.price, qty: 1 })),
    appliedCoupon
  );

  // Aggregate cart by product id
  const cartAgg = useMemo(() => {
    const map = new Map<string, { product: Product; qty: number }>();
    cart.forEach((p) => {
      const existing = map.get(p.id);
      if (existing) existing.qty++;
      else map.set(p.id, { product: p, qty: 1 });
    });
    return [...map.values()];
  }, [cart]);

  const addOne = (p: Product) => {
    setCart((c) => [...c, p]);
    toast.success(`${p.name} added.`);
  };
  const removeOne = (id: string) => {
    setCart((c) => {
      const idx = c.findIndex((p) => p.id === id);
      if (idx === -1) return c;
      const next = [...c];
      next.splice(idx, 1);
      return next;
    });
  };
  const countOf = (id: string) => cart.filter((p) => p.id === id).length;

  const applyCouponCode = () => {
    const c = coupons.find((x) => x.code.toLowerCase() === couponCode.trim().toLowerCase() && x.active);
    if (!c) {
      toast.error('Invalid or inactive coupon.');
      return;
    }
    if (c.minOrder > 0 && totals.subtotal < c.minOrder) {
      toast.error(`Minimum order ₹${c.minOrder} required.`);
      return;
    }
    setAppliedCoupon({ code: c.code, type: c.type, value: c.value });
    toast.success(`Coupon ${c.code} applied.`);
    setCouponOpen(false);
    setCouponCode('');
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      toast.error('Add items to your order first.');
      return;
    }
    const num = `#${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setOrderNum(num);

    // Create order in POS store
    const orderItems = cartAgg.map((a) => ({ name: a.product.name, qty: a.qty, price: a.product.price }));
    addOrder({
      id: `o-self-${Date.now()}`,
      orderNum: num,
      tableLabel,
      status: 'draft',
      total: totals.total,
      customer: `Self-order${tableLabel ? ` T${tableLabel}` : ''}`,
      items: orderItems,
      createdAt: new Date().toISOString(),
    });

    // Create KDS ticket
    addTicket({
      id: `k-self-${Date.now()}`,
      orderNum: num,
      tableLabel: tableLabel ?? 'Self',
      items: cartAgg.map((a) => ({ id: a.product.id, name: a.product.name, qty: a.qty, done: false })),
    });

    setMyOrders((prev) => [...prev, num]);
    setScreen('status');
    setStage(0);
    setCart([]);
    setAppliedCoupon(null);

    // Simulate stage progression (in production this would be driven by KDS events)
    const seq = [1, 2, 3];
    let i = 0;
    const t = setInterval(() => {
      if (i >= seq.length) {
        clearInterval(t);
        return;
      }
      setStage(seq[i]);
      i++;
    }, 2500);
  };

  const stagesList = [
    { id: 1, label: 'Order received', icon: Clock, color: '#00754A' },
    { id: 2, label: 'Preparing', icon: ChefHat, color: '#3A6B8B' },
    { id: 3, label: 'Ready for pickup', icon: Coffee, color: '#4A7C59' },
  ];

  // Splash screen
  if (screen === 'splash') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg relative overflow-hidden">
        {/* Auto-scrolling background pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <div className="absolute inset-0 animate-pulse" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, var(--gold) 0px, var(--gold) 2px, transparent 2px, transparent 40px)',
            backgroundSize: '56px 56px',
          }} />
        </div>
        <div className="relative z-10 text-center">
          <div className="font-display font-light italic text-[clamp(36px,10vw,64px)] text-text leading-none mb-4">
            Café <span className="text-gold">Étoile</span>
          </div>
          {tableLabel && (
            <div className="text-[15px] tracking-[0.22em] uppercase font-extralight text-text-muted mb-6">
              Table {tableLabel}
            </div>
          )}
          <p className="text-[17px] font-light text-text-muted mb-8 max-w-xs mx-auto">
            Browse our menu and order directly from your phone.
          </p>
          <Button size="lg" onClick={() => setScreen('menu')}>
            Start ordering <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  // Status screen
  if (screen === 'status') {
    return (
      <div className="min-h-screen flex flex-col p-5 bg-bg">
        <div className="flex items-center justify-between mb-8">
          <div className="font-display font-light italic text-[26px] text-text leading-none">
            Café <span className="text-gold">Étoile</span>
          </div>
          <button onClick={() => setScreen('history')} className="flex items-center gap-2 text-[14px] tracking-[0.18em] uppercase font-light text-text-muted hover:text-gold">
            <History size={14} /> My orders
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="font-display font-light italic text-[clamp(48px,14vw,80px)] text-gold leading-none mb-4">{orderNum}</div>
          <div className="text-[15px] tracking-[0.22em] uppercase font-extralight text-text-muted mb-12">Your order is in progress</div>
          <div className="w-full max-w-md space-y-5">
            {stagesList.map((s) => {
              const active = stage >= s.id;
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 flex items-center justify-center border"
                    style={{
                      borderColor: active ? s.color : '#F2F0EB',
                      background: active ? `${s.color}14` : 'transparent',
                      color: active ? s.color : '#B5ADA3',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className={`text-[18px] font-light ${active ? 'text-text' : 'text-text-faint'}`}>{s.label}</div>
                    <div className="h-px bg-border mt-2" />
                  </div>
                  {active && stage === s.id && <Check size={18} className="text-gold" />}
                </div>
              );
            })}
          </div>
          <p className="mt-12 text-[16px] font-light text-text-muted max-w-xs">Please pick up your order at the counter once ready.</p>
          <Button variant="ghost" size="md" className="mt-6" onClick={() => setScreen('menu')}>
            Order more
          </Button>
        </div>
      </div>
    );
  }

  // Order history screen
  if (screen === 'history') {
    const historyOrders = orders.filter((o) => myOrders.includes(o.orderNum));
    return (
      <div className="min-h-screen flex flex-col p-5 bg-bg">
        <div className="flex items-center justify-between mb-6">
          <div className="font-display font-light italic text-[26px] text-text leading-none">
            My <span className="text-gold">orders</span>
          </div>
          <button onClick={() => setScreen('menu')} className="text-text-faint hover:text-gold p-2"><X size={18} /></button>
        </div>
        {historyOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="font-display font-light italic text-[24px] text-text mb-2">No orders yet</div>
            <p className="text-[16px] font-light text-text-muted mb-6">Place your first order to see it here.</p>
            <Button size="md" onClick={() => setScreen('menu')}>Browse menu</Button>
          </div>
        ) : (
          <div className="flex flex-col">
            {historyOrders.map((o) => {
              const ticket = tickets.find((t) => t.orderNum === o.orderNum);
              const kdsStage = ticket?.stage;
              const statusLabel = kdsStage === 'completed' ? 'Ready' : kdsStage === 'preparing' ? 'Preparing' : kdsStage === 'to_cook' ? 'In queue' : o.status;
              return (
                <div key={o.id} className="border-b border-border py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-[20px] text-text">{o.orderNum}</span>
                    <Badge variant={kdsStage === 'completed' ? 'paid' : kdsStage === 'preparing' ? 'gold' : 'stone'}>{statusLabel}</Badge>
                  </div>
                  <div className="text-[15px] font-light text-text-muted">
                    {o.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                  </div>
                  <div className="mt-1 font-display text-[18px] text-gold">₹{o.total}</div>
                  <div className="mt-1 text-[14px] font-light text-text-faint">{new Date(o.createdAt).toLocaleTimeString()}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Main menu + cart
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="sticky top-0 z-30 px-4 py-4 border-b border-border bg-bg">
        <div className="flex items-center justify-between">
          <div className="font-display font-light italic text-[26px] text-text leading-none">Café <span className="text-gold">Étoile</span></div>
          <div className="flex items-center gap-2">
            {myOrders.length > 0 && (
              <button onClick={() => setScreen('history')} className="p-2 text-text-muted hover:text-gold" aria-label="Order history">
                <History size={18} />
              </button>
            )}
            <button
              onClick={() => setScreen('cart')}
              className="relative w-11 h-11 flex items-center justify-center border border-border text-text hover:border-gold transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center px-1 text-[15px] font-light text-[#1E3932]" style={{ background: '#00754A' }}>
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28">
        <p className="mt-4 text-[15px] tracking-[0.22em] uppercase font-extralight text-text-muted">
          {tableLabel ? `Table ${tableLabel} · ` : ''}
          {selfOrderMode === 'qr_menu' ? 'Browse our menu' : 'Build your order below'}
        </p>

        {/* Text search */}
        <div className="mt-3 mb-3">
          <div className="relative">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu..."
              className="w-full bg-transparent border border-border py-2.5 pl-10 pr-4 text-[16px] font-light text-text outline-none focus:border-gold placeholder:text-text-faint"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveCat('all')} className={`px-4 py-2 text-[15px] font-semibold whitespace-nowrap min-h-[40px] border bg-transparent ${activeCat === 'all' ? 'text-text border-text' : 'text-text-muted border-border'}`}>All</button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className="px-4 py-2 text-[15px] font-semibold whitespace-nowrap min-h-[40px] border bg-transparent flex items-center gap-2"
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
        <SectionLabel>{filtered.length} items</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-1">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setDetail(p)}
              className="border border-border bg-surface p-3.5 text-left transition-colors hover:border-[rgba(0,117,74,0.35)]"
            >
              <span className="block w-5 h-0.5 mb-2.5 opacity-60" style={{ background: categoryColor(categories, p.categoryId) }} />
              <span className="block text-[16px] font-light text-text leading-snug mb-1.5">{p.name}</span>
              <span className="block font-display text-[20px] text-text">₹{p.price}</span>
              {countOf(p.id) > 0 && (
                <span className="mt-2 inline-block text-[14px] tracking-[0.18em] uppercase font-light text-gold border border-[rgba(0,117,74,0.4)] px-2 py-0.5">
                  {countOf(p.id)} in cart
                </span>
              )}
            </button>
          ))}
        </div>
      </main>

      {/* Sticky cart bar */}
      {cart.length > 0 && screen === 'menu' && selfOrderMode !== 'qr_menu' && (
        <button
          onClick={() => setScreen('cart')}
          className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-4 text-[#1E3932]"
          style={{ background: '#00754A' }}
        >
          <span className="flex items-center gap-2 text-[16px] tracking-[0.18em] uppercase font-medium"><ShoppingCart size={16} /> Cart · {cart.length}</span>
          <span className="flex items-center gap-2 font-display text-[18px]">₹{totals.total} <ArrowRight size={16} /></span>
        </button>
      )}

      {/* Cart screen */}
      {screen === 'cart' && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg">
          <header className="flex items-center justify-between px-4 py-4 border-b border-border">
            <div className="font-display font-light italic text-[22px] text-text">Your <span className="text-gold">order</span></div>
            <button onClick={() => setScreen('menu')} className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-gold" aria-label="Close"><X size={20} /></button>
          </header>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="font-display font-light italic text-[26px] text-text mb-2">Empty</div>
                <p className="text-[16px] font-light text-text-muted mb-6">Add items from the menu to get started.</p>
                <Button size="md" onClick={() => setScreen('menu')}>Browse menu</Button>
              </div>
            ) : (
              <div>
                {cartAgg.map(({ product: p, qty }) => (
                  <div key={p.id} className="flex items-center justify-between py-3 border-b border-border gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[18px] font-light text-text truncate">{p.name}</div>
                      <div className="text-[15px] font-extralight text-text-faint">₹{p.price} each</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => removeOne(p.id)} className="w-9 h-9 flex items-center justify-center border border-border text-text-muted hover:border-gold hover:text-gold" aria-label="Decrease"><Minus size={13} /></button>
                      <span className="w-7 text-center text-[17px] font-light text-text">{qty}</span>
                      <button onClick={() => addOne(p)} className="w-9 h-9 flex items-center justify-center border border-border text-text-muted hover:border-gold hover:text-gold" aria-label="Increase"><Plus size={13} /></button>
                    </div>
                    <div className="w-16 text-right font-display text-[18px] text-text">₹{p.price * qty}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {cart.length > 0 && (
            <footer className="px-4 py-4 border-t border-border">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted">Subtotal</span>
                <span className="font-display text-[19px] text-text-muted">₹{totals.subtotal}</span>
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted">GST 5%</span>
                <span className="font-display text-[19px] text-text-muted">₹{totals.gst}</span>
              </div>
              {totals.orderDiscount > 0 && (
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted">Discount ({appliedCoupon?.code})</span>
                  <span className="font-display text-[19px] text-cancel">−₹{totals.orderDiscount}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline mb-4 pt-3 border-t border-border">
                <span className="text-[14px] tracking-[0.22em] uppercase font-extralight text-gold">Total</span>
                <span className="font-display text-[30px] text-text">₹{totals.total}</span>
              </div>

              {/* Coupon link */}
              {!appliedCoupon && (
                <button
                  onClick={() => setCouponOpen(!couponOpen)}
                  className="flex items-center gap-2 text-[15px] font-light text-gold hover:text-text mb-3"
                >
                  <Tag size={14} /> Have a coupon code?
                </button>
              )}
              {appliedCoupon && (
                <div className="flex items-center justify-between mb-3 p-2 border border-[rgba(0,117,74,0.3)] bg-[rgba(0,117,74,0.05)]">
                  <span className="text-[15px] font-light text-gold"><Tag size={13} className="inline mr-1" />{appliedCoupon.code}</span>
                  <button onClick={() => setAppliedCoupon(null)} className="text-text-faint hover:text-cancel"><X size={14} /></button>
                </div>
              )}
              {couponOpen && !appliedCoupon && (
                <div className="flex gap-2 mb-3">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="WELCOME10"
                    className="flex-1 bg-transparent border-b border-border py-2 text-[17px] font-light text-text outline-none focus:border-gold placeholder:text-text-faint"
                  />
                  <Button size="sm" onClick={applyCouponCode}>Apply</Button>
                </div>
              )}

              <Button fullWidth size="lg" onClick={placeOrder}>Place order · ₹{totals.total}</Button>
              <p className="mt-3 text-[15px] font-extralight text-text-faint text-center">Pay at counter on pickup</p>
            </footer>
          )}
        </div>
      )}

      {/* Product detail bottom sheet */}
      {detail && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDetail(null)} />
          <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="font-display font-light italic text-[22px] text-text">{detail.name}</div>
              <button onClick={() => setDetail(null)} className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-gold" aria-label="Close"><X size={18} /></button>
            </div>
            <div className="p-5">
              <span className="block w-8 h-0.5 mb-4 opacity-60" style={{ background: categoryColor(categories, detail.categoryId) }} />
              {detail.description && (
                <p className="text-[17px] font-light text-text-muted mb-4">{detail.description}</p>
              )}
              {!detail.description && (
                <p className="text-[17px] font-light text-text-muted mb-4">A carefully prepared {detail.name.toLowerCase()}, made to order.</p>
              )}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[15px] tracking-[0.22em] uppercase font-extralight text-text-muted">Price</span>
                <span className="font-display text-[28px] text-text">₹{detail.price}</span>
              </div>
              {selfOrderMode !== 'qr_menu' && (
                <Button fullWidth size="lg" onClick={() => { addOne(detail); setDetail(null); }}>Add to order · ₹{detail.price}</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
