'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPinIcon,
  HeartIcon,
  ShareIcon,
  CheckBadgeIcon,
  StarIcon,
  CalendarIcon,
  EyeIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { NegotiationPanel } from './NegotiationPanel';

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  type: string;
  condition: string;
  price: string;
  currency: string;
  identifierMasked: string | null;
  isVerified: boolean;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  model: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };
  city: {
    id: string;
    name: string;
    displayName: string;
    countryCode: string;
  };
  seller: {
    id: string;
    name: string;
    verificationBadge: string;
    trustLevel: string;
    isVerified: boolean;
  };
  images: string[];
  views: number;
  createdAt: string;
  publishedAt: string;
  sellerNotes: string | null;
  location: {
    hideExactLocation: boolean;
    latitude: string;
    longitude: string;
    approximate: boolean;
  };
}

interface ListingDetailPageProps {
  listingId: string;
}

export function ListingDetailPage({ listingId }: ListingDetailPageProps) {
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const negotiationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/proxy/listings/${listingId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch listing: ${response.status}`);
      }

      const data = await response.json();
      setListing(data);
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  // Try to get the current user id (if authenticated). No error if not.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch('/api/proxy/auth/profile', { cache: 'no-store' });
        if (resp.ok) {
          const profile = await resp.json();
          if (!cancelled) setCurrentUserId(profile?.id);
        } else {
          if (!cancelled) setCurrentUserId(undefined);
        }
      } catch {
        if (!cancelled) setCurrentUserId(undefined);
      }
    })();
    return () => { cancelled = true };
  }, []);

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement like functionality with API
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: listing?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleContactSeller = async () => {
    if (!listing) return;
    // If not authenticated, send to sign in and return to this listing
    if (!currentUserId) {
      router.push(`/auth/signin?next=/listings/${listing.id}`);
      return;
    }
    // If the viewer is the seller, no-op
    if (currentUserId === listing.seller.id) return;

    try {
      // Create or get conversation, then scroll to panel
      const resp = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, sellerId: listing.seller.id })
      });
      // Ignore response content; NegotiationPanel will (re)initialize
      if (negotiationRef.current) {
        negotiationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (e) {
      // soft-fail silently on click
      if (negotiationRef.current) {
        negotiationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const formatPrice = (price: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(parseFloat(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTrustLevelColor = (trustLevel: string) => {
    switch (trustLevel.toLowerCase()) {
      case 'platinum': return 'text-purple-600 bg-purple-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new': return 'text-green-600 bg-green-100';
      case 'like_new': return 'text-blue-600 bg-blue-100';
      case 'good': return 'text-yellow-600 bg-yellow-100';
      case 'fair': return 'text-orange-600 bg-orange-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-300 rounded-lg h-96"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Listing</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/search')}
            className="btn-primary"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
          <p className="text-gray-600 mb-4">The listing you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/search')}
            className="btn-primary"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <button onClick={() => router.push('/')} className="hover:text-blue-600">
            Home
          </button>
          <span>/</span>
          <button onClick={() => router.push('/search')} className="hover:text-blue-600">
            Search
          </button>
          <span>/</span>
          <span className="text-gray-900">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {listing.images.length > 0 ? (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Images */}
            {listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {listing.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg">
                    <img
                      src={image}
                      alt={`${listing.title} ${index + 2}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="font-medium">{listing.brand.name}</span>
                    <span>•</span>
                    <span>{listing.model.name}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleLike}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    {isLiked ? (
                      <HeartSolidIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <ShareIcon className="h-6 w-6 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Price and Condition */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(listing.price, listing.currency)}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(listing.condition)}`}>
                  {listing.condition.replace('_', ' ')}
                </span>
              </div>

              {/* Verification */}
              {listing.isVerified && (
                <div className="flex items-center space-x-2 text-green-600 mb-4">
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Verified Listing</span>
                </div>
              )}

              {/* Contact Button */}
              <button
                onClick={handleContactSeller}
                className="w-full btn-primary mb-4"
              >
                Contact Seller
              </button>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                <div className="flex items-center space-x-1">
                  <EyeIcon className="h-4 w-4" />
                  <span>{listing.views} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Listed {formatDate(listing.publishedAt)}</span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {listing.seller.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{listing.seller.name}</h4>
                    {listing.seller.isVerified && (
                      <CheckBadgeIcon className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrustLevelColor(listing.seller.trustLevel)}`}>
                      {listing.seller.trustLevel} Seller
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                      {listing.seller.verificationBadge}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{listing.city.displayName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              
              {listing.sellerNotes && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Seller Notes</h4>
                  <p className="text-gray-700 text-sm">{listing.sellerNotes}</p>
                </div>
              )}
            </div>

            {/* Listing Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Listing Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Type</span>
                  <p className="font-medium">{listing.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Condition</span>
                  <p className="font-medium">{listing.condition.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Brand</span>
                  <p className="font-medium">{listing.brand.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Model</span>
                  <p className="font-medium">{listing.model.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Location</span>
                  <p className="font-medium">{listing.city.displayName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Listed</span>
                  <p className="font-medium">{formatDate(listing.publishedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Negotiation Panel */}
        <div ref={negotiationRef}>
          <NegotiationPanel
            listingId={listing.id}
            sellerId={listing.seller.id}
            currentUserId={currentUserId}
            listingPrice={parseFloat(listing.price)}
            listingCurrency={listing.currency}
          />
        </div>
      </div>
    </div>
  );
}
