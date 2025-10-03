import { ChartBarIcon, InboxIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const stats = [
  { name: 'Total Tickets', value: '124', icon: InboxIcon, change: '+12%', changeType: 'increase' },
  { name: 'Resolved', value: '89', icon: CheckCircleIcon, change: '+8%', changeType: 'increase' },
  { name: 'Pending', value: '24', icon: ClockIcon, change: '-4%', changeType: 'decrease' },
  { name: 'Response Rate', value: '94%', icon: ChartBarIcon, change: '+2%', changeType: 'increase' },
];

export function OverviewPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your support tickets today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((item) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {item.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          item.changeType === 'increase'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {item.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Activity
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <p className="text-gray-500 text-center py-12">
            Recent ticket activity will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
