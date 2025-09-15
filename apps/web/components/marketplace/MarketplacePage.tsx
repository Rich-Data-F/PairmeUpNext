'use client';

import React from 'react';
import { SearchPage } from '@/components/search/SearchPage';

export function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              EarbudHub Marketplace
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse thousands of earbuds, charging cases, and accessories. 
              Find the perfect replacement or upgrade for your audio setup.
            </p>
          </div>
        </div>
      </div>
      
      {/* Use the existing SearchPage component with showAllByDefault */}
      <SearchPage showAllByDefault={true} />
    </div>
  );
}
