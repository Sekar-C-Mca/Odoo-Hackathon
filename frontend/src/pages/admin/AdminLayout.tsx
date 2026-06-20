import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { MobileNavSheet } from '../../components/shared/MobileNavSheet';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../components/ui/Toast';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/payment', label: 'Payment' },
  { to: '/admin/coupons', label: 'Coupons' },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/employees', label: 'Employees' },
  { to: '/admin/self-order', label: 'Self-Order' },
  { to: '/admin/reports', label: 'Reports' },
];

export function AdminLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.info('Signed out.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <header className="border-b border-border sticky top-0 z-50" style={{ background: 'var(--bg)' }}>
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="font-display font-light italic text-[22px] leading-none text-text">
              Café <span className="text-gold">Étoile</span>
            </div>
            <span className="hidden sm:inline text-[14px] tracking-[0.28em] uppercase font-extralight text-text-faint border-l border-border pl-3">
              Admin
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
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

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-border">
              <div className="text-right">
                <div className="text-[16px] font-light text-text leading-tight">{user?.name}</div>
                <div className="text-[14px] tracking-[0.2em] uppercase text-text-faint">{user?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="text-text-muted hover:text-cancel transition-colors p-2 min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
            <button
              onClick={() => setNavOpen(true)}
              className="md:hidden text-text-muted hover:text-gold p-2 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <MobileNavSheet open={navOpen} onClose={() => setNavOpen(false)} items={navItems} />

      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-[1400px] w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
