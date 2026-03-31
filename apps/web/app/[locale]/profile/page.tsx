'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { 
  UserCircleIcon, 
  ShoppingBagIcon, 
  ShieldCheckIcon, 
  Cog6ToothIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  CheckBadgeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

type User = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  isVerified: boolean;
  trustLevel: string;
  createdAt: string;
};

type Listing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  createdAt: string;
  views: number;
};

type TabId = 'dashboard' | 'listings' | 'details' | 'security';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tc = useTranslations('common');
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Form States
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [profileRes, listingsRes] = await Promise.all([
          fetch('/api/proxy/auth/profile'),
          fetch('/api/proxy/listings/my-listings')
        ]);

        if (!profileRes.ok) {
          router.push('/auth/signin?next=/profile');
          return;
        }

        const userData = await profileRes.json();
        setUser(userData);
        setName(userData.name || '');
        setBio(userData.bio || '');
        setLocation(userData.location || '');
        setPhone(userData.phoneNumber || '');

        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          setListings(listingsData.data || []);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch('/api/proxy/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, location, phoneNumber: phone }),
      });

      if (!res.ok) throw new Error('Failed to update profile');
      
      const updatedUser = await res.json();
      setUser(updatedUser);
      toast.success(t('details.updateSuccess'));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t('security.passwordMismatch'));
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch('/api/proxy/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to change password');
      }

      toast.success(t('security.passwordSuccess'));
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm(tc('confirmDelete'))) return;

    try {
      const res = await fetch(`/api/proxy/listings/${listingId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete listing');
      
      setListings(prev => prev.filter(l => l.id !== listingId));
      toast.success('Listing deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header / Cover */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-48 relative shadow-inner">
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 w-32 h-32 bg-white rounded-2xl shadow-xl p-1 border-4 border-white overflow-hidden">
          <div className="w-full h-full bg-blue-50 flex items-center justify-center rounded-xl overflow-hidden">
             <UserCircleIcon className="w-20 h-20 text-blue-200" />
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 mt-20">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-gray-900">{user.name}</h1>
              {user.isVerified && <CheckBadgeIcon className="w-6 h-6 text-blue-500" />}
            </div>
            <p className="text-gray-500 font-medium">{user.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
               {user.location && (
                 <span className="flex items-center text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                   <MapPinIcon className="w-3 h-3 mr-1" /> {user.location}
                 </span>
               )}
               <span className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100 font-bold uppercase tracking-wider">
                 {user.trustLevel} Level
               </span>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('details')}
            className="btn btn-primary btn-sm px-6 rounded-xl"
          >
            {tc('edit')} Profile
          </button>
        </div>

        <div className="mt-10 flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Tabs */}
          <aside className="lg:w-64 space-y-1">
            {(['dashboard', 'listings', 'details', 'security'] as TabId[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-2' 
                    : 'text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                {tab === 'dashboard' && <ChartBarIcon className="w-5 h-5" />}
                {tab === 'listings' && <ShoppingBagIcon className="w-5 h-5" />}
                {tab === 'details' && <UserCircleIcon className="w-5 h-5" />}
                {tab === 'security' && <ShieldCheckIcon className="w-5 h-5" />}
                {t(`tabs.${tab}` as any)}
              </button>
            ))}
            <div className="pt-8 opacity-50">
               <button 
                onClick={() => fetch('/api/proxy/auth/logout', { method: 'POST' }).then(() => router.push('/'))}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl"
               >
                 <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                 {tc('logout')}
               </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <h2 className="text-2xl font-black text-gray-900">{t('tabs.dashboard')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Active Listings</p>
                      <p className="text-4xl font-black text-blue-900 mt-1">{listings.filter(l => l.status === 'ACTIVE').length}</p>
                    </div>
                    <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                      <p className="text-sm font-bold text-green-600 uppercase tracking-widest">Trust Rating</p>
                      <p className="text-4xl font-black text-green-900 mt-1">100%</p>
                    </div>
                    <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                      <p className="text-sm font-bold text-purple-600 uppercase tracking-widest">Total Views</p>
                      <p className="text-4xl font-black text-purple-900 mt-1">{listings.reduce((acc, curr) => acc + (curr.views || 0), 0)}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                     <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-tighter">Account Activity</h3>
                     <div className="border rounded-2xl overflow-hidden divide-y">
                        <div className="p-4 flex items-center justify-between text-sm">
                           <span className="text-gray-500">Member since</span>
                           <span className="font-bold text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="p-4 flex items-center justify-between text-sm">
                           <span className="text-gray-500">Last Active</span>
                           <span className="font-bold text-gray-900">Today</span>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'listings' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">{t('listings.title')}</h2>
                    <p className="text-gray-500 mt-1">{t('listings.subtitle')}</p>
                  </div>
                  
                  {listings.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed">
                      <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">{t('listings.noListings')}</p>
                      <button onClick={() => router.push('/sell')} className="mt-4 btn btn-primary px-8">
                        {t('listings.createOne')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {listings.map((l) => (
                        <div key={l.id} className="group p-4 bg-white border rounded-2xl hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden font-bold text-gray-300">
                            IMG
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{l.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-black text-blue-600">{l.price} {l.currency}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                l.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-600'
                              }`}>
                                {l.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                             <button 
                               onClick={() => router.push(`/listings/${l.id}/edit`)}
                               className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-blue-100"
                               title={tc('edit')}
                             >
                                <PencilIcon className="w-5 h-5" />
                             </button>
                             <button 
                               onClick={() => handleDeleteListing(l.id)}
                               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-red-100"
                               title={tc('delete')}
                             >
                                <TrashIcon className="w-5 h-5" />
                             </button>
                             <div className="w-px h-8 bg-gray-100 hidden sm:block"></div>
                             <button 
                               onClick={() => router.push(`/listings/${l.id}`)}
                               className="p-2 text-gray-400 hover:text-gray-900 rounded-lg transition-colors hidden sm:block"
                               title={tc('viewDetails')}
                             >
                                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">{t('details.title')}</h2>
                    <p className="text-gray-500 mt-1">{t('details.subtitle')}</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="form-control">
                        <label className="label text-xs font-black uppercase text-gray-500 tracking-widest">{t('details.name')}</label>
                        <div className="relative">
                          <UserCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            className="input input-bordered w-full pl-12 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                          />
                        </div>
                      </div>
                      <div className="form-control">
                        <label className="label text-xs font-black uppercase text-gray-500 tracking-widest">{t('details.phone')}</label>
                        <div className="relative">
                          <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            className="input input-bordered w-full pl-12 rounded-xl" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label text-xs font-black uppercase text-gray-500 tracking-widest">{t('details.location')}</label>
                      <div className="relative">
                        <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          className="input input-bordered w-full pl-12 rounded-xl" 
                          value={location} 
                          onChange={(e) => setLocation(e.target.value)} 
                          placeholder="e.g. Paris, France"
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label text-xs font-black uppercase text-gray-500 tracking-widest">{t('details.bio')}</label>
                      <textarea 
                        className="textarea textarea-bordered w-full h-32 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={updating}
                      className="btn btn-primary w-full sm:w-auto px-10 rounded-xl shadow-lg shadow-blue-500/20"
                    >
                      {updating ? <span className="loading loading-spinner loading-xs"></span> : t('details.saveChanges')}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">{t('security.title')}</h2>
                    <p className="text-gray-500 mt-1">{t('security.subtitle')}</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-6 max-w-sm">
                    <div className="form-control">
                      <label className="label text-xs font-black uppercase text-gray-500 tracking-widest">{t('security.oldPassword')}</label>
                      <div className="relative">
                        <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="password" 
                          className="input input-bordered w-full pl-12 rounded-xl" 
                          value={oldPassword} 
                          onChange={(e) => setOldPassword(e.target.value)} 
                          required
                        />
                      </div>
                    </div>
                    <div className="form-control">
                      <label className="label text-xs font-black uppercase text-gray-500 tracking-widest">{t('security.newPassword')}</label>
                      <div className="relative">
                        <ShieldCheckIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="password" 
                          className="input input-bordered w-full pl-12 rounded-xl" 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)} 
                          required
                          minLength={8}
                        />
                      </div>
                    </div>
                    <div className="form-control">
                      <label className="label text-xs font-black uppercase text-gray-500 tracking-widest">{t('security.confirmPassword')}</label>
                      <div className="relative">
                        <ShieldCheckIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="password" 
                          className="input input-bordered w-full pl-12 rounded-xl" 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={updating}
                      className="btn btn-primary w-full rounded-xl shadow-lg shadow-blue-500/20"
                    >
                      {updating ? <span className="loading loading-spinner loading-xs"></span> : t('security.changePassword')}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
