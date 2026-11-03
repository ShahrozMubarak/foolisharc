import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    name: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    avatar: { type: String },
    googleId: { type: String },
    authProvider: { type: String, default: 'google' },
    password: { type: String, select: false },
    role: { type: String, default: 'customer' },
    verified: { type: Boolean, default: true },
    loginCount: { type: Number, default: 1 },
    lastLoginAt: { type: Date, default: Date.now },
    ordersCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
