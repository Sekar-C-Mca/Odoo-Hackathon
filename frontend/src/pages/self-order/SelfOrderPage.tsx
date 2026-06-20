import { useMemo, useState } from 'react';
import { Minus, Plus, ShoppingCart, X, ArrowRight, Check, Clock, ChefHat, Coffee } from 'lucide-react';
import { useCatalogStore, categoryColor } from '../../store/catalogStore';
import { cartTotals } from '../../store/cartStore';
import { Button, SectionLabel } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import type { Product } from '../../data/seed';

type Screen = 'menu' | 'cart' | 'status';

export function SelfOrderPage() {
  const { products, categories } = useCatalogStore();
  const [activeCat, setActiveCat] = useState('all');
  const [cart, setCart] = useState<Product[]>([]);
  const [screen, setScreen] = useState<Screen>('menu');
  const [detail, setDetail] = useState<Product | null>(null);
  const [orderNum, setOrderNum] = useState('');
  const [stage, setStage] = useState(0);

  const filtered = useMemo(
    () => products.filter((p) => p.available && (activeCat === 'all' || p.categoryId === activeCat)),
    [products, activeCat]
  );
  const totals = cartTotals(cart.map((p) => ({ id: p.id, name: p.name, price: p.price, qty: 1 })), null);

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

  const placeOrder = () => {
    if (cart.length === 0) {
      toast.error('Add items to your order first.');
      return;
    }
    const num = `#${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setOrderNum(num);
    setScreen('status');
    setStage(0);
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

  const stages = [
    { id: 1, label: 'Order received', icon: Clock, color: '#00754A' },
    { id: 2, label: 'Preparing', icon: ChefHat, color: '#3A6B8B' },
    { id: 3, label: 'Ready for pickup', icon: Coffee, color: '#4A7C59' },
  ];

  if (screen === 'status') {
    return (
      <div className="min-h-screen flex flex-col p-5 bg-bg">
        <div className="font-display font-light italic text-[26px] text-text leading-none mb-8">
          Café <span className="text-gold">Étoile</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="font-display font-light italic text-[clamp(48px,14vw,80px)] text-gold leading-none mb-4">{orderNum}</div>
          <div className="text-[15px] tracking-[0.22em] uppercase font-extralight text-text-muted mb-12">Your order is in progress</div>
          <div className="w-full max-w-md space-y-5">
            {stages.map((s) => {
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="sticky top-0 z-30 px-4 py-4 border-b border-border bg-bg">
        <div className="flex items-center justify-between">
          <div className="font-display font-light italic text-[26px] text-text leading-none">Café <span className="text-gold">Étoile</span></div>
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
      </header>

      <main className="flex-1 px-4 pb-28">
        <p className="mt-4 text-[15px] tracking-[0.22em] uppercase font-extralight text-text-muted">
          Welcome · Build your order below
        </p>
        <div className="flex gap-2 mt-3 mb-3 overflow-x-auto no-scrollbar">
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

      {cart.length > 0 && screen === 'menu' && (
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
                {Array.from(new Set(cart.map((p) => p.id))).map((id) => {
                  const p = cart.find((x) => x.id === id)!;
                  const qty = countOf(id);
                  return (
                    <div key={id} className="flex items-center justify-between py-3 border-b border-border gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[18px] font-light text-text truncate">{p.name}</div>
                        <div className="text-[15px] font-extralight text-text-faint">₹{p.price} each</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => removeOne(id)} className="w-9 h-9 flex items-center justify-center border border-border text-text-muted hover:border-gold hover:text-gold" aria-label="Decrease"><Minus size={13} /></button>
                        <span className="w-7 text-center text-[17px] font-light text-text">{qty}</span>
                        <button onClick={() => addOne(p)} className="w-9 h-9 flex items-center justify-center border border-border text-text-muted hover:border-gold hover:text-gold" aria-label="Increase"><Plus size={13} /></button>
                      </div>
                      <div className="w-16 text-right font-display text-[18px] text-text">₹{p.price * qty}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {cart.length > 0 && (
            <footer className="px-4 py-4 border-t border-border">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted">Subtotal</span>
                <span className="font-display text-[19px] text-text-muted">₹{totals.subtotal}</span>
              </div>
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted">GST 5%</span>
                <span className="font-display text-[19px] text-text-muted">₹{totals.gst}</span>
              </div>
              <div className="flex justify-between items-baseline mb-4 pt-3 border-t border-border">
                <span className="text-[14px] tracking-[0.22em] uppercase font-extralight text-gold">Total</span>
                <span className="font-display text-[30px] text-text">₹{totals.total}</span>
              </div>
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
              <p className="text-[17px] font-light text-text-muted mb-4">A carefully prepared {detail.name.toLowerCase()}, made to order.</p>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[15px] tracking-[0.22em] uppercase font-extralight text-text-muted">Price</span>
                <span className="font-display text-[28px] text-text">₹{detail.price}</span>
              </div>
              <Button fullWidth size="lg" onClick={() => { addOne(detail); setDetail(null); }}>Add to order · ₹{detail.price}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
