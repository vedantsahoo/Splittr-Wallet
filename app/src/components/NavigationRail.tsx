import { NavLink } from 'react-router-dom';
import { Wallet, Home, ArrowLeftRight, Users, BarChart3, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
  { path: '/send', label: 'Send Money', icon: ArrowLeftRight },
  { path: '/groups', label: 'Groups', icon: Users },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function NavigationRail() {
  const { user } = useAuthStore();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[280px] z-[100] flex-col border-r border-black/5 frosted">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#4F46E5]">Splittr</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-[#4F46E5] text-white shadow-button'
                : 'text-[#888888] hover:bg-[rgba(79,70,229,0.05)] hover:text-[#4F46E5]'
              }`
            }
          >
            <item.icon className="w-5 h-5" strokeWidth={2} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#F0F0F0]">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#333] truncate">{user?.name}</p>
            <p className="text-xs text-[#888] truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
