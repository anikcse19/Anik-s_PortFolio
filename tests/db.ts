import mongoose from "mongoose";

/**
 * DB-backed tests use a throwaway database on a local MongoDB
 * (override with MONGODB_URI_TEST). They are skipped when it is unreachable.
 */
export const TEST_URI = process.env.MONGODB_URI_TEST ?? "mongodb://127.0.0.1:27017/portfolio_test";

export async function canConnect(): Promise<boolean> {
  try {
    const conn = await mongoose.createConnection(TEST_URI, { serverSelectionTimeoutMS: 1500 }).asPromise();
    await conn.close();
    return true;
  } catch {
    return false;
  }
}

export async function useTestDatabase() {
  process.env.MONGODB_URI = TEST_URI;
  const { connectDB } = await import("@/lib/db");
  await connectDB();
  await mongoose.connection.dropDatabase();
  // Rebuild indexes (unique slugs, TTLs) so tests run against the real constraints.
  const models = await import("@/lib/models");
  for (const model of Object.values(models)) await model.syncIndexes();
}

export async function closeTestDatabase() {
  const { disconnectDB } = await import("@/lib/db");
  await mongoose.connection.dropDatabase();
  await disconnectDB();
}
