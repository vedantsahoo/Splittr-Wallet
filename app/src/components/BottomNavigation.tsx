import { NavLink } from 'react-router-dom';
import { Home, Wallet, QrCode, Users, UserCircle } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
  { path: '/send', label: 'QR Pay', icon: QrCode },
  { path: '/groups', label: 'Groups', icon: Users },
  { path: '/settings', label: 'Profile', icon: UserCircle },
];

export default function BottomNavigation() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] h-[72px] bg-white border-t border-[#F0F0F0] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-full px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl transition-all duration-150 active:scale-92 ${
                isActive ? 'text-[#4F46E5]' : 'text-[#888888]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon
                  className="w-6 h-6 transition-all"
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
