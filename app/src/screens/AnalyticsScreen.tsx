import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingDown, TrendingUp, Users, Wallet, CreditCard, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { useGroupStore } from '@/store/groupStore';
import { useWalletStore } from '@/store/walletStore';
import { useThemeStore } from '@/store/themeStore';
import { formatCurrency } from '@/lib/utils';
import { apiRequest } from '@/lib/api';

interface AnalyticsData {
  summary: {
    totalSpent: number;
    totalReceived: number;
    groupExpenses: number;
    spentChange: number;
    receivedChange: number;
  };
  categoryBreakdown: {
    name: string;
    value: number;
    color: string;
  }[];
  monthlyTrend: {
    month: string;
    amount: number;
  }[];
}

const periods = ['This Week', 'This Month', 'This Year'];

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#E5E7EB] dark:bg-[#075344]/40 rounded-2xl ${className}`} />
  );
}

export default function AnalyticsScreen() {
  const [activePeriod, setActivePeriod] = useState('This Month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { groups } = useGroupStore();
  const { savingsGoals, selectedCurrency } = useWalletStore();
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    let isMounted = true;
    
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiRequest<AnalyticsData>(
          `/api/analytics?period=${encodeURIComponent(activePeriod)}&currency=${encodeURIComponent(selectedCurrency)}`
        );
        if (isMounted) {
          setAnalyticsData(data);
        }
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load analytics.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAnalytics();
    
    return () => {
      isMounted = false;
    };
  }, [activePeriod, selectedCurrency]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1F2937] dark:bg-[#094C3E] text-white dark:text-[#E2E8F0] text-xs px-3 py-2 rounded-lg border border-transparent dark:border-[#0E6E5A] shadow-md">
          {formatCurrency(payload[0].value, selectedCurrency)}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="px-5 py-4 lg:px-12 lg:py-8 max-w-[1400px] mx-auto text-[#333] dark:text-[#E2E8F0]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#000] dark:text-[#E2E8F0]">Analytics</h2>
            <p className="text-sm text-[#888] dark:text-[#94A3B8]">Track your spending patterns</p>
          </div>
          <div className="flex gap-1 bg-[#F5F5F5] dark:bg-[#043C31] border border-[#F0F0F0]/10 p-1 rounded-xl">
            {periods.map(p => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activePeriod === p
                    ? 'bg-[#10B981] text-white shadow-sm'
                    : 'text-[#888] dark:text-[#94A3B8] hover:text-[#333] dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {isLoading ? (
            <>
              <Skeleton className="h-[130px]" />
              <Skeleton className="h-[130px]" />
              <Skeleton className="h-[130px]" />
            </>
          ) : analyticsData ? (
            <>
              {/* Total Spent Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-5 shadow-card dark:shadow-none hover:shadow-card-hover dark:hover:bg-[#085444] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[rgba(239,68,68,0.08)] flex items-center justify-center mb-3">
                  <TrendingDown className="w-5 h-5 text-[#EF4444]" />
                </div>
                <p className="text-xs text-[#888] dark:text-[#94A3B8] mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-[#333] dark:text-[#E2E8F0]">
                  {formatCurrency(analyticsData.summary.totalSpent, selectedCurrency)}
                </p>
                <p className={`text-xs mt-1 font-medium ${
                  analyticsData.summary.spentChange > 0 
                    ? 'text-[#EF4444]' 
                    : analyticsData.summary.spentChange < 0 
                      ? 'text-[#10B981]' 
                      : 'text-[#888]'
                }`}>
                  {analyticsData.summary.spentChange > 0 
                    ? `+${analyticsData.summary.spentChange}%` 
                    : analyticsData.summary.spentChange < 0 
                      ? `${analyticsData.summary.spentChange}%` 
                      : 'No change'
                  } from last period
                </p>
              </motion.div>

              {/* Total Received Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-5 shadow-card dark:shadow-none hover:shadow-card-hover dark:hover:bg-[#085444] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[rgba(16,185,129,0.08)] flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-[#10B981]" />
                </div>
                <p className="text-xs text-[#888] dark:text-[#94A3B8] mb-1">Total Received</p>
                <p className="text-2xl font-bold text-[#10B981]">
                  {formatCurrency(analyticsData.summary.totalReceived, selectedCurrency)}
                </p>
                <p className={`text-xs mt-1 font-medium ${
                  analyticsData.summary.receivedChange > 0 
                    ? 'text-[#10B981]' 
                    : analyticsData.summary.receivedChange < 0 
                      ? 'text-[#EF4444]' 
                      : 'text-[#888]'
                }`}>
                  {analyticsData.summary.receivedChange > 0 
                    ? `+${analyticsData.summary.receivedChange}%` 
                    : analyticsData.summary.receivedChange < 0 
                      ? `${analyticsData.summary.receivedChange}%` 
                      : 'No change'
                  } from last period
                </p>
              </motion.div>

              {/* Group Expenses Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-5 shadow-card dark:shadow-none hover:shadow-card-hover dark:hover:bg-[#085444] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[rgba(16,185,129,0.08)] flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />
                </div>
                <p className="text-xs text-[#888] dark:text-[#94A3B8] mb-1">Group Expenses</p>
                <p className="text-2xl font-bold text-[#333] dark:text-[#E2E8F0]">
                  {formatCurrency(analyticsData.summary.groupExpenses, selectedCurrency)}
                </p>
                <p className="text-xs text-[#888] dark:text-[#94A3B8] mt-1">Across {groups.length} groups</p>
              </motion.div>
            </>
          ) : (
            <div className="col-span-3 text-center py-6 text-sm text-[#888]">No summary data available.</div>
          )}
        </div>

        {/* Charts & Insights Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Spending by Category - Donut Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-5 shadow-card dark:shadow-none transition-colors"
          >
            <h3 className="text-lg font-semibold text-[#000] dark:text-[#E2E8F0] mb-1 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-[#10B981]" /> Spending by Category
            </h3>
            <p className="text-xs text-[#888] dark:text-[#94A3B8] mb-4">Where your money goes</p>

            {isLoading ? (
              <div className="flex justify-center items-center h-56">
                <Skeleton className="w-48 h-48 rounded-full" />
              </div>
            ) : analyticsData && analyticsData.categoryBreakdown.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-56 h-56 shrink-0 mx-auto sm:mx-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        dataKey="value"
                        strokeWidth={0}
                        animationBegin={200}
                        animationDuration={800}
                      >
                        {analyticsData.categoryBreakdown.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-xl font-bold text-[#333] dark:text-[#E2E8F0] max-w-[150px] truncate text-center">
                      {formatCurrency(analyticsData.summary.totalSpent, selectedCurrency)}
                    </p>
                    <p className="text-[10px] text-[#888] dark:text-[#94A3B8]">Total Spent</p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                  {analyticsData.categoryBreakdown.map(cat => (
                    <div key={cat.name} className="flex items-center gap-2 bg-gray-50/50 dark:bg-black/10 p-2 rounded-xl border border-transparent dark:border-[#F0F0F0]/5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#333] dark:text-[#E2E8F0] truncate">{cat.name}</p>
                        <p className="text-[10px] text-[#888] dark:text-[#94A3B8] font-medium">
                          {analyticsData.summary.totalSpent > 0 
                            ? `${Math.round((cat.value / analyticsData.summary.totalSpent) * 100)}%` 
                            : '0%'
                          } • {formatCurrency(cat.value, selectedCurrency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center h-56">
                <div className="w-12 h-12 rounded-2xl bg-[rgba(16,185,129,0.08)] flex items-center justify-center mb-3">
                  <CreditCard className="w-6 h-6 text-[#10B981]" />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-[#E2E8F0]">No spending data found</p>
                <p className="text-xs text-[#888] dark:text-[#94A3B8] mt-1 max-w-[240px]">
                  Send money or split bills in this period to view your category breakdown
                </p>
              </div>
            )}
          </motion.div>

          {/* Monthly Trend - Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-5 shadow-card dark:shadow-none transition-colors"
          >
            <h3 className="text-lg font-semibold text-[#000] dark:text-[#E2E8F0] mb-1 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#10B981]" /> Monthly Trend
            </h3>
            <p className="text-xs text-[#888] dark:text-[#94A3B8] mb-4">Spending over time</p>

            {isLoading ? (
              <div className="h-56">
                <Skeleton className="w-full h-full" />
              </div>
            ) : analyticsData ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#0E6E5A' : '#F0F0F0'} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: isDarkMode ? '#94A3B8' : '#888' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: isDarkMode ? '#94A3B8' : '#888' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(16,185,129,0.05)' }} />
                    <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center h-56">
                <p className="text-sm text-[#888]">No trend data available.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Group Spending Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-5 shadow-card dark:shadow-none mb-5 transition-colors"
        >
          <h3 className="text-lg font-semibold text-[#000] dark:text-[#E2E8F0] mb-1">Group Spending</h3>
          <p className="text-xs text-[#888] dark:text-[#94A3B8] mb-4">Compare across your groups</p>

          <div className="space-y-4">
            {groups.length > 0 ? (
              groups.sort((a, b) => b.totalExpenses - a.totalExpenses).map(group => {
                const maxExpense = Math.max(...groups.map(g => g.totalExpenses));
                const width = maxExpense > 0 ? (group.totalExpenses / maxExpense) * 100 : 0;
                return (
                  <div key={group.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[#333] dark:text-[#E2E8F0] w-28 shrink-0 truncate">{group.name}</span>
                    <div className="flex-1 h-6 bg-[#F0F0F0] dark:bg-[#094F40] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(135deg, #10B981 0%, #0D9488 100%)` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-[#333] dark:text-[#E2E8F0] w-20 text-right shrink-0">
                      {formatCurrency(group.totalExpenses, group.currency)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-sm text-[#888] dark:text-[#94A3B8]">
                No group spending recorded yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Savings Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-5 shadow-card dark:shadow-none pb-8 transition-colors"
        >
          <h3 className="text-lg font-semibold text-[#000] dark:text-[#E2E8F0] mb-4">Savings Goals Progress</h3>
          <div className="space-y-5">
            {savingsGoals.length > 0 ? (
              savingsGoals.map(goal => (
                <div key={goal.id}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-semibold text-[#333] dark:text-[#E2E8F0]">{goal.name}</span>
                    <span className="text-sm font-bold" style={{ color: goal.color }}>
                      {Math.round((goal.current / goal.target) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F0F0F0] dark:bg-[#094F40] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: goal.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-[#888] dark:text-[#94A3B8] font-medium">{formatCurrency(goal.current, goal.currency)}</span>
                    <span className="text-xs text-[#888] dark:text-[#94A3B8] font-medium">{formatCurrency(goal.target, goal.currency)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-[#888] dark:text-[#94A3B8]">
                No active savings goals
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
