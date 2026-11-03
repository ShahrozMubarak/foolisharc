import Joi from 'joi';

/**
 * 1. Newsletter Subscriber Schema Validation
 */
const subscriberSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required to subscribe.'
  }),
  source: Joi.string().trim().max(60).default('website_footer')
});

export const validateSubscriber = (req, res, next) => {
  const { error, value } = subscriberSchema.required().validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errorDetails = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ error: errorDetails });
  }
  req.body = value;
  next();
};

/**
 * 2. Concierge Inquiry Schema Validation
 */
const inquirySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters.',
    'any.required': 'Name is required.'
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Valid email is required.'
  }),
  orderNumber: Joi.string().trim().max(50).allow('', null).optional(),
  message: Joi.string().trim().min(5).max(3000).required().messages({
    'string.min': 'Message must be at least 5 characters.',
    'any.required': 'Message is required.'
  })
});

export const validateInquiry = (req, res, next) => {
  const { error, value } = inquirySchema.required().validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errorDetails = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ error: errorDetails });
  }
  req.body = value;
  next();
};

/**
 * 3. Order Checkout Schema Validation
 */
const nameRegex = /^[a-zA-Z\s]{1,70}$/;
const phoneRegex = /^(\+92|0)?3[0-9]{9}$/;
const cityRegex = /^[a-zA-Z\s]{2,50}$/;

const orderSchema = Joi.object({
  idempotencyKey: Joi.string().guid({ version: ['uuidv4', 'uuidv5'] }).required(),
  customer: Joi.object({
    firstName: Joi.string().trim().pattern(nameRegex).min(1).max(70).required(),
    lastName: Joi.string().trim().pattern(nameRegex).max(70).allow('', null).default(''),
    email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
    phone: Joi.string().trim().pattern(phoneRegex).required(),
    address: Joi.string().trim().min(8).max(300).required(),
    city: Joi.string().trim().pattern(cityRegex).min(2).max(100).required(),
    province: Joi.string().trim().max(80).allow('', null).default(''),
    postalCode: Joi.string().trim().pattern(/^[0-9]{0,8}$/).allow('', null).default(''),
    orderNotes: Joi.string().trim().max(500).allow('', null).default('')
  }).required(),
  items: Joi.array().min(1).max(30).items(Joi.object({
    id: Joi.string().trim().min(1).max(100).required(),
    productId: Joi.string().trim().min(1).max(100).optional(),
    size: Joi.string().trim().min(1).max(20).required(),
    color: Joi.string().trim().max(60).allow('', null).default(''),
    quantity: Joi.number().integer().min(1).max(20).required()
  })).required(),
  paymentMethod: Joi.string().valid('cod', 'jazzcash', 'easypaisa').default('cod'),
  paymentReceipt: Joi.string()
    .max(4 * 1024 * 1024 + 64)
    .pattern(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)
    .allow('', null)
    .optional(),
  receiptFileName: Joi.string().trim().max(160).allow('', null).optional(),
  paymentReference: Joi.object({
    senderPhone: Joi.string().trim().pattern(/^(?:\+?92|0)?3[0-9]{9}$/).allow('', null).default(''),
    transactionId: Joi.string().trim().alphanum().max(30).allow('', null).default('')
  }).optional()
}).unknown(false);

export const validateOrder = (req, res, next) => {
  const { error, value } = orderSchema.required().validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });
  if (error) {
    const errorDetails = error.details.map(detail => detail.message).join(', ');
    return res.status(400).json({ error: errorDetails, code: 'INVALID_ORDER' });
  }

  if (['jazzcash', 'easypaisa'].includes(value.paymentMethod) && !value.paymentReceipt) {
    return res.status(400).json({
      error: `A payment receipt image is required for ${value.paymentMethod.toUpperCase()}.`,
      code: 'PAYMENT_PROOF_REQUIRED'
    });
  }

  if (value.paymentReceipt) {
    const [type,encoded]=value.paymentReceipt.split(',');
    const bytes=Buffer.from(encoded,'base64');
    const png=bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'));
    const jpeg=bytes.subarray(0,3).equals(Buffer.from('ffd8ff','hex'));
    const webp=bytes.toString('ascii',0,4)==='RIFF' && bytes.toString('ascii',8,12)==='WEBP';
    if (!(type.includes('png') && png || type.includes('jpeg') && jpeg || type.includes('webp') && webp) || bytes.length>3*1024*1024)
      return res.status(400).json({error:'Upload a JPG, PNG or WebP receipt of at most 3 MB.'});
  }
  req.body = value;
  return next();
};

