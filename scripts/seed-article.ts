/**
 * Inserts an article from a JSON file (same shape as the admin article form).
 * Matches by slug: an existing article is left alone unless --update is passed.
 *
 *   npm run article:seed -- content/articles/web-performance-playbook.json
 *   npm run article:seed -- <file> --update    # overwrite the existing article
 *   npm run article:seed -- <file> --dry-run   # validate only, no database
 *
 * Public pages are cached, so after seeding open the article in the admin and
 * Save/Publish it there (or restart the server) to refresh the site.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnv } from "./_env";

loadEnv();

async function main() {
  const file = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!file) throw new Error("Usage: npm run article:seed -- <path/to/article.json> [--update] [--dry-run]");
  const update = process.argv.includes("--update");
  const dryRun = process.argv.includes("--dry-run");

  const raw: unknown = JSON.parse(readFileSync(resolve(process.cwd(), file), "utf8"));
  const { articleInputSchema } = await import("@/lib/validation/content");
  const parsed = articleInputSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Invalid article JSON:");
    for (const issue of parsed.error.issues) console.error(`  ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    process.exit(1);
  }
  const { slug, title, blocks } = parsed.data;
  console.log(`Valid: "${title}" (/${slug}, ${blocks.length} blocks)`);
  if (dryRun) return;

  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set (add it to .env.local).");
  const { connectDB, disconnectDB } = await import("@/lib/db");
  const { createDocument, updateDocument } = await import("@/lib/admin/crud");
  const { ArticleModel } = await import("@/lib/models");
  const { ValidationError } = await import("@/lib/admin/errors");

  await connectDB();
  try {
    const existing = await ArticleModel.findOne({ slug }).select("_id").lean();
    if (existing && !update) {
      console.log(`Skipped: an article with slug "${slug}" already exists (pass --update to overwrite).`);
      return;
    }
    if (existing) {
      await updateDocument("articles", String(existing._id), raw);
      console.log(`Updated article ${existing._id}.`);
    } else {
      const created = await createDocument<{ id: string }>("articles", raw);
      console.log(`Created article ${created.id}.`);
    }
  } catch (error) {
    if (error instanceof ValidationError) throw new Error(`Invalid article: ${JSON.stringify(error.fieldErrors)}`);
    throw error;
  } finally {
    await disconnectDB();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
