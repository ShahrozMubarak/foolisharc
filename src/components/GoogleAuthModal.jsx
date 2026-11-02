import React, { useState, useEffect } from 'react';
import BrandLogo from './BrandLogo';
import { launchGooglePopupLogin as loginWithGooglePopup } from '../utils/googleAuth';

export default function GoogleAuthModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveCredentials = (userEmail, userPass) => {
    if (!userEmail) return;
    try {
      const stored = JSON.parse(localStorage.getItem('foolisharc_credentials') || '{}');
      if (userPass) {
        stored[userEmail.toLowerCase()] = userPass;
      }
      localStorage.setItem('foolisharc_credentials', JSON.stringify(stored));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const stored = JSON.parse(localStorage.getItem('foolisharc_credentials') || '{}');
      const existingPass = stored[email.toLowerCase()];
      if (existingPass && existingPass !== password) {
        setError('Invalid email or password.');
        return;
      }
      stored[email.toLowerCase()] = password;
      localStorage.setItem('foolisharc_credentials', JSON.stringify(stored));
    } catch (err) {
      saveCredentials(email, password);
    }

    const user = { email, name: email.split('@')[0], authProvider: 'email' };
    localStorage.setItem('zaytoun_user', JSON.stringify(user));
    if (onSuccess) onSuccess(user);
    if (onClose) onClose();
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const googleUser = await loginWithGooglePopup();
      if (googleUser) {
        const userEmail = googleUser.email || email;
        if (password && userEmail) {
          saveCredentials(userEmail, password);
        }
        const user = {
          ...googleUser,
          email: userEmail || googleUser.email,
          authProvider: 'google',
        };
        localStorage.setItem('zaytoun_user', JSON.stringify(user));
        if (onSuccess) onSuccess(user);
        if (onClose) onClose();
      }
    } catch (err) {
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-8 shadow-2xl text-stone-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-100 text-xl font-light"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="flex flex-col items-center mb-6 text-center">
          <BrandLogo size="md" asLink={false} />
          <h2 className="mt-4 text-xl font-serif tracking-wide text-stone-200">Welcome Back</h2>
          <p className="text-xs text-stone-400 mt-1">Sign in with your credentials or Google</p>
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-400 bg-red-950/40 border border-red-800/50 p-2.5 rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 text-sm bg-stone-800/80 border border-stone-700 rounded text-stone-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-stone-800/80 border border-stone-700 rounded text-stone-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-medium text-xs tracking-widest uppercase rounded transition duration-200"
          >
            SIGN IN
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-800"></div>
          </div>
          <span className="relative bg-stone-900 px-3 text-[10px] uppercase tracking-widest text-stone-500">Or</span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-medium text-xs tracking-wider uppercase rounded transition duration-200 flex items-center justify-center gap-2"
        >
          CONTINUE WITH GOOGLE
        </button>
      </div>
    </div>
  );
}
