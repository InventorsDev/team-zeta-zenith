import { PuzzlePieceIcon } from '@heroicons/react/24/outline';

const integrations = [
  {
    name: 'Zendesk',
    description: 'Sync tickets and customer data',
    status: 'Not Connected',
    logo: '🎫',
  },
  {
    name: 'Slack',
    description: 'Get notifications in Slack',
    status: 'Not Connected',
    logo: '💬',
  },
  {
    name: 'Email',
    description: 'Process support emails',
    status: 'Not Connected',
    logo: '📧',
  },
];

export function IntegrationsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect your favorite tools and platforms
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Available Integrations
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <ul className="divide-y divide-gray-200">
            {integrations.map((integration) => (
              <li key={integration.name} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-4xl mr-4">{integration.logo}</div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {integration.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Connect
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
