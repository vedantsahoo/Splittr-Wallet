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
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3.5 text-left hover:bg-[rgba(79,70,229,0.03)] rounded-xl px-1 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-[rgba(79,70,229,0.08)] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-[#EF4444]' : 'text-[#333]'}`}>{title}</p>
        {subtitle && <p className="text-xs text-[#888]">{subtitle}</p>}
      </div>
      {right || <ChevronRight className="w-4 h-4 text-[#CCC] shrink-0" />}
    </button>
  );
}

export default function SettingsScreen() {
  const { user, logout, updateProfile } = useAuthStore();
  const { showToast } = useUIStore();

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

  const handleLogout = () => {
    logout();
    showToast('info', 'Logged out successfully');
    setShowLogoutConfirm(false);
    window.location.reload();
  };

  return (
    <div className="px-5 py-4 lg:px-12 lg:py-8 max-w-3xl mx-auto pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-[#000] mb-1">Settings</h2>
        <p className="text-sm text-[#888] mb-6">Manage your account and preferences</p>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-5 shadow-card mb-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-lg font-bold">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
              <button
                onClick={() => { setEditName(user?.name || ''); setShowEditProfile(true); }}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#4F46E5] flex items-center justify-center border-2 border-white"
              >
                <Edit className="w-3 h-3 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-[#000]">{user?.name}</p>
              <p className="text-sm text-[#888]">{user?.email}</p>
              <p className="text-xs text-[#888]">{user?.phone}</p>
              <button className="text-xs text-[#4F46E5] font-medium mt-1 flex items-center gap-1">
                <span>SW-78456231{user?.walletId}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <p className="text-xs font-medium text-[#888] uppercase tracking-wider px-1 mb-2">Security</p>
        <div className="bg-white rounded-2xl p-4 px-5 shadow-card mb-5">
          <SettingItem
            icon={<Shield className="w-5 h-5 text-[#4F46E5]" />}
            title="Two-Factor Authentication"
            subtitle="Add an extra layer of security"
            right={
              <button
                onClick={(e) => { e.stopPropagation(); setTwoFA(!twoFA); }}
                className={`w-11 h-6 rounded-full transition-all relative ${twoFA ? 'bg-[#4F46E5]' : 'bg-[#E0E0E0]'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${twoFA ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            }
          />
          <div className="h-px bg-[#F0F0F0] mx-1" />
          <SettingItem icon={<Lock className="w-5 h-5 text-[#4F46E5]" />} title="Change Password" subtitle="Last changed 2 months ago" />
          <div className="h-px bg-[#F0F0F0] mx-1" />
          <SettingItem icon={<Gauge className="w-5 h-5 text-[#4F46E5]" />} title="Daily Transfer Limit" subtitle="Current: Rs. 50,000" />
          <div className="h-px bg-[#F0F0F0] mx-1" />
          <SettingItem icon={<Monitor className="w-5 h-5 text-[#4F46E5]" />} title="Login Activity" subtitle="View active sessions" />
        </div>

        {/* Preferences */}
        <p className="text-xs font-medium text-[#888] uppercase tracking-wider px-1 mb-2">Preferences</p>
        <div className="bg-white rounded-2xl p-4 px-5 shadow-card mb-5">
          <SettingItem
            icon={<Globe className="w-5 h-5 text-[#4F46E5]" />}
            title="Default Currency"
            right={
              <div className="relative">
                <button
                  onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6B4C9A] text-white text-xs font-medium"
                >
                  {currencies.find(c => c.code === selectedCurrency)?.flag} {selectedCurrency}
                </button>
                <AnimatePresence>
                  {showCurrencyDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] border border-[#F0F0F0] py-1 z-10 w-48"
                    >
                      {currencies.map(c => (
                        <button
                          key={c.code}
                          onClick={() => { setSelectedCurrency(c.code); setShowCurrencyDropdown(false); showToast('success', `Currency changed to ${c.code}`); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F8F8F8] transition-colors ${selectedCurrency === c.code ? 'text-[#4F46E5] bg-[rgba(79,70,229,0.05)]' : 'text-[#333]'}`}
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
          <div className="h-px bg-[#F0F0F0] mx-1" />
          <SettingItem icon={<Globe className="w-5 h-5 text-[#4F46E5]" />} title="Language" right={<span className="text-sm text-[#888]">English</span>} />
          <div className="h-px bg-[#F0F0F0] mx-1" />
          <SettingItem
            icon={<Bell className="w-5 h-5 text-[#4F46E5]" />}
            title="Push Notifications"
            subtitle="Expense alerts and reminders"
            right={
              <button onClick={(e) => { e.stopPropagation(); setNotifications(!notifications); }} className={`w-11 h-6 rounded-full transition-all relative ${notifications ? 'bg-[#4F46E5]' : 'bg-[#E0E0E0]'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${notifications ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            }
          />
          <div className="h-px bg-[#F0F0F0] mx-1" />
          <SettingItem
            icon={<Volume2 className="w-5 h-5 text-[#4F46E5]" />}
            title="Sound Effects"
            right={
              <button onClick={(e) => { e.stopPropagation(); setSoundEffects(!soundEffects); }} className={`w-11 h-6 rounded-full transition-all relative ${soundEffects ? 'bg-[#4F46E5]' : 'bg-[#E0E0E0]'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${soundEffects ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            }
          />
          <div className="h-px bg-[#F0F0F0] mx-1" />
          <SettingItem
            icon={<Moon className="w-5 h-5 text-[#4F46E5]" />}
            title="Dark Mode"
            subtitle="Coming soon"
            right={<span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(245,158,11,0.1)] text-[#F59E0B]">Soon</span>}
          />
        </div>

        {/* Payment Methods */}
        <p className="text-xs font-medium text-[#888] uppercase tracking-wider px-1 mb-2">Payment Methods</p>
        <div className="bg-white rounded-2xl p-4 px-5 shadow-card mb-5">
          <SettingItem icon={<CreditCard className="w-5 h-5 text-[#4F46E5]" />} title="UPI IDs" subtitle="2 linked" />
          <div className="h-px bg-[#F0F0F0] mx-1" />
          <SettingItem icon={<CreditCard className="w-5 h-5 text-[#10B981]" />} title="Linked Cards" subtitle="1 card linked" />
          <div className="h-px bg-[#F0F0F0] mx-1" />
          <SettingItem icon={<Landmark className="w-5 h-5 text-[#F59E0B]" />} title="Bank Accounts" subtitle="For withdrawals" />
        </div>

        {/* Data & Privacy */}
        <p className="text-xs font-medium text-[#888] uppercase tracking-wider px-1 mb-2">Data & Privacy</p>
        <div className="bg-white rounded-2xl p-4 px-5 shadow-card mb-5">
          <SettingItem icon={<Download className="w-5 h-5 text-[#4F46E5]" />} title="Export Transaction Data" subtitle="CSV or PDF format" />
          <div className="h-px bg-[#F0F0F0] mx-1" />
          <SettingItem icon={<FileText className="w-5 h-5 text-[#4F46E5]" />} title="Privacy Policy" right={<ExternalLink className="w-4 h-4 text-[#888]" />} />
          <div className="h-px bg-[#F0F0F0] mx-1" />
          <SettingItem icon={<FileText className="w-5 h-5 text-[#4F46E5]" />} title="Terms of Service" right={<ExternalLink className="w-4 h-4 text-[#888]" />} />
        </div>

        {/* About */}
        <p className="text-xs font-medium text-[#888] uppercase tracking-wider px-1 mb-2">About</p>
        <div className="bg-white rounded-2xl p-4 px-5 shadow-card mb-8">
          <div className="flex items-center gap-3 py-3.5">
            <div className="w-10 h-10 rounded-xl bg-[rgba(136,136,136,0.08)] flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-[#888]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#333]">App Version</p>
            </div>
            <span className="text-sm text-[#888]">1.0.0</span>
          </div>
          <div className="h-px bg-[#F0F0F0] mx-1" />
          <SettingItem icon={<HelpCircle className="w-5 h-5 text-[#4F46E5]" />} title="Help & Support" />
          <div className="h-px bg-[#F0F0F0] mx-1" />
          <SettingItem icon={<Star className="w-5 h-5 text-[#F59E0B]" />} title="Rate Splittr" />
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#FEE2E2] text-[#EF4444] font-medium hover:bg-[#FECACA] transition-all active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </motion.div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div className="fixed inset-0 z-[400] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditProfile(false)} />
            <motion.div
              className="relative bg-white rounded-3xl p-6 z-10 w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}>
              <h3 className="text-lg font-semibold text-[#000] mb-4">Edit Profile</h3>
              <div className="mb-4">
                <label className="text-sm font-medium text-[#333] mb-2 block">Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl text-sm focus:border-[#4F46E5] focus:outline-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowEditProfile(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-[#E0E0E0] text-sm font-medium text-[#333] hover:bg-[#F8F8F8]">Cancel</button>
                <button onClick={handleSaveProfile}
                  className="flex-1 py-3 rounded-xl bg-[#4F46E5] text-white text-sm font-medium shadow-button hover:bg-[#3f38b7]">Save</button>
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
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogoutConfirm(false)} />
            <motion.div
              className="relative bg-white rounded-3xl p-6 z-10 w-full max-w-sm text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}>
              <div className="w-14 h-14 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-[#EF4444]" />
              </div>
              <h3 className="text-lg font-semibold text-[#000] mb-2">Logout?</h3>
              <p className="text-sm text-[#888] mb-6">Are you sure you want to logout from Splittr?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-[#E0E0E0] text-sm font-medium text-[#333] hover:bg-[#F8F8F8]">Cancel</button>
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
