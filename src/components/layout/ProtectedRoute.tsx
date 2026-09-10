// Benita Granites — Protected Route Component
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/constants';
import { ROLE_HIERARCHY } from '@/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  minRoleLevel?: number;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  minRoleLevel,
}: ProtectedRouteProps) {
  const { user, profile, loading, initialized } = useAuthStore();
  const location = useLocation();

  // Show loading while Firebase initializes
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg">BG</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && profile?.role !== requiredRole) {
    const userLevel = ROLE_HIERARCHY[profile?.role as UserRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return <Navigate to="/" replace />;
    }
  }

  if (minRoleLevel && profile) {
    const userLevel = ROLE_HIERARCHY[profile.role as UserRole] || 0;
    if (userLevel < minRoleLevel) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
