'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  _count?: {
    models: number;
  };
  listingCount?: number;
}

export function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      console.log('🏢 Fetching brands from API proxy...');
      
      // Use API proxy route instead of direct backend call
      const response = await fetch('/api/proxy/brands');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Received brands data:', data);
        
        // The backend returns {items: Brand[], pagination: {...}}
        const brandsData = Array.isArray(data.items) ? data.items : data.brands || [];
        
        // Transform data to include listingCount from _count.models
        const transformedBrands = brandsData.map((brand: any) => ({
          ...brand,
          listingCount: (brand._count?.Listing || 0) + (brand._count?.LostReport || 0) + (brand._count?.FoundItem || 0),
          modelCount: brand._count?.models || 0,
        }));
        
        console.log(`📊 Setting ${transformedBrands.length} brands`);
        setBrands(transformedBrands);
      } else {
        console.error('❌ API response not ok:', response.status, response.statusText);
        setBrands([]);
      }
    } catch (error) {
      console.error('❌ Error fetching brands:', error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = Array.isArray(brands) ? brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleBrandClick = (brand: Brand) => {
    // Navigate to search with both query and brand filter
    // Use brand name for query but brand ID for the brands filter
    router.push(`/search?q=${encodeURIComponent(brand.name)}&brands=${encodeURIComponent(brand.id)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Browse by Brand
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Explore earbuds and accessories from your favorite brands. 
              Find authentic products from trusted manufacturers.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="aspect-square bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredBrands.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''} found
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {filteredBrands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleBrandClick(brand)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="text-2xl font-bold text-gray-400">
                            {brand.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {brand.name}
                      </h3>
                      
                      <p className="text-sm text-gray-500">
                        {(brand as any).listingCount || 0} listing{((brand as any).listingCount || 0) !== 1 ? 's' : ''}
                      </p>
                      {(brand as any).modelCount > 0 && (
                        <p className="text-xs text-gray-400">
                          {(brand as any).modelCount} model{(brand as any).modelCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No brands found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search query to find more brands.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
