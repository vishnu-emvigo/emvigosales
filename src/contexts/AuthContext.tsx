import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'admin' | 'sales_admin' | 'sales_rep';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role?: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<UserRole, User> = {
  admin: { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin' },
  sales_admin: { id: '2', name: 'Sarah Manager', email: 'sarah@company.com', role: 'sales_admin' },
  sales_rep: { id: '3', name: 'John Sales', email: 'john@company.com', role: 'sales_rep' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((role: UserRole = 'sales_admin') => {
    setUser(DEMO_USERS[role]);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
