"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SignInPage() {
  const t = useTranslations('auth')
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSupport, setShowSupport] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Login failed');
      } else {
        router.refresh();
        router.push('/');
      }
    } catch (err) {
      setError('Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const onSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportLoading(true);
    try {
      const res = await fetch('/api/proxy/support/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'credentials_issue', message: supportMessage }),
      });
      if (res.ok) {
        setSupportSuccess(true);
        setSupportMessage('');
      } else {
        alert('Failed to send support request');
      }
    } catch {
      alert('Unexpected error');
    } finally {
      setSupportLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{t('signIn')}</h1>
          <p className="text-gray-500 mt-2">{t('signInSubtitle')}</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            className="input input-bordered w-full"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>
        <div className="text-center space-y-2">
          <a href="/auth/reset" className="text-sm text-blue-600 hover:underline">
            {t('forgotPassword')}
          </a>
          <div>
            <button onClick={() => setShowSupport(!showSupport)} className="text-sm text-blue-600 hover:underline">
              {t('needHelp')}
            </button>
          </div>
          <div>
            <a href="https://hubspot.com" className="text-sm text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {t('contactSupport')}
            </a>
          </div>
        </div>
        {showSupport && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">{t('requestSupport')}</h3>
            {supportSuccess ? (
              <p className="text-green-600">{t('supportSent')}</p>
            ) : (
              <form onSubmit={onSupportSubmit} className="space-y-2">
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder={t('describeProblem')}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  required
                />
                <button className="btn btn-secondary" disabled={supportLoading}>
                  {supportLoading ? t('sending') : t('sendRequest')}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
