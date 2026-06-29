import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ConsoleUser } from '../types';
import { DEMO_LOGIN } from '../data/mockData';

interface AuthContextValue {
  user: ConsoleUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_USER: ConsoleUser = {
  id: 'cu-1',
  name: 'Selma Kauku',
  email: 'ops@ra.org.na',
  role: 'ops_manager',
  organisation: 'NAMPOL',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ConsoleUser | null>(() => {
    const stored = sessionStorage.getItem('ra_verify_console_user');
    return stored ? JSON.parse(stored) : null;
  });

  const value = useMemo(
    () => ({
      user,
      async login(email: string, password: string) {
        if (email.trim().toLowerCase() !== DEMO_LOGIN.email || password !== DEMO_LOGIN.password) {
          throw new Error('Invalid credentials. Use ops@ra.org.na / verify2026');
        }
        sessionStorage.setItem('ra_verify_console_user', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
      },
      logout() {
        sessionStorage.removeItem('ra_verify_console_user');
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
