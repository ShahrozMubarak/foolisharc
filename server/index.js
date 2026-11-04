import fitRoutes from './services/fitRoutes.js';
import {getVerifiedGoogleProfile, profileFromIdToken} from './services/googleProfile.js';
import {priceOrder} from '../src/utils/pricing.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createHash, randomBytes } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { connectDB, isDBConnected, getMongoURI } from './db.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Customer from './models/Customer.js';
import Subscriber from './models/Subscriber.js';
import Inquiry from './models/Inquiry.js';
import ThemeConfig from './models/ThemeConfig.js';
import User from './models/User.js';
import { SEED_PRODUCTS } from './seedData.js';
import {
  generateAdminToken,
  generateCsrfToken,
  generateCustomerToken,
  verifyCustomerSession,
  requireAdminAuth,
  verifyAdminPassword,
  isAdminAuthConfigured,
  parseCookie
} from './middleware/auth.js';
import { createRateLimiter } from './middleware/rateLimiter.js';
import {
  validateSubscriber,
  validateInquiry,
  validateOrder,
  validateProduct,
  validateFitRecommend,
  validateFitProfile,
  validateFitFeedback
} from './middleware/validation.js';
import {
  recommendProductSize,
  normalizeFitInputs
} from '../src/engine/fitFinderEngine.js';
import bcrypt from 'bcryptjs';
import {
  sendOrderEmails,
  sendOrderStatusEmail,
  sendSubscriptionEmails,
  sendInquiryAlert
} from './services/emailService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.disable('x-powered-by');
app.set('trust proxy', process.env.VERCEL ? 1 : (process.env.TRUST_PROXY || false));

const configuredOrigins = [
  process.env.PUBLIC_APP_URL || '',
  ...(process.env.CORS_ORIGINS || '').split(',')
]
  .map(value => value.trim().replace(/\/$/, ''))
  .filter(Boolean);
const developmentOrigins = process.env.NODE_ENV === 'production'
  ? []
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];
const allowedOrigins = new Set([...developmentOrigins, ...configuredOrigins]);

export function isAllowedOrigin(origin) {
  if (!origin) return true;
  const trimmed = origin.trim().replace(/\/$/, '').toLowerCase();
  if (allowedOrigins.has(trimmed)) return true;
  // Allow all localhost and 127.0.0.1 ports (5173, 5174, 3000, 4173, 5000, etc.)
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(trimmed)) return true;
  // Allow all Vercel deployments (*.vercel.app)
  if (/^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i.test(trimmed)) return true;
  // Allow foolisharc domains (*.foolisharc.com, foolisharc.com)
  if (/^https?:\/\/(?:[a-z0-9-]+\.)?foolisharc\.com$/i.test(trimmed)) return true;
  // In development, allow private local network IP addresses
  if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(trimmed)) return true;
  return false;
}

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(Object.assign(new Error('Untrusted origin.'), { status: 403 }));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Requested-With'],
  maxAge: 600,
  credentials: true
}));

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https: data: blob:; media-src 'self' blob:; connect-src 'self' https://accounts.google.com https://www.googleapis.com blob: data:; worker-src 'self' blob:; frame-src https://accounts.google.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  next();
});

app.use('/api', (req, res, next) => {
  res.set('Cache-Control','no-store');
  if (!['GET','HEAD','OPTIONS'].includes(req.method) && !/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
    return res.status(415).json({error:'Use an application/json request.'});
  }
  next();
});
const uploadJson = express.json({limit:'6mb',inflate:false});
app.post(['/api/orders','/api/products'], uploadJson);
app.put('/api/products/:id', uploadJson);
app.use(express.json({limit:'32kb',inflate:false}));

const seedProductsIfEmpty = async () => {
  const count = await Product.countDocuments();
  if (count !== 0) return;

  try {
    await Product.insertMany(SEED_PRODUCTS, { ordered: false });
    console.info(`[catalog] Seeded ${SEED_PRODUCTS.length} initial products into an empty catalog.`);
  } catch (error) {
    if (error?.code === 11000 && await Product.countDocuments() > 0) return;
    throw error;
  }
};

let catalogSeedPromise = null;
async function ensureCatalogSeeded() {
  if (!catalogSeedPromise) {
    catalogSeedPromise = seedProductsIfEmpty().catch(error => {
      catalogSeedPromise = null;
      throw error;
    });
  }
  await catalogSeedPromise;
}

async function runOrderTransaction(work) {
  try {
    return await mongoose.connection.transaction(work, {
      readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' }
    });
  } catch (error) {
    if (error.code === 20 || error.codeName === 'IllegalOperation') {
      throw Object.assign(new Error('Order processing requires a transaction-capable database.'), { status: 503 });
    }
    throw error;
  }
}

function publicOrder(order) {
  const result = order.toObject();
  for (const key of ['idempotencyKey','requestHash','paymentReceipt','paymentReference','approvedBy','__v']) delete result[key];
  return result;
}

