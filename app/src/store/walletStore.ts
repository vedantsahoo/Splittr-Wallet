import { create } from 'zustand';
import { apiRequest } from '@/lib/api';
import type { Contact, WalletBalance, Transaction, SavingsGoal } from '@/types';

interface WalletState {
  balances: WalletBalance[];
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  contacts: Contact[];
  selectedCurrency: string;
  init: () => Promise<void>;
  setCurrency: (currency: string) => void;
  addFunds: (amount: number, currency: string) => Promise<void>;
  sendMoney: (amount: number, currency: string, recipientPhone: string, recipientName: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  addSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  updateGoalProgress: (id: string, amount: number) => Promise<void>;
  getBalance: (currency: string) => number;
  addContact: (name: string, phone: string) => Promise<Contact>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balances: [],
  transactions: [],
  savingsGoals: [],
  contacts: [],
  selectedCurrency: 'INR',

  init: async () => {
    const [balances, transactions, savingsGoals, contacts] = await Promise.all([
      apiRequest<WalletBalance[]>('/api/wallet/balances'),
      apiRequest<Transaction[]>('/api/wallet/transactions'),
      apiRequest<SavingsGoal[]>('/api/wallet/savings-goals'),
      apiRequest<Contact[]>('/api/wallet/contacts')
    ]);

    set({ balances, transactions, savingsGoals, contacts });
  },

  setCurrency: (currency) => set({ selectedCurrency: currency }),

  getBalance: (currency) => {
    const bal = get().balances.find((b) => b.currency === currency);
    return bal ? bal.amount : 0;
  },

  addFunds: async (amount, currency) => {
    await apiRequest<{ success: boolean; newAmount: number }>('/api/wallet/add-funds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency }),
    });
    await get().init();
  },

  sendMoney: async (amount, currency, recipientPhone, recipientName) => {
    await apiRequest<{ success: boolean; newAmount: number }>('/api/wallet/send-money', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency, recipientPhone, recipientName }),
    });
    await get().init();
  },

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),

  addSavingsGoal: async (goal) => {
    await apiRequest<SavingsGoal>('/api/wallet/savings-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    await get().init();
  },

  updateGoalProgress: async (id, amount) => {
    await apiRequest<SavingsGoal>(`/api/wallet/savings-goals/${id}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    await get().init();
  },

  addContact: async (name, phone) => {
    const contact = await apiRequest<Contact>('/api/wallet/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    });
    await get().init();
    return contact;
  }
}));
