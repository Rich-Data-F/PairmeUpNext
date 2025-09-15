'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartIcon, MapPinIcon, CheckBadgeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface ListingCardProps {
  listing: {
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
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    router.push(`/listings/${listing.id}`);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    // TODO: Implement like functionality with API
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'like new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'good':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'fair':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrustLevelColor = (trustLevel: string) => {
    switch (trustLevel.toLowerCase()) {
      case 'gold':
        return 'text-yellow-600';
      case 'silver':
        return 'text-gray-500';
      case 'bronze':
        return 'text-orange-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100 overflow-hidden"
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden">
        {listing.images && listing.images.length > 0 && !imageError ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-6xl opacity-30">🎧</div>
          </div>
        )}
        
        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
        >
          {isLiked ? (
            <HeartSolidIcon className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-600 hover:text-red-500" />
          )}
        </button>

        {/* Condition Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getConditionColor(listing.condition)}`}>
            {listing.condition}
          </span>
        </div>

        {/* Brand Logo */}
        {listing.brand.logo && (
          <div className="absolute bottom-3 left-3">
            <img
              src={listing.brand.logo}
              alt={listing.brand.name}
              className="w-8 h-8 bg-white rounded-full p-1 shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {listing.title}
        </h3>

        {/* Price */}
        <div className="text-2xl font-bold text-gray-900 mb-3">
          {formatPrice(listing.price, listing.currency)}
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPinIcon className="w-4 h-4 mr-1" />
          <span className="text-sm">
            {listing.city.name}, {listing.city.countryCode}
          </span>
        </div>

        {/* Seller Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">{listing.seller.name}</span>
            {listing.seller.isVerified && (
              <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
            )}
            <span className={`text-xs font-medium ${getTrustLevelColor(listing.seller.trustLevel)}`}>
              {listing.seller.trustLevel}
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center text-gray-500 text-xs">
          <CalendarIcon className="w-3 h-3 mr-1" />
          <span>{formatDate(listing.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
}
