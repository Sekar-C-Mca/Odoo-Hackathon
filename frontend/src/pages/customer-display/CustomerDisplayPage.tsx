import { useMemo } from 'react';
import { QrCode as QrIcon } from 'lucide-react';
import { useCartStore, cartTotals } from '../../store/cartStore';

export function CustomerDisplayPage() {
  const { items, tableLabel, coupon, customer } = useCartStore();
  const totals = useMemo(() => cartTotals(items, coupon), [items, coupon]);

  // If cart is empty, show a "thank you / idle" screen
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col p-8" style={{ background: '#1E3932', color: '#FFFFFF' }}>
        <header className="flex items-center justify-between mb-12">
          <div className="font-display font-light italic text-[clamp(22px,3vw,32px)] text-[#F7F2EB]">
            Café <span className="text-gold">Étoile</span>
          </div>
          {tableLabel && (
            <div className="text-[14px] tracking-[0.28em] uppercase font-extralight text-[#6B6459]">Table {tableLabel}</div>
          )}
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="font-display font-light italic text-[clamp(48px,10vw,96px)] text-gold leading-tight mb-6">
            Welcome
          </div>
          <p className="text-[clamp(12px,2vw,18px)] font-light text-[#B5ADA3] max-w-md mx-auto mb-8">
            Scan the QR code at your table to browse our menu and place an order, or let your server know what you'd like.
          </p>
          <div className="w-32 h-32 border flex items-center justify-center text-gold" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <QrIcon size={80} strokeWidth={1} />
          </div>
          <div className="mt-8 text-[14px] tracking-[0.28em] uppercase font-extralight text-[#3A3530]">
            Café Étoile · Est. MMXXVI
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-8" style={{ background: '#1E3932', color: '#FFFFFF' }}>
      <header className="flex items-center justify-between mb-12">
        <div className="font-display font-light italic text-[clamp(22px,3vw,32px)] text-[#F7F2EB]">
          Café <span className="text-gold">Étoile</span>
        </div>
        <div className="text-[14px] tracking-[0.28em] uppercase font-extralight text-[#6B6459]">
          {tableLabel ? `Table ${tableLabel}` : 'Takeaway'}
          {customer && ` · ${customer.name}`}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <div className="text-[14px] tracking-[0.28em] uppercase font-extralight text-[#6B6459] mb-2">Current Order</div>
            <div className="font-display font-light italic text-[clamp(40px,8vw,72px)] text-gold leading-none">
              {items.length} items
            </div>
          </div>
          <div className="space-y-3 mb-8">
            {items.map((i) => (
              <div key={i.id} className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="text-[clamp(14px,2vw,20px)] font-light text-[#F7F2EB]">
                  {i.name} <span className="text-[#6B6459]">×{i.qty}</span>
                </span>
                <span className="font-display text-[clamp(18px,3vw,26px)] text-[#F7F2EB]">₹{i.price * i.qty}</span>
              </div>
            ))}
          </div>
          {totals.itemDiscounts > 0 && (
            <div className="flex justify-between items-center py-2" style={{ borderTop: '1px solid rgba(0,117,74,0.2)' }}>
              <span className="text-[15px] tracking-[0.22em] uppercase font-extralight text-[#6B6459]">Item Discounts</span>
              <span className="font-display text-[clamp(18px,3vw,22px)] text-[#D97706]">−₹{totals.itemDiscounts}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2">
            <span className="text-[15px] tracking-[0.22em] uppercase font-extralight text-[#6B6459]">GST 5%</span>
            <span className="font-display text-[clamp(18px,3vw,22px)] text-[#F7F2EB]">₹{totals.gst}</span>
          </div>
          {totals.orderDiscount > 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="text-[15px] tracking-[0.22em] uppercase font-extralight text-[#6B6459]">Coupon</span>
              <span className="font-display text-[clamp(18px,3vw,22px)] text-[#D97706]">−₹{totals.orderDiscount}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid rgba(0,117,74,0.2)' }}>
            <span className="text-[15px] tracking-[0.22em] uppercase font-extralight text-[#6B6459]">Total</span>
            <span className="font-display font-light text-[clamp(40px,8vw,64px)] text-text leading-none">₹{totals.total}</span>
          </div>
        </div>
      </div>

      <footer className="text-[14px] tracking-[0.28em] uppercase font-extralight text-[#3A3530] text-center">
        Point of Sale · Est. MMXXVI
      </footer>
    </div>
  );
}
