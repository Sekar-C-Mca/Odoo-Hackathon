import { Banknote, CreditCard, QrCode } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionLabel } from '../../components/ui';
import { useCatalogStore } from '../../store/catalogStore';
import { toast } from '../../components/ui/Toast';
import type { PaymentMethod } from '../../data/seed';

const icons: Record<PaymentMethod['type'], React.ReactNode> = {
  cash: <Banknote size={22} />,
  card: <CreditCard size={22} />,
  upi: <QrCode size={22} />,
};

export function PaymentMethodsPage() {
  const { paymentMethods, togglePaymentMethod } = useCatalogStore();

  return (
    <div>
      <PageHeader title="Payment" accentWord="Payment" subtitle="Accepted methods" />
      <SectionLabel>{paymentMethods.length} methods</SectionLabel>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {paymentMethods.map((m) => (
          <div key={m.id} className="border border-border p-6 flex flex-col" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center justify-between">
              <div className="text-gold">{icons[m.type]}</div>
              <span
                className={`text-[14px] tracking-[0.2em] uppercase font-extralight ${m.enabled ? 'text-paid' : 'text-text-faint'}`}
              >
                {m.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="mt-5 font-display font-light text-[26px] text-text leading-none">{m.name}</div>
            <div className="mt-1 text-[15px] tracking-[0.2em] uppercase font-extralight text-text-faint">{m.type}</div>
            <button
              onClick={() => {
                togglePaymentMethod(m.id);
                toast.info(`${m.name} ${m.enabled ? 'disabled' : 'enabled'}.`);
              }}
              className="mt-6 self-start text-[15px] tracking-[0.18em] uppercase font-light border border-border px-4 py-2 min-h-[40px] hover:border-gold text-text transition-colors"
            >
              {m.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
