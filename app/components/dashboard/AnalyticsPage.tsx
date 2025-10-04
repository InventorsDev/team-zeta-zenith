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
  Brush,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InboxIcon,
  ClockIcon,
  CheckCircleIcon,
  FaceSmileIcon,
  ArrowDownTrayIcon,
  FireIcon,
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
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

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

      // Load comparison data if enabled
      if (showComparison) {
        await loadComparisonData(start_date, end_date);
      }

      // Generate heatmap data from volume data
      generateHeatmapData(volumeResponse.data || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComparisonData = async (currentStart: string, currentEnd: string) => {
    try {
      const currentStartDate = new Date(currentStart);
      const currentEndDate = new Date(currentEnd);
      const duration = currentEndDate.getTime() - currentStartDate.getTime();

      const previousEndDate = new Date(currentStartDate.getTime() - 1);
      const previousStartDate = new Date(previousEndDate.getTime() - duration);

      const comparisonResponse = await apiClient.getAnalyticsTimeSeries({
        metric_type: 'ticket_volume',
        start_date: previousStartDate.toISOString(),
        end_date: previousEndDate.toISOString(),
        granularity: dateRange === '7d' ? 'hourly' : 'daily',
      });
      setComparisonData(comparisonResponse.data || []);
    } catch (error) {
      console.error('Failed to load comparison data:', error);
    }
  };
  console.log("metrics", metrics)

  const generateHeatmapData = (data: any[]) => {
    // Create a matrix for day of week (0-6) and hour (0-23)
    const heatmapMatrix: Record<string, Record<string, number>> = {};

    // Initialize matrix
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        if (!heatmapMatrix[day]) heatmapMatrix[day] = {};
        heatmapMatrix[day][hour] = 0;
      }
    }

    // Populate matrix with ticket counts
    data.forEach((item) => {
      const date = new Date(item.timestamp);
      const day = date.getDay();
      const hour = date.getHours();
      heatmapMatrix[day][hour] += item.value || 0;
    });

    // Convert matrix to array format for visualization
    const heatmapArray: any[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmapArray.push({
          day: dayNames[day],
          dayIndex: day,
          hour: hour,
          value: heatmapMatrix[day][hour],
        });
      }
    }

    setHeatmapData(heatmapArray);
  };

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    setExporting(true);
    try {
      const { start_date, end_date } = getDateRange();
      const response = await apiClient.exportAnalytics({
        metric_types: ['ticket_volume', 'avg_sentiment'],
        start_date,
        end_date,
        format,
        granularity: dateRange === '7d' ? 'hourly' : 'daily',
      });

      // Create download link
      const blob = new Blob([format === 'csv' ? response : JSON.stringify(response, null, 2)], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_export_${new Date().toISOString()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
      alert('Failed to export analytics. Please try again.');
    } finally {
      setExporting(false);
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

  const getHeatmapColor = (value: number) => {
    const maxValue = Math.max(...heatmapData.map((d) => d.value), 1);
    const intensity = value / maxValue;

    if (intensity === 0) return '#f3f4f6'; // gray-100
    if (intensity < 0.2) return '#fef3c7'; // yellow-100
    if (intensity < 0.4) return '#fed7aa'; // orange-200
    if (intensity < 0.6) return '#fca5a5'; // red-300
    if (intensity < 0.8) return '#f87171'; // red-400
    return '#dc2626'; // red-600
  };

  const CustomHeatmapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900">
            {data.day} at {data.hour}:00
          </p>
          <p className="text-sm text-gray-700">
            Tickets: <span className="font-medium">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
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

        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          {/* Comparison Toggle */}
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              showComparison
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showComparison ? 'Hide' : 'Show'} Comparison
          </button>

          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Ticket Volume Over Time</h3>
            </div>
            {showComparison && (
              <span className="text-xs text-gray-500">Current period vs Previous period</span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={350}>
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
                name="Current Period"
                dot={false}
              />
              {showComparison && comparisonData.length > 0 && (
                <Line
                  type="monotone"
                  data={comparisonData}
                  dataKey="value"
                  stroke={COLORS.secondary}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Previous Period"
                  dot={false}
                />
              )}
              <Brush
                dataKey="timestamp"
                height={30}
                stroke={COLORS.primary}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
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

      {/* Temporal Heatmap - Full Width */}
      {heatmapData.length > 0 && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FireIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Ticket Volume Heatmap</h3>
            <span className="ml-2 text-xs text-gray-500">(by day of week and hour)</span>
          </div>

          {/* Custom Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Hour labels (top) */}
              <div className="flex mb-1">
                <div className="w-12"></div>
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 text-xs text-center text-gray-600"
                    style={{ width: '36px' }}
                  >
                    {i % 3 === 0 ? i : ''}
                  </div>
                ))}
              </div>

              {/* Heatmap rows */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => (
                <div key={day} className="flex mb-1">
                  {/* Day label */}
                  <div className="w-12 text-xs text-right pr-2 text-gray-600 flex items-center justify-end">
                    {day}
                  </div>

                  {/* Hour cells */}
                  {Array.from({ length: 24 }, (_, hour) => {
                    const cellData = heatmapData.find(
                      (d) => d.dayIndex === dayIndex && d.hour === hour
                    );
                    const value = cellData?.value || 0;
                    const color = getHeatmapColor(value);

                    return (
                      <div
                        key={hour}
                        className="flex-shrink-0 border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity relative group"
                        style={{
                          width: '36px',
                          height: '32px',
                          backgroundColor: color,
                        }}
                        title={`${day} ${hour}:00 - ${value} tickets`}
                      >
                        {/* Tooltip on hover */}
                        <div className="hidden group-hover:block absolute z-10 bg-gray-900 text-white text-xs rounded px-2 py-1 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                          {day} {hour}:00 - {value} tickets
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-xs text-gray-600">Less</span>
                <div className="flex gap-1">
                  {['#f3f4f6', '#fef3c7', '#fed7aa', '#fca5a5', '#f87171', '#dc2626'].map(
                    (color, i) => (
                      <div
                        key={i}
                        className="w-6 h-4 border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    )
                  )}
                </div>
                <span className="text-xs text-gray-600">More</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
