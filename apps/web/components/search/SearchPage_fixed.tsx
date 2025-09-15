'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchFilters } from './SearchFilters';
import { SearchResults } from './SearchResults';
import { SearchHeader } from './SearchHeader';
import { SearchMobileFilters } from './SearchMobileFilters';

export interface SearchParams {
  query: string;
  brands: string[];
  models: string[];
  conditions: string[];
  cities: string[];
  minPrice: string;
  maxPrice: string;
  isVerified: boolean;
  hasImages: boolean;
  sortBy: string;
  page: number;
}

export interface Facet {
  id: string;
  name: string;
  count: number;
}

export interface ConditionFacet {
  value: string;
  label: string;
  count: number;
}

export interface SearchFacets {
  brands: Facet[];
  models: Facet[];
  conditions: ConditionFacet[];
  priceRanges: { min: number; max: number; count: number }[];
  cities: Facet[];
}

export interface SearchResultsData {
  listings: any[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  facets?: SearchFacets;
}

export function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResultsData | null>(null);
  const [facets, setFacets] = useState<SearchFacets | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Search parameters state
  const [searchFilters, setSearchFilters] = useState<SearchParams>(() => ({
    query: '',
    brands: [],
    models: [],
    conditions: [],
    cities: [],
    minPrice: '',
    maxPrice: '',
    isVerified: false,
    hasImages: false,
    sortBy: 'relevance',
    page: 1,
  }));

  // Perform search
  const performSearch = useCallback(async (filters: SearchParams) => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.query) params.set('q', filters.query);
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.brands?.length) params.set('brands', filters.brands.join(','));
      if (filters.models?.length) params.set('models', filters.models.join(','));
      if (filters.cities?.length) params.set('cities', filters.cities.join(','));
      if (filters.conditions?.length) params.set('conditions', filters.conditions.join(','));
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.isVerified) params.set('isVerified', 'true');
      if (filters.hasImages) params.set('hasImages', 'true');

      console.log('🔍 Performing search with params:', params.toString());

      // Use advanced search endpoint
      const searchResponse = await fetch(`/api/proxy/search/advanced?${params.toString()}`);
      
      if (!searchResponse.ok) {
        throw new Error(`Search failed: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();

      // Get facets for filtering
      const facetsResponse = await fetch(`/api/proxy/search/facets?${params.toString()}`);
      let facetsData = null;
      
      if (facetsResponse.ok) {
        facetsData = await facetsResponse.json();
        setFacets(facetsData);
      }

      setResults(searchData);
      console.log('✅ Search completed. Results:', searchData.total || 0);
    } catch (err) {
      console.error('❌ Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize from URL parameters
  useEffect(() => {
    const params: SearchParams = {
      query: searchParams.get('q') || '',
      brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
      models: searchParams.get('models')?.split(',').filter(Boolean) || [],
      conditions: searchParams.get('conditions')?.split(',').filter(Boolean) || [],
      cities: searchParams.get('cities')?.split(',').filter(Boolean) || [],
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      isVerified: searchParams.get('isVerified') === 'true',
      hasImages: searchParams.get('hasImages') === 'true',
      sortBy: searchParams.get('sortBy') || 'relevance',
      page: parseInt(searchParams.get('page') || '1'),
    };
    
    console.log('📝 Initializing search from URL params:', params);
    setSearchFilters(params);
    setSearchQuery(params.query || '');
  }, [searchParams]);

  // Perform search when searchFilters change
  useEffect(() => {
    // Only search if we have meaningful search criteria
    const hasSearchCriteria = searchFilters.query || 
        searchFilters.brands?.length > 0 || 
        searchFilters.models?.length > 0 || 
        searchFilters.conditions?.length > 0 || 
        searchFilters.cities?.length > 0 ||
        searchFilters.minPrice || 
        searchFilters.maxPrice ||
        searchFilters.isVerified ||
        searchFilters.hasImages;

    console.log('🎯 Search criteria check:', { hasSearchCriteria, filters: searchFilters });
    
    if (hasSearchCriteria) {
      performSearch(searchFilters);
    }
  }, [searchFilters, performSearch]);

  // Update URL when filters change
  const updateURL = useCallback((filters: SearchParams) => {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('q', filters.query);
    if (filters.page && filters.page !== 1) params.set('page', filters.page.toString());
    if (filters.sortBy && filters.sortBy !== 'relevance') params.set('sortBy', filters.sortBy);
    if (filters.brands?.length) params.set('brands', filters.brands.join(','));
    if (filters.models?.length) params.set('models', filters.models.join(','));
    if (filters.cities?.length) params.set('cities', filters.cities.join(','));
    if (filters.conditions?.length) params.set('conditions', filters.conditions.join(','));
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.isVerified) params.set('isVerified', 'true');
    if (filters.hasImages) params.set('hasImages', 'true');

    const newURL = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newURL as any);
  }, [router]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Partial<SearchParams>) => {
    const updatedFilters = { 
      ...searchFilters, 
      ...newFilters,
      page: newFilters.page || 1 // Reset to page 1 unless specifically setting page
    };
    
    console.log('🔄 Filters changed:', newFilters, 'Updated filters:', updatedFilters);
    setSearchFilters(updatedFilters);
    updateURL(updatedFilters);
    performSearch(updatedFilters);
  }, [searchFilters, updateURL, performSearch]);

  // Handle search query change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    handleFiltersChange({ query: query, page: 1 });
  }, [handleFiltersChange]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <SearchHeader
        query={searchQuery}
        onQueryChange={handleSearchChange}
        onFiltersToggle={() => setMobileFiltersOpen(true)}
        resultsCount={results?.total || 0}
        loading={loading}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block">
            <SearchFilters
              facets={facets}
              filters={searchFilters}
              onFiltersChange={handleFiltersChange}
              loading={loading}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <SearchResults
              results={results}
              loading={loading}
              error={error}
              onLoadMore={(page: number) => handleFiltersChange({ page })}
              onSortChange={(sortBy: string) => handleFiltersChange({ sortBy, page: 1 })}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <SearchMobileFilters
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        searchParams={searchFilters}
        onParamsChange={handleFiltersChange}
        facets={facets}
      />
    </div>
  );
}
