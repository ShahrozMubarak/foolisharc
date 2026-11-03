import { createHash, randomBytes } from 'node:crypto';
import { Router } from 'express';
import FitProfile from '../models/FitProfile.js';
import FitFeedback from '../models/FitFeedback.js';
import { connectDB } from '../db.js';
import { normalizeFitInputs } from '../../src/engine/fitFinderEngine.js';
import { parseCookie, verifyCustomerSession } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import {
  validateFitProfile,
  validateFitFeedback,
} from '../middleware/validation.js';
const router = Router();
const key = 'foolisharc_fit_guest';
const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api',
};
function ownerFor(req, res, create = false) {
  const user = verifyCustomerSession(req);
  if (user) return 'account:' + user.email;
  let token = parseCookie(req, key);
  if (!/^[0-9a-f]{64}$/.test(token)) {
    if (!create) return null;
    token = randomBytes(32).toString('hex');
    res.cookie(key, token, { ...options, maxAge: 90 * 86400000 });
  }
  return 'guest:' + createHash('sha256').update(token).digest('hex');
}
router.post(
  '/profile',
  createRateLimiter({ max: 30 }),
  validateFitProfile,
  async (req, res) => {
    const measurements = normalizeFitInputs(req.body);
    if (!Object.values(measurements).some(Number.isFinite))
      return res
        .status(400)
        .json({ error: 'Enter a measurement before saving.' });
    if (!(await connectDB()))
      return res
        .status(503)
        .json({ error: 'Measurements could not be saved. Try again later.' });
    const profile = {
      measurements,
      fitPreference: req.body.fitPreference,
      consentGiven: true,
    };
    await FitProfile.updateOne(
      { owner: ownerFor(req, res, true) },
      { $set: profile },
      { upsert: true, runValidators: true },
    );
    return res.status(201).json({ profile });
  },
);
router.get('/profile', async (req, res) => {
  const owner = ownerFor(req, res);
  if (!owner) return res.json({ profile: null });
  if (!(await connectDB()))
    return res.status(503).json({ error: 'Saved measurements unavailable.' });
  return res.json({
    profile: await FitProfile.findOne({ owner })
      .select('measurements fitPreference -_id')
      .lean(),
  });
});
router.delete('/profile', async (req, res) => {
  const owner = ownerFor(req, res);
  if (owner) {
    if (!(await connectDB()))
      return res
        .status(503)
        .json({
          error: 'Unable to delete your measurements. Try again later.',
        });
    await FitProfile.deleteOne({ owner });
    if (owner.startsWith('guest:')) res.clearCookie(key, options);
  }
  return res.json({ deleted: true });
});
router.post(
  '/feedback',
  createRateLimiter({ max: 30 }),
  validateFitFeedback,
  async (req, res) => {
    if (!(await connectDB()))
      return res.status(503).json({ error: 'Feedback could not be saved.' });
    const saved = await FitFeedback.create(req.body);
    return res.status(201).json({ success: true, feedbackId: saved._id });
  },
);
export default router;
