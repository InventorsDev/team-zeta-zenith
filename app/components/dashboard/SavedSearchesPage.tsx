import { useState, useEffect } from 'react';
import { BookmarkIcon, TrashIcon, PencilIcon, ClockIcon } from '@heroicons/react/24/outline';
import { apiClient, type SavedSearch } from '~/lib/api';
import { useNavigate } from 'react-router';

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSearches();
  }, []);

  const loadSearches = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getSavedSearches();
      setSearches(data || []);
    } catch (error) {
      console.error('Failed to load saved searches:', error);
      setSearches([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteSearch = async (id: number) => {
    if (!confirm('Are you sure you want to delete this saved search?')) {
      return;
    }

    try {
      await apiClient.deleteSavedSearch(id);
      await loadSearches();
    } catch (error: any) {
      alert(error.message || 'Failed to delete search');
    }
  };

  const useSearch = async (search: SavedSearch) => {
    if (search.id) {
      try {
        await apiClient.useSavedSearch(search.id);
        // Navigate to advanced search page with the search loaded
        navigate('/dashboard/advanced-search', { state: { savedSearch: search } });
      } catch (error) {
        console.error('Failed to use search:', error);
        // Still navigate even if usage tracking fails
        navigate('/dashboard/advanced-search', { state: { savedSearch: search } });
      }
    } else {
      // Navigate without usage tracking if no ID
      navigate('/dashboard/advanced-search', { state: { savedSearch: search } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading saved searches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Saved Searches</h1>
          <p className="text-gray-600 mt-1">Manage and execute your saved search queries</p>
        </div>

        {/* Searches Grid */}
        {searches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No saved searches</h3>
            <p className="mt-2 text-gray-500">
              Create a search on the Advanced Search page and save it for quick access later.
            </p>
            <button
              onClick={() => navigate('/dashboard/advanced-search')}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Go to Advanced Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searches.map((search) => (
              <div
                key={search.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookmarkIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{search.name}</h3>
                  </div>
                  {search.is_default && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      Default
                    </span>
                  )}
                </div>

                {search.description && (
                  <p className="text-sm text-gray-600 mb-4">{search.description}</p>
                )}

                {search.query && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Query:</p>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                      "{search.query}"
                    </p>
                  </div>
                )}

                {search.conditions && search.conditions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Conditions:</p>
                    <div className="bg-gray-50 px-3 py-2 rounded">
                      <p className="text-xs text-gray-700">
                        {search.conditions.length} condition{search.conditions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  {search.last_used_at && (
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        Last used: {new Date(search.last_used_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {(search.use_count ?? 0) > 0 && (
                    <span>Used {search.use_count} time{search.use_count !== 1 ? 's' : ''}</span>
                  )}
                </div>

                {search.is_shared && (
                  <div className="mb-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      Shared with organization
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => useSearch(search)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    Use Search
                  </button>
                  {search.id && (
                    <button
                      onClick={() => deleteSearch(search.id!)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
