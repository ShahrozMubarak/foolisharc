import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

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
import { generateAdminToken, requireAdminAuth, verifyAdminPassword } from './middleware/auth.js';
import { validateSubscriber, validateInquiry, validateOrder, validateProduct } from './middleware/validation.js';
import { sendOrderEmails, sendOrderStatusEmail, sendSubscriptionEmails, sendInquiryAlert, sendInquiryEmails } from './services/emailService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
function createRateLimiter(options = {}) { const windowMs = options.windowMs || 15 * 60 * 1000; const max = options.max || 100; const message = options.message || 'Too many requests, please try again later.'; const hits = new Map(); const middleware = (req, res, next) => { const key = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'global'; const now = Date.now(); const record = hits.get(key) || { count: 0, resetTime: now + windowMs }; if (now > record.resetTime) { record.count = 0; record.resetTime = now + windowMs; } record.count += 1; hits.set(key, record); if (record.count > max) { return res.status(429).json({ error: message }); } next(); }; if (options && options.headers && typeof max === 'object' && typeof message === 'function') { return middleware(options, max, message); } return middleware; }

// Ensure MongoDB connection on API requests (supports serverless & Vercel cold starts)
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && !isDBConnected()) {
    try {
      await connectDB();
    } catch (e) {
      console.warn("DB connect middleware note:", e.message);
    }
  }
  next();
});

// Helper: Seed or sync initial products if MongoDB collection is empty or incomplete
const seedProductsIfEmpty = async () => {
  try {
    const count = await Product.countDocuments();
    if (count < 20) {
      console.log(`🌱 [MongoDB] Syncing full luxury catalog into database (${count} currently in DB)...`);
      for (const prod of SEED_PRODUCTS) {
        await Product.findOneAndUpdate(
          { id: prod.id },
          { $set: prod },
          { upsert: true, returnDocument: 'after' }
        );
      }
      const updatedCount = await Product.countDocuments();
      console.log(`✅ [MongoDB] Successfully synced full catalog! Total products in MongoDB Atlas: ${updatedCount}`);
    }
  } catch (err) {
    console.warn('⚠️ [MongoDB] Auto-seed note:', err.message);
  }
};

// Initialize Database
connectDB().then((connected) => {
  if (connected) {
    seedProductsIfEmpty();
  }
});

// ============================================================================
// 1. AUTHENTICATION & SECURITY (JWT Token with Expiry)
// ============================================================================

/**
 * Admin Login: issues a signed JWT token that expires in 8 hours
 */
app.post('/api/auth/login', createRateLimiter({ max: 20, windowMs: 15 * 60 * 1000 }), (req, res) => {
  const { password, username } = req.body;

  if (username && username.trim().toLowerCase() !== 'shahroz') {
    return res.status(401).json({
      error: 'Invalid administrator username or credentials.',
      code: 'AUTH_FAILED'
    });
  }

  if (!password) {
    return res.status(400).json({ error: 'Passcode is required.' });
  }

  if (!verifyAdminPassword(password)) {
    return res.status(401).json({
      error: 'Incorrect admin passcode.',
      code: 'AUTH_FAILED'
    });
  }

  // Issue expiring JWT token
  const adminUser = (username || 'shahroz').trim().toLowerCase();
  const token = generateAdminToken(adminUser);
  console.log(`🔑 [Security] Admin login successful for user "${adminUser}". Token generated.`);

  res.json({
    success: true,
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    admin: adminUser
  });
});

/**
 * Admin Session Verification
 */
app.get('/api/auth/verify', requireAdminAuth, (req, res) => {
  res.json({
    valid: true,
    admin: req.admin
  });
});

/**
 * Client Google & Account Authentication - Persists to MongoDB Atlas
 * Upserts customer & user record so account and sign-in info is stored in DB.
 */
