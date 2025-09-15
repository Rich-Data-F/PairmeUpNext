'use client';

import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, ArrowTrendingUpIcon, FireIcon } from '@heroicons/react/24/outline';

interface SearchSuggestionsProps {
  query: string;
  suggestions: {
    popular: string[];
    trending: string[];
  };
  onSuggestionClick: (suggestion: string) => void;
}

interface AutocompleteSuggestion {
  text: string;
  type: 'query' | 'brand' | 'model';
  category?: string;
}

export function SearchSuggestions({ query, suggestions, onSuggestionClick }: SearchSuggestionsProps) {
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length >= 2) {
      fetchAutocompleteSuggestions(query);
    } else {
      setAutocompleteSuggestions([]);
    }
  }, [query]);

  const fetchAutocompleteSuggestions = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await response.json();
      setAutocompleteSuggestions(data);
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
      setAutocompleteSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const renderSuggestionIcon = (type: string) => {
    switch (type) {
      case 'brand':
        return <span className="text-blue-500">🏷️</span>;
      case 'model':
        return <span className="text-purple-500">📱</span>;
      default:
        return <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const hasAutocompleteSuggestions = autocompleteSuggestions.length > 0;
  const hasPopularSuggestions = suggestions.popular.length > 0;
  const hasTrendingSuggestions = suggestions.trending.length > 0;

  if (!hasAutocompleteSuggestions && !hasPopularSuggestions && !hasTrendingSuggestions && !loading) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
      {/* Autocomplete Results */}
      {query.length >= 2 && (
        <>
          {loading ? (
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-500">Searching...</span>
              </div>
            </div>
          ) : hasAutocompleteSuggestions ? (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Search Results
              </div>
              {autocompleteSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion.text)}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                >
                  {renderSuggestionIcon(suggestion.type)}
                  <span className="text-gray-900">{suggestion.text}</span>
                  {suggestion.category && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {suggestion.category}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </>
      )}

      {/* Popular Searches */}
      {hasPopularSuggestions && query.length < 2 && (
        <div className="border-b border-gray-100">
          <div className="px-4 py-2 bg-gray-50 flex items-center space-x-2">
            <FireIcon className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Popular Searches
            </span>
          </div>
          {suggestions.popular.slice(0, 6).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
            >
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Trending Searches */}
      {hasTrendingSuggestions && query.length < 2 && (
        <div>
          <div className="px-4 py-2 bg-gray-50 flex items-center space-x-2">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Trending Now
            </span>
          </div>
          {suggestions.trending.slice(0, 4).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
            >
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
              <span className="text-gray-900">{suggestion}</span>
              <span className="ml-auto text-xs text-green-600 font-medium">Trending</span>
            </button>
          ))}
        </div>
      )}

      {/* Quick Search Tips */}
      {query.length < 2 && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
          <div className="text-xs text-blue-700">
            <span className="font-medium">💡 Search Tips:</span> Try "AirPods Pro left", "Galaxy Buds case", or "Sony WF-1000XM4"
          </div>
        </div>
      )}
    </div>
  );
}
