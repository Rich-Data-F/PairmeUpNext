'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import PhotoUpload, { UploadedPhoto } from '@/components/PhotoUpload';
import { 
  ExclamationTriangleIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

type Brand = { id: string; name: string; slug: string };
type Model = { id: string; name: string; slug: string };
type City = { id: string; name: string; displayName: string; countryCode: string };

const LISTING_TYPES = [
  { value: 'EARBUD_LEFT', labelKey: 'types.EARBUD_LEFT' },
  { value: 'EARBUD_RIGHT', labelKey: 'types.EARBUD_RIGHT' },
  { value: 'EARBUD_PAIR', labelKey: 'types.EARBUD_PAIR' },
  { value: 'CHARGING_CASE', labelKey: 'types.CHARGING_CASE' },
  { value: 'FULL_SET', labelKey: 'types.FULL_SET' },
  { value: 'ACCESSORIES', labelKey: 'types.ACCESSORIES' },
];

const CONDITIONS = [
  { value: 'NEW', labelKey: 'conditions.NEW' },
  { value: 'LIKE_NEW', labelKey: 'conditions.LIKE_NEW' },
  { value: 'GOOD', labelKey: 'conditions.GOOD' },
  { value: 'FAIR', labelKey: 'conditions.FAIR' },
  { value: 'PARTS_ONLY', labelKey: 'conditions.PARTS_ONLY' },
];

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' }, { code: 'AL', name: 'Albania' }, { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' }, { code: 'AO', name: 'Angola' }, { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' }, { code: 'AM', name: 'Armenia' }, { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' }, { code: 'AZ', name: 'Azerbaijan' }, { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' }, { code: 'BD', name: 'Bangladesh' }, { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' }, { code: 'BE', name: 'Belgium' }, { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' }, { code: 'BT', name: 'Bhutan' }, { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' }, { code: 'BW', name: 'Botswana' }, { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' }, { code: 'BG', name: 'Bulgaria' }, { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' }, { code: 'CV', name: 'Cabo Verde' }, { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' }, { code: 'CA', name: 'Canada' }, { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' }, { code: 'CL', name: 'Chile' }, { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' }, { code: 'KM', name: 'Comoros' }, { code: 'CD', name: 'Congo, Democratic Republic of the' },
  { code: 'CG', name: 'Congo, Republic of the' }, { code: 'CR', name: 'Costa Rica' }, { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'HR', name: 'Croatia' }, { code: 'CU', name: 'Cuba' }, { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czechia' }, { code: 'DK', name: 'Denmark' }, { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' }, { code: 'DO', name: 'Dominican Republic' }, { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' }, { code: 'SV', name: 'El Salvador' }, { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' }, { code: 'EE', name: 'Estonia' }, { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' }, { code: 'FJ', name: 'Fiji' }, { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' }, { code: 'GA', name: 'Gabon' }, { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' }, { code: 'DE', name: 'Germany' }, { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' }, { code: 'GD', name: 'Grenada' }, { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' }, { code: 'GW', name: 'Guinea-Bissau' }, { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' }, { code: 'HN', name: 'Honduras' }, { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' }, { code: 'IN', name: 'India' }, { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' }, { code: 'IQ', name: 'Iraq' }, { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' }, { code: 'IT', name: 'Italy' }, { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' }, { code: 'JO', name: 'Jordan' }, { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' }, { code: 'KI', name: 'Kiribati' }, { code: 'KP', name: 'Korea, North' },
  { code: 'KR', name: 'Korea, South' }, { code: 'KW', name: 'Kuwait' }, { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' }, { code: 'LV', name: 'Latvia' }, { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' }, { code: 'LR', name: 'Liberia' }, { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' }, { code: 'LT', name: 'Lithuania' }, { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' }, { code: 'MW', name: 'Malawi' }, { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' }, { code: 'ML', name: 'Mali' }, { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' }, { code: 'MR', name: 'Mauritania' }, { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' }, { code: 'FM', name: 'Micronesia' }, { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' }, { code: 'MN', name: 'Mongolia' }, { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' }, { code: 'MZ', name: 'Mozambique' }, { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' }, { code: 'NR', name: 'Nauru' }, { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' }, { code: 'NZ', name: 'New Zealand' }, { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' }, { code: 'NG', name: 'Nigeria' }, { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' }, { code: 'OM', name: 'Oman' }, { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' }, { code: 'PA', name: 'Panama' }, { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' }, { code: 'PE', name: 'Peru' }, { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' }, { code: 'PT', name: 'Portugal' }, { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' }, { code: 'RU', name: 'Russia' }, { code: 'RW', name: 'Rwanda' },
  { code: 'KN', name: 'Saint Kitts and Nevis' }, { code: 'LC', name: 'Saint Lucia' }, { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' }, { code: 'SM', name: 'San Marino' }, { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SA', name: 'Saudi Arabia' }, { code: 'SN', name: 'Senegal' }, { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' }, { code: 'SL', name: 'Sierra Leone' }, { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' }, { code: 'SI', name: 'Slovenia' }, { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' }, { code: 'ZA', name: 'South Africa' }, { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' }, { code: 'LK', name: 'Sri Lanka' }, { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' }, { code: 'SE', name: 'Sweden' }, { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' }, { code: 'TW', name: 'Taiwan' }, { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' }, { code: 'TH', name: 'Thailand' }, { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' }, { code: 'TO', name: 'Tonga' }, { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' }, { code: 'TR', name: 'Turkey' }, { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' }, { code: 'UG', name: 'Uganda' }, { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' }, { code: 'GB', name: 'United Kingdom' }, { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' }, { code: 'UZ', name: 'Uzbekistan' }, { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' }, { code: 'VE', name: 'Venezuela' }, { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' }, { code: 'ZM', name: 'Zambia' }, { code: 'ZW', name: 'Zimbabwe' },
];

interface EditListingFormProps {
  listingId: string;
}

export function EditListingForm({ listingId }: EditListingFormProps) {
  const t = useTranslations('sell');
  const tc = useTranslations('common');
  const router = useRouter();

  // Loading and Error States
  const [initialLoading, setInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState('USD');
  const [type, setType] = useState('EARBUD_PAIR');
  const [condition, setCondition] = useState('GOOD');
  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [showCustomModel, setShowCustomModel] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
  const [sellerNotes, setSellerNotes] = useState('');
  
  const [primaryIntent, setPrimaryIntent] = useState<'SELLING' | 'BUYING' | 'TRADING'>('SELLING');
  const [openToAlternate, setOpenToAlternate] = useState(false);
  
  const [leftEarbudStatus, setLeftEarbudStatus] = useState<'HAVE' | 'NEED' | 'NONE'>('NONE');
  const [rightEarbudStatus, setRightEarbudStatus] = useState<'HAVE' | 'NEED' | 'NONE'>('NONE');
  const [chargingCaseStatus, setChargingCaseStatus] = useState<'HAVE' | 'NEED' | 'NONE'>('NONE');

  const [cityQuery, setCityQuery] = useState('');
  const [countryCode, setCountryCode] = useState('FR');
  const [cityId, setCityId] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<UploadedPhoto[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 1. Fetch Initial Data
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setInitialLoading(true);
        // Fetch listing
        const listingRes = await fetch(`/api/proxy/listings/${listingId}`);
        if (!listingRes.ok) throw new Error(tc('errorLoadingListing'));
        const listing = await listingRes.json();

        // Populate fields
        setTitle(listing.title);
        setDescription(listing.description);
        setPrice(parseFloat(listing.price));
        setCurrency(listing.currency);
        setType(listing.type);
        setCondition(listing.condition);
        setBrandId(listing.brand.id);
        setModelId(listing.model.id);
        setSerialNumber(listing.serialNumber || '');
        setSellerNotes(listing.sellerNotes || '');
        setPrimaryIntent(listing.primaryIntent || 'SELLING');
        setOpenToAlternate(listing.openToAlternate || false);
        
        setLeftEarbudStatus(listing.hasLeftEarbud ? 'HAVE' : (listing.needsLeftEarbud ? 'NEED' : 'NONE'));
        setRightEarbudStatus(listing.hasRightEarbud ? 'HAVE' : (listing.needsRightEarbud ? 'NEED' : 'NONE'));
        setChargingCaseStatus(listing.hasChargingCase ? 'HAVE' : (listing.needsChargingCase ? 'NEED' : 'NONE'));

        setCityId(listing.city.id);
        setCityQuery(listing.city.displayName);
        setCountryCode(listing.city.countryCode);
        setExistingImages(listing.images || []);

        // Load brands to find if it was custom (though rarely saved as customId in normalized state)
        const brandsRes = await fetch('/api/proxy/brands/canonical');
        if (brandsRes.ok) {
           const bData = await brandsRes.json();
           setBrands(bData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setInitialLoading(false);
      }
    }
    fetchInitialData();
  }, [listingId, tc]);

  // Load models when brand changes
  useEffect(() => {
    let abort = false;
    async function loadModels() {
      if (!brandId || brandId === 'custom') {
        setModels([]);
        return;
      }
      try {
        const brand = brands.find(b => b.id === brandId);
        const slug = brand?.slug;
        if (!slug) return;
        const res = await fetch(`/api/proxy/brands/${slug}`);
        const data = await res.json();
        if (!abort && res.ok) {
          setModels(data?.models || []);
        }
      } catch { }
    }
    if (brands.length > 0) loadModels();
    return () => { abort = true };
  }, [brandId, brands]);

  // City autocomplete
  useEffect(() => {
    const controller = new AbortController();
    const handler = setTimeout(async () => {
      if (cityQuery.length < 2) { setCities([]); return; }
      try {
        const url = `/api/proxy/search/autocomplete/cities?q=${encodeURIComponent(cityQuery)}&limit=8${countryCode ? `&country=${countryCode}` : ''}`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        if (res.ok) setCities(data?.cities || []);
      } catch { }
    }, 250);
    return () => { controller.abort(); clearTimeout(handler); };
  }, [cityQuery, countryCode]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    else if (description.length < 20) errors.description = 'Description must be at least 20 characters';
    if (price === '' || price < 0) errors.price = 'Valid price is required (0 for Lost/Found reports)';
    if (!brandId && !showCustomBrand) errors.brand = 'Brand is required';
    if (!modelId && !showCustomModel) errors.model = 'Model is required';
    if (!cityId) errors.city = 'City is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsUpdating(true);
    setError(null);

    try {
      // 1. Upload new photos if any
      let uploadedPhotoUrls: string[] = [];
      if (newPhotos.length > 0) {
        const formData = new FormData();
        newPhotos.forEach(p => formData.append('images', p.file));
        const sources = newPhotos.map(p => p.source);
        formData.append('sources', JSON.stringify(sources));

        const uploadRes = await fetch('/api/proxy/upload/multiple', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json().catch(() => ({}));
          throw new Error(uploadError?.error || uploadError?.message || 'Photo upload failed');
        }

        const uploadData = await uploadRes.json();
        console.log('Upload response:', uploadData);
        uploadedPhotoUrls = uploadData.map((file: any) => file.url);
      }

      // 2. Patch listing
      const payload = {
        title,
        description,
        type,
        condition,
        price: Number(price),
        currency,
        brandId: showCustomBrand ? undefined : brandId,
        modelId: showCustomModel ? undefined : modelId,
        customBrand: showCustomBrand ? customBrand : undefined,
        customModel: showCustomModel ? customModel : undefined,
        cityId,
        serialNumber: serialNumber || undefined,
        sellerNotes: sellerNotes || undefined,
        images: [...existingImages, ...uploadedPhotoUrls],
        primaryIntent,
        openToAlternate,
        hasLeftEarbud: leftEarbudStatus === 'HAVE',
        needsLeftEarbud: leftEarbudStatus === 'NEED',
        hasRightEarbud: rightEarbudStatus === 'HAVE',
        needsRightEarbud: rightEarbudStatus === 'NEED',
        hasChargingCase: chargingCaseStatus === 'HAVE',
        needsChargingCase: chargingCaseStatus === 'NEED',
      };

      const res = await fetch(`/api/proxy/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Update failed');
      }

      toast.success(tc('listingUpdated'));
      router.push(`/listings/${listingId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(tc('confirmDelete'))) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/proxy/listings/${listingId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Listing deleted successfully');
      router.push('/listings');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto p-10 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">{tc('loadingListing')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={tc('back')}
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-500" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tc('edit')}</h1>
            <p className="text-gray-500">Update your listing details or registry report.</p>
          </div>
        </div>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="btn btn-outline btn-error gap-2 px-6"
        >
          {isDeleting ? <span className="loading loading-spinner loading-sm"></span> : <TrashIcon className="w-4 h-4" />}
          {tc('delete')}
        </button>
      </div>

      <form onSubmit={handleUpdate} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Info */}
          <div className="space-y-6">
            <div className="card bg-white shadow-sm border p-6 space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                Basic Information
              </h2>
              
              <div>
                <label className="label text-xs font-bold uppercase text-gray-500">{t('titlePlaceholder')}</label>
                <input 
                  className={`input input-bordered w-full ${formErrors.title ? 'input-error' : ''}`} 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
                {formErrors.title && <p className="text-xs text-red-600 mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <label className="label text-xs font-bold uppercase text-gray-500">{t('descriptionPlaceholder')}</label>
                <textarea 
                  className={`textarea textarea-bordered w-full h-32 ${formErrors.description ? 'textarea-error' : ''}`} 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                />
                {formErrors.description && <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs font-bold uppercase text-gray-500">Type</label>
                  <select className="select select-bordered w-full" value={type} onChange={(e) => setType(e.target.value)}>
                    {LISTING_TYPES.map(lt => <option key={lt.value} value={lt.value}>{t(lt.labelKey as any)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs font-bold uppercase text-gray-500">Condition</label>
                  <select className="select select-bordered w-full" value={condition} onChange={(e) => setCondition(e.target.value)}>
                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{t(c.labelKey as any)}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="card bg-white shadow-sm border p-6 space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                Product Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="label text-xs font-bold uppercase text-gray-500">Brand</label>
                  <select className="select select-bordered w-full" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                    <option value="">Select Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs font-bold uppercase text-gray-500">Model</label>
                  <select className="select select-bordered w-full" value={modelId} onChange={(e) => setModelId(e.target.value)}>
                    <option value="">Select Model</option>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label text-xs font-bold uppercase text-gray-500">{t('serialNumber')}</label>
                <input className="input input-bordered w-full" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Pricing & Intent */}
          <div className="space-y-6">
            <div className={`card shadow-sm border p-6 space-y-4 ${price === 0 ? 'bg-orange-50 border-orange-200' : 'bg-white'}`}>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                Pricing & Intent
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs font-bold uppercase text-gray-500">{t('price')}</label>
                  <input 
                    type="number" 
                    className="input input-bordered w-full font-bold text-lg" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} 
                    step="0.01" 
                  />
                </div>
                <div>
                  <label className="label text-xs font-bold uppercase text-gray-500">Currency</label>
                  <select className="select select-bordered w-full" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">Note: Set price to 0 to treat this as a Lost/Found registry item.</p>

              <div className="pt-4">
                <label className="label text-xs font-bold uppercase text-gray-500">{t('listingIntent')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['SELLING', 'BUYING', 'TRADING'] as const).map(intent => (
                    <button 
                      key={intent}
                      type="button" 
                      onClick={() => setPrimaryIntent(intent)} 
                      className={`btn btn-sm ${primaryIntent === intent ? 'btn-primary' : 'btn-outline'}`}
                    >
                      {t(`intent${intent.charAt(0) + intent.slice(1).toLowerCase()}` as any)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card bg-white shadow-sm border p-6 space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                Location
              </h2>
              <div className="flex gap-2">
                <select className="select select-bordered w-24" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
                <div className="relative flex-1">
                  <input className="input input-bordered w-full" value={cityQuery} onChange={(e) => setCityQuery(e.target.value)} placeholder="Type city..." />
                  {cities.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-40 overflow-auto">
                      {cities.map(c => (
                        <li key={c.id} onClick={() => { setCityId(c.id); setCityQuery(c.displayName); setCities([]); }} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">
                          {c.displayName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="card bg-white shadow-sm border p-6 space-y-4">
          <h2 className="text-xl font-semibold">Photos</h2>
          {existingImages.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              {existingImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden group">
                  <img src={img} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <PhotoUpload onPhotosChange={setNewPhotos} maxPhotos={5 - existingImages.length} />
        </div>

        {error && (
          <div className="alert alert-error">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            disabled={isUpdating}
            className="btn btn-primary flex-1 btn-lg text-lg"
          >
            {isUpdating ? <span className="loading loading-spinner"></span> : tc('update')}
          </button>
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="btn btn-ghost btn-lg"
          >
            {tc('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
