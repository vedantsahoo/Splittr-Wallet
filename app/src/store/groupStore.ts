import { create } from 'zustand';
import { apiRequest } from '@/lib/api';
import type { Group, GroupExpense } from '@/types';
import { useWalletStore } from './walletStore.js';

interface GroupState {
  groups: Group[];
  currentGroupId: string | null;
  init: () => Promise<void>;
  setCurrentGroup: (id: string | null) => void;
  createGroup: (group: Omit<Group, 'id' | 'expenses' | 'totalExpenses'>) => Promise<Group | undefined>;
  addExpense: (groupId: string, expense: Omit<GroupExpense, 'id'>) => Promise<Group>;
  deleteExpense: (groupId: string, expenseId: string) => Promise<Group>;
  deleteGroup: (id: string) => Promise<void>;
  getGroup: (id: string) => Group | undefined;
  getGroupBalances: (groupId: string) => { memberId: string; memberName: string; netBalance: number }[];
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  currentGroupId: null,

  init: async () => {
    const groups = await apiRequest<Group[]>('/api/groups');
    set({ groups });
  },

  setCurrentGroup: (id: string | null) => set({ currentGroupId: id }),

  createGroup: async (groupData) => {
    const newGroup = await apiRequest<Group>('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData),
    });
    await get().init();
    return newGroup;
  },

  addExpense: async (groupId, expense) => {
    const group = await apiRequest<Group>(`/api/groups/${groupId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    await get().init();
    await useWalletStore.getState().init();
    return group;
  },

  deleteExpense: async (groupId, expenseId) => {
    const group = await apiRequest<Group>(`/api/groups/${groupId}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
    await get().init();
    await useWalletStore.getState().init();
    return group;
  },

  deleteGroup: async (id) => {
    await apiRequest(`/api/groups/${id}`, {
      method: 'DELETE',
    });
    await get().init();
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
