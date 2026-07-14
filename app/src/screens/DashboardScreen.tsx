import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Send, Users, TrendingUp, ArrowRight, Plus, X,
  Utensils, Car, ShoppingBag, Film, Receipt, Plane
} from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { useGroupStore } from '@/store/groupStore';
import { useUIStore } from '@/store/uiStore';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import type { Transaction, SavingsGoal } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

const categoryIconMap: Record<string, React.ReactNode> = {
  'Food & Dining': <Utensils className="w-4 h-4" />,
  'Transportation': <Car className="w-4 h-4" />,
  'Shopping': <ShoppingBag className="w-4 h-4" />,
  'Entertainment': <Film className="w-4 h-4" />,
  'Bills': <Receipt className="w-4 h-4" />,
  'Travel': <Plane className="w-4 h-4" />,
};

function TransactionItem({ tx }: { tx: Transaction }) {
  const isPositive = tx.type === 'received' || tx.type === 'wallet_funding';
  const isNegative = tx.type === 'sent' || tx.type === 'withdrawal';
  const amountColor = isPositive ? 'text-[#10B981]' : isNegative ? 'text-[#EF4444]' : 'text-[#333] dark:text-[#E2E8F0]';
  const prefix = isPositive ? '+' : isNegative ? '-' : '';

  return (
    <div className="flex items-center gap-3 py-3 px-1 hover:bg-[rgba(16,185,129,0.03)] dark:hover:bg-[rgba(52,211,153,0.05)] rounded-xl transition-colors cursor-pointer">
      <div className="w-10 h-10 rounded-full bg-[rgba(16,185,129,0.08)] dark:bg-[rgba(52,211,153,0.15)] flex items-center justify-center text-[#10B981] dark:text-emerald-400 shrink-0">
        {tx.userAvatar ? (
          <span className="text-sm font-semibold">{tx.userAvatar}</span>
        ) : (
          categoryIconMap[tx.category] || <TrendingUp className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#333] dark:text-[#E2E8F0] truncate">{tx.description}</p>
        <p className="text-xs text-[#888] dark:text-[#94A3B8]">{formatRelativeDate(tx.date)}</p>
      </div>
      <span className={`text-sm font-semibold ${amountColor} shrink-0`}>
        {prefix}{formatCurrency(tx.amount, tx.currency)}
      </span>
    </div>
  );
}

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { balances, transactions, savingsGoals, selectedCurrency, updateGoalProgress, addSavingsGoal } = useWalletStore();
  const { groups } = useGroupStore();
  const { showToast } = useUIStore();
  const currentBalance = balances.find(b => b.currency === selectedCurrency)?.amount || 0;
  const recentTransactions = transactions.slice(0, 5);

  // Savings goals state
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [progressAmount, setProgressAmount] = useState('');
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  const handleAddProgress = async () => {
    const amt = parseFloat(progressAmount);
    if (selectedGoal && amt > 0 && !isUpdatingProgress) {
      setIsUpdatingProgress(true);
      try {
        await updateGoalProgress(selectedGoal.id, amt);
        showToast('success', `Saved ₹${amt.toLocaleString()} to "${selectedGoal.name}"!`);
        setShowAddProgress(false);
        setProgressAmount('');
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Could not add savings');
      } finally {
        setIsUpdatingProgress(false);
      }
    }
  };

  const handleCreateGoal = async () => {
    const target = parseFloat(goalTarget);
    const current = parseFloat(goalCurrent || '0');
    if (goalName.trim() && target > 0 && !isCreatingGoal) {
      setIsCreatingGoal(true);
      try {
        await addSavingsGoal({
          id: `goal-${Date.now()}`,
          name: goalName.trim(),
          target,
          current,
          currency: selectedCurrency,
          color: '#10B981',
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        showToast('success', `Savings goal "${goalName}" created!`);
        setShowCreateGoal(false);
        setGoalName('');
        setGoalTarget('');
        setGoalCurrent('');
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Could not create goal');
      } finally {
        setIsCreatingGoal(false);
      }
    }
  };

  return (
    <div className="px-5 py-4 lg:px-12 lg:py-8 max-w-350 mx-auto text-[#333] dark:text-[#E2E8F0]">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Hero Banner */}
        <motion.div variants={item} className="gradient-hero rounded-3xl p-6 text-white relative overflow-hidden shadow-[0_8px_30px_rgb(79,70,229,0.3)] dark:shadow-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <p className="text-white/70 text-sm mb-1">Total Balance</p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              {formatCurrency(currentBalance, selectedCurrency)}
            </h2>
            <div className="flex gap-2 mt-4 flex-wrap">
              {balances.map(b => (
                <button
                  key={b.currency}
                  onClick={() => useWalletStore.getState().setCurrency(b.currency)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCurrency === b.currency
                    ? 'bg-white text-[#10B981]'
                    : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                >
                  {b.flag} {b.currency} {b.symbol}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="grid grid-cols-4 gap-3 mt-5">
          {[
            { icon: Send, label: 'Send', path: '/send', color: '#10B981' },
            { icon: Wallet, label: 'Add Money', path: '/wallet', color: '#10B981' },
            { icon: Users, label: 'Split Bill', path: '/groups', color: '#F59E0B' },
            { icon: TrendingUp, label: 'Analytics', path: '/analytics', color: '#0D9488' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 shadow-card dark:shadow-none hover:shadow-card-hover dark:hover:bg-[#085444] transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${action.color}15` }}>
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <span className="text-xs font-medium text-[#333] dark:text-[#E2E8F0]">{action.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={item} className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-black dark:text-[#E2E8F0]">Recent Transactions</h3>
            <button onClick={() => navigate('/wallet')} className="text-sm text-[#10B981] dark:text-emerald-400 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-4 shadow-card dark:shadow-none transition-colors">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(tx => (
                <TransactionItem key={tx.id} tx={tx} />
              ))
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-[#888] dark:text-[#94A3B8]">No recent transactions</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Groups Preview */}
        <motion.div variants={item} className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-black dark:text-[#E2E8F0]">Your Groups</h3>
            <button onClick={() => navigate('/groups')} className="text-sm text-[#10B981] dark:text-emerald-400 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
            {groups.map(group => (
              <button
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="snap-start shrink-0 w-36 bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-4 shadow-card dark:shadow-none hover:shadow-card-hover dark:hover:bg-[#085444] transition-all text-left active:scale-95 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2" style={{ backgroundColor: `${group.color}15` }}>
                  {group.icon}
                </div>
                <p className="text-sm font-semibold text-[#333] dark:text-[#E2E8F0] truncate">{group.name}</p>
                <p className="text-xs text-[#888] dark:text-[#94A3B8] mt-0.5">{group.members.length} members</p>
                <p className="text-xs font-medium mt-1" style={{ color: group.color }}>
                  {formatCurrency(group.totalExpenses, group.currency)}
                </p>
              </button>
            ))}
            <button
              onClick={() => navigate('/groups')}
              className="snap-start shrink-0 w-36 rounded-2xl p-4 border-2 border-dashed border-[#E0E0E0] dark:border-[#0E6E5A] flex flex-col items-center justify-center gap-2 hover:border-[#10B981] dark:hover:border-emerald-400 transition-colors active:scale-95 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] dark:bg-[#094F40] flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#888] dark:text-[#94A3B8]" />
              </div>
              <span className="text-xs font-medium text-[#888] dark:text-[#94A3B8]">New Group</span>
            </button>
          </div>
        </motion.div>

        {/* Savings Goals */}
        <motion.div variants={item} className="mt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-black dark:text-[#E2E8F0]">Savings Goals</h3>
            <button
              onClick={() => setShowCreateGoal(true)}
              className="text-sm text-[#10B981] dark:text-emerald-400 font-medium cursor-pointer"
            >
              New Goal
            </button>
          </div>
          <div className="space-y-3">
            {savingsGoals.length > 0 ? (
              savingsGoals.map(goal => (
                <div key={goal.id} className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-4 shadow-card dark:shadow-none transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#333] dark:text-[#E2E8F0]">{goal.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: goal.color }}>
                        {Math.round((goal.current / goal.target) * 100)}%
                      </span>
                      <button
                        onClick={() => { setSelectedGoal(goal); setProgressAmount(''); setShowAddProgress(true); }}
                        title="Add savings"
                        className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center text-white text-[10px] hover:bg-[#059669] transition-all cursor-pointer active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[#F0F0F0] dark:bg-[#094F40] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: goal.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-[#888] dark:text-[#94A3B8]">{formatCurrency(goal.current, goal.currency)}</span>
                    <span className="text-xs text-[#888] dark:text-[#94A3B8]">{formatCurrency(goal.target, goal.currency)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl">
                <p className="text-sm text-[#888] dark:text-[#94A3B8]">No savings goals yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Add Progress Modal */}
      <AnimatePresence>
        {showAddProgress && selectedGoal && (
          <motion.div className="fixed inset-0 z-[400] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowAddProgress(false)} />
            <motion.div
              className="relative bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-3xl p-6 z-10 w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}>
              
              <button onClick={() => setShowAddProgress(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#085444] cursor-pointer">
                <X className="w-5 h-5 text-[#888] dark:text-[#94A3B8]" />
              </button>

              <h3 className="text-lg font-semibold text-[#000] dark:text-white mb-1">Save for Goal</h3>
              <p className="text-xs text-[#888] dark:text-[#94A3B8] mb-4">Transfer money from your wallet to "{selectedGoal.name}"</p>
              
              <div className="mb-6">
                <label className="text-sm font-medium text-[#333] dark:text-[#E2E8F0] mb-2 block">Amount ({selectedGoal.currency})</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#888] dark:text-[#94A3B8]">
                    {selectedGoal.currency === 'INR' ? '₹' : selectedGoal.currency === 'USD' ? '$' : '€'}
                  </span>
                  <input
                    type="number"
                    value={progressAmount}
                    onChange={(e) => setProgressAmount(e.target.value)}
                    placeholder="0.00"
                    title="Saving amount"
                    className="w-full pl-12 pr-4 py-3 text-2xl font-bold bg-transparent dark:text-[#E2E8F0] border-2 border-[#E0E0E0] dark:border-[#0E6E5A] rounded-xl focus:border-[#10B981] dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/10 transition-all"
                  />
                </div>
                <p className="text-[10px] text-[#888] dark:text-[#94A3B8] mt-2">
                  Goal Status: {formatCurrency(selectedGoal.current, selectedGoal.currency)} / {formatCurrency(selectedGoal.target, selectedGoal.currency)}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button onClick={() => setShowAddProgress(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-[#E0E0E0] dark:border-[#0E6E5A] text-sm font-medium text-[#333] dark:text-[#E2E8F0] hover:bg-[#ECFDF5] dark:hover:bg-[#085444] cursor-pointer">Cancel</button>
                <button onClick={handleAddProgress} disabled={isUpdatingProgress || !progressAmount || parseFloat(progressAmount) <= 0}
                  className="flex-1 py-3 rounded-xl bg-[#10B981] text-white text-sm font-medium shadow-button hover:bg-[#059669] cursor-pointer">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showCreateGoal && (
          <motion.div className="fixed inset-0 z-[400] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowCreateGoal(false)} />
            <motion.div
              className="relative bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-3xl p-6 z-10 w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}>
              
              <button onClick={() => setShowCreateGoal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#085444] cursor-pointer">
                <X className="w-5 h-5 text-[#888] dark:text-[#94A3B8]" />
              </button>

              <h3 className="text-lg font-semibold text-[#000] dark:text-white mb-4">Create Savings Goal</h3>
              
              <div className="mb-4">
                <label htmlFor="goal-name-input" className="text-sm font-medium text-[#333] dark:text-[#E2E8F0] mb-2 block">Goal Name</label>
                <input id="goal-name-input" type="text" value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="e.g. New Laptop, Vacation" title="Goal Name"
                  className="w-full px-4 py-3 bg-transparent border-2 border-[#E0E0E0] dark:border-[#0E6E5A] dark:text-white rounded-xl text-sm focus:border-[#10B981] dark:focus:border-emerald-400 focus:outline-none" />
              </div>

              <div className="mb-4">
                <label htmlFor="goal-target-input" className="text-sm font-medium text-[#333] dark:text-[#E2E8F0] mb-2 block">Target Amount ({selectedCurrency})</label>
                <input id="goal-target-input" type="number" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} placeholder="0.00" title="Target Amount"
                  className="w-full px-4 py-3 bg-transparent border-2 border-[#E0E0E0] dark:border-[#0E6E5A] dark:text-white rounded-xl text-sm focus:border-[#10B981] dark:focus:border-emerald-400 focus:outline-none" />
              </div>

              <div className="mb-6">
                <label htmlFor="goal-initial-input" className="text-sm font-medium text-[#333] dark:text-[#E2E8F0] mb-2 block">Initial Savings ({selectedCurrency})</label>
                <input id="goal-initial-input" type="number" value={goalCurrent} onChange={e => setGoalCurrent(e.target.value)} placeholder="0.00 (optional)" title="Initial Savings"
                  className="w-full px-4 py-3 bg-transparent border-2 border-[#E0E0E0] dark:border-[#0E6E5A] dark:text-white rounded-xl text-sm focus:border-[#10B981] dark:focus:border-emerald-400 focus:outline-none" />
              </div>
              
              <div className="flex gap-3">
                <button onClick={() => setShowCreateGoal(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-[#E0E0E0] dark:border-[#0E6E5A] text-sm font-medium text-[#333] dark:text-[#E2E8F0] hover:bg-[#ECFDF5] dark:hover:bg-[#085444] cursor-pointer">Cancel</button>
                <button onClick={handleCreateGoal} disabled={isCreatingGoal || !goalName.trim() || !goalTarget || parseFloat(goalTarget) <= 0}
                  className="flex-1 py-3 rounded-xl bg-[#10B981] text-white text-sm font-medium shadow-button hover:bg-[#059669] cursor-pointer">Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
