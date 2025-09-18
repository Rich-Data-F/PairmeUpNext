"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import PhotoUpload, { UploadedPhoto } from '@/components/PhotoUpload';

type Brand = { id: string; name: string; slug: string };
type Model = { id: string; name: string; slug: string };
type City = { id: string; name: string; displayName: string; countryCode: string };

const LISTING_TYPES = [
  { value: 'EARBUD_LEFT', label: 'Left earbud' },
  { value: 'EARBUD_RIGHT', label: 'Right earbud' },
  { value: 'EARBUD_PAIR', label: 'Pair of earbuds' },
  { value: 'CHARGING_CASE', label: 'Charging case' },
  { value: 'ACCESSORIES', label: 'Accessories' },
];

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like new' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'PARTS_ONLY', label: 'For parts' },
];

export default function SellPage() {
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
  const [cityQuery, setCityQuery] = useState('');
  const [cityId, setCityId] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
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
    if (cityId && !/^c[a-z0-9]{24}$/i.test(cityId)) {
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
        const res = await fetch('/api/proxy/brands?limit=100');
        const data = await res.json();
        if (!abort && res.ok) {
          const items = (data?.data || data || []).map((b: any) => ({ id: b.id, name: b.name, slug: b.slug }));
          setBrands(items);
        }
      } catch {}
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
      } catch {}
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
        const res = await fetch(`/api/proxy/search/autocomplete/cities?q=${encodeURIComponent(cityQuery)}&limit=8`, { signal: controller.signal });
        const data = await res.json();
        if (res.ok) setCities(data?.cities || []);
      } catch {}
    }, 250);
    return () => { controller.abort(); clearTimeout(handler); };
  }, [cityQuery]);

  const canSubmit = useMemo(() => {
    const hasValidBrand = showCustomBrand ? (customBrand.trim().length > 0) : !!brandId;
    const hasValidModel = showCustomModel ? (customModel.trim().length > 0) : !!modelId;
    return !!title && !!description && price !== '' && hasValidBrand && hasValidModel && !!cityId && !!type && !!condition;
  }, [title, description, price, brandId, modelId, customBrand, customModel, showCustomBrand, showCustomModel, cityId, type, condition]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
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
        uploadedPhotoUrls = uploadData.map((file: any) => file.url);
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
      };
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
    return <div className="max-w-2xl mx-auto p-6">Checking authentication…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create a listing</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4">
          <div>
            <input className="input input-bordered w-full" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            {formErrors.title && <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>}
          </div>
          
          <div>
            <textarea 
              className="textarea textarea-bordered w-full" 
              placeholder="Description (minimum 20 characters)" 
              value={description} 
              onChange={handleDescriptionChange} 
              required 
            />
            {descriptionError && <p className="text-sm text-red-600 mt-1">{descriptionError}</p>}
            {formErrors.description && <p className="text-sm text-red-600 mt-1">{formErrors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="select select-bordered" value={type} onChange={(e) => setType(e.target.value)}>
              {LISTING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select className="select select-bordered" value={condition} onChange={(e) => setCondition(e.target.value)}>
              {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
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
                <option value="">Select brand…</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                <option value="custom">➕ Other/New Brand</option>
              </select>
              {showCustomBrand && (
                <input 
                  className="input input-bordered w-full mt-2" 
                  placeholder="Enter brand name…" 
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
                  {showCustomBrand ? (customBrand.trim() ? 'Select model…' : 'Enter brand first') : 
                   brandId ? 'Select model…' : 'Pick brand first'}
                </option>
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                <option value="custom">➕ Other/New Model</option>
              </select>
              {showCustomModel && (
                <input 
                  className="input input-bordered w-full mt-2" 
                  placeholder="Enter model name…" 
                  value={customModel} 
                  onChange={(e) => setCustomModel(e.target.value)} 
                  required 
                />
              )}
              {formErrors.model && <p className="text-sm text-red-600 mt-1">{formErrors.model}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input className="input input-bordered w-full" placeholder="Start typing your city…" value={cityQuery} onChange={(e) => setCityQuery(e.target.value)} />
            {cities.length > 0 && (
              <ul className="mt-2 max-h-48 overflow-auto border rounded-md">
                {cities.map(c => (
                  <li key={c.id} className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${cityId === c.id ? 'bg-blue-50' : ''}`}
                      onClick={() => { setCityId(c.id); setCityQuery(c.displayName); }}>
                    {c.displayName}
                  </li>
                ))}
              </ul>
            )}
            <input type="hidden" value={cityId} />
            {formErrors.city && <p className="text-sm text-red-600 mt-1">{formErrors.city}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3 items-center">
            <div>
              <input type="number" className="input input-bordered" placeholder="Price" value={price}
                     onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} min={0} step="0.01" required />
              {formErrors.price && <p className="text-sm text-red-600 mt-1">{formErrors.price}</p>}
            </div>
            <select className="select select-bordered" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <input className="input input-bordered" placeholder="Serial/identifier (optional)" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
          </div>
          <textarea className="textarea textarea-bordered w-full" placeholder="Seller notes (optional)" value={sellerNotes} onChange={(e) => setSellerNotes(e.target.value)} />
        </div>

        {/* Photo Upload Section */}
        <div className="border-t pt-6">
          <PhotoUpload
            onPhotosChange={setPhotos}
            maxPhotos={3}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary" disabled={loading || !canSubmit}>
          {loading ? 'Posting…' : 'Post listing'}
        </button>
      </form>
    </div>
  );
}
