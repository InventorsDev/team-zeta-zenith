import { useState, useEffect } from 'react';
import {
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { apiClient, type Alert, AlertType, AlertSeverity } from '~/lib/api';

const SEVERITY_COLORS = {
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'text-yellow-500' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-500' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500' },
};

const ALERT_TYPE_LABELS = {
  [AlertType.HIGH_URGENCY]: { label: 'High Urgency', icon: '🚨' },
  [AlertType.SLA_BREACH]: { label: 'SLA Breach', icon: '⏰' },
  [AlertType.SLA_WARNING]: { label: 'SLA Warning', icon: '⚠️' },
  [AlertType.ANOMALY]: { label: 'Anomaly', icon: '🔍' },
  [AlertType.SPIKE]: { label: 'Spike', icon: '📈' },
  [AlertType.CUSTOM]: { label: 'Custom', icon: '⚙️' },
};

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('active');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [acknowledgingAlert, setAcknowledgingAlert] = useState<number | null>(null);
  const [ackNotes, setAckNotes] = useState('');

  useEffect(() => {
    loadAlerts();
  }, [filter, severityFilter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const params: any = { size: 100 };

      if (filter === 'active') {
        params.is_resolved = false;
      } else if (filter === 'resolved') {
        params.is_resolved = true;
      }

      if (severityFilter !== 'all') {
        params.severity = severityFilter;
      }

      const data = await apiClient.getAlerts(params);
      setAlerts(data.items || []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      // Set empty array on error so page still renders
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: number) => {
    setAcknowledgingAlert(alertId);
  };

  const submitAcknowledgment = async () => {
    if (!acknowledgingAlert) return;

    try {
      await apiClient.acknowledgeAlert(acknowledgingAlert, ackNotes);
      await loadAlerts();
      setAcknowledgingAlert(null);
      setAckNotes('');
    } catch (error: any) {
      console.error('Failed to acknowledge alert:', error);
      alert(error.message || 'Failed to acknowledge alert');
    }
  };

  const handleResolve = async (alertId: number) => {
    try {
      await apiClient.resolveAlert(alertId);
      await loadAlerts();
    } catch (error: any) {
      console.error('Failed to resolve alert:', error);
      alert(error.message || 'Failed to resolve alert');
    }
  };

  const handleDelete = async (alertId: number) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      await apiClient.deleteAlert(alertId);
      await loadAlerts();
      if (selectedAlert?.id === alertId) {
        setSelectedAlert(null);
      }
    } catch (error: any) {
      console.error('Failed to delete alert:', error);
      alert(error.message || 'Failed to delete alert');
    }
  };

  const getSeverityColor = (severity: string) => {
    return SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.low;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStats = () => {
    const total = alerts.length;
    const active = alerts.filter(a => !a.is_resolved).length;
    const critical = alerts.filter(a => a.severity === AlertSeverity.CRITICAL && !a.is_resolved).length;
    const resolved = alerts.filter(a => a.is_resolved).length;

    return { total, active, critical, resolved };
  };

  const stats = getStats();

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
          <h1 className="text-2xl font-semibold text-gray-900">Alerts</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitor and manage system alerts and notifications
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BellIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Alerts</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.active}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Critical</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.critical}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.resolved}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex gap-2">
              {['all', 'active', 'acknowledged', 'resolved'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    filter === f
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All</option>
              <option value={AlertSeverity.LOW}>Low</option>
              <option value={AlertSeverity.MEDIUM}>Medium</option>
              <option value={AlertSeverity.HIGH}>High</option>
              <option value={AlertSeverity.CRITICAL}>Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {alerts.map((alert) => {
            const severityColor = getSeverityColor(alert.severity);
            const alertTypeInfo = ALERT_TYPE_LABELS[alert.alert_type];

            return (
              <li
                key={alert.id}
                className={`${severityColor.bg} border-l-4 ${severityColor.border} hover:bg-opacity-80 cursor-pointer transition-colors`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{alertTypeInfo.icon}</span>
                        <h3 className={`text-sm font-semibold ${severityColor.text}`}>
                          {alert.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColor.bg} ${severityColor.text}`}>
                          {alert.severity}
                        </span>
                        {alert.is_resolved && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Resolved
                          </span>
                        )}
                      </div>

                      {alert.message && (
                        <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatTimestamp(alert.triggered_at)}
                        </span>
                        {alert.notification_channels && alert.notification_channels.length > 0 && (
                          <span>
                            📢 {alert.notification_channels.join(', ')}
                          </span>
                        )}
                        {alert.ticket_id && (
                          <span>Ticket #{alert.ticket_id}</span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex-shrink-0 flex flex-col gap-2">
                      {!alert.is_resolved && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcknowledge(alert.id);
                            }}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <ChatBubbleLeftIcon className="h-3 w-3 mr-1" />
                            Acknowledge
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolve(alert.id);
                            }}
                            className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Resolve
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {alerts.length === 0 && (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No alerts found</p>
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setSelectedAlert(null)} />

            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Alert Details</h3>
                  <button onClick={() => setSelectedAlert(null)}>
                    <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAlert.title}</p>
                  </div>

                  {selectedAlert.message && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Message</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAlert.message}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {ALERT_TYPE_LABELS[selectedAlert.alert_type].label}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Severity</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{selectedAlert.severity}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Triggered</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedAlert.triggered_at).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedAlert.is_resolved ? 'Resolved' : 'Active'}
                      </p>
                    </div>
                  </div>

                  {selectedAlert.metadata && Object.keys(selectedAlert.metadata).length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Additional Info</label>
                      <pre className="mt-1 text-xs bg-gray-50 p-3 rounded-md overflow-auto">
                        {JSON.stringify(selectedAlert.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                <button
                  onClick={() => handleDelete(selectedAlert.id)}
                  className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acknowledgment Modal */}
      {acknowledgingAlert && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setAcknowledgingAlert(null)} />

            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Acknowledge Alert</h3>
                  <button onClick={() => setAcknowledgingAlert(null)}>
                    <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={ackNotes}
                    onChange={(e) => setAckNotes(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Add any notes about this acknowledgment..."
                  />
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setAcknowledgingAlert(null);
                    setAckNotes('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAcknowledgment}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
