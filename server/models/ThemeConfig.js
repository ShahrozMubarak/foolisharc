import mongoose from 'mongoose';

const ThemeConfigSchema = new mongoose.Schema(
  {
    brand: { type: String, default: 'FOOLISH ARC' },
    olive: { type: String, default: '#364634' },
    camel: { type: String, default: '#C69F6F' },
    linen: { type: String, default: '#FAF8F5' },
    onyx: { type: String, default: '#111315' },
    siteSettings: {
      location: { type: String, maxlength: 150, default: '' },
      email: { type: String, maxlength: 254, default: '' },
      phone: { type: String, maxlength: 30, default: '' },
      hours: { type: String, maxlength: 120, default: '' }
    }
  },
  {
    timestamps: true
  }
);

export const ThemeConfig = mongoose.models.ThemeConfig || mongoose.model('ThemeConfig', ThemeConfigSchema);
export default ThemeConfig;
