import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiClient } from '~/lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user has token
      if (!apiClient.isAuthenticated()) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        // Verify token is valid by fetching user
        await apiClient.getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or expired, try to refresh
        try {
          await apiClient.refreshToken();
          await apiClient.getCurrentUser();
          setIsAuthenticated(true);
        } catch {
          // Refresh failed, redirect to login
          apiClient.logout();
          navigate('/login', { replace: true });
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
}
