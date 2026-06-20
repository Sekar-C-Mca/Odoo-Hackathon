import { useState } from 'react';
import { Copy, ExternalLink, QrCode as QrIcon, Download } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionLabel, Button, Badge, Input, Select } from '../../components/ui';
import { useCatalogStore } from '../../store/catalogStore';
import { toast } from '../../components/ui/Toast';

export function SelfOrderPage() {
  const {
    selfOrderEnabled, setSelfOrderEnabled,
    selfOrderMode, setSelfOrderMode,
    selfOrderBgColor, setSelfOrderBgColor,
    selfOrderImages, setSelfOrderImages,
    tables,
  } = useCatalogStore();

  const token = 'etoile-7421-cafe';
  const url = `${window.location.origin}/s/${token}`;

  const copy = () => {
    navigator.clipboard?.writeText(url);
    toast.success('Link copied to clipboard.');
  };

  const handleImageUpload = (idx: number) => {
    const imgs = [...selfOrderImages];
    imgs[idx] = `image-${idx + 1}-${Date.now()}.jpg`;
    setSelfOrderImages(imgs);
    toast.success(`Image ${idx + 1} uploaded.`);
  };

  const downloadQR = () => {
    const lines = tables.map((t) => `Table ${t.label}: ${window.location.origin}/s/${t.token ?? token}`);
    const content = `QR Codes - Café Étoile\n${'='.repeat(40)}\n\n${lines.join('\n\n')}`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cafe-etoile-qr-codes.pdf';
    a.click();
    toast.success('QR codes downloaded.');
  };

  return (
    <div>
      <PageHeader title="Self-Order" accentWord="Self-Order" subtitle="Customer ordering portal" />

      {/* Master toggle */}
      <div className="mb-6 p-5 border border-border" style={{ background: 'var(--surface)' }}>
        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[18px] font-light text-text">Self Ordering</div>
            <div className="text-[15px] font-light text-text-muted mt-1">
              Enable or disable the customer self-ordering portal
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={selfOrderEnabled}
              onChange={(e) => setSelfOrderEnabled(e.target.checked)}
              className="sr-only"
              id="self-order-toggle"
            />
            <label
              htmlFor="self-order-toggle"
              className={`block w-14 h-8 rounded-full cursor-pointer transition-colors ${selfOrderEnabled ? 'bg-paid' : 'bg-border'}`}
            >
              <span className={`block w-6 h-6 rounded-full bg-white mt-1 transition-transform ${selfOrderEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </label>
          </div>
        </label>
      </div>

      {selfOrderEnabled && (
        <>
          {/* Sub-mode */}
          <SectionLabel>Mode</SectionLabel>
          <div className="mb-6 max-w-sm">
            <Select label="Ordering mode" value={selfOrderMode} onChange={(e) => setSelfOrderMode(e.target.value as 'online' | 'qr_menu')}>
              <option value="online">Online ordering</option>
              <option value="qr_menu">QR Menu (view only)</option>
            </Select>
          </div>

          {/* Background customization */}
          <SectionLabel>Background</SectionLabel>
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-px bg-border">
            <div className="p-5" style={{ background: 'var(--surface)' }}>
              <div className="mb-3">
                <label className="block mb-2 text-[14px] font-semibold text-text-muted">Background colour</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={selfOrderBgColor} onChange={(e) => setSelfOrderBgColor(e.target.value)} className="w-12 h-10 border border-border cursor-pointer" />
                  <span className="text-[16px] font-light text-text-muted">{selfOrderBgColor}</span>
                </div>
              </div>
            </div>
            <div className="p-5" style={{ background: 'var(--surface)' }}>
              <label className="block mb-2 text-[14px] font-semibold text-text-muted">Background images</label>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => handleImageUpload(idx)}
                    className="aspect-square border border-dashed border-border flex flex-col items-center justify-center text-text-faint hover:border-gold hover:text-gold transition-colors"
                  >
                    {selfOrderImages[idx] ? (
                      <span className="text-[12px] text-paid">✓ Image {idx + 1}</span>
                    ) : (
                      <>
                        <span className="text-[20px]">+</span>
                        <span className="text-[11px] mt-1">Image {idx + 1}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mode-specific settings */}
          {selfOrderMode === 'online' && (
            <>
              <SectionLabel>Online ordering</SectionLabel>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border mb-6">
                <div className="p-6" style={{ background: 'var(--surface)' }}>
                  <div className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted mb-3">Public URL</div>
                  <div className="font-display text-[18px] text-text break-all leading-tight">{url}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={copy}><Copy size={13} /> Copy link</Button>
                    <a href={url} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm"><ExternalLink size={13} /> Preview Webpage</Button>
                    </a>
                    <Button variant="ghost" size="sm" onClick={downloadQR}><Download size={13} /> Download QR code</Button>
                  </div>
                </div>
                <div className="p-6" style={{ background: 'var(--surface)' }}>
                  <div className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted mb-3">Payment method</div>
                  <label className="flex items-center gap-3 text-[17px] font-light text-text">
                    <input type="checkbox" checked disabled className="accent-[#00754A]" />
                    Pay at counter
                  </label>
                  <p className="text-[14px] font-light text-text-faint mt-2">This is the only available option for self-ordering.</p>
                </div>
              </div>
              <div className="p-5 border border-border mb-6" style={{ background: 'var(--surface)' }}>
                <div className="flex items-center justify-center">
                  <div className="w-40 h-40 border border-border flex items-center justify-center text-gold">
                    <QrIcon size={120} strokeWidth={1} />
                  </div>
                </div>
                <div className="text-center mt-3">
                  <Badge variant="gold">Scan to order</Badge>
                </div>
              </div>
            </>
          )}

          {selfOrderMode === 'qr_menu' && (
            <>
              <SectionLabel>QR Menu</SectionLabel>
              <div className="p-6 border border-border mb-6" style={{ background: 'var(--surface)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <QrIcon size={24} className="text-gold" />
                  <div className="text-[18px] font-light text-text">View-only menu</div>
                </div>
                <p className="text-[16px] font-light text-text-muted mb-4">
                  Customers can browse the menu but cannot place orders. The ordering functionality is disabled end-to-end.
                </p>
                <Button variant="ghost" size="sm" onClick={downloadQR}><Download size={13} /> Download QR code</Button>
              </div>
            </>
          )}

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
        </>
      )}
    </div>
  );
}
