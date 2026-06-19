import { useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingDown, TrendingUp, Users } from 'lucide-react';
import { useGroupStore } from '@/store/groupStore';
import { useWalletStore } from '@/store/walletStore';
import { formatCurrency } from '@/lib/utils';

const categoryData = [
  { name: 'Food & Dining', value: 8500, color: '#4F46E5' },
  { name: 'Transportation', value: 4200, color: '#6B4C9A' },
  { name: 'Shopping', value: 6800, color: '#10B981' },
  { name: 'Entertainment', value: 3500, color: '#F59E0B' },
  { name: 'Bills', value: 2500, color: '#EF4444' },
  { name: 'Others', value: 1200, color: '#FCB69F' },
];

const monthlyData = [
  { month: 'Jan', amount: 18500 },
  { month: 'Feb', amount: 22000 },
  { month: 'Mar', amount: 16800 },
  { month: 'Apr', amount: 24500 },
  { month: 'May', amount: 21000 },
  { month: 'Jun', amount: 24500 },
];

const periods = ['This Week', 'This Month', 'This Year'];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#333] text-white text-xs px-3 py-2 rounded-lg">
        {formatCurrency(payload[0].value, 'INR')}
      </div>
    );
  }
  return null;
};

export default function AnalyticsScreen() {
  const [activePeriod, setActivePeriod] = useState('This Month');
  const { groups } = useGroupStore();
  const { savingsGoals, getBalance, selectedCurrency } = useWalletStore();

  const totalSpent = categoryData.reduce((sum, c) => sum + c.value, 0);
  const totalReceived = getBalance(selectedCurrency);
  const groupExpenses = groups.reduce((sum, g) => sum + g.totalExpenses, 0);
  // avgMonthly calculated but used in UI comments only
  void monthlyData;

  return (
    <div className="px-5 py-4 lg:px-12 lg:py-8 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#000]">Analytics</h2>
            <p className="text-sm text-[#888]">Track your spending patterns</p>
          </div>
          <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded-xl">
            {periods.map(p => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activePeriod === p ? 'bg-[#4F46E5] text-white' : 'text-[#888] hover:text-[#333]'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-card"
          >
            <div className="w-10 h-10 rounded-xl bg-[rgba(239,68,68,0.08)] flex items-center justify-center mb-3">
              <TrendingDown className="w-5 h-5 text-[#EF4444]" />
            </div>
            <p className="text-xs text-[#888] mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-[#333]">
              <CountUp end={totalSpent} duration={1.2} prefix="Rs. " separator="," />
            </p>
            <p className="text-xs text-[#EF4444] mt-1">+12% from last month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-card"
          >
            <div className="w-10 h-10 rounded-xl bg-[rgba(16,185,129,0.08)] flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-[#10B981]" />
            </div>
            <p className="text-xs text-[#888] mb-1">Total Received</p>
            <p className="text-2xl font-bold text-[#10B981]">
              <CountUp end={totalReceived} duration={1.2} prefix="Rs. " separator="," />
            </p>
            <p className="text-xs text-[#10B981] mt-1">+8% from last month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-5 shadow-card"
          >
            <div className="w-10 h-10 rounded-xl bg-[rgba(79,70,229,0.08)] flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <p className="text-xs text-[#888] mb-1">Group Expenses</p>
            <p className="text-2xl font-bold text-[#333]">
              <CountUp end={groupExpenses} duration={1.2} prefix="Rs. " separator="," />
            </p>
            <p className="text-xs text-[#888] mt-1">Across {groups.length} groups</p>
          </motion.div>
        </div>

        {/* Spending by Category - Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-card mb-5"
        >
          <h3 className="text-lg font-semibold text-[#000] mb-1">Spending by Category</h3>
          <p className="text-xs text-[#888] mb-4">Where your money goes</p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-56 h-56 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    dataKey="value"
                    strokeWidth={0}
                    animationBegin={200}
                    animationDuration={800}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xl font-bold text-[#333]">{formatCurrency(totalSpent, 'INR')}</p>
                <p className="text-[10px] text-[#888]">Total Spent</p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-2 w-full">
              {categoryData.map(cat => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <div className="min-w-0">
                    <p className="text-xs text-[#333] truncate">{cat.name}</p>
                    <p className="text-[10px] text-[#888]">{Math.round((cat.value / totalSpent) * 100)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Monthly Trend - Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-5 shadow-card mb-5"
        >
          <h3 className="text-lg font-semibold text-[#000] mb-1">Monthly Trend</h3>
          <p className="text-xs text-[#888] mb-4">Spending over time</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={v => `Rs.${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79,70,229,0.05)' }} />
                <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Group Spending Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-card mb-5"
        >
          <h3 className="text-lg font-semibold text-[#000] mb-1">Group Spending</h3>
          <p className="text-xs text-[#888] mb-4">Compare across your groups</p>

          <div className="space-y-3">
            {groups.sort((a, b) => b.totalExpenses - a.totalExpenses).map(group => {
              const maxExpense = Math.max(...groups.map(g => g.totalExpenses));
              const width = maxExpense > 0 ? (group.totalExpenses / maxExpense) * 100 : 0;
              return (
                <div key={group.id} className="flex items-center gap-3">
                  <span className="text-sm text-[#333] w-28 shrink-0 truncate">{group.name}</span>
                  <div className="flex-1 h-6 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(135deg, #4F46E5 0%, #6B4C9A 100%)` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#333] w-20 text-right shrink-0">
                    {formatCurrency(group.totalExpenses, group.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Savings Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-5 shadow-card pb-8"
        >
          <h3 className="text-lg font-semibold text-[#000] mb-4">Savings Goals Progress</h3>
          <div className="space-y-4">
            {savingsGoals.map(goal => (
              <div key={goal.id}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#333]">{goal.name}</span>
                  <span className="text-sm font-medium" style={{ color: goal.color }}>
                    {Math.round((goal.current / goal.target) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: goal.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="flex justify-between mt-1">
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
