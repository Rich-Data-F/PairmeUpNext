'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface SearchHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  onFiltersToggle: () => void;
  resultsCount: number;
  loading: boolean;
}

export function SearchHeader({ 
  query, 
  onQueryChange, 
  onFiltersToggle, 
  resultsCount, 
  loading 
}: SearchHeaderProps) {
  const [localQuery, setLocalQuery] = useState(query);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQueryChange(localQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={localQuery}
                onChange={handleInputChange}
                placeholder="Search for earbuds, AirPods, cases..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Search'
              )}
            </button>

            {/* Mobile Filters Button */}
            <button
              type="button"
              onClick={onFiltersToggle}
              className="lg:hidden inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </form>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                  Searching...
                </div>
              ) : (
                <span>
                  {resultsCount > 0 ? (
                    <>
                      Showing <span className="font-medium">{resultsCount.toLocaleString()}</span> result{resultsCount !== 1 ? 's' : ''}
                      {query && (
                        <>
                          {' '}for <span className="font-medium">"{query}"</span>
                        </>
                      )}
                    </>
                  ) : query ? (
                    <>No results found for <span className="font-medium">"{query}"</span></>
                  ) : (
                    'Enter a search term to find listings'
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
