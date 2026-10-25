import { z } from "zod";
import { checkImageUrl } from "@/lib/images";
import { isHttpUrl, isSafeHref } from "@/lib/urls";

export const PUBLICATION_STATUSES = ["draft", "published"] as const;
export const statusSchema = z.enum(PUBLICATION_STATUSES);
export type PublicationStatus = z.infer<typeof statusSchema>;

export const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`);
export const optionalText = (max: number) => text(max).default("");
export const requiredText = (max: number, label = "This field") =>
  text(max).min(1, `${label} is required`);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required")
  .max(96, "Keep the slug under 96 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens");

/** Optional absolute http(s) URL (e.g. live demo or repository). */
export const optionalHttpUrl = z
  .string()
  .trim()
  .max(2048)
  .default("")
  .refine((v) => v === "" || isHttpUrl(v), "Enter a full URL starting with https://");

export const hrefSchema = z
  .string()
  .trim()
  .max(512)
  .refine((v) => isSafeHref(v), "Use a site path (/projects), an anchor (#contact), an https:// URL or mailto:");

export const optionalHrefSchema = z
  .string()
  .trim()
  .max(512)
  .default("")
  .refine((v) => v === "" || isSafeHref(v), "Use a site path (/projects), an anchor (#contact), an https:// URL or mailto:");

export const imageUrlSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    const res = checkImageUrl(value);
    if (!res.ok) ctx.addIssue({ code: "custom", message: res.error });
    else if (res.kind === "empty") ctx.addIssue({ code: "custom", message: "Image URL is required" });
  });

export const optionalImageUrlSchema = z
  .string()
  .trim()
  .default("")
  .superRefine((value, ctx) => {
    const res = checkImageUrl(value);
    if (!res.ok) ctx.addIssue({ code: "custom", message: res.error });
  });

export const imageRefSchema = z.object({
  url: imageUrlSchema,
  alt: requiredText(300, "Alt text"),
  caption: optionalText(300),
});
export type ImageRef = z.infer<typeof imageRefSchema>;

export const optionalImageRefSchema = imageRefSchema.nullable().default(null);

export const seoSchema = z
  .object({
    title: optionalText(70),
    description: optionalText(170),
    ogImage: optionalImageUrlSchema,
  })
  .default({ title: "", description: "", ogImage: "" });
export type SeoFields = z.infer<typeof seoSchema>;

/** De-duplicated, trimmed list of short labels (technologies, tags, ...). */
export const labelListSchema = (maxItems: number, maxLen = 40) =>
  z
    .array(z.string().trim().min(1).max(maxLen, `Each entry must be under ${maxLen} characters`))
    .max(maxItems, `Use at most ${maxItems} entries`)
    .default([])
    .transform((items) => {
      const seen = new Set<string>();
      return items.filter((item) => {
        const key = item.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });

export const sortOrderSchema = z.coerce.number().int().min(-100000).max(100000).default(0);

export const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id");

/** Year-month string used for employment dates, e.g. "2024-01". */
export const yearMonthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use the format YYYY-MM");

/**
 * Impact numbers ("40%" / "faster checkout"). Only enter results you can stand behind;
 * they are shown prominently to recruiters and clients.
 */
export const metricListSchema = (maxItems: number) =>
  z
    .array(z.object({ value: requiredText(16, "Value"), label: requiredText(90, "Label") }))
    .max(maxItems, `Use at most ${maxItems} entries`)
    .default([]);
export type Metric = { value: string; label: string };
