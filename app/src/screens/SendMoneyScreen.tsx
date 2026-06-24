import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Check } from 'lucide-react';
import { useWalletStore } from '@/store/walletStore';
import { useUIStore } from '@/store/uiStore';
import { formatCurrency } from '@/lib/utils';

const mockContacts = [
  { id: '1', name: 'Animesh Sahu', phone: '+91 9876543210', initials: 'AS', color: '#4F46E5' },
  { id: '2', name: 'Aradhana Chaudhary', phone: '+91 7011266435', initials: 'AC', color: '#9966FF' },
  { id: '3', name: 'Sanjeevni Singh', phone: '+91 9111336025', initials: 'SS', color: '#10B981' },
  { id: '4', name: 'Ansh Verma', phone: '+91 76543 21098', initials: 'AV', color: '#F59E0B' },
  { id: '5', name: 'Neha Singh', phone: '+91 65432 10987', initials: 'NS', color: '#EF4444' },
  { id: '6', name: 'Siddhima Saxena', phone: '+91 9479202055', initials: 'SS', color: '#6B4C9A' },
  { id: '7', name: 'Siddharth Srivastav', phone: '+91 8120860675', initials: 'SS', color: '#EC4899' },
  { id: '8', name: 'Anamika Yadav', phone: '+91 8109152336', initials: 'AY', color: '#3B82F6' },
  { id: '9', name: 'Vaishnavi Gupta', phone: '+91 9818221115', initials: 'VG', color: '#14B8A6' },
];

type Step = 'recipient' | 'amount' | 'confirm' | 'success';