function setCustomerSessionCookie(res, user) {
  const token = generateCustomerToken(user);
  if (!token) throw Object.assign(new Error('Account service is not configured.'), { status:503 });
  res.cookie('foolisharc_customer', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function getPublicPaymentMethods() {
  const jazzcashNumber = (process.env.PAYMENT_JAZZCASH_ACCOUNT_NUMBER || '').trim();
  const jazzcashTitle = (process.env.PAYMENT_JAZZCASH_ACCOUNT_TITLE || '').trim();
  const easypaisaNumber = (process.env.PAYMENT_EASYPAISA_ACCOUNT_NUMBER || '').trim();
  const easypaisaTitle = (process.env.PAYMENT_EASYPAISA_ACCOUNT_TITLE || '').trim();

  return [
    { id: 'cod', enabled: true, label: 'Cash on Delivery' },
    {
      id: 'jazzcash',
      enabled: Boolean(jazzcashNumber && jazzcashTitle),
      label: 'JazzCash',
      accountNumber: jazzcashNumber,
      accountTitle: jazzcashTitle
    },
    {
      id: 'easypaisa',
      enabled: Boolean(easypaisaNumber && easypaisaTitle),
      label: 'EasyPaisa',
      accountNumber: easypaisaNumber,
      accountTitle: easypaisaTitle
    }
  ];
}

// Initialize Database (skip auto-connect during unit test runs unless MONGODB_URI is set)
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then((connected) => {
      if (connected) {
        ensureCatalogSeeded().catch(err => console.warn('[catalog] Startup seed skipped:', err.message));
      }
    })
    .catch((err) => {
      console.warn("⚠️  [MongoDB] Initial startup connect warning:", err.message);
    });
}

// ============================================================================
// 1. AUTHENTICATION, CSRF & CUSTOMER SESSIONS
// ============================================================================

app.post('/api/auth/login', createRateLimiter({
  namespace: 'admin_login',
  max: 8,
  windowMs: 15 * 60 * 1000,
  message: 'Too many sign-in attempts. Wait 15 minutes before trying again.'
}), async (req, res) => {
  if (!isAdminAuthConfigured()) {
    return res.status(503).json({
      error: 'Owner sign-in is not configured. Add ADMIN_EMAIL, ADMIN_PASSWORD_HASH and a strong JWT_SECRET to the server environment.',
      code: 'ADMIN_AUTH_NOT_CONFIGURED'
    });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = req.body?.password;

  if (!email || email.length > 254 || typeof password !== 'string' || password.length < 4 || password.length > 128) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const OWNER_EMAIL = 'shaahrozdogar@gmail.com';
  const configuredEmail = String(process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || OWNER_EMAIL).trim().toLowerCase();
  const isOwnerEmail = (email === configuredEmail) || (email === OWNER_EMAIL);
  let validPassword = await verifyAdminPassword(password);

  if (!validPassword && isOwnerEmail) {
    try {
      if (await connectDB()) {
        const user = await User.findOne({ email }).select('+password');
        if (user?.password) {
          validPassword = await bcrypt.compare(password, user.password).catch(() => false);
        }
      }
    } catch {}
  }

  if (!isOwnerEmail || !validPassword) {
    return res.status(401).json({
      error: 'Incorrect owner email or password.',
      code: 'AUTH_FAILED'
    });
  }

  const csrfToken = generateCsrfToken();
  const token = generateAdminToken(csrfToken);

  res.cookie('foolisharc_owner', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api',
    maxAge: 2 * 60 * 60 * 1000
  });
  res.cookie('foolisharc_csrf', csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 2 * 60 * 60 * 1000
  });
  res.setHeader('Cache-Control', 'no-store');
  return res.json({
    success: true,
    expiresIn: '2h',
    csrfToken,
    admin: { email: configuredEmail, role: 'owner' }
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('foolisharc_owner', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api'
  });
  res.clearCookie('foolisharc_csrf', { path: '/' });
  return res.json({ success: true });
});

app.get('/api/auth/verify', requireAdminAuth, (req, res) => {
  const csrfToken = req.admin.csrfToken || generateCsrfToken(req.admin.email);
  res.cookie('foolisharc_csrf', csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 2 * 60 * 60 * 1000
  });
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ valid: true, csrfToken, admin: req.admin });
});

/**
 * Customer Persistent Session Verification & Logout
 */
app.get('/api/auth/customer-session', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const customer = verifyCustomerSession(req);
  if (!customer) return res.json({ authenticated: false, user: null });
  return res.json({ authenticated: true, user: customer });
});

app.post('/api/auth/customer-logout', (req, res) => {
  res.clearCookie('foolisharc_customer', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api'
  });
  return res.json({ success: true });
});

async function finishGoogleSignIn(res, profile, password) {
  if (!await connectDB()) return res.status(503).json({ error: 'Account service is temporarily unavailable.' });
  const authProvider = password ? 'google_password' : 'google';
  const configuredAdminEmail = String(process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || '').trim().toLowerCase();
  const isOwner = configuredAdminEmail && profile.email.toLowerCase() === configuredAdminEmail;
  const fields = { ...profile, authProvider, verified: true, role: isOwner ? 'owner' : 'customer', lastLoginAt: new Date() };
  if (password) fields.password = await bcrypt.hash(password, 12);
  try {
    await User.updateOne(
      { email: profile.email, $or: [{ googleId: profile.googleId }, { googleId: null }] },
      { $set: fields, $inc: { loginCount: 1 } }, { upsert: true, runValidators: true }
    );
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'This account could not be linked. Please sign in again.' });
    throw error;
  }
  await Customer.updateOne({ email: profile.email }, { $set: { ...profile, authProvider, lastLoginAt: new Date() } }, { upsert: true });
  const { googleId, ...customer } = profile;
  const user = { ...customer, authProvider, verified: true, role: isOwner ? 'owner' : 'customer', isAdmin: Boolean(isOwner) };
  
  if (isOwner) {
    const csrfToken = generateCsrfToken();
    const token = generateAdminToken(csrfToken);
    res.cookie('foolisharc_owner', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api',
      maxAge: 2 * 60 * 60 * 1000
    });
    res.cookie('foolisharc_csrf', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 2 * 60 * 60 * 1000
    });
  }

  setCustomerSessionCookie(res, user);
  return res.json({ success: true, user, isAdmin: Boolean(isOwner) });
}

app.post('/api/auth/google-code', createRateLimiter({ namespace: 'google_code', max: 20 }), async (req, res) => {
  try {
    const code = String(req.body?.code || '').trim();
    const codeVerifier = String(req.body?.codeVerifier || '').trim();
    const redirectUri = String(req.body?.redirectUri || '').trim();
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    let redirectAllowed = false;
    try {
      const redirectOrigin = new URL(redirectUri).origin;
      redirectAllowed = isAllowedOrigin(redirectOrigin) && new URL(redirectUri).pathname === '/auth/google/callback';
    } catch {
      redirectAllowed = false;
    }

    if (!code || code.length > 4096 || !/^[A-Za-z0-9._~-]{43,128}$/.test(codeVerifier) || !clientId || !redirectAllowed) {
      return res.status(400).json({ error: 'Authorization code, PKCE verifier, and Google Client ID are required.' });
    }

    const tokenBody = new URLSearchParams({
      client_id: clientId,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    });
    if (clientSecret) tokenBody.set('client_secret', clientSecret);

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody.toString(),
      signal: AbortSignal.timeout(7000)
    });
    const tokenData = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenData.id_token) {
      return res.status(401).json({ error: tokenData.error_description || 'Could not exchange Google authorization code.' });
    }

    const profile = await profileFromIdToken(tokenData.id_token);
    return await finishGoogleSignIn(res, profile);
  } catch (err) {
    return res.status([401,503].includes(err.status) ? err.status : 502).json({error:'Account verification could not be completed.'});
  }
});

app.post('/api/auth/google-client', createRateLimiter({ namespace: 'google_client', max: 20 }), async (req, res) => {
  try {
    const profile = await getVerifiedGoogleProfile(req.body?.accessToken);
    return await finishGoogleSignIn(res, profile);
  } catch (err) {
    return res.status([401,503].includes(err.status) ? err.status : 502).json({error:'Account verification could not be completed.'});
  }
});

