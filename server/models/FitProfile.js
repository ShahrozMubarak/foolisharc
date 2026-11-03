import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    owner: { type: String, required: true, unique: true, select: false },
    measurements: { chestCm: Number, waistCm: Number, hipCm: Number },
    fitPreference: String,
    consentGiven: { type: Boolean, required: true },
  },
  { timestamps: true },
);
export default mongoose.models.FitProfile ||
  mongoose.model('FitProfile', schema);
