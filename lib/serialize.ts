import { Types } from "mongoose";

/**
 * Converts a lean Mongo document into a JSON-safe object:
 * `_id` becomes `id`, ObjectIds become strings and Dates become ISO strings.
 * This keeps the shape stable across `unstable_cache` serialization and
 * Server → Client Component boundaries.
 */
export function serializeDoc<T>(doc: unknown): T {
  return convert(doc, true) as T;
}

function convert(value: unknown, isRoot = false): unknown {
  if (value === null || value === undefined) return value ?? null;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Types.ObjectId) return value.toString();
  if (Array.isArray(value)) return value.map((v) => convert(v));
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // Some driver versions hand back ObjectIds that fail `instanceof` across module copies.
    if (typeof obj.toHexString === "function" && (obj as { _bsontype?: string })._bsontype === "ObjectId") {
      return (obj.toHexString as () => string)();
    }
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(obj)) {
      if (key === "__v") continue;
      if (key === "_id") {
        if (isRoot) out.id = convert(v);
        continue;
      }
      out[key] = convert(v);
    }
    return out;
  }
  return value;
}

export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
