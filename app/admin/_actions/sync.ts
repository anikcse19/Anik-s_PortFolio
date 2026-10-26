"use server";

import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { ValidationError } from "@/lib/admin/errors";
import { previewGithub, pushGithub, type GithubPreview } from "@/lib/admin/github";
import { forgetSynced, markSynced } from "@/lib/admin/sync";
import type { ActionResult } from "@/lib/types";

const keySchema = z.string().regex(/^(linkedin|github):[a-z]+(:[a-f0-9]{24})?$/, "Unknown sync item");
const entrySchema = z.object({ key: keySchema, hash: z.string().min(1).max(40), title: z.string().max(300) });

export async function markSyncedAction(entries: unknown): Promise<ActionResult> {
  return adminAction(async () => {
    const parsed = z.array(entrySchema).min(1).max(500).safeParse(entries);
    if (!parsed.success) throw new ValidationError("Nothing valid to mark as synced.");
    await markSynced(parsed.data);
    return undefined;
  }, "Marked as synced");
}

export async function forgetSyncedAction(keys: unknown): Promise<ActionResult> {
  return adminAction(async () => {
    const parsed = z.array(keySchema).min(1).max(500).safeParse(keys);
    if (!parsed.success) throw new ValidationError("Nothing valid to remove.");
    await forgetSynced(parsed.data);
    return undefined;
  }, "Done");
}

const githubKeySchema = z.enum(["github:profile", "github:readme"]);

/** Fetches GitHub's current text for an item and diffs it against the site. Read-only. */
export async function previewGithubAction(key: unknown): Promise<ActionResult<GithubPreview>> {
  return adminAction(async () => {
    const parsed = githubKeySchema.safeParse(key);
    if (!parsed.success) throw new ValidationError("This item can't be pushed to GitHub.");
    return previewGithub(parsed.data);
  });
}

/** Writes a reviewed item to GitHub. `hash` must match the fingerprint shown in the review. */
export async function pushGithubAction(key: unknown, hash: unknown): Promise<ActionResult<{ changed: boolean }>> {
  return adminAction(async () => {
    const parsed = z.object({ key: githubKeySchema, hash: z.string().min(1).max(40) }).safeParse({ key, hash });
    if (!parsed.success) throw new ValidationError("This item can't be pushed to GitHub.");
    return pushGithub(parsed.data.key, parsed.data.hash);
  }, "Pushed to GitHub and marked as synced");
}
