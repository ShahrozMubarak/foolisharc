import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    orderId: String,
    productId: String,
    sizeOrdered: String,
    recommendedSize: String,
    fitResult: String,
    sourceChannel: String,
  },
  { timestamps: true },
);
export default mongoose.models.FitFeedback ||
  mongoose.model('FitFeedback', schema);