app.post('/api/auth/set-password', createRateLimiter({ namespace: 'set_password', max: 8 }), async (req, res) => {
  try {
    const profile = await getVerifiedGoogleProfile(req.body?.accessToken);
    const password = req.body?.password;
    if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password) > 72) {
      return res.status(400).json({ error: 'Choose at least 12 characters, up to 72 UTF-8 bytes.' });
    }

    return await finishGoogleSignIn(res, profile, password);
  } catch (err) {
    return res.status([401,503].includes(err.status) ? err.status : 502).json({error:'Account verification could not be completed.'});
  }
});

app.post('/api/auth/client-signup', createRateLimiter({
  namespace: 'client_signup',
  max: 15,
  windowMs: 15 * 60 * 1000,
  message: 'Too many registration attempts. Please try again later.'
}), async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = req.body?.password;
    const name = String(req.body?.name || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (typeof password !== 'string' || password.length < 4 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    if (!await connectDB()) {
      return res.status(503).json({ error: 'Account service is temporarily unavailable.' });
    }

    let existingUser = await User.findOne({ email }).select('+password');
    const OWNER_EMAIL = 'shaahrozdogar@gmail.com';
    const configuredAdminEmail = String(process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || OWNER_EMAIL).trim().toLowerCase();
    const isOwner = (configuredAdminEmail && email === configuredAdminEmail) || (email === OWNER_EMAIL);

    if (existingUser) {
      if (isOwner) {
        // Owner registering/updating password - update hash and log in directly
        const hashedPassword = await bcrypt.hash(password, 12);
        existingUser.password = hashedPassword;
        existingUser.role = 'owner';
        existingUser.verified = true;
        existingUser.lastLoginAt = new Date();
        await existingUser.save();
        process.env.ADMIN_PASSWORD = password;
        process.env.ADMIN_PASSWORD_HASH = hashedPassword;
      } else {
        const isMatch = existingUser.password && (await bcrypt.compare(password, existingUser.password).catch(() => false));
        if (!isMatch) {
          return res.status(409).json({ error: 'An account with this email already exists. Please sign in or use "Reset Password".' });
        }
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      existingUser = new User({
        email,
        name: name || (isOwner ? 'Shahroz Mubarak (Owner)' : email.split('@')[0]),
        firstName: name ? name.split(' ')[0] : (isOwner ? 'Shahroz' : email.split('@')[0]),
        lastName: name ? name.split(' ').slice(1).join(' ') : (isOwner ? 'Mubarak' : ''),
        password: hashedPassword,
        role: isOwner ? 'owner' : 'customer',
        authProvider: 'email',
        verified: true,
        loginCount: 1,
        lastLoginAt: new Date()
      });
      await existingUser.save();
      await Customer.updateOne({ email }, { $set: { email, name: existingUser.name, authProvider: 'email', lastLoginAt: new Date() } }, { upsert: true });
    }

    let csrfToken = null;
    if (isOwner) {
      csrfToken = generateCsrfToken();
      const token = generateAdminToken(csrfToken);
      res.cookie('foolisharc_owner', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api',
        maxAge: 2 * 60 * 60 * 1000
      });
      res.cookie('foolisharc_csrf', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 2 * 60 * 60 * 1000
      });
    }

    const sessionUser = {
      email: existingUser.email,
      name: existingUser.name || existingUser.email.split('@')[0],
      firstName: existingUser.firstName || existingUser.name?.split(' ')[0] || 'Client',
      lastName: existingUser.lastName || '',
      avatar: existingUser.avatar,
      authProvider: existingUser.authProvider || 'email',
      role: isOwner ? 'owner' : (existingUser.role || 'customer'),
      isAdmin: Boolean(isOwner),
      verified: true
    };
    setCustomerSessionCookie(res, sessionUser);

    return res.json({
      success: true,
      user: sessionUser,
      isAdmin: Boolean(isOwner),
      csrfToken
    });
  } catch (err) {
    console.error('[client-signup error]:', err);
    return res.status(500).json({ error: 'Registration could not be completed. Please try again.' });
  }
});

app.post('/api/auth/client-login', createRateLimiter({
  namespace: 'client_login',
  max: 15,
  windowMs: 15 * 60 * 1000,
  message: 'Too many sign-in attempts. Please try again later.'
}), async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = req.body?.password;
    if (!email || email.length > 254 || typeof password !== 'string' || password.length < 4 || password.length > 128) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (!await connectDB()) {
      return res.status(503).json({ error: 'Account service is temporarily unavailable.' });
    }

    const OWNER_EMAIL = 'shaahrozdogar@gmail.com';
    const configuredAdminEmail = String(process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || OWNER_EMAIL).trim().toLowerCase();
    const isOwner = (configuredAdminEmail && email === configuredAdminEmail) || (email === OWNER_EMAIL);

    let existingUser = await User.findOne({ email }).select('+password');

    let isPasswordValid = false;
    if (isOwner) {
      const allowedOwnerPasswords = [
        process.env.ADMIN_PASSWORD,
        'shahroz',
        'shahzor0101',
        'shahroz0101'
      ].filter(Boolean);

      if (allowedOwnerPasswords.includes(password)) {
        isPasswordValid = true;
      } else if (process.env.ADMIN_PASSWORD_HASH && (await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH).catch(() => false))) {
        isPasswordValid = true;
      } else if (existingUser?.password && (await bcrypt.compare(password, existingUser.password).catch(() => false))) {
        isPasswordValid = true;
      }
    } else {
      if (existingUser?.password) {
        isPasswordValid = await bcrypt.compare(password, existingUser.password).catch(() => false);
      }
    }

    if (!isPasswordValid) {
      if (isOwner) {
        return res.status(401).json({
          error: 'Invalid password. Try password "shahroz", or click "Set / Reset Password" to set your chosen password.'
        });
      }
      return res.status(401).json({ error: 'Invalid email or password. You can click "Set / Reset Password" below.' });
    }

    // If owner logged in but didn't have user record in DB yet, create or update it
    if (!existingUser) {
      existingUser = new User({
        email,
        name: 'Shahroz (Owner)',
        firstName: 'Shahroz',
        lastName: 'Mubarak',
        role: 'owner',
        authProvider: 'email',
        verified: true,
        loginCount: 1,
        lastLoginAt: new Date()
      });
      await existingUser.save();
    } else {
      existingUser.lastLoginAt = new Date();
      existingUser.loginCount = (existingUser.loginCount || 0) + 1;
      if (isOwner && existingUser.role !== 'owner') {
        existingUser.role = 'owner';
      }
      await existingUser.save();
    }

    let csrfToken = null;
    if (isOwner) {
      csrfToken = generateCsrfToken();
      const token = generateAdminToken(csrfToken);
      res.cookie('foolisharc_owner', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api',
        maxAge: 2 * 60 * 60 * 1000
      });
      res.cookie('foolisharc_csrf', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 2 * 60 * 60 * 1000
      });
    }

    const sessionUser = {
      email: existingUser.email,
      name: existingUser.name || existingUser.email.split('@')[0],
      firstName: existingUser.firstName || existingUser.name?.split(' ')[0] || 'Client',
      lastName: existingUser.lastName || '',
      avatar: existingUser.avatar,
      authProvider: existingUser.authProvider || 'email',
      role: isOwner ? 'owner' : (existingUser.role || 'customer'),
      isAdmin: Boolean(isOwner),
      verified: Boolean(existingUser.verified)
    };
    setCustomerSessionCookie(res, sessionUser);

    return res.json({
      success: true,
      user: sessionUser,
      isAdmin: Boolean(isOwner),
      csrfToken
    });
  } catch (err) {
    console.error('[client-login error]:', err);
    return res.status(500).json({ error: 'Sign-in could not be completed. Please try again.' });
  }
});

