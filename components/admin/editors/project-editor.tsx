"use client";

import { useState } from "react";
import { MetricList } from "@/components/admin/metric-list";
import { AddButton, Field, FieldGrid, FormSection, Input, ListControls, moveItem, Notice, Select, SlugInput, StringList, TagInput, TextArea, Toggle } from "@/components/admin/fields";
import { EditorHeader, useDocumentEditor } from "@/components/admin/editor-shell";
import { GalleryField, ImageUrlField } from "@/components/admin/image-url-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SeoFields } from "@/components/admin/seo-fields";
import { slugify } from "@/lib/utils";
import { PROJECT_TYPE_LABELS, PROJECT_TYPES, type ProjectInput } from "@/lib/validation/content";


export function ProjectEditor({
  id,
  updatedAt,
  initial,
  techSuggestions,
}: {
  id: string | null;
  updatedAt: string | null;
  initial: ProjectInput;
  techSuggestions: string[];
}) {
  const { form, status, save, remove, id: currentId } = useDocumentEditor<ProjectInput>({ collection: "projects", id, updatedAt, initial });
  const { value: v, set, error } = form;
  const saving = status.kind === "saving";
  const [slugTouched, setSlugTouched] = useState(Boolean(id));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      noValidate
    >
      <EditorHeader
        title={v.title || "New project"}
        backHref="/admin/projects"
        backLabel="Projects"
        status={status}
        publication={v.status}
        dirty={form.dirty}
        saving={saving}
        onSave={() => void save()}
        onPublish={() => void save({ status: "published" }, "Published")}
        onUnpublish={() => void save({ status: "draft" }, "Moved to drafts")}
        onDelete={currentId ? remove : undefined}
        previewHref={currentId ? `/admin/preview/projects/${currentId}` : null}
        publicHref={currentId && v.status === "published" && !form.dirty ? `/projects/${v.slug}` : null}
        deleteLabel="this project"
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <FormSection title="Basics" invalid={["title", "slug", "summary"].some((k) => form.hasErrorsUnder([k]))}>
            <Field label="Title" error={error(["title"])}>
              {({ id: fid, describedBy, invalid }) => (
                <Input
                  id={fid}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  value={v.title}
                  maxLength={140}
                  onChange={(e) => {
                    set(["title"], e.target.value);
                    if (!slugTouched) set(["slug"], slugify(e.target.value));
                  }}
                />
              )}
            </Field>
            <SlugInput
              value={v.slug}
              onChange={(slug) => {
                setSlugTouched(true);
                set(["slug"], slug);
              }} source={v.title} error={error(["slug"])} basePath="/projects" />
            <Field label="Short description" error={error(["summary"])} hint="One or two sentences shown in lists and search results (max 320 characters).">
              {({ id: fid, describedBy, invalid }) => (
                <TextArea id={fid} aria-describedby={describedBy} invalid={invalid} rows={3} maxLength={320} value={v.summary} onChange={(e) => set(["summary"], e.target.value)} />
              )}
            </Field>
          </FormSection>

          <FormSection title="Context & ownership" description="Be precise about where this was built and what you personally did. Leave fields empty rather than guessing.">
            <FieldGrid>
              <Field label="Organization / client context" optional error={error(["organization"])} hint="e.g. “Built at Betafore for RexVet”">
                {({ id: fid }) => <Input id={fid} value={v.organization} onChange={(e) => set(["organization"], e.target.value)} />}
              </Field>
              <Field label="My role" optional error={error(["role"])} hint="e.g. “Frontend lead”, “Full-stack developer”">
                {({ id: fid }) => <Input id={fid} value={v.role} onChange={(e) => set(["role"], e.target.value)} />}
              </Field>
            </FieldGrid>
            <RichTextEditor label="My contribution" value={v.contribution} onChange={(h) => set(["contribution"], h)} hint="What you designed, built or owned — distinct from the team’s work." error={error(["contribution"])} />
          </FormSection>

          <FormSection title="Write-up" description="Every section is optional and hidden on the public page when empty.">
            <RichTextEditor label="Overview" value={v.overview} onChange={(h) => set(["overview"], h)} error={error(["overview"])} />
            <RichTextEditor label="The problem" value={v.problem} onChange={(h) => set(["problem"], h)} error={error(["problem"])} />
            <RichTextEditor label="Architecture" value={v.architecture} onChange={(h) => set(["architecture"], h)} error={error(["architecture"])} hint="For diagrams, create a case study and link it to this project." />
          </FormSection>

          <FormSection title="Decisions & trade-offs" invalid={form.hasErrorsUnder(["decisions"])}>
            <PairList
              items={v.decisions.map((d) => ({ a: d.title, b: d.body }))}
              onChange={(items) => set(["decisions"], items.map((i) => ({ title: i.a, body: i.b })))}
              labels={{ a: "Decision", b: "Rationale & trade-off", item: "decision" }}
              errorAt={(i, k) => error(["decisions", i, k === "a" ? "title" : "body"])}
            />
          </FormSection>

          <FormSection title="Features, challenges & outcomes" invalid={["features", "challenges", "outcomes", "impact"].some((k) => form.hasErrorsUnder([k]))}>
            <StringList label="Key features" itemLabel="feature" value={v.features} onChange={(x) => set(["features"], x)} errorAt={(i) => error(["features", i])} />
            <div className="border-t border-rule pt-5">
              <p className="mb-3 text-sm font-medium">Challenges & solutions</p>
              <PairList
                items={v.challenges.map((c) => ({ a: c.challenge, b: c.solution }))}
                onChange={(items) => set(["challenges"], items.map((i) => ({ challenge: i.a, solution: i.b })))}
                labels={{ a: "Challenge", b: "Solution", item: "challenge" }}
                errorAt={(i, k) => error(["challenges", i, k === "a" ? "challenge" : "solution"])}
              />
            </div>
            <div className="border-t border-rule pt-5">
              <MetricList
                value={v.impact}
                onChange={(x) => set(["impact"], x)}
                errorAt={(i, k) => error(["impact", i, k])}
                hint="Shown on project cards and at the top of the write-up, e.g. “2×” / “faster checkout”. Only results you can verify."
              />
            </div>
            <div className="border-t border-rule pt-5">
              <StringList
                label="Verified outcomes"
                itemLabel="outcome"
                value={v.outcomes}
                onChange={(x) => set(["outcomes"], x)}
                errorAt={(i) => error(["outcomes", i])}
                hint="Only results you can verify (shipped, adopted, measured). Do not estimate numbers."
                multiline
              />
            </div>
          </FormSection>

          <FormSection title="Images" description="Use externally hosted image URLs or files committed under /public.">
            <ImageUrlField
              label="Cover image"
              value={v.coverImage}
              onChange={(img) => set(["coverImage"], img)}
              errors={{ url: error(["coverImage", "url"]), alt: error(["coverImage", "alt"]), self: error(["coverImage"]) }}
            />
            <div className="border-t border-rule pt-5">
              <p className="mb-3 text-sm font-medium">Gallery</p>
              <GalleryField value={v.gallery} onChange={(g) => set(["gallery"], g)} errorAt={(i, f) => error(["gallery", i, f])} />
            </div>
          </FormSection>

          <SeoFields value={v.seo} onChange={(seo) => set(["seo"], seo)} error={(k) => error(["seo", k])} fallbackTitle={v.title} fallbackDescription={v.summary} />
        </div>

        <div className="space-y-6">
          <FormSection title="Publishing">
            <Toggle label="Featured" description="Featured projects are preferred on the homepage." checked={v.featured} onChange={(c) => set(["featured"], c)} />
            <Field label="Sort order" hint="Lower numbers appear first. You can also reorder from the list." error={error(["sortOrder"])}>
              {({ id: fid }) => <Input id={fid} type="number" value={v.sortOrder} onChange={(e) => set(["sortOrder"], Number(e.target.value))} />}
            </Field>
            {v.status === "draft" ? <Notice>Drafts are never visible on the public site, sitemap or search results.</Notice> : null}
          </FormSection>
          <FormSection title="Classification">
            <Field label="Type" error={error(["type"])}>
              {({ id: fid }) => (
                <Select id={fid} value={v.type} onChange={(e) => set(["type"], e.target.value)}>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {PROJECT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Domain / category" optional error={error(["category"])} hint="e.g. Healthcare, E-commerce, Logistics">
              {({ id: fid }) => <Input id={fid} value={v.category} onChange={(e) => set(["category"], e.target.value)} />}
            </Field>
            <Field label="Year" optional error={error(["year"])} hint="e.g. 2024 or 2023–2024">
              {({ id: fid, invalid }) => <Input id={fid} invalid={invalid} value={v.year} onChange={(e) => set(["year"], e.target.value)} />}
            </Field>
            <TagInput label="Technologies" value={v.technologies} onChange={(t) => set(["technologies"], t)} error={error(["technologies"])} suggestions={techSuggestions} />
          </FormSection>
          <FormSection title="Links">
            <Field label="Live URL" optional error={error(["liveUrl"])}>
              {({ id: fid, invalid }) => <Input id={fid} type="url" invalid={invalid} value={v.liveUrl} onChange={(e) => set(["liveUrl"], e.target.value)} placeholder="https://" />}
            </Field>
            <Field label="Source repository" optional error={error(["repoUrl"])} hint="Only public repositories.">
              {({ id: fid, invalid }) => <Input id={fid} type="url" invalid={invalid} value={v.repoUrl} onChange={(e) => set(["repoUrl"], e.target.value)} placeholder="https://github.com/…" />}
            </Field>
          </FormSection>
        </div>
      </div>
    </form>
  );
}

/** Ordered list of two-field entries (decision/rationale, challenge/solution). */
export function PairList({
  items,
  onChange,
  labels,
  errorAt,
}: {
  items: { a: string; b: string }[];
  onChange: (items: { a: string; b: string }[]) => void;
  labels: { a: string; b: string; item: string };
  errorAt: (index: number, key: "a" | "b") => string | undefined;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 border-l-2 border-rule pl-4">
          <div className="flex-1 space-y-3">
            <Field label={`${labels.a} ${i + 1}`} error={errorAt(i, "a")}>
              {({ id, invalid }) => <Input id={id} invalid={invalid} value={item.a} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />}
            </Field>
            <Field label={labels.b} error={errorAt(i, "b")}>
              {({ id, invalid }) => <TextArea id={id} invalid={invalid} rows={3} value={item.b} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, b: e.target.value } : x)))} />}
            </Field>
          </div>
          <ListControls index={i} count={items.length} label={`${labels.item} ${i + 1}`} onMove={(f, t) => onChange(moveItem(items, f, t))} onRemove={(idx) => onChange(items.filter((_, j) => j !== idx))} />
        </div>
      ))}
      <AddButton onClick={() => onChange([...items, { a: "", b: "" }])} disabled={items.length >= 20}>
        Add {labels.item}
      </AddButton>
    </div>
  );
}
