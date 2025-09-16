"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

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
  const [serialNumber, setSerialNumber] = useState('');
  const [sellerNotes, setSellerNotes] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [cityId, setCityId] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Gate: must be authenticated
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/proxy/auth/profile', { cache: 'no-store' });
        if (!mounted) return;
        if (!res.ok) {
          setAuthed(false);
          router.replace('/auth/signin?next=/sell');
        } else {
          setAuthed(true);
        }
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
      if (!brandId) { setModels([]); setModelId(''); return; }
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
    return !!title && !!description && price !== '' && !!brandId && !!modelId && !!cityId && !!type && !!condition;
  }, [title, description, price, brandId, modelId, cityId, type, condition]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        title,
        description,
        type,
        condition,
        price: Number(price),
        currency,
        brandId,
        modelId,
        cityId,
        serialNumber: serialNumber || undefined,
        sellerNotes: sellerNotes || undefined,
        hideExactLocation: true,
        images: [],
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
          <input className="input input-bordered w-full" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className="textarea textarea-bordered w-full" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <select className="select select-bordered" value={type} onChange={(e) => setType(e.target.value)}>
              {LISTING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select className="select select-bordered" value={condition} onChange={(e) => setCondition(e.target.value)}>
              {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="select select-bordered" value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
              <option value="">Select brand…</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select className="select select-bordered" value={modelId} onChange={(e) => setModelId(e.target.value)} required disabled={!brandId || models.length === 0}>
              <option value="">{brandId ? 'Select model…' : 'Pick brand first'}</option>
              {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
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
          </div>
          <div className="grid grid-cols-3 gap-3 items-center">
            <input type="number" className="input input-bordered" placeholder="Price" value={price}
                   onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} min={0} step="0.01" required />
            <select className="select select-bordered" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <input className="input input-bordered" placeholder="Serial/identifier (optional)" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
          </div>
          <textarea className="textarea textarea-bordered w-full" placeholder="Seller notes (optional)" value={sellerNotes} onChange={(e) => setSellerNotes(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary" disabled={loading || !canSubmit}>
          {loading ? 'Posting…' : 'Post listing'}
        </button>
      </form>
    </div>
  );
}
