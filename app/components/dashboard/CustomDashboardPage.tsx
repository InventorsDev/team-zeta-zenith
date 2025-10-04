import { useState, useEffect } from 'react';
import {
  PlusIcon,
  XMarkIcon,
  Cog6ToothIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '~/lib/api';
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

type WidgetType = 'metric' | 'line_chart' | 'bar_chart' | 'pie_chart';
type WidgetSize = 'small' | 'medium' | 'large';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  metric?: string;
  dataSource?: string;
  position: number;
}

interface DashboardConfig {
  id: string;
  name: string;
  widgets: Widget[];
}

const WIDGET_TYPES = [
  { value: 'metric', label: 'Metric Card', icon: '📊' },
  { value: 'line_chart', label: 'Line Chart', icon: '📈' },
  { value: 'bar_chart', label: 'Bar Chart', icon: '📊' },
  { value: 'pie_chart', label: 'Pie Chart', icon: '🥧' },
];

const METRIC_OPTIONS = [
  { value: 'total_tickets', label: 'Total Tickets' },
  { value: 'avg_sentiment', label: 'Average Sentiment' },
  { value: 'avg_response_time', label: 'Avg Response Time' },
  { value: 'avg_resolution_time', label: 'Resolution Time' },
  { value: 'open_tickets', label: 'Open Tickets' },
  { value: 'resolved_tickets', label: 'Resolved Tickets' },
];

const DATA_SOURCE_OPTIONS = [
  { value: 'ticket_volume', label: 'Ticket Volume' },
  { value: 'sentiment_trend', label: 'Sentiment Trend' },
  { value: 'category_distribution', label: 'Category Distribution' },
  { value: 'sentiment_distribution', label: 'Sentiment Distribution' },
  { value: 'priority_distribution', label: 'Priority Distribution' },
];

