import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Mail, Lock, User as UserIcon, Eye, EyeOff,
  Sun, Moon, ArrowRight, Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useThemeStore } from '@/store/themeStore';

export default function LoginScreen() {
  const login = useAuthStore(state => state.login);
  const showToast = useUIStore(state => state.showToast);
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [isDemoTyping, setIsDemoTyping] = useState(false);

  // Sync dark mode class with HTML tag
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    if (!isLogin && !name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoTyping) return;
    if (!validate()) return;

    setIsLoading(true);
    // Simulate API request delay
    setTimeout(async () => {
      const res = await login(email, password);
      setIsLoading(false);
      if (res.success) {
        showToast('success', isLogin ? 'Welcome back to Splittr!' : 'Account created successfully!');
      } else {
        showToast('error', res.error || 'Invalid credentials');
      }
    }, 1200);
  };

  // Automated typing animation for the demo account
  const handleDemoSignIn = () => {
    if (isDemoTyping || isLoading) return;
    setIsDemoTyping(true);
    setIsLogin(true);
    setName('');
    setEmail('');
    setPassword('');
    setErrors({});

    const demoEmail = 'vedantvibhusahu1234567@gmail.com';
    const demoPassword = 'password123';

    let currentEmail = '';
    let currentPassword = '';
    let emailIdx = 0;
    let passwordIdx = 0;

    // Type email
    const typeEmailInterval = setInterval(() => {
      if (emailIdx < demoEmail.length) {
        currentEmail += demoEmail[emailIdx];
        setEmail(currentEmail);
        emailIdx++;
      } else {
        clearInterval(typeEmailInterval);

        // Wait briefly, then type password
        setTimeout(() => {
          const typePasswordInterval = setInterval(() => {
            if (passwordIdx < demoPassword.length) {
              currentPassword += demoPassword[passwordIdx];
              setPassword(currentPassword);
              passwordIdx++;
            } else {
              clearInterval(typePasswordInterval);

              // Wait briefly, then log in
              setTimeout(() => {
                setIsLoading(true);
                setTimeout(async () => {
                  const res = await login(demoEmail, demoPassword);
                  setIsLoading(false);
                  setIsDemoTyping(false);
                  if (res.success) {
                    showToast('success', 'Logged in with Demo Account!');
                  } else {
                    showToast('error', res.error || 'Failed to login with demo');
                  }
                }, 1000);
              }, 400);
            }
          }, 50);
        }, 200);
      }
    }, 45);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-[#ECFDF5] dark:bg-[#022C22] transition-colors duration-300">

      {/* Decorative Animated Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#10B981]/10 dark:bg-[#10B981]/15 blur-3xl"
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#0D9488]/10 dark:bg-[#0D9488]/15 blur-3xl"
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Floating Header Actions */}
      <div className="absolute top-6 right-6 z-10 flex gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-xl bg-white/70 dark:bg-[#043C31]/70 border border-black/5 dark:border-white/5 shadow-card hover:bg-white dark:hover:bg-[#043C31] text-[#10B981] dark:text-emerald-400 transition-all cursor-pointer"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Glassmorphic Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md bg-white/80 dark:bg-[#043C31]/80 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-modal text-[#333] dark:text-[#E2E8F0] transition-all"
      >
        {/* App Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-tr from-[#10B981] to-[#0D9488] text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] mb-3">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-black dark:text-[#E2E8F0] tracking-tight">Splittr Wallet</h1>
          <p className="text-sm text-[#666] dark:text-[#94A3B8] mt-1.5 font-medium">
            {isLogin ? 'Simplify split bills & digital payments' : 'Create an account to start splitting'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="relative flex p-1 bg-[#F1F3F9] dark:bg-[#022C22] rounded-2xl mb-6">
          {/* Active indicator overlay */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-white dark:bg-[#043C31] shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none transition-all duration-300 ease-[0.16,1,0.3,1] ${isLogin ? 'left-1' : 'left-[50%]'
              }`}
          />
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrors({}); }}
            disabled={isDemoTyping}
            className={`relative z-10 flex-1 py-3 text-sm font-semibold rounded-xl text-center transition-colors cursor-pointer ${isLogin ? 'text-black dark:text-[#E2E8F0]' : 'text-[#777] dark:text-[#94A3B8]'
              } disabled:opacity-50`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrors({}); }}
            disabled={isDemoTyping}
            className={`relative z-10 flex-1 py-3 text-sm font-semibold rounded-xl text-center transition-colors cursor-pointer ${!isLogin ? 'text-black dark:text-[#E2E8F0]' : 'text-[#777] dark:text-[#94A3B8]'
              } disabled:opacity-50`}
          >
            Sign Up
          </button>
        </div>

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name field (SignUp only) */}
          <AnimatePresence initial={false}>
            {!isLogin && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pb-1">
                  <label htmlFor="name-input" className="block text-xs font-semibold uppercase tracking-wider text-[#666] dark:text-[#94A3B8] mb-1.5 pl-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999] dark:text-[#475569]" />
                    <input
                      id="name-input"
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: undefined }); }}
                      placeholder="User Name"
                      disabled={isLoading || isDemoTyping}
                      className={`w-full pl-12 pr-4 py-3.5 bg-[#F9FAFB] dark:bg-[#022C22]/60 text-black dark:text-[#E2E8F0] border-2 rounded-2xl text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-[#022C22] ${errors.name
                        ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]'
                        : 'border-black/5 dark:border-white/5 focus:border-[#10B981] dark:focus:border-emerald-400 focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-[#EF4444] mt-1 pl-1 font-medium">{errors.name}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Address */}
          <div>
            <label htmlFor="email-input" className="block text-xs font-semibold uppercase tracking-wider text-[#666] dark:text-[#94A3B8] mb-1.5 pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999] dark:text-[#475569]" />
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                placeholder="you@example.com"
                disabled={isLoading || isDemoTyping}
                className={`w-full pl-12 pr-4 py-3.5 bg-[#F9FAFB] dark:bg-[#022C22]/60 text-black dark:text-[#E2E8F0] border-2 rounded-2xl text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-[#022C22] ${errors.email
                  ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]'
                  : 'border-black/5 dark:border-white/5 focus:border-[#10B981] dark:focus:border-emerald-400 focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-[#EF4444] mt-1 pl-1 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5 pl-1">
              <label htmlFor="password-input" className="block text-xs font-semibold uppercase tracking-wider text-[#666] dark:text-[#94A3B8]">
                Password
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => showToast('info', 'Password recovery is not configured for demo.')}
                  disabled={isLoading || isDemoTyping}
                  className="text-xs font-semibold text-[#10B981] dark:text-emerald-400 hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999] dark:text-[#475569]" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: undefined }); }}
                placeholder="••••••••"
                disabled={isLoading || isDemoTyping}
                className={`w-full pl-12 pr-12 py-3.5 bg-[#F9FAFB] dark:bg-[#022C22]/60 text-black dark:text-[#E2E8F0] border-2 rounded-2xl text-sm transition-all focus:outline-none focus:bg-white dark:focus:bg-[#022C22] ${errors.password
                  ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]'
                  : 'border-black/5 dark:border-white/5 focus:border-[#10B981] dark:focus:border-emerald-400 focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 text-[#999] hover:text-[#555] dark:hover:text-[#CCC] bg-transparent border-0 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[#EF4444] mt-1 pl-1 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || isDemoTyping}
            className="w-full mt-6 py-4 rounded-2xl bg-linear-to-r from-[#10B981] to-[#0D9488] hover:from-[#059669] hover:to-[#0f766e] text-white text-sm font-bold shadow-[0_4px_12px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
