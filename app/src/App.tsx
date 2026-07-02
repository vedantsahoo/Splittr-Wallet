import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import DashboardScreen from '@/screens/DashboardScreen';
import WalletScreen from '@/screens/WalletScreen';
import SendMoneyScreen from '@/screens/SendMoneyScreen';
import GroupsScreen from '@/screens/GroupsScreen';
import GroupDetailsScreen from '@/screens/GroupDetailsScreen';
import AnalyticsScreen from '@/screens/AnalyticsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import LoginScreen from '@/screens/LoginScreen';
import ToastContainer from '@/components/ToastContainer';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

import { useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { useGroupStore } from '@/store/groupStore';

export default function App() {
  const { isAuthenticated, init: initAuth } = useAuthStore();
  const { init: initWallet } = useWalletStore();
  const { init: initGroups } = useGroupStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      initWallet();
      initGroups();
    }
  }, [isAuthenticated, initWallet, initGroups]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {isAuthenticated ? (
          <Layout>
            <Routes>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardScreen />} />
              <Route path="/wallet" element={<WalletScreen />} />
              <Route path="/send" element={<SendMoneyScreen />} />
              <Route path="/groups" element={<GroupsScreen />} />
              <Route path="/groups/:groupId" element={<GroupDetailsScreen />} />
              <Route path="/analytics" element={<AnalyticsScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

