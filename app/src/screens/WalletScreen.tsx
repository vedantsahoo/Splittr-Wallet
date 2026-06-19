import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus, ArrowUpRight, ArrowDownLeft, QrCode, CreditCard,
  Landmark, ChevronDown, TrendingUp, Utensils, Car, ShoppingBag,
  Film, Receipt, Plane, X,
} from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { useUIStore } from '@/store/uiStore';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import type { Transaction } from '@/types';

const categoryIcons: Record<string, React.ReactNode> = {
  'Food & Dining': <Utensils className="w-4 h-4" />,
  'Transportation': <Car className="w-4 h-4" />,
  'Shopping': <ShoppingBag className="w-4 h-4" />,
  'Entertainment': <Film className="w-4 h-4" />,
  'Bills': <Receipt className="w-4 h-4" />,
  'Travel': <Plane className="w-4 h-4" />,
};

const filterTabs = ['All', 'Sent', 'Received', 'Group'];

function TransactionRow({ tx }: { tx: Transaction }) {
  const isPositive = tx.type === 'received' || tx.type === 'wallet_funding';
  const isNegative = tx.type === 'sent' || tx.type === 'withdrawal';
  const amountColor = isPositive ? 'text-[#10B981]' : isNegative ? 'text-[#EF4444]' : 'text-[#333]';
  const prefix = isPositive ? '+' : isNegative ? '-' : '';

  return (
    <div className="flex items-center gap-3 py-3 px-1 hover:bg-[rgba(79,70,229,0.03)] rounded-xl transition-colors">
      <div className="w-10 h-10 rounded-full bg-[rgba(79,70,229,0.08)] flex items-center justify-center text-[#4F46E5] shrink-0">
        {tx.userAvatar ? (
          <span className="text-xs font-semibold">{tx.userAvatar}</span>
        ) : (
          categoryIcons[tx.category] || <TrendingUp className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#333] truncate">{tx.description}</p>
        <p className="text-xs text-[#888]">{formatRelativeDate(tx.date)} • {tx.category}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-semibold ${amountColor}`}>
          {prefix}{formatCurrency(tx.amount, tx.currency)}
        </p>
        <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1 ${
          tx.status === 'completed' ? 'bg-[#10B981]' : tx.status === 'pending' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
        }`} />
      </div>
    </div>
  );
}

export default function WalletScreen() {
  const navigate = useNavigate();
  const { balances, transactions, selectedCurrency, setCurrency } = useWalletStore();
  const { showToast } = useUIStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [showQR, setShowQR] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');

  const currentBalance = balances.find(b => b.currency === selectedCurrency)?.amount || 0;

  const filteredTransactions = transactions.filter(tx => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Sent') return tx.type === 'sent' || tx.type === 'withdrawal';
    if (activeFilter === 'Received') return tx.type === 'received' || tx.type === 'wallet_funding';
    if (activeFilter === 'Group') return tx.type === 'group_expense' || tx.type === 'group_settlement';
    return true;
  });

  const handleAddMoney = () => {
    const amount = parseFloat(addAmount);
    if (amount > 0) {
      useWalletStore.getState().addFunds(amount, selectedCurrency);
      useWalletStore.getState().addTransaction({
        id: Date.now().toString(),
        type: 'wallet_funding',
        amount,
        currency: selectedCurrency,
        description: 'Added via UPI',
        date: new Date().toISOString().split('T')[0],
        category: 'Wallet',
        status: 'completed',
      });
      showToast('success', `Rs. ${amount.toLocaleString()} added to wallet!`);
      setShowAddMoney(false);
      setAddAmount('');
    }
  };

  return (
    <div className="px-5 py-4 lg:px-12 lg:py-8 max-w-[1400px] mx-auto">
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="gradient-hero rounded-3xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/70 text-sm">Available Balance</p>
            <div className="relative">
              <button
                onClick={() => {
                  const idx = balances.findIndex(b => b.currency === selectedCurrency);
                  const next = balances[(idx + 1) % balances.length];
                  setCurrency(next.currency);
                }}
                className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-sm hover:bg-white/30 transition-colors"
              >
                {balances.find(b => b.currency === selectedCurrency)?.flag} {selectedCurrency}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
            <CountUp end={currentBalance} duration={1.5} decimals={2} prefix="Rs. " separator="," />
          </h2>
          <p className="text-white/60 text-xs mt-2">Wallet ID: SW-78456231</p>

          {/* All balances */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {balances.filter(b => b.currency !== selectedCurrency).map(b => (
              <div key={b.currency} className="bg-white/15 rounded-lg px-3 py-1.5 text-xs">
                <span className="text-white/60">{b.flag} {b.currency}: </span>
                <span className="text-white font-medium">{formatCurrency(b.amount, b.currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-3 gap-3 mt-5"
      >
        <button
          onClick={() => setShowAddMoney(true)}
          className="flex flex-col items-center gap-2 py-4 bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all active:scale-95"
        >
          <div className="w-12 h-12 rounded-xl bg-[rgba(16,185,129,0.1)] flex items-center justify-center">
            <Plus className="w-5 h-5 text-[#10B981]" />
          </div>
          <span className="text-sm font-medium text-[#333]">Add Money</span>
        </button>
        <button
          onClick={() => navigate('/send')}
          className="flex flex-col items-center gap-2 py-4 bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all active:scale-95"
        >
          <div className="w-12 h-12 rounded-xl bg-[rgba(79,70,229,0.1)] flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-[#4F46E5]" />
          </div>
          <span className="text-sm font-medium text-[#333]">Send</span>
        </button>
        <button
          onClick={() => setShowQR(true)}
          className="flex flex-col items-center gap-2 py-4 bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all active:scale-95"
        >
          <div className="w-12 h-12 rounded-xl bg-[rgba(107,76,154,0.1)] flex items-center justify-center">
            <QrCode className="w-5 h-5 text-[#6B4C9A]" />
          </div>
          <span className="text-sm font-medium text-[#333]">Receive</span>
        </button>
      </motion.div>

      {/* Funding Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 bg-white rounded-2xl p-4 shadow-card"
      >
        <h3 className="text-sm font-semibold text-[#333] mb-3">Fund Your Wallet</h3>
        <div className="space-y-2">
          {[
            { icon: CreditCard, label: 'Credit/Debit Card', desc: 'Instant funding', color: '#4F46E5' },
            { icon: QrCode, label: 'UPI Payment', desc: 'Google Pay, PhonePe, Paytm', color: '#10B981' },
            { icon: Landmark, label: 'Bank Transfer', desc: 'NEFT/IMRT/RTGS', color: '#F59E0B' },
          ].map(opt => (
            <button
              key={opt.label}
              onClick={() => setShowAddMoney(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8F8F8] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${opt.color}10` }}>
                <opt.icon className="w-5 h-5" style={{ color: opt.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#333]">{opt.label}</p>
                <p className="text-xs text-[#888]">{opt.desc}</p>
              </div>
              <ArrowDownLeft className="w-4 h-4 text-[#888] rotate-180" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6"
      >
        <h3 className="text-lg font-semibold text-[#000] mb-3">Transaction History</h3>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
                activeFilter === tab ? 'bg-[#4F46E5] text-white' : 'bg-[#F5F5F5] text-[#888]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(tx => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-[#888]">No transactions found</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Add Money Bottom Sheet */}
      <AnimatePresence>
        {showAddMoney && (
          <motion.div
            className="fixed inset-0 z-[300] flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddMoney(false)} />
            <motion.div
              className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 z-10"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="w-10 h-1 bg-[#E0E0E0] rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-[#000] mb-4">Add Money</h3>
              <div className="mb-4">
                <label className="text-sm font-medium text-[#333] mb-2 block">Amount ({selectedCurrency})</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#888]">Rs.</span>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-14 pr-4 py-4 text-3xl font-bold border-2 border-[#E0E0E0] rounded-xl focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-2 mb-6">
                {[500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setAddAmount(amt.toString())}
                    className="flex-1 py-2.5 rounded-xl bg-[#F5F5F5] text-sm font-medium text-[#333] hover:bg-[#4F46E5] hover:text-white transition-all"
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddMoney}
                disabled={!addAmount || parseFloat(addAmount) <= 0}
                className="w-full py-4 rounded-xl bg-[#4F46E5] text-white font-semibold text-lg shadow-button hover:bg-[#3f38b7] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Add Rs. {addAmount || '0'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            className="fixed inset-0 z-[400] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowQR(false)} />
            <motion.div
              className="relative bg-white rounded-3xl p-8 z-10 max-w-sm w-full text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F5F5F5]">
                <X className="w-5 h-5 text-[#888]" />
              </button>
              <h3 className="text-lg font-semibold text-[#000] mb-1">Receive Money</h3>
              <p className="text-sm text-[#888] mb-4">Scan to pay Vedant Sahu</p>
              <div className="bg-white p-4 rounded-2xl shadow-card inline-block">
                <QRCodeSVG
                  value={`upi://pay?pa=vedant@splittr&pn=Vedant Sahu&am=${currentBalance.toFixed(2)}`}
                  size={200}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-sm font-medium text-[#333] mt-4">Vedant Sahu</p>
              <p className="text-xs text-[#888]">SW-78456231</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
