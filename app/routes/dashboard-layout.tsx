import { Outlet } from 'react-router';
import { ProtectedRoute } from '~/components/ProtectedRoute';
import { DashboardLayout } from '~/components/dashboard/DashboardLayout';

export default function DashboardLayoutRoute() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
