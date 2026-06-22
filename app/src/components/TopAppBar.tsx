import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Wallet } from 'lucide-react';

interface TopAppBarProps {
  title: string;
  scrolled: boolean;
}

export default function TopAppBar({ title, scrolled }: TopAppBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isGroupDetail = location.pathname.startsWith('/groups/') && location.pathname !== '/groups';
  const isHome = location.pathname === '/';

  return (
    <header className={`lg:hidden fixed top-0 left-0 right-0 z-100 h-16 frosted border-b border-[#F0F0F0] transition-shadow duration-200 ${scrolled ? 'shadow-[0_2px_8px_rgba(0,0,0,0.05)]' : ''}`}>
      <div className="flex items-center justify-between h-full px-5">
        <div className="flex items-center gap-3">
          {isGroupDetail ? (
            <button onClick={() => navigate('/groups')} title="Back to groups" aria-label="Back to groups" className="p-2 -ml-2 rounded-full active:bg-black/5">
              <ArrowLeft className="w-5 h-5 text-[#333]" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-[#4F46E5]">Splittr</span>
            </div>
          )}
        </div>

        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-[#000]">
          {!isHome && title}
        </h1>

        <button className="p-2 relative rounded-full active:bg-black/5" aria-label="Notifications" title="Notifications">
          <Bell className="w-5 h-5 text-[#333]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full" />
        </button>
      </div>
    </header>
  );
}
