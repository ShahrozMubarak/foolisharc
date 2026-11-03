import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let connectionPromise = null;

mongoose.connection.on('disconnected', () => {
  connectionPromise = null;
});

export function getMongoURI() {
  return (process.env.MONGODB_URI || '').trim();
}

export async function connectDB(retries = 2) {
  if (mongoose.connection.readyState === 1) return true;

  const uri = getMongoURI();
  if (!uri) {
    console.warn('[database] MONGODB_URI is not configured.');
    return false;
  }

  if (connectionPromise) {
    try {
      await connectionPromise;
      return mongoose.connection.readyState === 1;
    } catch {
      connectionPromise = null;
    }
  }

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      connectionPromise = mongoose.connect(uri, {
        dbName: process.env.MONGODB_DB_NAME || 'zaytoun_atelier',
        serverSelectionTimeoutMS: 7000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 0
      });
      await connectionPromise;
      console.info('[database] Connected to MongoDB.');
      return true;
    } catch (error) {
      connectionPromise = null;
      console.error(`[database] Connection attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  return mongoose.connection.readyState === 1;
}

export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

export default connectDB;
