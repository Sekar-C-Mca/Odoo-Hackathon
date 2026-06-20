import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell, AuthLink } from './AuthShell';
import { Button, Input } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { useCatalogStore } from '../../store/catalogStore';
import { toast } from '../../components/ui/Toast';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const employees = useCatalogStore((s) => s.employees);
  const [email, setEmail] = useState('amara@cafeetoile.test');
  const [pin, setPin] = useState('1111');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(
      (x) =>
        x.email.toLowerCase() === email.trim().toLowerCase() &&
        x.pin === pin &&
        x.active
    );
    if (!emp) {
      setError('Invalid credentials or inactive employee.');
      return;
    }
    login(
      { id: emp.id, name: emp.name, email: emp.email, role: emp.role },
      `token-${emp.id}-${Date.now()}`
    );
    toast.success(`Welcome back, ${emp.name.split(' ')[0]}.`);
    navigate(emp.role === 'ADMIN' ? '/admin/dashboard' : '/pos');
  };

  return (
    <AuthShell sideLabel="Sign in">
      <form onSubmit={submit} className="w-full max-w-sm">
        <h1 className="font-display font-light italic text-[40px] leading-none text-text mb-2">
          Sign <span className="text-gold">in</span>
        </h1>
        <p className="text-[15px] tracking-[0.22em] uppercase font-extralight text-text-muted mb-8">
          Café Étoile staff access
        </p>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@cafeetoile.test"
          autoComplete="username"
        />
        <div className="mt-5">
          <Input
            label="PIN"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            autoComplete="current-password"
          />
        </div>
        {error && (
          <p className="mt-4 text-[16px] font-light text-cancel">{error}</p>
        )}
        <div className="mt-8">
          <Button type="submit" fullWidth size="lg">
            Enter terminal
          </Button>
        </div>
        <AuthLink to="/signup" label="Create account" prefix="New here?" />
        <div className="mt-8 p-4 border border-border text-[15px] font-light text-text-muted leading-relaxed">
          <span className="tracking-[0.18em] uppercase text-gold">Demo logins</span>
          <br />
          Admin · amara@cafeetoile.test / 1111
          <br />
          Employee · lea@cafeetoile.test / 2222
        </div>
      </form>
    </AuthShell>
  );
}
