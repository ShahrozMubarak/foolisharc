import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true, trim: true },
  id: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  size: { type: String, required: true, trim: true },
  color: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1, max: 20 },
  unitPrice: { type: Number, required: true, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  requestHash: {type:String,select:false},
  idempotencyKey: { type: String, unique: true, sparse: true, select: false },
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    name: { type: String, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    orderNotes: { type: String, default: '' }
  },
  items: { type: [OrderItemSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },
  subtotal: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, required: true, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  pricing: { type: Object, default: {} },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cod', 'jazzcash', 'easypaisa']
  },
  paymentReceipt: { type: String, select: false },
  paymentReference: {
    senderPhone: { type: String, default: '' },
    transactionId: { type: String, default: '' }
  },
  receiptFileName: { type: String, default: '' },
  receiptUploadedAt: { type: Date },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'approved', 'processing', 'dispatched', 'shipped', 'delivered', 'cancelled']
  },
  approvedAt: { type: Date },
  approvedBy: { type: String },
  whatsappNotificationSent: { type: Boolean, default: false },
  courier: { type: String, default: 'Pending assignment' },
  trackingNumber: { type: String, default: '' },
  cancelReason: { type: String, default: '' },
  cancelNote: { type: String, default: '' },
  review: {
    rating: { type: Number, min: 1, max: 5 },
    fitRating: { type: String, default: '' },
    craftHighlights: { type: [String], default: [] },
    comment: { type: String, maxlength: 1200, default: '' },
    authorName: { type: String, default: 'Verified customer' },
    reviewedAt: { type: Date },
    verified: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now },
  date: { type: String }
}, {
  timestamps: true,
  strict: true
});

OrderSchema.index({ 'customer.email': 1, createdAt: -1 });

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export default Order;
