import { useState, useEffect } from 'react';
import {
  BellIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { apiClient, NotificationPreferences, AlertType, AlertSeverity } from '~/lib/api';

const ALERT_TYPES = [
  { value: AlertType.HIGH_URGENCY, label: 'High Urgency Tickets', description: 'Critical or high priority tickets' },
  { value: AlertType.SLA_BREACH, label: 'SLA Breaches', description: 'When SLA deadlines are missed' },
  { value: AlertType.SLA_WARNING, label: 'SLA Warnings', description: 'When approaching SLA deadlines' },
  { value: AlertType.ANOMALY, label: 'Anomalies', description: 'Unusual patterns or behaviors detected' },
  { value: AlertType.SPIKE, label: 'Traffic Spikes', description: 'Sudden increases in ticket volume' },
  { value: AlertType.CUSTOM, label: 'Custom Rules', description: 'Alerts from custom rules' },
];

const SEVERITY_LEVELS = [
  { value: AlertSeverity.LOW, label: 'Low', description: 'Informational alerts' },
  { value: AlertSeverity.MEDIUM, label: 'Medium', description: 'Moderate importance' },
  { value: AlertSeverity.HIGH, label: 'High', description: 'Important alerts' },
  { value: AlertSeverity.CRITICAL, label: 'Critical', description: 'Urgent attention required' },
];

export function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    slack_enabled: false,
    alert_types: [],
    severities: [],
    quiet_hours: {
      enabled: false,
      start_time: '22:00',
      end_time: '08:00',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getNotificationPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      // Keep default preferences on error so page still renders
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await apiClient.updateNotificationPreferences(preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error('Failed to save preferences:', error);
      alert(error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleAlertType = (alertType: AlertType) => {
    const types = preferences.alert_types || [];
    const updated = types.includes(alertType)
      ? types.filter(t => t !== alertType)
      : [...types, alertType];

    setPreferences({ ...preferences, alert_types: updated });
  };

  const toggleSeverity = (severity: AlertSeverity) => {
    const severities = preferences.severities || [];
    const updated = severities.includes(severity)
      ? severities.filter(s => s !== severity)
      : [...severities, severity];

    setPreferences({ ...preferences, severities: updated });
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
          <h1 className="text-2xl font-semibold text-gray-900">Notification Settings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Configure how and when you receive alerts
          </p>
        </div>

        <div className="mt-4 sm:mt-0">
          <button
            onClick={savePreferences}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Notification Channels */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h2>
          <p className="text-sm text-gray-600 mb-4">
            Choose how you want to receive notifications
          </p>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={preferences.email_enabled}
                  onChange={(e) => setPreferences({ ...preferences, email_enabled: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 flex-1">
                <label className="font-medium text-gray-700 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Email Notifications
                </label>
                <p className="text-sm text-gray-500">
                  Receive alerts via email to your registered email address
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={preferences.slack_enabled}
                  onChange={(e) => setPreferences({ ...preferences, slack_enabled: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 flex-1">
                <label className="font-medium text-gray-700 flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Slack Notifications
                </label>
                <p className="text-sm text-gray-500">
                  Receive alerts via Slack direct messages
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Types */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Alert Types</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select which types of alerts you want to receive
          </p>

          <div className="space-y-3">
            {ALERT_TYPES.map((type) => (
              <div key={type.value} className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={preferences.alert_types?.includes(type.value) || false}
                    onChange={() => toggleAlertType(type.value)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label className="font-medium text-gray-700">{type.label}</label>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Levels */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Severity Levels</h2>
          <p className="text-sm text-gray-600 mb-4">
            Choose minimum severity level for notifications
          </p>

          <div className="space-y-3">
            {SEVERITY_LEVELS.map((level) => (
              <div key={level.value} className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={preferences.severities?.includes(level.value) || false}
                    onChange={() => toggleSeverity(level.value)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label className="font-medium text-gray-700">{level.label}</label>
                  <p className="text-sm text-gray-500">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                Quiet Hours
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Mute non-critical notifications during specific hours
              </p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.quiet_hours?.enabled || false}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    quiet_hours: {
                      ...preferences.quiet_hours!,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Enable Quiet Hours
              </label>
            </div>
          </div>

          {preferences.quiet_hours?.enabled && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.quiet_hours.start_time}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      quiet_hours: {
                        ...preferences.quiet_hours!,
                        start_time: e.target.value,
                      },
                    })
                  }
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.quiet_hours.end_time}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      quiet_hours: {
                        ...preferences.quiet_hours!,
                        end_time: e.target.value,
                      },
                    })
                  }
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="col-span-2">
                <p className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-2">
                  <strong>Note:</strong> Critical alerts will still be delivered during quiet hours
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <BellIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">About Notifications</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Notifications are sent in real-time when alerts are triggered</li>
                  <li>You can manage individual alert rules on the Alert Rules page</li>
                  <li>Changes take effect immediately after saving</li>
                  <li>Critical alerts bypass quiet hours and will always be delivered</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
