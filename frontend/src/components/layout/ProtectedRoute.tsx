import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from './Layout';
import { LoadingSpinner } from '../common/Badge';
import type { Role } from '../../types';

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner size="lg" />
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner size="lg" />
      </Layout>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
