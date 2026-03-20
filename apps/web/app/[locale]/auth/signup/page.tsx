"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SignUpPage() {
  const t = useTranslations('auth')
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Registration failed');
      } else {
        router.push('/auth/signin');
      }
    } catch (e) {
      setError('Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{t('createAccount')}</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder={t('namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            className="input input-bordered w-full"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder={t('phonePlaceholder')}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full btn btn-primary" disabled={loading}>
            {loading ? t('creating') : t('createAccount')}
          </button>
        </form>
      </div>
    </div>
  );
}
