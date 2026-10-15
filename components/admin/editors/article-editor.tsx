"use client";

import { useState } from "react";
import { BlockEditor } from "@/components/admin/block-editor";
import { EditorHeader, useDocumentEditor } from "@/components/admin/editor-shell";
import { Field, FormSection, Input, SlugInput, TagInput, TextArea, Toggle } from "@/components/admin/fields";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { SeoFields } from "@/components/admin/seo-fields";
import { slugify } from "@/lib/utils";
import type { ArticleInput } from "@/lib/validation/content";


export function ArticleEditor({
  id,
  updatedAt,
  initial,
  projects,
  writingEnabled,
}: {
  id: string | null;
  updatedAt: string | null;
  initial: ArticleInput;
  projects: { id: string; label: string }[];
  writingEnabled: boolean;
}) {
  const { form, status, save, remove, id: currentId } = useDocumentEditor<ArticleInput>({ collection: "articles", id, updatedAt, initial });
  const { value: v, set, error } = form;
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const saving = status.kind === "saving";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      noValidate
    >
      <EditorHeader
        title={v.title || "New article"}
        backHref="/admin/articles"
        backLabel="Articles"
        status={status}
        publication={v.status}
        dirty={form.dirty}
        saving={saving}
        onSave={() => void save()}
        onPublish={() => void save({ status: "published" }, "Published")}
        onUnpublish={() => void save({ status: "draft" }, "Moved to drafts")}
        onDelete={currentId ? remove : undefined}
        previewHref={currentId ? `/admin/preview/articles/${currentId}` : null}
        publicHref={currentId && writingEnabled && v.status === "published" && !form.dirty ? `/writing/${v.slug}` : null}
        deleteLabel="this article"
      />

      {!writingEnabled ? (
        <p className="mt-4 border-l-2 border-warning bg-surface px-4 py-2 text-sm">
          The writing section is turned off in Appearance, so published articles are not visible yet.
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <FormSection title="Basics" invalid={["title", "slug", "excerpt"].some((k) => form.hasErrorsUnder([k]))}>
            <Field label="Title" error={error(["title"])}>
              {({ id: fid, invalid }) => (
                <Input
                  id={fid}
                  invalid={invalid}
                  value={v.title}
                  onChange={(e) => {
                    set(["title"], e.target.value);
                    if (!slugTouched) set(["slug"], slugify(e.target.value));
                  }}
                />
              )}
            </Field>
            <SlugInput
              value={v.slug}
              onChange={(s) => {
                setSlugTouched(true);
                set(["slug"], s);
              }}
              source={v.title}
              error={error(["slug"])}
              basePath="/writing"
            />
            <Field label="Excerpt" error={error(["excerpt"])} hint="Shown in lists and as the default meta description.">
              {({ id: fid, invalid }) => <TextArea id={fid} invalid={invalid} rows={3} value={v.excerpt} onChange={(e) => set(["excerpt"], e.target.value)} />}
            </Field>
          </FormSection>

          <FormSection title="Content" invalid={form.hasErrorsUnder(["blocks"])} description="Reading time is estimated automatically when you save.">
            <BlockEditor value={v.blocks} onChange={(b) => set(["blocks"], b)} errorAt={(i, field) => error(["blocks", i, ...field.split(".")])} />
          </FormSection>

          <FormSection title="Cover image">
            <ImageUrlField label="Cover image" value={v.coverImage} aspect="16 / 9" aspectLabel="16:9" onChange={(img) => set(["coverImage"], img)} errors={{ url: error(["coverImage", "url"]), alt: error(["coverImage", "alt"]) }} />
          </FormSection>

          <SeoFields value={v.seo} onChange={(seo) => set(["seo"], seo)} error={(k) => error(["seo", k])} fallbackTitle={v.title} fallbackDescription={v.excerpt} />
        </div>

        <div className="space-y-6">
          <FormSection title="Publishing">
            <Toggle label="Featured" checked={v.featured} onChange={(c) => set(["featured"], c)} />
            <Field label="Publication date" optional error={error(["publishedAt"])} hint="Defaults to the moment you first publish.">
              {({ id: fid, invalid }) => (
                <Input id={fid} type="date" invalid={invalid} value={v.publishedAt ? v.publishedAt.slice(0, 10) : ""} onChange={(e) => set(["publishedAt"], e.target.value)} />
              )}
            </Field>
          </FormSection>
          <FormSection title="Classification">
            <Field label="Category" optional>
              {({ id: fid }) => <Input id={fid} value={v.category} onChange={(e) => set(["category"], e.target.value)} />}
            </Field>
            <TagInput label="Tags" value={v.tags} onChange={(t) => set(["tags"], t)} max={12} error={error(["tags"])} />
          </FormSection>
          <FormSection title="Related projects">
            {projects.length ? (
              <fieldset className="space-y-2">
                <legend className="sr-only">Related projects</legend>
                {projects.map((p) => (
                  <Toggle
                    key={p.id}
                    label={p.label}
                    checked={v.relatedProjectIds.includes(p.id)}
                    onChange={(c) => set(["relatedProjectIds"], c ? [...v.relatedProjectIds, p.id].slice(0, 6) : v.relatedProjectIds.filter((x) => x !== p.id))}
                  />
                ))}
              </fieldset>
            ) : (
              <p className="text-sm text-ink-3">No projects yet.</p>
            )}
          </FormSection>
        </div>
      </div>
    </form>
  );
}
