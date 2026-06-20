import { useEffect, useState } from 'react';

type View = 'order' | 'payment' | 'completion';

export function CustomerDisplayPage() {
  const [view, setView] = useState<View>('order');

  useEffect(() => {
    const cycle: View[] = ['order', 'payment', 'completion'];
    let idx = 0;
    setView(cycle[0]);
    const t = setInterval(() => {
      idx = (idx + 1) % cycle.length;
      setView(cycle[idx]);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const items = [
    { name: 'Flat White', qty: 2, price: 180 },
    { name: 'Avocado Toast', qty: 1, price: 320 },
    { name: 'Cold Brew', qty: 1, price: 220 },
  ];
  const total = 945;

  return (
    <div className="min-h-screen flex flex-col p-8" style={{ background: '#1E3932', color: '#FFFFFF' }}>
      <header className="flex items-center justify-between mb-12">
        <div className="font-display font-light italic text-[clamp(22px,3vw,32px)] text-[#F7F2EB]">
          Café <span className="text-gold">Étoile</span>
        </div>
        <div className="text-[14px] tracking-[0.28em] uppercase font-extralight text-[#6B6459]">Table 04</div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        {view === 'order' && (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-10">
              <div className="text-[14px] tracking-[0.28em] uppercase font-extralight text-[#6B6459] mb-2">Order</div>
              <div className="font-display font-light italic text-[clamp(40px,8vw,72px)] text-gold leading-none">#0047</div>
            </div>
            <div className="space-y-3 mb-8">
              {items.map((i, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <span className="text-[clamp(14px,2vw,20px)] font-light text-[#F7F2EB]">{i.name} <span className="text-[#6B6459]">×{i.qty}</span></span>
                  <span className="font-display text-[clamp(18px,3vw,26px)] text-[#F7F2EB]">₹{i.price * i.qty}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid rgba(0,117,74,0.2)' }}>
              <span className="text-[15px] tracking-[0.22em] uppercase font-extralight text-[#6B6459]">Total</span>
              <span className="font-display font-light text-[clamp(40px,8vw,64px)] text-text leading-none">₹{total}</span>
            </div>
          </div>
        )}

        {view === 'payment' && (
          <div className="text-center">
            <div className="text-[14px] tracking-[0.28em] uppercase font-extralight text-[#6B6459] mb-3">Amount due</div>
            <div className="font-display font-light text-[clamp(64px,16vw,128px)] text-text leading-none mb-10">₹{total}</div>
            <div className="w-48 h-48 mx-auto border flex items-center justify-center text-gold mb-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <span className="text-[15px] tracking-[0.22em] uppercase font-extralight">Scan UPI</span>
            </div>
            <div className="text-[15px] tracking-[0.22em] uppercase font-extralight text-[#6B6459]">Scan to pay · Waiting for confirmation</div>
          </div>
        )}

        {view === 'completion' && (
          <div className="text-center">
            <div className="font-display font-light italic text-[clamp(48px,10vw,96px)] text-gold leading-tight mb-6">
              Thank <span className="text-[#F7F2EB]">you</span>
            </div>
            <p className="text-[clamp(12px,2vw,16px)] font-light text-[#B5ADA3] max-w-md mx-auto">
              Your order has been received. The kitchen is already at work.
            </p>
            <div className="mt-10 text-[14px] tracking-[0.28em] uppercase font-extralight text-[#6B6459]">Café Étoile · See you soon</div>
          </div>
        )}
      </div>

      <footer className="text-[14px] tracking-[0.28em] uppercase font-extralight text-[#3A3530] text-center">
        Point of Sale · Est. MMXXVI
      </footer>
    </div>
  );
}