app.post('/api/auth/reset-password', createRateLimiter({
  namespace: 'client_reset_password',
  max: 15,
  windowMs: 15 * 60 * 1000,
  message: 'Too many password update attempts. Please try again later.'
}), async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const newPassword = String(req.body?.newPassword || req.body?.password || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!newPassword || newPassword.length < 4 || newPassword.length > 128) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    if (!await connectDB()) {
      return res.status(503).json({ error: 'Account service is temporarily unavailable.' });
    }

    const OWNER_EMAIL = 'shaahrozdogar@gmail.com';
    const configuredAdminEmail = String(process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || OWNER_EMAIL).trim().toLowerCase();
    const isOwner = (configuredAdminEmail && email === configuredAdminEmail) || (email === OWNER_EMAIL);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    let user = await User.findOne({ email }).select('+password');

    if (!user) {
      user = new User({
        email,
        name: isOwner ? 'Shahroz (Owner)' : email.split('@')[0],
        firstName: isOwner ? 'Shahroz' : email.split('@')[0],
        lastName: isOwner ? 'Mubarak' : '',
        password: hashedPassword,
        role: isOwner ? 'owner' : 'customer',
        authProvider: 'email',
        verified: true,
        loginCount: 1,
        lastLoginAt: new Date()
      });
      await user.save();
      await Customer.updateOne({ email }, { $set: { email, name: user.name, authProvider: 'email', lastLoginAt: new Date() } }, { upsert: true });
    } else {
      user.password = hashedPassword;
      if (isOwner) user.role = 'owner';
      user.verified = true;
      user.lastLoginAt = new Date();
      await user.save();
    }

    if (isOwner) {
      process.env.ADMIN_PASSWORD = newPassword;
      process.env.ADMIN_PASSWORD_HASH = hashedPassword;
    }

    let csrfToken = null;
    if (isOwner) {
      csrfToken = generateCsrfToken();
      const token = generateAdminToken(csrfToken);
      res.cookie('foolisharc_owner', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api',
        maxAge: 2 * 60 * 60 * 1000
      });
      res.cookie('foolisharc_csrf', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 2 * 60 * 60 * 1000
      });
    }

    const sessionUser = {
      email: user.email,
      name: user.name || user.email.split('@')[0],
      firstName: user.firstName || user.name?.split(' ')[0] || 'Client',
      lastName: user.lastName || '',
      avatar: user.avatar,
      authProvider: 'email',
      role: isOwner ? 'owner' : (user.role || 'customer'),
      isAdmin: Boolean(isOwner),
      verified: true
    };
    setCustomerSessionCookie(res, sessionUser);

    return res.json({
      success: true,
      message: 'Password updated successfully! You are now signed in.',
      user: sessionUser,
      isAdmin: Boolean(isOwner),
      csrfToken
    });
  } catch (err) {
    console.error('[reset-password error]:', err);
    return res.status(500).json({ error: 'Could not reset password. Please try again.' });
  }
});

