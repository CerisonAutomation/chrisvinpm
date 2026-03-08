import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { useAdminMe } from '@/hooks/useAdmin';
import { Loader2 } from 'lucide-react';

export function AdminLayout() {
  const { isAuthenticated, token } = useAuthStore();
  const { isLoading, isError } = useAdminMe();

  // Show loading while checking auth
  if (token && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // If not authenticated or token invalid, the AdminPage will show login
  return <Outlet />;
}
