/**
 * 🌐 Google Identity & Authentication Service for FOOLISH ARC
 * Supports official Google Identity Services (GIS) popup login AND
 * OAuth 2.0 Authorization Code + PKCE redirect flow (replacing legacy implicit token flow).
 */

export const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

export function getGoogleClientId() {
  try {
    return import.meta?.env?.VITE_GOOGLE_CLIENT_ID || "";
  } catch {
    return "";
  }
}

function base64UrlEncode(bytes) {
  let binary = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.byteLength; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  const b64 = typeof btoa === "function"
    ? btoa(binary)
    : Buffer.from(arr).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Generates a cryptographic OAuth 2.0 PKCE code_verifier and S256 code_challenge.
 */
export async function generatePkcePair() {
  if (!globalThis.crypto?.subtle) throw new Error('Use HTTPS to sign in with Google.');
  const codeVerifier=base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(codeVerifier));
  return {codeVerifier,codeChallenge:base64UrlEncode(new Uint8Array(digest)),codeChallengeMethod:'S256'};
}

/**
 * Modern Google Identity Services (GIS) popup login.
 */
export function launchGooglePopupLogin(options = {}) {
  const normalized = typeof options === 'function' ? { onSuccess: options } : (options || {});
  const { onSuccess, onError } = normalized;
  const clientId = getGoogleClientId();

  if (!clientId) {
    if (onError) onError(new Error("Google OAuth Client ID is missing."));
    return;
  }

  if (typeof window !== "undefined" && window.google?.accounts?.oauth2) {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope:
          "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            if (onError) {
              onError(
                new Error(
                  tokenResponse.error_description ||
                    `Google sign-in error: ${tokenResponse.error}`
                )
              );
            }
            return;
          }

          try {
            const verified = await fetchGoogleVerifiedUser(tokenResponse.access_token);
            if (onSuccess) onSuccess(verified);
          } catch (fetchErr) {
            if (onError) onError(fetchErr);
          }
        },
        error_callback: (err) => {
          if (onError) {
            onError(
              new Error(
                err?.message ||
                  "Google Sign-In popup could not complete (possible origin or popup block)."
              )
            );
          }
        }
      });

      tokenClient.requestAccessToken({ prompt: "select_account" });
      return;
    } catch (e) {
      if (onError) onError(e);
      return;
    }
  }

  if (onError) {
    onError(
      new Error(
        "Google Identity Services is initializing. Please retry in a moment."
      )
    );
  }
}

/**
 * Initiates OAuth 2.0 Authorization Code + PKCE redirect to accounts.google.com.
 */
export async function redirectToGoogleLogin({ pendingItem = null, returnUrl = window.location.pathname } = {}) {
  const clientId = getGoogleClientId();

  if (pendingItem) {
    sessionStorage.setItem('zaytoun_pending_cart_item', JSON.stringify(pendingItem));
  } else {
    sessionStorage.removeItem('zaytoun_pending_cart_item');
  }

  sessionStorage.setItem('zaytoun_auth_return_url', returnUrl);

  if (!clientId) {
    throw new Error("MISSING_CLIENT_ID");
  }

  const { codeVerifier, codeChallenge, codeChallengeMethod } = await generatePkcePair();
  const stateNonce = base64UrlEncode(
    crypto.getRandomValues(new Uint8Array(32))
  );
  sessionStorage.setItem('foolisharc_pkce_verifier', codeVerifier);
  sessionStorage.setItem('foolisharc_oauth_state', stateNonce);

  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const state = stateNonce;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
    scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
    prompt: "select_account",
    state
  });

  window.location.href = `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

/**
 * Parses URL query (?code=...) or legacy hash returned after OAuth redirect.
 */
export function parseGoogleCallbackParams(search = "", hash = "") {
  const queryParams = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
  const hashParams = new URLSearchParams(cleanHash);

  return {
    code: queryParams.get('code'),
    accessToken: hashParams.get('access_token') || queryParams.get('access_token'),
    idToken: hashParams.get('id_token'),
    tokenType: hashParams.get('token_type'),
    expiresIn: hashParams.get('expires_in'),
    error: queryParams.get('error') || hashParams.get('error'),
    errorDescription: queryParams.get('error_description') || hashParams.get('error_description'),
    state: queryParams.get('state') || hashParams.get('state')
  };
}

export function parseGoogleHash(hash) {
  return parseGoogleCallbackParams("", hash);
}

/**
 * Exchanges an Authorization Code + PKCE code_verifier via the backend.
 */
export async function exchangeGoogleAuthCode(code) {
  const codeVerifier = sessionStorage.getItem('foolisharc_pkce_verifier') || '';
  const redirectUri = `${window.location.origin}/auth/google/callback`;

  const response = await fetch('/api/auth/google-code', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify({ code, codeVerifier, redirectUri })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.user) {
    throw new Error(data.error || 'Failed to exchange Google authorization code.');
  }
  sessionStorage.removeItem('foolisharc_pkce_verifier');
  return data.user;
}

/**
 * Verifies the access token directly with Google's servers and returns verified profile.
 */
export async function fetchGoogleVerifiedUser(accessToken) {
  if (!accessToken) throw new Error("No access token provided");

  const res = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description || "Failed to verify identity with Google.");
  }

  const data = await res.json();

  if (!data.email_verified && data.email_verified !== undefined) {
    throw new Error("Google account email is not verified by Google.");
  }

  const parts = (data.name || '').trim().split(' ');
  const firstName = data.given_name || parts[0] || 'Client';
  const lastName = data.family_name || parts.slice(1).join(' ') || '';

  return {
    name: data.name || data.email.split('@')[0],
    firstName,
    lastName,
    email: data.email.toLowerCase(),
    avatar: data.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || data.email)}`,
    googleId: data.sub,
    accessToken,
    email_verified: Boolean(data.email_verified),
    authProvider: 'google',
    verified: true,
    googleVerified: true,
    verifiedAt: new Date().toISOString()
  };
}
