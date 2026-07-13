export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  walletId: string;
}

export interface WalletBalance {
  currency: string;
  symbol?: string;
  amount: number;
  flag: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  initials: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'group_expense' | 'group_settlement' | 'wallet_funding' | 'withdrawal';
  amount: number;
  currency: string;
  symbol?: string;
  description: string;
  date: string;
  category: string;
  status: 'completed' | 'pending' | 'failed';
  recipientName?: string;
  senderName?: string;
  groupName?: string;
  userAvatar?: string;
}

export interface Group {
  id: string;
  name: string;
  icon: string;
  color: string;
  members: GroupMember[];
  expenses: GroupExpense[];
  totalExpenses: number;
  currency: string;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  balance: number;
}

export interface GroupExpense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  paidByName: string;
  paidByAvatar?: string;
  date: string;
  category: string;
  splitType: 'equal' | 'percentage' | 'custom' | 'itemized';
  shares: ExpenseShare[];
  notes?: string;
}

export interface ExpenseShare {
  memberId: string;
  memberName: string;
  amount: number;
  percentage?: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  currency: string;
  deadline?: string;
  color: string;
}

export interface AnalyticsData {
  totalSpent: number;
  totalReceived: number;
  groupExpenses: number;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyDataPoint[];
  groupComparison: GroupComparison[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyDataPoint {
  month: string;
  amount: number;
}

export interface GroupComparison {
  groupId: string;
  groupName: string;
  amount: number;
}

export type SplitType = 'equal' | 'percentage' | 'custom' | 'itemized';

export type BottomSheetType = 'addExpense' | 'settleUp' | 'transferLimits' | 'exportData' | null;
export type ModalType = 'editProfile' | 'changePassword' | 'qrCode' | 'logout' | null;
