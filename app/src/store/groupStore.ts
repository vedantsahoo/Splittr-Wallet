import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Group, GroupExpense } from '@/types';

interface GroupState {
  groups: Group[];
  currentGroupId: string | null;
  setCurrentGroup: (id: string | null) => void;
  createGroup: (group: Omit<Group, 'id' | 'expenses' | 'totalExpenses'>) => Group;
  addExpense: (groupId: string, expense: Omit<GroupExpense, 'id'>) => void;
  deleteExpense: (groupId: string, expenseId: string) => void;
  getGroup: (id: string) => Group | undefined;
  getGroupBalances: (groupId: string) => { memberId: string; memberName: string; netBalance: number }[];
}

const initialGroups: Group[] = [
  {
    id: '1',
    name: 'Flatmates',
    icon: '🏠',
    color: '#4F46E5',
    currency: 'INR',
    members: [
      { id: '1', name: 'You', initials: 'VS', balance: 1250 },
      { id: '2', name: 'Rahul Sharma', initials: 'RS', balance: -1250 },
      { id: '3', name: 'Priya Kapoor', initials: 'PK', balance: 0 },
      { id: '4', name: 'Amit Verma', initials: 'AV', balance: 0 },
    ],
    expenses: [
      {
        id: 'e1',
        description: 'Dinner at Biryani House',
        amount: 1800,
        paidBy: '2',
        paidByName: 'Rahul Sharma',
        date: '2026-06-15',
        category: 'Food & Dining',
        splitType: 'equal',
        shares: [
          { memberId: '1', memberName: 'You', amount: 450 },
          { memberId: '2', memberName: 'Rahul Sharma', amount: 450 },
          { memberId: '3', memberName: 'Priya Kapoor', amount: 450 },
          { memberId: '4', memberName: 'Amit Verma', amount: 450 },
        ],
      },
      {
        id: 'e2',
        description: 'Monthly Groceries',
        amount: 3200,
        paidBy: '1',
        paidByName: 'You',
        date: '2026-06-10',
        category: 'Groceries',
        splitType: 'equal',
        shares: [
          { memberId: '1', memberName: 'You', amount: 800 },
          { memberId: '2', memberName: 'Rahul Sharma', amount: 800 },
          { memberId: '3', memberName: 'Priya Kapoor', amount: 800 },
          { memberId: '4', memberName: 'Amit Verma', amount: 800 },
        ],
      },
    ],
    totalExpenses: 5000,
  },
  {
    id: '2',
    name: 'Goa Trip',
    icon: '🏖️',
    color: '#10B981',
    currency: 'INR',
    members: [
      { id: '1', name: 'You', initials: 'VS', balance: -2200 },
      { id: '2', name: 'Rahul Sharma', initials: 'RS', balance: 2200 },
      { id: '5', name: 'Sneha Gupta', initials: 'SG', balance: 0 },
    ],
    expenses: [
      {
        id: 'e3',
        description: 'Hotel Booking - 3 Nights',
        amount: 12000,
        paidBy: '2',
        paidByName: 'Rahul Sharma',
        date: '2026-06-10',
        category: 'Travel',
        splitType: 'equal',
        shares: [
          { memberId: '1', memberName: 'You', amount: 4000 },
          { memberId: '2', memberName: 'Rahul Sharma', amount: 4000 },
          { memberId: '5', memberName: 'Sneha Gupta', amount: 4000 },
        ],
      },
      {
        id: 'e4',
        description: 'Scooter Rental',
        amount: 2400,
        paidBy: '1',
        paidByName: 'You',
        date: '2026-06-08',
        category: 'Transportation',
        splitType: 'equal',
        shares: [
          { memberId: '1', memberName: 'You', amount: 800 },
          { memberId: '2', memberName: 'Rahul Sharma', amount: 800 },
          { memberId: '5', memberName: 'Sneha Gupta', amount: 800 },
        ],
      },
    ],
    totalExpenses: 14400,
  },
  {
    id: '3',
    name: 'College Friends',
    icon: '🎓',
    color: '#F59E0B',
    currency: 'INR',
    members: [
      { id: '1', name: 'You', initials: 'VS', balance: 550 },
      { id: '2', name: 'Rahul Sharma', initials: 'RS', balance: 0 },
      { id: '6', name: 'Neha Patel', initials: 'NP', balance: -550 },
    ],
    expenses: [
      {
        id: 'e5',
        description: 'Movie Night - IMAX Tickets',
        amount: 3300,
        paidBy: '1',
        paidByName: 'You',
        date: '2026-06-03',
        category: 'Entertainment',
        splitType: 'equal',
        shares: [
          { memberId: '1', memberName: 'You', amount: 1100 },
          { memberId: '2', memberName: 'Rahul Sharma', amount: 1100 },
          { memberId: '6', memberName: 'Neha Patel', amount: 1100 },
        ],
      },
    ],
    totalExpenses: 3300,
  },
  {
    id: '4',
    name: 'Birthday Bash',
    icon: '🎉',
    color: '#EC4899',
    currency: 'INR',
    members: [
      { id: '1', name: 'You', initials: 'VS', balance: 0 },
      { id: '3', name: 'Priya Kapoor', initials: 'PK', balance: 0 },
      { id: '5', name: 'Sneha Gupta', initials: 'SG', balance: 0 },
    ],
    expenses: [],
    totalExpenses: 0,
  },
];

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      groups: initialGroups,
      currentGroupId: null,
      setCurrentGroup: (id: string | null) => set({ currentGroupId: id }),

      createGroup: (groupData: Omit<Group, 'id' | 'expenses' | 'totalExpenses'>) => {
        const newGroup: Group = {
          ...groupData,
          id: Date.now().toString(),
          expenses: [],
          totalExpenses: 0,
        };
        set((state) => ({ groups: [...state.groups, newGroup] }));
        return newGroup;
      },

      addExpense: (groupId: string, expense: Omit<GroupExpense, 'id'>) =>
        set((state) => ({
          groups: state.groups.map((g) => {
            if (g.id === groupId) {
              const newExpense = { ...expense, id: `e${Date.now()}` };
              return {
                ...g,
                expenses: [newExpense, ...g.expenses],
                totalExpenses: g.totalExpenses + expense.amount,
              };
            }
            return g;
          }),
        })),

      deleteExpense: (groupId: string, expenseId: string) =>
        set((state) => ({
          groups: state.groups.map((g) => {
            if (g.id === groupId) {
              const expense = g.expenses.find((e) => e.id === expenseId);
              return {
                ...g,
                expenses: g.expenses.filter((e) => e.id !== expenseId),
                totalExpenses: g.totalExpenses - (expense?.amount || 0),
              };
            }
            return g;
          }),
        })),

      getGroup: (id: string) => get().groups.find((g) => g.id === id),

      getGroupBalances: (groupId: string) => {
        const group = get().groups.find((g) => g.id === groupId);
        if (!group) return [];
        const memberBalances: Record<string, { name: string; paid: number; owed: number }> = {};
        group.members.forEach((m) => {
          memberBalances[m.id] = { name: m.name, paid: 0, owed: 0 };
        });
        group.expenses.forEach((exp) => {
          if (memberBalances[exp.paidBy]) {
            memberBalances[exp.paidBy].paid += exp.amount;
          }
          exp.shares.forEach((share) => {
            if (memberBalances[share.memberId]) {
              memberBalances[share.memberId].owed += share.amount;
            }
          });
        });
        return Object.entries(memberBalances).map(([memberId, data]) => ({
          memberId,
          memberName: data.name,
          netBalance: data.paid - data.owed,
        }));
      },
    }),
    {
      name: 'splittr-groups',
    }
  )
);
