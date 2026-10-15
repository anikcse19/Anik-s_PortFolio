"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { ValidationError } from "@/lib/admin/errors";
import { discardHomepageDraft, publishHomepage, saveHomepageDraft, writeSettings } from "@/lib/admin/settings";
import { TAGS } from "@/lib/cache-tags";
import type { ActionResult } from "@/lib/types";
import { SETTINGS_KEYS, type SettingsKey } from "@/lib/validation/settings";

const editableKeys = SETTINGS_KEYS.filter((k) => k !== "homepage") as [SettingsKey, ...SettingsKey[]];
const keySchema = z.enum(editableKeys);

export async function saveSettingsAction(key: SettingsKey, value: unknown): Promise<ActionResult> {
  return adminAction(async () => {
    const parsedKey = keySchema.safeParse(key);
    if (!parsedKey.success) throw new ValidationError("Unknown settings section.");
    await writeSettings(parsedKey.data, value);
    updateTag(TAGS.settings);
    return undefined;
  }, "Settings saved");
}

export async function saveHomepageDraftAction(value: unknown): Promise<ActionResult> {
  return adminAction(async () => {
    await saveHomepageDraft(value);
    // Draft changes don't affect the public site, but the admin preview reads settings too.
    updateTag(TAGS.settings);
    return undefined;
  }, "Draft saved");
}

export async function publishHomepageAction(value: unknown): Promise<ActionResult> {
  return adminAction(async () => {
    await saveHomepageDraft(value);
    await publishHomepage();
    updateTag(TAGS.settings);
    return undefined;
  }, "Homepage published");
}

export async function discardHomepageDraftAction(): Promise<ActionResult> {
  return adminAction(async () => {
    await discardHomepageDraft();
    updateTag(TAGS.settings);
    return undefined;
  }, "Draft discarded");
}
