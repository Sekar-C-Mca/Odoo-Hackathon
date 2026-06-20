import { useState } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionLabel, Badge, Button } from '../../components/ui';
import { FloorPopup } from './FloorPopup';
import { useCatalogStore } from '../../store/catalogStore';
import { useCartStore } from '../../store/cartStore';
import { useNavigate } from 'react-router-dom';

const statusVariant = (s: string) =>
  s === 'occupied' ? 'paid' : s === 'reserved' ? 'cancel' : 'stone';

export function TablesView() {
  const { floors, tables, saveTable } = useCatalogStore();
  const { setTable, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [floorOpen, setFloorOpen] = useState(false);
  const [activeFloor, setActiveFloor] = useState(floors[0]?.id ?? '');

  const floorTables = tables.filter((t) => t.floorId === activeFloor);

  const select = (id: string, label: string, status: string) => {
    if (status === 'reserved') return;
    setTable(id, label);
    if (status === 'available') {
      saveTable({ ...tables.find((t) => t.id === id)!, status: 'occupied' });
    }
    clearCart();
    navigate('/pos');
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Floor"
        accentWord="Floor"
        subtitle="Select a table to begin"
        actions={<Button size="md" onClick={() => setFloorOpen(true)}>Open floor map</Button>}
      />
      <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
        {floors.map((f) => (
          <button key={f.id} onClick={() => setActiveFloor(f.id)} className={`px-4 py-2 text-[15px] tracking-[0.18em] uppercase font-light whitespace-nowrap min-h-[40px] ${activeFloor === f.id ? 'text-gold border border-[rgba(0,117,74,0.4)] bg-[rgba(0,117,74,0.05)]' : 'text-text-muted border border-border'}`}>{f.name}</button>
        ))}
      </div>
      <SectionLabel>{floorTables.length} tables</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {floorTables.map((t) => (
          <button
            key={t.id}
            onClick={() => select(t.id, t.label, t.status)}
            disabled={t.status === 'reserved'}
            className="aspect-[4/3] flex flex-col items-center justify-center border p-4 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: t.status === 'occupied' ? 'rgba(0,117,74,0.06)' : 'var(--surface-raised)',
              borderColor: t.status === 'occupied' ? 'rgba(0,117,74,0.35)' : 'var(--border)',
            }}
          >
            <span className="font-display text-[26px] text-text leading-none">{t.label}</span>
            <span className="mt-2 text-[14px] tracking-[0.18em] uppercase font-extralight text-text-faint">{t.seats} seats</span>
            <div className="mt-2"><Badge variant={statusVariant(t.status)}>{t.status}</Badge></div>
          </button>
        ))}
      </div>
      <FloorPopup open={floorOpen} onClose={() => setFloorOpen(false)} />
    </div>
  );
}
