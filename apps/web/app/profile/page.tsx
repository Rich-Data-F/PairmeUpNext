"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  isVerified: boolean;
  createdAt: string;
};

type Listing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  createdAt: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'listings' | 'settings'>('profile');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/proxy/auth/profile');
        if (!res.ok) {
          router.push('/auth/signin?next=/profile');
          return;
        }
        const userData = await res.json();
        setUser(userData);

        // Fetch user's listings
        const listingsRes = await fetch('/api/proxy/listings/my-listings');
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          setListings(listingsData.data || []);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Not authenticated</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'listings'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Listings ({listings.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{user.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="mt-1 text-sm text-gray-900">{user.location || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Bio</h2>
                  <p className="mt-2 text-sm text-gray-600">{user.bio || 'No bio provided'}</p>
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Account Status</h2>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">My Listings</h2>
                {listings.length === 0 ? (
                  <p className="text-gray-500">You haven't created any listings yet.</p>
                ) : (
                  <div className="space-y-4">
                    {listings.map((listing) => (
                      <div key={listing.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{listing.title}</h3>
                            <p className="text-sm text-gray-500">
                              {listing.price} {listing.currency} • {listing.status}
                            </p>
                            <p className="text-xs text-gray-400">
                              Created {new Date(listing.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => router.push(`/listings/${listing.id}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/sell')}
                    className="btn btn-primary"
                  >
                    Create New Listing
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-sm text-gray-500">Manage your email preferences</p>
                    {/* Add settings controls here */}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Privacy</label>
                    <p className="text-sm text-gray-500">Control your privacy settings</p>
                    {/* Add settings controls here */}
                  </div>
                  <div className="pt-4">
                    <button className="btn btn-secondary mr-4">Update Profile</button>
                    <button
                      onClick={() => fetch('/api/proxy/auth/logout', { method: 'POST' }).then(() => router.push('/'))}
                      className="btn btn-outline"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
