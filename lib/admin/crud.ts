import { Types } from "mongoose";
import { connectDB, isDuplicateKeyError } from "@/lib/db";
import { ArticleModel, CaseStudyModel, SettingModel } from "@/lib/models";
import { escapeRegex, serializeDoc } from "@/lib/serialize";
import { PUBLICATION_STATUSES, type PublicationStatus } from "@/lib/validation/common";
import { parseStoredSettings } from "@/lib/validation/settings";
import { COLLECTIONS, type CollectionConfig, type CollectionKey } from "./collections";
import { ConflictError, NotFoundError, parseOrThrow, ValidationError } from "./errors";

/**
 * Generic persistence for admin-managed collections. Authorization is enforced
 * by the calling server action (see app/admin/_actions); this module assumes an
 * authenticated caller and focuses on validation and safe writes.
 */

export const PAGE_SIZE = 20;

export type ListParams = { q?: string; status?: string; page?: number; pageSize?: number };
export type ListResult<T> = { items: T[]; total: number; page: number; pageCount: number; pageSize: number };

function config(key: CollectionKey): CollectionConfig {
  const c = COLLECTIONS[key];
  if (!c) throw new Error(`Unknown collection: ${key}`);
  return c;
}

function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id) || !/^[a-f0-9]{24}$/i.test(id)) throw new NotFoundError();
  return new Types.ObjectId(id);
}

export async function listDocuments<T>(key: CollectionKey, params: ListParams = {}): Promise<ListResult<T>> {
  const c = config(key);
  await connectDB();
  const filter: Record<string, unknown> = {};
  const q = (params.q ?? "").trim().slice(0, 100);
  if (q) {
    const re = new RegExp(escapeRegex(q), "i");
    filter.$or = c.searchFields.map((field) => ({ [field]: re }));
  }
  if (c.hasStatus && params.status && (PUBLICATION_STATUSES as readonly string[]).includes(params.status)) {
    filter.status = params.status;
  }
  const pageSize = Math.min(Math.max(params.pageSize ?? PAGE_SIZE, 1), 100);
  const total = await c.model.countDocuments(filter);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(Math.floor(params.page ?? 1), 1), pageCount);
  const docs = await c.model
    .find(filter)
    .sort(c.defaultSort)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();
  return { items: docs.map((d) => serializeDoc<T>(d)), total, page, pageCount, pageSize };
}

export async function getDocument<T>(key: CollectionKey, id: string): Promise<T | null> {
  const c = config(key);
  await connectDB();
  const doc = await c.model.findById(toObjectId(id)).lean();
  return doc ? serializeDoc<T>(doc) : null;
}

function buildDocument(c: CollectionConfig, raw: unknown): Record<string, unknown> {
  const input = parseOrThrow(c.schema, raw) as Record<string, unknown>;
  return c.toDocument ? c.toDocument(input as never) : input;
}

/**
 * Explicit slug check. The unique index is the final guarantee, but it may not
 * exist yet (production disables auto-indexing until `npm run db:indexes` runs).
 */
async function assertSlugAvailable(c: CollectionConfig, slug: unknown, excludeId?: Types.ObjectId): Promise<void> {
  if (!c.hasSlug || typeof slug !== "string") return;
  const filter: Record<string, unknown> = { slug };
  if (excludeId) filter._id = { $ne: excludeId };
  if (await c.model.exists(filter)) {
    throw new ConflictError("Another item already uses this slug.", { slug: "This slug is already in use" });
  }
}

function rethrowWriteError(error: unknown, c: CollectionConfig): never {
  if (isDuplicateKeyError(error)) {
    if (c.hasSlug) {
      throw new ConflictError("Another item already uses this slug.", { slug: "This slug is already in use" });
    }
    throw new ConflictError("This item already exists.");
  }
  throw error;
}

export async function createDocument<T>(key: CollectionKey, raw: unknown): Promise<T> {
  const c = config(key);
  await connectDB();
  const doc = buildDocument(c, raw);
  await assertSlugAvailable(c, doc.slug);
  if (c.hasStatus && doc.status === "published" && !doc.publishedAt) doc.publishedAt = new Date();
  try {
    const created = await c.model.create(doc);
    return serializeDoc<T>(created.toObject());
  } catch (error) {
    rethrowWriteError(error, c);
  }
}

/**
 * Replaces an existing document with validated input.
 * `expectedUpdatedAt` enables optimistic concurrency: if the record changed
 * since the editor loaded it (e.g. in another tab), the save is rejected.
 */
