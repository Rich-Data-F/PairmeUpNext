"use client";
import { useState } from 'react';

export default function PasswordResetPage() {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Request failed');
      } else {
        setResetToken(data.resetToken || '');
        setMessage('Token generated. Copy it below and proceed to reset.');
        setStep('reset');
      }
    } catch (e) {
      setError('Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Reset failed');
      } else {
        setMessage('Password reset successful. You can now sign in.');
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
          <h1 className="text-2xl font-semibold">Password reset</h1>
          <p className="text-gray-500 mt-2">No email needed. Generate a token, then use it to set a new password.</p>
        </div>
        {step === 'request' ? (
          <form onSubmit={requestToken} className="space-y-4">
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}
            <button className="w-full btn btn-primary" disabled={loading}>
              {loading ? 'Requesting…' : 'Request token'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Reset token</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Reset token"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
              />
            </div>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}
            <button className="w-full btn btn-primary" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
