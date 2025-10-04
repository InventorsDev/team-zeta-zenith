import { useState, useEffect } from 'react';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { apiClient, type Integration, IntegrationType } from '~/lib/api';

interface IntegrationSyncInfo {
  integration: Integration;
  status: any;
  loading: boolean;
  error?: string;
}

export function SyncStatusPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncInfo, setSyncInfo] = useState<Record<number, IntegrationSyncInfo>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<Record<number, boolean>>({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedSync, setSelectedSync] = useState<any | null>(null);

  useEffect(() => {
    loadIntegrationsAndStatus();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadIntegrationsAndStatus();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadIntegrationsAndStatus = async () => {
    try {
      const result = await apiClient.getIntegrations({ size: 100 });
      setIntegrations(result.items);

      // Load status for each integration
      for (const integration of result.items) {
        if (integration.type === IntegrationType.ZENDESK || integration.type === IntegrationType.SLACK) {
          loadIntegrationStatus(integration);
        }
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrationStatus = async (integration: Integration) => {
    try {
      let status;
      if (integration.type === IntegrationType.ZENDESK) {
        status = await apiClient.getZendeskStatus();
      } else if (integration.type === IntegrationType.SLACK) {
        status = await apiClient.getSlackStatus();
      }

      setSyncInfo(prev => ({
        ...prev,
        [integration.id]: {
          integration,
          status,
          loading: false
        }
      }));
    } catch (error: any) {
      setSyncInfo(prev => ({
        ...prev,
        [integration.id]: {
          integration,
          status: null,
          loading: false,
          error: error.message || 'Failed to load status'
        }
      }));
    }
  };

  const handleManualSync = async (integration: Integration, fullSync: boolean = false) => {
    setSyncing({ ...syncing, [integration.id]: true });
    try {
      let result;
      if (integration.type === IntegrationType.ZENDESK) {
        result = await apiClient.syncZendeskTickets(fullSync);
      } else if (integration.type === IntegrationType.SLACK) {
        result = await apiClient.syncSlackMessages(fullSync);
      }

      setSelectedSync(result);
      await loadIntegrationStatus(integration);
    } catch (error: any) {
      console.error('Failed to trigger sync:', error);
      alert(error.message || 'Failed to start sync. Please try again.');
    } finally {
      setSyncing({ ...syncing, [integration.id]: false });
    }
  };

  const getHealthIcon = (health: string | undefined) => {
    switch (health) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getHealthColor = (health: string | undefined) => {
    switch (health) {
      case 'healthy':
        return 'text-green-700 bg-green-50';
      case 'unhealthy':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const getIntegrationTypeColor = (type: IntegrationType) => {
    switch (type) {
      case IntegrationType.SLACK:
        return 'bg-purple-100 text-purple-800';
      case IntegrationType.ZENDESK:
        return 'bg-green-100 text-green-800';
      case IntegrationType.EMAIL:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sync Status</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitor and manage data synchronization across all integrations
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
            <span className="ml-2">Auto-refresh (30s)</span>
          </label>
          <button
            onClick={() => loadSyncStatus()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Integrations</dt>
                  <dd className="text-lg font-semibold text-gray-900">{integrations.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowPathIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Syncing Now</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {Object.values(syncing).filter(Boolean).length}
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
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Healthy</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {Object.values(syncInfo).filter(info => info.status?.health === 'healthy').length}
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
                <XCircleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Unhealthy</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {Object.values(syncInfo).filter(info => info.status?.health === 'unhealthy' || info.error).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Status Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {integrations.map((integration) => {
          const info = syncInfo[integration.id];
          const status = info?.status;
          const isSyncing = syncing[integration.id];

          return (
            <div key={integration.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {isSyncing ? (
                      <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
                    ) : (
                      getHealthIcon(status?.health)
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getIntegrationTypeColor(integration.type)}`}>
                        {integration.type}
                      </span>
                    </div>
                  </div>
                  {status?.health && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getHealthColor(status.health)}`}>
                      {status.health}
                    </span>
                  )}
                </div>

                {info?.loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                  </div>
                ) : info?.error ? (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">{info.error}</p>
                  </div>
                ) : status ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600">Connection</p>
                        <p className="text-sm font-medium text-gray-900">
                          {status.connected ? (
                            <span className="text-green-600">Connected</span>
                          ) : (
                            <span className="text-red-600">Disconnected</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Integration</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">{status.integration}</p>
                      </div>
                      {status.sync_status && (
                        <>
                          <div>
                            <p className="text-xs text-gray-600">Last Sync</p>
                            <p className="text-sm font-medium text-gray-900">
                              {status.sync_status.last_sync_time
                                ? new Date(status.sync_status.last_sync_time).toLocaleString()
                                : 'Never'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Total Tickets</p>
                            <p className="text-sm font-medium text-gray-900">
                              {integration.total_tickets_synced.toLocaleString()}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {integration.last_error && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-800">{integration.last_error}</p>
                      </div>
                    )}
                  </>
                ) : null}

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleManualSync(integration, false)}
                    disabled={isSyncing || !integration.sync_tickets}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSyncing ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </button>
                </div>

                {!integration.sync_tickets && (
                  <p className="mt-2 text-xs text-gray-500 text-center">Sync is disabled for this integration</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {integrations.length === 0 && !loading && (
        <div className="mt-8 text-center">
          <p className="text-gray-500">No integrations found. Add an integration to start syncing data.</p>
        </div>
      )}

      {/* Sync Result Modal */}
      {selectedSync && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 backdrop-blur-sm" onClick={() => setSelectedSync(null)} />

            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Sync Results</h3>
                  <button
                    onClick={() => setSelectedSync(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Sync Type</p>
                    <p className="text-sm text-gray-900">{selectedSync.sync_type || 'Manual'}</p>
                  </div>

                  {selectedSync.result && (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedSync.result).map(([key, value]: [string, any]) => (
                        key !== 'errors' && (
                          <div key={key}>
                            <p className="text-xs text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                            <p className="text-sm font-medium text-gray-900">
                              {typeof value === 'number' ? value.toLocaleString() : String(value)}
                            </p>
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {selectedSync.result?.errors && selectedSync.result.errors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Errors</p>
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-40 overflow-y-auto">
                        {selectedSync.result.errors.map((error: any, index: number) => (
                          <p key={index} className="text-xs text-red-800 mb-1">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3">
                <button
                  onClick={() => setSelectedSync(null)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
