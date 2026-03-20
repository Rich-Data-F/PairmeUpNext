'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ExclamationTriangleIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

type Brand = { id: string; name: string; slug: string };
type Model = { id: string; name: string; slug: string };
type City = { id: string; name: string; displayName: string; countryCode: string };

const LISTING_TYPES = [
  { value: 'EARBUD_LEFT', label: 'Left earbud' },
  { value: 'EARBUD_RIGHT', label: 'Right earbud' },
  { value: 'EARBUD_PAIR', label: 'Pair of earbuds (L+R)' },
  { value: 'CHARGING_CASE', label: 'Charging case' },
  { value: 'FULL_SET', label: 'Full complete kit (Earbuds + Case)' },
];

const COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'CA', name: 'Canada' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
];

export function LostStolenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'search' | 'report'>('search');
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-complete and Canonical States
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [cityQuery, setCityQuery] = useState('');
  const [countryCode, setCountryCode] = useState('FR');

  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    brandId: '',
    modelId: '',
    customBrand: '',
    customModel: '',
    showCustomBrand: false,
    showCustomModel: false,
    type: 'EARBUD_LEFT',
    cityId: '',
    lastSeenDate: '',
    rewardAmount: '',
    currency: 'EUR',
    contactEmail: '',
    address: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    incidentType: 'lost' as 'lost' | 'stolen' | 'found'
  });

  // 0. Check authentication
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/proxy/auth/profile', { cache: 'no-store' });
        setAuthed(res.ok);
      } catch {
        setAuthed(false);
      }
    })();
  }, []);

  // 1. Fetch live 'Lost/Buying' or 'Found/Selling' listings from the backend!
  useEffect(() => {
    async function fetchReports() {
      try {
        setIsLoading(true);
        // We query the search engine. Filtering by intent happens in the DB logic.
        // For a unified registry, we fetch both BUYING and SELLING items that are indexed for registry. 
        // Registry items for the unified list (filtering price=0 only)
        const res = await fetch('/api/proxy/search/advanced?maxPrice=0');
        const data = await res.json();
        setReports(data.listings || data.data || []);
      } catch (err) {
        console.error('Failed to load real reports:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReports();
  }, [activeTab]); 

  // 2. Load canonical Brands
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/proxy/brands/canonical');
        const data = await res.json();
        if (res.ok) setBrands(data);
      } catch {}
    })();
  }, []);

  // 3. Load canonical Models whenever a Brand is selected
  useEffect(() => {
    async function loadModels() {
      if (!reportForm.brandId || reportForm.showCustomBrand) return setModels([]);
      try {
        const brand = brands.find(b => b.id === reportForm.brandId);
        if (!brand) return;
        const res = await fetch(`/api/proxy/brands/${brand.slug}`);
        const data = await res.json();
        if (res.ok) setModels(data?.models || []);
      } catch {}
    }
    loadModels();
  }, [reportForm.brandId, reportForm.showCustomBrand, brands]);

  // 3.5 Handle deep-linking via query params
  useEffect(() => {
    const tab = searchParams.get('tab');
    const type = searchParams.get('type');

    if (tab === 'report') setActiveTab('report');
    if (type === 'lost' || type === 'found' || type === 'stolen') {
      setReportForm(prev => ({ ...prev, incidentType: type as any }));
    }
  }, [searchParams]);

  // 4. City Autocomplete Hook
  useEffect(() => {
    const controller = new AbortController();
    const handler = setTimeout(async () => {
      if (cityQuery.length < 2) return setCities([]);
      try {
        const url = `/api/proxy/search/autocomplete/cities?q=${encodeURIComponent(cityQuery)}&limit=5${countryCode ? `&country=${countryCode}` : ''}`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        if (res.ok) setCities(data?.cities || []);
      } catch {}
    }, 250);
    return () => { controller.abort(); clearTimeout(handler); };
  }, [cityQuery, countryCode]);

  // Unified Search Filter
  const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const filteredReports = reports.filter(report => {
    if (searchTerms.length === 0) return true;
    return searchTerms.every(term => 
      report.title?.toLowerCase().includes(term) ||
      report.description?.toLowerCase().includes(term) ||
      report.brand?.name?.toLowerCase().includes(term) ||
      report.model?.name?.toLowerCase().includes(term) ||
      report.city?.displayName?.toLowerCase().includes(term)
    );
  });

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authed) {
      toast.error('Please log in to submit a report');
      router.push('/auth/signin?next=/lost-stolen');
      return;
    }

    const hasValidBrand = reportForm.showCustomBrand ? (reportForm.customBrand.trim().length > 0) : !!reportForm.brandId;
    const hasValidModel = reportForm.showCustomModel ? (reportForm.customModel.trim().length > 0) : !!reportForm.modelId;

    if (!reportForm.title || !reportForm.description || !hasValidBrand || !hasValidModel || !reportForm.cityId) {
      toast.error('Please fill in required fields');
      return;
    }

    // Merge the custom Lost fields into the core description safely
    const isFound = reportForm.incidentType === 'found';
    const incidentLabel = isFound ? 'DISCOVERY' : `${reportForm.incidentType.toUpperCase()} ITEM`;
    const labelDate = isFound ? 'FOUND ON' : 'DATE/TIME';
    const labelLoc = isFound ? 'FOUND AT' : 'LAST SEEN NEAR';

    const formattedDescription = `🚨 STATUS: ${incidentLabel}\n${reportForm.rewardAmount && !isFound ? `💰 REWARD: ${reportForm.currency} ${reportForm.rewardAmount}\n` : ''}${labelDate}: ${reportForm.lastSeenDate.replace('T', ' ')}\n${labelLoc}: ${cityQuery}${reportForm.address ? ` (${reportForm.address})` : ''}\n=====================\n\n${reportForm.description}${reportForm.contactEmail ? `\n\n📧 CONTACT: ${reportForm.contactEmail}` : ''}`;

    // Natively structure for Database Listing mapping
    const payload = {
      title: `${isFound ? '[FOUND]' : '[LOST]'} ${reportForm.title}`,
      description: formattedDescription,
      type: reportForm.type,
      condition: isFound ? 'GOOD' : 'FAIR', 
      price: 0, 
      currency: reportForm.currency,
      brandId: reportForm.showCustomBrand ? undefined : reportForm.brandId,
      modelId: reportForm.showCustomModel ? undefined : reportForm.modelId,
      customBrand: reportForm.showCustomBrand ? reportForm.customBrand : undefined,
      customModel: reportForm.showCustomModel ? reportForm.customModel : undefined,
      cityId: reportForm.cityId,
      latitude: reportForm.latitude,
      longitude: reportForm.longitude,
      hideExactLocation: true,
      
      // The Engine: 
      // LOST items = BUYING (I want this item)
      // FOUND items = SELLING (I have this item)
      primaryIntent: isFound ? 'SELLING' : 'BUYING',

      // Matrix inference
      needsLeftEarbud: !isFound && (reportForm.type === 'EARBUD_LEFT' || reportForm.type === 'EARBUD_PAIR' || reportForm.type === 'FULL_SET'),
      needsRightEarbud: !isFound && (reportForm.type === 'EARBUD_RIGHT' || reportForm.type === 'EARBUD_PAIR' || reportForm.type === 'FULL_SET'),
      needsChargingCase: !isFound && (reportForm.type === 'CHARGING_CASE' || reportForm.type === 'FULL_SET'),
      hasLeftEarbud: isFound && (reportForm.type === 'EARBUD_LEFT' || reportForm.type === 'EARBUD_PAIR' || reportForm.type === 'FULL_SET'),
      hasRightEarbud: isFound && (reportForm.type === 'EARBUD_RIGHT' || reportForm.type === 'EARBUD_PAIR' || reportForm.type === 'FULL_SET'),
      hasChargingCase: isFound && (reportForm.type === 'CHARGING_CASE' || reportForm.type === 'FULL_SET'),
    };

    try {
      const res = await fetch('/api/proxy/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'API Rejection');
      }
      
      // Success! Reset form.
      toast.success('Report submitted and indexed securely!');
      setReportForm({
        title: '', description: '', brandId: '', modelId: '', 
        customBrand: '', customModel: '', showCustomBrand: false, showCustomModel: false,
        type: 'EARBUD_LEFT',
        cityId: '', lastSeenDate: '', rewardAmount: '', currency: 'EUR', contactEmail: '', address: '',
        latitude: undefined, longitude: undefined, incidentType: 'lost'
      });
      setCityQuery('');
      setActiveTab('search');
    } catch (err: any) {
      console.error('Lost/Found submission failed:', err);
      toast.error(`Failed to submit report: ${err.message || 'Unknown API Error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Lost & Found</h1>
          <p className="text-lg text-gray-600 font-medium tracking-tight">Search for your missing gear or help others reunite with theirs.</p>
          <div className="mt-6">
            <a href="#submission-form" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all inline-flex items-center">
              <PlusIcon className="w-5 h-5 mr-2" /> Post a New Report
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SECTION 1: SEARCH & BROWSE */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <MagnifyingGlassIcon className="w-6 h-6 mr-2 text-blue-600" /> Discover Reports
            </h2>
            <div className="text-sm text-gray-500">{reports.length} registry entries found</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search live DB by brand, model, city..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Syncing registry results...</p>
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredReports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{report.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Brand/Model:</span>
                          <p className="text-gray-600">{report.brand?.name} {report.model?.name}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Date Posted:</span>
                          <p className="text-gray-600">{new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Location:</span>
                          <p className="text-gray-600 flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" /> {report.city?.displayName}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${report.primaryIntent === 'SELLING' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {report.primaryIntent === 'SELLING' ? 'FOUND ITEM' : 'LOST ITEM'}
                      </span>
                      <button onClick={() => router.push(`/listings/${report.id}`)} className="mt-3 block w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No matches found</h3>
              <p className="text-gray-600">Try broadening your search or register a new report below.</p>
            </div>
          )}
        </section>

        {/* SECTION 2: REPORT FORM */}
        <section id="submission-form" className="mt-16">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <PlusIcon className="w-6 h-6 mr-2 text-green-600" /> New Registry Submission
            </h2>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-t-green-600">
            <form onSubmit={handleSubmitReport} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Item Type *</label>
                  <select value={reportForm.type} onChange={(e) => setReportForm({...reportForm, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                    {LISTING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Incident Category</label>
                  <select value={reportForm.incidentType} onChange={(e) => setReportForm({...reportForm, incidentType: e.target.value as 'lost'|'stolen'|'found'})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="lost">Lost / Stolen Item</option>
                    <option value="found">Found Item</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input type="text" value={reportForm.title} onChange={(e) => setReportForm({...reportForm, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description / Circumstances *</label>
                <textarea 
                  value={reportForm.description} 
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})} 
                  rows={3} 
                  placeholder={reportForm.incidentType === 'found' ? "Where and how did you find it? Add details to help the owner identify it." : "Describe how and where the item was lost..."}
                  className="w-full px-3 py-2 border rounded-lg" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Brand *</label>
                  <select 
                    value={reportForm.showCustomBrand ? 'custom' : reportForm.brandId} 
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setReportForm({...reportForm, showCustomBrand: true, brandId: '', modelId: '', showCustomModel: false, customModel: ''});
                      } else {
                        setReportForm({...reportForm, showCustomBrand: false, brandId: e.target.value, customBrand: ''});
                      }
                    }} 
                    className="w-full px-3 py-2 border rounded-lg" 
                    required
                  >
                    <option value="">Select canonical brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    <option value="custom">➕ Other/New Brand</option>
                  </select>
                  {reportForm.showCustomBrand && (
                    <input
                      className="input input-bordered w-full mt-2"
                      placeholder="Enter brand name…"
                      value={reportForm.customBrand}
                      onChange={(e) => setReportForm({...reportForm, customBrand: e.target.value})}
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Model *</label>
                  <select 
                    value={reportForm.showCustomModel ? 'custom' : reportForm.modelId} 
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setReportForm({...reportForm, showCustomModel: true, modelId: '', customModel: ''});
                      } else {
                        setReportForm({...reportForm, showCustomModel: false, modelId: e.target.value, customModel: ''});
                      }
                    }} 
                    className="w-full px-3 py-2 border rounded-lg" 
                    disabled={!reportForm.brandId && !reportForm.showCustomBrand}
                    required
                  >
                    <option value="">
                      {reportForm.showCustomBrand ? (reportForm.customBrand.trim() ? "Select model" : "Enter brand first") : 
                       reportForm.brandId ? "Select canonical model" : "Pick brand first"}
                    </option>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    <option value="custom">➕ Other/New Model</option>
                  </select>
                  {reportForm.showCustomModel && (
                    <input
                      className="input input-bordered w-full mt-2"
                      placeholder="Enter model name…"
                      value={reportForm.customModel}
                      onChange={(e) => setReportForm({...reportForm, customModel: e.target.value})}
                      required
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-1">
                  <label className="block text-sm font-medium mb-2">{reportForm.incidentType === 'found' ? 'Found in City *' : 'Last Seen City *'}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select 
                      className="select select-bordered w-full px-2" 
                      value={countryCode} 
                      onChange={(e) => { 
                        setCountryCode(e.target.value);
                        setCityQuery('');
                        setReportForm({...reportForm, cityId: ''});
                        setCities([]);
                      }}
                    >
                      <option value="">All</option>
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </select>
                    <div className="col-span-2">
                      <input type="text" value={cityQuery} onChange={(e) => setCityQuery(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Start typing city..." />
                    </div>
                  </div>
                  
                  {cityQuery.length >= 2 && (
                    <div 
                      className={`mt-2 p-3 rounded-lg border cursor-pointer hover:bg-blue-50 transition-all duration-200 flex items-center justify-between ${reportForm.cityId === `name:${cityQuery}` ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                      onClick={() => setReportForm({ ...reportForm, cityId: `name:${cityQuery}` })}
                    >
                      <div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">Manual Location</p>
                        <span className="text-sm font-medium text-gray-900">{cityQuery} {countryCode ? `(${countryCode})` : ''}</span>
                      </div>
                      {reportForm.cityId === `name:${cityQuery}` ? (
                        <div className="bg-blue-600 text-white rounded-full p-1"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                      ) : (
                        <span className="text-xs text-gray-400">Click to use</span>
                      )}
                    </div>
                  )}

                  {cities.length > 0 && (
                    <ul className="mt-2 max-h-40 overflow-auto border rounded-lg bg-white shadow-sm">
                      {cities.map(c => (
                        <li key={c.id} onClick={() => { setReportForm({ ...reportForm, cityId: c.id }); setCityQuery(c.displayName); }} className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${reportForm.cityId === c.id ? 'bg-blue-50' : ''}`}>
                          <span className="text-sm">{c.displayName}</span>
                          {reportForm.cityId === c.id && <div className="h-2 w-2 bg-blue-600 rounded-full"></div>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{reportForm.incidentType === 'found' ? 'Date & Time Found *' : 'Date & Time Lost *'}</label>
                  <input type="datetime-local" value={reportForm.lastSeenDate} onChange={(e) => setReportForm({...reportForm, lastSeenDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700">Specific Location / Neighborhood (Optional)</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (!navigator.geolocation) {
                          toast.error('Geolocation is not supported by your browser');
                          return;
                        }
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setReportForm(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                            toast.success('GPS coordinates captured!');
                          },
                          (err) => {
                            toast.error(`Unable to retrieve location: ${err.message}`);
                          }
                        );
                      }}
                      className="text-xs text-blue-600 hover:underline flex items-center font-medium"
                    >
                      <MapPinIcon className="w-3 h-3 mr-1" /> Use current GPS location
                    </button>
                  </div>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input 
                      type="text" 
                      value={reportForm.address} 
                      onChange={(e) => setReportForm(prev => ({ ...prev, address: e.target.value }))} 
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                      placeholder="e.g. Near central station, Rue de la Paix..." 
                    />
                  </div>
                  {reportForm.latitude && (
                    <p className="text-[10px] text-green-600 mt-1 flex items-center italic">
                      ✓ GPS coordinates captured ({reportForm.latitude.toFixed(4)}, {reportForm.longitude?.toFixed(4)})
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Context (Optional)</label>
                  <input type="email" value={reportForm.contactEmail} onChange={(e) => setReportForm({...reportForm, contactEmail: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="email@example.com" />
                  <p className="text-[10px] text-gray-500 mt-1">Users can message you through the app regardless.</p>
                </div>
              </div>

              {reportForm.incidentType !== 'found' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium mb-2">Reward Amount (Optional)</label>
                  <div className="flex gap-2">
                    <select value={reportForm.currency} onChange={(e) => setReportForm({...reportForm, currency: e.target.value})} className="select select-bordered px-2">
                      <option value="EUR">€</option>
                      <option value="USD">$</option>
                      <option value="GBP">£</option>
                    </select>
                    <input type="number" value={reportForm.rewardAmount} onChange={(e) => setReportForm({...reportForm, rewardAmount: e.target.value})} min="0" className="w-full px-3 py-2 border rounded-lg" placeholder="0.00" />
                  </div>
                </div>
              )}

              <button type="submit" className={`px-6 py-3 w-full text-white rounded-lg font-bold transition-all shadow-md active:scale-[0.98] ${reportForm.incidentType === 'found' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {reportForm.incidentType === 'found' ? 'Submit Found Item Report' : 'Submit Lost Report'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
