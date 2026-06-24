import { create } from 'zustand';
import type { WalletBalance, Transaction, SavingsGoal } from '@/types';

interface WalletState {
  balances: WalletBalance[];
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  selectedCurrency: string;
  setCurrency: (currency: string) => void;
  addFunds: (amount: number, currency: string) => void;
  sendMoney: (amount: number, currency: string, recipient: string) => void;
  addTransaction: (transaction: Transaction) => void;
  addSavingsGoal: (goal: SavingsGoal) => void;
  updateGoalProgress: (id: string, amount: number) => void;
  getBalance: (currency: string) => number;
}

const initialBalances: WalletBalance[] = [
  { currency: 'INR', symbol: '₹', amount: 695730.50, flag: '🇮🇳' },
  { currency: 'USD', symbol: '$', amount: 1250.0, flag: '🇺🇸' },
  { currency: 'EUR', symbol: '€', amount: 890.75, flag: '🇪🇺' },
];

const initialTransactions: Transaction[] = [
  { id: '1', type: 'wallet_funding', amount: 670250, currency: 'INR', description: 'Added via UPI', date: '2026-06-19', category: 'Wallet', status: 'completed' },
  { id: '2', type: 'received', amount: 5000, currency: 'INR', description: 'From Rahul Sharma', date: '2026-06-16', category: 'Transfer', status: 'completed', senderName: 'Rahul Sharma', userAvatar: 'RS' },
  { id: '3', type: 'group_expense', amount: 1800, currency: 'INR', description: 'Dinner at Biryani House', date: '2026-06-15', category: 'Food', status: 'completed', groupName: 'Flatmates' },
  { id: '4', type: 'sent', amount: 2500, currency: 'INR', description: 'To Priya Kapoor', date: '2026-06-14', category: 'Transfer', status: 'completed', recipientName: 'Priya Kapoor', userAvatar: 'PK' },
  { id: '5', type: 'wallet_funding', amount: 10000, currency: 'INR', description: 'Added via UPI', date: '2026-06-12', category: 'Wallet', status: 'completed' },
  { id: '6', type: 'group_expense', amount: 4500, currency: 'INR', description: 'Goa Trip - Hotel Booking', date: '2026-06-10', category: 'Travel', status: 'completed', groupName: 'Goa Trip' },
  { id: '7', type: 'sent', amount: 1200, currency: 'INR', description: 'To Amit Verma', date: '2026-06-08', category: 'Transfer', status: 'completed', recipientName: 'Amit Verma', userAvatar: 'AV' },
  { id: '8', type: 'group_settlement', amount: 600, currency: 'INR', description: 'Settled with Rahul', date: '2026-06-07', category: 'Settlement', status: 'completed', recipientName: 'Rahul Sharma' },
  { id: '9', type: 'received', amount: 3500, currency: 'INR', description: 'From Sneha Gupta', date: '2026-06-05', category: 'Transfer', status: 'completed', senderName: 'Sneha Gupta', userAvatar: 'SG' },
  { id: '10', type: 'group_expense', amount: 2200, currency: 'INR', description: 'Movie Night - IMAX Tickets', date: '2026-06-03', category: 'Entertainment', status: 'completed', groupName: 'College Friends' },
  { id: '11', type: 'withdrawal', amount: 5000, currency: 'INR', description: 'Withdrawn to Bank', date: '2026-06-01', category: 'Wallet', status: 'completed' },
];

const initialGoals: SavingsGoal[] = [
  { id: '1', name: 'New iPhone', target: 90000, current: 45000, currency: 'INR', color: '#4F46E5', deadline: '2026-09-01' },
  { id: '2', name: 'Goa Trip Fund', target: 30000, current: 22000, currency: 'INR', color: '#10B981', deadline: '2026-07-15' },
  { id: '3', name: 'Emergency Fund', target: 100000, current: 35000, currency: 'INR', color: '#F59E0B' },
];

export const useWalletStore = create<WalletState>((set, get) => ({
  balances: initialBalances,
  transactions: initialTransactions,
  savingsGoals: initialGoals,
  selectedCurrency: 'INR',

  setCurrency: (currency) => set({ selectedCurrency: currency }),

  getBalance: (currency) => {
    const bal = get().balances.find((b) => b.currency === currency);
    return bal ? bal.amount : 0;
  },

  addFunds: (amount, currency) =>
    set((state) => ({
      balances: state.balances.map((b) =>
        b.currency === currency ? { ...b, amount: b.amount + amount } : b
      ),
    })),

  sendMoney: (amount, currency, recipient) => {
    void recipient;
    return set((state) => ({
      balances: state.balances.map((b) =>
        b.currency === currency ? { ...b, amount: b.amount - amount } : b
      ),
    }));
  },

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),

  addSavingsGoal: (goal) =>
    set((state) => ({
      savingsGoals: [...state.savingsGoals, goal],
    })),

  updateGoalProgress: (id, amount) =>
    set((state) => ({
      savingsGoals: state.savingsGoals.map((g) =>
        g.id === id ? { ...g, current: Math.min(g.current + amount, g.target) } : g
      ),
    })),
}));