export function CustomDashboardPage() {
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<DashboardConfig | null>(null);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [dashboardData, setDashboardData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboards();
  }, []);

  useEffect(() => {
    if (currentDashboard) {
      loadDashboardData();
    }
  }, [currentDashboard]);

  const loadDashboards = () => {
    // Load from localStorage (or could be from backend)
    const saved = localStorage.getItem('custom_dashboards');
    if (saved) {
      const parsed = JSON.parse(saved);
      setDashboards(parsed);
      if (parsed.length > 0) {
        setCurrentDashboard(parsed[0]);
      }
    } else {
      // Create default dashboard
      const defaultDashboard: DashboardConfig = {
        id: 'default',
        name: 'My Dashboard',
        widgets: [],
      };
      setDashboards([defaultDashboard]);
      setCurrentDashboard(defaultDashboard);
    }
  };

  const saveDashboards = (updatedDashboards: DashboardConfig[]) => {
    localStorage.setItem('custom_dashboards', JSON.stringify(updatedDashboards));
    setDashboards(updatedDashboards);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const [metricsData, volumeData, sentimentData] = await Promise.all([
        apiClient.getAnalyticsDashboard({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }),
        apiClient.getAnalyticsTimeSeries({
          metric_type: 'ticket_volume',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          granularity: 'daily',
        }),
        apiClient.getAnalyticsTimeSeries({
          metric_type: 'avg_sentiment',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          granularity: 'daily',
        }),
      ]);

      setDashboardData({
        metrics: metricsData,
        ticket_volume: volumeData.data || [],
        sentiment_trend: sentimentData.data || [],
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDashboard = () => {
    const newDashboard: DashboardConfig = {
      id: `dashboard_${Date.now()}`,
      name: `Dashboard ${dashboards.length + 1}`,
      widgets: [],
    };
    const updated = [...dashboards, newDashboard];
    saveDashboards(updated);
    setCurrentDashboard(newDashboard);
  };

  const deleteDashboard = (id: string) => {
    const updated = dashboards.filter((d) => d.id !== id);
    saveDashboards(updated);
    if (currentDashboard?.id === id) {
      setCurrentDashboard(updated[0] || null);
    }
  };

  const addWidget = (type: WidgetType) => {
    if (!currentDashboard) return;

    const newWidget: Widget = {
      id: `widget_${Date.now()}`,
      type,
      title: `New ${type.replace('_', ' ')}`,
      size: 'medium',
      position: currentDashboard.widgets.length,
    };

    setEditingWidget(newWidget);
    setShowWidgetPicker(false);
  };

  const saveWidget = () => {
    if (!currentDashboard || !editingWidget) return;

    const existingIndex = currentDashboard.widgets.findIndex((w) => w.id === editingWidget.id);
    let updatedWidgets;

    if (existingIndex >= 0) {
      updatedWidgets = [...currentDashboard.widgets];
      updatedWidgets[existingIndex] = editingWidget;
    } else {
      updatedWidgets = [...currentDashboard.widgets, editingWidget];
    }

    const updatedDashboard = {
      ...currentDashboard,
      widgets: updatedWidgets,
    };

    const updatedDashboards = dashboards.map((d) =>
      d.id === currentDashboard.id ? updatedDashboard : d
    );

    saveDashboards(updatedDashboards);
    setCurrentDashboard(updatedDashboard);
    setEditingWidget(null);
  };

  const deleteWidget = (widgetId: string) => {
    if (!currentDashboard) return;

    const updatedWidgets = currentDashboard.widgets.filter((w) => w.id !== widgetId);
    const updatedDashboard = {
      ...currentDashboard,
      widgets: updatedWidgets,
    };

    const updatedDashboards = dashboards.map((d) =>
      d.id === currentDashboard.id ? updatedDashboard : d
    );

    saveDashboards(updatedDashboards);
    setCurrentDashboard(updatedDashboard);
  };

  const renderWidget = (widget: Widget) => {
    const sizeClasses = {
      small: 'col-span-1',
      medium: 'col-span-2',
      large: 'col-span-4',
    };

    return (
      <div
        key={widget.id}
        className={`bg-white shadow rounded-lg p-6 ${sizeClasses[widget.size]} relative group`}
      >
        {/* Widget Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button
            onClick={() => setEditingWidget(widget)}
            className="p-1 bg-white rounded shadow hover:bg-gray-50"
          >
            <Cog6ToothIcon className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => deleteWidget(widget.id)}
            className="p-1 bg-white rounded shadow hover:bg-gray-50"
          >
            <TrashIcon className="h-4 w-4 text-red-600" />
          </button>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-4">{widget.title}</h3>

        {widget.type === 'metric' && widget.metric && (
          <div>
            <div className="text-3xl font-semibold text-gray-900">
              {getMetricValue(widget.metric)}
            </div>
            <div className="text-sm text-gray-500 mt-1">{widget.metric.replace(/_/g, ' ')}</div>
          </div>
        )}

        {widget.type === 'line_chart' && widget.dataSource && (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={getChartData(widget.dataSource)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}

        {widget.type === 'bar_chart' && widget.dataSource && (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={getChartData(widget.dataSource)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {widget.type === 'pie_chart' && widget.dataSource && (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={getChartData(widget.dataSource)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getChartData(widget.dataSource).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  };

  const getMetricValue = (metric: string) => {
    if (!dashboardData.metrics) return 'N/A';

    switch (metric) {
      case 'total_tickets':
        return dashboardData.metrics.total_tickets?.toLocaleString() || '0';
      case 'avg_sentiment':
        return dashboardData.metrics.avg_sentiment
          ? (dashboardData.metrics.avg_sentiment * 100).toFixed(1) + '%'
          : 'N/A';
      case 'avg_response_time':
        return dashboardData.metrics.avg_response_time_hours
          ? dashboardData.metrics.avg_response_time_hours.toFixed(1) + 'h'
          : 'N/A';
      case 'avg_resolution_time':
        return dashboardData.metrics.avg_resolution_time_hours
          ? dashboardData.metrics.avg_resolution_time_hours.toFixed(1) + 'h'
          : 'N/A';
      case 'open_tickets':
        return dashboardData.metrics.open_tickets?.toLocaleString() || '0';
      case 'resolved_tickets':
        return dashboardData.metrics.resolved_tickets?.toLocaleString() || '0';
      default:
        return 'N/A';
    }
  };

  const getChartData = (dataSource: string) => {
    switch (dataSource) {
      case 'ticket_volume':
        return dashboardData.ticket_volume || [];
      case 'sentiment_trend':
        return dashboardData.sentiment_trend || [];
      case 'category_distribution':
        return Object.entries(dashboardData.metrics?.tickets_by_category || {}).map(
          ([name, value]) => ({ name, value })
        );
      case 'sentiment_distribution':
        return Object.entries(dashboardData.metrics?.sentiment_distribution || {}).map(
          ([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            fill:
              name === 'positive' ? '#10b981' : name === 'negative' ? '#ef4444' : '#f59e0b',
          })
        );
      case 'priority_distribution':
        return Object.entries(dashboardData.metrics?.tickets_by_priority || {}).map(
          ([name, value]) => ({ name, value })
        );
      default:
        return [];
    }
  };

  const COLORS = ['#dc2626', '#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading && !currentDashboard) {
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
          <h1 className="text-2xl font-semibold text-gray-900">Custom Dashboards</h1>
          <p className="mt-2 text-sm text-gray-700">
            Build and customize your own analytics dashboard
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex gap-3">
          <button
            onClick={createDashboard}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Dashboard
          </button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      {dashboards.length > 0 && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Dashboards">
              {dashboards.map((dashboard) => (
                <button
                  key={dashboard.id}
                  onClick={() => setCurrentDashboard(dashboard)}
                  className={`${
                    currentDashboard?.id === dashboard.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  {dashboard.name}
                  {dashboards.length > 1 && (
                    <XMarkIcon
                      className="h-4 w-4 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDashboard(dashboard.id);
                      }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {currentDashboard && (
        <>
          {/* Add Widget Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowWidgetPicker(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Widget
            </button>
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentDashboard.widgets.map((widget) => renderWidget(widget))}
          </div>

          {currentDashboard.widgets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No widgets yet. Click "Add Widget" to get started.</p>
            </div>
          )}
        </>
      )}

      {/* Widget Picker Modal */}
      {showWidgetPicker && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowWidgetPicker(false)} />

            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Choose Widget Type</h3>
                <button onClick={() => setShowWidgetPicker(false)}>
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {WIDGET_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => addWidget(type.value as WidgetType)}
                    className="p-4 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors text-center"
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="text-sm font-medium text-gray-900">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widget Editor Modal */}
      {editingWidget && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setEditingWidget(null)} />

            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Configure Widget</h3>
                <button onClick={() => setEditingWidget(null)}>
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingWidget.title}
                    onChange={(e) =>
                      setEditingWidget({ ...editingWidget, title: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <select
                    value={editingWidget.size}
                    onChange={(e) =>
                      setEditingWidget({
                        ...editingWidget,
                        size: e.target.value as WidgetSize,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                {editingWidget.type === 'metric' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
                    <select
                      value={editingWidget.metric || ''}
                      onChange={(e) =>
                        setEditingWidget({ ...editingWidget, metric: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select metric...</option>
                      {METRIC_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {['line_chart', 'bar_chart', 'pie_chart'].includes(editingWidget.type) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Source
                    </label>
                    <select
                      value={editingWidget.dataSource || ''}
                      onChange={(e) =>
                        setEditingWidget({ ...editingWidget, dataSource: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select data source...</option>
                      {DATA_SOURCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setEditingWidget(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveWidget}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Save Widget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
