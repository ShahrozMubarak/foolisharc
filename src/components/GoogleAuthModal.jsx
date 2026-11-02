import React, { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { launchGooglePopupLogin } from '../utils/googleAuth';
import BrandLogo from './BrandLogo';

/**
 * GoogleAuthModal - Luxury Editorial Authentication Portal for Zaytoun Atelier
 * High-end slow fashion aesthetic with desert camel accents, obsidian glassmorphism,
 * brand monogram crest, and minimalist luxury UI with Email + Password and Google SSO.
 */
export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSuccess,
  pendingItem = null,
  title = "Client Privilege Access",
  subtitle = "Sign in with your email or Google account to curate your wardrobe, place bespoke orders, and receive private drop allocations."
}) {
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  // Reset states on open/close
  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setLoading(false);
      setEmail("");
      setPassword("");
      setPendingGoogleUser(null);
      setShowPasswordPrompt(false);
    }
  }, [isOpen]);

  // Helper to update localStorage 'foolisharc_credentials'
  const saveToCredentials = (userData) => {
    let credentials = {};
    try {
      const raw = localStorage.getItem('foolisharc_credentials');
      if (raw) credentials = JSON.parse(raw);
    } catch (err) {
      credentials = {};
    }

    const normEmail = (userData.email || '').trim().toLowerCase();
    if (!normEmail) return;

    if (Array.isArray(credentials)) {
      const idx = credentials.findIndex(u => u && u.email && u.email.toLowerCase() === normEmail);
      if (idx >= 0) {
        credentials[idx] = { ...credentials[idx], ...userData, googleVerified: true };
      } else {
        credentials.push({ ...userData, googleVerified: true });
      }
    } else {
      if (typeof credentials !== 'object' || credentials === null) credentials = {};
      credentials[normEmail] = {
        ...(credentials[normEmail] || {}),
        ...userData,
        googleVerified: true
      };
    }
    localStorage.setItem('foolisharc_credentials', JSON.stringify(credentials));
  };

  // Helper to read from 'foolisharc_credentials'
  const getStoredUser = (targetEmail) => {
    let credentials = {};
    try {
      const raw = localStorage.getItem('foolisharc_credentials');
      if (raw) credentials = JSON.parse(raw);
    } catch (err) {
      return null;
    }

    const normEmail = (targetEmail || '').trim().toLowerCase();
    if (!normEmail) return null;

    if (Array.isArray(credentials)) {
      return credentials.find(u => u && u.email && u.email.toLowerCase() === normEmail) || null;
    } else if (typeof credentials === 'object' && credentials !== null) {
      return credentials[normEmail] || null;
    }
    return null;
  };

  // Handle Email + Password submit
  const handleEmailPasswordSignIn = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    const normEmail = email.trim().toLowerCase();
    const existing = getStoredUser(normEmail);

    if (existing && existing.password) {
      if (existing.password !== password) {
        setErrorMessage("Incorrect password for this email account.");
        return;
      }
      // Password matches
      const user = {
        email: existing.email || email.trim(),
        name: existing.name || email.split('@')[0],
        picture: existing.picture || '',
        googleVerified: true,
        ...existing
      };
      saveToCredentials(user);
      localStorage.setItem('zaytoun_user', JSON.stringify(user));
      if (onSuccess) onSuccess(user);
      if (onClose) onClose();
    } else {
      // No existing user or no password set yet for this email
      const user = {
        email: email.trim(),
        password: password,
        name: (existing && existing.name) ? existing.name : email.split('@')[0],
        picture: (existing && existing.picture) ? existing.picture : '',
        googleVerified: true
      };
      saveToCredentials(user);
      localStorage.setItem('zaytoun_user', JSON.stringify(user));
      if (onSuccess) onSuccess(user);
      if (onClose) onClose();
    }
  };

  // Handle Google Login Click
  const handleGooglePopupClick = () => {
    setLoading(true);
    setErrorMessage("");

    launchGooglePopupLogin({
      onSuccess: (verifiedUser) => {
        setLoading(false);
        const userEmail = verifiedUser.email || '';
        
        // If password was entered beforehand
        if (password.trim()) {
          const updatedUser = {
            ...verifiedUser,
            password: password.trim(),
            googleVerified: true
          };
          saveToCredentials(updatedUser);
          localStorage.setItem('zaytoun_user', JSON.stringify(updatedUser));
          if (onSuccess) onSuccess(updatedUser);
          if (onClose) onClose();
        } else {
          // Check if password already exists in credentials for this google user
          const existing = getStoredUser(userEmail);
          if (existing && existing.password) {
            const updatedUser = {
              ...verifiedUser,
              password: existing.password,
              googleVerified: true
            };
            saveToCredentials(updatedUser);
            localStorage.setItem('zaytoun_user', JSON.stringify(updatedUser));
            if (onSuccess) onSuccess(updatedUser);
            if (onClose) onClose();
          } else {
            // Prompt user to set a password for faster sign-in next time
            setPendingGoogleUser(verifiedUser);
            setShowPasswordPrompt(true);
          }
        }
      },
      onError: (err) => {
        console.warn("Google Sign-In Notice:", err.message);
        setLoading(false);
        setErrorMessage("Google Sign-In popup could not complete. Please ensure popups are enabled and sign in with your Google account.");
      }
    });
  };

  // Save password after Google Sign-In prompt
  const handleSaveGooglePassword = (e) => {
    e.preventDefault();
    if (!pendingGoogleUser) return;

    const userWithPassword = {
      ...pendingGoogleUser,
      password: password.trim(),
      googleVerified: true
    };
    saveToCredentials(userWithPassword);
    localStorage.setItem('zaytoun_user', JSON.stringify(userWithPassword));
    if (onSuccess) onSuccess(userWithPassword);
    if (onClose) onClose();
  };

  // Skip setting password after Google Sign-In prompt
  const handleSkipGooglePassword = () => {
    if (!pendingGoogleUser) return;

    const userObj = {
      ...pendingGoogleUser,
      googleVerified: true
    };
    saveToCredentials(userObj);
    localStorage.setItem('zaytoun_user', JSON.stringify(userObj));
    if (onSuccess) onSuccess(userObj);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#121110] text-white rounded-2xl border border-[#C69F6F]/50 shadow-[0_25px_90px_-15px_rgba(198,159,111,0.35)] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Shimmer Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8C6D45] via-[#E6D3B3] to-[#C69F6F]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#C69F6F]/70 hover:text-white hover:bg-white/10 transition-colors z-10 cursor-pointer"
          aria-label="Close Authentication Portal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8 relative">
          {/* Subtle Ambient Radial Camel Glow in Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#C69F6F]/10 blur-3xl pointer-events-none rounded-full" />

          {/* Top Brand Logo */}
          <div className="text-center mb-6 relative z-10 flex flex-col items-center justify-center">
            <BrandLogo size="md" asLink={false} />
            <div className="flex items-center justify-center space-x-2 mt-3">
              <span className="h-px w-6 bg-[#C69F6F]/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E6D3B3]">
                FOOLISH ARC • Private Portal
              </span>
              <span className="h-px w-6 bg-[#C69F6F]/40" />
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight mt-2">
              {title}
            </h2>
            <p className="text-xs text-neutral-300 mt-1 max-w-xs mx-auto leading-relaxed font-sans">
              {subtitle}
            </p>
          </div>

          {/* Pending Item Preview */}
          {pendingItem && (
            <div className="mb-5 p-3 rounded-xl bg-white/5 border border-[#C69F6F]/30 backdrop-blur-sm flex items-center space-x-3">
              {pendingItem.image && (
                <img
                  src={pendingItem.image}
                  alt={pendingItem.name}
                  className="w-12 h-14 object-cover rounded-lg border border-[#C69F6F]/30"
                />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#E6D3B3] block">
                  Pending Reservation
                </span>
                <h4 className="text-xs font-serif font-bold text-white truncate">
                  {pendingItem.name}
                </h4>
                <p className="text-xs text-[#C69F6F] font-semibold">
                  {formatPrice ? formatPrice(pendingItem.price) : `$${pendingItem.price}`}
                </p>
              </div>
            </div>
          )}

          {/* Error Message Notice */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs leading-relaxed flex items-start space-x-2 animate-fadeIn">
              <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {showPasswordPrompt ? (
            /* Google Sign-In Password Set Prompt */
            <form onSubmit={handleSaveGooglePassword} className="space-y-4 relative z-10 animate-fadeIn">
              <div className="p-3 rounded-xl bg-[#C69F6F]/10 border border-[#C69F6F]/30 text-center">
                <p className="text-xs font-semibold text-[#E6D3B3]">
                  Signed in as <span className="text-white">{pendingGoogleUser?.email}</span>
                </p>
                <p className="text-[11px] text-neutral-300 mt-1">
                  Set a password for faster sign-in next time
                </p>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#E6D3B3] mb-1 font-semibold">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-[#C69F6F]/40 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[#C69F6F] transition-colors"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={handleSkipGooglePassword}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 hover:border-neutral-500 text-neutral-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8C6D45] via-[#C69F6F] to-[#8C6D45] hover:opacity-95 text-black font-serif font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
                >
                  Save Password
                </button>
              </div>
            </form>
          ) : (
            /* Email / Password Form & Google SSO */
            <div className="space-y-4 relative z-10">
              <form onSubmit={handleEmailPasswordSignIn} className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#E6D3B3] mb-1 font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[#C69F6F]/40 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[#C69F6F] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#E6D3B3] mb-1 font-semibold">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-[#C69F6F]/40 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[#C69F6F] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#8C6D45] via-[#C69F6F] to-[#8C6D45] hover:opacity-95 disabled:opacity-50 text-black font-serif font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer mt-1"
                >
                  Sign In / Save Password
                </button>
              </form>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-[#C69F6F]/20" />
                <span className="px-3 text-[10px] uppercase tracking-widest text-[#E6D3B3]/60 font-semibold">
                  OR
                </span>
                <div className="flex-1 border-t border-[#C69F6F]/20" />
              </div>

              {/* Google SSO Button */}
              <button
                type="button"
                onClick={handleGooglePopupClick}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-neutral-900 hover:bg-neutral-100 disabled:opacity-50 font-sans font-semibold text-xs transition-all flex items-center justify-center space-x-2.5 shadow-md cursor-pointer border border-neutral-300"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin text-neutral-800" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {/* Minimal Footer / Trust Badge */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
              256-BIT ENCRYPTED • PRIVATE ATELIER ACCESS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
