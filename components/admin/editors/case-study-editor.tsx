"use client";

import { useState } from "react";
import { BlockEditor } from "@/components/admin/block-editor";
import { EditorHeader, useDocumentEditor } from "@/components/admin/editor-shell";
import { AddButton, Field, FieldGrid, FormSection, Input, ListControls, moveItem, Notice, Select, SlugInput, TagInput, TextArea, Toggle } from "@/components/admin/fields";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { SeoFields } from "@/components/admin/seo-fields";
import { slugify } from "@/lib/utils";
import { cryptoId } from "@/lib/validation/blocks";
import {
  CASE_STUDY_KIND_LABELS,
  CASE_STUDY_KINDS,
  CASE_STUDY_TOPIC_LABELS,
  CASE_STUDY_TOPICS,
  type CaseStudyInput,
  type CaseStudySection,
} from "@/lib/validation/content";


/** Suggested outline: a section per topic the brief asks case studies to be able to cover. */
function outlineSections(): CaseStudySection[] {
  const topics: (keyof typeof CASE_STUDY_TOPIC_LABELS)[] = ["requirements", "architecture", "data_flow", "data_model", "reliability", "security", "scalability", "tradeoffs", "my_role", "next_steps"];
  return topics.map((topic) => ({ id: cryptoId(), heading: CASE_STUDY_TOPIC_LABELS[topic], topic, blocks: [] }));
}

export function CaseStudyEditor({
  id,
  updatedAt,
  initial,
  projects,
}: {
  id: string | null;
  updatedAt: string | null;
  initial: CaseStudyInput;
  projects: { id: string; label: string }[];
}) {
  const { form, status, save, remove, id: currentId } = useDocumentEditor<CaseStudyInput>({ collection: "caseStudies", id, updatedAt, initial });
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
        title={v.title || "New case study"}
        backHref="/admin/case-studies"
        backLabel="Case studies"
        status={status}
        publication={v.status}
        dirty={form.dirty}
        saving={saving}
        onSave={() => void save()}
        onPublish={() => void save({ status: "published" }, "Published")}
        onUnpublish={() => void save({ status: "draft" }, "Moved to drafts")}
        onDelete={currentId ? remove : undefined}
        previewHref={currentId ? `/admin/preview/case-studies/${currentId}` : null}
        publicHref={currentId && v.status === "published" && !form.dirty ? `/case-studies/${v.slug}` : null}
        deleteLabel="this case study"
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <FormSection title="Basics" invalid={["title", "slug", "summary"].some((k) => form.hasErrorsUnder([k]))}>
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
              basePath="/case-studies"
            />
            <Field label="Summary" error={error(["summary"])}>
              {({ id: fid, invalid }) => <TextArea id={fid} invalid={invalid} rows={3} value={v.summary} onChange={(e) => set(["summary"], e.target.value)} />}
            </Field>
            <FieldGrid>
              <Field label="Context" optional hint="e.g. “Betafore · RexVet” or “Personal project”">
                {({ id: fid }) => <Input id={fid} value={v.context} onChange={(e) => set(["context"], e.target.value)} />}
              </Field>
              <Field label="My role" optional>
                {({ id: fid }) => <Input id={fid} value={v.role} onChange={(e) => set(["role"], e.target.value)} />}
              </Field>
            </FieldGrid>
          </FormSection>

          <FormSection
            title="Sections"
            description="Each section becomes an entry in the page’s table of contents. Empty sections are hidden."
            invalid={form.hasErrorsUnder(["sections"])}
            aside={
              v.sections.length === 0 ? (
                <button type="button" className="text-sm underline" onClick={() => set(["sections"], outlineSections())}>
                  Start from suggested outline
                </button>
              ) : null
            }
          >
            {v.sections.map((section, i) => (
              <div key={section.id} className="border border-rule-strong">
                <div className="flex flex-wrap items-end gap-3 border-b border-rule bg-surface p-3">
                  <Field label={`Section ${i + 1} heading`} error={error(["sections", i, "heading"])} className="min-w-[14rem] flex-1">
                    {({ id: fid, invalid }) => <Input id={fid} invalid={invalid} value={section.heading} onChange={(e) => set(["sections", i, "heading"], e.target.value)} />}
                  </Field>
                  <Field label="Topic" optional className="w-56">
                    {({ id: fid }) => (
                      <Select id={fid} value={section.topic ?? ""} onChange={(e) => set(["sections", i, "topic"], e.target.value || null)}>
                        <option value="">None</option>
                        {CASE_STUDY_TOPICS.map((t) => (
                          <option key={t} value={t}>
                            {CASE_STUDY_TOPIC_LABELS[t]}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                  <ListControls
                    index={i}
                    count={v.sections.length}
                    label={`section ${i + 1}`}
                    onMove={(f, t) => set(["sections"], moveItem(v.sections, f, t))}
                    onRemove={(idx) => set(["sections"], v.sections.filter((_, j) => j !== idx))}
                  />
                </div>
                <div className="p-3">
                  <BlockEditor label={section.heading || `Section ${i + 1}`} value={section.blocks} onChange={(blocks) => set(["sections", i, "blocks"], blocks)} errorAt={(bi, field) => error(["sections", i, "blocks", bi, ...field.split(".")])} />
                </div>
              </div>
            ))}
            <AddButton onClick={() => set(["sections"], [...v.sections, { id: cryptoId(), heading: "", topic: null, blocks: [] }])} disabled={v.sections.length >= 30}>
              Add section
            </AddButton>
          </FormSection>

          <FormSection title="Cover image">
            <ImageUrlField label="Cover image" value={v.coverImage} aspect="16 / 9" aspectLabel="16:9" onChange={(img) => set(["coverImage"], img)} errors={{ url: error(["coverImage", "url"]), alt: error(["coverImage", "alt"]) }} />
          </FormSection>

          <SeoFields value={v.seo} onChange={(seo) => set(["seo"], seo)} error={(k) => error(["seo", k])} fallbackTitle={v.title} fallbackDescription={v.summary} />
        </div>

        <div className="space-y-6">
          <FormSection title="Honesty label" description="Shown prominently on the page.">
            <Field label="Kind" error={error(["kind"])}>
              {({ id: fid }) => (
                <Select id={fid} value={v.kind} onChange={(e) => set(["kind"], e.target.value)}>
                  {CASE_STUDY_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {CASE_STUDY_KIND_LABELS[k]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            {v.kind !== "production" ? <Notice>Readers will see a note that this is not a production deployment.</Notice> : null}
          </FormSection>
          <FormSection title="Publishing">
            <Toggle label="Featured" checked={v.featured} onChange={(c) => set(["featured"], c)} />
            <Field label="Sort order" hint="Lower numbers appear first.">
              {({ id: fid }) => <Input id={fid} type="number" value={v.sortOrder} onChange={(e) => set(["sortOrder"], Number(e.target.value))} />}
            </Field>
          </FormSection>
          <FormSection title="Relations">
            <Field label="Related project" optional error={error(["relatedProjectId"])}>
              {({ id: fid }) => (
                <Select id={fid} value={v.relatedProjectId ?? ""} onChange={(e) => set(["relatedProjectId"], e.target.value || null)}>
                  <option value="">None</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <TagInput label="Technologies" value={v.technologies} onChange={(t) => set(["technologies"], t)} error={error(["technologies"])} />
          </FormSection>
        </div>
      </div>
    </form>
  );
}
