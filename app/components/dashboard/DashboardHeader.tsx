import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  BellIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '~/lib/api';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userInitials, setUserInitials] = useState('U');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await apiClient.getCurrentUser();
        if (user.name) {
          setUserName(user.name);
          const names = user.name.trim().split(' ');
          if (names.length >= 2) {
            setUserInitials(`${names[0][0]}${names[names.length - 1][0]}`.toUpperCase());
          } else {
            setUserInitials(user.name.substring(0, 2).toUpperCase());
          }
        } else if (user.email) {
          setUserName(user.email);
          setUserInitials(user.email.substring(0, 2).toUpperCase());
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    apiClient.logout();
    navigate('/login');
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200">
      {/* Mobile menu button */}
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 md:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div className="flex-1 px-4 flex justify-between">
        {/* Search bar */}
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <label htmlFor="search-field" className="sr-only">
              Search
            </label>
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </div>
              <input
                id="search-field"
                className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                placeholder="Search tickets, customers..."
                type="search"
                name="search"
              />
            </div>
          </div>
        </div>

        {/* Right side items */}
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          {/* Notifications */}
          <button
            type="button"
            className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="max-w-xs bg-teal-600 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold">
                {userInitials}
              </div>
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-20">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-sm text-gray-500 truncate">View profile</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/dashboard/settings');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-red-400" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
