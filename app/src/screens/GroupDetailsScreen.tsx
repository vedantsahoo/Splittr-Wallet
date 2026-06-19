import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, CheckCircle, Share2,
  Utensils, Car, ShoppingBag, Film, Receipt, Plane, Apple, HeartPulse, MoreHorizontal,
} from 'lucide-react';
import { useGroupStore } from '@/store/groupStore';
import { useUIStore } from '@/store/uiStore';
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
  const { getGroup, addExpense, deleteExpense, getGroupBalances } = useGroupStore();

  const { showToast } = useUIStore();

  const group = groupId ? getGroup(groupId) : undefined;
  const balances_list = groupId ? getGroupBalances(groupId) : [];

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [showExpenseDetail, setShowExpenseDetail] = useState<string | null>(null);

  // Add expense form state
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food & Dining');
  const [expensePaidBy, setExpensePaidBy] = useState('1');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [customShares, setCustomShares] = useState<Record<string, string>>({});

  // Settle up state
  const [settleMember, setSettleMember] = useState('');
  const [settleAmount, setSettleAmount] = useState('');

  if (!group) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-[#888]">Group not found</p>
      </div>
    );
  }

  const myBalance = balances_list.find(b => b.memberId === '1')?.netBalance || 0;

  const handleAddExpense = () => {
    const amount = parseFloat(expenseAmount);
    if (!expenseDesc.trim() || amount <= 0) return;

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

    const paidByMember = group.members.find(m => m.id === expensePaidBy);

    addExpense(group.id, {
      description: expenseDesc.trim(),
      amount,
      paidBy: expensePaidBy,
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
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Group Header */}
      <div className="gradient-hero rounded-b-3xl p-5 pt-6 text-white relative overflow-hidden">
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
            <div className={`px-4 py-2 rounded-full text-sm font-medium shrink-0 ${
              myBalance >= 0 ? 'bg-[rgba(16,185,129,0.25)] text-white' : 'bg-[rgba(239,68,68,0.25)] text-white'
            }`}>
              You: {myBalance >= 0 ? '+' : ''}{formatCurrency(Math.abs(myBalance), group.currency)}
            </div>
            {balances_list.filter(b => b.memberId !== '1').map(b => (
              <div key={b.memberId} className="px-4 py-2 rounded-full bg-white/20 text-sm text-white/90 shrink-0">
                {b.memberName.split(' ')[0]}: {b.netBalance >= 0 ? '+' : ''}{formatCurrency(Math.abs(b.netBalance), group.currency)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 px-5 py-4 bg-white border-b border-[#F0F0F0] sticky top-16 z-10">
        <button
          onClick={() => setShowAddExpense(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#4F46E5] text-white rounded-xl text-sm font-medium shadow-button hover:bg-[#3f38b7] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
        <button
          onClick={() => setShowSettleUp(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-[#4F46E5] text-[#4F46E5] rounded-xl text-sm font-medium hover:bg-[#4F46E5] hover:text-white transition-all active:scale-95"
        >
          <CheckCircle className="w-4 h-4" /> Settle Up
        </button>
        <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#F5F5F5] hover:bg-[#E5E5E5] transition-colors active:scale-95">
          <Share2 className="w-5 h-5 text-[#4F46E5]" />
        </button>
      </div>

      {/* Expense List */}
      <div className="px-5 py-4 space-y-3 pb-24">
        {group.expenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-[#CCC]" />
            </div>
            <p className="text-[#888] text-sm">No expenses yet</p>
            <p className="text-[#AAA] text-xs mt-1">Add your first expense to get started</p>
          </div>
        ) : (
          group.expenses.map((expense, idx) => {
            const myShare = expense.shares.find(s => s.memberId === '1');
            const isOwed = expense.paidBy === '1';
            return (
              <motion.button
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setShowExpenseDetail(expense.id)}
                className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all text-left active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-full bg-[rgba(79,70,229,0.08)] flex items-center justify-center text-[#4F46E5] shrink-0">
                  {categoryIcons[expense.category] || <Receipt className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#333] truncate">{expense.description}</p>
                  <p className="text-xs text-[#888]">Paid by {expense.paidByName} • {expense.shares.length} shares</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#333]">{formatCurrency(expense.amount, group.currency)}</p>
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
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddExpense(false)} />
            <motion.div
              className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 z-10 max-h-[85vh] overflow-y-auto"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="w-10 h-1 bg-[#E0E0E0] rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-[#000] mb-4">Add Expense</h3>

              <input type="text" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)}
                placeholder="What's this for?" className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl text-sm focus:border-[#4F46E5] focus:outline-none mb-3" />

              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#888]">Rs.</span>
                <input type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)}
                  placeholder="0.00" className="w-full pl-12 pr-4 py-3 text-2xl font-bold border-2 border-[#E0E0E0] rounded-xl focus:border-[#4F46E5] focus:outline-none" />
              </div>

              {/* Paid By */}
              <div className="mb-3">
                <label className="text-sm font-medium text-[#333] mb-2 block">Paid by</label>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {group.members.map(m => (
                    <button key={m.id} onClick={() => setExpensePaidBy(m.id)}
                      className={`px-3 py-2 rounded-full text-xs font-medium shrink-0 transition-all ${
                        expensePaidBy === m.id ? 'bg-[#4F46E5] text-white' : 'bg-[#F5F5F5] text-[#333]'
                      }`}>{m.name}</button>
                  ))}
                </div>
              </div>

              {/* Split Type */}
              <div className="mb-3">
                <label className="text-sm font-medium text-[#333] mb-2 block">Split Type</label>
                <div className="flex gap-2">
                  {splitTypes.map(st => (
                    <button key={st} onClick={() => setSplitType(st)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                        splitType === st ? 'bg-[#4F46E5] text-white' : 'bg-[#F5F5F5] text-[#888]'
                      }`}>{st}</button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="text-sm font-medium text-[#333] mb-2 block">Category</label>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setExpenseCategory(cat)}
                      className={`px-3 py-2 rounded-full text-xs font-medium shrink-0 transition-all ${
                        expenseCategory === cat ? 'bg-[#4F46E5] text-white' : 'bg-[#F5F5F5] text-[#333]'
                      }`}>{cat}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleAddExpense} disabled={!expenseDesc.trim() || !expenseAmount || parseFloat(expenseAmount) <= 0}
                className="w-full py-4 rounded-xl bg-[#4F46E5] text-white font-semibold shadow-button hover:bg-[#3f38b7] disabled:opacity-50 transition-all">
                Add Expense
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
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowSettleUp(false)} />
            <motion.div
              className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 z-10"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="w-10 h-1 bg-[#E0E0E0] rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-[#000] mb-4">Settle Up</h3>

              {myBalance !== 0 && (
                <div className={`text-center p-4 rounded-2xl mb-4 ${myBalance > 0 ? 'bg-[rgba(16,185,129,0.08)]' : 'bg-[rgba(239,68,68,0.08)]'}`}>
                  <p className="text-sm text-[#888]">{myBalance > 0 ? "You're owed" : "You owe"}</p>
                  <p className={`text-2xl font-bold ${myBalance > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {formatCurrency(Math.abs(myBalance), group.currency)}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="text-sm font-medium text-[#333] mb-2 block">Pay to</label>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {balances_list.filter(b => b.memberId !== '1' && b.netBalance < 0).map(b => (
                    <button key={b.memberId} onClick={() => setSettleMember(b.memberId)}
                      className={`px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all ${
                        settleMember === b.memberId ? 'bg-[#4F46E5] text-white' : 'bg-[#F5F5F5] text-[#333]'
                      }`}>{b.memberName}</button>
                  ))}
                </div>
              </div>

              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#888]">Rs.</span>
                <input type="number" value={settleAmount} onChange={e => setSettleAmount(e.target.value)}
                  placeholder="0.00" className="w-full pl-12 pr-4 py-3 text-2xl font-bold border-2 border-[#E0E0E0] rounded-xl focus:border-[#4F46E5] focus:outline-none" />
              </div>

              <button onClick={handleSettleUp} disabled={!settleMember || !settleAmount || parseFloat(settleAmount) <= 0}
                className="w-full py-4 rounded-xl bg-[#4F46E5] text-white font-semibold shadow-button hover:bg-[#3f38b7] disabled:opacity-50 transition-all">
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
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowExpenseDetail(null)} />
            <motion.div
              className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 z-10 max-h-[80vh] overflow-y-auto"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="w-10 h-1 bg-[#E0E0E0] rounded-full mx-auto mb-6" />

              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-[#000]">{formatCurrency(selectedExpense.amount, group.currency)}</p>
                <p className="text-sm text-[#888] mt-1">{formatDate(selectedExpense.date)}</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-[rgba(79,70,229,0.1)] text-[#4F46E5]">
                  {selectedExpense.category}
                </span>
              </div>

              <p className="text-lg font-semibold text-[#000] mb-1">{selectedExpense.description}</p>
              <p className="text-sm text-[#888] mb-4">Paid by {selectedExpense.paidByName}</p>

              <h4 className="text-sm font-semibold text-[#333] mb-2">Split Details</h4>
              <div className="space-y-2 mb-4">
                {selectedExpense.shares.map(share => {
                  const isMe = share.memberId === '1';
                  return (
                    <div key={share.memberId} className="flex items-center justify-between p-3 bg-[#F8F8F8] rounded-xl">
                      <span className={`text-sm ${isMe ? 'font-semibold text-[#4F46E5]' : 'text-[#333]'}`}>
                        {share.memberName} {isMe && '(You)'}
                      </span>
                      <span className="text-sm font-medium text-[#333]">{formatCurrency(share.amount, group.currency)}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  deleteExpense(group.id, selectedExpense.id);
                  setShowExpenseDetail(null);
                  showToast('success', 'Expense deleted');
                }}
                className="w-full py-3 rounded-xl bg-[#FEE2E2] text-[#EF4444] font-medium hover:bg-[#FECACA] transition-all"
              >
                Delete Expense
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
