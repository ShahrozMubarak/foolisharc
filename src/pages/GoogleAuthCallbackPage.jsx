import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  parseGoogleCallbackParams,
  exchangeGoogleAuthCode,
  redirectToGoogleLogin
} from '../utils/googleAuth';

/**
 * GoogleAuthCallbackPage - Handles the redirect return from accounts.google.com
 * using OAuth 2.0 Authorization Code + PKCE (with backward-compatible token verification).
 */
export default function GoogleAuthCallbackPage({ onAuthSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingCartItem, setPendingCartItem] = useState(null);

  const started=useRef(false);
  useEffect(() => {
    if(started.current) return;
    started.current=true;
    async function handleCallback() {
      let pendingItem = null;
      try {
        const savedPending = sessionStorage.getItem('zaytoun_pending_cart_item');
        if (savedPending) {
          pendingItem = JSON.parse(savedPending);
          setPendingCartItem(pendingItem);
        }
      } catch (e) {
        console.warn("Could not parse pending cart item:", e);
      }

      try {
        const callbackParams = parseGoogleCallbackParams(location.search, location.hash);

        if (callbackParams.error) {
          throw new Error(callbackParams.errorDescription || `Google authentication error: ${callbackParams.error}`);
        }

        const expected=sessionStorage.getItem('foolisharc_oauth_state');
        sessionStorage.removeItem('foolisharc_oauth_state');
        if(!expected || callbackParams.state!==expected || !callbackParams.code) throw new Error('This sign-in link has expired. Please sign in again.');
        const verifiedUser=await exchangeGoogleAuthCode(callbackParams.code);
        sessionStorage.removeItem('zaytoun_pending_cart_item');
        const returnUrl = sessionStorage.getItem('zaytoun_auth_return_url') || '/shop';
        sessionStorage.removeItem('zaytoun_auth_return_url');

        setStatus('success');

        if (onAuthSuccess) {
          onAuthSuccess(verifiedUser, pendingItem);
        }

        setTimeout(() => {
          const target=new URL(returnUrl,window.location.origin);
          navigate(target.origin===window.location.origin && target.pathname!=='/auth/google/callback' ? target.pathname+target.search : '/shop',{replace:true});
        }, 900);
      } catch (err) {
        console.error("Google Auth Verification Notice:", err);
        setStatus('error');
        setErrorMessage(err.message || "Google rejected the request. Please retry logging in with your Google account.");
      }
    }

    handleCallback();
  }, [location, navigate, onAuthSuccess]);

  const handleRetryGoogleLogin = () => {
    redirectToGoogleLogin({ pendingItem: pendingCartItem }).catch(() => {
      navigate('/shop');
    });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-onyx-950 rounded-none p-8 border border-neutral-200 dark:border-onyx-800 shadow-2xl text-center">
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="w-12 h-12 border-2 border-black dark:border-white border-t-transparent animate-spin mx-auto" />
            <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
              Verifying with Google (PKCE)...
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Completing secure OAuth 2.0 Authorization Code + PKCE verification.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
              Google Account Verified
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Identity confirmed with Google. Returning you to your shopping bag...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 bg-amber-500 text-white flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
              Google Sign-In Required
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {errorMessage || "Authentic Google verification is strictly required to access your account."}
            </p>

            <div className="pt-3 space-y-2">
              <button
                onClick={handleRetryGoogleLogin}
                className="w-full py-3 px-4 rounded-none bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Retry Google Sign-In</span>
              </button>

              <button
                onClick={() => navigate('/shop')}
                className="w-full py-2.5 px-4 rounded-none border border-neutral-300 dark:border-onyx-700 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition"
              >
                Return to Shop
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
