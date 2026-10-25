"use client";

import { Field, FieldGrid, FormSection, Input, TextArea } from "@/components/admin/fields";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { MetricList } from "@/components/admin/metric-list";
import { SettingsForm } from "@/components/admin/settings-form";
import type { ProfileSettings } from "@/lib/validation/settings";

export function ProfileForm({ initial }: { initial: ProfileSettings }) {
  return (
    <SettingsForm settingsKey="profile" initial={initial} title="Profile & hero" description="Your name, title and positioning — used in the hero, header, footer and structured data.">
      {({ value: v, set, error }) => (
        <>
          <FormSection title="Identity">
            <FieldGrid>
              <Field label="Name" error={error(["name"])}>
                {({ id, invalid }) => <Input id={id} invalid={invalid} value={v.name} onChange={(e) => set(["name"], e.target.value)} />}
              </Field>
              <Field label="Professional title" error={error(["title"])}>
                {({ id, invalid }) => <Input id={id} invalid={invalid} value={v.title} onChange={(e) => set(["title"], e.target.value)} />}
              </Field>
            </FieldGrid>
            <Field label="Positioning statement" optional error={error(["positioning"])} hint="Shown in the hero unless the homepage overrides it. Keep it factual.">
              {({ id, invalid }) => <TextArea id={id} invalid={invalid} rows={3} maxLength={400} value={v.positioning} onChange={(e) => set(["positioning"], e.target.value)} />}
            </Field>
            <FieldGrid>
              <Field label="Location" optional error={error(["location"])}>
                {({ id }) => <Input id={id} value={v.location} onChange={(e) => set(["location"], e.target.value)} />}
              </Field>
              <Field label="Availability" optional error={error(["availability"])} hint="e.g. “Open to senior full-stack roles”. Leave empty to hide.">
                {({ id }) => <Input id={id} value={v.availability} onChange={(e) => set(["availability"], e.target.value)} />}
              </Field>
            </FieldGrid>
          </FormSection>
          <FormSection title="Impact highlights" description="Up to four headline numbers shown in the homepage hero. Leave empty to show facts computed from your experience and projects.">
            <MetricList value={v.highlights} onChange={(next) => set(["highlights"], next)} errorAt={(i, k) => error(["highlights", i, k])} />
          </FormSection>
          <FormSection title="Résumé" description="A public link to your résumé (e.g. a PDF on Google Drive set to “Anyone with the link”). Leave empty to hide all résumé links.">
            <Field label="Résumé URL" optional error={error(["resumeUrl"])}>
              {({ id, invalid }) => <Input id={id} type="url" invalid={invalid} value={v.resumeUrl} onChange={(e) => set(["resumeUrl"], e.target.value)} placeholder="https://" />}
            </Field>
          </FormSection>
          <FormSection title="Portrait" description="Used on the About page and as the fallback social image.">
            <ImageUrlField label="Portrait" value={v.portrait} aspect="4 / 5" aspectLabel="4:5" onChange={(img) => set(["portrait"], img)} errors={{ url: error(["portrait", "url"]), alt: error(["portrait", "alt"]) }} />
          </FormSection>
        </>
      )}
    </SettingsForm>
  );
}
