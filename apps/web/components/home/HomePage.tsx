'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, MapPinIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { ListingCard } from '../listings/ListingCard';
import { CategoryFilter } from './CategoryFilter';
import { SearchSuggestions } from './SearchSuggestions';

interface FeaturedListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  images: string[];
  brand: {
    name: string;
    logo?: string;
  };
  city: {
    name: string;
    countryCode: string;
  };
  seller: {
    name: string;
    trustLevel: string;
    isVerified: boolean;
  };
  publishedAt: string;
}

interface SearchSuggestion {
  popular: string[];
  trending: string[];
}

export function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [featuredListings, setFeaturedListings] = useState<FeaturedListing[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion>({ popular: [], trending: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [featuredResponse, suggestionsResponse] = await Promise.all([
        fetch('/api/search/featured?limit=12'),
        fetch('/api/search/suggestions'),
      ]);

      const featured = await featuredResponse.json();
      const suggestionsData = await suggestionsResponse.json();

      const featuredArray = Array.isArray(featured)
        ? featured
        : (featured?.listings ?? []);

      setFeaturedListings(featuredArray);
      setSuggestions({
        popular: suggestionsData?.popular ?? [],
        trending: suggestionsData?.trending ?? [],
      });
    } catch (error) {
      console.error('Error fetching homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedCategory) params.set('category', selectedCategory);
    
    router.push(`/search?${params.toString()}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Find Your Perfect
              <span className="block text-yellow-400">Earbud Match</span>
            </h1>
            <p className="text-xl sm:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
              Buy, sell, and find lost earbuds, charging cases, and accessories from trusted sellers worldwide
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Search Input */}
                  <div className="md:col-span-6 relative">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search AirPods, Galaxy Buds, charging cases..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {showSuggestions && (searchQuery.length >= 2 || searchQuery === '') && (
                      <SearchSuggestions
                        query={searchQuery}
                        suggestions={suggestions}
                        onSuggestionClick={handleSuggestionClick}
                      />
                    )}
                  </div>

                  {/* Location Input */}
                  <div className="md:col-span-4">
                    <div className="relative">
                      <MapPinIcon className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
                      <input
                        type="text"
                        placeholder="City, Country"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {['AirPods Pro', 'Galaxy Buds', 'Charging Cases', 'Left Earbud', 'Right Earbud'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSearchQuery(filter)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Listings</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover verified listings from trusted sellers with high ratings and authentic products
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/search')}
              className="inline-flex items-center px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              View All Listings
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-lg text-gray-300">Join the largest marketplace for earbud parts and accessories</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">50K+</div>
              <div className="text-gray-300">Active Listings</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">25K+</div>
              <div className="text-gray-300">Happy Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">100+</div>
              <div className="text-gray-300">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">99%</div>
              <div className="text-gray-300">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Get started in just a few simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Search & Browse</h3>
              <p className="text-gray-600">
                Use our advanced search to find exactly what you need. Filter by brand, model, condition, and location.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Connect & Negotiate</h3>
              <p className="text-gray-600">
                Contact sellers directly through our secure messaging system. Negotiate prices and arrange pickup or shipping.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Safe Transaction</h3>
              <p className="text-gray-600">
                Complete your purchase with confidence using our secure payment system and buyer protection.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
