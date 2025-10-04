import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InboxIcon,
  ClockIcon,
  CheckCircleIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '~/lib/api';

type DateRange = '7d' | '30d' | '90d' | 'custom';

interface DashboardMetrics {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  avg_sentiment: number;
  avg_response_time_hours: number;
  avg_resolution_time_hours: number;
  tickets_by_status: Record<string, number>;
  tickets_by_priority: Record<string, number>;
  tickets_by_category: Record<string, number>;
  sentiment_distribution: Record<string, number>;
  trend_data?: {
    ticket_volume_change: number;
    sentiment_change: number;
  };
}

export function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [sentimentTrend, setSentimentTrend] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, customStartDate, customEndDate]);

  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    if (dateRange === 'custom' && customStartDate && customEndDate) {
      return {
        start_date: customStartDate,
        end_date: customEndDate,
      };
    }

    switch (dateRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    return {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { start_date, end_date } = getDateRange();

      // Load dashboard metrics
      const dashboardData = await apiClient.getAnalyticsDashboard({
        start_date,
        end_date,
      });
      setMetrics(dashboardData);

      // Load ticket volume time series
      const volumeResponse = await apiClient.getAnalyticsTimeSeries({
        metric_type: 'ticket_volume',
        start_date,
        end_date,
        granularity: dateRange === '7d' ? 'hourly' : 'daily',
      });
      setVolumeData(volumeResponse.data || []);

      // Load sentiment trend
      const sentimentResponse = await apiClient.getAnalyticsTimeSeries({
        metric_type: 'avg_sentiment',
        start_date,
        end_date,
        granularity: dateRange === '7d' ? 'hourly' : 'daily',
      });
      setSentimentTrend(sentimentResponse.data || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    positive: '#10b981',
    neutral: '#f59e0b',
    negative: '#ef4444',
    primary: '#dc2626',
    secondary: '#2563eb',
    tertiary: '#8b5cf6',
  };

  const getCategoryData = () => {
    if (!metrics?.tickets_by_category) return [];
    return Object.entries(metrics.tickets_by_category).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getSentimentData = () => {
    if (!metrics?.sentiment_distribution) return [];
    return Object.entries(metrics.sentiment_distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill:
        name === 'positive'
          ? COLORS.positive
          : name === 'negative'
          ? COLORS.negative
          : COLORS.neutral,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Comprehensive insights into your support tickets and performance
          </p>
        </div>

        {/* Date Range Picker */}
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDateRange('7d')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                dateRange === '7d'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                dateRange === '30d'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('90d')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                dateRange === '90d'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                dateRange === 'custom'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Custom
            </button>
          </div>

          {dateRange === 'custom' && (
            <div className="mt-3 flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <InboxIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tickets</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics?.total_tickets || 0}
                    </div>
                    {metrics?.trend_data?.ticket_volume_change !== undefined && (
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          metrics.trend_data.ticket_volume_change >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {metrics.trend_data.ticket_volume_change >= 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-0.5" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 mr-0.5" />
                        )}
                        {Math.abs(metrics.trend_data.ticket_volume_change)}%
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaceSmileIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Sentiment</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics?.avg_sentiment
                        ? (metrics.avg_sentiment * 100).toFixed(1) + '%'
                        : 'N/A'}
                    </div>
                    {metrics?.trend_data?.sentiment_change !== undefined && (
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          metrics.trend_data.sentiment_change >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {metrics.trend_data.sentiment_change >= 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-0.5" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 mr-0.5" />
                        )}
                        {Math.abs(metrics.trend_data.sentiment_change)}%
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Response Time</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {metrics?.avg_response_time_hours
                      ? `${metrics.avg_response_time_hours.toFixed(1)}h`
                      : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Resolution Time</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {metrics?.avg_resolution_time_hours
                      ? `${metrics.avg_resolution_time_hours.toFixed(1)}h`
                      : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Volume Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Ticket Volume Over Time</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: any) => [value, 'Tickets']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={COLORS.primary}
                strokeWidth={2}
                name="Tickets"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Trend Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FaceSmileIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Sentiment Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis domain={[-1, 1]} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: any) => [(value * 100).toFixed(1) + '%', 'Sentiment']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={COLORS.secondary}
                strokeWidth={2}
                name="Avg Sentiment"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Category Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getCategoryData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={COLORS.tertiary} name="Tickets" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Distribution Pie Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FaceSmileIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Sentiment Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getSentimentData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getSentimentData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
