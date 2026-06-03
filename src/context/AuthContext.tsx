import { createContext, useContext, useState, ReactNode } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, _password: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<string, User> = {
  'owner@demo.com': { id: '1', name: '李美华', email: 'owner@demo.com', role: 'owner', avatar: '' },
  'walker@demo.com': { id: '2', name: '张大伟', email: 'walker@demo.com', role: 'walker', avatar: '' },
};

const SESSION_KEY = 'puppypaw_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = (email: string, _password: string, role: UserRole) => {
    const found = MOCK_USERS[email];
    const u = (found && found.role === role)
      ? found
      : { id: Date.now().toString(), name: email.split('@')[0], email, role };
    setUser(u);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
  };

  const logout = () => { setUser(null); sessionStorage.removeItem(SESSION_KEY); };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