app.post('/api/auth/google-client', async (req, res) => {
  try {
    const { name, email, avatar, googleId, authProvider = 'google' } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    if (!isDBConnected()) {
      await connectDB();
    }

    const cleanEmail = email.toLowerCase().trim();
    const parts = (name || '').trim().split(' ');
    const firstName = parts[0] || 'Client';
    const lastName = parts.slice(1).join(' ') || '';
    const resolvedAvatar = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || cleanEmail)}`;

    let savedUser = null;
    let savedCustomer = null;

    if (isDBConnected()) {
      // 1. Persist directly to `users` collection in MongoDB Atlas
      savedUser = await User.findOneAndUpdate(
        { email: cleanEmail },
        {
          $setOnInsert: {
            email: cleanEmail,
            ordersCount: 0,
            totalSpent: 0
          },
          $set: {
            name: name || `${firstName} ${lastName}`.trim() || cleanEmail.split('@')[0],
            firstName,
            lastName,
            avatar: resolvedAvatar,
            googleId: googleId || '',
            authProvider,
            lastLoginAt: new Date(),
            verified: true
          },
          $inc: { loginCount: 1 }
        },
        { upsert: true, returnDocument: 'after' }
      );

      // 2. Persist directly to `customers` collection in MongoDB Atlas
      savedCustomer = await Customer.findOneAndUpdate(
        { email: cleanEmail },
        {
          $setOnInsert: {
            email: cleanEmail,
            ordersCount: 0,
            totalSpent: 0,
            orderHistory: []
          },
          $set: {
            name: name || `${firstName} ${lastName}`.trim() || cleanEmail.split('@')[0],
            firstName,
            lastName,
            avatar: resolvedAvatar,
            googleId: googleId || '',
            authProvider,
            lastLoginAt: new Date()
          },
          $inc: { loginCount: 1 }
        },
        { upsert: true, returnDocument: 'after' }
      );

      console.log(`👤 [MongoDB] Account saved in both 'users' and 'customers' collections: ${cleanEmail}`);
    }

    res.json({
      success: true,
      user: {
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        firstName,
        lastName,
        avatar: resolvedAvatar,
        googleId: googleId || '',
        authProvider,
        syncedToDB: Boolean(savedUser || savedCustomer)
      }
    });
  } catch (err) {
    console.warn('⚠️ [MongoDB] Error syncing client account:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * View All Registered Users (Protected for Studio Admin)
 */
app.get('/api/users', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    const users = await User.find().sort({ lastLoginAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2. Health & System Status
 */
app.get('/api/health', (req, res) => {
  const connected = isDBConnected();
  const uri = getMongoURI();
  res.json({
    status: 'online',
    database: connected ? 'connected' : 'waiting_for_connection_link',
    hasMongoURI: Boolean(uri && uri.trim().length > 0),
    auth: 'JWT_PROTECTED',
    security: 'JOI_VALIDATED',
    message: connected
      ? 'MongoDB is connected, secured with JWT tokens & Joi schemas!'
      : 'Server is running.'
  });
});

// ============================================================================
// 3. PRODUCTS API
// ============================================================================

// Public: View Catalog
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
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: Add/Update Product in Studio (Requires JWT + Joi Validation)
app.post('/api/products', requireAdminAuth, validateProduct, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const productData = req.body;
    if (!productData.id) {
      productData.id = `forme-${Date.now()}`;
    }

    const product = await Product.findOneAndUpdate(
      { id: productData.id },
      productData,
      { returnDocument: 'after', upsert: true }
    );
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Protected: Update existing product (Requires JWT + Joi Validation)
app.put('/api/products/:id', requireAdminAuth, validateProduct, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const updated = await Product.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Protected: Delete product (Requires JWT)
app.delete('/api/products/:id', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const result = await Product.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, deleted: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// 4. ORDERS API
// ============================================================================

// Protected: View All Customer Orders in Studio (Requires JWT)
app.get('/api/orders', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: Customer tracking by Order Number
app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const rawQuery = String(req.params.orderNumber || '').trim();
    const queryRegex = new RegExp(`^${rawQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const order = await Order.findOne({
      $or: [
        { orderNumber: queryRegex },
        { id: queryRegex },
        { orderNumber: rawQuery },
        { id: rawQuery }
      ]
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: Create order from checkout (Protected by Joi Schema validation)
app.post('/api/orders', validateOrder, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB database is connecting or unavailable. Please retry in a few moments.' });
    }
    const orderData = req.body;
    if (!orderData.customer?.googleVerified) {
      return res.status(403).json({
        error: 'Authentication Required: You must be signed in with Google to place an order.'
      });
    }

    if (!orderData.orderNumber) {
      orderData.orderNumber = `ZYT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!orderData.status) {
      orderData.status = 'pending';
    }
    const newOrder = await Order.create(orderData);
    console.log(`📦 [MongoDB] Order created successfully: ${newOrder.orderNumber} (Status: ${newOrder.status})`);

    // Update Customer Profile and User Profile in MongoDB Atlas
    if (orderData.customer?.email) {
      const email = orderData.customer.email.toLowerCase().trim();
      const fullName = [orderData.customer.firstName, orderData.customer.lastName]
        .filter(Boolean)
        .join(' ') || orderData.customer.name || 'Valued Client';

      try {
        await Customer.findOneAndUpdate(
          { email },
          {
            $set: {
              firstName: orderData.customer.firstName,
              lastName: orderData.customer.lastName,
              name: fullName,
              phone: orderData.customer.phone,
              address: orderData.customer.address,
              city: orderData.customer.city,
              province: orderData.customer.province,
              postalCode: orderData.customer.postalCode,
              lastOrderDate: new Date()
            },
            $inc: {
              ordersCount: 1,
              totalSpent: Number(orderData.total || 0)
            },
            $addToSet: {
              orderHistory: newOrder.orderNumber
            }
          },
          { upsert: true, returnDocument: 'after' }
        );

        // Also update User record in MongoDB Atlas
        await User.findOneAndUpdate(
          { email },
          {
            $set: {
              firstName: orderData.customer.firstName,
              lastName: orderData.customer.lastName,
              name: fullName,
              lastOrderDate: new Date()
            },
            $inc: {
              ordersCount: 1,
              totalSpent: Number(orderData.total || 0)
            }
          },
          { upsert: true }
        );

        // Auto enroll in newsletter
        await Subscriber.findOneAndUpdate(
          { email },
          { $setOnInsert: { email, source: 'checkout_order', status: 'active' } },
          { upsert: true }
        );
      } catch (custErr) {
        console.warn('⚠️ [MongoDB] Note on customer/user profile save:', custErr.message);
      }
    }

    // Trigger Automated Email Delivery (to Customer + Owner Alert)
    try {
      await sendOrderEmails(newOrder);
    } catch (err) {
      console.warn('⚠️ [Email Service] Background order email note:', err.message);
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('❌ [MongoDB] Order creation failed:', err.message);
    res.status(500).json({ error: err.message || 'Failed to save order to database' });
  }
});

// Protected: Update order status (Requires JWT)
app.patch('/api/orders/:id/status', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const orderParam = req.params.id;
    const { status, trackingNumber, courier, cancelReason, cancelNote, review } = req.body || {};
    const normalizedStatus = status ? String(status).toLowerCase().trim() : 'pending';
    const rawParam = String(orderParam || '').trim();
    const safeRegex = new RegExp(`^${rawParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const filter = mongoose.Types.ObjectId.isValid(rawParam)
      ? { $or: [{ _id: rawParam }, { id: safeRegex }, { orderNumber: safeRegex }, { id: rawParam }, { orderNumber: rawParam }] }
      : { $or: [{ id: safeRegex }, { orderNumber: safeRegex }, { id: rawParam }, { orderNumber: rawParam }] };
    
    const updatePayload = { status: normalizedStatus };
    if (trackingNumber) updatePayload.trackingNumber = trackingNumber;
    if (courier) updatePayload.courier = courier;
    if (cancelReason) updatePayload.cancelReason = cancelReason;
    if (cancelNote) updatePayload.cancelNote = cancelNote;
    if (review) updatePayload.review = review;
    if (normalizedStatus === 'approved') {
      updatePayload.approvedAt = new Date();
    }

    const updated = await Order.findOneAndUpdate(
      filter,
      updatePayload,
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ error: 'Order not found' });

    // Trigger Automated Order Status Email to Customer
    sendOrderStatusEmail(updated, normalizedStatus).catch((err) => {
      console.warn('⚠️ [Email Service] Background order status email note:', err.message);
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Protected: Approve Order from Studio (Sets status='approved', assigns tracking, triggers notification)
app.post('/api/orders/:id/approve', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }

    const orderId = req.params.id;
    const generatedTracking = `TCS-${Math.floor(10000000 + Math.random() * 90000000)}-PK`;

    const rawParam = String(orderId || '').trim();
    const safeRegex = new RegExp(`^${rawParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const filter = mongoose.Types.ObjectId.isValid(rawParam)
      ? { $or: [{ _id: rawParam }, { id: safeRegex }, { orderNumber: safeRegex }, { id: rawParam }, { orderNumber: rawParam }] }
      : { $or: [{ id: safeRegex }, { orderNumber: safeRegex }, { id: rawParam }, { orderNumber: rawParam }] };

    const updated = await Order.findOneAndUpdate(
      filter,
      {
        $set: {
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: req.user?.username || 'shahroz',
          trackingNumber: generatedTracking,
          courier: 'TCS Express'
        }
      },
      { returnDocument: 'after' }
    );

    if (!updated) return res.status(404).json({ error: 'Order not found' });

    // Trigger Automated Order Approved Email to Customer
    sendOrderStatusEmail(updated, 'approved').catch((err) => {
      console.warn('⚠️ [Email Service] Order approval email note:', err.message);
    });

    console.log(`✅ [Studio] Order #${updated.orderNumber} APPROVED. Tracking assigned: ${generatedTracking}`);
    res.json({
      success: true,
      order: updated,
      trackingNumber: generatedTracking,
      message: `Order #${updated.orderNumber} successfully approved and tracking activated!`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// 5. CUSTOMERS & SUBSCRIBERS DIRECTORY (Protected by JWT)
// ============================================================================

// Protected: View Customer Directory (Requires JWT)
app.get('/api/customers', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const customers = await Customer.find().sort({ updatedAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: Subscribe to newsletter (Protected by Joi Schema validation)
app.post('/api/subscribers', validateSubscriber, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB database is connecting. Please retry.' });
    }
    const { email, source } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const subscriber = await Subscriber.findOneAndUpdate(
      { email: cleanEmail },
      {
        $set: {
          source: source || 'website_footer',
          status: 'active'
        }
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    console.log(`📬 [MongoDB] Newsletter subscriber stored: ${cleanEmail}`);

    // Trigger Automated Subscription Email Delivery (to Subscriber + Owner Alert)
    try {
      await sendSubscriptionEmails(cleanEmail, source || 'website_footer');
    } catch (err) {
      console.warn('⚠️ [Email Service] Background subscriber email note:', err.message);
    }

    res.status(201).json({ success: true, message: 'Subscribed to Zaytoun Gazette.', subscriber });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Protected: View all subscribers (Requires JWT)
app.get('/api/subscribers', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: Remove a subscriber (Requires JWT)
app.delete('/api/subscribers/:id', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// 6. CONCIERGE & INQUIRIES API
// ============================================================================

// Public: Contact form submission (Protected by Joi Schema validation)
app.post('/api/inquiries', validateInquiry, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const { name, email, orderNumber, message } = req.body;
    const inquiry = await Inquiry.create({
      name,
      email: email.toLowerCase().trim(),
      orderNumber: orderNumber || '',
      message
    });
    console.log(`💌 [MongoDB] Concierge inquiry stored: ${inquiry.email}`);

    // Trigger Automated Inquiry Alert to Store Owner
    sendInquiryAlert(inquiry).catch((err) => {
      console.warn('⚠️ [Email Service] Background inquiry email note:', err.message);
    });

    res.status(201).json({ success: true, inquiry });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Protected: View inquiries (Requires JWT)
app.get('/api/inquiries', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// 7. THEME & APPEARANCE API
// ============================================================================

// Public: Get brand appearance
app.get('/api/theme', async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const config = await ThemeConfig.findOne().sort({ updatedAt: -1 });
    res.json(config || {
      brand: "ZAYTOUN",
      olive: "#364634",
      camel: "#C69F6F"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: Update brand appearance (Requires JWT)
app.post('/api/theme', requireAdminAuth, async (req, res) => {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    const updated = await ThemeConfig.findOneAndUpdate(
      {},
      req.body,
      { returnDocument: 'after', upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Serve static client assets in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// For non-API routes, fallback to index.html for client-side routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Start Server (when not running in Vercel serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🛡️  ZAYTOUN ATELIER API (JWT Protected & Joi Validated)`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔐 Admin: "shahroz" | Auth: POST /api/auth/login`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

export default app;
