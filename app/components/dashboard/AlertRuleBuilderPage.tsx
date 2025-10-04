import { useState, useEffect } from 'react';
import {
  PlusIcon,
  XMarkIcon,
  BeakerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import {
  apiClient,
  type AlertRule,
  AlertType,
  AlertSeverity,
  type AlertCondition,
  type AlertAction,
} from '~/lib/api';

const ALERT_TYPES = [
  { value: AlertType.HIGH_URGENCY, label: 'High Urgency', icon: '🚨' },
  { value: AlertType.SLA_BREACH, label: 'SLA Breach', icon: '⏰' },
  { value: AlertType.SLA_WARNING, label: 'SLA Warning', icon: '⚠️' },
  { value: AlertType.ANOMALY, label: 'Anomaly Detected', icon: '🔍' },
  { value: AlertType.SPIKE, label: 'Traffic Spike', icon: '📈' },
  { value: AlertType.CUSTOM, label: 'Custom Rule', icon: '⚙️' },
];

const SEVERITY_LEVELS = [
  { value: AlertSeverity.LOW, label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: AlertSeverity.MEDIUM, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: AlertSeverity.HIGH, label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: AlertSeverity.CRITICAL, label: 'Critical', color: 'bg-red-100 text-red-800' },
];

const CONDITION_FIELDS = [
  { value: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
  { value: 'status', label: 'Status', type: 'select', options: ['open', 'in_progress', 'waiting', 'resolved', 'closed'] },
  { value: 'sentiment_score', label: 'Sentiment Score', type: 'number' },
  { value: 'response_time_hours', label: 'Response Time (hours)', type: 'number' },
  { value: 'resolution_time_hours', label: 'Resolution Time (hours)', type: 'number' },
  { value: 'category', label: 'Category', type: 'text' },
  { value: 'channel', label: 'Channel', type: 'select', options: ['email', 'slack', 'zendesk', 'web'] },
  { value: 'assigned_to', label: 'Assigned To', type: 'number' },
];

const OPERATORS = [
  { value: 'eq', label: 'equals' },
  { value: 'ne', label: 'not equals' },
  { value: 'gt', label: 'greater than' },
  { value: 'lt', label: 'less than' },
  { value: 'gte', label: 'greater than or equal' },
  { value: 'lte', label: 'less than or equal' },
  { value: 'contains', label: 'contains' },
  { value: 'not_contains', label: 'does not contain' },
];

const NOTIFICATION_CHANNELS = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'slack', label: 'Slack', icon: '💬' },
  { value: 'webhook', label: 'Webhook', icon: '🔗' },
];

