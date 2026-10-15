import { z } from "zod";
import { imageRefSchema, optionalText, requiredText, text } from "./common";

/**
 * Structured content blocks used by case studies, articles and long-form fields.
 * Rich text is stored as HTML that is sanitized on write *and* on render.
 */

const blockId = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{6,40}$/)
  .catch(() => cryptoId());

export function cryptoId(): string {
  return globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export const CODE_LANGUAGES = [
  "text",
  "typescript",
  "javascript",
  "tsx",
  "json",
  "bash",
  "sql",
  "yaml",
  "dockerfile",
  "http",
  "graphql",
  "css",
  "html",
] as const;

export const CALLOUT_TONES = ["note", "decision", "tradeoff", "warning"] as const;

export const richBlockSchema = z.object({
  id: blockId,
  type: z.literal("rich"),
  html: text(60000).default(""),
});

export const codeBlockSchema = z.object({
  id: blockId,
  type: z.literal("code"),
  language: z.enum(CODE_LANGUAGES).catch("text"),
  filename: optionalText(120),
  code: text(20000).min(1, "Code cannot be empty"),
});

export const calloutBlockSchema = z.object({
  id: blockId,
  type: z.literal("callout"),
  tone: z.enum(CALLOUT_TONES).catch("note"),
  title: optionalText(120),
  html: text(10000).default(""),
});

export const diagramBlockSchema = z.object({
  id: blockId,
  type: z.literal("diagram"),
  title: optionalText(160),
  source: requiredText(12000, "Diagram source"),
  /** Text alternative read by screen readers and shown if the diagram cannot render. */
  description: requiredText(2000, "Diagram description"),
});

export const imageBlockSchema = z.object({
  id: blockId,
  type: z.literal("image"),
  image: imageRefSchema,
});

export const blockSchema = z.discriminatedUnion("type", [
  richBlockSchema,
  codeBlockSchema,
  calloutBlockSchema,
  diagramBlockSchema,
  imageBlockSchema,
]);
export type ContentBlock = z.infer<typeof blockSchema>;
export type BlockType = ContentBlock["type"];

export const blocksSchema = z.array(blockSchema).max(120, "Too many blocks in one document").default([]);
