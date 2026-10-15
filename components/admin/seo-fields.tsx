"use client";

import type { SeoFields as SeoValue } from "@/lib/validation/common";
import { Field, FormSection, Input, TextArea } from "./fields";

/** Per-item SEO overrides with a search-result preview and length counters. */
export function SeoFields({
  value,
  onChange,
  error,
  fallbackTitle,
  fallbackDescription,
}: {
  value: SeoValue;
  onChange: (v: SeoValue) => void;
  error: (key: keyof SeoValue) => string | undefined;
  fallbackTitle: string;
  fallbackDescription: string;
}) {
  const title = value.title || fallbackTitle;
  const description = value.description || fallbackDescription;
  return (
    <FormSection title="Search & social" description="Optional overrides. When empty, the title, summary and cover image are used.">
      <Field label="SEO title" optional error={error("title")} hint={`${value.title.length}/70 characters`}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} aria-describedby={describedBy} invalid={invalid} maxLength={70} value={value.title} placeholder={fallbackTitle} onChange={(e) => onChange({ ...value, title: e.target.value })} />
        )}
      </Field>
      <Field label="Meta description" optional error={error("description")} hint={`${value.description.length}/170 characters`}>
        {({ id, describedBy, invalid }) => (
          <TextArea id={id} aria-describedby={describedBy} invalid={invalid} rows={2} maxLength={170} value={value.description} placeholder={fallbackDescription} onChange={(e) => onChange({ ...value, description: e.target.value })} />
        )}
      </Field>
      <Field label="Social image URL" optional error={error("ogImage")} hint="1200×630 works best. Defaults to the cover image.">
        {({ id, describedBy, invalid }) => (
          <Input id={id} aria-describedby={describedBy} invalid={invalid} type="url" value={value.ogImage} onChange={(e) => onChange({ ...value, ogImage: e.target.value })} className="font-mono text-sm" />
        )}
      </Field>
      <div className="border border-rule bg-surface p-4" aria-label="Search result preview">
        <p className="label mb-2">Preview</p>
        <p className="truncate text-[1.05rem] text-[rgb(var(--accent))]">{title || "Untitled"}</p>
        <p className="mt-1 line-clamp-2 text-sm text-ink-2">{description || "No description."}</p>
      </div>
    </FormSection>
  );
}
