import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Gauge, Monitor, Globe, Bell, Volume2, Moon,
  CreditCard, Landmark, Download, FileText, ExternalLink,
  Info, HelpCircle, Star, LogOut, ChevronRight, Check,
  Edit
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useThemeStore } from '@/store/themeStore';
import { currencies } from '@/lib/utils';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

function SettingItem({ icon, title, subtitle, right, onClick, danger }: SettingItemProps) {
  const containerClasses = "w-full flex items-center gap-3 py-3.5 text-left rounded-xl px-1 transition-colors";
  const content = (
    <>
      <div className="w-10 h-10 rounded-xl bg-[rgba(16,185,129,0.08)] dark:bg-[rgba(52,211,153,0.15)] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-[#EF4444]' : 'text-[#333] dark:text-[#E2E8F0]'}`}>{title}</p>
        {subtitle && <p className="text-xs text-[#888] dark:text-[#94A3B8]">{subtitle}</p>}
      </div>
      {right || <ChevronRight className="w-4 h-4 text-[#CCC] dark:text-[#475569] shrink-0" />}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${containerClasses} hover:bg-[rgba(16,185,129,0.03)] dark:hover:bg-[rgba(52,211,153,0.05)] cursor-pointer`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={containerClasses}>
      {content}
    </div>
  );
}

export default function SettingsScreen() {
  const { user, logout, updateProfile } = useAuthStore();
  const { showToast } = useUIStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const [twoFA, setTwoFA] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSaveProfile = () => {
    updateProfile({ name: editName });
    setShowEditProfile(false);
    showToast('success', 'Profile updated!');
  };

  const handleLogout = async () => {
    await logout();
    showToast('info', 'Logged out successfully');
    setShowLogoutConfirm(false);
  };

  return (
    <div className="px-5 py-4 lg:px-12 lg:py-8 max-w-3xl mx-auto pb-24 text-[#333] dark:text-[#E2E8F0]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-black dark:text-white mb-1">Settings</h2>
        <p className="text-sm text-[#888] dark:text-[#94A3B8] mb-6">Manage your account and preferences</p>

        {/* Profile Card */}
        <div className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-5 shadow-card dark:shadow-none mb-5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#10B981] flex items-center justify-center text-white text-lg font-bold">
                {user?.avatar ? (<img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />) : (user?.name.split(' ').map(n => n[0]).join(''))}
              </div>
              <button
                onClick={() => { setEditName(user?.name || ''); setShowEditProfile(true); }}
                title="Edit profile"
                aria-label="Edit profile"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#10B981] flex items-center justify-center border-2 border-white dark:border-[#043C31]"
              >
                <Edit className="w-3 h-3 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-black dark:text-white">{user?.name}</p>
              <p className="text-sm text-[#888] dark:text-[#94A3B8]">{user?.email}</p>
              <p className="text-xs text-[#888] dark:text-[#94A3B8]">{user?.phone}</p>
              <button className="text-xs text-[#10B981] dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <span>Wallet ID: {user?.walletId}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <p className="text-xs font-medium text-[#888] dark:text-[#94A3B8] uppercase tracking-wider px-1 mb-2">Security</p>
        <div className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-4 px-5 shadow-card dark:shadow-none mb-5 transition-colors">
          <SettingItem
            icon={<Shield className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />}
            title="Two-Factor Authentication"
            subtitle="Add an extra layer of security"
            right={
              <button
                onClick={(e) => { e.stopPropagation(); setTwoFA(!twoFA); }}
                title={twoFA ? 'Disable two-factor authentication' : 'Enable two-factor authentication'}
                aria-label={twoFA ? 'Disable two-factor authentication' : 'Enable two-factor authentication'}
                className={`w-11 h-6 rounded-full transition-all relative ${twoFA ? 'bg-[#10B981]' : 'bg-[#E0E0E0] dark:bg-[#0E6E5A]'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${twoFA ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            }
          />
          <div className="h-px bg-[#F0F0F0] dark:bg-[#094F40] mx-1" />
          <SettingItem icon={<Lock className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />} title="Change Password" subtitle="Last changed 2 months ago" />
          <div className="h-px bg-[#F0F0F0] dark:bg-[#094F40] mx-1" />
          <SettingItem icon={<Gauge className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />} title="Daily Transfer Limit" subtitle="Current: Rs. 50,000" />
          <div className="h-px bg-[#F0F0F0] dark:bg-[#094F40] mx-1" />
          <SettingItem icon={<Monitor className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />} title="Login Activity" subtitle="View active sessions" />
        </div>

        {/* Preferences */}
        <p className="text-xs font-medium text-[#888] dark:text-[#94A3B8] uppercase tracking-wider px-1 mb-2">Preferences</p>
        <div className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-4 px-5 shadow-card dark:shadow-none mb-5 transition-colors">
          <SettingItem
            icon={<Globe className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />}
            title="Default Currency"
            right={
              <div className="relative">
                <button
                  onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-[#10B981] to-[#0D9488] text-white text-xs font-medium"
                >
                  {currencies.find(c => c.code === selectedCurrency)?.flag} {selectedCurrency}
                </button>
                <AnimatePresence>
                  {showCurrencyDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute right-0 top-full mt-1 bg-white dark:bg-[#085444] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:shadow-none border border-[#F0F0F0] dark:border-[#0E6E5A] py-1 z-10 w-48 overflow-hidden"
                    >
                      {currencies.map(c => (
                        <button
                          key={c.code}
                          onClick={() => { setSelectedCurrency(c.code); setShowCurrencyDropdown(false); showToast('success', `Currency changed to ${c.code}`); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#ECFDF5] dark:hover:bg-[#0E6E5A] transition-colors ${selectedCurrency === c.code ? 'text-[#10B981] dark:text-emerald-400 bg-[rgba(16,185,129,0.05)] dark:bg-[rgba(52,211,153,0.1)]' : 'text-[#333] dark:text-[#E2E8F0]'}`}
                        >
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                          {selectedCurrency === c.code && <Check className="w-4 h-4 ml-auto" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            }
          />
          <div className="h-px bg-[#F0F0F0] dark:bg-[#094F40] mx-1" />
          <SettingItem icon={<Globe className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />} title="Language" right={<span className="text-sm text-[#888] dark:text-[#94A3B8]">English</span>} />
          <div className="h-px bg-[#F0F0F0] dark:bg-[#094F40] mx-1" />
          <SettingItem
            icon={<Bell className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />}
            title="Push Notifications"
            subtitle="Expense alerts and reminders"
            right={
              <button
                onClick={(e) => { e.stopPropagation(); setNotifications(!notifications); }}
                title={notifications ? 'Disable push notifications' : 'Enable push notifications'}
                aria-label={notifications ? 'Disable push notifications' : 'Enable push notifications'}
                className={`w-11 h-6 rounded-full transition-all relative ${notifications ? 'bg-[#10B981]' : 'bg-[#E0E0E0] dark:bg-[#0E6E5A]'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${notifications ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            }
          />
          <div className="h-px bg-[#F0F0F0] dark:bg-[#094F40] mx-1" />
          <SettingItem
            icon={<Volume2 className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />}
            title="Sound Effects"
            right={
              <button
                onClick={(e) => { e.stopPropagation(); setSoundEffects(!soundEffects); }}
                title={soundEffects ? 'Disable sound effects' : 'Enable sound effects'}
                aria-label={soundEffects ? 'Disable sound effects' : 'Enable sound effects'}
                className={`w-11 h-6 rounded-full transition-all relative ${soundEffects ? 'bg-[#10B981]' : 'bg-[#E0E0E0] dark:bg-[#0E6E5A]'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${soundEffects ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            }
          />
          <div className="h-px bg-[#F0F0F0] dark:bg-[#094F40] mx-1" />
          <SettingItem
            icon={<Moon className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />}
            title="Dark Mode"
            subtitle="Switch between light and dark themes"
            right={
              <button
                onClick={(e) => { e.stopPropagation(); toggleDarkMode(); }}
                title={isDarkMode ? 'Disable dark mode' : 'Enable dark mode'}
                aria-label={isDarkMode ? 'Disable dark mode' : 'Enable dark mode'}
                className={`w-11 h-6 rounded-full transition-all relative ${isDarkMode ? 'bg-[#10B981]' : 'bg-[#E0E0E0] dark:bg-[#0E6E5A]'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${isDarkMode ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            }
          />
        </div>

        {/* Payment Methods */}
        <p className="text-xs font-medium text-[#888] dark:text-[#94A3B8] uppercase tracking-wider px-1 mb-2">Payment Methods</p>
        <div className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-4 px-5 shadow-card dark:shadow-none mb-5 transition-colors">
          <SettingItem icon={<CreditCard className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />} title="UPI IDs" subtitle="2 linked" />
          <div className="h-px bg-[#F0F0F0] dark:bg-[#094F40] mx-1" />
          <SettingItem icon={<CreditCard className="w-5 h-5 text-[#10B981]" />} title="Linked Cards" subtitle="1 card linked" />
          <div className="h-px bg-[#F0F0F0] dark:bg-[#094F40] mx-1" />
          <SettingItem icon={<Landmark className="w-5 h-5 text-[#F59E0B]" />} title="Bank Accounts" subtitle="For withdrawals" />
        </div>

        {/* Data & Privacy */}
        <p className="text-xs font-medium text-[#888] dark:text-[#94A3B8] uppercase tracking-wider px-1 mb-2">Data & Privacy</p>
        <div className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-4 px-5 shadow-card dark:shadow-none mb-5 transition-colors">
          <SettingItem icon={<Download className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />} title="Export Transaction Data" subtitle="CSV or PDF format" />
          <div className="h-px bg-[#F0F0F0] dark:bg-[#094F40] mx-1" />
          <SettingItem icon={<FileText className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />} title="Privacy Policy" right={<ExternalLink className="w-4 h-4 text-[#888] dark:text-[#94A3B8]" />} />
          <div className="h-px bg-[#F0F0F0] dark:bg-[#094F40] mx-1" />
          <SettingItem icon={<FileText className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />} title="Terms of Service" right={<ExternalLink className="w-4 h-4 text-[#888] dark:text-[#94A3B8]" />} />
        </div>

        {/* About */}
        <p className="text-xs font-medium text-[#888] dark:text-[#94A3B8] uppercase tracking-wider px-1 mb-2">About</p>
        <div className="bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-2xl p-4 px-5 shadow-card dark:shadow-none mb-8 transition-colors">
          <div className="flex items-center gap-3 py-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F0F0F0] dark:bg-[#094F40] flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-[#888] dark:text-[#94A3B8]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#333] dark:text-[#E2E8F0]">App Version</p>
            </div>
            <span className="text-sm text-[#888] dark:text-[#94A3B8]">1.0.0</span>
          </div>
          <div className="h-px bg-[#F0F0F0] dark:bg-[#094F40] mx-1" />
          <SettingItem icon={<HelpCircle className="w-5 h-5 text-[#10B981] dark:text-emerald-400" />} title="Help & Support" />
          <div className="h-px bg-[#F0F0F0] dark:bg-[#094F40] mx-1" />
          <SettingItem icon={<Star className="w-5 h-5 text-[#F59E0B]" />} title="Rate Splittr" />
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-600/80 text-[#e6e6e6] font-medium hover:bg-[#ffa9a9] dark:hover:bg-red-500/40 transition-all active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </motion.div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div className="fixed inset-0 z-[400] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowEditProfile(false)} />
            <motion.div
              className="relative bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-3xl p-6 z-10 w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}>
              <h3 className="text-lg font-semibold text-[#000] dark:text-white mb-4">Edit Profile</h3>
              <div className="mb-4">
                <label htmlFor="edit-name" className="text-sm font-medium text-[#333] dark:text-[#E2E8F0] mb-2 block">Name</label>
                <input id="edit-name" type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" title="Name"
                  className="w-full px-4 py-3 bg-transparent border-2 border-[#E0E0E0] dark:border-[#0E6E5A] dark:text-white rounded-xl text-sm focus:border-[#10B981] dark:focus:border-emerald-400 focus:outline-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowEditProfile(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-[#E0E0E0] dark:border-[#0E6E5A] text-sm font-medium text-[#333] dark:text-[#E2E8F0] hover:bg-[#ECFDF5] dark:hover:bg-[#085444]">Cancel</button>
                <button onClick={handleSaveProfile}
                  className="flex-1 py-3 rounded-xl bg-[#10B981] text-white text-sm font-medium shadow-button hover:bg-[#059669]">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div className="fixed inset-0 z-[400] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowLogoutConfirm(false)} />
            <motion.div
              className="relative bg-white dark:bg-[#043C31] border border-[#F0F0F0]/10 rounded-3xl p-6 z-10 w-full max-w-sm text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}>
              <div className="w-14 h-14 rounded-full bg-[#FEE2E2] dark:bg-red-950/50 flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-[#EF4444]" />
              </div>
              <h3 className="text-lg font-semibold text-[#000] dark:text-white mb-2">Logout?</h3>
              <p className="text-sm text-[#888] dark:text-[#94A3B8] mb-6">Are you sure you want to logout from Splittr?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-[#E0E0E0] dark:border-[#0E6E5A] text-sm font-medium text-[#333] dark:text-[#E2E8F0] hover:bg-[#ECFDF5] dark:hover:bg-[#085444]">Cancel</button>
                <button onClick={handleLogout}
                  className="flex-1 py-3 rounded-xl bg-[#EF4444] text-white text-sm font-medium hover:bg-[#DC2626]">Logout</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
