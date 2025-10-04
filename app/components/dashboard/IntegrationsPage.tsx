import { useState, useEffect } from 'react';
import {
  PuzzlePieceIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { apiClient, type Integration, type IntegrationStats, IntegrationType, IntegrationStatus } from '~/lib/api';
import { IntegrationModal } from './IntegrationModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<Integration | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; message: string }>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [integrationsData, statsData] = await Promise.all([
        apiClient.getIntegrations({ page: 1, size: 50 }),
        apiClient.getIntegrationStats(),
      ]);
      setIntegrations(integrationsData.items);
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to load integrations:', error);
      // Initialize with empty data on error
      setIntegrations([]);
      setStats({
        total_integrations: 0,
        active_integrations: 0,
        error_integrations: 0,
        pending_integrations: 0,
        total_tickets_synced: 0,
        total_webhooks_received: 0,
        integrations_by_type: {},
        last_sync_times: {},
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntegration = () => {
    setSelectedIntegration(null);
    setIsModalOpen(true);
  };

  const handleEditIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (integration: Integration) => {
    setIntegrationToDelete(integration);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!integrationToDelete) return;

    try {
      await apiClient.deleteIntegration(integrationToDelete.id);
      setIntegrations(integrations.filter(i => i.id !== integrationToDelete.id));
      setDeleteModalOpen(false);
      setIntegrationToDelete(null);
      await loadData(); // Refresh stats
    } catch (error) {
      console.error('Failed to delete integration:', error);
      alert('Failed to delete integration. Please try again.');
    }
  };

  const handleTestConnection = async (integration: Integration) => {
    setTestingId(integration.id);
    try {
      const result = await apiClient.testIntegration(integration.id);
      setTestResults({
        ...testResults,
        [integration.id]: {
          success: result.connected,
          message: result.message,
        },
      });
      setTimeout(() => {
        setTestResults(prev => {
          const { [integration.id]: _, ...rest } = prev;
          return rest;
        });
      }, 5000);
    } catch (error: any) {
      setTestResults({
        ...testResults,
        [integration.id]: {
          success: false,
          message: error.message || 'Connection test failed',
        },
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleSync = async (integration: Integration) => {
    try {
      await apiClient.toggleIntegrationSync(integration.id, !integration.sync_tickets);
      await loadData();
    } catch (error) {
      console.error('Failed to toggle sync:', error);
    }
  };

  const getStatusIcon = (status: IntegrationStatus) => {
    switch (status) {
      case IntegrationStatus.ACTIVE:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case IntegrationStatus.ERROR:
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case IntegrationStatus.PENDING:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case IntegrationStatus.INACTIVE:
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: IntegrationStatus) => {
    const colors = {
      [IntegrationStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [IntegrationStatus.ERROR]: 'bg-red-100 text-red-800',
      [IntegrationStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [IntegrationStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type: IntegrationType) => {
    const icons: Record<IntegrationType, string> = {
      [IntegrationType.ZENDESK]: '🎫',
      [IntegrationType.SLACK]: '💬',
      [IntegrationType.EMAIL]: '📧',
      [IntegrationType.DISCORD]: '💭',
      [IntegrationType.TEAMS]: '👥',
    };
    return icons[type] || '🔌';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect your favorite tools and platforms
          </p>
        </div>
        <button
          onClick={handleAddIntegration}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Integration
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PuzzlePieceIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Integrations
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stats.total_integrations}
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
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stats.active_integrations}
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
                  <ArrowPathIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tickets Synced
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stats.total_tickets_synced}
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
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Errors
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stats.error_integrations}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integrations List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            All Integrations
          </h3>
        </div>
        {integrations.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <PuzzlePieceIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No integrations yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first integration
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddIntegration}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Integration
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {integrations.map((integration) => (
              <li key={integration.id} className="px-4 py-5 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="text-4xl mr-4">{getTypeIcon(integration.type)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {integration.name}
                        </h4>
                        <div className="ml-3 flex items-center space-x-2">
                          {getStatusIcon(integration.status)}
                          {getStatusBadge(integration.status)}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <span>
                          Type: <span className="font-medium">{integration.type}</span>
                        </span>
                        {integration.last_sync_time && (
                          <span>
                            Last synced: {new Date(integration.last_sync_time).toLocaleString()}
                          </span>
                        )}
                        {integration.total_tickets_synced > 0 && (
                          <span>
                            {integration.total_tickets_synced} tickets synced
                          </span>
                        )}
                      </div>
                      {integration.last_error && (
                        <div className="mt-2 text-sm text-red-600">
                          Error: {integration.last_error}
                        </div>
                      )}
                      {testResults[integration.id] && (
                        <div className={`mt-2 text-sm ${testResults[integration.id].success ? 'text-green-600' : 'text-red-600'}`}>
                          {testResults[integration.id].message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => handleTestConnection(integration)}
                      disabled={testingId === integration.id}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      {testingId === integration.id ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleSync(integration)}
                      className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md ${
                        integration.sync_tickets
                          ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {integration.sync_tickets ? 'Sync On' : 'Sync Off'}
                    </button>
                    <button
                      onClick={() => handleEditIntegration(integration)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(integration)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modals */}
      <IntegrationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedIntegration(null);
        }}
        integration={selectedIntegration}
        onSuccess={loadData}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setIntegrationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Integration"
        message={`Are you sure you want to delete "${integrationToDelete?.name}"? This action cannot be undone and will stop all syncing for this integration.`}
      />
    </div>
  );
}
