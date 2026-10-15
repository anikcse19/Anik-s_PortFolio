"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { COLLECTIONS, type CollectionKey } from "@/lib/admin/collections";
import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  moveDocument,
  setDocumentStatus,
  updateDocument,
} from "@/lib/admin/crud";
import { ValidationError } from "@/lib/admin/errors";
import { TAGS } from "@/lib/cache-tags";
import type { ActionResult } from "@/lib/types";
import { objectIdSchema, statusSchema } from "@/lib/validation/common";

/*
 * Server actions are publicly reachable endpoints: every argument is validated
 * here and every action authenticates through adminAction().
 */

const collectionSchema = z.enum(Object.keys(COLLECTIONS) as [CollectionKey, ...CollectionKey[]]);

function parseArgs<T>(schema: z.ZodType<T>, value: unknown): T {
  const res = schema.safeParse(value);
  if (!res.success) throw new ValidationError("Invalid request.");
  return res.data;
}

function invalidate(collection: CollectionKey) {
  for (const tag of COLLECTIONS[collection].tags) updateTag(tag);
  // Homepage selections and settings-derived views can reference any content.
  updateTag(TAGS.settings);
}

type Saved = { id: string; updatedAt: string; slug?: string };

export async function saveDocumentAction(
  collection: CollectionKey,
  id: string | null,
  data: unknown,
  expectedUpdatedAt?: string,
): Promise<ActionResult<Saved>> {
  return adminAction(async () => {
    const key = parseArgs(collectionSchema, collection);
    const docId = id === null ? null : parseArgs(objectIdSchema, id);
    const expected = expectedUpdatedAt === undefined ? undefined : parseArgs(z.string().max(40), expectedUpdatedAt);
    const saved = docId
      ? await updateDocument<Saved>(key, docId, data, expected)
      : await createDocument<Saved>(key, data);
    invalidate(key);
    return { id: saved.id, updatedAt: saved.updatedAt, slug: saved.slug };
  }, "Saved");
}

export async function setStatusAction(collection: CollectionKey, id: string, status: "draft" | "published"): Promise<ActionResult> {
  return adminAction(async () => {
    const key = parseArgs(collectionSchema, collection);
    await setDocumentStatus(key, parseArgs(objectIdSchema, id), parseArgs(statusSchema, status));
    invalidate(key);
    return undefined;
  }, status === "published" ? "Published" : "Moved to drafts");
}

export async function deleteDocumentAction(collection: CollectionKey, id: string): Promise<ActionResult> {
  return adminAction(async () => {
    const key = parseArgs(collectionSchema, collection);
    await deleteDocument(key, parseArgs(objectIdSchema, id));
    invalidate(key);
    return undefined;
  }, "Deleted");
}

export async function moveDocumentAction(collection: CollectionKey, id: string, direction: "up" | "down"): Promise<ActionResult> {
  return adminAction(async () => {
    const key = parseArgs(collectionSchema, collection);
    await moveDocument(key, parseArgs(objectIdSchema, id), parseArgs(z.enum(["up", "down"]), direction));
    invalidate(key);
    return undefined;
  });
}

export type PickerItem = { id: string; label: string; status?: string; detail?: string };

/** Lightweight lookup used by pickers (related projects, homepage selections). */
export async function listPickerItemsAction(collection: "projects" | "caseStudies" | "articles", q = ""): Promise<ActionResult<PickerItem[]>> {
  return adminAction(async () => {
    const key = parseArgs(z.enum(["projects", "caseStudies", "articles"]), collection);
    const query = parseArgs(z.string().max(100), q);
    const res = await listDocuments<{ id: string; title: string; status: string; featured: boolean }>(key, { q: query, pageSize: 100 });
    return res.items.map((item) => ({ id: item.id, label: item.title, status: item.status, detail: item.featured ? "Featured" : undefined }));
  });
}

/** Re-fetches a single document (used after save conflicts). */
export async function getDocumentAction(collection: CollectionKey, id: string): Promise<ActionResult<unknown>> {
  return adminAction(async () => {
    const key = parseArgs(collectionSchema, collection);
    return getDocument(key, parseArgs(objectIdSchema, id));
  });
}

export type MediaPickerItem = { id: string; url: string; alt: string; caption: string; label: string };

/** Saved image URLs for the image-field library picker. */
export async function listMediaAction(q = ""): Promise<ActionResult<MediaPickerItem[]>> {
  return adminAction(async () => {
    const query = parseArgs(z.string().max(100), q);
    const res = await listDocuments<MediaPickerItem>("media", { q: query, pageSize: 60 });
    return res.items.map(({ id, url, alt, caption, label }) => ({ id, url, alt, caption, label }));
  });
}