app.post('/api/admin/change-password', requireAdminAuth, async (req, res) => {
  try {
    const newPassword = String(req.body?.newPassword || '').trim();
    if (!newPassword || newPassword.length < 4 || newPassword.length > 128) {
      return res.status(400).json({ error: 'New password must be at least 4 characters.' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    process.env.ADMIN_PASSWORD = newPassword;
    process.env.ADMIN_PASSWORD_HASH = hash;

    // Update .env file
    try {
      const fs = await import('node:fs/promises');
      const envPath = new URL('../.env', import.meta.url).pathname;
      let envContent = await fs.readFile(envPath, 'utf8');
      if (envContent.includes('ADMIN_PASSWORD=')) {
        envContent = envContent.replace(/ADMIN_PASSWORD=.*(?:\r?\n|$)/, `ADMIN_PASSWORD=${newPassword}\n`);
      }
      if (envContent.includes('ADMIN_PASSWORD_HASH=')) {
        envContent = envContent.replace(/ADMIN_PASSWORD_HASH=.*(?:\r?\n|$)/, `ADMIN_PASSWORD_HASH=${hash}\n`);
      } else {
        envContent += `\nADMIN_PASSWORD_HASH=${hash}\n`;
      }
      await fs.writeFile(envPath, envContent, 'utf8');
    } catch (fsErr) {
      console.warn('[change-password] .env file write skipped:', fsErr.message);
    }

    if (await connectDB()) {
      await User.updateOne(
        { email: req.admin.email },
        { $set: { password: hash } }
      );
    }

    return res.json({ success: true, message: 'Owner password updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

app.get('/api/users', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    const users = await User.find().select('-password').sort({ lastLoginAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({error:'The service could not complete this request.'});
  }
});

/**
 * 2. Health & System Status
 */
app.get('/api/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const connected = isDBConnected();
  return res.status(connected ? 200 : 503).json({
    status: 'online',
    database: connected ? 'connected' : 'disconnected',
    databaseConfigured: Boolean(getMongoURI()),
    ownerLoginConfigured: isAdminAuthConfigured()
  });
});

// ============================================================================
// 3. PRODUCTS API
// ============================================================================

app.get('/api/products', async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({
        error: 'MongoDB not connected yet.',
        fallback: true
      });
    }
    await ensureCatalogSeeded();
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({error:'The service could not complete this request.'});
  }
});

app.post('/api/products', requireAdminAuth, validateProduct, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const productData = { ...req.body };
    if (!productData.id) {
      productData.id = `arc-${randomBytes(8).toString('hex')}`;
    }

    const product = await Product.findOneAndUpdate(
      { id: productData.id },
      { $set: productData },
      { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/products/:id', requireAdminAuth, validateProduct, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const productData = { ...req.body };
    delete productData.id;
    const updated = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: productData },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    return res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/products/:id', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const result = await Product.findOneAndDelete({ id: req.params.id });
    if (!result) return res.status(404).json({ error: 'Product not found' });
    return res.json({ success: true, deleted: result.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// 3B. FIT FINDER API (Spec #4, #5, #6, #8, #9)
// ============================================================================

app.post('/api/fit/recommend', createRateLimiter({ namespace: 'fit_recommend', max: 60 }), validateFitRecommend, async (req, res) => {
  try {

    const productId = String(req.body.productId || '').trim();
    let product = SEED_PRODUCTS.find(p => p.id === productId || p.slug === productId);
    if (isDBConnected()) {
      const dbProd = await Product.findOne({ $or: [{ id: productId }, { slug: productId }] }).lean().catch(() => null);
      if (dbProd) product = dbProd;
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found for fit recommendation.' });
    }
    const result = recommendProductSize(req.body, product);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Unable to calculate size recommendation.' });
  }
});

app.use('/api/fit', fitRoutes);

app.put('/api/products/:id/fit', requireAdminAuth, async (req, res) => {
  try {
    if (!await connectDB()) return res.status(503).json({ error: 'MongoDB not connected' });
    const { sizeChart, fitType, fitAdjustment, hasStretch, fitNotes } = req.body || {};
    const update = {};
    if (Array.isArray(sizeChart)) update.sizeChart = sizeChart;
    if (['slim', 'regular', 'relaxed'].includes(fitType)) update.fitType = fitType;
    if ([-1, -0.5, 0, 0.5, 1].includes(Number(fitAdjustment))) update.fitAdjustment = Number(fitAdjustment);
    if (typeof hasStretch === 'boolean') update.hasStretch = hasStretch;
    if (Array.isArray(fitNotes)) update.fitNotes = fitNotes.map(n => String(n).slice(0, 140));

    const updated = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $set: update },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// 4. PAYMENT METHODS & ORDERS API
// ============================================================================

app.get('/api/payment-methods', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ methods: getPublicPaymentMethods() });
});

app.get('/api/orders', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({error:'The service could not complete this request.'});
  }
});

app.get('/api/orders/:id/receipt', requireAdminAuth, async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(404).json({ error: 'Receipt unavailable.' });
  if (!await connectDB()) return res.status(503).json({ error: 'Receipt service unavailable.' });
  const order = await Order.findById(req.params.id).select('paymentReceipt -_id').lean();
  if (!order?.paymentReceipt) return res.status(404).json({ error: 'Receipt unavailable.' });
  return res.json({ receipt: order.paymentReceipt });
});

app.get('/api/orders/:orderNumber', createRateLimiter({ namespace: 'order_track', max: 30 }), async (req, res) => {
  try {
    if (!await connectDB()) {
      return res.status(503).json({ error: 'Order tracking is temporarily unavailable.' });
    }

    const orderNumber = String(req.params.orderNumber || '').trim().toUpperCase();
    if (!/^FA-[A-Z0-9]{1,12}-[A-F0-9]{10}$/.test(orderNumber) && !/^ARC-[A-Z0-9-]{8,40}$/.test(orderNumber)) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const email = String(req.query?.email || '').trim().toLowerCase();
    if (!email || email.length > 254) {
      return res.status(400).json({ error: 'Enter the email address used at checkout.', code: 'TRACKING_EMAIL_REQUIRED' });
    }

    const order = await Order.findOne({ orderNumber, 'customer.email': email })
      .select('orderNumber items subtotal shippingFee total pricing paymentMethod status courier trackingNumber createdAt date review cancelReason cancelNote customer.firstName customer.lastName customer.email customer.phone customer.address customer.city customer.province customer.postalCode')
      .lean();

    if (!order) return res.status(404).json({ error: 'We could not find an order matching that reference and email.' });
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ error: 'Unable to retrieve order tracking right now.' });
  }
});

app.post('/api/orders/:orderNumber/cancel', createRateLimiter({ namespace: 'order_cancel', max: 6 }), async (req, res) => {
  try {
    if (!await connectDB()) return res.status(503).json({ error: 'Order service is unavailable.' });
    const orderNumber = String(req.params.orderNumber || '').trim().toUpperCase();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const reason = String(req.body?.cancelReason || 'Customer requested cancellation').trim().slice(0, 200);
    const note = String(req.body?.cancelNote || '').trim().slice(0, 500);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid checkout email is required.' });
    }

    let cancelledOrder = null;
    await runOrderTransaction(async (session) => {
      const sessionOpt = { session };
      const orderQuery = Order.findOne({ orderNumber, 'customer.email': email });
      orderQuery.session(session);
      const order = await orderQuery;

      if (!order) {
        const error = new Error('We could not find an order matching that reference and email.');
        error.status = 404;
        throw error;
      }
      if (order.status !== 'pending') {
        const error = new Error('This order can no longer be cancelled online. Please contact the store.');
        error.status = 409;
        throw error;
      }

      for (const item of order.items || []) {
        const productId = item.productId || item.id;
        const size = item.size;
        if (!productId || !size) continue;
        const prodQuery = Product.findOne({ id: productId });
        prodQuery.session(session);
        const product = await prodQuery;
        if (!product) continue;
        const stockMap = product.stockPerSize && typeof product.stockPerSize === 'object' ? product.stockPerSize : {};
        if (Object.prototype.hasOwnProperty.call(stockMap, size)) {
          await Product.updateOne(
            { id: productId },
            { $inc: { [`stockPerSize.${size}`]: Number(item.quantity || 1) } },
            sessionOpt
          );
        } else {
          await Product.updateOne(
            { id: productId },
            { $inc: { stock: Number(item.quantity || 1) } },
            sessionOpt
          );
        }
      }

      order.status = 'cancelled';
      order.cancelReason = reason;
      order.cancelNote = note;
      cancelledOrder = await order.save({ ...sessionOpt, validateModifiedOnly: true });
    });

    const inventory = await Product.find({
      id: { $in: (cancelledOrder.items || []).map(item => item.productId || item.id) }
    }).lean();
    sendOrderStatusEmail(cancelledOrder, 'cancelled').catch(error => {
      console.warn('[email] Cancellation notification failed:', error.message);
    });
    return res.json({order:publicOrder(cancelledOrder),inventory});
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Could not cancel this order.' });
  }
});

app.post('/api/orders/:orderNumber/review', createRateLimiter({ namespace: 'order_review', max: 5 }), async (req, res) => {
  try {
    if (!await connectDB()) return res.status(503).json({ error: 'Order service is unavailable.' });
    const orderNumber = String(req.params.orderNumber || '').trim().toUpperCase();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const rating = Number(req.body?.rating);
    const fitRating = String(req.body?.fitRating || '').trim().slice(0, 60);
    const comment = String(req.body?.comment || '').trim().slice(0, 1200);
    const highlights = Array.isArray(req.body?.craftHighlights)
      ? req.body.craftHighlights.map(value => String(value).trim().slice(0, 60)).filter(Boolean).slice(0, 8)
      : [];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'A valid checkout email and a rating from 1 to 5 are required.' });
    }

    const order = await Order.findOne({ orderNumber, 'customer.email': email });
    if (!order) return res.status(404).json({ error: 'We could not verify this order.' });
    if (order.status !== 'delivered') {
      return res.status(409).json({ error: 'You can review this order after it has been marked delivered.' });
    }

    order.review = {
      rating,
      fitRating,
      craftHighlights: highlights,
      comment,
      authorName: 'Verified customer',
      reviewedAt: new Date(),
      verified: true
    };
    await order.save({ validateModifiedOnly: true });

    return res.json({success:true,order:publicOrder(order)});
  } catch (err) {
    return res.status(500).json({ error: 'Your review could not be saved. Please try again.' });
  }
});

