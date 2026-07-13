import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, CheckCircle, Share2, Trash2,
  Utensils, Car, ShoppingBag, Film, Receipt, Plane, Apple, HeartPulse, MoreHorizontal,
} from 'lucide-react';
import { useGroupStore } from '@/store/groupStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { SplitType } from '@/types';

const categoryIcons: Record<string, React.ReactNode> = {
  'Food & Dining': <Utensils className="w-4 h-4" />,
  'Transportation': <Car className="w-4 h-4" />,
  'Shopping': <ShoppingBag className="w-4 h-4" />,
  'Entertainment': <Film className="w-4 h-4" />,
  'Bills': <Receipt className="w-4 h-4" />,
  'Travel': <Plane className="w-4 h-4" />,
  'Groceries': <Apple className="w-4 h-4" />,
  'Health': <HeartPulse className="w-4 h-4" />,
  'Others': <MoreHorizontal className="w-4 h-4" />,
};

const categories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills', 'Travel', 'Groceries', 'Health', 'Others'];
const splitTypes: SplitType[] = ['equal', 'percentage', 'custom', 'itemized'];

export default function GroupDetailsScreen() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { getGroup, addExpense, deleteExpense, deleteGroup, getGroupBalances } = useGroupStore();

  const { showToast } = useUIStore();
  const { user } = useAuthStore();

  const group = groupId ? getGroup(groupId) : undefined;
  const balances_list = groupId ? getGroupBalances(groupId) : [];
  const myMemberId = user?.id || group?.members.find(member => member.name === 'You')?.id || '';

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [showExpenseDetail, setShowExpenseDetail] = useState<string | null>(null);

  // Add expense form state
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food & Dining');
  const [expensePaidBy, setExpensePaidBy] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);

  // Settle up state
  const [settleMember, setSettleMember] = useState('');
  const [settleAmount, setSettleAmount] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  const selectedPayerId = group?.members.some(member => member.id === expensePaidBy)
    ? expensePaidBy
    : myMemberId || group?.members[0]?.id || '';

  const handleDeleteGroup = async () => {
    if (!group || isDeletingGroup) return;
    setIsDeletingGroup(true);
    try {
      await deleteGroup(group.id);
      showToast('success', `Group "${group.name}" deleted successfully.`);
      navigate('/groups');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Could not delete group');
    } finally {
      setIsDeletingGroup(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!group) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[#888] dark:text-[#94A3B8]">
        <p>Group not found</p>
      </div>
    );
  }

  const myBalance = balances_list.find(b => b.memberId === myMemberId)?.netBalance || 0;

  const handleAddExpense = async () => {
    const amount = parseFloat(expenseAmount);
    if (!expenseDesc.trim() || amount <= 0 || !selectedPayerId || isAddingExpense) return;

    const shares = group.members.map(m => {
      let shareAmount = amount / group.members.length;
      if (splitType === 'custom' && customShares[m.id]) {
        shareAmount = parseFloat(customShares[m.id]) || 0;
      }
      return {
        memberId: m.id,
        memberName: m.name,
        amount: parseFloat(shareAmount.toFixed(2)),
      };
    });

    const paidByMember = group.members.find(m => m.id === selectedPayerId);

    setIsAddingExpense(true);
    try {
      await addExpense(group.id, {
        description: expenseDesc.trim(),
        amount,
        paidBy: selectedPayerId,
        paidByName: paidByMember?.name || 'You',
        date: new Date().toISOString().split('T')[0],
        category: expenseCategory,
        splitType,
        shares,
      });

      showToast('success', `Expense "${expenseDesc}" added!`);
      setShowAddExpense(false);
      setExpenseDesc('');
      setExpenseAmount('');
      setCustomShares({});
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Could not add expense');
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleSettleUp = () => {
    const amt = parseFloat(settleAmount);
    if (amt > 0 && settleMember) {
      showToast('success', `Paid ${formatCurrency(amt, group.currency)} to settle up!`);
      setShowSettleUp(false);
      setSettleMember('');
      setSettleAmount('');
    }
  };

  const selectedExpense = group.expenses.find(e => e.id === showExpenseDetail);

  return (
    <div className="min-h-screen bg-[#ECFDF5] dark:bg-[#022C22] text-[#333] dark:text-[#E2E8F0]">
      {/* Group Header */}
      <div className="gradient-hero rounded-b-3xl p-5 pt-6 text-white relative overflow-hidden shadow-[0_8px_30px_rgb(79,70,229,0.2)] dark:shadow-none">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-white/20">
              {group.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{group.name}</h1>
              <p className="text-white/70 text-sm">{group.members.length} members</p>
            </div>
          </div>

          {/* Balance Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <div className={`px-4 py-2 rounded-full text-sm font-medium shrink-0 ${myBalance >= 0 ? 'bg-[rgba(16,185,129,0.25)] text-white' : 'bg-[rgba(239,68,68,0.25)] text-white'}`}>
              You: {myBalance >= 0 ? '+' : ''}{formatCurrency(Math.abs(myBalance), group.currency)}
            </div>
            {balances_list.filter(b => b.memberId !== myMemberId).map(b => (
              <div key={b.memberId} className="px-4 py-2 rounded-full bg-white/20 text-sm text-white/90 shrink-0">
                {b.memberName.split(' ')[0]}: {b.netBalance >= 0 ? '+' : ''}{formatCurrency(Math.abs(b.netBalance), group.currency)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 px-5 py-4  border-b border-[#F0F0F0] dark:border-[#0E6E5A]/40 sticky top-16 z-10 transition-colors">
        <button
          onClick={() => setShowAddExpense(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#10B981] text-white rounded-xl text-sm font-medium shadow-button hover:bg-[#059669] transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
        <button
          onClick={() => setShowSettleUp(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-[#10B981] dark:border-emerald-400 text-[#10B981] dark:text-emerald-400 rounded-xl text-sm font-medium hover:bg-[#10B981] dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <CheckCircle className="w-4 h-4" /> Settle Up
        </button>
        <button
          type="button"
          aria-label="Share group"
          title="Share group"
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#F5F5F5] dark:bg-[#085444] hover:bg-[#E5E5E5] dark:hover:bg-[#0E6E5A] transition-colors active:scale-95 cursor-pointer"
        >
          <Share2 className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          type="button"
          aria-label="Delete group"
          title="Delete group"
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#FEE2E2] dark:bg-red-950/40 hover:bg-[#FECACA] dark:hover:bg-red-900/40 transition-colors active:scale-95 cursor-pointer"
        >
          <Trash2 className="w-5 h-5 text-[#EF4444] dark:text-red-400" />
        </button>
      </div>

      {/* Expense List */}
      <div className="px-5 py-4 space-y-3 pb-24">
        {group.expenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] dark:bg-[#043C31] border border-[#F0F0F0]/10 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-[#CCC] dark:text-[#94A3B8]" />
            </div>
            <p className="text-[#888] dark:text-[#94A3B8] text-sm">No expenses yet</p>
            <p className="text-[#AAA] dark:text-[#475569] text-xs mt-1">Add your first expense to get started</p>
          </div>
        ) : (
          group.expenses.map((expense, idx) => {
            const myShare = expense.shares.find(s => s.memberId === myMemberId);
            const isOwed = expense.paidBy === myMemberId;
            return (
              <motion.button
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setShowExpenseDetail(expense.id)}
                className="w-full flex items-center gap-3 p-4 bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl shadow-card dark:shadow-none hover:shadow-card-hover dark:hover:bg-[#085444] transition-all text-left active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[rgba(16,185,129,0.08)] dark:bg-[rgba(52,211,153,0.15)] flex items-center justify-center text-[#10B981] dark:text-emerald-400 shrink-0">
                  {categoryIcons[expense.category] || <Receipt className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#333] dark:text-[#E2E8F0] truncate">{expense.description}</p>
                  <p className="text-xs text-[#888] dark:text-[#94A3B8]">Paid by {expense.paidByName} • {expense.shares.length} shares</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#333] dark:text-[#E2E8F0]">{formatCurrency(expense.amount, group.currency)}</p>
                  {myShare && (
                    <p className={`text-xs ${isOwed ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {isOwed ? 'You lent ' : 'You owe '}{formatCurrency(myShare.amount, group.currency)}
                    </p>
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Add Expense Bottom Sheet */}
      <AnimatePresence>
        {showAddExpense && (
          <motion.div className="fixed inset-0 z-[300] flex items-end justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowAddExpense(false)} />
            <motion.div
              className="relative bg-white dark:bg-[#043C31] border-t border-[#F0F0F0]/10 rounded-t-3xl w-full max-w-lg p-6 z-10 max-h-[85vh] overflow-y-auto"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="w-10 h-1 bg-[#E0E0E0] dark:bg-[#085444] rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-[#000] dark:text-[#E2E8F0] mb-4">Add Expense</h3>

              <input type="text" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)}
                placeholder="What's this for?" title="Expense description" className="w-full px-4 py-3 bg-transparent dark:text-[#E2E8F0] border-2 border-[#E0E0E0] dark:border-[#0E6E5A] rounded-xl text-sm focus:border-[#10B981] dark:focus:border-emerald-400 focus:outline-none mb-3 transition-all" />

              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#888] dark:text-[#94A3B8]">{formatCurrency(Number(expenseAmount), group.currency).split(' ')[0]}</span>
                <input type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)}
                  placeholder="0.00" title="Expense amount" className="w-full pl-12 pr-4 py-3 text-2xl font-bold bg-transparent dark:text-[#E2E8F0] border-2 border-[#E0E0E0] dark:border-[#0E6E5A] rounded-xl focus:border-[#10B981] dark:focus:border-emerald-400 focus:outline-none transition-all" />
              </div>

              {/* Paid By */}
              <div className="mb-3">
                <label className="text-sm font-medium text-[#333] dark:text-[#E2E8F0] mb-2 block">Paid by</label>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {group.members.map(m => (
                    <button key={m.id} onClick={() => setExpensePaidBy(m.id)}
                      className={`px-3 py-2 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${selectedPayerId === m.id ? 'bg-[#10B981] text-white' : 'bg-[#F5F5F5] dark:bg-[#085444] text-[#333] dark:text-[#E2E8F0] hover:bg-[#E5E5E5] dark:hover:bg-[#0E6E5A]'
                        }`}>{m.name}</button>
                  ))}
                </div>
              </div>

              {/* Split Type */}
              <div className="mb-3">
                <label className="text-sm font-medium text-[#333] dark:text-[#E2E8F0] mb-2 block">Split Type</label>
                <div className="flex gap-2">
                  {splitTypes.map(st => (
                    <button key={st} onClick={() => setSplitType(st)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${splitType === st ? 'bg-[#10B981] text-white shadow-sm' : 'bg-[#F5F5F5] dark:bg-[#085444] text-[#888] dark:text-[#94A3B8] hover:bg-[#E5E5E5] dark:hover:bg-[#0E6E5A]'
                        }`}>{st}</button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="text-sm font-medium text-[#333] dark:text-[#E2E8F0] mb-2 block">Category</label>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setExpenseCategory(cat)}
                      className={`px-3 py-2 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${expenseCategory === cat ? 'bg-[#10B981] text-white' : 'bg-[#F5F5F5] dark:bg-[#085444] text-[#333] dark:text-[#E2E8F0] hover:bg-[#E5E5E5] dark:hover:bg-[#0E6E5A]'
                        }`}>{cat}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleAddExpense} disabled={isAddingExpense || !expenseDesc.trim() || !expenseAmount || parseFloat(expenseAmount) <= 0 || !selectedPayerId}
                className="w-full py-4 rounded-xl bg-[#10B981] text-white font-semibold shadow-button hover:bg-[#059669] disabled:opacity-50 transition-all cursor-pointer">
                {isAddingExpense ? 'Adding...' : 'Add Expense'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settle Up Bottom Sheet */}
      <AnimatePresence>
        {showSettleUp && (
          <motion.div className="fixed inset-0 z-[300] flex items-end justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowSettleUp(false)} />
            <motion.div
              className="relative bg-white dark:bg-[#043C31] border-t border-[#F0F0F0]/10 rounded-t-3xl w-full max-w-lg p-6 z-10"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="w-10 h-1 bg-[#E0E0E0] dark:bg-[#085444] rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-[#000] dark:text-[#E2E8F0] mb-4">Settle Up</h3>

              {myBalance !== 0 && (
                <div className={`text-center p-4 rounded-2xl mb-4 ${myBalance > 0 ? 'bg-[rgba(16,185,129,0.08)] dark:bg-emerald-950/20' : 'bg-[rgba(239,68,68,0.08)] dark:bg-red-950/20'}`}>
                  <p className="text-sm text-[#888] dark:text-[#94A3B8]">{myBalance > 0 ? "You're owed" : "You owe"}</p>
                  <p className={`text-2xl font-bold ${myBalance > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {formatCurrency(Math.abs(myBalance), group.currency)}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="text-sm font-medium text-[#333] dark:text-[#E2E8F0] mb-2 block">Pay to</label>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {balances_list.filter(b => b.memberId !== myMemberId && b.netBalance < 0).map(b => (
                    <button key={b.memberId} onClick={() => setSettleMember(b.memberId)}
                      className={`px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all cursor-pointer ${settleMember === b.memberId ? 'bg-[#10B981] text-white' : 'bg-[#F5F5F5] dark:bg-[#085444] text-[#333] dark:text-[#E2E8F0] hover:bg-[#E5E5E5] dark:hover:bg-[#0E6E5A]'
                        }`}>{b.memberName}</button>
                  ))}
                </div>
              </div>

              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#888] dark:text-[#94A3B8]">Rs.</span>
                <input type="number" value={settleAmount} onChange={e => setSettleAmount(e.target.value)}
                  placeholder="0.00" title="Settling amount" className="w-full pl-12 pr-4 py-3 text-2xl font-bold bg-transparent dark:text-[#E2E8F0] border-2 border-[#E0E0E0] dark:border-[#0E6E5A] rounded-xl focus:border-[#10B981] dark:focus:border-emerald-400 focus:outline-none transition-all" />
              </div>

              <button onClick={handleSettleUp} disabled={!settleMember || !settleAmount || parseFloat(settleAmount) <= 0}
                className="w-full py-4 rounded-xl bg-[#10B981] text-white font-semibold shadow-button hover:bg-[#059669] disabled:opacity-50 transition-all cursor-pointer">
                Pay {settleAmount ? formatCurrency(parseFloat(settleAmount), group.currency) : 'Rs. 0'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expense Detail Bottom Sheet */}
      <AnimatePresence>
        {showExpenseDetail && selectedExpense && (
          <motion.div className="fixed inset-0 z-[300] flex items-end justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowExpenseDetail(null)} />
            <motion.div
              className="relative bg-white dark:bg-[#043C31] border-t border-[#F0F0F0]/10 rounded-t-3xl w-full max-w-lg p-6 z-10 max-h-[80vh] overflow-y-auto"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="w-10 h-1 bg-[#E0E0E0] dark:bg-[#085444] rounded-full mx-auto mb-6" />

              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-[#000] dark:text-[#E2E8F0]">{formatCurrency(selectedExpense.amount, group.currency)}</p>
                <p className="text-sm text-[#888] dark:text-[#94A3B8] mt-1">{formatDate(selectedExpense.date)}</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-[rgba(16,185,129,0.1)] dark:bg-[rgba(52,211,153,0.15)] text-[#10B981] dark:text-emerald-400">
                  {selectedExpense.category}
                </span>
              </div>

              <p className="text-lg font-semibold text-[#000] dark:text-[#E2E8F0] mb-1">{selectedExpense.description}</p>
              <p className="text-sm text-[#888] dark:text-[#94A3B8] mb-4">Paid by {selectedExpense.paidByName}</p>

              <h4 className="text-sm font-semibold text-[#333] dark:text-[#E2E8F0] mb-2">Split Details</h4>
              <div className="space-y-2 mb-4">
                {selectedExpense.shares.map(share => {
                  const isMe = share.memberId === myMemberId;
                  return (
                    <div key={share.memberId} className="flex items-center justify-between p-3 bg-[#ECFDF5] dark:bg-[#094F40] border border-[#F0F0F0]/5 rounded-xl">
                      <span className={`text-sm ${isMe ? 'font-semibold text-[#10B981] dark:text-emerald-400' : 'text-[#333] dark:text-[#E2E8F0]'}`}>
                        {share.memberName} {isMe && '(You)'}
                      </span>
                      <span className="text-sm font-medium text-[#333] dark:text-[#E2E8F0]">{formatCurrency(share.amount, group.currency)}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  if (isDeletingExpense) return;
                  setIsDeletingExpense(true);
                  deleteExpense(group.id, selectedExpense.id)
                    .then(() => {
                      setShowExpenseDetail(null);
                      showToast('success', 'Expense deleted');
                    })
                    .catch((error) => {
                      showToast('error', error instanceof Error ? error.message : 'Could not delete expense');
                    })
                    .finally(() => setIsDeletingExpense(false));
                }}
                disabled={isDeletingExpense}
                className="w-full py-3 rounded-xl bg-[#FEE2E2] dark:bg-[#EF4444]/10 text-[#EF4444] dark:text-red-500 font-medium hover:bg-[#FECACA] dark:hover:bg-[#EF4444]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDeletingExpense ? 'Deleting...' : 'Delete Expense'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowDeleteConfirm(false)} />
            <motion.div
              className="relative bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl w-full max-w-sm p-6 z-10 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}>
              
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-[#EF4444] dark:text-red-400" />
              </div>
              
              <h3 className="text-lg font-bold text-[#000] dark:text-[#E2E8F0] mb-2">Delete Group</h3>
              <p className="text-sm text-[#888] dark:text-[#94A3B8] mb-6">
                Are you sure you want to delete "{group.name}"? This will permanently delete all expenses and split history. This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 border border-[#E0E0E0] dark:border-[#0E6E5A] text-[#333] dark:text-[#E2E8F0] rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#085444] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGroup}
                  disabled={isDeletingGroup}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isDeletingGroup ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