export function AlertRuleBuilderPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<AlertRule> | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<{ matches: number; sample_tickets: any[] } | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAlertRules();
      setRules(data || []);
    } catch (error) {
      console.error('Failed to load alert rules:', error);
      // Set empty array on error so page still renders
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const createNewRule = () => {
    setEditingRule({
      name: '',
      description: '',
      alert_type: AlertType.CUSTOM,
      severity: AlertSeverity.MEDIUM,
      conditions: [],
      actions: [],
      enabled: true,
      notification_channels: ['email'],
    });
    setShowEditor(true);
    setTestResults(null);
  };

  const editRule = (rule: AlertRule) => {
    setEditingRule(rule);
    setShowEditor(true);
    setTestResults(null);
  };

  const saveRule = async () => {
    if (!editingRule || !editingRule.name || editingRule.conditions?.length === 0) {
      alert('Please provide a name and at least one condition');
      return;
    }

    try {
      if (editingRule.id) {
        await apiClient.updateAlertRule(editingRule.id, editingRule);
      } else {
        await apiClient.createAlertRule(editingRule as Omit<AlertRule, 'id'>);
      }
      await loadRules();
      setShowEditor(false);
      setEditingRule(null);
    } catch (error: any) {
      console.error('Failed to save rule:', error);
      alert(error.message || 'Failed to save rule');
    }
  };

  const deleteRule = async (id: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      await apiClient.deleteAlertRule(id);
      await loadRules();
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const testRule = async () => {
    if (!editingRule || editingRule.conditions?.length === 0) {
      alert('Please add at least one condition');
      return;
    }

    setTesting(true);
    try {
      const results = await apiClient.testAlertRule(editingRule as Omit<AlertRule, 'id'>);
      setTestResults(results);
    } catch (error: any) {
      console.error('Failed to test rule:', error);
      alert(error.message || 'Failed to test rule');
    } finally {
      setTesting(false);
    }
  };

  const addCondition = () => {
    if (!editingRule) return;

    const newCondition: AlertCondition = {
      field: 'priority',
      operator: 'eq',
      value: '',
      logic: (editingRule.conditions?.length ?? 0) > 0 ? 'AND' : undefined,
    };

    setEditingRule({
      ...editingRule,
      conditions: [...editingRule.conditions ?? [], newCondition],
    });
  };

  const updateCondition = (index: number, updates: Partial<AlertCondition>) => {
    if (!editingRule) return;

    const updatedConditions = [...editingRule.conditions ?? []];
    updatedConditions[index] = { ...updatedConditions[index], ...updates };

    setEditingRule({
      ...editingRule,
      conditions: updatedConditions,
    });
  };

  const removeCondition = (index: number) => {
    if (!editingRule) return;

    const updatedConditions = editingRule.conditions?.filter((_, i) => i !== index);

    // Remove logic from first condition if it exists
    if (Array.isArray(updatedConditions) && updatedConditions.length > 0) {
      if (updatedConditions[0].logic) {
        updatedConditions[0].logic = undefined;
      }
    }


    setEditingRule({
      ...editingRule,
      conditions: updatedConditions,
    });
  };

  const toggleNotificationChannel = (channel: string) => {
    if (!editingRule) return;

    const channels = editingRule.notification_channels || [];
    const updated = channels.includes(channel)
      ? channels.filter(c => c !== channel)
      : [...channels, channel];

    setEditingRule({
      ...editingRule,
      notification_channels: updated,
    });
  };

  const getConditionFieldConfig = (fieldValue: string) => {
    return CONDITION_FIELDS.find(f => f.value === fieldValue) || CONDITION_FIELDS[0];
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
          <h1 className="text-2xl font-semibold text-gray-900">Alert Rules</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage automated alert rules for your support tickets
          </p>
        </div>

        <div className="mt-4 sm:mt-0">
          <button
            onClick={createNewRule}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Rule
          </button>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {rules.map((rule) => (
            <li key={rule.id}>
              <div className="px-4 py-4 flex items-center sm:px-6 hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {rule.name}
                      </p>
                      <span
                        className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          SEVERITY_LEVELS.find(s => s.value === rule.severity)?.color
                        }`}
                      >
                        {rule.severity}
                      </span>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <p className="truncate">
                      {rule.description || 'No description'}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span>{rule.conditions.length} condition(s)</span>
                    <span className="mx-2">•</span>
                    <span>{rule.notification_channels.join(', ')}</span>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0 flex items-center space-x-2">
                  <button
                    onClick={() => editRule(rule)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => rule.id && deleteRule(rule.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {rules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No alert rules yet. Click "New Rule" to create one.</p>
          </div>
        )}
      </div>

      {/* Rule Editor Modal */}
      {showEditor && editingRule && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => {
              setShowEditor(false);
              setEditingRule(null);
              setTestResults(null);
            }} />

            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingRule.id ? 'Edit Alert Rule' : 'Create Alert Rule'}
                  </h3>
                  <button onClick={() => {
                    setShowEditor(false);
                    setEditingRule(null);
                    setTestResults(null);
                  }}>
                    <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rule Name *
                    </label>
                    <input
                      type="text"
                      value={editingRule.name}
                      onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., High priority tickets without response"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingRule.description || ''}
                      onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                      rows={2}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="Brief description of this rule"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alert Type
                    </label>
                    <select
                      value={editingRule.alert_type}
                      onChange={(e) => setEditingRule({ ...editingRule, alert_type: e.target.value as AlertType })}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    >
                      {ALERT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <select
                      value={editingRule.severity}
                      onChange={(e) => setEditingRule({ ...editingRule, severity: e.target.value as AlertSeverity })}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    >
                      {SEVERITY_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Conditions * (When should this alert trigger?)
                    </label>
                    <button
                      onClick={addCondition}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <PlusIcon className="h-3 w-3 mr-1" />
                      Add Condition
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingRule.conditions?.map((condition, index) => {
                      const fieldConfig = getConditionFieldConfig(condition.field);
                      return (
                        <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-md">
                          {index > 0 && (
                            <select
                              value={condition.logic || 'AND'}
                              onChange={(e) => updateCondition(index, { logic: e.target.value as 'AND' | 'OR' })}
                              className="w-20 border border-gray-300 rounded-md shadow-sm py-2 px-2 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                            >
                              <option value="AND">AND</option>
                              <option value="OR">OR</option>
                            </select>
                          )}

                          <select
                            value={condition.field}
                            onChange={(e) => updateCondition(index, { field: e.target.value })}
                            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          >
                            {CONDITION_FIELDS.map((field) => (
                              <option key={field.value} value={field.value}>
                                {field.label}
                              </option>
                            ))}
                          </select>

                          <select
                            value={condition.operator}
                            onChange={(e) => updateCondition(index, { operator: e.target.value })}
                            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          >
                            {OPERATORS.map((op) => (
                              <option key={op.value} value={op.value}>
                                {op.label}
                              </option>
                            ))}
                          </select>

                          {fieldConfig.type === 'select' && fieldConfig.options ? (
                            <select
                              value={condition.value}
                              onChange={(e) => updateCondition(index, { value: e.target.value })}
                              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                            >
                              <option value="">Select...</option>
                              {fieldConfig.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={fieldConfig.type || 'text'}
                              value={condition.value}
                              onChange={(e) => updateCondition(index, { value: e.target.value })}
                              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                              placeholder="Value"
                            />
                          )}

                          <button
                            onClick={() => removeCondition(index)}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}

                    {editingRule.conditions?.length === 0 && (
                      <div className="text-center py-4 text-sm text-gray-500">
                        No conditions added. Click "Add Condition" to get started.
                      </div>
                    )}
                  </div>

                  {/* Condition Preview */}
                  {(editingRule.conditions?.length || 0) > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs font-medium text-blue-900 mb-1">Preview:</p>
                      <p className="text-sm text-blue-800">
                        Alert when{' '}
                        {editingRule.conditions?.map((cond, idx) => (
                          <span key={idx}>
                            {idx > 0 && <span className="font-semibold"> {cond.logic} </span>}
                            <span className="font-medium">{cond.field}</span>{' '}
                            <span>{OPERATORS.find(o => o.value === cond.operator)?.label}</span>{' '}
                            <span className="font-medium">"{cond.value}"</span>
                          </span>
                        ))}
                      </p>
                    </div>
                  )}
                </div>

                {/* Notification Channels */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Channels
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {NOTIFICATION_CHANNELS.map((channel) => (
                      <button
                        key={channel.value}
                        onClick={() => toggleNotificationChannel(channel.value)}
                        className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                          editingRule.notification_channels?.includes(channel.value)
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="mr-2">{channel.icon}</span>
                        {channel.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingRule.enabled}
                    onChange={(e) => setEditingRule({ ...editingRule, enabled: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable this rule
                  </label>
                </div>

                {/* Test Results */}
                {testResults && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-sm font-medium text-green-900">
                        Test Results: {testResults.matches} matching ticket(s) found
                      </p>
                    </div>
                    {testResults.sample_tickets.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-green-800 mb-1">Sample matches:</p>
                        <ul className="text-xs text-green-700 list-disc list-inside">
                          {testResults.sample_tickets.slice(0, 3).map((ticket: any, idx: number) => (
                            <li key={idx}>
                              Ticket #{ticket.id}: {ticket.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
                <button
                  onClick={testRule}
                  disabled={testing || editingRule.conditions?.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BeakerIcon className="h-4 w-4 mr-2" />
                  {testing ? 'Testing...' : 'Test Rule'}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowEditor(false);
                      setEditingRule(null);
                      setTestResults(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveRule}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Save Rule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