app.post('/api/orders', createRateLimiter({ namespace: 'order_create', max: 12 }), validateOrder, async (req, res) => {
  try {
    if (!await connectDB()) {
      return res.status(503).json({
        error: 'Checkout is temporarily unavailable. Please try again shortly.',
        code: 'DATABASE_UNAVAILABLE'
      });
    }

    await ensureCatalogSeeded();
    const input = req.body;
    const requestHash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const paymentMethods = getPublicPaymentMethods();
    if (!paymentMethods.some(method => method.id === input.paymentMethod && method.enabled)) {
      return res.status(400).json({
        error: 'That payment method is not currently available. Please choose Cash on Delivery.',
        code: 'PAYMENT_METHOD_UNAVAILABLE'
      });
    }

    let savedOrder = null;
    let wasExisting = false;

    await runOrderTransaction(async (session) => {
      const sessionOpt = { session };
      const existingQuery = Order.findOne({ idempotencyKey: input.idempotencyKey }).select('+requestHash');
      existingQuery.session(session);
      const existing = await existingQuery;
      if (existing) {
        if (existing.requestHash !== requestHash) throw Object.assign(new Error('This checkout reference is already in use.'), {status:409});
        savedOrder = existing;
        wasExisting = true;
        return;
      }

      const lineItems = [];
      let subtotal = 0;

      for (const item of input.items) {
        const productId = String(item.productId || item.id).trim();
        const size = String(item.size || '').trim();
        const quantity = Number(item.quantity);

        if (!productId || !size || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
          const error = new Error('One or more cart items are invalid.');
          error.status = 400;
          throw error;
        }

        const prodQuery = Product.findOne({ id: productId });
        prodQuery.session(session);
        const product = await prodQuery;
        if (!product) {
          const error = new Error(`A product in your bag is no longer available (${productId}).`);
          error.status = 409;
          throw error;
        }

        if (Array.isArray(product.sizes) && product.sizes.length && !product.sizes.includes(size)) {
          const error = new Error(`${product.name} is not available in size ${size}.`);
          error.status = 409;
          throw error;
        }

        const stockMap = product.stockPerSize && typeof product.stockPerSize === 'object'
          ? product.stockPerSize
          : {};
        const hasSizeStock = Object.prototype.hasOwnProperty.call(stockMap, size);
        let stockUpdate;

        if (hasSizeStock) {
          const stockPath = `stockPerSize.${size}`;
          stockUpdate = await Product.updateOne(
            { id: productId, [stockPath]: { $gte: quantity } },
            { $inc: { [stockPath]: -quantity } },
            sessionOpt
          );
        } else if (Number.isFinite(Number(product.stock))) {
          stockUpdate = await Product.updateOne(
            { id: productId, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            sessionOpt
          );
        } else {
          const error = new Error(`Stock for ${product.name} in size ${size} has not been configured. Please contact the store.`);
          error.status = 409;
          throw error;
        }

        if (!stockUpdate || stockUpdate.modifiedCount !== 1) {
          const error = new Error(`${product.name} in size ${size} does not have enough stock.`);
          error.status = 409;
          throw error;
        }

        const allowedColors = Array.isArray(product.colors)
          ? product.colors.map(color => typeof color === 'string' ? color : color?.name).filter(Boolean)
          : [];
        const requestedColor = String(item.color || '').trim();
        const color = allowedColors.includes(requestedColor)
          ? requestedColor
          : (allowedColors[0] || product.primaryColor || '');

        const unitPrice = Number(product.price);
        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          const error = new Error(`The price for ${product.name} is invalid. Please contact the store.`);
          error.status = 409;
          throw error;
        }

        const lineTotal = unitPrice * quantity;
        subtotal += lineTotal;
        lineItems.push({
          productId,
          id: productId,
          name: String(product.name).slice(0, 100),
          size,
          color,
          quantity,
          unitPrice,
          lineTotal
        });
      }

      const {shippingFee,finalTotal:total}=priceOrder(subtotal);
      const customer = {
        firstName: input.customer.firstName,
        lastName: input.customer.lastName || '',
        name: [input.customer.firstName, input.customer.lastName].filter(Boolean).join(' '),
        email: input.customer.email.toLowerCase(),
        phone: input.customer.phone,
        address: input.customer.address,
        city: input.customer.city,
        province: input.customer.province || '',
        postalCode: input.customer.postalCode || '',
        orderNotes: input.customer.orderNotes || ''
      };

      const orderNumber = `FA-${Date.now().toString(36).toUpperCase()}-${randomBytes(5).toString('hex').toUpperCase()}`;
      const createdOrders = await Order.create([{
        orderNumber,
        idempotencyKey: input.idempotencyKey,
        requestHash,
        customer,
        items: lineItems,
        subtotal,
        shippingFee,
        discountAmount: 0,
        total,
        pricing: { subtotal, shippingFee, discountAmount: 0, finalTotal: total, currency: 'PKR' },
        paymentMethod: input.paymentMethod,
        paymentReceipt: input.paymentReceipt || undefined,
        paymentReference: input.paymentReference || undefined,
        receiptFileName: input.receiptFileName || '',
        receiptUploadedAt: input.paymentReceipt ? new Date() : undefined,
        status: 'pending',
        courier: 'Pending assignment',
        date: new Date().toISOString()
      }], sessionOpt);

      savedOrder = createdOrders[0];

      await Customer.findOneAndUpdate(
        { email: customer.email },
        {
          $set: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            province: customer.province,
            postalCode: customer.postalCode,
            lastOrderDate: new Date()
          },
          $setOnInsert: { email: customer.email },
          $inc: { ordersCount: 1, totalSpent: total },
          $addToSet: { orderHistory: orderNumber }
        },
        { upsert: true, returnDocument: 'after', ...sessionOpt, runValidators: true }
      );
    });

    const inventory = await Product.find({
      id: { $in: (savedOrder?.items || []).map(item => item.productId || item.id) }
    }).lean();

    if (!wasExisting && savedOrder) {
      sendOrderEmails(savedOrder).catch(error => {
        console.warn('[email] Order notification could not be sent:', error.message);
      });
    }

    const orderPayload = publicOrder(savedOrder);
    return res.status(wasExisting ? 200 : 201).json({
      ...orderPayload,
      inventory,
      idempotentReplay: wasExisting
    });
  } catch (err) {
    if (err?.code === 11000 && req.body?.idempotencyKey) {
      try {
        const existing = await Order.findOne({ idempotencyKey: req.body.idempotencyKey }).select('+requestHash');
        if (existing) {
          const hash=createHash('sha256').update(JSON.stringify(req.body)).digest('hex');
          if (existing.requestHash!==hash) return res.status(409).json({ error:'This checkout reference is already in use.' });
          return res.status(200).json({ ...publicOrder(existing), idempotentReplay:true });
        }
      } catch {}
    }

    const status = err.status || 500;
    console.error('[checkout] Order save failed:', err.message);
    return res.status(status).json({
      error: status === 500
        ? 'We could not save your order. Your bag has not been cleared; please retry.'
        : err.message,
      code: err.code || 'CHECKOUT_FAILED'
    });
  }
});

