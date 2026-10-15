/**
 * Onboarding: populates the database with the portfolio's current content and
 * (optionally) the first admin account. Safe to run repeatedly — existing items
 * (matched by slug, or organization + title) and existing settings are kept.
 *
 *   npm run onboard                      # seed content + settings, create admin from ADMIN_* env vars
 *   npm run onboard -- --force-settings  # overwrite settings with the seed values
 */
import { loadEnv } from "./_env";

loadEnv();

async function main() {
  const { connectDB, disconnectDB } = await import("@/lib/db");
  const { createDocument } = await import("@/lib/admin/crud");
  const { writeSettings } = await import("@/lib/admin/settings");
  const { ValidationError } = await import("@/lib/admin/errors");
  const models = await import("@/lib/models");
  const data = await import("./seed-data");
  const { provisionAdmin } = await import("./_admin");
  const forceSettings = process.argv.includes("--force-settings");

  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set (add it to .env.local).");
  await connectDB();
  console.log("Connected. Syncing indexes…");
  for (const model of Object.values(models)) await model.syncIndexes();

  const report = (label: string, created: number, skipped: number) => console.log(`  ${label.padEnd(16)} ${created} created, ${skipped} already present`);

  async function seed<T extends Record<string, unknown>>(label: string, key: Parameters<typeof createDocument>[0], items: T[], exists: (item: T) => Promise<boolean>) {
    let created = 0;
    let skipped = 0;
    for (const item of items) {
      if (await exists(item)) {
        skipped++;
        continue;
      }
      try {
        await createDocument(key, item);
        created++;
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new Error(`${label}: invalid seed item ${JSON.stringify(error.fieldErrors)}`);
        }
        throw error;
      }
    }
    report(label, created, skipped);
  }

  console.log("Content:");
  await seed("Projects", "projects", data.projects, async (p) => Boolean(await models.ProjectModel.exists({ slug: p.slug })));
  await seed("Case studies", "caseStudies", data.caseStudies, async (c) => Boolean(await models.CaseStudyModel.exists({ slug: c.slug })));
  await seed("Articles", "articles", data.articles, async (a) => Boolean(await models.ArticleModel.exists({ slug: a.slug })));
  await seed("Experience", "experience", data.experiences, async (e) => Boolean(await models.ExperienceModel.exists({ organization: e.organization, title: e.title })));
  await seed("Skills", "skills", data.skillCategories, async (s) => Boolean(await models.SkillCategoryModel.exists({ slug: s.slug })));

  console.log("Settings:");
  const settings = { profile: data.profile, contact: data.contact, about: data.about } as const;
  for (const [key, value] of Object.entries(settings) as [keyof typeof settings, unknown][]) {
    const exists = await models.SettingModel.exists({ key });
    if (exists && !forceSettings) {
      console.log(`  ${key.padEnd(16)} kept existing`);
      continue;
    }
    await writeSettings(key, value);
    console.log(`  ${key.padEnd(16)} written`);
  }
  if (!(await models.SettingModel.exists({ key: "homepage" })) || forceSettings) {
    await models.SettingModel.updateOne({ key: "homepage" }, { $set: { value: data.homepage } }, { upsert: true });
    console.log(`  ${"homepage".padEnd(16)} written`);
  } else {
    console.log(`  ${"homepage".padEnd(16)} kept existing`);
  }

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const result = await provisionAdmin({
      email: process.env.ADMIN_EMAIL,
      name: process.env.ADMIN_NAME ?? "",
      password: process.env.ADMIN_PASSWORD,
      allowReset: false,
    });
    console.log(`Admin: ${process.env.ADMIN_EMAIL} ${result === "created" ? "created" : "already exists (unchanged)"}`);
  } else {
    console.log("Admin: skipped (set ADMIN_EMAIL and ADMIN_PASSWORD, or run `npm run admin:create`).");
  }

  await disconnectDB();
  console.log("\nDone. Drafts that need your review: experience entries for Betafore, SoftHexis and RexVet, and the portfolio case study.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
