"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SellPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Require authentication: if not logged in, redirect to signin
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/proxy/auth/profile', { cache: 'no-store' });
        if (!res.ok) {
          // Not authenticated: send to sign in and come back
          router.replace('/auth/signin?next=/sell');
        }
      } catch {
        // On network error, still push to signin
        if (isMounted) router.replace('/auth/signin?next=/sell');
      }
    })();
    return () => { isMounted = false };
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, price: Number(price), currency }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to create listing. Are you signed in?');
      } else {
        router.push(`/listings/${data.id}`);
      }
    } catch (e) {
      setError('Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Sell an item</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="input input-bordered w-full"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div className="flex gap-3">
          <input
            type="number"
            className="input input-bordered w-full"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
            min={0}
            step="0.01"
            required
          />
          <select className="select select-bordered" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Posting…' : 'Post listing'}
        </button>
      </form>
    </div>
  );
}
