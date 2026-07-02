import { create } from 'zustand';
import type { Group, GroupExpense } from '@/types';
import { useWalletStore } from './walletStore.js';

interface GroupState {
  groups: Group[];
  currentGroupId: string | null;
  init: () => Promise<void>;
  setCurrentGroup: (id: string | null) => void;
  createGroup: (group: Omit<Group, 'id' | 'expenses' | 'totalExpenses'>) => Promise<Group | undefined>;
  addExpense: (groupId: string, expense: Omit<GroupExpense, 'id'>) => Promise<void>;
  deleteExpense: (groupId: string, expenseId: string) => Promise<void>;
  getGroup: (id: string) => Group | undefined;
  getGroupBalances: (groupId: string) => { memberId: string; memberName: string; netBalance: number }[];
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  currentGroupId: null,

  init: async () => {
    try {
      const res = await fetch('/api/groups');
      if (res.ok) {
        const groups = await res.json();
        set({ groups });
      }
    } catch (e) {
      console.error('Failed to initialize group store', e);
    }
  },

  setCurrentGroup: (id: string | null) => set({ currentGroupId: id }),

  createGroup: async (groupData) => {
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });
      if (res.ok) {
        const newGroup = await res.json();
        await get().init();
        return newGroup;
      }
    } catch (e) {
      console.error(e);
    }
  },

  addExpense: async (groupId, expense) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (res.ok) {
        await get().init();
        // Also refresh wallet store so transactions list is updated with the group expense transaction!
        await useWalletStore.getState().init();
      }
    } catch (e) {
      console.error(e);
    }
  },

  deleteExpense: async (groupId, expenseId) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/expenses/${expenseId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await get().init();
        await useWalletStore.getState().init();
      }
    } catch (e) {
      console.error(e);
    }
  },

  getGroup: (id: string) => get().groups.find((g) => g.id === id),

  getGroupBalances: (groupId: string) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group) return [];
    return group.members.map((m) => ({
      memberId: m.id,
      memberName: m.name,
      netBalance: m.balance, // Handled on-the-fly by the backend query!
    }));
  },
}));
