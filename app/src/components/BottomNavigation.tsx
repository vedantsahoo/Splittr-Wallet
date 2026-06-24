import { NavLink } from 'react-router-dom';
import { Home, Wallet, Users, BarChart3, ArrowUpRight } from 'lucide-react';

const tabs = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
  { path: '/send', label: 'Send Money', icon: ArrowUpRight },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/groups', label: 'Groups', icon: Users },
];

export default function BottomNavigation() {

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-100 h-18 bg-white dark:bg-[#151B2C] border-t border-[#F0F0F0] dark:border-[#1F293D] pb-[env(safe-area-inset-bottom)] transition-colors duration-200">
      <div className="flex items-center justify-around h-full px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col relative items-center justify-center gap-1 w-16 h-14 rounded-xl transition-all duration-150 active:scale-92 ${isActive ? 'text-[#4F46E5] dark:text-indigo-400' : 'text-[#888888] dark:text-[#94A3B8]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon
                  className="w-6 h-6 transition-all"
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {/* {tab.path === '/settings' && user?.avatar && (
                  <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full absolute top-2.5 z-20" />
                )} */}
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
