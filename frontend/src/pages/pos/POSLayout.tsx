import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { MobileNavSheet } from '../../components/shared/MobileNavSheet';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { toast } from '../../components/ui/Toast';

const navItems = [
  { to: '/pos', label: 'Orders' },
  { to: '/pos/history', label: 'History' },
  { to: '/pos/customers', label: 'Customers' },
  { to: '/pos/tables', label: 'Tables' },
];

export function POSLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const tableLabel = useCartStore((s) => s.tableLabel);

  const handleLogout = () => {
    logout();
    toast.info('Signed out.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <header className="border-b border-border sticky top-0 z-50" style={{ background: 'var(--bg)' }}>
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="font-display font-light italic text-[22px] leading-none text-text">
            Café <span className="text-gold">Étoile</span>
          </div>
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/pos'}
                className={({ isActive }) =>
                  `text-[15px] tracking-[0.18em] uppercase font-light transition-colors ${
                    isActive ? 'text-gold' : 'text-text-muted hover:text-text'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {tableLabel && (
              <span className="text-[15px] tracking-[0.12em] uppercase font-light text-gold border border-[rgba(0,117,74,0.4)] px-3.5 py-1.5">
                Table {tableLabel}
              </span>
            )}
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-3 ml-1 pl-3 border-l border-border">
              <button onClick={handleLogout} className="text-text-muted hover:text-cancel p-2 min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Sign out">
                <LogOut size={18} />
              </button>
            </div>
            <button onClick={() => setNavOpen(true)} className="md:hidden text-text-muted hover:text-gold p-2 min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Open menu">
              <Menu size={20} />
            </button>
          </div>
        </div>
        <div className="hidden sm:block px-6 pb-2 text-[14px] tracking-[0.22em] uppercase font-extralight text-text-faint">
          {user?.name} · Session active
        </div>
      </header>
      <MobileNavSheet open={navOpen} onClose={() => setNavOpen(false)} items={navItems} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
