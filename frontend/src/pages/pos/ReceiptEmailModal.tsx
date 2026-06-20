import { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { toast } from '../../components/ui/Toast';

export function ReceiptEmailModal({ open, onClose, orderNum, total }: { open: boolean; onClose: () => void; orderNum: string; total: number }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const handleSend = async () => {
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSending(true);
    // Simulate email send (would be API call in production)
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setSent(true);
    toast.success(`Receipt sent to ${email}.`);
    setTimeout(() => {
      setSent(false);
      setEmail('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-sm border border-border p-6" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-gold" />
            <h3 className="font-display font-light italic text-[22px] text-text leading-none">
              Send <span className="text-gold">receipt</span>
            </h3>
          </div>
          <button onClick={onClose} className="text-text-faint hover:text-gold p-2 min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="mb-4 p-3 border border-border">
          <div className="text-[14px] tracking-[0.22em] uppercase font-extralight text-text-muted">Order {orderNum}</div>
          <div className="font-display text-[24px] text-gold mt-1">₹{total.toLocaleString('en-IN')}</div>
        </div>
        <Input
          label="Customer email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@example.com"
        />
        <Button
          fullWidth
          size="lg"
          className="mt-5"
          onClick={handleSend}
          disabled={sending || sent}
        >
          {sent ? '✓ Sent' : sending ? 'Sending...' : <><Send size={14} /> Send receipt</>}
        </Button>
      </div>
    </div>
  );
}
