'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchHeader } from './SearchHeader';
import { SearchFilters } from './SearchFilters';
import { SearchResults } from './SearchResults';

export interface SearchParams {
  query: string;
  brands?: string[];
  models?: string[];
  conditions?: string[];
  cities?: string[];
  minPrice?: string;
  maxPrice?: string;
  isVerified?: boolean;
  hasImages?: boolean;
  sortBy?: string;
  page?: number;
}

export interface SearchData {
  listings: any[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SearchResultsData {
  listings: any[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SearchFacets {
  brands?: { id: string; name: string; count: number }[];
  models?: { id: string; name: string; count: number }[];
  conditions?: { value: string; label: string; count: number }[];
  cities?: { id: string; name: string; count: number }[];
}

interface SearchPageProps {
  showAllByDefault?: boolean;
}

export function SearchPage({ showAllByDefault = false }: SearchPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchParams>({
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
  });
  
  const [results, setResults] = useState<SearchData>({
    listings: [],
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false,
  });
  
  const [facets, setFacets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandNamesMap, setBrandNamesMap] = useState<Record<string, string>>({});

  // Perform search
  const performSearch = useCallback(async (filters: SearchParams) => {
    console.log('🔍 Starting search with filters:', filters);
    setLoading(true);
    setError(null);
    
    try {
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
        // Update brand names map from facets data
        if (facetsData?.brands) {
          const newNames: Record<string, string> = {};
          for (const b of facetsData.brands) {
            if (b.id && b.name) newNames[b.id] = b.name;
          }
          setBrandNamesMap(prev => ({ ...prev, ...newNames }));
        }
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

    // Build brand names map from URL (passed from BrandsPage)
    const brandName = searchParams.get('brandName');
    if (brandName && params.brands && params.brands.length === 1) {
      setBrandNamesMap(prev => ({ ...prev, [params.brands![0]]: brandName }));
    }
    
    console.log('📝 Initializing search from URL params:', params);
    setSearchFilters(params);
    setSearchQuery(params.query || '');
  }, [searchParams]);

  // Perform search when searchFilters change
  useEffect(() => {
    // Only search if we have meaningful search criteria OR if we should show all by default
    const hasSearchCriteria = searchFilters.query || 
        (searchFilters.brands && searchFilters.brands.length > 0) || 
        (searchFilters.models && searchFilters.models.length > 0) || 
        (searchFilters.conditions && searchFilters.conditions.length > 0) || 
        (searchFilters.cities && searchFilters.cities.length > 0) ||
        searchFilters.minPrice || 
        searchFilters.maxPrice ||
        searchFilters.isVerified ||
        searchFilters.hasImages;

    console.log('🎯 Search criteria check:', { hasSearchCriteria, showAllByDefault, filters: searchFilters });
    
    if (hasSearchCriteria || showAllByDefault) {
      performSearch(searchFilters);
    }
  }, [searchFilters, performSearch, showAllByDefault]);

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

    const newURL = `/search?${params.toString()}`;
    router.push(newURL as any);
  }, [router]);

  const handleQueryChange = useCallback((query: string) => {
    console.log('🔍 Handling query change:', query);
    const newFilters = { ...searchFilters, query, page: 1 };
    setSearchQuery(query);
    setSearchFilters(newFilters);
    updateURL(newFilters);
  }, [searchFilters, updateURL]);

  const handleFiltersToggle = useCallback(() => {
    // This could be used to show/hide filters on mobile
    console.log('🔧 Filters toggle');
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<SearchParams>) => {
    console.log('🔧 Handling filter change:', newFilters);
    const updatedFilters = { ...searchFilters, ...newFilters, page: 1 };
    setSearchFilters(updatedFilters);
    updateURL(updatedFilters);
  }, [searchFilters, updateURL]);

  const handleSortChange = useCallback((sortBy: string) => {
    console.log('📊 Handling sort change:', sortBy);
    const newFilters = { ...searchFilters, sortBy, page: 1 };
    setSearchFilters(newFilters);
    updateURL(newFilters);
  }, [searchFilters, updateURL]);

  const handlePageChange = useCallback((page: number) => {
    console.log('📄 Handling page change:', page);
    const newFilters = { ...searchFilters, page };
    setSearchFilters(newFilters);
    updateURL(newFilters);
  }, [searchFilters, updateURL]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchHeader
        query={searchQuery}
        onQueryChange={handleQueryChange}
        onFiltersToggle={handleFiltersToggle}
        resultsCount={results.total}
        loading={loading}
      />
      
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <SearchFilters
              filters={searchFilters}
              facets={facets}
              onFiltersChange={handleFilterChange}
              loading={loading}
              brandNamesMap={brandNamesMap}
            />
          </div>
          
          <div className="flex-1">
            <SearchResults
              results={results}
              loading={loading}
              error={error}
              onLoadMore={handlePageChange}
              onSortChange={handleSortChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
