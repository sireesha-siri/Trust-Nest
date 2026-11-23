import './env.js';
import mongoose from 'mongoose';

/**
 * Safely sanitizes a MongoDB connection URI for console logging without leaking credentials.
 */
function sanitizeUri(uri: string): string {
  return uri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
}

/**
 * Connects to MongoDB Atlas using process.env.MONGODB_URI.
 * 
 * Rules:
 * 1. If MONGODB_URI is configured and connection fails, throw an error to prevent the server
 *    from starting in a misleading "partially connected" state.
 * 2. If MONGODB_URI is absent/empty, log a clear notice.
 */
export async function connectDB(): Promise<boolean> {
  const uri = (process.env.MONGODB_URI || '').trim();

  if (!uri) {
    console.warn('[MongoDB] Notice: MONGODB_URI is not configured in environment.');
    console.warn('[MongoDB] Persistent database features will be unavailable.');
    return false;
  }

  const sanitized = sanitizeUri(uri);

  try {
    console.log(`[MongoDB] Connecting to MongoDB Atlas cluster (${sanitized})...`);
    
    // Connect with a 10s server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    const dbName = mongoose.connection.name || 'trustnest';
    const host = mongoose.connection.host || 'Atlas';
    console.log(`[MongoDB] Successfully connected to database "${dbName}" at ${host}`);
    return true;
  } catch (error: any) {
    console.error(`[MongoDB Error] Failed to connect to MongoDB Atlas (${sanitized}): ${error.message}`);
    // If MONGODB_URI was explicitly provided but failed to connect, fail fast!
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
}

/**
 * Checks if MongoDB is currently connected.
 */
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Returns diagnostic metadata about the current database connection.
 */
export function getDatabaseStatus(): {
  connected: boolean;
  readyState: number;
  databaseName: string | null;
  host: string | null;
} {
  const readyState = mongoose.connection.readyState;
  return {
    connected: readyState === 1,
    readyState,
    databaseName: readyState === 1 ? mongoose.connection.name : null,
    host: readyState === 1 ? mongoose.connection.host : null,
  };
}
