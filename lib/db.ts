import mongoose from "mongoose";

/**
 * MongoDB connection shared across invocations of a warm serverless instance.
 * The promise is cached on globalThis so hot reloads and concurrent requests
 * reuse a single connection pool instead of opening new ones.
 */

type ConnectionCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalForMongoose = globalThis as unknown as { __mongoose?: ConnectionCache };
const cache: ConnectionCache = globalForMongoose.__mongoose ?? { conn: null, promise: null };
globalForMongoose.__mongoose = cache;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("MONGODB_URI is not set. Add it to your environment (see .env.example).");
    this.name = "DatabaseNotConfiguredError";
  }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn;

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new DatabaseNotConfiguredError();

  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB?.trim() || undefined,
        bufferCommands: false,
        // Small pool: each serverless instance handles few concurrent requests,
        // and Atlas free-tier clusters cap total connections at 500.
        maxPoolSize: 5,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 30000,
        // Index builds run via `npm run db:indexes` in production instead of on every cold start.
        autoIndex: process.env.NODE_ENV !== "production",
      })
      .catch((error: unknown) => {
        cache.promise = null;
        throw error;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export async function disconnectDB(): Promise<void> {
  if (cache.conn) await cache.conn.disconnect();
  cache.conn = null;
  cache.promise = null;
}

/** Mongo duplicate-key error (unique index violation). */
export function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}
