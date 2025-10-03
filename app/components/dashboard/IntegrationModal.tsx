import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiClient, type Integration, IntegrationType, type IntegrationCreate } from '~/lib/api';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: Integration | null;
  onSuccess: () => void;
}

export function IntegrationModal({ isOpen, onClose, integration, onSuccess }: IntegrationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: IntegrationType.ZENDESK,
    // Zendesk fields
    subdomain: '',
    email: '',
    api_token: '',
    // Slack fields
    bot_token: '',
    signing_secret: '',
    // Email fields
    smtp_server: '',
    smtp_port: '587',
    email_address: '',
    password: '',
    // Common settings
    sync_tickets: true,
    receive_webhooks: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name,
        type: integration.type,
        subdomain: '',
        email: '',
        api_token: '',
        bot_token: '',
        signing_secret: '',
        smtp_server: '',
        smtp_port: '587',
        email_address: '',
        password: '',
        sync_tickets: integration.sync_tickets,
        receive_webhooks: integration.receive_webhooks,
      });
    } else {
      resetForm();
    }
  }, [integration]);

  const resetForm = () => {
    setFormData({
      name: '',
      type: IntegrationType.ZENDESK,
      subdomain: '',
      email: '',
      api_token: '',
      bot_token: '',
      signing_secret: '',
      smtp_server: '',
      smtp_port: '587',
      email_address: '',
      password: '',
      sync_tickets: true,
      receive_webhooks: true,
    });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.type === IntegrationType.ZENDESK) {
      if (!formData.subdomain.trim()) newErrors.subdomain = 'Subdomain is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.api_token.trim()) newErrors.api_token = 'API token is required';
    } else if (formData.type === IntegrationType.SLACK) {
      if (!formData.bot_token.trim()) newErrors.bot_token = 'Bot token is required';
      if (!formData.signing_secret.trim()) newErrors.signing_secret = 'Signing secret is required';
    } else if (formData.type === IntegrationType.EMAIL) {
      if (!formData.smtp_server.trim()) newErrors.smtp_server = 'SMTP server is required';
      if (!formData.smtp_port.trim()) newErrors.smtp_port = 'SMTP port is required';
      if (!formData.email_address.trim()) newErrors.email_address = 'Email is required';
      if (!formData.password.trim()) newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    try {
      let config: Record<string, any> = {};

      if (formData.type === IntegrationType.ZENDESK) {
        config = {
          subdomain: formData.subdomain,
          email: formData.email,
          api_token: formData.api_token,
        };
      } else if (formData.type === IntegrationType.SLACK) {
        config = {
          bot_token: formData.bot_token,
          signing_secret: formData.signing_secret,
        };
      } else if (formData.type === IntegrationType.EMAIL) {
        config = {
          smtp_server: formData.smtp_server,
          smtp_port: parseInt(formData.smtp_port),
          email: formData.email_address,
          password: formData.password,
        };
      }

      const integrationData: IntegrationCreate = {
        name: formData.name,
        type: formData.type,
        config,
        sync_tickets: formData.sync_tickets,
        receive_webhooks: formData.receive_webhooks,
      };

      if (integration) {
        await apiClient.updateIntegration(integration.id, integrationData);
      } else {
        await apiClient.createIntegration(integrationData);
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save integration' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {integration ? 'Edit Integration' : 'Add New Integration'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Integration Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="e.g., Production Zendesk"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Integration Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as IntegrationType })}
                  disabled={!!integration}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:bg-gray-100"
                >
                  <option value={IntegrationType.ZENDESK}>Zendesk</option>
                  <option value={IntegrationType.SLACK}>Slack</option>
                  <option value={IntegrationType.EMAIL}>Email</option>
                </select>
              </div>

              {/* Zendesk Fields */}
              {formData.type === IntegrationType.ZENDESK && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Subdomain
                    </label>
                    <input
                      type="text"
                      value={formData.subdomain}
                      onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="yourcompany"
                    />
                    {errors.subdomain && <p className="mt-1 text-sm text-red-600">{errors.subdomain}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      From your Zendesk URL: yourcompany.zendesk.com
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="admin@yourcompany.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      API Token
                    </label>
                    <input
                      type="password"
                      value={formData.api_token}
                      onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="Your Zendesk API token"
                    />
                    {errors.api_token && <p className="mt-1 text-sm text-red-600">{errors.api_token}</p>}
                  </div>
                </>
              )}

              {/* Slack Fields */}
              {formData.type === IntegrationType.SLACK && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bot Token
                    </label>
                    <input
                      type="password"
                      value={formData.bot_token}
                      onChange={(e) => setFormData({ ...formData, bot_token: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="xoxb-..."
                    />
                    {errors.bot_token && <p className="mt-1 text-sm text-red-600">{errors.bot_token}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      Found in Slack App settings under OAuth & Permissions
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Signing Secret
                    </label>
                    <input
                      type="password"
                      value={formData.signing_secret}
                      onChange={(e) => setFormData({ ...formData, signing_secret: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="Your signing secret"
                    />
                    {errors.signing_secret && <p className="mt-1 text-sm text-red-600">{errors.signing_secret}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      Found in Slack App settings under Basic Information
                    </p>
                  </div>
                </>
              )}

              {/* Email Fields */}
              {formData.type === IntegrationType.EMAIL && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SMTP Server
                    </label>
                    <input
                      type="text"
                      value={formData.smtp_server}
                      onChange={(e) => setFormData({ ...formData, smtp_server: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="smtp.gmail.com"
                    />
                    {errors.smtp_server && <p className="mt-1 text-sm text-red-600">{errors.smtp_server}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={formData.smtp_port}
                      onChange={(e) => setFormData({ ...formData, smtp_port: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="587"
                    />
                    {errors.smtp_port && <p className="mt-1 text-sm text-red-600">{errors.smtp_port}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email_address}
                      onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="support@yourcompany.com"
                    />
                    {errors.email_address && <p className="mt-1 text-sm text-red-600">{errors.email_address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="Your email password"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>
                </>
              )}

              {/* Common Settings */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sync_tickets"
                    checked={formData.sync_tickets}
                    onChange={(e) => setFormData({ ...formData, sync_tickets: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sync_tickets" className="ml-2 block text-sm text-gray-900">
                    Enable ticket synchronization
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="receive_webhooks"
                    checked={formData.receive_webhooks}
                    onChange={(e) => setFormData({ ...formData, receive_webhooks: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="receive_webhooks" className="ml-2 block text-sm text-gray-900">
                    Enable webhook reception
                  </label>
                </div>
              </div>

              {errors.submit && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : integration ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