export default function SendMoneyScreen() {
  const [step, setStep] = useState<Step>('recipient');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<typeof mockContacts[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const { balances, selectedCurrency, sendMoney, addTransaction } = useWalletStore();
  const { showToast } = useUIStore();

  const currentBalance = balances.find(b => b.currency === selectedCurrency)?.amount || 0;

  const filteredContacts = mockContacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleSelectContact = (contact: typeof mockContacts[0]) => {
    setSelectedContact(contact);
    setStep('amount');
  };

  const handleSend = () => {
    const amt = parseFloat(amount);
    if (amt > 0 && selectedContact) {
      sendMoney(amt, selectedCurrency, selectedContact.id);
      addTransaction({
        id: Date.now().toString(),
        type: 'sent',
        amount: amt,
        currency: selectedCurrency,
        description: note || `To ${selectedContact.name}`,
        date: new Date().toISOString().split('T')[0],
        category: 'Transfer',
        status: 'completed',
        recipientName: selectedContact.name,
        userAvatar: selectedContact.initials,
      });
      setStep('success');
      showToast('success', `Rs. ${amt.toLocaleString()} sent to ${selectedContact.name}!`);
    }
  };

  const handleReset = () => {
    setStep('recipient');
    setSelectedContact(null);
    setAmount('');
    setNote('');
    setSearchQuery('');
  };

  return (
    <div className="px-5 py-4 lg:px-12 lg:py-8 max-w-lg mx-auto min-h-[calc(100vh-140px)] text-[#333] dark:text-[#E2E8F0]">
      <AnimatePresence mode="wait">
        {/* Step 1: Select Recipient */}
        {step === 'recipient' && (
          <motion.div
            key="recipient"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-[#000] dark:text-white mb-1">Send Money</h2>
            <p className="text-sm text-[#888] dark:text-[#94A3B8] mb-4">Choose a recipient</p>

            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888] dark:text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                title="Search contacts"
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#151B2C] border border-[#E0E0E0] dark:border-[#2A364F] rounded-xl text-sm focus:border-[#4F46E5] dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10 dark:focus:ring-indigo-400/20 transition-all dark:text-white"
              />
            </div>

            <div className="space-y-1">
              {filteredContacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-[#151B2C] transition-all text-left active:scale-[0.98] cursor-pointer"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                    style={{ backgroundColor: contact.color }}
                  >
                    {contact.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#333] dark:text-[#E2E8F0]">{contact.name}</p>
                    <p className="text-xs text-[#888] dark:text-[#94A3B8]">{contact.phone}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#888] dark:text-[#94A3B8]" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Enter Amount */}
        {step === 'amount' && selectedContact && (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <button onClick={() => setStep('recipient')} className="text-sm text-[#4F46E5] dark:text-indigo-400 mb-4 flex items-center gap-1 cursor-pointer">
              ← Back
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: selectedContact.color }}>
                {selectedContact.initials}
              </div>
              <div>
                <p className="text-lg font-semibold text-[#000] dark:text-white">{selectedContact.name}</p>
                <p className="text-xs text-[#888] dark:text-[#94A3B8]">{selectedContact.phone}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-[#888] dark:text-[#94A3B8] mb-2 block">Enter Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-[#888] dark:text-[#94A3B8]">Rs.</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  title="Transfer amount"
                  className="w-full pl-16 pr-4 py-5 text-4xl font-bold bg-transparent dark:text-white border-2 border-[#E0E0E0] dark:border-[#2A364F] rounded-xl focus:border-[#4F46E5] dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10 dark:focus:ring-indigo-400/20 transition-all"
                  autoFocus
                />
              </div>
              <p className="text-xs text-[#888] dark:text-[#94A3B8] mt-2">Available: {formatCurrency(currentBalance, selectedCurrency)}</p>
            </div>

            <div className="mb-4">
              <label className="text-sm text-[#888] dark:text-[#94A3B8] mb-2 block">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's this for?"
                title="Optional transfer note"
                className="w-full px-4 py-3 bg-white dark:bg-[#151B2C] border border-[#E0E0E0] dark:border-[#2A364F] rounded-xl text-sm focus:border-[#4F46E5] dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10 dark:focus:ring-indigo-400/20 transition-all dark:text-white"
              />
            </div>

            <div className="flex gap-2 mb-6">
              {[100, 500, 1000, 2000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="flex-1 py-2.5 rounded-xl bg-[#F5F5F5] dark:bg-[#2A364F] text-sm font-medium text-[#333] dark:text-[#E2E8F0] hover:bg-[#4F46E5] dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white transition-all cursor-pointer"
                >
                  {amt.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('confirm')}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > currentBalance}
              className="w-full py-4 rounded-xl bg-[#4F46E5] text-white font-semibold text-lg shadow-button hover:bg-[#3f38b7] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && selectedContact && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <button onClick={() => setStep('amount')} className="text-sm text-[#4F46E5] dark:text-indigo-400 mb-6 flex items-center gap-1 cursor-pointer">
              ← Back
            </button>

            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4" style={{ backgroundColor: selectedContact.color }}>
              {selectedContact.initials}
            </div>
            <p className="text-lg font-semibold text-[#000] dark:text-white">{selectedContact.name}</p>
            <p className="text-sm text-[#888] dark:text-[#94A3B8] mb-6">{selectedContact.phone}</p>

            <div className="bg-white dark:bg-[#151B2C] border border-[#F0F0F0]/10 rounded-2xl p-6 shadow-card dark:shadow-none mb-6">
              <p className="text-sm text-[#888] dark:text-[#94A3B8] mb-1">Amount</p>
              <p className="text-3xl font-bold text-[#000] dark:text-white">Rs. {parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              {note && (
                <p className="text-sm text-[#888] dark:text-[#94A3B8] mt-2">Note: {note}</p>
              )}
            </div>

            <button
              onClick={handleSend}
              className="w-full py-4 rounded-xl bg-[#4F46E5] text-white font-semibold text-lg shadow-button hover:bg-[#3f38b7] transition-all active:scale-[0.98] cursor-pointer"
            >
              Confirm & Send
            </button>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, type: 'spring', damping: 15 }}
            className="text-center pt-12"
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-[#10B981] flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.1 }}
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-[#000] dark:text-white mb-2">Transfer Successful!</h3>
            <p className="text-[#888] dark:text-[#94A3B8] mb-2">Rs. {parseFloat(amount).toLocaleString()} sent to</p>
            <p className="text-lg font-semibold text-[#4F46E5] dark:text-indigo-400 mb-8">{selectedContact?.name}</p>
            <button
              onClick={handleReset}
              className="w-full py-4 rounded-xl bg-[#4F46E5] text-white font-semibold shadow-button hover:bg-[#3f38b7] transition-all cursor-pointer"
            >
              Send Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
