import { randomBytes, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const issuer = 'foolisharc-api',
  adminAudience = 'foolisharc-admin',
  customerAudience = 'foolisharc-customer';
const devSecret = randomBytes(48).toString('base64url');
const adminEmail = () => (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
export function getJwtSecretOrFallback() {
  const secret = process.env.JWT_SECRET || '';
  return secret.length >= 32
    ? secret
    : process.env.NODE_ENV === 'production'
      ? ''
      : devSecret;
}
export function isAdminAuthConfigured() {
  const hasSecret = (process.env.JWT_SECRET || '').length >= 16;
  const hasHash = /^\$2[aby]\$/.test(process.env.ADMIN_PASSWORD_HASH || '');
  const hasPlain = Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 4);
  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail()) &&
    (hasHash || hasPlain) &&
    hasSecret
  );
}
export async function verifyAdminPassword(password) {
  if (
    !isAdminAuthConfigured() ||
    typeof password !== 'string' ||
    password.length < 4 ||
    password.length > 128
  )
    return false;

  if (process.env.ADMIN_PASSWORD_HASH && /^\$2[aby]\$/.test(process.env.ADMIN_PASSWORD_HASH)) {
    const matched = await bcrypt
      .compare(password, process.env.ADMIN_PASSWORD_HASH)
      .catch(() => false);
    if (matched) return true;
  }

  if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
    return true;
  }

  return false;
}
export const generateCsrfToken = () => randomBytes(32).toString('hex');
export function signHs256Jwt(payload, secret, options) {
  return jwt.sign(payload, secret, { algorithm: 'HS256', ...options });
}
export function verifyHs256Jwt(token, secret, options) {
  const claims = jwt.verify(token, secret, {
    algorithms: ['HS256'],
    ...options,
  });
  if (!Number.isFinite(claims.exp)) throw new Error('Missing session expiry');
  return claims;
}
export function generateAdminToken(csrfToken = generateCsrfToken()) {
  if (!isAdminAuthConfigured())
    throw new Error('Owner authentication is not configured.');
  return signHs256Jwt(
    { role: 'owner', csrf: csrfToken },
    process.env.JWT_SECRET,
    {
      issuer,
      audience: adminAudience,
      subject: adminEmail(),
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    },
  );
}
export function generateCustomerToken(user) {
  const secret = getJwtSecretOrFallback();
  if (!secret || !user?.email) return null;
  return signHs256Jwt(
    {
      role: 'customer',
      name: String(user.name || '').slice(0, 100),
      firstName: String(user.firstName || '').slice(0, 70),
      lastName: String(user.lastName || '').slice(0, 70),
      avatar: String(user.avatar || '').slice(0, 1000),
      authProvider: user.authProvider || 'email',
      verified: Boolean(user.verified),
    },
    secret,
    {
      issuer,
      audience: customerAudience,
      subject: user.email.trim().toLowerCase(),
      expiresIn: '7d',
    },
  );
}
export function parseCookie(req, name) {
  const cookie = (req.headers?.cookie || '')
    .split(';')
    .map((x) => x.trim())
    .find((x) => x.startsWith(name + '='));
  if (!cookie) return '';
  try {
    return decodeURIComponent(cookie.slice(name.length + 1));
  } catch {
    return '';
  }
}
export function verifyCustomerSession(req) {
  try {
    const claims = verifyHs256Jwt(
      parseCookie(req, 'foolisharc_customer'),
      getJwtSecretOrFallback(),
      { issuer, audience: customerAudience },
    );
    if (claims.role !== 'customer' || typeof claims.sub !== 'string')
      return null;
    return {
      email: claims.sub,
      name: claims.name || claims.sub.split('@')[0],
      firstName: claims.firstName || 'Client',
      lastName: claims.lastName || '',
      avatar: claims.avatar || '',
      authProvider: claims.authProvider || 'email',
      verified: Boolean(claims.verified),
    };
  } catch {
    return null;
  }
}
export function requireCustomerAuth(req, res, next) {
  req.customer = verifyCustomerSession(req);
  return req.customer
    ? next()
    : res
        .status(401)
        .json({ error: 'Please sign in.', code: 'CUSTOMER_AUTH_REQUIRED' });
}
export function requireAdminAuth(req, res, next) {
  if (!isAdminAuthConfigured())
    return res
      .status(503)
      .json({
        error: 'Owner sign-in is not configured.',
        code: 'ADMIN_AUTH_NOT_CONFIGURED',
      });
  const token = parseCookie(req, 'foolisharc_owner');
  if (!token)
    return res
      .status(401)
      .json({ error: 'Please sign in as the owner.', code: 'AUTH_REQUIRED' });
  try {
    const claims = verifyHs256Jwt(token, process.env.JWT_SECRET, {
      issuer,
      audience: adminAudience,
    });
    if (claims.role !== 'owner' || claims.sub !== adminEmail())
      return res.status(403).json({ error: 'Owner access required.' });
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const expected = Buffer.from(claims.csrf || ''),
        actual = Buffer.from(String(req.headers['x-csrf-token'] || ''));
      if (
        !expected.length ||
        expected.length !== actual.length ||
        !timingSafeEqual(expected, actual)
      ) {
        return res
          .status(403)
          .json({
            error: 'Refresh the owner session and try again.',
            code: 'CSRF_VALIDATION_FAILED',
          });
      }
    }
    req.admin = {
      role: 'owner',
      email: claims.sub,
      sub: claims.sub,
      csrfToken: claims.csrf,
      expiresAt: new Date(claims.exp * 1000).toISOString(),
    };
    return next();
  } catch {
    return res
      .status(401)
      .json({
        error: 'Your owner session has expired or is invalid.',
        code: 'INVALID_SESSION',
      });
  }
}