export async function updateDocument<T>(
  key: CollectionKey,
  id: string,
  raw: unknown,
  expectedUpdatedAt?: string,
): Promise<T> {
  const c = config(key);
  await connectDB();
  const _id = toObjectId(id);
  const existing = await c.model.findById(_id).select("updatedAt publishedAt status").lean();
  if (!existing) throw new NotFoundError();
  if (expectedUpdatedAt) {
    const current = existing.updatedAt instanceof Date ? existing.updatedAt.toISOString() : String(existing.updatedAt);
    if (current !== expectedUpdatedAt) {
      throw new ConflictError("This item was changed somewhere else since you opened it. Reload to get the latest version.");
    }
  }
  const doc = buildDocument(c, raw);
  await assertSlugAvailable(c, doc.slug, _id);
  if (c.hasStatus && doc.status === "published" && !doc.publishedAt && !existing.publishedAt) {
    doc.publishedAt = new Date();
  }
  try {
    const updated = await c.model.findByIdAndUpdate(_id, { $set: doc }, { returnDocument: "after", runValidators: true }).lean();
    if (!updated) throw new NotFoundError();
    return serializeDoc<T>(updated);
  } catch (error) {
    rethrowWriteError(error, c);
  }
}

export async function setDocumentStatus(key: CollectionKey, id: string, status: PublicationStatus): Promise<void> {
  const c = config(key);
  if (!c.hasStatus) throw new ValidationError("This item has no publication status.");
  if (!(PUBLICATION_STATUSES as readonly string[]).includes(status)) throw new ValidationError("Unknown status.");
  await connectDB();
  const _id = toObjectId(id);
  const existing = await c.model.findById(_id).lean();
  if (!existing) throw new NotFoundError();
  if (status === "published") {
    // Re-validate before publishing so invalid legacy data never goes live.
    const plain = serializeDoc<Record<string, unknown>>(existing);
    const { id: _id2, createdAt: _c, updatedAt: _u, readingMinutes: _r, publishedAt, ...rest } = plain;
    const candidate = key === "articles" ? { ...rest, publishedAt: publishedAt ?? "", status } : { ...rest, status };
    parseOrThrow(c.schema, candidate);
  }
  const update: Record<string, unknown> = { status };
  if (status === "published" && !existing.publishedAt) update.publishedAt = new Date();
  await c.model.updateOne({ _id }, { $set: update });
}

export async function deleteDocument(key: CollectionKey, id: string): Promise<void> {
  const c = config(key);
  await connectDB();
  const _id = toObjectId(id);
  const res = await c.model.deleteOne({ _id });
  if (res.deletedCount === 0) throw new NotFoundError();

  // Remove dangling references so public pages never point at deleted content.
  if (key === "projects") {
    await CaseStudyModel.updateMany({ relatedProjectId: _id }, { $set: { relatedProjectId: null } });
    await ArticleModel.updateMany({ relatedProjectIds: _id }, { $pull: { relatedProjectIds: _id } });
  }
  if (key === "projects" || key === "caseStudies" || key === "articles") {
    await removeFromHomepageSelections(id);
  }
}

async function removeFromHomepageSelections(id: string): Promise<void> {
  const doc = await SettingModel.findOne({ key: "homepage" }).lean();
  if (!doc) return;
  const value = parseStoredSettings("homepage", doc.value);
  let changed = false;
  for (const config of [value.draft, value.published]) {
    for (const section of config.sections) {
      if (section.itemIds.includes(id)) {
        section.itemIds = section.itemIds.filter((x) => x !== id);
        changed = true;
      }
    }
  }
  if (changed) await SettingModel.updateOne({ key: "homepage" }, { $set: { value } });
}

/**
 * Moves an item one position up or down in manual sort order by renumbering
 * the whole (small) collection, which also repairs duplicate sortOrder values.
 */
export async function moveDocument(key: CollectionKey, id: string, direction: "up" | "down"): Promise<void> {
  const c = config(key);
  if (!("sortOrder" in c.defaultSort) || key === "experience") {
    throw new ValidationError("This list is ordered automatically.");
  }
  await connectDB();
  const all = await c.model.find({}).select("_id").sort(c.defaultSort).limit(1000).lean();
  const index = all.findIndex((d) => String(d._id) === id);
  if (index === -1) throw new NotFoundError();
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= all.length) return;
  [all[index], all[target]] = [all[target], all[index]];
  await c.model.bulkWrite(
    all.map((d, i) => ({ updateOne: { filter: { _id: d._id }, update: { $set: { sortOrder: (i + 1) * 10 } }, timestamps: false } })),
  );
}

export async function countByStatus(key: CollectionKey): Promise<Record<PublicationStatus, number>> {
  const c = config(key);
  await connectDB();
  const rows = await c.model.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]);
  const out: Record<PublicationStatus, number> = { draft: 0, published: 0 };
  for (const row of rows) if (row._id === "draft" || row._id === "published") out[row._id] = row.n;
  return out;
}