/**
 * 4. Product Catalog Item Validation
 */
function sanitizeMongoInput(value) {
  if (Array.isArray(value)) return value.map(sanitizeMongoInput);
  if (!value || typeof value !== 'object' || value instanceof Date) return value;

  const clean = {};
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith('$') || key.includes('.') || ['__proto__', 'prototype', 'constructor'].includes(key)) continue;
    clean[key] = sanitizeMongoInput(child);
  }
  return clean;
}

const productSchema = Joi.object({
  id: Joi.string().max(100).optional(),
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().min(0).max(2000000).required(),
  category: Joi.string().max(50).default('Apparel'),
  person: Joi.string().valid('women', 'men', 'kids').default('women'),
  slot: Joi.string().valid('top', 'bottom', 'outer', 'dress').default('top')
}).unknown(true);

export const validateProduct = (req, res, next) => {
  const input = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? sanitizeMongoInput(req.body) : {};
  if (Object.keys(input).some(key => key.startsWith('$') || key.includes('.') || key === '__proto__' || key === 'constructor')) {
    return res.status(400).json({ error: 'Invalid product fields.' });
  }
  const { error, value } = productSchema.validate(input, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errorDetails = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ error: errorDetails });
  }
  req.body = value;
  next();
};

/**
 * 5. Fit Finder Joi Validation Schemas (Spec #6)
 */
const fitRecommendSchema = Joi.object({
  productId: Joi.string().trim().max(100).required(),
  heightUnit: Joi.string().valid('cm', 'ft_in').default('cm'),
  heightCm: Joi.number().min(90).max(230).optional(),
  heightFt: Joi.number().integer().min(3).max(7).optional(),
  heightIn: Joi.number().min(0).max(11.9).optional(),
  weightUnit: Joi.string().valid('kg', 'lbs').default('kg'),
  weightKg: Joi.number().min(14).max(200).optional(),
  weightLbs: Joi.number().min(30).max(440).optional(),
  fitPreference: Joi.string().valid('slim', 'regular', 'relaxed').default('regular'),
  cutCategory: Joi.string().valid('mens', 'womens', 'unisex', 'kids', 'men', 'women').default('mens'),
  measurementUnit: Joi.string().valid('cm', 'in').default('cm'),
  chest: Joi.number().min(20).max(165).allow(null).optional(),
  waist: Joi.number().min(18).max(160).allow(null).optional(),
  hip: Joi.number().min(22).max(170).allow(null).optional(),
  bodyShape: Joi.string().valid('average', 'broad_shoulders', 'athletic', 'curvy').allow(null, '').optional(),
  referenceBrand: Joi.object({
    brandName: Joi.string().max(60).allow(null, ''),
    sizeOwned: Joi.string().max(20).allow(null, '')
  }).allow(null).optional(),
  shoppingForSomeoneElse: Joi.boolean().default(false)
});

const fitProfileSaveSchema = fitRecommendSchema.keys({
  productId: Joi.string().trim().max(100).optional(),
  consentGiven: Joi.boolean().valid(true).required().messages({
    'any.only': 'Explicit customer consent is required before saving body measurements.'
  }),
  guestToken: Joi.string().trim().min(6).max(128).optional()
});

const fitFeedbackSchema = Joi.object({
  orderId: Joi.string().trim().min(2).max(80).required(),
  productId: Joi.string().trim().min(1).max(100).required(),
  sizeOrdered: Joi.string().trim().min(1).max(20).required(),
  recommendedSize: Joi.string().trim().max(20).allow('', null).optional(),
  fitResult: Joi.string().valid('too small', 'perfect', 'too large').required(),
  sourceChannel: Joi.string().valid('whatsapp', 'web', 'return_portal').default('whatsapp')
});

export const validateFitRecommend = (req, res, next) => {
  const { error, value } = fitRecommendSchema.required().validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ error: error.details.map(d => d.message).join(', ') });
  }
  req.body = value;
  return next();
};

export const validateFitProfile = (req, res, next) => {
  if (req.body?.shoppingForSomeoneElse) {
    return res.status(400).json({
      error: 'Profiles are not saved when shopping for someone else.'
    });
  }
  const { error, value } = fitProfileSaveSchema.required().validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ error: error.details.map(d => d.message).join(', ') });
  }
  req.body = value;
  return next();
};

export const validateFitFeedback = (req, res, next) => {
  const { error, value } = fitFeedbackSchema.required().validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ error: error.details.map(d => d.message).join(', ') });
  }
  req.body = value;
  return next();
};
