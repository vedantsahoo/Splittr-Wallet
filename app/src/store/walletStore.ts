import { create } from 'zustand';
import type { WalletBalance, Transaction, SavingsGoal } from '@/types';

interface WalletState {
  balances: WalletBalance[];
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  selectedCurrency: string;
  init: () => Promise<void>;
  setCurrency: (currency: string) => void;
  addFunds: (amount: number, currency: string) => Promise<void>;
  sendMoney: (amount: number, currency: string, recipient: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  addSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  updateGoalProgress: (id: string, amount: number) => Promise<void>;
  getBalance: (currency: string) => number;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balances: [],
  transactions: [],
  savingsGoals: [],
  selectedCurrency: 'INR',

  init: async () => {
    try {
      const [balRes, txRes, goalRes] = await Promise.all([
        fetch('/api/wallet/balances'),
        fetch('/api/wallet/transactions'),
        fetch('/api/wallet/savings-goals')
      ]);

      if (balRes.ok && txRes.ok && goalRes.ok) {
        const balances = await balRes.json();
        const transactions = await txRes.json();
        const savingsGoals = await goalRes.json();
        set({ balances, transactions, savingsGoals });
      }
    } catch (e) {
      console.error('Failed to initialize wallet store', e);
    }
  },

  setCurrency: (currency) => set({ selectedCurrency: currency }),

  getBalance: (currency) => {
    const bal = get().balances.find((b) => b.currency === currency);
    return bal ? bal.amount : 0;
  },

  addFunds: async (amount, currency) => {
    try {
      const res = await fetch('/api/wallet/add-funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency }),
      });
      if (res.ok) {
        // Refresh wallet state to get latest transactions and balances
        await get().init();
      }
    } catch (e) {
      console.error(e);
    }
  },

  sendMoney: async (amount, currency, recipient) => {
    try {
      const res = await fetch('/api/wallet/send-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, recipient }),
      });
      if (res.ok) {
        await get().init();
      }
    } catch (e) {
      console.error(e);
    }
  },

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),

  addSavingsGoal: async (goal) => {
    try {
      const res = await fetch('/api/wallet/savings-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });
      if (res.ok) {
        await get().init();
      }
    } catch (e) {
      console.error(e);
    }
  },

  updateGoalProgress: async (id, amount) => {
    try {
      const res = await fetch(`/api/wallet/savings-goals/${id}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        await get().init();
      }
    } catch (e) {
      console.error(e);
    }
  },
}));
