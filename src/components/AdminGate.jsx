import React, { useEffect, useState } from 'react';
import { loginAdmin, verifyAdminSession } from '../services/api';

export default function AdminGate({ children }) {
  const [status, setStatus] = useState('checking');
  const [admin, setAdmin] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    verifyAdminSession()
      .then(result => {
        if (!active) return;
        setAdmin(result.valid ? result.admin : null);
        setStatus(result.valid ? 'authorized' : 'signed_out');
        if (result.offline) setError('The owner session could not be verified. Check your connection and try again.');
      })
      .catch(() => {
        if (!active) return;
        setStatus('signed_out');
        setError('The owner session could not be verified. Please try again.');
      });

    return () => { active = false; };
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginAdmin(email.trim().toLowerCase(), password);
      const result = await verifyAdminSession();
      if (!result.valid) throw new Error('The server did not confirm this owner session.');
      setAdmin(result.admin);
      setPassword('');
      setStatus('authorized');
    } catch (err) {
      setError(err?.message || 'Owner sign-in failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'checking') {
    return (
      <div className="min-h-[70vh] grid place-items-center bg-[#FAF9F6] px-5">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#C69F6F] border-t-transparent" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76634E]">Verifying owner session</p>
        </div>
      </div>
    );
  }

  if (status === 'authorized') {
    return typeof children === 'function' ? children(admin) : children;
  }

  return (
    <div className="min-h-[78vh] flex items-center justify-center bg-[#FAF9F6] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#E8E0D5] bg-white p-7 shadow-xl sm:p-9">
        <div className="mb-7 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#9A6E3E]">FOOLISH ARC</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-[#1C1612]">Owner Studio</h1>
          <p className="mt-2 text-sm leading-6 text-[#786D60]">Sign in with the owner credentials configured on the server.</p>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="owner-email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#6D5C4A]">Owner email</label>
            <input
              id="owner-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              className="w-full rounded-xl border border-[#DDD3C5] bg-[#FAF9F6] px-4 py-3 text-sm text-[#1C1612] outline-none transition focus:border-[#9A6E3E] focus:ring-2 focus:ring-[#9A6E3E]/15"
              placeholder="owner@example.com"
            />
          </div>
          <div>
            <label htmlFor="owner-password" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#6D5C4A]">Password</label>
            <input
              id="owner-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[#DDD3C5] bg-[#FAF9F6] px-4 py-3 text-sm text-[#1C1612] outline-none transition focus:border-[#9A6E3E] focus:ring-2 focus:ring-[#9A6E3E]/15"
              placeholder="Enter your owner password"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !email.trim() || !password}
            className="w-full rounded-xl bg-[#1C1612] px-5 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#6F4B2B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Verifying…' : 'Sign in securely'}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] leading-5 text-[#8A8176]">
          Owner access is verified by the server. Browser profile data cannot grant administrative access.
        </p>
      </div>
    </div>
  );
}
