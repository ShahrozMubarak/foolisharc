import { OAuth2Client } from 'google-auth-library';
const google = new OAuth2Client();
export const googleClientId = () =>
  process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
const fail = (status, message) => Object.assign(new Error(message), { status });
function profile(claims) {
  if (claims?.email_verified !== true || !claims.email || !claims.sub)
    throw fail(401, 'A verified Google account is required.');
  const email = claims.email.trim().toLowerCase(),
    name = (claims.name || email.split('@')[0]).slice(0, 100);
  return {
    email,
    name,
    firstName: (claims.given_name || name.split(' ')[0]).slice(0, 70),
    lastName: (claims.family_name || '').slice(0, 70),
    avatar: (claims.picture || '').slice(0, 1000),
    googleId: claims.sub,
  };
}
export async function profileFromIdToken(token) {
  const ticket = await google
    .verifyIdToken({ idToken: token, audience: googleClientId() })
    .catch(() => null);
  return profile(ticket?.getPayload());
}
export async function getVerifiedGoogleProfile(token) {
  if (!googleClientId()) throw fail(503, 'Google sign-in is not configured.');
  if (typeof token !== 'string' || token.length < 20 || token.length > 4096)
    throw fail(401, 'Invalid sign-in.');
  const info = await google.getTokenInfo(token).catch(() => null);
  if (
    !info ||
    (info.azp || info.aud) !== googleClientId() ||
    !(info.expiry_date > Date.now())
  )
    throw fail(401, 'Google could not verify this sign-in for this store.');
  const response = await fetch(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: { Authorization: 'Bearer ' + token },
      signal: AbortSignal.timeout(7000),
    },
  );
  if (!response.ok) throw fail(401, 'Google could not verify this account.');
  const verified = profile(await response.json());
  if (info.sub && info.sub !== verified.googleId)
    throw fail(401, 'Invalid account.');
  return verified;
}
