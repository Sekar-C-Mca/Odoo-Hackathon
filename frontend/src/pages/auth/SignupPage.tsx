import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell, AuthLink } from './AuthShell';
import { Button, Input } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { useCatalogStore } from '../../store/catalogStore';
import { toast } from '../../components/ui/Toast';

export function SignupPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const saveEmployee = useCatalogStore((s) => s.saveEmployee);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes('@') || pin.length < 4) {
      setError('Enter a name, valid email, and a 4+ digit PIN.');
      return;
    }
    const id = `e-${Date.now()}`;
    saveEmployee({
      id,
      name: name.trim(),
      email: email.trim(),
      role: 'ADMIN',
      pin,
      active: true,
    });
    login({ id, name: name.trim(), email: email.trim(), role: 'ADMIN' }, `token-${id}`);
    toast.success('Account created.');
    navigate('/admin/dashboard');
  };

  return (
    <AuthShell sideLabel="Create account">
      <form onSubmit={submit} className="w-full max-w-sm">
        <h1 className="font-display font-light italic text-[40px] leading-none text-text mb-2">
          Create <span className="text-gold">account</span>
        </h1>
        <p className="text-[15px] tracking-[0.22em] uppercase font-extralight text-text-muted mb-8">
          Register as an owner / manager
        </p>
        <Input
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Amara Singh"
          autoComplete="name"
        />
        <div className="mt-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@cafeetoile.test"
            autoComplete="email"
          />
        </div>
        <div className="mt-5">
          <Input
            label="Choose a 4-digit PIN"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••"
            autoComplete="new-password"
          />
        </div>
        {error && (
          <p className="mt-4 text-[16px] font-light text-cancel">{error}</p>
        )}
        <div className="mt-8">
          <Button type="submit" fullWidth size="lg">
            Create account
          </Button>
        </div>
        <AuthLink to="/login" label="Sign in" prefix="Already have an account?" />
      </form>
    </AuthShell>
  );
}
