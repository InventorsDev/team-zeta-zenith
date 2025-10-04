import { Link, useLocation } from 'react-router';
import {
  HomeIcon,
  ChartBarIcon,
  InboxIcon,
  Cog6ToothIcon,
  PuzzlePieceIcon,
  XMarkIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  BellAlertIcon,
  BellIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { ThemeToggle } from '../ui/ThemeToggle';

interface SidebarProps {
  onClose?: () => void;
}

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Tickets', href: '/dashboard/tickets', icon: InboxIcon },
  { name: 'Advanced Search', href: '/dashboard/advanced-search', icon: MagnifyingGlassIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Custom Dashboard', href: '/dashboard/custom-dashboard', icon: Squares2X2Icon },
  { name: 'Alerts', href: '/dashboard/alerts', icon: BellIcon },
  { name: 'Alert Rules', href: '/dashboard/alert-rules', icon: BellAlertIcon },
  { name: 'Integrations', href: '/dashboard/integrations', icon: PuzzlePieceIcon },
  { name: 'Sync Status', href: '/dashboard/sync', icon: ArrowPathIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Support IQ</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" role="navigation" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center px-3 py-2">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">SQ</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Support IQ</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
