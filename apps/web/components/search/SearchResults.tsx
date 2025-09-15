'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  HeartIcon, 
  MapPinIcon, 
  ClockIcon,
  CheckBadgeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { SearchResultsData, SearchParams } from './SearchPage';

interface SearchResultsProps {
  results: SearchResultsData | null;
  loading: boolean;
  error: string | null;
  onLoadMore: (page: number) => void;
  onSortChange: (sortBy: string) => void;
}

interface SortOption {
  value: string;
  label: string;
}

const sortOptions: SortOption[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'createdAt_asc', label: 'Oldest First' },
];

function ListingCard({ listing }: { listing: any }) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return date.toLocaleDateString();
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'NEW': return 'bg-green-100 text-green-800';
      case 'LIKE_NEW': return 'bg-blue-100 text-blue-800';
      case 'GOOD': return 'bg-yellow-100 text-yellow-800';
      case 'FAIR': return 'bg-orange-100 text-orange-800';
      case 'PARTS_ONLY': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const primaryImage = listing.images?.[0] || '/placeholder-image.jpg';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <Link href={`/listings/${listing.id}` as any}>
        <div className="relative aspect-square">
          {!imageError ? (
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
          
          {/* Verification Badge */}
          {listing.isVerified && (
            <div className="absolute top-2 left-2">
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <CheckBadgeIcon className="h-3 w-3 mr-1" />
                Verified
              </div>
            </div>
          )}

          {/* Like Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            {isLiked ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Condition Badge */}
          <div className="absolute bottom-2 left-2">
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(listing.condition)}`}>
              {listing.condition.replace('_', ' ')}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/listings/${listing.id}` as any}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>
        </Link>

        <div className="space-y-2 mb-4">
          {/* Brand and Model */}
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">{listing.brand?.name}</span>
            {listing.model?.name && (
              <>
                <span className="mx-1">•</span>
                <span>{listing.model.name}</span>
              </>
            )}
          </div>

          {/* Location and Time */}
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{listing.city?.name}</span>
            <span className="mx-2">•</span>
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{formatTimeAgo(listing.createdAt)}</span>
          </div>

          {/* Seller Info */}
          <div className="flex items-center text-sm">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-gray-300 rounded-full mr-2"></div>
              <span className="text-gray-700">{listing.seller?.name}</span>
              {listing.seller?.isVerified && (
                <CheckBadgeIcon className="h-4 w-4 text-blue-500 ml-1" />
              )}
            </div>
            {listing.seller?.averageRating && (
              <div className="flex items-center ml-auto">
                <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-gray-600 ml-1">{listing.seller.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(listing.price, listing.currency)}
          </div>
          {listing.originalPrice && listing.originalPrice > listing.price && (
            <div className="text-sm text-gray-500 line-through">
              {formatPrice(listing.originalPrice, listing.currency)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="animate-pulse">
        <div className="aspect-square bg-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

export function SearchResults({ 
  results, 
  loading, 
  error, 
  onLoadMore, 
  onSortChange 
}: SearchResultsProps) {
  const [sortBy, setSortBy] = useState('relevance');

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    onSortChange(newSortBy);
  };

  const handleLoadMore = () => {
    if (results && results.hasMore) {
      onLoadMore(results.page + 1);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Sort and View Options */}
      {(results || loading) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="block w-40 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Loading Skeletons */}
        {loading && !results && (
          Array.from({ length: 12 }).map((_, index) => (
            <LoadingSkeleton key={index} />
          ))
        )}

        {/* Actual Results */}
        {results?.listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}

        {/* Loading More Skeletons */}
        {loading && results && (
          Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={`loading-${index}`} />
          ))
        )}
      </div>

      {/* No Results */}
      {results && results.listings.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>💡 Tips:</p>
            <ul className="space-y-1">
              <li>• Check your spelling</li>
              <li>• Try broader search terms</li>
              <li>• Remove some filters</li>
              <li>• Search for similar products</li>
            </ul>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {results && results.hasMore && !loading && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Load More Results
          </button>
        </div>
      )}

      {/* Results Summary */}
      {results && results.listings.length > 0 && (
        <div className="text-center mt-8 text-sm text-gray-500">
          Showing {results.listings.length} of {results.total.toLocaleString()} results
          {results.hasMore && (
            <span> • Page {results.page} of {results.totalPages}</span>
          )}
        </div>
      )}
    </div>
  );
}
