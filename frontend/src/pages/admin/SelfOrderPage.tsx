import { Copy, ExternalLink, QrCode as QrIcon } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionLabel, Button, Badge } from '../../components/ui';
import { toast } from '../../components/ui/Toast';

const token = 'etoile-7421-cafe';

export function SelfOrderPage() {
  const url = `${window.location.origin}/s/${token}`;
  const copy = () => {
    navigator.clipboard?.writeText(url);
    toast.success('Link copied to clipboard.');
  };
  return (
    <div>
      <PageHeader title="Self-Order" accentWord="Self-Order" subtitle="Customer ordering portal" />
      <SectionLabel>Portal link</SectionLabel>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border mb-6">
        <div className="p-6" style={{ background: 'var(--surface)' }}>
          <div className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted mb-3">Public URL</div>
          <div className="font-display text-[20px] text-text break-all leading-tight">{url}</div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" onClick={copy}><Copy size={13} /> Copy link</Button>
            <a href={url} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="sm"><ExternalLink size={13} /> Open portal</Button>
            </a>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center justify-center" style={{ background: 'var(--surface)' }}>
          <div className="w-40 h-40 border border-border flex items-center justify-center text-gold">
            <QrIcon size={120} strokeWidth={1} />
          </div>
          <Badge variant="gold" className="mt-4">Scan to order</Badge>
        </div>
      </div>
      <SectionLabel>How it works</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border">
        {[
          { n: '01', t: 'Customer scans', d: 'Opens the mobile menu on their phone, no app required.' },
          { n: '02', t: 'Adds items & pays', d: 'Builds a cart and pays via UPI, card, or cash at counter.' },
          { n: '03', t: 'Kitchen notified', d: 'Ticket appears instantly on the KDS, ready to prep.' },
        ].map((s) => (
          <div key={s.n} className="p-6" style={{ background: 'var(--surface)' }}>
            <div className="font-display text-[34px] text-gold leading-none mb-3">{s.n}</div>
            <div className="text-[17px] tracking-[0.18em] uppercase font-light text-text mb-2">{s.t}</div>
            <p className="text-[17px] font-light text-text-muted leading-relaxed">{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
