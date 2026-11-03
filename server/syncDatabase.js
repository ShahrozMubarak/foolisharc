import { connectDB } from './db.js';
import Product from './models/Product.js';
import { SEED_PRODUCTS } from './seedData.js';

async function seedEmptyCatalog() {
  const connected = await connectDB();
  if (!connected) {
    console.error('Database is unavailable. Check MONGODB_URI.');
    process.exitCode = 1;
    return;
  }

  const count = await Product.countDocuments();
  if (count > 0) {
    console.info(`Catalog already contains ${count} products. No changes were made.`);
    console.info('This script never deletes or overwrites owner-managed catalog records.');
    return;
  }

  const inserted = await Product.insertMany(SEED_PRODUCTS, { ordered: false });
  console.info(`Seeded ${inserted.length} products into the empty catalog.`);
}

seedEmptyCatalog()
  .catch(error => {
    console.error('Catalog seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect().catch(() => {});
  });
