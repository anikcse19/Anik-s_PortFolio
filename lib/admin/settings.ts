import { connectDB } from "@/lib/db";
import { SettingModel } from "@/lib/models";
import { sanitizeRichText } from "@/lib/sanitize";
import {
  ABOUT_SECTION_KEYS,
  homeConfigSchema,
  parseStoredSettings,
  SETTINGS_SCHEMAS,
  type AboutSettings,
  type HomeConfig,
  type SettingsKey,
  type SettingsValue,
} from "@/lib/validation/settings";
import { parseOrThrow, ValidationError } from "./errors";

/** Settings persistence. Callers (server actions) are responsible for authorization. */

export async function readSettings<K extends SettingsKey>(key: K): Promise<SettingsValue<K>> {
  await connectDB();
  const doc = await SettingModel.findOne({ key }).lean();
  return parseStoredSettings(key, doc?.value);
}

export async function readSettingsMeta(key: SettingsKey): Promise<{ updatedAt: string | null }> {
  await connectDB();
  const doc = await SettingModel.findOne({ key }).select("updatedAt").lean();
  return { updatedAt: doc?.updatedAt ? new Date(doc.updatedAt).toISOString() : null };
}

export async function writeSettings<K extends SettingsKey>(key: K, raw: unknown): Promise<SettingsValue<K>> {
  if (key === "homepage") {
    throw new ValidationError("Use saveHomepageDraft / publishHomepage for homepage settings.");
  }
  const schema = SETTINGS_SCHEMAS[key];
  let value = parseOrThrow(schema, raw) as SettingsValue<K>;
  if (key === "about") {
    const about = value as AboutSettings;
    value = {
      ...about,
      sections: Object.fromEntries(ABOUT_SECTION_KEYS.map((k) => [k, sanitizeRichText(about.sections[k])])),
    } as SettingsValue<K>;
  }
  await connectDB();
  await SettingModel.updateOne({ key }, { $set: { value } }, { upsert: true });
  return value;
}

export async function saveHomepageDraft(raw: unknown): Promise<HomeConfig> {
  const draft = parseOrThrow(homeConfigSchema, raw);
  const current = await readSettings("homepage");
  await SettingModel.updateOne({ key: "homepage" }, { $set: { value: { ...current, draft } } }, { upsert: true });
  return draft;
}

/** Copies the current draft to the published homepage configuration. */
export async function publishHomepage(): Promise<void> {
  const current = await readSettings("homepage");
  const published = parseOrThrow(homeConfigSchema, current.draft);
  await SettingModel.updateOne(
    { key: "homepage" },
    { $set: { value: { ...current, published, publishedAt: new Date().toISOString() } } },
    { upsert: true },
  );
}

/** Restores the draft from the live configuration (discarding unpublished edits). */
export async function discardHomepageDraft(): Promise<void> {
  const current = await readSettings("homepage");
  await SettingModel.updateOne({ key: "homepage" }, { $set: { value: { ...current, draft: current.published } } }, { upsert: true });
}

export function homepageHasUnpublishedChanges(value: SettingsValue<"homepage">): boolean {
  return JSON.stringify(value.draft) !== JSON.stringify(value.published);
}
