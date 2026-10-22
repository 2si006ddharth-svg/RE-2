'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoyaltyData {
  isRegular: boolean;
  discountPercent: number;
  daysRemaining: number;
  streakCount: number;
  expiresAt: string | null;
  lastPurchaseAt: string | null;
}

interface AuthContextType {
  user: User | null;
  loyalty: LoyaltyData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshLoyalty: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLoyalty = useCallback(async () => {
    try {
      const res = await fetch('/api/loyalty');
      if (res.ok) {
        const data = await res.json();
        setLoyalty(data.loyalty);
      } else {
        setLoyalty(null);
      }
    } catch {
      setLoyalty(null);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user) {
          await fetchLoyalty();
        } else {
          setLoyalty(null);
        }
      } else {
        setUser(null);
        setLoyalty(null);
      }
    } catch {
      setUser(null);
      setLoyalty(null);
    } finally {
      setLoading(false);
    }
  }, [fetchLoyalty]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setUser(data.user);
      await fetchLoyalty();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Try again.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      await fetchLoyalty();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setLoyalty(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loyalty,
        loading,
        login,
        register,
        logout,
        refreshLoyalty: fetchLoyalty,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
