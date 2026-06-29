import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { DEMO_LOGIN } from '../data/mockData';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_LOGIN.email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-console-bg console-grid-bg">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-console-accent/5 via-transparent to-console-gold/5" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-console-accent/15 ring-2 ring-console-accent/40 shadow-glow">
            <span className="text-2xl font-bold text-console-accent">RA</span>
          </div>
          <h1 className="text-2xl font-semibold text-console-text">Verify Console</h1>
          <p className="mt-2 text-sm text-console-muted">
            National digital driving licence verification operations
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-console-border bg-console-surface p-8 shadow-panel"
        >
          <div className="mb-6 rounded-lg border border-console-gold/30 bg-console-gold/5 px-4 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-console-gold">
              Restricted access
            </p>
            <p className="mt-1 text-xs text-console-muted">Authorised RA & NAMPOL personnel only</p>
          </div>

          {error ? (
            <div className="mb-4 rounded-lg border border-verify-invalid/40 bg-verify-invalid/10 px-4 py-3 text-sm text-verify-invalid">
              {error}
            </div>
          ) : null}

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-medium text-console-muted">Work email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-console-border bg-console-elevated px-4 py-3 text-sm focus:border-console-accent focus:outline-none"
              autoComplete="username"
            />
          </label>

          <label className="mb-6 block">
            <span className="mb-1.5 block text-xs font-medium text-console-muted">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-console-border bg-console-elevated px-4 py-3 text-sm focus:border-console-accent focus:outline-none"
              autoComplete="current-password"
            />
          </label>

          <Button type="submit" className="w-full" loading={loading}>
            Access console
          </Button>

          <p className="mt-4 text-center font-mono text-xs text-console-muted">
            Demo: {DEMO_LOGIN.email} / {DEMO_LOGIN.password}
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-console-muted">
          Roads Authority Namibia · Licence Verification Platform v1.0-prototype
        </p>
      </div>
    </div>
  );
}
