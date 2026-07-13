import { create } from 'zustand';
import type { User } from '@/types';

interface AuthActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  register: (data: RegisterData) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateLimits: (daily: number, monthly: number) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  dailyLimit: 500000,
  monthlyLimit: 5000000,
  init: async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        set({
          user: data.user,
          isAuthenticated: data.isAuthenticated,
          dailyLimit: data.dailyLimit,
          monthlyLimit: data.monthlyLimit,
        });
      }
    } catch (e) {
      console.error('Failed to init auth store', e);
    }
  },
  login: async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        set({
          user: data.user,
          isAuthenticated: data.isAuthenticated,
          dailyLimit: data.dailyLimit,
          monthlyLimit: data.monthlyLimit,
        });
        return { success: true };
      } else {
        // Return structured error so LoginScreen can check if it is 'unregistered'
        return { success: false, error: data.error || 'Failed to login', message: data.message };
      }
    } catch (e) {
      console.error(e);
      return { success: false, error: 'network_error', message: 'Network error or server is down' };
    }
  },
  register: async (registerData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        set({
          user: data.user,
          isAuthenticated: data.isAuthenticated,
          dailyLimit: data.dailyLimit,
          monthlyLimit: data.monthlyLimit,
        });
        return { success: true };
      } else {
        return { success: false, error: data.error || 'registration_failed', message: data.message || 'Failed to register' };
      }
    } catch (e) {
      console.error(e);
      return { success: false, error: 'network_error', message: 'Network error or server is down' };
    }
  },
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout failed', e);
    }
    set({ isAuthenticated: false, user: null });
  },
  updateProfile: async (data) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        set({ user: updated });
      }
    } catch (e) {
      console.error(e);
    }
  },
  updateLimits: async (daily, monthly) => {
    try {
      const res = await fetch('/api/auth/limits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyLimit: daily, monthlyLimit: monthly }),
      });
      if (res.ok) {
        const updated = await res.json();
        set({ dailyLimit: updated.dailyLimit, monthlyLimit: updated.monthlyLimit });
      }
    } catch (e) {
      console.error(e);
    }
  },
}));
