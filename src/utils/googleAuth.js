/**
 * 🌐 Google Identity & Authentication Service for Zaytoun Atelier
 * Exclusively supports official Google Identity Services (GIS) Token Client popup flow
 * and Google OAuth 2.0 account authentication.
 * No alternate or unverified logins are allowed.
 */

export const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

export function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
}

/**
 * Modern Google Identity Services (GIS) popup login.
 * Avoids full-page redirects and deprecated implicit flow URL hash parameters.
 */
export function launchGooglePopupLogin(options = {}) {
  const normalized = typeof options === 'function' ? { onSuccess: options } : (options || {});
  const { onSuccess, onError } = normalized;
  const clientId = getGoogleClientId();

  if (!clientId) {
    if (onError) onError(new Error("Google OAuth Client ID is missing."));
    return;
  }

  // Ensure GIS library is available on window
  if (typeof window !== "undefined" && window.google?.accounts?.oauth2) {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope:
          "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            console.warn("Google OAuth popup response error:", tokenResponse);
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
            console.warn("Error fetching Google user profile:", fetchErr);
            if (onError) onError(fetchErr);
          }
        },
        error_callback: (err) => {
          console.warn("Google GIS popup error:", err);
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
      console.warn("GIS token client initialization failed:", e);
      if (onError) onError(e);
      return;
    }
  }

  // If GIS script hasn't finished loading yet
  if (onError) {
    onError(
      new Error(
        "Google Identity Services is initializing. Please retry in a moment."
      )
    );
  }
}

/**
 * Initiates the redirect to Google's accounts.google.com login screen.
 * @param {Object} options - { pendingItem, returnUrl }
 */
export function redirectToGoogleLogin({ pendingItem = null, returnUrl = window.location.pathname } = {}) {
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

  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const state = encodeURIComponent(JSON.stringify({ returnUrl, timestamp: Date.now() }));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "token",
    scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
    prompt: "select_account",
    state: state
  });

  const fullUrl = `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
  window.location.href = fullUrl;
}

/**
 * Parses URL hash returned by Google after redirection
 */
export function parseGoogleHash(hash) {
  if (!hash) return {};
  const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
  const params = new URLSearchParams(cleanHash);
  return {
    accessToken: params.get('access_token'),
    idToken: params.get('id_token'),
    tokenType: params.get('token_type'),
    expiresIn: params.get('expires_in'),
    error: params.get('error'),
    errorDescription: params.get('error_description'),
    state: params.get('state')
  };
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
    email_verified: Boolean(data.email_verified),
    authProvider: 'google',
    verified: true,
    googleVerified: true,
    verifiedAt: new Date().toISOString()
  };
}
