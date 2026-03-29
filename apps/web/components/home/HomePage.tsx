'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
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
  const t_hero = useTranslations('hero');
  const t_home = useTranslations('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any>({ popular: [], trending: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({ activeListings: 0, totalUsers: 0, totalViews: 0 });

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const parseJsonSafely = async (response: Response, fallback: any) => {
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      return fallback;
    }

    try {
      return await response.json();
    } catch {
      return fallback;
    }
  };

  const fetchHomepageData = async () => {
    try {
      setLoading(true);
      const [featuredResponse, suggestionsResponse, statsResponse] = await Promise.all([
        fetch('/api/search/featured'),
        fetch('/api/search/suggestions'),
        fetch('/api/proxy/search/stats'),
      ]);

      const featured = await parseJsonSafely(featuredResponse, { listings: [] });
      const suggestionsData = await parseJsonSafely(suggestionsResponse, { popular: [], trending: [] });
      const statsData = await parseJsonSafely(statsResponse, { activeListings: 0, totalUsers: 0, totalViews: { _sum: { views: 0 } } });

      const featuredArray = Array.isArray(featured)
        ? featured
        : (featured?.listings ?? []);

      setFeaturedListings(featuredArray);
      setSuggestions({
        popular: suggestionsData?.popular ?? [],
        trending: suggestionsData?.trending ?? [],
      });
      setStats({
        activeListings: statsData?.activeListings ?? 0,
        totalUsers: statsData?.totalUsers ?? 0,
        totalViews: statsData?.totalViews?._sum?.views ?? 0,
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
              {t_hero('headline')}
            </h1>
            <p className="text-xl sm:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
              {t_hero('subheadline')}
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
                        placeholder={t_hero('searchPlaceholder')}
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
                        placeholder={t_hero('locationPlaceholder')}
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
                      {t_hero('searchButton')}
                    </button>
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    { key: 'airpodsPro', label: t_home('quickFilters.airpodsPro') },
                    { key: 'galaxyBuds', label: t_home('quickFilters.galaxyBuds') },
                    { key: 'chargingCases', label: t_home('quickFilters.chargingCases') },
                    { key: 'leftEarbud', label: t_home('quickFilters.leftEarbud') },
                    { key: 'rightEarbud', label: t_home('quickFilters.rightEarbud') }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setSearchQuery(filter.label)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Unified Lost & Found Menu */}
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl border border-white/20 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">{t_hero('lostFoundPromoTitle')}</h3>
                  <p className="text-blue-100">{t_hero('lostFoundPromoDesc')}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <button 
                    onClick={() => router.push('/lost-stolen')}
                    className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 hover:shadow-xl transition-all shadow-lg active:scale-95 flex items-center justify-center"
                  >
                    {t_hero('goLostFound')}
                  </button>
                  <button 
                    onClick={() => router.push('/marketplace')}
                    className="px-8 py-3 bg-blue-700 text-white border border-blue-400 font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg active:scale-95 flex items-center justify-center"
                  >
                    {t_hero('goMarketplace')}
                  </button>
                </div>
              </div>
            </div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t_home('featuredTitle')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t_home('featuredSubtitle')}
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
              onClick={() => router.push('/marketplace')}
              className="inline-flex items-center px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              {t_home('viewAll')}
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t_home('statsTitle')}</h2>
            <p className="text-lg text-gray-300">{t_home('statsSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {stats.activeListings.toLocaleString()}
              </div>
              <div className="text-gray-300">{t_home('activeListings')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-gray-300">{t_home('happyUsers')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">
                {stats.totalViews.toLocaleString()}
              </div>
              <div className="text-gray-300">{t_home('totalViews')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">99%</div>
              <div className="text-gray-300">{t_home('successRate')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t_home('howItWorksTitle')}</h2>
            <p className="text-lg text-gray-600">{t_home('howItWorksSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{t_home('step1Title')}</h3>
              <p className="text-gray-600">
                {t_home('step1Desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t_home('step2Title')}</h3>
              <p className="text-gray-600">
                {t_home('step2Desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t_home('step3Title')}</h3>
              <p className="text-gray-600">
                {t_home('step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Survey CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-3xl font-black mb-4">{t_home('surveyCTA_Title')}</h2>
              <p className="text-blue-100 text-lg">{t_home('surveyCTA_Desc')}</p>
            </div>
            <Link href="/survey" className="px-10 py-4 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-blue-500/20 active:scale-95 flex items-center justify-center whitespace-nowrap">
              {t_home('surveyCTA_Button')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
