'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { toast } from 'react-hot-toast'
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline'

interface ListingItem {
  id: string
  title: string
  description?: string
  price: number
  currency: string
  status: string
  createdAt: string
  _count?: {
    images: number
    views: number
  }
}

export default function MyListingsPage() {
  const t = useTranslations('myListings')
  const tc = useTranslations('common')
  const router = useRouter()
  const [listings, setListings] = useState<ListingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch('/api/proxy/listings/my-listings', {
          cache: 'no-store'
        })

        if (res.status === 401) {
          router.push('/auth/signin')
          return
        }

        if (!res.ok) {
          throw new Error('Failed to fetch listings')
        }

        const data = await res.json()
        setListings(Array.isArray(data) ? data : data.listings || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        toast.error(t('fetchError') || 'Failed to load listings')
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [router, t])

  const handleDelete = async (id: string) => {
    if (!confirm(tc('confirmDelete') || 'Are you sure?')) return

    try {
      const res = await fetch(`/api/proxy/listings/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Failed to delete listing')
      }

      setListings(listings.filter(l => l.id !== id))
      toast.success(tc('deleteSuccess') || 'Listing deleted successfully')
    } catch (err) {
      toast.error(tc('deleteError') || 'Failed to delete listing')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              {t('title') || 'My Listings'}
            </h1>
            <p className="text-gray-600">
              {t('subtitle') || `You have ${listings.length} listing${listings.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link
            href="/sell"
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            {t('createNew') || 'Create Listing'}
          </Link>
        </div>

        {/* Listings */}
        {listings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <EyeIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t('empty') || 'No listings yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('emptyDescription') || 'Create your first listing to get started'}
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              {t('createNew') || 'Create Listing'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 line-clamp-2 flex-1">
                      {listing.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ml-2 ${
                      listing.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : listing.status === 'SOLD'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {listing.status}
                    </span>
                  </div>

                  {listing.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {listing.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4 pb-4 border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-2xl font-black text-gray-900">
                        {listing.currency} {listing.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {listing._count && (
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {listing._count.views || 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('views') || 'views'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-semibold text-sm"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      {t('edit') || 'Edit'}
                    </Link>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-semibold text-sm"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      {t('delete') || 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
