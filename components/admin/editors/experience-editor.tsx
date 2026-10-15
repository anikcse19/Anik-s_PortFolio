"use client";

import { EditorHeader, useDocumentEditor } from "@/components/admin/editor-shell";
import { Field, FieldGrid, FormSection, Input, Notice, Select, StringList, TagInput, TextArea, Toggle } from "@/components/admin/fields";
import { employmentPeriod } from "@/lib/dates";
import { EMPLOYMENT_TYPE_LABELS, EMPLOYMENT_TYPES, WORK_MODES, type ExperienceInput } from "@/lib/validation/content";


export function ExperienceEditor({ id, updatedAt, initial }: { id: string | null; updatedAt: string | null; initial: ExperienceInput }) {
  const { form, status, save, remove, id: currentId } = useDocumentEditor<ExperienceInput>({ collection: "experience", id, updatedAt, initial });
  const { value: v, set, error } = form;
  const saving = status.kind === "saving";
  const period = employmentPeriod(v);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      noValidate
    >
      <EditorHeader
        title={v.title && v.organization ? `${v.title} · ${v.organization}` : "New experience entry"}
        backHref="/admin/experience"
        backLabel="Experience"
        status={status}
        publication={v.status}
        dirty={form.dirty}
        saving={saving}
        onSave={() => void save()}
        onPublish={() => void save({ status: "published" }, "Published")}
        onUnpublish={() => void save({ status: "draft" }, "Moved to drafts")}
        onDelete={currentId ? remove : undefined}
        deleteLabel="this entry"
      />
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <FormSection title="Position">
            <FieldGrid>
              <Field label="Job title" error={error(["title"])}>
                {({ id: fid, invalid }) => <Input id={fid} invalid={invalid} value={v.title} onChange={(e) => set(["title"], e.target.value)} />}
              </Field>
              <Field label="Organization" error={error(["organization"])}>
                {({ id: fid, invalid }) => <Input id={fid} invalid={invalid} value={v.organization} onChange={(e) => set(["organization"], e.target.value)} />}
              </Field>
              <Field label="Organization website" optional error={error(["organizationUrl"])}>
                {({ id: fid, invalid }) => <Input id={fid} type="url" invalid={invalid} value={v.organizationUrl} onChange={(e) => set(["organizationUrl"], e.target.value)} placeholder="https://" />}
              </Field>
              <Field label="Employment type" optional>
                {({ id: fid }) => (
                  <Select id={fid} value={v.employmentType ?? ""} onChange={(e) => set(["employmentType"], e.target.value || null)}>
                    <option value="">Not specified</option>
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {EMPLOYMENT_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Location" optional hint="e.g. Dhaka, Bangladesh">
                {({ id: fid }) => <Input id={fid} value={v.location} onChange={(e) => set(["location"], e.target.value)} />}
              </Field>
              <Field label="Work mode" optional>
                {({ id: fid }) => (
                  <Select id={fid} value={v.workMode ?? ""} onChange={(e) => set(["workMode"], e.target.value || null)}>
                    <option value="">Not specified</option>
                    {WORK_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </FieldGrid>
          </FormSection>

          <FormSection title="Dates" description="Month precision. Leave a date empty if you have not confirmed it — nothing is shown instead of a guess.">
            <Toggle
              label="This is my current role"
              checked={v.isCurrent}
              onChange={(c) => {
                set(["isCurrent"], c);
                if (c) set(["endDate"], "");
              }}
            />
            <FieldGrid>
              <Field label="Start" optional error={error(["startDate"])}>
                {({ id: fid, invalid }) => <Input id={fid} type="month" invalid={invalid} value={v.startDate} onChange={(e) => set(["startDate"], e.target.value)} />}
              </Field>
              <Field label="End" optional error={error(["endDate"])}>
                {({ id: fid, invalid }) => <Input id={fid} type="month" invalid={invalid} disabled={v.isCurrent} value={v.endDate} onChange={(e) => set(["endDate"], e.target.value)} />}
              </Field>
            </FieldGrid>
            <p className="text-sm text-ink-3">
              Public label: <span className="font-mono text-ink">{period.range || "— (no dates shown)"}</span>
              {period.duration ? <span className="font-mono"> · {period.duration}</span> : null}
            </p>
          </FormSection>

          <FormSection title="Description">
            <Field label="Summary" optional error={error(["summary"])} hint="Two or three sentences about scope and responsibilities.">
              {({ id: fid, invalid }) => <TextArea id={fid} invalid={invalid} rows={4} value={v.summary} onChange={(e) => set(["summary"], e.target.value)} />}
            </Field>
            <StringList
              label="Achievements"
              itemLabel="achievement"
              value={v.achievements}
              onChange={(x) => set(["achievements"], x)}
              errorAt={(i) => error(["achievements", i])}
              hint="Concrete, verifiable statements. Avoid percentages you cannot back up."
              multiline
              max={15}
            />
            <TagInput label="Technologies" value={v.technologies} onChange={(t) => set(["technologies"], t)} max={25} error={error(["technologies"])} />
          </FormSection>
        </div>
        <div className="space-y-6">
          <FormSection title="Ordering">
            <Notice>Entries are shown chronologically: current roles first, then by start date. Sort order only breaks ties.</Notice>
            <Field label="Sort order (tie-breaker)">
              {({ id: fid }) => <Input id={fid} type="number" value={v.sortOrder} onChange={(e) => set(["sortOrder"], Number(e.target.value))} />}
            </Field>
          </FormSection>
        </div>
      </div>
    </form>
  );
}
