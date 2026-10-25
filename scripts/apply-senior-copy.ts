/**
 * Rewrites the site copy that undersold senior experience ("growing focus",
 * "deliberately growing toward", "not yet run in production") and switches the
 * look to the Precision typography + Cobalt accent.
 *
 * Only the fields listed below are touched. Every previous value is saved to
 * backups/ first, so the change can be reverted by hand from the admin panel.
 *
 *   npm run copy:senior              # dry run: prints old → new, writes nothing
 *   npm run copy:senior -- --apply   # backs up, then writes to MONGODB_URI
 *
 * Public pages are cached; after applying, save any settings page in the admin
 * (or wait up to an hour) for the live site to pick up the change.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnv } from "./_env";

loadEnv();

const COPY = {
  positioning:
    "Senior full-stack engineer building production web platforms for teams in the United States, the UAE and Bangladesh, across healthcare, e-commerce and logistics. I own products end to end: architecture, APIs, data models and the interfaces people use every day.",
  homeIntroHeading: "What I do",
  homeIntro:
    "I design and build production web applications end to end, from the data model and APIs to the interface, with TypeScript, React, Next.js and Node.js on MongoDB and PostgreSQL.\n\nMy work centres on what makes software dependable in production: authentication and access control, payments and third-party integrations, caching and background jobs, and clean architecture that teams can keep shipping on.",
  homeContactHeading: "Let’s build something reliable",
  homeContactIntro: "Open to senior full-stack engineering roles with international teams, remote-first. The fastest way to reach me is email.",
  seoTitle: "Anik Chandra Deb — Senior Full-Stack Software Engineer",
  seoDescription:
    "Senior full-stack engineer building production web platforms with TypeScript, React, Next.js and Node.js for teams in the US, UAE and Bangladesh.",
  about: {
    introduction:
      "<p>I’m a senior full-stack engineer based in Chattogram, Bangladesh, working with teams in the United States, the UAE and Bangladesh. I build production web applications (e-commerce platforms, business systems and healthcare products) and the backend integrations behind them.</p>",
    systemDesign:
      "<p>I care about backend architecture and system design: how data is modelled and indexed, where caching and queues belong, how services fail and recover, and what has to change as an application scales.</p>",
    learning:
      "<p>Beyond day-to-day delivery I go deep on distributed systems: messaging and job queues (Kafka, BullMQ), Kubernetes, database replication and sharding, load balancing and API gateways, and the trade-offs between horizontal and vertical scaling.</p>",
    interests:
      "<p>I co-founded SoftHexis, where I work on product and engineering from the ground up alongside my full-time engineering role.</p>",
  },
  appearance: { accent: "cobalt", typography: "precision" },
} as const;

type Change = { field: string; from: unknown; to: unknown };

async function main() {
  const apply = process.argv.includes("--apply");
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set (add it to .env.local).");

  const { connectDB, disconnectDB } = await import("@/lib/db");
  const { readSettings, writeSettings } = await import("@/lib/admin/settings");
  const { SettingModel } = await import("@/lib/models");
  const { homepageSettingsSchema } = await import("@/lib/validation/settings");
  await connectDB();

  const [profile, homepage, about, seo, appearance] = await Promise.all([
    readSettings("profile"),
    readSettings("homepage"),
    readSettings("about"),
    readSettings("seo"),
    readSettings("appearance"),
  ]);
  const changes: Change[] = [];
  const track = (field: string, from: unknown, to: unknown) => {
    if (JSON.stringify(from) !== JSON.stringify(to)) changes.push({ field, from, to });
  };

  const nextProfile = { ...profile, positioning: COPY.positioning };
  track("profile.positioning", profile.positioning, nextProfile.positioning);

  const rewriteHome = (config: typeof homepage.published) => ({
    ...config,
    sections: config.sections.map((s) =>
      s.type === "intro"
        ? { ...s, heading: COPY.homeIntroHeading, intro: COPY.homeIntro }
        : s.type === "contact"
          ? { ...s, heading: COPY.homeContactHeading, intro: COPY.homeContactIntro }
          : s,
    ),
  });
  const nextHome = { ...homepage, draft: rewriteHome(homepage.draft), published: rewriteHome(homepage.published) };
  for (const type of ["intro", "contact"] as const) {
    const before = homepage.published.sections.find((s) => s.type === type);
    const after = nextHome.published.sections.find((s) => s.type === type);
    track(`homepage.${type}.heading`, before?.heading, after?.heading);
    track(`homepage.${type}.intro`, before?.intro, after?.intro);
  }

  const nextAbout = { ...about, sections: { ...about.sections, ...COPY.about } };
  for (const key of Object.keys(COPY.about) as (keyof typeof COPY.about)[]) track(`about.${key}`, about.sections[key], nextAbout.sections[key]);

  const nextSeo = { ...seo, defaultTitle: COPY.seoTitle, defaultDescription: COPY.seoDescription };
  track("seo.defaultTitle", seo.defaultTitle, nextSeo.defaultTitle);
  track("seo.defaultDescription", seo.defaultDescription, nextSeo.defaultDescription);

  const nextAppearance = { ...appearance, ...COPY.appearance };
  track("appearance.accent", appearance.accent, nextAppearance.accent);
  track("appearance.typography", appearance.typography, nextAppearance.typography);

  if (!changes.length) {
    console.log("Nothing to change: the copy is already up to date.");
    await disconnectDB();
    return;
  }
  for (const c of changes) {
    console.log(`\n● ${c.field}\n  - ${String(c.from).replace(/\n/g, "\n    ")}\n  + ${String(c.to).replace(/\n/g, "\n    ")}`);
  }

  if (!apply) {
    console.log(`\nDry run: ${changes.length} field(s) would change. Re-run with --apply to write them.`);
    await disconnectDB();
    return;
  }

  const dir = resolve(process.cwd(), "backups");
  mkdirSync(dir, { recursive: true });
  const backupPath = resolve(dir, `settings-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(backupPath, JSON.stringify({ profile, homepage, about, seo, appearance }, null, 2));
  console.log(`\nBackup written to ${backupPath}`);

  await writeSettings("profile", nextProfile);
  await writeSettings("about", nextAbout);
  await writeSettings("seo", nextSeo);
  await writeSettings("appearance", nextAppearance);
  await SettingModel.updateOne({ key: "homepage" }, { $set: { value: homepageSettingsSchema.parse(nextHome) } }, { upsert: true });
  console.log(`Applied ${changes.length} change(s).`);
  await disconnectDB();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
