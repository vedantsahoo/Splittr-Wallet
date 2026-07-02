import { useLocation, useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface TopAppBarProps {
  title: string;
  scrolled: boolean;
}

export default function TopAppBar({ scrolled }: TopAppBarProps) {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isGroupDetail = location.pathname.startsWith('/groups/') && location.pathname !== '/groups';
  // const isHome = location.pathname === '/dashboard';

  return (
    <header className={`lg:hidden fixed top-0 left-0 right-0 z-100 h-16 bg-white/90 dark:bg-[#043C31]/95 backdrop-blur-xl border-b border-black/5 dark:border-[#0E6E5A]/40 transition-shadow duration-200 ${scrolled ? 'shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]' : ''}`}>
      <div className="flex items-center justify-between h-full px-5">
        <div className="flex items-center gap-3">
          {isGroupDetail ? (
            <button onClick={() => navigate('/groups')} title="Back to groups" aria-label="Back to groups" className="p-2 -ml-2 rounded-full active:bg-black/5 dark:active:bg-white/5">
              ← Back
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-[#10B981] dark:text-emerald-400">Splittr Wallet</span>
            </div>
          )}
        </div>

        {/* <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-black dark:text-[#E2E8F0]">
          {!isHome && title}
        </h1> */}
        {/* <button type="button" title="Notifications" aria-label="Notifications" className="p-2 relative z-20 rounded-full  dark:active:bgactive:bg-black/5-white/5">
          <Bell className="w-5 h-5 text-[#333] dark:text-[#E2E8F0]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full" />
        </button> */}
        <div className="gap-3 px-1.5 py-1.5 border border-black/5 dark:border-[#0E6E5A]/40 rounded-full hover:bg-gray-200 dark:hover:bg-[#085444]">
          {/* <div className="min-w-0">
            <p className="text-sm font-medium text-[#333] dark:text-[#E2E8F0] truncate">Hi, {user?.name.split(' ')[0]}</p>
          </div> */}
          <button title='User Profile' aria-label='User Profile' onClick={() => navigate('/settings')} className="w-11 h-11 rounded-full bg-[#10B981] flex items-center justify-center text-white text-sm font-semibold overflow-hidden shrink-0">
            {user?.avatar ? (<img src={user.avatar} alt={user.name} className="rounded-full object-cover" />) : (user?.name.split(' ').map(n => n[0]).join(''))}
          </button>
        </div>
      </div>
    </header>
  );
}
