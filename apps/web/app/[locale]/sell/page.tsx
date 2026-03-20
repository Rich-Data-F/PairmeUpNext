"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import PhotoUpload, { UploadedPhoto } from '@/components/PhotoUpload';
import { useTranslations } from 'next-intl';

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

export default function SellPage() {
  const t = useTranslations('sell')
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
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
  
  // Advanced Matrix: Trading & Availability preferences 
  const [primaryIntent, setPrimaryIntent] = useState<'SELLING' | 'BUYING' | 'TRADING'>('SELLING');
  const [openToAlternate, setOpenToAlternate] = useState(false);
  
  // Exclusivity States: HAVE, NEED, or N/A
  const [leftEarbudStatus, setLeftEarbudStatus] = useState<'HAVE' | 'NEED' | 'NONE'>('NONE');
  const [rightEarbudStatus, setRightEarbudStatus] = useState<'HAVE' | 'NEED' | 'NONE'>('NONE');
  const [chargingCaseStatus, setChargingCaseStatus] = useState<'HAVE' | 'NEED' | 'NONE'>('NONE');

  const [cityQuery, setCityQuery] = useState('');
  const [countryCode, setCountryCode] = useState('FR'); // Default to France as requested?
  const [cityId, setCityId] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Description validation
  const validateDescription = (value: string) => {
    if (value.length < 20) {
      setDescriptionError(`Description must be at least 20 characters (currently ${value.length})`);
      return false;
    }
    setDescriptionError(null);
    return true;
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    validateDescription(value);
  };

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    else if (description.length < 20) errors.description = 'Description must be at least 20 characters';
    if (price === '' || price <= 0) errors.price = 'Valid price is required';

    const hasValidBrand = showCustomBrand ? (customBrand.trim().length > 0) : !!brandId;
    const hasValidModel = showCustomModel ? (customModel.trim().length > 0) : !!modelId;

    if (!hasValidBrand) errors.brand = 'Please select a brand or enter a custom brand';
    if (!hasValidModel) errors.model = 'Please select a model or enter a custom model';
    if (!cityId) errors.city = 'Please select a city';

    // CUID validation for brands, models, and cities (Prisma CUID format)
    if (brandId && !/^c[a-z0-9]{24}$/i.test(brandId)) {
      errors.brand = 'Invalid brand selection';
    }
    if (modelId && !/^c[a-z0-9]{24}$/i.test(modelId)) {
      errors.model = 'Invalid model selection';
    }
    if (cityId && !/^c[a-z0-9]{24}$/i.test(cityId) && !/^\d+$/.test(cityId) && !cityId.startsWith('name:') && !cityId.startsWith('temp:')) {
      errors.city = 'Invalid city selection';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check authentication
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/proxy/auth/profile', { cache: 'no-store' });
        if (!mounted) return;
        if (!res.ok) {
          setAuthed(false);
          router.replace('/auth/signin?next=/sell');
          return;
        }
        const user = await res.json();
        setAuthed(true);
      } catch {
        if (mounted) {
          setAuthed(false);
          router.replace('/auth/signin?next=/sell');
        }
      }
    })();
    return () => { mounted = false };
  }, [router]);

  // Load brands list
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await fetch('/api/proxy/brands/canonical');
        const data = await res.json();
        if (!abort && res.ok) {
          const items = (data || []).map((b: any) => ({ id: b.id, name: b.name, slug: b.slug }));
          setBrands(items);
        } else if (!abort) {
          console.error('Failed to load brands', data);
          setBrandsError('Failed to load brands. Please try again later.');
        }
      } catch (err: any) {
        console.error('Error fetching brands', err);
        if (!abort) setBrandsError('Failed to load brands. Please try again later.');
      }
    })();
    return () => { abort = true };
  }, []);

  // Load models when brand changes
  useEffect(() => {
    let abort = false;
    async function loadModels() {
      if (!brandId || brandId === 'custom') {
        setModels([]);
        setModelId('');
        setShowCustomModel(false);
        return;
      }
      try {
        // fetch brand details that include models
        const brand = brands.find(b => b.id === brandId);
        const slug = brand?.slug || '';
        if (!slug) return;
        const res = await fetch(`/api/proxy/brands/${slug}`);
        const data = await res.json();
        if (!abort && res.ok) {
          const ms = (data?.models || []).map((m: any) => ({ id: m.id, name: m.name, slug: m.slug }));
          setModels(ms);
        }
      } catch { }
    }
    loadModels();
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

  // Synchronize Primary Category 'type' and 'intent' automatically with the Matrix
  useEffect(() => {
    const baseAction = primaryIntent === 'BUYING' ? 'NEED' : 'HAVE';
    // Automatically map the matrix selections
    if (type === 'FULL_SET') {
      setLeftEarbudStatus(baseAction);
      setRightEarbudStatus(baseAction);
      setChargingCaseStatus(baseAction);
    } else if (type === 'EARBUD_PAIR') {
      setLeftEarbudStatus(baseAction);
      setRightEarbudStatus(baseAction);
      setChargingCaseStatus('NONE'); // Ensure case is skipped
    } else if (type === 'EARBUD_LEFT') {
      setLeftEarbudStatus(baseAction);
      setRightEarbudStatus('NONE');
      setChargingCaseStatus('NONE');
    } else if (type === 'EARBUD_RIGHT') {
      setRightEarbudStatus(baseAction);
      setLeftEarbudStatus('NONE');
      setChargingCaseStatus('NONE');
    } else if (type === 'CHARGING_CASE') {
      setChargingCaseStatus(baseAction);
      setLeftEarbudStatus('NONE');
      setRightEarbudStatus('NONE');
    } else if (type === 'ACCESSORIES') {
      setLeftEarbudStatus('NONE');
      setRightEarbudStatus('NONE');
      setChargingCaseStatus('NONE');
    }
  }, [type, primaryIntent]);

  const canSubmit = useMemo(() => {
    const hasValidBrand = showCustomBrand ? (customBrand.trim().length > 0) : !!brandId;
    const hasValidModel = showCustomModel ? (customModel.trim().length > 0) : !!modelId;
    const hasValidPrice = price !== '' && (Number(price) >= 0);
    const hasValidDescription = !!description && description.length >= 20;

    return !!title && hasValidDescription && hasValidPrice && hasValidBrand && hasValidModel && !!cityId && !!type && !!condition;
  }, [title, description, price, brandId, modelId, customBrand, customModel, showCustomBrand, showCustomModel, cityId, type, condition, primaryIntent]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      setError('Please correct the errors in the form before submitting.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // First, upload photos if any
      let uploadedPhotoUrls: string[] = [];
      if (photos.length > 0) {
        const formData = new FormData();
        photos.forEach((photo, index) => {
          formData.append('images', photo.file);
        });
        // Send array of sources for each photo
        const sources = photos.map(photo => photo.source);
        formData.append('sources', JSON.stringify(sources));

        const uploadRes = await fetch('/api/proxy/upload/multiple', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json().catch(() => ({}));
          throw new Error(uploadData?.error || 'Failed to upload photos');
        }

        const uploadData = await uploadRes.json();
        console.log('Upload response:', uploadData);
        uploadedPhotoUrls = uploadData.map((file: any) => file.url);
        console.log('Uploaded photo URLs:', uploadedPhotoUrls);
      }

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
        hideExactLocation: true,
        images: uploadedPhotoUrls,
        
        // Trading preferences & Item Needs natively linked to schema
        primaryIntent,
        openToAlternate,
        hasLeftEarbud: leftEarbudStatus === 'HAVE',
        needsLeftEarbud: leftEarbudStatus === 'NEED',
        hasRightEarbud: rightEarbudStatus === 'HAVE',
        needsRightEarbud: rightEarbudStatus === 'NEED',
        hasChargingCase: chargingCaseStatus === 'HAVE',
        needsChargingCase: chargingCaseStatus === 'NEED',
      };
      console.log('Final payload:', payload);
      const res = await fetch('/api/proxy/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.message || 'Failed to create listing.');
      } else {
        router.push(`/listings/${data.id}`);
      }
    } catch (e: any) {
      setError(e?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  if (authed === null) {
    return <div className="max-w-2xl mx-auto p-6">{t('checkingAuth')}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">{t('createListing')}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4">
          <div>
            <input className="input input-bordered w-full" placeholder={t('titlePlaceholder')} value={title} onChange={(e) => setTitle(e.target.value)} required />
            {formErrors.title && <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>}
          </div>

          <div>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder={t('descriptionPlaceholder')}
              value={description}
              onChange={handleDescriptionChange}
              required
            />
            {descriptionError && <p className="text-sm text-red-600 mt-1">{descriptionError}</p>}
            {formErrors.description && <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="select select-bordered" value={type} onChange={(e) => setType(e.target.value)}>
              {LISTING_TYPES.map(lt => <option key={lt.value} value={lt.value}>{t(lt.labelKey as any)}</option>)}
            </select>
            <select className="select select-bordered" value={condition} onChange={(e) => setCondition(e.target.value)}>
              {CONDITIONS.map(c => <option key={c.value} value={c.value}>{t(c.labelKey as any)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <select
                className="select select-bordered w-full"
                value={showCustomBrand ? 'custom' : brandId}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setShowCustomBrand(true);
                    setBrandId('');
                    setModelId('');
                    setShowCustomModel(false);
                    setCustomModel('');
                  } else {
                    setShowCustomBrand(false);
                    setBrandId(e.target.value);
                    setCustomBrand('');
                  }
                }}
                required
              >
                <option value="">{t('selectBrand')}</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                {brands.length === 0 && !brandsError && (
                  <option disabled>{t('loadingBrands')}</option>
                )}
                <option value="custom">➕ {t('otherBrand')}</option>
              </select>
              {brandsError && <p className="text-sm text-red-600 mt-1">{brandsError}</p>}
              {showCustomBrand && (
                <input
                  className="input input-bordered w-full mt-2"
                  placeholder={t('enterBrandName')}
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  required
                />
              )}
              {formErrors.brand && <p className="text-sm text-red-600 mt-1">{formErrors.brand}</p>}
            </div>
            <div>
              <select
                className="select select-bordered w-full"
                value={showCustomModel ? 'custom' : modelId}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setShowCustomModel(true);
                    setModelId('');
                    setCustomModel('');
                  } else {
                    setShowCustomModel(false);
                    setModelId(e.target.value);
                    setCustomModel('');
                  }
                }}
                required
                disabled={showCustomBrand && !customBrand.trim()}
              >
                <option value="">
                  {showCustomBrand ? (customBrand.trim() ? t('selectModel') : t('enterBrandFirst')) :
                    brandId ? t('selectModel') : t('pickBrandFirst')}
                </option>
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                <option value="custom">➕ {t('otherModel')}</option>
              </select>
              {showCustomModel && (
                <input
                  className="input input-bordered w-full mt-2"
                  placeholder={t('enterModelName')}
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  required
                />
              )}
              {formErrors.model && <p className="text-sm text-red-600 mt-1">{formErrors.model}</p>}
            </div>
          </div>

          {/* Advanced Match Matrix - Intent / Action Selection */}
          <div className="bg-gray-100 p-5 rounded-lg space-y-5 border border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t('listingIntent')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button type="button" onClick={() => setPrimaryIntent('SELLING')} className={`btn ${primaryIntent === 'SELLING' ? 'btn-primary' : 'btn-outline bg-white'}`}>{t('intentSell')}</button>
                <button type="button" onClick={() => setPrimaryIntent('BUYING')} className={`btn ${primaryIntent === 'BUYING' ? 'btn-primary' : 'btn-outline bg-white'}`}>{t('intentBuy')}</button>
                <button type="button" onClick={() => setPrimaryIntent('TRADING')} className={`btn ${primaryIntent === 'TRADING' ? 'btn-primary' : 'btn-outline bg-white'}`}>{t('intentTrade')}</button>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-3">
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t('matrixLabel')}</label>
              
              <div className="bg-white rounded shadow-sm border border-gray-200 divide-y divide-gray-100">
                {/* Left Earbud */}
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm font-medium w-1/3">{t('leftEarbud')}</span>
                  <div className="flex space-x-3 w-2/3 justify-end">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name="leftEarbud" className="radio radio-sm radio-primary" checked={leftEarbudStatus === 'HAVE'} onChange={() => setLeftEarbudStatus('HAVE')} />
                      <span className="text-sm">{t('iHaveIt')}</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name="leftEarbud" className="radio radio-sm radio-secondary" checked={leftEarbudStatus === 'NEED'} onChange={() => setLeftEarbudStatus('NEED')} />
                      <span className="text-sm">{t('iNeedIt')}</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer text-gray-500">
                      <input type="radio" name="leftEarbud" className="radio radio-sm" checked={leftEarbudStatus === 'NONE'} onChange={() => setLeftEarbudStatus('NONE')} />
                      <span className="text-sm">{t('na')}</span>
                    </label>
                  </div>
                </div>

                {/* Right Earbud */}
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm font-medium w-1/3">{t('rightEarbud')}</span>
                  <div className="flex space-x-3 w-2/3 justify-end">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name="rightEarbud" className="radio radio-sm radio-primary" checked={rightEarbudStatus === 'HAVE'} onChange={() => setRightEarbudStatus('HAVE')} />
                      <span className="text-sm">{t('iHaveIt')}</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name="rightEarbud" className="radio radio-sm radio-secondary" checked={rightEarbudStatus === 'NEED'} onChange={() => setRightEarbudStatus('NEED')} />
                      <span className="text-sm">{t('iNeedIt')}</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer text-gray-500">
                      <input type="radio" name="rightEarbud" className="radio radio-sm" checked={rightEarbudStatus === 'NONE'} onChange={() => setRightEarbudStatus('NONE')} />
                      <span className="text-sm">{t('na')}</span>
                    </label>
                  </div>
                </div>

                {/* Charging Case */}
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm font-medium w-1/3">{t('chargingCase')}</span>
                  <div className="flex space-x-3 w-2/3 justify-end">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name="chargingCase" className="radio radio-sm radio-primary" checked={chargingCaseStatus === 'HAVE'} onChange={() => setChargingCaseStatus('HAVE')} />
                      <span className="text-sm">{t('iHaveIt')}</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input type="radio" name="chargingCase" className="radio radio-sm radio-secondary" checked={chargingCaseStatus === 'NEED'} onChange={() => setChargingCaseStatus('NEED')} />
                      <span className="text-sm">{t('iNeedIt')}</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer text-gray-500">
                      <input type="radio" name="chargingCase" className="radio radio-sm" checked={chargingCaseStatus === 'NONE'} onChange={() => setChargingCaseStatus('NONE')} />
                      <span className="text-sm">{t('na')}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-primary" checked={openToAlternate} onChange={(e) => setOpenToAlternate(e.target.checked)} />
                <span className="text-sm font-medium text-blue-900">{t('flexibleLabel')}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('location')}</label>
            <div className="grid grid-cols-3 gap-3">
              <select 
                className="select select-bordered w-full" 
                value={countryCode} 
                onChange={(e) => { 
                  setCountryCode(e.target.value);
                  setCityQuery('');
                  setCityId('');
                  setCities([]);
                }}
              >
                <option value="">{t('allCountries')}</option>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
              <div className="col-span-2">
                <input className="input input-bordered w-full" placeholder={t('cityPlaceholder')} value={cityQuery} onChange={(e) => setCityQuery(e.target.value)} />
              </div>
            </div>
            
            {/* Fallback for unrecognized cities */}
            {cityQuery.length >= 2 && (
              <div 
                className={`mt-2 p-3 rounded-lg border cursor-pointer hover:bg-blue-50 transition-all duration-200 flex items-center justify-between ${cityId === `name:${cityQuery}` ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                onClick={() => { setCityId(`name:${cityQuery}`); setCityQuery(cityQuery); }}
              >
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">Manual Location</p>
                  <span className="text-sm font-medium text-gray-900">{cityQuery} {countryCode ? `(${countryCode})` : ''}</span>
                </div>
                {cityId === `name:${cityQuery}` ? (
                  <div className="bg-blue-600 text-white rounded-full p-1"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                ) : (
                  <span className="text-xs text-gray-400">Click to use</span>
                )}
              </div>
            )}

            {cities.length > 0 && (
              <ul className="mt-2 max-h-48 overflow-auto border rounded-md bg-white shadow-sm">
                {cities.map(c => (
                  <li key={c.id} className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${cityId === c.id ? 'bg-blue-50' : ''}`}
                    onClick={() => { setCityId(c.id); setCityQuery(c.displayName); }}>
                    <span className="text-sm">{c.displayName}</span>
                    {cityId === c.id && <div className="h-2 w-2 bg-blue-600 rounded-full"></div>}
                  </li>
                ))}
              </ul>
            )}
            <input type="hidden" value={cityId} />
            {formErrors.city && <p className="text-sm text-red-600 mt-1">{formErrors.city}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3 items-center">
            <div>
              <input type="number" className="input input-bordered" placeholder={t('price')} value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} min={0} step="0.01" required />
              {formErrors.price && <p className="text-sm text-red-600 mt-1">{formErrors.price}</p>}
            </div>
            <select className="select select-bordered" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <input className="input input-bordered" placeholder={t('serialNumber')} value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
          </div>
          <textarea className="textarea textarea-bordered w-full" placeholder={t('sellerNotes')} value={sellerNotes} onChange={(e) => setSellerNotes(e.target.value)} />
        </div>

        {/* Photo Upload Section */}
        <div className="border-t pt-6">
          <PhotoUpload
            onPhotosChange={setPhotos}
            maxPhotos={3}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="pt-4">
          <button className="btn btn-primary btn-lg w-full text-lg shadow-md hover:shadow-lg transition-all duration-300" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner"></span>
                {t('posting')}
              </span>
            ) : t('postListing')}
          </button>
        </div>
      </form>
    </div>
  );
}
