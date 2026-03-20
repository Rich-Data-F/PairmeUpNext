"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignOutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/proxy/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (e) {
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Sign out</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn btn-primary" onClick={doLogout} disabled={loading}>
          {loading ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}
