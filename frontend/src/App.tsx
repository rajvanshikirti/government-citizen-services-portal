import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute, PublicRoute } from './components/layout/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import ApplyServicePage from './pages/ApplyServicePage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import OfficerPage from './pages/OfficerPage';
import AdminPage from './pages/AdminPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import VerifyPage from './pages/VerifyPage';

function PublicLayout({ children, fullWidth }: { children: React.ReactNode; fullWidth?: boolean }) {
  return <Layout fullWidth={fullWidth}>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout fullWidth><HomePage /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
      <Route path="/verify" element={<PublicLayout><VerifyPage /></PublicLayout>} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        <Route path="/services/:slug/apply" element={<ApplyServicePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['OFFICER', 'ADMIN']} />}>
        <Route path="/officer" element={<OfficerPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
