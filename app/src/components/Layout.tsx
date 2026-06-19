import { useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import TopAppBar from './TopAppBar';
import BottomNavigation from './BottomNavigation';
import NavigationRail from './NavigationRail';
import { AnimatePresence, motion } from 'framer-motion';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/wallet': 'Wallet',
  '/send': 'Send Money',
  '/groups': 'Groups',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isGroupDetail = location.pathname.startsWith('/groups/') && location.pathname !== '/groups';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentTitle = isGroupDetail ? 'Group Details' : (pageTitles[location.pathname] || 'Splittr');

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <NavigationRail />
      <TopAppBar title={currentTitle} scrolled={scrolled} />

      <main className="lg:ml-[280px] pb-24 lg:pb-8 pt-16 lg:pt-0 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNavigation />
    </div>
  );
}
