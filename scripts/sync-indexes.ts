/** Creates/updates MongoDB indexes (production disables Mongoose autoIndex). Run after deploys that change models. */
import { loadEnv } from "./_env";

loadEnv();

async function main() {
  const { connectDB, disconnectDB } = await import("@/lib/db");
  const models = await import("@/lib/models");
  await connectDB();
  for (const [name, model] of Object.entries(models)) {
    await model.syncIndexes();
    console.log(`✓ ${name}`);
  }
  await disconnectDB();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
