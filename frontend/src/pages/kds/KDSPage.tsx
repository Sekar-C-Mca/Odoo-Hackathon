import { useEffect } from 'react';
import { useKDSStore, type KDSStage } from '../../store/kdsStore';

const stages: { id: KDSStage; label: string; color: string }[] = [
  { id: 'to_cook', label: 'To cook', color: '#D4E9E2' },
  { id: 'preparing', label: 'Preparing', color: '#00A862' },
  { id: 'completed', label: 'Completed', color: '#00754A' },
];

export function KDSPage() {
  const { tickets, advanceStage, markItemDone, addTicket } = useKDSStore();

  useEffect(() => {
    if (tickets.length > 0) return;
    const seed = [
      { id: 'k-seed-1', orderNum: '#0047', tableLabel: '04', items: [{ id: 'i1', name: 'Flat White', qty: 2, done: false }, { id: 'i2', name: 'Avocado Toast', qty: 1, done: false }, { id: 'i3', name: 'Cold Brew', qty: 1, done: false }] },
      { id: 'k-seed-2', orderNum: '#0051', tableLabel: '07', items: [{ id: 'i4', name: 'Espresso', qty: 1, done: false }] },
      { id: 'k-seed-3', orderNum: '#0044', tableLabel: '09', items: [{ id: 'i5', name: 'Cappuccino', qty: 2, done: false }, { id: 'i6', name: 'Mocha', qty: 1, done: true }] },
      { id: 'k-seed-4', orderNum: '#0041', tableLabel: '03', items: [{ id: 'i7', name: 'Eggs Benedict', qty: 1, done: true }, { id: 'i8', name: 'Flat White', qty: 1, done: true }] },
    ];
    seed.forEach((s) => addTicket(s as never));
  }, [tickets.length, addTicket]);

  return (
    <div className="min-h-screen p-5 sm:p-8" style={{ background: '#1E3932', color: '#FFFFFF' }}>
      <header className="flex items-center justify-between mb-8 pb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
        <div className="font-body font-semibold text-[32px] sm:text-[38px] text-white">
          Kitchen <span className="text-gold">Display</span>
        </div>
        <div className="text-[14px] sm:text-[16px] tracking-[0.18em] uppercase font-normal text-[#AAA69E]">
          {tickets.length} active tickets
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stages.map((stage) => {
          const col = tickets.filter((t) => t.stage === stage.id);
          return (
            <div key={stage.id} className="min-h-[200px]">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2.5 h-2.5" style={{ background: stage.color }} />
                <span className="text-[15px] sm:text-[17px] tracking-[0.16em] uppercase font-normal" style={{ color: stage.color }}>{stage.label}</span>
                <span className="text-[15px] font-normal text-[#AAA69E] ml-auto">{col.length}</span>
              </div>
              <div className="space-y-3">
                {col.length === 0 && <p className="text-[17px] font-normal text-[#AAA69E] py-5">No tickets.</p>}
                {col.map((t) => {
                  const allDone = t.items.every((i) => i.done);
                  return (
                    <div
                      key={t.id}
                      className="p-5 sm:p-6 border-l-4"
                      style={{
                        background: 'rgba(255,255,255,0.055)',
                        borderColor: stage.color,
                        opacity: allDone && stage.id === 'completed' ? 0.5 : 1,
                      }}
                    >
                      <button
                        onClick={() => advanceStage(t.id)}
                        className="w-full text-left mb-4"
                        title="Click to advance stage"
                      >
                        <div className="flex items-baseline justify-between">
                          <span className="font-display text-[26px] sm:text-[30px]" style={{ color: stage.color }}>{t.orderNum}</span>
                          <span className="text-[14px] sm:text-[16px] tracking-[0.12em] uppercase font-normal text-[#AAA69E]">Table {t.tableLabel}</span>
                        </div>
                      </button>
                      {t.items.map((i) => (
                        <button
                          key={i.id}
                          onClick={() => markItemDone(t.id, i.id)}
                          className="w-full flex items-center justify-between py-3 border-b last:border-0"
                          style={{ borderColor: 'rgba(255,255,255,0.09)' }}
                        >
                          <span
                            className="text-[17px] sm:text-[19px] font-normal"
                            style={{
                              color: i.done ? 'rgba(245,247,250,0.5)' : 'rgba(245,247,250,0.92)',
                              textDecoration: i.done ? 'line-through' : 'none',
                            }}
                          >
                            {i.name}
                          </span>
                          <span className="font-body font-semibold text-[20px] sm:text-[22px]" style={{ color: i.done ? 'rgba(255,255,255,0.45)' : '#D4E9E2' }}>×{i.qty}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
