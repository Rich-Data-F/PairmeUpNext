'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MapIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { LostFoundMap } from '@/components/lost-found/LostFoundMap';

export default function MapsPage() {
  const t = useTranslations('maps');
  const tCommon = useTranslations('common');
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all listings: both registry items (price=0) and classified ads (price>0)
  useEffect(() => {
    async function fetchListings() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/proxy/listings?limit=1000');
        const data = await res.json();
        setListings(data.data || []);
      } catch (err) {
        console.error('Failed to load listings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchListings();
  }, []);

  // Apply search filter
  const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const filteredListings = listings.filter(listing => {
    if (searchTerms.length === 0) return true;
    return searchTerms.every(term =>
      listing.title?.toLowerCase().includes(term) ||
      listing.description?.toLowerCase().includes(term) ||
      listing.brand?.name?.toLowerCase().includes(term) ||
      listing.model?.name?.toLowerCase().includes(term) ||
      listing.city?.displayName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b mb-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center justify-center">
            <MapIcon className="w-8 h-8 mr-3 text-blue-600" />
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600 font-medium tracking-tight">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <MagnifyingGlassIcon className="w-6 h-6 mr-2 text-blue-600" />
                {t('exploreMap')}
              </h2>
              <div className="mt-1 text-sm text-gray-500">
                {listings.length} {t('itemsAvailable')}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('loading')}</p>
          </div>
        ) : filteredListings.length > 0 ? (
          <LostFoundMap
            reports={filteredListings}
            emptyTitle={t('noCoordinates')}
            emptyDescription={t('noCoordinatesDesc')}
            viewDetailsLabel={tCommon('viewDetails')}
            brandModelLabel={tCommon('brandModel')}
            datePostedLabel={tCommon('datePosted')}
            locationLabel={tCommon('location')}
            foundItemLabel={t('foundItem')}
            lostItemLabel={t('lostItem')}
            mapLegendLabel={t('mapLegend')}
            mapLegendLostLabel={t('mapLegendLost')}
            mapLegendFoundLabel={t('mapLegendFound')}
            mapLegendTypesLabel={t('mapLegendTypes')}
            mapAvailableCountLabel={t('mapAvailableCount')}
            selectedCategory="all"
            sellingLabel={tCommon('selling')}
            buyingLabel={tCommon('buying')}
            allLabel={tCommon('all')}
            classifiedLabel={t('classified')}
          />
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{t('noResults')}</h3>
            <p className="mt-2 text-sm text-gray-600">{t('noResultsDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
