import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account and application preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Account Settings
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Settings Coming Soon
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Configuration options will be available here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
