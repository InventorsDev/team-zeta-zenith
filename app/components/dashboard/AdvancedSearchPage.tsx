import { useState, useEffect, useRef, useCallback } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, PlusIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { apiClient, type AdvancedSearchRequest, type SearchResultsResponse, type TicketSearchResult, type SearchCondition, SearchOperator, type SearchSuggestion, type SavedSearch } from '~/lib/api';
import { useLocation } from 'react-router';

const OPERATORS = [
  { value: SearchOperator.EQUALS, label: 'equals' },
  { value: SearchOperator.NOT_EQUALS, label: 'not equals' },
  { value: SearchOperator.CONTAINS, label: 'contains' },
  { value: SearchOperator.NOT_CONTAINS, label: 'does not contain' },
  { value: SearchOperator.STARTS_WITH, label: 'starts with' },
  { value: SearchOperator.ENDS_WITH, label: 'ends with' },
  { value: SearchOperator.GREATER_THAN, label: 'greater than' },
  { value: SearchOperator.LESS_THAN, label: 'less than' },
  { value: SearchOperator.IN, label: 'in' },
  { value: SearchOperator.IS_EMPTY, label: 'is empty' },
  { value: SearchOperator.IS_NOT_EMPTY, label: 'is not empty' },
];

const SEARCHABLE_FIELDS = [
  { value: 'title', label: 'Title' },
  { value: 'description', label: 'Description' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'category', label: 'Category' },
  { value: 'channel', label: 'Channel' },
  { value: 'customer_email', label: 'Customer Email' },
  { value: 'customer_name', label: 'Customer Name' },
];

