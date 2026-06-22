import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  login: () => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  updateLimits: (daily: number, monthly: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: {
        id: '1',
        name: 'Vedant Sahu',
        email: 'vedantvibhusahu1234567@gmail.com',
        phone: '+91 7007248526',
        walletId: 'SW-78456231',
      },
      isAuthenticated: true,
      dailyLimit: 500000,
      monthlyLimit: 5000000,
      login: () => set({ isAuthenticated: true, user: new Object() as User }),
      logout: () => set({ isAuthenticated: false, user: null }),
      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      updateLimits: (daily, monthly) =>
        set({ dailyLimit: daily, monthlyLimit: monthly }),
    }),
    {
      name: 'splittr-auth',
    }
  )
);