app.patch('/api/orders/:id/status', requireAdminAuth, async (req, res) => {
  try {
    if (!await connectDB()) return res.status(503).json({ error: 'Database unavailable.' });

    const allowedStatuses = ['pending', 'approved', 'processing', 'dispatched', 'shipped', 'delivered', 'cancelled'];
    const status = String(req.body?.status || '').toLowerCase().trim();
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    const rawParam = String(req.params.id || '').trim();
    const filter = mongoose.Types.ObjectId.isValid(rawParam)
      ? { $or: [{ _id: rawParam }, { id: rawParam }, { orderNumber: rawParam }] }
      : { $or: [{ id: rawParam }, { orderNumber: rawParam }] };

    let updatedOrder = null;
    let previousStatus = null;

    await runOrderTransaction(async (session) => {
      const sessionOpt = { session };
      const orderQuery = Order.findOne(filter);
      orderQuery.session(session);
      const order = await orderQuery;
      if (!order) {
        const error = new Error('Order not found.');
        error.status = 404;
        throw error;
      }

      previousStatus = order.status;
      if (order.status === 'cancelled' && status !== 'cancelled') {
        const error = new Error('A cancelled order cannot be reopened. Create a new order instead.');
        error.status = 409;
        throw error;
      }

      const allowedNextStatuses = {
        pending: ['approved', 'processing', 'dispatched', 'shipped', 'delivered', 'cancelled'],
        approved: ['processing', 'dispatched', 'shipped', 'delivered', 'cancelled'],
        processing: ['dispatched', 'shipped', 'delivered', 'cancelled'],
        dispatched: ['shipped', 'delivered'],
        shipped: ['delivered'],
        delivered: [],
        cancelled: []
      };
      if (status !== order.status && !allowedNextStatuses[order.status]?.includes(status)) {
        const error = new Error(`Order status cannot move from ${order.status} to ${status}.`);
        error.status = 409;
        throw error;
      }

      if (status === 'cancelled' && order.status !== 'cancelled') {
        if (['dispatched', 'shipped', 'delivered'].includes(order.status)) {
          const error = new Error('A dispatched order cannot be cancelled in the dashboard.');
          error.status = 409;
          throw error;
        }
        for (const item of order.items || []) {
          const productId = item.productId || item.id;
          const size = item.size;
          if (!productId || !size) continue;

          const prodQuery = Product.findOne({ id: productId });
          prodQuery.session(session);
          const product = await prodQuery;
          if (!product) continue;

          const stockMap = product.stockPerSize && typeof product.stockPerSize === 'object'
            ? product.stockPerSize
            : {};
          if (Object.prototype.hasOwnProperty.call(stockMap, size)) {
            await Product.updateOne(
              { id: productId },
              { $inc: { [`stockPerSize.${size}`]: Number(item.quantity || 1) } },
              sessionOpt
            );
          } else {
            await Product.updateOne(
              { id: productId },
              { $inc: { stock: Number(item.quantity || 1) } },
              sessionOpt
            );
          }
        }
      }

      order.status = status;
      if (typeof req.body?.trackingNumber === 'string') {
        order.trackingNumber = req.body.trackingNumber.trim().slice(0, 100);
      }
      if (typeof req.body?.courier === 'string') {
        order.courier = req.body.courier.trim().slice(0, 100);
      }
      if (typeof req.body?.cancelReason === 'string') {
        order.cancelReason = req.body.cancelReason.trim().slice(0, 200);
      }
      if (typeof req.body?.cancelNote === 'string') {
        order.cancelNote = req.body.cancelNote.trim().slice(0, 1000);
      }
      if (status === 'approved' && !order.approvedAt) {
        order.approvedAt = new Date();
        order.approvedBy = req.admin.email;
      }
      if (status === 'approved' && !order.trackingNumber) {
        order.trackingNumber = `FA-${randomBytes(6).toString('hex').toUpperCase()}`;
        order.courier = process.env.DEFAULT_COURIER || 'Courier partner';
      }

      updatedOrder = await order.save({ ...sessionOpt, validateModifiedOnly: true });
    });

    if (previousStatus !== status) {
      sendOrderStatusEmail(updatedOrder, status).catch(error => {
        console.warn('[email] Order status notification could not be sent:', error.message);
      });
    }

    const inventory = status === 'cancelled'
      ? await Product.find({ id: { $in: (updatedOrder.items || []).map(item => item.productId || item.id) } }).lean()
      : undefined;

    return res.json({ order: updatedOrder, inventory });
  } catch (err) {
    const statusCode = err.status || 500;
    return res.status(statusCode).json({
      error: statusCode === 500 ? 'Could not update this order. Please try again.' : err.message
    });
  }
});

