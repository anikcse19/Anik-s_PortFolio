import "server-only";
import { getPublishedExperience, getPublishedProjects, getPublishedSkillCategories, getSiteSettings } from "@/lib/data/public";
import { connectDB } from "@/lib/db";
import { getSiteUrl } from "@/lib/env";
import { SyncStateModel } from "@/lib/models";
import { buildSyncItems, githubUsername, removedRecords, syncStatus, type SyncItem, type SyncRecord, type SyncStatus } from "@/lib/profile-sync";
import { htmlToText } from "@/lib/sanitize";
import { ABOUT_SECTION_KEYS } from "@/lib/validation/settings";

export type SyncBoardItem = SyncItem & { status: SyncStatus; syncedAt: string | null };
export type SyncBoardData = { items: SyncBoardItem[]; removed: SyncRecord[]; /** From the site's GitHub link; "" when none. */ githubUser: string };

/** About sections that read well on LinkedIn (the rest are site-specific). */
const ABOUT_FOR_LINKEDIN = ABOUT_SECTION_KEYS.filter((k) => k === "expertise" || k === "systemDesign" || k === "approach");

/** Builds every copy-ready item from published content and joins it with the saved sync records. */
export async function getSyncBoard(): Promise<SyncBoardData> {
  const [settings, experience, projects, skills] = await Promise.all([
    getSiteSettings(),
    getPublishedExperience(),
    getPublishedProjects(),
    getPublishedSkillCategories(),
  ]);
  const items = buildSyncItems({
    settings,
    experience,
    projects,
    skills,
    aboutText: ABOUT_FOR_LINKEDIN.map((k) => htmlToText(settings.about.sections[k])).filter(Boolean),
    siteUrl: getSiteUrl(),
  });

  await connectDB();
  const docs = await SyncStateModel.find({}).lean();
  const records: SyncRecord[] = docs.map((d) => ({ key: d.key, hash: d.hash, title: d.title, syncedAt: new Date(d.syncedAt).toISOString() }));
  const byKey = new Map(records.map((r) => [r.key, r]));

  return {
    items: items.map((i) => ({ ...i, status: syncStatus(i, byKey.get(i.key)), syncedAt: byKey.get(i.key)?.syncedAt ?? null })),
    removed: removedRecords(items, records),
    githubUser: githubUsername(settings),
  };
}

/** Count of items that need updating somewhere, for the dashboard. */
export async function countOutOfSync(): Promise<{ changed: number; fresh: number; removed: number }> {
  const { items, removed } = await getSyncBoard();
  return {
    changed: items.filter((i) => i.status === "changed").length,
    fresh: items.filter((i) => i.status === "new").length,
    removed: removed.length,
  };
}

export async function markSynced(entries: { key: string; hash: string; title: string }[]): Promise<void> {
  await connectDB();
  const now = new Date();
  await SyncStateModel.bulkWrite(
    entries.map((e) => ({
      updateOne: { filter: { key: e.key }, update: { $set: { hash: e.hash, title: e.title, syncedAt: now } }, upsert: true },
    })),
  );
}

export async function forgetSynced(keys: string[]): Promise<void> {
  await connectDB();
  await SyncStateModel.deleteMany({ key: { $in: keys } });
}
