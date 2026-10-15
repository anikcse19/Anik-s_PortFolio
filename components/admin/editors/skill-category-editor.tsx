"use client";

import { useState } from "react";
import { EditorHeader, useDocumentEditor } from "@/components/admin/editor-shell";
import { AddButton, Field, FormSection, Input, ListControls, moveItem, Notice, Select, SlugInput, TextArea } from "@/components/admin/fields";
import { slugify } from "@/lib/utils";
import { SKILL_LEVEL_LABELS, SKILL_LEVELS, type SkillCategoryInput } from "@/lib/validation/content";


export function SkillCategoryEditor({ id, updatedAt, initial }: { id: string | null; updatedAt: string | null; initial: SkillCategoryInput }) {
  const { form, status, save, remove, id: currentId } = useDocumentEditor<SkillCategoryInput>({ collection: "skills", id, updatedAt, initial });
  const { value: v, set, error } = form;
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
        title={v.name || "New skill category"}
        backHref="/admin/skills"
        backLabel="Skills"
        status={status}
        publication={v.status}
        dirty={form.dirty}
        saving={status.kind === "saving"}
        onSave={() => void save()}
        onPublish={() => void save({ status: "published" }, "Published")}
        onUnpublish={() => void save({ status: "draft" }, "Hidden from the site")}
        onDelete={currentId ? remove : undefined}
        deleteLabel="this category and its skills"
      />
      <div className="mt-6 max-w-4xl space-y-6">
        <FormSection title="Category">
          <Field label="Name" error={error(["name"])}>
            {({ id: fid, invalid }) => (
              <Input
                id={fid}
                invalid={invalid}
                value={v.name}
                onChange={(e) => {
                  set(["name"], e.target.value);
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
            source={v.name}
            error={error(["slug"])}
            basePath="(internal id)"
          />
          <Field label="Description" optional error={error(["description"])}>
            {({ id: fid }) => <TextArea id={fid} rows={2} value={v.description} onChange={(e) => set(["description"], e.target.value)} />}
          </Field>
        </FormSection>

        <FormSection title="Skills" invalid={form.hasErrorsUnder(["skills"])} description="Classification is optional. Leave it as “Not classified” unless you are sure — no label is shown publicly in that case.">
          <Notice>
            {SKILL_LEVELS.map((l) => SKILL_LEVEL_LABELS[l]).join(" · ")}. No percentages or progress bars are ever displayed.
          </Notice>
          <ol className="space-y-3">
            {v.skills.map((skill, i) => (
              <li key={i} className="grid gap-2 border-b border-rule pb-3 md:grid-cols-[minmax(0,1fr)_13rem_minmax(0,1fr)_auto] md:items-start">
                <div>
                  <Input aria-label={`Skill ${i + 1} name`} placeholder="Skill" invalid={Boolean(error(["skills", i, "name"]))} value={skill.name} onChange={(e) => set(["skills", i, "name"], e.target.value)} />
                  {error(["skills", i, "name"]) ? <p className="mt-1 text-sm text-danger">{error(["skills", i, "name"])}</p> : null}
                </div>
                <Select aria-label={`Skill ${i + 1} classification`} value={skill.level ?? ""} onChange={(e) => set(["skills", i, "level"], e.target.value || null)}>
                  <option value="">Not classified</option>
                  {SKILL_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {SKILL_LEVEL_LABELS[l]}
                    </option>
                  ))}
                </Select>
                <Input aria-label={`Skill ${i + 1} note`} placeholder="Note (optional, shown on hover)" value={skill.note} onChange={(e) => set(["skills", i, "note"], e.target.value)} />
                <ListControls index={i} count={v.skills.length} label={`skill ${skill.name || i + 1}`} onMove={(f, t) => set(["skills"], moveItem(v.skills, f, t))} onRemove={(idx) => set(["skills"], v.skills.filter((_, j) => j !== idx))} />
              </li>
            ))}
          </ol>
          <AddButton onClick={() => set(["skills"], [...v.skills, { name: "", level: null, note: "" }])} disabled={v.skills.length >= 60}>
            Add skill
          </AddButton>
        </FormSection>
      </div>
    </form>
  );
}