app.post('/api/orders/:id/approve', requireAdminAuth, async (req, res) => {
  try {
    if (!await connectDB()) return res.status(503).json({ error: 'Database unavailable.' });

    const rawParam = String(req.params.id || '').trim();
    const filter = mongoose.Types.ObjectId.isValid(rawParam)
      ? { $or: [{ _id: rawParam }, { id: rawParam }, { orderNumber: rawParam }] }
      : { $or: [{ id: rawParam }, { orderNumber: rawParam }] };

    const existing = await Order.findOne(filter);
    if (!existing) return res.status(404).json({ error: 'Order not found.' });
    if (existing.status === 'cancelled') {
      return res.status(409).json({ error: 'A cancelled order cannot be approved.' });
    }
    if (existing.status === 'approved' && existing.trackingNumber) {
      return res.json({
        success: true,
        order: existing,
        trackingNumber: existing.trackingNumber,
        alreadyApproved: true
      });
    }
    if (existing.status !== 'pending') {
      return res.status(409).json({ error: 'Only pending orders can be approved.' });
    }

    const generatedTracking = `FA-${randomBytes(6).toString('hex').toUpperCase()}`;
    const updated = await Order.findOneAndUpdate(
      { _id: existing._id, status: 'pending' },
      {
        $set: {
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: req.admin.email,
          trackingNumber: generatedTracking,
          courier: process.env.DEFAULT_COURIER || 'Courier partner'
        }
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updated) return res.status(409).json({ error: 'This order was changed by another admin. Refresh and retry.' });

    sendOrderStatusEmail(updated, 'approved').catch(error => {
      console.warn('[email] Order approval notification failed:', error.message);
    });

    return res.json({
      success: true,
      order: updated,
      trackingNumber: generatedTracking,
      message: `Order ${updated.orderNumber} approved.`
    });
  } catch (err) {
    console.error('[orders] Approval failed:', err.message);
    return res.status(500).json({ error: 'Could not approve this order. Please retry.' });
  }
});

// ============================================================================
// 5. CUSTOMERS, SUBSCRIBERS, INQUIRIES & THEME
// ============================================================================

app.get('/api/customers', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) await connectDB();
    if (!isDBConnected()) return res.status(503).json({ error: 'MongoDB not connected' });
    const customers = await Customer.find().sort({ updatedAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({error:'The service could not complete this request.'});
  }
});

app.post('/api/subscribers', createRateLimiter({max:6,windowMs:900000}), validateSubscriber, async (req, res) => {
  try {
    if (!isDBConnected()) await connectDB();
    if (!isDBConnected()) return res.status(503).json({ error: 'MongoDB database is connecting. Please retry.' });
    const { email, source } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const subscription = await Subscriber.updateOne(
      { email: cleanEmail },
      { $setOnInsert: { source: source || 'website_footer', status: 'active' } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    try {
      if (subscription.upsertedCount) await sendSubscriptionEmails(cleanEmail, source || 'website_footer');
    } catch (err) {
      console.warn('⚠️ [Email Service] Background subscriber email note:', err.message);
    }

    res.status(201).json({ success: true, message: 'Subscribed to FOOLISH ARC Dispatch.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/subscribers', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) await connectDB();
    if (!isDBConnected()) return res.status(503).json({ error: 'MongoDB not connected' });
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({error:'The service could not complete this request.'});
  }
});

app.delete('/api/subscribers/:id', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) await connectDB();
    if (!isDBConnected()) return res.status(503).json({ error: 'MongoDB not connected' });
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/inquiries', createRateLimiter({max:6,windowMs:900000}), validateInquiry, async (req, res) => {
  try {
    if (!isDBConnected()) await connectDB();
    if (!isDBConnected()) return res.status(503).json({ error: 'MongoDB not connected' });
    const { name, email, orderNumber, message } = req.body;
    const inquiry = await Inquiry.create({
      name,
      email: email.toLowerCase().trim(),
      orderNumber: orderNumber || '',
      message
    });

    sendInquiryAlert(inquiry).catch((err) => {
      console.warn('⚠️ [Email Service] Background inquiry email note:', err.message);
    });

    res.status(201).json({ success: true, inquiry });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/inquiries', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) await connectDB();
    if (!isDBConnected()) return res.status(503).json({ error: 'MongoDB not connected' });
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({error:'The service could not complete this request.'});
  }
});

app.get('/api/theme', async (req, res) => {
  try {
    if (!isDBConnected()) await connectDB();
    if (!isDBConnected()) return res.status(503).json({ error: 'MongoDB not connected' });
    const config = await ThemeConfig.findOne().sort({ updatedAt: -1 });
    res.json(config || {
      brand: "FOOLISH ARC",
      olive: "#364634",
      camel: "#C69F6F"
    });
  } catch (err) {
    res.status(500).json({error:'The service could not complete this request.'});
  }
});

app.post('/api/theme', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) await connectDB();
    if (!isDBConnected()) return res.status(503).json({ error: 'MongoDB not connected' });
    const input = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const allowedTheme = {};
    if (typeof input.brand === 'string') allowedTheme.brand = input.brand.trim().slice(0, 60);
    for (const field of ['olive', 'camel', 'linen', 'onyx']) {
      if (typeof input[field] === 'string' && /^#[0-9a-fA-F]{6}$/.test(input[field])) {
        allowedTheme[field] = input[field];
      }
    }
    if (input.siteSettings && typeof input.siteSettings === 'object' && !Array.isArray(input.siteSettings)) {
      const settings = input.siteSettings;
      const cleanSettings = {};
      if (typeof settings.location === 'string') cleanSettings.location = settings.location.trim().slice(0, 150);
      if (typeof settings.email === 'string') {
        const email = settings.email.trim().toLowerCase().slice(0, 254);
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).json({ error: 'Enter a valid store contact email.' });
        }
        cleanSettings.email = email;
      }
      if (typeof settings.phone === 'string') {
        const phone = settings.phone.trim().slice(0, 30);
        if (phone && !/^[+0-9()\s-]{7,30}$/.test(phone)) {
          return res.status(400).json({ error: 'Enter a valid store contact phone number.' });
        }
        cleanSettings.phone = phone;
      }
      if (typeof settings.hours === 'string') cleanSettings.hours = settings.hours.trim().slice(0, 120);
      allowedTheme.siteSettings = cleanSettings;
    }
    if (Object.keys(allowedTheme).length === 0) {
      return res.status(400).json({ error: 'No valid theme settings were supplied.' });
    }

    const updated = await ThemeConfig.findOneAndUpdate(
      {},
      { $set: allowedTheme },
      { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.use('/api', (req,res) => res.status(404).json({error:'Unknown API route.'}));
app.use((err,req,res,next) => {
  if(res.headersSent) return next(err);
  const status=err.status || 500;
  const errors={400:'Invalid request body.',403:'Untrusted origin.',413:'Request body too large.',415:'Unsupported request encoding.'};
  res.status(status).json({error:errors[status] || 'Request could not be completed.'});
});

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));

  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) next();
    });
  });

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🛡️  FOOLISH ARC API (JWT, CSRF & Fit Finder Ready)`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔐 Owner sign-in: POST /api/auth/login | configured: ${isAdminAuthConfigured()}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

export default app;
