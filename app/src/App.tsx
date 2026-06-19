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
import ToastContainer from '@/components/ToastContainer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}> {/* */}
      <BrowserRouter>
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
          </Routes>
        </Layout>
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
