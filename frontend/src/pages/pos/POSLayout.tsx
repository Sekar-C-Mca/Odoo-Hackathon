import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { Menu, LogOut, Users } from 'lucide-react';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { MobileNavSheet } from '../../components/shared/MobileNavSheet';
import { EmployeeSwitchPopup } from './EmployeeSwitchPopup';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useSessionStore } from '../../store/sessionStore';
import { toast } from '../../components/ui/Toast';

const navItems = [
  { to: '/pos', label: 'Orders' },
  { to: '/pos/history', label: 'History' },
  { to: '/pos/customers', label: 'Customers' },
  { to: '/pos/tables', label: 'Tables' },
];

const hamburgerItems = [
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Category' },
  { to: '/admin/payment', label: 'Payment method' },
  { to: '/admin/coupons', label: 'Coupon & Promotion' },
  { to: '/admin/tables', label: 'Booking' },
  { to: '/admin/employees', label: 'User/Employee' },
  { to: '/kds', label: 'KDS' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/login', label: 'Log-Out' },
];

export function POSLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();
  const tableLabel = useCartStore((s) => s.tableLabel);
  const { isOpen } = useSessionStore();

  const handleLogout = () => {
    clearSession();
    toast.info('Signed out.');
    navigate('/login');
  };

  if (!isOpen) {
    return <Navigate to="/pos/session" replace />;
  }

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
            <button
              onClick={() => setSwitchOpen(true)}
              className="p-2 text-text-muted hover:text-gold min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Switch employee"
              title="Switch cashier"
            >
              <Users size={18} />
            </button>
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
      <MobileNavSheet open={navOpen} onClose={() => setNavOpen(false)} items={hamburgerItems} />
      <EmployeeSwitchPopup open={switchOpen} onClose={() => setSwitchOpen(false)} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
