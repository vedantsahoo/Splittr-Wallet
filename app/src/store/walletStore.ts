import { create } from 'zustand';
import type { WalletBalance, Transaction, SavingsGoal } from '@/types';

interface WalletState {
  balances: WalletBalance[];
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  contacts: any[];
  selectedCurrency: string;
  init: () => Promise<void>;
  setCurrency: (currency: string) => void;
  addFunds: (amount: number, currency: string) => Promise<void>;
  sendMoney: (amount: number, currency: string, recipientPhone: string, recipientName: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  addSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  updateGoalProgress: (id: string, amount: number) => Promise<void>;
  getBalance: (currency: string) => number;
  addContact: (name: string, phone: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balances: [],
  transactions: [],
  savingsGoals: [],
  contacts: [],
  selectedCurrency: 'INR',

  init: async () => {
    try {
      const [balRes, txRes, goalRes, contactRes] = await Promise.all([
        fetch('/api/wallet/balances'),
        fetch('/api/wallet/transactions'),
        fetch('/api/wallet/savings-goals'),
        fetch('/api/wallet/contacts')
      ]);

      if (balRes.ok && txRes.ok && goalRes.ok && contactRes.ok) {
        const balances = await balRes.json();
        const transactions = await txRes.json();
        const savingsGoals = await goalRes.json();
        const contacts = await contactRes.json();
        set({ balances, transactions, savingsGoals, contacts });
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
        await get().init();
      }
    } catch (e) {
      console.error(e);
    }
  },

  sendMoney: async (amount, currency, recipientPhone, recipientName) => {
    try {
      const res = await fetch('/api/wallet/send-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, recipientPhone, recipientName }),
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

  addContact: async (name, phone) => {
    try {
      const res = await fetch('/api/wallet/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        await get().init();
      }
    } catch (e) {
      console.error(e);
    }
  }
}));
