import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  Wallet, Send, Users, TrendingUp, ArrowRight, Plus,
  Utensils, Car, ShoppingBag, Film, Receipt, Plane,
} from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { useGroupStore } from '@/store/groupStore';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import type { Transaction } from '@/types';

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
  const amountColor = isPositive ? 'text-[#10B981]' : isNegative ? 'text-[#EF4444]' : 'text-[#333]';
  const prefix = isPositive ? '+' : isNegative ? '-' : '';

  return (
    <div className="flex items-center gap-3 py-3 px-1 hover:bg-[rgba(79,70,229,0.03)] rounded-xl transition-colors cursor-pointer">
      <div className="w-10 h-10 rounded-full bg-[rgba(79,70,229,0.08)] flex items-center justify-center text-[#4F46E5] shrink-0">
        {tx.userAvatar ? (
          <span className="text-sm font-semibold">{tx.userAvatar}</span>
        ) : (
          categoryIconMap[tx.category] || <TrendingUp className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#333] truncate">{tx.description}</p>
        <p className="text-xs text-[#888]">{formatRelativeDate(tx.date)}</p>
      </div>
      <span className={`text-sm font-semibold ${amountColor} shrink-0`}>
        {prefix}{formatCurrency(tx.amount, tx.currency)}
      </span>
    </div>
  );
}

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { balances, transactions, savingsGoals, selectedCurrency } = useWalletStore();
  const { groups } = useGroupStore();
  const currentBalance = balances.find(b => b.currency === selectedCurrency)?.amount || 0;
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="px-5 py-4 lg:px-12 lg:py-8 max-w-[1400px] mx-auto">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Hero Banner */}
        <motion.div variants={item} className="gradient-hero rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <p className="text-white/70 text-sm mb-1">Total Balance</p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              <CountUp end={currentBalance} duration={1.5} decimals={2} prefix="Rs. " separator="," />
            </h2>
            <div className="flex gap-2 mt-4 flex-wrap">
              {balances.map(b => (
                <button
                  key={b.currency}
                  onClick={() => useWalletStore.getState().setCurrency(b.currency)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCurrency === b.currency
                      ? 'bg-white text-[#4F46E5]'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {b.flag} {b.currency}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="grid grid-cols-4 gap-3 mt-5">
          {[
            { icon: Send, label: 'Send', path: '/send', color: '#4F46E5' },
            { icon: Wallet, label: 'Add Money', path: '/wallet', color: '#10B981' },
            { icon: Users, label: 'Split Bill', path: '/groups', color: '#F59E0B' },
            { icon: TrendingUp, label: 'Analytics', path: '/analytics', color: '#6B4C9A' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-white shadow-card hover:shadow-card-hover transition-all active:scale-95"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${action.color}15` }}>
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <span className="text-xs font-medium text-[#333]">{action.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={item} className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-[#000]">Recent Transactions</h3>
            <button onClick={() => navigate('/wallet')} className="text-sm text-[#4F46E5] font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-card">
            {recentTransactions.map(tx => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </div>
        </motion.div>

        {/* Groups Preview */}
        <motion.div variants={item} className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-[#000]">Your Groups</h3>
            <button onClick={() => navigate('/groups')} className="text-sm text-[#4F46E5] font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
            {groups.map(group => (
              <button
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="snap-start flex-shrink-0 w-36 bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all text-left active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2" style={{ backgroundColor: `${group.color}15` }}>
                  {group.icon}
                </div>
                <p className="text-sm font-semibold text-[#333] truncate">{group.name}</p>
                <p className="text-xs text-[#888] mt-0.5">{group.members.length} members</p>
                <p className="text-xs font-medium mt-1" style={{ color: group.color }}>
                  {formatCurrency(group.totalExpenses, group.currency)}
                </p>
              </button>
            ))}
            <button
              onClick={() => navigate('/groups')}
              className="snap-start flex-shrink-0 w-36 rounded-2xl p-4 border-2 border-dashed border-[#E0E0E0] flex flex-col items-center justify-center gap-2 hover:border-[#4F46E5] transition-colors active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#888]" />
              </div>
              <span className="text-xs font-medium text-[#888]">New Group</span>
            </button>
          </div>
        </motion.div>

        {/* Savings Goals */}
        <motion.div variants={item} className="mt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-[#000]">Savings Goals</h3>
            <button className="text-sm text-[#4F46E5] font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {savingsGoals.map(goal => (
              <div key={goal.id} className="bg-white rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#333]">{goal.name}</span>
                  <span className="text-xs font-medium" style={{ color: goal.color }}>
                    {Math.round((goal.current / goal.target) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: goal.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-[#888]">{formatCurrency(goal.current, goal.currency)}</span>
                  <span className="text-xs text-[#888]">{formatCurrency(goal.target, goal.currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
