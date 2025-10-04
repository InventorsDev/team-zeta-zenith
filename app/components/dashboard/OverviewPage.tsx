import { useState, useEffect } from 'react';
import { ChartBarIcon, InboxIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { apiClient } from '~/lib/api';
import { LoadingSpinner, Alert } from '~/components/ui';

interface DashboardStats {
  totalTickets: number;
  resolved: number;
  pending: number;
  responseRate: number;
  totalTicketsChange?: number;
  resolvedChange?: number;
  pendingChange?: number;
  responseRateChange?: number;
}

export function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.getAnalyticsDashboard();

      setStats({
        totalTickets: data.total_tickets || 0,
        resolved: data.resolved_tickets || 0,
        pending: data.pending_tickets || 0,
        responseRate: data.response_rate || 0,
        totalTicketsChange: data.total_tickets_change,
        resolvedChange: data.resolved_tickets_change,
        pendingChange: data.pending_tickets_change,
        responseRateChange: data.response_rate_change,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatChange = (change?: number): string => {
    if (change === undefined || change === null) return '';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const statsConfig = stats ? [
    {
      name: 'Total Tickets',
      value: stats.totalTickets.toString(),
      icon: InboxIcon,
      change: formatChange(stats.totalTicketsChange),
      changeType: (stats.totalTicketsChange ?? 0) >= 0 ? 'increase' : 'decrease'
    },
    {
      name: 'Resolved',
      value: stats.resolved.toString(),
      icon: CheckCircleIcon,
      change: formatChange(stats.resolvedChange),
      changeType: (stats.resolvedChange ?? 0) >= 0 ? 'increase' : 'decrease'
    },
    {
      name: 'Pending',
      value: stats.pending.toString(),
      icon: ClockIcon,
      change: formatChange(stats.pendingChange),
      changeType: (stats.pendingChange ?? 0) >= 0 ? 'increase' : 'decrease'
    },
    {
      name: 'Response Rate',
      value: `${stats.responseRate.toFixed(0)}%`,
      icon: ChartBarIcon,
      change: formatChange(stats.responseRateChange),
      changeType: (stats.responseRateChange ?? 0) >= 0 ? 'increase' : 'decrease'
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Welcome back! Here's what's happening with your support tickets today.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert variant="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsConfig.map((item) => (
          <div
            key={item.name}
            className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {item.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {item.value}
                      </div>
                      {item.change && (
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            item.changeType === 'increase'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {item.change}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Recent Activity
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">
            Recent ticket activity will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
