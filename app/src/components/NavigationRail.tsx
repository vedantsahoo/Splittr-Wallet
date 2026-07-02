import { NavLink, useNavigate } from 'react-router-dom';
import { Wallet, Home, Users, BarChart3, Settings, ArrowUpRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';


const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
  { path: '/send', label: 'Send Money', icon: ArrowUpRight },
  { path: '/groups', label: 'Groups', icon: Users },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function NavigationRail() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-70 z-100 flex-col border-r border-black/5 dark:border-[#0E6E5A]/40 bg-white/90 dark:bg-[#043C31]/95 backdrop-blur-xl">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-[#10B981] dark:text-[#E2E8F0] tracking-tight">Splittr Wallet</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-[#10B981] text-white shadow-button'
                : 'text-[#888888] dark:text-[#94A3B8] hover:bg-[rgba(16,185,129,0.05)] dark:hover:bg-[rgba(52,211,153,0.1)] hover:text-[#10B981] dark:hover:text-emerald-400'
              }`
            }
          >
            <item.icon className="w-5 h-5" strokeWidth={2} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-200 dark:bg-[#094F40]">
          <button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center text-white text-sm font-semibold overflow-hidden shrink-0">
            {user?.avatar ? (<img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />) : (user?.name.split(' ').map(n => n[0]).join(''))}
          </button>
          <div className="min-w-0">
            <p className="text-l font-medium text-[#333] dark:text-[#E2E8F0] truncate">{user?.name}</p>
            <p className="text-xs text-[#888] truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