export default function AdvancedSearchPage() {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [conditions, setConditions] = useState<SearchCondition[]>([]);
  const [results, setResults] = useState<SearchResultsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

  const loadSavedSearches = useCallback(async () => {
    try {
      const searches = await apiClient.getSavedSearches();
      setSavedSearches(searches || []);
    } catch (error) {
      console.error('Failed to load saved searches:', error);
      setSavedSearches([]);
    }
  }, []);

  useEffect(() => {
    loadSavedSearches();

    // Load saved search from navigation state
    const state = location.state as { savedSearch?: SavedSearch } | null;
    if (state?.savedSearch) {
      setQuery(state.savedSearch.query || '');
      setConditions(state.savedSearch.conditions || []);
      setShowFilters(Boolean(state.savedSearch.conditions && state.savedSearch.conditions.length > 0));
    }
  }, [location.state, loadSavedSearches]);

  const handleQueryChange = async (value: string) => {
    setQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await apiClient.getSearchSuggestions(value);
          setSuggestions(response.suggestions || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to load suggestions:', error);
          setSuggestions([]);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setShowSuggestions(false);

    try {
      const request: AdvancedSearchRequest = {
        query: query || undefined,
        conditions,
        page: 1,
        size: 50,
        sort_by: 'created_at',
        sort_order: 'desc',
      };

      const data = await apiClient.advancedSearch(request);
      setResults(data);
    } catch (error: any) {
      console.error('Search failed:', error);
      alert(error.message || 'Search failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        field: 'status',
        operator: SearchOperator.EQUALS,
        value: '',
        logic: conditions.length === 0 ? undefined : 'AND',
      },
    ]);
    setShowFilters(true);
  };

  const updateCondition = (index: number, updates: Partial<SearchCondition>) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], ...updates };
    setConditions(updated);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleSaveSearch = async () => {
    if (!saveSearchName.trim()) {
      alert('Please enter a name for this search');
      return;
    }

    try {
      await apiClient.createSavedSearch({
        name: saveSearchName,
        query: query || undefined,
        conditions,
        is_default: false,
        is_shared: false,
      });

      setSaveSearchName('');
      setShowSaveModal(false);
      await loadSavedSearches();
    } catch (error: any) {
      alert(error.message || 'Failed to save search');
    }
  };

  const loadSavedSearch = async (search: SavedSearch) => {
    setQuery(search.query || '');
    setConditions(search.conditions || []);
    setShowFilters(Boolean(search.conditions && search.conditions.length > 0));

    if (search.id) {
      try {
        await apiClient.useSavedSearch(search.id);
        await loadSavedSearches();
      } catch (error) {
        console.error('Failed to update search usage:', error);
      }
    }
  };

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Search</h1>
          <p className="text-gray-600 mt-1">Search tickets with powerful filters and save your searches</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search tickets..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span>{suggestion.text}</span>
                        <span className="text-xs text-gray-500 capitalize">{suggestion.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-lg flex items-center gap-2 ${
                  showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <FunnelIcon className="h-5 w-5" />
                Filters
                {conditions.length > 0 && (
                  <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {conditions.length}
                  </span>
                )}
              </button>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>

              {(query || conditions.length > 0) && (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <BookmarkIcon className="h-5 w-5" />
                  Save
                </button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                <button
                  onClick={addCondition}
                  className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-2 text-sm font-medium"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Condition
                </button>
              </div>

              {conditions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No conditions added. Click "Add Condition" to start.</p>
              ) : (
                <div className="space-y-3">
                  {conditions.map((condition, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      {idx > 0 && (
                        <select
                          value={condition.logic || 'AND'}
                          onChange={(e) => updateCondition(idx, { logic: e.target.value as 'AND' | 'OR' })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold"
                        >
                          <option value="AND">AND</option>
                          <option value="OR">OR</option>
                        </select>
                      )}

                      <select
                        value={condition.field}
                        onChange={(e) => updateCondition(idx, { field: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg flex-1"
                      >
                        {SEARCHABLE_FIELDS.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(idx, { operator: e.target.value as SearchOperator })}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {OPERATORS.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>

                      {condition.operator !== SearchOperator.IS_EMPTY && condition.operator !== SearchOperator.IS_NOT_EMPTY && (
                        <input
                          type="text"
                          value={condition.value}
                          onChange={(e) => updateCondition(idx, { value: e.target.value })}
                          placeholder="Value..."
                          className="px-3 py-2 border border-gray-300 rounded-lg flex-1"
                        />
                      )}

                      <button
                        onClick={() => removeCondition(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Searches</h3>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map((search) => (
                <button
                  key={search.id}
                  onClick={() => loadSavedSearch(search)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <BookmarkIcon className="h-4 w-4" />
                  {search.name}
                  {(search.use_count ?? 0) > 0 && (
                    <span className="text-xs text-gray-500">({search.use_count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Search Results ({results.total})
                </h3>
                {results.took_ms !== undefined && (
                  <p className="text-sm text-gray-500">Found in {results.took_ms}ms</p>
                )}
              </div>
            </div>

            {results.items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tickets found matching your criteria</p>
            ) : (
              <div className="space-y-4">
                {results.items.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {ticket.highlights.find(h => h.field === 'title') ? (
                          <span dangerouslySetInnerHTML={{ __html: ticket.highlights.find(h => h.field === 'title')!.highlighted }} />
                        ) : (
                          ticket.title
                        )}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          ticket.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                          ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                          ticket.status === 'resolved' ? 'bg-gray-100 text-gray-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    {ticket.description && (
                      <p className="text-gray-600 text-sm mb-2">
                        {ticket.highlights.find(h => h.field === 'description') ? (
                          <span dangerouslySetInnerHTML={{ __html: ticket.highlights.find(h => h.field === 'description')!.highlighted }} />
                        ) : (
                          ticket.description.substring(0, 200) + (ticket.description.length > 200 ? '...' : '')
                        )}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{ticket.customer_email}</span>
                      {ticket.customer_name && <span>{ticket.customer_name}</span>}
                      {ticket.category && <span className="px-2 py-1 bg-gray-100 rounded">{ticket.category}</span>}
                      <span className="capitalize">{ticket.channel}</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.pages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="text-sm text-gray-600">
                  Page {results.page} of {results.pages}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save Search Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Search</h3>
              <input
                type="text"
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
                placeholder="Enter search name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setSaveSearchName('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
